---
target: specs/web/ux/day/review-the-day/states/no-work-add-to-primary.md
status: approved
promoted:
boards:
  - name: "review-day / no-work, add to primary / 402 / light"
    page: "USE — daily use"
    at: [6266, 3900]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/no-work-add-to-primary-402.png
rulings: [D-USE-16, D-USE-19, D-USE-22, D-USE-20]
---

# Review the day — no work, Add to Primary

"Add to Primary" tapped on an empty Work block: the add sheet, preset. The sheet's general form (the rail's add sheet, Item or Block, Starts) is [`../../../interactions/add-from-the-rail/states/add-sheet.md`](../../../interactions/add-from-the-rail/states/add-sheet.md); this file carries the preset form. Its note is the "Note · success" at x 6266, y 4830.

## What shows, top to bottom

- Review the day under a scrim; the sheet from y 152 with a grabber.
- × on the left, then the scope line "Work · 9:30 to 12:00 · today only" (caption, muted) over the title "Add to Primary".
- **Name:** the label "Name", then the emoji slot (`EmojiSlotButton`, 44 px, a muted face) and the name field "Draft the onboarding email [placeholder]".
- A hairline row "Link a Linear issue" with a chevron.
- **Tier:** the label, then a four-way `SegmentedControl`: Urgent, Primary (picked, outlined on white), Secondary, Stretch.
- **Length:** a `MinutesStepper`, "− 45 min +".
- **Notes (optional):** an empty autogrow `Textarea`.
- No Starts field and no Item or Block switch.
- Foot line (label, muted): "Goes in today's Work, 9:30 to 12:00. Monday's usual is unchanged." Then "Add", full width, ink.

## What the person can do

- Change the tier (still changeable). "Add to Secondary" opens the same sheet with Secondary picked.
- "Link a Linear issue" opens the Linear search [ASSUMPTION: the Item sheet's, `../../item-sheet/states/linear-search.md`].
- The emoji slot opens the icon picker (`../../../interactions/icon-picker/index.md`).
- **Add** puts the item in today's Work under its tier and closes the sheet. × or a drag down closes with nothing added.

## Words

"<Block> · <start> to <end> · today only" · "Add to <Tier>" · "Name" · "Link a Linear issue" · "Tier" · "Length" · "Notes (optional)" · "Goes in today's <Block>, <start> to <end>. <Weekday>'s usual is unchanged." · "Add".

## The notes on the boards

**"review-day / no-work, add to primary / 402 / light"**, "Note · success" @ x 6266, y 4830:

> no-work · Add to Primary
>
> The add sheet, preset: titled for the tier, the block named above it, the tier picked in the control (still changeable). Add to Secondary opens the same sheet with Secondary picked. No Starts field: in a work block, order is by tier, not time. Today only.

## Rulings

- D-USE-22: each Add row opens the add sheet preset to its tier.
- D-USE-16, D-USE-19: the add sheet's fields, here without Starts (order in a work block is by tier).
- D-USE-20: the four tiers.

## Widths

Drawn at: 402. At the desk: the right-side panel at `--sheet-w` (D-USE-39).

## Criteria

| ID                                            | When           | Then                                                                    | Evidence                                  |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------- | ----------------------------------------- |
| C-USE-review-the-day-no-work-add-to-primary-1 | Add to Primary | The sheet titled "Add to Primary", Primary picked, no Starts            | `captures/no-work-add-to-primary-402.png` |
| C-USE-review-the-day-no-work-add-to-primary-2 | Add            | The item is in today's Work under its tier; the usual week is unchanged | test                                      |
