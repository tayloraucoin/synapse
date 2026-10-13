---
target: specs/web/ux/day/block-view/states/work-tiers.md
status: approved
promoted:
boards:
  - name: "block-view / work, this week, tiers / 402 / light"
    page: "USE — set up"
    at: [0, 3780]
    note: "Note · grid, 80 @ x 0, y 4710"
    capture: specs/web/epics/USE-daily-use/ux/day/block-view/captures/work-tiers-402.png
rulings:
  [
    D-USE-24,
    D-USE-31,
    D-USE-33,
    D-USE-38,
    D-USE-79,
    D-USE-81,
    D-USE-84,
    D-USE-86,
  ]
---

# Block view — a Work block in This week, its tiers

Work tapped in Set my days' This week (`../../../set-my-days/set-my-days/states/the-day.md`), Monday 12 Oct, at 21:10. Editing mode, on the block's four tiers (D-USE-31; open-3 round 2; N2 "In This week, a work block opens on its tier sections"). `?state=work-tiers`. Its note is "Note · grid, 80" at x 0, y 4710.

## What shows, top to bottom

- **Status bar:** 21:10.
- **Breadcrumb:** "‹ Mon 12 › Work" (dated, as This week's chips are).
- **Header:** the sky bar, "Work" over "9:30 to 12:00 · this Monday only"; trailing, "Done" (plain text button) beside the round ···. Then a hairline.
- **Fit line** (caption, muted): "Primary fills to 12:00 at the top of its ranges. Secondary and Stretch go in if there's room."
- **Tiers**, each a heading with its colour square (D-USE-38, D-USE-79: Urgent red, Primary leaf, Secondary amber, Stretch slate), its rows, then its add row:
  - **Urgent:** no rows; "+ Add to Urgent" alone.
  - **Primary:** "[Write the sync spec]" with "ENG-123 · 3 Medium" under it, "1 to 2 h"; "[Review the Paper handoff]" "30 min"; "+ Add to Primary".
  - **Secondary:** "[Fix the retry backoff]" with "ENG-140 · 2 Small", "30 min to 1 h"; "+ Add to Secondary".
  - **Stretch:** "[Tidy the Linear backlog]" "15 min"; "+ Add to Stretch".
- Each row (as drawn): a grip at the **leading** edge (built at the trailing edge, D-USE-86), the title (bracketed titles are `[placeholder]`), a Linear item's ID and size in points and word under it, the length or range trailing. No checkboxes, no rail times, no "Free until", no peek.

## What the person can do

- Tap a tier's add row: its dropdown ([`work-add-to-a-tier.md`](work-add-to-a-tier.md)).
- Drag a grip to reorder within a tier [ASSUMPTION: and across tiers, as Move to does on the Item sheet].
- Tap a row: the Item sheet ([`../../item-sheet/index.md`](../../item-sheet/index.md)), size and tier on work items ([`../../item-sheet/states/tier-and-sessions.md`](../../item-sheet/states/tier-and-sessions.md)).
- Swipe left to remove, with Undo [ASSUMPTION: as [`editing-monday.md`](editing-monday.md)].
- "Done" or "‹ Mon 12": back to the day in Set my days [ASSUMPTION: every change saves as made, so Done only leaves].

Every change is for this Monday only (the span line); the usual Monday is unchanged (D-USE-33's reach rules). A size sets a range, a length alone stands (`../../../dev-notes/size-and-length.md`, D-USE-81).

## Words

"this Monday only" · "Primary fills to 12:00 at the top of its ranges. Secondary and Stretch go in if there's room." · "Urgent", "Primary", "Secondary", "Stretch" · "Add to <tier>" · "<ID> · <points> <size word>".

## The notes on the boards

**"block-view / work, this week, tiers / 402 / light"**, note "Note · grid, 80" @ x 0, y 4710:

> The work block, tiers (D-USE-31)
>
> Tapping Work opens its block view in editing (Done, not Edit). The four tiers, each with its add row; Urgent stays as an add row when empty (Open default). A fit line says where the plan ends at the top of its ranges, in words. Changes here are "this Monday only".

## Rulings

- D-USE-31: the tiers, coloured, Urgent above Primary, an add row per tier. Urgent stays as an add row when empty in editing (the note's Open default); in go mode Urgent shows only when it holds something (open-2, step 8 round 1).
- D-USE-24: in editing, Edit reads Done. Decided (D-USE-84) `editing-monday.md` (step 3) draws ··· alone in editing; every set-up frame draws "Done". Default: "Done" beside ··· in every editing frame, as drawn here.
- Decided (D-USE-86): the grip sits at the trailing edge on work rows too, as on every other kind (D-USE-17); the frame draws it leading, superseded in behaviour.
- Fit line variants (Primary past the end, nothing in Primary) are not drawn [ASSUMPTION: the line names where the plan ends in words, never a count, never red].
- Bend named: tier colours bring red (Urgent) onto the tabs' surfaces (D-USE-38, D-USE-79).

## Widths

Drawn at: 402. Wider scales up (D-USE-39); from 1024 Set my days is list-detail (D-USE-83) [ASSUMPTION: Block view opens in the day pane, as `editing-monday.md`]. At the desk a Schedule block opens its Block panel (D-USE-77), area 7.

## Criteria

| ID                            | When                                | Then                                                                                                | Evidence                      |
| ----------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------- |
| C-USE-block-view-work-tiers-1 | A Work block is tapped in This week | "‹ Mon 12 › Work", "this Monday only", Done and ···, the fit line, four tiers each with its add row | `captures/work-tiers-402.png` |
| C-USE-block-view-work-tiers-2 | Urgent holds nothing                | "+ Add to Urgent" still shows under its heading                                                     | `captures/work-tiers-402.png` |
| C-USE-block-view-work-tiers-3 | An item is added, moved or removed  | Only this Monday changes; the usual Monday is unchanged                                             | test                          |
| C-USE-block-view-work-tiers-4 | The items change                    | The fit line re-states where the plan ends, in words, with no count                                 | test                          |
