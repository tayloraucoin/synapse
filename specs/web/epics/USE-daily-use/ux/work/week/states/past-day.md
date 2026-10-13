---
target: specs/web/ux/work/week/states/past-day.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn: the frames show Monday as today, with no day before it in the week; N6's state table names it."
rulings: [D-USE-41]
---

# Week — a past day

A day of the shown week that has already gone (for example Monday, seen on Wednesday). `?state=past-day` [ASSUMPTION: key].

## What shows

N6 "a past day": "Shown faded and still editable, nothing marked missed". [ASSUMPTION] The column's chips and head at reduced emphasis (Today's receded title and meta, never below 4.5:1, A-11); done chips show their done mark; undone ones show as they were, with no "missed", no count and no red (product rules). Due badges on a past column show only where the due date is that day or later [ASSUMPTION]. The Fits line keeps its time. In the Time lens the column's blocks fade the same way; the now line sits on today's column only.

## What the person can do

Everything still works: drag a chip on to a later day, open its sheet, add [ASSUMPTION, N6 "still editable"].

## Rulings

- D-USE-41: one view, same rules in both lenses. N6's state table, not overruled by a later line.

## Widths

Not drawn. Below 1024 the phone's This week has its own past days ([`../../this-week/states/past-day.md`](../../this-week/states/past-day.md)).

## Criteria

| ID                    | When                         | Then                                               | Evidence |
| --------------------- | ---------------------------- | -------------------------------------------------- | -------- |
| C-USE-week-past-day-1 | A day of the week has passed | Faded, still editable; nothing says missed; no red | manual   |
