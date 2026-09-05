# Infrastructure — the system foundation: how to work this folder

**Start here before touching the Synapse repo.** This track builds the foundation layer — monorepo, packages, tokens, primitives, database, auth, API, PWA plumbing, environments, CI, and the agent/doc spine — so that feature epics (Setup, In Use, Review) can be ticketed and built on top of it. Nothing in this track ships a product feature; every ticket ships a rail a feature will run on.

**Author:** Vesper (UX), writing the foundation as the design lead who owns the token, primitive, and convention layer, with the architecture calls copied from Conscious Connections rather than invented. **Executor:** an Opus thread per ticket, following the kickoff contract below. **Date:** 2026-09-04.

**The reference codebase is Conscious Connections** at `~/lighthouse/conscious-connections/conscious-connections` (read-only; hereafter "CC"). Every convention in this track is CC's, applied to Synapse. Where a ticket says "copy from CC", it means: open that file, copy it, rename `@cc/*` → `@syn/*` and "Conscious Connections" → "Synapse", strip what the ticket names, and leave the rest — do not reinterpret it. The `taylor-aucoin` repo (`~/lighthouse/taylor-aucoin`) is a secondary reference for two things only: the light/dark theme toggle and its tier-collapse commentary. When the two disagree, CC wins.

---

## Folder layout

