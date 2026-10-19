---
target: specs/web/ux/day/running/states/timed-done.md
status: approved
promoted:
boards:
  - name: "done / after a timed Done / 402 / light"
    page: "USE — daily use"
    at: [2892, 13980]
    note: "Frame @ x 2892, y 14910"
    capture: specs/web/epics/USE-daily-use/ux/day/running/captures/timed-done-402.png
rulings: [D-USE-13, D-USE-29, D-USE-72]
---

# Done — after a timed Done

Done pressed on Meditate's running card. `?state=timed-done`.

## What shows, top to bottom

Now at 7:26, as Now's lifted-card frame (`../../now/index.md`), except:

- Meditate checked in its place in the list, faded name; on the right "12 min" in figure weight (semibold, ink), no chip and no Change.
- Cold bath lifts: icon tile ([placeholder]: Meditate's icon until step 11), verdigris dot, "Cold bath", meta "10 min · 7:26", Start and Done.
- Nothing below it in Wellness. Tabs as ever.

## What the person can do

- Start or Done on Cold bath.
- Uncheck Meditate [ASSUMPTION: as any checked row; the record is withdrawn].
- The time taken is not changed from here: a timed Done has no Change (dev note).

## Words

"12 min"; "10 min · 7:26".

## The notes on the boards

**"done / after a timed Done / 402 / light"**, note "Frame" @ x 2892, y 14910:

> after a timed Done
>
> Done on the running card stops the timer and checks Meditate; the row shows "12 min" in figure weight, no chip. Cold bath lifts. [placeholder] Cold bath keeps Meditate's icon until step 11.

## Rulings

- N4 "Done, with time taken": after a timed Done the row shows the time in `figure`, no chip. D-USE-13: no Change on a timed Done.
- D-USE-29: a timed Done is coloured by percent over the plan. This frame predates it: 12 of 10 is 20% over, so under D-USE-29 the row reads warning, "12 min of 10", as [`timed-over-warning.md`](timed-over-warning.md) draws. This frame stands for the row's form and for a Done in the ink band (up to 11 min for a 10-min item).
- D-USE-72: Done on a Running row shows its time a moment, then the row leaves Running for its tier (Decided (D-USE-72); [`done-on-a-running-row.md`](done-on-a-running-row.md)).

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                         | When                                  | Then                                                                                               | Evidence                      |
| -------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------- |
| C-USE-running-timed-done-1 | Done on the running card              | The timer stops, the row shows the time taken in figure weight with no Change, the next item lifts | `captures/timed-done-402.png` |
| C-USE-running-timed-done-2 | The time taken is within the ink band | The row reads "<n> min" in ink                                                                     | test                          |
