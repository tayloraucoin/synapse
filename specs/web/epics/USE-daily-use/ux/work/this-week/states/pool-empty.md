---
target: specs/web/ux/work/this-week/states/pool-empty.md
status: approved
promoted:
boards:
  - name: "this-week / pool empty / 402 / light"
    page: "USE — work"
    at: [4820, 7200]
    note: "Notes · phone, editing and This week (row 6) @ x 4820"
    capture: specs/web/epics/USE-daily-use/ux/work/this-week/captures/pool-empty-402.png
rulings: [D-USE-31, D-USE-56, D-USE-57]
---

# This week on the phone — pool empty

Nothing waits in the pool. `?state=pool-empty` [ASSUMPTION: key].

## What shows, top to bottom

- Behind, under the scrim: "‹ Week" and "Monday, 12 October".
- **The pool sheet** ([`../pool-sheet-anatomy.md`](../pool-sheet-anatomy.md)), top at 150: the grabber, "Pool" and ×; tabs **"Pool"** (selected) and "From Linear".
- No filters and no search glyph [ASSUMPTION: nothing to narrow or search on this tab; From Linear keeps its own].
- **The empty line**, anchored under the tabs (24 px above, 16 below, 6 px gap), not centred (A-08): "Nothing in the pool" (heading, semibold); "Work saved for later lands here, and anything left open at a day's end. Every item in Linear is one tab over." (body, muted).
- **Two buttons** side by side, 48 px, equal widths, 8 px apart: **From Linear** (outline, `--color-border`) and **New task** (primary, `--color-primary`).

## What the person can do

- **From Linear:** switches to the From Linear tab ([`linear-connected.md`](linear-connected.md); with Linear not connected, the "Connect Linear" tab, [`linear-not-connected.md`](linear-not-connected.md)) [ASSUMPTION: the button stays and leads to Connect Linear].
- **New task:** New task with no days, which waits in the pool and is never created in Linear (D-USE-57; [`../../../interactions/add/index.md`](../../../interactions/add/index.md), its "save to the pool" state) [ASSUMPTION: the day shown is not filled in, since a task from the pool waits there].
- ×, a swipe down or the scrim closes the sheet.

## Words

"Nothing in the pool" · "Work saved for later lands here, and anything left open at a day's end. Every item in Linear is one tab over." · "From Linear" · "New task". Gloss passed these. The desk's empty pool (not drawn) borrows this line's shape ([`../../week/states/pool-empty.md`](../../week/states/pool-empty.md)); [PROPOSED, to Gloss] the desk takes these words too, with "New item in the pool" as the desk's button.

## The notes on the boards

**Notes · phone, editing and This week (row 6) @ x 4820** — Pool empty

Under the title, not centred, with From Linear and New task.

## Rulings

- D-USE-56: pool empty sits under the title, with From Linear and New task.
- D-USE-57: New task with no days saves to the pool, never to Linear.
- D-USE-31: what the pool holds: work saved for later and what was left open.

## Widths

Drawn at 402. 1024 and up: the desk's pool panel, [`../../week/states/pool-empty.md`](../../week/states/pool-empty.md) (not drawn).

## Criteria

| ID                           | When                           | Then                                                                          | Evidence                      |
| ---------------------------- | ------------------------------ | ----------------------------------------------------------------------------- | ----------------------------- |
| C-USE-this-week-pool-empty-1 | The pool holds nothing         | The line under the tabs, not centred, with From Linear and New task; no count | `captures/pool-empty-402.png` |
| C-USE-this-week-pool-empty-2 | New task is saved with no days | It waits in the pool; nothing is created in Linear                            | test                          |
