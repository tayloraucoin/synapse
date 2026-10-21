---
target: specs/web/ux/account/morning-reading/states/list.md
status: approved
promoted:
boards:
  - name: "morning-reading / list / 402 / light"
    page: "USE — daily use"
    at: [4900, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/list-402.png
rulings: [D-USE-119, D-USE-122, D-USE-130, D-USE-131, D-USE-133]
---

# Settings › Morning reading — List

Three passages and two links in reading order, both Off lists collapsed. `?state=list`.

## What shows, top to bottom

- Status bar, 21:40.
- Header: "‹ Settings", "Morning reading", a hairline.
- Passages: the heading, the order line, then "Where the feet are" over its first line, "Slow is a speed too" over its first line, and the untitled passage as its first line alone (serif, muted). Each row has a grip on the left and ··· on the right.
- "+ Add a passage", then "Off ›", then a rule.
- Links: the heading and its line; "Morning calm" (Spotify glyph, host `open.spotify.com`) and "Ten minutes of stretching" (link glyph, `example.org`), each with a grip and ···; "+ Add a link"; "Off ›".

## What it does

- A row opens its sheet (`edit-passage.md`, `edit-link.md`). ··· opens `row-menu.md`. A grip drags (`reorder.md`). "Off ›" opens `list-off-open.md`.

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-119
- D-USE-122
- D-USE-130
- D-USE-131
- D-USE-133

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                      | When                            | Then                                                                               | Evidence                |
| ----------------------- | ------------------------------- | ---------------------------------------------------------------------------------- | ----------------------- |
| C-USE-morning-reading-7 | The list opens with active rows | Passages, then Links, each in `sort_order`; the add rows; both Off lists collapsed | `captures/list-402.png` |
