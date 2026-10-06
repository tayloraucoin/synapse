/**
 * The block kinds — UX v1.1 §3.1, in the default order a day reads in.
 *
 * `@syn/constants` sits beside `@syn/types` in the layer graph and may not
 * import it, so the tuple below carries the literal types itself (the same
 * arrangement `NOTIFICATION_CATALOGUE` uses). `BlockKind` in `@syn/types`
 * spells the same eight strings; `@syn/db`'s `block_kind` enum is checked
 * against that union, and this tuple is what the seed, the block order
 * default, and the starter library key on.
 *
 * TRAINING AND BREAK HAVE NO FIXED PLACE. They are placed per day at the
 * quick-pick (v1.1 §3.7), which is why `DEFAULT_BLOCK_ORDER` is six kinds, not
 * eight: the order a person edits in Settings → Block order never contains a
 * kind whose position is decided each morning.
 *
 * UX v1.3 R48, §3.1, TD-25 (DAY-3): a ninth kind, `transition` — the
 * after-work hand-off, one per day, forward from the end of work. It sits
 * after `work` in the order a person edits. Sleep is not a kind.
 */

export const BLOCK_KINDS = [
  "orient",
  "morning",
  "training",
  "prep",
  "work",
  "break",
  "transition",
  "activity",
  "wind_down",
] as const;

export type BlockKindValue = (typeof BLOCK_KINDS)[number];

/**
 * The block kinds' words — UX v1.1 §3.1, §6.1, §12.2. One source for the
 * band header, the block header and a push's title (DYN-20): the default
 * name a block shows when the day's block has no template name of its own.
 *
 * UX v1.3 §1, §3.1, §12.4 (DAY-3): *Getting ready* for `prep`, *After work*
 * for `transition`, *Free time* for `activity` — the words the primer
 * teaches and every later screen uses.
 */
export const BLOCK_KIND_WORDS: Record<BlockKindValue, string> = {
  orient: "Orient",
  morning: "Morning",
  training: "Training",
  prep: "Getting ready",
  work: "Work",
  break: "Break",
  transition: "After work",
  activity: "Free time",
  wind_down: "Wind-down",
};

/**
 * The kinds a person orders; the two placeable kinds are absent by design.
 * `transition` follows `work` (v1.3 §11.5). An order stored before it existed
 * lacks it; `orderBlocks` puts it after work, and `blockOrderSchema` accepts
 * an order with or without it.
 */
export const DEFAULT_BLOCK_ORDER = [
  "orient",
  "morning",
  "prep",
  "work",
  "transition",
  "activity",
  "wind_down",
] as const satisfies ReadonlyArray<BlockKindValue>;

/** Placed each morning into one of the day's open spans (v1.1 §3.7). */
export const PLACEABLE_KINDS = ["training", "break"] as const satisfies ReadonlyArray<BlockKindValue>;

/** Where a training or break block can go — v1.1 §3.7, in the chip row's order. */
export const TRAINING_PLACEMENTS = [
  "before_morning",
  "after_morning",
  "inside_work",
  "after_work",
  "in_break",
] as const;

export type TrainingPlacementValue = (typeof TRAINING_PLACEMENTS)[number];
