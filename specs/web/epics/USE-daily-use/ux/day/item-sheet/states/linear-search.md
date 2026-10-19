---
target: specs/web/ux/day/item-sheet/states/linear-search.md
status: approved
promoted:
boards:
  - name: "item-sheet / Linear search / 402 / light"
    page: "USE — set up"
    at: [482, 7560]
    note: "Frame @ x 482, y 8490"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/linear-search-402.png
rulings: [D-USE-36, D-USE-37, D-USE-60, D-USE-103]
---

# Item sheet — Linear search

"Link a Linear issue", a step inside the sheet of a work item that is not linked yet (here the add sheet's "[Draft the onboarding email]" in Primary). `?state=linear-search`.

## What shows, top to bottom

- The sheet near full height (top at y 152); Review the day's header shows above it.
- Back link on the left: "‹ [Draft the onboarding email]" (the item's name).
- Scope line "Work · 9:30 to 12:00 · Primary"; title "Link a Linear issue".
- `SearchField`: "Search Linear issues".
- `SegmentedControl` of workspaces: "All" (selected), "[Lighthouse]", "[Studio]" (one tab per connected workspace).
- Group heading "Assigned to Taylor", then rows: project emoji in its slot, the issue title, under it "<project> · <ID> · <length range>" muted, and on the right "<points> <size word>". Drawn: "[Add retry queue metrics]", "Sync engine · ENG-151 · 30 min to 1 h", "2 Small"; "[Flaky test in the sync suite]", "Sync engine · ENG-142 · 1 to 2 h", "3 Medium"; greyed, "[Fix the sync retry]", "ENG-123 · already on today, in Primary" (no size).
- Group heading "Other open issues": "[Lay out the booking page]", "Website · STU-14 · 15 to 30 min", "1 Quick".
- Footer line, muted: "Tap one to link it. The item takes the issue's title, size, project emoji and description; any notes it had are added to the end of the description, with Undo. [PROPOSED]"

## What the person can do

- Tap an issue: it links and returns to the item (now `linear-linked.md`), no primary. A greyed issue already on today cannot be picked [ASSUMPTION: it is inert; the boards only grey it].
- Type to search open issues; switch workspace tabs. Back returns to the item unchanged.

## Words

"Link a Linear issue"; "Search Linear issues"; "All"; "Assigned to Taylor"; "Other open issues"; "already on today, in <Tier>"; the footer line above.

## The notes on the boards

**item-sheet / Linear search / 402 / light** (Frame @ x 482, y 8490):

> Linear search · new [PROPOSED]
>
> From "Link a Linear issue" on a work item; back on the left to the item. All, then a tab per workspace. Open issues only, "Assigned to Taylor" first, then the rest; one already on today is greyed with where it sits. One tap links and returns, so no primary. The item takes the issue's title, size, project emoji and description (round 3: notes join the description).

## Rulings

- D-USE-36: Notes and Linear's description are one value; on link, notes join the end of the description with Undo (`../../../dev-notes/notes-and-description.md`).
- D-USE-37, D-USE-60 (2): approved as drawn, with Description.
- N2: a `SearchField` over the person's open issues, assigned first.

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                               | When                | Then                                                                                                                           | Evidence                         |
| -------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| C-USE-item-sheet-linear-search-1 | Link a Linear issue | Open issues only, Assigned to Taylor first; one already on today greyed with where it sits                                     | `captures/linear-search-402.png` |
| C-USE-item-sheet-linear-search-2 | An issue is tapped  | The item takes its title, size, project emoji and description, keeps its notes at the description's end with Undo, and returns | manual                           |
