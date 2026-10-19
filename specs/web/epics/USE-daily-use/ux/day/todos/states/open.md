---
target: specs/web/ux/day/todos/states/open.md
status: approved
promoted:
boards:
  - name: "now / tray open / 402 / light"
    page: "USE — daily use"
    at: [964, 12720]
    note: "Frame @ x 964, y 13650"
    capture: specs/web/epics/USE-daily-use/ux/day/todos/captures/open-402.png
rulings: [D-USE-26, D-USE-56, D-USE-69]
---

# To-dos tray — open

Now at 7:14 in Wellness, the tray opened from its header. Drawn on Now; carried here (`../index.md`). Also the **carried** state: an unchecked to-do from an earlier day, "From Sunday". `?state=open`; `?state=carried` renders the same frame.

## What shows, top to bottom

- Now's header: "Now", the avatar "T".
- The trigger row: "To-dos", a chevron up on the right.
- Rows, each 44 px or more: a `Checkbox`, the to-do's icon (line icon, muted), the title, and on the right:
  - "Call the mechanic", phone icon, a small bell and "10:00" muted.
  - "Library books [placeholder]", bag icon, "From Sunday" muted: carried from Sunday, unchecked.
- "+ Add a to-do", muted, as the last row; a hairline under the tray.
- The Wellness block pushed down: "Wellness" "7:05 to 8:00", ···; Pee and weigh, Water, Start the cold bath checked and faded; the lifted card "Meditate" "10 min · 7:10" with Start and Done; "Cold bath" "10 min". The tab bar.

## What the person can do

- **Check a to-do:** it saves at once, on the phone first when offline (`offline.md`). A checked to-do: Decided (D-USE-69), it stays in the tray checked and faded, and live (uncheck undoes), until the day ends, then leaves; a repeating one comes back when it's next due (`../../todo-sheet/states/repeats-open.md`).
- **Tap a row** (outside the box): the To-do sheet opens (`../../todo-sheet/`).
- **Add a to-do:** the row turns into an input; Return adds the title as a new to-do with no day, no reminder, Does not repeat, and the type a new to-do starts with (`../../todo-sheet/states/type-open.md`, default Other), and keeps the input open for the next.
- **Close:** the header row.

## Words

"To-dos"; "Add a to-do"; "From <weekday>" for a carried to-do (a date past a week [ASSUMPTION]: "From 3 Oct"); the reminder time in `figure`.

## The notes on the boards

**now / tray open / 402 / light** (Frame @ x 964, y 13650):

> tray open
>
> The tray opens in place and pushes the block down; the block stays live. Rows: box, icon, title, then a bell and time when reminded. [PROPOSED] A carried to-do reads "From Sunday": quiet, but traceable.

## Rulings

- D-USE-26: a carried to-do reads "From Sunday" (the [PROPOSED] is decided).
- N4: "An unchecked to-do carries to tomorrow's tray, quietly." N3: never a count.
- Row order: Decided (D-USE-69), to-dos with a reminder first by time, then the rest oldest first (as drawn: the 10:00 reminder, then Sunday's).
- Row icon: the tray draws a line icon (a phone) where the To-do sheet's tile shows the 📞 emoji. Decided (D-USE-69), the row shows the to-do's own icon as set on the sheet, one icon per to-do.

## Widths

Drawn at: 402. At the desk see `../index.md` › Platforms (D-USE-39, D-USE-40).

## Criteria

| ID                 | When                                     | Then                                                                                        | Evidence                |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------- |
| C-USE-todos-open-1 | The tray opens                           | Rows with box, icon, title, bell and time or "From <weekday>", then "Add a to-do"; no count | `captures/open-402.png` |
| C-USE-todos-open-2 | A to-do is checked                       | It saves at once and the block below is untouched                                           | manual                  |
| C-USE-todos-open-3 | An unchecked to-do from Sunday on Monday | It sits in Monday's tray reading "From Sunday"                                              | test                    |
