---
target: specs/web/ux/day/block-view/states/todos-pool.md
status: approved
promoted:
boards:
  - name: "block-view / to-dos, the To-dos pool, Out / 402 / light"
    page: "USE — set up"
    at: [5302, 3780]
    note: "Frame @ x 5302, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/todos-pool-402.png
rulings: [D-USE-34, D-USE-35, D-USE-39, D-USE-74, D-USE-83, D-USE-87]
---

# Block view — From To-dos, the picker

"From To-dos" chosen in Errands' add menu ([`todos-add-open.md`](todos-add-open.md)): a sheet of to-dos with no day, to slot into the block for its date. `?state=todos-pool`. Its note is "Frame" at x 5302, y 4710. Why the block and the to-do are joined only by a slot: [`../../../dev-notes/blocks-and-todos-model.md`](../../../dev-notes/blocks-and-todos-model.md); the kind: [`../../../dev-notes/life-and-todos.md`](../../../dev-notes/life-and-todos.md).

## What shows, top to bottom

- The block view behind under a scrim (not drawn through it).
- **A `ResponsiveSheet`** (bottom sheet at 402, from a little under half-screen) with a grabber.
- **Header:** × (top left); "Into Errands · Sat 17, 10:00 to 12:30" (caption, muted) over "From To-dos" (title).
- **The type filter,** chips in a row: "All types" (selected: an ink fill, light words), "Errand", "Home" (outlined).
- **Rows** on hairlines, each a `Checkbox`, the to-do's icon, its name, a meta line where it has one, and its length trailing (muted):
  - checked: 📦 "Return the parcel", 15 min (no meta line);
  - 📚 "Return the library books", "Errand · added Mon 5 Oct", 30 min;
  - 📮 "Post office: stamps", "Errand · repeats monthly", 40 min;
  - greyed, no checkbox: 🛒 "Groceries", "In Errands" trailing in place of a length (already in the block).
- **Footer line** (label, muted): "Adds Return the parcel. Errands then runs to 11:35, inside its time. [placeholder to-dos]".
- **The primary button,** full width, ink: "Add to Errands".

## What the person can do

- **Check or uncheck** to-dos; the footer line names what will be added and where the block then ends.
- **The type filter** narrows the list to one type to help picking; All types by default (open-5, framing round 4). It filters this list only: the block itself never filters by Type ([`../../todo-sheet/states/type-open.md`](../../todo-sheet/states/type-open.md), round 4). [ASSUMPTION: the chips show only the types among the to-dos listed, so Call, Digital and Other are absent here; one type at a time.]
- **Add to Errands:** slots the checked to-dos into the block for Sat 17, after the last item, and closes the sheet. × or a drag down closes with nothing added.
- A greyed row is already in the block and can't be checked.

## Words

"Into Errands · Sat 17, 10:00 to 12:30"; "From To-dos"; "All types", then each type's word (Home, Errand, Call, Digital, Other); "<Type> · added <day>", "<Type> · repeats monthly"; "In Errands"; "Adds <to-do>. Errands then runs to 11:35, inside its time."; "Add to Errands".

## The notes on the boards

**"block-view / to-dos, the To-dos pool, Out / 402 / light"**, note "Frame" @ x 5302, y 4710:

> The To-dos pool
>
> [PROPOSED] From To-dos, with a type filter (All types by default) to help pick; what's already in the block is greyed; the line above Add names where the block then ends.

## Rulings

- Open-5, framing round 4 [PROPOSED, "Awaiting Taylor"]: the From To-dos sheet keeps a type filter, All types by default; a block never filters by Type; round 3's per-block type picker is superseded. Type values are the To-do sheet's: Home, Errand, Call, Digital, Other (D-USE-35: Computer became Digital).
- The frame name's "Out" is round 2's Where, as [`todos-add-open.md`](todos-add-open.md) says; the filter here is by Type.
- Order: oldest first (round 4) [ASSUMPTION: the list is in that order; "Return the parcel" with no meta is the oldest]. Decided (D-USE-74) fills a block in go mode the same way.
- Decided (D-USE-87) **The footer line when the picks run past the block's end.** Not drawn. Default: the same line naming the new end, "Errands then runs to <time>, past its time." in ink, Adding still allowed, as the New block sheet's clash allows it.
- Decided (D-USE-87) **No to-dos with no day.** Not drawn. Default: the sheet reads "Nothing in To-dos." over "New to-do" [ASSUMPTION].
- Lengths shown here: as [`todos-add-open.md`](todos-add-open.md)'s Decided (D-USE-87).

## Widths

Drawn at: 402. At the desk: `ResponsiveSheet`'s right panel, as every sheet (D-USE-39); at 1024 Set my days is list-detail (D-USE-83).

## Criteria

| ID                            | When                         | Then                                                                                                                                          | Evidence                      |
| ----------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| C-USE-block-view-todos-pool-1 | From To-dos is chosen        | A sheet "From To-dos" with "Into <block> · <date>, <span>", the type filter on All types, to-dos with no day, each with icon, meta and length | `captures/todos-pool-402.png` |
| C-USE-block-view-todos-pool-2 | A to-do already in the block | It shows greyed with "In <block>" and can't be picked                                                                                         | `captures/todos-pool-402.png` |
| C-USE-block-view-todos-pool-3 | To-dos are checked           | The footer names what is added and where the block then ends                                                                                  | `captures/todos-pool-402.png` |
| C-USE-block-view-todos-pool-4 | A type chip is picked        | The list narrows to that type; the block keeps every type it holds                                                                            | test                          |
| C-USE-block-view-todos-pool-5 | Add to <block>               | The checked to-dos are slotted into the block for that date, after the last item                                                              | test                          |
