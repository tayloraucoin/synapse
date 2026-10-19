---
target: specs/web/ux/set-my-days/new-block-sheet/states/transition.md
status: approved
promoted:
boards:
  - name: "new-block / transition / 402 / light"
    page: "USE — set up"
    at: [2410, 5040]
    note: "Frame @ x 2410, y 5970"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/captures/transition-402.png
rulings: [D-USE-34]
---

# New block sheet — transition

The + menu's Transition (`../../set-my-days/states/plus-menu.md`) on the usual Monday, at 8:00, inside Training. `?sheet=new-block&state=transition` [ASSUMPTION: the state param].

## What shows, top to bottom

- Grabber; ×; "Usual Monday · inside Training" over "New transition".
- No Kind, no Repeats, no Checklist.
- **Name:** the icon tile holding a car emoji beside "Drive to the YMCA".
- Hairline; **Starts** "8:00"; hairline; **Ends** "8:15", "15 min" muted beside it.
- **Colour:** the clay swatch, "Takes Training's colour" (not a choice).
- Hairline; **Meal**, off, "Off: a slim band between things, in italic."
- "8:00 falls in Training, so it goes inside Training. Workout: gym moves to 8:15."
- "Add transition", ink.

## What the person can do

- Change name, icon, Starts, Ends; switch Meal on (a meal band, `meal.md`).
- **Add transition:** it goes inside the block its time falls in, asking nothing; the items after it move by its length, as the line names; the sheet closes to the column. A transition outside every block stands between blocks [ASSUMPTION: the line then reads "Goes in between <Block> and <Block>."; not drawn].

## Words

"Usual Monday · inside Training" · "New transition" · "Takes Training's colour" · "Meal" · "Off: a slim band between things, in italic." · "8:00 falls in Training, so it goes inside Training. Workout: gym moves to 8:15." · "Add transition". "Drive to the YMCA" is [placeholder].

## The notes on the boards

**"new-block / transition / 402 / light"**, "Frame" @ x 2410, y 5970:

> Transition
>
> From the + menu's Transition. No kind and no Repeats: it takes its block's colour and days. 15 min by default, shown as Ends. 8:00 falls in Training, so it goes inside, asking nothing (round 5); the line names what moves. Meal off.

## Rulings

- D-USE-34: a transition takes its block's colour, 15 min by default, approved as drawn.
- Round 5: a transition dropped inside a block's span belongs to it, asking nothing. It takes its block's days, so it repeats as the block does.
- N2 had Meal on transitions only; a transition can still be one (round 3).

## Widths

Drawn at: 402. At 1024 and wider: the right panel at `--sheet-w` (D-USE-39, D-USE-83).

## Criteria

| ID                                 | When                               | Then                                                            | Evidence                      |
| ---------------------------------- | ---------------------------------- | --------------------------------------------------------------- | ----------------------------- |
| C-USE-new-block-sheet-transition-1 | Transition from the + menu at 8:00 | No kind, no Repeats; Ends 8:15 with "15 min"; Training's colour | `captures/transition-402.png` |
| C-USE-new-block-sheet-transition-2 | Added inside Training              | It joins Training with no question; the next item moves to 8:15 | test                          |
