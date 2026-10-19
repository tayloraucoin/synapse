---
target: specs/web/ux/day/block-view/states/loading.md
status: approved
promoted:
boards:
  - name: "block-view / loading / 402 / light"
    page: "USE — daily use"
    at: [4820, 6420]
    note: "Note · loading"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/loading-402.png
rulings: [D-USE-24]
---

# Block view — loading

From the day, the block's rows not yet in. `?state=loading`. Its note is "Note · loading" at x 4820, y 7350.

## What shows, top to bottom

- Status bar 7:01; breadcrumb "‹ Today › Wellness"; the header live: leaf bar, "Wellness", "7:05 to 8:00", "Edit", ···.
- Four skeleton rows on their hairlines, each a small rounded square where the checkbox sits and a bar of varying length where the name sits (`--color-fill-muted`); a fifth slot left blank, a closing hairline.
- No rail times, lengths, add row, free region or peek.

## What the person can do

- "‹ Today" goes back. [ASSUMPTION] Edit and ··· show but wait for the rows: a tap does nothing until they load.

## Words

None of its own.

## The notes on the boards

**"block-view / loading / 402 / light"**, note "Note · loading" @ x 4820, y 7350:

> loading
>
> The header paints from the day already loaded; only the rows wait, as skeletons.

## Rulings

- The intent file: "As Set my days: skeleton rows; header live".
- Editing mode loads the same way, with "‹ Monday" and ··· alone [ASSUMPTION; not drawn].

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                         | When                 | Then                                                            | Evidence                   |
| -------------------------- | -------------------- | --------------------------------------------------------------- | -------------------------- |
| C-USE-block-view-loading-1 | The rows are loading | The breadcrumb and header paint at once; rows show as skeletons | `captures/loading-402.png` |
