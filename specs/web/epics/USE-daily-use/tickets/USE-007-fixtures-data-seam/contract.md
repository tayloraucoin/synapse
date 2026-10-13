---
id: "USE-7"
size: small
objective: "Every wave 2 surface reads through one data hook backed by a fixture server that mirrors the routers, so firing, Step away and Done truly work through the real deriveClock before any table is read, and every state is reachable by ?state="
slice_type: "a data seam with an in-memory fake of the routers; risks fixtures shaped unlike the records, a fake that accepts what the router will refuse, a clock faked in the UI instead of derived, and a seam that wave 3 cannot swap without rewriting the surfaces"
non_negotiables:
  - "Every fixture record is a @syn/validators record type and parses with its schema; no shape is invented here."
  - "The fixture server takes the same input schemas the routers will (slotEventInput) and refuses what they will refuse, with checkEventTime's reason."
  - "The clock is only ever deriveClock over the event list; no stored state, no faked minutes."
  - "Server data lives in TanStack Query (lib/stores/README.md): the fixture server stands where tRPC will, never in a Zustand store or a Context."
  - "Nothing under lib/data or lib/fixtures imports @syn/db, @syn/api or the tRPC client."
  - "Only the hook bodies change in wave 3; a surface never imports lib/fixtures."
devs_call: "File split inside lib/fixtures; optimistic updates on the mutation; the scenario helper names; how the fixture clock advances (real elapsed time from the scenario's base is fine); the placeholder names and times in the base day."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/firing.md"
  - "C-USE-firing-1"
  - "D-USE-44"
  - "D-USE-46"
truth_files: "none: no behaviour ships; the wave 2 surfaces render on this"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/data/"
  - "apps/web/lib/fixtures/"
  - "apps/web/app/(dev)/parts/"
  - "apps/web/lib/routes.ts"
  - "apps/web/package.json"
  - "apps/web/vitest.config.ts"
  - "apps/web/turbo.json"
  - "yarn.lock"
depends_on:
  - "USE-3"
  - "USE-5"
out_of_scope:
  - "Each surface's own scenarios (?state= names past the base set) and its hook if it has one: its wave 2 ticket"
  - "useWorkClock, the one-second tick: the hooks ticket (wave 2)"
  - "Next, fit, session counts and the to-do pool: USE-8 and USE-9; hooks call them, fixtures never precompute them"
  - "Swapping a hook to tRPC, and whether production keeps ?state=: each wiring ticket (wave 3)"
  - "Offline persistence: its own ticket (C4)"
criteria:
  - id: C1
    statement: "Every record in every scenario parses with its @syn/validators record schema"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Through the fixture server, started then prompt_sent then brought_back reads, by the real deriveClock, as running, then firing with work paused, then not running with work not restarted"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "Step away writes one paused per running slot under one step_away_id; Resume all resumes exactly those, never a slot paused by its own Pause; firing keeps counting through it"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "writeSlotEvents refuses what slotEventInput refuses, and an at outside the day window or over two minutes past now with checkEventTime's reason; a repeated clientEventId changes nothing"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "Each ?state= name resolves to one scenario and an unknown or missing name to the default; the loading scenario never settles and the error scenario rejects until retried"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "No file under apps/web/lib/data or apps/web/lib/fixtures imports @syn/db, @syn/api or the tRPC client, and nothing outside them imports lib/fixtures except lib/data and app/(dev)/"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "/dev/parts renders the part a ?state= names from the parts registry, lists every registered name when none is given, and is not found in a production build"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
---

# Contract — fixtures-data-seam

## Build notes

Wave 1, after USE-3 and USE-5, parallel to USE-8 and USE-9. The README's contract-first rule: surfaces read real shapes, and the clock is the real derivation, so wave 3 swaps hook bodies and rewrites nothing.

