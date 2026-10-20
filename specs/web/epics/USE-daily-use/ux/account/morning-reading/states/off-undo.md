---
target: specs/web/ux/account/morning-reading/states/off-undo.md
status: approved
promoted:
boards:
  - name: "morning-reading / off-undo / 402 / light"
    page: "USE — daily use"
    at: [11166, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/off-undo-402.png
rulings: [D-USE-124]
---

# Settings › Morning reading — Off, with Undo

Just after Turn off on "Slow is a speed too". `?state=off-undo`.

## What shows, top to bottom

- As `list.md` without that row.
- The `Toaster` at the foot, ink: "“Slow is a speed too” is off. Orient no longer shows it." and "Undo".

## What it does

- Undo clears `archived_at` and puts the row back where it was. Without Undo it waits in Off.

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-124

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When     | Then                                                      | Evidence                    |
| ------------------------ | -------- | --------------------------------------------------------- | --------------------------- |
| C-USE-morning-reading-22 | Turn off | The row leaves the list and Orient; the toast offers Undo | `captures/off-undo-402.png` |
| C-USE-morning-reading-23 | Undo     | The row is back in its place, on again                    | test                        |
