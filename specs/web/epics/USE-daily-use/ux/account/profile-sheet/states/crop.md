---
target: specs/web/ux/account/profile-sheet/states/crop.md
status: approved
promoted:
boards:
  - name: "profile-sheet / change photo, crop / 402 / light"
    page: "USE — set up"
    at: [2410, 10080]
    note: "Frame @ x 2410, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/profile-sheet/captures/crop-402.png
rulings: [D-USE-37]
---

# Profile sheet — change photo, crop

A photo picked from the device; the crop step inside the sheet. `?state=crop`.

## What shows, top to bottom

- The sheet grows to 704 px (from y 170 of 874), grabber centred, over the same scrim.
- Header: "‹ Profile", a back link on the left (chevron and word). No ×.
- The heading "Crop photo".
- The `ImageCropper`: the picked photo `[placeholder]` filling a 280 px square crop area with rounded corners; a 240 px circle mask over it, drawn as a thin paper-coloured ring, the photo outside it dimmed.
- The zoom row, 280 × 44: a zoom-out glyph, a slider (ink to the left of its round thumb, a hairline track to the right), a zoom-in glyph.
- The hint, muted small, centred: "Drag to move, pinch or slide to zoom."
- "Use photo", the full-width primary at the foot, in ink (live from the start).

## What the person can do

- Drag the photo to move it inside the mask; pinch or the slider to zoom. The photo always covers the mask [ASSUMPTION: the cropper's minimum zoom].
- **Use photo** crops to the circle, returns to Profile and uploads at once (`uploading.md`). No Save is needed for the photo.
- **‹ Profile** goes back to Profile with the old photo, nothing uploaded.
- × is not shown; a drag down on the grabber or Escape closes the whole sheet, the picked photo dropped [ASSUMPTION].

## Words

"Profile" (back link), "Crop photo", "Drag to move, pinch or slide to zoom.", "Use photo".

## The notes on the boards

**profile-sheet / change photo, crop / 402 / light** (Frame @ x 2410, y 11010):

> Change photo, crop [PROPOSED]
>
> Change photo opens the phone's own picker (library, camera, files), then this step inside the sheet: back on the left to Profile, a round mask, zoom by slider or pinch, "Use photo" as the one primary. Using it uploads at once. [ASSUMPTION] No Remove photo in Phase 1.

## Rulings

- N2: Change photo opens the `ImageCropper`.
- D-USE-37: the crop step [PROPOSED] and no Remove photo [ASSUMPTION] approved as drawn. The frame's footer layer is named "Primary · Save, faded until a change" (copied from Profile); the drawn button is "Use photo" in full ink, and that is the spec.

## Widths

Drawn at: 402. At the desk: inside the right-side panel (D-USE-89); the picker is the browser's file picker, zoom by the slider or the wheel [ASSUMPTION, `../index.md` › Platforms].

## Criteria

| ID                         | When              | Then                                                                             | Evidence                |
| -------------------------- | ----------------- | -------------------------------------------------------------------------------- | ----------------------- |
| C-USE-profile-sheet-crop-1 | A photo is picked | The crop step: ‹ Profile, "Crop photo", round mask, zoom slider, hint, Use photo | `captures/crop-402.png` |
| C-USE-profile-sheet-crop-2 | ‹ Profile         | Back to Profile; the old photo; nothing uploaded                                 | manual                  |
| C-USE-profile-sheet-crop-3 | Use photo         | Back to Profile in `uploading.md`, the upload started                            | manual                  |
