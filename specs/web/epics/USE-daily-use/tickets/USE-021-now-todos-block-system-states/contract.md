---
id: "USE-21"
size: small
objective: "Now runs a To-dos block like any block, its rows each a to-do with its emoji and the card's meta naming where it came from, and shows its system states: offline with one StatusLine and everything working, a check that fails online reverting with \"Not saved. Try again.\", still skeleton rows while loading, and each region failing on its own, on fixtures"
slice_type: "a block form plus the screen's system states; risks a checked to-do left in the tray, an undone one lost at the block's end, offline treated as an error, a red failure, a shimmering or spinning load, and one failed region blanking the other"
non_negotiables:
  - "Checking a To-dos block's row checks the to-do itself; it leaves the tray. An undone one returns to To-dos with no day once the block ends (USE-9's isReturned)."
  - "Offline is not an error: one StatusLine, \"Offline. Checks are saved on this phone.\", and every check, Start, Pause and Done still works; counts keep running."
  - "A failed check online reverts the box and shows \"Not saved.\" and \"Try again\" in ink under the row; never red, no icon, no Toaster."
  - "Loading: header, tray line and tabs real at once; still skeleton rows in the block's rhythm; no spinner, never shimmering (A-14)."
  - "Each region fails on its own: the block's RegionRetry leaves the tray live, the tray's failure leaves the block live."
  - "Only @syn/ui components (StatusLine, RegionRetry, SkeletonRow) and preset tokens."
devs_call: "Where the online flag is read (lib/hooks/use-online, overridden by the scenario through source.ts); the skeleton's exact rows; whether Try again on a card's Done sits under its buttons."
cites:
  - "specs/web/epics/USE-daily-use/ux/day/now/states/todos-block.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/offline.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/error-on-check.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/loading.md"
  - "specs/web/epics/USE-daily-use/ux/day/now/states/partial.md"
  - "C-USE-now-todos-block-1"
  - "C-USE-now-todos-block-2"
  - "C-USE-now-todos-block-3"
  - "C-USE-now-offline-1"
  - "C-USE-now-offline-3"
  - "C-USE-now-error-on-check-1"
  - "C-USE-now-error-on-check-2"
  - "C-USE-now-loading-1"
  - "C-USE-now-partial-1"
  - "C-USE-now-partial-2"
waiver: "One surface, Now: a To-dos block and the screen's four system states, which share the regions and the write path."
truth_files: "none: an epic proposal; promotion carries day/now/"
qa: Q1
reviewers:
  - assay
focus:
  - "error on check and offline at 402: ink not red, offline not an error; partial region by region (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/today/_components/"
  - "apps/web/components/planner/"
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-021-now-todos-block-system-states/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-9"
  - "USE-10"
  - "USE-16"
  - "USE-19"
out_of_scope:
  - "Persisting queued writes across a reload and syncing them in order (C-USE-now-offline-2): the offline persistence ticket (wave 3)"
  - "Which to-dos a block pulls first and pinning a to-do to a block: the Life and chores dev note's ticket; here the fixture fills by USE-9's pullTodos"
  - "Running's count while offline: USE-23 draws the card; this ticket proves the clock keeps counting"
criteria:
  - id: C1
    statement: "Errands at 11:22: a moss bar, \"To-dos · 10:00 to 12:30\", three done rows each with its emoji and length, the card \"Return the parcel\" with \"15 min · 11:20 · a to-do since Tue\", Start and Done, then Pick up the prescription"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-021-now-todos-block-system-states/evidence/todos-block-402.png"
  - id: C2
    statement: "Offline mid-Wellness: one StatusLine with the cloud-off glyph and \"Offline. Checks are saved on this phone.\" under the header, above the tray; the block as online"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-021-now-todos-block-system-states/evidence/offline-402.png"
  - id: C3
    statement: "A failed check on Cold bath: the box empty again and \"Not saved.\" with an underlined \"Try again\" under it, in ink"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-021-now-todos-block-system-states/evidence/error-on-check-402.png"
  - id: C4
    statement: "Loading: \"Now\", the tray line and the tabs, and below them a header bar, a card-shaped block and two rows as still skeletons, with no spinner and no Done or Start"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-021-now-todos-block-system-states/evidence/loading-402.png"
  - id: C5
    statement: "The block failing alone: RegionRetry under the header with \"Today didn't load.\", \"Timers that were running keep their time; nothing is lost.\" and Try again, the tray working above it"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-021-now-todos-block-system-states/evidence/partial-block-402.png"
  - id: C6
    statement: "Checking a to-do row sets the to-do's doneAt and removes it from trayTodos; at the block's end an undone to-do is in the pool with no day; a Start written offline reads as running by deriveClock"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "A write named in failWrites rejects once and the box reads unchecked; Try again then checks it and clears the line; with the to-dos region failing the day's query still settles, and the reverse"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C9
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — now-todos-block-system-states

## Build notes

After USE-19, which adds `regions`, `failWrites` and `useTodos`. Captures to match: `ux/day/now/captures/{todos-block,offline,error-on-check}-402.png`; loading and partial are not drawn and follow the decisions below. Paper `01M49AX02VV4SSBKNCN6NRTS6Y`, "USE — daily use", row "Now (cont.)".

- **Decisions that apply:**
  - D-USE-74: a To-dos block runs like any block, filled oldest first from to-dos with no day, the meta naming the day the to-do was made; undone ones go back to To-dos at the block's end. Moss is To-dos' colour. The header meta puts the kind first: "To-dos · <start> to <end>".
  - D-USE-56, D-USE-64, D-USE-72: offline everything works, timers included, with a StatusLine; Start, Pause and Done queue like any check; counts run because they are time-based.
  - N4, error on check: the box reverts with an inline "Not saved. Try again."; nothing red on the tabs. Done failing on the card: the card stays lifted and the line sits under its buttons [ASSUMPTION, as the state says].
  - D-USE-57 and D-USE-74: loading is still skeleton rows; a failed block is phone Today's RegionRetry with its words. D-USE-69: partial fails region by region, in place.
- **Interfaces:**
  - `useNow`'s item gains `source: "todo"` and `madeOn`, for "a to-do since <weekday>".
  - `Scenario` gains `offline?: true`; `source.ts` exposes `useIsOffline()` (the scenario, else `use-online`). Fixture writes still land while offline, as the queue will.
  - `components/planner/`: `OfflineLine`, `NotSavedLine` (reused by the tray's and sheets' failures), `NowSkeleton`.
  - Scenarios: `todos-block` (Errands 10:00 to 12:30 at 11:22), `offline`, `error-on-check` (failWrites on Cold bath's slot), `now-loading`, `now-partial-todos` (regions.todos error), `now-partial-block`.
- **Per path:** tests in `lib/data/now-system.test.ts`: C6 and C7, against the fixture server, `trayTodos`, `todoPool` and `deriveClock`.
- **Gotchas:**
  - The fixture's Errands to-dos are made on earlier days (Tue for Return the parcel); a done row's emoji is the to-do's own icon.
  - A to-do slot's Done writes both the slot's `doneAt` and the to-do's; the tray reads the to-do.
  - `now-partial-todos` reuses USE-19's tray failure line; do not draw a second one.
- **Model:** Opus 5.5 at medium. A smaller model paints the failure red or shows a spinner while loading.
