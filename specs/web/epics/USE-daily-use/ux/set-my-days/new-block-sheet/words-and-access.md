---
target: specs/web/ux/set-my-days/new-block-sheet/words-and-access.md
status: approved
promoted:
---

# New block sheet — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss. The same in every state; state-only strings sit in each state file. No second person; times and lengths are the only numbers.

- Titles "New block", "New transition". Scope lines: "Usual <Weekday> · every week" (from the usual week), "<Day> <date> · this date only" ("Mon 12 · this date only", from This week), "Every <Weekday>" (an empty usual day), "Usual <Weekday> · inside <Block>" (a transition).
- "Kind"; the seven kinds "Wellness", "Training", "Work", "Life", "To-dos", "Break", "Evening".
- "Name"; "Starts"; "Ends" with the length beside it ("20 min", "1 h", "3 h"); "Repeats" and its options (`states/repeats-menu.md`).
- "Colour" and "<Colour>, <Kind>'s colour": "Leaf, Wellness's colour", "Clay, Training's colour", "Sky, Work's colour", "Moss, To-dos' colour", "Amber, Break's colour". Life's and Evening's colour names are not drawn [ASSUMPTION: Gloss names them; Life's hue is yellow, D-USE-79].
- "Checklist, no times"; "Off: each item gets a length and a place on the rail."; "On: no times or lengths; check in any order. Starts and Ends step aside."
- The consequence line opens "Goes in after <Block>, <start> to <end>," or "Goes in on <Weekday>s, <start> to <end>," then what opens ("and opens empty to add its items.", "Opens empty to add its items.").
- "Add block", "Add transition", "Name needed".
- N2's "Length" and its `MinutesStepper` remain only on the two earliest frames (`states/wellness.md`, `states/work.md`); Ends replaces it (D-USE-34).

## Access

Threshold.

- **Focus on open:** the name `Input`, keyboard up, its text selected so typing replaces the kind's name [ASSUMPTION: the note's "Name focused with the keyboard up, not drawn"; N2's default].
- **Order:** ×, the Kind chips, the icon tile, Name, Starts, Ends, Repeats, Colour, the kind's own control (Checklist, How work fills it, Meal and its topics), the consequence line, then the primary.
- **Names:** × is "Close, nothing added"; Kind is a radio group "Kind" (arrow keys move, each chip "<Kind>"); the icon tile "Icon, <emoji name>" or "Icon, none set"; Ends announces "Ends 17:20, 20 minutes"; Repeats "Repeats, Weekly on Monday"; Colour "Colour, Clay, Training's colour"; each switch carries its off or on line as its description.
- **Announced:** the clash, invalid and error lines are polite live regions tied to the primary by `aria-describedby`; the disabled primary is `aria-disabled` and still focusable, reading "Name needed".
- **Targets:** chips 36 px tall in 56 px rows (D-USE-34), spaced 8 px; the primary 48 px.
- **Colour is never alone:** every kind is a word; the swatch is named in words; nothing is red; the invalid state is words on faded ink, no shake.
- **Reduced motion:** the sheet and the Repeats list appear without a slide.

## Instrumentation

No product event is named for the sheet in USE [ASSUMPTION: none; Phase 1 adds none here]. The block is data, not analytics. Never in any payload: block names, item names, topic names.

## Criteria

| ID                      | When                                       | Then                                                                 | Evidence                              |
| ----------------------- | ------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------- |
| C-USE-new-block-sheet-1 | The + menu's Block, or a tapped empty time | The sheet opens at that time with the seven kinds, name focused      | `captures/from-a-tapped-time-402.png` |
| C-USE-new-block-sheet-2 | A kind is picked                           | The name (until typed over) and the colour follow the kind           | `captures/from-a-tapped-time-402.png` |
| C-USE-new-block-sheet-3 | Ends is changed                            | The length beside it updates; there is no Length control             | `captures/todos-kind-402.png`         |
| C-USE-new-block-sheet-4 | Add block                                  | The block is in the column and its Block view opens, ready for items | test                                  |
| C-USE-new-block-sheet-5 | Any state                                  | No second person, nothing red, every kind named in words             | captures                              |
| C-USE-new-block-sheet-6 | Viewed at 1024 and wider                   | The sheet is the right panel at `--sheet-w`                          | test                                  |
