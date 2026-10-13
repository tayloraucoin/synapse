---
target: specs/web/ux/day/orient/states/late.md
status: approved
promoted:
boards:
  - name: "orient / late / 402 / light"
    page: "USE — daily use"
    at: [1446, 2640]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/orient/captures/late-402.png
rulings: [D-USE-9, D-USE-14]
---

# Orient — woke late

The first open of the day comes well after "Up at" (the fixture: 8:10 against a planned 7:00). Its note is the "Note · success" at x 1446, y 3570.

## What shows, top to bottom

The same frame as [`success.md`](success.md), on purpose. Only the phone's status bar differs (8:10). Nothing on Orient says late: no time, no line, no colour, no badge.

## What happens

- **The open is the wake.** Opening Orient stamps the wake time (8:10) once, on the server (as built, `woke_at`). Orient, the locked five-minute block, moves to the real wake time (N3: "Orient moves to the real wake time, and the day lays out from there").
- **The consequence shows on the next screen.** Review the day lays out from 8:10 ("Review the day, late"), carried by `day/review-the-day/` (written by a later thread of this handoff). There, a block already under way keeps its end and starts after Orient [ASSUMPTION, open-1: Wellness has passed, Training 8:15 to 8:57]. When the wake is well past plan (about 15 minutes [ASSUMPTION]), "A later start" opens once over Review the day [PROPOSED, drawn on Review's row; open-1]; it is Review the day's, not Orient's.
- Everything else as success.

## What the person can do

As [`success.md`](success.md).

## Words

As the index's Words. Nothing about lateness on this screen; on Review the day the words avoid the second person ("Up at 8:10", open-1).

## The notes on the boards

**"orient / late / 402 / light"**, note "Note · success" @ x 1446, y 3570:

> late · woke at 8:10
>
> The same frame, on purpose: nothing here says late. The consequence shows on the next screen, where the day lays out from 8:10 (Review the day, late).

## Rulings

- No D-line rules lateness on Orient; N3's state table ("woke late: The same frame") and the product rule against a clock telling Taylor off (note 62) hold. D-USE-9 and D-USE-14 as success.
- Open-1's "Waking late with a block already under way" and "A later start" are carried by Review the day; this file names Orient's half (the wake stamp, the same frame).

## Widths

Drawn at: 402. Not drawn at: the desk; as success (D-USE-39).

## Criteria

| ID                  | When                                        | Then                                                                    | Evidence                |
| ------------------- | ------------------------------------------- | ----------------------------------------------------------------------- | ----------------------- |
| C-USE-orient-late-1 | The first open at 8:10 against "Up at" 7:00 | Orient matches the success frame; no word, time or colour marks it late | `captures/late-402.png` |
| C-USE-orient-late-2 | Orient opens late                           | The wake is stamped at the open, and Review the day lays out from it    | test                    |
