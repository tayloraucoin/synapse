---
target: specs/web/ux/account/install-sheet/states/browser-prompt.md
status: approved
promoted:
boards:
  - name: "install-sheet / Android, the browser's own prompt / 402 / light"
    page: "USE — set up"
    at: [5784, 10080]
    note: "Frame @ x 5784, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/install-sheet/captures/browser-prompt-402.png
rulings: [D-USE-37, D-USE-49]
---

# Install sheet — Android, the browser's own prompt

Opened on Android when Chrome has an install prompt ready to offer. `?state=browser-prompt`.

## What shows, top to bottom

- As [`android.md`](android.md) (the Android tab selected), with a block added between the tabs and the steps:
  - "Install", a primary `Button`, full width, 44 px, ink with white words.
  - Under it, muted small: "Or from Chrome's menu".
- The three Android steps and the footer follow unchanged (the sheet is 470 px).

## What the person can do

- **Install** fires Chrome's own install prompt (the one primary). [ASSUMPTION: accepted, Synapse installs and the sheet closes; dismissed, the sheet stays and the steps remain.]
- Or follow the steps from Chrome's menu; close with × or a drag down.

## Words

"Install" · "Or from Chrome's menu".

## The notes on the boards

**"install-sheet / Android, the browser's own prompt / 402 / light"**, "Frame @ x 5784, y 11010":

> Install, Android with the browser's prompt
>
> When Chrome offers its own install prompt, "Install" fires it as the one primary, with the steps under "Or from Chrome's menu" (N2). Not drawn: the once-only StatusLine offer after the first day is set, which lives on Set my days.

## Rulings

- N2: "A `Button`, 'Install', fires Chrome's prompt; the steps sit below it."
- D-USE-37: approved as drawn; D-USE-49: locked. The once-only offer the note mentions is drawn at x 3856 and carried in [`../../../set-my-days/set-my-days/states/install-offer.md`](../../../set-my-days/set-my-days/states/install-offer.md).
- [ASSUMPTION: shown only while Chrome holds its prompt ready; without it the sheet is [`android.md`](android.md).] The frame's tab layer is still named "Tab · iPhone, selected"; the drawing shows Android selected, and the drawing wins.

## Widths

Drawn at: 402. At the desk not reachable (D-USE-89).

## Criteria

| ID                                   | When                        | Then                                                                  | Evidence                          |
| ------------------------------------ | --------------------------- | --------------------------------------------------------------------- | --------------------------------- |
| C-USE-install-sheet-browser-prompt-1 | Chrome has its prompt ready | "Install" as the one primary, "Or from Chrome's menu", then the steps | `captures/browser-prompt-402.png` |
| C-USE-install-sheet-browser-prompt-2 | "Install"                   | Chrome's own install prompt opens                                     | manual                            |
