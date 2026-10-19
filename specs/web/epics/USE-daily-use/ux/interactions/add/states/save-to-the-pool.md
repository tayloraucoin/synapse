---
target: specs/web/ux/interactions/add/states/save-to-the-pool.md
status: approved
promoted:
boards:
  - name: "phone-edit / new task, save to the pool / 402 / light"
    page: "USE — work"
    at: [8676, 7200]
    note: "Notes · phone, editing and This week (row 6, cont.) @ x 8676"
    capture: specs/web/epics/USE-daily-use/ux/interactions/add/captures/save-to-the-pool-402.png
rulings: [D-USE-54, D-USE-56, D-USE-57, D-USE-58, D-USE-65, D-USE-98]
---

# + Add — New task, saved to the pool

Step 2a′ of [`../index.md`](../index.md): New task opened from the pool (the pool sheet, [pool empty](../../../work/this-week/states/pool-empty.md)'s New task, or [pool search](../../../work/this-week/states/pool-search.md)'s no-match offer), with no days. At 21:10, in Set my days › This week's Pool. `?state=save-to-the-pool`.

## What shows, top to bottom

- Behind the scrim: the status bar (21:10), "‹ Week", "Pool" (title).
- The sheet from y 250 (624 high), the grab handle; no ×, no back drawn [ASSUMPTION: a swipe down closes it, as every sheet].
- "Pool · New task" (muted), then "New task" (title).
- "Title" and a field holding "[Kestrel: quarterly report deck]".
- Rows between rules, label left, value muted right: "Client and project" "Kestrel · none"; "Size" "5 Large · 2 to 4 h"; "Due" "Fri 16"; "Days" "None yet".
- The line, muted: "With no days it waits in the pool. It isn't sent to Linear; Synapse-only work stays here."
- "Save to the pool", full width in ink.

## What the person can do

- Edit the title; each row opens its picker [ASSUMPTION: not drawn; Size as [`new-task.md`](new-task.md)'s chips, Days as its day chips, Due a date picker].
- **Due** is Synapse's own date on a plain item (D-USE-98 (1)); it drives the pool's due words and order.
- Picking days turns this into [`new-task.md`](new-task.md)'s form with the consequence line and an action naming the days [ASSUMPTION].
- **Save to the pool**: the task waits in the pool, in the pool's order by due date (D-USE-98 (2)) [ASSUMPTION: a toast "Saved to the pool" with Undo, as placed, Undo]. Nothing is created in Linear (D-USE-57).

## Words

"Pool · New task" · "New task" · "Title" · "Client and project" · "Kestrel · none" · "Size" · "5 Large · 2 to 4 h" · "Due" · "Fri 16" · "Days" · "None yet" · "With no days it waits in the pool. It isn't sent to Linear; Synapse-only work stays here." · "Save to the pool". Gloss passed them.

## Access

The sheet traps focus. Each row is a button named label and value ("Days, none yet"). The line under the rows is the action's description (`aria-describedby`) [PROPOSED]. Controls at least 44 × 44.

## The notes on the boards

**phone-edit / new task, save to the pool / 402 / light** (Notes · phone, editing and This week (row 6, cont.) @ x 8676, card "New task, save to the pool"):

> New task, save to the pool
>
> From the pool's New task: no days means it waits in the pool. Synapse-only work is never created in Linear.

## Rulings

- D-USE-57: New task with no days saves to the pool and never to Linear. D-USE-54: New task's fields. D-USE-56: pool empty offers New task. D-USE-98: due words and the pool's order. D-USE-58: locked as drawn.

## Widths

Drawn at: 402. Desk: New task in the right-panel sheet (D-USE-65), opened from the Week's pool panel ([`../../../work/week/pool-panel.md`](../../../work/week/pool-panel.md)) [ASSUMPTION: the desk pool's New task, as the phone's].

## Criteria

| ID                           | When                                   | Then                                                                                           | Evidence                            |
| ---------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------- |
| C-USE-add-save-to-the-pool-1 | New task from the pool, no days, saved | It waits in the pool; no Linear issue is created                                               | test                                |
| C-USE-add-save-to-the-pool-2 | The sheet opens from the pool          | Days reads "None yet", the line says it waits in the pool, the action reads "Save to the pool" | `captures/save-to-the-pool-402.png` |
