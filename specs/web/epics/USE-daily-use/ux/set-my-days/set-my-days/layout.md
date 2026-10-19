---
target: specs/web/ux/set-my-days/set-my-days/layout.md
status: approved
promoted:
---

# Set my days — layout, top to bottom

The layout section of [`index.md`](index.md), split to keep the index under its cap. Phone 402; the 1024 list-detail is in [`states/the-day.md`](states/the-day.md). Each state file says only what differs.

1. **Status bar**, then the **header**: `Breadcrumb` [PROPOSED] ("‹ Now" on the week and in Usual week's day; "‹ Week" on a This week day) over the title, "Set my days" or the dated title "Monday, 12 October". `SaveStatus` at the trailing edge, "✓ Saved" ([`states/saved.md`](states/saved.md)).
2. **Which week:** `SegmentedControl`, "Usual week" | "This week", full width (on the week, and on a Usual week day).
3. **On the week:** the week stepper ("‹ 12 to 18 Oct ›"; "Every week" with the arrows hidden in Usual week), then the **seven-day list**: per row the day (17 px semibold, a 110 px slot), its bounds ("7:00 to 22:30", or "All day"), a chevron, a **day strip** (8 px, segments in kind colours, 2 px gaps, Orient's ink sliver first) and one muted line naming what is there or still to do, never a count. A day not set reads "Not set yet" with a "Copy from…" button.
4. **On a day:** `WeekdayChips` (seven 44 × 48 chips, the open one ink; a dot under a built day; dated in This week, "M 12"), the **day line** (the day's name with "Up at" and "Lights out" as compact `TimeField`s and the `EllipsesMenu` ···; in This week the name moves to the title and the bounds row stands alone), a hairline, then the **day column**: `ScheduleAxis` at 96 px an hour, Orient as an ink line with a lock, "Orient · 5 min", `ScheduleBlock`s at true height (a 3 px rule in the kind colour, name and span, item bullets or icons inside, "+2 more"), transitions in italics with a dash, meals as dashed `BlockBand`s with a fork and knife.
5. **The +** [PROPOSED]: a round 56 px ink button, bottom right above the safe area, on every day ([`states/plus-menu.md`](states/plus-menu.md)).

Kind colours: Wellness leaf, Training clay, Work sky, Evening slate, Break and meals the muted fill, To-dos moss, Life yellow #C9A227 / #F6EDC4 (a ninth hue, D-USE-38, D-USE-79; frame names and notes still say "rose"). Kinds carry no badge in the column; the name says the kind.

Work tiers inside a Work block: an 8 px square and the tier name, Urgent red (when it holds something), Primary leaf, Secondary amber, Stretch slate (D-USE-79; frames drawn before it show Stretch sky). In the usual week a Work block holds its time and two muted lines, "The time is kept every week." and "Work goes in on This week." (open-3 round 1; the Archive A frame, cited in [`states/the-day.md`](states/the-day.md)); a To-dos block holds its rule ([`states/usual-saturday.md`](states/usual-saturday.md)).
