---
target: specs/web/ux/dev-notes/blocks-and-todos-model.md
status: approved
promoted:
dev_note: "Dev note · The model: blocks, to-dos, where"
rulings: [D-USE-31, D-USE-35, D-USE-74, D-USE-80]
---

# The model: blocks, to-dos, slots

Time and tasks kept apart and joined by a slot: the data under Life and To-dos. Used by Set my days (`../set-my-days/set-my-days/`), the New block sheet (`../set-my-days/new-block-sheet/`: a block's kind, start, end, Repeats and fill), the block view (`../day/block-view/states/todos-pool.md`, `todos-dated-plan.md`, `work-tiers.md`), Now's To-dos block ([`../day/now/states/todos-block.md`](../day/now/states/todos-block.md), D-USE-74) and the To-do sheet ([`../day/todo-sheet/index.md`](../day/todo-sheet/index.md)). The kinds' rules: [`life-and-todos.md`](life-and-todos.md).

## The dev note

**Dev note · The model: blocks, to-dos, where** ("USE — set up", x 2410, y 2520), its text in the board's order (the four boxes at the end are its diagram):

> Dev note · The model
>
> Time and tasks are kept apart and joined by a slot. A block is a container of time; a to-do lives in one pool; slotting a to-do into a block for a date is the only link.
>
> ↓ joined by ↓
>
> Why kinds aren't places
>
> A kind says what the time is for: it sets colour, Review's grouping and Make room's order. Type is a fact about one to-do (a context, in Getting Things Done's terms: @home, @errands, @calls, and Digital for anything on a screen). It lives on the to-do only: a block never filters by it, so any to-do can go in any To-dos block. Type helps when picking from the pool.
>
> The same pattern already in use
>
> Work is a block; work items sit in the pool; tiers slot them into a day (D-USE-31). To-dos blocks do the same with a where filter instead of tiers.
>
> Slot
>
> to-do × block × date · order. Made by the pull rule or by hand; removed at the block's end if not done, so the to-do is back in the pool.
>
> Event
>
> a fixed time on a date. Not slotted: it pins inside whatever block its time falls in.
>
> Block
>
> kind · start · end · repeat rule (Google Calendar's: RFC 5545 RRULE) or one date · fill: set items or from To-dos
>
> To-do
>
> name · length · type (Home, Errand, Call, Digital, Other) · day or none · repeats · reminder · notes

Its summary card under it (Frame @ x 2410, y 3450): "The model (new, round 2) / Blocks are time, to-dos are a pool, a slot joins them for a date. Where is a context on the to-do, not a kind." The card's "Where is a context" is round 2's; rounds 3 and 4 made it Type, on the to-do only, never a block filter. The note's own "with a where filter instead of tiers" is the same leftover: a To-dos block fills by the pull rule, oldest first, any type (D-USE-74), with no filter; the canvas is not edited.

"Logged in day/overview.md, Open" is not on this note; the model is logged in `../day/open/open-5.md` ("Life and To-dos, step 9 framing round 2": "The model is on the canvas").

## What it means for the build, with the later lines

- **Four records** (for Technical to name): Block (kind, start, end, one RRULE or one date, fill: set items or from To-dos), To-do (name, length, type, day or none, repeats, reminder, notes; Notes on every to-do per D-USE-35), Slot (to-do, block, date, order), Event (fixed time on a date).
- **A block stores one repeat rule**, RFC 5545 RRULE, as Google does, not one copy per weekday; it shows on every day the rule hits (D-USE-80; `../set-my-days/new-block-sheet/states/repeats-menu.md`, `custom-recurrence.md`).
- **A slot is undone at the block's end** when its to-do isn't done; the to-do is back in the pool (D-USE-74). A slot is made by the pull rule or by hand (pick or drop on the day).
- **An event is never slotted**: it pins inside the block its time falls in, or stands as its own small block outside every block ([`google-calendar.md`](google-calendar.md), [`meeting-inside-a-work-block.md`](meeting-inside-a-work-block.md)).
- **Work follows the same pattern** with tiers for the order (D-USE-31); the work pool and the to-dos pool stay separate pools [ASSUMPTION: the note names "the pool" for each, not one shared pool].

## Rulings

- D-USE-31: Work's tiers slot pool items into a day.
- D-USE-35: Digital for screen work; Notes on every to-do.
- D-USE-74: the pull rule and undone slots, in go mode.
- D-USE-80: the repeat rule is Google's.
