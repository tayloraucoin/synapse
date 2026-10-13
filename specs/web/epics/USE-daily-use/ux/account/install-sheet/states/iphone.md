---
target: specs/web/ux/account/install-sheet/states/iphone.md
status: approved
promoted:
boards:
  - name: "install-sheet / iPhone / 402 / light"
    page: "USE — set up"
    at: [4338, 10080]
    note: "Frame @ x 4338, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/install-sheet/captures/iphone-402.png
rulings: [D-USE-37, D-USE-49]
---

# Install sheet — iPhone

Opened on an iPhone, in Safari. `?state=iphone` (the default on iPhone).

## What shows, top to bottom

- Status bar 6:58; the scrim over the screen beneath.
- The sheet (494 px): grabber; × and "Install Synapse".
- `Tabs`: "iPhone" selected (raised white), "Android".
- Five step rows, 56 px each on hairlines, number, glyph tile, words:
  1. ••• (three dots in a row) · "Tap the ••• beside the address bar."
  2. the share glyph (a box, an arrow up out of it) · "Tap Share."
  3. a plus in a rounded square · "Tap Add to Home Screen."
  4. a switch, on (ink track, knob right) · "Leave "Open as Web App" on."
  5. the word "Add" in the tile · "Tap Add."
- Footer, muted: "Then open Synapse from the home screen."

## What the person can do

- Read, and close (× or a drag down). No primary.
- Tap "Android" to see the Android steps ([`android.md`](android.md)).

## Words

As [`../words-and-access.md`](../words-and-access.md) › Words: the title, tabs, five iPhone steps and footer.

## The notes on the boards

**"install-sheet / iPhone / 402 / light"**, "Frame @ x 4338, y 11010":

> Install, iPhone
>
> "Install Synapse", Tabs opened on the device's platform, N2's five iOS 26 Safari steps, each a 56 px row with its number and a drawn glyph of the control. No primary: read, and close. The footer line ends it.

## Rulings

- N2 "Install sheet": the five iOS 26 Safari steps and the footer (round 16).
- D-USE-37: step 12 round 1 approved as drawn; D-USE-49: locked.

## Widths

Drawn at: 402. At the desk (1024 and up) not reachable: Install the app is hidden there (D-USE-89).

## Criteria

| ID                           | When                | Then                                                                    | Evidence                  |
| ---------------------------- | ------------------- | ----------------------------------------------------------------------- | ------------------------- |
| C-USE-install-sheet-iphone-1 | Opened on an iPhone | The iPhone tab selected; five 56 px steps, each numbered with its glyph | `captures/iphone-402.png` |
| C-USE-install-sheet-iphone-2 | The sheet is read   | No primary; only × and the grabber close it                             | `captures/iphone-402.png` |
