---
target: specs/web/ux/work/block-panel/states/non-work-block.md
status: approved
promoted:
boards:
  - name: "block-panel / non-work block, from Time / 1728 / light"
    page: "USE — work"
    at: [1808, 4320]
    note: "Note · block-panel / non-work"
    capture: specs/web/epics/USE-daily-use/ux/work/block-panel/captures/non-work-block-1728.png
rulings:
  [
    D-USE-33,
    D-USE-39,
    D-USE-41,
    D-USE-55,
    D-USE-60,
    D-USE-74,
    D-USE-93,
    D-USE-94,
    D-USE-100,
  ]
---

# Block panel — a non-work block, from the Time lens

Mon 12's Training · gym clicked in the Week's Time lens on Monday 12 at about 10:20 (the block is past). "The phone's Block view, widened" (its note): the rows, transitions, Swap and add row behave as Block view's, which this file cites and does not repeat (`../../../day/block-view/`). `?state=non-work-block`.

## What shows, top to bottom

**Behind:** the Week in the Time lens exactly as [`work-block.md`](work-block.md) draws it, with **Monday's Training · gym ringed in ink** instead of Tuesday's Work. The pool panel stays open.

**The panel** (the frame of [`../index.md`](../index.md)):

1. "Mon 12 › Training" (13 px, muted) · **Open day** · ×.
2. The clay bar (`--color-category-clay-dot`, Training's kind colour), "Training · gym" (serif 24), "8:00 to 8:57 · ends 8:57 as planned".
3. **The items**, one row each, 10 px gaps, 4 px side padding: the start time in a 44 px slot (12 px, `--color-subtle-foreground`); the emoji in its 18 px slot; the name; the length on the right (12 px, muted).
   - 8:00 🚗 "Drive to the YMCA", italic and muted (a transition in the flow), "15 min". A 40 px row.
   - 8:15 🏋️ "Workout: gym" (14/20, ink) over "[Upper body A]" (12 px, muted); **Swap** (13 px semibold, ink, underlined: a text button) before "30 min". At least 52 px, hairlines above and below.
   - 8:45 🚗 "Drive home", italic and muted, "12 min". A 40 px row.
4. "+ Add to Training" (13 px, subtle, indented 58 px to the name's edge, 36 px tall).
5. **The scope line,** under a hairline: "Changes apply to Monday 12 only. The usual Monday stays as it is."

Not drawn here, though Block view from the day has them: checkboxes, Edit and the round ···, grips, "Free until …", the end line and the next block's peek (`../../../day/block-view/states/success.md`). See Rulings.

## What the person can do

- **Swap** on the workout: the library of the same kind ([`../../../day/item-sheet/states/swap.md`](../../../day/item-sheet/states/swap.md); the drives stay and are removed by hand, D-USE-60 (1)).
- **+ Add to Training:** type a name, Return adds it after the last item, as Block view's add row (`../../../day/block-view/states/training-editing.md`).
- **A row's name:** the Item sheet [ASSUMPTION, as `../index.md`].
- **Reorder or remove:** not drawn at the desk [ASSUMPTION: Block view's grip and Remove with Undo, `../../../day/block-view/states/edit-dragging.md`, `removed-undo.md`; at the desk Remove is in a right-click `ContextMenu`, as Today's work menu (D-USE-65)].
- **Open day**, **×**, Esc, as [`../index.md`](../index.md).

## Words

"Mon 12 › Training" · "Training · gym" · "8:00 to 8:57 · ends 8:57 as planned" · "Drive to the YMCA" · "Workout: gym" · "[Upper body A]" · "Swap" · "Drive home" · "15 min", "30 min", "12 min" · "+ Add to Training" · "Changes apply to Monday 12 only. The usual Monday stays as it is." A block running past its end: Block view's "Runs 12 min past 8:00." in ink (`../../../day/block-view/states/overflow.md`) [ASSUMPTION: in the header's fit line here].

## The notes on the boards

**Note · block-panel / non-work** — block-panel / non-work block, from Time / 1728 / light

The same panel on a non-work block (Training · gym on Monday): the phone's Block view, widened. Items with start times on the left, transitions in italics, Swap on the workout, "+ Add to Training", and the scope line: changes apply to this date only, the usual Monday is unchanged (N3). Every block kind opens the same panel; only a Work block shows tiers.

## Rulings

- D-USE-41: any block opens the panel; a non-work block shows its items.
- N3 and D-USE-33: a change from a dated day reaches that date only and names its reach, here in the scope line; a block changed for one date is marked "This day only" with a pencil (D-USE-33) [ASSUMPTION: the week's block takes that mark after a change here; not drawn].
- D-USE-74: at the desk a non-work block's items are checked in its Block panel. This frame (from the Week, a past block of today) draws no checkboxes. Decided (D-USE-100): Whether the panel opened from the Week shows checkboxes. Ruled, as drawn: from the Week the panel plans (no checkboxes, Edit or ···); from Today's day column or Schedule it checks ([`checking-today.md`](checking-today.md)).
- D-USE-39: the right panel as built. D-USE-55: the phone's answer is Block view. D-USE-60 (1): Swap leaves the drives.
- Every block kind opens this panel, Wellness, a meal, Life, To-dos and the rest, each with its items as Block view draws its kind (`../../../day/block-view/by-kind.md`) [ASSUMPTION: only Training is drawn at the desk].

## Widths

Drawn at 1728. 1024 to 1727: D-USE-94. Below 1024: Block view (D-USE-55, D-USE-93), for another date from Set my days' day view (`../../../day/block-view/states/training-editing.md` draws Training in the usual week).

## Criteria

| ID                                 | When                                     | Then                                                                                                         | Evidence                           |
| ---------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| C-USE-block-panel-non-work-block-1 | A non-work block is clicked in Time      | The panel shows its items with start times, transitions in italics, the add row and the scope line; no tiers | `captures/non-work-block-1728.png` |
| C-USE-block-panel-non-work-block-2 | An item is added or swapped in the panel | Only that date's block changes; the usual weekday is unchanged                                               | test                               |
| C-USE-block-panel-non-work-block-3 | Swap on the workout                      | The library of the same kind opens; the drives stay                                                          | manual                             |
