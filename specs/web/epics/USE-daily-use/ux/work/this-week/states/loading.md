---
target: specs/web/ux/work/this-week/states/loading.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on row 6; follows the phone's loading ('phone-today / loading / 402 / light', D-USE-57) and Set my days' loading ('set-my-days / loading / 402 / light')."
rulings: [D-USE-57]
---

# This week on the phone — loading

`?state=loading` [ASSUMPTION: key].

## What shows, top to bottom

[ASSUMPTION, following [`../../today/states/loading.md`](../../today/states/loading.md) (D-USE-57: skeleton rows, still, never shimmering, A-14) and [`../../../set-my-days/set-my-days/states/loading.md`](../../../set-my-days/set-my-days/states/loading.md)]

- **The day:** "‹ Week", the dated title and the chips real at once; the blocks as skeleton bands in their places; inside the Work block, skeleton rows in the tiers' rhythm (a heading bar, two rows, a heading bar, one row); no fit line until loaded. **Pool** and the + faded and disabled until the day has loaded.
- **The pool sheet:** the grabber, "Pool", ×, the tabs and the filters real; the list as skeleton rows (a square, a title bar, a shorter meta bar) under two skeleton client heads; the sync line hidden until loaded.

## What the person can do

Switch days on the chips; "‹ Week"; close the sheet; switch tabs.

## Rulings

- D-USE-57: loading as skeleton rows (the phone).

## Widths

Not drawn. 1024 and up: the Week's loading ([`../../week/states/loading.md`](../../week/states/loading.md)).

## Criteria

| ID                        | When                           | Then                                                                        | Evidence |
| ------------------------- | ------------------------------ | --------------------------------------------------------------------------- | -------- |
| C-USE-this-week-loading-1 | The day or the pool is loading | Header, chips, tabs and filters real; still skeleton rows; nothing shimmers | manual   |
