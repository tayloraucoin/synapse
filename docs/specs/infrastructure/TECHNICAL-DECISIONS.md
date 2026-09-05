# Infrastructure — Technical Decisions (append-only)

One section per architectural choice that had real alternatives. Written when the decision is made. Format:

```
## YYYY-MM-DD · <ticket-id> · <the decision, as a statement>
**Context (as it was then):** …
**Options weighed:** A … B … C …
**Decision:** …
**Consequences:** what this buys, what it costs, what it forecloses.
**Revisit trigger:** the condition under which this should be reopened.
```

## 2026-09-04 · track · Synapse copies Conscious Connections' conventions and code by hand rather than depending on `@cc/*` packages

**Context:** Two products, two brands, one author, one convention set. The v2 handoff's §11 Q1 asked whether Synapse should join the CC monorepo or stand alone.
**Options weighed:** A — `apps/synapse` inside the CC Turborepo importing `@cc/ui`, `@cc/db`, `@cc/auth`. B — standalone Turborepo, copy-and-adapt from CC with `@syn/*` scope. C — extract a shared `@lighthouse/*` layer both consume.
**Decision:** B.
**Consequences:** Buys brand isolation (CC's tokens never leak), independent deploy cadence, and a schema that can diverge freely. Costs duplicated infrastructure code that will drift; every "copy from CC" in this track is a fork. Forecloses nothing — C remains possible later by extracting the pieces that stayed identical.
**Revisit trigger:** a third product, or a CC infra fix that has to be applied twice more than twice.

## 2026-09-04 · INF-1 · The toolchain is pinned to the CC-validated set — TypeScript 5.9.2, Node 22, ESLint 9 — not the scaffold's TypeScript 7 / Node 24 / ESLint 10

**Context (as it was then):** `create-turbo` scaffolded the repo on TypeScript 7.0.2, Node ≥24, ESLint 10, Prettier 3.9.6. INF-1 proposed the Conscious Connections set instead and routed the call to Mason before INF-2.
**Options weighed:** A — keep the scaffold's TS 7 / Node 24 / ESLint 10 and adapt the toolchain around it. B — pin CC's TS 5.9.2 / Node 22 / ESLint 9 / Prettier 3.7. C — split: TS 7 for apps, 5.9 for the packages that need it.
**Decision:** B, confirmed. `drizzle-kit 0.31.10` parses `schema.ts` with its own TypeScript integration, `typescript-eslint 8.x` declares a `<5.10` supported range, and Storybook 8's `@storybook/react-vite` builder is validated against 5.9 in CC. TypeScript 7 is a compiler rewrite, not a version bump; adopting it means being the first to hit its incompatibilities in three load-bearing tools at once, on a repo that has not yet compiled a single product file. Nothing in Synapse needs it. C is rejected outright — two compilers in one monorepo is a second source of truth for what "compiles" means, which is the failure class this track exists to prevent.
**Consequences:** Buys a toolchain that is known-good, and keeps Synapse and CC on one set of infrastructure fixes rather than two. Costs the TS 7 compile-speed win, which is not a constraint at this size. Forecloses nothing.
**Revisit trigger:** CC bumps TypeScript. Synapse follows in the same week — the pin exists to track CC, not to freeze.

## 2026-09-04 · INF-1 · The boundaries lint gets a module resolver and source-pattern externals, because CC's copy silently enforces nothing

**Context (as it was then):** INF-1 copied `packages/config/eslint/boundaries.js` from CC. Probed with deliberate violations, it reported none of them: not `config → @syn/ui` (an upward import), not `ui → drizzle-orm` (a restricted external), not `ui → apps/web` (a hard ban). `ESLINT_PLUGIN_BOUNDARIES_DEBUG=1` gave the cause: `eslint-import-resolver-node` — the plugin's default, and the only one CC configures — tries `.js`/`.json`/`.node`. Every `@syn/*` package's entry point is `./src/index.ts`, so every workspace import resolved to `path: null` and fell through the `allow: { to: { isUnknown: true } }` rule. Separately, `flag-as-external.inNodeModules: false` meant genuine third-party packages were never flagged `external`, so every `RESTRICTED_EXTERNAL` rule was unreachable. CC (`eslint-plugin-boundaries 6.0.2`, same version) reproduces both. The README makes `yarn lint:boundaries` a non-negotiable enforcement point for the layered package graph; a copy that passes everything is not enforcement.
**Options weighed:** A — copy CC verbatim, log that the lint is inert, and inherit it for eleven tickets. B — add `eslint-import-resolver-typescript` as a dependency and configure it. C — configure the bundled node resolver with TypeScript extensions, and restore external detection with `flag-as-external.customSourcePatterns` derived from the `RESTRICTED_EXTERNAL` list.
**Decision:** C. Two settings change from CC's file, both commented in place: `settings["import/resolver"].node.extensions` gains the TypeScript extensions, and `flag-as-external.customSourcePatterns` is derived from `RESTRICTED_EXTERNAL` (`module` plus `module/**`, so subpath imports like `drizzle-orm/pg-core` are caught). `inNodeModules` stays `false` — flipping it to `true` does make third-party modules external, but it also flags `@syn/*` imports external, because Yarn resolves them through the `node_modules` symlink without realpathing, and that destroys internal element detection. A was rejected on the ground that a constraint nothing enforces is a constraint already eroding, and this one is load-bearing for every later ticket. B was rejected as a new dependency for a resolution problem three lines of configuration already solve.
**Consequences:** Buys an import matrix that actually fails the build. Verified against five probes before closing INF-1: `config → @syn/ui` errors, `config → drizzle-orm` errors, `ui → drizzle-orm/pg-core` errors, `ui → apps/web` errors, and the legal `ui → @syn/config` and `apps/web → @syn/ui` edges both pass. Costs a documented divergence from CC's file, which now has to be re-reasoned rather than re-copied if CC's version changes. It also means a package must declare `main`/`types` pointing at its entry for the resolver to see it — a requirement INF-2 onward must honour, and the reason `@syn/ui` gained both in this ticket.
**Revisit trigger:** CC fixes its own boundaries config, at which point compare and converge. Also revisit if a restricted module ever needs to be caught by resolved path rather than by source string — `customSourcePatterns` matches the import specifier, not the file it resolves to.

## 2026-09-04 · track · The 15-minute notification scan runs on a native Vercel cron; the route handler is the contract either way

**Context (as it was then):** Official spec §8.6 requires a scheduler that scans items due in the next window and enqueues push. §8.2's catalogue puts N1 (fixed-time item start) at the item's `scheduled_start`, so the scan interval sets the worst-case lateness of a reminder — a daily cron would make N1 useless. Vercel's Hobby plan offers daily crons only; 15-minute cadence needs Pro. Taylor confirmed an existing Vercel Pro subscription.
**Options weighed:** A — native Vercel cron in `vercel.json` at `*/15 * * * *`. B — stay on Hobby and drive the same route from an external scheduler (GitHub Actions schedule, cron-job.org) with the `CRON_SECRET` bearer. C — move the scan to a Supabase Edge Function on `pg_cron`, which is what §8.6 literally names.
**Decision:** A. Pro is already paid for, so B's only advantage — cost — does not apply, and B adds a second system, a second place a schedule can silently stop, and a secret in flight across providers. C is rejected on seam grounds: the scan calls an `@syn/api` service, and that service is the one home for the enqueue logic; running it inside a Supabase function would either duplicate the logic or require the function to reach back over HTTP, which is A with more moving parts.
**Consequences:** Buys the spec's cadence with one `vercel.json` entry and no second provider. Costs a hard dependency on the Vercel plan staying Pro — if it ever lapses, the cron silently degrades to whatever Hobby allows rather than failing loudly, so INF-10 states the dependency in the deploy notes. The route stays plan-agnostic: it is a normal handler guarded by `CRON_SECRET`, so switching to option B later is a workflow file and a deleted `vercel.json` block, with no code change.
**Revisit trigger:** the plan changes, or the scan's runtime approaches the function timeout, at which point the enqueue splits from the send.

## 2026-09-04 · INF-5 · `DATABASE_ENVIRONMENT` defaults to `local`, not Conscious Connections' `production`

**Context (as it was then):** `resolveDbEnvironment()` picks the tier every connection URL is resolved from. CC's copy returns `"production"` when the variable is unset. Synapse copies CC's conventions by default, so this is a deliberate divergence and was flagged `[PROVISIONAL — Taylor]` in the ticket; Taylor ratified it on 2026-09-04.
**Options weighed:** A — keep CC's `production` default, matching the reference codebase exactly. B — default to `local`, following `taylor-aucoin`'s `resolveAppTier`. C — no default: throw when the variable is unset.
**Decision:** B. The question is which tier you get by *forgetting*, and the answer has to be the harmless one. With A, a laptop, a CI job, or a stray script with no environment configured opens a connection to the production database and may run a query against real people's days; with B the same mistake costs a connection error naming the missing variable. Every deployed surface sets the tier explicitly (INF-10 sets it per Vercel environment), so nothing in production relies on the default at all — which is precisely why making it dangerous buys nothing. C was rejected as the same safety with worse ergonomics: `yarn check-types` and a local shell would both need the variable set to do nothing.
**Consequences:** Buys a repository where the destructive default is unreachable by omission, and pairs with `db:reset`'s `local`-only refusal so two independent guards would both have to fail. Costs one documented divergence from CC in a file that is otherwise a verbatim copy — the function is annotated in place so the next person to diff the two files finds the reason rather than the difference. It also means a misconfigured *production* deploy fails closed with a confusing "set LOCAL_DATABASE_URL" error rather than silently working; INF-10's env matrix is what prevents that.
**Revisit trigger:** if a deployment path appears that cannot set an environment variable. There is none today.

## 2026-09-04 · INF-5 · `public.users` carries Phase-1 scalars only; `notification_prefs` and `avatar` become satellite tables

**Context (as it was then):** Official spec §3.1 lists the User record: id, email, display_name, avatar, timezone, day_close_time, review_reminder_time, notification_prefs, wake_anchor_habit_id. The ticket routed the column list to Mason with a recommendation.
**Options weighed:** A — every §3.1 field as a column, with `notification_prefs` as `jsonb` and `avatar` as a storage path. B — scalars as columns; `notification_prefs` and `avatar` as satellite tables the feature epics define. C — a single `preferences jsonb` blob for everything editable.
**Decision:** B, as recommended. `notification_prefs` is one row per catalogue entry (spec §8.4 gives a toggle per row of the §8.2 catalogue, plus two time pickers) — that is a table, and putting it in `jsonb` means every new notification type is a migration of a blob shape nothing validates. `avatar` is a file with a bucket, a MIME allowlist, and a size cap; it is a row with a storage path, not a string. C was rejected outright: a preferences blob is the shape that makes "what is the default for a person who signed up in March" unanswerable.
**Consequences:** Buys a `users` table that is all typed scalars with real defaults, so the trigger-created row is immediately valid and the first-run flow has somewhere to resume from (`first_run_step`, `first_run_completed_at`). Costs two more tables when those epics land. `wake_anchor_habit_id` ships as a bare `uuid` with **no** foreign key, because `habits` does not exist — the feature tech spec's first migration adds `REFERENCES habits(id) ON DELETE SET NULL`, and until it does nothing enforces that the id points at a real habit.
**Revisit trigger:** the feature tech spec, which adds the FK and both satellites.

## 2026-09-04 · INF-5 · `web_push_subscriptions` ships in the foundation, not in INF-9

**Context (as it was then):** The PWA ticket (INF-9) needs exactly one table. The ticket routed the placement to Mason with a recommendation.
**Options weighed:** A — define it here, in migration `0000`. B — define it in INF-9, which would then generate migration `0001`.
**Decision:** A, as recommended. A ticket that ships a route handler and a service worker should not also be authoring a migration and waiting on a human to apply it — that turns a UI ticket into a database ticket with a review gate in the middle. Landing it here means INF-9 is code against a schema that already exists on every tier.
**Consequences:** Buys INF-9 a clean dependency and keeps the foundation's migration count at one. Costs a table that sits empty until INF-9 — harmless, and it documents the intent in the schema reference in the meantime. It also puts the `device_platform` enum in the foundation, where the `@syn/validators` push schema's `platform` union can be checked against it.
**Revisit trigger:** none.
