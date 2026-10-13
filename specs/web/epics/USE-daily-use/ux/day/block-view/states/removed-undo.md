---
target: specs/web/ux/day/block-view/states/removed-undo.md
status: approved
promoted:
boards:
  - name: "block-view / removed, undo / 402 / light"
    page: "USE — daily use"
    at: [964, 6420]
    note: "Note · removed, undo"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/removed-undo-402.png
rulings: [D-USE-8]
---

# Block view — removed, undo

"Start the cold bath" removed from today. `?state=removed-undo`. Its note is "Note · removed, undo" at x 964, y 7350.

## What shows, top to bottom

As [`success.md`](success.md), except:

- The rows: 7:05 "Pee and weigh" 2 min; 7:07 "Water" 1 min; 7:08 "Meditate" 10 min; 7:18 "Cold bath" 10 min. All unchecked.
- The add row moves up to 7:28; "Free until 8:00" grows to fill; "8:00" and its line stay put.
- A `Toaster` over the foot, where the Training peek was: ink fill, "Start the cold bath removed." (body, `--color-primary-foreground`) and "Undo" (semibold, underlined) at the trailing edge.

## What the person can do

- "Undo" within the toast's few seconds: the item comes back in its place and the times flow back.
- Anything else, as success; the toast goes on its own.

## Words

"<item> removed." with "Undo" ("Start the cold bath removed.").

## The notes on the boards

**"block-view / removed, undo / 402 / light"**, note "Note · removed, undo" @ x 964, y 7350:

> removed, undo
>
> The row goes and the times after it re-flow (Meditate 7:10 to 7:08). A Toaster offers Undo for a few seconds. Today only; Monday's default keeps it.

## Rulings

- N3 "Remove … with Undo"; the times re-flow (round 8: around pinned items).
- Today only: the weekday's usual is unchanged (the item sheet's footer says the same for its edits, D-USE-60).
- [ASSUMPTION] the toast's length is the app's usual `Toaster` timing; "a few seconds" is all the board says.

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                              | When                           | Then                                                                            | Evidence                        |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------------------------- | ------------------------------- |
| C-USE-block-view-removed-undo-1 | Remove is tapped               | The row goes, later items move up by its length, and a toast names it with Undo | `captures/removed-undo-402.png` |
| C-USE-block-view-removed-undo-2 | Undo is tapped                 | The item and times return as before                                             | test                            |
| C-USE-block-view-removed-undo-3 | Monday's usual is opened after | The item is still in it                                                         | test                            |
