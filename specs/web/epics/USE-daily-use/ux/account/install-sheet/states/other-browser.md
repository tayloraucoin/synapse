---
target: specs/web/ux/account/install-sheet/states/other-browser.md
status: approved
promoted:
boards:
  - name: "install-sheet / iPhone in another browser / 402 / light"
    page: "USE — set up"
    at: [5302, 10080]
    note: "Frame @ x 5302, y 11010"
    capture: specs/web/epics/USE-daily-use/ux/account/install-sheet/captures/other-browser-402.png
rulings: [D-USE-37, D-USE-49]
---

# Install sheet — iPhone in another browser

Opened on an iPhone in a browser other than Safari. `?state=other-browser`.

## What shows, top to bottom

- As [`iphone.md`](iphone.md), with one line added between the tabs and the steps:
  - A compass glyph and "Open this page in Safari first.", in ink, medium weight, left-aligned with the steps.
- The five iPhone steps and the footer follow unchanged; the sheet grows to fit the line.

## What the person can do

- Read, and close. No primary, no Copy link.
- The steps stay, so they are ready once the page is open in Safari.

## Words

"Open this page in Safari first."

## The notes on the boards

**"install-sheet / iPhone in another browser / 402 / light"**, "Frame @ x 5302, y 11010":

> Install, iPhone in another browser
>
> "Open this page in Safari first." above the steps (N2), in ink with a compass glyph. [ASSUMPTION] No Copy link button; the steps stay so they are ready once in Safari.

## Rulings

- N2: "A line above the steps: 'Open this page in Safari first.'"
- D-USE-37: approved with its marks as drawn, which settles no Copy link; the [ASSUMPTION] stands, named. D-USE-49: locked.

## Widths

Drawn at: 402. At the desk not reachable (D-USE-89).

## Criteria

| ID                                  | When                         | Then                                                                        | Evidence                         |
| ----------------------------------- | ---------------------------- | --------------------------------------------------------------------------- | -------------------------------- |
| C-USE-install-sheet-other-browser-1 | An iPhone browser not Safari | "Open this page in Safari first." with a compass glyph above the five steps | `captures/other-browser-402.png` |
| C-USE-install-sheet-other-browser-2 | Same                         | No Copy link and no primary                                                 | `captures/other-browser-402.png` |
