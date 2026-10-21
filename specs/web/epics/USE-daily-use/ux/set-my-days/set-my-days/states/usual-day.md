---
target: specs/web/ux/set-my-days/set-my-days/states/usual-day.md
status: approved
promoted:
boards:
  - name: "set-my-days / usual Monday, header and Orient chip / 402 / light"
    page: "USE — set up"
    at: [3996, 14000]
    note: "Note · usual Monday, header and Orient chip"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/usual-day-402.png
rulings: [D-USE-134]
---

# Set my days — a usual day (the header and Orient's chip)

The usual Monday opened from the week, built. `?state=usual-day`. New with Taylor's 2026-10-20 notes; it settles the day header the earlier Usual week day frames drew differently, and puts Orient's label on a chip. Its note is "Note · usual Monday, header and Orient chip" at x 3996, y 14930.

## What shows, top to bottom

- Status bar 21:10. `Breadcrumb` [PROPOSED] "‹ Week" over the title "Every Monday"; `SaveStatus` "✓ Saved" at the end of the crumb row. No segmented control: the which-week switch lives on the week.
- `WeekdayChips`, undated: "M" ink (open) with its dot, then "T", "W", "T", "F", "S", "S", a dot under each built day.
- The bounds row alone: "Up at 7:00", "Lights out 22:30", the ··· at the trailing edge. A hairline.
- The column from 7, no now-line:
  - Orient's ink line, then its label on a chip: the lock and "Orient · 5 min" (caption, muted) on the background colour at 88%, fully rounded, 20 px high, 8 px either side. The 7 o'clock hour line stops at the chip's edges and starts again after it.
  - **Wellness** 7:05 to 8:00, **Training** 8:00 to 8:57, the **Breakfast** meal band, as [`the-day.md`](the-day.md).
  - **Work** 9:30 to 12:00, holding its time with two muted lines: "The time is kept every week." and "Work goes in on This week."
  - **Lunch** 12:00 to 13:00, a dashed meal band; Work at 13:00 below the fold.
- The + bottom right.

## What the person can do

As the surface ([`../index.md`](../index.md)): "‹ Week" goes back to the week, Usual week, scrolled as left; the chips switch day; bounds, ···, a block, a tap on the rail and the + as on every day.

## Words

"Week" (the crumb); "Every Monday" (the title; "Every <weekday>" for each usual day); "Saved"; "Orient · 5 min"; "The time is kept every week."; "Work goes in on This week."

## The notes on the boards

**"set-my-days / usual Monday, header and Orient chip / 402 / light"**, "Note · usual Monday, header and Orient chip":

> 5 · A day's header, and Orient on a chip
>
> Taylor, 2026-10-20. The day's header is what the app shows: "‹ Week" back to the week it came from, over the title ("Every Monday" in Usual week, "Monday, 12 October" in This week), with SaveStatus at the crumb row's end. A day has no Usual week | This week control; it lives on the week. "‹ Now" is the week's crumb only. Orient's label sits on a chip in the background colour, slightly translucent, so the hour line stops at its edges instead of running through the words. The same chip wherever the day column draws Orient (Set my days, Review the day, Schedule, the Week's time lens).

## Rulings

- D-USE-134 (1): every day, in either week, has this header; the Usual week day frames that draw "‹ Now" over "Set my days" with the segmented control ([`usual-saturday.md`](usual-saturday.md), [`usual-thursday-evening.md`](usual-thursday-evening.md), [`copy-offer.md`](copy-offer.md), [`empty-first-day.md`](empty-first-day.md), [`first-day-set.md`](first-day-set.md)) are superseded for the header only.
- D-USE-134 (2): Orient's chip is the one drawing of Orient's label. It is the day column's `OrientLine`, so Review the day, Schedule and the Week's time lens take it too; their frames are not redrawn.
- Unchanged: `SaveStatus`'s readings ([`saved.md`](saved.md)); it is hidden offline and absent while the column loads or fails.

## Widths

Drawn at: 402. At 1024 the day pane has no crumb (the week beside it is the way back, [`the-day.md`](the-day.md)); `SaveStatus` sits at the title row's end, and Orient's chip is the same.

## Criteria

| ID                            | When                            | Then                                                                                     | Evidence                     |
| ----------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------- |
| C-USE-set-my-days-usual-day-1 | A usual day opens from the week | "‹ Week" over "Every Monday", `SaveStatus` at the crumb row's end, no which-week control | `captures/usual-day-402.png` |
| C-USE-set-my-days-usual-day-2 | Any day column draws Orient     | The label is on the translucent background chip; no hour line shows through the words    | `captures/usual-day-402.png` |
| C-USE-set-my-days-usual-day-3 | `?state=usual-day`              | This state renders (canon C-P08)                                                         | capture                      |
