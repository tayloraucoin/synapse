---
target: specs/web/ux/account/profile-sheet/states/default.md
status: approved
promoted:
boards:
  - name: "profile-sheet / default / 402 / light"
    page: "USE — set up"
    at: [1446, 10080]
    note: "Frame @ x 1446, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/profile-sheet/captures/default-402.png
rulings: [D-USE-37]
---

# Profile sheet — default

A photo on the account; the sheet just opened at 6:58. `?state=default`.

## What shows, top to bottom

- Behind, the scrim over the screen the menu was opened from (drawn as an even grey).
- The sheet from y 330 of 874, grabber centred.
- Header: × left; "Profile".
- The photo at 96 px `[placeholder]`, centred; under it "Change photo", underlined.
- "Name" above the `Input` holding "Taylor Aucoin".
- "Email" above "taylor@example.com", plain text.
- "Save", full width at the foot, faded ink.

## What the person can do

- **Change photo** opens the device's own picker (library, camera, files); a picked photo opens `crop.md`. Cancelling the picker leaves the sheet as it was [ASSUMPTION].
- **Name** edits in place. Any change makes Save live (full ink). Changing it back to the saved name fades Save again [ASSUMPTION].
- **Save** saves the name, then closes; the avatar menu's Who shows the new name, and the initial follows it where there is no photo [ASSUMPTION: as `../index.md` › Entry and exit]. A failure is `not-saved.md`.
- **× or a drag down** closes. A typed, unsaved name stays in the field for the next open [PROPOSED]; nothing is saved by closing [ASSUMPTION: kept on the device until Save or sign out].
- An empty name: Save stays faded [ASSUMPTION: the name is required; nothing drawn says what an empty name does].

## Words

As the surface's Words (`../words-and-access.md`).

## The notes on the boards

**profile-sheet / default / 402 / light** (Frame @ x 1446, y 11010):

> Profile, default
>
> × on the left, "Profile". Photo at 96 px with Change photo; Name with its label above; the email as plain text. [PROPOSED] Save is faded ink until something changes, so the sheet never asks to save nothing; closing with an unsaved name keeps it typed for the next open.

## Rulings

- N2: the photo at 96 px, Change photo opening the `ImageCropper`, a name `Input`, the email as plain text, and Save (refinement 3).
- D-USE-37: approved as drawn; Save faded until a change and the kept unsaved name [PROPOSED] stand.

## Widths

Drawn at: 402. At the desk: the right-side panel, every part as here (D-USE-89; `../index.md` › Platforms).

## Criteria

| ID                            | When                      | Then                                                                    | Evidence                   |
| ----------------------------- | ------------------------- | ----------------------------------------------------------------------- | -------------------------- |
| C-USE-profile-sheet-default-1 | The sheet opens           | Photo, Change photo, Name, Email as text; Save faded                    | `captures/default-402.png` |
| C-USE-profile-sheet-default-2 | The name is typed, then × | The sheet closes unsaved; the next open shows the typed name, Save live | manual                     |
