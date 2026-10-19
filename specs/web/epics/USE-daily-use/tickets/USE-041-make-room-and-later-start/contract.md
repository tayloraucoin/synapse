---
id: "USE-41"
size: small
objective: "Finding minutes has its two sheets on fixtures: an add with no room lands by itself with an Undo Toaster when the engine can guess, else Make room opens with its sources and multi-select; a wake 15 minutes or more past Up at opens A later start once over Review the day, with Cut some and Slide the day back, each applying the engine's plan for today with Undo"
slice_type: "two sheets over one engine; risks a sheet that does its own arithmetic, travel made tickable, Decide for me wired to anything, the later-start sheet opening twice, a slide or cut that reaches the usual week, and words that say late"
non_negotiables:
  - "Every figure on both sheets is the engine's (USE-35) summary; the sheets compute nothing."
  - "Travel and set-time rows are shown and disabled, never ticked (D-USE-11)."
  - "Decide for me is drawn and disabled; nothing behind it (D-USE-66, record 0001)."
  - "A later start opens on its own once a day, only from 15 minutes past Up at; Not now or × leaves the late frame as drawn and nothing moves."
  - "Every apply is today only, with an Undo Toaster that restores all of it."
  - "No second person (\"Up at 8:10\"), nothing marked missed; only @syn/ui components and preset tokens."
devs_call: "File split under components/planner/room/; how Show later blocks pages (two blocks at a time); the stepper's bounds per row (the engine's give)."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/make-room/index.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/make-room/states/sheet.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/later-start/index.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/later-start/states/cut-some.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/later-start/states/slide.md"
  - "C-USE-make-room-1"
  - "C-USE-make-room-2"
  - "C-USE-make-room-3"
  - "C-USE-make-room-sheet-1"
  - "C-USE-make-room-sheet-2"
  - "C-USE-later-start-1"
  - "C-USE-later-start-2"
  - "C-USE-later-start-3"
  - "C-USE-later-start-cut-some-1"
  - "C-USE-later-start-cut-some-2"
  - "C-USE-later-start-slide-1"
waiver: "One engine, two sheets: make-room/index.md says \"One engine with A later start\", and each interaction's states hold its one drawn sheet"
truth_files: "none: promotion carries interactions/make-room/ and later-start/"
qa: Q1
reviewers:
  - assay
focus:
  - "the Make room sheet, Cut some and Slide at 402 against their captures: disabled travel, the foot lines, Decide for me inert (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/planner/room/"
  - "apps/web/app/(shell)/today/review/"
  - "apps/web/lib/data/use-room.ts"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-041-make-room-and-later-start/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-35"
  - "USE-37"
  - "USE-38"
out_of_scope:
  - "The add sheet that hands an addition to Make room, and Do now on Block complete: their tickets call useRoom().place"
  - "Swap for a shorter one's library: the Item sheet's ticket (this one links to it)"
  - "Sliding with priority and Decide for me: later rounds"
criteria:
  - id: C1
    statement: "Make room shows \"Adding Foam roll, 10 min at 8:45\" over \"Make room for 10 min\", From Training and From other blocks, Workout: gym \"35 min, now 28 min\" with a stepper at 7, Gap before Breakfast \"3 min free\", both drives italic and disabled with \"Travel time stays as it is\", \"10 of 10 min found\", Decide for me disabled and Make room"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-041-make-room-and-later-start/evidence/make-room-402.png"
  - id: C2
    statement: "A later start on Cut some shows \"Up at 8:10 · planned from 7:00\", \"A later start\", \"The morning is 70 min short…\", Wellness and Training with Cut the block, Meditate and Journal struck through, Swap for a shorter one ›, Show later blocks and \"25 of 70 min cut. The rest slides: Breakfast 9:45, Work 10:15.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-041-make-room-and-later-start/evidence/cut-some-402.png"
  - id: C3
    statement: "On Slide the day back each block shows its old start struck through beside the new one, the set-time call stays at 11:00 with Work splitting around it, and the foot names the day's new end"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-041-make-room-and-later-start/evidence/slide-402.png"
  - id: C4
    statement: "Through the fixtures, useRoom().place lands an addition with no sheet and an Undo Toaster when findRoom answers fits or default, and opens Make room when it asks; Make room, Cut these and Slide the day back apply their plans for today only and Undo restores the day"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "The later-start sheet opens by itself on the first Review the day 15 minutes or more past Up at, never on a day on time, never twice that day; Not now and × change nothing"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "It lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — make-room-and-later-start

## Build notes

After the engine (USE-35), the edits ticket (USE-37, for `useDayEdits` and `useUndoToast`) and the late frame (USE-38), which sits under the later-start sheet. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use", row "Review the day". Captures to match: `ux/interactions/make-room/captures/sheet-402.png` and `ux/interactions/later-start/captures/{cut-some,slide}-402.png`. Take ours at `/today/review?state=room-make-room`, `?state=room-later-cut` and `?state=room-later-slide`.

- **Decisions that apply:**
  - D-USE-11: from the block it lands in or from other blocks; a multi-select of the eligible rows, each with the minutes it gives. Travel and pinned appointments are shown and not eligible.
  - D-USE-16: Make room opens only when there is no room. The Phase 1 default (dev note) is gaps first, then the most flexible item in the block, with an Undo toast and no sheet.
  - D-USE-66: Decide for me stays drawn but unwired until AI is in scope. Default: shown disabled.
  - A later start (open-1, drawn) opens once over Review the day at about 15 minutes late. Cut some lists the first two blocks with Show later blocks; ticking items or Cut the block takes them off, and whatever isn't cut slides. Slide keeps every length; set times stay put and blocks split around them. Not now or × leaves the late state as drawn, and the sheet stays reachable from the "Planned before" row.
  - D-USE-39: at the desk both sheets are the right panel at `--sheet-w`.
  - Words are each state's, as listed in its file. "10 of 10 min found" is a length and stays.
- **Interfaces:**
  - `useRoom(dateKey)` returns `{ place(addition), plan, apply, openLaterStart }` over USE-35.
  - `MakeRoomSheet` and `LaterStartSheet` in `components/planner/room/` take the engine's summary and callbacks.
  - The once-a-day flag goes through `useDismissed`, keyed by date. Opening the sheet from the "Planned before" row bypasses it.
- **Gotchas:**
  - The two sheets share the scope line, segment and foot layout. Write those parts once.
  - The late scenarios in USE-38 pin the flag. Ours leave it unset, so the sheet opens.
- **Model:** Opus 5.5 at medium. A smaller model re-does the minutes maths in the sheet, wires Decide for me, or opens the sheet on every visit.
