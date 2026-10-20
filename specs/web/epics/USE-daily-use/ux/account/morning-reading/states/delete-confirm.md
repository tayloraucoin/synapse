---
target: specs/web/ux/account/morning-reading/states/delete-confirm.md
status: approved
promoted:
boards:
  - name: "morning-reading / delete-confirm / 402 / light"
    page: "USE — daily use"
    at: [11648, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/delete-confirm-402.png
rulings: [D-USE-125]
---

# Settings › Morning reading — Delete confirm

Delete on the off passage "The long view". `?state=delete-confirm`.

## What shows, top to bottom

- The list with Passages' Off open, behind a scrim.
- An `AlertDialog`: "Delete “The long view”?", "It goes for good, words and all, and can’t be brought back. Left off, it stays here to turn on later.", "Keep it" (outline) and "Delete" (ink, `Button` default).

## What it does

- Keep it closes. Delete removes the row for good; Off shows the rest, or hides when empty. Delete is offered only on an off row (D-USE-125).

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-125

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When                               | Then                                                   | Evidence                          |
| ------------------------ | ---------------------------------- | ------------------------------------------------------ | --------------------------------- |
| C-USE-morning-reading-24 | Delete on an off row               | The dialog names the consequence; nothing on it is red | `captures/delete-confirm-402.png` |
| C-USE-morning-reading-25 | Delete is called for an active row | The server refuses it                                  | test                              |
