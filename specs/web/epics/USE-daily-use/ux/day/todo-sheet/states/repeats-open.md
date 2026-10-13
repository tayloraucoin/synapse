---
target: specs/web/ux/day/todo-sheet/states/repeats-open.md
status: approved
promoted:
boards:
  - name: "todo-sheet / Repeats open / 402 / light"
    page: "USE — set up"
    at: [964, 8820]
    note: "Frame @ x 964, y 9750"
    capture: specs/web/epics/USE-daily-use/ux/day/todo-sheet/captures/repeats-open-402.png
rulings: [D-USE-37, D-USE-40]
---

# To-do sheet — Repeats open

The Repeats select tapped on `default.md`, on Monday the 12th. `?state=repeats-open`.

## What shows, top to bottom

- The default sheet under the darker scrim.
- A `Select` list opening above the trigger, right-aligned: "Does not repeat" (selected: muted fill, check), "Every day", "Every week, on Monday", "Every month, on the 12th", a rule, "Custom…" with a chevron right; under the list, inside it, muted small text: "A repeat comes back to the tray when it's due, after this one is done."

## What the person can do

- Pick an option: it saves at once and the trigger shows it ("Every week, on Monday").
- **Custom…** opens the custom recurrence as a step inside the sheet, back on the left [ASSUMPTION: as the icon picker]. Its rules are the Repeats select's, not respecified here: Open "Repeats, framing round 5" (`../../open/open-5-cont.md`; every N days, weeks, months or years; chosen weekdays; monthly by date or nth weekday; ends Never, On a date, After N times; one RRULE), drawn for blocks on the New block sheet (area 5).
- A repeating to-do, once checked, comes back to the tray on its next due date, as a new to-do; the done one stays done [ASSUMPTION: the record keeps each one].

## Words

"Does not repeat"; "Every day"; "Every week, on <weekday>"; "Every month, on the <ordinal>"; "Custom…"; "A repeat comes back to the tray when it's due, after this one is done." The weekday and date come from the to-do's day, or today when it has none [ASSUMPTION].

## The notes on the boards

**todo-sheet / Repeats open / 402 / light** (Frame @ x 964, y 9750):

> Repeats open [PROPOSED]
>
> Does not repeat, Every day, Every week on Monday, Every month on the 12th, Custom… (step 10's custom recurrence). Its consequence under the list: a repeat comes back to the tray when it's due, after this one is done.

## Rulings

- D-USE-37: approved as drawn; the [PROPOSED] stands. This closes, for the to-do sheet, Open's "`day/todo-sheet.md` gains Type and Repeats, in the form Taylor picks" (the New block sheet's half is area 5's).
- D-USE-40: daily body reminders are repeating to-dos with a set time (Kegels at the desk, `../../../work/today/`).
- The to-do's list is shorter than the block's (no Annually, no Every weekday): as drawn; Custom… reaches the rest.

## Widths

Drawn at: 402. At the desk: the same list in the right-side panel (D-USE-39).

## Criteria

| ID                              | When                                 | Then                                                                  | Evidence                        |
| ------------------------------- | ------------------------------------ | --------------------------------------------------------------------- | ------------------------------- |
| C-USE-todo-sheet-repeats-open-1 | Repeats is tapped on Monday the 12th | The five options as drawn and the consequence line                    | `captures/repeats-open-402.png` |
| C-USE-todo-sheet-repeats-open-2 | A weekly to-do is checked            | It comes back to the tray on its next due day, after this one is done | test                            |
