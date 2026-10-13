---
target: specs/web/ux/day/running/states/over-a-minute-or-more.md
status: approved
promoted:
boards:
  - name: "running / over, a minute or more / 402 / light"
    page: "USE — daily use"
    at: [964, 13980]
    note: "Frame @ x 964, y 14910"
    capture: specs/web/epics/USE-daily-use/ux/day/running/captures/over-a-minute-or-more-402.png
rulings: [D-USE-29, D-USE-72]
---

# Running — over, in the danger band

The count is a minute or more past the planned length. `?state=over-a-minute-or-more`. Supersedes round 1's `running / over / 402 / light` (Archive 3, x 0), which drew "3 min over" in ink.

## What shows, top to bottom

As [`counting-down.md`](counting-down.md) at 7:27, except the figure: "3 min over" (whole minutes, then "over") in danger (`destructive-text`), "of 10 min" beside it, muted. Meta "Started 7:14". The border, the dot, Pause and Done do not change. No sound, no vibration.

## What the person can do

As [`counting-down.md`](counting-down.md). Done records 13 min and the row reads by the Done bands (13 of 10 is 30% over: danger).

## Words

"3 min over"; "of 10 min". From a minute over the figure drops the seconds and reads whole minutes.

## The notes on the boards

**"running / over, a minute or more / 402 / light"**, note "Frame" @ x 964, y 14910:

> over, a minute or more
>
> From a minute over, "3 min over" in danger (destructive-text). Bends "nothing red on the tabs" at Taylor's call; the word carries the meaning too.

## Rulings

- D-USE-29: danger reuses `destructive-text`; "over" always beside it. Bends product-rules "Nothing red on the execution tabs", P-A04 and N4 note 62's "ink only" (named, at Taylor's call). Supersedes round 1's over in ink (Archive 3).
- D-USE-72: the band follows Done's percent bands (Decided (D-USE-72)), not "a minute or more": a 45-min item is not red at 46. For this 10-min item danger starts at 13 min, so "3 min over" reads danger as drawn. The form "n min over" from a minute on stands as drawn.

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                                    | When                         | Then                                                                     | Evidence                                 |
| ------------------------------------- | ---------------------------- | ------------------------------------------------------------------------ | ---------------------------------------- |
| C-USE-running-over-a-minute-or-more-1 | A 10-min item reaches 13 min | "3 min over" in `destructive-text`, the word beside it, border unchanged | `captures/over-a-minute-or-more-402.png` |
| C-USE-running-over-a-minute-or-more-2 | A 45-min item reaches 46 min | The figure reads "1 min over" in ink, not danger                         | test                                     |
