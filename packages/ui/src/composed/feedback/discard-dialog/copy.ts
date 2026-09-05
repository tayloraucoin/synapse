/**
 * DiscardDialog's strings — v2 handoff §5.3.
 *
 * "Keep editing" is first and "Discard" second, and neither is destructive:
 * losing an unsaved draft is a normal outcome, not a deletion, and the red
 * token belongs to exactly one surface (official spec §9.3).
 */
export const DISCARD_DIALOG_COPY = {
  title: "Discard changes?",
  keepEditing: "Keep editing",
  discard: "Discard",
} as const;
