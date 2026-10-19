---
target: specs/web/ux/account/profile-sheet/states/not-saved.md
status: approved
promoted:
boards:
  - name: "profile-sheet / not saved / 402 / light"
    page: "USE — set up"
    at: [3374, 10080]
    note: "Frame @ x 3374, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/profile-sheet/captures/not-saved-402.png
rulings: [D-USE-37]
---

# Profile sheet — not saved

A save or an upload failed, or the phone is offline. Carries N2's "error, offline" row. `?state=not-saved`; error and offline share this state, as N2 groups them.

## What shows, top to bottom

- As `default.md`, with:
  - Name holding the typed "Taylor A." `[placeholder]`, unsaved.
  - Above Save, an inline line in ink with an alert icon (a circle with a mark): "Not saved. Try again."
  - Save live (full ink).
- After a failed upload, the photo is the old one and Change photo is back.

## What the person can do

- **Save** retries the name. On success the line goes and the sheet closes as `default.md`.
- **Change photo** starts the photo again; there is no automatic retry of a failed upload [ASSUMPTION].
- Any edit leaves the line until the next Save [ASSUMPTION].
- Offline: Save and Use photo fail at once with this line [ASSUMPTION: the profile is not queued to sync, unlike the day's edits (D-USE-64), since N2 calls it not saved].
- × closes; the typed name stays for the next open, as `default.md`.

## Words

"Not saved. Try again."

## The notes on the boards

**profile-sheet / not saved / 402 / light** (Frame @ x 3374, y 11010):

> Profile, not saved
>
> Error or offline: "Not saved. Try again." in ink with an icon, above Save; the typed name stays and Save stays live to retry (N2).

## Rulings

- N2: "Inline: 'Not saved. Try again.' The typed name stays."
- D-USE-37: approved as drawn. Ink, never red (product rules).

## Widths

Drawn at: 402. At the desk: the right-side panel, as here (D-USE-89).

## Criteria

| ID                              | When                               | Then                                                                              | Evidence                     |
| ------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| C-USE-profile-sheet-not-saved-1 | Save fails or the phone is offline | "Not saved. Try again." in ink with an icon above Save; the name stays; Save live | `captures/not-saved-402.png` |
| C-USE-profile-sheet-not-saved-2 | The line shows                     | It is announced politely and describes Save                                       | manual                       |
