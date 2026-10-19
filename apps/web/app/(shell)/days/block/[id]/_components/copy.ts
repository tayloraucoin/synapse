/**
 * Block view in editing (USE-49; block-view/by-kind.md and its state files).
 * Gloss: no second person, no count, nothing red; times and lengths are the
 * only numbers. The column's and the kinds' own words are `BLOCK_VIEW_COPY`.
 */
export const BLOCK_EDIT_COPY = {
  backTo: (place: string) => `Back to ${place}`,
  /** A checklist's leaf names its kind (D-USE-87). */
  checklist: "Checklist",
  done: "Done",
  more: (block: string) => `More for ${block}`,
  /** The menu's title: its scope, then the block [ASSUMPTION, editing-monday.md]. */
  menuTitle: (scope: string, block: string) => `${scope}'s ${block}`,
  rename: "Rename",
  renameLabel: "Block name",
  iconAndColour: "Icon and colour",
  notThisWeek: "Not this week",
  /** [PROPOSED] Not this week's Toaster. */
  freed: (block: string, weekday: string) => `${block} freed this ${weekday}.`,
  addTo: (block: string) => `Add to ${block}`,
  addToChecklist: "Add to the checklist",
  remove: "Remove",
  removeName: (item: string) => `Remove ${item}`,
  /** Names the reach (editing-monday.md [ASSUMPTION]). */
  removed: (item: string, scope: string) => `${item} removed ${scope}.`,
  moved: (item: string, time: string) => `${item} moved to ${time}`,
  added: (item: string) => `${item} added.`,
  empty: (block: string) => `Nothing in ${block} yet.`,
  trueBreak: (block: string) => `Nothing in ${block}. A true break.`,
  trueBreakLine:
    "Go mode shows it as rest, with no checklist. Add something only if it helps.",
  lifeLine: (weekday: string) =>
    `The same plan every ${weekday}, set once in the usual week. A week it isn't on: Not this week, on This week, frees the time.`,
  setWorkLine: (weekday: string) =>
    `The same items every ${weekday}, ticked fresh each week. No tiers, nothing to slot in This week.`,
  checklistLine:
    "Sits in the All day strip above the rail. A time puts it on the rail, boxes kept.",
  /** "Nothing after this today" stands in for the peek (Build notes). */
  nothingAfter: "Nothing after this today",
  failed: (block: string) => `${block} didn't load.`,
  failedDetail: "Nothing is lost. The block is still there once it loads.",
  loading: (block: string) => `${block}, loading`,
  offline: "Offline. Changes wait until the connection is back.",
  setTime: {
    title: "Set a time",
    starts: "Starts",
    ends: "Ends",
    save: "Set the time",
    endsAfter: "Ends after it starts.",
  },
  row: {
    swap: "Swap",
    edit: "Edit",
    moveUp: "Move up",
    moveDown: "Move down",
    notToday: "Remove",
    more: (item: string) => `More for ${item}`,
    menu: (item: string) => `${item} options`,
  },
} as const;
