---
target: specs/web/ux/day/block-view/states/training-editing.md
status: approved
promoted:
boards:
  - name: "block-view / training, editing / 402 / light"
    page: "USE — set up"
    at: [1928, 3780]
    note: "Note · name only, 80 @ x 1928, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/training-editing-402.png
rulings: [D-USE-17, D-USE-24, D-USE-81]
---

# Block view — Training, editing

A Training block in the usual Monday at 21:10, with its transitions and a swappable workout (open-4 round 3). `?state=training-editing`. Its note is "Note · name only, 80" at x 1928, y 4710.

## What shows, top to bottom

- **Status bar:** 21:10.
- **Breadcrumb:** "‹ Monday › Training".
- **Header:** the clay bar, "Training" over "8:00 to 8:57 · every Monday"; "Done" beside the round ···. Then a hairline.
- **Focus row** [PROPOSED]: "Training for" (muted) and, trailing, an outlined select "Body fitness ⌄" ([`../../../dev-notes/training-for.md`](../../../dev-notes/training-for.md)). Then a hairline.
- **Rows**, each with rail time, icon, name, length and a trailing grip:
  - 8:00 car, "Drive to the YMCA" in italic (a transition in the flow), 15 min.
  - 8:15 weightlifter, "Workout: gym", an outlined "Swap" button before its length, 30 min.
  - 8:45 car, "Drive home" in italic, 12 min.
- "+ Add to Training".
- "8:57" and its line; the peek "Breakfast · 9:00 to 9:30" with the amber bar.

## What the person can do

- **Swap** on the workout: the Item sheet's swap list from the library, the same kind ([`../../item-sheet/states/swap.md`](../../item-sheet/states/swap.md)); with a focus picked, Swap filters by it [PROPOSED, dev note].
- **Training for ⌄:** pick the block's focus, Body fitness by default [PROPOSED]. Which focuses exist is the dev note's later discovery pass [ASSUMPTION: Body fitness is the only choice until then].
- Reorder by the grip (transitions too), times re-flow; swipe to remove with Undo; type in the add row (5 min, after the last, D-USE-81); tap a row for the Item sheet ([`../../item-sheet/index.md`](../../item-sheet/index.md)); as [`wellness-editing.md`](wellness-editing.md).
- "Done" or "‹ Monday": back to Set my days.

## Words

"Training for" · "Body fitness" · "Swap" · "Add to Training". Transitions in italic, with their own icon, never a separate band here [ASSUMPTION: the italic row is this view's form of N2's "slim bands in the flow"].

## The notes on the boards

**"block-view / training, editing / 402 / light"**, note "Note · name only, 80" @ x 1928, y 4710:

> Training block, editing
>
> The drives are transitions in the flow, italic. The workout carries Swap (library, same kind). [PROPOSED] "Training for: Body fitness" at the top, per the dev note. Break with a meal, the Sunday checklist and set work are next thread.

## Rulings

- open-4 round 3: drives as italic transitions, Swap on the workout, [PROPOSED] "Training for: Body fitness". The note's "next thread" frames are drawn: [`meal-editing.md`](meal-editing.md), [`set-work.md`](set-work.md), `checklist-editing.md` (W7).
- N1: physio and a stretch break are Training blocks; the focus picker does not change that.
- D-USE-17, D-USE-24.

## Widths

Drawn at: 402. Wider scales up (D-USE-39); from 1024 Set my days is list-detail (D-USE-83). At the desk a Schedule block opens its Block panel (D-USE-77), area 7.

## Criteria

| ID                                  | When                                        | Then                                                                                             | Evidence                            |
| ----------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------- |
| C-USE-block-view-training-editing-1 | A Training block is opened from Set my days | "Training for" with Body fitness; transitions in italic; Swap on the workout; grips on every row | `captures/training-editing-402.png` |
| C-USE-block-view-training-editing-2 | Swap is tapped                              | The swap list shows items of the same kind and focus                                             | test                                |
