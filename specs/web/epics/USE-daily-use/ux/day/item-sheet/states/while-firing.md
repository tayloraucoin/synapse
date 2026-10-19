---
target: specs/web/ux/day/item-sheet/states/while-firing.md
status: approved
promoted:
boards:
  - name: "phone-today / item sheet, while firing / 402 / light"
    page: "USE — work"
    at: [10122, 5760]
    note: "Notes · phone, Today (row 5, cont.) @ x 10122"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/while-firing-402.png
rulings: [D-USE-44, D-USE-53, D-USE-57, D-USE-58, D-USE-103]
---

# Item sheet — while firing

A firing row tapped on the phone's Today at 12:20. `?state=while-firing`.

## What shows, top to bottom

- Behind the scrim, "Now" and the Work block header. The sheet from y 330: × left, ··· right.
- Scope line "Mon 12 · Work · Primary".
- Title row: the project emoji (a lock with key) inline before "[Portal sign-in: magic link flow]".
- `LinearLine`: a bordered chip with the In progress half-disc and "In progress"; "KES-42"; the project emoji and "Patient portal" muted; "Linear ↗".
- **The firing panel** (a muted rounded panel): the `FiringMark` (a rust dot in a grey halo) and "Firing · 22 min" in `--color-red-700`, under it muted "Prompt sent at 11:58 · worked 40 min before it".
- **Tier**: label, and on the right muted "Mon 12"; the coloured `SegmentedControl` (Primary selected).
- Footer pair: "Bring back" (outlined) and "Done" (filled), in place of Start and Done.

## What the person can do

- **Bring back** returns the item to Taylor's hands in its tier and place; firing time stops, work time does not restart (Start or Resume does; D-USE-44).
- **Done** records both clocks ("Took 1 h 10 · fired 32 min").
- Tier and ··· as in `tier-and-sessions.md` and `work-more-open.md`.

## Words

"Firing · <n> min" (past an hour "1 h 20"); "Prompt sent at <time> · worked <n> min before it"; "Bring back"; "Done".

## The notes on the boards

**phone-today / item sheet, while firing / 402 / light** (Notes · phone, Today (row 5, cont.) @ x 10122, card "Item sheet, while firing"):

> Item sheet, while firing
>
> Tapping a firing row opens its sheet with the firing panel ("Firing · 22 min", when the prompt went out, worked before it). Bring back and Done replace Start and Done.

## Rulings

- D-USE-44: two clocks per item; Done records both; bringing back does not restart work time.
- D-USE-53: bringing an item back is a tap on the mark or Bring back, never a swipe.
- D-USE-57: the item sheet of a firing item carries a firing panel and Bring back. D-USE-58: locked.
- Red for the firing word is `--color-red-700` as on the row (D-USE-51 (3)), a named bend of "nothing red on the tabs" (D-USE-38).

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the right-side panel over Today with the same panel (`../index.md` › Platforms).

## Criteria

| ID                              | When                   | Then                                                                                                                    | Evidence                        |
| ------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| C-USE-item-sheet-while-firing-1 | A firing row is tapped | The sheet shows the firing panel with its minutes, when the prompt went out and the work before it; Bring back and Done | `captures/while-firing-402.png` |
| C-USE-item-sheet-while-firing-2 | Bring back             | Firing time stops; the item returns to its tier and place; work time waits for Start or Resume                          | manual                          |
