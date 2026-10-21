---
target: specs/web/ux/account/morning-reading/states/row-menu.md
status: approved
promoted:
boards:
  - name: "morning-reading / row-menu / 402 / light"
    page: "USE — daily use"
    at: [10684, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/row-menu-402.png
rulings: [D-USE-123, D-USE-124]
---

# Settings › Morning reading — Row menu

··· on "Slow is a speed too". `?state=row-menu`.

## What shows, top to bottom

- As `list.md`, the row tinted; a menu below its ···: "Edit", "Move up", "Move down", a rule, "Turn off" over "Leaves Orient, kept under Off" (muted).

## What it does

- Edit opens the sheet. Move up and Move down move the row one place and save (`saved-drop.md`). The first row has no Move up and the last no Move down. Turn off gives `off-undo.md`.

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-123
- D-USE-124

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When                          | Then                                 | Evidence |
| ------------------------ | ----------------------------- | ------------------------------------ | -------- |
| C-USE-morning-reading-21 | Move up on the second passage | It becomes first and the order saves | test     |
