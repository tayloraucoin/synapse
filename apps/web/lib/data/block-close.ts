import {
  clockFromMinutes,
  doNowLines,
  instantToWallClockMinutes,
  laterTarget,
  slideAfter,
  type DoNowLine,
  type LaterTarget,
  type SlideChange,
} from "@syn/utils";
import type { FixtureServer } from "@/lib/fixtures/server";
import type { Today } from "./derive-today";
import type { NowNextBlock } from "./now-end";

/**
 * A block closed with items left (USE-25; day/block-complete): the close
 * card's facts, derived beside `deriveNow`, and Later's writes. Names and
 * times only: nothing counts what was left, nothing says missed.
 */

type Occurrence = Today["occurrences"]["blocks"][number];

/** The spans `deriveNow` builds, as this reads them. */
export interface CloseSpan {
  occurrence: Occurrence;
  items: readonly {
    id: string;
    title: string;
    lengthMin: number | null;
    done: boolean;
    sortOrder: number;
    blockItemId: string | null;
    slotId: string | null;
  }[];
  start: Date;
  end: Date;
  allDay: boolean;
}

/** One item left in the closed block, as the card lists it. */
export interface CloseItem {
  /** The row's id on Now: the set item's, or the slot's for a pulled row. */
  id: string;
  title: string;
  /** The planned length: Do now's consequence counts it. */
  lengthMin: number | null;
  /** Left as it was; moved by Later; or Leave tapped (the row goes). */
  state: "left" | "moved" | "leave";
  /** "Training": where Later put it, while it is moved. */
  movedTo: string | null;
  /** What Undo takes back; null unless moved. */
  undo: LaterUndo | null;
  /** Where the row sat in the block, for Later's write. */
  row: Pick<CloseSpan["items"][number], "sortOrder" | "blockItemId" | "slotId">;
}

export interface NowClosing {
  block: { id: string; name: string; kind: Occurrence["block"]["kind"] };
  /** Up to two blocks after it: "Training 8:00", "then Breakfast 9:00". */
  next: (NowNextBlock & { kind: Occurrence["block"]["kind"] })[];
  /** Where Later puts an item (D-USE-70); null after the last block. */
  later: (LaterTarget & { blockName: string }) | null;
  /**
   * The items left as the records hold them: undone in the block, or a set
   * item Later moved out today. The card's own list once it is acted on.
   */
  left: CloseItem[];
  /** What Do now's lines and slide are read from (USE-26). */
  doNow: {
    dateKey: string;
    /** The closed block's end today. */
    end: Date;
    /** The first block of Next: the one "would start" names. */
    next: { name: string; start: Date } | null;
    /** The date's blocks as they run today, for the slide. */
    blocks: readonly Occurrence[];
    timeZone: string;
  };
}

/** How Later is undone: exactly what it wrote, put back. */
export type LaterUndo =
  /** Later placed the slot: it goes, and the item is the block's again. */
  | { kind: "remove"; slotId: string }
  /** The slot was there before: it returns to its block and place. */
  | { kind: "return"; slotId: string; blockId: string; sortOrder: number };

/** A set item of `block` whose date slot sits in another block (Later's). */
export function movedOut(
  records: Today["records"],
  blockId: string,
  blockItemId: string,
) {
  return (
    records.slots.find(
      (slot) =>
        slot.blockItemId === blockItemId &&
        slot.onDate === records.date &&
        slot.blockId !== blockId &&
        !slot.skipped,
    ) ?? null
  );
}

/**
 * The close card for `blockId`: the next two set-time blocks to start after
 * both now and the closed block's start, Later's target, and the items left.
 */
export function deriveClosing(
  today: Today,
  spans: readonly CloseSpan[],
  blockId: string,
  now: Date,
): NowClosing | null {
  const closed = spans.find((span) => span.occurrence.block.id === blockId);
  if (!closed) return null;
  const after = Math.max(now.getTime(), closed.start.getTime());
  const following = spans
    .filter(
      (span) => span !== closed && !span.allDay && span.start.getTime() > after,
    )
    .slice(0, 2);
  const next = following.map(({ occurrence }) => ({
    id: occurrence.block.id,
    name: occurrence.block.name,
    kind: occurrence.block.kind,
    startsAt: occurrence.startsAt,
    endsAt: occurrence.endsAt,
  }));
  const target = laterTarget({
    blocks: spans.map((span) => ({
      id: span.occurrence.block.id,
      kind: span.occurrence.block.kind,
      start: span.start,
      end: span.end,
      allDay: span.allDay,
      sortOrders: span.items.map((item) => item.sortOrder),
    })),
    fromBlockId: blockId,
    now,
  });
  const names = new Map(
    spans.map((span) => [span.occurrence.block.id, span.occurrence.block.name]),
  );
  const { records } = today;
  const moved = records.blockItems
    .filter((item) => item.blockId === blockId)
    .flatMap((item): CloseItem[] => {
      const slot = movedOut(records, blockId, item.id);
      if (!slot || slot.doneAt !== null) return [];
      return [
        {
          id: item.id,
          title: item.title,
          lengthMin: item.lengthMin,
          state: "moved",
          movedTo: names.get(slot.blockId) ?? null,
          undo: { kind: "remove", slotId: slot.id },
          row: {
            sortOrder: item.sortOrder,
            blockItemId: item.id,
            slotId: null,
          },
        },
      ];
    });
  return {
    block: {
      id: blockId,
      name: closed.occurrence.block.name,
      kind: closed.occurrence.block.kind,
    },
    next,
    later: target
      ? { ...target, blockName: names.get(target.blockId) ?? "" }
      : null,
    left: [
      ...closed.items
        .filter((item) => !item.done)
        .map((item): CloseItem => ({
          id: item.id,
          title: item.title,
          lengthMin: item.lengthMin,
          state: "left",
          movedTo: null,
          undo: null,
          row: {
            sortOrder: item.sortOrder,
            blockItemId: item.blockItemId,
            slotId: item.slotId,
          },
        })),
      ...moved,
    ],
    doNow: {
      dateKey: records.date,
      end: closed.end,
      next: following[0]
        ? {
            name: following[0].occurrence.block.name,
            start: following[0].start,
          }
        : null,
      blocks: today.occurrences.blocks,
      timeZone: records.timeZone,
    },
  };
}

