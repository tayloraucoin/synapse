---
target: specs/web/ux/day/block-view/states/checklist-editing.md
status: approved
promoted:
boards:
  - name: "block-view / sunday checklist, editing / 402 / light"
    page: "USE — set up"
    at: [3374, 3780]
    note: "Frame @ x 3374, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/checklist-editing-402.png
rulings:
  [
    D-USE-17,
    D-USE-24,
    D-USE-28,
    D-USE-33,
    D-USE-39,
    D-USE-81,
    D-USE-83,
    D-USE-84,
    D-USE-87,
  ]
---

# Block view — the Sunday checklist, editing

The usual Sunday's checklist block opened from Set my days at 21:10: a checklist with no times (refinement 10, N2: "Sunday is often one Checklist block"). `?state=checklist-editing`. Its note is "Frame" at x 3374, y 4710.

## What shows, top to bottom

- **Status bar:** 21:10.
- **Breadcrumb:** "‹ Sunday › Checklist" (the day, then "Checklist", not the block's name).
- **Header:** the leaf bar (`category-leaf-dot`), "Sunday" (title) over "All day · Checklist · every Sunday" (label, muted): the span, the kind of block, the scope. Trailing: "Done" (plain text button) beside the round ··· .
- **The switch row**, a hairline under it: "Checklist, no times" (label, semibold) and "On" (muted) on the left; a `Switch`, on, at the trailing edge.
- **Rows**, 56 px on hairlines, no rail, no times, no lengths, no checkboxes: the item's icon in a 24 px slot, the name, a grip at the trailing edge: 🛒 "Groceries", 🧺 "Laundry", 🪴 "Water the plants", 🥡 "Meal prep", 🧹 "Tidy the flat", 🗓️ "Plan the week" [placeholder items, the daily-use page's ones].
- **The add row:** "+ Add to the checklist" (muted).
- **"Set a time"**, an outlined button (36 px, a clock icon leading).
- Under it (label, muted): "Sits in the All day strip above the rail. A time puts it on the rail, boxes kept." Then "[placeholder items]" (caption, subtle).
- No "Free until", no end line, no peek: a checklist has no span.

## What the person can do

- Drag a grip to reorder (D-USE-17); with no times, nothing re-flows.
- Type in the add row: Return adds the item at the end with no length [ASSUMPTION: a checklist item takes no length while "Checklist, no times" is on; D-USE-81's 5 minutes applies once it has a span].
- Swipe a row left to remove, with Undo, as [`editing-monday.md`](editing-monday.md) [ASSUMPTION: not drawn here].
- Tap an item: the Item sheet ([`../../item-sheet/index.md`](../../item-sheet/index.md)).
- **Set a time:** gives the block a span and puts it on the rail; the boxes are kept (D-USE-28) [ASSUMPTION: it opens a Starts and Ends pair as the New block sheet's checklist does, [`../../../set-my-days/new-block-sheet/states/checklist.md`](../../../set-my-days/new-block-sheet/states/checklist.md)].
- **The switch off:** the same as Set a time [ASSUMPTION: turning "Checklist, no times" off asks for a span, and the rows gain rail times and lengths].
- **Done** or "‹ Sunday": back to Set my days on Sunday. ···: the block's menu as [`editing-monday.md`](editing-monday.md).

Every change reaches every Sunday ("every Sunday"; D-USE-33's reach as [`editing-monday.md`](editing-monday.md)).

## Where it shows on the day

With no span the checklist sits in the "All day" strip above the rail with a Checklist tag (D-USE-28), drawn on Schedule ([`../../schedule/states/checklist-day.md`](../../schedule/states/checklist-day.md)); tapping the strip opens this block from the day, with checkboxes.

## Words

"Checklist" (breadcrumb, header); "All day · Checklist · every Sunday"; "Checklist, no times", "On"; "Add to the checklist"; "Set a time"; "Sits in the All day strip above the rail. A time puts it on the rail, boxes kept."

## The notes on the boards

**"block-view / sunday checklist, editing / 402 / light"**, note "Frame" @ x 3374, y 4710:

> New · Sunday checklist, editing
>
> No rail, no times, no lengths: icon, name and grip. "Checklist, no times" on at the top. Set a time gives it a span and puts it on the rail, boxes kept (D-USE-28); without one it sits in the All day strip. Items are the daily-use page's [placeholder] ones.

## Rulings

- D-USE-28: a checklist with no span sits in an "All day" strip above the rail with a Checklist tag; Set a time keeps the boxes.
- D-USE-17: the grip. Open-4 "Set my days, step 9 round 3" draws this frame ("The Sunday checklist has no rail, times or lengths, with 'Checklist, no times' on and Set a time to put it on the rail").
- Decided (D-USE-84) **Done in the editing header.** Every frame of this row draws "Done" beside ···; step 3's `block-view / editing, Monday / 402 / light` draws ··· alone (D-USE-24: Edit and Done belong to the from-the-day mode). Default, as drawn on this later row: Done goes back to Set my days, as the breadcrumb does.
- Decided (D-USE-87) **The breadcrumb's leaf** reads "Checklist" while the title reads "Sunday". Default, as drawn: a checklist block's breadcrumb names its kind.

## Widths

Drawn at: 402. Not drawn at: 1024 and wider; at 1024 Set my days is list-detail (D-USE-83) [ASSUMPTION: Block view opens in the day pane, as `editing-monday.md`]; otherwise scales up (D-USE-39).

## Criteria

| ID                                   | When                                                    | Then                                                                                                                   | Evidence                             |
| ------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| C-USE-block-view-checklist-editing-1 | A checklist block with no span is opened in Set my days | No rail, times or lengths: icon, name and grip per row; "Checklist, no times" on; "All day · Checklist · every Sunday" | `captures/checklist-editing-402.png` |
| C-USE-block-view-checklist-editing-2 | Set a time is used                                      | The block takes a span and moves from the All day strip onto the rail, every item kept                                 | test                                 |
| C-USE-block-view-checklist-editing-3 | No span                                                 | The block shows in the All day strip above the rail with a Checklist tag, on every Sunday                              | test                                 |
