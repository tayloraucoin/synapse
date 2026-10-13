---
target: specs/web/ux/day/running/states/timed-over-warning.md
status: approved
promoted:
boards:
  - name: "done / timed, a little over (warning) / 402 / light"
    page: "USE — daily use"
    at: [3374, 13980]
    note: "Frame @ x 3374, y 14910"
    capture: specs/web/epics/USE-daily-use/ux/day/running/captures/timed-over-warning-402.png
rulings: [D-USE-29, D-USE-38, D-USE-72]
---

# Done — timed, a little over (warning)

A timed Done 20% past the plan. `?state=timed-over-warning`.

## What shows, top to bottom

As [`timed-done.md`](timed-done.md) at 7:26, except Meditate's row: the box filled darker (as just checked), and on the right "12 min of 10" in warning (`warning-text` at the small-text value, [PROPOSED token]), semibold.

## What the person can do

As [`timed-done.md`](timed-done.md).

## Words

"12 min of 10". [ASSUMPTION: "of <plan>" shows only past the ink band, so the colour never stands alone; the ink form is "12 min" as on `timed-done.md`.]

## The notes on the boards

**"done / timed, a little over (warning) / 402 / light"**, note "Frame" @ x 3374, y 14910:

> timed, a little over (warning)
>
> 12 of 10 min is 20% over, so "12 min of 10" is warning. At 11 it would stay ink; under the plan always ink.

## Rulings

- D-USE-29: to 10% over ink, to 25% warning, past 25% danger; edges whole minutes, at least 1 min; under the plan always ink. Bends product-rules "Nothing red on the execution tabs", P-A04 and N4 note 62. The bands in full: `../../../dev-notes/over-by-how-much.md`.
- D-USE-72, D-USE-38: `warning-text` (58% on small text) [PROPOSED until the colours look].
- The danger form of a Done (past 25%, `destructive-text`) is not drawn [ASSUMPTION: as this frame in danger, "13 min of 10"].

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                                 | When                              | Then                             | Evidence                              |
| ---------------------------------- | --------------------------------- | -------------------------------- | ------------------------------------- |
| C-USE-running-timed-over-warning-1 | A 10-min item is done at 12 min   | "12 min of 10" in `warning-text` | `captures/timed-over-warning-402.png` |
| C-USE-running-timed-over-warning-2 | Done at 11, at 13, under the plan | Ink, danger, ink                 | test                                  |
