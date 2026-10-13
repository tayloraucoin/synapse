---
target: specs/web/ux/day/schedule/states/during-go.md
status: approved
promoted:
boards:
  - name: "schedule / during go, 10:20 / 402 / light"
    page: "USE — daily use"
    at: [0, 20280]
    note: "Frame @ x 0, y 21210"
    capture: specs/web/epics/USE-daily-use/ux/day/schedule/captures/during-go-402.png
rulings: [D-USE-23, D-USE-26, D-USE-30, D-USE-39, D-USE-55, D-USE-77]
---

# Schedule — during go

Monday at 10:20, the Work block under way. The surface is [`../index.md`](../index.md). `?state=during-go`. The base state; the fixture for every other Schedule state.

## What shows, top to bottom

**Phone (402):**

- Status bar 10:20.
- **Title:** "Monday, 12 October" (`--text-title`, semibold, `--tracking-title`), 20 px sides.
- **To-dos tray**, closed, 44 px between two hairlines: "To-dos" (label, semibold), "Call the mechanic…" (label, muted, grows), a 12 px chevron down.
- **The day column**, clipped under the tray, scrolled so 7:00 sits at the top:
  - Hour labels "7" to "13" (caption, muted) at x 20, each with a hairline from x 56 to 20 px from the right; 96 px an hour.
  - **Wellness** 7:05 to 8:00: leaf (`--color-category-leaf-chip` fill, 3 px `--color-category-leaf-dot` rule), faded to 45 % (done). Bullets in two 145 px cells: "Pee and weigh", "Water", "Start the cold bath" (6 px leaf dots), "+2 more" (label, medium, muted).
  - **Training** 8:00 to 8:57: clay, faded to 45 %. "Drive to the YMCA" and "Drive home" as transitions (a 6 × 1.5 px muted dash, italic, muted), "Workout: gym" with a clay dot.
  - **Breakfast** 9:00 to 9:30: a 44 px dashed band (`--color-border`), the meal glyph, "Breakfast" (label, medium), "9:00 to 9:30" (muted), faded to 45 %.
  - **Work** 9:30 to 12:00, the block under way: sky fill and 3 px sky rule, with a hairline `--color-now` (verdigris) edge on its top, right and bottom; not faded. "Work" and "9:30 to 12:00"; then by tier, captions "Primary" and "Secondary" (caption, medium, muted) over sky-dot bullets: "[Primary item, linked] · ENG-123", "[Primary item]"; "[Secondary item]".
  - **Lunch** 12:00 to 13:00: a dashed band with the meal glyph, not faded.
  - **Work** 13:00 to 15:00: sky, header only (it runs past the fold).
  - **The `NowLine`** at 10:20: from x 14, a 44 × 20 pill in `--color-now` reading "10:20" (11 px, semibold, `--color-primary-foreground`) on the rail, then a 1.5 px `--color-now` line at 55 % across the content.
- **`BottomNav`:** Now, Schedule (selected: ink outline, semibold), Review.

**Desk (1024 and up, not drawn):** the same column centred at `--content-text` beside the rail, the now tag in the 56 px gutter (D-USE-39; [`../index.md`](../index.md) › Platforms).

## What the person can do

- Tap a block: its Block view, "‹ Today › Work" (`../../block-view/states/current.md` for the block under way, with the now line inside it).
- Tap the tray: it opens (`../../todos/`).
- Scroll the day; re-tap the Schedule tab to come back to now.
- The tabs.

## Words

"Monday, 12 October" · "To-dos" · "Call the mechanic…" · the block names and spans ("7:05 to 8:00") · "Primary", "Secondary" · "+2 more" · "10:20" · "Now", "Schedule", "Review". The work items are `[placeholder]` titles.

## The notes on the boards

**Frame @ x 0, y 21210** — schedule / during go, 10:20 / 402 / light

> schedule, during go
>
> The Schedule tab: the whole day at 96 px an hour, done blocks faded, the now-line at 10:20 (tag in the rail, faint over content), and a hairline verdigris edge on the active block, the one "this moment" mark. Tapping a block opens Block view (step 3).

## Rulings

- D-USE-77: step 8's [PROPOSED] and [ASSUMPTION] marks in this file stand as drawn (Decided (D-USE-77)).
- D-USE-23: 96 px an hour with the bullet grid, as Review the day.
- D-USE-30: a now-line across every timed day view, tag in the rail, faint over content.
- D-USE-26: the tray closed by default.
- D-USE-39, D-USE-55: no wide frame; at the desk Schedule is a rail item, and the Time lens's today.
- N4 says "checked items faded"; the frame fades whole done blocks and draws the item marks in [`checks-and-running.md`](checks-and-running.md). Both hold: a done block fades, a checked item reads as a check.

## Widths

Drawn at 402. 768 to 1023 and the desk: [`../index.md`](../index.md) › Platforms.

## Criteria

| ID                         | When                          | Then                                                                      | Evidence                     |
| -------------------------- | ----------------------------- | ------------------------------------------------------------------------- | ---------------------------- |
| C-USE-schedule-during-go-1 | After Ready, go, Schedule tab | The day at 96 px an hour; done blocks at 45 %; the now line at the minute | `captures/during-go-402.png` |
| C-USE-schedule-during-go-2 | A block is under way          | It alone has the hairline verdigris edge                                  | capture                      |
| C-USE-schedule-during-go-3 | The minute changes            | The now line and its tag move; nothing else changes                       | test                         |
