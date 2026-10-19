---
id: "USE-12"
size: small
objective: "The first open of the day lands on Orient, bare: the greeting, the reading, the links, three autosaving lines and Review the day, with the wake stamped once at the open; a later open goes on to Review the day, the welcome or Now; it runs on fixtures through useMorning"
slice_type: "a ported screen and the day's entry tree on fixtures; risks a time or countdown on Orient, a full-page error at 7am, the wake stamped twice, Orient shown a second time, and morning shapes invented beside the validators"
non_negotiables:
  - "No time, countdown, count, second person or red anywhere on Orient (N5, C-USE-orient-5); nothing on it reads the clock."
  - "The open is the wake: orientedAt is written once, at the open, and never moved by a later open."
  - "Only the reading fails on its own (RegionRetry in its place); the lines and Review the day always work (D-USE-63)."
  - "Every morning record is a @syn/validators record type; the fixtures parse through it."
  - "Only @syn/ui components and preset tokens (canon §2, A-01 to A-20 by ID)."
  - "The legacy frame comes back by git mv and is owned from then on; nothing live imports from _legacy/."
devs_call: "File split inside orient/_components; the autosave debounce (the built 600 ms stands unless it reads wrong); how the entry gate redirects (client replace on fixtures); the placeholder passages and links in the scenarios."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/orient/index.md"
  - "C-USE-orient-1"
  - "C-USE-orient-2"
  - "C-USE-orient-3"
  - "C-USE-orient-4"
  - "C-USE-orient-5"
  - "C-USE-orient-6"
  - "D-USE-5"
  - "D-USE-9"
  - "D-USE-14"
  - "D-USE-63"
truth_files: "none: promotion carries day/orient/"
qa: Q1
reviewers:
  - assay
focus:
  - "success, late, empty, loading, error and offline at 402 against day/orient/captures/, and the 1440 column: no time, nothing red (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/orient/"
  - "apps/web/_legacy/app/(shell)/orient/"
  - "apps/web/_legacy/components/orient-frame/"
  - "apps/web/app/(shell)/today/page.tsx"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "apps/web/lib/routes.ts"
  - "packages/validators/src/morning.ts"
  - "packages/validators/src/index.ts"
  - "packages/utils/src/planner/day-entry.ts"
  - "packages/utils/src/planner/day-entry.test.ts"
  - "packages/utils/src/planner/index.ts"
  - "tests/use-orient.test.ts"
  - "specs/web/epics/USE-daily-use/tickets/USE-012-orient-frame/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
out_of_scope:
  - "The full-screen reader and the Last night sheet: USE-13"
  - "Review the day, the welcome and Now: their own tickets; this one only routes to them"
  - "Reading the old passages, links and days tables through tRPC: the day-records wiring (wave 3)"
  - "Setting passages and links: legacy Settings, out of USE"
criteria:
  - id: C1
    statement: "At 402 the first open shows the date over \"Good morning\", the clamped reading with dots and Read all, two links, Before the day with Saved beside it after a line is typed, Read last night's reflections and Review the day on its fade; no header, tabs or time"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-012-orient-frame/evidence/success-402.png"
  - id: C2
    statement: "Opened at 8:10 against Up at 7:00, Orient is the success frame with no word, time or colour marking it late"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-012-orient-frame/evidence/late-402.png"
  - id: C3
    statement: "With no passages and no evening written, one quiet line sits where the reading was, the links stay, and Read last night's reflections is absent"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-012-orient-frame/evidence/empty-402.png"
  - id: C4
    statement: "Loading paints the greeting, the lines and the button at once, with the reading and links as a still skeleton"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-012-orient-frame/evidence/loading-402.png"
  - id: C5
    statement: "When the reading fails, only its region reads \"This morning's reading didn't load.\" with Try again, in muted ink; the lines still type and Review the day still works"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-012-orient-frame/evidence/error-402.png"
  - id: C6
    statement: "Offline, the frame shows from cache and SaveStatus reads \"Waiting to save\" while a line is typed"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-012-orient-frame/evidence/offline-402.png"
  - id: C7
    statement: "At 1440 Orient is one centred column capped at the reading measure, with no rail and no tabs"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-012-orient-frame/evidence/desk-1440.png"
  - id: C8
    statement: "resolveDayEntry sends a day not yet oriented to Orient, oriented before Ready, go to Review the day, after Ready, go before Start to the welcome, and after Start or a closed day to Now"
    evidence: test
    command: "yarn test"
  - id: C9
    statement: "Through the fixture server, the orient stamp writes orientedAt once and a second stamp keeps the first; a morning-lines write changes only the lines it sends; every morning record in every scenario parses with its schema"
    evidence: test
    command: "yarn test"
  - id: C10
    statement: "Nothing under app/(shell)/orient imports a clock hook, lib/fixtures or _legacy/, and Orient's copy holds no second-person word"
    evidence: test
    command: "yarn test:root"
  - id: C11
    statement: "The web app, @syn/validators and @syn/utils type-check"
    evidence: check
    command: "yarn check-types"
  - id: C12
    statement: "They lint clean"
    evidence: check
    command: "yarn lint"
