---
target: specs/web/ux/account/install-sheet/states/installed.md
status: approved
promoted:
boards: []
not_drawn: "Not reachable: once Synapse runs from the home screen, every way in is gone"
rulings: [D-USE-88, D-USE-89]
---

# Install sheet — installed

`?state=installed` is not a state the sheet shows.

## What shows

Nothing: the sheet is not reachable (N2, "installed: Not reachable"). Once Synapse runs from the home screen, "Install the app" leaves the avatar menu (D-USE-88; `../../avatar-menu/index.md`), the once-only offer is not shown (`../../../set-my-days/set-my-days/states/install-offer.md`), and the to-do sheet's reminder line has no How (`../../../day/todo-sheet/states/not-installed.md`). At the desk it is never reachable either (D-USE-89).

[ASSUMPTION: a direct `?sheet=install` while installed closes to the screen beneath, as a sheet with no way in.]

## Rulings

- N2 "Install sheet": installed, not reachable.
- D-USE-88: Install the app only while not installed. D-USE-89: hidden at the desk.

## Widths

Not drawn at any width.

## Criteria

| ID                              | When                              | Then                                              | Evidence |
| ------------------------------- | --------------------------------- | ------------------------------------------------- | -------- |
| C-USE-install-sheet-installed-1 | Synapse runs from the home screen | No "Install the app", no offer, no How; no way in | test     |
