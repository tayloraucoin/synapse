---
target: specs/web/ux/account/profile-sheet/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — set up"]
  rows: ["USE — set up · Row label · Account"]
  locked: 2026-10-10 (D-USE-49)
---

# Profile sheet — account

Handoff pass, the ledger of the boards. Sources: N2 "Profile sheet"; refinement 3; step 12 round 1 (the Account row, "USE — set up", y 10080, x 1446 to 3374); D-USE-37 (approved as drawn: the crop step, Save faded until a change, no Remove photo), D-USE-89 (the desk). The intent-pass flat file is folded in here. Every state is a file in `states/`. Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md).

## Job

Set the profile basics: name and photo. Done is the change shown in the avatar: a new photo once it uploads, a new name once Save is tapped.

## Entry and exit

- **Entry:** "Profile" in the avatar menu ([`../avatar-menu/index.md`](../avatar-menu/index.md)). Route `?sheet=profile` over the screen the menu was opened from.
- **Exit:** × (top left), a drag down on the grabber, or Escape closes to the screen beneath. "Save" saves the name and closes [ASSUMPTION: the narrative's "Done is Save with the change shown in the avatar"; no frame draws the moment after]. Closing with an unsaved name keeps it typed for the next open ([PROPOSED], `states/default.md`). The crop step goes back to Profile with the back link on the left.
- **Signed in, always** (N2, refinement 3): every route needs a signed-in session. Signed out, `?sheet=profile` lands on the existing sign-in screen, then returns to where it was going.

## Layout, top to bottom

A `ResponsiveSheet` (a bottom sheet at 402, 544 px tall, over a scrim), grabber centred (36 × 4).

1. **Header:** × `Button` (icon, 44 px target) on the left, then the title "Profile" beside it. No ···.
2. **Photo, centred:** the `Avatar` at 96 px; under it "Change photo", an underlined text `Button` (44 px tall). No photo: the initial and "Add photo" (`states/no-photo.md`).
3. **Fields:**
   - **Name:** the label "Name" above an `Input` (44 px) holding the name.
   - **Email:** the label "Email" above the account's email as plain text, not editable here.
4. **Footer:** an inline line above Save when a save fails (`states/not-saved.md`); "Save", a full-width primary `Button`, 44 px, faded ink until something changes [PROPOSED, stands by D-USE-37].

The crop step replaces the photo and fields inside the same sheet, which grows to 704 px (`states/crop.md`): back link "‹ Profile", the heading "Crop photo", an `ImageCropper` (280 px square crop area, a 240 px circle mask, a zoom slider between zoom-out and zoom-in glyphs, the hint "Drag to move, pinch or slide to zoom."), and "Use photo" as the one primary.

Components: all `@syn/ui` (`ResponsiveSheet`, `Button`, `Avatar`, `Input`, `ImageCropper`, `LoadingText`).

## Primary action

"Save" for the name, at the sheet's foot, faded until the name changes. In the crop step, "Use photo" in the same place. A photo needs no Save: Use photo uploads it at once.

## States

| State              | File                  | Widths drawn | One line                                             |
| ------------------ | --------------------- | ------------ | ---------------------------------------------------- |
| default            | `states/default.md`   | 402          | Photo, Change photo, Name, Email; Save faded         |
| no photo           | `states/no-photo.md`  | 402          | The initial in a circle on paper, and "Add photo"    |
| change photo, crop | `states/crop.md`      | 402          | Crop photo: round mask, zoom, "Use photo"            |
| uploading          | `states/uploading.md` | 402          | The photo dimmed, `LoadingText` "Uploading"          |
| not saved          | `states/not-saved.md` | 402          | Error or offline: "Not saved. Try again." above Save |

- **Offline:** N2 groups it with error; both are `states/not-saved.md`. The sheet opens offline as online.
- **Loading:** N/A. The sheet opens on the account's name, email and photo, already on the device for the avatar [ASSUMPTION: no spinner on open].
- **Empty:** N/A. Every account has a name and email [ASSUMPTION: set at sign-up]; a missing photo is `states/no-photo.md`.
- **Partial:** N/A: the sheet shows one account.

## Platforms

Drawn at 402 only (phone, light). At the desk (1024 and up, not drawn; D-USE-89): the right-side panel (D-USE-60's form for sheets at the desk, `ResponsiveSheet`'s panel at `--sheet-w`, D-USE-39), every part as at 402; the crop step inside the panel. Change photo opens the browser's file picker [ASSUMPTION: no camera at the desk]; zoom by the slider or the wheel, move by drag [ASSUMPTION]. Dark comes with the build's theme pass (D-USE-58).

## Interactions opened here

- Change photo or Add photo: the device's own picker (library, camera, files), then the crop step (`states/crop.md`). Not a shared overlay; it lives in this sheet.
