---
target: specs/web/ux/day/now/states/transition.md
status: approved
promoted:
boards:
  - name: "now / transition, between blocks / 402 / light"
    page: "USE — daily use"
    at: [5302, 10200]
    note: "Frame @ x 5302, y 11130"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/transition-402.png
rulings: []
---

# Now — between blocks (transition)

Breakfast, between Training and Work, at 9:02. `?state=transition`. Its note is the "Frame" at x 5302, y 11130.

## What shows, top to bottom

As [`success.md`](success.md), status bar 9:02, with:

- **`BlockHeader`:** the fork-and-knife glyph (muted) in place of the colour bar, "Breakfast", "9:00 to 9:30", ···.
- **The card alone:** the fork-and-knife on a neutral `--color-fill-muted` tile (no kind colour), verdigris dot, "Breakfast", "30 min · 9:00", and **Done** full width (ink). No Start.
- No other rows; space to the tabs.

## What the person can do

- **Done:** checks Breakfast; Now moves to Work [ASSUMPTION: through the all-done footer, "Start Work"].
- ···, the tray, the tabs.

## The notes on the boards

**"now / transition, between blocks / 402 / light"**, "Frame" @ x 5302, y 11130:

> between blocks (transition)
>
> Breakfast, between Training and Work, is the active block on its own: the meal glyph instead of a kind colour, one item, and a full-width Done with no Start.

## Rulings

- N4's "between blocks" row. A meal with topics is row 2's ([`meal-pick-topic.md`](meal-pick-topic.md), D-USE-28); this frame is a meal with none [ASSUMPTION].

## Widths

Drawn at: 402. Wider: the index's Platforms.

## Criteria

| ID                     | When                             | Then                                                  | Evidence                      |
| ---------------------- | -------------------------------- | ----------------------------------------------------- | ----------------------------- |
| C-USE-now-transition-1 | A meal between blocks is current | The meal glyph, one item, a full-width Done, no Start | `captures/transition-402.png` |
