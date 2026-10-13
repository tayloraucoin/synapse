---
target: specs/web/ux/day/now/states/ahead.md
status: approved
promoted:
boards:
  - name: "now / ahead of the plan / 402 / light"
    page: "USE — daily use"
    at: [4338, 10200]
    note: "Note · now / ahead of the plan"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/ahead-402.png
rulings: [D-USE-28, D-USE-72]
---

# Now — ahead of the plan

Wellness done at 7:34, planned to 8:00. `?state=ahead`. Its note is "Note · now / ahead of the plan" at x 4338, y 11130. Drawn in the 2026-10-10 audit to close open-7's gap (Now's "ahead of the plan").

## What shows, top to bottom

As [`all-done-start-next.md`](all-done-start-next.md), status bar 7:34, with:

- Every row faded and checked; "Took 10 min · Change" under Cold bath.
- **The footer**, taller: "Wellness complete" with the check circle and "Next: Training, 8:00"; then one quiet line (label, muted, two lines): "Done before 8:00. Starting early is fine: Training keeps its end, 8:57."; then **Start Training** (primary, ink, full width); then "Or a to-do until 8:00" (label, medium, underlined, centred).

## What the person can do

- **Start Training:** Training starts now and keeps its end, 8:57 (D-USE-72).
- **Or a to-do until 8:00:** opens the tray to fill the gap (`../../todos/states/open.md`).
- Closing the card leaves Now on Training's start [ASSUMPTION: "closing" is the footer leaving once Training starts or 8:00 passes].

## Words

"Done before <block end>. Starting early is fine: <next> keeps its end, <time>." · "Or a to-do until <block end>". No minutes-ahead count (no numbers about the day).

## The notes on the boards

**"now / ahead of the plan / 402 / light"**, "Note · now / ahead of the plan" @ x 4338, y 11130:

> now / ahead of the plan (now.md ahead)
>
> Step 7's close card, at 7:34 in a block planned to 8:00. [PROPOSED] One quiet line says what starting early does: "Done before 8:00. Starting early is fine: Training keeps its end, 8:57." No minutes-ahead count (no numbers about the day). [PROPOSED] "Or a to-do until 8:00" opens the tray to fill the gap. Closing the card leaves Now on Training's start.

## Rulings

- Decided (D-USE-72): the line and the to-do link stand as drawn.
- N4's "ahead of the plan" row ("the close card shows") is replaced by this frame: with everything done, the all-done footer of D-USE-28 carries the line; the close card stays for the not-done case (`../../block-complete/index.md`). The note still calls it "step 7's close card".

## Widths

Drawn at: 402. Wider: the index's Platforms.

## Criteria

| ID                | When                            | Then                                                                                                          | Evidence                 |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------ |
| C-USE-now-ahead-1 | A block finished before its end | The footer adds "Done before <end>. Starting early is fine: …" and "Or a to-do until <end>"; no minutes count | `captures/ahead-402.png` |
| C-USE-now-ahead-2 | Or a to-do until <end>          | The tray opens                                                                                                | test                     |
