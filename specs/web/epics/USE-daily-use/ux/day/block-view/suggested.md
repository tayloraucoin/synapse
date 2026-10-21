---
target: specs/web/ux/day/block-view/suggested.md
status: approved
promoted:
---

# Block view — suggested items

The fourth part of [`index.md`](index.md): a new or growing block in editing mode, with suggested items under its add row. These are the states drawn on "USE — set up" beside "Row label · Block view from Set my days", at x 6748 to 9158, y 3780 (notes at y 4710), from Taylor's 2026-10-20 notes. Coverage: [`../../boards/use-set-up/block-view-from-set-my-days.md`](../../boards/use-set-up/block-view-from-set-my-days.md). Where the list comes from and what a tap stores: [`../../dev-notes/suggested-items.md`](../../dev-notes/suggested-items.md). Rulings: D-USE-135 to 138 ([`../decisions/D-USE-135-138.md`](../decisions/D-USE-135-138.md)).

## Layout, top to bottom (phone 402)

As [`states/editing-monday.md`](states/editing-monday.md), with three additions:

1. **The span total**, under the `BlockHeader` and inset 16 px from its colour bar. On the left, "<n> of <span> min" (label, semibold, ink); on the right, "<m> min free" (label, medium, muted). Under them, a 4 px track in `--color-fill-muted`, filled in the kind's dot colour as far as the items reach.
2. **Item rows** as editing: the rail time, the icon, the name, the length and the grip. The length is the tap target for [`states/suggested-length.md`](states/suggested-length.md).
3. **The suggestion list**, under the `InlineAddRow`, which takes the place of the "Free until" region. Two groups, each with a muted heading (label, medium): "Used before", then "Suggested for <kind>". Each `PickerRow` is 56 px on a hairline and has four fixed lanes: a 36 px icon tile in the kind's chip tint with the emoji, the name (body), the length (label, medium, muted), and a 44 px target holding a 28 px round outlined +. "Add one" (a + and medium body) ends the list.

## States

| State                | File                                                                     | Widths | One line                                                           |
| -------------------- | ------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------ |
| new, suggested       | [`states/suggested-new.md`](states/suggested-new.md)                     | 402    | A new Thursday Wellness: nothing in it, the list under the add row |
| three added          | [`states/suggested-added.md`](states/suggested-added.md)                 | 402    | Three taps; rows land at the end, leave the list, "13 of 60 min"   |
| a length inline      | [`states/suggested-length.md`](states/suggested-length.md)               | 402    | The length's stepper open on Meditate: "15 min"                    |
| reordering           | [`states/suggested-reorder.md`](states/suggested-reorder.md)             | 402    | Meditate lifted to 7:07 over the ink drop line                     |
| past its span        | [`states/suggested-past-span.md`](states/suggested-past-span.md)         | 402    | "68 of 60 min", the track in ink, "Runs 8 min past 8:05"           |
| a kind's first block | [`states/suggested-first-of-kind.md`](states/suggested-first-of-kind.md) | 402    | The first Evening: only "Suggested for Evening"                    |

Loading, error and offline are as the editing states ([`states/loading.md`](states/loading.md), [`states/error.md`](states/error.md), [`states/editing-offline.md`](states/editing-offline.md)). The list loads with the block in one read, so there is no partial state. Offline, it is drawn faint and its + waits, as the add row does [ASSUMPTION].

## Words

Gloss. There is no second person; times and lengths are the only numbers.

- "Used before"; "Suggested for <kind>" ("Suggested for Wellness"); "Add one".
- "<n> of <span> min"; "<m> min free"; "Nothing in <block> yet"; "Runs <n> min past <end>".
- The length hint while editing: "Steps of 5 min, or type one."
- The reorder hint: "Hold a grip to move one. Times follow the order."

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- Each row's + is a button named "Add <name>, <length>" [PROPOSED]. After a tap, focus moves to the next row's +, or to "Add one" when the list is empty.
- Each group is a list with its heading as its name. The span total is a `meter` named "<block> planned", with its value text read as the words shown [PROPOSED].
- The length stepper is a spinbutton named "<name> length". Its value text is "<n> minutes", Up and Down step it, and its − and + are buttons of at least 44 px.
- Colour is never alone: the track always has its words, and past the span the ink fill comes with "Runs … past …".

## Criteria

| ID                           | When                         | Then                                                                                 | Evidence                                   |
| ---------------------------- | ---------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| C-USE-block-view-suggested-1 | A row's + is tapped          | One block item is added at the end with that length; it leaves the list; total moves | test                                       |
| C-USE-block-view-suggested-2 | A kind has items used before | "Used before" lists them first, one per name, nothing already in the block           | test                                       |
| C-USE-block-view-suggested-3 | A kind has never been used   | Only the seed shows, remapped to that kind                                           | `captures/suggested-first-of-kind-402.png` |
| C-USE-block-view-suggested-4 | The items pass the span      | The track fills in ink and "Runs <n> min past <end>" shows; adding still works       | `captures/suggested-past-span-402.png`     |
| C-USE-block-view-suggested-5 | A length is stepped          | The total and every later rail time move; Return saves                               | test                                       |
| C-USE-block-view-suggested-6 | Each `?state=` key above     | That state renders (canon C-P08)                                                     | capture                                    |