- **Approach:** a fixture server with the routers' shape (reads return records, writes take the routers' inputs), held per scenario in memory. The hooks are TanStack Query over it: `useQuery` with the fixture read as `queryFn`, `useMutation` with the fixture write, invalidating the day. Wave 3 replaces each `queryFn` and `mutationFn` with tRPC, one domain at a time.
- **Decisions that apply:**
  - D-USE-44: two clocks per item; Prompt sent pauses work time by itself; bringing back never restarts it.
  - D-USE-46: Step away pauses every running work timer; firing keeps counting; Resume all resumes exactly what Step away paused, and a card's own Pause is not tagged.
  - C-USE-firing-1: any of the five ways to fire gives the same result. Here, all five write one `prompt_sent`.
  - Data contract: Step away writes one `paused` per running slot sharing a `step_away_id`; an event's `at` is inside its slot's day window and at most two minutes past now; a replay keeps its `at`.
  - Canon C-P08: every reachable state by `?state=`.
- **Interfaces:**
  - `lib/fixtures/server.ts`: `createFixtureServer(scenario, now: () => Date)` with `readToday(dateKey): Promise<TodayRecords>` and `writeSlotEvents(inputs: SlotEventInput[]): Promise<SlotEventRecord[]>`. The write parses each input, runs `checkEventTime`, drops a known `clientEventId`, stamps `receivedAt`, appends.
  - `TodayRecords`: the date, `timeZone`, `dayWindow` (from `day/boundaries.ts`), and the date's blocks, block changes, block items, slots, work items, clients, to-dos, day events and slot events, every one a `@syn/validators` record type.
  - `lib/fixtures/scenarios/`: `Scenario { name; now: string; records; mode: "ready" | "loading" | "error" }`, a registry, `resolveScenario(name: string | null): Scenario`. The base set: `default` (a Monday at 10:20 with Wellness, a Work block holding Urgent, Primary, Secondary and Stretch items, Lunch, a To-dos block, a daily reminder and a to-do pool), `empty`, `loading`, `error`.
  - `lib/data/use-today.ts`: `useToday(dateKey)`. It returns the query and `today: { occurrences: readDay(...), clock: deriveClock(...), records }`, derived in `select`, never stored.
  - `lib/data/use-slot-events.ts`: `useSlotEvents()`, a mutation over `writeSlotEvents`, with `stepAway()` and `resumeAll(stepAwayId)` composing the batch from the derived clock.
  - `app/(dev)/parts/page.tsx`: the capture host for parts no screen holds yet. `lib/fixtures/parts.ts` is a registry, `registerPart(name, render)`, that each wave 2 ticket appends to. `?state=<name>` renders one part inside the shell's frame; no name lists them all. It calls `notFound()` when `env.NODE_ENV` (from `env.ts`, never `process.env`) is production. `routes.ts` gains `devParts(state?)`.
  - `lib/data/source.ts`: the one place a hook gets its server, the scenario from `?state=` (nuqs).
- **Per path:**
  - `lib/fixtures/server.test.ts`: C2, C3 and C4, one `describe` per criterion.
  - `lib/fixtures/scenarios/scenarios.test.ts`: C1 and C5.
  - `lib/data/imports.test.ts`: C6, reading the files as text.
  - `apps/web/package.json`: `vitest` at the repo's pin (5.0.3) as a dev dependency, and a `test` script, so `yarn test` runs it through turbo. `vitest.config.ts` is node-only; no DOM library.
- **Gotchas:**
  - `apps/web` has no test runner today. This ticket adds `vitest` at the pin `@syn/utils` already uses (Taylor confirmed it at the Tickets gate, 2026-10-13). Nothing else is added.
  - Build each fixture through its schema's `parse`, so a record that drifts from USE-3 fails C1 rather than rendering.
  - A scenario's `now` is fixed so captures are stable. The fixture clock runs from it, so a timer started on a capture page still counts.
  - Ids are fixed UUIDs, so `?state=` links and captures are repeatable.
  - The scenario's day must open at `day_close_time`, as `deriveClock`'s window does.
- **Model:** Opus 5.5 at medium. A smaller model fakes the clock in the hook, puts the records in a Zustand store, or invents shapes beside the validators.
