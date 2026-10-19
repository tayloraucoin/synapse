---
target: specs/web/ux/set-my-days/set-my-days/states/tap-a-time.md
status: approved
promoted:
boards:
  - name: "set-my-days / tap a time to add / 402 / light"
    page: "USE — set up"
    at: [964, 1260]
    note: "Frame @ x 964, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/tap-a-time-402.png
rulings: [D-USE-33, D-USE-34]
---

# Set my days — tap a time to add

Tapping empty rail marks the slot and opens the New block sheet at that time. `?state=tap-a-time`. The layout is [`../index.md`](../index.md)'s; the sheet that opens is [`../../new-block-sheet/states/from-a-tapped-time.md`](../../new-block-sheet/states/from-a-tapped-time.md). Its note is "Frame" at x 964, y 2190.

## What shows, top to bottom

- Header, chips (M 12 selected), bounds row as the day; "Saved" with a check.
- The column, afternoon (as [`event-own-block.md`](event-own-block.md)): Lunch 12:00 to 13:00; Work 13:00 to 15:00, "No work slotted yet"; the Dentist [placeholder] block 15:30 to 16:15, "Personal · this Monday only".
- **The marked slot** at 17:00: the rail's time tag "17:00" in an ink pill in place of the hour label, and a dashed ink outline across the column, "+ New block" (strong) over "17:00 to 18:00" (muted).
- The + at the bottom right.

## What the person can do

- **Tap empty rail:** the slot is marked and the New block sheet opens there (step 10; [`../../new-block-sheet/index.md`](../../new-block-sheet/index.md)), its start and end from the slot.
- Closing the sheet without adding clears the mark [ASSUMPTION].
- The + still opens its menu ([`plus-menu.md`](plus-menu.md)); its Block starts at the first free time instead.

## The slot's time

[ASSUMPTION] A tapped block starts at the hour or half hour tapped and runs to the next block or 1 h, whichever is sooner. Here 17:00 to 18:00. [ASSUMPTION] Tapping inside a block opens that block, not a new one; only empty rail adds.

## Words

"+ New block" · "<start> to <end>" · the time tag "<start>".

## The notes on the boards

**"set-my-days / tap a time to add / 402 / light"**, note "Frame" @ x 964, y 2190:

> Tap a time to add
>
> Tapping empty rail at 17:00 marks the slot (dashed ink, the time tag in the rail) and opens the New block sheet there (step 10). [ASSUMPTION] A tapped block starts at the hour or half hour tapped and runs to the next block or 1 h.

## Rulings

- D-USE-33: step 9 round 4 approved in full, tap a time among it. N2: tap an empty time, or the +; the New block sheet opens at the tapped time or at the first free time.
- D-USE-34: the New block sheet's form (kinds, Ends, Repeats).
- The frame draws the slot under the sheet's open; the sheet over it is drawn at `new-block / block with kind, from a tapped time / 402 / light` (carried by the New block sheet's state above).

## Widths

Drawn at: 402. Not drawn at: 1024 and wider (list-detail, D-USE-83) [ASSUMPTION: a click on empty rail in the day pane does the same].

## Criteria

| ID                             | When                                             | Then                                                                                             | Evidence                      |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------- |
| C-USE-set-my-days-tap-a-time-1 | Empty rail is tapped                             | The slot is marked (dashed ink, time tag in the rail) and the New block sheet opens at that time | `captures/tap-a-time-402.png` |
| C-USE-set-my-days-tap-a-time-2 | The tap is at 17:10 with the next block at 17:40 | The slot starts 17:00 and ends 17:40                                                             | test                          |
