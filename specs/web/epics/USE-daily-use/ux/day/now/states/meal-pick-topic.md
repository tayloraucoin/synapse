---
target: specs/web/ux/day/now/states/meal-pick-topic.md
status: approved
promoted:
boards:
  - name: "now / meal, pick a topic / 402 / light"
    page: "USE — daily use"
    at: [0, 11460]
    note: "Frame @ x 0, y 12390"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/meal-pick-topic-402.png
rulings: [D-USE-26, D-USE-28, D-USE-30, D-USE-72]
---

# Now — a meal, pick a topic

A meal block is the active block (Breakfast, 9:00 to 9:30, at 9:02) and no topic is picked yet. The surface is [`../index.md`](../index.md); the layout it shares is [`success.md`](success.md). `?state=meal-pick-topic`.

## What shows, top to bottom

- Now's header: "Now", the avatar "T".
- The To-dos tray, closed (D-USE-26): "To-dos" with "Call the mechanic…" and the chevron down. The tray is [`../../todos/`](../../todos/index.md).
- The block header: the fork-and-knife glyph, "Breakfast", "9:00 to 9:30", the ··· button. No kind-colour bar beside the name (a meal is a Break block with Meal on, per the New block sheet's meal note on "USE — set up").
- The lifted card: the fork-and-knife icon tile, the verdigris dot, "Breakfast", "30 min · 9:00", and one full-width ink **Done**. No Start: the meal's card carries Done alone.
- **"Watching while eating"** (semibold) with **"Edit topics"** (verdigris link) on the right; under it "Pick one before opening YouTube." (muted).
- The topic chips, outlined pills on the background, wrapping: "Agent workflows", "Strength training", "Roman history", "Cooking basics". "[placeholder topics]" under them is a canvas tag, not app copy.
- The tab bar: Now (selected), Schedule, Review.

## What the person can do

- **Tap a chip** to pick it: [`meal-topic-picked.md`](meal-topic-picked.md). The YouTube link appears only after a pick.
- **Edit topics** opens the Meal topics sheet: [`interactions/meal-topics.md`](../../../interactions/meal-topics.md).
- **Done** checks the meal as any lifted card ([`success.md`](success.md)); the block's close follows ([`../../block-complete/`](../../block-complete/)).
- The tray, the header ··· menu ([`header-menu.md`](header-menu.md)) and the tabs as on every Now state.

## Words

"Watching while eating" · "Edit topics" · "Pick one before opening YouTube."

## The notes on the boards

**"now / meal, pick a topic / 402 / light"**, "Frame" @ x 0, y 12390:

> meal, pick a topic [PROPOSED]
>
> Under a meal's card: "Watching while eating" with the saved topics as chips, "Pick one before opening YouTube." The pick comes before YouTube opens, so the choice is made on purpose and not by whatever the feed shows first. "Edit topics" opens the sheet.

## Rulings

- D-USE-28: meal blocks carry "Watching while eating" topic chips, picked before a LinkCallout opens YouTube, kept in a Meal topics sheet.
- D-USE-30: meal topics take an icon; the sheet's note ([`interactions/meal-topics.md`](../../../interactions/meal-topics.md)) says the icon also leads the chips. This frame draws the chips without icons; the later rule wins, so each chip leads with its topic's icon.
- D-USE-72: the note's [PROPOSED] stands as drawn. Decided (D-USE-72).
- Which topics a meal offers: the ones filled for this meal in its block view ("filled ones offered at this meal, tap to leave one out", the block view's "Break with a meal" note on "USE — set up", x 2410, y 4710) [ASSUMPTION: Now shows only those].
- A meal with no topics saved: not drawn [ASSUMPTION: "Watching while eating" shows with Edit topics alone, so the sheet stays one tap away].

## Widths

Drawn at: 402. At the desk: the column scales up, capped at `--content-text` and centred (D-USE-39 (1)); the chips wrap in the wider column.

## Criteria

| ID                          | When                                   | Then                                                                                                                     | Evidence                           |
| --------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| C-USE-now-meal-pick-topic-1 | A meal block is active, nothing picked | "Watching while eating", the saved topics as chips, "Pick one before opening YouTube.", Edit topics; no YouTube link yet | `captures/meal-pick-topic-402.png` |
| C-USE-now-meal-pick-topic-2 | The meal card                          | Done alone, no Start                                                                                                     | `captures/meal-pick-topic-402.png` |
| C-USE-now-meal-pick-topic-3 | Topics have icons                      | Each chip leads with its icon                                                                                            | manual                             |
