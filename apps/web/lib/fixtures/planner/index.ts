import type { z } from "zod";
import { addDays, occursOn, parseRule, usualChangeReach } from "@syn/utils";
import {
  blockChangeInput,
  blockChangeRecord,
  blockItemInput,
  blockItemRecord,
  blockRecord,
  dayBoundsInput,
  dayBoundsRecord,
  dayEventInput,
  dayEventRecord,
  editBlockInput,
  editBlockItemInput,
  newBlockInput,
  newTransitionInput,
  placeSlotInput,
  removeSlotInput,
  slotRecord,
  type BlockChangeRecord,
  type BlockItemRecord,
  type BlockRecord,
  type SlotRecord,
} from "@syn/validators";
import {
  thisWeekDates,
  type DayRef,
  type WeekRecords,
  type WeekRef,
} from "@/lib/data/week-records";
import type { FixtureRecords } from "../records";
import { createWriteLog, type Journal, type WriteLog } from "./journal";
import { boundsFor, readSetUpDay, readWeek } from "./read-week";
import { weeklyRule, withoutWeekday } from "./rules";
import { splitInto, type SplitPatch } from "./split-block";

/**
 * The planner's fixture server (USE-36): the set-up area's reads and writes,
 * an in-memory fake of the planner routers. Every write parses its
 * `@syn/validators` input and refuses with the schema's words; every write
 * is all or nothing and hands back an Undo that restores exactly what it
 * changed. A usual-week write changes a block for every week; a This week
 * write goes through `block_changes`, a skipped slot or a dated item and
 * never touches the usual block.
 */

/** The usual weekday an edit was made on, so its reach can be named. */
export interface WriteScope {
  weekday: number;
}

/** C-USE-set-my-days-4: this week's date a usual change reaches, or none. */
export interface PlannerReach {
  weekday: number;
  follows: string | null;
}

export interface PlannerWrite {
  /** Pass to `undo` to put back exactly what this write changed. */
  undo: string;
  /** The row the write made or changed, when it is one. */
  id?: string;
  reach?: PlannerReach;
}

export type PlannerRefusalReason =
  "invalid" | "unknown" | "duplicate" | "not-on-date";

/** A planner write the router would refuse, in the schema's words. */
export class PlannerRefusal extends Error {
  readonly reason: PlannerRefusalReason;

  constructor(reason: PlannerRefusalReason, message: string) {
    super(message);
    this.name = "PlannerRefusal";
    this.reason = reason;
  }
}

export type DayEventWrite = z.input<typeof dayEventInput> & { id?: string };

export interface PlannerServer {
  /** Seven days of records: the usual week, or a dated week by ISO key. */
  readWeek(week: WeekRef): Promise<WeekRecords>;
  /** A weekday's usual Up at and Lights out, or one date's own. */
  writeBounds(input: z.input<typeof dayBoundsInput>): Promise<PlannerWrite>;
  createBlock(
    input: z.input<typeof newBlockInput>,
    scope?: WriteScope,
  ): Promise<PlannerWrite>;
  createTransition(
    input: z.input<typeof newTransitionInput>,
    scope?: WriteScope,
  ): Promise<PlannerWrite>;
  /** The block itself: every date it runs (the usual week). */
  editBlock(
    input: z.input<typeof editBlockInput>,
    scope?: WriteScope,
  ): Promise<PlannerWrite>;
  /**
   * This and following (USE-47): the block's dates from `fromDate` on take
   * the patch as a new block; the old one ends the day before.
   */
  splitBlock(input: {
    id: string;
    fromDate: string;
    patch: SplitPatch;
  }): Promise<PlannerWrite>;
  /** One date of a repeating block: moved or skipped (This week). */
  writeBlockChange(
    input: z.input<typeof blockChangeInput>,
  ): Promise<PlannerWrite>;
  /** An item on every date, or with `onDate` on that date only. */
  writeBlockItem(
    input: z.input<typeof blockItemInput>,
    scope?: WriteScope,
  ): Promise<PlannerWrite>;
  editBlockItem(
    input: z.input<typeof editBlockItemInput>,
    scope?: WriteScope,
  ): Promise<PlannerWrite>;
  /** With `date`, a set item is skipped on that date and stays usual. */
  removeBlockItem(
    input: { id: string; date?: string },
    scope?: WriteScope,
  ): Promise<PlannerWrite>;
  /** With `date`, the date's slots and own items take the order. */
  reorderItems(
    input: { blockId: string; ids: string[]; date?: string },
    scope?: WriteScope,
  ): Promise<PlannerWrite>;
  placeSlot(input: z.input<typeof placeSlotInput>): Promise<PlannerWrite>;
  removeSlot(input: z.input<typeof removeSlotInput>): Promise<PlannerWrite>;
  writeDayEvent(
    input: DayEventWrite,
    scope?: WriteScope,
  ): Promise<PlannerWrite>;
  /** D-USE-32 and D-USE-87: blocks, times, kinds and items; Work as time only. */
  copyDay(input: { from: DayRef; to: DayRef }): Promise<PlannerWrite>;
  clearDay(ref: DayRef): Promise<PlannerWrite>;
  /** D-USE-33: the date's own changes go; the usual day shows again. */
  resetDay(ref: { date: string }): Promise<PlannerWrite>;
  undo(token: string): Promise<void>;
}

