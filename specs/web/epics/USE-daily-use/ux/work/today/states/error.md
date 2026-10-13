---
target: specs/web/ux/work/today/states/error.md
status: approved
promoted:
boards:
  - name: "phone-today / error, Today didn't load / 402 / light"
    page: "USE — work"
    at: [9158, 5760]
    note: "Notes · phone, Today (row 5, cont.) @ x 9158"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/error-402.png
rulings: [D-USE-57]
---

# Today — error, Today didn't load

## What shows, top to bottom

**Phone (402):** the header, the tray line and the Work block header stay; under them `RegionRetry`, anchored under the title: "Today didn't load." (bold), "Timers that were running keep their time; nothing is lost." and **Try again** (outline).

**Desk (not drawn):** [ASSUMPTION] `RegionRetry` in the main column under the header; the rail and day column stay.

## What the person can do

Try again (reloads the region).

## Words

"Today didn't load."; "Timers that were running keep their time; nothing is lost."; "Try again".

## The notes on the boards

**Notes · phone, Today (row 5, cont.) @ x 9158** — Error, Today didn't load

RegionRetry under the title, with Try again. Running timers keep their time, since they are events, not a ticking number (the Mason line).

## Rulings

- D-USE-57: "Today didn't load." with Try again.
- Timers are events ([timers across devices](../../../dev-notes/timers-across-devices.md)), so a failed load loses no time.

## Widths

Drawn at 402. Desk: [ASSUMPTION] above.

## Criteria

| ID                  | When               | Then                                                                                | Evidence                 |
| ------------------- | ------------------ | ----------------------------------------------------------------------------------- | ------------------------ |
| C-USE-today-error-1 | Today's read fails | RegionRetry with the words above; on success the clocks read as if nothing happened | `captures/error-402.png` |
