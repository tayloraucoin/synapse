---
target: specs/web/ux/account/avatar-menu/states/offline.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn: the menu still opens offline and the screens behind it show their own offline (step 9's archived note, N2)"
rulings: [D-USE-88]
---

# Avatar menu — offline

`?state=offline`.

## What shows

Not drawn. The menu opens and reads as online: Who from the account already on the device, and the same rows (installed or not). No line of its own. The screen beneath keeps its `StatusLine`.

## What the person can do

Every row opens its screen or sheet; each shows its own offline state (Set my days, Meal topics, the Profile sheet's `../../profile-sheet/states/not-saved.md`, the Install sheet, Settings).

## Rulings

- N2's States table: "The menu still opens; the screens behind it show their own offline state."
- Step 9's archived note (`avatar-menu / installed, no photo / 402 / light`, "Note · name only, 96"): "Offline needs no frame: the menu still opens and the screens behind it show their own offline." Quoted in full in `no-photo.md`.
- D-USE-88: the rows, the same offline as online.

## Widths

Not drawn at any width; the menu is the same at every width.

## Criteria

| ID                          | When                      | Then                                     | Evidence |
| --------------------------- | ------------------------- | ---------------------------------------- | -------- |
| C-USE-avatar-menu-offline-1 | The avatar tapped offline | The menu opens as online, every row live | manual   |
