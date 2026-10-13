---
target: specs/web/ux/work/this-week/pool-sheet-anatomy.md
status: approved
promoted:
---

# This week on the phone — the pool sheet's anatomy

The phone's pool: work saved and not yet on a day (D-USE-31), the pipeline for now (D-USE-104), as a sheet over This week with Pool and From Linear as tabs (D-USE-54). Its default frame, the Pool tab with Place on each row, is `this-week / A: pool sheet, tap to place, rec. / 402 / light`, carried by [`../../interactions/place-from-the-pool/states/pool-sheet.md`](../../interactions/place-from-the-pool/states/pool-sheet.md) (its rows, Place and its foot line live there). This file gathers what the frames of this surface draw of the same sheet: [`states/linear-connected.md`](states/linear-connected.md), [`states/linear-not-connected.md`](states/linear-not-connected.md), [`states/pool-empty.md`](states/pool-empty.md), [`states/pool-search.md`](states/pool-search.md), and its client filter, [`states/client-filter.md`](states/client-filter.md). The desk's pool panel says the same things in [`../week/pool-panel.md`](../week/pool-panel.md) and [`../week/pool-rows.md`](../week/pool-rows.md); where both say a thing, the words match (see [`words-and-access.md`](words-and-access.md)).

## The sheet

- A `ResponsiveSheet` (bottom sheet at 402): `--color-background`, top radius `--radius-sheet`, 20 px sides, 8 px top, 34 px bottom; over a `bg-scrim` covering the screen. It opens at 724 px tall, its top at 150 (the day's title still shows above the scrim). Search grows it to 818, its top at `--size-row` (D-USE-57, "Pool search").
- Grabber: 36 × 5, `--color-fill-muted`, centred, 4 to 8 px under it.
- Header (`--size-target` high): "Pool" (title, semibold, title tracking) and a 12 px × in a `--size-target` square at the right.

## Top to bottom

1. **Tabs** (40 px, 3 px inset on `--color-surface`, `--radius-control`, 2 px gap): **Pool** first, **From Linear** second. The selected tab is `--color-background` with a `--color-border` hairline (radius 4), semibold ink label; the other muted. With Linear not connected the second tab reads **Connect Linear** (D-USE-56). Unlike the desk, the second tab always shows (D-USE-101 keeps the desk's hidden tab and the phone's "Connect Linear").
2. **Filters** (10 px above, 4 below, 6 px gaps; pills 32 px, 10 px sides, label medium):
   - Pool tab (drawn on the pool-sheet frame): "All clients ▾", "Size ▾", "Due date ▾" as outline pills with chevrons, a 16 px search glyph at the right (D-USE-54: client, size and due-date filters and search).
   - From Linear tab: "All clients ▾" (outline), then **Assigned to Taylor** and **Not done**, filled `--color-primary` with `--color-primary-foreground` words while on, both on by default (D-USE-57). No search glyph is drawn on this tab [ASSUMPTION: it stays at the right, as on the Pool tab, since search covers both tabs].
   - "All clients ▾" opens the client filter sheet; hidden when clients are off ([`states/clients-off.md`](states/clients-off.md)). [ASSUMPTION] Size and Due date open small sheets of the same shape (Size: Any, then Quick to Huge; Due date: Any, Due this week, Due today); not drawn.
3. **Sync line** (From Linear only; 6 px above, 2 below): "Synced 2 min ago" (caption, muted) and **Sync now** (label, semibold) at the right.
4. **The list**, grouped by client in Taylor's order (D-USE-96):
   - **Client head** (12 to 14 px above): the 16 px tile (radius 4) in the client's colour with its white bold 10 px letter, then the name (label, semibold). Drawn: Kestrel Health (rose, "K"), Alder Studio (moss, "A"), Personal (ink, "T") [placeholder].
   - **Team and project line** (caption, muted, 24 px indent): "Portal team · 🏥 Patient portal", "Records team · 📁 Records import" [placeholder]; one company with two teams is one client with two lines (D-USE-42).
   - **Rows** (at least 60 px, 8 px gaps, a `--color-border` hairline under each but the last): a lead slot (the emoji in 18 px on the Pool tab and in search; Linear's status shape in 14 px on From Linear), the title (body) over the meta (caption, muted), and **Place** at the right (32 px, 12 px sides, `--radius-control`, a hairline, label semibold).
5. Pool tab only: the foot line under the list, as the pool-sheet frame draws it (cited, not repeated). No "+ New task" row is drawn on the Pool tab with items in it; New task shows on pool empty and on a search with no match [ASSUMPTION: the desk's "+ New item in the pool" has no drawn phone row otherwise; New task is also in + Add, [`../../interactions/add/index.md`](../../interactions/add/index.md)].

## Rulings

D-USE-54 (the sheet, the tabs, the filters, search, grouping, tap to place); D-USE-56 (Connect Linear; pool empty); D-USE-57 (From Linear connected; search; New task to the pool, never to Linear); D-USE-95 (client colours); D-USE-96 (client order); D-USE-98 (due words); D-USE-101 (the desk hides the tab; the phone keeps Connect Linear).
