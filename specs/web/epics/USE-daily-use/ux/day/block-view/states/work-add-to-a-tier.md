---
target: specs/web/ux/day/block-view/states/work-add-to-a-tier.md
status: approved
promoted:
boards:
  - name: "block-view / work, add to a tier / 402 / light"
    page: "USE — set up"
    at: [482, 3780]
    note: "Note · name only, 80 @ x 482, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/work-add-to-a-tier-402.png
rulings: [D-USE-28, D-USE-31, D-USE-41, D-USE-57, D-USE-81]
---

# Block view — a Work block, adding to a tier

[`work-tiers.md`](work-tiers.md) with "+ Add to Primary" pressed and its dropdown open. Monday 12 Oct, 21:10. `?state=work-add-to-a-tier`. Its note is "Note · name only, 80" at x 482, y 4710.

## What shows, top to bottom

- Everything in [`work-tiers.md`](work-tiers.md), unchanged above Primary's add row.
- **The pressed add row** "+ Add to Primary" takes a muted fill, full width.
- **The dropdown** under it, a shadcn `DropdownMenu` (D-USE-28: background token, hairline border, 10 px radius, one soft shadow), over Secondary and the top of Stretch. Titled "Add to Primary" (caption, muted), then three rows, each a leading muted icon, a label and a muted line:
  - "+" — "New item" / "Type a title and a length"
  - layers — "From the pool" / "Work saved for later, not on a day yet"
  - the Linear mark — "From Linear" / "Issues assigned to Taylor"

## What the person can do

Pick a row: what each does is step 8's, carried in [`../../../interactions/add/index.md`](../../../interactions/add/index.md) (the tier add row skips the four-choice menu with the tier set, D-USE-41; From Linear by size, its length from the size). Here the tier is Primary and the day is this Monday. Tapping outside, or Esc, closes it without adding.

## Words

"Add to Primary" · "New item", "Type a title and a length" · "From the pool", "Work saved for later, not on a day yet" · "From Linear", "Issues assigned to Taylor".

## The notes on the boards

**"block-view / work, add to a tier / 402 / light"**, note "Note · name only, 80" @ x 482, y 4710:

> Add to a tier
>
> Step 8's dropdown, unchanged: New item, From the pool, From Linear. The pressed add row takes a fill.

## Rulings

- D-USE-31: an add row per tier with New item, From the pool, From Linear (by workspace when more than one); open-2 step 8 round 2 titled the dropdown with the tier.
- D-USE-57: nothing added here is written to Linear.
- D-USE-81: New item takes a length typed with it; a work item keeps `../../../dev-notes/size-and-length.md`.
- "Issues assigned to Taylor" is the fixture's name [placeholder]; the shipped line names the signed-in person [ASSUMPTION], never "you".

## Widths

Drawn at: 402. Wider scales up (D-USE-39); the dropdown keeps its width under the row. At the desk a Schedule block opens its Block panel (D-USE-77), area 7.

## Criteria

| ID                                    | When                       | Then                                                                                                 | Evidence                              |
| ------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------- |
| C-USE-block-view-work-add-to-a-tier-1 | A tier's add row is tapped | The row takes a fill and a dropdown titled with the tier offers New item, From the pool, From Linear | `captures/work-add-to-a-tier-402.png` |
| C-USE-block-view-work-add-to-a-tier-2 | A choice is made           | It runs `interactions/add/index.md`'s step with the tier and this Monday set                         | test                                  |
