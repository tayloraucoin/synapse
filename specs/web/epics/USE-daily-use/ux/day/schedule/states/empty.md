---
target: specs/web/ux/day/schedule/states/empty.md
status: approved
promoted:
boards: []
not_drawn: "No Schedule frame draws an empty day; the living truth has no Schedule surface file yet"
rulings: [D-USE-68]
---

# Schedule — empty

A day with nothing on it: no block and no checklist. The surface is [`../index.md`](../index.md). `?state=empty`.

## What shows

Not drawn. The living truth (`specs/web/ux/`) has no Schedule surface; the built Schedule's last spec (imported SC-01, `docs/decisions/imported/ux/epic2_in_use_ux_architecture.md` §5) reads "empty day (LS-00 with the axis behind it)". USE: a day with nothing set takes the Sunday frame, Make a checklist, Plan with blocks, Copy another day under the title (D-USE-68, on Review the day).

Decided (D-USE-77): the title, the tray and the axis with the now line, nothing on it; under the title D-USE-68's three choices, as `../../review-the-day/states/sunday-nothing-set.md`.

## What the person can do

The three choices, the tray, the tabs (default above).

## Widths

Not drawn. Desk: [`../index.md`](../index.md) › Platforms.

## Criteria

| ID                     | When                   | Then                                                                     | Evidence |
| ---------------------- | ---------------------- | ------------------------------------------------------------------------ | -------- |
| C-USE-schedule-empty-1 | A day with nothing set | The axis and now line show with the day's choices; no count, no "missed" | manual   |
