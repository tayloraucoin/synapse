---
size: medium
objective: "Orient, Review the day's Ready, go, the welcome and Close the day read and write real records: the day's opened and ready times, the morning lines, the journal and the reading"
slice_type: "the morning and evening loop's data, partly on old tables; risks a first-write-wins stamp lost to a race, an old table read beyond what this ticket names, and the journal's jsonb merge dropping an answer"
non_negotiables:
  - "Every query runs inside ctx.rls.execute()."
  - "oriented_at and ready_at are first write wins: a second stamp never moves them (INSERT … ON CONFLICT DO NOTHING, then read)."
  - "The only old tables read are the ones this ticket names: journal_entries, days (the morning lines' columns only), passages, links and quotes; nothing else of the old model."
  - "A journal answer merges one key into the day's entry; the other answers are untouched."
  - "Every input is a @syn/validators schema; stampOrient and readyGo get one here."
devs_call: "Router split (day vs journal vs morning); how the reading is picked for a date when the fixture's rule needs the old passages' order."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/orient/index.md"
  - "C-USE-orient-1"
truth_files: "none: behaviour is the ledger's; only the data source changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/day/"
  - "packages/api/src/services/journal/"
  - "packages/api/src/routers/day.ts"
  - "packages/api/src/routers/journal.ts"
  - "packages/api/src/services/morning/"
  - "packages/api/src/routers/morning.ts"
  - "packages/api/src/root.ts"
  - "packages/validators/src/"
  - "apps/web/lib/data/live/"
depends_on:
  - "USE-90"
out_of_scope:
  - "Moving the old journal router back from _legacy: read it for reference, write the new service fresh"
  - "Any write to passages, links or quotes"
criteria:
  - id: C1
    statement: "day.stampOrient and day.readyGo write the first stamp and return it; a second call with a later time returns the first, unchanged"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "day.readiedBefore is true only when a day before the given date has a ready_at"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "journal.save merges one answer into the date's entry and leaves the date's other answers as they were"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "morning.read returns the reading, the morning lines and yesterday's journal for a date in the shapes the fixture returns, and each parses with its schema"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-96
---

# Contract — orient-and-day-records

## Build notes

The base `FixtureServer` methods: `stampOrient`, `readyGo` and `readReadiedBefore` (on `day_records`); `readMorningDay`, `readReading` and `writeMorningLines`; `readJournal` and `writeJournalAnswer`. `readMorning` is unused; drop it from the live server.

- **Tables** (data contract: a ticket that needs an old table names it):
  - `day_records`: `oriented_at`, `ready_at`, `closed_at`, one row per date.
  - `days`: the old plan row. Read and write only the morning lines' columns (gratitude, intention, visualisation), as `morningLinesInput` already says.
  - `journal_entries`: the old journal, whose answers are a jsonb map. Read `users.journal_prompts` for the prompts.
  - `passages`, `links` and `quotes`: read only, for the reading.
- **Approach:**
  - `services/day/` holds the stamps and the readied-before read.
  - `services/journal/` holds read and save. Save is `jsonb_set` (or `||`) on one key inside rls.
  - `services/morning/` holds the reading and the lines.
  - New inputs: `dayStampInput` (`{ dateKey, at }`). `journalSaveInput` and `morningLinesInput` exist.
- **Per path:** tests under each service run plans over in-memory rows. C1 runs two stamps in sequence against a store that honours the unique `(user_id, on_date)`.
- **Gotchas:**
  - USE-44 moved Close the day back from `_legacy/` with the journal's UI only. The legacy `routers/journal.ts` and its service stay legacy; copy what you need.
  - `readReading`'s fixture picks a passage by date; match its rule (in `lib/fixtures/`), or say plainly in the commit if the old table cannot hold it.
  - `closed_at` is written by Close the day's Done, if the fixture writes it; check `lib/fixtures/planner/journal.ts`.
- **Model:** Opus 5.5 at medium. A smaller model replaces the whole journal jsonb on save.
