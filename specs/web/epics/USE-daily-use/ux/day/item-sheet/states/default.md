---
target: specs/web/ux/day/item-sheet/states/default.md
status: approved
promoted:
boards:
  - name: "item-sheet / default / 402 / light"
    page: "USE — set up"
    at: [0, 6300]
    note: "Frame @ x 0, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/default-402.png
rulings: [D-USE-24, D-USE-37, D-USE-60, D-USE-103]
---

# Item sheet — default

A plain item (Meditate, in Wellness) opened from its bullet on Review the day at 6:58. `?state=default`.

## What shows, top to bottom

- Behind the scrim, Review the day stays visible: "‹ Orient", "Monday, 12 October", the To-dos strip ("Call the mechanic…"), the 7 o'clock line with "Orient · 5 min" and the Wellness and Training blocks.
- The sheet rises from about mid-screen (top at y 405 of 874), grabber centred.
- Header: × left; "Swap" (outlined, pill) and ··· (round, muted fill) right.
- Scope line: "Wellness, 7:05 to 8:00 · today only".
- Title row: the icon tile (the meditating emoji on Wellness's pale green, rounded square, 44 px) and "Meditate".
- Length: label left, `MinutesStepper` right in a bordered box: "− 10 min +".
- At a set time: label with the sub-line "Off: follows Start the cold bath, at 7:12"; the `Switch` off on the right.
- Notes (optional): label, then a `Textarea` with "A word for later [placeholder]".
- Footer line, muted: "Changes save as they're made, for today. Monday's usual is unchanged."
- No primary button.

## What the person can do

- The icon tile opens the icon picker (`../../../interactions/icon-picker/`). Swap opens `swap.md`. ··· opens `more-open.md`.
- − and + change the length in 5-minute steps [ASSUMPTION: the step; the boards show 10 min only]; the items after it move.
- The switch turns on `at-a-set-time.md`. Notes take free text; each change saves as made.
- × or a drag down closes.

## Words

As the surface's Words (`../words-and-access.md`); this state adds none.

## The notes on the boards

**item-sheet / default / 402 / light** (Frame @ x 0, y 7230):

> Default
>
> A plain item from a bullet on Review the day. Edits in place, no Edit mode: the icon tile opens the picker, then Length, At a set time, Notes. [PROPOSED] Swap is a header text button beside ··· (D-USE-24), since swapping is the morning's most common edit. [ASSUMPTION] Size and tier show on work items only. No primary: changes save as made, today only.

## Rulings

- D-USE-24: Swap is a header text button beside ···.
- D-USE-37: step 11 rounds 1 to 3 approved as drawn, [PROPOSED] and [ASSUMPTION] marks standing.
- D-USE-60: the sheet as drawn, including Description as one field with Notes (on a linked item, `linear-linked.md`).
- Superseded, not specced: step 4's `item-sheet / default, before Swap / 402 / light` ("USE — daily use", Archive 1, x 3856, y 22800), where Swap led the sheet as an outlined button under the scope line and Length, At a set time and Icon followed; redrawn here at step 11 (D-USE-37). Its note read: "Tap the Workout: gym bullet on Review the day. The sheet names the block and its span, then the item. Swap leads as an outlined button, since it's the morning's usual edit; Length, At a set time and Icon follow. The rest of the sheet is step 11. × closes, top left."

## Widths

Drawn at: 402. Not drawn at: 1024, 1440, 1728: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms, D-USE-60).

## Criteria

| ID                         | When                                 | Then                                                                                                                 | Evidence                   |
| -------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-item-sheet-default-1 | A bullet on Review the day is tapped | The sheet opens with the scope line, the icon and name, Length, At a set time, Notes and the footer line; no primary | `captures/default-402.png` |
| C-USE-item-sheet-default-2 | Length changes                       | The new length saves for today and the items after it move; Monday's usual is unchanged                              | manual                     |
