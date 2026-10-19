---
target: specs/web/ux/set-my-days/new-block-sheet/states/todos-kind.md
status: approved
promoted:
boards:
  - name: "new-block / to-dos kind, Ends, repeats / 402 / light"
    page: "USE — set up"
    at: [1446, 5040]
    note: "Frame @ x 1446, y 5970"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/captures/todos-kind-402.png
rulings: [D-USE-34, D-USE-38, D-USE-79, D-USE-80]
---

# New block sheet — the To-dos kind, Ends, Repeats

A Sunday reset on the usual Sunday, To-dos picked. `?sheet=new-block&state=todos-kind` [ASSUMPTION: the state param]. The model behind the kind: `../../../dev-notes/blocks-and-todos-model.md` and `../../../dev-notes/life-and-todos.md`.

## What shows, top to bottom

- Grabber; ×; "Usual Sunday · every week" over "New block".
- **Kind:** Wellness, Training, Work, Life (yellow dot), then To-dos (picked, moss soft fill and edge), Break, Evening.
- **Name:** the empty icon tile beside "Sunday reset" [placeholder].
- Hairline; **Starts** "13:00"; hairline; **Ends** "16:00", "3 h" muted beside it.
- Hairline; **Repeats** "Weekly on Sunday" with a chevron.
- **Colour:** the moss swatch, "Moss, To-dos' colour".
- The fill line (caption, muted): "Filled from To-dos on the day: those with no day yet, oldest first. Pick or drop any; a type filter helps when picking."
- "Goes in on Sundays, 13:00 to 16:00. What isn't done by 16:00 goes back to To-dos."
- "Add block", ink. No Checklist row on a To-dos block.

## What the person can do

- Name it anything: "Errands" and "Sunday reset" are names, not rules; a block never filters by Type (round 4).
- Repeats: `repeats-menu.md` (drawn open on this same sheet).
- **Add block:** the block lands on every Sunday, 13:00 to 16:00, and opens on its pool [ASSUMPTION: as `../../../day/block-view/states/todos-pool.md`].

## Words

"Usual Sunday · every week" · "3 h" · "Weekly on Sunday" · "Moss, To-dos' colour" · "Filled from To-dos on the day: those with no day yet, oldest first. Pick or drop any; a type filter helps when picking." · "Goes in on Sundays, 13:00 to 16:00. What isn't done by 16:00 goes back to To-dos."

## The notes on the boards

**"new-block / to-dos kind, Ends, repeats / 402 / light"**, "Frame" @ x 1446, y 5970, quoted as the canvas has it: its heading says Life picked, while the frame draws To-dos picked (the note was written for the Life rounds' sheet, and this file carries the frame):

> New block, Life picked
>
> [PROPOSED] Seven kinds. Ends replaces Length (the length shows beside it). Repeats is a select with Google Calendar's options (round 5). A To-dos block has no type rule: it fills from To-dos, any type.

## Rulings

- D-USE-34: seven kinds, Ends with the length beside it, and Repeats approved; the [PROPOSED] closes. This settles the New block half of open-5's "[NEEDS DECISION] At the UX handoff, N1's kinds, N2's New block sheet…", with D-USE-80 for the list.
- D-USE-38, D-USE-79: Life is yellow (#C9A227, #F6EDC4, a ninth hue); To-dos moss.
- Round 4: Type belongs to the to-do only; the From To-dos sheet keeps a type filter (All types by default).

## Widths

Drawn at: 402. At 1024 and wider: the right panel at `--sheet-w` (D-USE-39, D-USE-83).

## Criteria

| ID                                 | When                   | Then                                                                          | Evidence                      |
| ---------------------------------- | ---------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| C-USE-new-block-sheet-todos-kind-1 | To-dos is picked       | Moss colour, the fill line and the go-back line; no type picker, no Checklist | `captures/todos-kind-402.png` |
| C-USE-new-block-sheet-todos-kind-2 | The block's end passes | What isn't done goes back to To-dos                                           | test                          |
