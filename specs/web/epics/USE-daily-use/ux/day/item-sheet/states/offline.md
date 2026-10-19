---
target: specs/web/ux/day/item-sheet/states/offline.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on any page. Every edit saves on the phone and syncs on reconnect; Linear writes read 'Updates Linear when back online' (D-USE-64)"
rulings: [D-USE-56, D-USE-64]
---

# Item sheet — offline

`?state=offline`.

## What shows

Not drawn. The sheet edits offline: a change saves on the phone and syncs when back online, with the sheet keeping its values (D-USE-64).

- The sheet works as online: every field edits and saves on the device, and syncs when the connection is back (D-USE-56: on the phone's work block, "Offline: everything works, timers and firing included, with a StatusLine").
- A change to a linked field shows under the Linear line, in ink with the info icon: "Updates Linear when back online" (step 8's words, carried in `linear-failed.md`'s note). It sends on reconnect, then shows "Updating Linear" (`linear-syncing.md`).
- Linear search (`linear-search.md`) cannot reach Linear: [ASSUMPTION] it shows the area's `StatusLine` for offline above the list and the last-synced issues, greyed only if none were synced.
- Swap and the icon picker work from the device (the library and both icon sets are local; the dev note "Icon picker: all emoji, all Lucide" loads the sets lazily, so an icon set never opened before may be missing offline [ASSUMPTION]).

## Rulings

- D-USE-56: offline, everything works on the phone's work block, with a StatusLine.
- Conflict to note: the Block view's "editing, offline" frame (`block-view / editing, offline`, carried by the Block view) draws editing as read-only with the edit controls faded. The item sheet follows D-USE-56 instead (D-USE-64); the Block view's read-only frame is revisited by the area-2 thread against this rule.

## Widths

Not drawn at any width; the default holds at every width.

## Criteria

| ID                         | When                    | Then                                                                                                  | Evidence |
| -------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------- | -------- |
| C-USE-item-sheet-offline-1 | A field changes offline | It saves on the device; a linked field shows "Updates Linear when back online" and sends on reconnect | manual   |
