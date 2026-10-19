---
target: specs/web/ux/day/item-sheet/states/work-more-open.md
status: approved
promoted:
boards:
  - name: "phone-edit / item sheet ··· menu / 402 / light"
    page: "USE — work"
    at: [8194, 7200]
    note: "Notes · phone, editing and This week (row 6, cont.) @ x 8194"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/work-more-open-402.png
rulings: [D-USE-57, D-USE-58, D-USE-103]
---

# Item sheet — a work item's ··· menu (phone)

··· in the header of a spread task's sheet (`tier-and-sessions.md`), drawn at 21:10. `?state=work-more-open`.

## What shows, top to bottom

- Behind the scrim, "Now" and "Work".
- An action sheet from y 420 (`ActionRowSheet`), grabber; heading line, muted: the project emoji, "[Synapse: desk Today layout] · session 1 of 3".
- Rows on hairlines, each a line icon then its words:
  - "Mark the task done" (circle-check), under it muted "Closes Wed's and Thu's sessions and the Linear issue".
  - "Back to the pool" (layers).
  - "Spread across the week" (plus).
  - "Open in Linear" (external-link).
  - "Remove from Synapse" (trash), under it muted "The Linear issue stays as it is". No red.

## What the person can do

- **Mark the task done** closes every session and the Linear issue.
- **Back to the pool** takes it off every day into the pool.
- **Spread across the week** opens Spread (a full sheet: hours left, session length, which Work block, days and tier, the sessions previewed; [`../../../interactions/spread/index.md`](../../../interactions/spread/index.md)).
- **Open in Linear** opens the issue.
- **Remove from Synapse** removes it here; Linear untouched. [ASSUMPTION] Undo in the toast, as every removal; the boards draw no confirm.

## Words

"Mark the task done"; "Closes <days>' sessions and the Linear issue"; "Back to the pool"; "Spread across the week"; "Open in Linear"; "Remove from Synapse"; "The Linear issue stays as it is".

## The notes on the boards

**phone-edit / item sheet ··· menu / 402 / light** (Notes · phone, editing and This week (row 6, cont.) @ x 8194, card "Item sheet ··· menu"):

> Item sheet ··· menu
>
> Mark the task done (closes every session and the Linear issue), Back to the pool, Spread across the week, Open in Linear, Remove from Synapse (Linear untouched).

## Rulings

- D-USE-57: the item sheet's ··· holds Mark the task done, Back to the pool, Spread, Open in Linear, Remove from Synapse. D-USE-58: locked.
- Move to for a work item on the phone sits in the row's long-press work menu (Move to tier, Move to another day; D-USE-57), carried by the Today writer; it opens `../../../interactions/move-to/`.

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the same list as a `DropdownMenu` from ··· in the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                                | When                       | Then                                                                                                                              | Evidence                          |
| --------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| C-USE-item-sheet-work-more-open-1 | ··· on a work item's sheet | Mark the task done, Back to the pool, Spread across the week, Open in Linear, Remove from Synapse, with the two consequence lines | `captures/work-more-open-402.png` |
| C-USE-item-sheet-work-more-open-2 | Remove from Synapse        | The item leaves Synapse; the Linear issue is unchanged                                                                            | manual                            |
