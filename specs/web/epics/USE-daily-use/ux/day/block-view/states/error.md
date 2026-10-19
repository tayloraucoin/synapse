---
target: specs/web/ux/day/block-view/states/error.md
status: approved
promoted:
boards:
  - name: "block-view / error / 402 / light"
    page: "USE — daily use"
    at: [5302, 6420]
    note: "Note · error"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/error-402.png
rulings: [D-USE-24]
---

# Block view — error

From the day, the rows failed to load. `?state=error`. Its note is "Note · error" at x 5302, y 7350.

## What shows, top to bottom

- Status bar 7:01; breadcrumb "‹ Today › Wellness"; the header live with "Edit" and ···; a hairline.
- `RegionRetry` in the column: "Wellness didn't load." (body, semibold, ink); "Nothing is lost. The checklist is still there once it loads." (body, muted); "Try again" (secondary `Button`, `--color-surface` fill).
- Nothing else; no rows, rail or peek.

## What the person can do

- "Try again": loads the rows again; success or this state.
- "‹ Today" goes back. [ASSUMPTION] Edit and ··· show but act only once the rows load.

## Words

"<Block> didn't load." ("Wellness didn't load."); "Nothing is lost. The checklist is still there once it loads." [ASSUMPTION: the second line is [placeholder], as Review the day's error marks its reassurance line, "Note · error" @ x 3374, y 6090]; "Try again". Never red.

## The notes on the boards

**"block-view / error / 402 / light"**, note "Note · error" @ x 5302, y 7350:

> error
>
> RegionRetry under a live header, the same words as Review the day's error. The breadcrumb still goes back.

## Rulings

- The intent file: "As Set my days: `RegionRetry`". Review the day's error (`../review-the-day/`, cited) shares the words.
- Editing mode errs the same way, with "‹ Monday" [ASSUMPTION; not drawn].

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                       | When                     | Then                                                                                      | Evidence                 |
| ------------------------ | ------------------------ | ----------------------------------------------------------------------------------------- | ------------------------ |
| C-USE-block-view-error-1 | The rows fail to load    | `RegionRetry` with "Wellness didn't load." and Try again under a live header; nothing red | `captures/error-402.png` |
| C-USE-block-view-error-2 | The breadcrumb is tapped | It goes back to the day                                                                   | test                     |
