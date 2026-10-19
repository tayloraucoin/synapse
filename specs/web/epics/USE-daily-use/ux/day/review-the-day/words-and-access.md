---
target: specs/web/ux/day/review-the-day/words-and-access.md
status: approved
promoted:
---

# Review the day — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss. The same in every state; state-only strings sit in each state file. No second person, no counts of items, no "missed", "late" or "behind"; times and lengths are the only numbers.

- "Orient" (the `Breadcrumb`); the date as "Monday, 12 October" (weekday, day, month; no year).
- "To-dos" and the first to-do's title, ellipsised (the tray's own words, `../todos/`).
- "Orient · 5 min" on the locked line; a block's span as "7:05 to 8:00"; "+2 more" where cells run out (a count of what is hidden, kept as drawn; D-USE-39's note names it).
- Tier sub-heads "Primary", "Secondary" (and "Urgent", "Stretch" when they hold something).
- "Ready, go". Its disabled form "Loading the day".
- Sample items ("[Primary item]", "ENG-123") are [placeholder].
- These replace N3's "Back to Orient" (D-USE-10) and N3's "Changes apply to today" (`states/first-edit.md`).

## Access

Threshold.

- **Focus on open:** the date title (`tabIndex -1`), announced as the page's level-1 heading [ASSUMPTION, as Orient].
- **Order:** "Orient" breadcrumb, the tray's toggle, then the column top to bottom: the passed row (late), each block (its name then its bullets, each bullet a button), the rail +, then Ready, go.
- **Names:** the breadcrumb is a link "Back to Orient"; a block is a button "<name>, <start> to <end>" opening its Block view; a bullet is a button "<item>, in <block>" opening the Item sheet; "+2 more" is part of the block's button, not a stop; the rail + is a button "Add, at <next free time>" with a description "Hold and drag to pick the time" [ASSUMPTION]; the meal bands are buttons "<meal>, <start> to <end>".
- **Targets:** bullets are 20 px lines at 96 px an hour, under the 44 px target: the block's own button carries the tap, with the bullet's tap as a shortcut (N3, "[judgment]" on the intent file; the Block view is the accessible path to each item) [ASSUMPTION: settled so, since the canvas kept 96 px]. The rail + is 40 × 56; Ready, go 48 px.
- **The rail drag** has a keyboard path: focus the +, Up and Down move it in 15-minute steps, Enter opens the add sheet there [ASSUMPTION; the time is announced at each step].
- **Announced:** a Toaster ("Swapped for Yoga. Training ends 8:50.") politely, Undo reachable by keyboard before it leaves; the first-change line and the offline line politely, once.
- **Reduced motion:** the tray opens without a slide; the + moves without a glide; skeletons do not shimmer.
- **Colour is never alone:** kinds are named in words on every block; the now-line carries its time in text; passed blocks are words, not grey.

## Instrumentation

No product event is named for Review the day in USE [ASSUMPTION: none; Phase 1 adds none here]. The day's record (swaps, adds, Ready, go's time) is data, not analytics. Never in any payload: item or to-do names, notes, Linear IDs.

## Criteria

| ID                     | When                       | Then                                                                                       | Evidence                           |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------- |
| C-USE-review-the-day-1 | "Review the day" on Orient | Review the day opens, focused: no tabs, no avatar, "‹ Orient" top left                     | `captures/success-402.png`         |
| C-USE-review-the-day-2 | Any change here            | Today changes; the usual week does not                                                     | test                               |
| C-USE-review-the-day-3 | Ready, go                  | The Ready, go welcome, then Now in go mode; Review the day is not reachable again that day | test                               |
| C-USE-review-the-day-4 | An item bullet is tapped   | The Item sheet opens on it; Swap is two taps from the day                                  | `captures/after-swap-undo-402.png` |
| C-USE-review-the-day-5 | Any state                  | No second person, no "missed", nothing red                                                 | captures                           |
| C-USE-review-the-day-6 | Viewed at 1440             | The success frame at 1440                                                                  | `captures/success-1440.png`        |
| C-USE-review-the-day-7 | A long morning of edits    | Nothing times out                                                                          | test                               |
