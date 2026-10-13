---
target: specs/web/ux/day/block-view/states/overflow.md
status: approved
promoted:
boards:
  - name: "block-view / overflow / 402 / light"
    page: "USE — daily use"
    at: [3856, 6420]
    note: "Note · overflow"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/overflow-402.png
rulings: [D-USE-8, D-USE-11, D-USE-17]
---

# Block view — runs past its end

The block's items add up past its end. Drawn in editing mode (Monday, 20:14). `?state=overflow`. Its note is "Note · overflow" at x 3856, y 7350.

## What shows, top to bottom

As [`editing-monday.md`](editing-monday.md), except:

- Rows: 7:05 "Pee and weigh" 2 min; 7:07 "Water" 1 min; 7:08 "Start the cold bath" 2 min; 7:10 "Meditate" 10 min; 7:20 "Cold bath" 10 min; 7:30 "Stretch [placeholder]" 30 min (a tall row), each with its grip.
- **The end:** "8:00" on the rail with a dashed ink line across; under it "Runs 12 min past 8:00." (caption, medium, ink).
- **Past the end:** 8:00 "Journal [placeholder]" 12 min, with its grip, under the dashed line.
- No "Free until" region (no time is free). The add row "+ Add to Wellness" under the last item, then the Training peek.

## What the person can do

As editing Monday. Moving or removing items until they fit makes the dashed line and the words go [ASSUMPTION]. Nothing blocks adding more.

## Words

"Runs <n> min past <end>." ("Runs 12 min past 8:00."). Information, in ink: never red, never a warning colour.

## The notes on the boards

**"block-view / overflow / 402 / light"**, note "Note · overflow" @ x 3856, y 7350:

> overflow
>
> Items past the block's end sit under a dashed line at 8:00: "Runs 12 min past 8:00." Information, in ink, not an error. Stretch and Journal are placeholders to push it over.

## Rulings

- N2 "full": items past the block's end show over a dashed line, "Runs 12 min past 8:57." — the narrative's time predates the fixture split; the board's 8:00 is Wellness's end under D-USE-8.
- From the day, the same rule holds [ASSUMPTION: overflow from the day looks the same with checkboxes; only editing is drawn]. What the overflow does to the next block on the day is Make room's (D-USE-11), not this view's.

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                          | When                           | Then                                                                                          | Evidence                    |
| --------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------- | --------------------------- |
| C-USE-block-view-overflow-1 | Items run past the block's end | A dashed line at the end, "Runs <n> min past <end>." in ink, the items past it under the line | `captures/overflow-402.png` |
| C-USE-block-view-overflow-2 | The items fit again            | The line and words go                                                                         | test                        |
