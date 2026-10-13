---
target: specs/web/ux/work/week/states/offline.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn at the desk; follows the phone's 'phone-today / offline / 402 / light' (D-USE-56)."
rulings: [D-USE-56, D-USE-65]
---

# Week — offline

`?state=offline` [ASSUMPTION: key].

## What shows

[ASSUMPTION, following Today's offline, D-USE-56 "everything works"] A `StatusLine` under the header: "Offline. Everything works here; Linear catches up when back online." (Today's words). The pool and the week are live from what was loaded. Placing, moving, Spread and "+ Event" work and sync when back online. The Linear tab shows what was last synced; the sync line reads "Linear synced <time> ago" with Sync now disabled [ASSUMPTION]. The popover's "Linear, not in the pool yet" group waits for the connection ([`../../../interactions/add/index.md`](../../../interactions/add/index.md) › Rules: Linear lookups wait).

## Rulings

- D-USE-56: offline, everything works, with a StatusLine.
- D-USE-65: at the desk the StatusLine sits under the header band (Today's form).

## Widths

Not drawn.

## Criteria

| ID                   | When    | Then                                                                            | Evidence |
| -------------------- | ------- | ------------------------------------------------------------------------------- | -------- |
| C-USE-week-offline-1 | Offline | StatusLine under the header; placing works and syncs later; Linear lookups wait | manual   |
