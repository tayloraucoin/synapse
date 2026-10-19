---
target: specs/web/ux/work/today/states/linear-failed.md
status: approved
promoted:
boards:
  - name: "phone-today / Not updated in Linear, Try again / 402 / light"
    page: "USE — work"
    at: [5302, 5760]
    note: "Notes · phone, Today (row 5) @ x 5302"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/linear-failed-402.png
rulings: [D-USE-56, D-USE-48]
---

# Today — Linear failed (Not updated in Linear)

## What shows, top to bottom

**Phone (402, 11:05):** as [brought back](brought-back.md): [Portal sign-in] lifted as Next with Resume and Done ("worked 40 min · fired 41 min"). [Case studies] shows its Done record ("ALD-17 · Took 1 h 10 · fired 32 min") and under it, on its own row: an info glyph, "Not updated in Linear." and a small **Try again** button, in ink, never red. The check in Synapse stands (N4).

**Desk (not drawn):** the same line under the row's meta, in ink (N6's state table names it at the desk). [ASSUMPTION] Same words and placement.

## What the person can do

Try again (retries the write; the line becomes the updating line, [linear-updating](linear-updating.md)); everything else as usual.

## Words

"Not updated in Linear."; "Try again".

## The notes on the boards

**Notes · phone, Today (row 5) @ x 5302** — Not updated in Linear

A failed Linear write (here, Done) shows on its own row: "Not updated in Linear." with Try again, in ink, never red.

## Rulings

- D-USE-56: "Not updated in Linear." with Try again, in ink, on the row.

## Widths

Drawn at 402. Desk: as the phone [ASSUMPTION], N6.

## Criteria

| ID                          | When                 | Then                                                                                          | Evidence                         |
| --------------------------- | -------------------- | --------------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-today-linear-failed-1 | A Linear write fails | The row keeps its Synapse state; "Not updated in Linear." and Try again show under it, in ink | `captures/linear-failed-402.png` |
