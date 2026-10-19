---
target: specs/web/ux/dev-notes/training-for.md
status: approved
promoted:
dev_note: "Dev note · What are you training?"
rulings: [D-USE-87]
---

# What are you training?

A Training block's focus: what the time trains. Used by the block view's Training editing (`../day/block-view/states/training-editing.md`, "Training for: Body fitness" at the top), by Swap there and in go mode, and by Set my days (`../set-my-days/set-my-days/`) and the New block sheet (`../set-my-days/new-block-sheet/`), where a Training block is made.

## The dev note

**Dev note · What are you training?** ("USE — set up", x 964, y 2520):

> Dev note · What are you training?
>
> Training is dojo time, not only the gym. Taylor's forward look: other people will block time to train athletic skills, voice and speech, and more.
>
> Logged in day/overview.md, Open.
>
> What's here now
>
> [PROPOSED] A "Training for" picker at the top of a Training block, Body fitness by default. Nothing else changes: items, Swap and the library work as now. Swap filters by the focus (a vocal warm-up swaps for another vocal one).
>
> To discover later
>
> Which focuses to offer and whether people name their own; whether each focus has its own library and icons; whether Review groups by focus; whether this is Training at all or a new kind. A discovery pass, not now.

No summary card sits under it. "Logged in day/overview.md, Open" is the canvas's wording; the item lives in `../day/open/open-4.md` ("Dev note: what are you training?").

## What it means for the build, with the later lines

- **The picker is drawn** on `block-view / training, editing / 402 / light`: "Training for: Body fitness" at the top, per this note; items, the drives as italic transitions, and the workout's Swap (library, same kind) work as now.
- **Swap filters by the focus** [PROPOSED]: a swap offers library items of the same focus.
- **No ruling** covers the picker: it stays [PROPOSED] as drawn.
- **Decided (D-USE-87): What the first build ships.** Default: the "Training for" row shows Body fitness, the only focus, so Swap and the library behave exactly as today; the list of focuses, custom focuses, per-focus libraries and icons, Review grouping by focus, and whether this becomes its own kind wait for the discovery pass the note names [ASSUMPTION: Body fitness as the only value until then].
- **The note's title** ("What are you training?") is canvas wording, not product copy; the product label is "Training for".

## Rulings

None yet; every line above is [PROPOSED] as drawn or marked.
