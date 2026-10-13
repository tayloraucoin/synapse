---
target: specs/web/ux/work/week/states/error.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn at the desk; follows the phone's 'phone-today / error, Today didn't load / 402 / light' (D-USE-57)."
rulings: [D-USE-57, D-USE-97]
---

# Week — error

`?state=error` [ASSUMPTION: key].

## What shows

[ASSUMPTION, following Today's error, D-USE-57] Region by region: the rail and header stay. When the week fails, `RegionRetry` sits in the lens area under the header, anchored at the top, not centred: [PROPOSED words, to Gloss] "The week didn't load." (bold), "Nothing placed is lost." and **Try again** (outline). When the pool fails, the same in the pool panel: "The pool didn't load." with Try again; the week stays usable. When only Linear fails to sync, the sync line reads "Linear didn't sync." with **Try again** in place of Sync now [ASSUMPTION]; a failed write on one item reads "Not updated in Linear." with Try again, in ink, on its row (D-USE-56, D-USE-97).

## What the person can do

Try again (reloads that region).

## Rulings

- D-USE-57: "Today didn't load." with Try again (the phone's form).
- D-USE-97: a failed Linear write reads "Not updated in Linear." with Try again.

## Widths

Not drawn.

## Criteria

| ID                 | When                       | Then                                                               | Evidence |
| ------------------ | -------------------------- | ------------------------------------------------------------------ | -------- |
| C-USE-week-error-1 | The week or the pool fails | That region shows RegionRetry with Try again; the other stays live | manual   |
