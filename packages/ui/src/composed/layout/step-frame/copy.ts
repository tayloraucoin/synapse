/**
 * StepFrameSkeleton's one string — UX v1.3 R63, §10.4.
 *
 * The frame's name while it waits. Nothing announces (no live region); the
 * word is what a screen reader hears if it lands on the busy region, and it
 * is the word `Spinner` and `LoadingText` already use.
 */
export const STEP_FRAME_SKELETON_COPY = {
  label: "Loading",
} as const;
