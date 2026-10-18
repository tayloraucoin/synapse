---
id: USE-120
size: small
objective: "MonthGrid fits the width it is given, so Storybook's All story shows its four grids side by side without overlap and the grid holds inside a 362 px column"
slice_type: "a composite's intrinsic width fixed against its container; risks the 44 px day targets shrinking below the canon's floor"
non_negotiables:
  - "Day targets stay at least 44 px where the width allows; below that the grid scales its gaps, not its targets (canon)."
  - "Monday-first weekdays; today ringed in ink, the picked day a filled ink disc (pick-a-day.md)."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
devs_call: "Whether the overflow is the table's min width, the header row or the story's wrapper; the fix that keeps the targets."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/move-to/states/pick-a-day.md"
  - "D-USE-37"
truth_files: "none: the epic's ux/ already describes the drawn form; the build catches up to it"
qa: Q1
reviewers:
  - assay
focus: []
operator_review: false
planned_paths:
  - "packages/ui/src/composed/control/month-grid/"
  - "specs/web/epics/USE-daily-use/tickets/USE-120-month-grid-story-overflow/evidence/"
depends_on: []
out_of_scope:
  - "Give it a day's step and Move to's consequence row (USE-29, USE-69)"
criteria:
  - id: C1
    statement: "Storybook's MonthGrid All story at 900 px shows today, a picked day, past days closed and days marked in four grids that do not overlap"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-120-month-grid-story-overflow/evidence/month-grid-stories.png"
  - id: C2
    statement: "Give it a day at 402 still shows October 2026 with 12 ringed and 15 filled, every weekday column visible"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-120-month-grid-story-overflow/evidence/give-it-a-day-402.png"
  - id: C3
    statement: "@syn/ui and the web app type-check"
    evidence: check
    command: "yarn check-types"
  - id: C4
    statement: "They lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — month-grid-story-overflow

## Build notes

Found by the assay pass (2026-10-18, thread A, USE-29 C3). The All story (`composed-control-monthgrid--all`) lays four grids in `grid-cols-2` with each child `w-[362px]`. Each grid renders about 525 px wide, so neighbours overlap and their numbers collide at 900 and at 1600 px. The single stories and the 402 sheet read clean, because there the grid has the full width. A grid that ignores a 362 px container will overflow the desk's right panel too, at `--sheet-w`.

- **Approach:** find what sets the grid's width past its container (`table-fixed w-full` cells, `max-w-(--row-min)` buttons, the header) and make it fit. Recapture the All story and Give it a day.
- **Decisions that apply:** D-USE-37: "Pick a day approved: a month, days already set marked quietly, the consequence line."
- **Interfaces:** none.
- **Per path:** `month-grid/` the grid and, if it is only the story, its stories file.
- **Gotchas:** the story's `w-[362px]` is a raw value; a fix to the story alone should use a token width.
- **Model:** Sonnet 5.5 at medium; a smaller model restyles past the frame or drops the existing behaviour.
