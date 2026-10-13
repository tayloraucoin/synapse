---
target: specs/web/ux/work/today/states/loading.md
status: approved
promoted:
boards:
  - name: "phone-today / loading / 402 / light"
    page: "USE — work"
    at: [8676, 5760]
    note: "Notes · phone, Today (row 5, cont.) @ x 8676"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/loading-402.png
rulings: [D-USE-57]
---

# Today — loading

## What shows, top to bottom

**Phone (402):** the `AppHeader`, the To-dos tray line, the Work block header and `BottomNav` are real at once. Under the header, skeleton rows in the tiers' rhythm: a heading bar, two rows (a circle, a title bar, a shorter meta bar), a heading bar, two rows. Still, never shimmering (A-14).

**Desk (not drawn):** [ASSUMPTION] the rail, week strip, header and day column real at once (they come from the usual week), skeleton rows in the main column only. N6: "Skeleton rows".

## The notes on the boards

**Notes · phone, Today (row 5, cont.) @ x 8676** — Loading

Skeleton rows under the block header, in the tiers' rhythm. The header and tabs are real at once.

## Rulings

- D-USE-57: loading as skeleton rows.

## Widths

Drawn at 402. Desk: [ASSUMPTION] above.

## Criteria

| ID                    | When                      | Then                                                           | Evidence                   |
| --------------------- | ------------------------- | -------------------------------------------------------------- | -------------------------- |
| C-USE-today-loading-1 | Today's items are loading | Header and tabs real; still skeleton rows in the tiers' rhythm | `captures/loading-402.png` |
