---
target: specs/web/ux/dev-notes/life-and-todos.md
status: approved
promoted:
dev_note: "Dev note · Life and chores"
rulings: [D-USE-35, D-USE-37, D-USE-38, D-USE-74, D-USE-79, D-USE-80, D-USE-87]
---

# Life and To-dos

The two kinds with Work's standing, Life and To-dos, and the rules still to settle. Used by Set my days (`../set-my-days/set-my-days/`: `states/usual-week.md`, `usual-saturday.md`, `usual-thursday-evening.md`), the New block sheet (`../set-my-days/new-block-sheet/`, `states/todos-kind.md`), the block view (`../day/block-view/states/life-set.md`, `todos-add-open.md`, `todos-pool.md`, `todos-dated-plan.md`, `todos-sunday-reset.md`), Now's To-dos block ([`../day/now/states/todos-block.md`](../day/now/states/todos-block.md), D-USE-74) and the To-do sheet ([`../day/todo-sheet/index.md`](../day/todo-sheet/index.md)). The data behind it: [`blocks-and-todos-model.md`](blocks-and-todos-model.md); the rounds that led here: [`how-we-got-here.md`](how-we-got-here.md).

## The dev note

**Dev note · Life and chores** ("USE — set up", x 1928, y 2520):

> Dev note · Life and chores
>
> Rounds 2 to 4 (Taylor's notes). Two new kinds with Work's standing: Life (yellow, plans; holds its own items) and To-dos (moss, dedicated time filled from the pool). Chores and errands stay to-dos; each to-do has a type (Home, Errand, Call, Digital, Other). Type belongs to the to-do only; blocks never filter by it.
>
> Logged in day/overview.md, Open.
>
> What's drawn [PROPOSED]
>
> A To-dos block fills from to-dos with no day, oldest first, any type; pick or drop any, with a type filter in the pool to help. "Errands" and "Sunday reset" are block names, not rules. New block asks Ends, not Length, and has a repeat switch. What isn't done by the block's end goes back to To-dos. A chore is a repeating to-do. A dated plan is an event band.
>
> Rules to settle
>
> Make room takes from Life and To-dos no sooner than from Work [ASSUMPTION]; Stretch still slides first. Evening is the wind-down only; unset evening time stays open. Review groups Life and To-dos each on their own line [ASSUMPTION]. Neither counts as work. Where defaults to Anywhere [ASSUMPTION]. To settle: pull order (oldest, reminder due, chore due) and pinning a to-do to a named block.
>
> At the UX handoff [NEEDS DECISION]
>
> N1's kinds, N2's New block sheet and new-block-sheet.md gain Life and To-dos, Ends and the repeat switch; todo-sheet.md gains Type and Repeats. The narrative is not edited here. Colours: Life yellow (needs a token), To-dos moss, to the colours thread.

Its summary card under it (Frame @ x 1928, y 3450): "Dev note / Life and To-dos: the two kinds, where as a filter, Make room, Evening's line, Review grouping. The model board at x 7230 explains the data." The model board now stands at x 2410, y 2520 on the same row ([`blocks-and-todos-model.md`](blocks-and-todos-model.md)); "where as a filter" is round 2's, superseded by Type (round 3) and by blocks never filtering (round 4).

"Logged in day/overview.md, Open" is the canvas's wording; the items live in `../day/open/open-4-cont.md` ("Dev note: Life and chores", "Life and chores, step 9 framing round") and `../day/open/open-5.md` (the handoff Decided (D-USE-87) line, "Life and To-dos, step 9 framing round 2", rounds 3 and 4, "Repeats, framing round 5").

## At the UX handoff: what this thread did

- **New block sheet** gains Life and To-dos (seven kinds), Ends in place of Length (the length beside it) and Repeats, which is now a select with Google's presets, not a switch (D-USE-80): carried in `../set-my-days/new-block-sheet/` (`states/todos-kind.md`, `repeats-menu.md`, `custom-recurrence.md`).
- **The To-do sheet** already has Type (Home, Errand, Call, Digital, Other; D-USE-35's Digital) and Repeats, approved with it (D-USE-37): [`../day/todo-sheet/index.md`](../day/todo-sheet/index.md), `states/type-open.md`, `states/repeats-open.md`.
- **Colours** are settled: Life yellow (#C9A227, #F6EDC4) as a ninth category hue with its named 2.3:1 dot exception, To-dos moss (D-USE-38, D-USE-79); the token goes into preset.css with the build ([`colours-for-a-new-thread.md`](colours-for-a-new-thread.md)).
- **The narrative is not edited** (N1's kinds and N2's sheet stay as approved; this ledger carries the change).

## What it means for the build, with the later lines

- **Go mode is decided** (D-USE-74): a To-dos block runs as drawn, oldest first from to-dos with no day, undone ones back to To-dos at its end. So the pull order is oldest first; reminders due and chores due do not reorder it [ASSUMPTION].
- **Life holds its own items** like Wellness (Set only; round 2 took away its From to-dos mode). A dated plan is a plum event band inside the block its time falls in.
- **Neither counts as work.** Evening is the wind-down only.
- **Decided (D-USE-87): Make room order:** default as drawn, Life and To-dos give minutes no sooner than Work, Stretch first ([`../interactions/make-room/index.md`](../interactions/make-room/index.md)).
- **Decided (D-USE-87): Review grouping:** default as drawn, Life and To-dos each on their own line.
- **Decided (D-USE-87): Default type:** the note's "Where defaults to Anywhere" is round 2's field; Type has no Anywhere. Default: a new to-do's Type is Other until set [ASSUMPTION].
- **Decided (D-USE-87): Pinning a to-do to a named block:** default none (not drawn); any to-do goes in any To-dos block.

## Rulings

- D-USE-74: the To-dos block in go mode as drawn.
- D-USE-38, D-USE-79: Life yellow, To-dos moss.
- D-USE-80: Repeats is Google's presets.
- D-USE-35, D-USE-37: the to-do's Type (Digital) and Repeats on the To-do sheet.
