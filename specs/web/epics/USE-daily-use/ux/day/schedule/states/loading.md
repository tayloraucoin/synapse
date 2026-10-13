---
target: specs/web/ux/day/schedule/states/loading.md
status: approved
promoted:
boards: []
not_drawn: "No Schedule frame draws loading; the living truth has no Schedule surface file yet"
rulings: [D-USE-69, D-USE-74]
---

# Schedule — loading

The day is on its way. The surface is [`../index.md`](../index.md). `?state=loading`.

## What shows

Not drawn. The built Schedule's last spec reads "loading (axis with skeleton blocks)" (imported SC-01). USE draws the same column loading on Review the day (`../../review-the-day/states/loading.md`).

Decided (D-USE-77): as Review the day's loading, without Ready, go:

- The title paints at once (the date is known on the device); the tabs are real.
- The tray as a skeleton: two `--color-fill-muted` bars between its hairlines; no spinner (D-USE-69).
- The column as skeleton bands in the day's shape, `--radius-control`; no hour labels, no now line, no verdigris edge. Never shimmering (A-14).
- Each region fills in place when it arrives ([`partial.md`](partial.md)).

## What the person can do

The tabs.

## Widths

Not drawn. Desk: [`../index.md`](../index.md) › Platforms.

## Criteria

| ID                       | When                | Then                                                        | Evidence |
| ------------------------ | ------------------- | ----------------------------------------------------------- | -------- |
| C-USE-schedule-loading-1 | The day is fetching | Title and tabs real; skeleton bands; no spinner, no shimmer | manual   |
