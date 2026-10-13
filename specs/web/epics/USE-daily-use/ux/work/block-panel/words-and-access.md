---
target: specs/web/ux/work/block-panel/words-and-access.md
status: approved
promoted:
---

# Block panel — words, access, instrumentation, criteria

The rest of [`index.md`](index.md)'s slots, split out to keep the index under its cap. State-only strings sit in each state file.

## Words (Gloss)

Strings shared by every state, as drawn:

- Top line: the breadcrumb "<Day> › <Block>" with the short date ("Tue 13 › Work", "Mon 12 › Training"); "Open day"; × (no visible word).
- Header: the block's name; its span "9:30 to 12:00"; the fit line after a middle dot, a time, never a count: "ends 11:40 at the top of the ranges" (a Work block), "ends 8:57 as planned" (any other block).
- Add rows: "+ Add to <tier>" in a Work block, "+ Add to <block>" in any other.
- Scope lines: "Tiers belong to <Weekday>, not to this block. Items here go first; what's undone carries to the <time> Work block." (Work); "Changes apply to <Weekday> <date> only. The usual <Weekday> stays as it is." (any other).
- Lengths only, never counts (D-USE-47): "1 to 2 h", "30 to 60 min", "15 min"; sessions as "session 2 of 3".
- No second person, no question marks, no "missed" (product rules). Nothing is red in the panel; the priority and due chips do not show in its rows as drawn [ASSUMPTION: the meta is trimmed to client, project, ID and size or session, at 440].
- [PROPOSED] to Gloss: the two scope lines and "ends … as planned" (not drawn elsewhere).

## Access (Threshold)

- **The panel** is a non-modal right panel [ASSUMPTION: the week and the pool stay operable, since the note keeps the pool "open to the left for dragging in"; `ResponsiveSheet`'s right panel as built]. It is a labelled region named "<Block>, <Day>" ("Work, Tue 13") [PROPOSED]. On open, focus moves to the panel's heading; on close (× or Esc) it returns to the block that opened it.
- **Focus order:** the breadcrumb (text, not a link [ASSUMPTION: the panel has no back; "Tue 13" is not a control]), Open day, ×, then the rows top to bottom (each row: its grip, then the row as a link to the Item sheet, then Swap where shown), each tier's or block's add row, the scope line (text).
- **Names** [PROPOSED]: × "Close <block> panel"; Open day "Open <weekday> <date>"; a grip "Move <title>"; Swap "Swap <title>"; the add row "Add to <tier or block>, <day>".
- **The ring** on the opened block is not colour alone: the block in the week also gets `aria-current` or the selected state on its button [ASSUMPTION], and the panel names the block in words.
- **Moving without a mouse:** a grip takes Space to lift and the arrow keys to move, Space to drop, announced politely ("<title> moved to Secondary") [ASSUMPTION: the house sortable's keyboard model]. Dragging from the pool always has "+ Add to <tier>" as its alternative.
- **Announced** (polite live region) [PROPOSED]: "<title> added to <tier>, <day>"; "<title> moved"; after a Swap, "Swapped for <title>".
- **Transitions** read their italic as plain text; the italic is not the only sign (each has its own icon and sits on its time). **Contrast:** the subtle add rows and rail times at 12 to 13 px must hold 4.5:1 on `--color-background` [ASSUMPTION: to verify at build; A-11].
- **Reduced motion:** the panel appears without sliding [PROPOSED]; the ring changes without movement.
- **Phone:** none; Block view's access applies (`../../day/block-view/words-and-access.md`).

## Instrumentation

None named on the boards or in the log. [ASSUMPTION] No analytics event in this phase; any later one never carries an item's title, client, project, Linear ID or the block's name.

## Criteria

| ID                  | When                                  | Then                                                                                                  | Evidence                                                           |
| ------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| C-USE-block-panel-1 | Any block is clicked in the Time lens | The right panel opens at `--sheet-w`, the block ringed in ink, the week and the pool still in view    | `captures/work-block-1728.png`, `captures/non-work-block-1728.png` |
| C-USE-block-panel-2 | × or Esc                              | The panel closes, the ring goes, focus returns to the block                                           | manual                                                             |
| C-USE-block-panel-3 | Open day                              | The opened day for that date shows ([`../today/states/opened-day.md`](../today/states/opened-day.md)) | `../today/captures/opened-day-1728.png`                            |
| C-USE-block-panel-4 | Below 1024                            | No panel; a block opens the phone's Block view (D-USE-55, D-USE-93)                                   | manual                                                             |
| C-USE-block-panel-5 | Any state                             | No count, no "missed", nothing red                                                                    | capture                                                            |
