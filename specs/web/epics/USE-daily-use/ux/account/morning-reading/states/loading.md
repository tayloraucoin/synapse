---
target: specs/web/ux/account/morning-reading/states/loading.md
status: approved
promoted:
boards:
  - name: "morning-reading / loading / 402 / light"
    page: "USE — daily use"
    at: [13576, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/loading-402.png
rulings: [D-USE-133]
---

# Settings › Morning reading — Loading

The first read in flight. `?state=loading`.

## What shows, top to bottom

- Header at once; "Passages" with its order line and "Links" with its line, then `SkeletonRow`s where the rows sit (three, then two). No grips, ···, add rows or Off yet.

## What it does

- Rows replace the skeletons when the one read returns.

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-133

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When             | Then                                     | Evidence                   |
| ------------------------ | ---------------- | ---------------------------------------- | -------------------------- |
| C-USE-morning-reading-29 | The read is slow | Headings show at once with skeleton rows | `captures/loading-402.png` |
