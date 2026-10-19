---
target: specs/web/ux/day/item-sheet/states/more-open.md
status: approved
promoted:
boards:
  - name: "item-sheet / ··· open / 402 / light"
    page: "USE — set up"
    at: [482, 6300]
    note: "Frame @ x 482, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/more-open-402.png
rulings: [D-USE-37, D-USE-60, D-USE-103]
---

# Item sheet — ··· open

The default sheet (`default.md`) with ··· pressed. `?state=more-open`.

## What shows, top to bottom

- Everything in `default.md`; ··· shows pressed (filled).
- A `DropdownMenu` drops from ···, right-aligned, over the scope line and title: a muted heading line "Meditate, today only", then "Move to…" (arrow-right icon) and "Not today" (circle-slash icon), a rule, then "Make it Monday's usual" (calendar icon); each row leads with its line icon. Rows at the menu's standard height; no destructive styling.

## What the person can do

- **Move to…** opens the Move to step inside the sheet (`../../../interactions/move-to/`, step `plain-item`).
- **Not today** takes the item off today only (Open, `open-1.md`: default "Not today takes it off today only"); Undo in the toast [ASSUMPTION: as every removal in the day].
- **Make it Monday's usual** writes today's edits to the usual Monday, the way back from a today-only edit (the weekday is the day's own). [ASSUMPTION] It saves at once with Undo in the toast; the boards draw no confirm.
- Tapping outside or Escape closes the menu.

## Words

"<Item name>, today only"; "Move to…"; "Not today"; "Make it Monday's usual".

## The notes on the boards

**item-sheet / ··· open / 402 / light** (Frame @ x 482, y 7230):

> ··· open [PROPOSED]
>
> Titled with its scope. Move to… and Not today, then "Make it Monday's usual", the way back from a today-only edit. A linked work item adds Open in Linear and Unlink (step 8).

## Rulings

- D-USE-37: approved as drawn; the menu stays [PROPOSED].
- D-USE-60 (2): the sheet gains the Move to step.
- The linked work item's menu is drawn separately (`linear-more-open.md`): Move to…, Not today, and Unlink from Linear; "Make it Monday's usual" is left off a work item [ASSUMPTION]. The note's "Open in Linear" sits on the Linear line ("Linear ↗") there, not in the menu.

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the same menu from ··· in the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                           | When                   | Then                                                                                     | Evidence                     |
| ---------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- | ---------------------------- |
| C-USE-item-sheet-more-open-1 | ··· on a plain item    | The menu reads "<name>, today only", Move to…, Not today, a rule, Make it Monday's usual | `captures/more-open-402.png` |
| C-USE-item-sheet-more-open-2 | Make it Monday's usual | The usual Monday takes today's version of the item; Undo is offered                      | manual                       |
