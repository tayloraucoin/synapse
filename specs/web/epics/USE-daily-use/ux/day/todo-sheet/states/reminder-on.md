---
target: specs/web/ux/day/todo-sheet/states/reminder-on.md
status: approved
promoted:
boards:
  - name: "todo-sheet / reminder on / 402 / light"
    page: "USE — set up"
    at: [1446, 8820]
    note: "Frame @ x 1446, y 9750"
    capture: specs/web/epics/USE-daily-use/ux/day/todo-sheet/captures/reminder-on-402.png
rulings: [D-USE-3, D-USE-37, D-USE-69]
---

# To-do sheet — reminder on

The Reminder switch turned on, installed with notifications allowed. `?state=reminder-on`.

## What shows, top to bottom

- The sheet taller by one row (top at about y 292).
- **Reminder:** sub-line now "On: a notification at the time below"; the `Switch` on (ink).
- **At** row, 56 px: "At" on the left; on the right a day `Select` showing "Today" with a chevron, and a `TimeField` "12:30" (outlined, ink edge, focused).
- Notes as in `default.md`.
- Footer line: "Changes save as they're made. If it's checked off before 12:30, the reminder doesn't come."

## What the person can do

- Set the day and the time; both save as made. The tray row then shows the bell and the time.
- The day select's options: Decided (D-USE-69), "Today", "Tomorrow", then "Pick a day…" (the month of Pick a day, `../../../interactions/move-to/states/pick-a-day.md`).
- Turn the switch off: the At row goes and no reminder is sent.
- Check the to-do off before the time: the reminder doesn't come (`../../todos/states/notification.md`).

## Words

"On: a notification at the time below"; "At"; "Today"; "Changes save as they're made. If it's checked off before <time>, the reminder doesn't come."

## The notes on the boards

**todo-sheet / reminder on / 402 / light** (Frame @ x 1446, y 9750):

> Reminder on
>
> The switch brings an At row: a day select (Today) and a TimeField (12:30). Checked off before then, the reminder doesn't come, so a notification never reports a miss. [ASSUMPTION] A to-do with no day reminds on the day picked here.

## Rulings

- D-USE-3: the sheet holds N4's reminder field.
- D-USE-37: approved as drawn; the [ASSUMPTION] stands: a to-do with no day reminds on the day picked here, and stays in the tray with no day.
- Product rule: notifications never report a miss.

## Widths

Drawn at: 402. At the desk: the right-side panel (D-USE-39).

## Criteria

| ID                             | When                                 | Then                                                                   | Evidence                       |
| ------------------------------ | ------------------------------------ | ---------------------------------------------------------------------- | ------------------------------ |
| C-USE-todo-sheet-reminder-on-1 | The switch turns on                  | An At row with a day select and a TimeField; the footer names the time | `captures/reminder-on-402.png` |
| C-USE-todo-sheet-reminder-on-2 | The to-do is checked before its time | No notification is sent                                                | test                           |
