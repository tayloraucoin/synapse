---
target: specs/web/ux/interactions/add-from-the-rail/states/rail-drag.md
status: approved
promoted:
boards:
  - name: "review-day / rail drag / 402 / light"
    page: "USE — daily use"
    at: [2410, 3900]
    note: "Note · rail drag"
    capture: specs/web/epics/USE-daily-use/ux/interactions/add-from-the-rail/captures/rail-drag-402.png
rulings: [D-USE-15, D-USE-18]
---

# Add from the rail — dragging the +

Board branch 2c [PROPOSED]. Holding the + and dragging it down the rail. Its note is "Note · rail drag" at x 2410, y 4830.

## What shows, top to bottom

- Review the day as success (status bar 6:58, header, tray closed, the column from 7).
- **The + becomes the time:** in the gutter at 10:15, a filled ink tag (`--color-foreground`, `--radius-control`) reading "10:15" (label, semibold, `--color-background`), in place of the + and its marks.
- **The line:** solid ink in the rail only, from the tag to the column's edge; then a faint dashed guide across the Work block it falls in (over "[Primary item, linked] · ENG-123"), never a solid line over content.
- The rest of the column (Lunch, the next Work) and Ready, go as success.

## What happens

- The time moves in 15-minute steps as the finger moves [ASSUMPTION: a light haptic tick per step where the platform has one].
- Release opens the add sheet there: [`add-sheet.md`](add-sheet.md).
- Dragging above the first block or below the last stops at the day's edge [ASSUMPTION].
- Letting go back on the +'s own place cancels [ASSUMPTION].

## Words

The time only, "10:15". D-USE-15's longer tag ("10:15 · in Work") is replaced by the canvas: the block is named on the sheet instead.

## The notes on the boards

**"review-day / rail drag / 402 / light"**, "Note · rail drag" @ x 2410, y 4830:

> rail drag · board 2c [PROPOSED]
>
> Holding the + and dragging: the + becomes the time (10:15), in 15-minute steps. Solid only in the rail, a faint dashed guide over the block (D-USE-18). Release opens the add sheet there.

## Rulings

- D-USE-15: drag in 15-minute steps; release opens the sheet there.
- D-USE-18: while dragging the + becomes the time; the line is solid ink in the rail only, then a faint dashed guide.

## Widths

Drawn at: 402. At the desk: the same in the gutter at the column's left, by pointer drag (D-USE-39) [ASSUMPTION].

## Criteria

| ID                                  | When                      | Then                                                                           | Evidence                     |
| ----------------------------------- | ------------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| C-USE-add-from-the-rail-rail-drag-1 | The + is held and dragged | It shows the time in 15-minute steps, solid in the rail, dashed over the block | `captures/rail-drag-402.png` |
| C-USE-add-from-the-rail-rail-drag-2 | Released                  | The add sheet opens at that time                                               | test                         |
