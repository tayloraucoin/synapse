---
target: specs/web/ux/interactions/copy-from/states/replace-confirm.md
status: approved
promoted:
boards:
  - name: "set-my-days / replace confirm / 402 / light"
    page: "USE — set up"
    at: [2410, 1260]
    note: "Note · name only, 96 @ x 2410, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/interactions/copy-from/captures/replace-confirm-402.png
rulings: [D-USE-32, D-USE-33]
---

# Copy from — Replace confirm

Step 2 of [`../index.md`](../index.md): Monday tapped in [`copy-picker.md`](copy-picker.md) while the usual Thursday has blocks. The picker has closed; one ask. `?state=replace-confirm`.

## What shows, top to bottom

- Behind, under a scrim: "Every Thursday" with its own blocks: Orient · 5 min, Wellness 7:05 to 8:00 ("Pee and weigh", "Water"), and a Work block from 9:30 reading "Work goes in on This week."; the + bottom right.
- A centred `AlertDialog`, radius as the sheet's: "Replace Thursday with Monday?" (heading), then "Thursday's Wellness and Work go, and Monday's blocks take their place. This week's Thursday follows." Under it, right-aligned, "Cancel" (outline) and "Replace", the one primary, in ink.

## What the person can do

- **Replace**: Thursday takes Monday's blocks; the dialog closes on [`copied-undo.md`](copied-undo.md).
- **Cancel** or Esc: the dialog closes; Thursday is unchanged and the picker does not reopen [ASSUMPTION].

## Words

"Replace <Day> with <Day>?" · "<Day>'s <its blocks named> go, and <Day>'s blocks take their place." · "This week's <Day> follows." (usual week only) · "Cancel" · "Replace". In This week the dated form [ASSUMPTION: "Replace Thursday, 15 October with Monday?", with no follows line].

## The notes on the boards

**set-my-days / replace confirm / 402 / light** (Note · name only, 96 @ x 2410, y 2190):

> Replace confirm
>
> Asked only because Thursday has blocks (round 1: an empty day copies at once). Names what goes. Replace is the one primary, in ink. [ASSUMPTION] "This week's Thursday follows": a usual-week change reaches this week's days not yet started, except blocks already changed on that date.

## Rulings

- D-USE-32: Replace asks only when the day has blocks, naming what goes.
- D-USE-33: a usual-week change names its reach; the [ASSUMPTION] in the note (days not yet started, blocks changed on that date kept) stands as drawn, as in [`../../../set-my-days/set-my-days/states/usual-change-reaches.md`](../../../set-my-days/set-my-days/states/usual-change-reaches.md).
- Replace is ink, never red: the product rules allow nothing red, and Undo follows.

## Widths

Drawn at: 402. At 1024 and up the same `AlertDialog`, centred over the page (D-USE-39).

## Access

`AlertDialog`: the heading is its name, the body its description; focus starts on Cancel [ASSUMPTION], traps inside, and returns to the picker's ··· on close. Buttons at least 44 high.

## Criteria

| ID                                | When                      | Then                                                                                  | Evidence                           |
| --------------------------------- | ------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-copy-from-replace-confirm-1 | A built day takes another | The ask names the blocks that go and, in the usual week, that this week's day follows | `captures/replace-confirm-402.png` |
| C-USE-copy-from-replace-confirm-2 | Cancel                    | The day is unchanged                                                                  | test                               |
