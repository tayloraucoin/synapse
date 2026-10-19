---
target: specs/web/ux/day/item-sheet/states/swap.md
status: approved
promoted:
boards:
  - name: "item-sheet / swap / 402 / light"
    page: "USE — set up"
    at: [3374, 6300]
    note: "Frame @ x 3374, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/swap-402.png
rulings: [D-USE-12, D-USE-37, D-USE-60, D-USE-103]
---

# Item sheet — swap

Swap open on "Workout: gym" in Training: the library, filtered to the item's kind. `?state=swap`.

## What shows, top to bottom

- Behind the scrim, Review the day as in `default.md`; the sheet's top at y 340.
- × alone at top left (no Swap, no ··· in this step).
- Scope line: "Swap · Training, 8:00 to 8:57". Title: "Workout: gym" (the current pick).
- `SearchField`, full width, matching the shadcn input (background, input border): a search icon and "Search workouts".
- A `PickerList` of the kind, one row each on hairlines, in fixed-width columns: the icon tile (the kind's tint, a line icon in its colour), the name, under it "<length> · starts <time>" muted, then "Ends <time>" (where Training ends with that pick) right-aligned, then a check slot. Drawn: "Workout: gym", "35 min · starts 8:10", "Ends 8:55", checked; "Home workout", "25 min · starts 8:10", "Ends 8:45"; "Yoga", "30 min · starts 8:10", "Ends 8:50"; "Abs at home", "20 min · starts 8:10", "Ends 8:40".
- Last row: "+ Add one".

## What the person can do

- Tap a row: it replaces the item, saves for today, and the sheet closes: two taps from the day. The day shows the swap with Undo (`review-day / after swap, undo`, carried by Review the day).
- Type to filter by name. "Add one" opens the add sheet preset to the item's kind (step 4's note).
- × closes with nothing changed.

## Words

"Swap · <Block>, <start> to <end>"; "Search <kind, plural>" ("Search workouts"); "<n> min · starts <time>"; "Ends <time>"; "Add one".

## The notes on the boards

**item-sheet / swap / 402 / light** (Frame @ x 3374, y 7230):

> Swap open
>
> Carried from step 4 (D-USE-12): rows lead with the icon, then length and start, then where the block ends. The search field now matches the shadcn input (background, input border).

## Rulings

- D-USE-12: Swap rows lead with the icon, then length and start, then where the block ends.
- D-USE-37: redrawn at step 11 and approved.
- D-USE-60 (1): swapping a gym workout for one at home leaves the drives to and from the YMCA; they are removed by hand.
- Superseded, not specced: step 4's `item-sheet / swap / 402 / light` ("USE — daily use", Archive 1, x 4338, y 22800), D-USE-37. Its note read: "swap (D-USE-12) / The library, filtered to workouts, searchable. Each row: its icon, length and start, then where Training ends with that pick, in fixed-width columns. The current pick carries the check. One tap picks and closes: two taps from the day."

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                      | When              | Then                                                                                          | Evidence                |
| ----------------------- | ----------------- | --------------------------------------------------------------------------------------------- | ----------------------- |
| C-USE-item-sheet-swap-1 | Swap on a workout | Only workouts list, the current one checked, each with length, start and where the block ends | `captures/swap-402.png` |
| C-USE-item-sheet-swap-2 | A row is tapped   | The item is replaced for today, the sheet closes and Undo is offered; the drives stay         | manual                  |
