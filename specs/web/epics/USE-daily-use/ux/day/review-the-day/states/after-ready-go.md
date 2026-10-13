---
target: specs/web/ux/day/review-the-day/states/after-ready-go.md
status: approved
promoted:
boards: []
not_drawn: "N/A: not a screen. N3's 'already gone' row: after Ready, go this screen is not reachable"
rulings: [D-USE-5, D-USE-65]
---

# Review the day — after Ready, go

N3's "already gone": once Ready, go is tapped, Review the day's job passes to the Schedule tab ([`../../schedule/index.md`](../../schedule/index.md)).

## What happens

- A later open the same day goes to the Ready, go welcome until its Start is pressed, then to Now; never back here (D-USE-5, the entry tree; D-USE-71; `../../orient/states/skipped.md`, [`../../../interactions/ready-go/states/reopened-later.md`](../../../interactions/ready-go/states/reopened-later.md)).
- `/today/review` after go goes to `/today` [ASSUMPTION: a redirect, with no message].
- "Review the day" on Now shows only before go.
- At the desk, `/today` is Review the day at 1440 until Ready, go, then Today (D-USE-65; `../../../work/today/states/before-ready-go.md`).
- Everything Review the day could change stays changeable after go: in the Block view, the Item sheet and Schedule (N3: locking only ends the review).

## Rulings

- D-USE-5: the entry tree sends a later open to Review the day before go, to Now after.
- D-USE-65: the desk before Ready, go is Review the day at 1440.

## Widths

Every width.

## Criteria

| ID                                    | When                            | Then                                                                     | Evidence |
| ------------------------------------- | ------------------------------- | ------------------------------------------------------------------------ | -------- |
| C-USE-review-the-day-after-ready-go-1 | `/today/review` after Ready, go | The Ready, go welcome before its Start; Now (or Today at the desk) after | test     |
