---
target: specs/web/ux/work/today/states/over-the-range.md
status: approved
promoted:
boards:
  - name: "phone-today / running, over the range / 402 / light"
    page: "USE — work"
    at: [6266, 5760]
    note: "Notes · phone, Today (row 5, cont.) @ x 6266"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/over-the-range-402.png
rulings: [D-USE-29, D-USE-42, D-USE-57]
---

# Today — running, over the range

## What shows, top to bottom

**Phone (402, 11:35):** the running card keeps its verdigris edge; the label reads "WORK TIME · OVER" and the clock "12 min over", both in the warning colour; under it "past the top of 2 h · worked 2 h 12 since 9:23"; Pause, Prompt sent, Done. Step away shows. [Portal sign-in] reads "firing" over "1 h 20".

**Desk (not drawn):** the running card's clock counts up as "n min over" in the D-USE-29 colours (the desk running note, D-USE-42).

## Words

"WORK TIME · OVER"; "12 min over"; "past the top of 2 h · worked 2 h 12 since 9:23"; firing past an hour "1 h 20".

## The notes on the boards

**Notes · phone, Today (row 5, cont.) @ x 6266** — Running, over the range

Past the top of the range the clock counts up as "12 min over" in warning; well over, danger, as on the phone's running card (D-USE-29). Firing past an hour reads "1 h 20".

## Rulings

- D-USE-29: over in warning, well over in danger (the threshold is D-USE-29's, as on the running card in `../../../day/running/`).
- D-USE-57: over the range drawn on the phone. "Over" is a length, never a count (product rules).

## Widths

Drawn at 402. Desk: as the note on "today / running", D-USE-42.

## Criteria

| ID                           | When                                  | Then                                                               | Evidence                          |
| ---------------------------- | ------------------------------------- | ------------------------------------------------------------------ | --------------------------------- |
| C-USE-today-over-the-range-1 | Work time passes the top of the range | The clock counts up "n min over" in warning, danger when well over | `captures/over-the-range-402.png` |
| C-USE-today-over-the-range-2 | Firing passes an hour                 | It reads "1 h 20", never minutes past 59                           | capture                           |
