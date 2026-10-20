import { describe, expect, it, vi } from "vitest";
import type { SaveStatus } from "@syn/types";
import type {
  ReadingKind,
  ReadingRowInput,
  ReorderReadingInput,
  TurnOnInput,
} from "@syn/validators";
import { MORNING_READING_COPY as COPY } from "./copy";
import { moveId, rowActions, type ReadingRow } from "./use-row-actions";

/**
 * USE-152: Settings › Morning reading's row actions, against an in-memory
 * section that keeps the server's rules (D-USE-123, D-USE-124): the whole
 * order saves; off keeps a row's place, and Undo's `restore` puts it back
 * there; Turn on without it lands at the end. The server's own rules are
 * USE-150's tests. C2: Move up sends the section's whole order and says
 * "Saved"; the first row has no Move up. C3: Undo after Turn off calls
 * `turnOn` with `restore`; Turn on from Off calls it without. C4: a failed
 * save puts the order back (D-USE-128).
 */

const R = {
  feet: "feet",
  slow: "slow",
  kettle: "kettle",
  longView: "long-view",
  calm: "calm",
  stretching: "stretching",
} as const;

const NAMES: Record<string, string> = {
  [R.feet]: "Where the feet are",
  [R.slow]: "Slow is a speed too",
};

function row(id: string, sortOrder: number): ReadingRow {
  return {
    id,
    title: NAMES[id] ?? null,
    bodyMd: id,
    sortOrder,
  } as unknown as ReadingRow;
}

/** One section as the server keeps it: active rows by place, off rows apart. */
function fakeSection(active: string[], off: string[], fail: boolean) {
  let rows = active.map(row);
  let offRows = off.map((id) => row(id, 99));
  let failNext = fail;
  const gate = () => {
    if (failNext) {
      failNext = false;
      throw new Error("save failed");
    }
  };
  const sorted = () => [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    ids: () => sorted().map((r) => r.id),
    offIds: () => offRows.map((r) => r.id),
    row: (id: string) => [...rows, ...offRows].find((r) => r.id === id)!,
    reorder: vi.fn(async ({ ids }: ReorderReadingInput) => {
      gate();
      rows = ids.map((id, n) => ({
        ...rows.find((r) => r.id === id)!,
        sortOrder: n,
      }));
    }),
    turnOff: vi.fn(async ({ id }: ReadingRowInput) => {
      gate();
      offRows = [...offRows, rows.find((r) => r.id === id)!];
      rows = rows.filter((r) => r.id !== id);
    }),
    turnOn: vi.fn(async ({ id, restore }: TurnOnInput) => {
      gate();
      const back = offRows.find((r) => r.id === id)!;
      const end = Math.max(-1, ...rows.map((r) => r.sortOrder)) + 1;
      offRows = offRows.filter((r) => r.id !== id);
      rows = [...rows, restore ? back : { ...back, sortOrder: end }];
    }),
    remove: vi.fn(async ({ id }: ReadingRowInput) => {
      gate();
      offRows = offRows.filter((r) => r.id !== id);
    }),
  };
}

function setup(
  kind: ReadingKind = "passage",
  { fail = false }: { fail?: boolean } = {},
) {
  const section =
    kind === "passage"
      ? fakeSection([R.feet, R.slow, R.kettle], [R.longView], fail)
      : fakeSection([R.calm, R.stretching], [], fail);
  let order = section.ids();
  const statuses: SaveStatus[] = [];
  const said: string[] = [];
  const toasts: { row: ReadingRow; undo: () => void }[] = [];
  const actions = rowActions({
    kind,
    ids: () => order,
    nameOf: (id) => NAMES[id] ?? id,
    setOrder: (ids) => {
      order = ids;
    },
    reorder: section.reorder,
    turnOff: section.turnOff,
    turnOn: section.turnOn,
    remove: section.remove,
    setStatus: (status) => statuses.push(status),
    announce: (text) => said.push(text),
    notifyOff: (r, undo) => toasts.push({ row: r, undo }),
  });
  return {
    section,
    spies: section,
    actions,
    statuses,
    said,
    toasts,
    order: () => order,
  };
}

