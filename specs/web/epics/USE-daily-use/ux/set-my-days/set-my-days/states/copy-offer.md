---
target: specs/web/ux/set-my-days/set-my-days/states/copy-offer.md
status: approved
promoted:
boards:
  - name: "set-my-days / copy-offer / 402 / light"
    page: "USE — set up"
    at: [482, 0]
    note: "Note · name only, 80"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/copy-offer-402.png
rulings: [D-USE-32, D-USE-49]
---

# Set my days — empty, bounds set, other days built

Thursday in Usual week, its bounds set, with Monday to Wednesday and Sunday built. `?state=copy-offer`. Its note is "Note · name only, 80" at x 482, y 930.

## What shows, top to bottom

- Status bar 21:10. "‹ Now" over "Set my days"; `SaveStatus` "✓ Saved" at the trailing edge.
- "Usual week" selected.
- Chips: M, T, W with dots, "T" (Thursday) ink with no dot, F and S without, the second S (Sunday) with a dot.
- Day line: "Thursday", the compact `TimeField`s "Up at 7:00" and "Lights out 22:30", the ···. A hairline.
- The column from 7: Orient's ink line with the lock and "Orient · 5 min".
- **The copy offer**, directly under Orient, left-aligned (not centred): a secondary `Button`, 44 px, copy glyph, "Copy from Monday"; under it, muted, "or tap a time to add a block". The rest of the column is empty rail to 12 and beyond.
- The + bottom right.

## What the person can do

- **Copy from Monday:** on an empty day it copies at once, with a `Toaster` and Undo [ASSUMPTION]; on a day with blocks it goes to Replace's confirm (D-USE-32). The flow: [`../../../interactions/copy-from/index.md`](../../../interactions/copy-from/index.md) (`states/copied-undo.md`, `states/replace-confirm.md`). The button names the last built weekday before this one [ASSUMPTION: as `empty-day.md` has it, open-4 round 3].
- Tap a time: the New block sheet at it ([`tap-a-time.md`](tap-a-time.md)); the +: [`plus-menu.md`](plus-menu.md).
- Change the bounds; switch day or week; the ···.

## Words

"Copy from Monday" ("Copy from <weekday>") · "or tap a time to add a block".

## The notes on the boards

**"set-my-days / copy-offer / 402 / light"**, "Note · name only, 80" @ x 482, y 930:

> Empty, bounds set, other days built
>
> Thursday with Monday to Wednesday and Sunday set: Orient, then the copy offer under it, not centred. "Copy from Monday" goes straight to Replace's confirm only when the day has blocks; on an empty day it copies at once, with Undo [ASSUMPTION].

## Rulings

- N2's "empty, bounds set, other days built" row, drawn as round 1.
- D-USE-32: Replace asks only when the day has blocks, then a Toaster with Undo; this frame's [ASSUMPTION] that an empty day copies at once matches it, and stands under D-USE-49 (the lock).

## Widths

Drawn at: 402. At 1024 the offer sits under Orient in the day pane; the week pane's Thursday row reads "Not set yet" with "Set day" (D-USE-39 (3); the row action changed 2026-10-19, [`usual-week.md`](usual-week.md)). With no other day built there is no offer: [`first-day-set.md`](first-day-set.md).

## Criteria

| ID                             | When                                     | Then                                                                                     | Evidence                      |
| ------------------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------- |
| C-USE-set-my-days-copy-offer-1 | Bounds set, no blocks, another day built | Orient, then "Copy from <day>" and "or tap a time to add a block" under it, left-aligned | `captures/copy-offer-402.png` |
| C-USE-set-my-days-copy-offer-2 | "Copy from Monday" on an empty day       | Monday's blocks copy at once; a Toaster offers Undo; no confirm                          | test                          |
