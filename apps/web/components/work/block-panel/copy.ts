/**
 * The Block panel's words (USE-76; block-panel/words-and-access.md). Gloss:
 * no second person, no question marks, nothing missed; times and lengths are
 * the only numbers. The header, fit and scope lines are `BLOCK_PANEL_WORDS`
 * (lib/data/block-panel.ts), printed with the view.
 */
export const BLOCK_PANEL_COPY = {
  /** "Work, Tue 13": the panel's region. */
  region: (block: string, day: string) => `${block}, ${day}`,
  /** "Tue 13 › Work". */
  crumb: (day: string, block: string) => `${day} › ${block}`,
  openDay: "Open day",
  openDayName: (weekday: string, day: number) => `Open ${weekday} ${day}`,
  close: (block: string) => `Close ${block} panel`,
  addTo: (name: string) => `+ Add to ${name}`,
  addName: (name: string, day: string) => `Add to ${name}, ${day}`,
  addPlaceholder: "Name",
  swap: "Swap",
  swapName: (title: string) => `Swap ${title}`,
  length: (min: number) => `${min} min`,
  check: (title: string, start: string, length: string) =>
    [title, start, length].filter(Boolean).join(", "),
  edit: "Edit",
  moveUp: "Move up",
  moveDown: "Move down",
  notToday: "Not today",
  /** [ASSUMPTION] On another date the menu's last row is Remove. */
  remove: "Remove",
  more: (title: string) => `More for ${title}`,
  menu: (title: string) => `${title} options`,
  removed: (title: string) => `${title} removed.`,
  moved: (title: string, tier: string) => `${title} moved to ${tier}`,
  added: (title: string, name: string, day: string) =>
    `${title} added to ${name}, ${day}`,
  failed: "This block didn't load.",
  loading: (block: string) => `${block} loading`,
  offline: "Offline. Changes save on this device and sync when back online.",
  empty: (name: string) => `Nothing in ${name} yet.`,
} as const;
