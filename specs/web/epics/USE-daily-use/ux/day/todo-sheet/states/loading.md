---
target: specs/web/ux/day/todo-sheet/states/loading.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page; the sheet opens on a to-do already on screen in the tray"
rulings: [D-USE-69]
---

# To-do sheet — loading

`?state=loading`.

## What shows

Not drawn. Decided (D-USE-69), N/A, as the item sheet's (D-USE-65 ruled it there): the sheet opens from a row already in the tray, so its fields are there at once, with no spinner.

## Rulings

None rules this state for the to-do sheet. The intent file left it [FILL] at handoff.

## Widths

Not drawn at any width; the default holds at every width.

## Criteria

| ID                         | When            | Then                                               | Evidence |
| -------------------------- | --------------- | -------------------------------------------------- | -------- |
| C-USE-todo-sheet-loading-1 | The sheet opens | Its fields render at once from the to-do on screen | manual   |
