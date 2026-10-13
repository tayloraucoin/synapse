---
target: specs/web/ux/interactions/move-to/index.md
status: approved
promoted:
boards: []
dev_note: ""
rulings: [D-USE-37, D-USE-39, D-USE-57, D-USE-60, D-USE-65, D-USE-70]
---

# Move to and Pick a day

Moving one item off its place today: later today, another day, a picked day, or (a work item) back to the pool. Each choice names its consequence before anything moves. Each drawn step is a file in `states/`.

## Where it starts

- The Item sheet's ··· › "Move to…" ([`../../day/item-sheet/index.md`](../../day/item-sheet/index.md), `states/more-open.md` and `states/linear-more-open.md`): a step inside the sheet, back on the left to the item.
- Now's long-press menu on a work row in go mode: step 8 drew "Move to" ("row long-press, work menu"); D-USE-57's work menu ([`../../work/today/states/work-menu.md`](../../work/today/states/work-menu.md)) names it Move to another day, which opens [`states/work-move-to.md`](states/work-move-to.md). On other blocks: [`../../day/now/states/row-long-press.md`](../../day/now/states/row-long-press.md). Its "Not today" is a one-tap move (below; `../../day/now/states/row-long-press.md`).
- Block complete's one-tap "Move to later" ("Later" beside Do now and Leave) on an item not done ([`../../day/block-complete/states/not-done-open.md`](../../day/block-complete/states/not-done-open.md), [`../../day/block-complete/states/not-done-do-now.md`](../../day/block-complete/states/not-done-do-now.md)).
- The phone's Today, the row's long-press work menu "Move to another day" (D-USE-57; `../../work/today/`).

Step 8's own form, `now-work / move to sheet / 402 / light` ("USE — daily use", x 4820, y 17760), is [`states/work-move-to.md`](states/work-move-to.md), and "moved, undo" (x 5302) is [`states/moved-undo.md`](states/moved-undo.md); `states/linear-work-item.md` is the same sheet reached from the Item sheet.

## Steps

| #   | The person                                                            | The app                                                                                              | Board (carried by)                                                                                                                                       |
| --- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ··· › Move to… on a plain item                                        | Later today and Another day, each row with its consequence, then Pick a day                          | `item-sheet / move to, a plain item / 402 / light` (`states/plain-item.md`)                                                                              |
| 1b  | ··· › Move to… on a Linear work item                                  | Another Work block today, tomorrow's Work, Pick a day, Back to the pool                              | `item-sheet / move to, a Linear work item / 402 / light` (`states/linear-work-item.md`)                                                                  |
| 1d  | Long-press a work row on Now › Move to another day                    | The same four, with × and no back link                                                               | `now-work / move to sheet / 402 / light` (`states/work-move-to.md`)                                                                                      |
| 2   | Taps a row                                                            | It moves, the sheet closes, the toast names where it went with Undo                                  | `now-work / moved, undo / 402 / light` (`states/moved-undo.md`)                                                                                          |
| 3   | Taps Pick a day                                                       | A month; a tapped day shows its consequence; "Move to <day>"                                         | `item-sheet / move to, pick a day / 402 / light` (`states/pick-a-day.md`)                                                                                |
| 1c  | Taps "Later" (Block complete) or "Not today" (Now): one tap, no sheet | It moves by D-USE-70's rule; the row reads "Moved to the end of Training" with Undo (Block complete) | `block-complete / not done, open / 402 / light` ([`../../day/block-complete/states/not-done-open.md`](../../day/block-complete/states/not-done-open.md)) |
| 3a  | Taps a day with no block of the item's kind                           | The dashed edge and the line say so; the item will wait in that day's to-dos                         | `item-sheet / move to, pick a day, no block of its kind / 402 / light` (`states/no-block-of-its-kind.md`)                                                |

## Rules

- One primary at most: rows move in one tap; Pick a day's "Move to <day>" is its one primary. Each closes the sheet with Undo in the toast.
- For today only: the usual week is never changed ("Monday's usual is unchanged").
- A Linear work item keeps its tier where it lands; the issue in Linear is never changed by a move, only where it sits in the day.
- The consequence is said in words and lengths (fits, the room left, how far past its end), never in red.
- [ASSUMPTION] No limit on how far ahead a day can be picked.
- Decided (D-USE-70): the one-tap moves take their drawn default. Block complete's "Move to later" puts the item at the end of the next block of the same kind today, else at the end of the next block; Now's "Not today" takes it off today only (its usual day keeps it). Move to… itself always lets the person choose; the rule binds only the two one-tap actions. With no next block today, see Block complete's `[NEEDS DECISION]` (`../../day/block-complete/words-and-access.md`).

## Rulings

- D-USE-37: Pick a day approved (a month, days already set marked quietly, the consequence line; a day with no block of its kind keeps the item in that day's to-dos).
- D-USE-60 (2): the item sheet gains the Move to step and Pick a day.
- D-USE-57: on the phone's Today, the long-press work menu holds Move to tier, Move to another day and Back to the pool; Move to another day opens `states/work-move-to.md`.
- D-USE-39, D-USE-65: at the desk the sheet is the right panel, opened from the right-click `ContextMenu`.
- D-USE-70: where the one-tap "Move to later" and "Not today" put an item (closes open-1's [NEEDS DECISION]).

## Criteria

| ID              | When                                           | Then                                                                           | Evidence                                                  |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------- |
| C-USE-move-to-1 | Any Move to row                                | It names its consequence before the tap; the tap moves, closes and offers Undo | `captures/plain-item-402.png`                             |
| C-USE-move-to-2 | A Linear work item is moved                    | It keeps its tier; nothing is written to Linear                                | manual                                                    |
| C-USE-move-to-3 | Any move                                       | The usual week is unchanged                                                    | manual                                                    |
| C-USE-move-to-4 | "Move to later" on Wellness's Meditate, Monday | It lands at the end of Training (no later Wellness block); Undo restores it    | `../../day/block-complete/captures/not-done-open-402.png` |
| C-USE-move-to-5 | "Not today" on Now                             | The item leaves today only; its usual day still holds it                       | test                                                      |
