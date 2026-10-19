---
target: specs/web/ux/day/now/states/todos-block.md
status: approved
promoted:
boards:
  - name: "now / a To-dos block in go mode / 402 / light"
    page: "USE — daily use"
    at: [1928, 11460]
    note: "Frame @ x 1928, y 12390"
    capture: specs/web/epics/USE-daily-use/ux/day/now/captures/todos-block-402.png
rulings: [D-USE-26, D-USE-34, D-USE-40]
---

# Now — a To-dos block in go mode

A To-dos block ("Errands", 10:00 to 12:30) active at 11:22, three to-dos done. Drawn on "USE — set up" in the Life and chores framing round and moved here (open-4, Life and chores). The kind, how it fills and the to-do's fields belong to the To-dos tray and the set-up surfaces; this file draws only go mode. The tray: [`../../todos/`](../../todos/index.md). `?state=todos-block`.

## What shows, top to bottom

- Now's header; the To-dos tray closed, its preview naming what is left in To-dos: "Repot the fern, Clean the fridge…".
- The block header: a moss bar on the left, "Errands", "To-dos · 10:00 to 12:30" (the kind before the span), the ··· button.
- Done rows, faded and live, each with a checked box, the to-do's emoji, its name and length: "Drop off the dry cleaning" 20 min, "Call the mechanic" 15 min, "Groceries" 45 min.
- The lifted card: the parcel emoji tile, the verdigris dot, "Return the parcel", "15 min · 11:20 · a to-do since Tue", Start (secondary) and Done (ink).
- The next row: an empty box, the pill emoji, "Pick up the prescription", "10 min", a grip.
- The tab bar: Now (selected), Schedule, Review.

## What the person can do

- As any block's go mode ([`success.md`](success.md)): Done, Start ([`../../running/`](../../running/index.md)), tap or long-press a row ([`row-tapped.md`](row-tapped.md), [`row-long-press.md`](row-long-press.md)), reorder ([`reordering.md`](reordering.md)).
- Checking a row checks the to-do itself: it leaves the To-dos list [ASSUMPTION: one record, so the tray no longer shows it].
- At the block's end, what is not done goes back to To-dos, undated (open-5, framing round 2: "a slot joins them for a date and is undone at the block's end if not done") [PROPOSED]. The close follows [`../../block-complete/`](../../block-complete/).

## Words

"To-dos · <start> to <end>" in the header meta. "a to-do since <day>" closes the lifted card's meta (where the to-do came from) [ASSUMPTION: the day the to-do was made, as the tray's "From Sunday" names a carried one]. Lengths as "<n> min".

## The notes on the boards

**"now / a To-dos block in go mode / 402 / light"**, "Frame" @ x 1928, y 12390:

> Now, a Life block
>
> [PROPOSED] Go mode as for any block, in moss: the lifted card, Start and Done; the meta says where the to-do came from. The tray shows what's left in To-dos.

The note's title, "a Life block", predates framing round 2, which moved chores and errands from Life to the To-dos kind in moss (open-5); the frame draws a To-dos block.

## Rulings

- D-USE-34: the New block sheet's seven kinds, To-dos among them.
- Moss for To-dos is Vesper's pick at Taylor's request (open-5, framing round 2), an existing token; the colours thread (D-USE-38) names no change to it.
- D-USE-26: the tray stays closed by default.
- Decided (D-USE-74): Life and To-dos framing rounds 2 to 4 (open-5) were "Awaiting Taylor", and this go-mode frame came with them, outside D-USE-72's steps 5 to 7; go mode is as drawn: a To-dos block runs like any block, filled oldest first from to-dos with no day (round 4), the meta naming the day the to-do was made, undone ones back to To-dos at the block's end.
- Which to-dos a block pulls first, and pinning a to-do to a named block, stay with the Life and chores dev note (open-4).

## Widths

Drawn at: 402. At the desk: To-dos sit in Today's main column (D-USE-40; `../../../work/today/`); a To-dos block in go mode scales up as any block (D-USE-39 (1)).

## Criteria

| ID                      | When                                 | Then                                                                                           | Evidence                       |
| ----------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------ |
| C-USE-now-todos-block-1 | A To-dos block is active             | A moss bar, "To-dos · <span>", rows with each to-do's emoji, a lifted card with Start and Done | `captures/todos-block-402.png` |
| C-USE-now-todos-block-2 | The lifted card                      | Its meta ends with where the to-do came from ("a to-do since Tue")                             | `captures/todos-block-402.png` |
| C-USE-now-todos-block-3 | The block ends with a to-do not done | It returns to To-dos with no day                                                               | test                           |
