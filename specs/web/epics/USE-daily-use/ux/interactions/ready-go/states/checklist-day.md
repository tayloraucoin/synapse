---
target: specs/web/ux/interactions/ready-go/states/checklist-day.md
status: approved
promoted:
boards:
  - name: "ready-go / welcome, checklist day / 402 / light"
    page: "USE — daily use"
    at: [1446, 8940]
    note: "Frame @ x 1446, y 9870"
    capture: specs/web/epics/USE-daily-use/ux/interactions/ready-go/captures/checklist-day-402.png
rulings: [D-USE-71, D-USE-72]
---

# The Ready, go hand-off — checklist day

Ready, go on Sunday, 18 October at 9:40, a day that is one checklist ([`../../../day/review-the-day/states/sunday-checklist-and-plans.md`](../../../day/review-the-day/states/sunday-checklist-and-plans.md)). Its note is the "Frame" at x 1446, y 9870.

## What shows, top to bottom

As [`welcome.md`](welcome.md), with these changes:

- "SUNDAY, 18 OCTOBER"; Orient's line: "Nothing to prove today. Groceries, then a long walk. [placeholder]".
- The bar: one list all day ("Sunday's list"), the now-tick at 9:40, and Lunch with Sam at 13:00 in plum with "S".
- "First": "Sunday's list" (bold) "any order, all day"; "then Lunch with Sam" "13:00".
- The button "Open the list"; caption: "One list today, done in any order."

## What the person can do

- **Open the list:** lands on the checklist, Now on a checklist day (D-USE-72; `../../../day/now/states/sunday-checklist.md`). Nothing lifts; drag handles are live (Rulings, kept from round 1).
- **‹ Review the day:** back, nothing undone.

## Words

"Sunday's list" · "any order, all day" · "Open the list" · "One list today, done in any order." The caption is on the board only, not in its note. [placeholder] until Gloss.

## The notes on the boards

**"ready-go / welcome, checklist day / 402 / light"**, "Frame" @ x 1446, y 9870:

> Checklist day · Sunday 9:40
>
> The bar is one list all day, with Lunch with Sam (plum, "S") at 13:00. First: Sunday's list, any order, all day. The button is "Open the list", which lands on the checklist.

## Rulings

- D-USE-71: as drawn. D-USE-72: on a checklist day Now is the checklist; a set-time block lifts above it at its time.
- Replaces round 1's `ready-go / checklist day / 402 / light` (`../../../boards/use-daily-use/archive-2.md`).
- Kept from round 1, `ready-go / checklist day / 402 / light`: the day is one checklist, so nothing lifts (refinement 10); drag handles are live once settled.

## Widths

Drawn at: 402. Wider: as [`welcome.md`](welcome.md) › Widths (D-USE-39).

## Criteria

| ID                             | When                         | Then                                 | Evidence                         |
| ------------------------------ | ---------------------------- | ------------------------------------ | -------------------------------- |
| C-USE-ready-go-checklist-day-1 | Ready, go on a checklist day | One list on the bar, "Open the list" | `captures/checklist-day-402.png` |
| C-USE-ready-go-checklist-day-2 | Open the list                | The checklist, nothing lifted        | test                             |
