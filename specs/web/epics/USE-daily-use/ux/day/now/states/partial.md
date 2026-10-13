---
target: specs/web/ux/day/now/states/partial.md
status: approved
promoted:
boards: []
not_drawn: "Listed by the intent pass ([FILL] at handoff: the block loads and the tray fails); no artboard on either Now row. Reopen the canvas, or build from the default below"
rulings: [D-USE-57, D-USE-69]
---

# Now — partial

The block and the to-dos load separately; one arrives and the other fails.

## What shows

Not drawn. Each region fails on its own, in place, as Review the day's partial (D-USE-69):

- **The block loads, the tray fails:** the block as success; the tray's row reads "To-dos didn't load. Try again." in ink (D-USE-69, the tray's failed list; `../../todos/states/error.md`).
- **The tray loads, the block fails:** Decided (D-USE-74): the tray as success; under the header `RegionRetry` as phone Today's error (D-USE-57; `../../../work/today/states/error.md`), "Today didn't load.", "Timers that were running keep their time; nothing is lost.", Try again.

## What the person can do

Try again on the failed region only; what loaded stays live.

## Rulings

- D-USE-69: partial fails region by region, in place (ruled for Review the day; carried here [ASSUMPTION]).
- D-USE-57: phone Today's load error.

## Widths

Not drawn at any width.

## Criteria

| ID                  | When                 | Then                                           | Evidence |
| ------------------- | -------------------- | ---------------------------------------------- | -------- |
| C-USE-now-partial-1 | Only the to-dos fail | The block works; the tray offers Try again     | test     |
| C-USE-now-partial-2 | Only the block fails | `RegionRetry` under the header; the tray works | test     |
