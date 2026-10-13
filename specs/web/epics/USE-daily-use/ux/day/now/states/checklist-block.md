---
target: specs/web/ux/day/now/states/checklist-block.md
status: approved
promoted:
boards:
  - name: "now / checklist block / 402 / light"
    page: "USE — daily use"
    at: [5784, 10200]
    note: "Frame @ x 5784, y 11130"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/checklist-block-402.png
rulings: [D-USE-17, D-USE-28]
---

# Now — Checklist block

A Sunday Checklist block with a span, at 10:20. `?state=checklist-block`. Its note is the "Frame" at x 5784, y 11130.

## What shows, top to bottom

As [`success.md`](success.md), status bar 10:20, with:

- **`BlockHeader`:** leaf bar, "Sunday reset", "10:00 to 13:00 · Checklist [placeholder]", ···.
- **Every item a row, no card:** a box, the name, a grip at the trailing edge; no lengths, no times: Groceries, Laundry, "Water the plants" (checked, faded, no grip), Meal prep, Tidy the flat, Plan the week [placeholder items].
- No add row is drawn [ASSUMPTION: "Add to <Block>" shows as in [`all-done-add-more.md`](all-done-add-more.md) only when all are done].

## What the person can do

- Check in any order; a checked row fades in place and stays live.
- Drag a grip to reorder (D-USE-17); long-press for the row menu ([`row-long-press.md`](row-long-press.md)) [ASSUMPTION].
- No Start: checklist items are not timed [ASSUMPTION].

## The notes on the boards

**"now / checklist block / 402 / light"**, "Frame" @ x 5784, y 11130:

> Checklist block
>
> A Sunday Checklist block [placeholder items]: every undone row has a box and a grip; no lifted card, no lengths or times. Checked in any order, faded in place, reordered by dragging.

## Rulings

- N4's "Checklist block" row (refinement 10). D-USE-28: Checklist is a block's setting; a checklist with no span is the All day strip ([`sunday-checklist.md`](sunday-checklist.md)).

## Widths

Drawn at: 402. Wider: the index's Platforms.

## Criteria

| ID                          | When                         | Then                                                     | Evidence                           |
| --------------------------- | ---------------------------- | -------------------------------------------------------- | ---------------------------------- |
| C-USE-now-checklist-block-1 | A Checklist block is current | Every row a box and a grip; no card, no lengths or times | `captures/checklist-block-402.png` |
| C-USE-now-checklist-block-2 | Rows checked out of order    | Each fades in place; nothing lifts                       | test                               |
