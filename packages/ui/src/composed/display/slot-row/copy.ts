/**
 * SlotRow's words — UX v1.1 §3.11, §12.2. The role captions and *decide in
 * the morning* are v1.1's verbatim; the rest is a label a screen reader hears.
 */
export const SLOT_ROW_COPY = {
  gap: (minutes: number) => `+${minutes}`,
  gapLabel: (minutes: number) => `${minutes} minute gap before`,
  pinnedLabel: (clock: string) => `pinned at ${clock}`,
  decideInTheMorning: "decide in the morning",
  /** *one of* — the group's word (§3.5, §12.2). */
  oneOf: "one of",
  minutes: (minutes: number) => `${minutes} min`,
  /** "meal-prepped 10 · cook it 30": the tab reads the member's length. */
  tab: (title: string, minutes: number) => `${title} ${minutes}`,
} as const;
