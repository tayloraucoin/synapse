---
target: specs/web/ux/account/morning-reading/states/error.md
status: approved
promoted:
boards:
  - name: "morning-reading / error / 402 / light"
    page: "USE — daily use"
    at: [14058, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/error-402.png
rulings: [D-USE-133]
---

# Settings › Morning reading — Error

The read failed. `?state=error`.

## What shows, top to bottom

- Header and back stay. One `RegionRetry` under the hairline: "Passages and links didn’t load. Orient still shows what was saved." and "Try again".

## What it does

- Try again reads again. Partial is N/A: one read loads both sections (D-USE-133).

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-133

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When           | Then                                             | Evidence                 |
| ------------------------ | -------------- | ------------------------------------------------ | ------------------------ |
| C-USE-morning-reading-30 | The read fails | One RegionRetry with Try again; back still works | `captures/error-402.png` |
