---
target: specs/web/ux/set-my-days/set-my-days/layout.md
status: approved
promoted:
---

# Set my days — layout, top to bottom

The layout section of [`index.md`](index.md), split to keep the index under its cap. Phone 402; the 1024 list-detail is in [`states/the-day.md`](states/the-day.md). Each state file says only what differs.

1. **Status bar**, then the **header**: `Breadcrumb` [PROPOSED] over the title. On the week: "‹ Now" over "Set my days". On every day, Usual week or This week: "‹ Week" (back to the week it came from) over "Every Monday" or the dated "Monday, 12 October" (D-USE-134). `SaveStatus` at the end of the crumb row, "✓ Saved" ([`states/saved.md`](states/saved.md)).
2. **Which week:** `SegmentedControl`, "Usual week" | "This week", full width, on the week only; a day has none (D-USE-134).
3. **On the week:** the week stepper ("‹ 12 to 18 Oct ›"; "Every week" with the arrows hidden in Usual week), then the **seven-day list**: per row the day (17 px semibold, a 110 px slot), its bounds ("7:00 to 22:30", or "All day"), a chevron, a **day strip** (8 px, segments in kind colours, 2 px gaps, Orient's ink sliver first) and one muted line naming what is there or still to do, never a count. A day not set reads "Not set yet" with "Set day" in the chevron's place: the whole row is the one button, "Set day" its label (outlined, 32 px, inside a row of 52 px and more) (2026-10-19 feedback; boards passed). Copy from is not on the row; it is offered inside the day ([`states/copy-offer.md`](states/copy-offer.md), [`states/empty-day.md`](states/empty-day.md)) and in its ··· ([`states/day-menu.md`](states/day-menu.md)).
4. **On a day:** `WeekdayChips` (seven 44 × 48 chips, the open one ink; a dot under a built day; dated in This week, "M 12"), the **bounds row** ("Up at" and "Lights out" as compact `TimeField`s and the `EllipsesMenu` ···; the day's name is in the title, so the row stands alone in both weeks, D-USE-134), a hairline, then the **day column**: `ScheduleAxis` at 96 px an hour, Orient as an ink line with its label, the lock and "Orient · 5 min", on a chip in the background colour, fully opaque and fully rounded, the bar and chip centred on the hour hairline, so no hour line runs through it (D-USE-134; [`states/usual-day.md`](states/usual-day.md)), `ScheduleBlock`s at true height (a 3 px rule in the kind colour, name and span, item bullets or icons inside, "+2 more"), transitions in italics with a dash, meals as dashed `BlockBand`s with a fork and knife.
5. **The +** [PROPOSED]: a round 56 px ink button, bottom right above the safe area, on every day ([`states/plus-menu.md`](states/plus-menu.md)).

Kind colours: Wellness leaf, Training clay, Work sky, Evening slate, Break and meals the muted fill, To-dos moss, Life yellow #C9A227 / #F6EDC4 (a ninth hue, D-USE-38, D-USE-79; frame names and notes still say "rose"). Kinds carry no badge in the column; the name says the kind.

Work tiers inside a Work block: an 8 px square and the tier name, Urgent red (when it holds something), Primary leaf, Secondary amber, Stretch slate (D-USE-79; frames drawn before it show Stretch sky). In the usual week a Work block holds its time and two muted lines, "The time is kept every week." and "Work goes in on This week." (open-3 round 1; the Archive A frame, cited in [`states/the-day.md`](states/the-day.md)); a To-dos block holds its rule ([`states/usual-saturday.md`](states/usual-saturday.md)).

**The URL** (2026-10-19 feedback): `/days?week=usual|this|<ISO week>&day=`, where `day` is a weekday key, `mon` to `sun` (the block route's `DAYS_BLOCK_WEEKDAYS`), or a date key in a dated week (`2026-10-12`, which names its week). `day=0` to `6` (Monday 0) is still read, so old links open the same day; the app writes only the keys.
