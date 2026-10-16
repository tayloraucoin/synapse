import type { BlockFill, IconValue } from "@syn/types";
import type { PlannerServer, PlannerWrite } from "@/lib/fixtures/planner";
import { clockWords, isAllDay, weekdayName } from "./set-up-view";
import type { BlockViewItem } from "./use-block-view";
import { nextItemInput } from "./use-planner-writes";

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
 * kind is named where the name is not it: Life's plans and a Work block
 * named for what it holds ("Work · 9:30 to 12:00 · every Tuesday"); a
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
