---
target: specs/web/ux/day/todo-sheet/states/error.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page"
rulings: [D-USE-69]
---

# To-do sheet — error

A change that doesn't save while online. `?state=error`.

## What shows

Not drawn. Decided (D-USE-69), as Now's "error on check" (`now / error on check / 402 / light`, carried by Now): the field goes back to its last saved value and a line under its row reads "Not saved. Try again.", Try again underlined, in ink with the info icon. Never red. Every other row stays live. Offline is not an error (`offline.md`).

## Rulings

None rules this state. The intent file left it [FILL] at handoff.

## Widths

Not drawn at any width; the default holds at every width.

## Criteria

| ID                       | When                          | Then                                                                    | Evidence |
| ------------------------ | ----------------------------- | ----------------------------------------------------------------------- | -------- |
| C-USE-todo-sheet-error-1 | A change fails to save online | The field reverts; "Not saved. Try again." in ink under its row; no red | manual   |
