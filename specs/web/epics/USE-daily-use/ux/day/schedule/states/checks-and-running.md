---
target: specs/web/ux/day/schedule/states/checks-and-running.md
status: approved
promoted:
boards:
  - name: "schedule / checks and running / 402 / light"
    page: "USE — daily use"
    at: [482, 20280]
    note: "Frame @ x 482, y 21210"
    capture: specs/web/epics/USE-daily-use/ux/day/schedule/captures/checks-and-running-402.png
rulings: [D-USE-27, D-USE-43, D-USE-49, D-USE-72, D-USE-77]
---

# Schedule — checks and running

Monday at 10:20: what each item's mark says. The surface is [`../index.md`](../index.md); the frame as [`during-go.md`](during-go.md). `?state=checks-and-running`.

## What shows, top to bottom

**Phone (402):** as [`during-go.md`](during-go.md), with the bullets' marks changed:

- **Wellness** (faded): "Pee and weigh", "Water", "Start the cold bath" each with a 10 px check in `--color-category-leaf-dot` instead of a dot; "+2 more".
- **Work** (the verdigris edge as during go), Primary:
  - "[Write the sync spec] · ENG-123": a sky check (`--color-category-sky-dot`), the words in `--color-muted-foreground` (done).
  - "[Review the Paper handoff] · running": a 12 px mark, a 3 px-radius `--color-now` dot in a `--color-now` ring at 45 %, the words in ink. The ring pulses [PROPOSED].
- Secondary: "[Answer the review comments]" with a sky dot (planned).
- **Training**: dots and transitions as during go.

**Firing (not drawn):** a work item Taylor has fired (D-USE-43, D-USE-49). Decided (D-USE-77): the firing mark, a `--color-category-clay-dot` dot in a `--color-fill-muted` halo, the title receded, never verdigris (D-USE-49).

**Desk (not drawn):** the same marks in the scaled-up column (D-USE-39).

## What the person can do

As [`during-go.md`](during-go.md). The marks are not controls: checking happens in the Block view or on Now.

## Words

"· running" after the running item's title. "[Write the sync spec]", "[Review the Paper handoff]", "[Answer the review comments]" are `[placeholder]`.

## The notes on the boards

**Frame @ x 482, y 21210** — schedule / checks and running / 402 / light

> schedule, checks and running [PROPOSED]
>
> Done items read as a check in the block's colour; planned stay a dot; a running item is a verdigris dot with a ring that pulses slowly (100% to 40%, 2 s, like paused figures; held under reduced motion).

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- The note's [PROPOSED] is a step-8 mark and is not yet ruled; it is kept.
- D-USE-49: verdigris means only Taylor's hands, so the running dot stays verdigris; firing is rust on grey. The frame predates firing and draws no firing item: the decision above.
- D-USE-27, D-USE-43: several items can run outside a Work block, each with its dot; inside a Work block one item is in hand and the rest fire in place.
- D-USE-72: a paused figure "holds as a number and pulses"; the running ring's pulse borrows that rhythm (100 % to 40 %, 2 s).

## Widths

Drawn at 402. Desk: [`../index.md`](../index.md) › Platforms.

## Criteria

| ID                                  | When               | Then                                                                               | Evidence                              |
| ----------------------------------- | ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------- |
| C-USE-schedule-checks-and-running-1 | An item is checked | Its bullet is a check in its block's colour; planned items keep a dot              | `captures/checks-and-running-402.png` |
| C-USE-schedule-checks-and-running-2 | An item runs       | A verdigris dot with a ring pulsing 100 % to 40 % over 2 s, and "running" in words | capture                               |
| C-USE-schedule-checks-and-running-3 | Reduced motion     | The ring holds still                                                               | manual                                |
