---
target: specs/web/ux/day/now/states/empty-break.md
status: approved
promoted:
boards:
  - name: "now / empty break / 402 / light"
    page: "USE — daily use"
    at: [1446, 11460]
    note: "Frame @ x 1446, y 12390"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/empty-break-402.png
rulings: [D-USE-25, D-USE-26, D-USE-72]
---

# Now — an empty Break

A true break (refinement 8): a Break block with Meal off and nothing in it, active at 15:02. The surface is [`../index.md`](../index.md). `?state=empty-break`.

## What shows, top to bottom

- Now's header and the To-dos tray closed ("Call the mechanic…"), as [`success.md`](success.md).
- The block header: the cup glyph, "Break", "15:00 to 15:10", the ··· button. No kind-colour bar, no card, no rows, no empty-state line: the rest of the screen is the background.
- **End break**, a full-width ink button, floating on the footer fade above the tabs (D-USE-25).
- The tab bar: Now (selected), Schedule, Review.

## What the person can do

- **End break** closes the Break. Decided (D-USE-74): End break opens the next block on Now with no close card (there is nothing to close, `../../block-complete/` is for blocks with items); past 15:10 the Break stays with End break and shows [`behind.md`](behind.md)'s quiet "Planned to end at 15:10" until it is pressed.
- The tray, the header ··· menu ([`header-menu.md`](header-menu.md)) and the tabs as on every Now state.

## Words

"Break" · "15:00 to 15:10" · "End break".

## The notes on the boards

**"now / empty break / 402 / light"**, "Frame" @ x 1446, y 12390:

> empty Break
>
> Just "Break, 15:00 to 15:10" with a cup glyph, and End break on the footer fade (D-USE-25). A true break holds nothing to do.

## Rulings

- N4, the intent pass (the flat `day/now.md`, deleted once folded, States: empty Break): "Break · 15:00 to 15:10" and "End break". A true break holds nothing to do.
- The block view's "Break, empty, a true break" note on "USE — set up" (x 2892, y 4710) assumed go mode shows it as rest, with no checklist and no Done to press; this frame draws that, with End break in Done's place. D-USE-72 lets the drawn marks stand.
- D-USE-25: End break floats on the fade from transparent to the background token.
- D-USE-26: the tray closed by default.
- A break with Meal on is a meal: [`meal-pick-topic.md`](meal-pick-topic.md).

## Widths

Drawn at: 402. At the desk: the column scales up, capped and centred, End break at a fixed width (D-USE-39 (1)).

## Criteria

| ID                      | When                                 | Then                                                                                          | Evidence                       |
| ----------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------ |
| C-USE-now-empty-break-1 | A Break with nothing in it is active | The header (cup, "Break", its span, ···) and End break on the fade; no card, no rows, no Done | `captures/empty-break-402.png` |
| C-USE-now-empty-break-2 | End break                            | The Break closes and the next block shows on Now                                              | test                           |
