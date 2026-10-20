---
target: specs/web/ux/account/morning-reading/states/save-failed.md
status: approved
promoted:
boards:
  - name: "morning-reading / save-failed / 402 / light"
    page: "USE — daily use"
    at: [13094, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/save-failed-402.png
rulings: [D-USE-128]
---

# Settings › Morning reading — Save failed

Save on the edit sheet did not reach the server. `?state=save-failed`.

## What shows, top to bottom

- As `edit-passage.md`; above Save, one line in ink with an icon: "Not saved. The words are still here; Save tries again."

## What it does

- The sheet stays open with every word. Save is the retry; there is no second Try again (Assay round 1).

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-128

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When         | Then                                                           | Evidence |
| ------------------------ | ------------ | -------------------------------------------------------------- | -------- |
| C-USE-morning-reading-28 | A save fails | The sheet keeps its words and shows the line; Save tries again | test     |
