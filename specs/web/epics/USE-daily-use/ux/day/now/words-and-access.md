---
target: specs/web/ux/day/now/words-and-access.md
status: approved
promoted:
---

# Now — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss. The same in every state; state-only strings sit in each state file. No second person, no count of what is left, no "missed", "late" or "behind"; times and lengths are the only numbers (product rules; the all-done footer names the next block's time, not a count).

- "Now" (the header and the tab while the day is live); "List" before Ready, go (D-USE-5).
- "To-dos" and the first to-do's title, ellipsised (the tray's own words, `../todos/`).
- A block's span as "7:05 to 8:00"; an item's meta as "10 min · 7:10" (length, then planned start); a row's length as "2 min".
- "Start", "Done" on the lifted card; "Took 10 min · Change" after a Done (D-USE-13).
- The row menu: "Swap", "Edit", "Move up", "Move down", "Not today". The header menu: title "<Block>, today", "Complete <Block>", "Edit block", "See the whole day".
- "Planned to end at 8:00" (behind); "<Block> complete", "Next: <Block>, <time>", "Start <Block>" (all done); "Add to <Block>", "Free until <time>"; "Add to the checklist".
- Sample items on the Checklist block are [placeholder].

## Access

Threshold.

- **Focus on open:** the block's name, announced as the page's level-1 heading [ASSUMPTION, as Review the day's date title].
- **Order:** the avatar, the tray's toggle, the block header's ···, then the block's items top to bottom (a done row's box, the lifted card's Start then Done, each undone row's box, then its grip), then the footer when there is one, then `BottomNav`.
- **Names:** a row's box is a checkbox "<item>, <length>"; the row itself is a button "<item>, make current"; the grip is "Reorder <item>"; ··· is "<Block> options"; the lifted card is a group named "<item>, now"; Done's name is "Done, <item>".
- **The long-press menu** has a keyboard and screen-reader path: the row's context-menu key, or a "More" action on the row [ASSUMPTION]; Move up and Move down are the grip's tap and keyboard fallback (D-USE-26). As built (USE-18): "More for <item>" is out of sight until it has keyboard focus, so the drawn row is unchanged; Escape returns focus to where the menu was opened from; the menu is on undone rows only.
- **Targets:** rows are at least 48 px tall; the lifted card's Done is about 160 × 48, the large target for wet hands (N4 story; [judgment] in the intent pass, the canvas sizes it); the between-blocks Done is full width.
- **Announced:** a Done politely, "<item> done. <next item> is next." [ASSUMPTION]; the "Took · Change" line is reachable before it leaves; the behind line once, politely, when the planned end passes.
- **Reduced motion:** the check's settle and the lift happen without motion; a dragged row moves without a glide.
- **Colour is never alone:** the block's kind is named in words; the current item is the lifted card, not only its verdigris dot; done rows carry a checked box, not only fading.

## Instrumentation

No product event is named for Now in USE [ASSUMPTION: none; Phase 1 adds none here]. Checks and their times are the day's record, data, not analytics. Never in any payload: item or to-do names, notes, Linear IDs.

## Criteria

| ID          | When                                      | Then                                                                                             | Evidence                           |
| ----------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------- |
| C-USE-now-1 | Ready, go, then the welcome's Start       | Now shows only the active block, the next undone item lifted with Start and Done                 | `captures/success-402.png`         |
| C-USE-now-2 | Done on the lifted card                   | The item checks with a settle and the next undone item lifts                                     | `captures/done-next-lifts-402.png` |
| C-USE-now-3 | A row is tapped                           | It becomes current; order is a plan, not a rule                                                  | `captures/row-tapped-402.png`      |
| C-USE-now-4 | Any state                                 | No count of what is left, no second person, no "late", nothing red                               | captures                           |
| C-USE-now-5 | Before Ready, go                          | The tab reads List; Review the day on the footer                                                 | `captures/before-ready-go-402.png` |
| C-USE-now-6 | `/today` at 1024 or wider after Ready, go | The desk Today                                                                                   | test                               |
| C-USE-now-7 | Do now on a not-done item                 | The block reopens on Now with the item lifted; past its end the block extends and the day slides | test                               |