/**
 * Do now on one item left (USE-26; D-USE-72): its consequence and what the
 * tap writes, from the same pure functions. Past the block's end the block
 * extends and the day slides; fitting before it, nothing is written.
 */
export interface DoNowPlan {
  line: DoNowLine;
  /** "7:55" or "8:05": the line's time, in the day's zone. */
  at: string;
  changes: SlideChange[];
}

/**
 * Each item still left on the card, in its order, counting the items above
 * it as done now too; recomputed whenever the list changes. An item whose
 * slide would push a block past 24:00 gets no plan, so no Do now
 * [ASSUMPTION].
 */
export function doNowPlans(
  closing: NowClosing,
  items: readonly CloseItem[],
  now: Date,
): Map<string, DoNowPlan> {
  const { doNow } = closing;
  const left = items.filter((item) => item.state === "left");
  const plans = new Map<string, DoNowPlan>();
  for (const line of doNowLines({
    block: { end: doNow.end },
    left,
    next: doNow.next,
    now,
  })) {
    const time =
      "fitsBy" in line
        ? line.fitsBy
        : "nextStartsAt" in line
          ? line.nextStartsAt
          : line.endsAt;
    const changes =
      "fitsBy" in line
        ? []
        : slideAfter({
            blocks: doNow.blocks,
            fromBlockId: closing.block.id,
            overrunMin: line.overrunMin,
            dateKey: doNow.dateKey,
          });
    if (changes === null) continue;
    plans.set(line.id, {
      line,
      at: clockFromMinutes(instantToWallClockMinutes(time, doNow.timeZone)),
      changes,
    });
  }
  return plans;
}

/** Do now's write: the slide's dated block changes, or nothing at all. */
export async function writeDoNow(
  server: Pick<FixtureServer, "writeBlockChange">,
  plan: DoNowPlan,
): Promise<void> {
  for (const change of plan.changes) await server.writeBlockChange(change);
}

/** The server calls Later uses, so a test drives the same code. */
export type LaterServer = Pick<FixtureServer, "writeSlots" | "removeSlot">;

/**
 * Later (D-USE-70): one slot at the end of the target block, for today
 * only. A set item's slot is placed there on first touch, else its slot
 * moves; a pulled row's slot moves. The usual week is never written.
 */
export async function writeLater(
  server: Pick<LaterServer, "writeSlots">,
  dateKey: string,
  fromBlockId: string,
  item: CloseItem["row"],
  target: LaterTarget,
): Promise<LaterUndo> {
  if (item.slotId !== null) {
    await server.writeSlots({
      id: item.slotId,
      blockId: target.blockId,
      sortOrder: target.sortOrder,
    });
    return {
      kind: "return",
      slotId: item.slotId,
      blockId: fromBlockId,
      sortOrder: item.sortOrder,
    };
  }
  if (item.blockItemId === null) throw new Error("A pulled row has its slot.");
  const placed = await server.writeSlots({
    blockId: target.blockId,
    onDate: dateKey,
    sortOrder: target.sortOrder,
    blockItemId: item.blockItemId,
  });
  return { kind: "remove", slotId: placed.id };
}

/** Undo: the item is back in its block exactly, not done; no trace left. */
export async function undoLater(
  server: LaterServer,
  undo: LaterUndo,
): Promise<void> {
  if (undo.kind === "remove") {
    await server.removeSlot({ id: undo.slotId });
  } else {
    await server.writeSlots({
      id: undo.slotId,
      blockId: undo.blockId,
      sortOrder: undo.sortOrder,
    });
  }
}

/** The card is only for a block closed with items left, or with none at all. */
export function closesWithCard(items: readonly { done: boolean }[]): boolean {
  return items.length === 0 || items.some((item) => !item.done);
}
