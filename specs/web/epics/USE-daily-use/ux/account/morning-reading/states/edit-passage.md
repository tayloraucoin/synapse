---
target: specs/web/ux/account/morning-reading/states/edit-passage.md
status: approved
promoted:
boards:
  - name: "morning-reading / edit-passage / 402 / light"
    page: "USE — daily use"
    at: [7310, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/edit-passage-402.png
rulings: [D-USE-120, D-USE-126, D-USE-128]
---

# Settings › Morning reading — Edit passage

The passage sheet filled with "Where the feet are". `?state=edit-passage`.

## What shows, top to bottom

- Behind a scrim: the list as in `list.md`.
- The sheet as `add-passage.md`, titled "Edit passage".
- Title "Where the feet are"; the body rendered by the editor: a paragraph, a quote in italic with a rule on its left, and a closing line.

## What it does

- Save writes and closes the sheet; the row shows the new title and first line. No toast (D-USE-128).

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-120
- D-USE-126
- D-USE-128

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When                    | Then                                                                                 | Evidence |
| ------------------------ | ----------------------- | ------------------------------------------------------------------------------------ | -------- |
| C-USE-morning-reading-14 | A passage row is opened | The sheet holds its title and its Markdown as written, rendered as Orient renders it | test     |
