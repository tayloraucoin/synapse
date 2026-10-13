---
target: specs/web/ux/day/block-complete/states/last-block.md
status: approved
promoted:
boards:
  - name: "block-complete / last block of the day / 402 / light"
    page: "USE — daily use"
    at: [1928, 15240]
    note: "Frame @ x 1928, y 16170"
    capture: specs/web/epics/USE-daily-use/ux/day/block-complete/captures/last-block-402.png
rulings: [D-USE-72, D-USE-73]
---

# Block complete — last block of the day

Now at 21:40: the day's last block completes. `?state=last-block`. The intent pass's `last` key ("[FILL] at handoff: no next block; Now's 'no blocks left' follows [ASSUMPTION]") is filled by this frame.

## What shows, top to bottom

Phone 402 × 874.

1. Status bar (21:40); "Now" with the avatar "T"; the To-dos tray closed.
2. **The close card,** centred, as [`not-done-closed.md`](not-done-closed.md) but shorter: × (muted) top-left; the 48 px round tile tinted in the block's colour (a plum-pink [placeholder] for Wind-down) with its check; "[Wind-down] complete" (heading, centred); "Nothing after this today." (body, muted, centred); a full-width outline `Button` "See the whole day". No Next, no Start, no disclosure (nothing left in the frame).
3. `BottomNav`, Now selected.

## What the person can do

- "See the whole day": Schedule.
- × or a few seconds after: Now shows its empty state, "The day's blocks are done." (`../../now/states/empty-no-blocks.md`, cited).
- [ASSUMPTION] Closing the day (the journal) is reached from the Wind-down block's Journal item before this card, not from the card: [`../../close-the-day/index.md`](../../close-the-day/index.md). The card offers no link to it.

## Words

"<Block> complete"; "Nothing after this today."; "See the whole day". "[Wind-down]" is [placeholder] for Monday's last block.

## The notes on the boards

**"block-complete / last block of the day / 402 / light"**, note "Frame" @ x 1928, y 16170:

> last block of the day [ASSUMPTION]
>
> No next block: "Nothing after this today." and See the whole day. × or a few seconds after, Now shows its empty state ("The day's blocks are done.", step 5). [placeholder] Wind-down stands in for Monday's last block.

## Rulings

- D-USE-72 (step 7 round 1): the last block reads "Nothing after this today." with See the whole day, and Now's empty state follows: Decided (D-USE-72), as drawn.
- D-USE-73: the evening close is its own surface, `day/close-the-day/`.
- [ASSUMPTION] "a few seconds" is about 4 s, unless focus is inside the card; it never times out under a screen reader.
- The last block with items left is not drawn: Do now and Leave, no Later (D-USE-74; [`../words-and-access.md`](../words-and-access.md)).

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                                | When                           | Then                                                                                                    | Evidence                      |
| --------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------- |
| C-USE-block-complete-last-block-1 | The day's last block completes | The card shows "<Block> complete", "Nothing after this today." and See the whole day; no Next, no Start | `captures/last-block-402.png` |
| C-USE-block-complete-last-block-2 | × or the pause passes          | Now shows "The day's blocks are done."                                                                  | test                          |
