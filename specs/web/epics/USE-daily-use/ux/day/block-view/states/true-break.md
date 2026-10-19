---
target: specs/web/ux/day/block-view/states/true-break.md
status: approved
promoted:
boards:
  - name: "block-view / break, empty, a true break / 402 / light"
    page: "USE — set up"
    at: [2892, 3780]
    note: "Frame @ x 2892, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/true-break-402.png
rulings: [D-USE-24, D-USE-72, D-USE-74, D-USE-81]
---

# Block view — a Break, empty: a true break

Refinement 8's true break: a Break block with Meal off and nothing in it (N1, N2), in the usual Monday at 21:10. `?state=true-break`. Its note is "Frame" at x 2892, y 4710.

## What shows, top to bottom

- **Status bar:** 21:10.
- **Breadcrumb:** "‹ Monday › Break".
- **Header:** the amber bar, "Break" over "15:00 to 15:20 · every Monday" (the time is `[placeholder]`); "Done" beside the round ···. Then a hairline.
- **Meal row:** the fork-and-knife glyph, "Meal" (strong), "Off" (muted), the `Switch` off. Then a hairline.
- **Empty line** under the title (pattern 15): "Nothing in Break. A true break." (body), then (caption, muted) "Go mode shows it as rest, with no checklist. Add something only if it helps."
- **The add row** stays (pattern 16): rail "15:00", "+ Add to Break", not focused.
- "Free until 15:20", a dashed region; "15:20" and its line; the peek "Dinner · 18:00 to 18:45" with the amber bar.

## What the person can do

- Type in the add row: the first item, 5 min at 15:00 (D-USE-81); the empty line goes.
- **Meal on:** the topics section of [`meal-editing.md`](meal-editing.md) appears.
- ··· (Rename, Icon and colour, Delete block); "Done" or "‹ Monday": back to Set my days.

## In go mode

Decided (D-USE-72, D-USE-74): Now draws it as rest ([`../../now/states/empty-break.md`](../../now/states/empty-break.md)): the header alone, no card, no rows, no Done, and End break on the footer fade opening the next block with no close card. The note's [ASSUMPTION] "no checklist and no Done to press" is that frame.

## Words

"Nothing in Break. A true break." · "Go mode shows it as rest, with no checklist. Add something only if it helps." · "Meal" · "Off" · "Add to Break" · "Free until 15:20".

## The notes on the boards

**"block-view / break, empty, a true break / 402 / light"**, "Frame" @ x 2892, y 4710:

> New · Break, empty, a true break
>
> Refinement 8's true break: Meal off, nothing in it. "Nothing in Break. A true break." sits under the title (pattern 15); the add row stays (pattern 16). [ASSUMPTION] Go mode shows it as rest, with no checklist and no Done to press. The 15:00 time is [placeholder].

## Rulings

- N1, N2 (refinement 8): a Break can be left empty, as a true break. N4: "End break".
- Unlike [`empty.md`](empty.md) (a new block), the add row is not focused and there is no keyboard: an empty Break is a finished plan, not one waiting for items [ASSUMPTION: drawn unfocused, no keyboard].
- Now's frame spans 15:00 to 15:10, this one 15:00 to 15:20; both are placeholder times.

## Widths

Drawn at: 402. Wider scales up (D-USE-39). At the desk a Schedule block opens its Block panel (D-USE-77), area 7.

## Criteria

| ID                            | When                                         | Then                                                                                              | Evidence                                 |
| ----------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| C-USE-block-view-true-break-1 | A Break with Meal off and no items is opened | "Nothing in Break. A true break." under the title, the add row unfocused, "Free until" to its end | `captures/true-break-402.png`            |
| C-USE-block-view-true-break-2 | That Break comes up in go mode               | Now shows it as rest with End break, no checklist and no Done                                     | `../../now/captures/empty-break-402.png` |
