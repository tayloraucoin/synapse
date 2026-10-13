---
target: specs/web/ux/day/block-view/states/current.md
status: approved
promoted:
boards:
  - name: "block-view / current / 402 / light"
    page: "USE — daily use"
    at: [2892, 6420]
    note: "Note · current"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/current-402.png
rulings: [D-USE-30, D-USE-31, D-USE-49]
---

# Block view — current

Opened from Schedule during go, while Wellness runs, at 7:14. `?state=current`. Its note is "Note · current" at x 2892, y 7350.

## What shows, top to bottom

As [`success.md`](success.md), except:

- Status bar 7:14.
- "Pee and weigh", "Water", "Start the cold bath" checked and faded.
- **The now-line:** verdigris, a dot at the rail's edge and a line across the column at 7:14, inside "Meditate" (7:10, 10 min), the item under way; its time tag "7:14" in verdigris on the rail under "7:10".
- "Cold bath" at 7:20, the add row at 7:30, "Free until 8:00", "8:00" and its line.
- **Tabs:** the `BottomNav` at the foot, "Now", "Schedule", "Review", Schedule selected (label semibold); it covers the Training peek.

## What the person can do

- As success: check, swipe, Edit, ···, the add row, an item's name.
- "‹ Today" goes back to Schedule [ASSUMPTION: the breadcrumb returns to where it came from, Schedule here; the boards draw "Today" either way].
- The tabs: Now, Schedule, Review.

## Words

As success; the tab labels.

## The notes on the boards

**"block-view / current / 402 / light"**, note "Note · current" @ x 2892, y 7350:

> current · from Schedule, during go
>
> The same view opened from Schedule while Wellness runs. The now-line, verdigris, crosses the item under way with its time in the rail. Tabs stay visible, Schedule selected.

## Rulings

- N3 "from Schedule, during go": the same, plus a now-line inside the block while it is current.
- D-USE-30: a now-line runs across every timed day view (time tag in the rail, faint line over content). D-USE-31: Schedule during go (now-line, checks).
- The verdigris now-line is "this moment" (N4); D-USE-49 keeps verdigris for Taylor's hands and the moment, not firing.
- [ASSUMPTION] the line moves with the clock, a minute at a time.

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39), the tabs in the rail.

## Criteria

| ID                         | When                                    | Then                                                                                                      | Evidence                   |
| -------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-block-view-current-1 | A running block is opened from Schedule | The verdigris now-line crosses the item under way with its time on the rail; tabs show, Schedule selected | `captures/current-402.png` |
| C-USE-block-view-current-2 | The block is not current                | No now-line is drawn                                                                                      | test                       |
