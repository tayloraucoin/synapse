---
epic: USE
status: ratified
role: Mason
---

# Placement

Placement is decided by one question: who imports this? See [`docs/engineering/codebase-conventions.md`](../../../../../docs/engineering/codebase-conventions.md) §1, with Synapse's adjustments in `AGENTS.md`:

- services live in `@syn/api`;
- `@syn/ui` may import `@syn/hooks`;
- page data comes through the tRPC server caller.

Shared logic stays platform-pure; rendering is per platform. Nothing here scaffolds `apps/mobile/`.

## The legacy move (wave 0, one ticket, alone)

Each move is a `git mv`, so history follows the file. A `_legacy/` folder is listed in the `exclude` of its workspace's `tsconfig.json`, in its ESLint ignores and in its Vitest excludes. It is outside Next's `app/`, so nothing in it routes, builds or type-checks. Nothing live may import from `_legacy/`; a boundaries rule says so, and its message gives the fix. A later ticket that needs a legacy file moves it back out with `git mv` and owns it from then on. Orient's content and the journal are the likely first two.

| Moves to legacy                                                                                                                                                                                                               | To                                                         | Stays live                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/app/(shell)/*` route folders (orient, today, day, review, settings, workflow) and `(setup)/`, with the `components/`, `lib/` and `docs/` files that only they import                                                | `apps/web/_legacy/`, keeping their relative paths          | `app/layout.tsx`, `(auth)/`, `(auth-pending)/`, `auth/`, `(shell)/layout.tsx` (the auth gate, rebuilt), `api/trpc`, `api/pwa/push/*`, `api/jobs/scheduler`, `manifest.ts`, `public/sw.js`, `env.ts`, `proxy.ts`, `lib/{trpc,supabase,auth,pwa}`, the generic `lib/hooks/` (`use-online`, `use-dismissed`, `use-remembered-toggle`, `use-now`) |
| `@syn/api` routers and services for the old domains: adjust, category, day, dayPlan, fixture, habit, item, journal, link, passage, quote, reason, review, shell, template, timer, week, workflow, and the jobs that read them | `packages/api/src/_legacy/`                                | `root.ts` (left with `user`, `notification`, `asset`, `feedback`), `context.ts`, `trpc.ts`, `services/user/`, `services/notifications/`, `services/asset/`, the scheduler runner                                                                                                                                                              |
| Nothing in `@syn/db`: an old table missing from the schema would make `drizzle-kit generate` write a `DROP TABLE`                                                                                                             | stays                                                      | Every schema file. New tables go in new folders, and no live code reads an old table unless this folder names it                                                                                                                                                                                                                              |
| Nothing in `@syn/ui`, `@syn/utils`, `@syn/validators`, `@syn/hooks`, `@syn/types`, `@syn/constants`                                                                                                                           | stays                                                      | All of it. `@syn/ui` is the design layer's library. The pure packages cost nothing while unused, and a later sweep can move what nothing imports                                                                                                                                                                                              |
| `specs/web/ux/` areas the old app described                                                                                                                                                                                   | `docs/archive/` at USE's promotion, as the house rule says | `specs/web/ux/_global/` until promotion amends it                                                                                                                                                                                                                                                                                             |

## The shell and the breakpoint

- **One break, `--breakpoint-split: 1024px`.** It goes into `packages/config/tailwind/preset.css` beside `--breakpoint-wide: 768px` (D-USE-83, D-USE-93), and Tailwind 4 makes it the `split:` variant. The JS twin is `useIsSplit()` in `packages/ui/src/lib/use-media-query.ts`. Layout switches in CSS wherever the tree is the same at both widths. `useIsSplit()` is used only where the desk and phone trees differ, so the server render never guesses a width.
- **The new shell lives in `apps/web/app/(shell)/_components/`.**
  - From 1024, the rail: Today, Week, Schedule. Below 1024, `BottomNav`: Now, Schedule, Review (D-USE-74, D-USE-99).
  - Settings is reached through the avatar (D-USE-89).
  - "Workflow (beta)" is not on the rail, because the board is legacy (a bend, [calls.md](calls.md)).
  - `ResponsiveSheet` keeps its 768 switch; from 768 its side sheet is already the desk form (D-USE-103).
- **`/today` is one route at both widths** (D-USE-39, D-USE-50): one server page, with two client layouts under `today/_components/`.

## New paths

| What                                                                                                         | Path                                                                                                                                                             | Consumer                                          | Why here                                                          |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| The fresh schema                                                                                             | `packages/db/src/schema/planner/` (blocks, slots, slot events, to-dos, day records, day events), `work/` (work items, clients), `integrations/` (Linear, Google) | `@syn/api`                                        | The data layer, one folder per domain                             |
| Migration `0012_use_daily`                                                                                   | `packages/db/migrations/0012_use_daily.sql`                                                                                                                      | staging, then production, run by Taylor           | Append-only, after `0011`                                         |
| The clock, Next, fit, session counts, status fill, the while-it-fires pick, client resolution, the pull rule | `packages/utils/src/work/`, `packages/utils/src/planner/`                                                                                                        | services, fixtures, the web, a future Expo client | Pure and platform-free; every device derives the same answer      |
| The repeat rule's expander                                                                                   | `packages/utils/src/planner/rrule.ts`                                                                                                                            | the day read, Set my days                         | Pure, beside the reuse of `day/boundaries.ts`                     |
| Input and wire schemas                                                                                       | `packages/validators/src/{planner,work,todo,linear,google}.ts`                                                                                                   | routers, forms, fixtures                          | One schema per shape, shared by every consumer                    |
| Services and routers                                                                                         | `packages/api/src/services/{planner,work,todos,clients,linear,google}/`, `routers/{planner,work,todo,client,linear,google}.ts`                                   | the web, the scheduler                            | Orchestration in one place; resolvers stay thin                   |
| The ticking clock                                                                                            | `packages/hooks/src/use-work-clock.ts`                                                                                                                           | the web now, Expo later                           | Headless and platform-pure                                        |
| The data hooks (fixture-backed, then tRPC) and the fixtures                                                  | `apps/web/lib/data/` (`use-today.ts`, `use-pool.ts`, …), `apps/web/lib/fixtures/`                                                                                | every surface, `?state=`                          | Web-only: they bind TanStack Query and the URL                    |
| Swipe to fire, visibility, offline persistence                                                               | `apps/web/lib/hooks/`, `apps/web/lib/offline/`                                                                                                                   | the web only                                      | DOM and browser storage                                           |
| Work rows, tiers, the running card, the pool, the Item sheet's parts                                         | `apps/web/components/work/`, `components/planner/`                                                                                                               | Today, Now, Set my days, the Week                 | Importers in more than one section                                |
| Surfaces                                                                                                     | `apps/web/app/(shell)/{today,week,days,orient,settings/connections}/`                                                                                            | each its own segment                              | The ledger's routes; D-USE-6 settles the [PROPOSED] ones as drawn |
| OAuth start and callback                                                                                     | `apps/web/app/api/integrations/{linear,google}/{start,callback}/route.ts`                                                                                        | the provider's redirect                           | Only a route handler can receive a redirect                       |
| Secrets                                                                                                      | `apps/web/env.ts` for the route handlers; `@syn/api`'s env seam (MIG-17) for the services                                                                        | server only                                       | One `env.ts` per workspace, never `NEXT_PUBLIC_*`                 |

## What `@syn/ui` gains

Every addition is presentational only: data comes through props, and each part has a story. The domain wrapper stays in `apps/web/components/`. The ledger names these:

- `FiringMark` (D-USE-47)
- `LinearStatusShape` (D-USE-35)
- `LinearLine`
- the running card's countdown face
- `TierHeading`, if `GroupHeading` cannot carry the tier square

Each one is added to `apps/web/docs/design/components.md` in the ticket that builds it. Nothing domain-aware enters `@syn/ui`.
