---
target: specs/web/ux/day/todo-sheet/states/type-open.md
status: approved
promoted:
boards:
  - name: "todo-sheet / Type open / 402 / light"
    page: "USE — set up"
    at: [482, 8820]
    note: "Frame @ x 482, y 9750"
    capture: specs/web/epics/USE-daily-use/ux/day/todo-sheet/captures/type-open-402.png
rulings: [D-USE-35, D-USE-37, D-USE-69]
---

# To-do sheet — Type open

The Type select tapped on `default.md`. `?state=type-open`.

## What shows, top to bottom

- The default sheet; the screen behind is under a darker scrim (Review the day not drawn through it).
- A shadcn `Select` list opening **above** the trigger, right-aligned, over the title and scope line: "🏠 Home", "🚗 Errand", "📞 Call" (selected: muted fill and a check on the right), "💻 Digital", "· Other" (a small dot in the emoji slot). Each emoji sits in an 18 px slot.

## What the person can do

- Pick one: the type saves at once, the trigger shows it, the list closes. Tapping outside closes with nothing changed.

## Words

"Home"; "Errand"; "Call"; "Digital"; "Other".

## The notes on the boards

**todo-sheet / Type open / 402 / light** (Frame @ x 482, y 9750):

> Type open
>
> Home, Errand, Call, Digital, Other, each with its emoji in an 18 px slot; the pick is checked. Digital (was Computer, Taylor round 2): anything done on a screen, computer or phone. It flips above the trigger, since there's no room below. Type is for finding the to-do later; blocks never filter by it.

## Rulings

- D-USE-35: Computer becomes Digital (screen work, computer or phone); Digital uses 💻 (Open "Step 11 round 3").
- D-USE-37: approved as drawn; [PROPOSED] Type as a select, not chips, stands.
- Type belongs to the to-do only; a block never filters by it (the note; Open "framing round 4", whose block half, the From To-dos sheet's type filter, is area 5's). The type a new to-do starts with: Decided (D-USE-69), Other.

## Widths

Drawn at: 402. At the desk: the same list from the select in the right-side panel, opening below when there is room (D-USE-39).

## Criteria

| ID                           | When                   | Then                                                                                                                          | Evidence                     |
| ---------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| C-USE-todo-sheet-type-open-1 | Type is tapped         | Home, Errand, Call, Digital, Other with their emoji; the current one checked; the list flips above when there's no room below | `captures/type-open-402.png` |
| C-USE-todo-sheet-type-open-2 | Any To-dos block fills | It takes to-dos of every type; Type never filters a block                                                                     | test                         |
