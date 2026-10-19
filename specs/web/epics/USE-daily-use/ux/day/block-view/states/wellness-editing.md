---
target: specs/web/ux/day/block-view/states/wellness-editing.md
status: approved
promoted:
boards:
  - name: "block-view / wellness, editing / 402 / light"
    page: "USE — set up"
    at: [1446, 3780]
    note: "Note · grid, 80 @ x 1446, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/wellness-editing-402.png
rulings: [D-USE-17, D-USE-24, D-USE-33, D-USE-81, D-USE-87]
---

# Block view — Wellness, editing (usual week)

The set-up page's redraw of [`editing-monday.md`](editing-monday.md) (step 3, "USE — daily use"), from step 9 round 3: the same block, the same mode, the same actions. This file carries only what the newer frame changes; everything else stands as `editing-monday.md` says. The usual Monday at 21:10. `?state=wellness-editing`. Its note is "Note · grid, 80" at x 1446, y 4710.

## What the newer frame changes

- **Header:** the leaf bar, "Wellness" over "7:05 to 8:00 · every Monday" (the scope moves into the span line); "Done" beside the round ···. No scope or hint line under it: a hairline, then the rows.
- **Icons** on every row, between the rail time and the name (open-4 round 3, "Every item shows its icon wherever it is set"): 7:05 scales "Pee and weigh" 2 min; 7:07 droplet "Water" 1 min; 7:08 shower "Start the cold bath" 2 min; 7:10 meditating figure "Meditate"; 7:20 ice cube "Cold bath" 10 min.
- **A set-time item** (round 8): Meditate is set at 7:10, so its trailing slot holds a clock, not a grip, and its length reads "At 7:10 · 10 min". It cannot be dragged; the others re-flow around it.
- **The add row** carries its rail time, "7:30", then "+ Add to Wellness"; "Free until 8:00" is a dashed region filling to the block's end; "8:00" and its line; the peek "Training · 8:00 to 8:57" with the clay bar.
- Rows keep their heights by length (10-minute rows taller), grips trailing on the rest (D-USE-17).

## What the person can do

As [`editing-monday.md`](editing-monday.md), plus: tap Meditate for the Item sheet's At a set time ([`../../item-sheet/states/at-a-set-time.md`](../../item-sheet/states/at-a-set-time.md)) to change or clear the time; "Done" leaves editing [ASSUMPTION: as the breadcrumb, every change already saved]. A new typed item is 5 min, after the last (D-USE-81).

## Words

"every Monday" (in the span line) · "At 7:10 · 10 min" · "Free until 8:00".

## The notes on the boards

**"block-view / wellness, editing / 402 / light"**, note "Note · grid, 80" @ x 1446, y 4710:

> Wellness block, editing (usual week)
>
> Every item has its icon, a length, a start on the rail and a grip to reorder; times re-flow. Meditate is set at 7:10, so it shows a clock, not a grip, and "At 7:10" (round 8). "every Monday" says this is the usual week. Wellness, Evening and set-work blocks share this view.

## Rulings

- This frame is the later drawing; where it differs from `editing-monday.md` (Done, the scope in the span line, icons, the set-time row, the add row's rail time), it wins [ASSUMPTION: later frame wins]. Decided (D-USE-87) whether `editing-monday.md`'s scope line "Every Monday. Drag a grip to reorder; swipe left to remove." stays as a first-time hint. Default: this frame, no hint line, "every Monday" in the span.
- Wellness, Evening and Set work share this view ([`set-work.md`](set-work.md)); Evening has no frame of its own.
- In This week the span line reads "this Monday only" ([`work-tiers.md`](work-tiers.md)) and reach follows D-USE-33.

## Widths

Drawn at: 402. Wider scales up (D-USE-39); from 1024 as `editing-monday.md` (D-USE-83). At the desk a Schedule block opens its Block panel (D-USE-77), area 7.

## Criteria

| ID                                  | When                                  | Then                                                                                         | Evidence                            |
| ----------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------- |
| C-USE-block-view-wellness-editing-1 | A usual-week Wellness block is opened | "every Monday" in the span, Done and ···, each row with rail time, icon, name, length, grip  | `captures/wellness-editing-402.png` |
| C-USE-block-view-wellness-editing-2 | An item has a set time                | A clock in the grip's place and "At 7:10 · 10 min"; it does not move when others are dragged | `captures/wellness-editing-402.png` |
| C-USE-block-view-wellness-editing-3 | Rows are reordered                    | Times re-flow around the set-time item                                                       | test                                |
