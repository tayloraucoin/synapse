---
target: specs/web/ux/interactions/make-room/index.md
status: approved
promoted:
boards: []
dev_note: "Dev note · Make room"
rulings: [D-USE-11, D-USE-16, D-USE-66, D-USE-72]
---

# Make room

Adding something to a day with no room: finding the minutes, and what to take them from. Board branch 2e [PROPOSED state]. The drawn sheet is a placeholder for the dev note's work, not the answer; its one step is [`states/sheet.md`](states/sheet.md).

**One engine with A later start.** Both ask the same question (minutes to find, what to take them from) and share one engine: [`../later-start/index.md`](../later-start/index.md) carries the slide and its mechanics; this file carries taking minutes for an addition. Neither repeats the other. The same engine is asked for by a meeting inside a work block (open-2, its dev note), Do now past a block's end (Decided, D-USE-72), Google events moving (open-4) and Life blocks (open-4, [ASSUMPTION] Make room takes from Life no sooner than from Work).

## Where it starts

- "Add" on the add sheet when the block is full ([`../add-from-the-rail/states/add-sheet.md`](../add-from-the-rail/states/add-sheet.md)).
- Block complete's "Do now" past the block's end (D-USE-72; [`../../day/block-complete/states/not-done-do-now.md`](../../day/block-complete/states/not-done-do-now.md)): the block extends and the day slides, the slide being A later start's ([`../later-start/index.md`](../later-start/index.md)). The consequence shows before the tap ("Training would start 8:05"); no sheet, no separate extend flow.
- [ASSUMPTION] Any add into a full block: a block's own "Add to …" (Block view), the Item sheet's length made longer, Swap to a longer item.

## Steps

| #   | The person            | The app                                                                                                                                     | Board (carried by)                                                            |
| --- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | Taps Add with no room | Phase 1 default: gaps first, then the most flexible item in the same block, with an Undo Toaster; no sheet (the dev note's "Then simplify") | not drawn                                                                     |
| 2   | —                     | Only when no default can be guessed: the Make room sheet, From this block or From other blocks                                              | `review-day / make room / 402 / light` ([`states/sheet.md`](states/sheet.md)) |
| 3   | Taps Make room        | The minutes are taken and the item lands; Undo restores both [ASSUMPTION]                                                                   | not drawn                                                                     |

## Rules

- Eligible: gaps and items. Shown but never eligible: travel, pinned appointments (D-USE-11); [ASSUMPTION] Orient and set-time items too. A block's minimum: to settle (the dev note).
- Today only; the usual week is never changed.
- Undo restores every minute taken and removes the addition [ASSUMPTION; the dev note asks "What Undo restores"].
- Decided (D-USE-66) : "Decide for me" lets a model choose (D-USE-11), and Phase 1 has no AI (record 0001; D-USE-11 names the bend). Default: keep it drawn, unwired until AI is in scope [ASSUMPTION: shown disabled or hidden in the build until then]. The alternative: drop it for now.

## The dev note

**Dev note · Make room** (p-3-0, x 4338, y 5160), in full:

> Dev note · Make room
>
> The Make room sheet beside this is a placeholder, not the answer. Before Technical, explore how this should work, then the simplest way to show it.
>
> Logged in day/overview.md, Open.
>
> Mechanics to settle
>
> What is eligible: pinned items, appointments, travel, Orient, a block's minimum. How minutes are taken: one item, spread across several, gaps first. How it plays with re-flow around pinned items (round 8), and with blocks then running past Lights out. What Undo restores. What "Decide for me" would weigh, and whether Phase 1 allows it.
>
> Then simplify
>
> A sensible default that needs no sheet most of the time: take gaps first, then the most flexible item in the same block, with an Undo toast. The sheet appears only when no default can be guessed.

Its note, "Note · dev note" @ x 4338, y 6090:

> dev note · make room
>
> Lifted from the board unchanged. Shares one engine with A later start (round 2 row).

The same text sits as a layer on the step 0 board (`../../dev-notes/first-wake-loop-board.md`). Open-1, "Dev note: Make room" (now in `../../day/open/open-1.md`, "Logged in day/overview.md, Open").

## Rulings

- D-USE-11: the Make room sheet, from the block it lands in or from other blocks; a multi-select of what is eligible, each with minutes taken; travel and pinned appointments shown, not eligible; "Decide for me" Decided (D-USE-66).
- D-USE-16: Add goes to Make room only when there is no room.
- D-USE-72: Do now past a block's end extends the block and the day slides, on this engine.

## Criteria

| ID                | When                                                         | Then                                                        | Evidence                 |
| ----------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------ |
| C-USE-make-room-1 | An add with no room, and a gap or flexible item in the block | It lands with no sheet; an Undo Toaster names what gave way | test                     |
| C-USE-make-room-2 | No default can be guessed                                    | The sheet opens                                             | `captures/sheet-402.png` |
| C-USE-make-room-3 | Travel or a pinned appointment                               | Shown, never taken                                          | `captures/sheet-402.png` |
