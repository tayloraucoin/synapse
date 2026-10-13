---
target: specs/web/ux/interactions/place-from-the-pool/states/placed-undo.md
status: approved
promoted:
boards:
  - name: "this-week / placed, Undo / 402 / light"
    page: "USE — work"
    at: [5784, 7200]
    note: "Notes · phone, editing and This week (row 6, cont.) @ x 5784"
    capture: specs/web/epics/USE-daily-use/ux/interactions/place-from-the-pool/captures/placed-undo-402.png
rulings: [D-USE-40, D-USE-42, D-USE-54, D-USE-57, D-USE-98]
---

# Place from the pool — placed, with Undo (phone)

Phone step 3 of [`../index.md`](../index.md): "Place on Tue and Wed" in [`place-sheet.md`](place-sheet.md). The sheet has closed onto Tuesday's day in Set my days › This week, the day's layout as [`../../../work/this-week/states/the-day.md`](../../../work/this-week/states/the-day.md) draws it. `?state=placed-undo`.

## What shows, top to bottom

**Phone (402, 21:14):**

- "‹ Week" over "Tuesday, 13 October" (title, 600); on the right, muted, "✓ Saved".
- The day chips, 48 × 44: M 12, **T 13** (ink, current), W 14, T 15, F 16, S 17 and S 18 (disabled text).
- Breakfast, 9:00 to 9:30 (a dashed 40 px band).
- **Work 9:30 to 12:00** (sky band, a 3 px sky edge):
  - Primary (leaf square): ✍️ [Case studies: Alder intro] with the link mark and "2 of 3" (muted); then the new row, **📅 [Booking: reschedule flow]** with "due Wed" (muted), marked once by a `--color-background` band behind it.
  - Secondary (amber square): 🎨 [Brand site: case study template].
  - Stretch (slate square): "+ Add to Stretch" (muted).
  - Over a sky rule, the fit line in ink (500): "Doesn't fit by 40 min at the top of the ranges".
- Lunch, 12:00 to 13:00 (dashed band); 15:30 [Dentist] (plum band).
- A toast (ink, the sheet radius, above the foot): "Placed on Tue and Wed, in Primary." with **Undo** (600) on the right.
- At the foot: **Pool** (an ink pill, 52 tall, the layers icon) on the left, the round **+** on the right.

## What the person can do

- **Undo:** both placings are taken back; the item is in the pool as before, with no sessions [ASSUMPTION: Undo takes back the whole Place, every day it named].
- Ignore it: the toast leaves on its own; the placing stands [ASSUMPTION: as the desk's Undo line, until the next placing or about 6 s, and never while focused].
- The day stays live under the toast: tap a row for its sheet, Pool to place more, + to add, a day chip to see Wed 14 with its session.

## Words

"Placed on <Day> and <Day>, in <Tier>." · "Undo" · "✓ Saved" · "due Wed" · "2 of 3" · "Doesn't fit by 40 min at the top of the ranges" · "+ Add to Stretch" · "Pool". [ASSUMPTION] One day: "Placed on Tue, in Primary."

## The notes on the boards

**Notes · phone, editing and This week (row 6, cont.) @ x 5784** — Placed, Undo

> After Place the sheet closes, the new row is marked once on the day shown, and a toast names where it went with Undo.

## Rulings

- D-USE-57: Placed with Undo.
- D-USE-40, D-USE-42: Tue and Wed are two sessions of one item [ASSUMPTION: the new row's "1 of 2" is not drawn on it; the session mark and "n of N" follow D-USE-42 on every session].
- D-USE-98: the due word on the row, worked out per day.
- [ASSUMPTION] The fit line counts the whole Work block: Primary now runs to 11:40 (as the place sheet said), and Secondary takes the block 40 min past 12:00.
- [ASSUMPTION] The mark fades after a moment, as the desk drop's ink edge.

## Widths

Drawn at 402. From 1024 a drop or "+ Add to <tier>" lands with the muted Undo line under the chip ("Added as session 2 of 3. Undo") in place of the toast (D-USE-55; [`../index.md`](../index.md) Steps (desk), step 2).

## Access

The toast is announced politely ("Placed on Tue and Wed, in Primary."); Undo is a button named "Undo placing" [PROPOSED], at least 44 × 44, reachable while the toast shows. The new row's mark is not the only signal: the toast names what happened.

## Criteria

| ID                                      | When                                           | Then                                                                                                               | Evidence                          |
| --------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| C-USE-place-from-the-pool-placed-undo-1 | Place on Tue and Wed                           | The sheet closes on the day shown, the new row marked once, a toast "Placed on Tue and Wed, in Primary." with Undo | `../captures/placed-undo-402.png` |
| C-USE-place-from-the-pool-placed-undo-2 | Undo                                           | Both sessions are gone; the item is back in the pool as it was                                                     | test                              |
| C-USE-place-from-the-pool-placed-undo-3 | The day runs past Work's end after the placing | The fit line says by how much, in ink, never red                                                                   | `../captures/placed-undo-402.png` |
