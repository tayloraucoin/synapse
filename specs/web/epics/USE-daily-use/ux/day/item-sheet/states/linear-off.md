---
target: specs/web/ux/day/item-sheet/states/linear-off.md
status: approved
promoted:
boards:
  - name: "item-sheet / Linear not connected / 402 / light"
    page: "USE — set up"
    at: [3856, 7560]
    note: "Frame @ x 3856, y 8490"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/linear-off-402.png
rulings: [D-USE-36, D-USE-37, D-USE-103]
---

# Item sheet — Linear not connected

Drawn on the step 4 add sheet ("Add to Primary"), where a new work item would link an issue; the same row stands in the item sheet of an unlinked work item. `?state=linear-off`.

## What shows, top to bottom

- Review the day behind ("‹ Orient", "Monday, 12 October"); the sheet at y 152.
- Header: × left; beside it, small "Work · 9:30 to 12:00 · today only" above the title "Add to Primary".
- **Name**: label; an emoji slot button (an empty smiley outline, 44 px) and an `Input` with "Draft the onboarding email [placeholder]" (focused, ink edge).
- A `ListRow` between hairlines: "Connect Linear", and on the right muted "In Settings, Connections" with a chevron.
- **Tier**: label; the coloured `SegmentedControl` as in `linear-linked.md` (Primary selected).
- **Length**: label; `MinutesStepper` "− 45 min +".
- **Notes (optional)**: label and an empty `Textarea`.
- Footer line: "Goes in today's Work, 9:30 to 12:00. Monday's usual is unchanged." and a full-width filled "Add".

## What the person can do

- **Connect Linear** goes to Settings › Connections; Back returns here.
- The emoji slot opens the icon picker (`../../../interactions/icon-picker/`, `no-name-yet` before a name).
- Add puts the item in today's Work at the tier.

## Words

"Connect Linear"; "In Settings, Connections"; "Goes in today's Work, <span>. Monday's usual is unchanged."; "Add".

## The notes on the boards

**item-sheet / Linear not connected / 402 / light** (Frame @ x 3856, y 8490):

> Linear not connected
>
> On the step 4 add sheet: "Link a Linear issue" reads "Connect Linear", with "In Settings, Connections" so the jump out is named. Back returns here.

## Rulings

- D-USE-36: the add sheet takes the coloured tier control, so a tier looks the same everywhere.
- D-USE-37: approved. N2: "Link a Linear issue" reads "Connect Linear" and goes to Settings.
- The add sheet itself is Review the day's (`review-day / add sheet`, carried there); this frame is filed here by its name.

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                            | When                    | Then                                                                                        | Evidence                      |
| ----------------------------- | ----------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| C-USE-item-sheet-linear-off-1 | Linear is not connected | "Link a Linear issue" reads "Connect Linear" with "In Settings, Connections" and goes there | `captures/linear-off-402.png` |
