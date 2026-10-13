---
target: specs/web/ux/day/now/states/all-done-add-more.md
status: approved
promoted:
boards:
  - name: "now / all done, add more / 402 / light"
    page: "USE — daily use"
    at: [3856, 10200]
    note: "Frame @ x 3856, y 11130"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/all-done-add-more-402.png
rulings: [D-USE-30, D-USE-69, D-USE-72]
---

# Now — all done, add more

A done block with time left. `?state=all-done-add-more`. Its note is the "Frame" at x 3856, y 11130.

## What shows, top to bottom

As [`all-done-start-next.md`](all-done-start-next.md), status bar 7:34, with:

- "Took 10 min · Change" under Cold bath, Change underlined in ink.
- **An add row** under a hairline: a + (muted), "Add to Wellness" (body), "Free until 8:00" (label, muted) at the trailing edge.
- The footer as all done: "Wellness complete", "Next: Training, 8:00", Start Training.

## What the person can do

- **Add to Wellness:** the add sheet preset to the block [ASSUMPTION: `../../../interactions/add-from-the-rail/states/add-sheet.md`]. Adding an item un-completes the block and the footer gives way to the new item's card. Decided (D-USE-72).
- The row shows only while the block has time left (D-USE-30) [ASSUMPTION: gone once the block's end has passed].
- Start Training; everything else as all done.

## Words

"Add to <Block>" · "Free until <block end>" (D-USE-69's "Free until" words for unused time).

## The notes on the boards

**"now / all done, add more / 402 / light"**, "Frame" @ x 3856, y 11130:

> all done, add more [PROPOSED]
>
> A done block keeps "Add to Wellness" with "Free until 8:00" while the block has time. Adding an item un-completes the block and the footer gives way to the new item's card.

## Rulings

- D-USE-30: a done block keeps an add row while it has time.
- Decided (D-USE-72): adding to a done block un-completes it (open-2's feedback round).

## Widths

Drawn at: 402. Wider: the index's Platforms.

## Criteria

| ID                            | When                    | Then                                                                    | Evidence                             |
| ----------------------------- | ----------------------- | ----------------------------------------------------------------------- | ------------------------------------ |
| C-USE-now-all-done-add-more-1 | All done with time left | "Add to <Block>" with "Free until <end>" above the footer               | `captures/all-done-add-more-402.png` |
| C-USE-now-all-done-add-more-2 | An item is added        | The block un-completes; the new item lifts in the card; the footer goes | test                                 |
