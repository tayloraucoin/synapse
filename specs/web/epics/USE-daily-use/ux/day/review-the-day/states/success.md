---
target: specs/web/ux/day/review-the-day/states/success.md
status: approved
promoted:
boards:
  - name: "review-day / success / 402 / light"
    page: "USE — daily use"
    at: [0, 3900]
    note: "Note · success"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/success-402.png
  - name: "review-day / success / 1440 / light"
    page: "USE — daily use"
    at: [5302, 5160]
    note: "Note · review-day / success / 1440"
    capture: specs/web/epics/USE-daily-use/ux/day/review-the-day/captures/success-1440.png
not_picked:
  - name: "review-day / B: name only, 96/h / 402 / light"
    ruled: D-USE-23
  - name: "review-day / C: grid, 80/h / 402 / light"
    ruled: D-USE-23
  - name: "review-day / D: name only, 80/h / 402 / light"
    ruled: D-USE-23
rulings:
  [
    D-USE-7,
    D-USE-8,
    D-USE-10,
    D-USE-15,
    D-USE-18,
    D-USE-23,
    D-USE-25,
    D-USE-39,
    D-USE-65,
  ]
---

# Review the day — success: a usual morning

The board's frame at full detail. Its notes: "Note · success" at x 0, y 4830 (phone) and "Note · review-day / success / 1440" at x 5302, y 6090 (desk).

## What shows, top to bottom (402)

Phone 402 × 874, `--color-background`, 20 px side padding, 34 px safe area under the button. The fixture (D-USE-8), Monday 12 October, status bar 6:58.

1. **Header:** `Breadcrumb` [PROPOSED]: a 14 px chevron and "Orient" (`--text-label`, medium, `--color-muted-foreground`), 24 px row; 2 px under it the title "Monday, 12 October" (`--text-title`, semibold, `--tracking-title`, `--color-foreground`); 12 px below.
2. **To-dos tray, closed:** a `--h-target` row between `--color-border` hairlines: "To-dos" (label, semibold), the first title muted and ellipsised ("Call the mechanic…"), a 12 px chevron down (muted) at the trailing edge (`../../todos/`).
3. **The day column**, clipped and scrolling:
   - Hour labels "7" to "13" (caption, muted) at x 20 in the gutter, a hairline per hour from the column's left (`--spacing-row`) to 20 px from the edge; 96 px an hour.
   - **Orient** at the top: a 2 px ink bar 180 px long, a lock glyph (10 px, muted), "Orient · 5 min" (caption, muted).
   - **Blocks** from x 60, 322 wide: `ScheduleBlock` with the kind's chip fill (`--color-category-<kind>-chip`), a 3 px left edge in its dot colour, `--radius-control`, 8 px top and bottom, 13 px left padding; the head is the name (body, semibold) and the span (label, medium, muted). **Bullet grid** [PROPOSED]: two fixed 145 px cells a line, 8 by 4 px gaps, a 6 px dot in the kind's colour and the label (`--text-label`). Wellness 7:05 to 8:00 (leaf): "Pee and weigh", "Water", "Start the cold bath", then "+2 more" (medium, muted) in the fourth cell. Training 8:00 to 8:57 (clay): "Drive to the YMCA" and "Drive home" as transitions (a 6 × 1.5 px muted dash, italic, muted), "Workout: gym" with a dot.
   - **Meals** as dashed-border bands (`--color-border`), the fork-and-knife glyph (14 px, muted), name (label, medium) and span (muted): Breakfast 9:00 to 9:30 (`--h-target` tall), Lunch 12:00 to 13:00.
   - **Work** 9:30 to 12:00 (sky): tier sub-heads "Primary" and "Secondary" (caption, medium, muted), one item a line: "[Primary item, linked] · ENG-123", "[Primary item]", "[Secondary item]" [placeholder]. Work 13:00 to 15:00 shows its head only.
