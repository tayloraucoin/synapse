---
size: small
objective: "The data seam can serve each domain from tRPC instead of fixtures, one domain at a time, while ?state= still renders every fixture state outside production"
slice_type: "the switch every wave 3 ticket plugs into; risks fixture data showing as real, a hook that changes shape when it goes live, and a production build that still honours ?state="
non_negotiables:
  - "With ?state= present and not a production build, every hook reads the fixture server exactly as today: every capture still renders."
  - "A production build never reads a fixture: ?state= is ignored there and an unwired domain fails loudly (an error state), never with fixture records."
  - "Hooks keep their names, arguments and return shapes; no surface file changes."
  - "lib/fixtures still never imports @syn/api, @syn/db or the tRPC client; surfaces still never import lib/fixtures."
  - "Every live call goes through the tRPC client in lib/trpc; nothing in apps/web reads @syn/db."
devs_call: "The live server's file split under lib/data/live/; how a domain registers itself; the error mapping's helper names; the refetch interval's constant name."
cites:
  - "specs/web/epics/USE-daily-use/ux/dev-notes/timers-across-devices.md"
truth_files: "none: no behaviour changes; the same hooks read another server"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/lib/data/source.ts"
  - "apps/web/lib/data/live/"
  - "apps/web/lib/data/imports.test.ts"
  - "apps/web/lib/data/source.test.ts"
  - "apps/web/lib/trpc/"
  - "packages/api/src/root.ts"
  - "packages/api/src/routers/"
  - "packages/api/src/errors.ts"
depends_on:
  - "USE-89"
out_of_scope:
  - "Any domain's router or service: USE-91 to USE-105, one domain each"
  - "Offline persistence and the paused-mutation replay: USE-106"
  - "Removing the fixture fallback at the end of the wave: USE-108"
criteria:
  - id: C1
    statement: "getDataSource with a ?state= name outside production returns the fixture server for that scenario, as before"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Without ?state=, a method of a domain marked live calls the tRPC client, and a method of a domain not yet live falls back to the default scenario outside production and rejects with an UnwiredDomain error in a production build"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "In a production build ?state= is ignored and no fixture module is loaded by the live path"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "A TRPCError carrying a refusal reason reaches the hook as the same refusal class the fixture server throws, so a surface's refusal words show unchanged"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "The imports rule holds in its new form: lib/data may import lib/trpc; lib/fixtures may not; nothing outside lib/data, lib/fixtures and app/(dev) imports lib/fixtures"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
id: USE-90
---

# Contract — live-data-source

## Build notes

Wave 3's first ticket, alone. Technical's README: "Wiring tickets swap each hook's body for tRPC, one domain at a time. That is a swap, not a rewrite. The fixtures stay afterwards as the `?state=` source for captures." Every hook reaches its server through `useDataSource().server`, a `FixtureServer` (`PlannerServer & WorkServer & IntegrationServer` plus the base reads). So the swap is the server, not the hook: this ticket adds a live server with the same interface, built domain by domain.

- **Approach:**
  - `lib/data/live/`: `createLiveServer(client)` returns a `FixtureServer`-shaped object whose methods come from domain modules (`live/planner.ts`, `live/work.ts`, …). Each wave 3 ticket fills its methods and adds its domain to `LIVE_DOMAINS`.
  - `source.ts` picks the server:
    - `?state=` and `env.NODE_ENV !== "production"`: the fixture server (today's path).
    - Otherwise: the live server. An unwired method falls back to the default scenario's fixture method outside production, and rejects with `UnwiredDomain` in production.
  - `now` and `todayKey` come from the real clock and the account's zone and close time (`user.me`) when live.
  - Fixture-only calls (`recover`, `recoverReading`, `recoverTodos`, `reconnect`) become no-ops on the live server. Retry is a refetch.
- **Errors:** `packages/api/src/errors.ts` gives `refuse(reason, message)`, a `TRPCError` (`BAD_REQUEST`) whose `cause` carries `{ reason }`. `live/errors.ts` maps it back to the fixture's refusal classes (`SlotEventRefusal`, `PlannerRefusal`, `SlotWriteRefusal`, `TodoWriteRefusal`, …), so the refusal words already drawn keep showing.
- **Refetch (call C3, `technical/calls.md`):** live queries refetch on window focus. Today's read also refetches every 15 s while the page is visible: `refetchInterval: 15_000`, `refetchIntervalInBackground: false`. Put both in one `LIVE_QUERY_DEFAULTS`, applied by the source, never by a surface.
- **Routers:** `root.ts` mounts each router as its ticket lands. Every new procedure is `protectedProcedure` and reads through `ctx.rls.execute()`, with input and output zod schemas from `@syn/validators`.
- **Per path:**
  - `source.test.ts`: C1 to C4.
  - `imports.test.ts`: C5. Rewrite the first rule to ban `@syn/db` and `@syn/api` values from `lib/data`, but allow `@/lib/trpc` and type-only `@syn/api`. Keep the fixtures ban.
- **Gotchas:**
  - `lib/trpc/client.ts` exports `createTRPCReact`. Hook `queryFn`s need a vanilla client: export `trpcClient` (`createTRPCClient<AppRouter>`) from the same provider, so one link chain serves both.
  - Query keys stay the hooks' own keys (scenario-scoped). The live path uses the scenario name `"live"`, so a live cache never mixes with a fixture cache.
- **Model:** Opus 5.5 at medium. A smaller model rewrites each hook to call `trpc.x.useQuery`, which changes their shapes and breaks the captures.
