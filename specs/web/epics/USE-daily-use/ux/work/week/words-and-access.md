---
target: specs/web/ux/work/week/words-and-access.md
status: approved
promoted:
---

# Week — words, access, instrumentation, criteria

The rest of [`index.md`](index.md)'s slots, split out to keep the index under its cap. State-only strings sit in each state file; the pool's in [`pool-rows.md`](pool-rows.md).

## Words (Gloss)

Strings shared by every state, as drawn:

- Rail: "Today", "Week", "Schedule", "Workflow (beta)"; "Taylor". Header: "Plan the week"; the range "‹ 12 to 18 Oct ›"; "Priority", "Time"; "Today".
- Day heads: "Mon 12 ›" (a day with work blocks carries ›); "today" under today's; "Sat 17", "Sun 18" with no ›. Priority labels: "Events", "Primary", "Secondary", "Stretch", "Fits".
- Fit lines, lengths and times, never counts (N6, D-USE-47): "Work ends 16:20" (where the day's slotted work ends at the top of its ranges); "Nothing slotted yet"; a day without Work blocks "No work blocks"; Sunday's checklist day "Sunday reset" (Time). [ASSUMPTION] A day that cannot hold its work reads "Doesn't fit by 40 min", in ink, never red (N6; the phone's "Doesn't fit by 40 min at the top of the ranges", D-USE-57); not drawn at the desk.
- Chips: "<emoji> <title>"; the meta "<ID> · <size>" or "<ID> · session n of N"; a Synapse-only chip shows its size alone ("1 Quick"). Due: "Due Thu", "Due tomorrow", "Due today" (D-USE-98).
- Adding: "+ Add to <tier>"; "Add to <Day> · <Tier>"; "Pool"; "Linear, not in the pool yet"; '+ New item "<query>"'; "Added as session n of N. Undo". Events: "+ Event"; "New event · <Day> <date>"; "Starts", "Ends", "Work", "Personal", "Client", "Repeats", "Does not repeat", "Add event"; the landing line "Sits inside <block>, <start> to <end>. Nothing moves: that block has room until <time>." (the note's shorter form: "Sits inside Work, 13:00 to 15:00. Nothing moves").
- No second person, no question marks, no "missed", no counts of the day (product rules). The page title "Plan the week" and the rail's "Week" differ on purpose [ASSUMPTION: as drawn; N6 names the surface "Week (Plan week)"].
- [PROPOSED] to Gloss: one session form on chips (see the state files); "Synced" vs "Linear synced" on the sync line; the error and empty lines in `states/`.

## Access (Threshold)

- **Landmarks and order:** rail (nav), pool panel (complementary, "Pool"), main. Focus order: rail; pool tabs, Group, Sort, Search, client heads and rows, New item, Sync now; the header (‹, ›, the lens control, Today); the lens (day heads, then cells row by row, chips in order) [PROPOSED].
- **The lens control** is a `SegmentedControl` (radio group named "Lens"): arrow keys move, the choice is remembered per person (D-USE-41).
- **Priority matrix** [PROPOSED]: a table, days as column headers and tiers as row headers, so each cell reads "Tuesday, Primary". Each chip is a button named "<title>, <tier>, <day>, session n of N, due <day>"; Enter opens its Item sheet. A cell's "+ Add to <tier>" is reachable by Tab on focus as on hover (never hover only), named "Add to <Day>, <Tier>"; the popover is a combobox with a listbox grouped "Pool", "Linear, not in the pool yet" and the new-item option; arrows and Enter pick; Esc closes and returns focus to the add button.
- **Drag has a keyboard path** (WCAG 2.5.7): "+ Add to <tier>" and its search place any pool or Linear item without dragging; a client head's grip takes Space, then arrow keys, then Space to drop, with Move up and Move down in its menu [PROPOSED]; Settings' grip is the other path (D-USE-96).
- **Announced** (polite live region) [PROPOSED]: "Added <title> to Tuesday, Primary, session 2 of 3", "Undone", "Lens: Time", "Week of 19 to 25 Oct", "Event added, Wednesday 14:00 to 14:30".
- **Time lens:** each block is a button named "<kind>, <start> to <end>, <n> items" opening its Block panel; the stretch-break bar is named "Stretch break, 15:00 to 15:10"; an event "<name>, <time>, Google, read only" when it is; "+ Event" reachable by Tab on each day head (not hover only), named "Add event, <Day>".
- **Colour never alone:** tiers carry their word (Priority) or their name (Time, in its accessible name and hover title, D-USE-101); priority glyphs differ in shape and are named ("High priority"); due badges are words; client tiles carry a letter; today carries "today" (D-USE-95).
- **Contrast** [ASSUMPTION: to verify at build; A-11]: subtle captions ("Nothing slotted yet", the order line), the warning badge words on their fill, and the placed row at 60 % must hold 4.5:1.
- **Reduced motion:** a dropped chip's ink ring appears and clears without movement [PROPOSED]; no lift animation.
- Targets at least 24 × 24 at the desk (WCAG 2.5.8); the 24 px "+ Event" sits at the floor.

## Instrumentation

None named on the boards or in the log. [ASSUMPTION] No analytics event in this phase; any later one never carries an item's title, client, project, Linear ID or event name.

## Criteria

| ID           | When                     | Then                                                                                                           | Evidence |
| ------------ | ------------------------ | -------------------------------------------------------------------------------------------------------------- | -------- |
| C-USE-week-1 | `/week` at 1728          | Rail, the pool panel at 360, the header and the lens as `captures/priority-lens-1728.png`                      | capture  |
| C-USE-week-2 | The lens is switched     | Same pool, same week; the choice is remembered for that person                                                 | test     |
| C-USE-week-3 | 1024 to 1727 wide        | The pool stays at 360; columns shrink to about 120 px, then the week scrolls sideways (D-USE-94)               | manual   |
| C-USE-week-4 | Below 1024               | No Week; the phone's tabs and Set my days › This week (D-USE-93, D-USE-55)                                     | manual   |
| C-USE-week-5 | Any chip on the Week     | No firing time; a due badge only from two days before its date (D-USE-98)                                      | capture  |
| C-USE-week-6 | A client head is dragged | The same order changes in Settings › Connections › Clients, and Sort's ties follow it (D-USE-96)               | test     |
| C-USE-week-7 | Keyboard only            | Every placing done by drag can be done through "+ Add to <tier>" and its search                                | manual   |
| C-USE-week-8 | Any state                | No count, streak or "missed"; red only on "Due today" and the Urgent glyph (bends named in D-USE-41, D-USE-42) | capture  |