4. **Rail +** [PROPOSED]: 40 × `--spacing-row` at x 10, `--color-background` with a 1 px ink border, `--radius-control`: a small up mark, a 16 px ink +, a small down mark (marks muted). Drawn beside Lunch. The hint has gone (after the first drag or Got it, D-USE-18).
5. **Ready, go:** 48 px, `--color-primary`, `--radius-control`, "Ready, go" (body, semibold, `--color-primary-foreground`), 12 px above, on the fade (D-USE-25).

To Plumb (open-1, "To Plumb", not carried whole): `Breadcrumb`, the rail + and its drag state, the bullet grid in `ScheduleBlock`; on other states the add sheet, the Make room sheet, the now-line's time tag (`--color-now`) and the All day strip.

## At 1440

No status bar. One column centred and capped at `--content-text` (720; x 360 to 1080), a hairline under the header and over the footer. The tray row spans the column. The time axis keeps 96 px an hour and its 56 px gutter; blocks fill the column (x 420 to 1060) and the bullet grid keeps its fixed cells, so Wellness shows three items and "+2 more" on one line and Training its three on one line. The + sits in the gutter at the column's left (beside Lunch). Ready, go sits at the foot, right-aligned, a fixed 240 wide.

## What the person can do

Tap a bullet: the Item sheet (`../../item-sheet/index.md`). Tap a block: its Block view (`../../block-view/index.md`). Tap or drag the +: [`../../../interactions/add-from-the-rail/index.md`](../../../interactions/add-from-the-rail/index.md). Swipe a band to remove it, with Undo (N3). Open the tray. Ready, go.

## The notes on the boards

**"review-day / success / 402 / light"**, "Note · success" @ x 0, y 4830:

> success · a usual morning
>
> The board's frame at full detail. The rail + keeps its up and down marks; the hint has gone after the first drag or Got it (D-USE-18).

**"review-day / success / 1440 / light"**, "Note · review-day / success / 1440" @ x 5302, y 6090:

> Wide · review-day / success / 1440 (D-USE-39) · what it settles for dev
>
> [PROPOSED] Review the day stays focused at every width: no rail and no tabs, the same as Orient and the Ready, go welcome. The column is centred and capped at --content-text (720), not stretched to the window.
> The time axis keeps 96 px an hour and its 56 px gutter. Blocks fill the column, and the bullet grid keeps its fixed-width cells, so more items show per line and "+2 more" counts only what still doesn't fit.
> The rail's + stays in the time gutter at the column's left, not the window's corner. The now-tag sits in that gutter too.
> Ready, go sits at the foot of the column, right-aligned at a fixed 240, not across the full width.
> The To-dos tray stays a disclosure at the top of the column (scale-up). A side pane of to-dos beside the day was weighed and not taken: it would make a one-pass morning into list-detail.

## Rulings

- D-USE-7, D-USE-23: the bullet grid at 96 px an hour (variation A, now this frame; archived as `review-day / A: grid, 96/h, rec.`). B (name only, 96), C (grid, 80) and D (name only, 80) not picked: B makes blocks slabs that read as free time and costs a screen per swap; C drops Breakfast to 36 px, under the target; D is the Schedule tab's job (their notes, `../../../boards/use-daily-use/archive-1.md`).
- D-USE-10 the breadcrumb; D-USE-15, 18 the rail +; D-USE-25 the fade; D-USE-39 the wide frame; D-USE-65 the desk's `/today` before go is this frame.

## Widths

Drawn at: 402 and 1440. 1024 to 1439: as 1440, the column capped (D-USE-39, D-USE-65).

## Criteria

| ID                             | When                | Then                                                                                                              | Evidence                    |
| ------------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------- |
| C-USE-review-the-day-success-1 | A usual Monday      | The column at 96 px an hour, Orient at the top, blocks with their bullets, the tray closed, Ready, go at the foot | `captures/success-402.png`  |
| C-USE-review-the-day-success-2 | More items than fit | Fixed cells; "+n more" counts only what does not fit                                                              | `captures/success-1440.png` |
| C-USE-review-the-day-success-3 | Viewed at 1440      | No rail, no tabs; the column capped and centred; Ready, go right-aligned at 240                                   | `captures/success-1440.png` |
