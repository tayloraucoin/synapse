import type { WorkSize, WorkTier } from "@syn/types";

/**
 * From Linear's words (USE-52; add/states/from-linear-by-size.md › Words).
 * "Taylor" is the signed-in person's name, passed in, never "you".
 */
export const FROM_LINEAR_COPY = {
  title: "From Linear",
  close: "Close",
  /** "Mon 12 · Work · Add to Primary". */
  context: (day: string, block: string, tier: string) =>
    `${day} · ${block} · Add to ${tier}`,
  search: "Search Linear issues",
  filters: "Filters",
  assignedTo: (name: string) => (name ? `Assigned to ${name}` : "Assigned"),
  notDone: "Not done",
  size: "Size",
  /** The chip once sizes are picked: "Size: 2 Small, 3 Medium". */
  sizePicked: (words: string) => `Size: ${words}`,
  sizeChoices: "Sizes to show",
  sizes: {
    quick: "1 Quick",
    small: "2 Small",
    medium: "3 Medium",
    large: "5 Large",
    huge: "8 Huge",
  } satisfies Record<WorkSize, string>,
  /** The pool row's word for no estimate (pool-view's "unsized"). */
  unsized: "unsized",
  tiers: {
    urgent: "Urgent",
    primary: "Primary",
    secondary: "Secondary",
    stretch: "Stretch",
  } satisfies Record<WorkTier, string>,
  noClient: "No client",
  /** "ENG-123 · already on Mon 12, in Primary". */
  alreadyOn: (day: string, tier: string | null) =>
    tier === null ? `already on ${day}` : `already on ${day}, in ${tier}`,
  /** "With this, Primary runs to 13:00 at the top of its ranges". */
  runsTo: (tier: string, at: string) =>
    `With this, ${tier} runs to ${at} at the top of its ranges`,
  pastEnd: (block: string, end: string) => `: past ${block}'s end at ${end}.`,
  /** "Secondary and Stretch wait." */
  wait: (tiers: string, many: boolean) =>
    `${tiers} ${many ? "wait" : "waits"}.`,
  /** [ASSUMPTION] Not drawn: Huge has no top (the size dev note). */
  noTop: (tier: string) =>
    `With this, where ${tier} ends isn't known: 8 Huge has no top.`,
  addTo: (tier: string) => `Add to ${tier}`,
  /** The toast: "Added to Primary, Mon 12", with Undo. */
  added: (tier: string, day: string) => `Added to ${tier}, ${day}`,
  notAdded: "Not added. Try again.",
  /** [ASSUMPTION] Not drawn: the filters leave nothing. */
  nothing: "No issues match these filters.",
  noMatch: (query: string) => `Nothing in Linear matches "${query}".`,
  loading: "Loading Linear issues",
  failed: "Linear issues didn't load.",
} as const;
