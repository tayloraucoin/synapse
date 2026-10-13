---
target: specs/web/ux/interactions/move-to/states/plain-item.md
status: approved
promoted:
boards:
  - name: "item-sheet / move to, a plain item / 402 / light"
    page: "USE — set up"
    at: [1446, 6300]
    note: "Frame @ x 1446, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/interactions/move-to/captures/plain-item-402.png
rulings: [D-USE-37, D-USE-60, D-USE-103]
---

# Move to — a plain item

From the Item sheet's ··· › Move to… on "Meditate" at 6:58.

## What shows, top to bottom

- The scrim over the screen; the sheet from y 330.
- Back link "‹ Meditate". Scope line "Meditate · 10 min · in Wellness, 7:05 to 8:00"; title "Move to".
- Group heading "Later today", then rows on hairlines, each with a 3 px bar in the target block's kind colour at its left edge, the target, and its consequence muted under it:
  - "Lunch, 12:00 to 13:00", "Goes after the meal · fits, 20 min free" (slate bar);
  - "[Wind down], 21:30 to 22:00", "Runs to 22:05, 5 min past its end" (green bar).
- Group heading "Another day": "Tomorrow, Wellness 7:05", "Tuesday 13 October · at the end of Wellness" (green bar).
- "Pick a day" with a calendar icon and a chevron.
- Footer line, muted: "One tap moves it and closes the sheet, with Undo in the toast. For today only; Monday's usual is unchanged."

## What the person can do

- Tap a target: the item moves there, the sheet closes, Undo in the toast.
- Pick a day opens `pick-a-day.md`. Back returns to the item.

## Words

"Move to"; "Later today"; "Another day"; "Tomorrow, <block> <start>"; "Goes after <item> · fits, <n> min free"; "Runs to <time>, <n> min past its end"; "<Weekday> <d> <Month> · at the end of <block>"; "Pick a day"; the footer line.

## The notes on the boards

**item-sheet / move to, a plain item / 402 / light** (Frame @ x 1446, y 7230):

> Move to, a plain item · round 2 [PROPOSED]
>
> From ··· Move to… (Taylor asked what it opens). A step inside the sheet, back on the left to the item. Later today, then Another day, each row with its consequence (where it goes, the room left or how far past its end); Pick a day opens a date step [not drawn yet]. One tap moves and closes, Undo in the toast.

## Rulings

- D-USE-37, D-USE-60 (2): approved; the date step "[not drawn yet]" in the note was drawn in round 3 (`pick-a-day.md`).
- The kind-colour bar sits beside the block's name, so colour is never alone; it reads near A-05 (accent stripe) and is kept as drawn (Paper wins on how it looks).
- [ASSUMPTION] Later today lists every later block that can take the item's kind, in time order, not only blocks of its own kind (Lunch is drawn).

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the same step inside the right-side panel (`../../../day/item-sheet/index.md` › Platforms).

## Criteria

| ID                         | When                     | Then                                                                         | Evidence                      |
| -------------------------- | ------------------------ | ---------------------------------------------------------------------------- | ----------------------------- |
| C-USE-move-to-plain-item-1 | Move to… on a plain item | Later today and Another day rows, each with its consequence, then Pick a day | `captures/plain-item-402.png` |