describe("C2: Move up sends the whole order and says Saved", () => {
  it("Move up on the second passage puts it first and saves every id", async () => {
    const t = setup();
    expect(await t.actions.move(R.slow, -1)).toBe(true);
    expect(t.spies.reorder).toHaveBeenCalledWith({
      kind: "passage",
      ids: [R.slow, R.feet, R.kettle],
    });
    expect(t.statuses).toEqual(["saving", "saved"]);
    expect(t.said).toEqual([COPY.movedFirst(COPY.movedUp)]);
    expect(t.section.ids()).toEqual([R.slow, R.feet, R.kettle]);
    expect(t.order()).toEqual([R.slow, R.feet, R.kettle]);
  });

  it("Move down says the place in words, after the row it now follows", async () => {
    const t = setup();
    await t.actions.move(R.feet, 1);
    expect(t.said).toEqual([
      COPY.movedAfter(COPY.movedDown, "Slow is a speed too"),
    ]);
  });

  it("the first row has no Move up and the last no Move down", () => {
    const ids = [R.feet, R.slow, R.kettle];
    expect(moveId(ids, R.feet, -1)).toBeNull();
    expect(moveId(ids, R.kettle, 1)).toBeNull();
    expect(moveId(ids, R.slow, 1)).toEqual([R.feet, R.kettle, R.slow]);
  });

  it("a drop sends the section's whole order", async () => {
    const t = setup("link");
    await t.actions.reorder([R.stretching, R.calm]);
    expect(t.spies.reorder).toHaveBeenCalledWith({
      kind: "link",
      ids: [R.stretching, R.calm],
    });
    expect(t.statuses.at(-1)).toBe("saved");
  });
});

describe("C3: Undo restores the place; Turn on from Off lands at the end", () => {
  it("Turn off hands the row to the toast; its Undo calls turnOn with restore", async () => {
    const t = setup();
    await t.actions.turnOff(t.section.row(R.slow));
    expect(t.spies.turnOff).toHaveBeenCalledWith({
      kind: "passage",
      id: R.slow,
    });
    expect(t.section.ids()).toEqual([R.feet, R.kettle]);
    expect(t.toasts.map((toast) => toast.row.id)).toEqual([R.slow]);

    t.toasts[0]!.undo();
    await vi.waitFor(() =>
      expect(t.spies.turnOn).toHaveBeenCalledWith({
        kind: "passage",
        id: R.slow,
        restore: true,
      }),
    );
    expect(t.section.ids()).toEqual([R.feet, R.slow, R.kettle]);
  });

  it("Turn on from Off sends no restore, and the row lands at the end", async () => {
    const t = setup();
    await t.actions.turnOn(t.section.row(R.longView));
    expect(t.spies.turnOn).toHaveBeenCalledWith({
      kind: "passage",
      id: R.longView,
    });
    expect(t.section.ids()).toEqual([R.feet, R.slow, R.kettle, R.longView]);
  });

  it("the toast names the row in curly quotes, and an untitled passage in words", () => {
    expect(COPY.offToast("Slow is a speed too")).toBe(
      "“Slow is a speed too” is off. Orient no longer shows it.",
    );
    expect(COPY.offToast(null)).toBe(
      "That passage is off. Orient no longer shows it.",
    );
  });
});

describe("C4: a failed save puts the order back", () => {
  it("a drop whose save fails restores the previous order and says so", async () => {
    const t = setup("passage", { fail: true });
    const before = t.order();
    expect(await t.actions.reorder([R.kettle, R.feet, R.slow])).toBe(false);
    expect(t.order()).toEqual(before);
    expect(t.statuses).toEqual(["saving", "failed"]);
    expect(t.said).toEqual([]);
    expect(t.section.ids()).toEqual(before);
  });
});
