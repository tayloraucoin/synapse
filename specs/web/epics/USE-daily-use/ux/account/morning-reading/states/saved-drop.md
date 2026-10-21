---
target: specs/web/ux/account/morning-reading/states/saved-drop.md
status: approved
promoted:
boards:
  - name: "morning-reading / saved-drop / 402 / light"
    page: "USE — daily use"
    at: [12130, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/saved-drop-402.png
rulings: [D-USE-128]
---

# Settings › Morning reading — Saved, after a drop

The new order after the drop in `reorder.md`. `?state=saved-drop`.

## What shows, top to bottom

- As `list.md` with "Slow is a speed too" first; `SaveStatus` "Saved" (muted) on the right of the Passages heading.

## What it does

- "Saved" fades after a moment [ASSUMPTION: `SaveStatus`'s own timing]. No toast.

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-128

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When                   | Then                                                  | Evidence                      |
| ------------------------ | ---------------------- | ----------------------------------------------------- | ----------------------------- |
| C-USE-morning-reading-26 | A drop or a move saves | "Saved" shows beside that section's heading; no toast | `captures/saved-drop-402.png` |
