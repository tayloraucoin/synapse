---
target: specs/web/ux/day/review-the-day/states/late.md
status: approved
promoted:
boards:
  - name: "review-day / late / 402 / light"
    page: "USE — daily use"
    at: [3856, 3900]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/late-402.png
rulings: [D-USE-8]
---

# Review the day — woke late

Orient opened at 8:10 against "Up at" 7:00, so Wellness has truly passed. Review the day's half of open-1's "Waking late with a block already under way"; Orient's half (the wake stamp, the same frame) is [`../../orient/states/late.md`](../../orient/states/late.md). When the wake is well past plan, "A later start" opens once over this frame: [`../../../interactions/later-start/index.md`](../../../interactions/later-start/index.md). Its note is the "Note · success" at x 3856, y 4830.

## What shows, top to bottom

- Status bar 8:10. Header and the closed tray as [`success.md`](success.md).
- **The passed row**, under the tray between hairlines, indented to the column (x 60): "Planned before 8:10 · Wellness" (label, muted) and a chevron down at the trailing edge. Every passed block folds into this one row, named in order after the dot [ASSUMPTION: several read "Wellness, Training"].
- **The column starts at the wake:** hour label "8"; Orient's locked line at 8:10 ("Orient · 5 min"); **Training 8:15 to 8:57**, its items as success; then Breakfast 9:00 to 9:30, Work 9:30 to 12:00, Lunch, Work 13:00 to 15:00, unchanged.
- The rail + beside Lunch; Ready, go as success.
- Nothing says missed, late or behind; no colour marks the passed block.

## What happens

- The day lays out from the wake: Orient takes its five minutes from 8:10.
- **A block under way at the wake** keeps its end and starts after Orient: Training, planned 8:00 to 8:57, runs 8:15 to 8:57 [ASSUMPTION, open-1; the note's bracket].
- A passed block is not run, and go mode starts at the first block after Orient [ASSUMPTION].
- The row opens: [`late-passed-open.md`](late-passed-open.md).
- Well past plan (about 15 min [ASSUMPTION]), "A later start" opens once; Close or Not now leaves this frame as drawn, and the sheet stays reachable from the "Planned before" row (its dev note).

## Words

"Planned before <wake> · <block>[, <block>]". Up at is said as "Up at 8:10" where the time shows (the later-start sheet); never "You are up late" (open-1, no second person).

## The notes on the boards

**"review-day / late / 402 / light"**, "Note · success" @ x 3856, y 4830:

> late · woke at 8:10
>
> Wake moved to 8:10 so a block has truly passed. Wellness folds into "Planned before 8:10"; nothing says missed. [ASSUMPTION: a block under way at the wake keeps its end and starts after Orient, Training 8:15 to 8:57]

## Rulings

- N3's "woke late" row: the column starts at the real wake; passed blocks fold into one row that opens; nothing is marked missed. N3 drew "Planned before 7:40"; the fixture's wake is 8:10 (D-USE-8's morning).
- Note 62: never a clock telling Taylor off.

## Widths

Drawn at: 402. At the desk: the row spans the capped column under the tray (D-USE-39).

## Criteria

| ID                          | When                             | Then                                                                                        | Evidence                |
| --------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------- |
| C-USE-review-the-day-late-1 | The wake is 8:10 against 7:00    | The column starts at 8:10 with Orient; Wellness folds into "Planned before 8:10 · Wellness" | `captures/late-402.png` |
| C-USE-review-the-day-late-2 | A block is under way at the wake | It starts after Orient and keeps its end                                                    | test                    |
| C-USE-review-the-day-late-3 | Any late state                   | No word, mark or colour says missed or late                                                 | `captures/late-402.png` |
