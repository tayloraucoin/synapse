---
target: specs/web/ux/set-my-days/set-my-days/states/the-day.md
status: approved
promoted:
boards:
  - name: "set-my-days / this week, the day (A) / 402 / light"
    page: "USE — set up"
    at: [2892, 0]
    note: "Note · name only, 96"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/the-day-402.png
  - name: "set-my-days / this week, Monday open / 1024 / light"
    page: "USE — set up"
    at: [3856, 2520]
    note: "Note · set-my-days / this week, Monday open / 1024"
    capture: specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/the-day-1024.png
rulings: [D-USE-39, D-USE-49, D-USE-79, D-USE-83, D-USE-109, D-USE-110]
---

# Set my days — this week, the day (A)

A dated day opened from the week: Monday 12 October, Sunday evening at 21:10. The surface's building state, with blocks at their true times. `?state=the-day`.

## What shows, top to bottom

### 402

- Status bar 21:10. `Breadcrumb` [PROPOSED] "‹ Week" over "Monday, 12 October"; "✓ Saved". No segmented control (the which-week switch lives on the week only).
- `WeekdayChips`, dated: "M 12" ink with a light dot, then "T 13" … "S 18", each with a dot (F 16 and S 17 not set: the frame draws dots on all seven [ASSUMPTION: a not-set date has no dot, as Usual week]).
- The bounds row alone: "Up at 7:00", "Lights out 22:30", the ··· at the trailing edge. A hairline.
- The column from 7, no now-line (it is not today):
  - Orient's ink line with the lock, "Orient · 5 min".
  - **Wellness** 7:05 to 8:00 (leaf), the bullet grid: "Pee and weigh", "Water", "Start the cold bath", "+2 more".
  - **Training** 8:00 to 8:57 (clay): "– Drive to the YMCA", "• Workout: gym", "– Drive home" (drives as italic transitions with a dash).
  - **Breakfast** 9:00 to 9:30, a dashed meal band with a fork and knife.
  - **Work** 9:30 to 12:00 (sky), its tiers, each with a coloured 8 px square: "Primary" (leaf) "[Write the sync spec] · ENG-123", "[Review the Paper handoff]"; "Secondary" (amber) "[Fix the retry backoff] · ENG-140"; "Stretch" (drawn sky) "[Tidy the Linear backlog]".
  - **Lunch** 12:00 to 13:00, a dashed meal band; **Work** 13:00 to 15:00 below the fold.
- The + bottom right.

### 1024

