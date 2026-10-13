---
target: specs/web/ux/interactions/move-to/states/moved-undo.md
status: approved
promoted:
boards:
  - name: "now-work / moved, undo / 402 / light"
    page: "USE — daily use"
    at: [5302, 17760]
    note: "Frame @ x 5302, y 18690"
    capture: specs/web/epics/USE-daily-use/ux/interactions/move-to/captures/moved-undo-402.png
rulings: [D-USE-39, D-USE-57, D-USE-70, D-USE-77]
---

# Move to — moved, with Undo

After a tap on "Work, 13:00 to 15:00" in [`work-move-to.md`](work-move-to.md): the sheet has closed and the row has left. The same `Toaster` closes every Move to target and Pick a day's "Move to <day>" ([`../index.md`](../index.md) › Rules). `?state=moved-undo`.

## What shows, top to bottom

- Now at 9:40 as beneath [`work-move-to.md`](work-move-to.md), with no scrim, except "Secondary" now holds only "[Agent: refactor the sync queue]" 30 min and "Add to Secondary": "[Answer the review comments]" has left; nothing else moves.
- Over the foot of the list, above `BottomNav`, a `Toaster` on a fade (the page background rising from transparent at its top): a bordered bar, radius as the sheet's, 48 px high, "Moved to Work, 13:00" on the left and "Undo" on the right, semibold, underlined in ink.

## What the person can do

- **Undo**: the item returns to its tier and place in this block, and the toast closes.
- Ignore it: the toast leaves on its own; the move stands. How long it shows is not on the boards [ASSUMPTION: the house `Toaster`'s default, and it does not time out while focused, as the Change offer in `../../../day/running/words-and-access.md`].
- Everything on Now stays live under the toast.

## Words

"Moved to <block>, <start>" (here "Moved to Work, 13:00"); "Undo". Other targets are not drawn [ASSUMPTION: the same form, naming where it went: "Moved to tomorrow, Work 9:30", "Moved to Thursday", "Back in the pool"].

## The notes on the boards

**now-work / moved, undo / 402 / light** (Frame @ x 5302, y 18690):

> moved, undo
>
> The row leaves; a Toaster on the fade names where it went, with Undo underlined in ink.

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- D-USE-57: on the phone the same toast follows the work menu's Move to another day and Back to the pool (and "Placed" with Undo on This week, cited there, not here).
- D-USE-70: Now's one-tap "Not today" leaves the same way; Block complete's "Move to later" says it in the row instead ("Moved to the end of Training", [`../../../day/block-complete/states/not-done-open.md`](../../../day/block-complete/states/not-done-open.md)).
- Undo is in words, never colour alone; nothing is red.

## Widths

Drawn at: 402. At 1024 and up the `Toaster` scales up from this frame, at the foot of the capped column (D-USE-39).

## Access

The toast is announced politely ("Moved to Work, 13:00"); Undo is reachable by Tab while it shows, named "Undo move of <item>" [PROPOSED]; at least 44 × 44.

## Criteria

| ID                         | When                       | Then                                                                            | Evidence                      |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------------- | ----------------------------- |
| C-USE-move-to-moved-undo-1 | A Move to target is tapped | The row leaves, nothing else moves, and the toast names where it went with Undo | `captures/moved-undo-402.png` |
| C-USE-move-to-moved-undo-2 | Undo                       | The item is back in its tier and place; the toast closes                        | test                          |
