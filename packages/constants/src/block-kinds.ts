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
 */

export const BLOCK_KINDS = [
  "orient",
  "morning",
  "training",
  "prep",
  "work",
  "break",
  "activity",
  "wind_down",
] as const;

export type BlockKindValue = (typeof BLOCK_KINDS)[number];

/** The kinds a person orders; the two placeable kinds are absent by design. */
export const DEFAULT_BLOCK_ORDER = [
  "orient",
  "morning",
  "prep",
  "work",
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
