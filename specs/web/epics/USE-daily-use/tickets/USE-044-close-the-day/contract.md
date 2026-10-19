---
id: "USE-44"
size: small
objective: "The built journal comes back out of _legacy/ as Close the day: \"‹ Wind-down\" over \"Close the day\", the date caption naming tomorrow's Orient, the person's six prompts over serif lines that autosave, Saved, the morning's quote once every prompt is answered, and a Tomorrow peek naming tomorrow's first two blocks; its empty, offline and read-only forms, on fixtures through useJournal"
slice_type: "a ported screen renamed and extended on fixtures; risks a finish button or count, a pre-filled field, the old second-person offline line, a save that overwrites another field, and a past day left writable from Review"
non_negotiables:
  - "No button to finish, no count, no timer, no starter text; an empty night is nothing, never a miss (DYN-18)."
  - "Each field saves one key at a time, on pause and on blur; a write never overwrites another field's answer."
  - "The offline line reads \"Offline. The words stay on this phone until back online.\" (D-USE-75); no second person anywhere."
  - "A past day opened from Review is read only: serif text under its prompts, empty prompts left out, \"Nothing written.\" when none."
  - "The journal returns by git mv and is owned from then on; nothing live imports from _legacy/."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
devs_call: "File split after the move (the screen stays in components/journal/ or moves under the route's _components); the peek's wording helper; what ‹ Wind-down links to on fixtures (Now's route)."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/close-the-day/built-and-words.md"
  - "C-USE-close-the-day-1"
  - "C-USE-close-the-day-2"
  - "C-USE-close-the-day-3"
  - "C-USE-close-the-day-4"
  - "C-USE-close-the-day-5"
  - "C-USE-close-the-day-6"
truth_files: "none: promotion carries day/close-the-day/"
qa: Q1
reviewers:
  - assay
focus:
  - "journal at 402 against close-the-day/captures/journal-402.png, and empty, offline and read-only by ?state= (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/day/[date]/journal/"
  - "apps/web/_legacy/app/(shell)/day/[date]/journal/"
  - "apps/web/components/journal/"
  - "apps/web/_legacy/components/journal/"
  - "apps/web/lib/data/use-journal.ts"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/routes.ts"
  - "packages/utils/src/planner/tomorrow-peek.ts"
  - "packages/utils/src/planner/tomorrow-peek.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-044-close-the-day/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-12"
  - "USE-31"
out_of_scope:
  - "The Wind-down Journal row that opens it and ticks itself: Now's and Block view's tickets, and syncJournalItem's wiring (wave 3)"
  - "Reading and writing journal_entries through tRPC: the day-records wiring (wave 3)"
  - "The prompts' settings: legacy Settings"
criteria:
  - id: C1
    statement: "At 402 the journal shows \"‹ Wind-down\" over \"Close the day\", \"Monday, 12 October · read back on tomorrow's Orient\", five answers in serif under their prompts and the sixth focused with an ink underline, Saved, and the Tomorrow peek \"Wellness at 7:05, then Training\" with See it; no button, no count"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-044-close-the-day/evidence/journal-402.png"
  - id: C2
    statement: "?state=empty shows six empty fields with no starter text and no Saved; ?state=offline shows \"Saving on this device\" and D-USE-75's line; ?state=read-only shows answers as serif text with no field and no status, or \"Nothing written.\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-044-close-the-day/evidence/states-402.png"
  - id: C3
    statement: "Through the fixtures, a field's save writes only its key, leaving the others as they were; a line written for Monday is what USE-12's readMorning returns as Tuesday's last night"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "tomorrowPeek names the first two blocks of the next day and the first's start, and returns nothing for a day with no blocks"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Nothing live imports _legacy/ or the tRPC client from the journal's files, and its copy holds no second-person word"
    evidence: test
    command: "yarn test:root"
  - id: C6
    statement: "The web app and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "They lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — close-the-day

## Build notes

After USE-12 (`journalEntryRecord` and the quote in the morning fixtures) and USE-31 (`Breadcrumb`). Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use", row "Evening" (y 21540). Capture to match: `ux/day/close-the-day/captures/journal-402.png`. Take ours at `/day/2026-10-12/journal?state=close-<journal|empty|offline|read-only>`.

- **Approach:**
  1. `git mv` `_legacy/app/(shell)/day/[date]/journal/` to `app/(shell)/day/[date]/journal/` and `_legacy/components/journal/` to `components/journal/`. The placement row in Technical names the journal as one of the first two to come back.
  2. Swap `trpc` for `useJournal(dateKey)` over the fixture server (`readJournal`, `writeJournalAnswer`, one key per write).
  3. Replace `ShellPageHeader` and `PageFrame` with `Breadcrumb` "‹ Wind-down", the title and the date caption. Add the peek from `useToday(<tomorrow>)` and `tomorrowPeek`.
- **Decisions that apply:**
  - D-USE-73: its own surface, the journal under a "Wind-down" breadcrumb with the Tomorrow peek.
  - D-USE-14: three of its lines read back on Orient's "Last night" (USE-13).
  - D-USE-74: See it opens tomorrow's day as Schedule draws it.
  - D-USE-75: the offline line's words.
  - Built and kept (DYN-18): six prompts from `users.journal_prompts`, falling back to `DEFAULT_JOURNAL_PROMPTS`; autosave 600 ms after the last key and on blur; `SaveStatusText` under the last field; today and past days writable, a future day 404s; a past day from Review (`?from=review`) is read only; the quote closes the page once every prompt is answered, above the peek [ASSUMPTION, kept].
  - Access: focus opens on the title (`tabIndex -1`) and no field is focused. Each prompt is its field's label. Save status is announced politely. "‹ Wind-down" and See it are at least 44 × 44.
- **Interfaces:** `useJournal(dateKey)` returns `{ query, save(key, value) }`. `tomorrowPeek(occurrences): { first: { name; startsAt }; second?: { name } } | null`. `routes.ts` keeps `journalRoute(date)` and gains a Schedule-for-a-date helper if Schedule's ticket has not added one.
- **Gotchas:**
  - The built `copy.ts` holds "Offline — your words stay here until you're back." Replace it. C5 scans for it.
  - The peek is hidden offline when the fixture has no tomorrow, and on a read-only past day.
- **Model:** Opus 5.5 at medium. A smaller model adds a Done button, keeps the old header, or saves the whole entry on each key.
