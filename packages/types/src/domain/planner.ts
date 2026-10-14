/**
 * The daily-use epic's stored vocabulary (USE-2): the planner's and Work's
 * column values, spelled as `0012_use_daily` stores them.
 *
 * Each union has one value list in `@syn/constants` (`planner-values.ts`).
 * `@syn/db` builds every pgEnum from that list through `enumValues<Union>()`,
 * so a value missing from either side fails the type-check there. The two
 * packages never import each other; `@syn/db` is where they meet.
 */

import type { BlockKind } from "./domain";

/**
 * The four kinds USE adds to `block_kind` (D-USE-34), by `ADD VALUE` in
 * `0012`, which writes no row with them. Kept out of `BlockKind`, which the
 * old UI's colour and word maps key on; the new shell gives them their own.
 */
export type AddedBlockKind = "wellness" | "life" | "todos" | "evening";

/** Every `block_kind` value: the old kinds and USE's four. */
export type StoredBlockKind = BlockKind | AddedBlockKind;

/**
 * The New block sheet's seven kinds (D-USE-34), in the sheet's order. All are
 * `block_kind` values; a transition outside every block is a `blocks` row of
 * kind `transition`, and the old kinds stay for the old rows.
 */
export type NewBlockKind =
  "wellness" | "training" | "work" | "life" | "todos" | "break" | "evening";

/** Block.fill — set items, Work's tiers for the day, or the To-dos pull rule. */
export type BlockFill = "set_items" | "tasks_for_the_day" | "from_todos";

/** Todo.type — a context on the to-do, never a block filter (D-USE-35). */
export type TodoType = "home" | "errand" | "call" | "digital" | "other";

/** Slot.tier — Work's order for a day (D-USE-31); only on a work item's slot. */
export type WorkTier = "urgent" | "primary" | "secondary" | "stretch";

/** WorkItem.size — null is unsized. */
export type WorkSize = "quick" | "small" | "medium" | "large" | "huge";

/** SlotEvent.kind — the clock's eight events; the clock is derived from them. */
export type SlotEventKind =
  | "started"
  | "paused"
  | "resumed"
  | "prompt_sent"
  | "brought_back"
  | "done"
  | "undone"
  | "day_closed";

/** WorkItem.done_source — marked done here, or closed in Linear. */
export type DoneSource = "synapse" | "linear";

/** Client.color_key — D-USE-95's six. Every tile also carries its letter. */
export type ClientColorKey =
  "rose" | "leaf" | "amber" | "moss" | "slate" | "ink";

/** MealTopic.link_kind — D-USE-28, D-USE-30: one link per topic. */
export type MealLinkKind = "playlist" | "channel" | "search";

/**
 * DayEvent.tag — Add event's Work or Personal (D-USE-42); USE-14's `0013`.
 * 0012's rows read as personal.
 */
export type EventTag = "work" | "personal";
