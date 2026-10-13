---
target: specs/web/ux/set-my-days/set-my-days/states/empty-day.md
status: approved
promoted:
boards:
  - name: "set-my-days / empty day, usual Thursday / 402 / light"
    page: "USE — set up"
    at: [3856, 0]
    note: "Frame @ x 3856, y 930"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/empty-day-402.png
rulings: [D-USE-30, D-USE-32, D-USE-33, D-USE-85]
---

# Set my days — an empty day (usual Thursday)

A day with its bounds set and no blocks yet, in Usual week, with other days built. `?state=empty-day`. The layout is [`../index.md`](../index.md)'s. The first day ever, with no bounds, is [`empty-first-day.md`](empty-first-day.md); a day with bounds just set and the copy offer is [`copy-offer.md`](copy-offer.md). Its note is "Frame" at x 3856, y 930.

## What shows, top to bottom

- **Status bar:** 21:10. **Header:** "‹ Week", "Saved" with a check. Title "Every Thursday" (Usual week).
- **Day chips**, undated: M, T, W, T (selected, ink), F, S, S. Dots under Monday, Tuesday, Wednesday and Sunday (built); none under Thursday, Friday, Saturday.
- **Bounds row:** "Up at 7:00", "Lights out 22:30", the ···.
- **The column:** Orient's line at 7:00 with the lock, "Orient · 5 min". Under it, not centred, a dashed card:
  - "Nothing on Thursday yet." (strong), then "Start from a day that's built, or add the first block." (muted).
  - A secondary button with the copy icon, "Copy from Monday", and beside it the text button "Other day…".
  - "or tap a time, or +, to add a block" (muted).
- Empty rail with hour lines 9 to 13 below; the round + at the bottom right.

## What the person can do

- **Copy from Monday:** the day is empty, so it copies at once with a Toaster and Undo; Replace's confirm comes only when the day has blocks (D-USE-32). The flow is [`../../../interactions/copy-from/index.md`](../../../interactions/copy-from/index.md).
- **Other day…:** the Copy from picker ([`../../../interactions/copy-from/states/copy-picker.md`](../../../interactions/copy-from/states/copy-picker.md)).
- **Tap a time:** [`tap-a-time.md`](tap-a-time.md). **+:** the + menu without Event ([`plus-menu.md`](plus-menu.md)).
- A chip: another weekday. "‹ Week": back to the week.

## Words

"Every Thursday" · "Nothing on Thursday yet." · "Start from a day that's built, or add the first block." · "Copy from Monday" · "Other day…" · "or tap a time, or +, to add a block". The weekday in each string is the day open; "Monday" is the day Copy from offers.

## The notes on the boards

**"set-my-days / empty day, usual Thursday / 402 / light"**, note "Frame" @ x 3856, y 930:

> New · An empty day (usual Thursday)
>
> Under the Orient line, not centred (pattern 15): "Nothing on Thursday yet.", Copy from Monday, Other day…, and "or tap a time, or +". [ASSUMPTION] Copy from offers the last built weekday before it. In Usual week the title reads "Every Thursday" and the chips carry no dates.

## Rulings

- D-USE-30: an empty day's choice sits under the title, not centred. D-USE-32: Copy from and Replace with Undo.
- Round 3 (open-4) draws this frame with its [ASSUMPTION]: Copy from offers the last built weekday before the day open. Decided (D-USE-85) The note's rule and the drawn button disagree: Tuesday and Wednesday are built, yet the button names Monday. Default: the rule, so Thursday offers Wednesday, and the frame's "Monday" reads as the example word N2 uses ("Copy from Monday").
- [ASSUMPTION] An empty day in This week shows the same card under the dated title ("Thursday, 15 October").

## Widths

Drawn at: 402. Not drawn at: 1024 and wider; list-detail from 1024 (D-USE-83) [ASSUMPTION: the card sits in the day pane under Orient].

## Criteria

| ID                            | When                                | Then                                                                                       | Evidence                     |
| ----------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------- |
| C-USE-set-my-days-empty-day-1 | A day with bounds set has no blocks | The card sits under Orient, not centred, with Copy from <day>, Other day… and the tap line | `captures/empty-day-402.png` |
| C-USE-set-my-days-empty-day-2 | Copy from <day> is tapped on it     | The day copies at once, with a Toaster and Undo; no confirm                                | test                         |
| C-USE-set-my-days-empty-day-3 | The day is in Usual week            | The title reads "Every <weekday>" and the chips carry no dates                             | `captures/empty-day-402.png` |
