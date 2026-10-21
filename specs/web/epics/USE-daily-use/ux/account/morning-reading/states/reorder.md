---
target: specs/web/ux/account/morning-reading/states/reorder.md
status: approved
promoted:
boards:
  - name: "morning-reading / reorder / 402 / light"
    page: "USE — daily use"
    at: [10202, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/reorder-402.png
rulings: [D-USE-123]
---

# Settings › Morning reading — Reordering

"Slow is a speed too" lifted by its grip, mid-drag. `?state=reorder`.

## What shows, top to bottom

- As `list.md`; the lifted row is raised, outlined and slightly inset, over a dashed gap at the top where it lands; "Where the feet are" has moved down.

## What it does

- The drop saves the whole order of that section (`saved-drop.md`). A drag stays within its section. A drag that fails to save puts the order back [ASSUMPTION: with the save-failed line beside the heading, as `SaveStatus` does].

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-123

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When                                | Then                                                         | Evidence |
| ------------------------ | ----------------------------------- | ------------------------------------------------------------ | -------- |
| C-USE-morning-reading-20 | A passage is dropped in a new place | The section's order saves, and Orient reads it in that order | test     |
