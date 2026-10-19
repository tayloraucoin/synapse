---
target: specs/web/ux/interactions/move-to/states/pick-a-day.md
status: approved
promoted:
boards:
  - name: "item-sheet / move to, pick a day / 402 / light"
    page: "USE — set up"
    at: [1928, 6300]
    note: "Frame @ x 1928, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/interactions/move-to/captures/pick-a-day-402.png
rulings: [D-USE-37, D-USE-60, D-USE-65, D-USE-103]
---

# Move to — Pick a day

From Move to's "Pick a day", Thursday 15 tapped.

## What shows, top to bottom

- The sheet from y 152. Back link "‹ Move to". Scope line "Meditate · 10 min · in Wellness, 7:05 to 8:00"; title "Pick a day".
- Month header "October 2026" with ‹ (muted, the past) and › on the right.
- A month grid, Monday first: "Mon Tue Wed Thu Fri Sat Sun" muted; past days (1 to 11) faded; today, 12, ringed in ink; days already set marked by a small dot under the number (12 to 17 here); the picked day (15) a filled ink disc with white numerals. [PROPOSED] new component: a month grid (Plumb; not `DateField`).
- Legend under the month, muted: a dot and "Already set for that day".
- A hairline, then the consequence row with the kind-colour bar: "Thursday 15 October, Wellness 7:05" and muted "At the end of Wellness · fits, 15 min free".
- Footer: a full-width filled "Move to Thursday"; under it muted "Undo is offered after. Monday's usual is unchanged."

## What the person can do

- Tap a day: the consequence row and the button follow it. › goes to the next month; past days cannot be picked.
- "Move to <weekday>" moves, closes the sheet and offers Undo in the toast. Back returns to Move to.

## Words

"Pick a day"; "<Month> <year>"; weekday initials; "Already set for that day"; "<Weekday> <d> <Month>, <block> <start>"; "At the end of <block> · fits, <n> min free"; "Move to <weekday>"; "Undo is offered after. Monday's usual is unchanged."

## The notes on the boards

**item-sheet / move to, pick a day / 402 / light** (Frame @ x 1928, y 7230):

> Pick a day · round 3 [PROPOSED]
>
> From Move to's Pick a day, back on the left to Move to. A month, Monday first; past days faded, today ringed in ink, days already set marked by a small dot. Tapping a day shows its consequence under the month (where it lands, the room left); one primary, Move to <day>, closes with Undo in the toast. Next month by the arrow; [ASSUMPTION] no limit on how far ahead.

## Rulings

- D-USE-37: Pick a day approved: a month, days already set marked quietly, the consequence line. D-USE-60 (2).
- The button names a weekday only ("Move to Thursday") within the next seven days; a day past this week reads "Move to <Weekday> <d>", as "Move to Fri 23" [the boards draw only a day this week] (D-USE-65).

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): as at 402 inside the right-side panel.

## Criteria

| ID                         | When            | Then                                                                                 | Evidence                      |
| -------------------------- | --------------- | ------------------------------------------------------------------------------------ | ----------------------------- |
| C-USE-move-to-pick-a-day-1 | A day is tapped | The consequence row names where it lands and the room left; the button names the day | `captures/pick-a-day-402.png` |
| C-USE-move-to-pick-a-day-2 | Past days       | Faded and not pickable; today ringed; set days dotted with the legend                | `captures/pick-a-day-402.png` |
