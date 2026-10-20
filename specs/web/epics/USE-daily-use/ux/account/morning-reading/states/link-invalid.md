---
target: specs/web/ux/account/morning-reading/states/link-invalid.md
status: approved
promoted:
boards:
  - name: "morning-reading / link-invalid / 402 / light"
    page: "USE — daily use"
    at: [9720, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/link-invalid-402.png
rulings: [D-USE-120, D-USE-126]
---

# Settings › Morning reading — Link not openable

The link sheet with a link that cannot open. `?state=link-invalid`.

## What shows, top to bottom

- As `add-link.md`: Title "Morning calm", Link "morning calm playlist".
- Under the field, in ink: "That doesn’t open as a link. Paste the address from the browser or from Spotify’s Share." The field's border is ink, not red.

## What it does

- Save waits until the link parses as `https:` or `spotify:`. The line clears as the field changes [ASSUMPTION: checked on Save and then on each change].

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

| ID                       | When                                           | Then                                         | Evidence |
| ------------------------ | ---------------------------------------------- | -------------------------------------------- | -------- |
| C-USE-morning-reading-19 | A link that is neither `https:` nor `spotify:` | The line shows in ink and nothing is written | test     |