- **Rail** (220): "Synapse", then Now, Schedule, Review, none current (Set my days opens from the avatar menu); the footer "T Taylor" opens the avatar menu.
- **Week pane** (320, fixed): "‹ Now" over "Set my days", the segmented control ("This week"), the stepper "‹ 12 to 18 Oct ›", then the seven rows of [`the-week.md`](the-week.md), strips scaled to the pane. "Mon 12" is selected: the muted fill and an ink edge at the leading side.
- **Day pane** (flexible): "Monday, 12 October" as the title (no chips, no "Week" crumb), the bounds row with the ···, the column as at 402 at the pane's width (blocks 404 wide), Work 13:00 to 15:00 in view, the + at the pane's foot. No `SaveStatus` drawn [ASSUMPTION: it sits in the day pane's header].

## What the person can do

- Chips: move sideways a day; "‹ Week": back to the week. At 1024 a row selects the day.
- A block: its Block view in editing; Work opens on its four tiers with an add row each ([`../../../day/block-view/states/work-tiers.md`](../../../day/block-view/states/work-tiers.md)). An item: the item sheet ([`../../../day/item-sheet/index.md`](../../../day/item-sheet/index.md)).
- Bounds, the ··· ([`day-menu.md`](day-menu.md)), the + ([`plus-menu.md`](plus-menu.md)), a tap on the rail ([`tap-a-time.md`](tap-a-time.md)). A long press then drag moves a block in time (N2); others don't move ([`overlap.md`](overlap.md)).

## Words

"Week" · "Monday, 12 October" · tier names · "Orient · 5 min".

## The notes on the boards

**"set-my-days / this week, the day (A) / 402 / light"**, "Note · name only, 96" @ x 2892, y 930:

> The day (A), This week
>
> Opened from the week: "Week" on the left, the day as the title, chips with dates to move sideways. The which-week switch lives on the week only. The work block shows its tiers, a coloured square each. Sunday evening isn't today, so no now-line here; today's column gets one.
>
> Life yellow, as Taylor set (raw values until a token exists; clashes to the colours thread). To-dos moss, Vesper's pick.

**"set-my-days / this week, Monday open / 1024 / light"**, "Note · set-my-days / this week, Monday open / 1024" @ x 3856, y 3450:

> Wide · set-my-days / this week, Monday open / 1024 (D-USE-39) · what it settles for dev
>
> [PROPOSED] List-detail from a second break, --breakpoint-split 1024 (a new token, set by the panes' minimum widths: rail 220 + week 320 + day 360 + gutter and margins 72 = 972, rounded up). Below 1024, including 768 to 1023, Set my days keeps the phone's push: the week first, then the day with "Week" as the way back.
> At 1024 and above, the week list is a fixed 320 pane and the day is the flexible pane beside it (never two fixed panes). The pane count is read from the viewport; everything inside a pane uses container queries, so the day pane is the same component as the phone's day.
> A day is always selected, so the detail pane is never empty: today, or from Sunday evening the week's first day. The selected row takes the muted fill and an ink edge (not colour alone). In the detail pane the WeekdayChips and the "Week" breadcrumb drop, because the list beside it does their job; Up at, Lights out and ··· stay.
> Day strips scale with the pane, keeping each block's share of the day. The + sits at the day pane's foot, not the window's. The rail shows here with nothing current, since Set my days opens from the avatar menu. Usual week works the same way.

## Rulings

- Open-3 round 2: B then A, dated chips, "Week" as the way back under D-USE-49 (the lock).
- D-USE-39 (3), D-USE-83: list-detail from `--breakpoint-split: 1024px`, which goes into `preset.css` with the build; the push below it, 768 to 1023 included. Its [PROPOSED] is settled.
- D-USE-79: Stretch is slate; the frame's Stretch square is drawn sky (`category-sky-dot`) and builds as slate. Life yellow, To-dos moss.
- Superseded, not carried as a state: **"set-my-days / A: week chips, Usual week / 402 / light"** (Archive, x 0, y 11340), ruled by D-USE-49 (the lock; open-3 round 2: the week (B) then the day (A)). It drew Usual week's Monday on the chips, its Work block reading "The time is kept every week." and "Work goes in on This week." (carried as the usual-week Work block's lines). Its note, "Note · grid, 80" @ x 0, y 12270:

  > A · week chips first (recommended)
  >
  > N2's layout: Usual week or This week, the seven chips (a dot marks a day that's set), then the day on the 96 px column. Recommended: Tuesday from Monday is two taps here, and the column is never more than one tap away. Usual week carries times, not work. FAB per N2 [PROPOSED].

## Widths

Drawn at: 402 and 1024. 768 to 1023: the 402 push (D-USE-83). Every other state scales into the day pane.

## Criteria

| ID                          | When                    | Then                                                                                          | Evidence                    |
| --------------------------- | ----------------------- | --------------------------------------------------------------------------------------------- | --------------------------- |
| C-USE-set-my-days-the-day-1 | A This week day opens   | "‹ Week", the dated title, dated chips, no which-week switch                                  | `captures/the-day-402.png`  |
| C-USE-set-my-days-the-day-2 | A Work block with items | Its tiers, each with a coloured square and its name in words                                  | `captures/the-day-402.png`  |
| C-USE-set-my-days-the-day-3 | The day is not today    | No now-line                                                                                   | `captures/the-day-402.png`  |
| C-USE-set-my-days-the-day-4 | Viewport 1024 or wider  | Rail, 320 week pane, flexible day pane; a day always selected; no chips or "Week" in the pane | `captures/the-day-1024.png` |
| C-USE-set-my-days-the-day-5 | Viewport 768 to 1023    | The phone's push                                                                              | test                        |
