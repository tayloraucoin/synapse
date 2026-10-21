---
target: specs/web/ux/interactions/icon-picker/index.md
status: approved
promoted:
boards: []
dev_note: "Dev note · Icon picker: all emoji, all Lucide"
rulings: [D-USE-35, D-USE-36, D-USE-37, D-USE-60]
---

# Icon picker

An overlay step opened wherever an `EmojiSlotButton` sets an icon: one picker, two tabs (Emoji, Icon), a colour row for icons, saved custom colours. Each drawn step is a file in `states/`.

## Where it starts

- The icon tile on the Item sheet ([`../../day/item-sheet/index.md`](../../day/item-sheet/index.md)), back link "‹ <item name>".
- The emoji slot on the add sheet before a name is typed (Review the day's add sheet, [`../../day/review-the-day/index.md`](../../day/review-the-day/index.md), its add sheet `../add-from-the-rail/states/add-sheet.md`; `states/no-name-yet.md`), back link "‹ Add to <block>".
- The icon tile on the To-do sheet ([`../../day/todo-sheet/index.md`](../../day/todo-sheet/index.md), back link "‹ <to-do title>" [ASSUMPTION]), on the New block sheet (`../../set-my-days/new-block-sheet/index.md`), and on meal topics (Open "Suggested icons": "items, blocks, to-dos, meal topics").

It is a step inside the sheet that opened it, never a second sheet: back on the left returns to that sheet with the new icon in place.

## Steps

| #   | The person                                | The app                                                                | Board (carried by)                                                                       |
| --- | ----------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | Taps the icon tile                        | Opens on the Emoji tab with "Suggested for <name>"                     | `item-sheet / icon picker, emoji, suggested / 402 / light` (`states/emoji-suggested.md`) |
| 1a  | Opens it with no name yet                 | The suggested row is one muted line                                    | `item-sheet / icon picker, no name yet / 402 / light` (`states/no-name-yet.md`)          |
| 2   | Picks the Icon tab                        | The colour row, Saved, search, Suggested, Everyday, every Lucide group | `item-sheet / icon picker, icon, search and groups / 402 / light` (`states/icon-tab.md`) |
| 3   | Taps the custom swatch                    | A Linear-style colour popover                                          | `item-sheet / icon picker, custom colour open / 402 / light` (`states/custom-colour.md`) |
| 3a  | Types a bad hex                           | N2's words in the popover; the old colour stays                        | `item-sheet / icon picker, custom colour, bad hex / 402 / light` (`states/bad-hex.md`)   |
| 4   | Taps Edit on the Saved row, then a swatch | "Edit saved colour"                                                    | `item-sheet / saved colours, editing one / 402 / light` (`states/saved-colours.md`)      |

## Rules

- One tap on an emoji or icon picks it, saves it to the item for today (or to what opened it) and returns to that sheet [ASSUMPTION: the boards show the picked state, an ink ring, and no Done].
- Suggestions are matched on the device from the name's words against each set's keywords; no model call, keeping Phase 1's no-AI rule (record 0001; Open "Suggested icons").
- When the name matches nothing, a block's kind's words are matched instead (a small kind-to-words map beside the matcher), so Suggested is never empty for a named block (Taylor, 2026-10-19; USE-145).
- An icon is stored as its Lucide name plus a hex; an emoji as the character (dev note).
- Colour never alone: the icon's shape carries the meaning; colour is the kind's or the person's.
- The tabs keep one height so switching does not jump (archived round 1 note, kept).
- In the New block sheet the step stays inside the sheet (Taylor, 2026-10-19): it slides in from the right and back out (`--dur-sheet`, the exit at about 80%; none under reduced motion), and the sheet's height is locked when it opens, so switching tabs or searching never resizes the drawer (USE-146).

## The dev note

**Dev note · Icon picker: all emoji, all Lucide** ("USE — set up", x 4338, y 7560):

> Both tabs work the same way (Taylor, round 2): a search field, a Suggested row matched from the item's name, then Recent, then Everyday (the shortlist: today's 16 icons, the curated emoji), then every group, with a pinned group bar at the bottom that jumps between groups.
>
> Logged in day/overview.md, Open.
>
> What's in each tab
>
> Emoji: the full Unicode set in its own groups (Smileys, People, Animals and nature, Food, Activities, Travel, Objects, Symbols, Flags), with skin tones from a long press. Icon: every Lucide icon, grouped by Lucide's own categories (Health, Home, Food, Travel, Devices, Nature, Shapes and so on), drawn in the picked colour. Search runs on each set's keywords on the phone; no model call. The colour row sits above the icons so it stays in reach: eight kind colours, then a custom swatch that opens the picker (hex, saturation area, hue slider).
>
> To investigate
>
> Bundle size: load Lucide and the emoji data lazily when the picker opens, and render the grid virtualised. Store an icon as its Lucide name plus a hex; store an emoji as the character. Lucide renames icons between versions, so pin the version and map old names. Very light custom colours are darkened a little for contrast on paper, as Linear does.

Its summary card under it (Frame @ x 4338, y 8490): "Dev note · All emoji, all Lucide / Both tabs carry their whole set in groups, a shortlist on top, search on keywords on the phone, and a pinned group bar; lazy loading and how an icon is stored."

## Rulings

- D-USE-35: every emoji and every Lucide icon, both tabs searchable and grouped with a shortlist on top; the custom colour is a Linear-style picker.
- D-USE-36: custom colours are saved for reuse. D-USE-37, D-USE-60 (2): approved, with Saved colours.
- Superseded (D-USE-35): round 1's `item-sheet / icon picker, icon, custom hex` and `item-sheet / bad hex` ("USE — set up", Archive), replaced by `states/icon-tab.md` and `states/bad-hex.md`.

## Criteria

| ID                  | When                     | Then                                                                             | Evidence                           |
| ------------------- | ------------------------ | -------------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-icon-picker-1 | The picker opens         | A step inside its sheet with back on the left; Emoji and Icon tabs of one height | `captures/emoji-suggested-402.png` |
| C-USE-icon-picker-2 | Search or Suggested runs | It runs on the device, with no network call                                      | test                               |
| C-USE-icon-picker-3 | An icon is picked        | It is stored as a Lucide name plus hex (an emoji as its character)               | test                               |
