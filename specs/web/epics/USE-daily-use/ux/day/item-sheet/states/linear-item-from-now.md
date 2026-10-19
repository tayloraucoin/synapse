---
target: specs/web/ux/day/item-sheet/states/linear-item-from-now.md
status: approved
promoted:
boards:
  - name: "now-work / linear row tapped, item sheet / 402 / light"
    page: "USE — daily use"
    at: [1446, 17760]
    note: "Frame @ x 1446, y 18690"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/linear-item-from-now-402.png
rulings: [D-USE-37, D-USE-60, D-USE-65, D-USE-103]
---

# Item sheet — a linked item, from Now

Step 8: a linked row tapped on Now during the Work block at 9:40 opens its item sheet at half height. `?state=linear-item-from-now`.

## What shows, top to bottom

- Behind the scrim, Now in go mode (`../../now-work.md`): "Now" with the avatar, the To-dos strip, the Work block header "Work 9:30 to 12:00" with ···, "Primary", and the lifted card "[Fix the sync retry]", "45 min · 9:30", "Synapse · ENG-123 · In progress" with Start and Done.
- The sheet from y 437: × top left; scope line "Work, 9:30 to 12:00 · Secondary"; title "[Answer the review comments]".
- A Linear card [PROPOSED] (bordered, rounded): "Linear" muted and "Open in Linear ↗" on the right; the issue's own title "[Address review on the sync PR]"; the line "Synapse · ENG-131 · Todo" with Todo's dotted ring.
- **Length**: `MinutesStepper` as separate − and + buttons around "20 min".
- **Icon**: the icon tile (a document line icon on pale blue) and a chevron.
- Footer line, muted: "Tier, notes, and linking or unlinking Linear are drawn in full at step 11."

## What the person can do

- Open in Linear; change the length; the Icon row opens the icon picker (`../../../interactions/icon-picker/`). × closes back to Now.
- Dragging up opens the full item view (step 8's "item view, full, Linear", carried by the Work block thread).

## Words

"Linear"; "Open in Linear ↗"; "Length"; "Icon". The footer line is a canvas pointer, not app copy.

## The notes on the boards

**now-work / linear row tapped, item sheet / 402 / light** (Frame @ x 1446, y 18690):

> linear row tapped: item sheet
>
> Tapping a linked row opens the Item sheet. [PROPOSED] A Linear card leads it: the issue's own title, the line, and Open in Linear. Tier, notes, linking and unlinking come at step 11.

## Rulings

- D-USE-37 and D-USE-60 (2): step 11 drew the linked item in full; `linear-linked.md` is the sheet's form for a linked item, and this half-height card is the step 8 form kept for the record of where it opens from. The half-height sheet from Now shows `linear-linked.md`'s layout (its later round) in place of this Linear card, with Start and Done at the foot during the block (D-USE-65).
- The item's own title ("[Answer the review comments]") differs from the issue's ("[Address review on the sync PR]"): N4, a linked item keeps the person's own icon and title.

## Widths

Drawn at: 402. Not drawn at the desk: the desk's Today opens the sheet as the right-side panel (`../index.md` › Platforms, Decided (D-USE-103)).

## Criteria

| ID                                      | When                          | Then                                                                                                       | Evidence                                |
| --------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| C-USE-item-sheet-linear-item-from-now-1 | A linked row on Now is tapped | The item sheet opens over Now with the issue's ID, status and Open in Linear, keeping the item's own title | `captures/linear-item-from-now-402.png` |
