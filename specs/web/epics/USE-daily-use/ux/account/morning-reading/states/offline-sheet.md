---
target: specs/web/ux/account/morning-reading/states/offline-sheet.md
status: approved
promoted:
boards:
  - name: "morning-reading / offline-sheet / 402 / light"
    page: "USE — daily use"
    at: [15022, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/offline-sheet-402.png
rulings: [D-USE-129]
---

# Settings › Morning reading — Offline, sheet open

The connection went while the edit sheet was open. `?state=offline-sheet`.

## What shows, top to bottom

- As `edit-passage.md`; above Save, the `StatusLine` "Offline. The words stay here; Save waits for a connection."; Save waits (disabled).

## What it does

- The words stay while the sheet is open. Save comes back when the connection does; nothing is queued.

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-129

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When                                   | Then                                                   | Evidence |
| ------------------------ | -------------------------------------- | ------------------------------------------------------ | -------- |
| C-USE-morning-reading-32 | The connection drops with a sheet open | The words stay and Save waits; on reconnect Save works | test     |
