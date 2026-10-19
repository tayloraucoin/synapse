---
target: specs/web/ux/day/review-the-day/states/first-mornings.md
status: approved
promoted:
boards:
  - name: "review-day / first mornings / 402 / light"
    page: "USE — daily use"
    at: [482, 3900]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/first-mornings-402.png
rulings: [D-USE-15, D-USE-18]
---

# Review the day — first mornings: the + hint

The first mornings, until the + has taught itself. Its note is the "Note · success" at x 482, y 4830.

## What shows, top to bottom

As [`success.md`](success.md), plus the one-time hint beside the rail +:

- A callout to the right of the + (x 58, 236 wide), `--color-foreground` fill, `--radius-control`, 12 px padding, 8 px gap, with a 6 px pointer on its left edge aimed at the +: "Tap to add. Hold and drag up or down to pick the time." (label, `--color-background`), then "Got it" (label, semibold, `--color-background`).
- It sits over the Lunch band; the rest of the frame is unchanged.

## What the person can do

- "Got it" dismisses the hint for good.
- The first drag of the + dismisses it too ([ASSUMPTION: until the first drag or Got it], D-USE-18).
- Tapping the + adds at the next free time, the hint going with it [ASSUMPTION: a tap alone does not dismiss it; only a drag or Got it, as D-USE-18 has it].
- Everything else as success.

## Words

"Tap to add. Hold and drag up or down to pick the time." · "Got it" (D-USE-18's words, unchanged).

## The notes on the boards

**"review-day / first mornings / 402 / light"**, "Note · success" @ x 482, y 4830:

> first mornings
>
> The same, with the one-time hint beside the rail +: tap to add, hold and drag to pick the time.

## Rulings

- D-USE-18: the + teaches itself, with up and down marks on the button and this hint on the first mornings until the first drag [ASSUMPTION: or Got it].
- D-USE-15: one + in the rail, not one per hour.

## Widths

Drawn at: 402. Not drawn at the desk: the same callout beside the + in the gutter (D-USE-39, scale-up).

## Criteria

| ID                                    | When                                                 | Then                                       | Evidence                          |
| ------------------------------------- | ---------------------------------------------------- | ------------------------------------------ | --------------------------------- |
| C-USE-review-the-day-first-mornings-1 | The + has never been dragged and Got it never tapped | The hint shows beside the +                | `captures/first-mornings-402.png` |
| C-USE-review-the-day-first-mornings-2 | Got it, or a first drag                              | The hint never shows again, on any morning | test                              |
