---
target: specs/web/ux/interactions/place-from-the-pool/states/pool-sheet.md
status: approved
promoted:
boards:
  - name: "this-week / A: pool sheet, tap to place, rec. / 402 / light"
    page: "USE — work"
    at: [1928, 7200]
    note: "Notes · phone, editing and This week (row 6) @ x 1928"
    capture: specs/web/epics/USE-daily-use/ux/interactions/place-from-the-pool/captures/pool-sheet-402.png
rulings: [D-USE-54, D-USE-55, D-USE-56, D-USE-58, D-USE-95]
---

# Place from the pool — the pool sheet (phone)

Phone step 1 of [`../index.md`](../index.md) (A, picked, D-USE-54, D-USE-58): Pool, beside the + on Set my days › This week's day ([`../../../work/this-week/states/the-day.md`](../../../work/this-week/states/the-day.md)), opens the pool as a sheet over the day. This file carries the sheet's default frame, on the Pool tab with no filter; its other states are This week's own and are cited, never repeated (below). `?state=pool-sheet`.

## What shows, top to bottom

**Phone (402, 21:10):**

- Behind, under `--color-scrim` across the frame: This week's day, "‹ Week" and "Monday, 12 October".
- The sheet from y 150 (724 tall, the sheet radius on top, `--color-background`), a grabber.
- "Pool" (title, 600) with × on the right (a 44 target).
- Tabs as a two-way segmented control, 40 tall on `--color-surface`: **Pool** (selected, 600, on the background with a border) and "From Linear" (muted).
- A filter row: three 32 px pill buttons with a chevron each, "All clients" (500), "Size", "Due date"; on the right a search icon (16 px glass in a 32 slot).
- The list, grouped by client in Taylor's order, each group a 16 px letter tile and its name (600):
  - **Kestrel Health** (rose tile, "K"): 📅 [Booking: reschedule flow], under it muted "KES-58 · 3 Medium · due Wed", and **Place** on the right (an outline button, 32 tall, 600); 🧪 [Portal: e2e tests for sign-in], "KES-61 · 5 Large", Place.
  - **Alder Studio** (moss tile, "A"): 🎨 [Brand site: case study template], "ALD-22 · 8 Huge · Spread across the week", Place.
  - **Personal** (ink tile, "T"): 🧾 [Invoice template refresh], "1 Quick · No Linear", Place.
  - Each row is 60 tall on a hairline: the emoji in an 18 px slot, the title, the meta line, Place.
- Under the list, muted: "Place puts it on a day and a tier. Tap the row itself for its sheet. The client filter narrows this list only, never the days."

## What the person can do

- **Place** on a row: the place sheet for that item ([`place-sheet.md`](place-sheet.md)).
- **The row itself:** its Item sheet ([`../../../day/item-sheet/index.md`](../../../day/item-sheet/index.md)), whose ··· holds "Spread across the week" and "Back to the pool" ([`../../../day/item-sheet/states/work-more-open.md`](../../../day/item-sheet/states/work-more-open.md)).
- **From Linear:** [`../../../work/this-week/states/linear-connected.md`](../../../work/this-week/states/linear-connected.md), or [`linear-not-connected.md`](../../../work/this-week/states/linear-not-connected.md) when Linear is not connected (D-USE-56).
- **All clients:** the client filter sheet ([`../../../work/this-week/states/client-filter.md`](../../../work/this-week/states/client-filter.md)); not shown when clients are off.
- **Size, Due date:** filters [ASSUMPTION: each opens a short list as a sheet, as the client filter; not drawn].
- **Search:** [`../../../work/this-week/states/pool-search.md`](../../../work/this-week/states/pool-search.md) (the sheet grows to full height).
- **An empty pool:** [`../../../work/this-week/states/pool-empty.md`](../../../work/this-week/states/pool-empty.md).
- × or a swipe down: back to the day.
- [ASSUMPTION] An 8 Huge item's meta names "Spread across the week" as a hint, not a control; Place on it opens the place sheet, whose doesn't-fit card offers Spread ([`doesnt-fit.md`](doesnt-fit.md)).

## Words

"Pool" · "From Linear" · "All clients" · "Size" · "Due date" · "Place" · "<ID> · <size> · due <Day>" · "No Linear" · "Spread across the week" · "Place puts it on a day and a tier. Tap the row itself for its sheet. The client filter narrows this list only, never the days." Gloss passed "Place" (open-9's words to Gloss).

## The notes on the boards

**Notes · phone, editing and This week (row 6) @ x 1928** — A, pool sheet, tap to place · recommended

> Pick for drag on the phone: tap to place. The pool is a sheet over This week: Pool and From Linear tabs, client, size and due-date filters, search, grouped by client in Taylor's order. Place opens the place sheet. Why: one hand, the consequence shows before anything moves, several days (sessions) in one step, and it reuses the item sheet's Move-to pattern.

## Rulings

- D-USE-54: the pool is a sheet over Set my days › This week, Pool and From Linear as tabs, client, size and due-date filters and search, grouped by client; drag becomes tap to place (A). D-USE-58: A picked, locked.
- D-USE-55: the phone has no two-pane Week; the pool sheet is the pipeline for now.
- D-USE-95: client tiles carry their letter, so colour is never alone.

## Widths

Drawn at 402. From 1024 the pool is the Week's docked pool panel, with drag and "+ Add to <tier>" in place of Place (D-USE-55, D-USE-93; [`../../../work/week/pool-panel.md`](../../../work/week/pool-panel.md)).

## Access

A sheet that traps focus; × named "Close"; the tabs are a tablist; each filter pill is a button naming its current value; the glass is "Search the pool". Each row is two stops: the row (opens its sheet) and Place, named "Place <title>" [PROPOSED]. The 32 px pills and Place keep a 44 × 44 hit area [ASSUMPTION]. Client groups are headings.

## Criteria

| ID                                     | When                          | Then                                                                                                   | Evidence                         |
| -------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------- |
| C-USE-place-from-the-pool-pool-sheet-1 | Pool on This week's day       | The sheet opens over the day on the Pool tab, grouped by client in Settings order, each row with Place | `../captures/pool-sheet-402.png` |
| C-USE-place-from-the-pool-pool-sheet-2 | Tap a row, not Place          | Its Item sheet opens; nothing is placed                                                                | test                             |
| C-USE-place-from-the-pool-pool-sheet-3 | A client picked in the filter | The list narrows; the day behind is unchanged                                                          | test                             |
