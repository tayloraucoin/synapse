---
target: specs/web/ux/set-my-days/set-my-days/words-and-access.md
status: approved
promoted:
---

# Set my days — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Interactions opened here

Moved from [`index.md`](index.md) on 2026-10-19 to keep it under its cap; the links are relative to this folder, as there.

- The New block sheet: [`../new-block-sheet/index.md`](../new-block-sheet/index.md).
- [This week's day](../../work/this-week/index.md) (phone).
- Copy from: [`../../interactions/copy-from/index.md`](../../interactions/copy-from/index.md). Add From Linear, by size: [`../../interactions/add/states/from-linear-by-size.md`](../../interactions/add/states/from-linear-by-size.md).
- Block view, editing: [`../../day/block-view/index.md`](../../day/block-view/index.md); the item sheet: [`../../day/item-sheet/index.md`](../../day/item-sheet/index.md); meal topics: [`../../interactions/meal-topics.md`](../../interactions/meal-topics.md); the icon picker: [`../../interactions/icon-picker/index.md`](../../interactions/icon-picker/index.md).
- The once-only install offer drawn in the Account row (y 10080, x 3856) is [`states/install-offer.md`](states/install-offer.md); How opens [`../../account/install-sheet/index.md`](../../account/install-sheet/index.md).

## Words

Gloss. The same in every state; state-only strings sit in each state file. No second person, no counts about the day ("No work slotted yet", never "0 items"); times and lengths are the only numbers.

- "Set my days" (title); "Now" (the back crumb, naming the tab it came from); "Week" (the back crumb on a day).
- "Usual week" · "This week"; "Every week" (Usual week's stepper line); "12 to 18 Oct" (a week, day to day and the month once).
- Week rows: "Monday" in Usual week, "Mon 12" in This week; "7:00 to 22:30" or "All day"; "Not set yet" with "Set day" (2026-10-19; boards passed).
- The row's line names what is there, by kind and name, in sentences joined with ". ": "Life: Climbing [placeholder], 19:00 to 21:00, set" · "To-dos: Errands, out, 17:30 to 19:00" · "Primary: [Write the sync spec], [Review the Paper handoff]" · "No work slotted yet" · "One checklist, no times".
- Chips: "M", "T", "W", "T", "F", "S", "S"; dated "M 12" … "S 18".
- A dated day's title: "Monday, 12 October" (weekday, day, month; no year).
- "Up at" · "Lights out", with times "7:00" and "22:30" (24-hour, no leading zero).
- "Orient · 5 min" on the locked line; a block's span "7:05 to 8:00"; "+2 more" where cells run out.
- Tier sub-heads "Primary", "Secondary", "Stretch" (and "Urgent" when it holds something; D-USE-20).
- "Saved" (`SaveStatus`).
- Sample items ("[Write the sync spec]", "ENG-123", "Climbing", "Dinner with friends", "Marco's") are [placeholder].

## Access

Threshold.

- **Focus on open:** the title ("Set my days", or the day's title), `tabIndex -1`, announced as the level-1 heading [ASSUMPTION, as Review the day].
- **Order on the week:** the crumb, the `SegmentedControl` (a radio group, "Which week"), the stepper's previous and next (hidden and out of the order in Usual week), then each day row (a not-set row is one stop; "Set day" is its label, not a second button).
- **Order on a day:** the crumb, `SaveStatus` (not a stop), the segmented control (Usual week), the chips (a radio group "Day", arrow keys move between them), Up at, Lights out, the ···, then the column top to bottom, then the +.
- **Names:** a week row is a button "<day>, <bounds>, <its line>"; a not-set row's button is "Set <day>, not set yet"; a chip is "Monday, set" or "Monday, not set" (N2), dated "Monday 12 October, set"; the TimeFields are "Up at, 7:00" and "Lights out, 22:30", each with its clock button "Choose a time for <label>" ([`states/time-picker.md`](states/time-picker.md)); the first day's forward button is "Set Monday, 7:00 to 22:30"; the ··· is "<day> menu"; Orient is text, "Orient, 5 minutes, always first" (not a button); a block is a button "<name>, <start> to <end>"; the + is "Add to <day>" [ASSUMPTION].
- **Targets:** chips 44 × 48, rows full width, the + 56. Strips are decoration (`aria-hidden`): the row's line carries the words.
- **Colour is never alone:** every block names its kind or name in words; a strip's segments repeat what the line says; the selected row at 1024 has an ink edge as well as the fill.
- **Announced:** "Saved" politely, once per save; a Toaster's Undo reachable by keyboard before it leaves.
- **Reduced motion:** the push and the segmented control switch without a slide; skeletons do not shimmer.
- **Reflow at 320:** the seven chips need about 356 px (open-8, "Wide frames") [Decided (D-USE-87): default, the chips scroll sideways inside the row below 356 px, the open chip kept in view].

## Instrumentation

No product event is named for Set my days in USE [ASSUMPTION: none; Phase 1 adds none here]. The usual week and this week are data, not analytics. Never in any payload: block, item or event names, notes, Linear IDs.

## Criteria

| ID                  | When                             | Then                                                                                     | Evidence                      |
| ------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------- |
| C-USE-set-my-days-1 | "Set my days" in the avatar menu | The week opens (B), Usual week or This week as its rule says, "‹ Now" top left           | `captures/usual-week-402.png` |
| C-USE-set-my-days-2 | A week row is tapped             | That day opens (A) with "‹ Week" and dated chips                                         | `captures/the-day-402.png`    |
| C-USE-set-my-days-3 | Any edit                         | It saves as made; "Saved" shows; no Save button                                          | `captures/saved-402.png`      |
| C-USE-set-my-days-4 | A Usual week edit                | Every week's weekday changes; dated days follow as `states/usual-change-reaches.md` says | test                          |
| C-USE-set-my-days-5 | A This week edit                 | Only that date changes; the usual week does not                                          | test                          |
| C-USE-set-my-days-6 | Viewed at 1024 or wider          | List-detail, a day always selected; below 1024 the push                                  | `captures/the-day-1024.png`   |
| C-USE-set-my-days-7 | Any state                        | No second person, no counts about the day, nothing red, no kind told by colour alone     | captures                      |
