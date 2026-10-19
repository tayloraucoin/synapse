---
target: specs/web/ux/work/today/states/linear-updating.md
status: approved
promoted:
boards:
  - name: "phone-today / Linear updating, closed in Linear / 402 / light"
    page: "USE — work"
    at: [8194, 5760]
    note: "Notes · phone, Today (row 5, cont.) @ x 8194"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/linear-updating-402.png
rulings: [D-USE-57, D-USE-97]
---

# Today — Linear updating; closed in Linear

## What shows, top to bottom

**Phone (402, 10:21):** as [working](working.md). Under the SMS copy's meta: a small spinner and "Moving to In progress in Linear…" (muted). [Synapse: desk Today layout] was closed in Linear by someone else: the filled done mark, the title receded, "SYN-212 · Done in Linear at 10:12 · all its sessions close" under it, and **Reopen** on the right.

**Desk (not drawn):** [ASSUMPTION] the same lines under the row's meta, Reopen on the right where the length sits.

## What the person can do

Nothing on the updating line (it clears when the write lands, or becomes [linear-failed](linear-failed.md)). Reopen reopens the issue in Linear, back to the status it had before it closed, and the row and every session return undone (D-USE-97). A failed write reads "Not updated in Linear." with Try again ([linear-failed](linear-failed.md)).

## Words

"Moving to In progress in Linear…"; "Done in Linear at 10:12 · all its sessions close"; "Reopen".

## The notes on the boards

**Notes · phone, Today (row 5, cont.) @ x 8194** — Linear updating, closed in Linear

A write on its way: a quiet spinner and "Moving to In progress in Linear…" under the row. Closed in Linear by someone else: the row shows done with the time, all sessions close, and Reopen [PROPOSED] reopens it in Linear.

## Rulings

- D-USE-57: a write in flight shows a quiet spinner line; an issue closed in Linear shows done with Reopen.
- D-USE-97: Reopen reopens in Linear too; ends D-USE-57's [PROPOSED].
- N4's "Updating Linear" brief line is this line, with the status word named.
- The spinner is inline and names what is happening (not A-18's page spinner).

## Widths

Drawn at 402. Desk: [ASSUMPTION] above.

## Criteria

| ID                            | When                          | Then                                                                       | Evidence                           |
| ----------------------------- | ----------------------------- | -------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-today-linear-updating-1 | A status write is in flight   | The spinner line names the target status                                   | `captures/linear-updating-402.png` |
| C-USE-today-linear-updating-2 | The issue is closed in Linear | The row shows done with the time; every session of it closes; Reopen shows | capture                            |
