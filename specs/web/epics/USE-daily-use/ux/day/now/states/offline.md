---
target: specs/web/ux/day/now/states/offline.md
status: approved
promoted:
boards:
  - name: "now / offline / 402 / light"
    page: "USE — daily use"
    at: [2892, 11460]
    note: "Frame @ x 2892, y 12390"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/offline-402.png
rulings: [D-USE-56, D-USE-64, D-USE-72]
---

# Now — offline

No connection, mid-Wellness at 7:14. The surface is [`../index.md`](../index.md); the block as [`success.md`](success.md). `?state=offline`.

## What shows, top to bottom

- Now's header: "Now", the avatar "T".
- **A `StatusLine`** under the header, above the tray: a full-width `--color-surface` band with the cloud-off glyph and "Offline. Checks are saved on this phone." (label).
- The To-dos tray closed ("Call the mechanic…"), pushed down by the line's height.
- Wellness as success: the green bar, "Wellness", "7:05 to 8:00", ···; done rows "Pee and weigh" 2 min, "Water" 1 min, "Start the cold bath" 2 min; the lifted card "Meditate" (its icon on a green tile, the verdigris dot) "10 min · 7:10" with Start and Done; "Cold bath" 10 min with its grip.
- The tab bar: Now (selected), Schedule, Review.

## What the person can do

Everything. Every check works and syncs later. Start, Pause and Done queue like any check, and counts keep running (they are time-based): Decided (D-USE-72), the Running surface ([`../../running/`](../../running/index.md)). Edits from a long-press or the Item sheet save on the phone too (D-USE-64). The tray works the same ([`../../todos/states/offline.md`](../../todos/states/offline.md)). The line goes when the connection is back [ASSUMPTION: once the queue has synced].

## Words

"Offline. Checks are saved on this phone."

## The notes on the boards

**"now / offline / 402 / light"**, "Frame" @ x 2892, y 12390:

> offline
>
> A StatusLine under the header: "Offline. Checks are saved on this phone." Every check works and syncs later.

## Rulings

- N4 and the intent pass (the flat `day/now.md`, deleted once folded, States: offline): all checks work and sync later; "Offline. Checks are saved on this phone."
- D-USE-56: offline, everything works, timers included, with a StatusLine.
- D-USE-64: an edit offline saves on the phone and syncs when back.
- D-USE-72: offline, counts run and Start, Pause and Done queue.

## Widths

Drawn at: 402. At the desk: the line spans the capped column (D-USE-39 (1)).

## Criteria

| ID                  | When                                    | Then                                                                                            | Evidence                   |
| ------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-now-offline-1 | Offline on Now                          | One StatusLine, "Offline. Checks are saved on this phone.", above the tray; the block unchanged | `captures/offline-402.png` |
| C-USE-now-offline-2 | Items checked offline, then back online | They sync with nothing lost, in order                                                           | test                       |
| C-USE-now-offline-3 | Start offline                           | The count runs                                                                                  | test                       |
