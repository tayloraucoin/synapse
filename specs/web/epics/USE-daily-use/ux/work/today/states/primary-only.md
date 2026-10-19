---
target: specs/web/ux/work/today/states/primary-only.md
status: approved
promoted:
boards:
  - name: "now-work / primary-only / 402 / light"
    page: "USE — daily use"
    at: [482, 16500]
    note: "Frame @ x 482, y 17430"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/primary-only-402.png
rulings:
  [
    D-USE-38,
    D-USE-41,
    D-USE-45,
    D-USE-49,
    D-USE-50,
    D-USE-51,
    D-USE-54,
    D-USE-77,
  ]
---

# Today — only Primary set

Only Primary holds work; Secondary and Stretch are empty. Step 8 round 1 on "USE — daily use" (Work block row). `?state=primary-only`.

## What shows, top to bottom

**Phone (402, 9:40), as drawn:** `AppHeader` "Now" with the avatar "T"; the To-dos tray line ("To-dos Call the mechanic…" with its chevron); the Work block's `BlockHeader` (colour bar, "Work", "9:30 to 12:00", ···). Then:

- **Primary** heading. The lifted card for "[Write the sync spec]": item icon, the 8 px dot, the title, "45 min · 9:30", **Start** and **Done** (48 px high).
- A row: "[Review the Paper handoff]", "30 min".
- A pinned meeting row: "[Standup]" with a "Work" `Tag`, and "11:00" on the right in place of a length (open-2 [ASSUMPTION]: a meeting sits in the flow where the plan reaches its time).
- **Secondary**, folded: a `GroupHeading` (collapsed) with "+ Add" on the right [PROPOSED].
- **Stretch**, folded the same way, "+ Add" on the right [PROPOSED].
- `BottomNav`: Now, Schedule, Review.

N4: "Secondary and Stretch are collapsed to their headings". Urgent does not show: it holds nothing (D-USE-38).

**The build, with the later rulings applied:** the frame draws step 8's plain rows and card; the locked phone Today (D-USE-50, D-USE-51) makes them the trimmed work rows (ring lead slot, project emoji, client tile, ID, priority and size chips, the length as a range) and the shaded lifted Next card (D-USE-45, D-USE-49), and puts + in the Now header (D-USE-51). The meeting row is an event, plum (D-USE-38), with its Work tag.

**Desk (not drawn):** each empty tier shows only its `GroupHeading` with its colour square; on hover the heading offers "+ Add to <tier>", which opens one search over the pool and Linear with the tier set (D-USE-41; [add](../../../interactions/add/index.md)).

## What the person can do

- **+ Add** on a folded heading [PROPOSED]: opens Add with that tier set ([add](../../../interactions/add/index.md), step 2 with the tier set), so a folded tier takes work without unfolding first.
- Start or Done on the card; everything else as [working](working.md).

## Words

"Primary", "Secondary", "Stretch", "+ Add", "Work", "11:00".

## The notes on the boards

**"now-work / primary-only / 402 / light"**, "Frame" @ x 482, y 17430:

> primary-only
>
> Secondary and Stretch fold to their headings. [PROPOSED] Each folded heading carries "+ Add" on the right, so a folded tier still takes work without unfolding first.

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- D-USE-50: the phone's work block takes N4's rules; the desk follows the same tiers.
- D-USE-38: tiers step red, leaf, amber, slate; Urgent shows only when it holds something.
- The frame draws plain rows and a verdigris-dot card; D-USE-51 makes them the trimmed work rows and D-USE-45, D-USE-49 the shaded Next card.
- The folded heading's "+ Add" stays [PROPOSED] (step 8, not ruled). D-USE-54 superseded the "add row under each tier" frame; the folded heading's "+ Add" is the only add on a folded tier besides + in the header.
- D-USE-41: the desk's "+ Add to <tier>" on hover.

## Widths

Drawn at 402. Desk: D-USE-41, above.

## Criteria

| ID                         | When                         | Then                                                                                | Evidence                        |
| -------------------------- | ---------------------------- | ----------------------------------------------------------------------------------- | ------------------------------- |
| C-USE-today-primary-only-1 | Only Primary holds items     | Secondary and Stretch show only their headings, each with "+ Add"; Urgent is absent | `captures/primary-only-402.png` |
| C-USE-today-primary-only-2 | "+ Add" on a folded heading  | Add opens with that tier set                                                        | manual                          |
| C-USE-today-primary-only-3 | Desk, hover on an empty tier | "+ Add to <tier>" shows                                                             | manual                          |
