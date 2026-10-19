---
target: specs/web/ux/interactions/linear-status/index.md
status: approved
promoted:
boards: []
dev_note: "Dev note · Linear status fill"
rulings:
  [
    D-USE-35,
    D-USE-37,
    D-USE-38,
    D-USE-39,
    D-USE-44,
    D-USE-49,
    D-USE-51,
    D-USE-57,
    D-USE-78,
  ]
---

# Linear status changes

How a Linear status shows, and how it changes, wherever a linked item appears: the status chip on the Item sheet, the status box on a Now row, the status sheet. Each drawn step is a file in `states/`: [`states/change-status.md`](states/change-status.md) (the chip's picker inside the Item sheet) and [`states/status-sheet.md`](states/status-sheet.md) (Taylor's whole workflow, grouped).

## Where it starts

- The status chip on the Item sheet's Linear line ([`../../day/item-sheet/index.md`](../../day/item-sheet/index.md); `states/linear-linked.md`, `linear-syncing.md`, `linear-failed.md`, `linear-done.md`). **This is the entry today.**
- The status box on a linked row on Now in a work block (`../../day/now-work.md`), and the phone's Today rows (`../../work/today/`): drawn by step 8 round 3 (`now-work / status sheet, from the status box / 402 / light`, x 3856, y 17760). D-USE-44, D-USE-49 and D-USE-51 give every work row's lead slot the ring that fires it (44 × 44, D-USE-53), so a row has no status box to tap. Decided (D-USE-78): the ring stays; status lives on the Item sheet's chip; the long-press "Status" row the frame's note adds is not in D-USE-57's work menu (Start, Prompt sent, Done, Move to tier, Move to another day, Back to the pool, Open in Linear).
- Checking a linked item off anywhere (N2, N4).

## Steps

| #   | The person                                          | The app                                                                              | Board (carried by)                                                                                                                                                                                    |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Taps the status chip (or, see above, the row's box) | Taylor's workflow opens, grouped as in Linear, each status with its consequence here | `now-work / status sheet, from the status box / 402 / light` (`states/status-sheet.md`); the chip's earlier dropdown, `now-work / item view, change status / 402 / light` (`states/change-status.md`) |
| 2   | Picks a status                                      | The chip shows it at once; "Updating Linear" while it writes                         | `item-sheet / Linear syncing / 402 / light` (`../../day/item-sheet/states/linear-syncing.md`)                                                                                                         |
| 2a  | The write fails                                     | "Not updated in Linear. <Status> is kept here." with Try again                       | `item-sheet / Linear failed / 402 / light` (`../../day/item-sheet/states/linear-failed.md`)                                                                                                           |
| 2b  | Picks Blocked, Paused or In review                  | The item leaves its tier for Waiting at the block's foot                             | `now-work / tier colours, status boxes, waiting / 402 / light` (`../../work/today/states/waiting.md`)                                                                                                 |
| 3   | The issue closes in Linear                          | The item checks itself, "Done in Linear"                                             | `item-sheet / closed in Linear / 402 / light` (`../../day/item-sheet/states/linear-done.md`)                                                                                                          |

## Rules

- A status is drawn as Linear draws it: its shape in the workspace's colour, with the fill from its place in its group (the dev note), and always its word beside it; colour is never alone.
- Checking a linked item moves the issue to the team's Done; unchecking moves it back to its status before (N2). Done also checks it here; Canceled takes it off today (step 8's change status note).
- What each status does here (`states/status-sheet.md`): In progress starts the timer; Ongoing (and Backlog, Open "step 8 round 3") goes off today, back to the pool; Blocked, Paused and In review move to Waiting; Done checks it off; Canceled and Duplicate take it off today.
- A failed write never shows red: ink with an info icon; the value in Synapse stands. Offline: "Updates Linear when back online", sent on reconnect.
- The fraction is recomputed on every sync and never stored.

## The dev note

**Dev note · Linear status fill** ("USE — set up", x 4820, y 7560):

> A Linear status shows as Linear draws it: a ring in the workspace's colour for that status, with a pie inside that fills as the issue moves through its group. In progress is yellow and partly filled, not a clock (Taylor, round 2).
>
> Logged in day/overview.md, Open.
>
> How the fill is worked out
>
> Read the workspace's statuses from Linear, grouped by type (Backlog, Unstarted, Started, Completed, Canceled). Inside the Started group, ordered by Linear's position: fill = position ÷ (statuses in the group + 1). Lighthouse has five started statuses, so In progress (1st) is 1/6, Ongoing 2/6, Paused 3/6, In review 4/6, Changes requested 5/6. Completed is a full disc with a check; Backlog a dotted ring; Unstarted an empty ring; Canceled a grey disc with a cross.
>
> To investigate
>
> Whether Linear's API gives the position or only the order. When a workspace adds or removes a status, every fill in that group shifts; recompute on sync, never store the fraction. Colour is never alone: the status word always sits beside the shape.

Its summary card under it (Frame @ x 4820, y 8490): "Dev note · Linear status fill / In progress is yellow and partly filled (fixed on both Linear linked artboards, step 8's item view and the status sheet on 'USE — daily use'). The fill comes from the status's place in its group."

## Rulings

- D-USE-78: the row's lead slot stays the firing ring; status changes on the Item sheet's chip; Waiting stands at both widths.
- D-USE-35: a Linear status is drawn as Linear draws it (In progress yellow and part filled, the fill from its place in its status group).
- D-USE-38: Urgent, Blocked and Paused share one red ("needs you now"); the colours thread's set stands [PROPOSED until Taylor's look].
- Open "Dev note: colours, for a new thread": whether Linear's status colours stay or go to ink is answered by D-USE-35 (they stay, as Linear draws them); tier, event and dark tokens stay with the colours thread (D-USE-38; [`../../dev-notes/colours-for-a-new-thread.md`](../../dev-notes/colours-for-a-new-thread.md)).
- D-USE-37: approved. D-USE-39: menus and sheets scale up at the desk with no wide frame of their own.
- D-USE-44, D-USE-49, D-USE-51, D-USE-57: the row's lead slot is the firing ring; see Where it starts.

## Criteria

| ID                    | When                                  | Then                                                                         | Evidence                                              |
| --------------------- | ------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| C-USE-linear-status-1 | A started status shows                | Its ring fills to position ÷ (statuses in the group + 1), recomputed on sync | test                                                  |
| C-USE-linear-status-2 | Any status shows                      | Its word sits beside its shape                                               | `../../day/item-sheet/captures/linear-linked-402.png` |
| C-USE-linear-status-3 | A linked item is checked or unchecked | The issue moves to Done, or back to its status before                        | manual                                                |
| C-USE-linear-status-4 | A work row's lead slot is tapped      | It fires the item; it never opens the status list                            | manual                                                |
