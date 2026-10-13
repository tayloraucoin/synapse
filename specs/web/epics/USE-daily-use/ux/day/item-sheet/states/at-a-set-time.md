---
target: specs/web/ux/day/item-sheet/states/at-a-set-time.md
status: approved
promoted:
boards:
  - name: "item-sheet / at a set time, on / 402 / light"
    page: "USE — set up"
    at: [964, 6300]
    note: "Frame @ x 964, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/at-a-set-time-402.png
rulings: [D-USE-37, D-USE-65, D-USE-103]
---

# Item sheet — at a set time, on

The default sheet with the "At a set time" switch on. `?state=at-a-set-time`.

## What shows, top to bottom

- As `default.md`, the sheet taller by one row (top at y 349).
- At a set time: the sub-line now reads "Stays at its time; the items around it move"; the `Switch` is on (ink).
- A new **Time** row, 56 px: "Time" on the left; on the right a muted "Ends 7:30" then a `TimeField` showing "7:20" in an outlined box (ink edge, focused).
- Notes (optional) and the footer line follow as in `default.md`.

## What the person can do

- Set the time in the `TimeField`; "Ends <time>" follows the time plus the length.
- Turn the switch off: the Time row goes and the item follows the item before it again ("Off: follows <item>, at <time>").
- Changes save as made, for today only.

## Words

"Stays at its time; the items around it move"; "Time"; "Ends <time>".

## The notes on the boards

**item-sheet / at a set time, on / 402 / light** (Frame @ x 964, y 7230):

> At a set time, on
>
> The switch brings a Time row (56 px, TimeField) with where it ends. Off, the line says what it follows and when it lands.

## Rulings

- D-USE-37: step 11 approved as drawn.
- N2: "Pinned time. A `Switch`, 'At a set time', with a `TimeField`."
- A pinned time that falls outside its block (before its start or past its end), where the boards are silent: the item keeps its time and the block shows it past its end as information, as N2's "Runs 12 min past 8:57" line in the Block view (D-USE-65).

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                               | When                | Then                                                                   | Evidence                         |
| -------------------------------- | ------------------- | ---------------------------------------------------------------------- | -------------------------------- |
| C-USE-item-sheet-at-a-set-time-1 | The switch turns on | A 56 px Time row with a `TimeField` and "Ends <time>" appears under it | `captures/at-a-set-time-402.png` |
| C-USE-item-sheet-at-a-set-time-2 | The time is set     | The item stays at that time and the items around it move               | manual                           |
