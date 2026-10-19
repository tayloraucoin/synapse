---
target: specs/web/ux/day/item-sheet/states/linear-syncing.md
status: approved
promoted:
boards:
  - name: "item-sheet / Linear syncing / 402 / light"
    page: "USE — set up"
    at: [1446, 7560]
    note: "Note · item-sheet / Linear syncing"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/linear-syncing-402.png
rulings: [D-USE-35, D-USE-37, D-USE-103]
---

# Item sheet — Linear syncing

A change to a linked item on its way to Linear: here the status set to In review in the sheet. `?state=linear-syncing`.

## What shows, top to bottom

- As `linear-linked.md`, with:
- The status chip shows the new status at once: In review's shape (a green ring, mostly filled, the workspace's own colour) and "In review".
- A new line under the Linear line: a small `Spinner` and "Updating Linear", muted. Everything below moves down by that line.

## What the person can do

- Everything in `linear-linked.md` stays live; the change already stands in Synapse.
- The line goes once Linear answers; a failure becomes `linear-failed.md`.

## Words

"Updating Linear" (step 8's words; N2 names `LoadingText`).

## The notes on the boards

**item-sheet / Linear syncing / 402 / light** (Note · item-sheet / Linear syncing):

> item-sheet / Linear syncing
>
> From Linear linked: the status is changed to In review in the sheet. The chip shows the new word at once, and a line under it reads "Updating Linear" with a small spinner (step 8's words). The line goes once Linear answers. [ASSUMPTION] In review uses the workspace's own colour (Linear's default green).

## Rulings

- D-USE-35: a status is drawn as Linear draws it, its fill from its place in its group.
- D-USE-37: approved as drawn. Open "Audit gaps" (2026-10-10): drawn to close the audit's gap on the item sheet's Linear syncing.
- A spinner here is a short write with its words beside it, not a page load (A-18 does not apply).

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                                | When                         | Then                                                                                                  | Evidence                          |
| --------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------- |
| C-USE-item-sheet-linear-syncing-1 | Any change to a linked field | The sheet shows the new value at once and "Updating Linear" with a small spinner until Linear answers | `captures/linear-syncing-402.png` |
