---
target: specs/web/ux/day/block-view/states/success.md
status: approved
promoted:
boards:
  - name: "block-view / success / 402 / light"
    page: "USE — daily use"
    at: [0, 6420]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/success-402.png
rulings: [D-USE-8, D-USE-13, D-USE-17, D-USE-24, D-USE-39, D-USE-69, D-USE-109]
---

# Block view — from Review the day

Wellness tapped on Review the day at 7:01. The board's frame at full detail. `?state=success`. Its note is "Note · success" at x 0, y 7350.

## What shows, top to bottom

Phone 402 × 874, `--color-background`, 20 px side padding.

1. **Status bar:** the phone's (7:01).
2. **Breadcrumb:** "‹ Today › Wellness": the chevron and "Today" muted, "›" muted, "Wellness" in ink, caption size.
3. **Header:** a leaf (Wellness) colour bar at the leading edge, the full height of the two lines; "Wellness" (title, semibold) over "7:05 to 8:00" (caption, muted). Trailing: "Edit" (plain text button, medium, ink) and ··· (round, `--color-fill-muted`). A hairline under the header.
4. **The column**, rail times on the left (caption, `figure`), each row on a hairline: 7:05 "Pee and weigh" 2 min; 7:07 "Water" 1 min; 7:08 "Start the cold bath" 2 min; 7:10 "Meditate" 10 min; 7:20 "Cold bath" 10 min. Each row: an empty `Checkbox` (rounded square, muted border), the name (body), the length trailing (caption, muted). The 2 and 1 min rows are 56 px; the 10 min rows are about twice as tall, the name at the top.
5. **Add row** at 7:30: "+" and "Add to Wellness" (muted).
6. **Free time:** a dashed, rounded region from the add row to the end, "Free until 8:00" centred (caption, muted).
7. **The end:** "8:00" on the rail with a solid ink line across.
8. **The peek:** a clay (Training) bar and "Training · 8:00 to 8:57" (caption, muted).

## What the person can do

- Tap a checkbox: the item is done; it records the planned length, as Done does (D-USE-13). Checking ahead of time is allowed ([`checked-swipe.md`](checked-swipe.md)).
- Tap an item's name: the Item sheet ([`../../item-sheet/index.md`](../../item-sheet/index.md)).
- Swipe a row left: Remove ([`checked-swipe.md`](checked-swipe.md), [`removed-undo.md`](removed-undo.md)).
- "Edit": grips for reordering ([`edit-dragging.md`](edit-dragging.md)). ···: the header menu ([`header-menu.md`](header-menu.md)).
- "Add to Wellness": type a name, Return adds it, 5 minutes, after the last item (N2) [ASSUMPTION: the same add row from the day; the boards draw it typed only on `empty`].
- "‹ Today": back to Review the day.

## Words

As the surface's words; "Free until 8:00".

## The notes on the boards

**"block-view / success / 402 / light"**, note "Note · success" @ x 0, y 7350:

> success · from Review the day
>
> Tap Wellness on Review the day. The block's span fills the screen (rows at least 56 px, longer items taller), start times on the rail, a checkbox on each row. Unused time reads "Free until 8:00"; the add row sits at its top. The next block peeks at the foot. Back is the breadcrumb. Tapping an item's name opens the Item sheet (step 4).

## Rulings

- D-USE-8: the fixture, Wellness 7:05 to 8:00, then Training 8:00 to 8:57.
- D-USE-24: "Edit" is a visible button beside a round ···.
- D-USE-17: no grips until Edit.
- D-USE-13: a row's checkbox does what Done does.
- open-1 (step 3 round 1, drawn): `[ASSUMPTION]` unused time reads "Free until 8:00", with the add row at its top. Decided (D-USE-69), as drawn: a dashed region "Free until <block end>" under the add row.
- "Item sheet (step 4)": the current sheet is step 11's (D-USE-37), `../../item-sheet/`.

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39), at Today in the right panel (N6).

## Criteria

| ID                         | When                                  | Then                                                                                                                                     | Evidence                   |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-block-view-success-1 | Wellness is tapped on Review the day  | The breadcrumb, header with Edit and ···, rows with rail times and checkboxes, the add row, "Free until 8:00" and the Training peek show | `captures/success-402.png` |
| C-USE-block-view-success-2 | A 10 min item sits beside 2 min items | Its row is taller; no row is under 56 px                                                                                                 | `captures/success-402.png` |
| C-USE-block-view-success-3 | An item's name is tapped              | The Item sheet opens over Block view                                                                                                     | test                       |
