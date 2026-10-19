---
target: specs/web/ux/interactions/place-from-the-pool/index.md
status: approved
promoted:
boards: []
dev_note: ""
rulings:
  [
    D-USE-40,
    D-USE-41,
    D-USE-42,
    D-USE-54,
    D-USE-55,
    D-USE-57,
    D-USE-58,
    D-USE-65,
    D-USE-93,
    D-USE-98,
  ]
---

# Place from the pool

Work waiting in the pool goes onto a day's tier. At the desk: drag a pool row into a Priority cell or onto a Work block in the Time lens, or "+ Add to <tier>" on a cell's hover and one search. On the phone: the pool sheet and Place, no drag ([`phone.md`](phone.md)). Placing the same item on a second day makes a session (D-USE-40, D-USE-42). The desk's frames are carried by the Week's states, the phone's by `states/`; this file holds the behaviour and carries none of them (`boards: []`).

## Where it starts

- **The Week, Priority lens:** a pool row dragged into a day's tier cell; "+ Add to <tier>" on any cell's hover (D-USE-41) ([`../../work/week/states/priority-lens.md`](../../work/week/states/priority-lens.md)).
- **The Week, Time lens:** a pool row dragged onto a Work block ([`../../work/week/states/time-lens.md`](../../work/week/states/time-lens.md)).
- **Beside the Block panel** (the pool stays open to its left for dragging in) and **Today's nothing-planned** (drag into a tier, or "+ Add to <tier>" on its add rows) ([`../../work/today/states/nothing-planned.md`](../../work/today/states/nothing-planned.md)); the Block panel's own add rows (`../../work/block-panel/`).
- **"+ Add › From the pool"** on Today ([`../add/index.md`](../add/index.md) step 2b): the same search, opened on the tier.
- **Phone:** the Pool button beside the + on Set my days › This week's day ([`../../work/this-week/states/the-day.md`](../../work/this-week/states/the-day.md)), then Place (D-USE-54); the steps are in [`phone.md`](phone.md).

## Steps (desk)

| # | The person | The app | Board (carried by) |
| --- | --- | --- | --- |
| 1 | Drags a pool row over a day's tier cell | The cell is the drop target [ASSUMPTION: shaded `--color-surface` while over it] | not drawn |
| 2 | Drops it | The chip lands in the cell with an ink edge (1.5 px) for a moment; a second day makes a session, its meta "ALD-17 · session 2 of 3", its due badge worked out for that day ("Due Thu", D-USE-98); under it, muted, "Added as session 2 of 3. Undo"; the day's fit line re-counts ("Work ends 15:10"); the pool row reads "on Mon, Tue, Wed", faded | `week / priority lens, add on hover / 1728 / light`, the Tue column ([`priority-lens.md`](../../work/week/states/priority-lens.md)) |
| 2t | Drops it on a Work block in the Time lens | It files under the day's first tier with room [PROPOSED] (open-8 round 2) [ASSUMPTION: "room" is below the tier's usual number, D-USE-65's caps; Urgent only by choice]; the same Undo line | not drawn |
| 3 | Hovers a cell, "+ Add to Primary" | A popover (340, the sheet radius, a soft shadow) under the cell: "Add to Friday · Primary" (muted, 600); the search field, focused (ring), "audit"; group "Pool": 📤 [Audit log export] "KES-58 · 5 Large", the first match shaded; group "Linear, not in the pool yet": 🧮 [Audit trail retention] "KES-71 · unsized"; a rule; "+ New item "audit"" | same frame, its "Add to Friday · Primary" popover |
| 4 | Picks a result (click, or arrows and Enter) | It lands in that cell as step 2. A Linear issue joins the pool and is placed [ASSUMPTION]; unsized takes 30 min [ASSUMPTION, as [`../add/index.md`](../add/index.md)] | not drawn |
| 4n | "+ New item "audit"" | New task opens in the right-panel sheet with the title, the day and the tier filled (D-USE-65) [ASSUMPTION: filled] | not drawn |
| 5 | Undo | The placing is taken back; the session count and the pool row are as they were [ASSUMPTION: Undo stays until the next placing or about 6 s] | not drawn |

