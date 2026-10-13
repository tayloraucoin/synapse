---
target: specs/web/ux/set-my-days/set-my-days/states/out-of-bounds.md
status: approved
promoted:
boards:
  - name: "set-my-days / bounds edited, out of bounds / 402 / light"
    page: "USE — set up"
    at: [3374, 1260]
    note: "Note · name only, 80"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/out-of-bounds-402.png
rulings: [D-USE-32, D-USE-33, D-USE-87]
---

# Set my days — bounds edited, a block out of bounds

The usual Thursday at 21:10, just after "Up at" moved from 7:00 to 7:45. `?state=out-of-bounds`. Its note is "Note · name only, 80" at x 3374, y 2190 (the note artboard's name is left over from an earlier layout; its card is this frame's). The surface's layout, words and access are in [`../index.md`](../index.md).

## What shows, top to bottom

- **Header:** "‹ Week" on the left, `SaveStatus` "Saved" with a check on the right; the title "Every Thursday".
- **Weekday chips:** M T W **T** F S S, Thursday filled ink, a dot under every built day.
- **Bounds row:** "Up at 7:45" ringed in ink (the field while editing), "Lights out 22:30", the day's ··· at the trailing edge.
- **Column**, 96 px an hour:
  - **Wellness 7:05 to 8:00** keeps its place, drawn with a dashed edge in its kind's colour (green) and no fill. Inside: "Before Up at. Kept, not run." and, at the trailing edge, "Change its time" (underlined, ink).
  - **Orient** has moved with "Up at": its ink line and lock now sit at 7:45, labelled "Orient · 7:45", across the foot of Wellness.
  - Training 8:00 to 8:57 (Drive to the YMCA, Workout: gym, Drive home); Breakfast 9:00 to 9:30 (a dashed Break band); Work 9:30 to 12:00, "Work goes in on This week."; Lunch 12:00 to 13:00; the + bottom right.

## What the person can do

- Edit "Up at" or "Lights out" in place; Orient moves with "Up at" (N2).
- "Change its time": opens the block's times. [Decided (D-USE-87): not drawn; default: the block's Starts and Ends fields as the New block sheet draws them ([`../../new-block-sheet/index.md`](../../new-block-sheet/index.md)), filled with 7:05 and 8:00.]
- Tap the block: its Block view, editing, as any block (N2). Long-press and drag it in time (N2).
- Nothing deletes it: the block stays until Taylor moves or removes it.

## Words

- "Before Up at. Kept, not run."
- "Change its time"
- "Orient · 7:45" (the Orient label reads the new time while it sits at a moved "Up at").
- Past "Lights out": "Reads the same way" (note). [Decided (D-USE-87): not drawn; default "After Lights out. Kept, not run." with "Change its time".]

## The notes on the boards

**"set-my-days / bounds edited, out of bounds / 402 / light"**, "Note · name only, 80" @ x 3374, y 2190:

> Bounds edited, a block out of bounds
>
> Up at moved to 7:45 (the field ringed while editing); Orient moves with it. Wellness starts before Up at, so it keeps its place with a dashed edge and is never deleted. [PROPOSED] It reads "Before Up at. Kept, not run." with Change its time; go mode skips it. Past Lights out reads the same way.

## Rulings

- N2: blocks that would sit outside the bounds keep their place with a dashed edge, never deleted; a block past "Lights out" gets a dashed edge.
- D-USE-32: step 9 round 4, first part, approved this frame: the dashed edge, "Before Up at. Kept, not run." and Change its time. The note's [PROPOSED] is kept as drawn; no D-line lifts step 9's marks the way D-USE-72 and D-USE-77 did for steps 5 to 8.
- Go mode skips a block out of bounds (this note). How the day shows it when it runs is go mode's: [`../../../day/now/index.md`](../../../day/now/index.md) and [`../../../day/review-the-day/index.md`](../../../day/review-the-day/index.md); neither draws an out-of-bounds block yet [ASSUMPTION: it is left out of Now and Review the day for that date].

## Widths

Drawn at: 402. At 1024 and wider Set my days is list-detail (D-USE-83, [`the-day.md`](the-day.md)): the same block, edge and words in the day pane.

## Criteria

| ID                                | When                               | Then                                                                                                | Evidence                         |
| --------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-set-my-days-out-of-bounds-1 | "Up at" moves past a block's start | Orient moves to the new time; the block keeps its time, dashed edge, "Before Up at. Kept, not run." | `captures/out-of-bounds-402.png` |
| C-USE-set-my-days-out-of-bounds-2 | Any bounds edit                    | No block is deleted or moved                                                                        | test                             |
| C-USE-set-my-days-out-of-bounds-3 | A block ends after "Lights out"    | The same dashed edge and its line with Change its time                                              | test                             |
| C-USE-set-my-days-out-of-bounds-4 | Go mode reaches the date           | The out-of-bounds block is skipped, not run                                                         | test                             |
