---
target: specs/web/ux/day/block-view/states/todos-sunday-reset.md
status: approved
promoted:
boards:
  - name: "block-view / to-dos, Sunday reset, Home / 402 / light"
    page: "USE — set up"
    at: [6266, 3780]
    note: "Frame @ x 6266, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/todos-sunday-reset-402.png
rulings:
  [
    D-USE-17,
    D-USE-34,
    D-USE-35,
    D-USE-69,
    D-USE-74,
    D-USE-80,
    D-USE-83,
    D-USE-87,
  ]
---

# Block view — a To-dos block, the Sunday reset

Taylor's case (open-5, framing round 2): three hours blocked on Sunday for the bedroom, the pantry and the fridge. A To-dos block named "Sunday reset" on This week's Sunday (Sun 18, 13:00 to 16:00), opened from Set my days at 21:10. `?state=todos-sunday-reset`. Its note is "Frame" at x 6266, y 4710. The kind and the history of "Home": [`../../../dev-notes/life-and-todos.md`](../../../dev-notes/life-and-todos.md), [`../../../dev-notes/how-we-got-here.md`](../../../dev-notes/how-we-got-here.md); the model: [`../../../dev-notes/blocks-and-todos-model.md`](../../../dev-notes/blocks-and-todos-model.md).

## What shows, top to bottom

- **Status bar:** 21:10. **Breadcrumb:** "‹ Sun 18 › Sunday reset".
- **Header:** the moss bar, "Sunday reset" over "To-dos · 13:00 to 16:00 · this Sunday" (one line); "Done" beside the round ···. A hairline.
- **Rows** on the rail, 56 px, each the to-do's icon, name, length (muted) and a grip: 13:00 🛏️ "Clear out the bedroom" 1 h 30 min; 14:30 🥫 "Sort the pantry" 45 min; 15:15 🧹 "Clean the fridge" 40 min.
- **The add row:** "+ Add to Sunday reset".
- Under it (label, muted): "Picked from To-dos for this Sunday: today they happen to be home jobs; any type can go in. Clean the fridge repeats every 2 weeks; once done, its next one waits in To-dos." Then "[placeholder to-dos] · Ends 15:55" (caption, subtle).
- The end line at "16:00"; under it (label, semibold, muted): "Nothing after this today" in place of a peek.

## What the person can do

- As [`todos-add-open.md`](todos-add-open.md): the add row's menu (From To-dos, New to-do), reorder by grip (D-USE-17), swipe to take a to-do out, a row's name for the To-do sheet, Done or the breadcrumb.
- **A repeating to-do** ("Clean the fridge", every 2 weeks): checked in go mode, its next one is made and waits in To-dos with no day, for the next To-dos block to take (the note) [ASSUMPTION: the To-do sheet's Repeats, [`../../todo-sheet/states/repeats-open.md`](../../todo-sheet/states/repeats-open.md), sets the rhythm; its Custom… is the New block sheet's custom recurrence (D-USE-80)].

## What the name's "Home" means now

The frame name says "Home" from round 2's Where (Home, Out, Anywhere), when a To-dos block pulled from the pool filtered by place, and its note still reads "A To-dos block pulling Home". Round 3 turned Where into the to-do's Type, with "Sunday reset" picking Home; round 4 took every filter off blocks: Type belongs to the to-do only and a block never filters by it. So "Home" now names only what the three to-dos happen to be, home jobs (each to-do's Type Home [ASSUMPTION: not shown on the frame]), as the frame's own caption says ("today they happen to be home jobs; any type can go in"). "Sunday reset" is a block name, not a rule. The build has no Home setting on a block.

## Words

"To-dos · 13:00 to 16:00 · this Sunday"; "Add to Sunday reset"; "Picked from To-dos for this Sunday: today they happen to be home jobs; any type can go in. Clean the fridge repeats every 2 weeks; once done, its next one waits in To-dos."; "Ends 15:55"; "Nothing after this today".

## The notes on the boards

**"block-view / to-dos, Sunday reset, Home / 402 / light"**, note "Frame" @ x 6266, y 4710:

> Sunday reset (new, round 2)
>
> [PROPOSED] Taylor's case: three hours blocked on Sunday for the bedroom, the pantry and the fridge. A To-dos block pulling Home. A done chore's next one waits in To-dos.

## Rulings

- Open-5, framing round 4 [PROPOSED, "Awaiting Taylor"]: "Errands" and "Sunday reset" are block names, not rules; the note's "pulling Home" is superseded in behaviour; the canvas is not edited.
- A chore is a repeating to-do (open-4, Life and chores; open-5, round 2). D-USE-35: Type values; D-USE-34: To-dos among the seven kinds.
- Undone to-dos go back to To-dos at 16:00: Decided (D-USE-74), go mode in [`../../now/states/todos-block.md`](../../now/states/todos-block.md).
- Decided (D-USE-87) **"Ends 15:55"** names where the last to-do ends, a form beside D-USE-69's dashed "Free until <block end>", which this frame does not draw. Default: as [`todos-dated-plan.md`](todos-dated-plan.md), the dashed "Free until 16:00" region; the caption is a canvas pointer.
- [ASSUMPTION] "Nothing after this today" stands in for the peek when no block follows on the day.

## Widths

Drawn at: 402. Not drawn at: 1024 and wider; at 1024 Set my days is list-detail (D-USE-83) [ASSUMPTION: Block view opens in the day pane]; otherwise scales up.

## Criteria

| ID                                    | When                                         | Then                                                                                        | Evidence                              |
| ------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| C-USE-block-view-todos-sunday-reset-1 | A To-dos block named for home jobs is opened | Its to-dos on the rail with icons, lengths and grips; no Type or place control on the block | `captures/todos-sunday-reset-402.png` |
| C-USE-block-view-todos-sunday-reset-2 | A repeating to-do in the block is checked    | Its next one is made and waits in To-dos with no day                                        | test                                  |
| C-USE-block-view-todos-sunday-reset-3 | No block follows on the day                  | "Nothing after this today" under the end line                                               | `captures/todos-sunday-reset-402.png` |
