---
target: specs/web/ux/day/item-sheet/states/swap-empty.md
status: approved
promoted:
boards:
  - name: "item-sheet / swap, empty library / 402 / light"
    page: "USE — set up"
    at: [3856, 6300]
    note: "Frame @ x 3856, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/swap-empty-402.png
rulings: [D-USE-37, D-USE-103]
---

# Item sheet — swap, empty library

Swap open when the current item is the only one of its kind. `?state=swap-empty`.

## What shows, top to bottom

- Behind the scrim, Review the day further down (Breakfast 9:00 to 9:30, Work 9:30 to 12:00 with "Primary" and "[Primary item, linked] · ENG-123"); the sheet is short (top at y 505).
- × at top left. Scope line "Swap · Training, 8:00 to 8:57"; title "Workout: gym".
- No search field (it hides when there is nothing to search).
- The current item's row, as in `swap.md`: icon tile, "Workout: gym", "35 min · starts 8:10", "Ends 8:55", checked.
- Under a hairline: "Nothing else of this kind yet." (semibold), then muted "Workouts added here stay in the library for any day.", then "+ Add one" as a muted filled button.

## What the person can do

- "Add one" opens the add sheet preset to the item's kind; what is added joins the library.
- × closes.

## Words

"Nothing else of this kind yet."; "<Kind, plural> added here stay in the library for any day."; "Add one".

## The notes on the boards

**item-sheet / swap, empty library / 402 / light** (Frame @ x 3856, y 7230):

> Swap, empty library
>
> Carried from step 4: "Nothing else of this kind yet." under the title, with Add one.

## Rulings

- D-USE-37: approved as drawn. Open "Item sheet, step 4 round 1": [PROPOSED] the empty library reads "Nothing else of this kind yet." when the current item shows above it, since N2's "Nothing of this kind yet." reads wrong there.
- Superseded, not specced: step 4's `item-sheet / swap, empty library / 402 / light` ("USE — daily use", Archive 1, x 4820, y 22800), D-USE-37. Its note read: "swap, empty library / Only the current workout exists, so the search hides. [PROPOSED] 'Nothing else of this kind yet.' (N2's 'Nothing of this kind yet.' reads wrong with the current item showing above it). Add one opens the add sheet preset to the workout kind."

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the right-side panel (`../index.md` › Platforms).

## Criteria

| ID                            | When                           | Then                                                                     | Evidence                      |
| ----------------------------- | ------------------------------ | ------------------------------------------------------------------------ | ----------------------------- |
| C-USE-item-sheet-swap-empty-1 | Swap with one item of the kind | No search; the current row, "Nothing else of this kind yet." and Add one | `captures/swap-empty-402.png` |
