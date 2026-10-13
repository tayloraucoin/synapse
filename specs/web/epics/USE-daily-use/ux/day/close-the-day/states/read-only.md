---
target: specs/web/ux/day/close-the-day/states/read-only.md
status: approved
promoted:
boards: []
not_drawn: "Built in DYN-18 and unchanged by USE: a past day opened from Review the day's record reads as serif text"
rulings: [D-USE-73]
---

# Close the day — read-only

`?state=read-only`. A past day's entry opened from Review (built: `?from=review` on a past date).

## What shows

The header as [`journal.md`](journal.md) [ASSUMPTION: the breadcrumb names where it came from]. Each written answer as serif text under its prompt with hairlines; empty prompts are left out; with nothing written at all, "Nothing written." (built, `[COPY]`). No fields, no save status. [ASSUMPTION] No Tomorrow peek on a past day.

## What the person can do

Read, and go back. Today and a past day opened from elsewhere stay writable: last night's lines may be finished in the morning (DYN-18).

## Widths

Not drawn at any width; as [`journal.md`](journal.md).

## Criteria

| ID                              | When                           | Then                                                           | Evidence |
| ------------------------------- | ------------------------------ | -------------------------------------------------------------- | -------- |
| C-USE-close-the-day-read-only-1 | A past day from Review         | Answers as serif text under their prompts; no field, no status | test     |
| C-USE-close-the-day-read-only-2 | Nothing was written that night | "Nothing written." alone                                       | test     |
