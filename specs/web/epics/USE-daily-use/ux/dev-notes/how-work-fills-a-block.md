---
target: specs/web/ux/dev-notes/how-work-fills-a-block.md
status: approved
promoted:
dev_note: "Dev note · How work fills a block"
rulings: [D-USE-31, D-USE-80, D-USE-87]
---

# How work fills a block

The two ways a Work block holds work, chosen when the block is made. Used by the New block sheet's Work state (`../set-my-days/new-block-sheet/states/work.md`, "How work fills it"), the block view's Set work (`../day/block-view/states/set-work.md`) and tiers (`../day/block-view/states/work-tiers.md`, `work-add-to-a-tier.md`), and Set my days (`../set-my-days/set-my-days/`), where a Work block sits in the usual week and This week.

## The dev note

**Dev note · How work fills a block** ("USE — set up", x 482, y 2520):

> Dev note · How work fills a block
>
> Two ways a Work block can hold work, chosen when the block is made. Taylor prefers the first; the second is for routines like writing Medium articles on Tuesday mornings.
>
> Logged in day/overview.md, Open.
>
> What's here now
>
> Tasks for the day (default): the block is time; work is slotted each week by tier (D-USE-31), from New item, the pool or Linear. Set work [PROPOSED]: the block carries the same items every time, like Wellness does, and they repeat with the usual week. Drawn: the choice in the New block sheet only.
>
> To investigate
>
> Whether a block can mix the two (set writing plus room for tasks); how set work meets tiers; whether set work links to a Linear project or recurring issue; what Copy from and Reset to usual do to slotted work; switching modes later.

No summary card sits under it (the `Frame` at x 482, y 3450 is absent from the map). "Logged in day/overview.md, Open" is the canvas's wording; the item lives in `../day/open/open-4.md` ("Dev note: how work fills a block").

## What it means for the build, with the later lines

- **Tasks for the day is the default** and is today's Work block: time, filled each week by tier (Urgent when it holds something, Primary, Secondary, Stretch) from New item, the pool or From Linear (D-USE-31). Nothing about it changes.
- **Set work [PROPOSED]** is the Work block made to behave like Wellness: fixed items, each with a length and a rail time, repeating with the block's Repeats rule (D-USE-80). Since the note was written, Set work's block view was drawn too (`block-view / work, set work, editing / 402 / light`, carried by `../day/block-view/states/set-work.md`): "Work fills it with: Set work" at the top, no tiers, nothing to slot in This week. So "Drawn: the choice in the New block sheet only" is out of date on the canvas; the canvas is not edited.
- **The choice** is made on the New block sheet when the kind is Work, Tasks for the day selected; the line above Add says where the block goes (`../set-my-days/new-block-sheet/states/work.md`).
- **Set work is still Work**: its block keeps Work's colour and kind; Life and To-dos are the kinds that never count as work (`life-and-todos.md`) [ASSUMPTION: set work counts as work in Review].
- **Decided (D-USE-87): The five questions to investigate** have no ruling. Defaults as drawn: one mode per block, no mixing (a writing routine and room for tasks are two blocks); set work has no tiers (the block view draws none); no Linear link on set work (its items are plain items, each may carry a size per `size-and-length.md`); Copy from and Reset to usual copy a Tasks-for-the-day block as empty tiers and a Set work block with its items [ASSUMPTION: not drawn]; switching mode later is not drawn, and the default is that the block's ··· has no switch in the first build.

## Rulings

- D-USE-31: tiers, the add row per tier and the pool, as the default mode uses them.
- D-USE-80: a Set work block repeats by its Repeats rule (Google's presets).
