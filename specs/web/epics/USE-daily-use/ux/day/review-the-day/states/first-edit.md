---
target: specs/web/ux/day/review-the-day/states/first-edit.md
status: approved
promoted:
boards:
  - name: "review-day / first-edit / 402 / light"
    page: "USE — daily use"
    at: [964, 3900]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/first-edit-402.png
rulings: [D-USE-60]
---

# Review the day — first change

The first change ever made here, after a swap. Its note is the "Note · success" at x 964, y 4830.

## What shows, top to bottom

As [`success.md`](success.md), with:

- **A line under the header**, above the tray: a full-width band, `--color-surface` fill, a `--color-border` hairline under it, 8 px top and bottom, 20 px sides: "Changes apply to today. Monday's usual stays as it is." (label, `--color-muted-foreground`). The tray and the column move down by its height.
- **Training** reads 8:00 to 8:50, "Workout: gym" swapped for "Yoga" (the drives stay, D-USE-60 (1)).
- No Toaster in this frame: the swap's Undo is drawn in [`after-swap-undo.md`](after-swap-undo.md).

## What happens

- The line shows once, the first time a change is made here, and never again [ASSUMPTION: it stays for the rest of that review and is gone the next morning].
- Any change counts as the first: a swap, an add, a remove, a reorder [ASSUMPTION].

## Words

"Changes apply to today. Monday's usual stays as it is." The weekday follows the day ("Tuesday's usual…"). N3's shorter "Changes apply to today" is replaced by the canvas words.

## The notes on the boards

**"review-day / first-edit / 402 / light"**, "Note · success" @ x 964, y 4830:

> first-edit · after a swap
>
> Workout: gym swapped for Yoga, so Training ends 8:50. The line under the header shows once, the first time: today changes, Monday's usual doesn't.

## Adjusting in place (N3)

Swap from the Item sheet; reorder in the Block view; add with the rail + or a block's own "Add to …"; remove by swiping a band, or an item in the Block view, with Undo. A change here changes today only, never the weekday default (note 18). A long morning of edits never times out.

## Rulings

- N3 edge case: a change here changes today only, never Monday's default (note 18); the quiet line shows once, the first time.
- D-USE-60 (1): swapping a gym workout for one at home leaves the drives; they are removed by hand.

## Widths

Drawn at: 402. Not drawn at the desk: the line spans the capped column under the header (D-USE-39).

## Criteria

| ID                                | When                                         | Then                            | Evidence                      |
| --------------------------------- | -------------------------------------------- | ------------------------------- | ----------------------------- |
| C-USE-review-the-day-first-edit-1 | The first change ever made on Review the day | The line shows under the header | `captures/first-edit-402.png` |
| C-USE-review-the-day-first-edit-2 | Any change                                   | The usual week is unchanged     | test                          |
