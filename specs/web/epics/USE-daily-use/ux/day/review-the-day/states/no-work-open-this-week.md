---
target: specs/web/ux/day/review-the-day/states/no-work-open-this-week.md
status: approved
promoted:
boards:
  - name: "review-day / no-work, open this week / 402 / light"
    page: "USE — daily use"
    at: [0, 5160]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/no-work-open-this-week-402.png
rulings: [D-USE-2, D-USE-22]
---

# Review the day — no work, Open This week

Where "Open This week" lands. Drawn at low detail: it shows Set my days only as far as the link's landing; Set my days itself is `../../../set-my-days/set-my-days/index.md` (step 9, "USE — set up"). Its note is the "Note · success" at x 0, y 6090.

## What shows, top to bottom

- Status bar 6:58. `Breadcrumb` "‹ Today" over the title "Set my days".
- A `SegmentedControl`, "Usual week" and "This week" (picked, outlined).
- Day chips Mon to Sun; "Mon 12" filled ink.
- A hairline, then "Monday · opened at Work" (label, muted).
- The Work block 9:30 to 12:00 (sky, 3 px edge) with four tier groups, each an uppercase caption heading and an add row: "URGENT" "+ Add to Urgent", "PRIMARY" "+ Add to Primary", "SECONDARY" "+ Add to Secondary", "STRETCH" "+ Add to Stretch".
- Work 13:00 to 15:00, head only.
- "[low detail: Set my days is step 9; this shows only where the link lands]" (caption, muted).

## What the person can do

- An Add row there adds to this week's Monday (Set my days' rules).
- "‹ Today" goes back to Review the day, as it was [ASSUMPTION: the back is "‹ Today" as drawn, though Review the day is the screen left].

## Words

"‹ Today", "Set my days", "Usual week", "This week", "Monday · opened at Work", "Add to <Tier>".

## The notes on the boards

**"review-day / no-work, open this week / 402 / light"**, "Note · success" @ x 0, y 6090:

> no-work · Open This week
>
> Goes to Set my days, This week, on Monday, scrolled to the Work block with its four Add rows. Back is "‹ Today". Low detail until step 9 draws Set my days.

## Rulings

- D-USE-2, D-USE-22: work is set with the week; Open This week is the third row on an empty Work block.

## Widths

Drawn at: 402. At 1024 and wider Set my days is list-detail (D-USE-39 (3)); the link opens Monday selected, at its Work block.

## Criteria

| ID                                            | When           | Then                                                                 | Evidence                                  |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| C-USE-review-the-day-no-work-open-this-week-1 | Open This week | Set my days, This week, today's day chip, scrolled to the Work block | `captures/no-work-open-this-week-402.png` |
| C-USE-review-the-day-no-work-open-this-week-2 | Back           | Review the day as it was                                             | test                                      |
