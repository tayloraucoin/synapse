---
target: specs/web/ux/day/now/states/error-on-check.md
status: approved
promoted:
boards:
  - name: "now / error on check / 402 / light"
    page: "USE — daily use"
    at: [3374, 11460]
    note: "Frame @ x 3374, y 12390"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/error-on-check-402.png
rulings: [D-USE-56, D-USE-72]
---

# Now — error on check

A check that does not save, online, mid-Wellness at 7:14. The surface is [`../index.md`](../index.md). The To-dos tray uses the same pattern for its own checks ([`../../todos/states/error.md`](../../todos/states/error.md)). `?state=error-on-check`.

## What shows, top to bottom

- As [`success.md`](success.md): the header, the tray closed, Wellness with its done rows and the lifted Meditate card.
- **The row that failed**, "Cold bath" 10 min with its grip: the box back to empty.
- Under it, indented to the name: **"Not saved."** (ink) and **"Try again"** (ink, underlined). No red, no icon, no Toaster.
- The tab bar: Now (selected), Schedule, Review.

## What the person can do

- **Try again** sends the check again; on success the box checks and the line goes [ASSUMPTION: the row then fades as a done row].
- Re-checking the box does the same [ASSUMPTION].
- Everything else stays live.
- Done on the lifted card failing is not drawn [ASSUMPTION: the card stays lifted and the same line sits under its buttons].

## Words

"Not saved." · "Try again".

## The notes on the boards

**"now / error on check / 402 / light"**, "Frame" @ x 3374, y 12390:

> error on check
>
> A check that doesn't save: the box reverts and a line under the row reads "Not saved. Try again.", Try again underlined, in ink. Never red.

## Rulings

- N4 and the intent pass (the flat `day/now.md`, deleted once folded, States: error on check): the box reverts, with an inline "Not saved. Try again."
- Offline is not an error: a check offline saves on the phone ([`offline.md`](offline.md), D-USE-56). This state is a save that fails online.
- D-USE-72: step 5's drawn marks stand.
- Product rules: nothing red on the tabs; the line is ink.

## Widths

Drawn at: 402. At the desk: as the phone, in the capped column (D-USE-39 (1)).

## Criteria

| ID                         | When                  | Then                                                                              | Evidence                          |
| -------------------------- | --------------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| C-USE-now-error-on-check-1 | A check fails to save | The box reverts and "Not saved. Try again." sits under the row, in ink, never red | `captures/error-on-check-402.png` |
| C-USE-now-error-on-check-2 | Try again succeeds    | The row checks and the line goes                                                  | test                              |
