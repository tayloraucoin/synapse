---
id: "USE-23"
size: medium
objective: 'Start on Now''s lifted card turns it into the running card: counting down from the plan with "of <n> min" beside it, then "m:ss over" and "n min over" coloured by Done''s percent bands with the word always there, paused holding and pulsing with Resume, and a timed Done recording start minus paused time on the row, banded, with no Change, all from deriveClock through one tick'
slice_type: 'a live timer on the real clock derivation; risks a figure ticking from component state instead of events, a band set by "a minute over" instead of percent, colour standing alone, a pulse under reduced motion, one interval per row, and a timed Done offering Change'
non_negotiables:
  - "Every figure is clockAt over deriveClock's slot clock (USE-5) at the tick's now; nothing counts in component state, and a reopened app reads start minus paused spans."
  - "One tick per screen: useWorkClock in @syn/hooks drives every figure from one interval and stops while the page is hidden."
  - 'The band is overBand''s: up to 10 % over the plan ink, to 25 % warning, past 25 % danger, edges whole minutes and at least 1 min; under the plan always ink. "over" or "of <plan>" always sits beside the colour.'
  - "No sound, no vibration; the border, the dot and the buttons never change with the band."
  - "Paused pulses 100 % to 40 % over 2 s, the only motion on Now; under reduced motion it holds at 60 %."
  - 'A timed Done has no Change; its row reads "<n> min" in figure weight, "<n> min of <plan>" from warning up.'
  - "Composes USE-10's countdown face and @syn/ui's TimerDisplay; only preset tokens."
devs_call: "File split; the tick's interval (1 s) and how it re-syncs on visibility; where warning-text is added if USE-10 has not (preset.css with a tokens.md line, oklch 62 % 0.13 85, 58 % on small text)."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/running/index.md"
  - "specs/web/epics/USE-daily-use/ux/day/running/states/counting-down.md"
  - "specs/web/epics/USE-daily-use/ux/day/running/states/over-under-a-minute.md"
  - "specs/web/epics/USE-daily-use/ux/day/running/states/over-a-minute-or-more.md"
  - "specs/web/epics/USE-daily-use/ux/day/running/states/paused.md"
  - "specs/web/epics/USE-daily-use/ux/day/running/states/timed-done.md"
  - "specs/web/epics/USE-daily-use/ux/day/running/states/timed-over-warning.md"
  - "C-USE-running-counting-down-1"
  - "C-USE-running-counting-down-2"
  - "C-USE-running-over-under-a-minute-1"
  - "C-USE-running-over-under-a-minute-2"
  - "C-USE-running-over-a-minute-or-more-1"
  - "C-USE-running-over-a-minute-or-more-2"
  - "C-USE-running-paused-1"
  - "C-USE-running-paused-3"
  - "C-USE-running-timed-done-1"
  - "C-USE-running-timed-over-warning-1"
  - "C-USE-running-timed-over-warning-2"
waiver: "One surface, Running: its index and the six states of one card and its Done."
truth_files: "none: an epic proposal; promotion carries day/running/"
qa: Q1
reviewers:
  - assay
focus:
  - "the over bands and paused at 402: the word beside every colour, the card's frame unchanged (assay)"
operator_review: false
planned_paths:
  - "packages/hooks/src/use-work-clock.ts"
  - "packages/hooks/src/index.ts"
  - "packages/utils/src/planner/over-band.ts"
  - "packages/utils/src/planner/over-band.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "packages/config/tailwind/preset.css"
  - "apps/web/docs/design/tokens.md"
  - "apps/web/components/planner/"
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-023-running-card/evidence/"
depends_on:
  - "USE-4"
  - "USE-5"
  - "USE-7"
  - "USE-10"
  - "USE-16"
out_of_scope:
  - "Several running, a Running row lifted, Done on a Running row: USE-24"
  - "A work item's clock (WORK TIME, firing, Step away): phone and desk Today's tickets"
  - 'The plain Done''s "Took · Change" and the time-taken sheet: USE-16'
  - "Stopping timers at the day's close: deriveClock's window (USE-5) already does it"
