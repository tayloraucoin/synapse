---
target: specs/web/ux/day/todo-sheet/states/more-open.md
status: approved
promoted:
boards:
  - name: "todo-sheet / ··· open, Delete / 402 / light"
    page: "USE — set up"
    at: [2892, 8820]
    note: "Frame @ x 2892, y 9750"
    capture: specs/web/epics/USE-daily-use/ux/day/todo-sheet/captures/more-open-402.png
rulings: [D-USE-37, D-USE-69]
---

# To-do sheet — ··· open

The default sheet with ··· pressed. `?state=more-open`.

## What shows, top to bottom

- `default.md` under the darker scrim; ··· pressed.
- A `DropdownMenu` from ···, right-aligned, over the scope line, title and Type: muted heading "Call the mechanic"; "Give it a day…" (calendar icon); "Mark done" (check icon); a rule; "Delete to-do" (trash icon), in ink, with under it in muted small text "Gone from the tray and any block. Undo in the toast."

## What the person can do

- **Give it a day…:** Decided (D-USE-69), a step inside the sheet with back on the left, showing Pick a day's month (`../../../interactions/move-to/states/pick-a-day.md`); picking a day sets it and returns, the scope line then reading the day, and the to-do sits in that day's tray.
- **Mark done:** checks the to-do, as its box in the tray, and closes the sheet; Undo in the toast [ASSUMPTION]. A repeating one comes back when due (`repeats-open.md`).
- **Delete to-do:** deletes at once, no confirm; the to-do leaves the tray and any block that took it; the toast offers Undo; the sheet closes.
- Tapping outside or Escape closes the menu.

## Words

"<Title>" as the heading; "Give it a day…"; "Mark done"; "Delete to-do"; "Gone from the tray and any block. Undo in the toast."

As built (USE-29), the developer's calls: the month step is titled "Give it a day" from ···, and "Remind on" from the At row's "Pick a day…", with "‹ <Title>" as its back link; the toasts read "<Title> is done." and "<Title> is deleted.", each with Undo. The month is `MonthGrid`: arrow keys move by day and week, Home and End to the week's ends, Page Up and Page Down by month; a past day takes focus but cannot be picked. A Mark done or Delete that does not save leaves the sheet open with "Not saved. Try again." under the scope line, in ink.

## The notes on the boards

**todo-sheet / ··· open, Delete / 402 / light** (Frame @ x 2892, y 9750):

> ··· open, Delete [PROPOSED]
>
> Give it a day…, Mark done, then Delete to-do below a rule, in ink, with its consequence: gone from the tray and any block, Undo in the toast. No confirm, since Undo covers it.

## Rulings

- D-USE-37: approved as drawn; the [PROPOSED] stands. Delete is in ink, not red (no destructive red, as the item sheet's menus).

## Widths

Drawn at: 402. At the desk: the same menu from ··· in the right-side panel (D-USE-39).

## Criteria

| ID                           | When          | Then                                                                                        | Evidence                     |
| ---------------------------- | ------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| C-USE-todo-sheet-more-open-1 | ··· is tapped | The title, Give it a day…, Mark done, a rule, Delete to-do with its consequence, all in ink | `captures/more-open-402.png` |
| C-USE-todo-sheet-more-open-2 | Delete to-do  | No confirm; gone from the tray and any block; Undo restores it                              | manual                       |
