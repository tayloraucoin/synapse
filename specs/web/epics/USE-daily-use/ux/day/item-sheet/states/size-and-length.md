---
target: specs/web/ux/day/item-sheet/states/size-and-length.md
status: approved
promoted:
boards:
  - name: "now-work / item view, size and length range / 402 / light"
    page: "USE — daily use"
    at: [2410, 17760]
    note: "Frame @ x 2410, y 18690"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/size-and-length-402.png
rulings:
  [
    D-USE-35,
    D-USE-36,
    D-USE-38,
    D-USE-42,
    D-USE-54,
    D-USE-65,
    D-USE-77,
    D-USE-103,
  ]
---

# Item sheet — size and length range

A linked work item's sheet opened from its row on Now at 10:20, in the Work block: Size as Linear's points with a word each, and the length range it sets. `?state=size-and-length`. The fields' layout is [`linear-linked.md`](linear-linked.md)'s; this file names what the frame adds or differs in. The rules: [`../../../dev-notes/size-and-length.md`](../../../dev-notes/size-and-length.md).

## What shows, top to bottom

- Behind the scrim, Now as [`../../../work/today/states/waiting.md`](../../../work/today/states/waiting.md) draws it.
- The sheet at near full height (818 px), grabber; × left, ··· right. Scope line "Work, 9:30 to 12:00 · Primary". The sky tile with 🔄 and "[Fix the sync retry]". The Linear line: the In progress chip (yellow, part filled, D-USE-35), "ENG-123", "Sync engine", "Linear ↗".
- **Size**, muted right "Linear's estimate, both ways"; five cards "1 Quick", "2 Small", "3 Medium" (selected: surface fill, 1.5 px ink edge, word bold), "5 Large", "8 Huge".
- **Length**, `SegmentedControl` "Exact" / "Range" (Range); "− 1 h +" "to" "− 2 h +"; helper "Set from Medium; change it freely. The day plans with 2 h, the top of the range."
- **Tier**, the coloured `SegmentedControl`: Urgent (red-500 square), Primary (leaf, selected), Secondary (amber), Stretch (sky square).
- **When** "Today, Work 9:30 ›".
- **Description**, a box with the canvas pointer "Synced with Linear (round 3, D-USE-36)".
- Footer pair over a fade: **Start** (outlined) and **Done** (filled).

## What the person can do

- A size card sets Linear's estimate (written to Linear) and resets the range from that size; the steppers then change it freely. Exact shows one stepper ("− 45 min +", as `../../../interactions/linear-status/states/change-status.md` draws it).
- Start makes the running card; Done checks it and moves the issue to Done (`../../../interactions/linear-status/index.md`).
- The rest as `linear-linked.md`.

## Words

"Linear's estimate, both ways"; "Quick", "Small", "Medium", "Large", "Huge"; "Exact", "Range"; "Set from <Size>; change it freely. The day plans with <top>, the top of the range."

## The notes on the boards

**now-work / item view, size and length range / 402 / light** (Frame @ x 2410, y 18690):

> item view, size and length range [PROPOSED]
>
> Size is Linear's points with a word each: Quick, Small, Medium, Large, Huge, synced both ways. It sets a length range (Medium: 1 to 2 h), editable as Exact or Range; the day plans with the top. Tier carries its colour.

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- D-USE-38: Stretch's square is slate, not the sky drawn here [PROPOSED until Taylor's look].
- D-USE-65: the Linear card from Now gives way to Linear linked's layout, so When is dropped for the scope line (`linear-linked.md`) and the Description box shows the issue's text (D-USE-36, one value with Notes); the pointer text is not shipped.
- D-USE-54: Size is also on New task, the same five words (`../../../interactions/add/index.md`). D-USE-42: the size chip on rows ("3 Medium").
- On Now and Today the footer is Start and Done; a session's Done reads "Done for today" (`tier-and-sessions.md`).

## Widths

Drawn at: 402. The desk: Decided (D-USE-103; D-USE-60 (3), kept by D-USE-65): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                                 | When                           | Then                                                                       | Evidence                           |
| ---------------------------------- | ------------------------------ | -------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-item-sheet-size-and-length-1 | Medium is picked               | Linear's estimate is 3; the range reads 1 h to 2 h; the day plans with 2 h | `captures/size-and-length-402.png` |
| C-USE-item-sheet-size-and-length-2 | The estimate changes in Linear | Size follows here (synced both ways)                                       | manual                             |
