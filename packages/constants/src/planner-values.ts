/**
 * The daily-use epic's value lists (USE-2): the one spelling of each new enum
 * `0012_use_daily` creates. `@syn/db` builds every pgEnum from these lists
 * through `enumValues<Union>()`, against the unions in `@syn/types`
 * (`domain/planner.ts`), and the validators read the same lists.
 *
 * `@syn/constants` may not import `@syn/types`, so the `as const` tuples carry
 * the literals; `@syn/db`, which may import both, is where they are proved to
 * agree. The block kinds are in `block-kinds.ts` (`NEW_BLOCK_KINDS`).
 */

/** Block.fill. */
export const BLOCK_FILLS = [
  "set_items",
  "tasks_for_the_day",
  "from_todos",
] as const;

/** Todo.type, in the To-do sheet's order (D-USE-35). */
export const TODO_TYPES = [
  "home",
  "errand",
  "call",
  "digital",
  "other",
] as const;

/** Slot.tier, highest first (D-USE-31). */
export const WORK_TIERS = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
] as const;

/** WorkItem.size, smallest first. */
export const WORK_SIZES = [
  "quick",
  "small",
  "medium",
  "large",
  "huge",
] as const;

/** SlotEvent.kind: the clock's eight events. */
export const SLOT_EVENT_KINDS = [
  "started",
  "paused",
  "resumed",
  "prompt_sent",
  "brought_back",
  "done",
  "undone",
  "day_closed",
] as const;

/** WorkItem.done_source. */
export const DONE_SOURCES = ["synapse", "linear"] as const;

/** Client.color_key: D-USE-95's six. */
export const CLIENT_COLOR_KEYS = [
  "rose",
  "leaf",
  "amber",
  "moss",
  "slate",
  "ink",
] as const;

/** MealTopic.link_kind. */
export const MEAL_LINK_KINDS = ["playlist", "channel", "search"] as const;

/** DayEvent.tag: Add event's Work or Personal (D-USE-42); USE-14's `0013`. */
export const EVENT_TAGS = ["work", "personal"] as const;
