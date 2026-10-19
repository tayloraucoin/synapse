---
target: specs/web/ux/day/schedule/words-and-access.md
status: approved
promoted:
---

# Schedule — words, access, instrumentation, criteria

The rest of [`index.md`](index.md)'s slots, split out to keep the index under its cap. State-only strings sit in each state file.

## Words (Gloss)

Strings shared by every state, as drawn:

- Title: the date as "Monday, 12 October". Tray: "To-dos" and the first title, ellipsised. Tabs: "Now", "Schedule", "Review".
- Blocks: the name and its span, "7:05 to 8:00" (never "7:05–8:00"); tier captions "Primary", "Secondary" in a Work block; "+n more" when the grid is full. Hours as bare numbers, "7" to "15". The now tag: the time, "10:20".
- A running item: its title, then "· running" (`checks-and-running.md`). An event inside a block: its name, then "<span> · Meeting".
- No second person, no question marks, no counts of what is done or left, no "missed" (product rules). The view states facts and asks nothing.

## Access (Threshold)

- **Landmarks and order:** the title is the page's `h1`; then the tray (a disclosure button, "To-dos, <first title>, collapsed"), the All day strip when present, the blocks in time order, the tabs. The axis's hour labels and hairlines are decorative (`aria-hidden`).
- **Blocks** are buttons named "<Block>, <span>, <state>" [PROPOSED]: state is "done", "now" (the active edge) or nothing; e.g. "Work, 9:30 to 12:00, now". Inside, each bullet is listed in the name or as a list the button describes [ASSUMPTION: a `ul` inside the button's description, so a screen reader hears the items without tabbing each].
- **Item marks** carry words, never colour alone: done as a check glyph with "done" in its accessible text, running as "running" in words (drawn), firing as "firing" [PROPOSED], planned as nothing.
- **The now line** is not a control; its time is in the tag, and the active block's name ends in "now". Not announced each minute.
- **Keys:** `2` opens Schedule; `t` scrolls to now (living truth, `specs/web/ux/_global/navigation.md`). Re-tapping the tab scrolls to now.
- **Phone:** every block and the strip at least 44 px tall as a target; a block shorter than that keeps a 44 px hit area [ASSUMPTION: canon].
- **Reduced motion:** the running ring holds still (the `checks-and-running.md` note); scrolling to now jumps, it does not glide.
- **Contrast:** done blocks at 45 % opacity and the muted done-item words must still hold 3:1 for the block name [ASSUMPTION: to verify at build; A-11]. The now line at 55 % is decorative; the tag carries the time at full strength.

## Instrumentation

None named on the boards or in the log. [ASSUMPTION] No analytics event in this phase; any later one never carries a block's or item's name.

## Criteria

| ID               | When                              | Then                                                                                    | Evidence           |
| ---------------- | --------------------------------- | --------------------------------------------------------------------------------------- | ------------------ |
| C-USE-schedule-1 | After Ready, go, the Schedule tab | The day at 96 px an hour with the now line and one verdigris edge                       | `states/` captures |
| C-USE-schedule-2 | Tap any block                     | Its Block view opens with "‹ Today › <Block>"                                           | manual             |
| C-USE-schedule-3 | Re-tap the tab, or press `t`      | The column scrolls to now                                                               | manual             |
| C-USE-schedule-4 | Any state                         | No count, streak or "missed"; colour never alone                                        | capture            |
| C-USE-schedule-5 | 1024 and up                       | Schedule is a rail item; one column capped at `--content-text`, no side panel during go | manual             |
