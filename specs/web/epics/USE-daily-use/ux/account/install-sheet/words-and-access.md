---
target: specs/web/ux/account/install-sheet/words-and-access.md
status: approved
promoted:
---

# Install sheet — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss. As drawn; strings only one state shows sit in its state file. No second person: every step is an imperative, "Tap …", which addresses no one by name. Steps name the browser's own controls in the browser's own capitals ("Add to Home Screen" on iPhone, "Add to Home screen" on Android).

- Title: "Install Synapse". Tabs: "iPhone", "Android".
- iPhone steps: "Tap the ••• beside the address bar." · "Tap Share." · "Tap Add to Home Screen." · "Leave "Open as Web App" on." · "Tap Add."
- Android steps: "Tap the ⋮ menu." · "Tap Install app, or Add to Home screen." · "Tap Install."
- Footer: "Then open Synapse from the home screen."
- State lines: "Open this page in Safari first." (other browser); "Install" and "Or from Chrome's menu" (the browser's prompt).
- The steps follow Apple's iOS 26 Safari wording; Google's own Android help page was not found (the brief's knowledge gap 2), so the Android steps rest on secondary sources (what-exists Lookups, 2026-10-09) [ASSUMPTION: worded as N2 has them until a primary source is found].

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- **Focus:** on open, focus moves to the title "Install Synapse" (the dialog's heading); Tab runs ×, the tabs, "Install" where shown, then out. Escape and × close; focus returns to the control that opened it ("Install the app", "How").
- **Tabs:** a `Tabs` tablist; arrow keys move between "iPhone" and "Android", the selected one `aria-selected`. The panel is named by its tab.
- **Steps:** an ordered list (`<ol>`), so a screen reader says "1 of 5"; the visible numbers are not read twice. The glyph tiles are decorative (`aria-hidden`): the step's words name the control.
- **Names:** × "Close"; "Install" "Install Synapse" [PROPOSED]. The "Open this page in Safari first." line is text at the top of the panel, read before the steps; its compass icon is decorative.
- **Targets:** ×, the tabs and "Install" at least 44 px tall. Reduced motion: the sheet fades in place instead of sliding.
- **Contrast:** the step numbers and footer are muted but at least 4.5:1 on the sheet's paper.

## Instrumentation

None named by the narrative or the log [ASSUMPTION: Phase 1 sends no product events from this sheet]. If installs are ever counted, the payload holds the platform and the entry only, never a device identifier or user agent string.

## Criteria

| ID                    | When                                           | Then                                                                          | Evidence                         |
| --------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------- |
| C-USE-install-sheet-1 | Opened on an iPhone                            | The iPhone tab, its five steps with a glyph each, the footer line; no primary | `captures/iphone-402.png`        |
| C-USE-install-sheet-2 | Opened on Android                              | The Android tab and its three steps                                           | `captures/android-402.png`       |
| C-USE-install-sheet-3 | Either tab tapped                              | Its steps show; the other platform's stay reachable                           | manual                           |
| C-USE-install-sheet-4 | × or Escape                                    | The sheet closes; focus returns to the control that opened it                 | manual                           |
| C-USE-install-sheet-5 | Synapse runs from the home screen, or at 1024+ | No way in: no "Install the app", no offer, no How                             | test                             |
| C-USE-install-sheet-6 | `?sheet=install` with each `?state=` key       | That state renders (canon C-P08)                                              | capture                          |
| C-USE-install-sheet-7 | Any state                                      | No Copy link (D-USE-37), no second person                                     | `captures/other-browser-402.png` |

## Decisions and open items

- D-USE-37 (step 12 round 1 approved; its [PROPOSED] and [ASSUMPTION] marks stand as drawn, so no Copy link), D-USE-49 (lock), D-USE-58 (dark later), D-USE-88 (Install the app only while not installed), D-USE-89 (hidden at the desk).
- Open carried here: the install-sheet part of "Step 12 round 1" (`../../day/open/open-7.md`). The once-only offer of "Audit gaps" and "Audit against N5" is carried in `../../set-my-days/set-my-days/states/install-offer.md`.
