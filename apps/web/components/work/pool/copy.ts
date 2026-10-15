/**
 * The pool panel's words (USE-74; ux/work/week/pool-panel.md, pool-rows.md,
 * states/pool-empty.md). Row words are printed by `poolView`.
 */
export const POOL_PANEL_COPY = {
  pool: "Pool",
  linear: "Linear",
  tabs: "Pool or Linear",
  group: "Group:",
  groupName: (choice: string) => `Group: ${choice}`,
  sort: "Sort:",
  sortName: (choice: string) => `Sort: ${choice}`,
  search: "Search the pool",
  orderLine: "Clients in your order. Drag a client to reorder.",
  collapse: (name: string) => `Collapse ${name}`,
  expand: (name: string) => `Expand ${name}`,
  newItem: "+ New item in the pool",
  syncNow: "Sync now",
  syncing: "Syncing",
  spread: "Spread…",
  spreadName: (title: string) => `Spread ${title}`,
  empty: "Nothing in the pool. Bring work in from Linear, or add an item.",
  fromLinear: "From Linear",
  // [ASSUMPTION] The snapshot holds only Taylor's open issues, so both filters read on.
  assignedTo: (name: string) => (name ? `Assigned to ${name}` : "Assigned"),
  notDone: "Not done",
  filters: "Filters",
  noMatch: "Nothing matches in the pool or Linear.",
  clients: "Clients",
  poolFailed: "The pool didn't load. Nothing in it is lost.",
  loading: "Loading the pool",
} as const;
