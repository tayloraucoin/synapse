/**
 * The phone's pool sheet's words (USE-79; ux/work/this-week/
 * pool-sheet-anatomy.md, words-and-access.md and its states). Row metas are
 * printed by `poolSheetView`. Never "you": the person is named.
 */
export const POOL_SHEET_COPY = {
  title: "Pool",
  close: "Close",
  tabs: "Pool or From Linear",
  pool: "Pool",
  fromLinear: "From Linear",
  connectLinear: "Connect Linear",
  allClients: "All clients",
  size: "Size",
  dueDate: "Due date",
  filterName: (filter: string, value: string) => `${filter}: ${value}`,
  searchGlyph: "Search the pool",
  assignedTo: (name: string) => (name ? `Assigned to ${name}` : "Assigned"),
  notDone: "Not done",
  syncNow: "Sync now",
  syncing: "Syncing…",
  place: "Place",
  placeName: (title: string) => `Place ${title}`,
  foot: "Place puts it on a day and a tier. Tap the row itself for its sheet. The client filter narrows this list only, never the days.",
  // Search (pool-search.md).
  searchField: "Search the pool and Linear",
  cancel: "Cancel",
  searchScope: "In the pool and in Linear",
  noMatch: "Nothing called that. New task with this title",
  // The filter sheets (client-filter.md; Size and Due date [ASSUMPTION]).
  client: "Client",
  clientFoot:
    "Narrows the pool only. The days keep every client's work. In the order set in Settings › Clients.",
  any: "Any",
  dueThisWeek: "Due this week",
  dueToday: "Due today",
  // [ASSUMPTION] Filters that leave nothing say so under the filters.
  filteredOut: "Nothing here with these filters.",
  linearNothing: "Nothing open in Linear.",
  // Not connected (linear-not-connected.md).
  notConnected: "Linear isn't connected",
  notConnectedLine: (name: string) =>
    `Connect a workspace to pull in the issues assigned to ${name || "this account"}. Each workspace connects on its own; clients stay off unless turned on.`,
  openSettings: "Open Settings › Connections",
  // Pool empty (pool-empty.md).
  empty: "Nothing in the pool",
  emptyLine:
    "Work saved for later lands here, and anything left open at a day's end. Every item in Linear is one tab over.",
  newTask: "New task",
  failed: "The pool didn't load. Nothing in it is lost.",
  loading: "Loading the pool",
} as const;
