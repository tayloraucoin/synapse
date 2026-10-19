---
target: specs/web/ux/day/schedule/states/offline.md
status: approved
promoted:
boards: []
not_drawn: "No Schedule frame draws offline; Review the day's offline frame draws the same column"
rulings: [D-USE-56, D-USE-72]
---

# Schedule — offline

No connection, during go. The surface is [`../index.md`](../index.md). `?state=offline`.

## What shows

Not drawn. The living truth: the shell's offline `StatusLine` ("Offline — changes save on this device.", `specs/web/ux/_global/system-states.md`) and Phase 1 writes blocked, not queued (`_global/offline-and-sync.md`); the built Schedule's last spec reads "offline (status line; blocks interactive locally)" (imported SC-01). USE bends the write rule: offline, everything works and syncs later (D-USE-56 at work, D-USE-72 for checks and counts; Now's `../../now/states/offline.md`).

Decided (D-USE-77): as Review the day's drawn offline (`../../review-the-day/states/offline.md`): a `StatusLine` under the title, above the tray, a full-width `--color-surface` band with the offline glyph and "Offline. Changes are saved on this phone and sync later." (label, muted); the day from the phone, pushed down by the line; the now line keeps moving and the running ring keeps pulsing (counts are time-based, D-USE-72).

## What the person can do

Everything as [`during-go.md`](during-go.md): a block opens its Block view offline (`../../block-view/states/offline.md`). The line goes when the connection is back.

## Words

"Offline. Changes are saved on this phone and sync later."

## Widths

Not drawn. Desk: the same line under the title [ASSUMPTION: as desk Today's under its band, Decided (D-USE-65)].

## Criteria

| ID                       | When    | Then                                                                 | Evidence |
| ------------------------ | ------- | -------------------------------------------------------------------- | -------- |
| C-USE-schedule-offline-1 | Offline | The StatusLine shows once; the day reads from the phone; blocks open | manual   |
