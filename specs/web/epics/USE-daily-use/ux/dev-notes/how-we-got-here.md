---
target: specs/web/ux/dev-notes/how-we-got-here.md
status: approved
promoted:
dev_note: "Dev note · How we got here: home, errands, to-dos"
rulings: [D-USE-35, D-USE-38, D-USE-49, D-USE-74, D-USE-79, D-USE-80]
---

# How we got here: home, errands, to-dos

The record of the rounds that made Life and To-dos, for the next wave of refining. Nothing here is built on its own: the current rules are in [`life-and-todos.md`](life-and-todos.md) and [`blocks-and-todos-model.md`](blocks-and-todos-model.md). The surfaces they shape: Set my days (`../set-my-days/set-my-days/`), the New block sheet (`../set-my-days/new-block-sheet/`), the block view (`../day/block-view/`), Now's To-dos block ([`../day/now/states/todos-block.md`](../day/now/states/todos-block.md), D-USE-74) and the To-do sheet ([`../day/todo-sheet/index.md`](../day/todo-sheet/index.md)).

## The dev note

**Dev note · How we got here: home, errands, to-dos** ("USE — set up", x 2892, y 2520):

> Dev note · How we got here
>
> Home, errands and to-dos, in three rounds on 2026-10-10. For the next wave of refining: what was tried, what it cost, why it moved.
>
> Round 1 · Life did both
>
> Ask: a Life kind for social time, and where chores and errands go. Drawn: Life as a sixth kind, filled Set or From to-dos; chores and errands as to-dos. Alternatives: (a) a kind called Home, (b) a Sunday checklist only. Taylor: dedicated time for to-dos is real and deserves its own block; "Home" is a place and breaks on the first exception (errands out, Joey's house).
>
> Round 2 · a To-dos kind, Where as a field
>
> A seventh kind, To-dos, named for what fills it. Life kept plans only. Each to-do got Where: Home, Out, Anywhere; a To-dos block pulled by it. Colours: Life rose, To-dos moss. Taylor: why would Errands not be its kind; is an errand the same data type as a to-do; Life stays yellow; Length in hours is frustrating.
>
> Round 3 · to-do types (now)
>
> Where became Type, as Taylor suggested: Home, Errand, Call, Computer, Other (Getting Things Done's contexts). Life yellow, To-dos moss. Kind badges removed from the column. New block: Ends instead of Length, a repeat switch. Round 4: blocks stopped filtering by type (Taylor: type is per to-do, not per block). A To-dos block takes any to-do; type is only a filter when picking from the pool.
>
> Still open for a later wave
>
> Whether Errands earns its own kind after real use (it would need its own Make room rank or Review line to justify one); custom types; a to-do with two types; pull order (oldest, reminder due, chore due); pinning a to-do to a named block.

Its summary card under it (Frame @ x 2892, y 3450): "How we got here (round 3) / The three rounds on home, errands and to-dos, with what each cost and why it moved, for the next wave."

The rounds are logged in `../day/open/open-4-cont.md` ("Life and chores, step 9 framing round") and `../day/open/open-5.md` ("Life and To-dos, step 9 framing round 2", "framing round 3", "framing round 4", "Repeats, framing round 5").

## Round 1's two alternatives, not picked

Both stand on the Archive row of "USE — set up" (y 11340), status in the boards: not picked (D-USE-49, the lock). Neither is a spec state.

**`chores / alt (a): a seventh kind, Home / 402 / light`** (x 1928, y 11340), its note (Frame @ x 1928, y 12270):

> Alternative (a)
>
> A seventh kind named Home. Taken in part: the seventh kind stays, renamed To-dos so it isn't tied to a place; Home becomes a where filter.

**`chores / alt (b): a Sunday checklist only / 402 / light`** (x 2410, y 11340), its note (Frame @ x 2410, y 12270):

> Alternative (b)
>
> Chores as a Sunday checklist only. Not recommended: a list with no protected time, and errands have no block to land in.

Alternative (a)'s "Home becomes a where filter" was itself superseded: Home is one of the to-do's Types (round 3), and blocks never filter by type (round 4). A Sunday checklist still exists as a block of its own (`../day/block-view/states/checklist-editing.md`), beside a To-dos block, not in its place.

## What changed after the note

- **Computer became Digital** (D-USE-35): the types are Home, Errand, Call, Digital, Other.
- **The repeat switch became Repeats**, Google's presets (round 5; D-USE-80).
- **Life is yellow** (#C9A227, #F6EDC4) as a ninth hue; round 2's rose is gone (D-USE-38, D-USE-79). To-dos stays moss.
- **The pull order is oldest first** in go mode (D-USE-74). The other later-wave questions stay open for after real use, outside this epic.

## Rulings

- D-USE-35: Computer becomes Digital.
- D-USE-38, D-USE-79: Life yellow.
- D-USE-49 (the lock): the archived alternatives stay not picked.
- D-USE-74: the To-dos block in go mode, oldest first.
- D-USE-80: Repeats is Google's presets.
