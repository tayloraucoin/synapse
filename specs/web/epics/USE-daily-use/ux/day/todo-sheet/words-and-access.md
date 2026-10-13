---
target: specs/web/ux/day/todo-sheet/words-and-access.md
status: approved
promoted:
---

# To-do sheet — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss. Strings the same in every state; state-only strings (the footer variants, the Reminder lines) sit in each state file. No second person; times and dates are the only numbers.

- Scope line: "To-dos · in the tray, no day yet".
- Rows: "Type", "Repeats", "Reminder" (sub-line "Off" or "On: a notification at the time below"), "At", "Notes".
- Types: "Home", "Errand", "Call", "Digital", "Other". Repeats: "Does not repeat", "Every day", "Every week, on <weekday>", "Every month, on the <ordinal>", "Custom…".
- Footer, default: "Changes save as they're made. It waits in the tray until it's done or a To-dos block takes it."
- Menu: "Give it a day…", "Mark done", "Delete to-do", "Gone from the tray and any block. Undo in the toast."
- Notes take Taylor's words; the placeholders on the board ("[Dave at Northside Auto, 555-0142]") are `[placeholder]` data. An empty Notes box shows no placeholder text [ASSUMPTION: none drawn]; the visible label "Notes" names it (never placeholder as label, A-16).

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- **Focus:** on open, focus moves to the title (a heading); Tab runs ×, ···, the icon tile, Type, Repeats, the switch (or How or Settings), the At row's day and time, Notes. Escape and × close; focus returns to the tray row that opened it.
- **Names:** × "Close"; ··· "More for <title>"; the icon tile "Icon, <emoji or icon name>. Change"; Type "Type, <type>"; Repeats "Repeats, <value>"; the switch "Reminder"; the At row's select "Reminder day, <day>" and time "Reminder time, <time>"; How "How to install, for reminders"; Settings "Notification settings".
- **Reminder lines:** "Reminders need the installed app." and "Notifications are off for Synapse." are text, read in the Reminder row's description (`aria-describedby`); the icons beside them are decorative.
- **Links in Notes:** a tappable number or link is a real link with its text as its name.
- **Announced (polite):** the toast after Delete or Mark done, with Undo reachable by keyboard; "Not saved. Try again." on a failed change.
- **Targets:** every control at least 44 × 44. Reduced motion: the sheet fades in place instead of sliding.

## Instrumentation

None named by the narrative or the log [ASSUMPTION: Phase 1 sends no product events from this sheet]. Never in any payload: titles, notes, numbers or links in notes, reminder times tied to a title.

## Criteria

| ID                 | When                                                   | Then                                                                            | Evidence                         |
| ------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-todo-sheet-1 | Any field changes                                      | It saves at once; no Save button, no primary                                    | `captures/default-402.png`       |
| C-USE-todo-sheet-2 | Reminders can't arrive                                 | The switch is replaced by the reason and How or Settings; every other row works | `captures/not-installed-402.png` |
| C-USE-todo-sheet-3 | × or Escape                                            | The sheet closes and focus returns to the tray row                              | manual                           |
| C-USE-todo-sheet-4 | `?sheet=todo&id=` with each `?state=` key of `states/` | That state renders (canon C-P08)                                                | capture                          |

## Decisions and open items

- D-USE-3 (the sheet), D-USE-34 (56 px rows), D-USE-35 (Notes on every to-do; Digital), D-USE-37 (rounds 1 and 2 approved as drawn), D-USE-39 (the desk's right panel), D-USE-56 and D-USE-64 (offline).
- Open carried here: "To-do sheet, step 11 round 1" and the to-do half of "Step 11 round 2" (`../open/open-6.md`); the to-do half of "`day/todo-sheet.md` gains Type and Repeats" (`../open/open-5.md`), decided as drawn by D-USE-37.
- Decided (D-USE-69), each as its default: "+ Add" › To-do as a new to-do (`index.md`); the archived Length row (`states/default.md`); a new to-do's type (`states/type-open.md`); the At row's day options (`states/reminder-on.md`); Give it a day… (`states/more-open.md`); loading (`states/loading.md`); error (`states/error.md`); a reminder set offline (`states/offline.md`).
