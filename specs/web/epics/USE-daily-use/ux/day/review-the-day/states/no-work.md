---
target: specs/web/ux/day/review-the-day/states/no-work.md
status: approved
promoted:
boards:
  - name: "review-day / no-work / 402 / light"
    page: "USE — daily use"
    at: [5784, 3900]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/no-work-402.png
rulings: [D-USE-2, D-USE-22]
---

# Review the day — work not slotted

A Work block with nothing slotted for today. Its note is the "Note · success" at x 5784, y 4830.

## What shows, top to bottom

As [`success.md`](success.md), with the Work block 9:30 to 12:00 (sky) holding, under its head:

- "Nothing slotted for today. Work is set with the week, in This week." (label, muted).
- "+ Add to Primary" and "+ Add to Secondary" (body, `--color-foreground`, a + glyph leading), each a `--h-target` row.
- "› Open This week" (medium, `--color-link`, a chevron leading).

No tier sub-heads. The other blocks, the tray, the rail + (beside Lunch) and Ready, go as success.

## What the person can do

- **Add to Primary** or **Add to Secondary**: the add sheet preset to that tier ([`no-work-add-to-primary.md`](no-work-add-to-primary.md)).
- **Open This week**: Set my days, This week, on Monday, at the Work block ([`no-work-open-this-week.md`](no-work-open-this-week.md)).
- Ready, go still works with the block empty: go mode opens it empty [ASSUMPTION; the work block in go mode, `../../now-work.md`].

## Words

"Nothing slotted for today. Work is set with the week, in This week." · "Add to Primary" · "Add to Secondary" · "Open This week". Replaces N4's "Work is set each morning." (D-USE-2).

## The notes on the boards

**"review-day / no-work / 402 / light"**, "Note · success" @ x 5784, y 4830:

> no-work · nothing slotted
>
> The Work block says where work is set (This week, D-USE-2) and keeps Add to Primary and Add to Secondary for a quick add here: often only one is known at the start. Each opens the add sheet preset to its tier.

## Rulings

- D-USE-2: work is slotted with the week, in This week; the empty tiers point there.
- D-USE-22: the block keeps Add to Primary and Add to Secondary, each opening the add sheet preset to its tier, plus Open This week.
- No Add to Urgent or Add to Stretch here, as drawn; This week offers all four (`no-work-open-this-week.md`).

## Widths

Drawn at: 402. At the desk: the same rows in the capped column (D-USE-39). Today at the desk has its own words (D-USE-65: "Nothing is slotted for today yet. Add here, or plan the week."; `../../../work/today/states/no-work-slotted.md`).

## Criteria

| ID                             | When                              | Then                                                          | Evidence                   |
| ------------------------------ | --------------------------------- | ------------------------------------------------------------- | -------------------------- |
| C-USE-review-the-day-no-work-1 | A Work block with nothing slotted | The line, Add to Primary, Add to Secondary and Open This week | `captures/no-work-402.png` |
