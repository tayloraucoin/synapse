---
id: "USE-43"
size: small
objective: "Ready, go cross-fades to the welcome at /today/ready: the date, \"The day is set.\", Orient's \"Today, as I see it\" line when written, the day as one named bar with the now-tick, First and its next blocks, and Start <block>, which opens Now; its first-ever, late-wake, checklist-day and offline forms; a reopen shows it again until Start"
slice_type: "a focused hand-off screen with motion on fixtures; risks a timer that moves on by itself, a bar whose blocks are colour alone, \"late\" or a count in the words, motion under reduced motion, and the welcome showing again after Start"
non_negotiables:
  - "Nothing moves on by itself: no timer, no auto-advance; only Start leaves (D-USE-71)."
  - "Every segment on the bar is named or initialled; the now-tick is the only verdigris."
  - "Never \"late\", \"missed\", a count or the second person; the payoff is in the words and the type, never a score (A-13)."
  - "Reduced motion: opacity only; the cross-fade uses the View Transitions API and --dur-sheet, no new dependency."
  - "Focused at every width: no tabs, no rail, no avatar; back is \"‹ Review the day\", with nothing undone."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
devs_call: "File split under today/ready/_components; the stagger's step (one --dur-state per section); DayBar's maths; where Start's per-device flag is set (USE-12's startedOnDevice)."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/ready-go/index.md"
  - "C-USE-ready-go-1"
  - "C-USE-ready-go-2"
  - "C-USE-ready-go-3"
  - "C-USE-ready-go-4"
  - "C-USE-ready-go-5"
  - "D-USE-71"
  - "D-USE-25"
  - "D-USE-39"
truth_files: "none: promotion carries interactions/ready-go/"
qa: Q1
reviewers:
  - assay
focus:
  - "welcome, first go ever, late wake, checklist day and offline at 402 against ready-go/captures/: the bar named, no timer, no late (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/ready/"
  - "apps/web/app/(shell)/_components/nav-items.ts"
  - "apps/web/app/(shell)/today/review/"
  - "apps/web/components/planner/day-bar/"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "packages/utils/src/planner/welcome.ts"
  - "packages/utils/src/planner/welcome.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-043-ready-go-welcome/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-12"
  - "USE-31"
  - "USE-35"
out_of_scope:
  - "Now after Start, its quiet \"Starts at 7:05. Anything can be done early.\" line and the reopened-later frame: Now's tickets (USE-16 and its siblings), which draw Now"
  - "Persisting the lock offline across a reload: the offline-persistence ticket (wave 3)"
  - "Haptics, a sweep, a sound, the first-week variant: the dev note's options, not drawn"
criteria:
  - id: C1
    statement: "The welcome shows ‹ Review the day, \"MONDAY, 12 OCTOBER\", \"The day is set.\", Today, as I see it over Orient's line on a rule, The day as one bar 7:00 to 17:00 with each block named or initialled and the now-tick at 7:02, First with Wellness then Training then Breakfast, and Start Wellness with \"Planned for 7:05. Starting early is fine.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-043-ready-go-welcome/evidence/welcome-402.png"
  - id: C2
    statement: "The first Ready, go ever shows \"From here, at the bottom\" with Now, Schedule and Review in place of Orient's line, and First lists two rows"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-043-ready-go-welcome/evidence/first-go-ever-402.png"
  - id: C3
    statement: "At 8:22 after a late wake, Wellness is faded on the bar, the heading reads Now with \"Training under way, until 8:57\", and the button reads Start Training with \"Planned from 8:15. Pick up where it is.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-043-ready-go-welcome/evidence/late-wake-402.png"
  - id: C4
    statement: "On a checklist day the bar holds \"Sunday's list\" all day and Lunch with Sam at 13:00, and the button reads Open the list"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-043-ready-go-welcome/evidence/checklist-day-402.png"
  - id: C5
    statement: "Offline, a StatusLine reads \"Offline. The day is saved on this phone.\" above the unchanged welcome"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-043-ready-go-welcome/evidence/offline-402.png"
  - id: C6
    statement: "Ready, go cross-fades to the welcome and it waits; Start opens /today; ‹ Review the day returns with nothing undone; a reopen before Start shows the welcome, after Start goes to /today; under reduced motion nothing moves but opacity"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-043-ready-go-welcome/evidence/flow.txt"
  - id: C7
    statement: "welcomeView picks the heading (First, or Now when a block is under way), up to three next blocks, the button's block and caption, and whether the Orient section, the first-ever teaching or the list's wording shows"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "The web app and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C9
    statement: "They lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — ready-go-welcome

## Build notes

After USE-12 (the entry tree, `todayReadyRoute`, Orient's line), USE-31 (Ready, go's write) and USE-35 (`layoutFromWake`). Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use", row "Ready, go hand-off" (y 8940). Captures to match: `ux/interactions/ready-go/captures/{welcome,first-go-ever,late-wake,checklist-day,offline}-402.png`. Take ours at `/today/ready?state=ready-<name>`.

- **Decisions that apply:**
  - D-USE-71: round 2 as drawn. A focused welcome between Review the day and Now, reached by a cross-fade, with one button that starts the first block. It plays once a day, on Ready, go only. The Orient line shows only when it has words. First go ever replaces that line with "From here, at the bottom" and is shown once ever. It works the same offline. Before the first block's time, the button still starts it. Words are [placeholder] until Gloss.
  - D-USE-88: there is no Help row, so the teaching never returns.
  - D-USE-74: Start at the desk lands on `/today`.
  - D-USE-39: focused at every width. At 1024 and up, one column capped at `--content-text`, the button right-aligned at 240.
  - D-USE-25: the button floats on a fade.
  - welcome.md has the sizes. The title is Newsreader at `--text-review-title`. Orient's line is italic serif on a left rule. First's rows are in Block complete's style: a filled dot for the first, hollow for the rest.
  - Access: focus lands on the title; Ready, go from the keyboard lands with no motion (C-P11).
- **Interfaces:**
  - `welcomeView({ occurrences, layout, now, linesToday, firstEver, isChecklistDay })` in `@syn/utils` planner, pure.
  - `DayBar { segments: { label; initial; kindColor; faded }[]; nowAt; from; to }` in `components/planner/day-bar/`, props only.
  - `/today/ready` joins the focused list in `nav-items.ts`. Start sets `startedOnDevice` and pushes `/today`.
  - Review's Ready, go navigates inside `document.startViewTransition` when it exists, and plainly otherwise.
  - Scenarios: `ready-welcome` (now 7:02), `ready-first-go-ever`, `ready-late-wake` (8:22), `ready-checklist-day` and `ready-offline`.
- **Gotchas:**
  - First go ever is derived: no earlier day record has `readyAt`. Nothing is stored for it.
  - The sections rise 8 px one after another with opacity. Under reduced motion it's opacity only.
  - `flow.txt` is the browser pane's record of each step, including the URL after each.
- **Model:** Opus 5.5 at medium. A smaller model adds a timer or confetti, colours the bar without names, or shows the welcome again after Start.
