---
target: specs/web/ux/work/this-week/states/error.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on row 6; follows 'phone-today / error, Today didn't load / 402 / light' (D-USE-57) and Set my days' error ('set-my-days / error / 402 / light')."
rulings: [D-USE-57]
---

# This week on the phone — error

`?state=error` [ASSUMPTION: key].

## What shows, top to bottom

[ASSUMPTION, following [`../../today/states/error.md`](../../today/states/error.md) and [`../../../set-my-days/set-my-days/states/error.md`](../../../set-my-days/set-my-days/states/error.md)]

- **The day failed:** Set my days' own error: header and chips stay; a `RegionRetry` under the title: "The day didn't load." (heading), "Nothing was lost. The other days still open from the chips." (muted), **Try again** (outline). Pool and the + faded and disabled. No red anywhere.
- **The pool failed** (the day loaded): inside the sheet, under the tabs, a `RegionRetry`: [PROPOSED words, to Gloss] "The pool didn't load." and "Nothing in it was lost." with **Try again**; the other tab still opens.
- **A Linear sync failed** (From Linear): the sync line reads [PROPOSED, to Gloss] "Not synced with Linear." with **Try again** in place of Sync now, in ink (as D-USE-56's "Not updated in Linear." with Try again); the issues already fetched stay.

## What the person can do

Try again (reloads that region only); switch days; switch tabs; close the sheet.

## Rulings

- D-USE-57: "<region> didn't load." with Try again, the phone's error.
- D-USE-56: Linear failures in ink with Try again.

## Widths

Not drawn. 1024 and up: the Week's error ([`../../week/states/error.md`](../../week/states/error.md)).

## Criteria

| ID                      | When                              | Then                                                                              | Evidence |
| ----------------------- | --------------------------------- | --------------------------------------------------------------------------------- | -------- |
| C-USE-this-week-error-1 | The day, the pool or a sync fails | A RegionRetry or the sync line names it, with Try again; only that region; no red | manual   |
