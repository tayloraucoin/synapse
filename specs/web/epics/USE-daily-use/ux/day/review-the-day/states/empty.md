---
target: specs/web/ux/day/review-the-day/states/empty.md
status: approved
promoted:
boards:
  - name: "review-day / empty / 402 / light"
    page: "USE — daily use"
    at: [2410, 5160]
    note: "Note · empty"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/empty-402.png
rulings: [D-USE-28, D-USE-30, D-USE-68]
---

# Review the day — empty: no default for this weekday

The weekday has no usual plan. Its note is "Note · empty" at x 2410, y 6090.

## What shows, top to bottom

- Status bar 6:58. `Breadcrumb` "‹ Orient" over "Saturday, 17 October".
- The To-dos tray, closed, as success ("Call the mechanic…").
- 48 px down, 20 px sides: "Saturday has no plan yet." (heading, semibold), then "Set Saturday once and it comes back every week, or go with just the to-dos today." (body, muted) [the second line is placeholder, per the note].
- No column, no rail +.
- At the foot, stacked: "Go without a plan" (outlined `Button`, 48 px) over "Set Saturday" (the primary, ink, 48 px). Ready, go is not shown.

## What the person can do

- **Set Saturday:** Set my days at Saturday (`../../../set-my-days/set-my-days/index.md`).
- **Go without a plan:** Now with only the to-dos, so the tray stays ([`../../now/index.md`](../../now/index.md)).
- Open the tray.

## Words

"<Weekday> has no plan yet." · "Set <Weekday> once and it comes back every week, or go with just the to-dos today." [placeholder] · "Go without a plan" · "Set <Weekday>".

## The notes on the boards

**"review-day / empty / 402 / light"**, "Note · empty" @ x 2410, y 6090:

> empty · no default for Saturday
>
> Set Saturday opens Set my days at Saturday. Go without a plan goes to Now with only the to-dos, so the tray stays. The second line is [placeholder].

## Rulings

- N3's "no default for this weekday" row, drawn as round 1.
- Decided (D-USE-68): this frame and [`sunday-nothing-set.md`](sunday-nothing-set.md) both draw a day with nothing set, differently; no D-line says which day gets which. Default: the Sunday frame wins for every day with nothing set, since D-USE-28 ("an empty day offers Make a checklist or Plan with blocks") and D-USE-30 ("an empty day's choice sits under the title") came after this frame, and "Plan with blocks" does what "Set Saturday" does; this frame then stays as the record of N3's words. The alternative: keep both, this frame for a weekday whose usual week is unset and the Sunday frame for a day left loose on purpose.

## Widths

Drawn at: 402. At the desk: the words and the two buttons in the capped column, the buttons right-aligned as Ready, go [ASSUMPTION] (D-USE-39).

## Criteria

| ID                           | When                          | Then                                                              | Evidence                 |
| ---------------------------- | ----------------------------- | ----------------------------------------------------------------- | ------------------------ |
| C-USE-review-the-day-empty-1 | The weekday has no usual plan | The line, the tray, Go without a plan and Set Saturday; no column | `captures/empty-402.png` |
| C-USE-review-the-day-empty-2 | Go without a plan             | Now with only the to-dos                                          | test                     |
