---
target: specs/web/ux/work/this-week/states/client-filter.md
status: approved
promoted:
boards:
  - name: "this-week / client filter sheet / 402 / light"
    page: "USE — work"
    at: [3374, 7200]
    note: "Notes · phone, editing and This week (row 6) @ x 3374"
    capture: specs/web/epics/USE-daily-use/ux/work/this-week/captures/client-filter-402.png
rulings: [D-USE-40, D-USE-54, D-USE-95, D-USE-96]
---

# This week on the phone — the client filter sheet

"All clients ▾" tapped in the pool sheet ([`../pool-sheet-anatomy.md`](../pool-sheet-anatomy.md) › Filters). `?state=client-filter` [ASSUMPTION: key].

## What shows, top to bottom

- Behind, under the scrim: "‹ Week" (heading, semibold) and "Pool" (title) [ASSUMPTION: drawing shorthand for the pool sheet beneath; the filter sheet stacks on the pool sheet, over This week (D-USE-54)].
- **The sheet** (420 px tall, its top at 454; `--color-background`, top radius `--radius-sheet`, 20 px sides, 34 px bottom): the grabber; the header "Client" (heading, semibold) and a 12 px × in a `--size-target` square.
- **Rows**, 52 px each, 12 px gaps, a `--color-border` hairline under each:
  - "All clients" (body, medium) after an empty 16 px slot, a 14 px check at the right: the current choice.
  - The client's 16 px tile (radius 4, its colour, its white bold 10 px letter), the name (body): "Kestrel Health" (rose, "K") with "two Linear teams" (caption, muted) at the right; "Alder Studio" (moss, "A"); "Personal" (ink, "T") [placeholder].
- **Foot line** (label, muted, 12 px above): "Narrows the pool only. The days keep every client's work. In the order set in Settings › Clients."

## What the person can do

- Pick one row [ASSUMPTION: one client at a time; the check moves, the sheet closes, the pill reads the client's name, e.g. "Kestrel Health ▾", and both tabs narrow]. All clients clears it.
- × or a tap on the scrim closes it unchanged.
- The order is not set here: it is the pool's order, changed by a client head's drag at the desk or the grip in Settings › Connections › Clients (D-USE-96; [`../../../account/settings/states/clients-on.md`](../../../account/settings/states/clients-on.md)).

## Words

"Client" · "All clients" · "two Linear teams" · "Narrows the pool only. The days keep every client's work. In the order set in Settings › Clients." [PROPOSED, to Gloss] "Settings › Connections" for "Settings › Clients", since Clients sits inside Connections ([`../../../account/settings/states/clients-on.md`](../../../account/settings/states/clients-on.md)).

## The notes on the boards

**Notes · phone, editing and This week (row 6) @ x 3374** — Client filter sheet

All clients, then each client in Settings order. Narrows the pool only, never the days. Not shown when clients are off.

## Rulings

- D-USE-54: the client filter is its own sheet and narrows the pool only.
- D-USE-40: the client toggle narrows the pool and planning, never today; clients off by default, so the filter is hidden then ([`clients-off.md`](clients-off.md)).
- D-USE-96: one client order; it orders this list.
- D-USE-95: the client colours (rose, leaf, amber, moss, slate, ink); a tile always carries its letter or logo.

## Widths

Drawn at 402. The desk draws no client filter: collapsing a client head stands in, and Group and Sort take its place (D-USE-41; [`../../week/pool-panel.md`](../../week/pool-panel.md) › Client order).

## Criteria

| ID                              | When                            | Then                                                                               | Evidence                         |
| ------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-this-week-client-filter-1 | "All clients ▾" with clients on | All clients, then each client in the Settings order, each with its tile and letter | `captures/client-filter-402.png` |
| C-USE-this-week-client-filter-2 | A client is picked              | The pool's tabs narrow to that client; the days on This week are unchanged         | test                             |
| C-USE-this-week-client-filter-3 | Clients are off                 | No client pill in the pool sheet                                                   | test                             |
