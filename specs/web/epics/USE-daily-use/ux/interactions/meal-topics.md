---
target: specs/web/ux/interactions/meal-topics.md
status: approved
promoted:
boards:
  - name: "meal-topics sheet / with icons / 402 / light"
    page: "USE — daily use"
    at: [964, 11460]
    note: "Frame @ x 964, y 12390"
    capture: specs/web/epics/USE-daily-use/ux/interactions/captures/meal-topics-with-icons-402.png
dev_note: ""
rulings: [D-USE-28, D-USE-30, D-USE-37, D-USE-72]
---

# The Meal topics sheet

The list of saved topics, an overlay opened from four surfaces, so it is carried here rather than in any one of them. Carried here as the replacement for the earlier `meal-topics sheet / default / 402 / light` (Archive 3, x 1446, y 25320), which is superseded by this frame (D-USE-30); that row is listed in `boards/use-daily-use/archive-3.md`. `?sheet=meal-topics`. [ASSUMPTION: the sheet param, as `?sheet=item`.]

## Where it starts

- Edit topics under a meal's card on Now ([`../day/now/states/meal-pick-topic.md`](../day/now/states/meal-pick-topic.md)).
- The avatar menu's Meal topics (D-USE-37, D-USE-88; [`../account/avatar-menu/index.md`](../account/avatar-menu/index.md)).
- Edit topics on a meal block's editor and the New block sheet's Meal (D-USE-34; "USE — set up", area 5).

## Steps

| #   | The person                                     | The app                                                                            | Board (carried by)                                         |
| --- | ---------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | Opens Meal topics from any entry               | The sheet below                                                                    | `meal-topics sheet / with icons / 402 / light` (this file) |
| 2   | Taps a topic, Add a topic, the icon tile, or × | Edits in place; the icon picker as a step; × closes onto the screen it opened from | not drawn beyond step 1                                    |

## What shows, top to bottom (step 1)

- The screen behind under a grey scrim; the sheet rises from the foot, about three quarters of the height, with a grabber.
- × on the left.
- **"Meal topics"** (title), then "Things worth watching while cooking and eating. Each opens a saved playlist, a channel, or a YouTube search." (muted).
- The topics, one per row between hairlines, each: an icon on a kind-colour chip (the step 11 picker's tile), the name, a muted line with the link's kind and value, and a grip on the right:
  - "Agent workflows", robot, on blue: "Playlist · youtube.com/playlist?list=…"
  - "Strength training", dumbbell, on rose: "Channel · @[placeholder]"
  - "Roman history", classical building, on amber: "Search · "roman history documentary""
  - "Cooking basics", magnifier and pan, on green: "Search · "simple weeknight cooking""
- "+ Add a topic" (muted).
- A muted caption: "Tap a topic to edit its icon, name and link; swipe to delete. The icon shows on the meal's topic chips too. [placeholder topics]".

## What the person can do

- **Tap a topic** to edit its icon, name and link. **Swipe left** to delete. **Drag the grip** to reorder; the order is the chips' order on a meal [ASSUMPTION].
- **Add a topic** adds a row to fill. The edit and add forms are not drawn [ASSUMPTION: name, one link (playlist, channel or search words) and the icon tile, as the archived default's note has it].
- **The icon tile** opens the icon picker as a step inside the sheet: [`icon-picker/index.md`](icon-picker/index.md), with "Suggested for <name>" (open-5, Suggested icons).
- **×** closes onto the meal; a changed topic shows on the chips at once.
- Also opened from the avatar menu's Meal topics (D-USE-37) and from Edit topics on a meal block's editor and the New block sheet's Meal (D-USE-34; the set-up page).

## Words

"Meal topics" · "Things worth watching while cooking and eating. Each opens a saved playlist, a channel, or a YouTube search." · "Playlist · <url>", "Channel · <handle>", "Search · "<words>"" · "Add a topic". Decided (D-USE-74): the closing caption is a canvas pointer, not shipped (it carries "[placeholder topics]" and teaches gestures the rows already show).

## The notes on the boards

**"meal-topics sheet / with icons / 402 / light"**, "Frame" @ x 964, y 12390:

> meal topics, with icons
>
> Each topic takes an icon like an item: an emoji or a line icon on a kind chip (the step 11 picker). The icon also leads the topic chips under a meal's card.

The superseded frame's note, kept for the behaviour it states ("Frame" @ x 1446, y 26250):

> meal topics sheet
>
> The list Taylor keeps: each topic has a name and one link (playlist, channel, or search words), with a grip to reorder and an add row. Tapping a topic edits it; swiping left deletes it. × closes. [ASSUMPTION] It also lives in the avatar menu (step 12).

## Rulings

- D-USE-28: the Meal topics sheet keeps the topics.
- D-USE-30: meal topics take an icon (emoji or line icon); supersedes the default frame without icons.
- D-USE-37: step 12 is approved with its marks as drawn, so Meal topics sits in the avatar menu (the archived note's [ASSUMPTION]; open-3, step 9 round 1).
- D-USE-72: step 5's marks stand.
- Delete has no confirm and no Undo drawn [ASSUMPTION: a Toaster with Undo, the house pattern].

## Widths

Drawn at: 402. At the desk: [ASSUMPTION] the sheet becomes a centred dialog, as the other sheets at the desk (D-USE-39 (1)).

## Criteria

| ID                  | When                   | Then                                                                                              | Evidence                                  |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| C-USE-meal-topics-1 | Edit topics            | The sheet lists each topic with its icon, name, link kind and value, and a grip; Add a topic last | `captures/meal-topics-with-icons-402.png` |
| C-USE-meal-topics-2 | A topic's icon changes | The meal's chip shows the new icon                                                                | test                                      |
| C-USE-meal-topics-3 | A topic is dragged     | The chips on a meal follow the new order                                                          | test                                      |
| C-USE-meal-topics-4 | The avatar menu        | Meal topics opens this sheet                                                                      | manual                                    |
