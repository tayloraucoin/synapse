---
target: specs/web/ux/account/profile-sheet/states/uploading.md
status: approved
promoted:
boards:
  - name: "profile-sheet / uploading / 402 / light"
    page: "USE — set up"
    at: [2892, 10080]
    note: "Frame @ x 2892, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/profile-sheet/captures/uploading-402.png
rulings: [D-USE-37]
---

# Profile sheet — uploading

"Use photo" tapped; the cropped photo uploading. `?state=uploading`.

## What shows, top to bottom

- As `default.md`, with:
  - The new photo at 96 px, dimmed (a pale wash over it).
  - In Change photo's place, `LoadingText`: a small spinner and "Uploading", muted.
  - Save faded, as nothing in the name has changed.

## What the person can do

- **Name** can still be edited; a change makes Save live as in `default.md`.
- Change photo is not offered until the upload ends [ASSUMPTION: as drawn, its place is taken].
- When the upload lands, the photo shows at full strength, "Change photo" returns, and the avatar shows the new photo [ASSUMPTION: no frame draws the moment after].
- A failed upload keeps the old photo and shows `not-saved.md`'s line.
- × closes the sheet; the upload carries on and lands as above [ASSUMPTION].

## Words

"Uploading".

## The notes on the boards

**profile-sheet / uploading / 402 / light** (Frame @ x 2892, y 11010):

> Profile, uploading
>
> The photo dimmed, LoadingText "Uploading" in Change photo's place (N2). The name can still be edited. A failed upload keeps the old photo and shows the not saved line.

## Rulings

- N2: "The photo dimmed, with `LoadingText` 'Uploading'."
- D-USE-37: approved as drawn.

## Widths

Drawn at: 402. At the desk: the right-side panel, as here (D-USE-89).

## Criteria

| ID                              | When                | Then                                                                 | Evidence                     |
| ------------------------------- | ------------------- | -------------------------------------------------------------------- | ---------------------------- |
| C-USE-profile-sheet-uploading-1 | Use photo is tapped | The photo dimmed, "Uploading" in Change photo's place; Name editable | `captures/uploading-402.png` |
| C-USE-profile-sheet-uploading-2 | The upload fails    | The old photo returns and "Not saved. Try again." shows above Save   | manual                       |
