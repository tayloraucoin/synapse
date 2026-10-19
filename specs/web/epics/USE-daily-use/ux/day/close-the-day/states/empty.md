---
target: specs/web/ux/day/close-the-day/states/empty.md
status: approved
promoted:
boards: []
not_drawn: "Built in DYN-18 and unchanged by USE: six empty fields; the drawn frame shows the writing state only"
rulings: [D-USE-73]
---

# Close the day — empty

`?state=empty`. The page opened before anything is written.

## What shows

As [`journal.md`](journal.md), with every field empty: the six prompts over empty serif fields, no "Saved" line until the first save (built: the status shows after a save), the Tomorrow peek at the foot. No placeholder text, no starter phrase, no example in any field (DYN-18).

## What the person can do

Write, or leave. Leaving with nothing written is nothing: the Journal row stays unticked, nothing is pending, nothing says missed (DYN-18).

## Widths

Not drawn at any width; as [`journal.md`](journal.md).

## Criteria

| ID                          | When                        | Then                                                                | Evidence |
| --------------------------- | --------------------------- | ------------------------------------------------------------------- | -------- |
| C-USE-close-the-day-empty-1 | Opened with nothing written | Six empty fields, no starter text, no count, no button              | test     |
| C-USE-close-the-day-empty-2 | Left empty                  | The Journal row stays unticked; no pending or missed state anywhere | test     |
