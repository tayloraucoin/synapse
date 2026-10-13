---
target: specs/web/ux/day/review-the-day/states/loading.md
status: approved
promoted:
boards:
  - name: "review-day / loading / 402 / light"
    page: "USE — daily use"
    at: [2892, 5160]
    note: "Note · loading"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/loading-402.png
rulings: [D-USE-25]
---

# Review the day — loading

The day is on its way. Its note is "Note · loading" at x 2892, y 6090.

## What shows, top to bottom

- **The header paints at once:** `Breadcrumb` "‹ Orient" over "Monday, 12 October" (the date is known on the device).
- **The tray as a skeleton:** two `--color-fill-muted` bars (a short one for "To-dos", a longer one for the title) between the tray's hairlines.
- **The column as skeleton bands** in its shape, from x 62, `--radius-control`: filled bands where Wellness, Training and Work sit, dashed outlines where Breakfast and Lunch sit. No hour labels, no Orient line, no rail +.
- **Ready, go disabled:** a `--color-fill-muted` button reading "Loading the day" (muted).

## What happens

The tray and blocks fill in place when they arrive [ASSUMPTION: no layout jump; each fills on its own, see `partial.md`]. Reduced motion: the skeleton does not shimmer [ASSUMPTION: canon].

## Words

"Loading the day" (the disabled button's label).

## The notes on the boards

**"review-day / loading / 402 / light"**, "Note · loading" @ x 2892, y 6090:

> loading
>
> The header paints at once; the tray and blocks wait as skeleton bands in the column's shape. Ready, go disabled, reading Loading the day.

## Rulings

- N3's loading row: skeleton bands; the button disabled with the label "Loading the day".

## Widths

Drawn at: 402. At the desk: as success at 1440, with the bands in the capped column and the disabled button right-aligned (D-USE-39).

## Criteria

| ID                             | When            | Then                                                                                                  | Evidence                   |
| ------------------------------ | --------------- | ----------------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-review-the-day-loading-1 | The day is slow | The header paints; the tray and column show as skeletons; Ready, go reads "Loading the day", disabled | `captures/loading-402.png` |
