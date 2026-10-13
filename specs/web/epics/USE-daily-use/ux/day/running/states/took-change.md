---
target: specs/web/ux/day/running/states/took-change.md
status: approved
promoted:
boards:
  - name: "done / took 2 min, change / 402 / light"
    page: "USE — daily use"
    at: [1928, 13980]
    note: "Frame @ x 1928, y 14910"
    capture: specs/web/epics/USE-daily-use/ux/day/running/captures/took-change-402.png
rulings: [D-USE-13]
---

# Done — took 2 min, Change

A plain Done (no timer) on "Start the cold bath". `?state=took-change`. Replaces N4's time-taken chips ("Time taken", "As planned", "Other…") and the flat file's `time-chips` state (D-USE-13).

## What shows, top to bottom

Now at 7:14, as Now's lifted-card frame (`../../now/index.md`), except:

- "Start the cold bath" checked (box filled darker, as just checked; name in muted ink); on its right "Took 2 min ·" muted and "Change" underlined, semibold, ink.
- The lifted card has moved on to Meditate: icon tile, verdigris dot, "Meditate", meta "10 min · 7:10", Start (outline) and Done (ink).
- "Cold bath", unchecked, "10 min" and its grip. Tabs as ever.

## What the person can do

- **Change**: opens the time-taken sheet ([`time-taken-sheet.md`](time-taken-sheet.md)).
- Ignore it: after a few seconds the line fades to "2 min" (the row's usual length text) and the planned length stands as the time taken.
- Uncheck the row: the record is withdrawn [ASSUMPTION: done stays live both ways, as on Block view].
- A row's checkbox does the same as Done (D-USE-13).

## Words

"Took 2 min ·"; "Change"; faded, "2 min".

## The notes on the boards

**"done / took 2 min, change / 402 / light"**, note "Frame" @ x 1928, y 14910:

> took 2 min, change (D-USE-13)
>
> A Done with no timer records the planned length. For a few seconds the checked row reads "Took 2 min · Change"; ignored, it fades to "2 min" and the planned length stands.

## Rulings

- D-USE-13: Done stays one tap, with no menu; it records the planned length, and the row shows "Took 2 min · Change" for a few seconds; Change opens the `MinutesStepper`. Replaces N4's chips, where ignoring recorded nothing: now ignoring records the plan. Supersedes the flat file's "skipping is the default … nothing is recorded".
- How long "a few seconds" is: not on the boards or in the log. [ASSUMPTION: about six seconds, N4's chip time.]

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39). A work item's Done record ("Took <work time> · fired <firing time>"): `../../../dev-notes/timers-across-devices.md`, D-USE-48, cited.

## Criteria

| ID                          | When                          | Then                                                                     | Evidence                       |
| --------------------------- | ----------------------------- | ------------------------------------------------------------------------ | ------------------------------ |
| C-USE-running-took-change-1 | Done on an item with no timer | The planned length is recorded and the row reads "Took <n> min · Change" | `captures/took-change-402.png` |
| C-USE-running-took-change-2 | Change is ignored             | The line fades to "<n> min" and the record stays the planned length      | test                           |
