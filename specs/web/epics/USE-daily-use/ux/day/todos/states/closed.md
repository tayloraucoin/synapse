---
target: specs/web/ux/day/todos/states/closed.md
status: approved
promoted:
boards: []
not_drawn: "No frame of its own: the closed tray is drawn inside other surfaces' frames (Review the day's default, every Now frame), each carried by its own surface"
rulings: [D-USE-7, D-USE-26]
---

# To-dos tray — closed

The default on Review the day and Now. `?state=closed` (the intent pass's `success`).

## What shows

- The trigger row under the header, hairlines above and below: "To-dos" (semibold, small), then the first to-do's title muted and ellipsised ("Call the mechanic…"), and a chevron down on the right.
- With no to-dos: "To-dos" alone (`empty.md`).
- Never a count.

Seen closed in, among others, `item-sheet / default / 402 / light` and `todo-sheet / default / 402 / light` (behind the scrim on Review the day), and every Now frame ("USE — daily use", Now rows). Carried by those surfaces; cited here.

## What the person can do

- Tap the row: the tray opens in place and pushes the screen down (`open.md`).

## Rulings

- D-USE-7: "a lifted card with the tray closed on Now".
- D-USE-26: the tray is closed by default on Now.
- N3: the closed tray reads "To-dos" with the first title beside it, ellipsised.

## Widths

Not drawn as its own frame at any width; at the desk see `../index.md` › Platforms.

## Criteria

| ID                   | When                        | Then                                                                   | Evidence |
| -------------------- | --------------------------- | ---------------------------------------------------------------------- | -------- |
| C-USE-todos-closed-1 | Review the day or Now opens | The tray is closed: "To-dos" and the first title, ellipsised; no count | manual   |