/** A slot place refused by `slots`' unique keys: one per item and per work item on a date. */
export const ALREADY_PLACED = "That item is already placed.";

export function slotClash(
  slots: readonly SlotRecord[],
  input: {
    onDate: string;
    blockItemId?: string | null;
    workItemId?: string | null;
  },
  except?: string,
): boolean {
  return slots.some(
    (s) =>
      s.id !== except &&
      s.onDate === input.onDate &&
      ((input.blockItemId != null && s.blockItemId === input.blockItemId) ||
        (input.workItemId != null && s.workItemId === input.workItemId)),
  );
}

export function parse<S extends z.ZodTypeAny>(
  schema: S,
  raw: unknown,
): z.output<S> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new PlannerRefusal(
      "invalid",
      parsed.error.issues[0]?.message ?? "Invalid input.",
    );
  }
  return parsed.data;
}

/** Only the keys sent change; `null` clears. */
export function patch<T extends object>(row: T, change: object): T {
  const next = { ...row };
  for (const [key, value] of Object.entries(change)) {
    if (value !== undefined) Object.assign(next, { [key]: value });
  }
  return next;
}

function blockOn(block: BlockRecord, dateKey: string): boolean {
  if (block.rrule === null) return block.onDate === dateKey;
  const parsed = parseRule(block.rrule);
  return parsed.ok && occursOn(parsed.rule, dateKey);
}

/** The times a block runs at on a read day: its change's, else its own. */
function timesOf(block: BlockRecord, changes: readonly BlockChangeRecord[]) {
  const change = changes.find((c) => c.blockId === block.id);
  return change && change.startsAt !== null && change.endsAt !== null
    ? { startsAt: change.startsAt, endsAt: change.endsAt }
    : { startsAt: block.startsAt, endsAt: block.endsAt };
}

