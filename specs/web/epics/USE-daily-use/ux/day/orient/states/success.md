---
target: specs/web/ux/day/orient/states/success.md
status: approved
promoted:
boards:
  - name: "orient / success / 402 / light"
    page: "USE — daily use"
    at: [0, 2640]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/orient/captures/success-402.png
rulings: [D-USE-5, D-USE-9, D-USE-14, D-USE-21, D-USE-25, D-USE-39, D-USE-63]
---

# Orient — success: first open

The board's frame at full detail, the first open of the day. Its note is the "Note · success" at x 0, y 3570.

## What shows, top to bottom

Phone 402 × 874, `--color-background`, 20 px side padding, 20 px between regions, 34 px under the button for the safe area.

1. **Status bar:** the phone's own (6:58 on the board). Orient itself shows no time.
2. **Greeting:** "Monday, 12 October" (`Text` caption, `--color-muted-foreground`), 2 px gap, "Good morning" (`Text` title, semibold, `--tracking-title`, `--color-foreground`).
3. **`PassageCarousel`**, 10 px between its parts: the caption "Morning reading" [placeholder] (caption, muted); the passage in the serif, `--text-heading` with review-body leading, `--color-foreground`, clamped with an ellipsis ("Begin where the feet are. The breath has kept time all night without being asked. Before the list and before the clock there is only this: cool air, a held…" [placeholder]); a row with three dots at the leading edge (8 px, full radius, 8 px apart; current `--color-foreground`, others `--color-fill-muted`) and "Read all" at the trailing edge (sans, medium, `--text-label`, `--color-link`).
4. **`LinkCallout`s**, 8 px apart, each `--h-row` tall, 12 px inner padding, `--radius-control`, `--color-surface` fill, `--color-border` hairline: the Spotify mark (20 px), the title (body, medium: "Morning calm", "Cold bath" [placeholder]) over the host (caption, muted: "open.spotify.com"), an external-link mark (16 px, muted) at the trailing edge.
5. **Before the day**, 12 px between rows: a heading row with `GroupHeading` "Before the day" (label, semibold) and `SaveStatus` "Saved" (caption, `--color-subtle-foreground`), on one baseline. Then three fields, label above field 4 px apart: "Grateful for" with its `Textarea` grown to two lines ("A slow start, the bath filling, and the light coming in over the trees." [placeholder]; 10 px by 12 px padding, `--color-input` border, `--radius-control`); "Intention" and "Today, as I see it" empty at one line (`--h-target`, `--color-border`). Labels are label size, medium, muted.
6. **"Read last night's reflections"** with a chevron (label, medium, muted), 4 px above it, the `TextDisclosureButton`.
7. Flexible space, then the primary `Button` "Review the day": 48 px, full width, `--color-primary` fill, `--color-primary-foreground` text, semibold, `--radius-control`.

## What the person can do

- Swipe the reading for the next passage; tap "Read all" to open the reader ([`passage-open.md`](passage-open.md)).
- Tap a link: opens in a new tab, writes nothing.
- Type in any line: it autosaves; "Saved" sits quietly beside the heading.
- Tap "Read last night's reflections": the "Last night" sheet ([`last-night-open.md`](last-night-open.md)).
- Tap "Review the day": Review the day. Nothing is required first.

## Words

As the index's Words. Sample text on the board is [placeholder].

## The notes on the boards

**"orient / success / 402 / light"**, note "Note · success" @ x 0, y 3570:

> success · first open
>
> The board's frame at full detail. Lines autosave; "Saved" sits quietly beside the heading. The status bar is the phone's; Orient itself shows no time.

## Rulings

- **D-USE-9:** the title "Good morning" over the date; the passage clamps with "Read all"; the Spotify `LinkCallout`s under it; the three lines under "Before the day", each labelled; "Last night" moves below them as "Read last night's reflections".
- **D-USE-14:** the lines are one-line `Textarea`s that grow to about five lines, then scroll inside; the reflections open a sheet.
- **D-USE-5:** Orient exits to Review the day.
- **D-USE-21:** Orient arrived mostly settled from the approved overview board.
- **D-USE-25:** the button floats over content on a fade from transparent to the background token; this frame predates it and takes it at the lock pass.
- **D-USE-39:** no wide frame; the desk scales this up (index, Platforms).
- The built frame asks "Working today?" on a Sometimes day, labels its button "Start the morning · work 9:00", and shows "Skipped yesterday too." under the first line. None is on the boards. All three leave Orient, which now sets nothing (the day is set on Review the day and at Ready, go) (D-USE-63).
- The built quote day (a slide captioned "A quote", attributed, in quotation marks) is not on the boards. It is kept as one more carousel slide, with the caption "A quote" in place of the reading's caption (D-USE-63).

## Widths

Drawn at: 402. Not drawn at: the desk; one centred column capped at the reading measure, no rail (D-USE-39).

## Criteria

| ID                     | When                                                       | Then                                                             | Evidence                   |
| ---------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------- |
| C-USE-orient-success-1 | The first open with passages, links and an evening written | The regions show in the order above and nothing else             | `captures/success-402.png` |
| C-USE-orient-success-2 | A line is typed                                            | It saves without a button; "Saved" shows beside "Before the day" | test                       |
| C-USE-orient-success-3 | A line passes about five lines                             | The field stops growing and scrolls inside                       | test                       |
| C-USE-orient-success-4 | A link is tapped                                           | It opens in a new tab and nothing is written                     | test                       |
| C-USE-orient-success-5 | The frame is read                                          | No time, countdown or count appears in the page                  | `captures/success-402.png` |