| Path | What |
|---|---|
| `README.md` | This file — process contract, precedence, locked scope, non-negotiables, path remap |
| `00-build-order.md` | The ordered, checkable queue with the critical path |
| `INF-1…INF-11-*.md` | One implementable slice each |
| `PROGRESS.md` | The authoritative "what is Complete" view |
| `DEVIATIONS.md` | Append-only: one line per intentional divergence |
| `TECHNICAL-DECISIONS.md` | Append-only: one section per architectural choice with real alternatives |
| `_templates/slice-spec.md` | The blank ticket (CC's template, verbatim) |

---

## Source precedence

When documents disagree, follow this order:

1. **Product behaviour** → `docs/ux/habit_tracker_official_ux_spec_v1.md` (its §0.3 rulings are signed), then the three epic documents and the cross-cutting document for their own screens, then `docs/ux/synapse_ui_component_needs_and_handoff_v2.md` for component contracts (its §10 divergences and §12 calls are logged decisions).
2. **Architecture & placement** → CC's `docs/architecture/codebase-conventions.md` (locked in CC; adopted verbatim here until INF-11 lands the Synapse copy) and CC's `docs/architecture/tech-stack.md`.
3. **Domain guides** → CC's `docs/ai-guides/*` (component-guidelines, classnames, copy-conventions, db-and-rls-authoring, typography-guidelines) and `docs/architecture/drizzle-orm-conventions.md`.
4. **This track's tickets** for foundation-specific rulings, each labelled and logged.
5. **On-disk reality + `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`** override any stale string in a ticket or handoff.

---

## The kickoff contract (one ticket per thread)

```
You are building ONE ticket from docs/specs/infrastructure/: <TICKET-ID>.

OBJECTIVE
Ship the ticket's Acceptance criteria — nothing more (scope creep), nothing less.

BEFORE WRITING CODE
1. State the ticket ID and title in your first message.
2. Confirm every entry in the ticket's "Depends on" shows Complete in PROGRESS.md.
   If any dependency is not Complete, STOP and say so — never build ahead of it.
3. Read the ticket spec end to end, then its attach-list in order. The attach-list
   names files in the Conscious Connections repo at
   ~/lighthouse/conscious-connections/conscious-connections — read them; that repo
   is read-only and is never modified.
4. Read DEVIATIONS.md and TECHNICAL-DECISIONS.md — on-disk reality + those logs
   override any stale string in a spec.

CONSTRAINTS
- Honor every non-negotiable verbatim. If the spec would force you to break one,
  STOP and ask — never silently contradict it.
- "Copy from CC" means copy, rename the scope, strip what the ticket names, keep
  the rest. Do not reinterpret CC's code; if something in it cannot apply to
  Synapse and the ticket did not anticipate it, log a DEVIATIONS.md line.
- Filenames kebab-case; named exports only; Server Components default; client
  leaves in _components/ with "use client" on line 1; routes from lib/routes.ts.
- No feature code. No domain tables beyond what a ticket names. No tests.
- If you modify files owned by an upstream Complete ticket, re-check that ticket's
  affected acceptance criteria before finishing.

DEFINITION OF DONE
1. yarn lint && yarn lint:boundaries && yarn check-types && yarn build pass
   (the ticket may narrow this to the packages that exist at its point in the order).
2. The ticket's Status line set to: Status: Complete (YYYY-MM-DD).
3. PROGRESS.md row + checklist ticked.
4. One DEVIATIONS.md line per divergence: YYYY-MM-DD · <ticket-id> · <what> · <why>.
   Architectural choices with real alternatives → TECHNICAL-DECISIONS.md.
5. yarn directory-map if files were added/moved/removed (once INF-11 lands the script).
6. Close with 3–5 lines: what shipped, deviations, the one thing the next ticket
   must know.

Do not start the next ticket.
```

---

## Completion protocol

Completion is marked in **three places**, every time: the ticket's `Status:` line, the `PROGRESS.md` row and checklist, and `DEVIATIONS.md` (one line per divergence; `TECHNICAL-DECISIONS.md` when a choice had real alternatives). Then, and only then, tick the box in `00-build-order.md`, which mirrors the completion event and is not a separate source of truth.

---

## Locked scope (do not re-litigate)

- **Turborepo + Yarn 4, `@syn/*` packages, `apps/web` + an `apps/mobile` seam.** The repo was re-scaffolded with `create-turbo` on 2026-09-04; INF-1 re-bases it onto CC's shape. The v2 handoff's single-app call (its §3.1, D1) is superseded — see the path remap below.
- **CC's stack, exactly:** Next.js 16 App Router (`proxy.ts`, not `middleware.ts`), React 19, TypeScript strict with `noUncheckedIndexedAccess`, Tailwind v4 CSS-first, Radix via shadcn, CVA + `cn()`, tRPC 11 + superjson, TanStack Query 5, React Hook Form + zod (v3) via `useZodForm`, nuqs, React Context first and Zustand only on escalation, Drizzle ORM (exact-pinned) on Supabase Postgres with RLS, Supabase Auth via `@supabase/ssr`, web-push (VAPID), Storybook 8 (react-vite), Vercel.
- **Two hosted Supabase projects (staging, production) plus local Postgres**, with CC's `DATABASE_ENVIRONMENT` tier grammar and next.config env collapse.
- **Light and dark mode** via `next-themes` class strategy with a System/Light/Dark control.
- **The brand is the official spec §9**, expressed as the token file in the v2 handoff §6.2. CC's brand tokens are never copied.
- **Phase 1 has no AI, no billing, no marketing site, no social surface.** No `@syn/ai` package, no Stripe, no `apps/marketing`. Seams are recorded, not scaffolded.

---

## Non-negotiables (every ticket honours these)

- **One fact, one home.** Tokens live in `packages/config/tailwind/preset.css`; route paths in `apps/web/lib/routes.ts`; env is read in exactly one file per app (`env.ts`); Drizzle versions are pinned at the repo root.
- **Filenames kebab-case, identifiers keep their casing; named exports only** except Next-forced defaults.
- **Server Components default.** Client leaves carry `"use client"` on line 1 and live in `_components/`.
- **The package graph is layered and acyclic** (`config → constants/types/observability → utils → validators → db → auth → api → hooks → ui → apps`) and enforced by `yarn lint:boundaries`.
- **Platform-pure packages stay pure.** No `next/*`, DOM, or Node-only imports in `types`, `constants`, `utils`, `validators`, `hooks`, `observability`. `ui` is the one web-only package. This is what makes the future Expo app a re-skin.
- **Supabase owns `auth.*`, `storage.*`, `realtime.*`.** Drizzle never migrates them; `public.users` is a shadow row created by a trigger.
- **RLS is deny-by-default and user-private.** Synapse's promise is *only you can see your data — not the people who built this*; there are no admin-read policies on user data. Every user-scoped query runs through `ctx.rls.execute()`, never the singleton `db`.
- **Secrets never reach a browser bundle.** Server env is read through `env.ts`; client code reads only `NEXT_PUBLIC_*` literals.
- **Local can never reach production by omission.** The tier defaults to `local` when unset (INF-7 ruling), and `db:reset` refuses any tier but `local`.
- **No tests mid-slice.** Tests are a finalization pass after human QA.

---

## Handoff path remap (v2 handoff §3.1 → this repo)

The v2 component handoff was written against a single-app layout. Its contracts are unchanged; its paths gain a prefix. Read every `Folder:` line in that document through this table.

| v2 handoff path | Synapse repo path |
|---|---|
| `ui/primitives/<kind>/<name>/` | `packages/ui/src/primitives/<kind>/<name>/` |
| `ui/composed/<kind>/<name>/` | `packages/ui/src/composed/<kind>/<name>/` |
| `ui/lib/`, `ui/hooks/`, `ui/providers/`, `ui/styles/globals.css` | `packages/ui/src/{lib,hooks,providers,styles}/` |
| `ui/styles/tokens.css` | `packages/config/tailwind/preset.css` |
| `ui/index.ts` | `packages/ui/src/index.ts` + enumerated subpath exports in `packages/ui/package.json` |
| `components/<name>/` | `apps/web/components/<name>/` |
| `app/**` | `apps/web/app/**` |
| `lib/**` (routes, hooks, pwa, entry, utils, validators, constants) | `apps/web/lib/**` for web-only glue; `packages/{utils,validators,constants}/src/` for anything platform-pure |
| `types/domain.ts`, `types/ui-state.ts`, `types/view.ts` | `packages/types/src/domain/{domain,ui-state,view}.ts` (shared unions the API and the future mobile app need) |
| `.storybook/` | `packages/ui/.storybook/` |
| `components.json` | `packages/ui/components.json` |
| `@/ui/...` imports | `@syn/ui/...` subpath imports (or the `@syn/ui` barrel) |

The handoff's §10 D1 ("single app") is closed by this track; its §11 Q1 is answered: **standalone Turborepo, copy-and-adapt from CC, never an `@cc/ui` import.**

---

## Canonical paths & known-stale warnings

- The `create-turbo` scaffold created `apps/docs` and `packages/{eslint-config,typescript-config,ui}` under the `@repo/*` scope with TypeScript 7, Node ≥24, ESLint 10. **All of that is replaced by INF-1.** Nothing from the scaffold except `apps/web`'s existence is kept.
- `docs/ux/synapse_ui_component_needs_and_handoff_v2.md` was missing when this track was written; Taylor restored it on 2026-09-04, before INF-3. It is on disk and authoritative. INF-2's type unions were transcribed from the official spec before it landed and were rewritten to its §3.5 the same day — see `DEVIATIONS.md`.
