---
target: specs/web/ux/account/morning-reading/states/offline.md
status: approved
promoted:
boards:
  - name: "morning-reading / offline / 402 / light"
    page: "USE — daily use"
    at: [14540, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/offline-402.png
rulings: [D-USE-129]
---

# Settings › Morning reading — Offline

No connection; the list from cache. `?state=offline`.

## What shows, top to bottom

- Under the header, a `StatusLine` with the offline glyph: "Offline. The reading shows as last saved; changes wait for a connection."
- The list as last saved; grips, ··· and "+ Add a passage", "+ Add a link" drawn faint (waiting). "Off ›" still opens.

## What it does

- Nothing writes offline (D-USE-129). Rows still open their sheets to read [ASSUMPTION: a sheet opens as `offline-sheet.md`].

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-129

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When    | Then                                                                         | Evidence |
| ------------------------ | ------- | ---------------------------------------------------------------------------- | -------- |
| C-USE-morning-reading-31 | Offline | The StatusLine shows; order, off, on, delete and add wait; nothing is queued | test     |
