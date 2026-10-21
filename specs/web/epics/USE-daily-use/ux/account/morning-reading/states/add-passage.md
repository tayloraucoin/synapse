---
target: specs/web/ux/account/morning-reading/states/add-passage.md
status: approved
promoted:
boards:
  - name: "morning-reading / add-passage / 402 / light"
    page: "USE — daily use"
    at: [6346, 2640]
    note: "Row label · Morning reading @ x 4340, y 2640 (no per-frame note)"
    capture: specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/add-passage-402.png
rulings: [D-USE-120, D-USE-121, D-USE-126, D-USE-130]
---

# Settings › Morning reading — Add passage

The passage sheet, empty, without images. `?state=add-passage`.

## What shows, top to bottom

- Behind a scrim: the list as in `list.md`.
- `ResponsiveSheet` near full height: the grabber; × and "Add a passage".
- "Title" with "Optional" on the right, an `Input` with the placeholder "Untitled".
- "Passage", a `RichTextEditor` in Newsreader with the placeholder "A few lines, a paragraph, a page." and its toolbar at the foot (bold, italic, quote, list, link).
- "Save", a full-width `Button`.

## What it does

- Save with an empty body waits [ASSUMPTION: Save is disabled until the body has words, as the body is required]. Save writes, closes the sheet and gives `saved.md`.
- × or Escape with words typed gives `discard.md`.

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

None on the frame. The row label: "Writes what Orient reads: passages and links. Opened from Settings, beside Connections. … Images are designed, not built (dev note). Round 1 picked B; A and C sit at the row's end. Round 2: Assay round 1's red findings fixed."

## Rulings

- D-USE-120
- D-USE-121
- D-USE-126
- D-USE-130

## Widths

Drawn at: 402. At the desk: as the surface's Platforms (`../index.md`).

## Criteria

| ID                       | When                          | Then                                                                                                    | Evidence                       |
| ------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------ |
| C-USE-morning-reading-11 | Add a passage                 | The sheet opens empty, without an Images row; the editor offers only bold, italic, quote, list and link | `captures/add-passage-402.png` |
| C-USE-morning-reading-12 | Save with a body and no title | The passage saves with no title and shows its first line alone in the list                              | test                           |
