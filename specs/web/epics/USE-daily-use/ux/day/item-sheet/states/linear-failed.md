---
target: specs/web/ux/day/item-sheet/states/linear-failed.md
status: approved
promoted:
boards:
  - name: "item-sheet / Linear failed / 402 / light"
    page: "USE — set up"
    at: [1928, 7560]
    note: "Note · item-sheet / Linear failed"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/linear-failed-402.png
rulings: [D-USE-37, D-USE-56, D-USE-103]
---

# Item sheet — Linear failed

The write to Linear failed: the status was set to In review in Synapse and Linear did not take it. `?state=linear-failed`.

## What shows, top to bottom

- As `linear-syncing.md`, the line under the Linear line now reads, in ink with an info icon (circle with i): "Not updated in Linear. In review is kept here." then "Try again", underlined, semibold.
- No red anywhere; the chip keeps In review.

## What the person can do

- **Try again** resends the write (back to `linear-syncing.md`).
- Every other field stays live. The change in Synapse stands.

## Words

"Not updated in Linear. <Status> is kept here." and "Try again". Offline, the same line reads "Updates Linear when back online" (step 8).

## The notes on the boards

**item-sheet / Linear failed / 402 / light** (Note · item-sheet / Linear failed):

> item-sheet / Linear failed
>
> "Not updated in Linear. In review is kept here." with Try again underlined, all in ink with an info icon. No red: a failed sync isn't a miss. The change in Synapse stands (item-sheet.md). Offline, the same line reads "Updates Linear when back online" (step 8).

## Rulings

- D-USE-37: approved as drawn. Open "Audit gaps": `linear-failed` in ink, no red.
- D-USE-56: on the phone's Today, "Not updated in Linear." with Try again, in ink, on the row; the same words here.
- N2: "Not updated in Linear." with "Try again"; the check in Synapse stands.

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                               | When                 | Then                                                                                                                       | Evidence                         |
| -------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-item-sheet-linear-failed-1 | A Linear write fails | The line reads "Not updated in Linear. <Status> is kept here." with Try again, in ink, no red; the value in Synapse stands | `captures/linear-failed-402.png` |
| C-USE-item-sheet-linear-failed-2 | Offline              | The line reads "Updates Linear when back online" and sends on reconnect                                                    | manual                           |
