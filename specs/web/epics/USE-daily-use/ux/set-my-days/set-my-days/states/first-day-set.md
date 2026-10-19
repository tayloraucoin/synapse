---
target: specs/web/ux/set-my-days/set-my-days/states/first-day-set.md
status: approved
promoted:
boards:
  - name: "set-my-days / first day set, nothing built / 402 / light"
    page: "USE — set up"
    at: [1928, 14000]
    note: "Note · first day set, nothing built"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/first-day-set-402.png
rulings: [D-USE-30, D-USE-49]
---

# Set my days — the first day, just set

Monday in Usual week, its bounds just saved by "Set Monday", and no other day built, so there is nothing to copy. `?state=first-day-set`. New with the 2026-10-19 feedback (boards passed by Taylor, 2026-10-19). Its note is "Note · first day set, nothing built" at x 1928, y 14930.

## What shows, top to bottom

- Status bar 21:10. "‹ Now" over "Set my days"; `SaveStatus` "✓ Saved".
- "Usual week" selected. `WeekdayChips`: "M" ink (open), no dots (no day is built: bounds alone are not a built day).
- Day line: "Monday", the compact `TimeField`s "Up at 7:00" and "Lights out 22:30", the ···. A hairline.
- The column from 7: Orient's ink line with the lock and "Orient · 5 min".
- **The first-block prompt**, under Orient, left-aligned (D-USE-30): "Nothing on Monday yet." (body, semibold), then muted "Tap a time, or +, to add the first block. Once Monday is built, Tuesday can copy it." No copy button: there is no built day to name.
- Empty rail to 12 and beyond; the + bottom right.

## What the person can do

- Tap a time: [`tap-a-time.md`](tap-a-time.md). The +: [`plus-menu.md`](plus-menu.md).
- Change a bound from the day line (typing, or the clock: [`time-picker.md`](time-picker.md)).
- A chip opens another weekday: unset, it shows [`empty-first-day.md`](empty-first-day.md)'s fields; once Monday has a block, the next day set shows [`copy-offer.md`](copy-offer.md) with "Copy from Monday".
- "‹ Now" goes back; the week ([`usual-week.md`](usual-week.md)) shows Monday with its bounds.

## Words

"Nothing on Monday yet." · "Tap a time, or +, to add the first block. Once <weekday> is built, <next weekday> can copy it." The weekdays are the day open and the one after it [ASSUMPTION: Sunday names Monday].

## The notes on the boards

**"set-my-days / first day set, nothing built / 402 / light"**, "Note · first day set, nothing built" @ x 1928, y 14930:

> 2b · The first day, just set
>
> The column appears with Orient at Up at and the +. With no other day built there is nothing to copy, so the card under Orient offers only the first block. The next day opens from the chips; it shows empty-day.md's card with "Copy from Monday".

## Rulings

- D-USE-30: an empty day's choice sits under Orient, not centred.
- Feedback 2026-10-19: the consequence of the first day's forward button ([`empty-first-day.md`](empty-first-day.md) C-2); it replaces that file's old [ASSUMPTION] of "copy-offer without the copy button".

## Widths

Drawn at: 402. At 1024 the prompt sits under Orient in the day pane; the week pane's Monday row shows its bounds and no strip [ASSUMPTION].

## Criteria

| ID                                | When                                     | Then                                                                         | Evidence                         |
| --------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------- |
| C-USE-set-my-days-first-day-set-1 | Bounds set, no blocks, no other day built | Orient, then "Nothing on Monday yet." and the tap line; no Copy from button | `captures/first-day-set-402.png` |
| C-USE-set-my-days-first-day-set-2 | Another weekday is built                 | The prompt gives way to the copy offer (`copy-offer.md`)                     | test                             |
