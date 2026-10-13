---
target: specs/web/ux/day/block-view/states/edit-dragging.md
status: approved
promoted:
boards:
  - name: "block-view / edit, dragging / 402 / light"
    page: "USE — daily use"
    at: [1928, 6420]
    note: "Note · edit, dragging"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/edit-dragging-402.png
rulings: [D-USE-17, D-USE-24, D-USE-26, D-USE-69]
---

# Block view — Edit, dragging

Edit tapped from the day, "Cold bath" mid-drag. `?state=edit-dragging`. Its note is "Note · edit, dragging" at x 1928, y 7350.

## What shows, top to bottom

As [`success.md`](success.md), except:

- **Header:** "Done" (semibold, ink) in place of "Edit"; ··· hidden while editing.
- **Hint line** under the header (caption, muted): "Drag a grip to reorder. Swipe left to remove. Changes apply to today."
- **Rows** keep their checkboxes; the length moves in to make room for a grip (six dots, muted) at the trailing edge of every row: 7:05 "Pee and weigh" 2 min; 7:07 "Water" 1 min; 7:08 "Start the cold bath" 2 min.
- **The drag:** a 2 px ink drop line under "Start the cold bath"; "Cold bath" lifted under it, inset, with an ink edge, `--color-surface` fill, rounded, no shadow; its rail reads 7:10, the time it will take. "Meditate" moves below it to 7:20.
- The add row at 7:30, "Free until 8:00", "8:00", the Training peek as success.

## What the person can do

- Drag a grip: the row lifts and the drop line follows; the rail shows the time it will take; release re-flows the times, around pinned items (round 8).
- Swipe a row left: Remove, as [`checked-swipe.md`](checked-swipe.md).
- Check items as before.
- "Done": leaves Edit; the grips go.

## Words

"Done"; "Drag a grip to reorder. Swipe left to remove. Changes apply to today."

## The notes on the boards

**"block-view / edit, dragging / 402 / light"**, note "Note · edit, dragging" @ x 1928, y 7350:

> edit, dragging (D-USE-17)
>
> Tap Edit in the header: a grip on every row's trailing edge, a hint line, and Done in place of Edit. Dragging lifts the row (ink edge, surface fill, no shadow) over a drop line, and the rail shows the time it will take (7:10). [PROPOSED] Tap fallback: the row's long-press menu gains Move up and Move down.

## Rulings

- D-USE-17: a visible grip at the trailing edge; the lift with ink edge, surface fill, no shadow, and a drop line; long-press stays the row's menu (Swap, Edit, Not today). D-USE-17 names a grip on every undone row; this frame draws grips on every row while in Edit [ASSUMPTION: a checked row keeps its grip in Edit].
- D-USE-24: in editing, Edit reads Done.
- open-1 (step 3 round 1, drawn): `[PROPOSED]` a tap fallback for reordering: the row's long-press menu gains Move up and Move down (D-USE-17 has only the grip). D-USE-26 rules the same for Now's rows. Decided (D-USE-69), as drawn: Block view's row long-press menu (Swap, Edit, Not today) gains Move up and Move down, as Now's does (D-USE-26); each moves the row one place and re-flows the times.

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39); the grip takes a pointer drag.

## Criteria

| ID                               | When                                 | Then                                                                   | Evidence                         |
| -------------------------------- | ------------------------------------ | ---------------------------------------------------------------------- | -------------------------------- |
| C-USE-block-view-edit-dragging-1 | Edit is tapped                       | Grips show on each row, the hint line shows, Edit reads Done           | `captures/edit-dragging-402.png` |
| C-USE-block-view-edit-dragging-2 | A row is dragged                     | It lifts with no shadow over a drop line; the rail shows its new start | `captures/edit-dragging-402.png` |
| C-USE-block-view-edit-dragging-3 | A row is dropped                     | Times re-flow around pinned items; today only                          | test                             |
| C-USE-block-view-edit-dragging-4 | Move down on a row's long-press menu | It moves one place; times re-flow                                      | test                             |
