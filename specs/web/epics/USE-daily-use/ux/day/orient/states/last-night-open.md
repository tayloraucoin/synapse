---
target: specs/web/ux/day/orient/states/last-night-open.md
status: approved
promoted:
boards:
  - name: "orient / last night open / 402 / light"
    page: "USE — daily use"
    at: [964, 2640]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/orient/captures/last-night-open-402.png
rulings: [D-USE-9, D-USE-14, D-USE-30, D-USE-39]
---

# Orient — last night open

"Read last night's reflections" opens a sheet over Orient with the evening's three lines. Its note is the "Note · success" at x 964, y 3570.

## What shows, top to bottom

- **Beneath:** Orient as in [`success.md`](success.md), under a scrim (402 × 874).
- **`ResponsiveSheet` "Last night"**, 584 px tall on the board (it fits its content [ASSUMPTION]), `--radius-sheet` on its top corners, `--color-background`, 20 px side padding, 8 px at the top, 34 px at the foot:
  - a grab handle (36 × 4, full radius, `--color-fill-muted`), centred;
  - a header row, 14 px gap: × (18 px, muted) on the left, then the evening's date as a caption ("Sunday, 11 October", muted) over the title "Last night" (title, semibold);
  - three entries, each with a `--color-border` hairline above, 16 px top and bottom, 8 px between caption and text: the caption (caption, muted) and the line (body at heading leading, `--color-foreground`) [placeholder text]:
    - "What I want to make happen today": "Ship the first Primary before lunch, and get to the gym even if it's short."
    - "Tomorrow, as I see it": "Quiet morning, a long focused stretch, a walk in the afternoon."
    - "Looking forward to": "Dinner, and the new book."
- Read only: no field, no button, nothing written by reading it.

## What the person can do

- Tap × (left), drag the sheet down, or tap the scrim: back to Orient, focus on "Read last night's reflections".
- Scroll inside the sheet when the lines run long.

## Words

"Last night"; the date of the evening, "Sunday, 11 October". The captions are the evening journal's own prompts. The first is read back re-tensed: "What I want to make happen tomorrow" becomes "What I want to make happen today", the one change the app makes to the person's words (as built, UX v1.2 §5.2). The board's "Tomorrow, as I see it" is the evening's prompt read as written [ASSUMPTION: only the first prompt is re-tensed, as built].

## The notes on the boards

**"orient / last night open / 402 / light"**, note "Note · success" @ x 964, y 3570:

> last night open
>
> A sheet over Orient with the evening's three lines under their own captions. Read only. × on the left, or drag down.

## Rulings

- **D-USE-9:** "Last night" moves below the three lines as "Read last night's reflections".
- **D-USE-14:** it opens a sheet, "Last night", holding the evening's three lines under their own captions.
- **D-USE-30:** the evening close (the wind-down journal) writes these lines; it is carried by `close-the-day/` (written by a later thread of this handoff).
- **D-USE-39:** at the desk the sheet is `ResponsiveSheet`'s right panel at `--sheet-w`.
- The overview board drew this as branch 1b, "orient.md · last night open [PROPOSED state]".

## Widths

Drawn at: 402. Not drawn at: the desk, where the sheet is the right panel at `--sheet-w` over the centred column (D-USE-39).

## Criteria

| ID                             | When                                      | Then                                                                                | Evidence                           |
| ------------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------- |
| C-USE-orient-last-night-open-1 | "Read last night's reflections" is tapped | The sheet shows the evening's date, "Last night" and its lines under their captions | `captures/last-night-open-402.png` |
| C-USE-orient-last-night-open-2 | The sheet is open                         | Nothing in it is editable and nothing is written                                    | test                               |
| C-USE-orient-last-night-open-3 | × or a drag down                          | The sheet closes and focus returns to its trigger                                   | test                               |
| C-USE-orient-last-night-open-4 | An evening line was left empty            | Its entry is left out                                                               | test                               |
