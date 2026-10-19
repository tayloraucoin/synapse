---
target: specs/web/ux/interactions/move-to/states/linear-work-item.md
status: approved
promoted:
boards:
  - name: "item-sheet / move to, a Linear work item / 402 / light"
    page: "USE — set up"
    at: [2892, 6300]
    note: "Frame @ x 2892, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/interactions/move-to/captures/linear-work-item-402.png
rulings: [D-USE-37, D-USE-60, D-USE-103]
---

# Move to — a Linear work item

From the linked item's ··· › Move to… on "[Fix the sync retry]" at 6:58 (step 8's Move to sheet, reached from the Item sheet).

## What shows, top to bottom

- The sheet from y 330. Back link "‹ [Fix the sync retry]". Scope line "ENG-123 · 1 to 2 h · in Work, 9:30 to 12:00, Primary"; title "Move to".
- "Later today": "Work, 13:00 to 15:00", muted "Stays in Primary · fits, even at the top of its range" (Work's blue bar).
- "Another day": "Tomorrow, Work 9:30", muted "Tuesday 13 October · Primary" (blue bar).
- "Pick a day" with a calendar icon and a chevron (`pick-a-day.md`, with the work item's tier in the consequence [ASSUMPTION]).
- "Back to the pool", muted "Off every day until it's slotted again" (a grey bar).
- Footer line, muted: "One tap moves it and closes the sheet; Undo is offered after. The issue in Linear doesn't change; only where it sits in the day."

## What the person can do

- Tap a target: it moves there keeping its tier, the sheet closes, Undo is offered. Back to the pool takes it off every day.
- Back returns to the item.

## Words

"Stays in <Tier> · fits, even at the top of its range"; "<Weekday> <d> <Month> · <Tier>"; "Back to the pool"; "Off every day until it's slotted again"; the footer line.

## The notes on the boards

**item-sheet / move to, a Linear work item / 402 / light** (Frame @ x 2892, y 7230):

> Move to, a Linear work item · round 2 [PROPOSED]
>
> Step 8's Move to sheet, from the item sheet at 6:58: another Work block today (it keeps its tier), tomorrow's Work, Pick a day, and Back to the pool. The issue in Linear doesn't change.

## Rulings

- D-USE-37, D-USE-60 (2): approved; the Move to step on the item sheet.
- Fit is measured at the top of the length range (D-USE-42's ranges; "The day plans with 2 h, the top of the range").

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): as at 402 inside the right-side panel.

## Criteria

| ID                               | When                           | Then                                                                                    | Evidence                            |
| -------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------- | ----------------------------------- |
| C-USE-move-to-linear-work-item-1 | Move to… on a linked work item | Later Work blocks, tomorrow, Pick a day and Back to the pool, each with its consequence | `captures/linear-work-item-402.png` |
