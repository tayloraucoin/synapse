---
target: specs/web/ux/day/close-the-day/states/journal.md
status: approved
promoted:
boards:
  - name: "evening / journal, close the day / 402 / light"
    page: "USE — daily use"
    at: [0, 21540]
    note: "Frame @ x 0, y 22470"
    capture: specs/web/epics/USE-daily-use/ux/day/close-the-day/captures/journal-402.png
rulings: [D-USE-14, D-USE-30, D-USE-72, D-USE-73]
---

# Close the day — journal (writing)

Monday at 21:50: five prompts written, the sixth empty and focused. `?state=journal`. The board's surface name is "evening"; the surface is `day/close-the-day/` (D-USE-73).

## What shows, top to bottom

Phone 402 wide; the board's height fits its content (874 on export).

1. Status bar (21:50).
2. "‹ Wind-down" (caption, muted); "Close the day" (title, semibold). A hairline.
3. "Monday, 12 October · read back on tomorrow's Orient" (caption, muted).
4. The prompts, each a caption (muted, sans) over a serif line, a hairline under each answer [placeholder text]:
   - "How the day went": "Slow start, but the sync spec got written. [placeholder]"
   - "Grateful for today": "The cold bath, and a long lunch outside. [placeholder]"
   - "Grateful for, in life": "People who check in. [placeholder]"
   - "Looking forward to": "Training at the Y. [placeholder]"
   - "What I want to make happen tomorrow": "Ship the Paper handoff. [placeholder]"
   - "Tomorrow, as I see it": empty, with an ink underline (the field in focus).
5. "Saved" (caption, muted).
6. The Tomorrow peek: a hairline-bordered card, "Tomorrow" (caption, muted) over "Wellness at 7:05, then Training" (body, semibold), "See it" (underlined) trailing.

## What the person can do

- Write in any field; it saves on pause and on leaving the field; "Saved" confirms (built).
- "See it" opens tomorrow's day as Schedule draws it (D-USE-74; [`../index.md`](../index.md)).
- "‹ Wind-down": back.
- Nothing else: no finish, no count, no timer.

## Words

"Close the day"; "Wind-down" [placeholder]; the date caption; the six prompts; "Saved"; "Tomorrow"; "Wellness at 7:05, then Training"; "See it".

## The notes on the boards

**"evening / journal, close the day / 402 / light"**, note "Frame" @ x 0, y 22470:

> close the day (step 7b) [PROPOSED]
>
> The bedtime Orient: built in DYN-18 (the wind-down Journal row opens it; six prompts, serif, autosave, no count, no button) and read back on Orient's "Last night". USE's narrative never named it; drawn here with a Tomorrow peek.

## Rulings

- D-USE-73: its own surface; the journal under a "Wind-down" breadcrumb with the Tomorrow peek. Closes open-2's [NEEDS DECISION] on the surface file.
- D-USE-30: the evening close joins the USE checklist as step 7b.
- D-USE-72: the frame's [PROPOSED]: Decided (D-USE-72), as drawn.
- D-USE-14: the evening's three lines read back on Orient's "Last night" sheet ([`../../orient/states/last-night-open.md`](../../orient/states/last-night-open.md)).
- Where this frame and the built journal differ: [`../built-and-words.md`](../built-and-words.md).

## Widths

Drawn at: 402. Not drawn at: the desk; a single reading column, as built (D-USE-39 scales up).

## Criteria

| ID                            | When                       | Then                                                                   | Evidence                   |
| ----------------------------- | -------------------------- | ---------------------------------------------------------------------- | -------------------------- |
| C-USE-close-the-day-journal-1 | Five fields written        | Each shows under its prompt in serif; "Saved" shows; no count anywhere | `captures/journal-402.png` |
| C-USE-close-the-day-journal-2 | The page is open on Monday | The peek reads "Wellness at 7:05, then Training" from Tuesday's day    | `captures/journal-402.png` |
