---
target: specs/web/ux/day/block-view/by-kind.md
status: approved
promoted:
---

# Block view — editing by kind

The third part of [`index.md`](index.md): the states drawn on "USE — set up" in the row "Row label · Block view from Set my days" (p-4-0, y 3780, notes y 4710), and the words, access and criteria they add to [`words-and-access.md`](words-and-access.md). Coverage: [`../../boards/use-set-up/block-view-from-set-my-days.md`](../../boards/use-set-up/block-view-from-set-my-days.md). Each opens from a block in Set my days ([`../../set-my-days/set-my-days/index.md`](../../set-my-days/set-my-days/index.md)), in editing mode.

## States

| State                                                                                                                                                                 | File                                                           | Widths | One line                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| work, tiers                                                                                                                                                           | [`states/work-tiers.md`](states/work-tiers.md)                 | 402    | This Monday's Work on four tiers, a fit line, Urgent kept as an add row    |
| work, add to a tier                                                                                                                                                   | [`states/work-add-to-a-tier.md`](states/work-add-to-a-tier.md) | 402    | The tier's add row pressed: New item, From the pool, From Linear           |
| set work                                                                                                                                                              | [`states/set-work.md`](states/set-work.md)                     | 402    | "Work fills it with: Set work": the same items every Tuesday, no tiers     |
| wellness, editing                                                                                                                                                     | [`states/wellness-editing.md`](states/wellness-editing.md)     | 402    | Icons on every row; a set-time item shows a clock and "At 7:10"            |
| training, editing                                                                                                                                                     | [`states/training-editing.md`](states/training-editing.md)     | 402    | "Training for: Body fitness", the drives in italic, Swap on the workout    |
| meal, editing                                                                                                                                                         | [`states/meal-editing.md`](states/meal-editing.md)             | 402    | A Break with Meal on: "Watching while eating" topic chips, Edit topics     |
| true break                                                                                                                                                            | [`states/true-break.md`](states/true-break.md)                 | 402    | "Nothing in Break. A true break."; the add row stays                       |
| sunday checklist, editing                                                                                                                                             | [`states/checklist-editing.md`](states/checklist-editing.md)   | 402    | No rail, times or lengths; "Checklist, no times" on; Set a time            |
| Life, set                                                                                                                                                             | [`states/life-set.md`](states/life-set.md)                     | 402    | Life's yellow, a set plan every Thursday; Not this week on This week       |
| To-dos, add open                                                                                                                                                      | [`states/todos-add-open.md`](states/todos-add-open.md)         | 402    | Errands' add menu: From To-dos, New to-do                                  |
| From To-dos                                                                                                                                                           | [`states/todos-pool.md`](states/todos-pool.md)                 | 402    | The picker sheet, the Type filter on All types; rows already in are greyed |
| To-dos, a dated plan                                                                                                                                                  | [`states/todos-dated-plan.md`](states/todos-dated-plan.md)     | 402    | Coffee with Sam as a plum Personal band; Groceries moves after it          |
| To-dos, Sunday reset                                                                                                                                                  | [`states/todos-sunday-reset.md`](states/todos-sunday-reset.md) | 402    | Home jobs, any type; a repeating chore's next one waits in To-dos          |
| The set-up page's `block-view / wellness, new and empty / 402 / light` is a second board of [`states/empty.md`](states/empty.md) (D-USE-81: a new item is 5 minutes). |

## Words

Gloss. No second person; times and lengths are the only numbers.

- Header meta: "<Kind> · <span> · <scope>", the scope "every Monday" (usual week), "this Monday only" or "this Saturday" (This week). Set work's reads "Work · 9:30 to 12:00 · every Tuesday".
- Work: the tier names Urgent, Primary, Secondary, Stretch; "Add to <tier>"; the fit line in words (the plan's end at the top of its ranges); a Linear row's "<ID> · <points> <size>" (`../../dev-notes/size-and-length.md`).
- "Work fills it with" (Tasks for the day or Set work); "Training for" (Body fitness); "Meal", "Offers something to watch", "Off"; "Watching while eating", "Edit topics", "Offered at <meal>. Tap to leave one out."; "Nothing in Break. A true break."
- Checklist: "Checklist, no times"; "Add to the checklist"; "Set a time".
- Life and To-dos: "Not this week"; the add menu's "From To-dos", "New to-do", "A new one lands here and in To-dos."; "Nothing after this today".
- A set-time row: a clock and "At 7:10" in place of the grip (round 8).

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- The set-time clock is named "Set at 7:10" [PROPOSED]; it is not a grip and does not move on reorder.
- Topic chips are toggle buttons, their state "offered" or "left out" (`../../interactions/meal-topics.md`).
- The From To-dos Type chips are a single-select filter named "Type, <value>"; each to-do's checkbox is named "<to-do>, <length>".
- Colour never alone: each tier's square sits beside its name; Life's yellow bar beside the name "Life" (its 2.3:1 dot is D-USE-79's named exception).

## Criteria

| ID                      | When                                   | Then                                                           | Evidence                      |
| ----------------------- | -------------------------------------- | -------------------------------------------------------------- | ----------------------------- |
| C-USE-block-view-kind-1 | A block is reordered around a set item | The set-time row keeps its time and place; the others re-flow  | test                          |
| C-USE-block-view-kind-2 | A To-dos block's picker opens          | Every type is offered; the Type filter narrows only the picker | `captures/todos-pool-402.png` |
| C-USE-block-view-kind-3 | A change is made on This week          | It applies to that date only; the usual week is unchanged      | `captures/work-tiers-402.png` |
| C-USE-block-view-kind-4 | Each `?state=` key above               | That state renders (canon C-P08)                               | capture                       |
