---
target: specs/web/ux/work/today/states/no-work-slotted.md
status: approved
promoted:
boards:
  - name: "phone-today / no work slotted / 402 / light"
    page: "USE — work"
    at: [3856, 5760]
    note: "Notes · phone, Today (row 5) @ x 3856"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/no-work-slotted-402.png
rulings: [D-USE-2, D-USE-41, D-USE-56, D-USE-65]
---

# Today — no work slotted

## What shows, top to bottom

**Phone (402, 10:20):** under the Work header, anchored under the title (not centred): "Nothing is slotted for this block yet. Add here, or plan the week in Set my days." Then each tier heading with its colour square and one `InlineAddRow`: "+ Add to Primary", "+ Add to Secondary", "+ Add to Stretch", each under a hairline. Then a row card: **Plan the week**, "Set my days › This week, with the pool", a chevron. No Step away, no Next.

**Desk (not drawn):** N6's row: each tier has "Add to Primary" and the others, and a line points to Week. At the desk the add rows open "+ Add to <tier>", one search over the pool and Linear (D-USE-41), and the line's link goes to Week (rail). The desk line's words: "Nothing is slotted for today yet. Add here, or plan the week." with "Plan the week" going to Week (D-USE-65).

## What the person can do

An add row opens Add with that tier set ([add](../../../interactions/add/index.md)); Plan the week goes to Set my days › This week ([`../../this-week/`](../../this-week/index.md)).

## Words

"Nothing is slotted for this block yet. Add here, or plan the week in Set my days."; "Add to Primary", "Add to Secondary", "Add to Stretch"; "Plan the week"; "Set my days › This week, with the pool".

## The notes on the boards

**Notes · phone, Today (row 5) @ x 3856** — No work slotted

Each tier offers "Add to Primary" and the others; a row points to Set my days › This week. Anchored under the title.

## Rulings

- D-USE-56: "Add to <tier>" per tier and a row to Set my days › This week, under the title.
- D-USE-2: the not-slotted line points to where work is slotted (amends N4's "Work is set each morning.").
- Differs from [nothing-planned](nothing-planned.md): there, items left open are offered.

## Widths

Drawn at 402. Desk: decided above (D-USE-65).

## Criteria

| ID                            | When                                             | Then                                                         | Evidence                           |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------- |
| C-USE-today-no-work-slotted-1 | A Work block with no items and nothing left open | Add rows per tier and the Plan the week row, under the title | `captures/no-work-slotted-402.png` |
