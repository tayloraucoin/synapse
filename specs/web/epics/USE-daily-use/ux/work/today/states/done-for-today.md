---
target: specs/web/ux/work/today/states/done-for-today.md
status: approved
promoted:
boards:
  - name: "phone-today / Done for today, a session, Undo / 402 / light"
    page: "USE — work"
    at: [7712, 5760]
    note: "Notes · phone, Today (row 5, cont.) @ x 7712"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/done-for-today-402.png
rulings: [D-USE-54, D-USE-57, D-USE-65]
---

# Today — Done for today, a session

The session rules are in [sessions](../../../interactions/sessions.md).

## What shows, top to bottom

**Phone (402, 11:15):** [Synapse: desk Today layout] (session 1 of 3) is checked: the filled done mark, the title receded, under it "SYN-212 · Done for today · took 2 h 05 · next session Wed 14". A toast above the tab bar (ink): "Done for today. Session 2 is Wed 14." with **Undo**.

**Desk (not drawn):** the Done record on the row's right reads "Done for today · took 2 h 05 · next session Wed 14" [ASSUMPTION: the desk's Done record place, D-USE-48], with the same toast.

## What the person can do

Undo (the session reopens as it was). Nothing goes to Linear.

## Words

"Done for today · took 2 h 05 · next session Wed 14"; toast "Done for today. Session 2 is Wed 14." and "Undo".

## The notes on the boards

**Notes · phone, Today (row 5, cont.) @ x 7712** — Done for today, a session

A session's Done closes today's share only: "Done for today · took 2 h 05 · next session Wed 14", and a toast with Undo. Nothing goes to Linear until the task itself is done.

## Rulings

- D-USE-54, D-USE-57: a session's Done reads "Done for today", names the next session, offers Undo; Linear only when the task is done.
- The last session's Done does not also mark the task done (D-USE-65); "Mark the task done" stays in the item sheet's ··· (D-USE-57), and the record reads "Done for today · took …" with no next session.

## Widths

Drawn at 402. Desk: [ASSUMPTION] above.

## Criteria

| ID                           | When              | Then                                                                                  | Evidence                          |
| ---------------------------- | ----------------- | ------------------------------------------------------------------------------------- | --------------------------------- |
| C-USE-today-done-for-today-1 | Done on a session | Today's share closes, the next session is named, a toast offers Undo; no Linear write | `captures/done-for-today-402.png` |
