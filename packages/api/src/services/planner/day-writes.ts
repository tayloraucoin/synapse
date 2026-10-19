import { inArray, or } from "drizzle-orm";
import { blockChanges, slots, type RlsClient } from "@syn/db";
import {
  addDays,
  clockFromMinutes,
  clockMinutes,
  readDay,
  thisWeekDates,
  usualDay,
  weekdayIndex,
  weeklyRule,
  withoutWeekday,
} from "@syn/utils";
import {
  blockChangeRecord,
  blockItemRecord,
  blockRecord,
  slotRecord,
  type BlockChangeRecord,
  type BlockItemRecord,
  type BlockRecord,
  type CopyBlockInput,
  type CopyDayInput,
  type DayRefInput,
  type PlannerWriteOutput,
  type ResetDayInput,
} from "@syn/validators";
import { refuse } from "../../errors";
import { rowStore, type RowStore } from "../undo/row-store";
import { recordUndo, undoChangesOf } from "../undo/undo";
import { recordsOf } from "./row-records";
import {
  systemClock,
  WriteJournal,
  type WriteClock,
  type WriteRows,
} from "./write-journal";
import { blockOn, reachOf, type PlanOut } from "./write-plan";
import { applyChanges, selectBaseRows } from "./write-rows";

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

/**
 * The day-level writes (USE-93): Copy from, From a saved block, Clear the day
 * and Reset to usual, each the fixture server's (`lib/fixtures/planner/
 * index.ts`) as a pure plan over the caller's rows, in the same words. Each
 * runs in one transaction (`runDayWrite`), as USE-92's writes do, so a whole
 * day's rows land together or not at all, and hands back one Undo that puts
 * the day back as it was.
 *
 * WHAT IS READ. USE-92's base rows, then a date's block changes and slots
 * and every change and slot of the blocks on it (`selectDayRows`): a usual
 * weekday has none of its own, and USE-92's reads, keyed by block, would
 * miss a date's rows of a block no longer on it.
 */

/** One day as Set my days reads it: the blocks that may run, their times and items. */
export interface SetUpDay {
  weekday: number;
  date: string | null;
  blocks: BlockRecord[];
  changes: BlockChangeRecord[];
  items: BlockItemRecord[];
}

/** The fixture's `readSetUpDay`, the parts a day write reads. */
export function readSetUpDay(rows: WriteRows, ref: DayRefInput): SetUpDay {
  if (!("date" in ref)) {
    const blocks = usualDay(
      rows.blocks.filter((block) => block.archivedAt === null),
      ref.weekday,
    );
    const ids = new Set(blocks.map((block) => block.id));
    return {
      weekday: ref.weekday,
      date: null,
      blocks,
      changes: [],
      items: rows.blockItems.filter(
        (item) => ids.has(item.blockId) && item.onDate === null,
      ),
    };
  }

  const { date } = ref;
  const changes = rows.blockChanges.filter((c) => c.onDate === date);
  const slots = rows.slots.filter((slot) => slot.onDate === date);
  const blocks = readDay({
    dateKey: date,
    timeZone: rows.timeZone,
    blocks: rows.blocks,
    changes,
    slots,
  }).blocks.map((occurrence) => occurrence.block);
  const ids = new Set(blocks.map((block) => block.id));
  const skipped = new Set(
    slots
      .filter((slot) => slot.skipped && slot.blockItemId !== null)
      .map((slot) => slot.blockItemId),
  );
  return {
    weekday: weekdayIndex(date),
    date,
    blocks,
    changes,
    items: rows.blockItems.filter(
      (item) =>
        ids.has(item.blockId) &&
        (item.onDate === null || item.onDate === date) &&
        !skipped.has(item.id),
    ),
  };
}

/** A block's times on the day: its move, if the date has one. */
function timesOf(block: BlockRecord, changes: readonly BlockChangeRecord[]) {
  const change = changes.find((c) => c.blockId === block.id);
  return change && change.startsAt !== null && change.endsAt !== null
    ? { startsAt: change.startsAt, endsAt: change.endsAt }
    : { startsAt: block.startsAt, endsAt: block.endsAt };
}

function usualReach(to: DayRefInput): PlanOut["reach"] {
  return "date" in to ? undefined : { weekday: to.weekday };
}

/**
 * One block of `source` onto `to` at `times`, with its items (D-USE-32,
 * D-USE-87: a Work block as time only, its sessions never copied). Onto a
 * date it is a dated block, never a second rule; onto a usual weekday it
 * starts this week if that date has not begun.
 */
