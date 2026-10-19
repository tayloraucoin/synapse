---
target: specs/web/ux/day/running/states/running-row-focused.md
status: approved
promoted:
boards:
  - name: "now-work / running row tapped, focused / 402 / light"
    page: "USE — daily use"
    at: [6266, 17760]
    note: "Frame @ x 6266, y 18690"
    capture: specs/web/epics/USE-daily-use/ux/day/running/captures/running-row-focused-402.png
rulings:
  [
    D-USE-27,
    D-USE-39,
    D-USE-43,
    D-USE-44,
    D-USE-49,
    D-USE-72,
    D-USE-74,
    D-USE-76,
  ]
---

# Running — a Running row tapped, focused

"[Agent: refactor the sync queue]" tapped in [`several-running.md`](several-running.md). `?state=running-row-focused`.

## What shows, top to bottom

As [`several-running.md`](several-running.md), at the same moment (10:20), except the card and the first row trade places:

- **The running card** now holds "[Agent: refactor the sync queue]", meta "Primary · started 10:08", the figure "12:04" with "of 30 min"; Pause and Done.
- **Running rows**: "[Write the sync spec]", "Running · 18:20 of 45 min" (the item that was the card, still counting); "[Agent: ENG-123 tests]", "Running · 4 min over" (unchanged).
- Below, "Primary" with "[Review the Paper handoff]" and the placeholder caption, as there.

## What the person can do

- Tap any row to lift it in turn; the card drops back to a row. Nothing pauses or restarts: each count is its own start time minus its paused spans.
- Everything else as [`several-running.md`](several-running.md).

## Words

"Started <time>" in the card's meta when lifted (drawn "Primary · started 10:08"; see Rulings).

## The notes on the boards

**now-work / running row tapped, focused / 402 / light** (Frame @ x 6266, y 18690):

> running row tapped, focused (D-USE-27)
>
> Tapping a Running row lifts it into the card; the card that was focused drops to a row and keeps counting. Rows count down too ("18:20 of 45 min") and read "4 min over" past their length.

## Rulings

- D-USE-76: the frame is carried as a non-work block's Running rows; inside a Work block firing in place replaces it.
- **Where this state lives (lead's ruling).** The Running rows of non-work blocks (D-USE-27; D-USE-72). Inside a Work block D-USE-43, D-USE-44 and D-USE-49 replace them: one item in hand, the rest firing in place in their tier, no Running group; bringing a firing item back is pressing its mark ([`../../../interactions/firing.md`](../../../interactions/firing.md)), not lifting a row. "The tiers below are placeholders until step 8." The meta's "Primary ·" is a placeholder: in a non-work block it reads "Started 10:08".
- D-USE-27: tapping a row lifts it; the old card drops to a row and keeps counting.
- D-USE-72: rows count down like the card (Decided (D-USE-72)); "4 min over" takes Done's percent bands, not the muted ink drawn.
- Lifting moves the verdigris dot to the new card; the dot means only the item in focus [ASSUMPTION: no animation is drawn; under reduced motion the swap is instant].

## Widths

Drawn at: 402. At 1024 and up it scales up (D-USE-39), in the Block panel for a non-work block (D-USE-74).

## Access

Each Running row is a button named "<item>, running, <count>, lift to the card" [PROPOSED]; after the lift, focus moves to the card's title and the change is announced politely ("<item> in focus") [PROPOSED].

## Criteria

| ID                                  | When                    | Then                                                                           | Evidence                               |
| ----------------------------------- | ----------------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| C-USE-running-running-row-focused-1 | A Running row is tapped | It becomes the card; the old card becomes a row; both counts carry on unbroken | `captures/running-row-focused-402.png` |
