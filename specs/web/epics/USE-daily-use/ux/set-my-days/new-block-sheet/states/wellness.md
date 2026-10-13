---
target: specs/web/ux/set-my-days/new-block-sheet/states/wellness.md
status: approved
promoted:
boards:
  - name: "new-block / wellness, from an empty day / 402 / light"
    page: "USE — set up"
    at: [0, 5040]
    note: "Frame @ x 0, y 5970"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/captures/wellness-402.png
rulings: [D-USE-34, D-USE-38, D-USE-79]
---

# New block sheet — Wellness, from an empty day

The empty usual Thursday's "or tap a time, or +" (`../../set-my-days/states/empty-day.md`), Wellness picked. Thursday, 21:10. `?sheet=new-block&state=wellness` [ASSUMPTION: the state param beside the sheet's].

## What shows, top to bottom

- Grabber; ×; scope line "Every Thursday" over "New block".
- **Kind:** Wellness (picked, leaf soft fill and edge), Training, Work, Break, then Evening on the second line: five kinds, as step 9 round 3 drew it.
- **Name:** the empty icon tile (a smiley outline) beside "Wellness", the kind's name.
- Hairline; **Starts** "7:05" (after Orient); **Length**, a `MinutesStepper` "− 1 h +" (N2's default).
- **Colour:** the leaf swatch, "Leaf, Wellness's colour".
- Hairline; **Checklist, no times**, off, with "Off: each item gets a length and a place on the rail."
- "Goes in after Orient, 7:05 to 8:05, and opens empty to add its items."
- "Add block", ink.

## What the person can do

- Pick another kind: the name, if untouched, and the colour follow.
- Type a name; tap the icon tile (the icon picker, `../../../interactions/icon-picker/index.md`).
- Change Starts or the length; tap Colour [ASSUMPTION: the `ColorSwatchRow` with D-USE-35's custom colour, not drawn]; flip Checklist (`checklist.md`).
- **Add block:** the block lands 7:05 to 8:05 and its Block view opens on "Nothing in Wellness yet." (`../../../day/block-view/states/empty.md`).

## Words

"Every Thursday" · "Goes in after Orient, 7:05 to 8:05, and opens empty to add its items."

## The notes on the boards

**"new-block / wellness, from an empty day / 402 / light"**, "Frame" @ x 0, y 5970:

> New · New block, Wellness
>
> Kind first; the name takes the kind's name until typed over; Starts at 7:05, after Orient; Length 1 h (N2's default); colour from the kind. "Checklist, no times" is shown off, with what off means. The line above Add says where it goes and what opens next.

## Rulings

- D-USE-34: step 10 round 1 approved the sheet with seven kinds and Ends. This frame is the earlier round (step 9 round 3, open-4): as built it shows the seven kinds of `todos-kind.md` and Ends in Length's place ("Ends 8:05", "1 h" beside it), with Repeats "Weekly on Thursday" from the usual week (D-USE-80's default). The frame is not edited.
- Life is yellow, To-dos moss (D-USE-38, D-USE-79).

## Widths

Drawn at: 402. At 1024 and wider: the same sheet in `ResponsiveSheet`'s right panel at `--sheet-w` (D-USE-39, D-USE-83).

## Criteria

| ID                               | When                        | Then                                                                    | Evidence                    |
| -------------------------------- | --------------------------- | ----------------------------------------------------------------------- | --------------------------- |
| C-USE-new-block-sheet-wellness-1 | New block from an empty day | Starts is 7:05, after Orient, 1 h long; the name is "Wellness"          | `captures/wellness-402.png` |
| C-USE-new-block-sheet-wellness-2 | Add block                   | Block view opens on "Nothing in Wellness yet." with the add row focused | test                        |