## Rules

- **A second day is a session**, never a copy: one item, "n of N" on every session (D-USE-40, D-USE-42; [`../sessions.md`](../sessions.md)).
- [ASSUMPTION] One item sits once per day (refinement 6): a drop on a day that already holds it is refused, and its chip there is ringed.
- [ASSUMPTION] Dragging a placed chip to another cell moves it (N6 "drag between days"); dragging it back onto the pool returns it there.
- **One search, in order:** Pool first, then Linear issues not in the pool yet, then a new item with the query (D-USE-41). It searches title and ID [ASSUMPTION, as the phone's pool search].
- The client filter narrows the pool only, never the days (N6). Placing writes nothing to Linear (D-USE-57).
- Big items: "Spread…" instead of dragging day by day ([`../spread/index.md`](../spread/index.md)).
- Offline: placing works and syncs later [ASSUMPTION, D-USE-56]; Linear results wait for the connection.

## Words

"+ Add to <tier>" · "Add to <Day> · <Tier>" · "Pool" · "Linear, not in the pool yet" · "+ New item "<query>"" · "unsized" · "session n of N" · "Added as session 2 of 3. Undo" · "on Mon, Tue, Wed". [ASSUMPTION] A first placing: "Added to Tuesday · Primary. Undo".

## Access

- Drag always has a one-pointer, keyboard path: "+ Add to <tier>" on every cell, reachable by Tab (it shows on focus as on hover) [ASSUMPTION].
- The popover is a combobox: typing filters, arrow keys move through the results across groups (the group names are not stops), Enter places, Esc closes and returns focus to the add row.
- "Added as … Undo" is announced politely; Undo is a button.
- The drop's ink edge is not the only mark: the Undo line names what happened.

## Platforms

Desk from 1024 (D-USE-93). Below 1024 the phone has no drag (D-USE-55): tap to place, in [`phone.md`](phone.md), with its states [`states/pool-sheet.md`](states/pool-sheet.md), [`states/place-sheet.md`](states/place-sheet.md) (B, placing mode, as its `not_picked:`), [`states/placed-undo.md`](states/placed-undo.md) and [`states/doesnt-fit.md`](states/doesnt-fit.md), all at 402. The desk's place has no sheet; the phone's has no hover or search popover.

## Rulings

- D-USE-41: "+ Add to <tier>" on a cell's hover opens one search over the pool and Linear; the Time lens's drop [PROPOSED].
- D-USE-42: an item can sit in several cells as sessions; due badges per day.
- D-USE-54, D-USE-55, D-USE-57: tap to place on the phone (A), Placed with Undo, doesn't fit; Synapse-only work is never written to Linear. D-USE-58: A picked and locked; B, placing mode, not picked (it works one day at a time and cannot make sessions in one step).
- D-USE-98: due badges per column, warning from two days before, danger on the day.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-USE-place-from-the-pool-1 | A pool row dropped into a day's tier, the item already on another day | It lands as the next session ("session 2 of 3"), with Undo; the pool row names its days | `../../work/week/captures/priority-lens-1728.png` |
| C-USE-place-from-the-pool-2 | "+ Add to Primary" on Friday, "audit" typed | Pool matches, then Linear matches not in the pool, then "+ New item "audit"" | `../../work/week/captures/priority-lens-1728.png` |
| C-USE-place-from-the-pool-3 | A drop on a Work block in the Time lens | It files under the day's first tier with room | test |
| C-USE-place-from-the-pool-4 | Undo after a placing | The day and the pool row are as before | test |
| C-USE-place-from-the-pool-5 | Below 1024 | No drag: the pool sheet and Place, as [`phone.md`](phone.md) | `captures/place-sheet-402.png` |
