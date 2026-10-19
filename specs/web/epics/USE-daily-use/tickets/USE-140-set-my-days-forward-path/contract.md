---
id: USE-140
size: medium
objective: "An unset day in Set my days has a way forward: \"Set Monday, 7:00 to 22:30\" saves the times shown, and once a day is built the unset day offers \"Copy from Monday\" first, taking that day's times and blocks; the URL names the day mon to sun"
slice_type: "a state change in the day view, a two-write copy with one Undo, and a URL param; risks saving a suggestion untouched, an Undo that leaves half a copy, and old day=0 links breaking"
non_negotiables:
  - "Match the Paper artboards set-my-days / empty, first day, Set Monday; / first day set, nothing built; / unset day, a day built, copy first (402); D-USE-* win and are named."
  - "A suggestion is never saved until the button is tapped (C-USE-set-my-days-empty-first-day-3)."
  - "Copying onto a day with no times takes the source's times; one Undo puts the day back to unset."
  - "day=mon…sun is written; day=0…6 and date keys are still read."
  - "Only @syn/ui components and preset tokens; every state reachable by ?state=."
devs_call: "Whether the two copy writes are composed in the client or the server; the client is the default, since the API's copyDay does not touch bounds."
cites:
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/states/empty-first-day.md"
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/states/first-day-set.md"
  - "specs/web/epics/USE-daily-use/ux/set-my-days/set-my-days/states/unset-day-copy.md"
  - "C-USE-set-my-days-empty-first-day-2"
  - "C-USE-set-my-days-empty-first-day-3"
  - "C-USE-set-my-days-empty-first-day-4"
  - "C-USE-set-my-days-first-day-set-1"
  - "C-USE-set-my-days-unset-day-copy-1"
  - "C-USE-set-my-days-unset-day-copy-2"
  - "C-USE-set-my-days-unset-day-copy-3"
  - "D-USE-30"
  - "D-USE-32"
  - "D-USE-85"
waiver: "One forward path across three states of the same unset day (first day, just set, copy first); they share FirstDay and one write, so one ticket owns them."
truth_files: "none: the epic's own ux/ ledger was amended in the Design pass of 2026-10-19 (the cited states); it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "the forward button: its label is the times it saves, in words (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/days/_components/day-view.tsx"
  - "apps/web/app/(shell)/days/_components/copy-from.tsx"
  - "apps/web/app/(shell)/days/_components/copy.ts"
  - "apps/web/lib/routes.ts"
  - "apps/web/lib/data/use-days.ts"
  - "apps/web/lib/data/use-days.test.ts"
  - "apps/web/lib/data/copy-from.test.ts"
  - "apps/web/lib/data/review-copy.test.ts"
  - "apps/web/lib/fixtures/scenarios/set-up.ts"
  - "apps/web/app/(shell)/days/block/[id]/_components/days-block-screen.tsx"
depends_on: []
out_of_scope:
  - "The picker itself (USE-141); this ticket keeps BoundsField's typing"
  - "Changing the API's copyDay"
criteria:
  - id: C1
    statement: "daysRoute writes day=mon…sun for a weekday; resolveDaysPlace reads mon…sun, 0…6 and date keys to the same day"
    evidence: test
    command: "yarn workspace web test"
  - id: C2
    statement: "On an unset day, the fields alone never write; \"Set <day>, <up> to <out>\" writes the times shown, and its label follows the fields"
    evidence: test
    command: "yarn workspace web test"
  - id: C3
    statement: "Copy from onto a day with no times writes the source's bounds and blocks; Undo leaves the day unset"
    evidence: test
    command: "yarn workspace web test"
  - id: C4
    statement: "?state=empty-first-day, first-day-set and unset-day-copy at 402 match their boards"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-140-set-my-days-forward-path/evidence/"
---

# Contract — USE-140 set-my-days-forward-path

## Build notes

Fix 2 and 4 of Taylor's 2026-10-19 feedback, with the copy-first board Taylor approved the same day ("How to copy day now?").

- **Approach:** `FirstDay` keeps a draft per field and stops committing on its own; a primary `Button` "Set <weekday>, <up> to <out>" commits both (suggestions included). With another day built (`useCopyFrom(...).offered`), the unset day shows the copy offer above the fields ("Copy from <day>" primary, "Other day…" ghost, a divider "or set its own times") and the set button steps to secondary. Copying onto an unset day: `writeBounds(source.bounds)` then `copyDay`; one toast, whose Undo undoes the copy then the bounds. After set with nothing else built, `SetDay`'s empty offer is the first-block prompt (no copy). `daysRoute` maps a weekday number to `DAYS_BLOCK_WEEKDAYS`; `resolveDaysPlace` reads the keys.
- **Decisions that apply:** D-USE-30 (empty-day choices under Orient, not centred), D-USE-32 (empty copies at once, with Undo), D-USE-85 (the last built weekday before).
- **Interfaces:** `daysRoute({ day })` writes keys; `DAYS_WEEKDAY_KEYS` read back; `DAYS_COPY.setDayAt`, `setHelper`, `unsetHeading`, `unsetBody`, `orOwnTimes`, `firstBlockLine`; `?state=first-day-set`, `?state=unset-day-copy`.
- **Per path:** day-view.tsx: FirstDay and the first-block prompt · copy-from.tsx: copy onto an unset day · copy.ts: words · routes.ts and use-days.ts: day keys · tests · set-up.ts: scenarios · days-block-screen.tsx: back link with a key.
- **Gotchas:** scenarios store `day` as a number; `useDaysPlace` stringifies it, so numbers must keep resolving. `openDay` and `selectDay` write the param; they move to keys.
- **Model:** Opus 5.5.
