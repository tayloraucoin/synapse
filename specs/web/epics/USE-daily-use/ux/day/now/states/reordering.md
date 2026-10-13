---
target: specs/web/ux/day/now/states/reordering.md
status: approved
promoted:
boards:
  - name: "now / reordering / 402 / light"
    page: "USE — daily use"
    at: [2892, 10200]
    note: "Frame @ x 2892, y 11130"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/reordering-402.png
rulings: [D-USE-17, D-USE-26]
---

# Now — reordering (board 4a)

Cold bath's grip dragged above the lifted card. `?state=reordering`. Its note is the "Frame" at x 2892, y 11130.

## What shows, top to bottom

As [`success.md`](success.md), with:

- **A drop line**, 2 px ink, full width, under "Start the cold bath".
- **Cold bath lifted as dragged:** `--color-surface` fill, a 1 px ink edge, `--radius-control`, no shadow; the box, "Cold bath", "10 min", the grip; it sits between the drop line and the card.
- **Meditate** stays lifted in the card below.

## What happens

- Dropped above the lifted card, Cold bath becomes next up; the current item stays current (D-USE-26).
- The order changes today only [ASSUMPTION, as Review the day's changes].

## What the person can do

Drag and drop; Move up and Move down in the long-press menu are the tap fallback ([`row-long-press.md`](row-long-press.md)).

## The notes on the boards

**"now / reordering / 402 / light"**, "Frame" @ x 2892, y 11130:

> reordering (board 4a)
>
> Drag a grip: the row lifts (ink edge, surface fill, no shadow) with a drop line where it lands (D-USE-17). [ASSUMPTION] Dropped above the lifted card, Cold bath becomes next up; the current item stays current.

## Rulings

- D-USE-17: a visible grip on every undone row; dragging lifts it with a drop line.
- D-USE-26 rules the note's [ASSUMPTION]: a row dropped above the lifted card becomes next up and the current item stays current.

## Widths

Drawn at: 402. Wider: the index's Platforms.

## Criteria

| ID                     | When                          | Then                                                      | Evidence                      |
| ---------------------- | ----------------------------- | --------------------------------------------------------- | ----------------------------- |
| C-USE-now-reordering-1 | A grip is dragged             | The row lifts with an ink edge and a drop line, no shadow | `captures/reordering-402.png` |
| C-USE-now-reordering-2 | Dropped above the lifted card | It is next up; the current item stays current             | test                          |
