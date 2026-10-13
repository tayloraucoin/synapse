---
target: specs/web/ux/day/now/states/loading.md
status: approved
promoted:
boards: []
not_drawn: "Listed by the intent pass ([FILL] at handoff); no artboard on either Now row. Reopen the canvas, or build from the default below"
rulings: [D-USE-57, D-USE-69]
---

# Now — loading

The active block is on its way.

## What shows

Not drawn. Decided (D-USE-74): as phone Today's, from phone Today's drawn loading (D-USE-57; `../../../work/today/states/loading.md`) and the tray's (D-USE-69):

- The `AppHeader` "Now", the To-dos tray line and `BottomNav` are real at once.
- Under them, still skeleton rows in the block's rhythm: a header bar (name and span), a card-shaped block, then two rows (a box, a title bar). Never shimmering (A-14).
- No spinner; Done and Start do not show until the block arrives.

## What the person can do

The tray and the tabs.

## Rulings

- D-USE-57: phone Today's loading is skeleton rows; Now's other blocks take the same [ASSUMPTION].
- D-USE-69: the tray's loading has no spinner.

## Widths

Not drawn at any width.

## Criteria

| ID                  | When              | Then                                                        | Evidence |
| ------------------- | ----------------- | ----------------------------------------------------------- | -------- |
| C-USE-now-loading-1 | The block is slow | Header, tray and tabs real; still skeleton rows; no spinner | test     |
