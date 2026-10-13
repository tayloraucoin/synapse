---
target: specs/web/ux/set-my-days/set-my-days/states/usual-thursday-evening.md
status: approved
promoted:
boards:
  - name: "set-my-days / usual Thursday evening, Life set, then Evening / 402 / light"
    page: "USE — set up"
    at: [1928, 0]
    note: "Frame @ x 1928, y 930"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/usual-thursday-evening-402.png
rulings: [D-USE-49, D-USE-79]
---

# Set my days — usual Thursday evening: Life, set, then Evening

The usual Thursday scrolled to the evening: where Life ends and Evening begins. `?state=usual-thursday-evening`. Its note is the card "Frame" at x 1928, y 930.

## What shows, top to bottom

- Status bar 21:10. "‹ Now" over "Set my days"; "✓ Saved". "Usual week" selected.
- Chips: all seven with dots; "T" (Thursday) ink.
- Day line: "Thursday", "Up at 7:00", "Lights out 22:30", the ···. A hairline.
- The column scrolled to 17 (17 to 23 in view; the morning blocks, Orient, Wellness and Breakfast, sit above):
  - At 17, muted, on the open rail: "Free until 19:00. Unset time stays open, not Evening."
  - **Dinner with friends** 19:00 to 21:00, a Life block, set (yellow fill #F6EDC4, yellow rule #C9A227): "🚗 Drive to Marco's", "🍝 Dinner", "🚗 Drive home" in a row, then muted "Set: the same each Thursday [placeholder]".
  - The open rail 21:00 to 21:30.
  - **Evening** 21:30 to 22:30 (slate): "📓 Wind-down journal", "🌙 Lights out".
- The + bottom right.

## What the person can do

- Tap Dinner with friends: its Block view, the Life kind, set ([`../../../day/block-view/states/life-set.md`](../../../day/block-view/states/life-set.md)).
- Tap Evening: its Block view in editing.
- Tap the open time: the New block sheet at that time ([`tap-a-time.md`](tap-a-time.md)).

## Words

"Free until 19:00. Unset time stays open, not Evening." ("Free until <time>.") · "Set: the same each Thursday" ("Set: the same each <weekday>") [the second sentence of the first line is a framing note for the round; ASSUMPTION: the build shows "Free until 19:00." only].

## The notes on the boards

**"set-my-days / usual Thursday evening, Life set, then Evening / 402 / light"**, "Frame" @ x 1928, y 930:

> Usual Thursday evening
>
> [PROPOSED] The line between Life and Evening: dinner with friends is Life, set, with its drives as transitions; Evening is 21:30 to 22:30, the journal and Lights out. Unset time before 19:00 stays open.

## Rulings

- The [PROPOSED] stands as drawn under D-USE-49 (the lock). Open-4 "Life and chores": Evening becomes the wind-down only (DYN-18's journal, Lights out); social time moves to Life; unset evening time stays open.
- Life is yellow (D-USE-79); the frame's layer reads "Life, Dinner with friends, set [PROPOSED]".
- The drives are transitions inside the block (as Training's drives); drawn here as icon items in the row.

## Widths

Drawn at: 402. At 1024: the day pane, as [`the-day.md`](the-day.md) (D-USE-83).

## Criteria

| ID                                         | When                    | Then                                                                            | Evidence                                  |
| ------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- |
| C-USE-set-my-days-usual-thursday-evening-1 | Life set before Evening | A yellow Life block with its items, the open gap, then Evening as the wind-down | `captures/usual-thursday-evening-402.png` |
| C-USE-set-my-days-usual-thursday-evening-2 | Time with no block      | It stays open rail with "Free until <time>.", never folded into Evening         | test                                      |
