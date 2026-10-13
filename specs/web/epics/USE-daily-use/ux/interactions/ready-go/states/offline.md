---
target: specs/web/ux/interactions/ready-go/states/offline.md
status: approved
promoted:
boards:
  - name: "ready-go / welcome, offline / 402 / light"
    page: "USE — daily use"
    at: [2892, 8940]
    note: "Frame @ x 2892, y 9870"
    capture: specs/web/epics/USE-daily-use/ux/interactions/ready-go/captures/offline-402.png
rulings: [D-USE-71]
---

# The Ready, go hand-off — offline

Ready, go with no connection. Its note is the "Frame" at x 2892, y 9870.

## What shows, top to bottom

- A `StatusLine` across the top, under the status bar: a cloud-off icon and "Offline. The day is saved on this phone."
- Then [`welcome.md`](welcome.md) unchanged, pushed down by the line.

## What the person can do

As the welcome. Start works: the lock is saved on the phone and syncs later; nothing waits on the network (N3: Ready, go works offline).

## Words

"Offline. The day is saved on this phone." [placeholder] until Gloss. Now's own offline line differs ("Offline. Checks are saved on this phone.", `../../../day/now/states/offline.md`).

## The notes on the boards

**"ready-go / welcome, offline / 402 / light"**, "Frame" @ x 2892, y 9870:

> Offline
>
> The same screen with the StatusLine on top: "Offline. The day is saved on this phone." (N3: Ready, go works offline.)

## Rulings

- D-USE-71: as drawn.
- Replaces round 1's `ready-go / offline, the same hand-off / 402 / light` (`../../../boards/use-daily-use/archive-2.md`).

## Widths

Drawn at: 402. Wider: as [`welcome.md`](welcome.md) › Widths (D-USE-39).

## Criteria

| ID                       | When              | Then                                       | Evidence                   |
| ------------------------ | ----------------- | ------------------------------------------ | -------------------------- |
| C-USE-ready-go-offline-1 | Ready, go offline | The welcome with the StatusLine on top     | `captures/offline-402.png` |
| C-USE-ready-go-offline-2 | Start offline     | Now opens; the lock syncs when back online | test                       |
