---
target: specs/web/ux/interactions/add/index.md
status: approved
promoted:
boards: []
dev_note: ""
rulings: [D-USE-41, D-USE-42, D-USE-51, D-USE-54, D-USE-55, D-USE-57, D-USE-65, D-USE-77]
---

# + Add

One entry for everything that can be added to a day, with the same four choices at both widths: Task to a tier, From the pool, To-do, Event (D-USE-42, D-USE-54). Each drawn step is a file in `states/`.

## Where it starts

- **Desk:** "+ Add ⌄" in [Today](../../work/today/index.md)'s header, a shadcn `DropdownMenu` (drawn open on `today / running, work clock, add menu / 1728 / light`, carried by `work/today/states/running.md`). Also "+ Add to <tier>" on a tier's add row or hover (D-USE-41), which skips the menu and goes to step 2 with the tier set.
- **Phone:** + in the Now header opens Add as a sheet (D-USE-51, D-USE-54): [`states/add-sheet.md`](states/add-sheet.md). "Add to <tier>" rows on [no-work-slotted](../../work/today/states/no-work-slotted.md).
- **The pool's New task** (the pool sheet, pool empty, a search with no match): New task with no days, [`states/save-to-the-pool.md`](states/save-to-the-pool.md); the pool is [`../../work/this-week/`](../../work/this-week/) and [`../place-from-the-pool/`](../place-from-the-pool/index.md).
- **A Work block's add row in Set my days › This week** › From Linear: [`states/from-linear-by-size.md`](states/from-linear-by-size.md).

## Steps

| # | The person | The app | Board (carried by) |
| --- | --- | --- | --- |
| 1 | Opens + Add | Desk: the menu under the button, rows with a leading icon: "Task to a tier" T, "From the pool" P, "To-do" D, a rule, "Event" E [PROPOSED keys]. Phone: the sheet with the same four as shadcn rows with muted leading icons and a muted line under each | `today / running, …` (`work/today/states/running.md`); `phone-edit / + Add, four choices / 402 / light` ([`states/add-sheet.md`](states/add-sheet.md)) |
| 2a | Task to a tier | New task: title, client and project (optional), Tier, Size (sets the range), Days; two or more days make sessions of one task; a fit line per day; the action names the days (D-USE-54) | `phone-edit / new task, tier, size, days / 402 / light` ([`states/new-task.md`](states/new-task.md)). Desk form: below (D-USE-65) |
| 2a′ | New task with no days (from the pool) | It waits in the pool, never sent to Linear (D-USE-57) | `phone-edit / new task, save to the pool / 402 / light` ([`states/save-to-the-pool.md`](states/save-to-the-pool.md)) |
| 2b | From the pool | Desk: one search over the pool and Linear, opened on the tier (D-USE-41). Phone: the pool sheet with Pool and From Linear tabs; Place opens the place sheet (Days, Tier, fit, action) (D-USE-54) | [`../place-from-the-pool/`](../place-from-the-pool/index.md); This week's pool states in [`../../work/this-week/`](../../work/this-week/) |
| 2b′ | From Linear on a Work block's add row (Set my days) | Step 8's picker with Size: points word, length range, the consequence line | `set-my-days / from Linear, by size / 402 / light` ([`states/from-linear-by-size.md`](states/from-linear-by-size.md)) |
| 2c | To-do | The To-do sheet, as designed on "USE — daily use" (`../../day/todo-sheet/`) | that surface |
| 2d | Event | A popover that names where the event lands and what moves; Synapse events are editable, Google events read-only (D-USE-42) | [`../add-event.md`](../add-event.md) |
| 3 | Saves | The new row is marked once where it landed; a toast names where it went with Undo (D-USE-57, "placed, Undo") | `this-week / placed, Undo / 402 / light` ([`../place-from-the-pool/states/placed-undo.md`](../place-from-the-pool/states/placed-undo.md)) |

## Rules

- The four are the same at both widths, in this order (D-USE-54).
- Adding never writes a Synapse-only task to Linear (D-USE-57).
- **From Linear, the length comes from the size.** An item added from Linear takes its length from its size, the size from Linear's estimate ([`../../dev-notes/size-and-length.md`](../../dev-notes/size-and-length.md), "Dev note · Size and length"); with no estimate, 30 min [ASSUMPTION]. Cites `now-work / add from Linear / 402 / light` ("USE — daily use", x 5302, y 16500; superseded by D-USE-57), whose note reads: "[ASSUMPTION] Length starts at 30 min, or from Linear's estimate when there is one."
- **The workspace shows only with more than one** [PROPOSED]. With more than one Linear workspace connected, an item names its workspace; with one, it does not. The list's grouping is D-USE-57's (client, then team and project lines), not the frame's All-plus-one-per-workspace switch. Cites `now-work / add from Linear, two workspaces / 402 / light` ("USE — daily use", x 5784, y 16500; superseded by D-USE-57), whose note ends: "The workspace shows on an item only when there's more than one."
- Esc (desk) or a swipe down (phone) closes without adding.
- Offline: adding works; Linear lookups in From the pool wait [ASSUMPTION, D-USE-56 "everything works"].

## Desk form of New task

The desk draws only the menu. New task opens in `ResponsiveSheet`'s right panel at `--sheet-w` with the phone sheet's fields (D-USE-39 "every sheet scales up") (D-USE-65). The phone's Add sheet is the desk's menu (D-USE-55 lists no Add answer: Add is not desk-only).

## Words

"+ Add", "Task to a tier", "From the pool", "To-do", "Event". The phone's own strings are in each state.

## Access

Desk: the menu is a `DropdownMenu` (arrow keys, Enter, Esc; T, P, D, E inside it [PROPOSED]); focus returns to "+ Add" on close. Phone: the + button is named "Add"; the sheet traps focus.

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).

D-USE-41 the tier hover add; D-USE-42 the menu and the event popover; D-USE-51 + in the phone header; D-USE-54 the phone's sheet and New task; D-USE-57 save to the pool, Placed with Undo.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-USE-add-1 | + Add at either width | The four choices in order | `../../work/today/captures/running-1728.png`, `captures/add-sheet-402.png` |
| C-USE-add-2 | New task with no days | It lands in the pool; nothing is created in Linear | test, `captures/save-to-the-pool-402.png` |
| C-USE-add-3 | From Linear in a tier, rows ticked | Each row shows its points word and length range; the line above Add names where the tier ends at the top of its ranges and what waits | `captures/from-linear-by-size-402.png` |
