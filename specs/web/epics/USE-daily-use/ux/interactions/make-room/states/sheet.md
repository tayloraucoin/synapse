---
target: specs/web/ux/interactions/make-room/states/sheet.md
status: approved
promoted:
boards:
  - name: "review-day / make room / 402 / light"
    page: "USE — daily use"
    at: [3374, 3900]
    note: "Note · make room"
    capture: specs/web/epics/USE-daily-use/ux/interactions/make-room/captures/sheet-402.png
rulings: [D-USE-11, D-USE-66]
---

# Make room — the sheet

Board branch 2e [PROPOSED]: adding with no room. A placeholder for the dev note ([`../index.md`](../index.md)). Kept as the board drew it: Foam roll at 8:45 in Training, not the 10:15 add beside it. Its note is "Note · make room" at x 3374, y 4830.

## What shows, top to bottom

- Review the day under a scrim (header, tray, the top of Wellness visible); the sheet from about y 250 with a grabber.
- × on the left; the scope line "Adding Foam roll [placeholder], 10 min at 8:45" (caption, muted) over the title "Make room for 10 min".
- A `SegmentedControl`: "From Training" (picked) and "From other blocks".
- A multi-select list on hairlines, each row a `Checkbox`, a title (body) over a line (label, muted), and a trailing amount:
  - "Workout: gym" / "35 min, now 28 min", checked, with a `MinutesStepper` "− 7 +".
  - "Gap before Breakfast" / "3 min free", checked, "3".
  - "Drive to the YMCA" (italic, muted) / "Travel time stays as it is", a dashed, disabled box.
  - "Drive home" (italic, muted) / "Travel time stays as it is", disabled.
- Foot line (label): "10 of 10 min found". Then two buttons side by side: "Decide for me" (outlined) and "Make room" (ink, the primary).

## What the person can do

- Tick or untick an eligible row; the stepper sets the minutes taken from it; the foot line follows.
- "From other blocks" lists the other blocks' eligible items and gaps [ASSUMPTION].
- **Make room** takes the minutes and adds the item [ASSUMPTION: enabled once the minutes are found].
- **Decide for me:** Decided (D-USE-66), in [`../index.md`](../index.md) › Rules (default: kept drawn, unwired until AI is in scope).
- × closes: nothing is added and nothing taken.

## Words

"Adding <item>, <n> min at <time>" · "Make room for <n> min" · "From <block>" · "From other blocks" · "<length>, now <length>" · "Gap before <block>" · "<n> min free" · "Travel time stays as it is" · "<found> of <needed> min found" · "Decide for me" · "Make room". "10 of 10 min found" counts minutes, a length, kept as drawn.

## The notes on the boards

**"review-day / make room / 402 / light"**, "Note · make room" @ x 3374, y 4830:

> make room · board 2e [PROPOSED]
>
> Adding with no room. Gaps first, then minutes from items; travel shown but not eligible. Kept as the board drew it (Foam roll at 8:45 in Training, not the 10:15 add beside it); a placeholder for the dev note. "Decide for me" needs a model call [NEEDS DECISION]: Phase 1 has no AI.

## Rulings

- D-USE-11: the sheet's two sources, the multi-select with minutes taken, travel and pinned appointments shown and not eligible, "Decide for me" Decided (D-USE-66).

## Widths

Drawn at: 402. At the desk: the right-side panel at `--sheet-w` (D-USE-39).

## Criteria

| ID                      | When                       | Then                                                             | Evidence                 |
| ----------------------- | -------------------------- | ---------------------------------------------------------------- | ------------------------ |
| C-USE-make-room-sheet-1 | The sheet opens            | Gaps and items with what each gives; travel shown, disabled      | `captures/sheet-402.png` |
| C-USE-make-room-sheet-2 | Rows are ticked or stepped | The foot line reads the minutes found against the minutes needed | test                     |
