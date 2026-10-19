---
target: specs/web/ux/day/now/states/done-next-lifts.md
status: approved
promoted:
boards:
  - name: "now / done, next lifts / 402 / light"
    page: "USE — daily use"
    at: [964, 10200]
    note: "Frame @ x 964, y 11130"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/done-next-lifts-402.png
rulings: [D-USE-13]
---

# Now — Done, then the next lifts

Done tapped on Meditate. `?state=done-next-lifts`. Its note is the "Frame" at x 964, y 11130.

## What shows, top to bottom

As [`success.md`](success.md), status bar 7:20, with:

- **Meditate** as a done row in place: checked box, name muted, "10 min" muted.
- **Under it**, indented to the name: "Took 10 min ·" (label, ink) and "Change" (label, medium, verdigris).
- **Cold bath lifted** in the card: a water-drop glyph on the leaf chip, verdigris dot, "Cold bath", "10 min · 7:20", Start and Done.
- No undone rows remain below the card.

## What happens

- The box checks with a short settle (note 60); the row fades in place.
- Done records the planned length; "Took 10 min · Change" shows for a few seconds, then goes (D-USE-13) [ASSUMPTION: the house Toaster timing].
- The next undone item in order lifts.
- A row's checkbox does the same as Done (D-USE-13).

## What the person can do

- **Change:** opens the `MinutesStepper` (step 6; `../../running/index.md`).
- Everything else as success.

## Words

"Took <n> min · Change".

## The notes on the boards

**"now / done, next lifts / 402 / light"**, "Frame" @ x 964, y 11130:

> Done, then the next lifts
>
> Done on Meditate: the box checks with a short settle, the row fades in place with "Took 10 min · Change" for a few seconds (D-USE-13), and Cold bath lifts. Change opens the MinutesStepper (step 6).

## Rulings

- D-USE-13: Done is one tap, no menu; it records the planned length; "Took · Change" replaces N4's "As planned / Other…" chips.
- N4 story: out of the bath with wet hands, Cold bath checks with one large target (Done on the card).

## Widths

Drawn at: 402. Wider: Done keeps a fixed width (D-USE-39); the index's Platforms.

## Criteria

| ID                          | When                    | Then                                                                                    | Evidence                           |
| --------------------------- | ----------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-now-done-next-lifts-1 | Done on the lifted item | It checks and fades in place with "Took <planned> · Change"; the next undone item lifts | `captures/done-next-lifts-402.png` |
| C-USE-now-done-next-lifts-2 | Change                  | The MinutesStepper opens on the recorded length                                         | test                               |
