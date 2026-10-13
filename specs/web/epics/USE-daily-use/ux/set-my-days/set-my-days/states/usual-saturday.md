---
target: specs/web/ux/set-my-days/set-my-days/states/usual-saturday.md
status: approved
promoted:
boards:
  - name: "set-my-days / usual Saturday, To-dos block (A) / 402 / light"
    page: "USE — set up"
    at: [1446, 0]
    note: "Frame @ x 1446, y 930"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/usual-saturday-402.png
rulings: [D-USE-49, D-USE-79, D-USE-110]
---

# Set my days — usual Saturday, a To-dos block

The usual Saturday opened from the week (A): Errands is a To-dos block that holds its rule, not to-dos. `?state=usual-saturday`. Its note is the card "Frame" at x 1446, y 930.

## What shows, top to bottom

- Status bar 21:10. "‹ Now" over "Set my days"; "✓ Saved". "Usual week" selected.
- Chips: all seven with dots; "S" (Saturday) ink.
- Day line: "Saturday", "Up at 8:00", "Lights out 23:00", the ···. A hairline.
- The column from 8:
  - Orient's line, "Orient · 5 min".
  - **Wellness** 8:05 to 9:30 (leaf): items as icons and names in a row, "🚶 Walk", "☕ Coffee outside", "🧘 Meditate" [placeholder].
  - **Breakfast** 9:30 to 10:00, a dashed meal band.
  - **Errands** 10:00 to 12:30, a To-dos block (moss fill, moss rule): no items; muted, "Fills from To-dos each Saturday, any type, picked on the day. [PROPOSED]".
  - **Lunch** 12:30 to 13:30, a dashed meal band, and the rail beyond.
- The + bottom right.

## What the person can do

- Tap Errands: its Block view in editing, the To-dos kind ([`../../../day/block-view/states/todos-add-open.md`](../../../day/block-view/states/todos-add-open.md) and the To-dos frames beside it).
- Tap Wellness: [`../../../day/block-view/states/wellness-editing.md`](../../../day/block-view/states/wellness-editing.md).
- "‹ Now", chips, bounds, ···, the +, a tap on the rail, as the surface.

## Words

"Fills from To-dos each Saturday, any type, picked on the day." ("Fills from To-dos each <weekday>, <types>, picked on the day.") The "[PROPOSED]" in the frame is a canvas mark, not a string.

## The notes on the boards

**"set-my-days / usual Saturday, To-dos block (A) / 402 / light"**, "Frame" @ x 1446, y 930:

> Usual Saturday
>
> [PROPOSED] Errands is a To-dos block. In the usual week it holds the rule, not the to-dos ("Fills from To-dos each Saturday"), the way Work says "Work goes in on This week".

## Rulings

- The [PROPOSED] stands as drawn under D-USE-49 (the lock). In the usual week a To-dos block holds its rule, as a Work block holds its time with "The time is kept every week." and "Work goes in on This week." (open-3 round 1; drawn on the superseded A frame, cited in [`the-day.md`](the-day.md)).
- Open-4 "Life and chores" and round 3 had a To-dos block pick one or more Types or Any type; round 4 settled that blocks never filter by Type, so "any type" is the only reading: a To-dos block takes any to-do with no day, picked on the day. The block's layer is named "Life, Errands, from to-dos [PROPOSED]", from the round when it was a Life block from to-dos; it draws To-dos (moss).

## Widths

Drawn at: 402. At 1024: the day pane, as [`the-day.md`](the-day.md) (D-USE-39 (3), D-USE-83).

## Criteria

| ID                                 | When                               | Then                                         | Evidence                          |
| ---------------------------------- | ---------------------------------- | -------------------------------------------- | --------------------------------- |
| C-USE-set-my-days-usual-saturday-1 | A To-dos block in the usual week   | It shows its rule line, no to-dos            | `captures/usual-saturday-402.png` |
| C-USE-set-my-days-usual-saturday-2 | That date in This week, on the day | The block fills from To-dos as its rule says | test                              |
