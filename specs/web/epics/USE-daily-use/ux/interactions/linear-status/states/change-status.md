---
target: specs/web/ux/interactions/linear-status/states/change-status.md
status: approved
promoted:
boards:
  - name: "now-work / item view, change status / 402 / light"
    page: "USE — daily use"
    at: [2892, 17760]
    note: "Frame @ x 2892, y 18690"
    capture: specs/web/epics/USE-daily-use/ux/interactions/linear-status/captures/change-status-402.png
rulings:
  [
    D-USE-35,
    D-USE-36,
    D-USE-38,
    D-USE-39,
    D-USE-60,
    D-USE-65,
    D-USE-77,
    D-USE-78,
    D-USE-103,
  ]
---

# Linear status — change status, from the Item sheet's chip

The status chip on the Item sheet tapped, at 9:40 on Now in the Work block: a menu of statuses anchored under the chip. `?state=change-status`.

## What shows, top to bottom

- Behind the scrim, Now: the Work block, Primary with the lifted card "[Write the sync spec]" ("45 min · 9:30", Start and Done), "[Review the Paper handoff]" 30 min, "Add to Primary"; Secondary "[Answer the review comments]" 20 min, "[Agent: refactor the sync queue]" 30 min, "Add to Secondary"; Stretch "[Tidy the Linear backlog]" 15 min, "Add to Stretch" (the round-2 add rows, `../../add/index.md`).
- The Item sheet at near full height (its top at the `row` spacing token, 818 px tall) for "[Fix the sync retry]": × left, ··· right; scope line "Work, 9:30 to 12:00 · Primary"; the sky icon tile with 🔄 and the title; the Linear line: chip (In progress shape, "In progress", chevron), "ENG-123", "Sync engine", "Linear ↗".
- **Description**, muted label, then the issue's text in Newsreader (`font-serif`, the review body size): "[When a write fails offline, the queue retries at once and floods the server. Back off with jitter, cap at five tries, and surface the last error on the item.]" and an underlined "Show all".
- **Length**: "− 45 min +" (Exact). **Tier**: a `SegmentedControl` Urgent, Primary (selected), Secondary, Stretch, no colour squares. **When**: "Today, Work 9:30 ›". **Notes**: a box with the hint "Only in Synapse, not sent to Linear".
- Footer pair: Start (outlined) and Done (filled).
- The menu, 250 px, left 20, top 236, over the sheet (shadowed, `rounded-sheet`): a muted caption "Moves ENG-123 in Linear"; Backlog (dotted ring); Todo (ring); In progress (half disc, shaded, a check on the right); In review (most filled); a rule; Done (filled disc with a check) "checks it here too"; Canceled (ring with a cross) "takes it off today". Every shape in ink or muted ink.

## What the person can do

- Pick a status: it is written to Linear and the chip shows it at once (`../index.md` step 2). Done also checks the item here; Canceled takes it off today.
- Tap outside to close the menu with nothing changed.

## Words

"Moves <ID> in Linear"; "checks it here too"; "takes it off today".

## The notes on the boards

**now-work / item view, change status / 402 / light** (Frame @ x 2892, y 18690):

> item view, change status [PROPOSED]
>
> The status chip opens Linear's states and moves the issue. Done also checks it here; Canceled takes it off today. ··· holds Open in Linear, Unlink, Remove from today.

## Rulings

- D-USE-78: the row's lead slot stays the firing ring; status changes on the Item sheet's chip; Waiting stands at both widths.
- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- D-USE-35: the shapes are Linear's own in the workspace's colours, not ink as drawn here (In progress yellow, part filled).
- Decided (D-USE-77): Two lists are drawn: this menu (six statuses) and the status sheet (`status-sheet.md`, every status, grouped, with each consequence). Default: the chip opens the status sheet's full grouped list, the later drawing (round 3), keeping this menu's "Moves <ID> in Linear" line.
- The sheet behind is superseded where later lines differ (`../../../day/item-sheet/states/linear-linked.md` is its layout, D-USE-65): Notes is one value with Description, never a Synapse-only box (D-USE-36, `../../../dev-notes/notes-and-description.md`); the tier control carries its colour squares (D-USE-36, D-USE-38); When is dropped for the scope line; ··· is the work menu on Now and Today (D-USE-65, `../../../day/item-sheet/states/work-more-open.md`), not "Open in Linear, Unlink, Remove from today". Newsreader for the description stands (`linear-linked.md`).

## Widths

Drawn at: 402. The desk: D-USE-39, menus scale up; inside the Item sheet, which is Decided (D-USE-103; D-USE-60 (3)) at the desk: the right-side panel.

## Criteria

| ID                                  | When               | Then                                                                          | Evidence                         |
| ----------------------------------- | ------------------ | ----------------------------------------------------------------------------- | -------------------------------- |
| C-USE-linear-status-change-status-1 | The chip is tapped | The statuses open, "Moves <ID> in Linear" above them, the current one checked | `captures/change-status-402.png` |
| C-USE-linear-status-change-status-2 | Done is picked     | The issue moves to Done and the item checks here                              | manual                           |
