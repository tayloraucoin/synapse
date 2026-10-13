---
target: specs/web/ux/interactions/icon-picker/states/saved-colours.md
status: approved
promoted:
boards:
  - name: "item-sheet / saved colours, editing one / 402 / light"
    page: "USE — set up"
    at: [0, 7560]
    note: "Frame @ x 0, y 8490"
    capture: specs/web/epics/USE-daily-use/ux/interactions/icon-picker/captures/saved-colours-402.png
rulings: [D-USE-36, D-USE-37, D-USE-60, D-USE-103]
---

# Icon picker — saved colours, editing one

"Edit" on the Saved row, then the dark green saved swatch tapped.

## What shows, top to bottom

- `icon-tab.md` behind, in edit mode: the Colour row's right label reads "Tap a colour to change it; × removes it".
- The Saved row: each swatch carries a small × badge (ink disc, white ×) at its top right; the tapped one has an ink ring; "Done" (outlined pill) replaces "Edit".
- A `Popover` under the Saved row: heading "Edit saved colour"; the swatch and "Hex #" `Input` with "2F6F62"; the saturation area and hue slider as in `custom-colour.md`; muted "Changes this saved colour and every item that uses it, with Undo in the toast."; a rule; "Remove from Saved" (trash icon, ink, not red); muted "Items already in it keep their colour. Undo in the toast."

## What the person can do

- Drag or type a new colour: the saved colour and every item in it change, with Undo in the toast.
- **Remove from Saved**, or × on a swatch: it leaves Saved; items keep their colour; Undo in the toast.
- **Done** leaves edit mode. Long-press a saved swatch (out of edit mode) as a shortcut to the same popover.

## Words

"Tap a colour to change it; × removes it"; "Done"; "Edit saved colour"; "Changes this saved colour and every item that uses it, with Undo in the toast."; "Remove from Saved"; "Items already in it keep their colour. Undo in the toast."

## The notes on the boards

**item-sheet / saved colours, editing one / 402 / light** (Frame @ x 0, y 8490):

> Saved colours, editing one · round 3 [PROPOSED]
>
> "Edit" sits at the end of the Saved row (on the Icon tab at x 6266), so it's never a hidden gesture. Edit mode puts × on each saved swatch and Done at the end. Tapping a swatch opens the picker titled "Edit saved colour": the change reaches every item in that colour, with Undo. Remove from Saved below a rule, in ink: items keep their colour. Long-press a swatch as a shortcut to the same.

## Rulings

- D-USE-36: custom colours are saved for reuse. D-USE-60 (2): the sheet gains Saved colours. D-USE-37: approved.
- Open "Step 11 round 3" [PROPOSED]: saved colours synced across devices, newest first; edit and remove as drawn (Taylor).

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): as at 402 inside the right-side panel.

## Criteria

| ID                                | When                      | Then                                                                    | Evidence                         |
| --------------------------------- | ------------------------- | ----------------------------------------------------------------------- | -------------------------------- |
| C-USE-icon-picker-saved-colours-1 | Edit, then a saved swatch | × on every swatch, Done, and "Edit saved colour" with Remove from Saved | `captures/saved-colours-402.png` |
| C-USE-icon-picker-saved-colours-2 | A saved colour changes    | Every item in it changes; Undo is offered                               | manual                           |
