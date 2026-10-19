---
target: specs/web/ux/day/running/states/done-on-a-running-row.md
status: approved
promoted:
boards:
  - name: "now-work / done on a running row / 402 / light"
    page: "USE — daily use"
    at: [0, 19020]
    note: "Frame @ x 0, y 19950"
    capture: specs/web/epics/USE-daily-use/ux/day/running/captures/done-on-a-running-row-402.png
rulings:
  [
    D-USE-13,
    D-USE-27,
    D-USE-29,
    D-USE-39,
    D-USE-43,
    D-USE-44,
    D-USE-49,
    D-USE-72,
    D-USE-74,
    D-USE-76,
  ]
---

# Running — Done on a Running row

The box on "[Agent: ENG-123 tests]" pressed in [`several-running.md`](several-running.md). `?state=done-on-a-running-row`.

## What shows, top to bottom

As [`several-running.md`](several-running.md) at 10:20 (the card "[Write the sync spec]" at "18:20 of 45 min", the row "[Agent: refactor the sync queue]" at "Running · 12:04 of 30 min"), except the last row:

- "[Agent: ENG-123 tests]" settles in muted ink: no ring (its slot kept empty), the title muted, the meta "Done · 34 min", no Pause button (its slot kept empty), and the box filled in muted ink with a light check.
- A moment later the row leaves Running for its place (Rulings); the two other timers keep going.

## What the person can do

- Nothing on the settled row while it shows; it leaves on its own. Unchecking it afterwards is as any checked row [ASSUMPTION, as in [`timed-done.md`](timed-done.md)].
- The time taken is not changed here: a timed Done has no Change (D-USE-13).
- The card and the other row carry on.

## Words

"Done · <n> min"; past the ink band "Done · <n> min of <plan>" ([`done-well-over.md`](done-well-over.md)).

## The notes on the boards

**now-work / done on a running row / 402 / light** (Frame @ x 0, y 19950):

> done on a running row
>
> A Running row's box is its Done: the row settles in muted ink with "Done · 34 min" (the time taken, no Change), then leaves Running for its tier [ASSUMPTION]. The other timers keep going.

## Rulings

- D-USE-76: the frame is carried as a non-work block's Running rows; inside a Work block firing in place replaces it.
- **Where this state lives (lead's ruling).** The Running rows of non-work blocks (D-USE-27; D-USE-72). Inside a Work block D-USE-43, D-USE-44 and D-USE-49 replace them: Done on the item in hand records "Took … · fired …" on its row in its tier ([`../../../work/today/states/brought-back.md`](../../../work/today/states/brought-back.md), D-USE-48); there is no Running group to leave. "The tiers below are placeholders until step 8." In a non-work block "leaves Running for its tier" means it returns to its place in the block's list, checked.
- D-USE-72: the note's [ASSUMPTION] is Decided (D-USE-72): Done on a Running row shows its time a moment, then the row leaves Running.
- D-USE-29 and D-USE-72: a timed Done is coloured by percent over its plan. This item's plan is 30 min (`done-well-over.md` names it), so 34 min is 13% over: the frame draws "Done · 34 min" in muted ink; D-USE-29 makes it warning, "Done · 34 min of 30" (for 30 min: ink to 33, warning 34 to 37, danger 38 on; [`../../../dev-notes/over-by-how-much.md`](../../../dev-notes/over-by-how-much.md)). The frame stands for the row's form and for a Done in the ink band.
- How long "a moment" lasts is not on the boards [ASSUMPTION: as long as "Took 2 min · Change" shows, [`took-change.md`](took-change.md)].

## Widths

Drawn at: 402. At 1024 and up it scales up (D-USE-39), in the Block panel for a non-work block (D-USE-74).

## Criteria

| ID                                    | When                      | Then                                                                                        | Evidence                                 |
| ------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| C-USE-running-done-on-a-running-row-1 | The box on a Running row  | That timer stops, the row settles muted with "Done · <n> min", no Change; the others run on | `captures/done-on-a-running-row-402.png` |
| C-USE-running-done-on-a-running-row-2 | A moment after            | The row leaves Running for its place in the block, checked                                  | test                                     |
| C-USE-running-done-on-a-running-row-3 | The time is over its plan | The done line takes Done's percent band, with "of <plan>" from warning                      | test                                     |
