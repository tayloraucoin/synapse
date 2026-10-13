---
target: specs/web/ux/day/item-sheet/states/loading.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page. N/A: the sheet opens on the item already on screen and has nothing to load; Linear fields show their last-synced values (D-USE-65)"
rulings: [D-USE-65]
---

# Item sheet — loading

`?state=loading`.

## What shows

Not drawn. N/A (D-USE-65). The sheet opens from a row or bullet already on screen, so its own fields are there at once. Linear-linked fields (status, priority, assignee, description) show their last-synced values, and a background refresh that changes one shows the new value in place with no spinner. A Linear search that is still loading (`linear-search.md`) uses `SkeletonRow`s under the tabs [ASSUMPTION: the area's loading pattern, D-USE-57's "loading as skeleton rows" on Today].

## Rulings

None rules this state. The intent pass left it `[FILL]` at handoff; the audit of 2026-10-10 (Open, `open-7.md`) left "every [FILL]-at-handoff loading, partial and offline row" to this pass.

## Widths

Not drawn at any width; the default holds at every width.

## Criteria

| ID                         | When            | Then                                                                              | Evidence |
| -------------------------- | --------------- | --------------------------------------------------------------------------------- | -------- |
| C-USE-item-sheet-loading-1 | The sheet opens | Its fields render at once from the item on screen, with no spinner over the sheet | manual   |
