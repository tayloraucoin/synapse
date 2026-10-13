---
target: specs/web/ux/day/running/states/paused.md
status: approved
promoted:
boards:
  - name: "running / paused, pulsing / 402 / light"
    page: "USE — daily use"
    at: [1446, 13980]
    note: "Frame @ x 1446, y 14910"
    capture: specs/web/epics/USE-daily-use/ux/day/running/captures/paused-402.png
rulings: [D-USE-29, D-USE-72]
---

# Running — paused, pulsing

Pause pressed on the running card. `?state=paused`. Supersedes round 1's `running / paused / 402 / light` (Archive 3, x 482), which held the figure still.

## What shows, top to bottom

As [`counting-down.md`](counting-down.md) at 7:22, except the card:

- Meta "Paused · started 7:14".
- The figure "4:10" in muted ink, drawn mid-pulse at 40%, "of 10 min" beside it. It pulses between 100% and 40% over 2 s, the only motion on Now.
- Resume (outline) in Pause's place; Done unchanged.

## What the person can do

- **Resume**: the count runs again from 4:10 ([`counting-down.md`](counting-down.md)).
- **Done**: records the time worked (start time minus the paused span) and checks the item.

## Words

"Paused · started 7:14"; "4:10"; "of 10 min"; "Resume"; "Done".

## The notes on the boards

**"running / paused, pulsing / 402 / light"**, note "Frame" @ x 1446, y 14910:

> paused, pulsing (decided: yes)
>
> The held figure pulses slowly, like a stopwatch's paused digits: one quiet thing moving says "this is held, not running" at a glance. Drawn mid-pulse at 40%. No pulse under reduced motion.

## Rulings

- D-USE-29: paused figures pulse slowly (100% to 40%, 2 s); held under reduced motion (at 60%, `../../../dev-notes/over-by-how-much.md`).
- D-USE-72: Decided (D-USE-72), the paused figure holds as the number ("4:10") and pulses, with "Paused · started 7:14" and Resume in Pause's place. Replaces N4's sentence "Paused at 4:10" (and the flat file's paused row).
- Round 1's still figure (Archive 3, x 482) is superseded by this frame (D-USE-29, D-USE-72).

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39). A paused work item and Step away: `../../../work/today/states/paused.md`, `../../../interactions/step-away.md`, cited.

## Criteria

| ID                     | When                   | Then                                                                                          | Evidence                  |
| ---------------------- | ---------------------- | --------------------------------------------------------------------------------------------- | ------------------------- |
| C-USE-running-paused-1 | Pause                  | The figure holds in muted ink, "Paused · started <time>" in the meta, Resume in Pause's place | `captures/paused-402.png` |
| C-USE-running-paused-2 | Paused, motion allowed | The figure pulses 100% to 40% over 2 s; nothing else on Now moves                             | manual                    |
| C-USE-running-paused-3 | Paused, reduced motion | The figure holds at 60%                                                                       | test                      |
