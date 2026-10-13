---
target: specs/web/ux/day/item-sheet/states/linear-done.md
status: approved
promoted:
boards:
  - name: "item-sheet / closed in Linear / 402 / light"
    page: "USE — set up"
    at: [2410, 7560]
    note: "Note · item-sheet / closed in Linear"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/linear-done-402.png
rulings: [D-USE-37, D-USE-57, D-USE-103]
---

# Item sheet — closed in Linear

The issue was closed in Linear by someone else, at 10:42, while the item sat on today. `?state=linear-done`.

## What shows, top to bottom

- As `linear-linked.md` at 10:42, with:
- Scope line "Work, 9:30 to 12:00 · Primary · done".
- The status chip: Linear's Done shape (a filled indigo disc with a check) and "Done".
- A line under the Linear line, muted with a check mark: "Done in Linear. Checked off here too, at 10:42."
- The rest of the sheet unchanged and live.

## What the person can do

- The status chip is the way back: any open status unchecks the item here and moves the issue in Linear [ASSUMPTION].
- On Now the row checks with no Toaster [ASSUMPTION].

## Words

"done" in the scope line; "Done in Linear. Checked off here too, at <time>."

## The notes on the boards

**item-sheet / closed in Linear / 402 / light** (Note · item-sheet / closed in Linear):

> item-sheet / closed in Linear
>
> The issue was closed in Linear at 10:42, so the item checks itself: Done in Linear's Done shape, "done" in the scope line, and "Done in Linear. Checked off here too, at 10:42." The way back is the status chip (any open status unchecks it). [ASSUMPTION] On Now the row checks with no Toaster.

## Rulings

- D-USE-37: approved as drawn. Open "Audit gaps": `linear-done`, the status chip as the way back [ASSUMPTION].
- D-USE-57: on the phone's Today, an issue closed in Linear shows done with Reopen [PROPOSED]; here the chip does that job.
- N2: "issue closed in Linear: the item checks itself, with the line 'Done in Linear'".

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                             | When                                   | Then                                                                                            | Evidence                       |
| ------------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------ |
| C-USE-item-sheet-linear-done-1 | The issue closes in Linear             | The item checks itself; the chip reads Done; "Done in Linear. Checked off here too, at <time>." | `captures/linear-done-402.png` |
| C-USE-item-sheet-linear-done-2 | An open status is picked from the chip | The item unchecks here and the issue moves in Linear                                            | manual                         |
