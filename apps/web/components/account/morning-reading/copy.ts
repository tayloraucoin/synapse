/**
 * Settings › Morning reading's words (USE-151; ux/account/morning-reading/
 * words-and-access.md), as drawn. No second person, no counts, no red. The
 * menu, toast and dialog lines are USE-152's; the sheets' are USE-153's.
 */
export const MORNING_READING_COPY = {
  title: "Morning reading",
  back: "Settings",
  backLabel: "Back to Settings",
  passages: "Passages",
  passagesLine: "Orient shows them in this order. Hold the grip to move one.",
  addPassage: "Add a passage",
  links: "Links",
  linksLine: "Shown under the reading, in this order.",
  addLink: "Add a link",
  off: "Off",
  offLine: "Not in the morning reading. Turn one on to bring it back.",
  turnOn: "Turn on",
  delete: "Delete",
  edit: "Edit",
  passagesEmpty:
    "Nothing to read yet. A passage added here shows on Orient each morning.",
  linksEmpty:
    "No links yet. A playlist or a page added here shows under the reading.",
  failed: "Passages and links didn’t load.",
  failedDetail: "Orient still shows what was saved.",
  offline:
    "Offline. The reading shows as last saved; changes wait for a connection.",
  /** The grip, ··· and the Off buttons, named in full (Access). */
  move: (title: string) => `Move ${title}`,
  more: (title: string) => `More for ${title}`,
  turnOnRow: (title: string) => `Turn on ${title}`,
  deleteRow: (title: string) => `Delete ${title}`,
  /** The row menu (row-menu.md; USE-152). */
  moveUp: "Move up",
  moveDown: "Move down",
  turnOff: "Turn off",
  turnOffLine: "Leaves Orient, kept under Off",
  /** After a move, the place in words, never a count (Access [PROPOSED]). */
  movedUp: "Moved up",
  movedDown: "Moved down",
  movedAfter: (verb: string, title: string) => `${verb}, now after ${title}`,
  movedFirst: (verb: string) => `${verb}, now first`,
  /** The toast after Turn off (off-undo.md); untitled is [PROPOSED]. */
  offToast: (title: string | null) =>
    title === null
      ? "That passage is off. Orient no longer shows it."
      : `“${title}” is off. Orient no longer shows it.`,
  /** The delete confirm (delete-confirm.md; D-USE-125); untitled is [PROPOSED]. */
  deleteTitle: (title: string | null) =>
    title === null ? "Delete this passage?" : `Delete “${title}”?`,
  deleteBody:
    "It goes for good, words and all, and can’t be brought back. Left off, it stays here to turn on later.",
  keepIt: "Keep it",
} as const;
