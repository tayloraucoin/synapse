---
target: specs/web/ux/day/todo-sheet/states/not-installed.md
status: approved
promoted:
boards:
  - name: "todo-sheet / not installed (iPhone) / 402 / light"
    page: "USE — set up"
    at: [1928, 8820]
    note: "Frame @ x 1928, y 9750"
    capture: specs/web/epics/USE-daily-use/ux/day/todo-sheet/captures/not-installed-402.png
rulings: [D-USE-3, D-USE-37]
---

# To-do sheet — not installed (iPhone)

Synapse open in Safari on an iPhone, not on the home screen: no reminder can arrive. `?state=not-installed`.

## What shows, top to bottom

- As `default.md`, with the Reminder row changed:
  - "Reminder" label; under it, in place of the switch's caption, a muted line with a small phone icon: "Reminders need the installed app."
  - On the right, in place of the `Switch`: "How", an outlined pill text `Button`.
- Footer line: "Changes save as they're made. Everything else here works in the browser."

## What the person can do

- **How** opens the Install sheet ([`../../../account/install-sheet/index.md`](../../../account/install-sheet/index.md)), on the iPhone tab.
- Every other row works as in `default.md`.

## Words

"Reminders need the installed app."; "How"; "Changes save as they're made. Everything else here works in the browser."

## The notes on the boards

**todo-sheet / not installed (iPhone) / 402 / light** (Frame @ x 1928, y 9750):

> Not installed (iPhone)
>
> N4's words as a quiet muted line with a phone icon, in place of the switch's caption; "How" opens the Install sheet (step 12). Everything else on the sheet works in the browser.

## Rulings

- N4: "The reminder field reads 'Reminders need the installed app.' with 'How', which opens the install sheet."
- D-USE-37: approved as drawn, with step 12's install sheet.
- Shown only where reminders need installing (iPhone in the browser) [ASSUMPTION: Android Chrome and the desk can notify from the browser once allowed, so they show `notifications-off.md` until allowed].

## Widths

Drawn at: 402. At the desk: `notifications-off.md` applies until notifications are allowed [ASSUMPTION, above].

## Criteria

| ID                               | When                  | Then                                                                                   | Evidence                         |
| -------------------------------- | --------------------- | -------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-todo-sheet-not-installed-1 | iPhone, not installed | No switch; "Reminders need the installed app." with How, which opens the Install sheet | `captures/not-installed-402.png` |
