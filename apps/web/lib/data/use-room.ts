"use client";

import * as React from "react";
import {
  cutAndSlide,
  findRoom,
  planRoom,
  slideDay,
  type RoomTake,
} from "@syn/utils";
import { ROOM_COPY as COPY } from "@/components/planner/room/copy";
import { readDismissal, writeDismissal } from "@/lib/hooks/use-dismissed";
import { useUndoToast } from "@/lib/hooks/use-undo-toast";
import { deriveToday, type Today } from "./derive-today";
import { lateWakeOf } from "./late-wake";
import { LATER_START } from "./later-start-flag";
import {
  cutView,
  LATER_START_SHOWN,
  makeRoomView,
  openingPicks,
  opensLaterStart,
  slideView,
  toggleBlockCut,
  togglePick,
  type LaterStartAsk,
  type LaterStartTab,
  type RoomAddition,
  type RoomSource,
} from "./room";
import {
  roomCandidatesOf,
  roomDayWithRowsOf,
  type AppRoomDay,
} from "./room-day";
import { DEFAULT_SCENARIO } from "./scenario-names";
import { useDataSource } from "./source";
import type { TodayRecords } from "./today-records";
import {
  useDayEdits,
  writeDayAdd,
  writeDayChanges,
  type DayEdit,
  type DayEditsServer,
} from "./use-day-edits";
import { deriveItemSheet } from "./use-item-sheet";
import { ORIENT_LENGTH_MIN } from "./use-review-day";
import { useToday } from "./use-today";

/**
 * Finding minutes (USE-41; make-room/, later-start/): one engine (USE-35),
 * two sheets. `useRoom(dateKey)` gives `place(addition)`, the Make room
 * sheet's `plan` and `apply`, and `openLaterStart`.
 *
 * PLACE. An addition with room lands at once; with none, the engine's Phase 1
 * default (gaps first, then the block's most flexible item) lands it with
 * no sheet and an Undo Toaster naming what gave way (D-USE-16); only when the
 * engine asks does Make room open, with the block's candidates and the
 * other blocks'. Every write is today only, through `useDayEdits`, and one
 * Undo puts every minute back and takes the addition off.
 *
 * A LATER START opens by itself over Review the day once a day, from 15
 * minutes past Up at (`offerLaterStart`), through `useDismissed`'s day flag
 * keyed by the date; the passed row opens it again, past the flag. Not now
 * and × write nothing. Cut these and Slide the day back apply the engine's
 * plan for today with Undo.
 */

/* --------------------------------------------------------------- writes -- */

/** What a room write did, for its Toaster. */
export type RoomGave =
  | { kind: "item"; title: string; minutes: number }
  | { kind: "gap"; where: "inside" | "after"; block: string; minutes: number };

export type RoomOutcome =
  | { kind: "placed"; title: string; block: string; gave: RoomGave[] }
  /** No default could be guessed: nothing written, Make room opens. */
  | { kind: "asked"; addition: RoomAddition }
  | { kind: "cut"; names: string[]; stillShort: number }
  | { kind: "slid"; minutes: number };

export interface RoomEdit extends DayEdit {
  room: RoomOutcome;
}

/** The takes in words: an item's title, a gap by its neighbour. */
function gaveOf(day: AppRoomDay, takes: readonly RoomTake[]): RoomGave[] {
  const blocks = [...day.blocks].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  );
  return takes.map((take): RoomGave => {
    if (take.kind === "item") {
      const slot = blocks
        .flatMap((occurrence) => occurrence.slots)
        .find((one) => one.id === take.slotId);
      return { kind: "item", title: slot?.title ?? "", minutes: take.minutes };
    }
    const at = blocks.findIndex(
      (occurrence) => occurrence.block.id === take.blockId,
    );
    const block =
      take.where === "after"
        ? (blocks[at + 1]?.block.name ?? "")
        : (blocks[at]?.block.name ?? "");
    return { kind: "gap", where: take.where, block, minutes: take.minutes };
  });
}

