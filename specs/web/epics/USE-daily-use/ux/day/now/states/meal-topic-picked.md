---
target: specs/web/ux/day/now/states/meal-topic-picked.md
status: approved
promoted:
boards:
  - name: "now / meal, topic picked / 402 / light"
    page: "USE — daily use"
    at: [482, 11460]
    note: "Frame @ x 482, y 12390"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/meal-topic-picked-402.png
rulings: [D-USE-28, D-USE-30, D-USE-72]
---

# Now — a meal, topic picked

The same Breakfast at 9:04, after a chip is tapped in [`meal-pick-topic.md`](meal-pick-topic.md). `?state=meal-topic-picked`.

## What shows, top to bottom

As [`meal-pick-topic.md`](meal-pick-topic.md) down to the chips, with:

- The line under "Watching while eating" now reads "Picked for this meal. Tap another to change." (muted).
- The picked chip, "Agent workflows", filled in ink with its label in the background colour; the others stay outlined.
- **A `LinkCallout`** under the chips, as Orient's Spotify ones: a play-glyph tile, "Open in YouTube" (semibold), "Agent workflows · saved playlist" (muted), the outward arrow ↗ on the right; hairline, rounded, no fill beyond the background. No red, no YouTube logo.
- "[placeholder topics]" under it is a canvas tag.

## What the person can do

- **The LinkCallout** opens that topic in YouTube, outside the app: a playlist, a channel or a search, whichever the topic holds ([`interactions/meal-topics.md`](../../../interactions/meal-topics.md)).
- **Tap another chip** to change the pick; the callout follows it. Tapping the picked chip again: not drawn [ASSUMPTION: it stays picked; a pick is changed, not cleared].
- Edit topics, Done, the tray and the tabs as [`meal-pick-topic.md`](meal-pick-topic.md).

## Words

"Picked for this meal. Tap another to change." · "Open in YouTube" · "<topic> · saved playlist" (a channel or a search reads in its kind's words [ASSUMPTION: "<topic> · channel", "<topic> · search"]).

## The notes on the boards

**"now / meal, topic picked / 402 / light"**, "Frame" @ x 482, y 12390:

> meal, topic picked
>
> The pick fills in ink, and a LinkCallout (as Orient's Spotify ones) opens that topic in YouTube: a playlist, a channel or a search. No red, no YouTube logo. [ASSUMPTION] The pick shows on any meal block (breakfast, lunch, dinner) and resets each meal.

## Rulings

- D-USE-28: the pick comes before the LinkCallout opens YouTube.
- D-USE-72: the note's [ASSUMPTION] stands: the pick shows on every meal block and resets each meal. Decided (D-USE-72).
- D-USE-30: the chips lead with their topic's icon (the frame predates it).
- The LinkCallout is the one Orient draws ([`../../orient/`](../../orient/)); it is not restated here.

## Widths

Drawn at: 402. At the desk: as [`meal-pick-topic.md`](meal-pick-topic.md) › Widths (D-USE-39 (1)); the link opens YouTube in a new tab [ASSUMPTION].

## Criteria

| ID                            | When                       | Then                                                                                                                                | Evidence                             |
| ----------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| C-USE-now-meal-topic-picked-1 | A chip is tapped           | It fills in ink, the line reads "Picked for this meal. Tap another to change.", and a LinkCallout names the topic and its link kind | `captures/meal-topic-picked-402.png` |
| C-USE-now-meal-topic-picked-2 | The LinkCallout is tapped  | YouTube opens on that topic's playlist, channel or search                                                                           | manual                               |
| C-USE-now-meal-topic-picked-3 | The next meal block starts | No topic is picked                                                                                                                  | test                                 |
| C-USE-now-meal-topic-picked-4 | The callout                | No red, no YouTube logo                                                                                                             | `captures/meal-topic-picked-402.png` |
