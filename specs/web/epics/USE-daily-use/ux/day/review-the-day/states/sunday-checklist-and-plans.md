---
target: specs/web/ux/day/review-the-day/states/sunday-checklist-and-plans.md
status: approved
promoted:
boards:
  - name: "review-day / sunday, checklist and plans / 402 / light"
    page: "USE — daily use"
    at: [1446, 5160]
    note: "Frame @ x 1446, y 6090"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/sunday-checklist-and-plans-402.png
rulings: [D-USE-28, D-USE-34, D-USE-69]
---

# Review the day — Sunday, checklist beside plans

A checklist day that also has something at a time. Its note is the "Frame" at x 1446, y 6090.

## What shows, top to bottom

- Status bar 8:40. `Breadcrumb` "‹ Orient" over "Sunday, 18 October"; a hairline. No tray drawn; the tray stays (D-USE-69, as `sunday-nothing-set.md`).
- **The All day strip**, pinned above the rail [PROPOSED, Plumb]: "All day" (caption, muted) in the gutter; a card (`--color-surface`, hairline, `--radius-control`): "Sunday" (label, semibold) with a "Checklist" tag (an outlined pill, caption, muted) at the trailing edge, then small boxes in two columns: "Groceries", "Laundry", "Water the plants", "Meal prep". A hairline under the strip.
- **The rail**, hours 10 to 15 (the axis keeps 96 px an hour, D-USE-23 and D-USE-69; the frame draws 80).
- **Lunch with Sam** at its hour, 13:00 to 14:30: a rose block (`--color-category-rose-chip`, 3 px edge), a lock glyph and the name (label, semibold), "13:00 to 14:30 · Personal [placeholder]" — a set time, locked.
- Ready, go on the fade.

## What the person can do

- Tap the strip: the checklist in its block view (`../../block-view/index.md`).
- Tap a box: checks it [ASSUMPTION: here as on Now].
- Given a span ("Set a time"), the checklist moves onto the rail and keeps its boxes.
- Ready, go.

## Words

"All day" · "Checklist" (the tag) · the block's "<start> to <end> · <kind>".

## The notes on the boards

**"review-day / sunday, checklist and plans / 402 / light"**, "Frame" @ x 1446, y 6090:

> checklist beside plans
>
> How the two differ: a checklist has no times, so it sits in an "All day" strip above the rail with small boxes and a Checklist tag. Anything with a time sits on the rail at its hour, as Lunch with Sam does here (a set time, locked). Given a span, a checklist moves onto the rail and keeps its boxes.

## Rulings

- D-USE-28: a checklist with no span sits in an "All day" strip above the rail with a Checklist tag.
- D-USE-34: Checklist is a block kind in the New block sheet (step 10).

## Widths

Drawn at: 402. At the desk: the strip spans the capped column (D-USE-39).

## Criteria

| ID                                                | When                                       | Then                                                                  | Evidence                                      |
| ------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------- | --------------------------------------------- |
| C-USE-review-the-day-sunday-checklist-and-plans-1 | A checklist with no span and a timed block | The checklist in the All day strip; the block on the rail at its hour | `captures/sunday-checklist-and-plans-402.png` |
| C-USE-review-the-day-sunday-checklist-and-plans-2 | The checklist gains a span                 | It moves onto the rail with its boxes                                 | test                                          |
