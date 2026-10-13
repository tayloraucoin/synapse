---
target: specs/web/ux/day/block-complete/states/not-done-open.md
status: approved
promoted:
boards:
  - name: "block-complete / not done, open / 402 / light"
    page: "USE — daily use"
    at: [482, 15240]
    note: "Frame @ x 482, y 16170"
    capture: specs/web/epics/USE-daily-use/ux/day/block-complete/captures/not-done-open-402.png
rulings: [D-USE-30, D-USE-70, D-USE-72]
---

# Block complete — not done, open (after a move)

Now at 7:40: the close card ([`not-done-closed.md`](not-done-closed.md)) with its disclosure open; Meditate has just been moved to later. `?state=not-done-open`. The intent pass's `not-done` key.

## What shows, top to bottom

Phone 402 × 874. As [`not-done-closed.md`](not-done-closed.md) down to Start, then:

1. "Not done: Meditate, Cold bath" with an up chevron.
2. A hairline, then **Meditate**, done with: "Meditate" (muted) over "Moved to the end of Training" (caption, muted); "Undo" (underlined link) trailing.
3. A hairline, then **Cold bath**: "Cold bath" (body) leading; two outline `Button`s trailing, "Move to later" and "Leave".

## What the person can do

- "Undo": Meditate comes back into the list with its buttons; nothing is moved.
- "Move to later" (one tap): the item goes to the end of the next block of the same kind today, else the end of the next block (D-USE-70); here Wellness has no later Wellness block, so Training. The row then reads as Meditate's. The flow: [`../../../interactions/move-to/index.md`](../../../interactions/move-to/index.md).
- "Leave": the item stays simply not done in Wellness (N4, round 12). [ASSUMPTION] Its row leaves the list; nothing records a miss.
- Start, × and the disclosure as on the closed card.
- Since D-USE-30 each left item also has Do now, and "Move to later" reads "Later": [`not-done-do-now.md`](not-done-do-now.md) is the current row; this frame draws round 1's two buttons and the moved row with Undo, which the feedback round did not redraw.

## Words

"Moved to the end of Training"; "Undo"; "Move to later"; "Leave".

## The notes on the boards

**"block-complete / not done, open / 402 / light"**, note "Frame" @ x 482, y 16170:

> not done, open
>
> Each item gets Move to later or Leave. Meditate shows the result: "Moved to the end of Training" with Undo [ASSUMPTION: the default in Open, end of the next block of the same kind, else the next block]. Leave keeps it simply not done.

## Rulings

- D-USE-70: the note's [ASSUMPTION] on where Move to later puts it: Decided (D-USE-70), as drawn (end of the next block of the same kind today, else the end of the next block).
- D-USE-30: Do now joins Later and Leave, with the consequence shown ([`not-done-do-now.md`](not-done-do-now.md)).
- D-USE-72: step 7 round 1's marks stand as drawn.
- [ASSUMPTION] Undo stays on the moved row until the card closes or Start is tapped.

## Widths

Drawn at: 402. Not drawn at: the desk; scales up (D-USE-39).

## Criteria

| ID                                   | When                                         | Then                                                                                   | Evidence                         |
| ------------------------------------ | -------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-block-complete-not-done-open-1 | Move to later on Meditate (Wellness, Monday) | It goes to the end of Training; the row reads "Moved to the end of Training" with Undo | `captures/not-done-open-402.png` |
| C-USE-block-complete-not-done-open-2 | Undo                                         | Meditate is back in Wellness, not done, with its buttons                               | test                             |
| C-USE-block-complete-not-done-open-3 | Leave                                        | The item stays not done in Wellness; nothing says missed                               | test                             |
