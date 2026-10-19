---
target: specs/web/ux/day/now/states/row-tapped.md
status: approved
promoted:
boards:
  - name: "now / row tapped, current / 402 / light"
    page: "USE — daily use"
    at: [1446, 10200]
    note: "Frame @ x 1446, y 11130"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/row-tapped-402.png
rulings: []
---

# Now — a row tapped, made current

Cold bath tapped while Meditate was lifted. `?state=row-tapped`. Its note is the "Frame" at x 1446, y 11130.

## What shows, top to bottom

As [`success.md`](success.md), status bar 7:14, with:

- **Meditate** drops back to an undone row in its place: empty box, "Meditate", "10 min", a grip.
- **Cold bath** lifted in the card under it: the water-drop glyph, verdigris dot, "Cold bath", "10 min · 7:20", Start and Done.

## What happens

- The tapped row becomes current and lifts; the one that was current goes back to a row where it sits in the order. Nothing is reordered.
- The card's planned start stays the item's own ("7:20") [ASSUMPTION: times do not re-flow on a tap].

## What the person can do

As success, on Cold bath.

## The notes on the boards

**"now / row tapped, current / 402 / light"**, "Frame" @ x 1446, y 11130:

> a row tapped, made current
>
> Tap Cold bath while Meditate is lifted: Cold bath becomes current and lifts; Meditate drops back to a row in its place. Order is a plan, not a rule.

## Rulings

- N4 "What you do": tap a row to make it the current item. Order is a plan, not a rule (note 60).

## Widths

Drawn at: 402. Wider: the index's Platforms.

## Criteria

| ID                     | When                    | Then                                                               | Evidence                      |
| ---------------------- | ----------------------- | ------------------------------------------------------------------ | ----------------------------- |
| C-USE-now-row-tapped-1 | An undone row is tapped | It lifts as current; the old current returns to its place as a row | `captures/row-tapped-402.png` |
