---
target: specs/web/ux/day/review-the-day/states/late-passed-open.md
status: approved
promoted:
boards:
  - name: "review-day / late, passed open / 402 / light"
    page: "USE — daily use"
    at: [4338, 3900]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/late-passed-open-402.png
rulings: [D-USE-69]
---

# Review the day — woke late, the passed row open

The "Planned before 8:10" row opened. A state of Review the day, not a step of "A later start": it is the row's own disclosure, and the later-start sheet is a separate overlay ([`../../../interactions/later-start/index.md`](../../../interactions/later-start/index.md)). Its note is the "Note · success" at x 4338, y 4830.

## What shows, top to bottom

- As [`late.md`](late.md), status bar 8:10, with the row open: "Planned before 8:10 · Wellness" and a chevron up.
- **One card per passed block**, indented to the column: `--color-surface` fill, `--radius-control`, a 3 px left edge in the kind's dot colour (leaf): "Wellness" (body, semibold) over "7:05 to 8:00" (label, muted); at the trailing edge "Move later" (outlined `Button`, small) and "Leave" (ghost text `Button`, muted).
- The column below moves down by the card's height: Orient at 8:10, Training 8:15 to 8:57, Breakfast, Work, Lunch.

## What the person can do

- **Move later:** puts the passed block back on today's column. Decided (D-USE-69) where it lands (the note: "still open (overview, Open)"). Default: right after Orient at the wake, with the blocks after it sliding by its length, as "Slide the day back" does (the engine shared with Make room, [`../../../interactions/make-room/index.md`](../../../interactions/make-room/index.md)), and an Undo Toaster; the alternative is the end of the day.
- **Leave:** the block stays folded and is not run; nothing is marked [ASSUMPTION: the card goes and the row keeps its name]. With every card left the row folds closed; Leave holds for the visit and writes nothing, so a reopened screen shows the card again [ASSUMPTION, USE-38].
- Tap the row's heading to fold it again.

## Words

"Move later" · "Leave". No "missed", no "skipped".

## The notes on the boards

**"review-day / late, passed open / 402 / light"**, "Note · success" @ x 4338, y 4830:

> late · passed open
>
> The row opens to each passed block, with Move later or Leave. Where Move later puts it is still open (overview, Open).

## Rulings

- N3: "Move a passed block later, or leave it". No D-line rules where Move later lands; D-USE-69 rules it as the drawn path above. Move to's own `[NEEDS DECISION]` ("Move to later" on Block complete) is a different control ([`../../../interactions/move-to/index.md`](../../../interactions/move-to/index.md)).

## Widths

Drawn at: 402. At the desk: the cards span the capped column (D-USE-39).

## Criteria

| ID                                      | When                     | Then                                                        | Evidence                            |
| --------------------------------------- | ------------------------ | ----------------------------------------------------------- | ----------------------------------- |
| C-USE-review-the-day-late-passed-open-1 | The passed row is opened | Each passed block shows with its span, Move later and Leave | `captures/late-passed-open-402.png` |
| C-USE-review-the-day-late-passed-open-2 | Move later               | The block lands where the ruling says, with Undo            | test                                |
