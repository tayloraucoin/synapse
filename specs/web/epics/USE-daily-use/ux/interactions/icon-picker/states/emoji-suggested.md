---
target: specs/web/ux/interactions/icon-picker/states/emoji-suggested.md
status: approved
promoted:
boards:
  - name: "item-sheet / icon picker, emoji, suggested / 402 / light"
    page: "USE — set up"
    at: [4338, 6300]
    note: "Frame @ x 4338, y 7230"
    capture: specs/web/epics/USE-daily-use/ux/interactions/icon-picker/captures/emoji-suggested-402.png
rulings: [D-USE-35, D-USE-37, D-USE-103]
---

# Icon picker — Emoji tab, suggested

Opened from the icon tile of "Meditate" on the Item sheet.

## What shows, top to bottom

- The sheet grows near full height (top at y 97); the day shows above.
- Back link "‹ Meditate"; title "Icon".
- `Tabs` as a segmented pair, equal widths: "Emoji" (selected), "Icon".
- `SearchField`: "Search emoji".
- "Suggested for Meditate" (semibold small heading): five emoji in 44 px cells: meditating person (current pick, ink ring), lotus, candle, brain, wind face; under them, muted, "Matched from the name, on this phone".
- A hairline, then "Recent": eight emoji (droplet, bathtub, scales, weightlifter, car, pan, arrows, phone).
- "Everyday": three rows of eight curated emoji (climbing, cycling, swimming, gymnast, running, meditating, bouldering, tennis; palette, guitar, books, writing hand, headphones, puzzle, seedling, coffee; broom, basket, cart, laptop, memo, bed, moon, sun).
- Then every Unicode group below, scrolling (not shown at this height).
- A pinned group bar at the foot, line icons: clock (Recent), star (Everyday, selected with a muted fill), smiley, person, leaf, fork and knife, ball, car, bulb, hash, flag.

## What the person can do

- Tap an emoji: it becomes the item's icon and the sheet returns to the item.
- Search on the set's keywords; a group icon jumps to its group. Long-press an emoji for skin tones (dev note). Switch to Icon (`icon-tab.md`).
- Back returns to the item unchanged.

## Words

"Icon"; "Emoji"; "Icon"; "Search emoji"; "Suggested for <name>"; "Matched from the name, on this phone"; "Recent"; "Everyday".

## The notes on the boards

**item-sheet / icon picker, emoji, suggested / 402 / light** (Frame @ x 4338, y 7230):

> Icon picker, emoji [PROPOSED]
>
> Back on the left to the item. Tabs: Emoji, Icon. "Suggested for Meditate": five emoji matched from the name's words by the emoji set's keywords, on the phone, no model call. Then Recent and the categories. The current pick has an ink ring.

## Rulings

- D-USE-35: every emoji, searchable and grouped, a shortlist on top. D-USE-37: approved.
- Open "Suggested icons" [PROPOSED]: no Suggest button; up to five emoji matched on the device (emoji-mart style search).

## Widths

Drawn at: 402. Not drawn at the desk: Decided (D-USE-103): the same step inside the right-side panel (`../../../day/item-sheet/index.md` › Platforms).

## Criteria

| ID                                  | When                             | Then                                                                     | Evidence                           |
| ----------------------------------- | -------------------------------- | ------------------------------------------------------------------------ | ---------------------------------- |
| C-USE-icon-picker-emoji-suggested-1 | The picker opens on a named item | "Suggested for <name>" shows up to five matches, the current pick ringed | `captures/emoji-suggested-402.png` |
