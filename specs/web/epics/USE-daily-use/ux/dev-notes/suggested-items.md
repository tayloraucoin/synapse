---
target: specs/web/ux/dev-notes/suggested-items.md
status: approved
promoted:
dev_note: "Dev note · Suggested items"
rulings: [D-USE-135, D-USE-136]
---

# Suggested items

Where the list under a block's add row comes from, and what a tap stores. It is used by Block view's suggested states (`../day/block-view/suggested.md`) and shares its source with the Item sheet's Swap (`../day/item-sheet/states/swap.md`).

## The dev note

**Dev note · Suggested items** ("USE — set up", x 9640, y 3780):

> Dev note · Suggested items
>
> Where the list under a block's add row comes from, and what a tap stores. The same list Swap reads, so the two never drift.
>
> Where it comes from
>
> 1. Used before: every item in any block of the same kind, one per name, with its last length; transitions and meals left out; what is already in this block left out. Derived on read, as Swap's library is today.
> 2. The seed, after: STARTER_LIBRARY (@syn/constants) remapped to the seven kinds. Wellness ← morning (Recommended first) and prep; Training ← Run, Swim, Yoga, Mobility, Climb, Ride; Life ← activity; Break ← break; Evening ← wind_down, then Cook, Dinner, Chores. A seed row whose name is already used before shows once, in Used before. Work and To-dos show no list: they fill by tiers and from To-dos.
>
> What is stored
>
> Nothing new. A tap writes one block_items row (title, icon, length_min, position at the end), the same write as the add row; This week's edits stay date-scoped as every other edit. The seed stays a constant, never copied per person. No table for the library, no dismissed list: an item leaves the list by being in the block.
>
> Logged in day/block-view/suggested.md and D-USE-135 to 138.

## What it means for the build

- **The remap** is a new constant keyed by `NEW_BLOCK_KINDS` (`packages/constants/src/block-kinds.ts`), built from the existing `STARTER_LIBRARY` rows; their titles, glyphs and ranges stay as they are. A row's length is its `rangeMin`, and within a kind the `recommended` rows come first. `orient`, `work`, `todos` and the old `transition` map to nothing. `placed` wind-down rows (Journal, Phone away) are offered as ordinary rows here.
- **Training's seed** is new: there was no `training` row. It is drawn from existing rows (morning's Run, Swim, Yoga and Mobility; activity's Climb and Ride), so no new copy is added.
- **Used before** is today's `libraryOf` in `apps/web/lib/data/use-item-sheet.ts`, lifted into a shared pure function so Swap and Block view read one list. It adds the item's last length and icon.
- **Dedupe** is by title, case-insensitive [ASSUMPTION].
- **No schema change.** A tap is the add row's write, with the title, icon and length filled in.
