---
target: specs/web/ux/interactions/add/states/add-sheet.md
status: approved
promoted:
boards:
  - name: "phone-edit / + Add, four choices / 402 / light"
    page: "USE — work"
    at: [0, 7200]
    note: "Notes · phone, editing and This week (row 6) @ x 0"
    capture: specs/web/epics/USE-daily-use/ux/interactions/add/captures/add-sheet-402.png
rulings: [D-USE-42, D-USE-51, D-USE-54, D-USE-58, D-USE-65, D-USE-108]
---

# + Add — the Add sheet (phone)

Step 1 of [`../index.md`](../index.md) on the phone: + in the Now header, during Work on Monday 12 at 10:20. `?state=add-sheet`.

## What shows, top to bottom

- Behind the scrim: the status bar (10:20), "Now", and the Work band (the sky bar and "Work").
- The sheet from y 480 to the foot (394 high), rounded top, the grab handle.
- Header: "Add" (heading) with "Mon 12 · Work, 9:30 to 12:00" muted under it; × on the right.
- Four rows, each at least 64 high with a rule between, a muted 20 px leading icon and two lines:
  - a card with two lines: "Task to a tier", "New work in Urgent, Primary, Secondary or Stretch";
  - a stack of layers: "From the pool", "Saved work, and Linear issues assigned to Taylor";
  - a ticked square: "To-do", "A one-off, or a daily reminder with a time";
  - a calendar: "Event", "A fixed time; shows where it lands and what moves" (no rule under it).

## What the person can do

- **Task to a tier**: New task, [`new-task.md`](new-task.md), in the block named in the header [ASSUMPTION: the current block, Work here].
- **From the pool**: the pool sheet, [`../../place-from-the-pool/`](../../place-from-the-pool/index.md).
- **To-do**: the To-do sheet (`../../../day/todo-sheet/`).
- **Event**: [`../../add-event.md`](../../add-event.md).
- × or a swipe down closes without adding.

## Words

"Add" · "Mon 12 · Work, 9:30 to 12:00" · "Task to a tier" · "New work in Urgent, Primary, Secondary or Stretch" · "From the pool" · "Saved work, and Linear issues assigned to Taylor" · "To-do" · "A one-off, or a daily reminder with a time" · "Event" · "A fixed time; shows where it lands and what moves". Gloss passed them (no second person, sentence case, no full stops on labels).

## Access

The sheet traps focus; × is named "Close" and sits at least 44 × 44. Each row is one button whose name is its label and line ("Task to a tier, new work in Urgent, Primary, Secondary or Stretch") [PROPOSED]; the icons are decoration. Focus returns to + on close.

## The notes on the boards

**phone-edit / + Add, four choices / 402 / light** (Notes · phone, editing and This week (row 6) @ x 0, card "+ Add, four choices"):

> - Add, four choices
>
> - in the Now header opens Add as a sheet: Task to a tier, From the pool, To-do, Event. The desk's four, as shadcn rows with muted leading icons.

## Rulings

- D-USE-54: + Add is a sheet with the desk's four. D-USE-42: the four, the desk's menu. D-USE-51: + in the Now header opens Add. D-USE-58: locked as drawn.
- × sits on the right here, where New task and the Item sheet put it on the left (Decided (D-USE-108 (1)): as drawn, × on the right, since this sheet has no back and no ···).

## Widths

Drawn at: 402. The desk is the "+ Add ⌄" `DropdownMenu` ([`../index.md`](../index.md) › Where it starts; D-USE-42, D-USE-65).

## Criteria

| ID                    | When                | Then                                                                              | Evidence                     |
| --------------------- | ------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| C-USE-add-add-sheet-1 | + in the Now header | The sheet names the day and block and lists the four in order, each with its line | `captures/add-sheet-402.png` |
| C-USE-add-add-sheet-2 | A choice is tapped  | Its step opens; × or a swipe down adds nothing                                    | manual                       |
