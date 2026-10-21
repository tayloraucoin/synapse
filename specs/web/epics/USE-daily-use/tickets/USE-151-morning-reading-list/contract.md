---
id: USE-151
size: medium
objective: "Settings › Morning reading opens from a new row in Settings and shows the reading as Orient reads it, with its Off lists, empty, loading, error and offline states"
slice_type: "a new route and read surface on a new data domain; risks a list order that differs from Orient's, and a fixture shape that drifts from the live one"
non_negotiables:
  - "The Settings list gains \"Morning reading\" after Connections, with no second line (D-USE-132); Orient does not change."
  - "One read loads both sections (morning.list); error is one RegionRetry for both (D-USE-133)."
  - "Passage text in Newsreader, everything else Public Sans; four type sizes; the link row's host at 13 px, not LinkCallout's caption (D-USE-130, D-USE-131)."
  - "Offline: the list from the persisted cache under one StatusLine; grips, ··· and add rows wait; nothing is queued (D-USE-129)."
  - "Only @syn/ui parts and preset tokens; no red; no second person; no counts."
  - "Every state key in the ledger's table is a morning-reading-<key> scenario at ?state= (C-P08), the ones USE-152 and USE-153 draw included as seeds."
devs_call: "How the page splits into components; how the row callbacks and the sheet slot are shaped for USE-152 and USE-153."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/morning-reading/index.md"
  - "D-USE-119"
  - "D-USE-131"
  - "D-USE-132"
  - "D-USE-133"
truth_files: "none: the epic's own ux/ ledger is the truth; it promotes to specs/web/ux/ with USE"
qa: Q1
reviewers:
  - assay
focus:
  - "the list at 402 against morning-reading / list: the serif first lines, the link row's 13 px host, four sizes (assay)"
operator_review: false
planned_paths:
  - "apps/web/lib/routes.ts"
  - "apps/web/components/account/settings-list.tsx"
  - "apps/web/components/account/copy.ts"
  - "apps/web/components/account/index.ts"
  - "apps/web/app/(shell)/settings/morning-reading/page.tsx"
  - "apps/web/components/account/morning-reading/morning-reading-page.tsx"
  - "apps/web/components/account/morning-reading/reading-section.tsx"
  - "apps/web/components/account/morning-reading/reading-rows.tsx"
  - "apps/web/components/account/morning-reading/copy.ts"
  - "apps/web/components/account/morning-reading/index.ts"
  - "apps/web/lib/data/use-morning-reading.ts"
  - "apps/web/lib/data/morning-reading.test.ts"
  - "apps/web/lib/data/live/morning-reading.ts"
  - "apps/web/lib/data/live/domains.ts"
  - "apps/web/lib/data/refusals.ts"
  - "apps/web/lib/fixtures/server.ts"
  - "apps/web/lib/fixtures/scenarios/morning-reading.ts"
  - "apps/web/lib/fixtures/scenarios/index.ts"
depends_on:
  - USE-150
out_of_scope:
  - "Reorder, the row menu, off, on and delete (USE-152)"
  - "The passage and link sheets (USE-153)"
  - "Passage images (D-USE-121); the desk layout beyond Settings' main pane"
criteria:
  - id: C1
    statement: "?state=morning-reading-list at 402 matches the locked board: three passages (one untitled, its first line alone), two links, add rows, both Off collapsed"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-151-morning-reading-list/evidence/"
  - id: C2
    statement: "?state=morning-reading-list-off-open, -empty, -loading, -error and -offline at 402 match their boards"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-151-morning-reading-list/evidence/"
  - id: C3
    statement: "/settings shows \"Morning reading\" after Connections with no second line, and it opens /settings/morning-reading"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-151-morning-reading-list/evidence/"
  - id: C4
    statement: "The fixture and live domains return the same list shape; after a fixture reorder Orient's readReading returns the same order as the list"
    evidence: test
    command: "yarn workspace web test"
  - id: C5
    statement: "Offline, every write control is disabled and no write is called or persisted as a paused mutation"
    evidence: test
    command: "yarn workspace web test"
  - id: C6
    statement: "Every key in the ledger's States table resolves as a morning-reading-<key> scenario"
    evidence: test
    command: "yarn workspace web test"
---

# Contract — USE-151 morning-reading-list

## Build notes

Wave 2, after USE-150. Read `technical/morning-reading.md`. Design: Paper "Synapse" (`01M49AX02VV4SSBKNCN6NRTS6Y`), page "USE — daily use", row "Row label · Morning reading" (y 2640). Captures: `specs/web/epics/USE-daily-use/ux/account/morning-reading/captures/` (`list`, `list-off-open`, `empty`, `loading`, `error`, `offline`, each `-402.png`). The state files under `ux/account/morning-reading/states/` give the words and layout.

- **Ledger criteria built:** C-USE-morning-reading-1, C-USE-morning-reading-2, C-USE-morning-reading-4, C-USE-morning-reading-6, C-USE-morning-reading-7, C-USE-morning-reading-8, C-USE-morning-reading-10, C-USE-morning-reading-29, C-USE-morning-reading-30, C-USE-morning-reading-31 (in `ux/account/morning-reading/states/` and `words-and-access.md`); this contract's criteria prove them.
- **Approach:** `morningReadingRoute()` beside `connectionsRoute()`. A `SettingsRow` after Connections. The page under `(shell)/settings/morning-reading/` as the Connections page is built. A `morningReading` domain: the `FixtureServer` methods (list plus every write, so USE-152 and USE-153 only consume them), its fixture implementation, and `live/morning-reading.ts` parsing input before each call as `live/orient.ts` does. A `useMorningReading` hook (the query plus the mutations, `networkMode: "always"`, writes disabled while `useOnline()` is false). The sections render rows through a `SortableList`, with the grip and ··· drawn but not wired in this ticket: they take callbacks USE-152 fills. The page holds a sheet slot USE-153 fills.
- **Decisions that apply:** D-USE-119 (the entry and route, Orient unchanged); D-USE-122 (one screen, Passages then Links, Off at each foot; direction B); D-USE-129 (offline read only); D-USE-130 and D-USE-131 (type); D-USE-132 (no second line); D-USE-133 (untitled row, one region, loading draws headings).
- **Interfaces:** `morningReadingRoute()`; `MORNING_READING_COPY`; `MorningReadingPage`; `useMorningReading()`; the scenarios `morning-reading-<key>` for all 22 keys (the sheet and overlay keys seed their open state for USE-152 and USE-153).
- **Per path:** `routes.ts`: the builder. `settings-list.tsx` and `account/copy.ts`: the row. `page.tsx`: the route. `morning-reading/*`: the page, the section and row parts, the copy. `use-morning-reading.ts`: the hook. `live/morning-reading.ts` and `domains.ts`: live. `fixtures/server.ts` and `scenarios/morning-reading.ts` with `index.ts`: fixtures. `refusals.ts`: `MorningReadingRefusal` by code. `morning-reading.test.ts`: C4 to C6.
- **Gotchas:** the untitled passage row has one line only, serif and muted. "Off ›" is an `ArchivedSection` that hides when its list is empty. The links' line does not teach the grip; only Passages' does.
- **Model:** Opus 5.5 at medium. Choosing down risks a fixture shape that drifts from the live record.
