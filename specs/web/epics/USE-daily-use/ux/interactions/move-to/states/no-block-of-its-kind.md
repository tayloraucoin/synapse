---
target: specs/web/ux/interactions/move-to/states/no-block-of-its-kind.md
status: approved
promoted:
boards:
  - name: "item-sheet / move to, pick a day, no block of its kind / 402 / light"
    page: "USE — set up"
    at: [2410, 6300]
    note: "Frame @ x 2410, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/interactions/move-to/captures/no-block-of-its-kind-402.png
rulings: [D-USE-37, D-USE-103]
---

# Move to — Pick a day, no block of its kind

Saturday 24 tapped: a day that follows the usual Saturday, not set yet, with no Wellness block.

## What shows, top to bottom

- As `pick-a-day.md`, with 24 picked (filled ink disc; no dot, since it is not set).
- The consequence row has a dashed left edge instead of the kind-colour bar: "Saturday 24 October, no Wellness", muted under it "That day follows the usual Saturday. It waits in the day's to-dos, to place on review."
- The button reads "Move to Saturday"; the line under it as in `pick-a-day.md`.

## What the person can do

- "Move to Saturday" moves the item into that day's to-dos, to be placed when the day is reviewed; Undo in the toast. Nothing is added to the usual week.

## Words

"<Weekday> <d> <Month>, no <block kind>"; "That day follows the usual <Weekday>. It waits in the day's to-dos, to place on review."

## The notes on the boards

**item-sheet / move to, pick a day, no block of its kind / 402 / light** (Frame @ x 2410, y 7230):

> Pick a day, no block of its kind [ASSUMPTION]
>
> A day with no Wellness block (here a Saturday not set yet, following the usual Saturday): the dashed edge and the line say so, and the item waits in that day's to-dos, to be placed when the day is reviewed. Nothing is added to the usual week.

## Rulings

- D-USE-37: "a day with no block of its kind keeps the item in that day's to-dos", approved; the frame's [ASSUMPTION] stands.

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): as at 402 inside the right-side panel.

## Criteria

| ID                                   | When                                             | Then                                                                                                | Evidence                                |
| ------------------------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------- |
| C-USE-move-to-no-block-of-its-kind-1 | A day with no block of the item's kind is picked | A dashed edge and the line say so; the item lands in that day's to-dos; the usual week is unchanged | `captures/no-block-of-its-kind-402.png` |
