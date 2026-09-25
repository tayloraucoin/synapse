/**
 * StepFrame's geometry, shared with `StepFrameSkeleton` (UX v1.3 R63; DAY-1)
 * so the skeleton and the frame it stands in for cannot drift apart.
 */

/** The frame's column. */
export const STEP_FRAME_ROOT = "flex min-h-0 flex-1 flex-col gap-(--space-5)";

/** The action row, in flow: last in the DOM and on the screen (§2). */
export const STEP_FRAME_ACTIONS = "mt-auto flex items-center justify-end gap-(--space-3)";

/** Pinned: a hairline above, paper behind, the safe area below (v1.2 §4). */
export const STEP_FRAME_ACTIONS_STICKY =
  "bg-paper border-hairline sticky bottom-0 z-10 -mx-(--space-4) border-t px-(--space-4) py-(--space-3) pb-[max(var(--space-3),env(safe-area-inset-bottom))]";
