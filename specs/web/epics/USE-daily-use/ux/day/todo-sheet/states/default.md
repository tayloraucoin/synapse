---
target: specs/web/ux/day/todo-sheet/states/default.md
status: approved
promoted:
boards:
  - name: "todo-sheet / default / 402 / light"
    page: "USE — set up"
    at: [0, 8820]
    note: "Frame @ x 0, y 9750"
    capture: specs/web/epics/USE-daily-use/ux/day/todo-sheet/captures/default-402.png
rulings: [D-USE-3, D-USE-35, D-USE-37, D-USE-69]
---

# To-do sheet — default

"Call the mechanic" [placeholder] opened from its row in the tray on Review the day at 6:58. `?state=default`.

## What shows, top to bottom

- Behind the scrim, Review the day: "‹ Orient", "Monday, 12 October", the tray closed ("To-dos" "Call the mechanic…", chevron down), the 7 o'clock line with "Orient · 5 min", Wellness "7:05 to 8:00" (Pee and weigh, Water, Start the cold bath, "+2 more"), Training "8:00 to 8:57" ("Drive to the YMCA", "Workout: gym").
- The sheet from about y 350 of 874, grabber centred.
- Header: × left; ··· right.
- Scope line: "To-dos · in the tray, no day yet".
- Title row: the icon tile (📞 on a pale tile, rounded square, 44 px) and "Call the mechanic".
- **Type:** "📞 Call" in a bordered select with a chevron.
- **Repeats:** "Does not repeat" in a bordered select with a chevron.
- **Reminder:** label, sub-line "Off"; the `Switch` off.
- **Notes:** label; a bordered `Textarea` holding "[Dave at Northside Auto, 555-0142]" and "[Ask about the brake noise and a quote]".
- Footer line, muted: "Changes save as they're made. It waits in the tray until it's done or a To-dos block takes it."
- No primary button.

## What the person can do

- The icon tile opens the icon picker (`../../../interactions/icon-picker/`).
- Type opens `type-open.md`; Repeats opens `repeats-open.md`; the switch turns on `reminder-on.md` (or, where reminders cannot arrive, the row is `not-installed.md` or `notifications-off.md`).
- Notes take free text and autogrow; [PROPOSED] a phone number or link in them is tappable (calls or opens it).
- ··· opens `more-open.md`. × or a drag down closes. Each change saves as made.

## Words

As the surface's Words (`../words-and-access.md`); this state's footer is above.

## The notes on the boards

**todo-sheet / default / 402 / light** (Frame @ x 0, y 9750):

> Default
>
> Title with its icon (the tile opens the step 11 icon picker), then Type and Repeats as shadcn selects, Reminder as a switch, each a 56 px row, then Notes (round 2, Taylor: somewhere to keep the number). Notes autogrow; [PROPOSED] a phone number or link in them is tappable. Edited in place, no primary. [PROPOSED] Type is a select here, not chips: one row, the same as Repeats.

## Rulings

- D-USE-3: the sheet holds the title, icon and the reminder field N4 names.
- D-USE-35: every to-do has Notes.
- D-USE-37: the To-do sheet rounds 1 and 2 approved as drawn; [PROPOSED] marks stand (Type as a select; tappable numbers and links).
- Superseded, not specced: `todo-sheet / where and repeats / 402 / light` ("USE — set up", Archive, x 2892, y 11340): a "New to-do" sheet with Type as chips (Home, Errand, Call, Digital, Other), then Length ("45 min"), Day ("No day yet"), Repeats ("Does not repeat"), Reminder ("None") and an "Add to-do" button, for "Sort the pantry". Its note read: "To-do sheet (new, round 2) / [PROPOSED] Type (Home, Errand, Call, Digital, Other) and Repeats join the to-do. Type is for finding it; any To-dos block can take it." Replaced by this sheet's Type select (D-USE-37; the row label: "To-do sheet with Where: Type replaced it"). Its Day row is ··· › Give it a day… here (`more-open.md`). Its Length row: Decided (D-USE-69), a to-do has no length on this sheet, as drawn at step 11.

## Widths

Drawn at: 402. At the desk: the right-side panel (`../index.md` › Platforms, D-USE-39).

## Criteria

| ID                         | When                              | Then                                                                                                 | Evidence                   |
| -------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-todo-sheet-default-1 | A to-do row in the tray is tapped | The sheet opens: scope line, icon and title, Type, Repeats, Reminder, Notes, footer line; no primary | `captures/default-402.png` |
| C-USE-todo-sheet-default-2 | Any field changes                 | It saves at once; no Save button                                                                     | manual                     |
