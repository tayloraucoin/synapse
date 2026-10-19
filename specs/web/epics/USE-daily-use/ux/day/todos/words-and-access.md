---
target: specs/web/ux/day/todos/words-and-access.md
status: approved
promoted:
---

# To-dos tray — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss. Strings the same in every state; state-only strings sit in each state file. No second person; times are the only numbers; never a count.

- Trigger: "To-dos"; closed, the first title beside it, ellipsised.
- Rows: the to-do's title as typed; "From <weekday>" for a carried to-do; the reminder time in `figure` after a bell glyph.
- Add row: "Add a to-do".
- Notification body: the to-do's title, nothing added (N4).
- Offline and error lines: the screen's own `StatusLine` ("Offline. Checks are saved on this phone." on Now); "Not saved. Try again." (`states/error.md`).

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- **The trigger** is a button with `aria-expanded`; its name is "To-dos" plus, closed, the first title ("To-dos, Call the mechanic"). Enter or Space toggles. Focus stays on it.
- **Rows:** the checkbox's name is the title, with the reminder or carry read after it: "Call the mechanic, reminder at 10:00"; "Library books, from Sunday". The row's open action is a separate button named "Open <title>" so a check never opens the sheet by accident.
- **From a reminder:** focus lands on the reminded row's checkbox; the tint is not the only mark (the time turns ink and is read in the name).
- **Announced (polite):** "<title> checked" or "unchecked"; "Not saved. Try again." on a failed check.
- **Colour never alone:** the bell is a glyph beside the time; "From Sunday" is words.
- **Targets:** each row and the checkbox at least 44 × 44. Reduced motion: the tray opens without the push animation; the reminder tint shows without the fade.

## Instrumentation

None named by the narrative or the log [ASSUMPTION: Phase 1 sends no product events from the tray]. Never in any payload: to-do titles, notes, or reminder times tied to a title. The reminder's push payload carries the title only because the OS shows it [ASSUMPTION: Technical sets how it is stored and sent].

## Criteria

| ID            | When                            | Then                                                               | Evidence                           |
| ------------- | ------------------------------- | ------------------------------------------------------------------ | ---------------------------------- |
| C-USE-todos-1 | The tray shows, open or closed  | It never shows a count of to-dos                                   | `captures/open-402.png`            |
| C-USE-todos-2 | The tray opens                  | It pushes the screen down and covers nothing; the block stays live | `captures/open-402.png`            |
| C-USE-todos-3 | A row (not its box) is tapped   | The To-do sheet opens for that to-do                               | manual                             |
| C-USE-todos-4 | A reminder is tapped            | Now opens with the tray open on that to-do                         | `captures/from-a-reminder-402.png` |
| C-USE-todos-5 | Each `?state=` key of `states/` | That state renders (canon C-P08)                                   | capture                            |

## Decisions and open items

- D-USE-3 (the To-do sheet holds the reminder), D-USE-7 and D-USE-26 (closed by default on Now; "From Sunday"; empty holds only "Add a to-do"), D-USE-39 (the desk: a disclosure), D-USE-40 (the desk's Today: an open To-dos section), D-USE-56 and D-USE-64 (offline).
- To-dos have no place on the rail (note 46). A To-dos block in go mode takes to-dos from the tray (`now / a To-dos block in go mode`, carried by Now, area 3).
- Decided (D-USE-69), each as its drawn or stated default: a checked to-do's place and row order (`states/open.md`); the row icon (`states/open.md`); loading (`states/loading.md`); a list that fails to load (`states/error.md`); the reminder at the desk (`states/notification.md`).
