/**
 * Block view from the day (USE-48; block-view/words-and-access.md and the
 * state files). Gloss: no second person, no count, nothing red, nothing
 * says missed. The column's own words are `BLOCK_VIEW_COPY`.
 */
export const BLOCK_DAY_COPY = {
  /** The crumb's place: "Today" (from Now, Review the day, Schedule). */
  today: "Today",
  backTo: (place: string) => `Back to ${place}`,
  edit: "Edit",
  done: "Done",
  hint: "Drag a grip to reorder. Swipe left to remove. Changes apply to today.",
  more: (block: string) => `More for ${block}`,
  /** The menu's title: its scope, then the block. */
  menuTitle: (block: string) => `Today's ${block} only`,
  rename: "Rename",
  iconAndColour: "Icon and colour",
  deleteBlock: "Delete block",
  renameLabel: "Block name",
  deleteTitle: (block: string) => `Delete today's ${block}?`,
  deleteBody: (block: string, weekday: string) =>
    `Today's ${block} only. ${weekday}'s usual ${block} stays.`,
  deleteConfirm: "Delete block",
  keep: "Keep it",
  deleted: (block: string) => `Today's ${block} deleted.`,
  addTo: (block: string) => `Add to ${block}`,
  addPlaceholder: "Item name",
  remove: "Remove",
  removeName: (item: string) => `Remove ${item}`,
  removed: (item: string) => `${item} removed.`,
  notSaved: (item: string) => `${item} not saved. Try again.`,
  moved: (item: string, time: string) => `${item} moved to ${time}`,
  failed: (block: string) => `${block} didn't load.`,
  /** [placeholder] as Review the day's reassurance line (error.md). */
  failedDetail: "Nothing is lost. The checklist is still there once it loads.",
  loading: (block: string) => `${block}, loading`,
  offline: "Offline. Checks are saved on this phone and sync later.",
  empty: (block: string) => `Nothing in ${block} yet.`,
  /** Monday 0, as `weekdayIndex` counts: the confirm names the usual day. */
  weekdays: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
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
