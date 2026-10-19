---
target: specs/web/ux/set-my-days/new-block-sheet/states/meal.md
status: approved
promoted:
boards:
  - name: "new-block / meal (Break, Meal on) / 402 / light"
    page: "USE — set up"
    at: [2892, 5040]
    note: "Frame @ x 2892, y 5970"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/captures/meal-402.png
rulings: [D-USE-28, D-USE-30, D-USE-34]
---

# New block sheet — meal (Break, Meal on)

A Break block on the usual Monday with Meal on (round 3). `?sheet=new-block&state=meal` [ASSUMPTION: the state param].

## What shows, top to bottom

- Grabber; ×; "Usual Monday · every week" over "New block".
- **Kind:** the seven, Break picked (amber soft fill and edge).
- **Name:** the icon tile holding a frying-pan emoji beside "Breakfast".
- Hairline; **Starts** "9:00"; hairline; **Ends** "9:30", "30 min" beside it.
- Hairline; **Repeats** "Weekly on Monday".
- **Colour:** the amber swatch, "Amber, Break's colour".
- Hairline; **Meal**, on, "On: a fork in the column, and something to watch while eating."
- **Watching while eating** (label, muted) with **Edit topics** (underlined text button) right; topic chips, each emoji and name: "Space" and "Neuroscience" filled (ink, offered at this meal), "Guitar" and "News" outlined; "[placeholder topics]" under them.
- "Goes in on Mondays, 9:00 to 9:30, after Training."
- "Add block", ink, sticky, the sheet scrolling under it (cut at the frame's foot).

## What the person can do

- Tap a topic chip: it toggles whether it is offered at this meal.
- **Edit topics** opens the Meal topics sheet (`../../../interactions/meal-topics.md`).
- Switch Meal off: the topics leave; the block stays a Break, empty if left so, a true break (refinement 8).
- **Add block:** the meal lands with its fork in the column and opens its Block view (`../../../day/block-view/states/meal-editing.md`).

## Words

"Meal" · "On: a fork in the column, and something to watch while eating." · "Watching while eating" · "Edit topics" · "Goes in on Mondays, 9:00 to 9:30, after Training." The topic names and "Breakfast" are [placeholder].

## The notes on the boards

**"new-block / meal (Break, Meal on) / 402 / light"**, "Frame" @ x 2892, y 5970:

> Meal
>
> A meal is a Break block with Meal on (round 3); a transition can still be one. Meal on adds "Watching while eating": the saved topics as chips, the ones offered at this meal filled, and Edit topics (the Meal topics sheet, D-USE-28).

## Rulings

- D-USE-28: meal blocks carry "Watching while eating" topic chips, kept in the Meal topics sheet. D-USE-30: topics take an icon.
- D-USE-34: Meal with its topics approved as drawn. A meal transition shows Meal on with the same topics [ASSUMPTION: not drawn].

## Widths

Drawn at: 402. At 1024 and wider: the right panel at `--sheet-w` (D-USE-39, D-USE-83).

## Criteria

| ID                           | When               | Then                                                          | Evidence                |
| ---------------------------- | ------------------ | ------------------------------------------------------------- | ----------------------- |
| C-USE-new-block-sheet-meal-1 | Break with Meal on | "Watching while eating" with the saved topics and Edit topics | `captures/meal-402.png` |
| C-USE-new-block-sheet-meal-2 | Edit topics        | The Meal topics sheet opens over this one                     | test                    |
