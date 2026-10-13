---
target: specs/web/ux/day/block-view/states/todos-add-open.md
status: approved
promoted:
boards:
  - name: "block-view / to-dos, errands, Out, add open / 402 / light"
    page: "USE — set up"
    at: [4820, 3780]
    note: "Frame @ x 4820, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/todos-add-open-402.png
rulings:
  [
    D-USE-17,
    D-USE-28,
    D-USE-34,
    D-USE-69,
    D-USE-74,
    D-USE-81,
    D-USE-84,
    D-USE-87,
  ]
---

# Block view — a To-dos block, add open

A To-dos block, "Errands", on This week's Saturday (Sat 17, 10:00 to 12:30), opened from Set my days at 21:10, with its add row tapped. A To-dos block is dedicated time filled from to-dos (open-5, framing rounds 2 and 4). `?state=todos-add-open`. Its note is "Frame" at x 4820, y 4710. The kind: [`../../../dev-notes/life-and-todos.md`](../../../dev-notes/life-and-todos.md); the slot that joins a to-do to a block for a date: [`../../../dev-notes/blocks-and-todos-model.md`](../../../dev-notes/blocks-and-todos-model.md).

## What shows, top to bottom

- **Status bar:** 21:10. **Breadcrumb:** "‹ Sat 17 › Errands" (a date, since this is This week).
- **Header:** To-dos' moss bar, "Errands" (title) over "To-dos · 10:00 to 12:30 · this Saturday" (label, muted; wraps): the kind, the span, the scope. "Done" beside the round ···. A hairline.
- **Rows** on the rail, 56 px on hairlines, each a to-do with its own icon, name, length (muted) and a grip: 10:00 🧥 "Drop off the dry cleaning" 20 min; 10:20 📞 "Call the mechanic" 15 min; 10:35 🛒 "Groceries" 45 min. No checkboxes (editing).
- **The add row,** pressed: "+ Add to Errands".
- Under it (label, muted): "Picked from To-dos for this Saturday, any type. Anything not done by 12:30 goes back to To-dos, never lost." (its end under the menu).
- **The add menu**, a shadcn dropdown (D-USE-28) anchored under the add row, over the 12:30 end line: heading "Add to Errands" (caption, muted); "From To-dos" (a list icon leading, highlighted with a muted fill); "New to-do" ("+" leading); a separator; a footer line (caption, muted): "A new one lands here and in To-dos."
- The block's end line at "12:30"; below it nothing drawn.

## What the person can do

- **From To-dos:** opens the picker, [`todos-pool.md`](todos-pool.md).
- **New to-do:** makes a to-do that lands in this block for this date and in To-dos (the menu's footer) [ASSUMPTION: an inline new row in the block, typed as the add row, 5 min (D-USE-81); the To-do sheet ([`../../todo-sheet/index.md`](../../todo-sheet/index.md)) opens from its name as from the tray's rows].
- Tapping outside closes the menu with nothing changed.
- As other editing views: reorder by grip (D-USE-17); swipe a row left to take it out of the block [ASSUMPTION: it goes back to To-dos with no day, not deleted]; tap a row's name for the To-do sheet [ASSUMPTION: a to-do in a block opens its own sheet, not the Item sheet].
- "Done" or "‹ Sat 17": back to Set my days on This week.

## How it fills and empties

- A To-dos block fills from to-dos with no day, oldest first, of any type; Taylor picks or drops any (open-5, framing round 4). Type never filters a block ([`../../todo-sheet/states/type-open.md`](../../todo-sheet/states/type-open.md)).
- At the block's end, what is not done goes back to To-dos with no day (the note; Decided (D-USE-74), go mode in [`../../now/states/todos-block.md`](../../now/states/todos-block.md)).
- **The frame name's "Out"** is round 2's Where (Home, Out, Anywhere), a block filtered by place. Round 3 made Where into Type and round 4 took filters off blocks: "Out" now names nothing in the build; the block is "Errands" by name only, holding any type.
- Decided (D-USE-87) **A to-do's length.** The rows show lengths, while the To-do sheet has no Length (Decided (D-USE-69)); the model dev note lists length on the to-do. Default: the length is the slot's, set here as any item's length, shown in the picker once set [ASSUMPTION: 5 min until set].

## Words

"To-dos · 10:00 to 12:30 · this Saturday"; "Add to Errands"; "Picked from To-dos for this Saturday, any type. Anything not done by 12:30 goes back to To-dos, never lost."; menu "Add to Errands", "From To-dos", "New to-do", "A new one lands here and in To-dos."

## The notes on the boards

**"block-view / to-dos, errands, Out, add open / 402 / light"**, note "Frame" @ x 4820, y 4710:

> From to-dos, editing, add open
>
> [PROPOSED] This week's Errands holds real to-dos, any type. Add opens a shadcn dropdown: From To-dos, New to-do. Not done by 12:30 goes back to To-dos.

## Rulings

- D-USE-34: To-dos is one of the New block sheet's seven kinds; moss is its colour (open-5, framing round 2; unchanged by D-USE-38 and D-USE-79).
- D-USE-28: the add menu is a shadcn dropdown.
- Open-5, framing round 4 [PROPOSED, "Awaiting Taylor"]: fills from to-dos with no day, any type; the set-up half carried here, the go-mode half Decided (D-USE-74).
- Which to-dos fill first beyond oldest, and pinning a to-do to a named block, stay open in the Life and chores dev note.
- Done in the header: as [`checklist-editing.md`](checklist-editing.md) Decided (D-USE-84).

## Widths

Drawn at: 402. Not drawn at: 1024 and wider; at 1024 Set my days is list-detail (D-USE-83) [ASSUMPTION: Block view opens in the day pane; the menu opens below the add row]; otherwise scales up.

## Criteria

| ID                                | When                                    | Then                                                                                                         | Evidence                          |
| --------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| C-USE-block-view-todos-add-open-1 | The add row of a To-dos block is tapped | A dropdown titled "Add to <block>" with From To-dos and New to-do, and "A new one lands here and in To-dos." | `captures/todos-add-open-402.png` |
| C-USE-block-view-todos-add-open-2 | New to-do is used                       | The to-do exists in To-dos and is slotted into this block for this date                                      | test                              |
| C-USE-block-view-todos-add-open-3 | The block ends with a to-do not done    | It is back in To-dos with no day; nothing is deleted                                                         | test                              |
| C-USE-block-view-todos-add-open-4 | Any To-dos block                        | It holds to-dos of every type; no Type control on the block                                                  | `captures/todos-add-open-402.png` |
