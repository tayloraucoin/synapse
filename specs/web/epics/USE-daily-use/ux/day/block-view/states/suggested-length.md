---
target: specs/web/ux/day/block-view/states/suggested-length.md
status: approved
promoted:
boards:
  - name: "block-view / wellness, a length inline / 402 / light"
    page: "USE — set up"
    at: [7712, 3780]
    note: "Note · a length inline"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/suggested-length-402.png
rulings: [D-USE-138]
---

# Block view — a length inline

Meditate's length tapped in [`suggested-added.md`](suggested-added.md). `?state=suggested-length`. Its note is "Note · a length inline" at x 7712, y 4710.

## What shows, top to bottom

- The span total reads "18 of 60 min" and "42 min free".
- Rows: 7:05 "Pee and weigh" 2 min; 7:07 "Water" 1 min; 7:08 "Meditate" open on a `--color-surface` fill, rounded. Under its name is the hint "Steps of 5 min, or type one." (label, muted). At the trailing edge, in place of the length and the grip, is the `LengthStepper` [PROPOSED]: an outlined 36 px control with −, "15 min" (semibold) and +.
- The add row moves to 7:23. The list is as before.

## What the person can do

- − and + step by 5 min (by 1 min below 5); tapping the value types one. The total and later times move live. Return or a tap elsewhere saves and closes; Escape puts the value back [ASSUMPTION].
- The Item sheet still holds the rest of the item.

## The notes on the boards

**"block-view / wellness, a length inline / 402 / light"**, note "Note · a length inline" @ x 7712, y 4710:

> Suggested items · length inline
>
> Tapping a row's length opens a stepper in place: − and + in 5 min steps (1 min under 5), the number typeable. The total and every later time move live. Tapping elsewhere or Return closes it and saves. The Item sheet still holds the rest. [PROPOSED]

## Widths

Drawn at 402.
