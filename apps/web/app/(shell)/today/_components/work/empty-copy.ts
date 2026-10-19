/**
 * Today with nothing slotted (USE-82; nothing-planned.md, no-work-slotted.md).
 * No count and no word for missed (C-USE-today-nothing-planned-1): what was
 * left open is offered at its tier, and what is not brought stays in the pool.
 */
export const EMPTY_COPY = {
  /** The desk's start card (D-USE-42). */
  deskTitle: "Nothing set for today yet.",
  deskLead:
    "Drag from the pool into a tier, or start from what was left open last week.",
  leftOpenOn: (weekday: string) => `Left open on ${weekday}`,
  was: (tier: string) => `was ${tier}`,
  addTo: (tier: string) => `Add to ${tier}`,
  addName: (title: string, tier: string) => `Add ${title} to ${tier}`,
  /** [ASSUMPTION] One reads "Add it as it was", three or more "Add all as they were". */
  addAll: (n: number) =>
    n === 1
      ? "Add it as it was"
      : n === 2
        ? "Add both as they were"
        : "Add all as they were",
  planTheWeek: "Plan the week",
  /** The phone's start card (D-USE-56). */
  phoneTitle: "Nothing planned for this block",
  phoneLead: (weekday: string) =>
    `Left open on ${weekday}, at the tier it had:`,
  openThePool: "Open the pool",
  bringIn: "Bring these in",
  notBrought:
    "Anything not brought stays in the pool. Nothing is marked missed.",
  /** No work slotted (D-USE-65). */
  phoneNone:
    "Nothing is slotted for this block yet. Add here, or plan the week in Set my days.",
  deskNone: "Nothing is slotted for today yet. Add here, or plan the week.",
  planTheWeekLine: "Set my days › This week, with the pool",
  /** The tiers' rows. */
  dropHere: "Drop here, or",
  plusAddTo: (tier: string) => `+ Add to ${tier}`,
} as const;
