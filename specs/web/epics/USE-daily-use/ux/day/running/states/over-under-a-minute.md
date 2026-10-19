---
target: specs/web/ux/day/running/states/over-under-a-minute.md
status: approved
promoted:
boards:
  - name: "running / over, under a minute / 402 / light"
    page: "USE — daily use"
    at: [482, 13980]
    note: "Frame @ x 482, y 14910"
    capture: specs/web/epics/USE-daily-use/ux/day/running/captures/over-under-a-minute-402.png
rulings: [D-USE-29, D-USE-38, D-USE-72]
---

# Running — over, in the warning band

The count has passed the planned length by less than a minute. `?state=over-under-a-minute`. Supersedes round 1's `running / over / 402 / light` (Archive 3, x 0) with [`over-a-minute-or-more.md`](over-a-minute-or-more.md).

## What shows, top to bottom

As [`counting-down.md`](counting-down.md) at 7:24, except the figure: "0:40 over" (minutes and seconds, then "over", one run of text at the figure's size) in warning yellow (`warning-text`, [PROPOSED token]), "of 10 min" beside it, muted. Meta still "Started 7:14". The border, the dot, Pause and Done do not change. No sound, no vibration.

## What the person can do

As [`counting-down.md`](counting-down.md): Done records the time taken (here about 10:40) and colours the row by the Done bands ([`timed-over-warning.md`](timed-over-warning.md)); Pause holds it.

## Words

"0:40 over"; "of 10 min". "Over" is the one word; never late, behind or overdue (N5).

## The notes on the boards

**"running / over, under a minute / 402 / light"**, note "Frame" @ x 482, y 14910:

> over, under a minute
>
> Under a minute past the planned length the figure reads "0:40 over" in warning yellow [PROPOSED token]. The buttons and border don't change.

## Rulings

- D-USE-29: past the plan, the word "over" always sits beside the colour, so colour is never alone. Bends product-rules "Nothing red on the execution tabs", P-A04 and N4 note 62's "ink only", at Taylor's call.
- D-USE-72: **Running uses Done's percent bands** (Decided (D-USE-72), the dev note's "[PROPOSED] later"). This replaces the drawn rule "under a minute over is warning": the band is set by percent over the plan (to 10% ink, to 25% warning, past 25% danger; edges whole minutes, at least 1 min; `../../../dev-notes/over-by-how-much.md`). For this 10-min Meditate, "0:40 over" reads ink; warning starts at 12 min ("2 min over"). The frame stands as the drawn form of the warning band and of an under-a-minute figure ("m:ss over").
- D-USE-72, D-USE-38: `warning-text` (oklch 62% 0.13 85 on the figure, 58% on small text) stays [PROPOSED] until the colours look.

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39). A work item over its range at the desk and on phone Today: `../../../work/today/states/over-the-range.md`, cited.

## Criteria

| ID                                  | When                                        | Then                                                                       | Evidence                               |
| ----------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------- |
| C-USE-running-over-under-a-minute-1 | The count passes the plan by under a minute | The figure reads "m:ss over"; border and buttons unchanged; no sound       | `captures/over-under-a-minute-402.png` |
| C-USE-running-over-under-a-minute-2 | Any time past the plan                      | Its colour follows Done's percent bands, and "over" is always in the words | test                                   |
