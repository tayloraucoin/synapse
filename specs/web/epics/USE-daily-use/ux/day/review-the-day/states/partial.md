---
target: specs/web/ux/day/review-the-day/states/partial.md
status: approved
promoted:
boards: []
not_drawn: "Listed by the intent pass ([FILL] at handoff: the day loads and the to-dos fail, or the reverse); no artboard on either row. Reopen the canvas, or build from the default below"
rulings: [D-USE-69]
---

# Review the day — partial

The day and the to-dos load separately; one arrives and the other fails.

## What shows

Not drawn. Decided (D-USE-69), from the drawn loading and error frames: each region fails on its own, in place.

- **The day loads, the to-dos fail:** the column, the rail + and Ready, go as success; the tray's row reads "To-dos didn't load." with "Try again" [ASSUMPTION: the words follow the error frame's pattern].
- **The to-dos load, the day fails:** the tray as success; the column is the error frame's `RegionRetry` ("The day didn't load.", Try again); Ready, go hidden ([`error.md`](error.md)).

## What the person can do

Try again on the failed region only; everything that loaded stays live.

## Rulings

None; N3 has no partial row. The error frame (no tray drawn) is read as the whole day failing.

## Widths

Not drawn at any width.

## Criteria

| ID                             | When                 | Then                                                  | Evidence |
| ------------------------------ | -------------------- | ----------------------------------------------------- | -------- |
| C-USE-review-the-day-partial-1 | Only the to-dos fail | The day and Ready, go work; the tray offers Try again | test     |
| C-USE-review-the-day-partial-2 | Only the day fails   | The error frame in the column; the tray works         | test     |
