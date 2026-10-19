---
target: specs/web/ux/day/block-view/states/set-work.md
status: approved
promoted:
boards:
  - name: "block-view / work, set work, editing / 402 / light"
    page: "USE — set up"
    at: [964, 3780]
    note: "Frame @ x 964, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/set-work-402.png
rulings: [D-USE-17, D-USE-24, D-USE-31, D-USE-81, D-USE-87]
---

# Block view — a Set work block, editing

A Work block that fills with Set work: the same items every time, like Wellness (open-4 round 3; [`../../../dev-notes/how-work-fills-a-block.md`](../../../dev-notes/how-work-fills-a-block.md)). Tuesday mornings: writing [placeholder], the usual Tuesday, at 21:10. [PROPOSED] `?state=set-work`. Its note is "Frame" at x 964, y 4710.

## What shows, top to bottom

- **Status bar:** 21:10.
- **Breadcrumb:** "‹ Tuesday › Writing".
- **Header:** the sky bar (Work's colour), "Writing" over "Work · 9:30 to 12:00 · every Tuesday" (the kind named first, since the name is not the kind); "Done" beside the round ···. Then a hairline.
- **Fill row:** "Work fills it with" (muted) and, trailing, an outlined select "Set work ⌄". Then a hairline.
- **Rows**, as Wellness's ([`wellness-editing.md`](wellness-editing.md)): rail time, the item's icon, the name, the length, a grip at the trailing edge: 9:30 notebook "Morning pages" 30 min; 10:00 writing hand "Draft the next piece" 1 h 30 min (a taller row); 11:30 magnifier "Edit yesterday's draft" 30 min. The items are `[placeholder items]`, labelled so on the canvas.
- "+ Add to Writing".
- Caption (muted): "The same items every Tuesday, ticked fresh each week. No tiers, nothing to slot in This week." [ASSUMPTION: shipped as the block's explainer line; the "[placeholder items]" label under it is a canvas pointer, not shipped.]
- The block's end, "12:00" and its line, and the peek "Lunch · 12:00 to 13:00" with the amber bar.

## What the person can do

- As [`wellness-editing.md`](wellness-editing.md): reorder by the grip, times re-flow; swipe to remove with Undo; type in the add row (5 min, after the last, D-USE-81); tap an item for the Item sheet ([`../../item-sheet/index.md`](../../item-sheet/index.md)).
- "Set work ⌄": the choice made in the New block sheet ([`../../../set-my-days/new-block-sheet/states/work.md`](../../../set-my-days/new-block-sheet/states/work.md)), Tasks for the day or Set work. Decided (D-USE-87) Switching later is a question the dev note keeps open (what happens to set items or slotted work). Default: drawn live; a switch to Tasks for the day shows [`work-tiers.md`](work-tiers.md)'s tiers, and the dev note's later pass settles the items.
- "Done" or "‹ Tuesday": back to Set my days.

Every change is for every Tuesday (the span line).

## Words

"Work fills it with" · "Set work" · "every Tuesday" · "Add to Writing" · "The same items every Tuesday, ticked fresh each week. No tiers, nothing to slot in This week."

## The notes on the boards

**"block-view / work, set work, editing / 402 / light"**, "Frame" @ x 964, y 4710:

> New · Set work block, editing
>
> [PROPOSED] Tuesday mornings: writing [placeholder]. "Work fills it with: Set work" at the top; the items are fixed every Tuesday, with lengths and rail times like Wellness. No tiers and nothing to slot in This week. Mixing the two stays in the dev note.

## Rulings

- open-4 round 3: a Work block asks how work fills it, Tasks for the day (default) or Set work [PROPOSED]; Set work has fixed items with rail times and no tiers. D-USE-31's tiers belong to Tasks for the day.
- Mixing the two, tiers for set work, Linear links, Copy from and Reset with slotted work: the dev note, not this state.
- In This week a Set work block has nothing to slot [ASSUMPTION: opened from This week it shows these rows with "this Tuesday only", as [`wellness-editing.md`](wellness-editing.md)'s reach]. Not drawn.
- D-USE-17 (trailing grip), D-USE-24 (Done in editing).

## Widths

Drawn at: 402. Wider scales up (D-USE-39); from 1024 Set my days is list-detail (D-USE-83). At the desk a Schedule block opens its Block panel (D-USE-77), area 7.

## Criteria

| ID                          | When                                        | Then                                                                                                | Evidence                    |
| --------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------- |
| C-USE-block-view-set-work-1 | A Set work block is opened from Set my days | "Work fills it with" reads Set work; fixed rows with rail times, icons, lengths and grips; no tiers | `captures/set-work-402.png` |
| C-USE-block-view-set-work-2 | A row is changed                            | Every Tuesday's Writing changes; the checks start fresh each week                                   | test                        |
| C-USE-block-view-set-work-3 | This week's Tuesday is opened               | Nothing asks for work to be slotted                                                                 | test                        |
