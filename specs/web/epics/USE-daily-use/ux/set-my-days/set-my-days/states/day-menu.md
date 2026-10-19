---
target: specs/web/ux/set-my-days/set-my-days/states/day-menu.md
status: approved
promoted:
boards:
  - name: "set-my-days / day menu / 402 / light"
    page: "USE — set up"
    at: [5302, 0]
    note: "Note · name only, 80 @ x 5302, y 930"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/day-menu-402.png
rulings: [D-USE-28, D-USE-32, D-USE-33, D-USE-87]
---

# Set my days — the day's menu (···)

The round ··· in the bounds row, opened on This week's Monday: what acts on the whole day. `?state=day-menu`. The layout is [`../index.md`](../index.md)'s; the + side of the split is [`plus-menu.md`](plus-menu.md). Its note is "Note · name only, 80" at x 5302, y 930.

## What shows, top to bottom

- The day under it: Monday, 12 October, "‹ Week", "Saved", the chips (M 12 selected), the bounds row; the ··· takes an ink ring while open. The column (bullets as dots) runs on below, the menu covering Wellness and Training's right side. No scrim.
- **The menu**, a shadcn dropdown (D-USE-28) anchored under the ···, right-aligned:
  - Muted title with its scope: "Monday, 12 October".
  - **Add event**, calendar-plus icon.
  - **Copy from…**, copy icon.
  - **Reset to usual Monday**, a counter-clockwise arrow.
  - A 1 px separator, then **Clear this day**, trash icon, in ink (not red).

## What the person can do

- **Add event:** the Add event sheet ([`add-event.md`](add-event.md)). Decided (D-USE-87) This frame (round 2) keeps Add event in the ···; round 3's split note ([`plus-menu.md`](plus-menu.md)) moves it to the +. Default: round 3, the later: the ··· holds Copy from…, Reset to usual, Clear this day, and Event lives on the +.
- **Copy from…:** the picker, then Replace's confirm when the day has blocks, then a Toaster with Undo (D-USE-32; [`../../../interactions/copy-from/index.md`](../../../interactions/copy-from/index.md)).
- **Reset to usual Monday:** undoes this week's edits to the day, back to the usual Monday. Not drawn. Decided (D-USE-87) Whether it asks. Default: at once, with a Toaster and Undo, as Copy from on a day with nothing to lose; a single block's own reset is [`day-own-change.md`](day-own-change.md). [ASSUMPTION] Shown only in This week, and only once the day differs from its usual.
- **Clear this day:** removes every block on the day; "asks once (next round)". No frame draws the confirm. Decided (D-USE-87) Default: Replace's form (D-USE-32), an `AlertDialog` asking "Clear Monday, 12 October?" [PROPOSED words] and naming what goes as Replace does, Clear in ink and Cancel; then a Toaster with Undo, which restores the day. On a day with no blocks it is disabled.
- A tap outside, Escape, or the ··· again closes the menu.

## Words

"Monday, 12 October" (the title in This week; [ASSUMPTION] "Every Monday" in Usual week) · "Add event" · "Copy from…" · "Reset to usual Monday" · "Clear this day".

## The notes on the boards

**"set-my-days / day menu / 402 / light"**, note "Note · name only, 80" @ x 5302, y 930:

> The day's menu
>
> ··· holds Add event, Copy from…, and [PROPOSED] Reset to usual Monday, the way back from this week's edits (canvas pattern 16). Clear this day sits below a separator, in ink, and asks once (next round).

## Rulings

- Round 2 (open-3, "Set my days, step 9 round 2"): the ··· holds Add event, Copy from…, Reset to usual Monday and Clear this day. Round 3 (open-4) moves Add event to the + [PROPOSED].
- D-USE-28: menus are shadcn dropdowns; destructive rows stay in ink (D-USE-38 keeps red for Urgent, Blocked and Paused only).
- D-USE-33: a block changed for one date reads "This day only"; Reset to usual is the day-wide way back.

## Widths

Drawn at: 402. Not drawn at: 1024 and wider (list-detail, D-USE-83) [ASSUMPTION: the same dropdown from the day pane's ···].

## Criteria

| ID                           | When                             | Then                                                                                                      | Evidence                    |
| ---------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------- |
| C-USE-set-my-days-day-menu-1 | ··· is tapped on a This week day | A dropdown titled with the date: Copy from…, Reset to usual <weekday>, a separator, Clear this day in ink | `captures/day-menu-402.png` |
| C-USE-set-my-days-day-menu-2 | Clear this day is tapped         | It asks once before clearing, then offers Undo                                                            | test                        |
| C-USE-set-my-days-day-menu-3 | Reset to usual is tapped         | The day matches its usual weekday, with Undo                                                              | test                        |
