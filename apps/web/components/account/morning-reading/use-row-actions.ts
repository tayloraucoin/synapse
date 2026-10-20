"use client";

/**
 * Settings › Morning reading's row actions (USE-152; writing-and-order.md,
 * D-USE-123 to D-USE-125, D-USE-128), on `useMorningReading()`'s writes.
 *
 * `rowActions` is the logic and has no React in it, so the tests drive it
 * against the fixture server: the order is written optimistically and put
 * back when its save fails; Turn off hands its row to the toast, whose Undo
 * calls `turnOn` with `restore` so the row goes back where it was; Turn on
 * from Off sends no `restore` and the row lands at the end. `useRowActions`
 * gives it the query cache, `SaveStatus`, the toast and the live region.
 */
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { SaveStatus } from "@syn/types";
import { toastUndo } from "@syn/ui";
import type {
  LinkRecord,
  PassageRecord,
  ReadingKind,
  ReadingListRecord,
  ReadingRowInput,
  ReorderReadingInput,
  TurnOnInput,
} from "@syn/validators";
import { useDataSource } from "@/lib/data/source";
import {
  morningReadingQueryKey,
  useMorningReading,
} from "@/lib/data/use-morning-reading";
import { MORNING_READING_COPY as COPY } from "./copy";
import { nameOf } from "./reading-rows";

export type ReadingRow = PassageRecord | LinkRecord;

/** "Saved" stays this long, then fades [ASSUMPTION: as a header's SaveStatus]. */
const SAVED_FOR_MS = 2000;

/** The ids with `id` moved one place, or null at an end. */
export function moveId(
  ids: readonly string[],
  id: string,
  direction: -1 | 1,
): string[] | null {
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= ids.length) return null;
  const next = [...ids];
  next.splice(from, 1);
  next.splice(to, 0, id);
  return next;
}

/** The toast's and the dialog's name: the title, or null for an untitled passage. */
export function titleOf(row: ReadingRow): string | null {
  return row.title ?? null;
}

export interface RowActionsDeps {
  kind: ReadingKind;
  /** The section's active ids as shown now. */
  ids: () => string[];
  /** What a row is called in the announcement after a move. */
  nameOf: (id: string) => string;
  /** The optimistic order; called again with the old order on a failure. */
  setOrder: (ids: string[]) => void;
  reorder: (input: ReorderReadingInput) => Promise<void>;
  turnOff: (input: ReadingRowInput) => Promise<void>;
  turnOn: (input: TurnOnInput) => Promise<void>;
  remove: (input: ReadingRowInput) => Promise<void>;
  setStatus: (status: SaveStatus) => void;
  announce: (text: string) => void;
  /** The toast after Turn off; `undo` puts the row back where it was. */
  notifyOff: (row: ReadingRow, undo: () => void) => void;
}

export function rowActions(deps: RowActionsDeps) {
  const { kind } = deps;

  async function saveOrder(next: string[], previous: string[]) {
    deps.setOrder(next);
    deps.setStatus("saving");
    try {
      await deps.reorder({ kind, ids: next });
      deps.setStatus("saved");
      return true;
    } catch {
      deps.setOrder(previous);
      deps.setStatus("failed");
      return false;
    }
  }

  async function write(run: () => Promise<void>) {
    try {
      await run();
      return true;
    } catch {
      deps.setStatus("failed");
      return false;
    }
  }

  return {
    /** A drop or Alt+arrow: the section's whole order. */
    reorder(ids: string[]) {
      const previous = deps.ids();
      if (ids.join() === previous.join()) return Promise.resolve(true);
      return saveOrder(ids, previous);
    },

    /** ··· › Move up or Move down: one place, then the place in words. */
    async move(id: string, direction: -1 | 1) {
      const previous = deps.ids();
      const next = moveId(previous, id, direction);
      if (!next) return false;
      const saved = await saveOrder(next, previous);
      if (saved) {
        const at = next.indexOf(id);
        const verb = direction === -1 ? COPY.movedUp : COPY.movedDown;
        deps.announce(
          at === 0
            ? COPY.movedFirst(verb)
            : COPY.movedAfter(verb, deps.nameOf(next[at - 1]!)),
        );
      }
      return saved;
    },

    async turnOff(row: ReadingRow) {
      const done = await write(() => deps.turnOff({ kind, id: row.id }));
      if (done) {
        deps.notifyOff(row, () => {
          void write(() => deps.turnOn({ kind, id: row.id, restore: true }));
        });
      }
      return done;
    },

    /** From Off: no `restore`, so it lands at the end (D-USE-123). */
    turnOn(row: ReadingRow) {
      return write(() => deps.turnOn({ kind, id: row.id }));
    },

    remove(row: ReadingRow) {
      return write(() => deps.remove({ kind, id: row.id }));
    },
  };
}

const ACTIVE = { passage: "passages", link: "links" } as const;
const OFF = { passage: "passagesOff", link: "linksOff" } as const;

