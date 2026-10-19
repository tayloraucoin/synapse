---
target: specs/web/ux/day/now/states/row-long-press.md
status: approved
promoted:
boards:
  - name: "now / row long-press / 402 / light"
    page: "USE — daily use"
    at: [1928, 10200]
    note: "Frame @ x 1928, y 11130"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/row-long-press-402.png
rulings: [D-USE-17, D-USE-26, D-USE-28, D-USE-70, D-USE-72]
---

# Now — row long-press

Cold bath held. `?state=row-long-press`. Its note is the "Frame" at x 1928, y 11130.

## What shows, top to bottom

As [`success.md`](success.md), with:

- **A scrim** over the whole screen, tabs included (a grey wash).
- **The row lifts** above the scrim: "Cold bath", "10 min", the grip, on `--color-background` with `--radius-card`, inset 8 px wider than the row.
- **The menu** under it, from the left edge, about 240 wide: `DropdownMenu`, background token, hairline border, 10 px radius, one soft shadow (D-USE-28). Rows, each a muted leading icon and the word in ink: "Swap" (two arrows), "Edit" (pencil); a separator; "Move up" (arrow up), "Move down" (arrow down, greyed: the last row); a separator; "Not today" (a calendar with ×).

## What the person can do

- **Swap**, **Edit:** the Item sheet on the item (`../../item-sheet/states/swap.md`, `../../item-sheet/index.md`).
- **Move up / Move down:** one place, the tap fallback for the grip, as on Block view; Move down disabled on the last row, Move up on the first [ASSUMPTION].
- **Not today:** off today only; its usual day keeps it; no judgement (D-USE-70). [ASSUMPTION] a Toaster with Undo, as Move to.
- Tap the scrim: closes.

## Words

"Swap" · "Edit" · "Move up" · "Move down" · "Not today".

## The notes on the boards

**"now / row long-press / 402 / light"**, "Frame" @ x 1928, y 11130:

> row long-press
>
> The row lifts over a scrim with its menu: Swap, Edit, then [PROPOSED] Move up and Move down, the tap fallback for the grip (as on Block view); Move down greys on the last row. Not today sits apart. Where Not today puts an item is still Open.

## Rulings

- D-USE-17: long-press stays the row's menu. D-USE-26: it gains Move up and Move down; Decided (D-USE-72) for the note's [PROPOSED].
- D-USE-70 closes "Where Not today puts an item is still Open": off today only. Move to… always lets the person choose ([`../../../interactions/move-to/index.md`](../../../interactions/move-to/index.md)).
- D-USE-28: menus are shadcn dropdowns with one soft shadow.

## Widths

Drawn at: 402. Wider: [ASSUMPTION] the same menu at the row (D-USE-39 scale-up); at the desk a right-click `ContextMenu`, as Today's work menu (D-USE-65).

## Criteria

| ID                         | When                  | Then                                                                                                   | Evidence                          |
| -------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------- |
| C-USE-now-row-long-press-1 | A row is long-pressed | It lifts over a scrim with Swap, Edit, Move up, Move down, Not today; Move down greyed on the last row | `captures/row-long-press-402.png` |
| C-USE-now-row-long-press-2 | Not today             | The item leaves today; its usual day keeps it                                                          | test                              |
