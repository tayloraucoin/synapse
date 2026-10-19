---
target: specs/web/ux/interactions/add-from-the-rail/index.md
status: approved
promoted:
boards: []
dev_note: ""
rulings: [D-USE-11, D-USE-15, D-USE-16, D-USE-18, D-USE-19, D-USE-22, D-USE-39]
---

# Add from the rail

Adding to a laid-out day at a time: the one + in the rail gutter, tapped or dragged, then the add sheet; with no room, Make room. Board branches 2c (drag) and 2d (add sheet), steps of their own in `states/`.

This is not the work "+ Add" (Task to a tier, From the pool, To-do, Event: [`../add/index.md`](../add/index.md)), which starts from Today's header and Now; this flow starts from a time on the day column. A to-do is added in the tray, never here (`../../day/todos/`).

## Where it starts

- **Review the day:** the rail + ([`../../day/review-the-day/index.md`](../../day/review-the-day/index.md); the one-time hint on the first mornings, `states/first-mornings.md` there).
- **Tapping empty time** on the column (D-USE-11) [ASSUMPTION: opens the add sheet at the tapped time, rounded to 15 minutes].
- **A Work block's "Add to Primary" or "Add to Secondary"** opens the same sheet preset to the tier, with no Starts (`../../day/review-the-day/states/no-work-add-to-primary.md`).
- [ASSUMPTION] The same rail + on Schedule and Set my days' column (step 9's + opens New block there, open-4: not this flow).

## Steps

| #   | The person                 | The app                                                                                                                                  | Board (carried by)                                                                    |
| --- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Taps the +                 | The add sheet opens at the next free time (D-USE-15)                                                                                     | not drawn; as step 3                                                                  |
| 2   | Holds the + and drags      | The + becomes the time, in 15-minute steps; a solid line in the rail, a faint dashed guide over the block                                | `review-day / rail drag / 402 / light` ([`states/rail-drag.md`](states/rail-drag.md)) |
| 3   | Releases at 10:15          | The add sheet at 10:15, naming the block it lands in                                                                                     | `review-day / add sheet / 402 / light` ([`states/add-sheet.md`](states/add-sheet.md)) |
| 4a  | Adds, with room            | Free time absorbs it silently; the sheet closes and the item shows in its block [ASSUMPTION: with an Undo Toaster, as every change here] | not drawn                                                                             |
| 4b  | Adds, with no room         | Make room ([`../make-room/index.md`](../make-room/index.md))                                                                             | `review-day / make room / 402 / light` (`../make-room/states/sheet.md`)               |
| 4c  | Picks "Block" in the sheet | The New block sheet (step 10) at that time                                                                                               | `../../set-my-days/new-block-sheet/index.md`                                          |

## Rules

- One + in the rail, never one per hour (D-USE-15; "Quiet wins", D-P03).
- 15-minute steps, in the drag and in Starts; Starts also takes a typed time (D-USE-19).
- Today only: the usual week is never changed (note 18).
- × or a drag down closes the sheet with nothing added.
- Offline: adding works; it saves on the phone (D-USE-64's rule for edits) [ASSUMPTION].
- At the desk the + stays in the time gutter at the column's left; the sheet opens in `ResponsiveSheet`'s right panel at `--sheet-w` (D-USE-39); a drag works with the pointer [ASSUMPTION].
- Plumb: the rail + and its drag state, and the add sheet, are new (open-1, "To Plumb").

## Rulings

- D-USE-11: a + in the rail as well as tapping empty time; free time absorbs an addition silently; no room opens Make room.
- D-USE-15: one +; tap adds at the next free time; drag in 15-minute steps; release opens the add sheet there.
- D-USE-16, D-USE-19: the add sheet's fields.
- D-USE-18: the + teaches itself; the drag's line is solid ink in the rail only, a faint dashed guide across the block, never a solid line over content.
- D-USE-22: the empty Work block's Add rows open the sheet preset.

## Criteria

| ID                        | When             | Then                                                                       | Evidence                              |
| ------------------------- | ---------------- | -------------------------------------------------------------------------- | ------------------------------------- |
| C-USE-add-from-the-rail-1 | The + is tapped  | The add sheet at the next free time                                        | test                                  |
| C-USE-add-from-the-rail-2 | The + is dragged | It reads the time in 15-minute steps; release opens the sheet at that time | `captures/rail-drag-402.png`          |
| C-USE-add-from-the-rail-3 | Add with room    | The item lands with no question                                            | test                                  |
| C-USE-add-from-the-rail-4 | Add with no room | Make room opens                                                            | `../make-room/captures/sheet-402.png` |
