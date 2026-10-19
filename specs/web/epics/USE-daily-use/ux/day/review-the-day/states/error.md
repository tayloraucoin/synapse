---
target: specs/web/ux/day/review-the-day/states/error.md
status: approved
promoted:
boards:
  - name: "review-day / error / 402 / light"
    page: "USE — daily use"
    at: [3374, 5160]
    note: "Note · error"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/error-402.png
rulings: []
---

# Review the day — error

The day did not load. Its note is "Note · error" at x 3374, y 6090.

## What shows, top to bottom

- `Breadcrumb` "‹ Orient" over "Monday, 12 October"; a hairline.
- No tray is drawn [ASSUMPTION: the tray loads on its own and shows when it can; `partial.md`].
- `RegionRetry` in the column, 20 px sides, matching Orient's error: "The day didn't load." (body, semibold), "Nothing is lost. The plan is still there once it loads." (label, muted) [placeholder], then "Try again" (a secondary `Button`, `--color-fill-muted`).
- Ready, go hidden; nothing at the foot.

## What the person can do

- **Try again** reloads the day; the frame goes to loading.
- "‹ Orient" still goes back.

## Words

"The day didn't load." · "Nothing is lost. The plan is still there once it loads." [placeholder] · "Try again".

## The notes on the boards

**"review-day / error / 402 / light"**, "Note · error" @ x 3374, y 6090:

> error
>
> RegionRetry in the column, matching Orient's error. Ready, go hidden; the breadcrumb still goes back. The reassurance line is [placeholder].

## Rulings

- N3's error row: `RegionRetry`, "The day didn't load."; the button hidden. Orient's error is the pattern (`../../orient/states/error.md`).

## Widths

Drawn at: 402. At the desk: the same, in the capped column (D-USE-39).

## Criteria

| ID                           | When                  | Then                                                                 | Evidence                 |
| ---------------------------- | --------------------- | -------------------------------------------------------------------- | ------------------------ |
| C-USE-review-the-day-error-1 | The day fails to load | `RegionRetry` with Try again; Ready, go hidden; the breadcrumb works | `captures/error-402.png` |
