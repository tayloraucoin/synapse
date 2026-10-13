---
target: specs/web/ux/set-my-days/set-my-days/states/day-own-change.md
status: approved
promoted:
boards:
  - name: "set-my-days / this week follows, a day's own change kept / 402 / light"
    page: "USE — set up"
    at: [4820, 1260]
    note: "Frame @ x 4820, y 2190"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/day-own-change-402.png
rulings: [D-USE-33]
---

# Set my days — this week follows, a day's own change kept

This week's Thursday, 15 October, opened from "See it" ([`usual-change-reaches.md`](usual-change-reaches.md)). `?state=day-own-change`. Its note is the "Frame" at x 4820, y 2190. Layout, words and access: [`../index.md`](../index.md).

## What shows, top to bottom

- **Header:** "‹ Week", `SaveStatus` "Saved"; the title "Thursday, 15 October".
- **Dated chips:** M 12, T 13, W 14, **T 15** (filled ink), F 16, S 17, S 18, dots under the built days.
- **Bounds row:** "Up at 7:00", "Lights out 22:30", the ···.
- **Column:**
  - Orient · 5 min at 7:00.
  - **Wellness 7:05 to 8:00**, with the usual week's change (Pee and weigh, Water, Start the cold bath, "+2 more"); no marker, since it follows the usual week.
  - **Training 8:00 to 8:57**, its own version for this date: "Drive to the YMCA", "Workout: swim" [placeholder], "Drive home"; at the header's trailing edge a pencil glyph and "This day only" in muted caption text, no pill.
  - Breakfast 9:00 to 9:30; Work 9:30 to 12:00 with this week's tiers (Primary, Secondary, Stretch, as [`overlap.md`](overlap.md)) [placeholder]; Lunch 12:00 to 13:00; the + bottom right.

## What the person can do

- Reset to usual, on the day's ··· ([`day-menu.md`](day-menu.md)): puts Training back to the usual Thursday's.
- Tap Training: its Block view for this date. "This day only" is a marker, not a control [ASSUMPTION].
- Everything else as this week's day ([`the-day.md`](the-day.md)).

## Words

"This day only" (muted, with a pencil glyph). It replaces the round's "Changed for this day" (open-5) with the canvas words, as D-USE-33 ruled.

## The notes on the boards

**"set-my-days / this week follows, a day's own change kept / 402 / light"**, "Frame @ x 4820, y 2190":

> See it: this week's Thursday
>
> Wellness took the change. Training was swapped to a swim for this day only [placeholder], so it kept its own version. [PROPOSED] A block changed for one date carries a quiet "This day only" with a pencil, in muted text (no pill); Reset to usual (the day's ···) puts it back.

## Rulings

- D-USE-33: a block changed for one date is marked by a quiet muted "This day only" with a pencil, never a filled pill (the white badge read as amateur). This settles the note's [PROPOSED] marker.
- The rule that a usual-week change skips blocks changed on that date stays `[ASSUMPTION, N5]` ([`usual-change-reaches.md`](usual-change-reaches.md)).
- The usual week never shows "This day only": its blocks are every week's [ASSUMPTION].

## Widths

Drawn at: 402. At 1024 and wider (D-USE-83, [`the-day.md`](the-day.md)) the same marker sits in the day pane.

## Criteria

| ID                                 | When                                                         | Then                                                                         | Evidence                          |
| ---------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------- |
| C-USE-set-my-days-day-own-change-1 | A block was changed on one date, then the usual week changed | That date keeps its own version; the other blocks follow                     | `captures/day-own-change-402.png` |
| C-USE-set-my-days-day-own-change-2 | A block differs from the usual week on one date              | It shows "This day only" with a pencil in muted text, no pill                | `captures/day-own-change-402.png` |
| C-USE-set-my-days-day-own-change-3 | Reset to usual is chosen                                     | The day's own changes go; the usual week's blocks return and the marker goes | test                              |
