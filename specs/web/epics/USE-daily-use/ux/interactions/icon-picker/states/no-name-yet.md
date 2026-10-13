---
target: specs/web/ux/interactions/icon-picker/states/no-name-yet.md
status: approved
promoted:
boards:
  - name: "item-sheet / icon picker, no name yet / 402 / light"
    page: "USE — set up"
    at: [4820, 6300]
    note: "Frame @ x 4820, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/interactions/icon-picker/captures/no-name-yet-402.png
rulings: [D-USE-37, D-USE-103]
---

# Icon picker — no name yet

Opened from the add sheet's emoji slot ("Add to Wellness") before a name is typed.

## What shows, top to bottom

- As `emoji-suggested.md`, with:
- Back link "‹ Add to Wellness".
- In the suggested row's place: "Suggested" (heading) and one muted line, "Add a name first to see suggestions."
- Recent and Everyday as in `emoji-suggested.md`; the group bar is not drawn in this frame [ASSUMPTION: it is there as in `emoji-suggested.md`].

## What the person can do

- Search and the tabs work as usual; a pick returns to the add sheet with the emoji in its slot.

## Words

"Suggested"; "Add a name first to see suggestions."

## The notes on the boards

**item-sheet / icon picker, no name yet / 402 / light** (Frame @ x 4820, y 7230):

> Icon picker, no name yet
>
> From the add sheet before a name is typed: one muted line in the suggested row's place. Search and the tabs work as usual.

## Rulings

- D-USE-37: approved. Open "Suggested icons": "With no name yet, the row reads 'Add a name first to see suggestions.'"

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): as at 402 inside the right-side panel.

## Criteria

| ID                              | When                          | Then                                                                                      | Evidence                       |
| ------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------ |
| C-USE-icon-picker-no-name-yet-1 | The picker opens with no name | "Add a name first to see suggestions." in the suggested row's place; search and tabs work | `captures/no-name-yet-402.png` |
