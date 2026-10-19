---
target: specs/web/ux/day/item-sheet/states/linear-priority.md
status: approved
promoted:
boards:
  - name: "item-sheet / Linear linked, priority open / 402 / light"
    page: "USE — set up"
    at: [3374, 7560]
    note: "Frame @ x 3374, y 8490"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/linear-priority-402.png
rulings: [D-USE-36, D-USE-37, D-USE-42, D-USE-60, D-USE-103]
---

# Item sheet — Linear linked, priority open

The Priority row tapped on a linked item. `?state=linear-priority`.

## What shows, top to bottom

- `linear-linked.md` behind.
- A `DropdownMenu` (popover) anchored right, over Length and Tier: muted heading "Priority · changes it in Linear"; rows, each a `PriorityMark` then its word: "Urgent" (a filled red square with !), "High" (yellow bars, selected: muted fill and a check on the right), "Normal" (three bars, ink as drawn) with muted "Medium in Linear" on the right, "Low" (grey bars); a rule; "No priority" (a dashed line).

## What the person can do

- Pick one: the issue's priority changes in Linear (`linear-syncing.md` while it writes) and the menu closes.
- Tapping outside closes with nothing changed.

## Words

"Priority · changes it in Linear"; "Urgent"; "High"; "Normal" with "Medium in Linear"; "Low"; "No priority".

## The notes on the boards

**item-sheet / Linear linked, priority open / 402 / light** (Frame @ x 3374, y 8490):

> Linear linked, priority open · round 3 [PROPOSED]
>
> Taylor's colours: Urgent red (a filled square with !), High yellow, Normal in ink (Linear's Medium, named Normal here), Low grey, then No priority. Shape and word always, never colour alone. Changing it changes the issue in Linear. Also round 3: the Description field (one value with Notes) and High in yellow on both Linear linked artboards.

## Rulings

- D-USE-36: Urgent red, High yellow, Normal (Linear's Medium) and Low grey.
- D-USE-42 (later, wins): Normal is blue, not ink. The frame draws Normal in ink; build Normal blue. The Open line's [ASSUMPTION] "Normal is ink" is closed by D-USE-42.
- D-USE-38: Urgent shares one red with Blocked and Paused ("needs you now"), a named bend of "nothing red on the tabs".
- D-USE-37, D-USE-60 (2): the priority picker approved.

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                                 | When                 | Then                                                                                                                      | Evidence                           |
| ---------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-item-sheet-linear-priority-1 | Priority is tapped   | Urgent, High, Normal ("Medium in Linear"), Low, a rule, No priority, each with its mark and word; the current one checked | `captures/linear-priority-402.png` |
| C-USE-item-sheet-linear-priority-2 | A priority is picked | It changes in Linear; Normal draws in blue                                                                                | manual                             |
