---
target: specs/web/ux/interactions/place-from-the-pool/states/doesnt-fit.md
status: approved
promoted:
boards:
  - name: "this-week / place, doesn't fit / 402 / light"
    page: "USE — work"
    at: [7230, 7200]
    note: "Notes · phone, editing and This week (row 6, cont.) @ x 7230"
    capture: specs/web/epics/USE-daily-use/ux/interactions/place-from-the-pool/captures/doesnt-fit-402.png
rulings: [D-USE-54, D-USE-57, D-USE-58, D-USE-105, D-USE-108]
---

# Place from the pool — doesn't fit (phone)

Phone step 2f of [`../index.md`](../index.md): the place sheet ([`place-sheet.md`](place-sheet.md)) for an item the picked day cannot hold. The sheet says by how much, offers Spread or the next day with room, and still lets it be placed. `?state=doesnt-fit`.

## What shows, top to bottom

**Phone (402, 21:10):**

- Behind, under the scrim: "‹ Week" and "Pool" (title) [ASSUMPTION: the day's title in the build, as [`place-sheet.md`](place-sheet.md); the frame was drawn over the pool].
- The sheet from y 300 (574 tall), a grabber; no × drawn [ASSUMPTION: × on the left, as the place sheet].
- Muted: "Pool · Kestrel Health · KES-61 · 5 Large".
- "Place [Portal: e2e tests for sign-in]" (title, 600).
- The day chips, 48 × 44, weekdays only: M 12, **T 13** (ink, picked), W 14, T 15, F 16.
- "Tier: Primary" (600).
- A card (1 px border, the sheet radius, 12 px padding):
  - "Tue's Work doesn't fit it by 1 h 40" (600).
  - Muted: "5 Large runs 2 to 4 h; Tue's Primary already holds 1 h 50 at the top of its ranges."
  - Two 44 px rows on hairlines: "Spread it across the week" with a chevron; "Thu 15 has room, 2 h 30" with **Use Thu** (600) on the right.
- **Place on Tue anyway** (outline, full width, 48 tall).

## What the person can do

- **Spread it across the week:** Spread's full sheet for this item ([`../../spread/states/across-the-week/402.md`](../../spread/states/across-the-week/402.md)).
- **Use Thu:** [ASSUMPTION] places it on Thu 15 in Primary at once, and the toast names Thu ([`placed-undo.md`](placed-undo.md)).
- **Place on Tue anyway:** places it on Tue; the day's fit line then says by how much it runs past Work's end, in ink (D-USE-57).
- A day chip: re-checks the fit for that day [ASSUMPTION]. "Tier: Primary": reopens the tier control [ASSUMPTION: the compact days and tier are the place sheet's, folded while the card shows].

## Words

"Tier: <Tier>" · "<Day>'s Work doesn't fit it by <length>" · "<size> runs <range>; <Day>'s <Tier> already holds <length> at the top of its ranges." · "Spread it across the week" · "<Day> <date> has room, <length>" · "Use <Day>" · "Place on <Day> anyway". Lengths only, never red, never a count of what is over.

## The notes on the boards

**Notes · phone, editing and This week (row 6, cont.) @ x 7230** — Place, doesn't fit

> When a day can't hold it, the sheet says by how much, offers Spread or the next day with room, and still lets it be placed. Lengths only, never red.

## Rulings

- D-USE-57: a place that doesn't fit offers Spread or the next day with room and still allows it.
- D-USE-54, D-USE-58: Place's sheet (A), locked.
- [ASSUMPTION] "By how much" is counted at the top of the ranges, as every fit line; the sample's 1 h 40 is [placeholder] (Tue's Work 9:30 to 12:00 against 1 h 50 held plus 2 to 4 h does not give it).
- [ASSUMPTION] "The next day with room" is the first later day, this week, whose chosen tier holds the item at the top of its range.
- Decided (D-USE-108 (2)): when the card shows, given the place sheet's own fit line already says "past Work's end" per day. Ruled: the card replaces the fit line when one day is picked and it cannot hold the item; with two or more days picked, the fit line says it per day, as [`place-sheet.md`](place-sheet.md) draws.

## Widths

Drawn at 402. From 1024 a drop that does not fit lands and the day's fit line says by how much, as the Week draws it ([`../../../work/week/states/priority-lens.md`](../../../work/week/states/priority-lens.md)); "Spread…" sits on the pool row (D-USE-55) [ASSUMPTION: no doesn't-fit card at the desk].

## Access

The card's first line is announced when it appears [PROPOSED]; "Spread it across the week" and "Use Thu" are buttons, the latter named "Use Thursday 15, 2 h 30 free". "Place on Tue anyway" stays enabled. Rows at least 44 tall.

## Criteria

| ID                                     | When                                          | Then                                                                           | Evidence                         |
| -------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------- |
| C-USE-place-from-the-pool-doesnt-fit-1 | Place on a day whose Work can't hold the item | The card says by how much in lengths, offers Spread and the next day with room | `../captures/doesnt-fit-402.png` |
| C-USE-place-from-the-pool-doesnt-fit-2 | Place on <Day> anyway                         | It is placed; the day's fit line says by how much, in ink                      | test                             |
| C-USE-place-from-the-pool-doesnt-fit-3 | Spread it across the week                     | Spread's sheet opens for this item                                             | test                             |
