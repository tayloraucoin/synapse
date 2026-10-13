---
target: specs/web/ux/day/running/states/time-taken-sheet.md
status: approved
promoted:
boards:
  - name: "done / time-taken sheet / 402 / light"
    page: "USE — daily use"
    at: [2410, 13980]
    note: "Frame @ x 2410, y 14910"
    capture: specs/web/epics/USE-daily-use/ux/day/running/captures/time-taken-sheet-402.png
rulings: [D-USE-13]
---

# Done — the time-taken sheet

Change tapped on "Took 2 min · Change". `?state=time-taken-sheet`. Carries the flat file's `time-other` ("Other…") sheet, now opened by Change (D-USE-13).

## What shows, top to bottom

[`took-change.md`](took-change.md) dimmed under a scrim, and a bottom sheet over its lower third:

- Grab handle; × on the left.
- "Start the cold bath · planned 2 min" (small, muted); "Time taken" (heading).
- The `MinutesStepper`: a round − on the left, "2" large with "min" beside it over an underline (the typeable field), a round + on the right. It starts at the planned length.
- Save (ink, full width).

## What the person can do

- −, + or type a number of minutes; **Save** records it as the time taken and closes the sheet; the row then reads the new length [ASSUMPTION: "<n> min", coloured by the Done bands, `../../../dev-notes/over-by-how-much.md`].
- ×, a tap on the scrim or a swipe down: closes; the planned length stands.

## Words

"Start the cold bath · planned 2 min"; "Time taken"; "min"; "Save".

## The notes on the boards

**"done / time-taken sheet / 402 / light"**, note "Frame" @ x 2410, y 14910:

> time-taken sheet
>
> Change opens a small sheet: × on the left, the item and its planned length, "Time taken", a MinutesStepper starting at 2 that can also be typed, and Save.

## Rulings

- D-USE-13: Change opens the `MinutesStepper`. The "Other…" chip and its sheet (N4) are gone.
- × on the left, as every sheet in USE.
- The stepper's floor and step are not on the boards [ASSUMPTION: 1 min steps, floor 1 min].

## Widths

Drawn at: 402. Not drawn at: the desk, where `ResponsiveSheet` shows it as the right panel at `--sheet-w` (D-USE-39).

## Criteria

| ID                               | When                        | Then                                                                                       | Evidence                            |
| -------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------- |
| C-USE-running-time-taken-sheet-1 | Change                      | The sheet opens with the item, "planned <n> min", "Time taken" and the stepper at the plan | `captures/time-taken-sheet-402.png` |
| C-USE-running-time-taken-sheet-2 | A number is typed and saved | It is recorded as the time taken; × instead keeps the plan                                 | test                                |
| C-USE-running-time-taken-sheet-3 | The sheet opens             | Focus moves to the stepper's field; × or Esc returns focus to Change                       | test                                |
