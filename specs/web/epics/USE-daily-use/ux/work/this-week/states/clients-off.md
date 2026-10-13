---
target: specs/web/ux/work/this-week/states/clients-off.md
status: approved
promoted:
boards: []
not_drawn: "Every row 6 frame draws clients on; clients off is the default (D-USE-40) and the strip says only 'Not shown when clients are off.'"
rulings: [D-USE-40, D-USE-54]
---

# This week on the phone — clients off

Settings › Connections' Clients switch off, the default (D-USE-40). `?state=clients-off` [ASSUMPTION: key].

## What shows, top to bottom

- **The day:** unchanged; rows never carried a client mark here.
- **The pool sheet:** no "All clients ▾" pill (the strip: "Not shown when clients are off"); on the Pool tab "Size ▾", "Due date ▾" and search; on From Linear the two filters. [ASSUMPTION, as the desk's [`../../week/pool-panel.md`](../../week/pool-panel.md) › Client order] no client heads: the list groups by Linear workspace (only with more than one, D-USE-31), then team and project lines; Synapse-only items under "No Linear".
- Search metas drop the client: "Pool · KES-58 · 3 Medium" [ASSUMPTION].

## What the person can do

As [`linear-connected.md`](linear-connected.md) and the pool sheet, less the client filter.

## Rulings

- D-USE-40: clients optional, off by default; the toggle narrows the pool and planning, never today.
- D-USE-54: the client filter is its own sheet ([`client-filter.md`](client-filter.md)).

## Widths

Not drawn. 1024 and up: no client heads in the pool panel ([`../../week/pool-panel.md`](../../week/pool-panel.md)).

## Criteria

| ID                            | When        | Then                                                       | Evidence |
| ----------------------------- | ----------- | ---------------------------------------------------------- | -------- |
| C-USE-this-week-clients-off-1 | Clients off | No client pill, no client heads, no client in search metas | test     |
