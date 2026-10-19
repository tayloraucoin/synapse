---
target: specs/web/ux/work/today/states/offline.md
status: approved
promoted:
boards:
  - name: "phone-today / offline / 402 / light"
    page: "USE — work"
    at: [4820, 5760]
    note: "Notes · phone, Today (row 5) @ x 4820"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/offline-402.png
rulings: [D-USE-56, D-USE-65]
---

# Today — offline

## What shows, top to bottom

**Phone (402):** as [working](working.md), with a `StatusLine` under the Work header: the offline glyph and "Offline. Everything works here; Linear catches up when back online." Firing keeps counting ("firing / 5 min"), Start and Done work.

**Desk (not drawn):** the same `StatusLine` under the band: at the desk, under the Work band, above the Next strip (D-USE-65).

## What the person can do

Everything: Start, Pause, Prompt sent, bring back, Done, Step away, check, add. Linear writes wait and go in order when back online ([timers across devices](../../../dev-notes/timers-across-devices.md)).

## Words

"Offline. Everything works here; Linear catches up when back online."

## The notes on the boards

**Notes · phone, Today (row 5) @ x 4820** — Offline

Everything works, firing and timers included; Linear changes wait. A StatusLine under the block header says so.

## Rulings

- D-USE-56: offline, everything works, timers and firing included, with a StatusLine.

## Widths

Drawn at 402. Desk: decided above (D-USE-65).

## Criteria

| ID                    | When        | Then                                                                          | Evidence                   |
| --------------------- | ----------- | ----------------------------------------------------------------------------- | -------------------------- |
| C-USE-today-offline-1 | Offline     | The StatusLine shows; every control works; firing and work time keep counting | `captures/offline-402.png` |
| C-USE-today-offline-2 | Back online | Queued Linear writes go in event order; the line clears                       | test                       |
