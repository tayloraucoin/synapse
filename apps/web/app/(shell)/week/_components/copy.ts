/**
 * The Week's words (USE-72; ux/work/week/words-and-access.md). The grid's
 * own words (heads, meta, due, Fits) are printed by `deriveWeekView`.
 */
export const WEEK_COPY = {
  title: "Plan the week",
  previous: "Previous week",
  next: "Next week",
  lens: "Lens",
  priority: "Priority",
  time: "Time",
  today: "Today",
  todayMark: "today",
  events: "Events",
  fits: "Fits",
  noWorkBlocks: "No work blocks",
  openDay: (weekday: string) => `Open ${weekday}`,
  matrix: (range: string) => `Week of ${range}, by tier`,
  loading: "Loading the week",
  weekFailed: "The week didn't load. Nothing placed is lost.",
  offline:
    "Offline. Everything works here; Linear catches up when back online.",
  announceWeek: (range: string) => `Week of ${range}`,
  announceLens: (lens: string) => `Lens: ${lens}`,
  // The Time lens (USE-73; states/time-lens.md).
  timeGrid: (range: string) => `Week of ${range}, by time`,
  hour: (minutes: number) => `${Math.floor(minutes / 60)}:00`,
  /** A chip's hover title: the tier word with the colour (D-USE-101). */
  chipTitle: (title: string, tier: string) => `${title} · ${tier}`,
  // Placing from the pool (USE-75; interactions/place-from-the-pool).
  addTo: (tier: string) => `+ Add to ${tier}`,
  addName: (weekday: string, tier: string) => `Add to ${weekday}, ${tier}`,
  addTitle: (weekday: string, tier: string) => `Add to ${weekday} · ${tier}`,
  /** The Block panel's add row (USE-76): "Add to Primary, Tue 13". */
  addPanelName: (tier: string, day: string) => `Add to ${tier}, ${day}`,
  addSearch: "Search the pool and Linear",
  poolGroup: "Pool",
  linearGroup: "Linear, not in the pool yet",
  addNewItem: (query: string) => `+ New item "${query}"`,
  /** [ASSUMPTION] Nothing matches what is typed; the new item still offers. */
  addNoMatch: "Nothing in the pool or Linear matches.",
  undoName: (line: string) => `Undo: ${line}`,
  phoneLine: "The Week is at the desk. On the phone the week is planned in",
  phoneLink: "Set my days › This week",
} as const;
