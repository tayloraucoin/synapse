---
id: "USE-24"
size: small
objective: "In a non-work block several items run at once: the one in focus is the running card, the rest are rows under \"Running\" with a progress ring, their own count, Pause and box; tapping a row lifts it into the card without breaking any count, and Done on a row settles it muted with \"Done · <n> min\", banded, before it returns to its place checked"
slice_type: "several live timers on one screen; risks starting one pausing another, a lift that restarts a count, a row ticking on its own interval, a band shown without its words, and the Running group appearing inside a Work block"
non_negotiables:
  - "Starting an item never pauses another (D-USE-27); tapping a row lifts it and drops the card to a row, and every count carries on from its own events."
  - "One tick drives the card and every row (USE-23's useWorkClock); no row has its own interval."
  - "Rows and settled Dones take overBand's colour with \"over\" or \"of <plan>\" always in the words."
  - "The Running group is a non-work block's only; inside a Work block the group never renders (one in hand, the rest fire: phone Today's)."
  - "A settled row stays a moment (as the Took line, about six seconds), then returns to its place in the block, checked; no Change."
  - "Only @syn/ui components and preset tokens; the ring is a new @syn/ui ProgressRing with a story per state, an exports subpath and a components.md row."
devs_call: "ProgressRing's drawing (SVG arc on a hairline circle); focus and the polite \"<item> in focus\" announcement after a lift; the paused row's pulse reusing the card's rule."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/running/states/several-running.md"
  - "specs/web/epics/USE-daily-use/ux/day/running/states/running-row-focused.md"
  - "specs/web/epics/USE-daily-use/ux/day/running/states/done-on-a-running-row.md"
  - "specs/web/epics/USE-daily-use/ux/day/running/states/done-well-over.md"
  - "C-USE-running-several-running-1"
  - "C-USE-running-several-running-2"
  - "C-USE-running-several-running-3"
  - "C-USE-running-running-row-focused-1"
  - "C-USE-running-done-on-a-running-row-1"
  - "C-USE-running-done-on-a-running-row-2"
  - "C-USE-running-done-on-a-running-row-3"
  - "C-USE-running-done-well-over-1"
  - "C-USE-running-done-well-over-2"
waiver: "One surface, Running: the four states of several timers, which share the Running group."
truth_files: "none: an epic proposal; promotion carries day/running/"
qa: Q1
reviewers:
  - assay
focus:
  - "several running and a row lifted at 402: counts unbroken, words beside every band (assay)"
operator_review: false
planned_paths:
  - "packages/ui/src/composed/display/progress-ring/"
  - "packages/ui/src/index.ts"
  - "packages/ui/package.json"
  - "apps/web/docs/design/components.md"
  - "apps/web/components/planner/"
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-024-several-running/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-16"
  - "USE-23"
out_of_scope:
  - "A Work block's items (firing in place, one in hand): phone and desk Today's tickets"
  - "The desk Block panel where a non-work block's Running group also shows: its ticket, from these parts"
criteria:
  - id: C1
    statement: "Three running at 10:20: the \"Running\" heading, the card \"[Write the sync spec]\" at \"18:20\" of 45 min, and rows \"[Agent: refactor the sync queue]\" \"Running · 12:04 of 30 min\" and \"[Agent: ENG-123 tests]\" \"Running · 4 min over\" in its band, each with ring, Pause and box"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-024-several-running/evidence/several-running-402.png"
  - id: C2
    statement: "The first row tapped: it is the card with \"Started 10:08\" and \"12:04\" of 30 min, and \"[Write the sync spec]\" is a row reading \"Running · 18:20 of 45 min\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-024-several-running/evidence/running-row-focused-402.png"
  - id: C3
    statement: "The box on \"[Agent: ENG-123 tests]\" at 34 of 30 min: no ring, title muted, \"Done · 34 min of 30\" in warning, no Pause, the box filled muted; the card and the other row still running"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-024-several-running/evidence/done-on-a-running-row-402.png"
  - id: C4
    statement: "Done at 41 of 30 min reads \"Done · 41 min of 30\" in destructive-text"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-024-several-running/evidence/done-well-over-402.png"
  - id: C5
    statement: "Starting a second item leaves the first running; lifting a row changes no event and both figures read the same before and after; a row's Pause holds only that slot"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "A settled row leaves the Running group after its moment and reads checked in its place; done lines read ink at 33, warning at 34 and 37, danger at 38 for a 30-minute plan; a Work block's view model has no Running group"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "Storybook shows ProgressRing empty, at a quarter, at three quarters and full"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-024-several-running/evidence/progress-ring-stories.png"
  - id: C8
    statement: "The web app and @syn/ui type-check"
    evidence: check
    command: "yarn check-types"
  - id: C9
    statement: "The web app and @syn/ui lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — several-running

## Build notes

After USE-23. Captures to match: `ux/day/running/captures/{several-running,running-row-focused,done-on-a-running-row,done-well-over}-402.png`; Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — daily use", the Running rows drawn at y 17760 and 19020. The frames are drawn in a Work block with placeholder tiers; the lead's ruling carries them as a non-work block's Running rows, so the scenarios use a Life block holding the drawn [placeholder] titles, plans 45, 30 and 30, and the "Primary" heading and caption are not shipped.

- **Decisions that apply:**
  - D-USE-27: several run at once; the focused one is the card, the rest rows under "Running" with their own count, Pause and box.
  - D-USE-76 and the lead's ruling: these are non-work blocks' Running rows; inside a Work block D-USE-43, D-USE-44 and D-USE-49 replace them.
  - D-USE-72: rows count down like the card; Running uses Done's percent bands; Done on a Running row shows its time a moment, then the row leaves Running.
  - D-USE-29: Done coloured by percent over, "of <plan>" from warning up; under the plan always ink. D-USE-13: no Change on a timed Done.
  - Lifting moves the verdigris dot to the new card; under reduced motion the swap is instant.
  - Words: "Running", "Running · <m:ss> of <n> min", "Running · <n> min over", "Running · 0:40 over", "Started <time>", "Done · <n> min", "Done · <n> min of <plan>". Each row is a button "<item>, running, <count>, lift to the card" [PROPOSED].
- **Interfaces:**
  - `@syn/ui` `ProgressRing { value: number /* 0 to 1 */; size?: 20 }`, presentational, `aria-hidden` (the count is in the words).
  - `useNow` gains `running: { focusedSlotId; rows }` for non-work blocks, from `deriveClock` states; `useRunningFocus()` holds the focused slot on the device.
  - `components/planner/`: `RunningRow`, `RunningGroup`; `RunningCard` (USE-23) unchanged.
  - Scenarios: `several-running`, `running-row-focused`, `done-on-a-running-row`, `done-well-over`.
- **Per path:** tests in `lib/data/several-running.test.ts`: C5 and C6, against the fixture server and `overBand`.
- **Gotchas:**
  - The ring's arc is elapsed over plan, capped at full; past the plan it stays full and the words carry the rest.
  - A settled row's ring slot and Pause slot stay empty so the row does not jump.
- **Model:** Opus 5.5 at medium. A smaller model pauses the card when a row starts, or ticks each row separately.