/** The seeded start, from the scenario's `view.open` (`menu:<id>`, …). */
function seeded(open: string | undefined, what: string): string | null {
  const [head, id] = open?.split(":") ?? [];
  return head === what && id ? id : null;
}

export function useRowActions(kind: ReadingKind) {
  const source = useDataSource();
  const reading = useMorningReading();
  const queryClient = useQueryClient();
  const scenario = source.scenario.name;
  const key = React.useMemo(() => morningReadingQueryKey(scenario), [scenario]);
  const open = source.scenario.view?.open;
  const list = reading.list;
  const rows = React.useMemo(
    () => (list?.[ACTIVE[kind]] ?? []) as ReadingRow[],
    [list, kind],
  );
  const off = React.useMemo(
    () => (list?.[OFF[kind]] ?? []) as ReadingRow[],
    [list, kind],
  );

  // A seeded "Saved" holds for its capture; a live one fades.
  const held = open === `saved-drop:${kind}`;
  const [status, setStatus] = React.useState<SaveStatus>(
    held ? "saved" : "idle",
  );
  const [announcement, setAnnouncement] = React.useState("");
  const [deletingId, setDeletingId] = React.useState(() =>
    seeded(open, "delete-confirm"),
  );

  React.useEffect(() => {
    if (status !== "saved" || held) return;
    const timer = window.setTimeout(() => setStatus("idle"), SAVED_FOR_MS);
    return () => window.clearTimeout(timer);
  }, [status, held]);

  // The memo below reads the latest rows and writes through refs.
  const latest = React.useRef(rows);
  latest.current = rows;
  const writes = React.useRef(reading);
  writes.current = reading;

  const actions = React.useMemo(
    () =>
      rowActions({
        kind,
        ids: () => latest.current.map((row) => row.id),
        nameOf: (id) => {
          const row = latest.current.find((r) => r.id === id);
          return row ? nameOf(row) : "";
        },
        setOrder: (ids) => {
          void queryClient.cancelQueries({ queryKey: key });
          queryClient.setQueryData<ReadingListRecord>(key, (old) => {
            if (!old) return old;
            const all = old[ACTIVE[kind]] as ReadingRow[];
            const byId = new Map(all.map((row) => [row.id, row]));
            const next = ids.flatMap((id) => byId.get(id) ?? []);
            return { ...old, [ACTIVE[kind]]: next };
          });
        },
        reorder: (input) => writes.current.reorder(input),
        turnOff: (input) => writes.current.turnOff(input),
        turnOn: (input) => writes.current.turnOn(input),
        remove: (input) => writes.current.remove(input),
        setStatus,
        announce: (text) => {
          // Re-set so the same sentence twice is read twice.
          setAnnouncement("");
          window.setTimeout(() => setAnnouncement(text), 0);
        },
        notifyOff: (row, undo) => {
          toastUndo({ text: COPY.offToast(titleOf(row)), onUndo: undo });
        },
      }),
    [kind, queryClient, key],
  );

  /** After a move, focus stays on the row's ··· (Access). */
  async function move(id: string, direction: -1 | 1) {
    await actions.move(id, direction);
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-reading-more="${id}"]`)
        ?.focus();
    });
  }

  // off-undo: the row is off already; the toast it left shows once.
  const toasted = React.useRef(false);
  const undoId = seeded(open, "off-undo");
  React.useEffect(() => {
    if (toasted.current || !undoId) return;
    const row = off.find((r) => r.id === undoId);
    if (!row) return;
    toasted.current = true;
    toastUndo({
      text: COPY.offToast(titleOf(row)),
      onUndo: () =>
        void writes.current
          .turnOn({ kind, id: row.id, restore: true })
          .catch(() => setStatus("failed")),
    });
  }, [off, undoId, kind]);

  const deleting = off.find((row) => row.id === deletingId) ?? null;
  const opener = React.useRef<HTMLElement | null>(null);

  return {
    status,
    announcement,
    /** The row whose menu opens on load (`menu:<id>`). */
    menuId: seeded(open, "menu"),
    /** Off opens on load when its delete dialog does. */
    offOpen: deleting !== null,
    reorder: (ids: string[]) => void actions.reorder(ids),
    move: (id: string, direction: -1 | 1) => void move(id, direction),
    turnOff: (row: ReadingRow) => void actions.turnOff(row),
    turnOn: (row: ReadingRow) => void actions.turnOn(row),
    deleting,
    askDelete: (row: ReadingRow) => {
      opener.current = document.activeElement as HTMLElement | null;
      setDeletingId(row.id);
    },
    /** Keep it, or Escape: focus goes back to the Delete that opened it. */
    keep: () => {
      setDeletingId(null);
      window.requestAnimationFrame(() => opener.current?.focus());
    },
    confirmDelete: () => {
      if (deleting) void actions.remove(deleting);
      setDeletingId(null);
    },
  };
}
