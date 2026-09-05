# Infrastructure — Build Order

**New here? Read `README.md` first** — process, kickoff contract, completion protocol, precedence. This file is the ordered, checkable build queue.

> Derived from each ticket's `## Depends on`. A ticket may start only when everything it lists shows **Complete** in `PROGRESS.md`. If this file and a ticket's `## Depends on` disagree, **the ticket wins** — fix this file.

## How to work this file

1. Find the next unchecked ticket. 2. Confirm its gate in `PROGRESS.md`. 3. Build one ticket per thread. 4. On done, close in three places, then tick here.

## Critical path (sequential)

INF-1 → INF-2 → INF-5 → INF-6 → INF-7 → INF-8 → INF-10

Everything a feature epic needs to run end to end (a signed-in page that reads a user-scoped row through tRPC and RLS, in staging and production) lies on that line. INF-3, INF-4, INF-9, and INF-11 hang off it and can trail.

## Build-order checklist

### Phase 0 — Repo shape
- [x] **INF-1** · Monorepo re-base onto CC's shape — L · (none) · Mason review of the version pins

### Phase 1 — Platform-pure packages and the vocabulary
- [ ] **INF-2** · Leaf packages: `types`, `constants`, `utils`, `validators`, `observability` — M · (INF-1)
- [ ] **INF-3** · Design tokens, theme, typography primitive, Storybook — L · (INF-2) · Vesper review
- [ ] **INF-4** · shadcn primitives: install, re-slot, story — L · (INF-3) · Vesper review

### Phase 2 — Data and identity
- [ ] **INF-5** · `@syn/db`: Drizzle, connection tiers, RLS bridge, shadow users, setup SQL — L · (INF-2) · Mason migration review; human runs `db:migrate`
- [ ] **INF-6** · `@syn/auth`: Supabase Auth factories, session refresh, callbacks — L · (INF-5)

### Phase 3 — The web app and its rails
- [ ] **INF-7** · `apps/web` scaffold: env tiers, next.config, proxy, root layout, route skeleton, route builders, entry — L · (INF-3, INF-5, INF-6)
- [ ] **INF-8** · `@syn/api`, `@syn/hooks`, client wiring, client-state conventions — M · (INF-7)
- [ ] **INF-9** · PWA: manifest, service worker, install, push subscription, scheduler — M · (INF-8)

### Phase 4 — Environments, delivery, spine
- [ ] **INF-10** · Environments, CI, Vercel, agent permissions — M · (INF-8)
- [ ] **INF-11** · Documentation and agent spine — M · (INF-10)

## Ordering constraints (alphabetical order hides these)

- **INF-1 precedes everything** — the scope rename (`@repo` → `@syn`), the version pins, and the boundaries lint are what every later ticket's acceptance criteria run against.
- **INF-2 precedes INF-3 and INF-5** — `@syn/ui` imports `@syn/utils`/`@syn/constants`; `@syn/db` imports `@syn/types`/`@syn/utils`. Leaf packages must exist as real workspaces before anything depends on them.
- **INF-5 precedes INF-6** — `@syn/auth` imports `@syn/db` (the shadow-user helper and the RLS context type); building auth first would force a stub that gets rewritten.
- **INF-7 needs INF-3, INF-5, INF-6** — `next.config.ts` imports `buildDatabaseEnvForNextConfig` from `@syn/db` and `buildSupabaseEnvForNextConfig` from `@syn/auth`; the root layout mounts `ThemeProvider` and `Toaster` from `@syn/ui`. A scaffold built before those exist is a scaffold rebuilt.
- **INF-8 after INF-7** — the tRPC fetch adapter, provider, and server caller are app files.
- **INF-9 after INF-8** — the push-subscribe route uses the request-auth helper INF-8 lands; the scheduler route calls an `@syn/api` service.
- **INF-10 after INF-8** — CI's `yarn build` must have a real app to build; the Vercel project needs the env matrix INF-7/INF-8 finalise.
- **INF-11 last** — the directory map and docs index describe what exists; generating them earlier produces a stale map on day one. (Root `AGENTS.md`, `README.md`, and `CLAUDE.md` skeletons land in INF-1 so agents have a spine from the first ticket.)
- **INF-4 is not on the critical path** — feature epics need the primitives, but INF-7's route skeleton renders plain elements; do not block the app scaffold on the full primitive set.

## Full dependency table

| Ticket | Complete-required dependencies |
|---|---|
| INF-1 | — |
| INF-2 | INF-1 |
| INF-3 | INF-2 |
| INF-4 | INF-3 |
| INF-5 | INF-2 |
| INF-6 | INF-5 |
| INF-7 | INF-3, INF-5, INF-6 |
| INF-8 | INF-7 |
| INF-9 | INF-8 |
| INF-10 | INF-8 |
| INF-11 | INF-10 |

## Ticket-authoring batches

All eleven tickets are authored in this pass (2026-09-04). No further authoring is scheduled for this track; feature epics get their own tracks.

## Locked references (do not re-litigate)

- **Decisions:** official spec §0.3 R1–R7; v2 handoff §10 D2–D15 and §12; this track's rulings (each ticket's "Rulings this slice makes"), summarised in `TECHNICAL-DECISIONS.md` at closure.
- **Binding law:** README § Non-negotiables; CC `codebase-conventions.md` §0 (the ten rules), §6 (import matrix), §7 (naming), §8 (component anatomy).
- **Launch-blocking set:** none in this track — the whole track gates feature work, not launch.
- **What does not gate:** INF-4 (primitives) does not gate INF-7; INF-9 (PWA) and INF-11 (docs) do not gate any feature epic's *first* ticket, only its notification and documentation tickets.
