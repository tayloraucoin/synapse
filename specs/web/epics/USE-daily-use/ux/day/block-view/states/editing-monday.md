---
target: specs/web/ux/day/block-view/states/editing-monday.md
status: approved
promoted:
boards:
  - name: "block-view / editing, Monday / 402 / light"
    page: "USE — daily use"
    at: [2410, 6420]
    note: "Note · editing, Monday"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/editing-monday-402.png
rulings: [D-USE-17, D-USE-24]
---

# Block view — editing Monday's default

The editing mode: Wellness opened from Set my days, the usual Monday, at 20:14. `?state=editing-monday`. Its note is "Note · editing, Monday" at x 2410, y 7350.

## What shows, top to bottom

- **Status bar:** 20:14.
- **Breadcrumb:** "‹ Monday › Wellness".
- **Header:** the leaf bar, "Wellness" over "7:05 to 8:00"; ··· alone at the trailing edge (no Edit: this mode is always editing).
- **Scope line** (caption, muted): "Every Monday. Drag a grip to reorder; swipe left to remove." Then a hairline.
- **Rows**, no checkboxes: rail time, the name, the length, a grip at the trailing edge: 7:05 "Pee and weigh" 2 min; 7:07 "Water" 1 min; 7:08 "Start the cold bath" 2 min; 7:10 "Meditate" 10 min; 7:20 "Cold bath" 10 min (taller rows).
- The add row at 7:30 "+ Add to Wellness", "Free until 8:00", "8:00" and its line, the Training peek, as success.

## What the person can do

- Drag a grip to reorder; times re-flow around pinned items (round 8).
- Swipe a row left to delete, with a `Toaster` offering "Undo" (N2) [ASSUMPTION: the same Remove and toast as [`removed-undo.md`](removed-undo.md), naming the usual Monday].
- Type in the add row: Return adds the item, 5 minutes, after the last (N2).
- Tap an item: the Item sheet ([`../../item-sheet/index.md`](../../item-sheet/index.md)) [ASSUMPTION: in editing its changes reach every Monday, and its footer says so].
- ···: Rename, Icon and colour, Delete block (N2) [ASSUMPTION: titled "Every Monday's Wellness", as the day's menu is titled with its scope; not drawn].
- "‹ Monday": back to Set my days on Monday.

Every change applies to every Monday from now [ASSUMPTION: a usual-week change reaching this week names its reach, as Set my days does (D-USE-33)].

## Words

"Every Monday. Drag a grip to reorder; swipe left to remove."

## The notes on the boards

**"block-view / editing, Monday / 402 / light"**, note "Note · editing, Monday" @ x 2410, y 7350:

> editing · Monday's default (N2)
>
> From Set my days: "Monday › Wellness", no checkboxes, a grip on every row, swipe to delete with Undo. The line under the header says the change is for every Monday. The menu holds Rename, Icon and colour, Delete block.

## Rulings

- N2 "Block view, editing": breadcrumb, `BlockHeader` with the menu, drag handles, swipe to delete with Undo, the add row.
- D-USE-17: the grip and lift. D-USE-24: Edit and Done belong to the from-the-day mode; here ··· stands alone.
- The kinds' editing views (Work tiers, Training, Break, checklist, Life, To-dos) are the area 5 thread's ([`../index.md`](../index.md) › To come).

## Widths

Drawn at: 402. Not drawn at: 1024 and wider; at 1024 Set my days is list-detail (D-USE-39 (3)) [ASSUMPTION: Block view opens in the day pane in place of the day]; otherwise scales up.

## Criteria

| ID                                | When                             | Then                                                                                       | Evidence                          |
| --------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------- |
| C-USE-block-view-editing-monday-1 | A block is tapped in Set my days | "‹ Monday › Wellness", no checkboxes, grips on every row, the "Every Monday." line         | `captures/editing-monday-402.png` |
| C-USE-block-view-editing-monday-2 | A row is moved or removed        | The usual Monday changes; how far it reaches into this week follows Set my days (D-USE-33) | test                              |
