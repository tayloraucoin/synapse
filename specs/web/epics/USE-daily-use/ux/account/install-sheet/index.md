---
target: specs/web/ux/account/install-sheet/index.md
status: approved
promoted:
design:
  file: "Synapse, 01M49AX02VV4SSBKNCN6NRTS6Y"
  pages: ["USE — set up"]
  rows: ["USE — set up · Row label · Account"]
  locked: 2026-10-10 (D-USE-49)
---

# Install sheet — account

Handoff pass, the ledger of the boards. Sources: N2 "Install sheet"; note 98; round 16; step 12 round 1 (D-USE-37); the row "Row label · Account" (p-4-0, y 10080, notes at y 11010; coverage `../../boards/use-set-up/account.md`). The intent-pass flat file is folded in here. Words, access, instrumentation and criteria: [`words-and-access.md`](words-and-access.md).

## Job

Show how to put Synapse on the home screen, on the device in hand, so reminders can arrive. Done is read and closed.

## Entry and exit

- **Entry** (`?sheet=install`, `../overview.md`): "Install the app" in the avatar menu ([`../avatar-menu/index.md`](../avatar-menu/index.md); only while not installed, D-USE-88); "How" on the once-only offer after the first day is set ([`../../set-my-days/set-my-days/states/install-offer.md`](../../set-my-days/set-my-days/states/install-offer.md)); "How" on the to-do sheet's not-installed reminder line ([`../../day/todo-sheet/states/not-installed.md`](../../day/todo-sheet/states/not-installed.md)). It opens on the device's own platform's tab.
- **Exit:** × (top left) or a drag down on the grabber closes to the screen beneath. "Install" (Android, the browser's prompt) hands over to Chrome's own prompt ([`states/browser-prompt.md`](states/browser-prompt.md)). Not reachable once installed ([`states/installed.md`](states/installed.md)).

## Layout, top to bottom (402)

A `ResponsiveSheet` from the bottom over the scrim, its height fitted to the steps (494 px on iPhone; shorter on Android).

1. **Grabber**, then the **header:** × `Button` (icon, 44 px) left, "Install Synapse" as the title beside it. No ···.
2. **`Tabs`**, full width (362), two equal tabs: "iPhone", "Android". The selected tab is a raised white segment on the muted track.
3. **A line above the steps**, in some states only: "Open this page in Safari first." (`states/other-browser.md`), or the "Install" primary with "Or from Chrome's menu" (`states/browser-prompt.md`).
4. **The steps:** an ordered list of 56 px rows on hairlines, each with its number (muted, a 16 px column), a 32 px tile with a hairline edge holding a small drawn glyph of the control, and the step in body text.
   - **iPhone (iOS 26, Safari):** 1 "Tap the ••• beside the address bar." (three dots in a row); 2 "Tap Share." (the share glyph, a box with an arrow up); 3 "Tap Add to Home Screen." (a plus in a rounded square); 4 "Leave "Open as Web App" on." (a switch, on: ink track, knob right); 5 "Tap Add." (the word "Add", small and semibold, in the tile).
   - **Android (Chrome):** 1 "Tap the ⋮ menu." (three dots stacked); 2 "Tap Install app, or Add to Home screen." (a phone outline with an arrow down); 3 "Tap Install." (an outlined rounded pill with an arrow down, outlined after Assay round 1).
5. **Footer line**, muted: "Then open Synapse from the home screen."

Components: `@syn/ui` `ResponsiveSheet`, `Button`, `Tabs`; the steps are a plain ordered list, the glyphs Lucide icons or drawn marks, decorative [ASSUMPTION]. The frames' footer layer is named "Primary · Save, faded until a change", a layer name left from the profile frames; nothing of it renders.

## Primary action

None: read, and close. Only when Chrome offers its own prompt is "Install" the one primary (`states/browser-prompt.md`).

## States

| State                         | File                       | Widths drawn | One line                                         |
| ----------------------------- | -------------------------- | ------------ | ------------------------------------------------ |
| iPhone                        | `states/iphone.md`         | 402          | The iPhone tab and its five steps                |
| Android                       | `states/android.md`        | 402          | The Android tab and its three steps              |
| iPhone in another browser     | `states/other-browser.md`  | 402          | "Open this page in Safari first." over the steps |
| Android, the browser's prompt | `states/browser-prompt.md` | 402          | "Install" fires Chrome's prompt; steps below     |
| installed                     | `states/installed.md`      | —            | Not reachable                                    |

Empty, loading, error, partial and offline: N/A, the steps are static words with no data to load or save; offline the sheet opens as it is.

## Platforms

Drawn at 402 only (phone, light). At the desk (1024 and up) the sheet is never reached: "Install the app" is hidden there, since desk browsers notify without installing (D-USE-89), and the offer and the to-do sheet's How are phone-only too. Below 1024 it opens on the device's platform; a device that is neither iPhone nor Android opens on iPhone [ASSUMPTION]. Dark comes with the build's theme pass (D-USE-58).

## Interactions opened here

None. Chrome's install prompt is the browser's own, not Synapse's.
