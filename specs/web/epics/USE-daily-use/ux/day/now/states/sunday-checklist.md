---
target: specs/web/ux/day/now/states/sunday-checklist.md
status: approved
promoted:
boards:
  - name: "now / sunday, the checklist after Ready, go / 402 / light"
    page: "USE — daily use"
    at: [6266, 10200]
    note: "Frame @ x 6266, y 11130"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/sunday-checklist-402.png
rulings: [D-USE-28, D-USE-30, D-USE-72]
---

# Now — Sunday, the checklist after Ready, go

A checklist day (a checklist with no span, D-USE-28) at 11:20. `?state=sunday-checklist`. Its note is the "Frame" at x 6266, y 11130.

## What shows, top to bottom

As [`checklist-block.md`](checklist-block.md), status bar 11:20, with:

- **`BlockHeader`:** leaf bar, "Sunday", "All day · Checklist · next: Lunch with Sam, 13:00", ···.
- The same rows with boxes and grips (Water the plants checked and faded).
- **An add row:** + (muted) and "Add to the checklist" (body, muted).

## What happens

- At 13:00 Lunch with Sam, a set-time block, lifts above the checklist as the active block; after it, the checklist returns. Decided (D-USE-72).
- The All day strip on Review the day and Schedule opens the checklist in block view (D-USE-72; `../../review-the-day/states/sunday-checklist-and-plans.md`).

## What the person can do

Check off in any order; reorder by the grips; Add to the checklist [ASSUMPTION: a new row in place, Return adds the next, as making the checklist]; ···, the tray, the tabs.

## Words

"All day · Checklist · next: <block>, <time>" · "Add to the checklist".

## The notes on the boards

**"now / sunday, the checklist after Ready, go / 402 / light"**, "Frame" @ x 6266, y 11130:

> sunday, the checklist after Ready, go
>
> On a checklist day, Now is the checklist: "All day · Checklist · next: Lunch with Sam, 13:00", reorder grips, Add to the checklist. At 13:00 Lunch lifts above it; after, the checklist returns. Check off in any order.

## Rulings

- D-USE-28, D-USE-30: an empty day offers Make a checklist; a checklist with no span sits in an All day strip.
- Decided (D-USE-72), open-2's feedback round: on a checklist day Now is the checklist, and a set-time block lifts above it at its time.

## Widths

Drawn at: 402. Wider: the index's Platforms.

## Criteria

| ID                           | When                     | Then                                                                                | Evidence                            |
| ---------------------------- | ------------------------ | ----------------------------------------------------------------------------------- | ----------------------------------- |
| C-USE-now-sunday-checklist-1 | A checklist day after go | Now is the checklist, with "All day · Checklist · next: …" and Add to the checklist | `captures/sunday-checklist-402.png` |
| C-USE-now-sunday-checklist-2 | A set-time block's start | It lifts above the checklist; after it ends the checklist returns                   | test                                |
