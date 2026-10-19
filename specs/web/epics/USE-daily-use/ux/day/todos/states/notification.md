---
target: specs/web/ux/day/todos/states/notification.md
status: approved
promoted:
boards:
  - name: "todo-reminder / the notification / 402 / light"
    page: "USE — daily use"
    at: [0, 12720]
    note: "Frame @ x 0, y 13650"
    capture: specs/web/epics/USE-daily-use/ux/day/todos/captures/notification-402.png
rulings: [D-USE-3, D-USE-7, D-USE-69]
---

# To-dos tray — the notification

The to-do reminder as it arrives, at 10:00 on Monday, on the phone's lock screen. Not an app screen: the OS draws it; Synapse sets only its words. `?state=notification` renders it as a preview frame [ASSUMPTION: canon C-P08 asks every state be reachable; this one has no app screen].

## What shows, top to bottom

- The lock screen, grey: "Monday 12 October", then "10:00" large.
- Near the foot, one notification card: Synapse's app icon (a dark rounded square with a small verdigris dot), "Synapse" (semibold), "now" muted on the right, and under it the body "Call the mechanic".
- Nothing else: no count, no "Reminder:", no time in the body, no emoji added.

## What the person can do

- **Tap it:** Synapse opens on Now with the tray open on that to-do (`from-a-reminder.md`).
- Dismiss it: nothing changes; the to-do stays in the tray with its bell and time.
- If the to-do was checked off before its time, the reminder never comes, so a notification never reports a miss (`../../todo-sheet/states/reminder-on.md`; product rule "notifications that never report a miss").

## Words

Title: "Synapse" (the app name, from the OS). Body: the to-do's title exactly as typed, "Call the mechanic", nothing added (N4).

## The notes on the boards

**todo-reminder / the notification / 402 / light** (Frame @ x 0, y 13650):

> the notification
>
> The to-do in Taylor's own words, nothing added: "Call the mechanic". Tapping it opens Now with the tray open on it. Not installed and notifications off belong to the To-do sheet (step 11). Loading and partial stay [FILL] at handoff.

## Rulings

- N4 "To-do reminder": the text is the to-do in Taylor's own words, with nothing added; tapping opens Now with the tray open on it.
- D-USE-3: the reminder is set on the To-do sheet; not installed and notifications off are drawn there (`../../todo-sheet/states/not-installed.md`, `notifications-off.md`).
- The note's "Loading and partial stay [FILL]": the tray's are `loading.md` and `error.md`; the notification itself has neither.

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-69), the OS notification with the same words when Synapse is installed on the desk, and a click opens Now with the tray open on the to-do, as on the phone.

## Criteria

| ID                         | When                                               | Then                                                                         | Evidence                        |
| -------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------- |
| C-USE-todos-notification-1 | A reminder's time comes and the to-do is unchecked | One notification whose body is the to-do's title exactly, with nothing added | `captures/notification-402.png` |
| C-USE-todos-notification-2 | The to-do was checked before its time              | No notification is sent                                                      | test                            |
| C-USE-todos-notification-3 | The notification is tapped                         | Now opens with the tray open on that to-do                                   | manual                          |
