---
target: specs/web/ux/day/todos/states/offline.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page. Checks, adds and edits save on the phone and sync when back online (D-USE-56, D-USE-64)"
rulings: [D-USE-56, D-USE-64]
---

# To-dos tray — offline

`?state=offline`.

## What shows

Not drawn. The tray works as online; nothing in the tray changes look.

- Checking, unchecking and adding a to-do save on the phone and sync when the connection is back. The screen's own `StatusLine` says so: on Now, "Offline. Checks are saved on this phone." (`now / offline / 402 / light`, carried by Now).
- A row opens the To-do sheet, which edits offline too (`../../todo-sheet/states/offline.md`).
- A reminder already set still arrives [ASSUMPTION: the reminder is scheduled once it has synced; one set while offline is armed on reconnect, `../../todo-sheet/states/offline.md`].

## Rulings

- D-USE-56: offline, everything works on the phone, with a StatusLine.
- D-USE-64: edits save on the phone and sync later (ruled for the item sheet; the tray follows it). Closes the intent file's [ASSUMPTION] "offline checks save on the phone, as Now".

## Widths

Not drawn at any width; the default holds at every width.

## Criteria

| ID                    | When                                | Then                                                                   | Evidence |
| --------------------- | ----------------------------------- | ---------------------------------------------------------------------- | -------- |
| C-USE-todos-offline-1 | A to-do is checked or added offline | It saves on the phone and syncs on reconnect; the tray looks as online | test     |
