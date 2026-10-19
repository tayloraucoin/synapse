---
target: specs/web/ux/day/running/states/counting-down.md
status: approved
promoted:
boards:
  - name: "running / counting down / 402 / light"
    page: "USE — daily use"
    at: [0, 13980]
    note: "Frame @ x 0, y 14910"
    capture: specs/web/epics/USE-daily-use/ux/day/running/captures/counting-down-402.png
rulings: [D-USE-27, D-USE-29, D-USE-39, D-USE-72]
---

# Running — counting down

Start pressed on Meditate's lifted card. `?state=counting-down`. The default state of the running card.

## What shows, top to bottom

As Now's lifted-card frame (`../../now/index.md`, cited), at 7:16, except the card:

- Status bar "7:16"; header "Now" with the avatar "T"; the To-dos tray closed, "To-dos · Call the mechanic…" with its chevron (`../../todos/`, cited).
- Wellness header (leaf colour bar, "Wellness", "7:05 to 8:00", round ···); checked rows Pee and weigh (2 min), Water (1 min), Start the cold bath (2 min), faded.
- **The running card** (hairline border, radius, surface): the item's icon tile (tinted leaf square, person glyph), the verdigris dot and "Meditate" (semibold), meta "Started 7:14" under it; the figure "7:42" large in `figure` weight, ink, with "of 10 min" beside it on the baseline, muted; then Pause (outline, left half) and Done (ink fill, right half).
- Below: "Cold bath", unchecked, "10 min" and its grip. Nothing else on Now moves.
- `BottomNav`: Now (selected), Schedule, Review.

## What the person can do

- **Done**: stops the timer, checks Meditate, records the time taken, and the next item lifts ([`timed-done.md`](timed-done.md)).
- **Pause**: holds the figure ([`paused.md`](paused.md)).
- Leave the app: the count does not stop; it is time-based, not ticking in the background (N4).
- Start another item: this one keeps running; the other becomes a row under "Running" or the card (D-USE-27; [`several-running.md`](several-running.md), [`running-row-focused.md`](running-row-focused.md)). For a work item, one is in hand at a time ([`../../../interactions/start-while-one-runs.md`](../../../interactions/start-while-one-runs.md), D-USE-43).
- Past the plan: [`over-under-a-minute.md`](over-under-a-minute.md), then [`over-a-minute-or-more.md`](over-a-minute-or-more.md).

## Words

"Started 7:14"; "7:42"; "of 10 min"; "Pause"; "Done".

## The notes on the boards

**"running / counting down / 402 / light"**, note "Frame" @ x 0, y 14910:

> running / counting down
>
> Start turns the lifted card into the running card: the figure counts down from 10:00 with "of 10 min" beside it, Start becomes Pause, and the meta line reads "Started 7:14". Nothing else on Now moves.

## Rulings

- N4 "Running": a countdown from the planned length, "of 10 min", Pause and Done. N4 drew "of 10 min" under the figure; the board puts it beside it on the baseline, and the board stands.
- D-USE-27: several items can run at once; starting one never pauses another.
- D-USE-29: a running item sits only under Running, with its tier in the meta line (on rows; the card's meta line is "Started 7:14").
- D-USE-72: Running rows count down like the card (Decided (D-USE-72)); offline the count runs and Start, Pause and Done queue like any check (Decided (D-USE-72)).

## Widths

Drawn at: 402. Not drawn at: 1024 and 1440, where the running card scales up from this frame (D-USE-39). The desk's work clock is `../../../work/today/states/running.md`, cited.

## Criteria

| ID                            | When                           | Then                                                                                                                          | Evidence                         |
| ----------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-running-counting-down-1 | Start on the lifted card       | The card counts down from the planned length with "of 10 min" beside it, Pause in Start's place, "Started <time>" in the meta | `captures/counting-down-402.png` |
| C-USE-running-counting-down-2 | The app is closed and reopened | The figure reads start time minus paused spans, not where it stopped                                                          | test                             |
| C-USE-running-counting-down-3 | A timer starts                 | Nothing else on Now moves                                                                                                     | `captures/counting-down-402.png` |
