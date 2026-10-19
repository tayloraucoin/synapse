---
target: specs/web/ux/day/block-view/words-and-access.md
status: approved
promoted:
---

# Block view — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss. Strings the same in every state; state-only strings sit in each state file. No second person; times and lengths are the only numbers; nothing red.

- Breadcrumb: "Today" or the weekday ("Monday"), then the block's name.
- Header: the block's name; its span "7:05 to 8:00"; "Edit", "Done"; ··· for the menu.
- Rows: the item's name; its length "2 min", "10 min".
- "Add to Wellness" (the block's own name); "Free until 8:00" [ASSUMPTION, open-1].
- The peek: "Training · 8:00 to 8:57".
- Edit hint (from the day): "Drag a grip to reorder. Swipe left to remove. Changes apply to today." Editing: "Every Monday. Drag a grip to reorder; swipe left to remove."
- "Remove" (swipe), the toast "<item> removed." with "Undo".
- Menu: "Today's Wellness only" (from the day) as its title; "Rename", "Icon and colour", "Delete block".
- Empty, overflow, error and offline words: their state files.
- A very long block name truncates at one line in Set my days' column and shows in full here (N2) [ASSUMPTION: it wraps in the header].

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- **Focus on open:** the block's name, a level-1 heading (`tabIndex -1`); on [`states/empty.md`](states/empty.md) the add row, with the keyboard up (as drawn).
- **Order:** breadcrumb, heading, Edit, ···, each row (checkbox, then the name as a button to the Item sheet), the add row, the peek; the tabs last when shown.
- **Names:** the breadcrumb is a `nav` "Breadcrumb" with "Today" a link; ··· "More for Wellness"; a checkbox "<item>, <start>, <length>"; a grip "Reorder <item>" with Up and Down arrows moving it one place, Space to lift and drop; the swipe's Remove is also on the row's long-press menu [ASSUMPTION] so it has a non-gesture path.
- **Move up / Move down:** the long-press menu's tap fallback for the grip (open-1, Decided (D-USE-69) in [`states/edit-dragging.md`](states/edit-dragging.md)) is also the screen-reader path.
- **Announced (polite):** "<item> removed." with Undo; a move as "<item> moved to 7:10"; the offline StatusLine once.
- **Colour never alone:** the block's colour bar sits beside its name; checked rows carry the check, not only the fade; the now-line has its time tag; overflow is words under a dashed line.
- **Targets:** rows at least 56 px; checkbox, grip, Edit, ··· and Undo at least 44 × 44.
- **Reduced motion:** the lift and re-flow happen without animation; the swipe reveal snaps.

## Instrumentation

None named by the narrative or the log [ASSUMPTION: Phase 1 sends no product events from Block view]. Never in any payload: item or block names.

## Criteria

| ID                 | When                                | Then                                                                                         | Evidence                          |
| ------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------- |
| C-USE-block-view-1 | A block on Review the day is tapped | Block view opens with "‹ Today › Wellness", the span filling the screen, rows at least 56 px | `captures/success-402.png`        |
| C-USE-block-view-2 | The breadcrumb is tapped            | It goes back to the day it came from, scrolled as left                                       | test                              |
| C-USE-block-view-3 | A row is checked                    | It stays in place, faded with its check, never hidden                                        | `captures/checked-swipe-402.png`  |
| C-USE-block-view-4 | A change is made from the day       | It applies to today only; the weekday's usual is unchanged                                   | test                              |
| C-USE-block-view-5 | A change is made in editing mode    | It applies to every such weekday, as the scope line says                                     | `captures/editing-monday-402.png` |
| C-USE-block-view-6 | Any state                           | No second person, no count, nothing red, nothing says missed                                 | captures                          |
| C-USE-block-view-7 | Each `?state=` key of `states/`     | That state renders (canon C-P08)                                                             | capture                           |

## Decisions and open items

- D-USE-17 (the grip), D-USE-24 (Edit beside ···, the scoped menu), D-USE-28 (menus as shadcn dropdowns), D-USE-30 (the now-line on every timed day view), D-USE-39 (no wide frame), D-USE-64 (offline edits; `states/editing-offline.md`).
- A typed item takes 5 minutes and follows the last; reordering re-flows times around pinned items (round 8).
- Open: open-1 "Block view, step 3 round 1 (drawn)": Move up / Move down (`states/edit-dragging.md`), Delete block asks once with Undo (`states/header-menu.md`), "Free until 8:00" (`states/success.md`). open-7 "Audit gaps": the `editing, offline` frame (`states/editing-offline.md`). open-1 "To Plumb": `Breadcrumb`.
