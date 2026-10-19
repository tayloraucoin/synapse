---
target: specs/web/ux/day/todo-sheet/states/notifications-off.md
status: approved
promoted:
boards:
  - name: "todo-sheet / notifications off / 402 / light"
    page: "USE — set up"
    at: [2410, 8820]
    note: "Frame @ x 2410, y 9750"
    capture: specs/web/epics/USE-daily-use/ux/day/todo-sheet/captures/notifications-off-402.png
rulings: [D-USE-3, D-USE-37]
---

# To-do sheet — notifications off

Installed, but notifications for Synapse are off. `?state=notifications-off`.

## What shows, top to bottom

- As `default.md`, with the Reminder row changed:
  - "Reminder" label; under it a muted line with a bell-off icon: "Notifications are off for Synapse."
  - On the right, in place of the `Switch`: "Settings", an outlined pill text `Button`.
- Footer line: "Changes save as they're made. The reminder switch comes back once notifications are on."

## What the person can do

- **Settings** opens the app's Settings at Notifications. Once notifications are on, the switch comes back (as `default.md`).
- Every other row works.

## Words

"Notifications are off for Synapse."; "Settings"; "Changes save as they're made. The reminder switch comes back once notifications are on."

## The notes on the boards

**todo-sheet / notifications off / 402 / light** (Frame @ x 2410, y 9750):

> Notifications off
>
> The same line with a bell-off icon; "Settings" opens Settings at Notifications. The switch comes back once they're on.

## Rulings

- N4: "The same line, pointing to Settings, then Notifications." The drawn words, "Notifications are off for Synapse.", are the ones to build (D-USE-37, approved as drawn).
- Settings is outside USE's scope ("Untouched: … settings", `../../overview.md`); the target is the app's existing Notifications setting [ASSUMPTION: where the browser or OS blocks them, that screen says how to allow them].
- A to-do that already had a reminder keeps its day and time while notifications are off, and reminds again once they're on [ASSUMPTION].

## Widths

Drawn at: 402. At the desk: the same row in the right-side panel (D-USE-39).

## Criteria

| ID                                   | When                         | Then                                                          | Evidence                             |
| ------------------------------------ | ---------------------------- | ------------------------------------------------------------- | ------------------------------------ |
| C-USE-todo-sheet-notifications-off-1 | Installed, notifications off | No switch; "Notifications are off for Synapse." with Settings | `captures/notifications-off-402.png` |
| C-USE-todo-sheet-notifications-off-2 | Notifications come back on   | The switch returns                                            | manual                               |
