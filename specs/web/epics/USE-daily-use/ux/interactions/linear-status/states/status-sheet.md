---
target: specs/web/ux/interactions/linear-status/states/status-sheet.md
status: approved
promoted:
boards:
  - name: "now-work / status sheet, from the status box / 402 / light"
    page: "USE — daily use"
    at: [3856, 17760]
    note: "Frame @ x 3856, y 18690"
    capture: specs/web/epics/USE-daily-use/ux/interactions/linear-status/captures/status-sheet-402.png
rulings:
  [
    D-USE-35,
    D-USE-38,
    D-USE-39,
    D-USE-44,
    D-USE-49,
    D-USE-51,
    D-USE-57,
    D-USE-60,
    D-USE-77,
    D-USE-78,
    D-USE-103,
  ]
---

# Linear status — the status sheet

Taylor's whole Linear workflow for one linked item, grouped as in Linear, each status with what it does here. Drawn opened from the row's status box on Now at 10:20, on "[Answer the review comments]" (ENG-131, Todo). `?state=status-sheet`.

## What shows, top to bottom

- Behind the scrim, Now in the Work block as `../../../work/today/states/waiting.md` draws it (the lifted card, the plum band, Secondary, Waiting).
- The sheet from y 92, grabber; × on the left (no ···).
- Scope line, muted: "[Answer the review comments] · ENG-131". Title "Status". Under it, muted caption: "Moves it in Linear ([Lighthouse])" (the workspace's name).
- Group headings in muted caption, rows 40 px, each the status's shape in Linear's colour (16 px), its word, and on the right a muted consequence where it has one:
  - **Backlog:** Backlog (grey dotted ring).
  - **Unstarted:** Blocked (red ring) "moves to Waiting"; Todo (grey ring), the current one: shaded `--color-surface` with a check on the right; Up next (grey ring).
  - **Started:** In progress (yellow, 1/6 filled) "starts the timer"; Ongoing (orange, 2/6) "off today, back to the pool"; Paused (red, half) "moves to Waiting"; In review (indigo, most filled) "moves to Waiting"; Changes requested (cyan, most filled).
  - **Completed and canceled:** Done (green disc with a white check) "checks it off"; Canceled (grey disc with a cross) "takes it off today"; Duplicate (grey disc with a cross) "takes it off today".

## What the person can do

- Tap a status: it is written to Linear (`../../../day/item-sheet/states/linear-syncing.md`; a failure is `linear-failed.md` there) and its consequence happens here; the sheet closes [ASSUMPTION: not drawn].
- × or a drag down closes it with nothing changed.

## Words

"Status"; "Moves it in Linear (<workspace>)"; "Backlog", "Unstarted", "Started", "Completed and canceled"; "moves to Waiting"; "starts the timer"; "off today, back to the pool"; "checks it off"; "takes it off today". The status names are the workspace's own, read from Linear.

## The notes on the boards

**now-work / status sheet, from the status box / 402 / light** (Frame @ x 3856, y 18690):

> status sheet, from the status box [PROPOSED]
>
> Tapping the status shape opens Taylor's workflow, grouped as in Linear, each with its consequence here: In progress starts the timer, Ongoing goes back to the pool, the waiting states move to Waiting, Done checks it off, Canceled and Duplicate take it off today. Tapping the row still opens the item; long-press adds Status.

## Rulings

- D-USE-78: the row's lead slot stays the firing ring; status changes on the Item sheet's chip; Waiting stands at both widths.
- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- D-USE-35: shapes as Linear draws them, In progress yellow and part filled; the fills follow the dev note in [`../index.md`](../index.md).
- D-USE-38: Blocked and Paused share Urgent's red, "needs you now" [PROPOSED until Taylor's look].
- Decided (D-USE-78): The entry. The frame opens this from the row's status box; D-USE-44, D-USE-49 and D-USE-51 make the row's lead slot the ring that fires it. Default: the entry today is the Item sheet's status chip (`../../../day/item-sheet/states/linear-linked.md`); the row's lead slot stays the ring; the long-press "Status" row is not in D-USE-57's work menu. The frame's status-box row is not built.
- Backlog carries no consequence on the frame; Open "step 8 round 3" sends it back to the pool with Ongoing [ASSUMPTION: Backlog reads "off today, back to the pool"]. Up next and Changes requested carry none: they stay in their tier.
- "starts the timer": In progress makes the running card (D-USE-42's Start); with something already running it asks as Start does (`../../start-while-one-runs.md`) [ASSUMPTION].
- Linear's Paused is a status, not the work clock's Pause (D-USE-46, `../../../work/today/states/paused.md`).

## Widths

Drawn at: 402. The desk: D-USE-39, sheets keep `ResponsiveSheet`'s right panel at `--sheet-w`, scaled up from this frame; opened from the Item sheet there, which is Decided (D-USE-103; D-USE-60 (3)): the right-side panel.

## Criteria

| ID                                 | When                                   | Then                                                                                                                            | Evidence                        |
| ---------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| C-USE-linear-status-status-sheet-1 | The status list opens                  | Every status in the workspace's workflow, grouped as in Linear, shape in Linear's colour with its word, the current one checked | `captures/status-sheet-402.png` |
| C-USE-linear-status-status-sheet-2 | Blocked, Paused or In review is picked | The item leaves its tier for Waiting                                                                                            | manual                          |
| C-USE-linear-status-status-sheet-3 | Canceled or Duplicate is picked        | The item leaves today; Linear holds the status                                                                                  | manual                          |
