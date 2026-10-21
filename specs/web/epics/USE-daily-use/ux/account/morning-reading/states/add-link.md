---
target: specs/web/ux/account/morning-reading/states/add-link.md
status: approved
promoted:
boards:
  - name: "morning-reading / add-link / 402 / light"
    page: "USE — daily use"
    at: [8756, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/add-link-402.png
rulings: [D-USE-120, D-USE-126]
---

# Settings › Morning reading — Add link

The link sheet, empty. `?state=add-link`.

## What shows, top to bottom

- The list behind a scrim; a shorter `ResponsiveSheet`: × and "Add a link".
- "Title", an `Input` with "What it is, in a few words".
- "Link", an `Input` with "https://", and the hint "A web address or a Spotify link."
- "Save".

## What it does

- Save checks the link (`link-invalid.md`), writes, closes the sheet and puts the link at the end of Links. The kind is derived from the URL; nothing is fetched (D-USE-120).

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-120
- D-USE-126

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When                      | Then                                                                       | Evidence |
| ------------------------ | ------------------------- | -------------------------------------------------------------------------- | -------- |
| C-USE-morning-reading-17 | A `spotify:` URI is saved | It is stored as its `open.spotify.com` address and shows the Spotify glyph | test     |
