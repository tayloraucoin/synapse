---
target: specs/web/ux/interactions/copy-from/states/copied-undo.md
status: approved
promoted:
boards:
  - name: "set-my-days / copied, Undo / 402 / light"
    page: "USE — set up"
    at: [2892, 1260]
    note: "Note · grid, 80 @ x 2892, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/interactions/copy-from/captures/copied-undo-402.png
rulings: [D-USE-32, D-USE-39, D-USE-87]
---

# Copy from — copied, with Undo

Step 3 of [`../index.md`](../index.md): after Replace in [`replace-confirm.md`](replace-confirm.md), or at once on an empty day. `?state=copied-undo`.

## What shows, top to bottom

- "Every Thursday" with "Saved", the chips (Thursday ink), Up at 7:00, Lights out 22:30 and the ···, as before.
- The column now holds Monday's blocks: Orient · 5 min; Wellness 7:05 to 8:00 ("Pee and weigh", "Water", "Start the cold bath", "+2 more"); Training 8:00 to 8:57 ("Drive to the YMCA" and "Drive home" in italic, the transitions, and "Workout: gym"); Breakfast 9:00 to 9:30 as a dashed band with the fork and knife; Work 9:30 to 12:00, "Work goes in on This week.", fading under the toast.
- Over the foot of the column, on the fade, above the +: a `Toaster`, ink with paper text, "Thursday copied from Monday" on the left and "Undo", underlined, on the right.

## What the person can do

- **Undo**: Thursday's own Wellness and Work return as they were; the toast closes.
- Ignore it: the toast leaves on its own; the copy stands [ASSUMPTION: the house `Toaster`'s default, as `../../move-to/states/moved-undo.md`].
- Everything in the day stays live under the toast; tapping a block opens it.

## Words

"<Day> copied from <Day>" · "Undo" · "Work goes in on This week." (a copied Work block in the usual week, as every usual Work block reads).

## The notes on the boards

**set-my-days / copied, Undo / 402 / light** (Note · grid, 80 @ x 2892, y 2190):

> Copied, with Undo
>
> Thursday now holds Monday's blocks; the work blocks say "Work goes in on This week." A Toaster floats on the fade above the +: "Thursday copied from Monday" with Undo, which restores Thursday's Wellness and Work as they were.

## Rulings

- D-USE-32: the Toaster with Undo, which restores the day as it was.
- Slotted work in a This week copy: Decided (D-USE-87) in [`../index.md`](../index.md) › Rules.

## Widths

Drawn at: 402. From 1024 the toast sits at the foot of the detail column (D-USE-39).

## Access

The toast is announced politely ("Thursday copied from Monday"); Undo is reachable by Tab while it shows, named "Undo copy" [PROPOSED], at least 44 × 44; it does not time out while focused [ASSUMPTION].

## Criteria

| ID                            | When                               | Then                                                                          | Evidence                       |
| ----------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| C-USE-copy-from-copied-undo-1 | Replace, or a copy on an empty day | The day holds the picked day's blocks and the toast names both days with Undo | `captures/copied-undo-402.png` |
| C-USE-copy-from-copied-undo-2 | Undo                               | The day's own blocks and items are back; the toast closes                     | test                           |
