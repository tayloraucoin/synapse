---
target: specs/web/ux/day/review-the-day/states/tray-open.md
status: approved
promoted:
boards:
  - name: "review-day / tray-open / 402 / light"
    page: "USE — daily use"
    at: [1928, 3900]
    note: "Note · tray-open"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/tray-open-402.png
rulings: [D-USE-26, D-USE-39]
---

# Review the day — tray open

The To-dos tray opened on Review the day (board branch 2a). The tray itself (its rows, reminders, the To-do sheet) is carried by `../../todos/` and `../../todo-sheet/`; this file carries how Review the day makes room for it. Its note is "Note · tray-open" at x 1928, y 4830.

## What shows, top to bottom

- Header as [`success.md`](success.md).
- **The tray, open**, in place under the header: "To-dos" (label, semibold) with a chevron up; rows on `--h-target`, each a `Checkbox`, a muted icon, the title and, when set, a bell and the reminder time at the trailing edge: "Call the mechanic" (phone icon) with "10:00"; "[Placeholder to-do]" (a second icon). Then "+ Add a to-do" (muted). A hairline closes the tray.
- **The column**, pushed down below the tray, unchanged: Orient, Wellness, Training 8:00 to 8:57 with "Workout: gym", Breakfast, Work. Nothing covers the day.
- The rail + and Ready, go as success.

## What the person can do

- Check a to-do; tap a row for the To-do sheet; "Add a to-do" stays one tap (`../../todos/`).
- Tap the tray's heading to close it; the column moves back up.
- Everything on the column stays live.

## Words

The tray's own (`../../todos/`). Never a count.

## The notes on the boards

**"review-day / tray-open / 402 / light"**, "Note · tray-open" @ x 1928, y 4830:

> tray-open · board 2a
>
> The To-dos tray opens in place and pushes the column down; nothing covers the day. A reminder shows its time with a bell. Add a to-do stays one tap.

## Rulings

- N3: the tray is a `Collapsible` pinned under the header; per the product rule it never shows a count.
- D-USE-26: an empty tray holds only "Add a to-do".
- D-USE-39: at the desk the tray stays a disclosure at the top of the column; a side pane was weighed and not taken.

## Widths

Drawn at: 402. At the desk: the same disclosure, the width of the capped column (D-USE-39).

## Criteria

| ID                               | When                 | Then                                                | Evidence                     |
| -------------------------------- | -------------------- | --------------------------------------------------- | ---------------------------- |
| C-USE-review-the-day-tray-open-1 | The tray is opened   | It pushes the column down; nothing overlaps the day | `captures/tray-open-402.png` |
| C-USE-review-the-day-tray-open-2 | Any number of to-dos | No count shows                                      | `captures/tray-open-402.png` |