export function createPlannerServer({
  records,
  now,
  isOffline,
  offlineError,
  log = createWriteLog({
    records,
    isOffline,
    offlineError,
    unknownUndo: () => new PlannerRefusal("unknown", "Nothing to undo."),
  }),
}: {
  records: FixtureRecords;
  now: () => Date;
  isOffline: () => boolean;
  offlineError: () => Error;
  /** Shared with the work writes (USE-55), so one `undo` serves both. */
  log?: WriteLog;
}): PlannerServer {
  const stamp = () => now().toISOString();
  const stamps = () => {
    const at = stamp();
    return { id: crypto.randomUUID(), createdAt: at, updatedAt: at };
  };

  function reachOf(
    weekday: number,
    changedOn: ReadonlySet<string> = new Set(),
  ): PlannerReach {
    const { follows } = usualChangeReach({
      weekday,
      weekDates: thisWeekDates(now(), records.timeZone),
      now: now(),
      timeZone: records.timeZone,
      upAtOn: (date) =>
        boundsFor(records, { date })?.upAt ?? records.usualWakeTime,
      changedOn,
    });
    return { weekday, follows };
  }

  /** Dates on which a block has its own change. */
  function changedDates(blockId: string): Set<string> {
    return new Set(
      records.blockChanges
        .filter((c) => c.blockId === blockId)
        .map((c) => c.onDate),
    );
  }

  function findBlock(id: string): BlockRecord {
    const block = records.blocks.find((b) => b.id === id);
    if (!block) throw new PlannerRefusal("unknown", "No block with that id.");
    return block;
  }

  function findItem(id: string): BlockItemRecord {
    const item = records.blockItems.find((i) => i.id === id);
    if (!item) throw new PlannerRefusal("unknown", "No item with that id.");
    return item;
  }

  function requireOn(block: BlockRecord, dateKey: string) {
    if (!blockOn(block, dateKey)) {
      throw new PlannerRefusal(
        "not-on-date",
        "That block is not on that date.",
      );
    }
  }

  /**
   * One write: all or nothing. `fn` changes the records through the journal;
   * a refusal part way puts back what it had done.
   */
  function write(
    fn: (journal: Journal) => {
      id?: string;
      reach?: { weekday: number; changedOn?: ReadonlySet<string> };
    },
  ): Promise<PlannerWrite> {
    return log.commit(fn).then(({ undo, out }) => {
      const result: PlannerWrite = { undo };
      if (out.id !== undefined) result.id = out.id;
      if (out.reach) {
        result.reach = reachOf(out.reach.weekday, out.reach.changedOn);
      }
      return result;
    });
  }

  /** A set item's slot on a date, made if it has none. */
  function slotFor(
    journal: Journal,
    item: BlockItemRecord,
    date: string,
    change: Partial<SlotRecord>,
  ): SlotRecord {
    const existing = records.slots.find(
      (s) => s.blockItemId === item.id && s.onDate === date,
    );
    if (existing) {
      return journal.put(
        "slots",
        slotRecord.parse(patch(existing, { ...change, updatedAt: stamp() })),
      );
    }
    const input = parse(placeSlotInput, {
      blockId: item.blockId,
      onDate: date,
      sortOrder: item.sortOrder,
      blockItemId: item.id,
      ...change,
    });
    return journal.put(
      "slots",
      slotRecord.parse({
        ...stamps(),
        blockId: input.blockId,
        onDate: input.onDate,
        skipped: input.skipped ?? false,
        sortOrder: input.sortOrder,
        blockItemId: item.id,
        todoId: null,
        workItemId: null,
        tier: null,
        lengthMin: null,
        tookMin: null,
        doneAt: null,
      }),
    );
  }

  /** Empties a day: a date skips its repeating blocks; a weekday leaves their rules. */
  function clearInto(journal: Journal, ref: DayRef) {
    const day = readSetUpDay(records, ref);
    if ("date" in ref) {
      for (const block of day.blocks) {
        if (block.rrule === null) {
          journal.removeBlock(block.id);
          continue;
        }
        const existing = records.blockChanges.find(
          (c) => c.blockId === block.id && c.onDate === ref.date,
        );
        journal.put(
          "blockChanges",
          blockChangeRecord.parse({
            ...(existing ?? stamps()),
            updatedAt: stamp(),
            blockId: block.id,
            onDate: ref.date,
            skipped: true,
            startsAt: null,
            endsAt: null,
          }),
        );
      }
      // The date's own items go with it.
      for (const item of records.blockItems.filter(
        (i) => i.onDate === ref.date,
      )) {
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
            ? { ...block, archivedAt: stamp(), updatedAt: stamp() }
            : { ...block, rrule: rule, updatedAt: stamp() },
        ),
      );
    }
  }

  const server: PlannerServer = {
    readWeek(week) {
      return Promise.resolve(readWeek(records, week));
    },

    writeBounds(raw) {
      return write((journal) => {
        const input = parse(dayBoundsInput, raw);
        const weekday = input.weekday ?? null;
        const onDate = input.onDate ?? null;
        const existing = records.dayBounds.find((row) =>
          weekday !== null ? row.weekday === weekday : row.onDate === onDate,
        );
        const row = journal.put(
          "dayBounds",
          dayBoundsRecord.parse({
            ...(existing ?? stamps()),
            updatedAt: stamp(),
            weekday,
            onDate,
            upAt: input.upAt,
            lightsOut: input.lightsOut,
          }),
        );
        if (weekday === null) return { id: row.id };
        // A date with its own bounds keeps them.
        const own = new Set(
          records.dayBounds
            .map((r) => r.onDate)
            .filter((d): d is string => d !== null),
        );
        return { id: row.id, reach: { weekday, changedOn: own } };
      });
    },

    createBlock(raw, scope) {
      return write((journal) => {
        const input = parse(newBlockInput, raw);
        const row = journal.put(
          "blocks",
          blockRecord.parse({
            ...stamps(),
            kind: input.kind,
            name: input.name,
            icon: input.icon ?? null,
            color: input.color ?? null,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            rrule: input.rrule ?? null,
            onDate: input.onDate ?? null,
            fill: input.fill ?? null,
            checklist: input.checklist,
            meal: input.meal,
            notify: input.notify,
            archivedAt: null,
          }),
        );
        return { id: row.id, reach: scope };
      });
    },

    createTransition(raw, scope) {
      return write((journal) => {
        const input = parse(newTransitionInput, raw);
        if (input.placement === "in_block") {
          findBlock(input.blockId);
          const row = journal.put(
            "blockItems",
            blockItemRecord.parse({
              ...stamps(),
              blockId: input.blockId,
              title: input.name,
              icon: input.icon ?? null,
              isTransition: true,
              atTime: input.atTime,
              lengthMin: input.lengthMin,
              meal: input.meal,
              onDate: null,
              sortOrder: input.sortOrder,
            }),
          );
          return {
            id: row.id,
            reach: scope && {
              weekday: scope.weekday,
              changedOn: changedDates(input.blockId),
            },
          };
        }
        const row = journal.put(
          "blocks",
          blockRecord.parse({
            ...stamps(),
            kind: "transition",
            name: input.name,
            icon: input.icon ?? null,
            color: input.color ?? null,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            rrule: input.rrule ?? null,
            onDate: input.onDate ?? null,
            fill: null,
            checklist: input.checklist,
            meal: input.meal,
            notify: input.notify,
            archivedAt: null,
          }),
        );
        return { id: row.id, reach: scope };
      });
    },

    editBlock(raw, scope) {
      return write((journal) => {
        const { id, ...change } = parse(editBlockInput, raw);
        const block = findBlock(id);
        const next = patch(block, { ...change, updatedAt: stamp() });
        // A lone time is checked against the stored other one.
        parse(editBlockInput, {
          id,
          startsAt: next.startsAt,
          endsAt: next.endsAt,
        });
        journal.put("blocks", blockRecord.parse(next));
        return {
          id,
          reach: scope && {
            weekday: scope.weekday,
            changedOn: changedDates(id),
          },
        };
      });
    },

    splitBlock({ id, fromDate, patch: change }) {
      return write((journal) => {
        const block = findBlock(id);
        requireOn(block, fromDate);
        const next = patch(block, change);
        // The patch passes the block's checks, in their words.
        parse(editBlockInput, {
          id,
          ...change,
          startsAt: next.startsAt,
          endsAt: next.endsAt,
        });
        const split = splitInto(journal, records, block, fromDate, change, {
          stamp,
          stamps,
        });
        if (!split.ok) throw new PlannerRefusal("invalid", split.reason);
        return { id: split.id };
      });
    },

    writeBlockChange(raw) {
      return write((journal) => {
        const input = parse(blockChangeInput, raw);
        requireOn(findBlock(input.blockId), input.onDate);
        const existing = records.blockChanges.find(
          (c) => c.blockId === input.blockId && c.onDate === input.onDate,
        );
        const skipped = input.skipped ?? false;
        const row = journal.put(
          "blockChanges",
          blockChangeRecord.parse({
            ...(existing ?? stamps()),
            updatedAt: stamp(),
            blockId: input.blockId,
            onDate: input.onDate,
            skipped,
            startsAt: skipped ? null : (input.startsAt ?? null),
            endsAt: skipped ? null : (input.endsAt ?? null),
          }),
        );
        return { id: row.id };
      });
    },

    writeBlockItem(raw, scope) {
      return write((journal) => {
        const input = parse(blockItemInput, raw);
        const block = findBlock(input.blockId);
        if (input.onDate != null) requireOn(block, input.onDate);
        const row = journal.put(
          "blockItems",
          blockItemRecord.parse({
            ...stamps(),
            blockId: input.blockId,
            title: input.title,
            icon: input.icon ?? null,
            isTransition: input.isTransition,
            atTime: input.atTime ?? null,
            lengthMin: input.lengthMin ?? null,
            meal: input.meal,
            onDate: input.onDate ?? null,
            sortOrder: input.sortOrder,
          }),
        );
        const usual = input.onDate == null && scope;
        return {
          id: row.id,
          reach: usual
            ? { weekday: scope.weekday, changedOn: changedDates(block.id) }
            : undefined,
        };
      });
    },

    editBlockItem(raw, scope) {
      return write((journal) => {
        const { id, ...change } = parse(editBlockItemInput, raw);
        const item = findItem(id);
        const next = patch(item, { ...change, updatedAt: stamp() });
        // The row as it will stand passes the item's checks, in their words.
        parse(blockItemInput, next);
        journal.put("blockItems", blockItemRecord.parse(next));
        const usual = next.onDate === null && scope;
        return {
          id,
          reach: usual
            ? { weekday: scope.weekday, changedOn: changedDates(next.blockId) }
            : undefined,
        };
      });
    },

    removeBlockItem({ id, date }, scope) {
      return write((journal) => {
        const item = findItem(id);
        if (item.onDate !== null || date === undefined) {
          journal.removeItem(id);
          const usual = item.onDate === null && scope;
          return {
            reach: usual
              ? {
                  weekday: scope.weekday,
                  changedOn: changedDates(item.blockId),
                }
              : undefined,
          };
        }
        requireOn(findBlock(item.blockId), date);
        const slot = slotFor(journal, item, date, { skipped: true });
        return { id: slot.id };
      });
    },

    reorderItems({ blockId, ids, date }, scope) {
      return write((journal) => {
        findBlock(blockId);
        const items = ids.map((id) => {
          const item = findItem(id);
          if (item.blockId !== blockId) {
            throw new PlannerRefusal(
              "unknown",
              "That item is not in the block.",
            );
          }
          return item;
        });
        items.forEach((item, index) => {
          if (date === undefined || item.onDate !== null) {
            if (date === undefined && item.onDate !== null) {
              throw new PlannerRefusal(
                "invalid",
                "A date's own item moves on its date.",
              );
            }
            journal.put(
              "blockItems",
              blockItemRecord.parse({
                ...item,
                sortOrder: index,
                updatedAt: stamp(),
              }),
            );
          } else {
            slotFor(journal, item, date, { sortOrder: index });
          }
        });
        return {
          reach:
            date === undefined && scope
              ? { weekday: scope.weekday, changedOn: changedDates(blockId) }
              : undefined,
        };
      });
    },

    placeSlot(raw) {
      return write((journal) => {
        const input = parse(placeSlotInput, raw);
        findBlock(input.blockId);
        if (slotClash(records.slots, input)) {
          throw new PlannerRefusal("duplicate", ALREADY_PLACED);
        }
        const row = journal.put(
          "slots",
          slotRecord.parse({
            ...stamps(),
            blockId: input.blockId,
            onDate: input.onDate,
            skipped: input.skipped ?? false,
            sortOrder: input.sortOrder,
            blockItemId: input.blockItemId ?? null,
            todoId: input.todoId ?? null,
            workItemId: input.workItemId ?? null,
            tier: input.tier ?? null,
            lengthMin: input.lengthMin ?? null,
            tookMin: null,
            doneAt: null,
          }),
        );
        return { id: row.id };
      });
    },

    removeSlot(raw) {
      return write((journal) => {
        const { id } = parse(removeSlotInput, raw);
        if (!records.slots.some((s) => s.id === id)) {
          throw new PlannerRefusal("unknown", "No slot with that id.");
        }
        journal.remove("slots", id);
        return {};
      });
    },

    writeDayEvent(raw, scope) {
      return write((journal) => {
        const { id, ...rest } = raw;
        const input = parse(dayEventInput, rest);
        const existing =
          id === undefined
            ? undefined
            : records.dayEvents.find((event) => event.id === id);
        if (id !== undefined && !existing) {
          throw new PlannerRefusal("unknown", "No event with that id.");
        }
        const row = journal.put(
          "dayEvents",
          dayEventRecord.parse({
            ...(existing ?? stamps()),
            updatedAt: stamp(),
            onDate: input.onDate ?? null,
            rrule: input.rrule ?? null,
            title: input.title,
            icon: input.icon ?? null,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            tag: input.tag,
            notes: input.notes ?? null,
            color: input.color ?? null,
            clientId: input.clientId ?? null,
          }),
        );
        return { id: row.id, reach: input.rrule != null ? scope : undefined };
      });
    },

    copyDay({ from, to }) {
      return write((journal) => {
        const source = readSetUpDay(records, from);
        const target = readSetUpDay(records, to);
        if (source.weekday === target.weekday && source.date === target.date) {
          throw new PlannerRefusal("invalid", "Pick another day to copy.");
        }
        if (source.blocks.length === 0) {
          throw new PlannerRefusal("invalid", "That day has nothing to copy.");
        }
        clearInto(journal, to);

        // A usual weekday's copy starts this week if that date has not begun.
        const start =
          "date" in to
            ? null
            : (reachOf(to.weekday).follows ??
              addDays(thisWeekDates(now(), records.timeZone)[to.weekday]!, 7));
        for (const block of source.blocks) {
          const row = journal.put(
            "blocks",
            blockRecord.parse({
              ...block,
              ...stamps(),
              ...timesOf(block, source.changes),
              rrule:
                "date" in to ? null : weeklyRule(start as string, to.weekday),
              onDate: "date" in to ? to.date : null,
              archivedAt: null,
            }),
          );
          // D-USE-87: a Work block copies as time only.
          if (block.kind === "work") continue;
          for (const item of source.items.filter(
            (i) => i.blockId === block.id,
          )) {
            journal.put(
              "blockItems",
              blockItemRecord.parse({
                ...item,
                ...stamps(),
                blockId: row.id,
                onDate: null,
              }),
            );
          }
        }
        return { reach: "date" in to ? undefined : { weekday: to.weekday } };
      });
    },

    clearDay(ref) {
      return write((journal) => {
        if (readSetUpDay(records, ref).blocks.length === 0) {
          throw new PlannerRefusal("invalid", "That day has nothing to clear.");
        }
        clearInto(journal, ref);
        return { reach: "date" in ref ? undefined : { weekday: ref.weekday } };
      });
    },

    resetDay(ref) {
      return write((journal) => {
        if (!("date" in ref)) {
          throw new PlannerRefusal("invalid", "Only a date resets to usual.");
        }
        const { date } = ref;
        for (const change of records.blockChanges.filter(
          (c) => c.onDate === date,
        )) {
          journal.remove("blockChanges", change.id);
        }
        for (const slot of records.slots.filter(
          (s) => s.onDate === date && s.skipped,
        )) {
          journal.remove("slots", slot.id);
        }
        for (const item of records.blockItems.filter(
          (i) => i.onDate === date,
        )) {
          journal.removeItem(item.id);
        }
        // [ASSUMPTION] Blocks made for the date alone, and its own bounds, are its own changes too.
        for (const block of records.blocks.filter(
          (b) => b.rrule === null && b.onDate === date,
        )) {
          journal.removeBlock(block.id);
        }
        for (const row of records.dayBounds.filter((r) => r.onDate === date)) {
          journal.remove("dayBounds", row.id);
        }
        return {};
      });
    },

    undo(token) {
      return log.undo(token);
    },
  };
  return server;
}