async function writePlaced(
  server: DayEditsServer,
  records: TodayRecords,
  day: AppRoomDay,
  addition: RoomAddition,
  changes: Parameters<typeof writeDayChanges>[2],
  takes: readonly RoomTake[],
): Promise<RoomEdit> {
  const taken = await writeDayChanges(server, records, changes);
  const added = await writeDayAdd(server, records, addition.blockId, {
    kind: "item",
    title: addition.title,
    lengthMin: addition.lengthMin,
  });
  const block =
    day.blocks.find((occurrence) => occurrence.block.id === addition.blockId)
      ?.block.name ?? "";
  return {
    undo: [...taken, ...added.undo],
    room: {
      kind: "placed",
      title: addition.title,
      block,
      gave: gaveOf(day, takes),
    },
  };
}

/**
 * Place (C-USE-make-room-1, -2): room, the default, or the sheet. Nothing is
 * written when the engine asks.
 */
export async function writePlace(
  server: DayEditsServer,
  records: TodayRecords,
  addition: RoomAddition,
): Promise<RoomEdit> {
  const day = roomDayWithRowsOf(deriveToday(records));
  const found = findRoom(day, {
    blockId: addition.blockId,
    minutes: addition.lengthMin,
  });
  if (found.kind === "refused") throw new Error("Nothing can be added there.");
  if (found.kind === "ask") {
    return { undo: [], room: { kind: "asked", addition } };
  }
  return found.kind === "fits"
    ? writePlaced(server, records, day, addition, [], [])
    : writePlaced(
        server,
        records,
        day,
        addition,
        found.plan.changes,
        found.takes,
      );
}

/** Make room (C-USE-make-room-sheet-2): the sheet's takes, then the addition. */
export async function writeMakeRoom(
  server: DayEditsServer,
  records: TodayRecords,
  addition: RoomAddition,
  takes: readonly RoomTake[],
): Promise<RoomEdit> {
  const day = roomDayWithRowsOf(deriveToday(records));
  const result = planRoom(day, {
    blockId: addition.blockId,
    minutes: addition.lengthMin,
    takes,
  });
  if (result.kind !== "plan") throw new Error("That room can't be made.");
  if (result.plan.summary.found < addition.lengthMin) {
    throw new Error("Not enough minutes found yet.");
  }
  return writePlaced(
    server,
    records,
    day,
    addition,
    result.plan.changes,
    takes,
  );
}

/** The wake against Up at, and where the slide starts: after Orient's planned minutes. */
export function laterStartAskOf(today: Today): LaterStartAsk | null {
  const wake = lateWakeOf(today);
  if (wake === null) return null;
  return {
    ...wake,
    short: wake.wokeAt - wake.upAt,
    from: wake.upAt + ORIENT_LENGTH_MIN,
  };
}

export type LaterStartChoice =
  { tab: "cut"; cuts: readonly string[] } | { tab: "slide" };

/** Cut these, slide the rest; or Slide the day back. Today only. */
export async function writeLaterStart(
  server: DayEditsServer,
  records: TodayRecords,
  choice: LaterStartChoice,
): Promise<RoomEdit> {
  const today = deriveToday(records);
  const ask = laterStartAskOf(today);
  if (ask === null) throw new Error("The day started as planned.");
  const day = roomDayWithRowsOf(today);
  if (choice.tab === "slide") {
    const result = slideDay(day, { from: ask.from, minutes: ask.short });
    if (result.kind !== "plan")
      throw new Error("The day can't slide that far.");
    return {
      undo: await writeDayChanges(server, records, result.plan.changes),
      room: { kind: "slid", minutes: result.plan.summary.minutes },
    };
  }
  const result = cutAndSlide(day, {
    cuts: choice.cuts,
    short: ask.short,
    from: ask.from,
  });
  if (result.kind !== "plan") throw new Error("Those can't be cut.");
  const ticked = new Set(choice.cuts);
  const names = day.blocks
    .flatMap((occurrence) => occurrence.slots)
    .filter((slot) => ticked.has(slot.id))
    .map((slot) => slot.title);
  return {
    undo: await writeDayChanges(server, records, result.plan.changes),
    room: {
      kind: "cut",
      names,
      stillShort: result.plan.summary.stillShort,
    },
  };
}

