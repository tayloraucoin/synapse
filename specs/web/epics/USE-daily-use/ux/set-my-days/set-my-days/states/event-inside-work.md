---
target: specs/web/ux/set-my-days/set-my-days/states/event-inside-work.md
status: approved
promoted:
boards:
  - name: "set-my-days / event added, inside Work / 402 / light"
    page: "USE — set up"
    at: [6266, 0]
    note: "Note · name only, 80 @ x 6266, y 930"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/event-inside-work-402.png
rulings: [D-USE-31, D-USE-38, D-USE-79]
---

# Set my days — an event added inside Work

After Add event ([`add-event.md`](add-event.md)): [Design review] at 11:00 sits inside Monday's Work block as a plum band, and the work after it re-flows. `?state=event-inside-work`. The layout is [`../index.md`](../index.md)'s. Its note is "Note · name only, 80" at x 6266, y 930.

## What shows, top to bottom

- Header, chips (M 12 selected), bounds row as the day; "Saved" with a check.
- The column: Orient, Wellness 7:05 to 8:00, Training 8:00 to 8:57, Breakfast 9:00 to 9:30 (bullets as dots, drawn before item icons; [`item-icons.md`](item-icons.md) rules).
- **Work** 9:30 to 12:00:
  - "Primary" with its leaf square; "[Write the sync spec] · ENG-123".
  - At 11:00, the **event band**: plum fill with a plum left rule, calendar icon, "[Design review]" (strong), "11:00 to 11:30", and the tag "Work" at its trailing end.
  - "[Review the Paper handoff] · 11:30", its new start after the band.
  - Secondary and Stretch are gone from the column's grid: Primary now fills the block.
- Lunch 12:00 to 13:00 below.
- **Toaster** at the bottom left, beside the +: "Added inside Work, 11:00" with "Undo".

## What the person can do

- **Undo:** removes the event and puts the work back where it was [ASSUMPTION: as long as the Toaster shows].
- Tap the band [ASSUMPTION: opens the event to edit in the Add event sheet's form, titled with its name; not drawn].
- Tap Work: its Block view on the tiers ([`../../../day/block-view/states/work-tiers.md`](../../../day/block-view/states/work-tiers.md)), where Secondary and Stretch still hold their items.

## Re-flow

The band is pinned at its time; the items after it move to its end (round 8). An item is never split. When the tiers no longer fit by the block's end, Stretch slides first, then Secondary ([`../../../dev-notes/meeting-inside-a-work-block.md`](../../../dev-notes/meeting-inside-a-work-block.md)); in the column the ones that no longer fit drop out of the grid. With no room at all, Make room's engine decides ([`../../../interactions/make-room/index.md`](../../../interactions/make-room/index.md)).

## Words

"Added inside <block>, <time>" · "Undo" · the band's tag, "Work" or "Personal".

## The notes on the boards

**"set-my-days / event added, inside Work / 402 / light"**, note "Note · name only, 80" @ x 6266, y 930:

> Event added, inside Work
>
> The plum band sits in Work at 11:00, and [Review the Paper handoff] moves to 11:30 (re-flow, round 8). Primary now fills the block, so Secondary and Stretch drop out of the column's grid. A Toaster offers Undo, beside the +.

## Rulings

- D-USE-31: meetings are a plum band inside the block. D-USE-38, D-USE-79: plum, told from violet by form (a fill with the calendar icon).
- The block stays one block: the event is a pinned item inside it ([`../../../dev-notes/meeting-inside-a-work-block.md`](../../../dev-notes/meeting-inside-a-work-block.md), which carries go mode).

## Widths

Drawn at: 402. Not drawn at: 1024 and wider (list-detail, D-USE-83) [ASSUMPTION: the same band in the day pane].

## Criteria

| ID                                    | When                                 | Then                                                                                  | Evidence                             |
| ------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------ |
| C-USE-set-my-days-event-inside-work-1 | An event's time falls inside a block | A plum band with the calendar icon, name, span and tag sits in the block at its time  | `captures/event-inside-work-402.png` |
| C-USE-set-my-days-event-inside-work-2 | The band lands on planned work       | The items after it move to its end; an item is never split                            | test                                 |
| C-USE-set-my-days-event-inside-work-3 | The event is added                   | A Toaster "Added inside <block>, <time>" with Undo; Undo restores the block as it was | test                                 |
