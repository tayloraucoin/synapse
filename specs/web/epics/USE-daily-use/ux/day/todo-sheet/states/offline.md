---
target: specs/web/ux/day/todo-sheet/states/offline.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page. Every edit saves on the phone and syncs on reconnect (D-USE-56, D-USE-64)"
rulings: [D-USE-56, D-USE-64, D-USE-69]
---

# To-do sheet — offline

`?state=offline`.

## What shows

Not drawn. The sheet works as online: every row edits and saves on the phone, and syncs when the connection is back, the sheet keeping its values [ASSUMPTION: D-USE-64's rule for the item sheet, followed here]. No line of its own; the screen beneath shows its `StatusLine`.

- Delete and Mark done work offline, with Undo.
- The icon picker works from the device (`../../../interactions/icon-picker/`; a set never opened before may be missing offline, as the item sheet's offline state says).
- A reminder set or changed offline: Decided (D-USE-69), it is armed once the change syncs, so one due before the phone is back online may not come; the sheet says nothing more.

## Rulings

- D-USE-56: offline, everything works on the phone.
- D-USE-64: edits save on the phone and sync later (the item sheet; this sheet follows it).

## Widths

Not drawn at any width; the default holds at every width.

## Criteria

| ID                         | When                    | Then                                         | Evidence |
| -------------------------- | ----------------------- | -------------------------------------------- | -------- |
| C-USE-todo-sheet-offline-1 | A field changes offline | It saves on the phone and syncs on reconnect | test     |
