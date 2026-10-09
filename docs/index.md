# The map

Synapse's folders, the precedence ladder, what loads when and the token budget. Every agent reads this file first, every session. The host's own one-line-per-document index is [`README.md`](README.md); the generated tree is [`architecture/directory-map.md`](architecture/directory-map.md).

## Layers

| Layer         | Where                                                                                                                                     | What it is                                                                                       | Loads                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------- |
| Agent context | `AGENTS.md`, `CLAUDE.md`, `.claude/rules/` (the practice's and `house-*`), nested `AGENTS.md` in `apps/web`, `packages/db`, `packages/ui` | What every agent is told                                                                         | always / by path                |
| Workflows     | `workflows/`                                                                                                                              | How work moves: the prompt builder, tracks, stages, QA levels                                    | the builder when work starts    |
| Specs         | `specs/` at the root: `_status.md`, `_shared/epics/`, `web/ux/`                                                                           | Tickets, contracts and the living truth, by the practice                                         | by ticket                       |
| UX source     | `ux/` (its `README.md` is the index)                                                                                                      | Product behaviour until it is promoted to `specs/web/ux/` (layer 3, part 9)                      | by the ladder                   |
| Architecture  | `architecture/`: conventions (locked), tech stack, Drizzle conventions, the generated map                                                 | Placement and stack, Synapse's own contract                                                      | on placement                    |
| Domain guides | `ai-guides/`, `developer-guides/`                                                                                                         | Tokens, typography, components, copy, db and RLS, tRPC; environments, database, migrations, auth | by the `house-*` rules          |
| Decisions     | `decisions/`: `ledger.md`, `changelog.md`, `records/`, `imported/`                                                                        | Why the rules are what they are; `imported/` archives what the practice replaced                 | grep on demand                  |
| Roles         | `roles/`; `.claude/agents/` is generated from them                                                                                        | One prompt per seat                                                                              | injected, or as a subagent      |
| Practice      | `design/`, `engineering/`, `measurement/`, `runbooks/`; checks in `tooling/`                                                              | The canon, the practice's templates and conventions (as reference)                               | by path on UI files; on request |
| Product       | `product/`, `reviews/`                                                                                                                    | Walkthrough notes, the value proposition, the build review                                       | when shaping                    |

## Precedence (highest first)

Enforced checks (lint, types, `yarn verify`, CI), then the session's explicit instruction (the agent names any rule it breaks). Then Synapse's own order, carried verbatim (record 0001):

1. **Product behaviour** → `docs/ux/ux-spec-v1.md` (its **§0.3 rulings are signed**), then the three epic documents and `docs/ux/synapse_navigation_and_system_ux_architecture.md` for their own screens, then `docs/ux/synapse_ui_component_needs_and_handoff_v2.md` for component contracts.
2. **Architecture & placement** → [`docs/architecture/codebase-conventions.md`](architecture/codebase-conventions.md) (locked). Stack choices: [`docs/architecture/tech-stack.md`](architecture/tech-stack.md).
3. **Domain guides** → [`docs/ai-guides/`](ai-guides/) govern their domain (tokens, typography, classnames, components, copy, db/RLS, tRPC) and sit **below** the conventions doc but **above** ad-hoc judgment.
4. **App-specific rules** → the nearest [`AGENTS.md`](../apps/web/AGENTS.md). **Wins on conflict** with the conventions doc for that app (route topology, scope).
5. **Ticket rulings** → each ticket's "Rulings this slice makes", summarised in [`TECHNICAL-DECISIONS.md`](specs/infrastructure/TECHNICAL-DECISIONS.md).
6. **Shipped-work amendments** → [`DEVIATIONS.md`](specs/infrastructure/DEVIATIONS.md) + `TECHNICAL-DECISIONS.md`. On-disk reality + these logs override any stale spec text.

## What loads when

- **Always**, the repo's share of each session (≤4,000 tokens; the tool's own prompt, tools and built-in skills come on top): `AGENTS.md` (≤100 lines), `CLAUDE.md` (shim, ≤20 lines), this file (≤80 lines), the skill and subagent listings (≤12 model-invocable skills, descriptions ≤400 characters), and SessionStart hook output (≤150).
- **By path:**
  - `.claude/rules/ui.md` on UI files loads `canon.md` and the product design layer; `ts.md`, `testing.md`, `next.md`, `turbo.md`, `docs.md`, `specs.md` and `deps.md` load on their globs.
  - Nested `AGENTS.md` files load in `apps/` and `packages/`.
- **By trigger:** `tk-motion` on motion work; `shadcn` on component work; references through `docs/references/README.md`, at most 3 files per task.
- **On request:** roles, templates (when filling one), runbooks, decisions (grep the ledger), prompts, workflows.
- **Never:** `docs/research/` (A11: a Frame, Research or UX prompt may attach one file as `[research: <why>]` when nothing distilled covers it; never a build thread); `docs/references/_meta/` outside a library batch; `PROVENANCE.md` outside a disputed finding; `docs/_generated/`; every `README.md` under `docs/` except the references router and `docs/workflows/README.md`.

## Budget per build

This table is the CI contract read by `tooling/budget.ts`.

| Build                   | Loads                                                                                                   | Cap (tokens) |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | ------------ |
| UI build                | always 4,000 + design layer 5,000 + brief and package 2,000 + references 1,500 + one skill body 2,500   | 15,000       |
| Non-UI build            | always 4,000 + path rules and nested `AGENTS.md` 1,500 + contract and cited spec 5,000                  | 10,500       |
| Critic pass (forked)    | `canon-rubric.md` and canon §2 + the cited surface file + ≤3 exemplars (screenshots excluded)           | 6,000        |
| Evaluator pass (forked) | evaluator body 4,500 + contract and cited spec 5,000 + evidence index 500 (never the builder's summary) | 10,000       |

A product's own design layer gets about 1,700 of the 5,000; `canon.md` takes the rest. A product `DESIGN.md` holds deltas, never restatements.
