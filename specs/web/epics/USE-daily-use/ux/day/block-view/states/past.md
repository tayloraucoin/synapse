---
target: specs/web/ux/day/block-view/states/past.md
status: approved
promoted:
boards:
  - name: "block-view / past / 402 / light"
    page: "USE — daily use"
    at: [3374, 6420]
    note: "Note · past"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/past-402.png
rulings: [D-USE-13, D-USE-30]
---

# Block view — past

Wellness opened from Schedule at 9:40, after its end. `?state=past`. Its note is "Note · past" at x 3374, y 7350.

## What shows, top to bottom

As [`current.md`](current.md), except:

- Status bar 9:40; no now-line (the block is over).
- "Pee and weigh", "Water", "Start the cold bath", "Meditate" checked and faded.
- "Cold bath" (7:20, 10 min) unchecked, its box live.
- The add row at 7:30, "Free until 8:00", "8:00"; the tabs, Schedule selected.
- The rows fade but stay live [ASSUMPTION: the frame draws the unchecked row and the add row near full strength; the fade is the checked rows' own].

## What the person can do

- Check "Cold bath" late: it checks, as any other (D-USE-13).
- Everything else as success.

## Words

As success. Nothing says missed, late or skipped.

## The notes on the boards

**"block-view / past / 402 / light"**, note "Note · past" @ x 3374, y 7350:

> past
>
> At 9:40 Wellness is over. Rows fade but stay live: Cold bath can still be checked late. Nothing says missed.

## Rulings

- N3 "block in the past": rows faded and still live; checking late is allowed.
- Product rules: no miss is reported (notifications that never report a miss; no second person).
- D-USE-30: the now-line belongs to a current block only.

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                      | When                                     | Then                                                            | Evidence                |
| ----------------------- | ---------------------------------------- | --------------------------------------------------------------- | ----------------------- |
| C-USE-block-view-past-1 | A finished block is opened               | No now-line; unchecked rows stay checkable; no word says missed | `captures/past-402.png` |
| C-USE-block-view-past-2 | An item is checked after the block's end | It records as done                                              | test                    |
