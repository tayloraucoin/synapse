---
target: specs/web/ux/day/item-sheet/states/linear-linked.md
status: approved
promoted:
boards:
  - name: "item-sheet / Linear linked / 402 / light"
    page: "USE — set up"
    at: [964, 7560]
    note: "Frame @ x 964, y 8490"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/linear-linked-402.png
rulings:
  [
    D-USE-35,
    D-USE-36,
    D-USE-37,
    D-USE-42,
    D-USE-60,
    D-USE-39,
    D-USE-65,
    D-USE-103,
  ]
---

# Item sheet — Linear linked

A work item linked to ENG-123, opened from Review the day at 6:58 (the step 8 item view). The base for every `linear-*` state. `?state=linear-linked`.

## What shows, top to bottom

- The sheet at full height (top at y 58), grabber; × left, ··· right (no Swap on a work item).
- Scope line "Work, 9:30 to 12:00 · Primary · today only".
- Title row: the project emoji tile (sync arrows on pale blue) and "[Fix the sync retry]".
- `LinearLine` [PROPOSED]: a bordered status chip, the In progress shape (yellow ring, part filled, D-USE-35) plus "In progress" and a chevron; "ENG-123" (semibold, `figure`); "Sync engine" muted; "Linear ↗" right-aligned.
- **Size**: label, and on the right muted "Linear's estimate, both ways"; five equal cards, point over word: "1 Quick", "2 Small", "3 Medium" (selected: ink border, bold), "5 Large", "8 Huge".
- **Length**: label, and on the right a `SegmentedControl` "Exact" / "Range" (Range selected); two steppers "− 1 h +" "to" "− 2 h +" (`RangeEditor`); helper "Set from Medium; change it freely. The day plans with 2 h, the top of the range."
- **Tier**: a `SegmentedControl` with a colour square before each word: "Urgent" (red), "Primary" (leaf green, selected), "Secondary" (amber), "Stretch" (slate blue).
- **Priority** `ListRow`: High's yellow bars and "High", chevron.
- **Assignee** `ListRow`: an avatar with "T" and "Taylor", chevron.
- **Description**: label, muted "Synced with Linear" right; a bordered box with three lines of the issue's description "[Retries fire twice when the socket drops mid-flush. Dedupe on the mutation id before requeueing, and add a test for the drop.]" and "Show all".
- No Start or Done before the day begins; no When row (the scope line holds it).

## What the person can do

- The status chip opens Linear's statuses (`../../../interactions/linear-status/index.md`); a change writes to Linear (`linear-syncing.md`).
- A size card sets Linear's estimate and the length range; Exact or Range; steppers change the range freely.
- A tier segment moves it to that tier for today. Priority opens `linear-priority.md`; Assignee opens a list of the workspace's members [ASSUMPTION: not drawn].
- Description edits in place, as plain text with markdown kept, and goes to the issue ("Show all" expands).
- "Linear ↗" opens the issue in Linear. ··· opens `linear-more-open.md`.

## The notes on the boards

**item-sheet / Linear linked / 402 / light** (Frame @ x 964, y 8490):

> Linear linked · new
>
> The step 8 item view, opened from Review the day at 6:58: status in the workspace's colours, ENG-123, project, "Linear ↗" (Open in Linear), Size, Length range, Tier, then N2's Priority and Assignee as 56 px rows synced from Linear. No Start or Done before the day begins: edits save in place. When is dropped; the scope line holds it.

## Rulings

- D-USE-35: the status is drawn as Linear draws it (In progress yellow, part filled; `../../../interactions/linear-status/index.md`).
- D-USE-36: High in yellow; a tier looks the same with or without Linear; Description is one value with Notes.
- D-USE-42: priority colours Urgent red, High yellow, Normal blue, Low grey at the desk (amends D-USE-36's Normal); this frame shows High only.
- D-USE-37, D-USE-60 (2): approved; the sheet gains Description and the priority picker.
- Size words and points come from step 8's "item view, size and length range" ([`size-and-length.md`](size-and-length.md); rules in `../../../dev-notes/size-and-length.md`).
- Step 8's superseded frame `now-work / item view, full, Linear / 402 / light` ("USE — daily use", x 1928, y 17760; its note at y 18690), whose layout this file takes (D-USE-65: the Linear card from Now gives way to Linear linked's layout), adds: the sheet opens partway and a drag up on the grabber gives the full view (no wide form, D-USE-39); view and edit are one screen, every field edits in place (title, status, length, tier, when, description), no Edit mode; the description from Linear reads in Newsreader (the review body face). Its "Notes stay in Synapse" is superseded by D-USE-36 (one value, `../../../dev-notes/notes-and-description.md`); its When row by the scope line.

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                               | When                                      | Then                                                                                                      | Evidence                         |
| -------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-item-sheet-linear-linked-1 | A linked item opens before the day begins | Status chip, ID, project, Linear ↗, Size, Length, Tier, Priority, Assignee, Description; no Start or Done | `captures/linear-linked-402.png` |
| C-USE-item-sheet-linear-linked-2 | A size card is picked                     | Linear's estimate changes and the range is reset from it; the day plans with the top                      | manual                           |
