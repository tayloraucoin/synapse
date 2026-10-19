---
target: specs/web/ux/day/item-sheet/states/sub-issue-alone.md
status: approved
promoted:
boards:
  - name: "phone-edit / sub-issue, placed alone / 402 / light"
    page: "USE — work"
    at: [1446, 7200]
    note: "Notes · phone, editing and This week (row 6) @ x 1446"
    capture: specs/web/epics/USE-daily-use/ux/day/item-sheet/captures/sub-issue-alone-402.png
rulings: [D-USE-51, D-USE-54, D-USE-57, D-USE-58, D-USE-103]
---

# Item sheet — a sub-issue placed alone

Reached from a sub-issue's ··· › "Place on a day by itself" in [`tier-and-sessions.md`](tier-and-sessions.md): the sub-issue "[Firing in place on the row]" of SYN-212, on Monday 12 at 10:20 during Work. `?state=sub-issue-alone`.

## What shows, top to bottom

- Behind the scrim: the status bar (10:20), "Now", the Work band (the sky bar and "Work").
- The sheet from y 380 (494 high), the grab handle; × on the left.
- "Sub-issue of SYN-212 · 🧭 [Synapse: desk Today layout]" (muted), then "Place [Firing in place on the row]" (title).
- Muted: "It stays checkable inside its issue too. Checking it either place checks it in Linear."
- **Day**: label and seven day chips (letter over date), one pick: T 15 selected (filled ink); M 12, T 13, W 14, F 16 outlined; S 17 and S 18 dashed and greyed (no Work block).
- **Tier**: label and the coloured `SegmentedControl`: Urgent, Primary, Secondary (selected, white with a border, bold), Stretch, each with its square.
- The consequence line, muted: "Thu's Secondary runs to 11:20 at the top of its ranges."
- "Place on Thu 15", full width in ink.

## What the person can do

- Pick one day (one only, unlike New task's days) and one tier; the line and the action follow.
- **Place**: the sub-issue sits on that day in that tier as a row of its own, and stays a checkbox under its issue; on the issue's sheet it shows its day muted with its own ··· ("Thu 15", as on [`tier-and-sessions.md`](tier-and-sessions.md)); on Now's row it folds under its issue and shows its day (D-USE-51 (6)). A toast with Undo [ASSUMPTION: as placed, Undo, [`../../../interactions/place-from-the-pool/states/placed-undo.md`](../../../interactions/place-from-the-pool/states/placed-undo.md)].
- Checking it in either place checks it in Linear; the other place follows.
- × or a swipe down closes without placing.
- Past the block's end is said in words, never red [ASSUMPTION: as the place sheet's "doesn't fit", not drawn here].

## Words

"Sub-issue of <ID> · <project emoji> <issue title>" · "Place <title>" · "It stays checkable inside its issue too. Checking it either place checks it in Linear." · "Day" · "Tier" · "Thu's Secondary runs to 11:20 at the top of its ranges." · "Place on <day>". Gloss proposes "Checking it in either place checks it in Linear." [PROPOSED: the strip card's wording; the frame drops "in"].

## Access

The sheet traps focus; × named "Close". Day is a radio group (one day), each chip named "Thursday 15" with "no Work block" on a disabled day [PROPOSED]; Tier is a radio group named by its words (colour never alone). The line is announced politely when it changes [ASSUMPTION]. Controls at least 44 × 44. Focus returns to the sub-issue's ··· on close.

## The notes on the boards

**phone-edit / sub-issue, placed alone / 402 / light** (Notes · phone, editing and This week (row 6) @ x 1446, card "Sub-issue, placed alone"):

> Sub-issue, placed alone
>
> One day, one tier, the consequence, Place. It stays a checkbox inside its issue too; checking it in either place checks it in Linear.

## Rulings

- D-USE-54: "Place on a day by itself" on a sub-issue's ···. D-USE-51 (6): one placed alone shows its day under its issue. D-USE-57: the item sheet's work editing, completed. D-USE-58: locked as drawn.
- D-USE-103: at the desk this opens inside the Item sheet's right-side panel, scaled up from this frame.

## Widths

Drawn at: 402. Desk: the right-side panel (D-USE-103, "a sub-issue placed alone" named in it).

## Criteria

| ID                                 | When                                       | Then                                                      | Evidence                           |
| ---------------------------------- | ------------------------------------------ | --------------------------------------------------------- | ---------------------------------- |
| C-USE-item-sheet-sub-issue-alone-1 | "Place on a day by itself" on a sub-issue  | One day, one tier, the consequence line, "Place on <day>" | `captures/sub-issue-alone-402.png` |
| C-USE-item-sheet-sub-issue-alone-2 | The placed sub-issue is checked on its day | It checks under its issue and in Linear                   | test                               |
