---
target: specs/web/ux/interactions/place-from-the-pool/states/place-sheet.md
status: approved
promoted:
boards:
  - name: "this-week / A: place sheet, days and tier / 402 / light"
    page: "USE — work"
    at: [2410, 7200]
    note: "Notes · phone, editing and This week (row 6) @ x 2410"
    capture: specs/web/epics/USE-daily-use/ux/interactions/place-from-the-pool/captures/place-sheet-402.png
not_picked:
  - name: "this-week / B: placing mode, tap a tier / 402 / light"
    ruled: D-USE-54
rulings: [D-USE-40, D-USE-42, D-USE-54, D-USE-55, D-USE-58]
---

# Place from the pool — the place sheet (phone)

Phone step 2 of [`../index.md`](../index.md): Place on a pool row ([`pool-sheet.md`](pool-sheet.md)). The sheet picks one or more days and a tier, shows each day's fit, and names the days on its action before anything moves. `?state=place-sheet`.

## What shows, top to bottom

**Phone (402, 21:10):**

- Behind, under the scrim: This week's day, "‹ Week", "Monday, 12 October".
- The sheet from y 330 (544 tall), a grabber; × on the left (a 44 target, no title line beside it).
- Muted: "Pool · Kestrel Health · KES-58 · 3 Medium · due Wed".
- "Place [Booking: reschedule flow]" (title, 600).
- Muted helper: "One day places it. Two or more days make it sessions of one task, each “Done for today” on its own day."
- **Days** (600): seven chips, 48 × 52, the letter (caption) over the date (600): M 12 (outlined), **T 13** and **W 14** (filled ink, picked), T 15 and F 16 (outlined), S 17 and S 18 (dashed, disabled text: not offered).
- **Tier** (600): a four-way segmented control, 40 tall, each a 7 px square with its word: Urgent (red square), **Primary** (leaf, selected, 600), Secondary (amber), Stretch (slate).
- The fit line, muted: "Tue's Primary runs to 11:40 at the top of its ranges. Wed's runs to 12:10, past Work's end at 12:00."
- **Place on Tue and Wed** (primary, ink, full width, 48 tall).

## What the person can do

- **Days:** toggle any offered day; the fit line and the action re-count with each. Two or more days make sessions of one item (D-USE-40, D-USE-42; [`../../sessions.md`](../../sessions.md)).
- **Tier:** one tier for every day picked.
- **Place on <days>:** the sheet closes and the item lands ([`placed-undo.md`](placed-undo.md)). A day that cannot hold it shows the doesn't-fit card first ([`doesnt-fit.md`](doesnt-fit.md)).
- ×, a swipe down: back to the pool sheet, nothing placed.
- [ASSUMPTION] The sheet opens with the day being viewed picked and Primary, or the first tier with room; the sample's Tue and Wed are picks made.
- [ASSUMPTION] Today stays offered as drawn: Place puts an item on a tier, not at a time; Spread, which fills a block's free time, leaves out a day whose block has begun ([`../../spread/states/days-and-tier.md`](../../spread/states/days-and-tier.md)). Sat and Sun are not offered: no Work blocks.

## Words

"Pool · <client> · <ID> · <size> · due <Day>" · "Place <title>" · "One day places it. Two or more days make it sessions of one task, each “Done for today” on its own day." · "Days" · "Tier" · "Urgent" · "Primary" · "Secondary" · "Stretch" · "<Day>'s <Tier> runs to <time> at the top of its ranges." · "past Work's end at <time>" · "Place on <Day> and <Day>". Past Work's end is said in words, in muted text, never red. Gloss passed "Place" and the sessions line (open-9's "two days make it two sessions"; drawn as above).

## The notes on the boards

**Notes · phone, editing and This week (row 6) @ x 2410** — A, place sheet, days and tier

> Days (one or more), Tier, the fit per day, an action that names the days. Past Work's end is said in words, never in red.

Not picked, its card on the same strip (row 6 @ x 2892) — B, placing mode:

> Variation: Place collapses the sheet into a bar, and each tier on the day becomes a "Place in Primary · ends 11:40" target; the chips switch days. Quick for one item, but one day at a time and no sessions in one step. Not picked.

## Rulings

- D-USE-54: Place opens a sheet with Days (one or more), Tier, the fit per day and the action that names the days. D-USE-58: A picked; B stays as not picked.
- D-USE-40, D-USE-42: a second day is a session of one item.
- **B, placing mode, not picked** (`this-week / B: placing mode, tap a tier / 402 / light`, row 6, x 2892; D-USE-54, D-USE-58): it drew Tuesday's Work block with dashed targets "Place in Primary · ends 11:40", "Place in Secondary · ends 12:10" and "Place in Stretch", the day chips to switch days, and an ink bar "Placing · tap a tier, on any day" over [Booking: reschedule flow] with Cancel. Not picked because it works one day at a time and cannot make sessions in one step.

## Widths

Drawn at 402. From 1024 there is no place sheet: a pool row is dragged into a tier cell, or "+ Add to <tier>" opens the search (D-USE-55, D-USE-41; [`../index.md`](../index.md) Steps (desk)).

## Access

A sheet that traps focus; focus starts on the title [ASSUMPTION]; × named "Close". Each day chip is a toggle button named by the full day, "Tuesday 13, picked"; Sat and Sun are disabled with "No Work block" as their description [ASSUMPTION]. Tier is a radio group; each square sits with its word. The fit line is announced politely when it changes [PROPOSED]. Chips and segments at least 44 tall. One hand: every control sits in the lower half of the screen.

## Criteria

| ID                                      | When                              | Then                                                                                         | Evidence                          |
| --------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------- |
| C-USE-place-from-the-pool-place-sheet-1 | Tue and Wed picked, Primary       | The fit line names where each day's Primary runs to; the action reads "Place on Tue and Wed" | `../captures/place-sheet-402.png` |
| C-USE-place-from-the-pool-place-sheet-2 | A day's tier runs past Work's end | Said in words with the time, never in red                                                    | `../captures/place-sheet-402.png` |
| C-USE-place-from-the-pool-place-sheet-3 | Two days placed                   | One item, two sessions, "n of 2" on each                                                     | test                              |
