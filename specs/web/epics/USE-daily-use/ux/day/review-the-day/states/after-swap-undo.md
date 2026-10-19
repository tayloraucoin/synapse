---
target: specs/web/ux/day/review-the-day/states/after-swap-undo.md
status: approved
promoted:
boards:
  - name: "review-day / after swap, undo / 402 / light"
    page: "USE — daily use"
    at: [1446, 3900]
    note: "Note · after swap"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/after-swap-undo-402.png
rulings: [D-USE-12, D-USE-25, D-USE-60]
---

# Review the day — after a swap, with Undo

Where the Item sheet's Swap lands: a row picked in the library closes the sheet onto the day. The swap itself (the library, its rows, "Ends 8:50") is the Item sheet's: [`../../item-sheet/states/swap.md`](../../item-sheet/states/swap.md) and [`swap-empty.md`](../../item-sheet/states/swap-empty.md); not restated here. Its note is "Note · after swap" at x 1446, y 4830.

## What shows, top to bottom

As [`success.md`](success.md), with:

- **Training** 8:00 to 8:50: "Drive to the YMCA", "Yoga" (clay dot), "Drive home".
- **The rail +** moves to the freed time, beside Training's end at 8:50.
- **A Toaster** above Ready, go, full width less 20 px each side, `--color-foreground` fill, `--radius-control`: "Swapped for Yoga. Training ends 8:50." (label, `--color-background`) and "Undo" (semibold, underlined) at the trailing edge.
- The Toaster and Ready, go float on the fade (D-USE-25): the column passes under them (Lunch shows through at the foot).
- The first-change line ([`first-edit.md`](first-edit.md)) is not drawn here; it shows too on the first change.

## What the person can do

- **Undo** puts "Workout: gym" back and Training's end at 8:57; the Toaster goes.
- The Toaster leaves on its own [ASSUMPTION: the house Toaster timing].
- Everything else as success.

## Words

"Swapped for <item>. <Block> ends <time>." · "Undo".

## The notes on the boards

**"review-day / after swap, undo / 402 / light"**, "Note · after swap" @ x 1446, y 4830:

> after a pick, with Undo · round 2 (D-USE-25)
>
> Yoga in place, Training 8:00 to 8:50; the rail + moves to the freed 8:50. The Toaster and Ready, go float on a fade into the screen's background (light or dark), so the column passes under them. [NEEDS DECISION] Yoga is at home, yet the YMCA drives stay. Default: removed by hand; later, "Remove the drives too".

## Rulings

- D-USE-60 (1) closes the note's [NEEDS DECISION]: the drives stay and are removed by hand. "Remove the drives too" in the Toaster stays a later round, not built.
- D-USE-12: the Swap rows name where the block ends, so the Toaster's "ends 8:50" is no surprise.
- D-USE-25: the footer and Toaster float on a fade from transparent to the background token.

## Widths

Drawn at: 402. Not drawn at the desk: the Toaster sits above Ready, go at the column's foot (D-USE-39) [ASSUMPTION: right-aligned with Ready, go].

## Criteria

| ID                                     | When                                  | Then                                                                                    | Evidence                           |
| -------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-review-the-day-after-swap-undo-1 | A row is picked in Swap               | The day shows the new item and the block's new end, with a Toaster naming both and Undo | `captures/after-swap-undo-402.png` |
| C-USE-review-the-day-after-swap-undo-2 | Undo                                  | The old item and end return                                                             | test                               |
| C-USE-review-the-day-after-swap-undo-3 | A gym workout swapped for one at home | The drives stay                                                                         | test                               |
