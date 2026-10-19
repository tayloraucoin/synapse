---
target: specs/web/ux/day/now/states/all-done-start-next.md
status: approved
promoted:
boards:
  - name: "now / all done, start next / 402 / light"
    page: "USE — daily use"
    at: [3374, 10200]
    note: "Frame @ x 3374, y 11130"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/all-done-start-next-402.png
rulings: [D-USE-25, D-USE-28, D-USE-72]
---

# Now — all done, start next

The last item checked, every item done. `?state=all-done-start-next`. Its note is the "Frame" at x 3374, y 11130.

## What shows, top to bottom

As [`success.md`](success.md), status bar 7:34, with:

- **Every row faded and checked:** Pee and weigh, Water, Start the cold bath, Meditate, Cold bath; under Cold bath "Took 12 min · Change" (D-USE-13). No card, no grips.
- **A footer on the fade** (D-USE-25), above the tabs: a filled check circle (ink) and "Wellness complete" (body, semibold); at the trailing edge "Next: Training, 8:00" (label). Under it **Start Training**, the primary `Button`, full width, ink, 52 px.

## What the person can do

- **Start Training:** Now on Training, its first item lifted. Starting early just starts the block; its span does not move. Decided (D-USE-72).
- **Change** on the last done row; uncheck any row (the block un-completes [ASSUMPTION, as adding does]).
- ···, the tray, the tabs.

## Words

"<Block> complete" · "Next: <Block>, <time>" · "Start <Block>".

## The notes on the boards

**"now / all done, start next / 402 / light"**, "Frame" @ x 3374, y 11130:

> all done, start next [PROPOSED]
>
> When the last item is checked, the block stays on screen with every row faded and a footer on the fade: "Wellness complete", "Next: Training, 8:00", and Start Training. One tap moves on, and the close card (step 7) is kept for the not-done case. [ASSUMPTION] Starting early just starts the block; its span doesn't move.

## Rulings

- D-USE-28: a fully checked block keeps its rows with this footer; the close card stays for the not-done case (`../../block-complete/index.md`).
- Decided (D-USE-72): the note's [PROPOSED] and [ASSUMPTION] stand as drawn.
- The last block of the day has no next: Block complete's "Nothing after this today.", then Now's empty state (D-USE-72; [`empty-no-blocks.md`](empty-no-blocks.md)) [ASSUMPTION: the footer reads the same when all done].

## Widths

Drawn at: 402. Wider: [ASSUMPTION] Start keeps a fixed width, right-aligned (D-USE-39).

## Criteria

| ID                              | When                     | Then                                                                          | Evidence                               |
| ------------------------------- | ------------------------ | ----------------------------------------------------------------------------- | -------------------------------------- |
| C-USE-now-all-done-start-next-1 | The last item is checked | Rows stay faded; the footer reads "<Block> complete", "Next: …", Start <next> | `captures/all-done-start-next-402.png` |
| C-USE-now-all-done-start-next-2 | Start <next> early       | The next block starts; its span does not move                                 | test                                   |
