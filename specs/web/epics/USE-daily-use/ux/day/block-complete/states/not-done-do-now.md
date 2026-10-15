---
target: specs/web/ux/day/block-complete/states/not-done-do-now.md
status: approved
promoted:
boards:
  - name: "block-complete / not done, do now / 402 / light"
    page: "USE — daily use"
    at: [964, 15240]
    note: "Frame @ x 964, y 16170"
    capture: specs/web/epics/USE-daily-use/ux/day/block-complete/captures/not-done-do-now-402.png
rulings: [D-USE-30, D-USE-70, D-USE-72]
---

# Block complete — not done, do now

Now at 7:45: the close card with its disclosure open, each item left with Do now, Later and Leave and its consequence (the feedback round). `?state=not-done-do-now`. The current form of the open list.

## What shows, top to bottom

Phone 402 × 874. As [`not-done-closed.md`](not-done-closed.md) down to Start (the card sits higher to fit), then:

1. "Not done: Meditate, Cold bath" with an up chevron.
2. A hairline, then **Meditate**: "Meditate · 10 min" (body) leading, "Fits by 7:55" (caption, muted) trailing; under them three `Button`s: "Do now" (outline, ink border: the emphasised one), "Later" and "Leave" (outline, hairline).
3. A hairline, then **Cold bath**: "Cold bath · 10 min", "Training would start 8:05" (caption, muted); the same three buttons.

## What the person can do

- "Do now": the block reopens on Now with that item lifted as the current card (`../../now/index.md`). If it fits before the block's end, nothing else moves ("Fits by 7:55"). Past the end, the block extends and the day slides ("Training would start 8:05"), on Make room's engine: [`../../../interactions/make-room/index.md`](../../../interactions/make-room/index.md). No separate extend flow.
- "Later": the one-tap move (D-USE-70), as [`not-done-open.md`](not-done-open.md) draws its result; [`../../../interactions/move-to/index.md`](../../../interactions/move-to/index.md).
- "Leave": stays simply not done.
- Start, × and the disclosure as on the closed card.

## Words

"<item> · <length>" ("Meditate · 10 min"); "Fits by 7:55"; "Training would start 8:05"; "Do now"; "Later"; "Leave".

## The notes on the boards

**"block-complete / not done, do now / 402 / light"**, note "Frame" @ x 964, y 16170:

> not done, do now [PROPOSED]
>
> Worth it, cheaply: each left item gets Do now, Later, Leave. Do now reopens the block with that item lifted; the line shows the consequence, "Fits by 7:55" or "Training would start 8:05" (extends the block, the day slides). No separate extend flow.

## Rulings

- D-USE-30: items left not done can be gone back to, Do now beside Later and Leave, with the consequence shown.
- D-USE-72: the frame's [PROPOSED]: Decided (D-USE-72). Do now reopens the block with the item lifted; past the block's end it extends the block and the day slides (Make room's engine).
- D-USE-70: Later puts the item at the end of the next block of the same kind today, else the end of the next block.
- [ASSUMPTION] Each consequence counts the items above it as done now too: Meditate alone ends 7:55; Cold bath after it ends 8:05, so Training would start 8:05. Doing one item recomputes the others' lines.
- [ASSUMPTION] "Later" is round 1's "Move to later", shortened to fit three buttons; the words wait for Gloss.
- [ASSUMPTION] (USE-26) The lines count from the current minute, as Now's clock reads it, so seconds never tip a line; the overrun is whole minutes.
- [ASSUMPTION] (USE-26) The day's last block, not drawn: past its end the line reads "<Block> would end <time>" and Do now extends it. An item whose slide would carry a block past 24:00 has no Do now.
- [ASSUMPTION] (USE-26) After Do now, a polite "Wellness. Cold bath is now." and focus on the lifted card.

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                                     | When                        | Then                                                                                      | Evidence                           |
| -------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-block-complete-not-done-do-now-1 | The disclosure opens        | Each item shows its length, its consequence line, and Do now, Later, Leave                | `captures/not-done-do-now-402.png` |
| C-USE-block-complete-not-done-do-now-2 | Do now on an item that fits | Wellness is active on Now with that item lifted; nothing else moves                       | test                               |
| C-USE-block-complete-not-done-do-now-3 | Do now past the block's end | Wellness extends; Training and the rest of the day slide by the overrun, as the line said | test                               |
| C-USE-block-complete-not-done-do-now-4 | Any consequence line        | It is words and times, never red                                                          | `captures/not-done-do-now-402.png` |
