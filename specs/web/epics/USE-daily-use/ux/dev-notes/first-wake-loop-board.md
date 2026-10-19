---
target: specs/web/ux/dev-notes/first-wake-loop-board.md
status: approved
promoted:
dev_note: ""
---

# The first-wake loop board: its words in full

Every text the step 0 board carries, verbatim, in the board's order. The board is the artboard "overview / first-wake loop / board / light" on "USE — daily use" (x 0, y 0), carried by [`../interactions/first-wake-loop.md`](../interactions/first-wake-loop.md); approved by Taylor (D-USE-21). It has no "Note ·" artboard under it and no separate text artboards on its row: its annotations are layers inside it. The phones it draws are low detail; each surface's own frames, carried by its `day/<surface>/` files, are the spec for what shows. Its row label and the page's Progress board are in [`../boards/use-daily-use/step-0.md`](../boards/use-daily-use/step-0.md).

## Board header

> USE · step 0 · low detail
>
> **The first-wake loop**
>
> Orient, Review the day, Swap, Now, Running, Block complete. One primary action per screen. Taylor's Monday; times are placeholders.

## Flow row (the main path, left to right)

Each step: its caption (the surface file named as the intent pass's flat file, then the state drawn), its exit, then the arrow to the next step.

1. "1 · orient.md" — "Orient → Review the day". Arrow: "Review the day".
2. "2 · review-the-day.md · default, first mornings show the + hint" — "Review the day → Ready, go". Arrow: "Tap an item, Swap".
3. "3 · item-sheet.md · swap open" — "Swap → Pick one". Arrow: "Pick one, then Ready, go".
4. "4 · now.md · current item" — "Now → Done". Arrow: "Start".
5. "5 · running.md · counting down" — "Running → Done". Arrow: "Done, then last item done".
6. "6 · block-complete.md · with items not done" — "Block complete → Start the next block".

## Branches row

> Branches · round 2
>
> Off the main path

- "1a · orient.md · passage open [PROPOSED state]" — "Read all → full screen, close to Orient". Built as "orient / passage open / 402 / light" ([`../day/orient/states/passage-open.md`](../day/orient/states/passage-open.md)).
- "1b · orient.md · last night open [PROPOSED state]" — "Read last night's reflections → sheet". Built as "orient / last night open / 402 / light" ([`../day/orient/states/last-night-open.md`](../day/orient/states/last-night-open.md)).
- "2a · review-the-day.md · tray open" — "To-dos open: the column moves down".
- "2c · review-the-day.md · rail + dragging [PROPOSED]" — "Drag the + : 15 min steps; release adds here".
- "2d · review-the-day.md · add sheet [PROPOSED]" — "Tap + or release → Add at 10:15".
- "2e · review-the-day.md · make room [PROPOSED state]" — "Add, with no room → Make room".
- "4a · now.md · reordering [PROPOSED state]" — "Drag a grip: Meditate moves before the bath".

Branches 2a to 2e and 4a are carried in full by Review the day's and Now's own frames (`day/review-the-day/`, `day/now/`, written by a later thread of this handoff).

### Dev note · Make room (a layer in the branches row)

> **Dev note · Make room**
>
> The sheet in 2e is a placeholder, not the answer. Before Technical, explore how this should work, then the simplest way to show it.
>
> **Mechanics to settle**
>
> What is eligible: pinned items, appointments, travel, Orient, a block's minimum. How minutes are taken: one item, spread across several, gaps first. How it plays with re-flow around pinned items (round 8), and with blocks then running past Lights out. What Undo restores. What "Decide for me" would weigh, and whether Phase 1 allows it.
>
> **Then simplify**
>
> A sensible default that needs no sheet most of the time: take gaps first, then the most flexible item in the same block, with an Undo toast. The sheet appears only when no default can be guessed.
>
> Logged in day/overview.md, Open.

The same dev note stands as its own artboard, "Dev note · Make room" (x 4338, y 5160), carried with Review the day; the Open item is in `../day/open/open-1.md`.

## Board footer

> **Loops back**
>
> Running, Done → Now, next item lifted. Block complete, Start Training → Now, Training active. Swap, pick one → Review the day. A block tapped → Block view (step 3, not on this board).

> **Direction drawn here [PROPOSED]**
>
> Review: bullet grid at 96 px an hour, breadcrumb back on the left, + in the rail. Now: lifted card, tray closed; Done is one tap and records the planned length, with "Change" under the row. Verdigris only on the current-item dot.

> **Placeholders**
>
> Times, item lengths, work items, the passage, playlists and the second to-do are placeholders. Kind colours (Wellness leaf, Training clay, Work sky) are an assumption until Set my days settles them.

"Direction drawn here [PROPOSED]" was approved with the board (D-USE-7, D-USE-13, D-USE-21). The kind colours were later taken up by the colours thread (D-USE-38, [PROPOSED until Taylor's look]).