---

# Contract — orient-frame

## Build notes

Wave 2, with USE-14 and USE-16. Paper file `01M49AX02VV4SSBKNCN6NRTS6Y`, page "USE — daily use" (p-3-0), row "Orient" (y 2640). Captures to match: `ux/day/orient/captures/{success,late,empty,loading,error,offline}-402.png`; take ours at `/orient?state=<name>`.

- **Approach:**
  1. `git mv` `_legacy/app/(shell)/orient/page.tsx` to `app/(shell)/orient/page.tsx` and `_legacy/components/orient-frame/` to `app/(shell)/orient/_components/` (only Orient imports it). Rework from there; don't write it fresh.
  2. Swap `trpc.day.*` for `useMorning(dateKey)` and `useStampOrient()` in `lib/data/`. Drop the built "Working today?", the work button label and "Skipped yesterday too." (D-USE-63).
  3. Add `resolveDayEntry` and a small client gate on `/orient` and the placeholder `/today` that replaces the URL with its answer. `?state=` survives the replace.
- **Decisions that apply:**
  - D-USE-9: "Good morning" over the date; the passage clamps with Read all; links under it; three labelled lines under "Before the day"; "Read last night's reflections" below them, only when an evening was written.
  - D-USE-14: one-line Textareas that grow to about five lines, then scroll.
  - D-USE-25: the button floats on a fade to `--color-background`.
  - D-USE-5: Orient exits to Review the day and is shown once a day.
  - D-USE-63: the quote day stays as one more carousel slide captioned "A quote". When the lines fail to load, they show empty and still save.
  - Error and loading are the drawn proposals (D-USE-49). Focus on open is the heading (`tabIndex -1`), not a field.
  - Words: "Good morning"; "Monday, 12 October"; "Read all"; "Before the day"; "Grateful for"; "Intention"; "Today, as I see it"; "Saved"; "Waiting to save"; "Read last night's reflections"; "Review the day"; "Nothing to read yet. A passage shows up here once one is added."; "This morning's reading didn't load."; "Try again".
- **Interfaces:**
  - `@syn/validators` `morning.ts`: `passageRecord`, `linkRecord`, `quoteRecord`, `morningLinesRecord { onDate, grateful, intention, todayAsISeeIt }` (each nullable), `morningLinesInput` (a partial patch), `journalEntryRecord { onDate, answers: Record<promptKey, string> }`.
  - Fixture server: `readMorning(dateKey)` returns `{ passages, quote, links, lines, lastNight }`. `lastNight` is yesterday's journal entry or null. `stampOrient(dateKey, at)` and `writeMorningLines(dateKey, patch)`. `TodayRecords` gains `dayRecord` and `usualWakeTime`, so later screens read both through `useToday`.
  - Scenarios: `orient-success`, `orient-late` (now 8:10, Up at 7:00), `orient-empty`, `orient-loading` and `orient-error` (the reading only), `orient-offline`.
  - `resolveDayEntry({ dayRecord, startedOnDevice }): "orient" | "review" | "welcome" | "now"` in `@syn/utils` planner. `routes.ts` gains `todayReadyRoute()` (`/today/ready`), the welcome USE-20 builds.
- **Per path:** `day-entry.test.ts` holds C8. The fixture tests hold C9. `tests/use-orient.test.ts` holds C10 and reads the files as text.
- **Gotchas:**
  - In wave 3 the lines are read from the old `days` row (`gratitude`, `intention`, `visualisation`), as the data contract allows a ticket to name an old table. The names here follow the screen.
  - "Start" (welcome to Now) has no column. It is remembered per device through `useDismissed`, keyed by date: `startedOnDevice`.
  - Skeletons don't shimmer. The reading's skeleton reserves the clamped height, so nothing below jumps.
  - Run Prettier only on files written here.
- **Model:** Opus 5.5 at medium. A smaller model keeps the full-page error, stamps the wake on every render, or leaves a built string that names a time.
