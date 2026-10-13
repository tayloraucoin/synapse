---
target: specs/web/ux/day/todos/states/from-a-reminder.md
status: approved
promoted:
boards:
  - name: "now / tray, from a reminder / 402 / light"
    page: "USE — daily use"
    at: [482, 12720]
    note: "Frame @ x 482, y 13650"
    capture: specs/web/epics/USE-daily-use/ux/day/todos/captures/from-a-reminder-402.png
rulings: [D-USE-26, D-USE-31, D-USE-69]
---

# To-dos tray — from a reminder

Now at 10:00, opened by tapping the reminder (`notification.md`). Drawn on Now; carried here because it shows the tray's state (`../index.md`). `?state=from-a-reminder`.

## What shows, top to bottom

- Now's header: "Now", the avatar "T".
- The tray open (chevron up), as `open.md`, with:
  - **The reminded row**, "Call the mechanic", tinted (a muted fill, rounded) for a moment, its phone icon, and on the right the bell glyph with "10:00" in ink and semibold (not muted as in `open.md`).
  - "Library books [placeholder]" with its bag icon and "From Sunday" muted.
  - "+ Add a to-do".
- Below, the active block as Now draws it, pushed down: Work, "9:30 to 12:00", ···, "Primary", the lifted card "[Primary item]" "45 min · 9:30" with Start and Done, then "[Primary item]" "30 min" with its drag handle. "tiers in step 8" on the right of "Primary" is a canvas pointer, not app copy.
- The tab bar: Now (selected), Schedule, Review.

## What the person can do

- Check the to-do (the main move); tap the row to open the To-do sheet; close the tray from its header.
- Everything in the block stays live underneath.
- The tint fades on its own [ASSUMPTION: after about two seconds; with reduced motion it is shown without the fade and goes at once on the next tap].

## Words

As `open.md`; the reminded time reads in ink, "10:00".

## The notes on the boards

**now / tray, from a reminder / 402 / light** (Frame @ x 482, y 13650):

> tray, from a reminder
>
> Tapping the 10:00 notification opens Now with the tray open on that to-do, tinted for a moment, its time in ink. At 10:00 Work is the active block; its tiers are step 8, so the block here is a placeholder.

## Rulings

- N4: "Tapping it opens Now with the tray open on that to-do. The tray marks it with a small bell glyph and its time."
- D-USE-26: the tray is closed by default on Now; a reminder is the one way in that opens it.
- D-USE-31: the work block's tiers (step 8); the block here is a placeholder for them, carried by `../../now-work.md` and `../../../work/today/`.
- The opened to-do is scrolled into view if the tray is long [ASSUMPTION].

## Widths

Drawn at: 402. At the desk: Decided (D-USE-69) as `notification.md` › Widths, default Now with the tray open on the to-do, scaled up (D-USE-39 (1)).

## Criteria

| ID                            | When                      | Then                                                                                    | Evidence                           |
| ----------------------------- | ------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-todos-from-a-reminder-1 | Now opens from a reminder | The tray is open, the reminded row tinted for a moment, its time in ink beside the bell | `captures/from-a-reminder-402.png` |
| C-USE-todos-from-a-reminder-2 | The tray opens            | The block below is pushed down, not covered, and stays live                             | manual                             |