function putCopy(
  journal: WriteJournal,
  {
    block,
    source,
    to,
    times,
  }: {
    block: BlockRecord;
    source: SetUpDay;
    to: DayRefInput;
    times: { startsAt: string; endsAt: string };
  },
): BlockRecord {
  const rrule =
    "date" in to
      ? null
      : weeklyRule(
          reachOf(journal, to.weekday).follows ??
            addDays(
              thisWeekDates(journal.now(), journal.rows.timeZone)[to.weekday]!,
              7,
            ),
          to.weekday,
        );
  const row = journal.put(
    "blocks",
    blockRecord.parse({
      ...block,
      ...journal.stamps(),
      ...times,
      rrule,
      onDate: "date" in to ? to.date : null,
      archivedAt: null,
    }),
  );
  if (block.kind === "work") return row;
  for (const item of source.items.filter((i) => i.blockId === block.id)) {
    journal.put(
      "blockItems",
      blockItemRecord.parse({
        ...item,
        ...journal.stamps(),
        blockId: row.id,
        onDate: null,
      }),
    );
  }
  return row;
}

/**
 * Empties a day. A date skips its repeating blocks, archives its dated ones
 * and loses its own items; no rule is edited. A usual weekday takes itself
 * off each block's rule, archiving a block left with no day.
 */
function clearInto(journal: WriteJournal, ref: DayRefInput) {
  const { rows } = journal;
  const day = readSetUpDay(rows, ref);
  if ("date" in ref) {
    for (const block of day.blocks) {
      if (block.rrule === null) {
        const stored = rows.blocks.find(
          (b) => b.id === block.id,
        ) as BlockRecord;
        journal.put(
          "blocks",
          blockRecord.parse({
            ...stored,
            archivedAt: journal.stamp(),
            updatedAt: journal.stamp(),
          }),
        );
        continue;
      }
      const existing = rows.blockChanges.find(
        (c) => c.blockId === block.id && c.onDate === ref.date,
      );
      journal.put(
        "blockChanges",
        blockChangeRecord.parse({
          ...(existing ?? journal.stamps()),
          updatedAt: journal.stamp(),
          blockId: block.id,
          onDate: ref.date,
          skipped: true,
          startsAt: null,
          endsAt: null,
        }),
      );
    }
    // The date's own items go with it.
    for (const item of rows.blockItems.filter((i) => i.onDate === ref.date)) {
      journal.removeItem(item.id);
    }
    return;
  }
  for (const block of day.blocks) {
    const rule = withoutWeekday(block.rrule as string, ref.weekday);
    journal.put(
      "blocks",
      blockRecord.parse(
        rule === null
          ? {
              ...block,
              archivedAt: journal.stamp(),
              updatedAt: journal.stamp(),
            }
          : { ...block, rrule: rule, updatedAt: journal.stamp() },
      ),
    );
  }
}

/** D-USE-32 and D-USE-87: `to` is cleared, then takes `from`'s blocks. */
export function planCopyDay(
  journal: WriteJournal,
  { from, to }: CopyDayInput,
): PlanOut {
  const source = readSetUpDay(journal.rows, from);
  const target = readSetUpDay(journal.rows, to);
  if (source.weekday === target.weekday && source.date === target.date) {
    throw refuse("invalid", "Pick another day to copy.");
  }
  if (source.blocks.length === 0) {
    throw refuse("invalid", "That day has nothing to copy.");
  }
  clearInto(journal, to);
  for (const block of source.blocks) {
    putCopy(journal, {
      block,
      source,
      to,
      times: timesOf(block, source.changes),
    });
  }
  return { reach: usualReach(to) };
}

/** One block of `from`, with its items, onto `to` at `startsAt`, keeping its length. */
export function planCopyBlock(
  journal: WriteJournal,
  { blockId, from, to, startsAt }: CopyBlockInput,
): PlanOut {
  const source = readSetUpDay(journal.rows, from);
  const block = source.blocks.find((b) => b.id === blockId);
  if (!block) throw refuse("unknown", "That block is not on that day.");
  const times = timesOf(block, source.changes);
  const length = clockMinutes(times.endsAt) - clockMinutes(times.startsAt);
  const start = clockMinutes(startsAt);
  const row = putCopy(journal, {
    block,
    source,
    to,
    times: {
      startsAt,
      endsAt: clockFromMinutes(Math.min(24 * 60, start + length)),
    },
  });
  return { id: row.id, reach: usualReach(to) };
}

