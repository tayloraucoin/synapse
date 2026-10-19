---
target: specs/web/ux/work/today/states/later-work-block.md
status: approved
promoted:
boards:
  - name: "now-work / later block, 13:00 / 402 / light"
    page: "USE — daily use"
    at: [2410, 16500]
    note: "Frame @ x 2410, y 17430"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/later-work-block-402.png
rulings: [D-USE-45, D-USE-48, D-USE-49, D-USE-51, D-USE-57, D-USE-65, D-USE-77]
---

# Today — a later work block

The day's second Work block, 13:00 to 15:00. The tiers belong to the day (N4, refinement 6): the later block shows only what is still open, so an item never sits in two blocks. `?state=later-work-block`.

## What shows, top to bottom

**Phone (402, 13:05), as drawn:** `AppHeader` "Now", the To-dos tray line, the Work `BlockHeader` ("Work", "13:00 to 15:00", ···). Then:

- Under the header, a quiet line [PROPOSED]: "What's still open from the morning's Work. What was done stays in the 9:30 block."
- **Primary**: the lifted card for "[Review the Paper handoff]", "30 min · 13:00", **Start** and **Done**. The morning's done Primary ("[Write the sync spec]") does not show.
- **Secondary**: "[Agent: refactor the sync queue]" "30 min". The morning's done "[Answer the review comments]" does not show.
- **Stretch**: "[Tidy the Linear backlog]" "15 min".
- `BottomNav`.

Each tier that still holds something keeps its heading; [ASSUMPTION] a tier with nothing open folds as [primary-only](primary-only.md) draws it. Items still firing when the morning's block ended: [firing](../../../interactions/firing.md) ("Still firing, from Work"); they wait in their tier and show here, firing in place (D-USE-57).

**The build, with the later rulings applied:** rows and card take the locked phone form (D-USE-51) and the shaded Next card (D-USE-45, D-USE-49).

**Desk (not drawn):** Today shows the day's tiers all day, so the split by block applies to the phone. At the desk the done items stay in their tiers with their Done record (D-USE-48), the band names the current Work block ("Work 13:00 to 15:00 · …"), and no quiet line shows [ASSUMPTION: nothing at the desk needs the line, since nothing is hidden there].

## What the person can do

Everything as [working](working.md). [ASSUMPTION] The morning's done work is seen in Review and on the Schedule, in the 9:30 block, as the line says; Now does not link to it.

## Words

"What's still open from the morning's Work. What was done stays in the 9:30 block." [PROPOSED] (open-2, step 8: not ruled). The block's start time in the line ("9:30") is the earlier Work block's start.

## The notes on the boards

**"now-work / later block, 13:00 / 402 / light"**, "Frame" @ x 2410, y 17430:

> later block, 13:00
>
> Tiers belong to the day. The 13:00 block shows only what's still open; a quiet line says so and names where the done work stays. An item never sits in two blocks.

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- D-USE-57: items firing when a Work block ends wait in their tier for the next Work block.
- D-USE-65: outside a Work block the desk tiers show no Next lift and no Start; inside the 13:00 block they do.
- The frame draws plain rows and a verdigris-dot card; D-USE-51 makes them the trimmed work rows.

## Widths

Drawn at 402. Desk: above (the tiers are the day's; no line).

## Criteria

| ID                             | When                                          | Then                                                                                    | Evidence                            |
| ------------------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------- |
| C-USE-today-later-work-block-1 | The day's second Work block starts            | Only undone items show; done ones do not repeat; the quiet line names the earlier block | `captures/later-work-block-402.png` |
| C-USE-today-later-work-block-2 | An item was firing when the first block ended | It shows in its tier in the later block, still firing                                   | manual                              |
