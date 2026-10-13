---
target: specs/web/ux/day/todos/states/error.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page; Now's 'error on check' frame draws the pattern for a check that fails"
rulings: [D-USE-69]
---

# To-dos tray — error

Two cases: the list fails to load (the screen's "partial": the day loads and the tray fails), and one check fails to save. `?state=error`.

## What shows

- **A check that doesn't save** [ASSUMPTION: as Now's `now / error on check / 402 / light`, "USE — daily use" x 3374, y 11460, carried by Now]: the box reverts and a line under the row reads "Not saved. Try again.", Try again underlined, in ink. Never red.
- **The list fails to load:** Decided (D-USE-69), the closed trigger reads "To-dos" alone; open, one line in ink with the info icon, "To-dos didn't load. Try again.", Try again underlined, above "Add a to-do". Never red, no count. The screen beneath is unaffected.

## The note it follows

Now's "error on check" note (Frame @ x 3374, y 12390, carried by Now): "A check that doesn't save: the box reverts and a line under the row reads 'Not saved. Try again.', Try again underlined, in ink. Never red."

## Rulings

None rules the tray's error directly. Offline is not an error (`offline.md`, D-USE-56).

## Widths

Not drawn at any width; the default holds at every width.

## Criteria

| ID                  | When                         | Then                                                                  | Evidence |
| ------------------- | ---------------------------- | --------------------------------------------------------------------- | -------- |
| C-USE-todos-error-1 | A check fails to save online | The box reverts; "Not saved. Try again." in ink under the row; no red | manual   |
| C-USE-todos-error-2 | The list fails to load       | The screen beneath works; the tray offers Try again in ink            | manual   |
