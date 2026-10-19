---
target: specs/web/ux/work/today/states/work-menu.md
status: approved
promoted:
boards:
  - name: "phone-today / row long-press, work menu / 402 / light"
    page: "USE — work"
    at: [7230, 5760]
    note: "Notes · phone, Today (row 5, cont.) @ x 7230"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/work-menu-402.png
rulings: [D-USE-57, D-USE-65]
---

# Today — row long-press, the work menu

## What shows, top to bottom

**Phone (402):** the screen dims under a scrim; the pressed row (the SMS copy) lifts above it as a raised card with its trimmed meta "KES-51 · Normal · 2 Small · 30 to 60 min"; the menu opens above it, on the side with room: **Start**, **Prompt sent** (firing mark), **Done**; a rule; **Move to tier ›**, **Move to another day**, **Back to the pool**; a rule; **Open in Linear**. Each row has a leading glyph.

## What the person can do

Start (asks first if one runs, [start-while-one-runs](../../../interactions/start-while-one-runs.md)); Prompt sent (fires it); Done; Move to tier › (a submenu of the tiers); Move to another day and Back to the pool (as the Item sheet's Move-to, `../../../day/item-sheet/`); Open in Linear (opens the issue; hidden on a Synapse-only item [ASSUMPTION]). A tap outside closes it. A tap on a row (no long-press) opens its sheet. Reordering stays the grip drag on Now.

## Words

"Start", "Prompt sent", "Done", "Move to tier", "Move to another day", "Back to the pool", "Open in Linear".

## The notes on the boards

**Notes · phone, Today (row 5, cont.) @ x 7230** — Row long-press, work menu

Tap a row for its sheet; long-press for the menu: Start, Prompt sent, Done, Move to tier ›, Move to another day, Back to the pool, Open in Linear. The menu opens on the side with room. Reordering stays the existing grip drag on Now.

## Rulings

- D-USE-57: tap for the sheet, long-press for the work menu with these seven.
- On a firing row the menu's Prompt sent reads "Bring back" [ASSUMPTION: not drawn].

## Widths

Drawn at 402. The desk's menu: right-click (and the keyboard's context-menu key) on a row opens the same menu as a shadcn `ContextMenu`; drag between tiers stays (N6) (D-USE-65).

## Criteria

| ID                      | When                     | Then                                                                 | Evidence                     |
| ----------------------- | ------------------------ | -------------------------------------------------------------------- | ---------------------------- |
| C-USE-today-work-menu-1 | Long-press on a work row | The menu opens on the side with room with the seven actions in order | `captures/work-menu-402.png` |
| C-USE-today-work-menu-2 | A tap on a row           | Its Item sheet opens; no menu                                        | manual                       |