criteria:
  - id: C1
    statement: 'Started on Meditate at 7:14, at 7:16 the card shows its icon tile, the verdigris dot, "Meditate", "Started 7:14", "7:42" with "of 10 min" beside it, Pause and Done; nothing else on Now moved'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-023-running-card/evidence/counting-down-402.png"
  - id: C2
    statement: 'Past the plan by under a minute the figure reads "m:ss over" with "of 10 min", in the colour its band gives, the frame unchanged'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-023-running-card/evidence/over-under-a-minute-402.png"
  - id: C3
    statement: 'At 13 minutes on a 10-minute item the figure reads "3 min over" in destructive-text with "of 10 min" beside it'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-023-running-card/evidence/over-a-minute-or-more-402.png"
  - id: C4
    statement: 'Paused: "Paused · started 7:14", the figure "4:10" muted mid-pulse, Resume in Pause''s place, Done unchanged'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-023-running-card/evidence/paused-402.png"
  - id: C5
    statement: 'After a timed Done Meditate is checked in place with "12 min of 10" in warning, no Change, and Cold bath lifted with "10 min · 7:26"'
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-023-running-card/evidence/timed-over-warning-402.png"
  - id: C6
    statement: 'overBand gives, for 30 min, ink at 33, warning at 34 and 37, danger at 38 and 41; for 10 min, ink at 9 and 11, warning at 12, danger at 13; for 45 min, ink at 46; formatClock gives "7:42", "0:40 over" and "3 min over"'
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "Start, Pause at 4:10 left, Resume, then Done through the fixture server records tookMin as work time without the paused span, writes started, paused, resumed and done events, and a fresh read from the events gives the same figure"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "The paused figure's pulse sits under prefers-reduced-motion: no-preference, and the reduced rule holds it at 60 %"
    evidence: test
    command: "yarn test"
  - id: C9
    statement: "The web app, @syn/hooks and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C10
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — running-card

## Build notes

After USE-16. Captures to match: `ux/day/running/captures/{counting-down,over-under-a-minute,over-a-minute-or-more,paused,timed-done,timed-over-warning}-402.png`; Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — daily use", row "Running and Done" (y 13980). Each at `/today?state=<name>`; `timed-done` is reachable and checked by assay, not captured.

- **Decisions that apply:**
  - N4 and D-USE-72: the card counts down from the plan, "of <n> min" beside the figure on the baseline (the board stands), `aria-live="off"`; Pause and Done. The figure keeps counting when the app is left: it is time-based.
  - D-USE-29 and D-USE-72: Running uses Done's percent bands (dev note `over-by-how-much.md`); under a minute over reads "m:ss over", from a minute "n min over". Danger reuses `destructive-text`; `warning-text` is [PROPOSED] until the colours look (D-USE-38). These bend "nothing red on the execution tabs", named at Taylor's call.
  - D-USE-72: paused holds the number and pulses, "Paused · started <time>", Resume in Pause's place.
  - D-USE-13: a timed Done has no Change. N4: the row shows the time taken in `figure`.
  - D-USE-27: starting another item never pauses this one (USE-24 draws several).
- **Interfaces:**
  - `@syn/utils` `planner/over-band.ts`: `overBand(planMin, elapsedMin): "ink" | "warning" | "danger"` on whole minutes; `formatClock(planMs, workMs): { text; over: boolean }`.
  - `@syn/hooks` `useWorkClock(): Date`: one shared interval per page, paused while `document.hidden`, re-read on visibility. Placement (`technical/placement.md`) puts it here; no other drafted ticket builds it.
  - `components/planner/RunningCard { item; slotClock; now; onPause; onResume; onDone }`; `useSlotEvents` (USE-7) writes `started`, `paused`, `resumed`, `done`; Done also writes the slot's `doneAt` and `tookMin` from `clockAt`.
  - Scenarios: `counting-down`, `over-under-a-minute`, `over-a-minute-or-more`, `paused`, `timed-done`, `timed-over-warning`, each an event list on Meditate's slot.
- **Per path:** `over-band.test.ts` holds C6; `lib/data/running.test.ts` holds C7 against the fixture server; `lib/data/running-motion.test.ts` reads the card's CSS module or class strings for C8.
- **Gotchas:**
  - The drawn "0:40 over" frame is in warning, but by percent a 10-minute item at 10:40 reads ink; build the rule, not the frame.
  - `tookMin` rounds work time to the nearest minute, at least 1.
  - A scenario's `now` is fixed; the fixture clock runs from it, so a capture shows the drawn figure.
- **Model:** Opus 5.5 at medium. A smaller model ticks a counter in state, colours by "over a minute", or gives each row its own interval.
