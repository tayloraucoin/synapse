---
target: specs/web/ux/interactions/place-from-the-pool/phone.md
status: approved
promoted:
boards: []
dev_note: ""
rulings:
  [
    D-USE-40,
    D-USE-42,
    D-USE-54,
    D-USE-55,
    D-USE-56,
    D-USE-57,
    D-USE-58,
    D-USE-93,
  ]
---

# Place from the pool — on the phone

Below 1024 there is no drag (D-USE-55, D-USE-93): the pool is a sheet over Set my days › This week's day and an item is placed by tapping, A (picked, D-USE-54, D-USE-58). The behaviour shared with the desk (sessions, one search's order, Linear untouched) is in [`index.md`](index.md); each drawn step is a file in `states/`. This file carries no artboard (`boards: []`).

## Where it starts

- **Pool**, the ink pill beside the + at the foot of This week's day ([`../../work/this-week/states/the-day.md`](../../work/this-week/states/the-day.md)).
- **+ Add › From the pool** ([`../add/index.md`](../add/index.md) step 2b): the same pool sheet.

## Steps (phone)

| #   | The person                                                          | The app                                                                                                                                                    | Board (carried by)                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Pool                                                                | The pool sheet over the day: Pool and From Linear tabs, client, size and due-date filters, search, grouped by client in Taylor's order, Place on every row | `this-week / A: pool sheet, tap to place, rec. / 402 / light` ([`states/pool-sheet.md`](states/pool-sheet.md))                                                                                                                                                                                                                                                                                    |
| 1a  | From Linear, a filter, search; or an empty pool                     | This week's own states, over the same sheet                                                                                                                | carried by `work/this-week/states/`: [`linear-connected.md`](../../work/this-week/states/linear-connected.md), [`linear-not-connected.md`](../../work/this-week/states/linear-not-connected.md), [`client-filter.md`](../../work/this-week/states/client-filter.md), [`pool-search.md`](../../work/this-week/states/pool-search.md), [`pool-empty.md`](../../work/this-week/states/pool-empty.md) |
| 1n  | New task (the empty pool, or search's no match)                     | New task with no days saves to the pool, never to Linear                                                                                                   | [`../add/index.md`](../add/index.md) (`states/save-to-the-pool.md`)                                                                                                                                                                                                                                                                                                                               |
| 2   | Place on a row                                                      | The place sheet: Days (one or more), Tier, the fit per day, "Place on Tue and Wed"                                                                         | `this-week / A: place sheet, days and tier / 402 / light` ([`states/place-sheet.md`](states/place-sheet.md)); `this-week / B: placing mode, tap a tier / 402 / light` not picked, named there                                                                                                                                                                                                     |
| 2f  | Place, on a day that cannot hold it                                 | "Tue's Work doesn't fit it by 1 h 40", with "Spread it across the week", "Thu 15 has room, 2 h 30" and Use Thu, and "Place on Tue anyway"                  | `this-week / place, doesn't fit / 402 / light` ([`states/doesnt-fit.md`](states/doesnt-fit.md))                                                                                                                                                                                                                                                                                                   |
| 2s  | Spread it across the week                                           | Spread's full sheet for the item                                                                                                                           | [`../spread/states/across-the-week/402.md`](../spread/states/across-the-week/402.md)                                                                                                                                                                                                                                                                                                              |
| 3   | Place on <days>                                                     | The sheet closes on the day shown; the new row is marked once; a toast "Placed on Tue and Wed, in Primary." with Undo                                      | `this-week / placed, Undo / 402 / light` ([`states/placed-undo.md`](states/placed-undo.md))                                                                                                                                                                                                                                                                                                       |
| 4   | Undo                                                                | Every day of that Place is taken back; the item is in the pool as before [ASSUMPTION]                                                                      | not drawn                                                                                                                                                                                                                                                                                                                                                                                         |
| 5   | Long-press a placed row › Back to the pool, or the Item sheet's ··· | It returns to the pool (D-USE-57)                                                                                                                          | [`../../work/today/states/work-menu.md`](../../work/today/states/work-menu.md); [`../../day/item-sheet/states/work-more-open.md`](../../day/item-sheet/states/work-more-open.md)                                                                                                                                                                                                                  |

## Rules (phone)

- Two or more days in one Place make sessions of one item (D-USE-40, D-USE-42); the action names the days.
- The fit is said in words, at the top of the ranges; past Work's end is a time in muted text or ink, never red.
- The client filter narrows the pool only, never the days.
- Offline: placing works and syncs later (D-USE-56); From Linear waits for the connection [ASSUMPTION].
- [ASSUMPTION] A placed item's pool row stays, faded, naming where it sits, as the desk's "on Mon, Tue, Wed" and From Linear's placed issues.

## Words (phone)

"Pool" · "Place" · "Place <title>" · "One day places it. Two or more days make it sessions of one task, each “Done for today” on its own day." · "Place on <Day> and <Day>" · "Placed on <Day> and <Day>, in <Tier>." · "Undo" · "<Day>'s Work doesn't fit it by <length>" · "Use <Day>" · "Place on <Day> anyway". Each state lists its own. Gloss passed "Place" and the sessions line (open-9's words to Gloss); "Place in Primary · ends 11:40" is B's, not picked.

## Access (phone)

- **One hand:** Pool, Place, the place sheet's days, tier and action sit in the lower half; nothing needs a drag or two fingers.
- **The place sheet is a sheet:** it opens over the pool sheet, traps focus, × is "Close", a swipe down closes it with nothing placed, and focus returns to that row's Place.
- **Undo is announced:** the toast is read politely, naming the days and tier; Undo is a button reachable while it shows, and the toast does not leave while focused [ASSUMPTION].
- Every target at least 44 × 44; day chips are toggle buttons named by the full day.

## Rulings

- D-USE-54: the pool sheet, tap to place, the place sheet's fields and action. D-USE-58: A picked and locked; B not picked (one day at a time, no sessions in one step).
- D-USE-55: no two-pane Week and no drag on the phone; the pool sheet is the pipeline for now.
- D-USE-57: Placed with Undo; doesn't fit offers Spread or the next day with room and still allows it.

## Criteria

| ID                                | When                                       | Then                                                                           | Evidence                       |
| --------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------ |
| C-USE-place-from-the-pool-phone-1 | Pool, then Place on a row, two days, Place | Both days hold the item as sessions; a toast names the days and tier with Undo | `captures/placed-undo-402.png` |
| C-USE-place-from-the-pool-phone-2 | Any step below 1024                        | Nothing needs a drag                                                           | manual                         |
| C-USE-place-from-the-pool-phone-3 | Offline, Place                             | It lands and syncs when back online                                            | test                           |
