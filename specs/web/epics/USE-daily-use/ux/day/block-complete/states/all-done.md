---
target: specs/web/ux/day/block-complete/states/all-done.md
status: approved
promoted:
boards:
  - name: "block-complete / all done (footer) / 402 / light"
    page: "USE — daily use"
    at: [0, 15240]
    note: "Frame @ x 0, y 16170"
    capture: specs/web/epics/USE-daily-use/ux/day/block-complete/captures/all-done-402.png
rulings: [D-USE-13, D-USE-25, D-USE-28, D-USE-30, D-USE-72]
---

# Block complete — all done (footer)

Now at 7:34: Wellness checked off in order, Cold bath last. `?state=all-done`. The intent pass's `success` key ("Wellness complete", "Next: Breakfast · 9:00", then "Work · 9:30", "Start Breakfast" on a card) is superseded: a fully checked block keeps its rows with a footer, and the card is for the not-done case (D-USE-28); the fixture puts Training next (D-USE-8).

## What shows, top to bottom

Phone 402 × 874, `--color-background`, 20 px side padding.

1. Status bar (7:34); "Now" with the avatar "T"; the To-dos tray closed, "Call the mechanic…".
2. **Block header:** the leaf (Wellness) bar at the leading edge, "Wellness" (title) over "7:05 to 8:00" (muted); the round ··· trailing.
3. **Rows,** each with a filled, checked `Checkbox` (muted fill, white check), the name receded (muted) and its length trailing (muted): "Pee and weigh" 2 min, "Water" 1 min, "Start the cold bath" 2 min, "Meditate" 10 min, "Cold bath" 10 min.
4. Under Cold bath: "Took 10 min · Change", Change underlined (D-USE-13; a plain Done records the plan).
5. Free space to the footer.
6. **Footer** on the fade (D-USE-25): a filled ink check and "Wellness complete" (semibold) leading; "Next: Training, 8:00" (muted) trailing; under it the full-width ink `Button` "Start Training".
7. `BottomNav`, Now selected.

## What the person can do

- "Start Training": Training becomes the active block on Now.
- "Change": the `MinutesStepper` for Cold bath (D-USE-13), for the few seconds the line shows.
- Uncheck a row: the block is no longer complete and the footer gives way [ASSUMPTION: as adding does, D-USE-72].
- Add to the block while it has time: "Add to Wellness" with "Free until 8:00", drawn on Now's `now / all done, add more / 402 / light` (`../../now/states/all-done-add-more.md`, cited); adding un-completes the block (D-USE-72). This frame does not draw the add row.
- ···: Now's header menu. The tray and the tabs as on Now.

## Words

"Wellness complete"; "Next: Training, 8:00"; "Start Training"; "Took 10 min · Change".

## The notes on the boards

**"block-complete / all done (footer) / 402 / light"**, note "Frame" @ x 0, y 16170:

> all done (footer, D-USE-28)
>
> Checked off in order, the block keeps its rows and the footer floats: "Wellness complete", "Next: Training, 8:00", Start Training. Training follows Wellness on Monday, so block-complete.md's "Next: Breakfast" example yields to the fixture. Took line now 10 min (a plain Done records the plan).

## Rulings

- D-USE-28: a fully checked block keeps its rows with this footer; the close card stays for the not-done case.
- D-USE-25: the footer floats over the content on a fade to the background token.
- D-USE-13: the last Done records the planned length; "Took 10 min · Change" shows a few seconds. Open-1 notes step 5's footer frame showed "Took 12 min · Change" after a plain Done; this frame corrects it to 10 min.
- D-USE-30, D-USE-72: a done block keeps an add row while it has time, and adding un-completes it (Now's frame).
- The same moment is drawn on Now as `now / all done, start next / 402 / light` (`../../now/states/all-done-start-next.md`, cited, not carried); its note's [ASSUMPTION] "Starting early just starts the block; its span doesn't move" stands (D-USE-72).

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                              | When                            | Then                                                                                                           | Evidence                    |
| ------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------- |
| C-USE-block-complete-all-done-1 | The last row is checked         | The rows stay, checked and faded; the footer shows "Wellness complete", "Next: Training, 8:00", Start Training | `captures/all-done-402.png` |
| C-USE-block-complete-all-done-2 | The last check was a plain Done | "Took 10 min" (the plan) shows with Change                                                                     | `captures/all-done-402.png` |
| C-USE-block-complete-all-done-3 | Any all-done block              | No close card shows                                                                                            | test                        |
