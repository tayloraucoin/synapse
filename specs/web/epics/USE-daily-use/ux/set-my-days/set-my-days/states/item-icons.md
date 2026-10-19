---
target: specs/web/ux/set-my-days/set-my-days/states/item-icons.md
status: approved
promoted:
boards:
  - name: "set-my-days / this week, the day, item icons / 402 / light"
    page: "USE — set up"
    at: [3374, 0]
    note: "Frame @ x 3374, y 930"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/item-icons-402.png
rulings: [D-USE-31, D-USE-33, D-USE-38, D-USE-79]
---

# Set my days — the day, item icons

The day (A) in This week, Monday 12 October, with every bullet in the column showing its item's icon in place of the dot. `?state=item-icons`. The layout is [`../index.md`](../index.md)'s; the plain day is [`the-day.md`](the-day.md). Its note is "Frame" at x 3374, y 930.

## What shows, top to bottom

- **Status bar:** 21:10.
- **Header:** "‹ Week" on the left; `SaveStatus` "Saved" with a check at the trailing edge. Title "Monday, 12 October".
- **Day chips:** M 12 (selected, ink fill), T 13, W 14, T 15, F 16, S 17, S 18, each with a dot under it (a built day).
- **Bounds row:** "Up at 7:00", "Lights out 22:30", the round ··· at the trailing edge ([`day-menu.md`](day-menu.md)).
- **The column**, 96 px an hour, hour labels 7 to 13:
  - Orient's line at 7:00 with the lock and "Orient · 5 min".
  - **Wellness** 7:05 to 8:00 (leaf): each item's icon then its name, two columns: Pee and weigh, Water, Start the cold bath, then "+2 more" (no icon: it keeps the text lane).
  - **Training** 8:00 to 8:57 (clay): Drive to the YMCA and Drive home in italic (transitions) with the car icon; Workout: gym with its icon.
  - **Breakfast** 9:00 to 9:30: a dashed band with the fork-and-knife glyph (a meal keeps its glyph).
  - **Work** 9:30 to 12:00 (sky): tier headings with a coloured square each (Primary leaf, Secondary amber, Stretch slate); under Primary "[Write the sync spec] · ENG-123" and "[Review the Paper handoff]", under Secondary "[Fix the retry backoff] · ENG-140", under Stretch "[Tidy the Linear backlog]", each led by its Linear project's emoji [placeholder].
  - **Lunch** 12:00 to 13:00, a dashed band with the fork-and-knife; the next block's edge at 13:00.
- The round + at the bottom right ([`plus-menu.md`](plus-menu.md)).

## What the person can do

As [`the-day.md`](the-day.md): tap a block to open its Block view in editing; tap empty rail to add ([`tap-a-time.md`](tap-a-time.md)); the + and the ···. This state changes only what a bullet shows. An item's icon is set in the Item sheet ([`../../../day/item-sheet/index.md`](../../../day/item-sheet/index.md)) or the icon picker ([`../../../interactions/icon-picker/index.md`](../../../interactions/icon-picker/index.md)).

## Words

No new strings. "+2 more" as the plain day.

## The notes on the boards

**"set-my-days / this week, the day, item icons / 402 / light"**, note "Frame" @ x 3374, y 930:

> New · Icons in the bullet grid
>
> Every bullet in the column shows its item's icon in place of the dot (pattern 18). Work items take their Linear project's emoji (D-USE-31); the projects are [placeholder]. Meals keep their glyph; "+2 more" keeps the text lane.

## Rulings

- Round 3 (open-4, "Set my days, step 9 round 3"): "Every item shows its icon wherever it is set" and "Item icons replace the bullets in the column, work items taking their project emoji". Step 9 rounds 1 to 4 are done on the Progress card, round 4 approved (D-USE-33).
- D-USE-31: a work item takes its Linear project's emoji. D-USE-38, D-USE-79: the tier squares (Stretch slate).
- [ASSUMPTION] An item with no icon set keeps the dot. Frames drawn before round 3 ([`day-menu.md`](day-menu.md), [`event-inside-work.md`](event-inside-work.md), [`plus-menu.md`](plus-menu.md)) show dots; this frame's icons win wherever an icon is set.

## Widths

Drawn at: 402. Not drawn at: 1024 and wider; from 1024 Set my days is list-detail (D-USE-83, `set-my-days / this week, Monday open / 1024 / light` in [`the-day.md`](the-day.md)) [ASSUMPTION: the day pane's bullets show icons the same way].

## Criteria

| ID                             | When                              | Then                                                                       | Evidence                      |
| ------------------------------ | --------------------------------- | -------------------------------------------------------------------------- | ----------------------------- |
| C-USE-set-my-days-item-icons-1 | An item in the column has an icon | Its icon shows in place of the dot, before its name                        | `captures/item-icons-402.png` |
| C-USE-set-my-days-item-icons-2 | A Linear work item is in a block  | It shows its Linear project's emoji                                        | `captures/item-icons-402.png` |
| C-USE-set-my-days-item-icons-3 | A meal band or "+N more" shows    | The meal keeps the fork-and-knife glyph; "+N more" stays text with no icon | `captures/item-icons-402.png` |