export function planClearDay(journal: WriteJournal, ref: DayRefInput): PlanOut {
  if (readSetUpDay(journal.rows, ref).blocks.length === 0) {
    throw refuse("invalid", "That day has nothing to clear.");
  }
  clearInto(journal, ref);
  return { reach: usualReach(ref) };
}

/**
 * D-USE-33: the date's own rows go and the usual day shows again: its block
 * changes, skipped slots, own items, dated blocks and own bounds. Nothing of
 * the usual week is touched.
 */
export function planResetDay(
  journal: WriteJournal,
  { date }: ResetDayInput,
): PlanOut {
  const { rows } = journal;
  for (const change of rows.blockChanges.filter((c) => c.onDate === date)) {
    journal.remove("blockChanges", change.id);
  }
  for (const slot of rows.slots.filter((s) => s.onDate === date && s.skipped)) {
    journal.remove("slots", slot.id);
  }
  for (const item of rows.blockItems.filter((i) => i.onDate === date)) {
    journal.removeItem(item.id);
  }
  // [ASSUMPTION] Blocks made for the date alone, and its own bounds, are its own changes too.
  for (const block of rows.blocks.filter(
    (b) => b.rrule === null && b.onDate === date,
  )) {
    journal.removeBlock(block.id);
  }
  for (const row of rows.dayBounds.filter((r) => r.onDate === date)) {
    journal.remove("dayBounds", row.id);
  }
  return {};
}

/** The dates a write names. */
export function datesOf(...refs: DayRefInput[]): string[] {
  return [...new Set(refs.flatMap((ref) => ("date" in ref ? [ref.date] : [])))];
}

/**
 * A day write's rows: the caller's base rows, then the dates' block changes
 * and slots and every change and slot of the blocks on them, dated ones
 * included, so a removed block's rows are all in the plan and its Undo.
 */
async function selectDayRows(
  tx: Tx,
  userId: string,
  dates: readonly string[],
): Promise<WriteRows> {
  const base = await selectBaseRows(tx, userId);
  if (dates.length === 0) return { ...base, blockChanges: [], slots: [] };
  const ids = base.blocks
    .filter((block) => dates.some((date) => blockOn(block, date)))
    .map((block) => block.id);
  const changeRows = await tx
    .select()
    .from(blockChanges)
    .where(
      or(
        inArray(blockChanges.onDate, [...dates]),
        ...(ids.length > 0 ? [inArray(blockChanges.blockId, ids)] : []),
      ),
    );
  const slotRows = await tx
    .select()
    .from(slots)
    .where(
      or(
        inArray(slots.onDate, [...dates]),
        ...(ids.length > 0 ? [inArray(slots.blockId, ids)] : []),
      ),
    );
  return {
    ...base,
    blockChanges: recordsOf(blockChangeRecord, changeRows),
    slots: recordsOf(slotRecord, slotRows),
  };
}

/** Where a day write reads its rows and writes its changes: one transaction's. */
export interface DayWriteStore {
  read: () => Promise<WriteRows>;
  store: RowStore;
}

/**
 * Plan then apply, inside the caller's transaction: the rows read, the plan
 * made through the journal, its changes written, the token that undoes
 * exactly them signed. A refusal or a failed step throws, and the
 * transaction puts every row back.
 */
export async function applyDayWrite(
  { read, store }: DayWriteStore,
  userId: string,
  plan: (journal: WriteJournal) => PlanOut,
  clock: WriteClock = systemClock,
  key?: string,
): Promise<PlannerWriteOutput> {
  const journal = new WriteJournal(await read(), clock);
  const out = plan(journal);
  const changes = journal.changes();
  await applyChanges(store, changes);
  const result: PlannerWriteOutput = {
    undo: recordUndo(undoChangesOf(changes), userId, key),
  };
  if (out.id !== undefined) result.id = out.id;
  if (out.reach) result.reach = reachOf(journal, out.reach.weekday);
  return result;
}

/** One day write in one `rls.execute`: all of it lands, or none of it. */
export function runDayWrite(
  rls: RlsClient,
  userId: string,
  refs: DayRefInput[],
  plan: (journal: WriteJournal) => PlanOut,
): Promise<PlannerWriteOutput> {
  const dates = datesOf(...refs);
  return rls.execute((tx) =>
    applyDayWrite(
      {
        read: () => selectDayRows(tx, userId, dates),
        store: rowStore(tx, userId),
      },
      userId,
      plan,
    ),
  );
}
