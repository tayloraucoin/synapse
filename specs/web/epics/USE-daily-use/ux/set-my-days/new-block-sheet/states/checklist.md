---
target: specs/web/ux/set-my-days/new-block-sheet/states/checklist.md
status: approved
promoted:
boards:
  - name: "new-block / checklist / 402 / light"
    page: "USE — set up"
    at: [1928, 5040]
    note: "Frame @ x 1928, y 5970"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/captures/checklist-402.png
rulings: [D-USE-34, D-USE-72]
---

# New block sheet — checklist

"Checklist, no times" switched on for a Sunday block (refinement 10). `?sheet=new-block&state=checklist` [ASSUMPTION: the state param].

## What shows, top to bottom

- Grabber; ×; "Usual Sunday · every week" over "New block".
- **Kind:** the seven, Wellness picked (leaf).
- **Name:** the empty icon tile beside "Sunday" [placeholder].
- Hairline; **Repeats** "Weekly on Sunday". Starts and Ends are gone.
- **Colour:** "Leaf, Wellness's colour".
- Hairline; **Checklist, no times**, on (ink track), "On: no times or lengths; check in any order. Starts and Ends step aside."
- "Goes in on Sundays in the All day strip, above the rail. Set a time later to put it on the rail."
- "Add block", ink.

## What the person can do

- Flip Checklist off: Starts and Ends come back, at the time the sheet opened with [ASSUMPTION].
- **Add block:** the block sits in the All day strip above the rail and opens as a checklist (`../../../day/block-view/states/checklist-editing.md`); Set a time there puts it on the rail.

## Words

"On: no times or lengths; check in any order. Starts and Ends step aside." · "Goes in on Sundays in the All day strip, above the rail. Set a time later to put it on the rail."

## The notes on the boards

**"new-block / checklist / 402 / light"**, "Frame" @ x 1928, y 5970:

> Checklist
>
> "Checklist, no times" on: Starts and Ends step aside. The line says it sits in the All day strip above the rail, and that Set a time later puts it on the rail (as the Sunday block view has it).

## Rulings

- D-USE-34: Checklist approved as drawn.
- D-USE-72: on a checklist day Now is the checklist, a set-time block lifts above it at its time, and the All day strip opens it in block view.
- Sunday is often one Checklist block (refinement 10).

## Widths

Drawn at: 402. At 1024 and wider: the right panel at `--sheet-w` (D-USE-39, D-USE-83).

## Criteria

| ID                                | When                     | Then                                                    | Evidence                     |
| --------------------------------- | ------------------------ | ------------------------------------------------------- | ---------------------------- |
| C-USE-new-block-sheet-checklist-1 | Checklist is switched on | Starts and Ends leave; the line names the All day strip | `captures/checklist-402.png` |
| C-USE-new-block-sheet-checklist-2 | Add block                | The block shows in the All day strip, not on the rail   | test                         |
