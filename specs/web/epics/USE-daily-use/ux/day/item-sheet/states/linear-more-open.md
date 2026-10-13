---
target: specs/web/ux/day/item-sheet/states/linear-more-open.md
status: approved
promoted:
boards:
  - name: "item-sheet / Linear linked, ··· open / 402 / light"
    page: "USE — set up"
    at: [2892, 7560]
    note: "Frame @ x 2892, y 8490"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/linear-more-open-402.png
rulings: [D-USE-37, D-USE-60, D-USE-65, D-USE-103]
---

# Item sheet — Linear linked, ··· open

The linked item's ··· menu, before the day begins. `?state=linear-more-open`.

## What shows, top to bottom

- `linear-linked.md` behind; ··· pressed.
- A `DropdownMenu` from ···, right-aligned, over the title and Linear line: muted heading "[Fix the sync retry], today only"; "Move to…" (arrow-right icon); "Not today" (circle-slash icon); a rule; "Unlink from Linear" (broken-link icon) with, under it in muted small text, "The item stays here as a plain item. The issue in Linear is untouched. Undo is offered after."
- No "Make it Monday's usual" on a work item.

## What the person can do

- **Move to…** opens Move to for a Linear work item (`../../../interactions/move-to/`, step `linear-work-item`).
- **Not today** takes it off today only (Open, `open-1.md` default).
- **Unlink from Linear** unlinks at once, no confirm: the item stays as a plain item, its description stays as its notes (`../../../dev-notes/notes-and-description.md`), the issue is untouched, and the toast offers Undo.

## Words

"<Item name>, today only"; "Move to…"; "Not today"; "Unlink from Linear"; "The item stays here as a plain item. The issue in Linear is untouched. Undo is offered after."

## The notes on the boards

**item-sheet / Linear linked, ··· open / 402 / light** (Frame @ x 2892, y 8490):

> Linear linked, ··· open · new [PROPOSED]
>
> Move to…, Not today, then Unlink from Linear below a rule, with its consequence: the item stays as a plain item, the issue in Linear is untouched, Undo in the toast. No confirm, since Undo covers it. "Make it Monday's usual" is left off: work comes from the pool, not the usual week [ASSUMPTION].

## Rulings

- D-USE-37: approved; [PROPOSED] and [ASSUMPTION] stand.
- D-USE-60 (2): the Move to step.
- The phone's work rows (a spread task, D-USE-57) have a different ···: `work-more-open.md`. A linked single-day item gets this menu (Move to…, Not today, Unlink) before Ready, go, and `work-more-open.md`'s on Now and Today (D-USE-65).

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                                  | When                 | Then                                                                                                     | Evidence                            |
| ----------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| C-USE-item-sheet-linear-more-open-1 | ··· on a linked item | Move to…, Not today, a rule, Unlink from Linear with its consequence line; no Monday's usual             | `captures/linear-more-open-402.png` |
| C-USE-item-sheet-linear-more-open-2 | Unlink from Linear   | No confirm; the item stays as a plain item with the description as notes; Linear untouched; Undo offered | manual                              |
