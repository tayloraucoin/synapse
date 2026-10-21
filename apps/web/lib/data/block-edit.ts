import { SUGGESTED_SEED, type NewBlockKindValue } from "@syn/constants";
import type { BlockFill, IconValue } from "@syn/types";
import {
  clockToMinutes,
  suggestedItems,
  usedBefore,
  type SuggestedItems,
} from "@syn/utils";
import type { PlannerServer, PlannerWrite } from "@/lib/fixtures/planner";
import { clockWords, isAllDay, weekdayName } from "./set-up-view";
import {
  deriveBlockView,
  inOrderOf,
  type BlockView,
  type BlockViewItem,
} from "./use-block-view";
import { nextItemInput } from "./use-planner-writes";
import type { WeekRecords } from "./week-records";

/**
 * Block view in editing (USE-49; block-view/by-kind.md): one block opened
 * from Set my days, on the usual weekday or on This week's date. In the
 * usual week every change is the block's own, for every such weekday, its
 * reach named as Set my days names it (D-USE-33); from This week it is that
 * date's only (C-USE-block-view-kind-3): the date's items, order and skip.
 * The usual block and items are never written from a date.
 */

/** Where the block was opened: the usual weekday (Monday 0) or a date. */
export type BlockEditPlace = { weekday: number } | { date: string };

/** The writes editing makes, as `usePlannerWrites` and the server both take them. */
export type BlockEditServer = Pick<
  PlannerServer,
  | "writeBlockItem"
  | "editBlockItem"
  | "removeBlockItem"
  | "reorderItems"
  | "editBlock"
  | "writeBlockChange"
>;

export function isDated(place: BlockEditPlace): place is { date: string } {
  return "date" in place;
}

/**
 * The scope words in the span line (D-USE-87): "every Monday" in the usual
 * week, "this Thursday" from This week.
 */
export function scopeWords(place: BlockEditPlace, weekday: number): string {
  const name = weekdayName(weekday);
  return isDated(place) ? `this ${name}` : `every ${name}`;
}

/**
 * The header's meta (by-kind.md, Words): "<Kind> · <span> · <scope>". The
 * kind is named where the name is not it: Life's plans, a To-dos block
 * ("To-dos · 10:00 to 12:30 · this Saturday") and a Work block named for
 * what it holds ("Work · 9:30 to 12:00 · every Tuesday"); a
 * checklist with no times reads "All day · Checklist · every Sunday".
 */
export function blockEditMeta({
  kind,
  name,
  startsAt,
  endsAt,
  scope,
}: {
  kind: string;
  name: string;
  startsAt: string;
  endsAt: string;
  scope: string;
}): string {
  if (isAllDay({ startsAt, endsAt })) {
    return ["All day", "Checklist", scope].join(" · ");
  }
  const span = `${clockWords(startsAt)} to ${clockWords(endsAt)}`;
  const named =
    kind === "life"
      ? "Life"
      : // A To-dos block is named for what it is for (USE-50): "To-dos · 10:00 to 12:30".
        kind === "todos"
        ? "To-dos"
        : kind === "work" && name !== "Work"
          ? "Work"
          : null;
  return [named, span, scope].filter(Boolean).join(" · ");
}

/** A checklist with no span (D-USE-28): no rail, no times, no lengths. */
export function isTimeless(block: { startsAt: string; endsAt: string }) {
  return isAllDay(block);
}

/**
 * Rows stretch by length only in Wellness and Evening, as their frames draw
 * them; the round 3 frames of the other kinds sit every row at 56 px
 * [ASSUMPTION].
 */
export function stretchesRows(kind: string): boolean {
  return kind === "wellness" || kind === "evening";
}

/** A suggestion's length when the item used before has none. */
const SUGGESTED_DEFAULT_MIN = 5;

/**
 * The seed's rows shown at most [ASSUMPTION: Taylor asked for "a short
 * list"; the boards draw four and scroll]. A row taken moves the next up.
 */
export const SUGGESTED_SEED_SHOWN = 8;

/**
 * The suggestion list under the add row (USE-156; D-USE-135, D-USE-136):
 * "Used before" from every block of the kind in the week read (a
 * checklist with no times aside), then the kind's seed, nothing already in
 * this block. Null where the kind has no
 * list (Work, To-dos, the old kinds) and on a checklist with no times.
 */
export function blockSuggestions(
  records: Pick<WeekRecords, "days">,
  block: { id: string; kind: string; startsAt: string; endsAt: string },
  inBlock: readonly { title: string }[],
): SuggestedItems<IconValue> | null {
  const seed = SUGGESTED_SEED[block.kind as NewBlockKindValue] ?? [];
  if (seed.length === 0 || isTimeless(block)) return null;
  // A checklist with no times is not a source: its items have no length
  // to offer [ASSUMPTION].
  const blocks = new Map(
    records.days
      .flatMap((day) => day.blocks)
      .filter((b) => !isTimeless(b))
      .map((b) => [b.id, b]),
  );
  const items = new Map(
    records.days.flatMap((day) => day.items).map((i) => [i.id, i]),
  );
  const titles = inBlock.map((row) => row.title);
  const used = usedBefore(
    { blocks: [...blocks.values()], blockItems: [...items.values()] },
    block.kind,
    { inBlock: titles },
  );
  const list = suggestedItems<IconValue>({
    usedBefore: used,
    seed,
    inBlock: titles,
    defaultLengthMin: SUGGESTED_DEFAULT_MIN,
  });
  return { ...list, seed: list.seed.slice(0, SUGGESTED_SEED_SHOWN) };
}

