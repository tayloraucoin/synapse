---
target: specs/web/ux/day/block-complete/words-and-access.md
status: approved
promoted:
---

# Block complete — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss. Strings the same in every state; state-only strings sit in each state file. No second person; times and lengths are the only numbers; nothing red; no counts (the intent pass's "2 not done" is replaced by the names, D-USE-72).

- "<Block> complete" ("Wellness complete"); in the footer the same words beside a filled check.
- Footer: "Next: <block>, <start>" ("Next: Training, 8:00"). Card: "Next", then "<block>" with "<start>", then "then <block>" with "<start>".
- "Start <block>" ("Start Training").
- "Not done: <item>, <item>" ("Not done: Meditate, Cold bath"); a long list truncates at one line with "…" [ASSUMPTION].
- Each item left: "Do now", "Later", "Leave" (round 1: "Move to later", "Leave"); the consequence "Fits by <time>" or "<next block> would start <time>"; after a move, "Moved to the end of <block>" with "Undo".
- Last block: "Nothing after this today." and "See the whole day".
- "Took <n> min · Change" (D-USE-13), as on Now.

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- **Focus on settle:** the card's heading "Wellness complete" (`tabIndex -1`); in the footer state focus stays on the row just checked, and the footer is announced.
- **Order, card:** ×, heading, Next rows (read as text, not buttons [ASSUMPTION: the rows are not links]), Start, the disclosure, then each item's name, its consequence, Do now, Later, Leave.
- **Names:** × "Close, stay on Wellness"; the disclosure a button with `aria-expanded`, named by its words; Do now "Do <item> now, <consequence>"; Later "Move <item> to later"; Leave "Leave <item> not done"; Undo "Undo move of <item>".
- **Announced (polite):** "Wellness complete. Next: Training, 8:00." on settle; "<item> moved to the end of Training." with Undo; nothing on Leave beyond the row changing.
- **Colour never alone:** the Next rows name their blocks beside their dot and ring; the check tile carries a check, not only the block's tint.
- **Targets:** ×, Do now, Later, Leave, Undo and the disclosure at least 44 × 44.
- **Reduced motion:** the block settles into the card without the scale; the footer appears without its rise.

## Instrumentation

None named by the narrative or the log [ASSUMPTION: Phase 1 sends no product events from Block complete]. Never in any payload: block or item names.

## Criteria

| ID                     | When                                         | Then                                                                                 | Evidence                           |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| C-USE-block-complete-1 | The last item in a block is checked          | The rows stay, checked; the footer shows "<Block> complete", Next and Start; no card | `captures/all-done-402.png`        |
| C-USE-block-complete-2 | "Complete <Block>" is chosen with items left | The close card shows, its disclosure naming the items left, with no count            | `captures/not-done-closed-402.png` |
| C-USE-block-complete-3 | Start is tapped                              | The next block becomes active on Now                                                 | test                               |
| C-USE-block-complete-4 | × is tapped                                  | The card closes; Now shows the next block; nothing is moved or left                  | test                               |
| C-USE-block-complete-5 | Later is tapped                              | The item goes per D-USE-70 and the row says where, with Undo                         | `captures/not-done-open-402.png`   |
| C-USE-block-complete-6 | Do now is tapped                             | The block reopens on Now with that item lifted; past the end, the day slides         | `captures/not-done-do-now-402.png` |
| C-USE-block-complete-7 | The day's last block completes               | "Nothing after this today." and See the whole day; then Now's empty state            | `captures/last-block-402.png`      |
| C-USE-block-complete-8 | Any state                                    | No second person, no count, nothing red, nothing says missed                         | captures                           |
| C-USE-block-complete-9 | Each `?state=` key of `states/`              | That state renders (canon C-P08)                                                     | capture                            |

## Decisions and open items

- D-USE-28 (the footer when all done; the card for the not-done case; menus as shadcn dropdowns), D-USE-30 (Do now beside Later and Leave with the consequence shown; a done block keeps an add row, carried by Now's `../now/states/all-done-add-more.md`), D-USE-70 (where Later puts an item), D-USE-72 (step 7 round 1's marks and Do now past the end, as drawn), D-USE-13 (Took and Change), D-USE-8 (the fixture).
- Open carried here: open-1 "Block complete, step 7 round 1 (drawn)" (every state file); open-1 "Where 'Move to later' …" (`../../interactions/move-to/index.md`); open-2 "Feedback round, steps 5 to 7", its Do now part (`states/not-done-do-now.md`, `../../interactions/make-room/index.md`).
- Decided (D-USE-74): the last block with items left is not drawn; the card shows the disclosure; each item has Do now and Leave, and Later is absent (no next block today; D-USE-70 has nowhere to put it). Move to… another day stays on the Item sheet.
