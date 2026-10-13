---
target: specs/web/ux/account/settings/states/loading.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page"
rulings: [D-USE-57]
---

# Settings › Connections — loading

`?state=loading`.

## What shows

Not drawn. [ASSUMPTION] The header and section titles render at once; the calendar, workspace and client rows show as skeleton rows of the same 52 px height until they load (D-USE-57's "loading as skeleton rows" for Today, followed here), so nothing jumps. A Google calendar list fetched fresh from Google shows its last known rows meanwhile when Synapse has them.

## Rulings

None rules this state for Connections; D-USE-57's skeleton rows are the pattern borrowed.

## Widths

Not drawn at any width; the same at every width.

## Criteria

| ID                       | When                              | Then                                                              | Evidence |
| ------------------------ | --------------------------------- | ----------------------------------------------------------------- | -------- |
| C-USE-settings-loading-1 | Connections opens before its data | Skeleton rows hold each section's place; no spinner over the page | capture  |
