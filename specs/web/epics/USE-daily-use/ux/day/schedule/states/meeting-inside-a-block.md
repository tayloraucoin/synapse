---
target: specs/web/ux/day/schedule/states/meeting-inside-a-block.md
status: approved
promoted:
boards:
  - name: "schedule / meeting in plum / 402 / light"
    page: "USE — daily use"
    at: [1928, 20280]
    note: "Frame @ x 1928, y 21210"
    capture: specs/web/epics/USE-daily-use/ux/day/schedule/captures/meeting-inside-a-block-402.png
rulings: [D-USE-27, D-USE-38, D-USE-65, D-USE-77]
---

# Schedule — a meeting inside a work block

Monday at 10:20, a 30-minute meeting at 10:30 inside Work 9:30 to 12:00. The surface is [`../index.md`](../index.md); the frame as [`checks-and-running.md`](checks-and-running.md). `?state=meeting-inside-a-block`. The mechanics are the dev note [`../../../dev-notes/meeting-inside-a-work-block.md`](../../../dev-notes/meeting-inside-a-work-block.md), cited, not repeated.

## What shows, top to bottom

**Phone (402):** as [`checks-and-running.md`](checks-and-running.md) (Wellness checked, "[Write the sync spec] · ENG-123" checked, "[Review the Paper handoff] · running" with the verdigris dot and ring), with:

- **The band** across the Work block at 10:30, 48 px tall, the block's full width over its 3 px rule: `--color-category-plum-chip` fill, a 3 px `--color-category-plum-dot` left rule and plum hairlines top and bottom; a 12 px lock glyph, "[Design sync]" (label, semibold), "10:30 to 11:00 · Meeting" (caption, muted).
- **The block stays one block:** one header ("Work", "9:30 to 12:00"), its verdigris edge, and its items above the band (Primary) and below it (Secondary, "[Answer the review comments]"), a 50 px gap held where the band sits.
- The now line at 10:20 crosses Work just above the band.

**Desk (not drawn):** the same band in the scaled-up column (D-USE-39). On desk Today a meeting at its time lifts as a row under the band, Decided (D-USE-65; `../../../work/today/states/meeting-lifted.md`).

## What the person can do

As [`during-go.md`](during-go.md): tap Work for its Block view [ASSUMPTION: the band is part of the block, not its own target; the boards are silent].

## Words

"[Design sync]" `[placeholder]` · "10:30 to 11:00 · Meeting".

## The notes on the boards

**Frame @ x 1928, y 21210** — schedule / meeting in plum / 402 / light

> schedule, meeting in plum [PROPOSED]
>
> Meetings, appointments and events default to plum: the band inside the block takes the plum chip and edge, so it reads apart from Work's sky.

**Frame @ x 1446, y 21210** — schedule / meeting inside a work block / 402 / light (superseded, below)

> schedule, meeting inside a block [PROPOSED]
>
> A 30-minute meeting inside Work draws as a band across the block at its time, with a lock and its tag. The block isn't split; its items sit above and below the band.

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- Superseded: "schedule / meeting inside a work block / 402 / light" (x 1446, y 20280) is replaced by the plum frame (x 1928) under D-USE-38 (events stay plum, told from off-schedule violet by form: always a fill with its icon). Its note's band, lock, tag and unsplit block hold, and are drawn again in plum.
- D-USE-38: events plum, itself [PROPOSED until Taylor's look] at the colours thread. The plum note's own [PROPOSED] is a step-8 mark, not yet ruled; kept.
- The dev note: one block, one pinned band; times re-flow around it; nothing splits.
- D-USE-27: anything running keeps running through the meeting.

## Widths

Drawn at 402. Desk: above, and [`../index.md`](../index.md) › Platforms.

## Criteria

| ID                                      | When                               | Then                                                                                                 | Evidence                                  |
| --------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| C-USE-schedule-meeting-inside-a-block-1 | A meeting inside a Work block      | One band at its time, plum chip and edge, lock, name, "<span> · Meeting"; the block keeps one header | `captures/meeting-inside-a-block-402.png` |
| C-USE-schedule-meeting-inside-a-block-2 | Items before and after the meeting | They sit above and below the band; no item is split                                                  | capture                                   |
