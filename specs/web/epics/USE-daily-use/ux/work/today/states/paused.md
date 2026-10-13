---
target: specs/web/ux/work/today/states/paused.md
status: approved
promoted:
boards:
  - name: "phone-today / paused, one item / 402 / light"
    page: "USE — work"
    at: [5784, 5760]
    note: "Notes · phone, Today (row 5, cont.) @ x 5784"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/paused-402.png
rulings: [D-USE-46, D-USE-57]
---

# Today — paused, one item

## What shows, top to bottom

**Phone (402, 10:42):** no Step away pill (no timer runs). [Case studies] is the **held card**: the edge at the hairline, "WORK TIME · PAUSED" in muted ink, "1:03:00", "left of 2 h · worked 57 min · paused at 10:40"; **Resume**, Prompt sent, Done. The held card keeps the lift; Next (the SMS copy) stays a shaded row. [Portal sign-in] fires on ("firing / 27 min").

**Desk (not drawn):** the same held card as [stepped-away](stepped-away.md) without the bar, Step away hidden from the header (D-USE-46: the header button shows only while a work timer runs).

## What the person can do

Resume (work time runs again, Step away returns); Prompt sent; Done.

## Words

"WORK TIME · PAUSED"; "paused at 10:40"; "Resume".

## The notes on the boards

**Notes · phone, Today (row 5, cont.) @ x 5784** — Paused, one item

Pause on the card holds that item only: WORK TIME · PAUSED, edge to hairline, "paused at 10:40", Resume. No timer runs, so Step away hides.

## Rulings

- D-USE-57: paused alone, Step away hides.
- D-USE-46: the held card's look; Step away only while a work timer runs.
- [ASSUMPTION] Pause is not Step away: Resume all never resumes an item paused by its own Pause ([step-away](../../../interactions/step-away.md)).

## Widths

Drawn at 402. Desk: D-USE-46 above.

## Criteria

| ID                   | When                      | Then                                                      | Evidence                  |
| -------------------- | ------------------------- | --------------------------------------------------------- | ------------------------- |
| C-USE-today-paused-1 | Pause on the running card | Only that item holds; "paused at <time>"; Step away hides | `captures/paused-402.png` |
