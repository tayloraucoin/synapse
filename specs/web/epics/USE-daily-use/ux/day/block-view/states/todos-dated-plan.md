---
target: specs/web/ux/day/block-view/states/todos-dated-plan.md
status: approved
promoted:
boards:
  - name: "block-view / to-dos, a dated plan inside / 402 / light"
    page: "USE — set up"
    at: [5784, 3780]
    note: "Frame @ x 5784, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/todos-dated-plan-402.png
rulings: [D-USE-31, D-USE-38, D-USE-69, D-USE-79, D-USE-83, D-USE-87]
---

# Block view — a To-dos block with a dated plan inside

Errands on Sat 17 (10:00 to 12:30) with an event at 11:00, "Coffee with Sam" [placeholder plan], a dated plan for this Saturday only. `?state=todos-dated-plan`. Its note is "Frame" at x 5784, y 4710. An event pins inside whatever block its time falls in; it is not slotted ([`../../../dev-notes/blocks-and-todos-model.md`](../../../dev-notes/blocks-and-todos-model.md)). The meeting inside a Work block is the same pattern: [`../../../dev-notes/meeting-inside-a-work-block.md`](../../../dev-notes/meeting-inside-a-work-block.md).

## What shows, top to bottom

- **Status bar:** 21:10. **Breadcrumb:** "‹ Sat 17 › Errands".
- **Header:** the moss bar, "Errands" over "To-dos · 10:00 to 12:30 · this Saturday"; "Done" beside the round ···. A hairline.
- **Rows** on the rail, 56 px:
  - 10:00 🧥 "Drop off the dry cleaning" 20 min, grip;
  - 10:20 📞 "Call the mechanic" 15 min, grip;
  - 11:00 **the event band:** a plum fill with a darker plum edge at the leading side, a calendar icon, "Coffee with Sam" (semibold), "Personal · 11:00 to 11:30" trailing (muted); no grip, no length;
  - 11:30 🛒 "Groceries" 45 min, grip (moved after the event). The 25 minutes from 10:35 to 11:00 are left open, with nothing drawn in them [ASSUMPTION: no "Free" region between items].
- **The add row:** "+ Add to Errands".
- Under it (label, muted): "Coffee with Sam is a dated plan for this Saturday only, a band inside Errands at its time. Groceries moved after it: an item is never split." Then "[placeholder plan] · Free from 12:15" (caption, subtle).
- The end line at "12:30"; the peek: an amber bar, "Lunch · 12:30 to 13:30".

## What the person can do

- As [`todos-add-open.md`](todos-add-open.md): reorder the to-dos by grip, swipe to take one out, the add row, Done or the breadcrumb.
- The band keeps its time: to-dos re-flow around it and never split across it (the note); a to-do that no longer fits before the band moves after it.
- Tap the band: the event [ASSUMPTION: the event's own sheet, as Set my days' add event, [`../../../set-my-days/set-my-days/states/add-event.md`](../../../set-my-days/set-my-days/states/add-event.md); not drawn].
- The event belongs to the date, not the block: moving or deleting the block leaves it at 11:00 [ASSUMPTION: from "pins inside whatever block its time falls in"]; outside every block it is its own small block (round 2; [`../../../set-my-days/set-my-days/states/event-own-block.md`](../../../set-my-days/set-my-days/states/event-own-block.md)).

## Words

"Personal · 11:00 to 11:30" (the event's tag, then its span); "Coffee with Sam is a dated plan for this Saturday only, a band inside Errands at its time. Groceries moved after it: an item is never split."; "Free from 12:15".

## The notes on the boards

**"block-view / to-dos, a dated plan inside / 402 / light"**, note "Frame" @ x 5784, y 4710:

> A dated plan inside
>
> [PROPOSED] Coffee with Sam is an event: a plum band at its time, tagged Personal, as a meeting sits in Work. Groceries moves after it, never split. Outside every block it is its own small block (round 2).

## Rulings

- D-USE-31: meetings as a plum band inside the Work block; this is the same band in a To-dos block.
- D-USE-38, D-USE-79: events stay plum, told from violet by form (always a fill with the calendar icon).
- Open-4, Life and chores: "A dated plan … is an event: a plum band inside the Life block its time falls in, items re-flowing around it and never split"; round 2 moved errands to the To-dos kind, so the frame draws it in Errands.
- "Personal" is the event's tag [ASSUMPTION: the event's calendar or a tag set on it; Set my days' add event names where it comes from].
- Decided (D-USE-87) **"Free from 12:15"** names the time left after the last item (11:30 + 45 min), a second form beside D-USE-69's dashed "Free until <block end>", which this frame does not draw. Default: the dashed "Free until 12:30" region builds, as D-USE-69 rules; the caption's "Free from" is a canvas pointer.

## Widths

Drawn at: 402. Not drawn at: 1024 and wider; at 1024 Set my days is list-detail (D-USE-83) [ASSUMPTION: Block view opens in the day pane]; otherwise scales up.

## Criteria

| ID                                  | When                                        | Then                                                                                                   | Evidence                            |
| ----------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| C-USE-block-view-todos-dated-plan-1 | An event's time falls inside a To-dos block | A plum band with the calendar icon, its name and "<tag> · <span>", at its time, with no grip or length | `captures/todos-dated-plan-402.png` |
| C-USE-block-view-todos-dated-plan-2 | A to-do would cross the event               | It moves after the event whole; nothing is split                                                       | test                                |
| C-USE-block-view-todos-dated-plan-3 | The event's time is outside every block     | It shows as its own small block                                                                        | test                                |
