---
id: "USE-84"
size: small
objective: "Profile in the avatar menu opens the Profile sheet (?sheet=profile): the photo with Change photo (Add photo when none), Name, Email as text, and Save faded until something changes; a picked photo crops in a step inside the sheet and Use photo uploads at once; a failed save or upload, or offline, says \"Not saved. Try again.\" above Save and keeps the typed name and the old photo; on fixtures"
slice_type: "a small form with an upload step; risks Save live with nothing changed, the typed name lost on a failure or on ×, the old photo dropped when an upload fails, a Remove photo, and the email made editable"
non_negotiables:
  - "Save is faded and does nothing until something changes, and stays reachable with its reason (C-USE-profile-sheet-2)."
  - "Use photo uploads at once with no Save; a failed upload brings the old photo back with \"Not saved. Try again.\" (C-USE-profile-sheet-4, C-USE-profile-sheet-uploading-2)."
  - "A failed save or offline keeps the typed name and leaves Save live (C-USE-profile-sheet-not-saved-1)."
  - "No Remove photo anywhere; the email is text, not a field (C-USE-profile-sheet-7)."
  - "The crop is a step inside the sheet with ‹ Profile on the left, never a second sheet; @syn/ui's ImageCropper."
  - "Reads and writes through useProfile on fixtures; the wiring swaps it to the live user and asset routers."
devs_call: "Where the typed-but-unsaved name is kept across a close (the sheet's draft, per session); the cropper's output size; the not-saved line's announcement."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/profile-sheet/index.md"
  - "specs/web/epics/USE-daily-use/ux/account/profile-sheet/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/account/profile-sheet/states/default.md"
  - "specs/web/epics/USE-daily-use/ux/account/profile-sheet/states/crop.md"
  - "specs/web/epics/USE-daily-use/ux/account/profile-sheet/states/uploading.md"
  - "specs/web/epics/USE-daily-use/ux/account/profile-sheet/states/no-photo.md"
  - "specs/web/epics/USE-daily-use/ux/account/profile-sheet/states/not-saved.md"
  - "C-USE-profile-sheet-1"
  - "C-USE-profile-sheet-2"
  - "C-USE-profile-sheet-3"
  - "C-USE-profile-sheet-4"
  - "C-USE-profile-sheet-5"
  - "C-USE-profile-sheet-6"
  - "C-USE-profile-sheet-7"
  - "C-USE-profile-sheet-8"
  - "C-USE-profile-sheet-default-1"
  - "C-USE-profile-sheet-default-2"
  - "C-USE-profile-sheet-crop-1"
  - "C-USE-profile-sheet-crop-2"
  - "C-USE-profile-sheet-crop-3"
  - "C-USE-profile-sheet-uploading-1"
  - "C-USE-profile-sheet-uploading-2"
  - "C-USE-profile-sheet-no-photo-1"
  - "C-USE-profile-sheet-not-saved-1"
  - "C-USE-profile-sheet-not-saved-2"
  - "D-USE-37"
waiver: "The Profile sheet: the index holds the frame and each of default, no photo, crop, uploading and not saved its own criteria; one sheet."
truth_files: "none: promotion carries account/"
qa: Q1
reviewers:
  - assay
focus:
  - "default, no photo, crop, uploading and not saved at 402 against their captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/account/"
  - "apps/web/lib/data/use-profile.ts"
  - "apps/web/lib/data/profile.test.ts"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/routes.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-084-profile-sheet/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-83"
out_of_scope:
  - "Wiring to user.me, the name update and avatar upload through the live user and asset routers: the account wiring (wave 3)"
  - "The sign-in screen itself: auth, as USE-1 left it"
criteria:
  - id: C1
    statement: "Through useProfile on fixtures, a name saved updates the account the menu reads; a failing scenario leaves the old name stored and the typed one in the draft; a failed upload leaves the old photo"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 the sheet shows ×, \"Profile\", the 96 px photo with Change photo, Name with the name, Email as text and Save faded; with no photo, the initial on paper with a hairline and Add photo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-084-profile-sheet/evidence/default-and-no-photo-402.png"
  - id: C3
    statement: "At 402 the crop step shows \"‹ Profile\", \"Crop photo\", the round mask, the zoom slider, \"Drag to move, pinch or slide to zoom.\" and Use photo; uploading shows the photo dimmed and \"Uploading\" in Change photo's place with Name editable"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-084-profile-sheet/evidence/crop-and-uploading-402.png"
  - id: C4
    statement: "At 402 not saved shows \"Not saved. Try again.\" in ink with an icon above Save, the typed name kept and Save live"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-084-profile-sheet/evidence/not-saved-402.png"
  - id: C5
    statement: "Signed out, /today?sheet=profile lands on sign-in and, after signing in, back on the open sheet"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-084-profile-sheet/evidence/signed-out.txt"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — profile-sheet

## Build notes

Wave 2, after the avatar menu. Match `ux/account/profile-sheet/captures/` (default, no-photo, crop, uploading, not-saved).

- **Decisions that apply:**
  - Layout: `ResponsiveSheet` (544 px at 402, a scrim, a grabber); × and "Profile"; the `Avatar` at 96 px with "Change photo" (an underlined text button, 44 px) or the initial and "Add photo"; "Name" over an `Input`; "Email" over the address as plain text; "Save", full width, faded ink until a change [PROPOSED, stands by D-USE-37].
  - Crop (grows the sheet to 704 px): "‹ Profile", "Crop photo", `ImageCropper` (280 px crop area, a 240 px circle mask, a zoom slider between zoom glyphs), "Drag to move, pinch or slide to zoom.", "Use photo". ‹ Profile returns with the old photo and nothing uploaded.
  - × with a typed name closes unsaved; the next open shows the typed name with Save live (C-USE-profile-sheet-default-2).
  - "Not saved. Try again." in ink with an icon above Save, announced politely and describing Save.
  - At the desk the sheet is the right panel (D-USE-60's form).
- **Interfaces:** `ProfileSheet` and `CropStep` in `components/account/`; `useProfile()` returning `{ account, saveName, uploadPhoto }` over fixture writes; `profileSheetRoute()`.
- **Per path:** `profile.test.ts` holds C1. Scenarios `profile`, `profile-no-photo`, `profile-crop`, `profile-uploading`, `profile-not-saved`. C5 is a text log of the redirect, taken in the browser pane.
- **Gotchas:** the gate in `(shell)/layout.tsx` already sends sign-in a `next` that `proxy.ts` records. If it drops `?sheet=profile`, say so at the close: auth is a critical path and not this ticket's to change.
- **Model:** Opus 5.5 at medium. A smaller model loses the typed name on failure, adds Remove photo, or makes Email a field.
