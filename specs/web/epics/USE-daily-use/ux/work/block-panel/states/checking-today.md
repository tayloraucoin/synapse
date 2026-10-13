---
target: specs/web/ux/work/block-panel/states/checking-today.md
status: approved
promoted:
boards: []
not_drawn: "Ruled, not drawn: D-USE-74 has a non-work block's items checked in its Block panel at the desk; the two panel frames are opened from the Week, which plans"
rulings: [D-USE-13, D-USE-24, D-USE-30, D-USE-74, D-USE-77, D-USE-100]
---

# Block panel — today's block, checking

A block of today opened from Today's day column ([`../../today/index.md`](../../today/index.md)) or from Schedule at the desk (D-USE-77, `../../../day/schedule/`). This is where the desk checks a non-work block's items (D-USE-74). `?state=checking-today`.

## What shows

The panel of [`../index.md`](../index.md) with the body of Block view from the day (`../../../day/block-view/states/success.md`, `current.md`, `past.md`) [ASSUMPTION: every element below is Block view's, widened to `--sheet-w`, since no desk frame draws it]:

- The breadcrumb names the day as Today does ("Today › Wellness") [ASSUMPTION].
- A `Checkbox` leads each row; checked rows stay, faded, never hidden (N3).
- The header carries Edit beside the round ··· (D-USE-24), as from the day; Open day is not shown, since the day is already open behind it [ASSUMPTION].
- The block running now carries the `NowLine` (D-USE-30, `current.md`); a past block is faded and still live, nothing says missed (`past.md`).
- **A Work block of today** shows its tiers as [`work-block.md`](work-block.md) does [ASSUMPTION]: firing, Start and Done stay on Today's rows, not in the panel.

## What the person can do

Check an item (it records the planned length, as Done does, D-USE-13); the rest as [`non-work-block.md`](non-work-block.md).

## Rulings

- D-USE-74: at the desk a non-work block's items are checked in its Block panel.
- D-USE-77: a desk click on a Schedule block opens its Block panel.
- D-USE-13: a checkbox does what Done does.
- The panel from the Week draws none of this; [`non-work-block.md`](non-work-block.md) carries the ruling on checkboxes there (D-USE-100).

## Criteria

| ID                                 | When                                                    | Then                                                                   | Evidence |
| ---------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- | -------- |
| C-USE-block-panel-checking-today-1 | Today's non-work block is clicked in Today's day column | The panel opens with a checkbox on each item; checked rows stay, faded | manual   |
| C-USE-block-panel-checking-today-2 | An item is checked in the panel                         | It records its planned length; nothing says missed for the rest        | test     |
