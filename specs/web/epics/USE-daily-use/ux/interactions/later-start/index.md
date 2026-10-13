---
target: specs/web/ux/interactions/later-start/index.md
status: approved
promoted:
boards: []
dev_note: "Dev note · A later start"
rulings: [D-USE-8, D-USE-11, D-USE-66]
---

# A later start

When Orient opens well past plan, a sheet opens once over Review the day with two ways to fit the morning: cut some, or slide the day back (Taylor, Review round 1) [PROPOSED, drawn]. Its drawn steps are [`states/cut-some.md`](states/cut-some.md) and [`states/slide.md`](states/slide.md).

**One engine with Make room.** Both find minutes and decide what gives; they share one engine: [`../make-room/index.md`](../make-room/index.md) carries taking minutes for an addition, this file carries the slide. Neither repeats the other.

The late frames themselves are Review the day's states, not steps here: `review-day / late` ([`../../day/review-the-day/states/late.md`](../../day/review-the-day/states/late.md)) is what shows under and after the sheet, and `review-day / late, passed open` ([`late-passed-open.md`](../../day/review-the-day/states/late-passed-open.md)) is the row's own disclosure. Orient's half of a late wake (the wake stamp, the same frame): [`../../day/orient/states/late.md`](../../day/orient/states/late.md).

## Where it starts

- On its own, over Review the day, once, when the wake is more than about 15 min past Orient's planned time [ASSUMPTION].
- Again from the "Planned before <wake>" row, which keeps it reachable (the dev note) [ASSUMPTION: a line in the open row, not drawn].

## Steps

| #   | The person                                             | The app                                                            | Board (carried by)                                                                       |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| 0   | Opens Orient at 8:10 against 7:00, taps Review the day | Review the day laid out from the wake, passed blocks folded        | `review-day / late / 402 / light` (`../../day/review-the-day/states/late.md`)            |
| 1   | —                                                      | The sheet opens once on Cut some                                   | `review-day / late, ask: cut / 402 / light` ([`states/cut-some.md`](states/cut-some.md)) |
| 2   | Picks Slide the day back                               | Every block keeps its length and moves by the gap                  | `review-day / late, ask: slide / 402 / light` ([`states/slide.md`](states/slide.md))     |
| 3   | Taps the primary                                       | The day is laid out anew, with an Undo Toaster [ASSUMPTION]        | not drawn                                                                                |
| 3b  | Not now, or ×                                          | The late state as drawn: passed blocks fold up, nothing else moves | step 0's frame                                                                           |

## Rules

- **Phase 1 default:** the flat slide plus manual cuts (the dev note's note). Cut some: ticking items or "Cut the block" takes those minutes off; whatever isn't cut slides. Slide: every block keeps its length and moves by the gap; items at a set time stay put and blocks split around them.
- Words avoid the second person: "Up at 8:10", never "You are up late" (open-1).
- Opens once a day; it never opens on a day laid out on time.
- Today only; the usual week is unchanged.
- "Decide for me" never suggests a cut in Phase 1 (no AI, record 0001); see Make room (D-USE-66).

## The dev note

**Dev note · A later start** (p-3-0, x 4820, y 5160), in full:

> Dev note · a later start
>
> When Orient opens more than about 15 min after its planned time [ASSUMPTION], the sheet opens over Review the day once. Close or Not now leaves the late state as drawn: passed blocks fold up, nothing else moves. The sheet stays reachable from the "Planned before" row.
>
> Simple default for Phase 1
>
> Cut some: the first two blocks are listed, with "Show later blocks" loading more. Ticking items or "Cut the block" takes those minutes off; whatever isn't cut slides. Slide: every block keeps its length and moves by the gap; items at a set time stay put and the blocks split around them.
>
> Mechanics to settle before Technical
>
> Sliding with priority: which blocks may shrink, which never move (appointments, travel, set times), work tiers (Stretch goes first, Urgent never), meals as fixed or floating, a block's minimum. What happens when the slide runs past Lights out. Snoozes that land mid-block. Undo. How this shares an engine with Make room (same question: minutes to find, what to take them from), and whether "Decide for me" ever suggests a cut (Phase 1 has no AI).
>
> Logged in day/overview.md, Open.

Its note, "Note · success" @ x 4820, y 6090:

> dev note · a later start
>
> The Phase 1 default is the flat slide plus manual cuts. Sliding with priority, fixed appointments and Lights out is one engine with Make room; to settle before Technical.

## Rulings

- No D-line rules the sheet; open-1's "A later start" and "Dev note: a later start" are carried here. D-USE-8 sets the fixture's morning; D-USE-11's "Decide for me" bend applies.

## Criteria

| ID                  | When                                       | Then                                     | Evidence                                         |
| ------------------- | ------------------------------------------ | ---------------------------------------- | ------------------------------------------------ |
| C-USE-later-start-1 | The first open is 15 min or more past plan | The sheet opens once over Review the day | test                                             |
| C-USE-later-start-2 | Not now or ×                               | The late state as drawn; nothing moves   | `../../day/review-the-day/captures/late-402.png` |
| C-USE-later-start-3 | Any step                                   | No second person; nothing marked missed  | captures                                         |
