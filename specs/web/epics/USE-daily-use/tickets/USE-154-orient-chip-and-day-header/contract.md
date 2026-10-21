---
id: USE-154
size: small
objective: "Orient's label sits on a translucent background chip so no hour line runs through it, and a usual day's header has its own ?state= as the app builds it"
slice_type: "a shared column's look and a fixture; risks the chip hiding the hour line's time or the line breaking on other day columns"
non_negotiables:
  - "One chip in OrientLine, so every day column (Set my days, Review the day, Schedule, the Week's time lens) takes it; no per-surface copy."
  - "Tokens only: bg-background at 88% opacity, rounded-full, the --space-* paddings; no raw colour or size."
  - "The label's words, lock icon and caption tone are unchanged; Orient's accessible name is unchanged."
  - "The day header keeps the app's push: \"‹ Week\" over \"Every Monday\", SaveStatus on the crumb row, no which-week control on a day."
devs_call: "the chip's exact paddings within the --space scale; how the fixture builds the usual Monday"
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/states/usual-day.md"
truth_files: "none: the epic's own ux/ ledger carries it (set-my-days/set-my-days/states/usual-day.md, D-USE-134); it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "apps/web/components/planner/day-column/day-column.tsx"
  - "apps/web/lib/fixtures/scenarios/set-up.ts"
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/captures/usual-day-402.png"
depends_on: []
out_of_scope:
  - "Suggested items in a new block's Block view (the other design thread)"
  - "Redrawing the older Usual week day boards; the canvas is not edited"
  - "Any change to the day header's code: it already matches D-USE-134"
criteria:
  - id: C1
    statement: "?state=usual-day at 402 shows \"‹ Week\" over \"Every Monday\", Saved on the crumb row, no which-week control, and Orient's label on the chip with no hour line through the words"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-154-orient-chip-and-day-header/evidence/"
  - id: C2
    statement: "Review the day at 402 shows Orient's label on the same chip, the hour line stopping at its edges"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-154-orient-chip-and-day-header/evidence/"
---

# Contract — USE-154 orient-chip-and-day-header

## Build notes

Items 2 and 3 of Taylor's 2026-10-20 notes on Set my days, drawn as `set-my-days / usual Monday, header and Orient chip / 402 / light` ("USE — set up", x 3996, y 14000) and passed by Taylor on 2026-10-20.

- **Approach:** in `OrientLine`, wrap the lock and the caption in one span: `bg-background/88 rounded-full`, about 20 px high with `--space-2` either side, so it paints over the hour hairline. The ink line before it stays 180 px. Add a `usual-day` scenario beside `usual-saturday`: the usual week, Monday (day 0), built from `setUpUsualRecords`, with Saved held as the other captures hold it.
- **Decisions that apply:** D-USE-134: "(1) Every day in Set my days, Usual week or This week, has the app's push header: "‹ Week" back to the week it came from, over the title ("Every Monday" in Usual week, "Monday, 12 October" in This week), with `SaveStatus` at the end of the crumb row. A day has no Usual week | This week control, and "‹ Now" is the week's crumb only. (2) Orient's label ("Orient · 5 min" with its lock) sits on a chip in the background colour at 88%, fully rounded, so no hour line runs through it. The same chip wherever the day column draws Orient."
- **Interfaces:** the `?state=usual-day` key on `/days`.
- **Per path:** `day-column.tsx`: the chip in `OrientLine`. `set-up.ts`: the `usual-day` scenario. The capture: the state file's evidence for C-USE-set-my-days-usual-day-1 and 2.
- **Gotchas:** the hour hairlines are drawn by the axis below Orient, so the chip needs to sit above them in stacking order. A full-opacity background would hide the line completely; 88% is what the board draws. The header code needs nothing: `DayView` already passes `save` and "‹ Week" on every day.
- **Model:** any.
