---
target: specs/web/ux/set-my-days/set-my-days/states/empty-first-day.md
status: approved
promoted:
boards:
  - name: "set-my-days / empty, first day / 402 / light"
    page: "USE — set up"
    at: [0, 0]
    note: "Note · name only, 80"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/empty-first-day-402.png
rulings: [D-USE-33, D-USE-49]
---

# Set my days — empty, first day

Nothing is set yet: the first day, Monday, in Usual week. `?state=empty-first-day`. Its note is "Note · name only, 80" at x 0, y 930.

## What shows, top to bottom

- Status bar 21:10. `Breadcrumb` [PROPOSED] "‹ Now" over "Set my days". No `SaveStatus` shows (nothing saved yet).
- `SegmentedControl`, "Usual week" selected, "This week".
- `WeekdayChips`: "M" ink (open), T W T F S S outlined, no dots (no day built).
- Day line: "Monday" and the ··· only; the compact bounds fields are not in the line. A hairline.
- `EmptyState` (left-aligned, 20 px sides, 32 px under the hairline): "Set when the day starts and ends." (heading, semibold), then "They are the top and bottom of the day. Blocks go in between. Orient takes the first 5 minutes." (body, muted).
- **Bounds fields** [PROPOSED], two `TimeField`s side by side, each labelled above: "Up at" with "7:00", "Lights out" with "22:30", each with a clock glyph at the trailing edge. The values are grey suggestions, not set. "Up at" carries the ink focus edge.
- No column, no Orient, no +: they wait until both times are set.

## What the person can do

- Set "Up at" and "Lights out". When both are set the column appears with Orient at "Up at", and the + shows [ASSUMPTION: the day then reads as [`copy-offer.md`](copy-offer.md) without the copy button, since no day is built; it is the empty day of [`empty-day.md`](empty-day.md)].
- Switch day or week; open the ··· ([`day-menu.md`](day-menu.md)); "‹ Now" goes back.

## Words

"Set when the day starts and ends." · "They are the top and bottom of the day. Blocks go in between. Orient takes the first 5 minutes." · "Up at" · "Lights out" · suggestions "7:00", "22:30".

## The notes on the boards

**"set-my-days / empty, first day / 402 / light"**, "Note · name only, 80" @ x 0, y 930:

> Empty, first day
>
> Nothing set yet. [PROPOSED] The two time fields move into the empty state under its line, labelled above, instead of sitting small in the day line; the column and the + wait until both are set. The values shown are grey suggestions, 7:00 and 22:30.

## Rulings

- N2's "empty, first day" row ("The bounds row reads 'Up at' and 'Lights out' with no times"), drawn with the fields moved into the empty state (open-3 round 1); its [PROPOSED] stands as drawn under D-USE-49 (the lock).
- D-USE-33: the round 4 states it sits beside (saved, loading, error, offline) are their own files.

## Widths

Drawn at: 402. At 1024 the week pane lists seven "Not set yet" rows and the day pane holds this empty state, with the selected day Monday (D-USE-39 (3): a day is always selected) [ASSUMPTION].

## Criteria

| ID                                  | When                           | Then                                                                     | Evidence                           |
| ----------------------------------- | ------------------------------ | ------------------------------------------------------------------------ | ---------------------------------- |
| C-USE-set-my-days-empty-first-day-1 | No day is set                  | The line, the two labelled fields with grey suggestions; no column, no + | `captures/empty-first-day-402.png` |
| C-USE-set-my-days-empty-first-day-2 | Both times are set             | The column appears with Orient at "Up at" and the +                      | test                               |
| C-USE-set-my-days-empty-first-day-3 | A suggestion is left untouched | It is not saved as a time                                                | test                               |
