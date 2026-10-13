---
target: specs/web/ux/interactions/copy-from/states/copy-picker.md
status: approved
promoted:
boards:
  - name: "set-my-days / copy-picker / 402 / light"
    page: "USE — set up"
    at: [1928, 1260]
    note: "Note · grid, 96 @ x 1928, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/interactions/copy-from/captures/copy-picker-402.png
rulings: [D-USE-32, D-USE-39, D-USE-83]
---

# Copy from — the picker

Step 1 of [`../index.md`](../index.md): the usual Thursday, part built, with the day's ··· › "Copy from…" tapped. A sheet lists the days that can be copied. `?state=copy-picker`.

## What shows, top to bottom

- Behind, under a scrim: Set my days on "Every Thursday" (‹ Week, "Saved"), the chips M to S with Thursday filled ink and dots under the built days, Up at 7:00, Lights out 22:30, the ···, and the column from 7 with Orient · 5 min and Wellness 7:05 to 8:00.
- The sheet from the lower two thirds, with a grab handle: × on the left, "Copy from" (heading), then the helper "Every Thursday takes the blocks of the day picked. Built days only." (muted).
- One row per built day, divided by hairlines, a chevron on the right of each:
  - **Monday**, a strip of its blocks in their kind colours, "Wellness, Training, Breakfast, Work, Lunch, Work".
  - **Tuesday**, "Wellness, Breakfast, Writing, Lunch, Work".
  - **Wednesday**, "Wellness, Training, Breakfast, Work, Lunch, Work".
  - **Sunday** [PROPOSED], a dashed empty strip, "One checklist, no times".
- Thursday (the day being set), Friday and Saturday (nothing set) are not listed.
- The strip: one bar per block, in its kind's colour, its width by the block's length [ASSUMPTION: drawn so, no rule written]; transitions are not drawn in it. Life is yellow where it appears (D-USE-79). Names, never counts.

## What the person can do

- **Tap a day**: Thursday has blocks, so the ask opens ([`replace-confirm.md`](replace-confirm.md)). On an empty day it copies at once ([`copied-undo.md`](copied-undo.md)).
- **×** or a swipe down: closes; nothing changes.

## Words

"Copy from" · "Every Thursday takes the blocks of the day picked. Built days only." · the day names · the blocks named, joined by commas · "One checklist, no times". In This week the title line names the date [ASSUMPTION: "Thursday, 15 October takes the blocks of the day picked."; not drawn].

## The notes on the boards

**set-my-days / copy-picker / 402 / light** (Note · grid, 96 @ x 1928, y 2190):

> Copy from picker (usual Thursday, part built)
>
> From the day's ···, Copy from… opens a sheet listing built days only, each with a strip of its blocks in their kind colours and the blocks named (no counts). The day being set is left out. [PROPOSED] Sunday's checklist shows as a dashed strip, "One checklist, no times".

## Rulings

- D-USE-32: approved as drawn (built days only, the strip, the blocks named).
- No built day to offer: not drawn [ASSUMPTION: the ··· item and "Other day…" do not show when no other day is built, as on the first day].

## Widths

Drawn at: 402. From 1024 the sheet is the right panel beside the list-detail Set my days (D-USE-39, D-USE-83).

## Access

Each row is one button, named "<Day>: <blocks named>"; the strip is hidden from assistive tech, since its names are in words. The colours are never alone: every block is named.

## Criteria

| ID                            | When                                                             | Then                                                                                      | Evidence                       |
| ----------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------ |
| C-USE-copy-from-copy-picker-1 | Copy from… on Thursday with Monday to Wednesday and Sunday built | Four rows, each with its strip and its blocks named; Thursday, Friday and Saturday absent | `captures/copy-picker-402.png` |
| C-USE-copy-from-copy-picker-2 | A checklist day is built                                         | It shows a dashed strip and "One checklist, no times"                                     | `captures/copy-picker-402.png` |
