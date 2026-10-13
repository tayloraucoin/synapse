---
target: specs/web/ux/interactions/later-start/states/cut-some.md
status: approved
promoted:
boards:
  - name: "review-day / late, ask: cut / 402 / light"
    page: "USE — daily use"
    at: [4820, 3900]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/interactions/later-start/captures/cut-some-402.png
rulings: []
---

# A later start — Cut some

The sheet as it opens, on "Cut some" [PROPOSED]. Its note is the "Note · success" at x 4820, y 4830.

## What shows, top to bottom

- Review the day under a scrim (status bar 8:10, the header visible); the sheet from y 120 with a grabber.
- × on the left; the scope line "Up at 8:10 · planned from 7:00" (caption, muted); the title "A later start"; the line "The morning is 70 min short. Cut some, or slide the day back." (body, muted).
- A `SegmentedControl`: "Cut some" (picked, outlined in ink) and "Slide the day back".
- **Wellness · 7:05 to 8:00** (label, semibold) with "Cut the block" (`--color-link`) at the trailing edge, a hairline; rows with a `Checkbox`, the item and its length at the trailing edge: "Pee and weigh" 2 min; "Water" 1 min; "Meditate" 10 min (checked, struck through); "Cold bath" 10 min; "Journal [placeholder]" 15 min (checked, struck through).
- **Training · 8:00 to 8:57** with "Cut the block"; "Workout: gym" 35 min with "Swap for a shorter one ›" under it; then the italic muted line "Drive there and home go with the workout".
- "⌄ Show later blocks".
- A hairline, the foot line (label): "25 of 70 min cut. The rest slides: Breakfast 9:45, Work 10:15."
- Two buttons: "Not now" (outlined) and "Cut these, slide the rest" (ink, the primary).

## What the person can do

- Tick items to cut; ticked rows strike through and the foot line follows. "Cut the block" ticks every item in it [ASSUMPTION].
- "Swap for a shorter one ›" opens the Item sheet's Swap on the workout (`../../../day/item-sheet/states/swap.md`).
- "Show later blocks" loads more blocks.
- **Cut these, slide the rest** cuts for today and slides what is left.
- **Not now** or × leaves the late state as drawn.

## Words

"Up at <wake> · planned from <time>" · "A later start" · "The morning is <n> min short. Cut some, or slide the day back." · "Cut some" · "Slide the day back" · "Cut the block" · "Swap for a shorter one" · "Drive there and home go with the workout" · "Show later blocks" · "<cut> of <short> min cut. The rest slides: <block> <time>, <block> <time>." · "Not now" · "Cut these, slide the rest".

## The notes on the boards

**"review-day / late, ask: cut / 402 / light"**, "Note · success" @ x 4820, y 4830:

> late · ask, cut some [PROPOSED]
>
> Opens once over Review the day when the wake is well past plan. The first two blocks list their items; tick to cut, or cut a whole block; Show later blocks loads more. The footer says what is left to slide and where Breakfast and Work land. Not now leaves the late state as drawn.

## Rulings

None; open-1's "A later start" [PROPOSED, drawn] (`../index.md`). A cut item is off today only [ASSUMPTION: as "Not today"].

## Widths

Drawn at: 402. At the desk: the right-side panel at `--sheet-w` (D-USE-39).

## Criteria

| ID                           | When             | Then                                                               | Evidence                    |
| ---------------------------- | ---------------- | ------------------------------------------------------------------ | --------------------------- |
| C-USE-later-start-cut-some-1 | The sheet opens  | The first two blocks' items with lengths; the shortfall in minutes | `captures/cut-some-402.png` |
| C-USE-later-start-cut-some-2 | Items are ticked | The foot line says what is cut and where the next blocks land      | test                        |
| C-USE-later-start-cut-some-3 | A workout is cut | Its drives go with it                                              | test                        |
