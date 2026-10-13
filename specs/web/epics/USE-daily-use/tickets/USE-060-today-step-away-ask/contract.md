---
id: "USE-60"
size: small
objective: "Step away shows only while a work timer runs and pauses every running one at once under one tag, the stepped-away bar waits with Resume all, Start on a second item asks where the running one goes (Firing by default, or Paused; Cancel writes nothing), and Done on a session closes today's share with the next session named and Undo"
slice_type: "three small flows on the work loop; risks Resume all resuming a card paused by its own Pause, firing stopping on Step away, Cancel writing an event, and a session's Done marking the task or the Linear issue done"
non_negotiables:
  - "Step away writes one paused per running slot under one step_away_id; Resume all resumes exactly those (C-USE-step-away-1, -2; useSlotEvents' stepAway and resumeAll)."
  - "Firing keeps counting through a step away; Step away is hidden while no work timer runs (C-USE-step-away-3)."
  - "Cancel on the ask writes no event (C-USE-start-while-one-runs-2); Firing is selected when it opens."
  - "A session's Done is the slot's done and never the task's; nothing goes to Linear (C-USE-sessions-1)."
  - "A step away past the block's end asks nothing on return; the bar waits (D-USE-62)."
  - "Only @syn/ui components and preset tokens; the ask is ResponsiveSheet below 768 and a Dialog at the desk."
devs_call: "File split; the ask's component (one ResponsiveSheet-or-Dialog wrapper or two); the toast's time (the house Toaster's)."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/step-away.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/running.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/stepped-away.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/start-while-one-runs.md"
  - "specs/web/epics/USE-daily-use/ux/work/today/states/done-for-today.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/sessions.md"
  - "C-USE-step-away-1"
  - "C-USE-step-away-2"
  - "C-USE-step-away-3"
  - "C-USE-today-running-2"
  - "C-USE-today-stepped-away-1"
  - "C-USE-today-stepped-away-2"
  - "C-USE-start-while-one-runs-1"
  - "C-USE-start-while-one-runs-2"
  - "C-USE-today-done-for-today-1"
  - "C-USE-sessions-1"
  - "D-USE-43"
  - "D-USE-46"
  - "D-USE-52"
  - "D-USE-57"
waiver: "Step away's flow, with Start while one runs and a session's Done folded in: three small overlays on the same running card, each drawn on Today (stepped-away, done-for-today) or its own interaction file."
truth_files: "none: promotion carries work/today/ and interactions/"
qa: Q1
reviewers:
  - assay
focus:
  - "stepped away at 1728 and 402, the ask at 402 and the desk Dialog, done for today at 402 (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/work/"
  - "apps/web/lib/data/use-today-work.ts"
  - "apps/web/lib/data/step-away.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-060-today-step-away-ask/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-59"
out_of_scope:
  - "Several items running outside a Work block: the Now thread's several-running ticket"
  - "A tier change on one session (This session or All sessions): USE-67"
  - "Start in the Item sheet and the work menu: they call this ticket's start, from USE-67 and USE-70"
criteria:
  - id: C1
    statement: "Through the fixture server, Step away with two running slots and one held by its own Pause tags two paused events with one step_away_id; Resume all resumes those two only; a firing slot's firing time grows across it"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Start on a second item with Firing writes prompt_sent for the running one and started for the new one; with Paused, paused then started; Cancel writes nothing"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "A session's Done writes done for that slot only: the work item's doneAt stays null, the next session is named by nextSession, and Undo writes undone"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "At 1728 and 402 stepped away shows the bar (\"Stepped away at 10:42\", \"Work time held · firing keeps counting\", Resume all), no Step away button, the held card with WORK TIME · PAUSED and its edge on the hairline, and firing still counting"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-060-today-step-away-ask/evidence/stepped-away.png"
  - id: C5
    statement: "At 402 the ask reads \"Start <title>\", \"One item is in hand at a time. <title> is running; it moves to:\", Firing (selected) and Paused with their lines, Cancel and Start; at 1440 the same in a centred Dialog"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-060-today-step-away-ask/evidence/start-while-one-runs.png"
  - id: C6
    statement: "At 402 a session's Done shows \"Done for today · took 2 h 05 · next session Wed 14\" on the row and the toast \"Done for today. Session 2 is Wed 14.\" with Undo"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-060-today-step-away-ask/evidence/done-for-today-402.png"
  - id: C7
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C8
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — today-step-away-ask

## Build notes

Wave 2, after USE-59. Match `ux/work/today/captures/stepped-away-1728.png`, `stepped-away-402.png` and `done-for-today-402.png`; the ask has no capture of its own beyond the interaction file's frame (`interactions/start-while-one-runs.md`).

- **Decisions that apply:**
  - D-USE-46: Step away pauses every running work timer; firing keeps counting; Resume all resumes exactly what Step away paused; a card's own Pause is not tagged. Resume on the one held card resumes it, and the bar clears when nothing else is held. Prompt sent and Done still work while stepped away.
  - D-USE-52: on the phone the Step away pill sits beside the block header's ···, and the bar sits under the header; at the desk the button is in the header and the bar under the title, above the band.
  - D-USE-43 and the ask: "Start <title>"; "One item is in hand at a time. <title> is running; it moves to:"; "Firing", "Its prompt is out; firing time starts now"; "Paused", "Work time held; Resume from its row"; "Cancel", "Start". Not asked when the other is paused or held. Desk: a Dialog, Enter for Start, Esc for Cancel (D-USE-65).
  - D-USE-57, D-USE-65: a session's Done closes today's share only, names the next session, offers Undo; the last session's Done does not mark the task done.
  - Announced (polite): "Stepped away at 10:42", "Work time resumed".
  - Access: the ask's radios are one group named "Where <title> goes"; focus moves to the selected radio; Esc or Cancel returns focus to the Start that opened it.
- **Interfaces:** `StepAwayBar`, `StartWhileOneRuns` in `components/work/`. `useTodayWork().start(slotId)` checks the derived clock and opens the ask when another work slot runs; `doneForToday(slotId)`.
- **Per path:** `step-away.test.ts` holds C1 to C3, one `describe` per criterion. Scenarios `today-stepped-away`, `today-ask`, `today-done-for-today`.
- **Gotchas:**
  - The stepped-away bar's time is the paused events' shared `at`, from the derived clock, never a stored value.
  - Done for today on the phone sits on the row's meta line; at the desk the Done record's place on the right [ASSUMPTION, as the state file].
- **Model:** Opus 5.5 at medium. A smaller model resumes every paused card, stops firing on Step away, or marks the task done on a session's Done.
