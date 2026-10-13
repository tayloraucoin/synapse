---
target: specs/web/ux/interactions/ready-go/states/late-wake.md
status: approved
promoted:
boards:
  - name: "ready-go / welcome, late wake / 402 / light"
    page: "USE — daily use"
    at: [964, 8940]
    note: "Frame @ x 964, y 9870"
    capture: specs/web/epics/USE-daily-use/ux/interactions/ready-go/captures/late-wake-402.png
rulings: [D-USE-71]
---

# The Ready, go hand-off — late wake

Ready, go at 8:22, after a late review ([`../../../day/review-the-day/states/late.md`](../../../day/review-the-day/states/late.md)): Training began at 8:15. Its note is the "Frame" at x 964, y 9870.

## What shows, top to bottom

As [`welcome.md`](welcome.md), with these changes:

- The status bar reads 8:22; "Today, as I see it" shows as on the welcome.
- The bar: Wellness faded (its "W" muted), the verdigris now-tick inside Training, the rest as the welcome.
- The heading reads "Now", not "First". Rows: a filled dot in Training's colour, "Training" (bold) "under way, until 8:57"; "then Breakfast" "9:00"; "then Work" "9:30".
- The button "Start Training"; caption: "Planned from 8:15. Pick up where it is."

## What the person can do

- **Start Training:** Now opens on Training (`../../../day/now/index.md`), the item the plan puts at now lifted (Rulings, kept from round 1).
- **‹ Review the day:** back, nothing undone.

## Words

"Now" · "under way, until <end>" · "Start <block>" · "Planned from <start>. Pick up where it is." Never "late", never "missed". [placeholder] until Gloss.

## The notes on the boards

**"ready-go / welcome, late wake / 402 / light"**, "Frame" @ x 964, y 9870:

> Late wake · 8:22
>
> The heading reads Now, not First: Training, "under way, until 8:57". Wellness sits faded on the bar, behind the now-tick, never marked missed. The button is Start Training, with "Planned from 8:15. Pick up where it is."

## Rulings

- D-USE-71: as drawn.
- Replaces round 1's `ready-go / late wake, block under way / 402 / light` (`../../../boards/use-daily-use/archive-2.md`).
- Kept from round 1, `ready-go / late wake, block under way / 402 / light` (its note: "The current item is the one the plan puts at now."): after Start Training, Now lifts the item the plan puts at now. [ASSUMPTION, from that note: the drive lifts as an item here; N4 shows transitions as slim bands, to settle in build.]

## Widths

Drawn at: 402. Wider: as [`welcome.md`](welcome.md) › Widths (D-USE-39).

## Criteria

| ID                         | When                            | Then                                                     | Evidence                     |
| -------------------------- | ------------------------------- | -------------------------------------------------------- | ---------------------------- |
| C-USE-ready-go-late-wake-1 | Ready, go after a block's start | "Now", the block "under way, until <end>", Start <block> | `captures/late-wake-402.png` |
| C-USE-ready-go-late-wake-2 | A block before now              | Faded on the bar; no "missed", nothing red               | `captures/late-wake-402.png` |
