---
target: specs/web/ux/interactions/move-to/states/work-move-to.md
status: approved
promoted:
boards:
  - name: "now-work / move to sheet / 402 / light"
    page: "USE — daily use"
    at: [4820, 17760]
    note: "Frame @ x 4820, y 18690"
    capture: specs/web/epics/USE-daily-use/ux/interactions/move-to/captures/work-move-to-402.png
rulings: [D-USE-37, D-USE-39, D-USE-42, D-USE-57, D-USE-65, D-USE-70, D-USE-77]
---

# Move to — a work item, from Now

Step 8's Move to sheet, opened on a work row in the Work block in go mode, at 9:40, on "[Answer the review comments]" (Secondary, 20 min). The same sheet reached from the Item sheet's ··· is [`linear-work-item.md`](linear-work-item.md), cited and not repeated; this file holds only what differs. `?state=work-move-to`.

## What shows, top to bottom

- Behind the scrim, Now in go mode as step 8 drew it before the phone rows: status bar "9:40"; "Now" with the avatar "T"; the To-dos strip "To-dos · Call the mechanic…"; the Work header (sky bar, "Work", "9:30 to 12:00", round ···); "Primary" with the lifted card "[Write the sync spec]" ("45 min · 9:30", Start and Done), "[Review the Paper handoff]" 30 min, "Add to Primary"; "Secondary" with "[Answer the review comments]" 20 min, "[Agent: refactor the sync queue]" 30 min, "Add to Secondary"; "Stretch" with "[Tidy the Linear backlog]" 15 min, "Add to Stretch"; `BottomNav`. The screen beneath is drawn in its older form; today's phone form is [`../../../work/today/states/working.md`](../../../work/today/states/working.md) (D-USE-51), cited.
- The sheet from y 380: grabber; × (close) on the left, not a back link, since it opens straight from Now; scope line, muted, "[Answer the review comments] · 20 min"; title "Move to".
- Group heading "Today": the row "Work, 13:00 to 15:00" with Work's sky bar, muted under it "Stays in Secondary · fits, 40 min free".
- Group heading "Another day": "Tomorrow, Work 9:30" (sky bar), muted "Tuesday 13 October · Secondary".
- "Pick a day" with a calendar glyph and a chevron.
- "Back to the pool" with a stacked-layers glyph, muted "Off every day until it's slotted again".
- No footer line (the Item sheet's form has one).

## What the person can do

- Tap a target row: the item moves there and keeps its tier, the sheet closes, and [`moved-undo.md`](moved-undo.md) shows. Back to the pool takes it off every day.
- Pick a day opens [`pick-a-day.md`](pick-a-day.md) (with [`no-block-of-its-kind.md`](no-block-of-its-kind.md)), the work item's tier in its consequence [ASSUMPTION, as in `linear-work-item.md`].
- × or a tap on the scrim closes the sheet; nothing moves.

## Words

"Move to"; "Today"; "Work, <start> to <end>"; "Stays in <Tier> · fits, <n> min free"; "Another day"; "Tomorrow, Work <start>"; "<Weekday> <d> <Month> · <Tier>"; "Pick a day"; "Back to the pool"; "Off every day until it's slotted again".

## The notes on the boards

**now-work / move to sheet / 402 / light** (Frame @ x 4820, y 18690):

> move to sheet [PROPOSED]
>
> Each choice shows its consequence: today's later Work block (keeps its tier, fits with 40 min free), tomorrow's Work, Pick a day (the calendar), or Back to the pool.

The note's [PROPOSED] is step 8's own mark: not yet ruled (D-USE-72 and D-USE-74 decide steps 5 to 7 only); it stays.

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- Where it opens from. The frame opens from step 8's long-press menu "Move to" (Open, Start, Move to, Tier, Move up, Move down, Not today), which D-USE-57's work menu replaces: Start, Prompt sent, Done, Move to tier ›, Move to another day, Back to the pool, Open in Linear ([`../../../work/today/states/work-menu.md`](../../../work/today/states/work-menu.md), cited). So this sheet is what **Move to another day** opens; Back to the pool is also one tap from the menu, and Move to tier is the menu's submenu, not a row here. [ASSUMPTION] The sheet keeps its "Today" group though the menu row says "another day", since Move to… always lets the person choose (D-USE-70).
- D-USE-70: Move to… always offers every choice; the one-tap rules ("Move to later", "Not today") bind only those two actions, not this sheet.
- D-USE-37: Pick a day as approved. D-USE-42: the fit is measured at the top of the length range ("fits, 40 min free" here; the Item sheet's form says "fits, even at the top of its range").
- The group heading reads "Today" here and "Later today" in the Item sheet's form (round 2, drawn later). Decided (D-USE-77): "Later today", the later drawing, in both.
- The sheet's × here against the Item sheet's back link: both stand, since this sheet has no step behind it.
- A Linear work item keeps its tier where it lands; nothing is written to Linear (`../index.md` › Rules).

## Widths

Drawn at: 402. At 1024 and up the sheet is `ResponsiveSheet`'s right panel (D-USE-39), opened from the desk's right-click `ContextMenu`, which holds the phone's work-menu items (D-USE-65).

## Criteria

| ID                           | When                                         | Then                                                                                                                     | Evidence                        |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| C-USE-move-to-work-move-to-1 | Move to another day on a work row in go mode | Today's later Work block, tomorrow's Work, Pick a day and Back to the pool, each with its consequence; the tier is named | `captures/work-move-to-402.png` |
| C-USE-move-to-work-move-to-2 | A later Work block today is tapped           | The item lands there in the same tier; the fit is measured at the top of its range                                       | test                            |
| C-USE-move-to-work-move-to-3 | × or the scrim                               | The sheet closes; nothing moves                                                                                          | manual                          |
