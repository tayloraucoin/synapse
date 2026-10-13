---
target: specs/web/ux/day/running/states/several-running.md
status: approved
promoted:
boards:
  - name: "now-work / several running / 402 / light"
    page: "USE — daily use"
    at: [5784, 17760]
    note: "Frame @ x 5784, y 18690"
    capture: specs/web/epics/USE-daily-use/ux/day/running/captures/several-running-402.png
rulings:
  [
    D-USE-27,
    D-USE-29,
    D-USE-39,
    D-USE-43,
    D-USE-44,
    D-USE-49,
    D-USE-72,
    D-USE-74,
    D-USE-76,
  ]
---

# Running — several running

Three items run at once: the one in focus as the running card, the other two as Running rows. `?state=several-running`. The rules: [`../../../dev-notes/several-running.md`](../../../dev-notes/several-running.md).

## What shows, top to bottom

Now at 10:20; the frame is drawn in a Work block (9:30 to 12:00) with placeholder tiers (Rulings):

- Status bar "10:20"; "Now" with the avatar "T"; the To-dos strip "To-dos · Call the mechanic…"; the block header (sky bar, "Work", "9:30 to 12:00", round ···).
- Group heading "Running", muted, at the top of the block.
- **The running card**, as [`counting-down.md`](counting-down.md): the icon tile (an empty sky tile here, [placeholder]), the verdigris dot and "[Write the sync spec]", meta "Primary · 45 min"; the figure "18:20" with "of 45 min" beside it; Pause (outline) and Done (ink).
- **Running rows** under the card, each on a hairline, `h-row`: a 20 px progress ring (ink arc on a hairline circle, the arc the share of the plan elapsed), the title, the meta under it muted, a 36 px round Pause button (outline, pause glyph), then the box (20 px, unchecked).
  - "[Agent: refactor the sync queue]", "Running · 12:04 of 30 min".
  - "[Agent: ENG-123 tests]", "Running · 4 min over" (the ring past three quarters).
- Group heading "Primary"; "[Review the Paper handoff]" unchecked, 30 min; then a subtle caption "Tiers (Urgent, Primary, Secondary, Stretch) are drawn in step 8." [placeholder; canvas only, never shipped].
- `BottomNav`: Now (selected), Schedule, Review.

## What the person can do

- On the card: Pause, Done, as [`counting-down.md`](counting-down.md).
- **Tap a Running row**: it lifts into the card; the card drops to a row and keeps counting ([`running-row-focused.md`](running-row-focused.md)).
- **Pause on a row**: that timer holds; the others run. The paused row is not drawn [ASSUMPTION: its count holds and pulses as [`paused.md`](paused.md), the button turns to Resume].
- **The box on a row**: Done for that item ([`done-on-a-running-row.md`](done-on-a-running-row.md)).
- Start another item: it joins; nothing pauses (D-USE-27).

## Words

"Running"; "Running · <m:ss> of <n> min"; "Running · <n> min over"; past the plan under a minute, "Running · 0:40 over" [ASSUMPTION, the card's form].

## The notes on the boards

**now-work / several running / 402 / light** (Frame @ x 5784, y 18690):

> several running (D-USE-27)
>
> The item Taylor is on is the lifted card, counting down. The agent threads run beside it as rows under "Running", each with a ring, its own count ("12:04 of 30 min", "4 min over"), Pause and the box. Tapping a row lifts it. The tiers below are placeholders until step 8.

## Rulings

- D-USE-76: the frame is carried as a non-work block's Running rows; inside a Work block firing in place replaces it.
- **Where this state lives (lead's ruling).** These are the Running rows of non-work blocks (D-USE-27; D-USE-72, "Running rows count down like the card"). Inside a Work block D-USE-43, D-USE-44 and D-USE-49 replace them: one item is in Taylor's hands at a time, the rest fire in place in their own tier (rust mark, "firing · n min"), and there is no Running group ([`../../../work/today/states/running.md`](../../../work/today/states/running.md), [`../../../interactions/firing.md`](../../../interactions/firing.md), [`../../../interactions/start-while-one-runs.md`](../../../interactions/start-while-one-runs.md)). The frame draws a Work block because step 6 had no tiers yet: "The tiers below are placeholders until step 8." In a non-work block the card's meta reads "Started <time>" as [`counting-down.md`](counting-down.md), not a tier.
- D-USE-27: several run at once; starting one never pauses another; the focused one is the card, the rest rows under "Running" with their own count, Pause and box.
- D-USE-29: a running item sits only under Running. Its "tier in the meta line" is a work-item rule, so it does not apply here.
- D-USE-72: rows count down like the card (Decided (D-USE-72)), and Running uses Done's percent bands: the frame draws "4 min over" in muted ink; D-USE-72 colours it by its band ([`../../../dev-notes/over-by-how-much.md`](../../../dev-notes/over-by-how-much.md)), the word "over" always beside it.

## Widths

Drawn at: 402. At 1024 and up the card and rows scale up (D-USE-39); at the desk a non-work block's items are checked in its Block panel (D-USE-74), where the same Running group shows.

## Criteria

| ID                              | When                                         | Then                                                                                                   | Evidence                           |
| ------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| C-USE-running-several-running-1 | A second item is started in a non-work block | Both run; the focused one is the card, the other a row under "Running" with ring, count, Pause and box | `captures/several-running-402.png` |
| C-USE-running-several-running-2 | A row passes its plan                        | "<n> min over", coloured by Done's percent bands                                                       | test                               |
| C-USE-running-several-running-3 | Several items in a Work block                | No Running group; one in hand, the rest fire in their tier                                             | test                               |
