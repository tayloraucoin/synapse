---
id: USE-139
size: small
objective: "On Set my days' week, an unset day's row reads \"Not set yet\" with \"Set day\" and opens that day, so a first-time week never offers Copy from with nothing built"
slice_type: "a row's action and its words in one list; risks the 1024 week pane and This week's dated rows drifting from the phone's"
non_negotiables:
  - "Match the Paper artboards set-my-days / usual week, nothing built and / usual week, Monday built (402); on-disk decisions (D-USE-*) win over a stale frame and are named."
  - "The whole row is the one button (no second target); its name is \"Set <weekday>, not set yet\"."
  - "No row offers Copy from; it stays in the day and its ···."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID); nothing told by colour alone."
  - "Every state stays reachable by ?state= (canon C-P08)."
devs_call: "Which built weekday the hint names when several are built (the copy source of the first unset row is the default)."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/states/usual-week.md"
  - "C-USE-set-my-days-usual-week-4"
  - "C-USE-set-my-days-usual-week-5"
  - "D-USE-85"
truth_files: "none: the epic's own ux/ ledger was amended in the Design pass of 2026-10-19 (the cited states); it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "the row: one stop by keyboard, named in words, Set day never the only sign of an unset day (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/days/_components/week-view.tsx"
  - "apps/web/app/(shell)/days/_components/copy.ts"
  - "apps/web/lib/data/set-up-view.ts"
  - "apps/web/lib/data/set-up-view.test.ts"
  - "apps/web/lib/fixtures/scenarios/set-up.ts"
depends_on: []
out_of_scope:
  - "What the unset day shows once open (USE-140)"
  - "The time picker (USE-141)"
criteria:
  - id: C1
    statement: "An unset row's name is \"Set <weekday>, not set yet\"; the hint names nothing to copy when nothing is built and the copy source once a day is built"
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "?state=usual-week-empty at 402: seven rows \"Not set yet\" with \"Set day\", no Copy from, the first-time hint"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-139-set-my-days-row-action/evidence/usual-week-empty-402.png"
  - id: C3
    statement: "?state=usual-week-monday at 402: Monday built, six \"Set day\" rows, \"A day not set yet opens on Copy from Monday.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-139-set-my-days-row-action/evidence/usual-week-monday-402.png"
---

# Contract — USE-139 set-my-days-row-action

## Build notes

Fix 1 of Taylor's 2026-10-19 feedback: on a first-time Usual week every row showed "Copy from…" while nothing was built. Boards passed 2026-10-19 ("USE — set up", y 14000).

- **Approach:** in `WeekRow`, the unset branch's trailing span reads `COPY.setDay` ("Set day") instead of `COPY.copyFrom`; the row's button stays the one target. `rowName` gives "Set Monday, not set yet" for an unset day. Under the list, in Usual week (phone only, as the This week hint): nothing built, `COPY.firstWeekHint`; some built and some unset, `COPY.copyHint(<weekday>)` naming `lastBuiltBefore` of the first unset day.
- **Decisions that apply:** D-USE-85 (Copy from names the last built weekday before the day).
- **Interfaces:** `DAYS_COPY.setDay`, `DAYS_COPY.firstWeekHint`, `DAYS_COPY.copyHint`; `weekHint(days)` in set-up-view; `?state=usual-week-empty`, `?state=usual-week-monday`.
- **Per path:** week-view.tsx: the row and the hint · copy.ts: the words · set-up-view.ts: `rowName`, `weekHint` · its test · set-up.ts: the two scenarios.
- **Gotchas:** This week's dated rows share `WeekRow`; they read "Set day" too. The hint shows only where `selected === null` (the phone).
- **Model:** Opus 5.5.
