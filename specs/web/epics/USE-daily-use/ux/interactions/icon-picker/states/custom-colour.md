---
target: specs/web/ux/interactions/icon-picker/states/custom-colour.md
status: approved
promoted:
boards:
  - name: "item-sheet / icon picker, custom colour open / 402 / light"
    page: "USE — set up"
    at: [5784, 6300]
    note: "Frame @ x 5784, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/interactions/icon-picker/captures/custom-colour-402.png
rulings: [D-USE-35, D-USE-36, D-USE-37, D-USE-103]
---

# Icon picker — custom colour open

The custom swatch tapped on the Icon tab.

## What shows, top to bottom

- `icon-tab.md` behind; the Colour row's right label reads "Custom · #2F6F62"; the custom swatch shows the wheel with the current colour at its centre and an ink ring.
- A `Popover` [PROPOSED colour picker, Plumb] anchored under the Colour row, full width, covering the Saved row and the grid's top:
  - the current colour as a round swatch, and an `Input` labelled inside "Hex #" with "2F6F62";
  - a saturation and brightness area (white to the hue across, black down), with a ring marker at the current colour;
  - a vertical hue slider on the right, with a white handle;
  - helper text, muted: "Drag to pick, or type a hex. A colour picked here joins Saved, on every device, so the next item can reuse it exactly. Very light picks are darkened a little so the icon stays readable on paper."
- The grid below shows through under the popover, in the colour being picked.

## What the person can do

- Drag in the area or on the hue slider, or type a hex: the icon and grid update as it moves.
- Tap outside to close; the colour stays and joins Saved, newest first.

## Words

"Custom · #<hex>"; "Hex #"; the helper text above.

## The notes on the boards

**item-sheet / icon picker, custom colour open / 402 / light** (Frame @ x 5784, y 7230):

> Custom colour open · round 2 [PROPOSED]
>
> Linear's picker, as Taylor pointed to: tapping the custom swatch opens a popover with the current colour, a hex field, a saturation and brightness area and a hue slider. Drag or type; the icon updates as it moves. Tap outside to close.

## Rulings

- D-USE-35: the custom colour gets a picker in the manner of Linear's (swatches, then a custom swatch opening hex, saturation area and hue slider).
- D-USE-36: custom colours are saved for reuse. D-USE-37: approved.

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the same popover inside the right-side panel.

## Criteria

| ID                                | When                               | Then                                                                                                 | Evidence                         |
| --------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| C-USE-icon-picker-custom-colour-1 | The custom swatch is tapped        | A popover with the swatch, "Hex #", a saturation area and a hue slider; the icon follows as it moves | `captures/custom-colour-402.png` |
| C-USE-icon-picker-custom-colour-2 | The popover closes on a new colour | The colour joins Saved, first, on every device                                                       | manual                           |
