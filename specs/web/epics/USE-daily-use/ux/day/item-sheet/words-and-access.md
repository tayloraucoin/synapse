---
target: specs/web/ux/day/item-sheet/words-and-access.md
status: approved
promoted:
---

# Item sheet — words, access, criteria

The second half of [`index.md`](index.md), split to keep each file under its cap.

## Words

Gloss. Strings that are the same in every state; state-only strings sit in each state file. As drawn, no second person; times and lengths are the only numbers.

- Header: "Swap" (plain items only). ··· for the menu (`states/more-open.md`, `states/linear-more-open.md`, `states/work-more-open.md`).
- Scope line: "<Block>, <start> to <end> · today only"; a work item: "Work, 9:30 to 12:00 · Primary · today only" [placeholder times].
- Plain item: "Length"; "At a set time"; off, "Off: follows <previous item>, at <time>" ("Off: follows Start the cold bath, at 7:12"); "Notes (optional)", its placeholder "A word for later [placeholder]" under a visible label (never placeholder as label, A-16).
- Footer: "Changes save as they're made, for today. Monday's usual is unchanged." (the weekday is the day's own).
- Work item: "Size", "Linear's estimate, both ways", the size cards "1 Quick", "2 Small", "3 Medium", "5 Large", "8 Huge"; "Length" with "Exact" and "Range", "to" between the steppers, "Set from Medium; change it freely. The day plans with 2 h, the top of the range."; "Tier" with "Urgent", "Primary", "Secondary", "Stretch"; "Priority"; "Assignee"; "Description" with "Synced with Linear" and "Show all"; "Linear ↗".
- Toasts name what happened with "Undo is offered after" wording in the sheet's own lines, and "Undo" in the toast (Assay round 1 on step 12).
- A failed or late Linear write is never red and never a miss: ink with an info icon.

## Access

Threshold. `[PROPOSED]` where the boards are silent.

- **Focus:** on open, focus moves to the sheet's title (the item's name, a heading); Tab runs ×, Swap, ···, the icon tile, then each field top to bottom, then the footer buttons. Escape and × close; focus returns to the row or bullet that opened it. A step inside the sheet moves focus to its title; its back link returns focus to the control that opened it.
- **Names:** × "Close"; ··· "More for <item name>"; the icon tile "Icon, <emoji or icon name>. Change"; the stepper's − "Shorter" and + "Longer", its value read as "10 minutes"; the switch "At a set time"; the status chip "Status, <word>. Change"; "Linear ↗" "Open <ID> in Linear"; each tier segment by its word, selected announced.
- **Announced (polite live region):** "Updating Linear", then the result ("Not updated in Linear. In review is kept here." or nothing on success); "Done in Linear. Checked off here too, at 10:42."; the toast after Move to, Unlink, Remove.
- **Colour never alone:** tier squares sit beside their words; priority is bars or a square with its word; a Linear status is its shape plus its word.
- **Targets:** every control at least 44 × 44, steppers' − and + included. Reduced motion: the sheet fades in place instead of sliding.

## Instrumentation

None named by the narrative or the log [ASSUMPTION: Phase 1 sends no product events from this sheet]. Never in any payload: item names, notes, descriptions, issue titles or IDs.

## Criteria

| ID                 | When                                                             | Then                                                                                                   | Evidence                         |
| ------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------- |
| C-USE-item-sheet-1 | Any field on a plain item changes                                | It saves at once, for today only; no Save button; the usual week is unchanged                          | `captures/default-402.png`       |
| C-USE-item-sheet-2 | The sheet opens from Review the day                              | Swap sits in the header beside ··· and opens the library filtered to the item's kind                   | `captures/swap-402.png`          |
| C-USE-item-sheet-3 | A Linear write is in flight, fails or the issue closes in Linear | The line under the Linear line reads as in `linear-syncing`, `linear-failed`, `linear-done`; never red | `captures/linear-failed-402.png` |
| C-USE-item-sheet-4 | Tier, priority or status shows                                   | Each carries its word beside its colour or shape                                                       | `captures/linear-linked-402.png` |
| C-USE-item-sheet-5 | × or Escape                                                      | The sheet closes to the screen beneath and focus returns to the opener                                 | manual                           |
| C-USE-item-sheet-6 | `?sheet=item&id=` with each `?state=` key of `states/`           | That state renders (canon C-P08)                                                                       | capture                          |

## Decisions and open items

- D-USE-12 (Swap rows), D-USE-24 (Swap in the header), D-USE-35, 36, 37 (step 11 rounds 1 to 3 approved), D-USE-54 and 57 (the phone's work item sheet), D-USE-60 (the sheet as drawn).
- Workouts come from the library's workout kind through Swap and "Add one" (refinement 7). Checking a linked item moves the issue to Done; unchecking moves it back to its status before (N2).
- Decided (D-USE-103): the item sheet at the desk (D-USE-60 (3)): the phone sheet as a right-side panel (`index.md` › Platforms).
- Loading and offline: `states/loading.md` is N/A (D-USE-65); `states/offline.md` edits save on the phone and sync later (D-USE-64).
