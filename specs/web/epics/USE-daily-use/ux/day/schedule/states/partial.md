---
target: specs/web/ux/day/schedule/states/partial.md
status: approved
promoted:
boards: []
not_drawn: "No Schedule frame draws partial; the day and the to-dos load separately, as on Review the day"
rulings: [D-USE-69]
---

# Schedule — partial

The day and the to-dos load separately; one arrives and the other fails. The surface is [`../index.md`](../index.md). `?state=partial`.

## What shows

Not drawn. The built Schedule's last spec lists no partial state (imported SC-01). Decided (D-USE-77): region by region, in place, as Review the day and Now (D-USE-69; `../../review-the-day/states/partial.md`, `../../now/states/partial.md`):

- **The day loads, the to-dos fail:** the column as success; the tray's row reads "To-dos didn't load. Try again." in ink (D-USE-69).
- **The to-dos load, the day fails:** the tray as success; the column is [`error.md`](error.md)'s `RegionRetry`.

## What the person can do

Try again on the failed region only; what loaded stays live.

## Widths

Not drawn. Desk: [`../index.md`](../index.md) › Platforms.

## Criteria

| ID                       | When             | Then                                                   | Evidence |
| ------------------------ | ---------------- | ------------------------------------------------------ | -------- |
| C-USE-schedule-partial-1 | One region fails | Only that region shows Try again; the other stays live | manual   |
