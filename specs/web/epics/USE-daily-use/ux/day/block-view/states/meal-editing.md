---
target: specs/web/ux/day/block-view/states/meal-editing.md
status: approved
promoted:
boards:
  - name: "block-view / break, a meal, editing / 402 / light"
    page: "USE — set up"
    at: [2410, 3780]
    note: "Frame @ x 2410, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/meal-editing-402.png
rulings: [D-USE-24, D-USE-28, D-USE-30, D-USE-34, D-USE-81]
---

# Block view — a Break with a meal, editing

Breakfast, a Break block with Meal on, in the usual Monday at 21:10 (open-4 round 3). `?state=meal-editing`. Its note is "Frame" at x 2410, y 4710.

## What shows, top to bottom

- **Status bar:** 21:10.
- **Breadcrumb:** "‹ Monday › Breakfast".
- **Header:** the amber bar (Break), "Breakfast" over "9:00 to 9:30 · every Monday"; "Done" beside the round ···. Then a hairline.
- **Meal row:** a fork-and-knife glyph, "Meal" (strong), "Offers something to watch" (muted), and a `Switch`, on. Then a hairline.
- **Rows** with rail time, icon, name, length, trailing grip: 9:00 pan "Make breakfast" 10 min; 9:10 bowl "Eat" 15 min; 9:25 sponge "Dishes" 5 min. `[placeholder]`.
- "+ Add to Breakfast".
- **"Watching while eating"** (strong), "Edit topics" (text button) trailing; under it (muted) "Offered at Breakfast. Tap to leave one out."; the saved topics as chips with their icons: filled ink "Agent workflows", "Roman history", "Cooking basics" (offered); outlined "Strength training" (left out). Labelled `[placeholder topics]` on the canvas (not shipped).
- "9:30" and its line; the peek "Work · 9:30 to 12:00" with the sky bar.

## What the person can do

- **Tap a chip:** leave it out of this meal, or offer it again (filled is offered) [ASSUMPTION: for every Monday's Breakfast, as the span line says].
- **Edit topics:** the Meal topics sheet ([`../../../interactions/meal-topics.md`](../../../interactions/meal-topics.md)), cited, not carried; × closes back here.
- **Meal off:** the topics section goes; the block is a plain Break, and with no items [`true-break.md`](true-break.md) [ASSUMPTION].
- Rows as [`wellness-editing.md`](wellness-editing.md) (5 min new items, D-USE-81); "Done" or "‹ Monday": back to Set my days.

In go mode the offered topics are what Now's meal card offers ([`../../now/states/meal-pick-topic.md`](../../now/states/meal-pick-topic.md)).

## Words

"Meal" · "Offers something to watch" · "Watching while eating" · "Edit topics" · "Offered at Breakfast. Tap to leave one out." (the block's name).

## The notes on the boards

**"block-view / break, a meal, editing / 402 / light"**, "Frame" @ x 2410, y 4710:

> New · Break with a meal, editing
>
> [PROPOSED] Breakfast is a Break block with Meal on (N2 puts Meal only on transitions; a transition can still be one). Meal on adds "Watching while eating": the saved topics as chips (D-USE-28, D-USE-30), filled ones offered at this meal, tap to leave one out; Edit topics opens the Meal topics sheet. Items and topics are [placeholder].

## Rulings

- D-USE-34 approved the New block sheet's Meal on a block ([`../../../set-my-days/new-block-sheet/states/meal.md`](../../../set-my-days/new-block-sheet/states/meal.md)); this view is its editor. Bends N2's Meal-on-transitions-only; a transition can still be a meal.
- D-USE-28: topic chips and the Meal topics sheet. D-USE-30: topics take an icon.
- Colour never alone: a left-out chip is outlined, not only paler.

## Widths

Drawn at: 402. Wider scales up (D-USE-39); chips wrap. At the desk a Schedule block opens its Block panel (D-USE-77), area 7.

## Criteria

| ID                              | When                           | Then                                                                                     | Evidence                        |
| ------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------- |
| C-USE-block-view-meal-editing-1 | A Break with Meal on is opened | The Meal switch on, the rows, and "Watching while eating" with the saved topics as chips | `captures/meal-editing-402.png` |
| C-USE-block-view-meal-editing-2 | A filled chip is tapped        | It turns outlined and this meal no longer offers it                                      | test                            |
| C-USE-block-view-meal-editing-3 | Edit topics is tapped          | The Meal topics sheet opens and closes back here                                         | test                            |
