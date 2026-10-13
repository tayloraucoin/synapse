---
target: specs/web/ux/day/review-the-day/states/sunday-now-line.md
status: approved
promoted:
boards:
  - name: "review-day / sunday, now-line / 402 / light"
    page: "USE — daily use"
    at: [1928, 5160]
    note: "Frame @ x 1928, y 6090"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/sunday-now-line-402.png
rulings: [D-USE-30]
---

# Review the day — the now-line

The now-line on a timed day view, drawn on the Sunday checklist day at 11:20 [PROPOSED everywhere]. Its note is the "Frame" at x 1928, y 6090.

## What shows, top to bottom

- As [`sunday-checklist-and-plans.md`](sunday-checklist-and-plans.md) (status bar 11:20), plus:
- **The time tag** in the rail at 11:20: a solid `--color-now` (verdigris) pill, "11:20" in `--color-primary-foreground` (caption, semibold).
- **A faint line** in `--color-now` across the content from the tag (pattern 7).
- The hour label under the tag ("11") is hidden.
- The All day strip stays pinned above.

## What happens

- The line moves with the clock [ASSUMPTION: each minute] and the column opens scrolled to it when "now" is in the day [ASSUMPTION; on a weekday morning Orient's place at the top comes first].
- Verdigris is "this moment" only.

## What the person can do

As the frame beneath; tapping the All day strip opens the checklist (block view).

## Words

The time, as "11:20". Nothing else.

## The notes on the boards

**"review-day / sunday, now-line / 402 / light"**, "Frame" @ x 1928, y 6090:

> sunday, now-line [PROPOSED everywhere]
>
> A now-line on every timed day view: a solid verdigris time tag in the rail, a faint line over the content (pattern 7), the hour label under it hidden. Verdigris is "this moment". The All day strip stays pinned above; tapping it opens the checklist (block view).

## Rulings

- D-USE-30: a now-line runs across every timed day view (time tag in the rail, faint line over content). open-2 (feedback round): on Review the day, Schedule and the block view; Schedule during go builds on it. The work block at the desk keeps the now-tag in the time gutter too (D-USE-39).

## Widths

Drawn at: 402. At 1440 the now-tag sits in the time gutter at the column's left (D-USE-39, `success.md` › At 1440).

## Criteria

| ID                                     | When                             | Then                                                                                           | Evidence                           |
| -------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-review-the-day-sunday-now-line-1 | Now falls inside the shown hours | A verdigris tag in the rail with the time, a faint line across, the hour label under it hidden | `captures/sunday-now-line-402.png` |
| C-USE-review-the-day-sunday-now-line-2 | Any other element                | No verdigris                                                                                   | `captures/sunday-now-line-402.png` |