/* ---------------------------------------------------------------- store -- */

/**
 * The addition Make room is open for. An add sheet elsewhere calls `place`;
 * the sheet over Review the day reads it here.
 */
let pending: { dateKey: string; addition: RoomAddition } | null = null;
const listeners = new Set<() => void>();

function setPending(next: typeof pending) {
  pending = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const readPending = () => pending;

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/* ----------------------------------------------------------------- hook -- */

export function useRoom(
  dateKey: string,
  {
    offerLaterStart = false,
    onEdit,
  }: {
    /** Review the day's own: the later-start sheet may open by itself. */
    offerLaterStart?: boolean;
    onEdit?: () => void;
  } = {},
) {
  const source = useDataSource();
  const { scenario } = source;
  const edits = useDayEdits(dateKey, { onEdit });
  const showToast = useUndoToast();
  const { today } = useToday(dateKey);
  const day = React.useMemo(
    () => (today === undefined ? undefined : roomDayWithRowsOf(today)),
    [today],
  );
  const seed = source.seeds.room;

  /* ---- Make room ---- */

  const request = React.useSyncExternalStore(
    subscribe,
    readPending,
    () => null,
  );
  const addition = request?.dateKey === dateKey ? request.addition : null;
  const candidates = React.useMemo(
    () =>
      day && addition ? roomCandidatesOf(day, addition.blockId) : undefined,
    [day, addition],
  );
  const [picks, setPicks] = React.useState<Map<string, number>>(new Map());
  const [roomSource, setRoomSource] = React.useState<RoomSource>("this_block");
  const opened = React.useRef<RoomAddition | null>(null);
  React.useEffect(() => {
    if (!addition || !candidates || opened.current === addition) return;
    opened.current = addition;
    setRoomSource("this_block");
    setPicks(openingPicks(candidates, addition.lengthMin));
  }, [addition, candidates]);

  // A scenario's capture opens Make room on load.
  const seededRoom = React.useRef(false);
  React.useEffect(() => {
    if (seededRoom.current || !seed?.makeRoom) return;
    seededRoom.current = true;
    setPending({ dateKey, addition: seed.makeRoom });
  }, [seed, dateKey]);

  const makeRoom =
    day && addition && candidates
      ? makeRoomView(day, addition, {
          picks,
          source: roomSource,
          candidates,
        })
      : null;

  function toastPlaced(token: string, room: RoomOutcome) {
    if (room.kind !== "placed") return;
    const gave = room.gave.map((part) => ({
      name:
        part.kind === "item"
          ? part.title
          : COPY.makeRoom.gapGave[part.where](part.block),
      minutes: part.minutes,
    }));
    showToast({
      text: COPY.makeRoom.placed(room.title, room.block, gave),
      onUndo: () => void edits.undo(token),
    });
  }

  function place(next: RoomAddition) {
    return edits
      .write((server, records) => writePlace(server, records, next))
      .then(({ token, room }) => {
        if (room.kind === "asked") {
          setPending({ dateKey, addition: room.addition });
          return;
        }
        toastPlaced(token, room);
      });
  }

  function closeMakeRoom() {
    opened.current = null;
    setPending(null);
  }

  function applyMakeRoom() {
    if (!makeRoom?.ready || !makeRoom.plan || !addition) return;
    const takes = makeRoom.plan.summary.takes;
    closeMakeRoom();
    return edits
      .write((server, records) =>
        writeMakeRoom(server, records, addition, takes),
      )
      .then(({ token, room }) => toastPlaced(token, room));
  }

  /* ---- A later start ---- */

  const ask = today === undefined ? null : laterStartAskOf(today);
  const [laterOpen, setLaterOpen] = React.useState(false);
  const [tab, setTab] = React.useState<LaterStartTab>(
    seed?.later?.tab ?? "cut",
  );
  const [cuts, setCuts] = React.useState<ReadonlySet<string>>(
    () => new Set(seed?.later?.cuts ?? []),
  );
  const [shown, setShown] = React.useState<Record<LaterStartTab, number>>({
    cut: LATER_START_SHOWN.cut,
    slide: LATER_START_SHOWN.slide,
  });
  const flagKey =
    scenario.name === DEFAULT_SCENARIO
      ? LATER_START
      : `${scenario.name}:${LATER_START}`;

  // Once a day: the flag is read before the sheet may open, then written.
  const checked = React.useRef(false);
  React.useEffect(() => {
    if (!offerLaterStart || checked.current || today === undefined) return;
    checked.current = true;
    // A capture's scenario opens it every time, as the passed row does.
    if (seed?.later) {
      setLaterOpen(true);
      return;
    }
    const store = storage();
    let flagged = scenario.seen?.includes(LATER_START) ?? false;
    try {
      if (store) flagged ||= readDismissal(store, flagKey, "day", dateKey);
    } catch {
      // Storage unavailable: the visit's own state holds it.
    }
    if (!opensLaterStart({ wake: lateWakeOf(today), flagged })) return;
    try {
      if (store) writeDismissal(store, flagKey, "day", dateKey);
    } catch {
      // Best-effort: it still opens once this visit.
    }
    setLaterOpen(true);
  }, [offerLaterStart, today, scenario.seen, flagKey, dateKey, seed]);

  const cut = day && ask ? cutView(day, ask, { cuts, shown: shown.cut }) : null;
  const slide = day && ask ? slideView(day, ask, { shown: shown.slide }) : null;

  function applyLaterStart() {
    const choice: LaterStartChoice =
      tab === "slide" ? { tab: "slide" } : { tab: "cut", cuts: [...cuts] };
    setLaterOpen(false);
    return edits
      .write((server, records) => writeLaterStart(server, records, choice))
      .then(({ token, room }) => {
        const text =
          room.kind === "slid"
            ? COPY.later.slid(room.minutes)
            : room.kind === "cut" && room.names.length > 0
              ? COPY.later.cutDone(room.names, room.stillShort)
              : room.kind === "cut"
                ? COPY.later.slid(room.stillShort)
                : null;
        if (text === null) return;
        setCuts(new Set());
        showToast({ text, onUndo: () => void edits.undo(token) });
      });
  }

  return {
    edits,
    place,
    /** Make room's sheet, while an addition waits on it. */
    makeRoom: {
      view: makeRoom,
      setSource: setRoomSource,
      toggle: (key: string) => {
        if (!candidates || !addition) return;
        setPicks((now) => togglePick(candidates, now, key, addition.lengthMin));
      },
      step: (key: string, minutes: number) =>
        setPicks((now) => new Map(now).set(key, minutes)),
      close: closeMakeRoom,
    },
    plan: makeRoom?.plan ?? null,
    apply: applyMakeRoom,
    /** Cut some's "Swap for a shorter one ›": the item's library holds one. */
    canSwap: (itemId: string) => {
      if (today === undefined) return false;
      const view = deriveItemSheet(today, itemId);
      return (
        view !== null &&
        view.swap.some(
          (row) => !row.current && row.lengthMin < view.item.lengthMin,
        )
      );
    },
    /** The passed row's way back in: past the day's flag. */
    openLaterStart: () => setLaterOpen(true),
    laterStart: {
      open: laterOpen && ask !== null,
      ask,
      tab,
      setTab,
      cut,
      slide,
      toggle: (id: string) =>
        setCuts((now) => {
          const next = new Set(now);
          if (!next.delete(id)) next.add(id);
          return next;
        }),
      toggleBlock: (blockId: string) => {
        if (cut) setCuts((now) => toggleBlockCut(cut, now, blockId));
      },
      showMore: () =>
        setShown((now) => ({
          ...now,
          [tab]: now[tab] + LATER_START_SHOWN.step,
        })),
      apply: applyLaterStart,
      /** Not now and ×: nothing moves. */
      close: () => setLaterOpen(false),
    },
  };
}
