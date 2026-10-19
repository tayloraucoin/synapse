---
target: specs/web/ux/interactions/icon-picker/states/icon-tab.md
status: approved
promoted:
boards:
  - name: "item-sheet / icon picker, icon, search and groups / 402 / light"
    page: "USE — set up"
    at: [5302, 6300]
    note: "Frame @ x 5302, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/interactions/icon-picker/captures/icon-tab-402.png
rulings: [D-USE-35, D-USE-36, D-USE-37, D-USE-103]
---

# Icon picker — Icon tab, search and groups

The Icon tab for "Meditate", a saved custom colour picked.

## What shows, top to bottom

- Back link "‹ Meditate"; title "Icon"; `Tabs` with "Icon" selected.
- **Colour** row: label left, and right a muted "Saved · #2F6F62" (which colour is picked and where it lives). `ColorSwatchRow`: eight kind colours as round swatches (green, blue, clay, rose, ochre, slate, violet, olive), a thin vertical rule, then the custom swatch (a multicolour wheel).
- **Saved** row: muted label "Saved", then past custom picks, newest first: dark green (picked, ink ring), violet, orange, navy; "Edit" as an outlined pill at the row's end.
- `SearchField`: "Search icons".
- "Suggested for Meditate": five line icons (leaf, picked with an ink ring; sun-burst; wind; sparkle; bot), muted "Matched from the name, on this phone".
- A hairline, then "Everyday": two rows of eight Lucide icons (`CuratedIconGrid`): sun, moon, droplet, leaf (picked, ringed), heart, droplet, book, cup; dumbbell, bike, bed, house, phone, cart, laptop, clock.
- "Health and body": activity, pill, pie, person, calendar, droplet, arrows, heart; then every Lucide group, scrolling.
- Every icon draws in the picked colour (here dark green). The pinned group bar at the foot: clock, star (selected), activity, house, utensils, car, laptop, leaf, shapes.

## What the person can do

- A kind colour or a saved colour recolours the grid and the item's icon. The custom swatch opens `custom-colour.md`. "Edit" opens `saved-colours.md`. Long-press a saved swatch as a shortcut to the same.
- Tap an icon: it becomes the item's icon, in the picked colour, and returns to the item.

## Words

"Colour"; "Saved · #<hex>" (or "Custom · #<hex>" while the custom swatch is picked); "Saved"; "Edit"; "Search icons"; "Suggested for <name>"; "Matched from the name, on this phone"; "Everyday"; Lucide's group names ("Health and body").

## The notes on the boards

**item-sheet / icon picker, icon, search and groups / 402 / light** (Frame @ x 5302, y 7230):

> Icon tab, search and groups · round 2 [PROPOSED]
>
> Same interaction as Emoji: the colour row first (kind colours, then a custom swatch), a Saved row of past custom picks (round 3, synced across devices, newest first; long-press to remove), search, Suggested, Everyday (the old 16 as the shortlist), then every Lucide group, with a pinned group bar. The grid draws in the picked colour.

## Rulings

- D-USE-35: every Lucide icon, searchable and grouped, the shortlist on top. D-USE-36: custom colours saved for reuse, synced across devices. D-USE-37: approved.
- Open "Step 11 round 2": the preview row ("As it shows in the day") is dropped since the grid draws in the picked colour.
- Supersedes (D-USE-35) round 1's `item-sheet / icon picker, icon, custom hex / 402 / light` ("USE — set up", Archive, x 3374, y 11340). Its note read: "Icon tab, custom hex / Line icons drawn in the picked colour; eight presets (the kind colours) plus Custom, which opens the hex input. [PROPOSED] 'As it shows in the day' previews the row. The tabs keep one height so switching doesn't jump."

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): as at 402 inside the right-side panel.

## Criteria

| ID                           | When               | Then                                                                                                                            | Evidence                    |
| ---------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| C-USE-icon-picker-icon-tab-1 | The Icon tab opens | Colour row, Saved with Edit, search, Suggested, Everyday, every Lucide group, a pinned group bar; the grid in the picked colour | `captures/icon-tab-402.png` |
