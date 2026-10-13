---
target: specs/web/ux/interactions/icon-picker/states/bad-hex.md
status: approved
promoted:
boards:
  - name: "item-sheet / icon picker, custom colour, bad hex / 402 / light"
    page: "USE — set up"
    at: [6266, 6300]
    note: "Frame @ x 6266, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/interactions/icon-picker/captures/bad-hex-402.png
rulings: [D-USE-35, D-USE-37, D-USE-103]
---

# Icon picker — custom colour, bad hex

A hex that is not a colour typed in the popover ("2F6G6").

## What shows, top to bottom

- As `custom-colour.md`, with:
- The hex `Input` reads "2F6G6" with an ink edge (not red).
- The swatch, the area's marker and the grid keep the old colour (#2F6F62).
- In place of the helper text, in ink with an info icon: "Not a colour. Try 6 characters, like 2F6F62. The colour stays as it was."
- The popover is shorter by the helper's lines; "Health and body" shows under it.

## What the person can do

- Fix the hex: once it is six valid characters the colour applies and the line returns to the helper.
- Tap outside: the popover closes with the old colour kept.

## Words

"Not a colour. Try 6 characters, like 2F6F62. The colour stays as it was."

## The notes on the boards

**item-sheet / icon picker, custom colour, bad hex / 402 / light** (Frame @ x 6266, y 7230):

> Custom colour, bad hex · round 2
>
> N2's words in the popover, in ink with an icon; the hex field takes an ink edge and the swatch keeps the old colour. Replaces round 1's bad hex.

## Rulings

- D-USE-35: drawn as round 2; replaces round 1's bad hex.
- N2: "Not a colour. Try 6 characters, like 2F6F62." The swatch keeps the old colour. No red: a typo is not an error worth alarm.
- Supersedes (D-USE-35) round 1's `item-sheet / bad hex / 402 / light` ("USE — set up", Archive, x 3856, y 11340). Its note read: "Bad hex / N2's words, in ink with an icon (no red). The input takes an ink edge, its chip goes empty, and the swatch, icons and preview keep the old colour."

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): as at 402 inside the right-side panel.

## Criteria

| ID                          | When                                | Then                                                                                                        | Evidence                   |
| --------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------- |
| C-USE-icon-picker-bad-hex-1 | A hex that is not a colour is typed | The line reads N2's words in ink with an icon; the field takes an ink edge; the old colour stays everywhere | `captures/bad-hex-402.png` |
