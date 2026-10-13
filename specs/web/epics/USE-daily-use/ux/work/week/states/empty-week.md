---
target: specs/web/ux/work/week/states/empty-week.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn at the desk; N6's state table names it, and the drawn Friday ('Nothing slotted yet') is one empty day of it."
rulings: [D-USE-42, D-USE-56]
---

# Week — empty week

Nothing is slotted on any day of the week shown (a new week, or Sunday planning not yet done). `?state=empty-week` [ASSUMPTION: key].

## What shows

[ASSUMPTION, N6 "empty week": "The usual week's blocks, with empty tiers; the pool is full"] Both lenses keep the usual week's blocks and the week's events, since blocks come from the usual week and only the work is empty (as Today's nothing-planned note). **Priority:** every tier cell empty; each day's Fits reads "Nothing slotted yet" (subtle), as the drawn Friday; "+ Add to <tier>" on each cell's hover. **Time:** every Work block empty, its last one reading "Nothing slotted yet". The pool panel is full and open. No count, no word for missed, no centred empty message (A-08) [ASSUMPTION].

[ASSUMPTION] What was left open last week stays in the pool, unfaded (no session sits this week), at its place in Sort; the Week offers no "left open" card (Today's start card is Today's, D-USE-42).

## What the person can do

Everything in [priority-lens](priority-lens.md) and [time-lens](time-lens.md): drag, "+ Add to <tier>", "+ Event", Spread.

## Rulings

- D-USE-42: blocks come from the usual week; only the work is empty (the nothing-planned note).
- D-USE-56: the phone's analogue is This week's day with no work, its tiers' add rows and the Pool button ([`../../this-week/states/the-day.md`](../../this-week/states/the-day.md)).

## Widths

Not drawn. Desk as above; below 1024 Set my days › This week (D-USE-55).

## Criteria

| ID                      | When                     | Then                                                                                      | Evidence |
| ----------------------- | ------------------------ | ----------------------------------------------------------------------------------------- | -------- |
| C-USE-week-empty-week-1 | No work slotted all week | Blocks and events show; every Fits line reads "Nothing slotted yet"; no count or "missed" | manual   |