/** The list for one block on a weekday of the week read, as the screen reads it. */
export function suggestionsFor(
  records: WeekRecords,
  blockId: string,
  weekday: number,
): SuggestedItems<IconValue> | null {
  const view = deriveBlockView(records, blockId, weekday, true);
  if (!view) return null;
  return blockSuggestions(
    records,
    {
      id: view.block.block.id,
      kind: view.block.block.kind,
      startsAt: view.block.startsAt,
      endsAt: view.block.endsAt,
    },
    view.items,
  );
}

/**
 * A length step (D-USE-138): 5 min, or 1 min below 5, never under 1. A
 * value off the 5s snaps to the next one: 7 steps up to 10 and down to 5.
 */
export function stepLength(value: number, direction: -1 | 1): number {
  if (direction === 1)
    return value < 5 ? value + 1 : Math.floor(value / 5) * 5 + 5;
  return value <= 5 ? Math.max(1, value - 1) : Math.ceil(value / 5) * 5 - 5;
}

/**
 * The rows with one row's length drafted (USE-157): the stepper's value
 * before it saves, flowed as a saved one would be, so the total and every
 * later rail time follow it. A set-time row keeps its time.
 */
export function withDraftLength(
  view: BlockView,
  shown: readonly BlockViewItem[],
  draft: { id: string; lengthMin: number } | null,
) {
  const items = draft
    ? shown.map((row) =>
        row.id === draft.id ? { ...row, lengthMin: draft.lengthMin } : row,
      )
    : [...shown];
  return inOrderOf(
    { ...view, items },
    items.map((row) => row.id),
  );
}

/** The running total under the header (D-USE-137). */
export interface SpanTotal {
  plannedMin: number;
  spanMin: number;
  /** What is left of the span; 0 once past it. */
  freeMin: number;
  /** Minutes past the span; 0 while it fits. */
  overMin: number;
}

/** Every row's length against the block's span; a row with none counts 0. */
export function spanTotal(
  block: { startsAt: string; endsAt: string },
  rows: readonly { lengthMin: number | null }[],
): SpanTotal {
  const spanMin = clockToMinutes(block.endsAt) - clockToMinutes(block.startsAt);
  const plannedMin = rows.reduce((sum, row) => sum + (row.lengthMin ?? 0), 0);
  return {
    plannedMin,
    spanMin,
    freeMin: Math.max(0, spanMin - plannedMin),
    overMin: Math.max(0, plannedMin - spanMin),
  };
}

/** The writes, each resolving to what its Undo takes. */
export function blockEdits(
  server: BlockEditServer,
  blockId: string,
  place: BlockEditPlace,
) {
  const dated = isDated(place);
  const scope = dated ? undefined : { weekday: place.weekday };
  const date = dated ? place.date : undefined;
  const on = date === undefined ? {} : { date };

  return {
    /** Swipe's Remove: off every such weekday, or skipped on the date. */
    remove: (item: Pick<BlockViewItem, "id">): Promise<PlannerWrite> =>
      server.removeBlockItem({ id: item.id, ...on }, scope),
    /**
     * The inline stepper's save (USE-157): one length write. In the usual
     * week it is every such weekday's; from a date, only the date's own
     * item has a length of its own to write.
     */
    length: (
      item: Pick<BlockViewItem, "id">,
      lengthMin: number,
    ): Promise<PlannerWrite> =>
      server.editBlockItem({ id: item.id, lengthMin }, scope),
    /** The whole order after a drop or a Move. */
    reorder: (ids: string[]): Promise<PlannerWrite> =>
      server.reorderItems({ blockId, ids, ...on }, scope),
    /** The add row (D-USE-81): 5 min, after the last, with its icon if picked. */
    add: (
      title: string,
      items: readonly Pick<BlockViewItem, "sortOrder">[],
      icon: IconValue | null = null,
      lengthMin: number | null = 5,
    ): Promise<PlannerWrite> =>
      server.writeBlockItem(
        {
          ...nextItemInput({ blockId, title, items, date }),
          lengthMin,
          ...(icon === null ? {} : { icon }),
        },
        scope,
      ),
    /**
     * The block's own fields: the Meal switch, the fill, a span for a
     * checklist, a name or icon. The usual week's only: a date has no
     * columns for them yet (USE-88).
     */
    editBlock: (patch: {
      name?: string;
      icon?: IconValue | null;
      meal?: boolean;
      fill?: BlockFill;
      startsAt?: string;
      endsAt?: string;
    }): Promise<PlannerWrite> =>
      server.editBlock({ id: blockId, ...patch }, scope),
    /** Not this week (D-USE-87): the date freed, the usual untouched. */
    notThisWeek: (onDate: string): Promise<PlannerWrite> =>
      server.writeBlockChange({ blockId, onDate, skipped: true }),
  };
}

export type BlockEdits = ReturnType<typeof blockEdits>;
