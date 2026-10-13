---
target: specs/web/ux/account/install-sheet/states/android.md
status: approved
promoted:
boards:
  - name: "install-sheet / Android / 402 / light"
    page: "USE — set up"
    at: [4820, 10080]
    note: "Frame @ x 4820, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/install-sheet/captures/android-402.png
rulings: [D-USE-37, D-USE-49]
---

# Install sheet — Android

Opened on Android, in Chrome, when Chrome offers no install prompt of its own. `?state=android` (the default on Android).

## What shows, top to bottom

- Status bar 6:58; the scrim over the screen beneath.
- The sheet, shorter to fit three steps: grabber; × and "Install Synapse".
- `Tabs`: "iPhone", "Android" selected (raised white).
- Three step rows, 56 px each on hairlines, number, glyph tile, words:
  1. ⋮ (three dots stacked) · "Tap the ⋮ menu."
  2. a phone outline with an arrow down · "Tap Install app, or Add to Home screen."
  3. an outlined rounded pill with an arrow down (outlined after Assay round 1) · "Tap Install."
- Footer, muted: "Then open Synapse from the home screen."

## What the person can do

- Read, and close. No primary.
- Tap "iPhone" to see the iPhone steps ([`iphone.md`](iphone.md)).

## Words

As [`../words-and-access.md`](../words-and-access.md) › Words: the title, tabs, three Android steps and footer.

## The notes on the boards

**"install-sheet / Android / 402 / light"**, "Frame @ x 4820, y 11010":

> Install, Android
>
> N2's three Chrome steps; the sheet is shorter to fit them.

## Rulings

- N2 "Install sheet": the three Android (Chrome) steps. Google's own help page was not found (knowledge gap 2); the steps rest on secondary sources and stand as N2 has them.
- D-USE-37: approved as drawn; D-USE-49: locked.
- [ASSUMPTION: another Android browser shows these Chrome steps; no other-browser line is drawn for Android.]

## Widths

Drawn at: 402. At the desk not reachable (D-USE-89).

## Criteria

| ID                            | When                                 | Then                                                          | Evidence                   |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------- | -------------------------- |
| C-USE-install-sheet-android-1 | Opened on Android, no browser prompt | The Android tab selected; three steps with glyphs; no primary | `captures/android-402.png` |
