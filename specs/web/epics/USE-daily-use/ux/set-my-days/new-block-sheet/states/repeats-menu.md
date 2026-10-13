---
target: specs/web/ux/set-my-days/new-block-sheet/states/repeats-menu.md
status: approved
promoted:
boards:
  - name: "new-block / repeats menu open / 402 / light"
    page: "USE — set up"
    at: [3374, 5040]
    note: "Frame @ x 3374, y 5970"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/captures/repeats-menu-402.png
rulings: [D-USE-28, D-USE-34, D-USE-80, D-USE-87]
---

# New block sheet — Repeats menu open

Repeats tapped on the To-dos sheet of `todos-kind.md` (Sunday reset, Sunday 18 October, 13:00 to 16:00). `?sheet=new-block&state=repeats-menu` [ASSUMPTION: the state param].

## What shows, top to bottom

- The sheet as `todos-kind.md`, the Repeats trigger reading "Weekly on Sunday".
- A shadcn dropdown under the trigger, right-aligned and overlapping Colour and the lines (D-USE-28's menu: background token, hairline border, 10 px radius, one soft shadow):
  - "Does not repeat"; "Daily"; "Weekly on Sunday" (picked: muted fill, trailing check); "Monthly on the third Sunday"; "Annually on 18 October"; "Every weekday, Monday to Friday";
  - a separator; "Custom…".

## What the person can do

- Pick a preset: the trigger shows it and the consequence line follows ("Goes in on Sundays…").
- **Custom…** opens `custom-recurrence.md` as a step inside the sheet, back on the left.
- Escape or a tap outside closes the list with no change.

## Words

The presets, worded from the start date: "Does not repeat" · "Daily" · "Weekly on <weekday>" · "Monthly on the <nth> <weekday>" · "Annually on <day> <month>" · "Every weekday, Monday to Friday" · "Custom…".

## The notes on the boards

**"new-block / repeats menu open / 402 / light"**, "Frame" @ x 3374, y 5970:

> Repeats menu (round 5)
>
> [PROPOSED] Google Calendar's presets, worded from the start date: Does not repeat, Daily, Weekly on Sunday, Monthly on the third Sunday, Annually on 18 October, Every weekday, Custom. Default: weekly on its day from the usual week, Does not repeat from This week.

## Rulings

- D-USE-80: Google Calendar's presets stand, as this frame draws them; the [PROPOSED] closes, with the note's default (weekly on its day from the usual week, Does not repeat from This week).
- A block stores one repeat rule (RFC 5545 RRULE, as Google does), not one copy per weekday, and shows on every day the rule hits in the usual week (round 5).
- **Superseded, not carried as a state:** `new-block / repeats open / 402 / light` (p-4-0, x 3856, y 5040), by D-USE-80. Its note, "Frame" @ x 3856, y 5970, in full:

  > Repeats, open
  >
  > A shadcn dropdown: This Monday only, Weekly on Monday (ticked), Every weekday, Every day, then Pick days…. [PROPOSED] This Monday only puts the block on this week's Monday 12 instead of the usual week.

  Its "This Monday only" reads here as Does not repeat; its "Pick days…" as Custom…. The canvas is not edited.

- Decided (D-USE-87) How a monthly or yearly block shows in a usual week of seven weekdays (open-5, "Repeats, framing round 5"). Default: it appears in This week on its dates only, with a line in the usual week's day row (not drawn; its words go to Gloss).

## Widths

Drawn at: 402. At 1024 and wider: the same list from the trigger in the right panel at `--sheet-w` (D-USE-39, D-USE-83).

## Criteria

| ID                                   | When                                    | Then                                                | Evidence                        |
| ------------------------------------ | --------------------------------------- | --------------------------------------------------- | ------------------------------- |
| C-USE-new-block-sheet-repeats-menu-1 | Repeats tapped, start Sunday 18 October | The six presets worded from that date, then Custom… | `captures/repeats-menu-402.png` |
| C-USE-new-block-sheet-repeats-menu-2 | Opened from This week                   | "Does not repeat" is picked                         | test                            |
| C-USE-new-block-sheet-repeats-menu-3 | Any preset is saved                     | One repeat rule is stored, not a copy per day       | test                            |
