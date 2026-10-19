---
title: The practice — map
description: "Read first in every session. The map of the practice in Synapse: what each layer holds, which wins when two disagree, what loads always versus on trigger, and the context budget per build."
layer: decisions
status: ruling
thread: P-A
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-09
supersedes:
load_when: always
---

# The practice

How Synapse is built: the practice (PEM `62d344b`, the default for every shared file) and the product's own layers. Measurement and runbooks: `docs/measurement/`, `docs/runbooks/`, on request.

## Layers

| Layer | Where | What it is | Loads |
| --- | --- | --- | --- |
| Agent context | `AGENTS.md`, `CLAUDE.md`, `.claude/rules/` (with `house-*`), nested `AGENTS.md` | What every agent is told | always / by path |
| Workflows | `docs/workflows/` | How work moves: the prompt builder (the front door), `tracks/`, shared `stages/`, QA levels | the builder when work starts; the rest on request |
| Specs | `specs/`: `_status.md`, `_shared/epics/`, `web/ux/` (the living truth) | Tickets, contracts, how the app works now | by ticket |
| UX source | `docs/ux/`, until MIG-1 promotes it | Behaviour of areas not yet promoted | by the ladder |
| Decisions | `docs/decisions/`: `ledger.md`, `records/`, `changelog.md`, `imported/` | Why the rules are what they are; `imported/` archives what the practice replaced | grep on demand |
| Roles | `docs/roles/<department>/` | One prompt per seat; `.claude/agents/` is generated from them | injected, or as a subagent |
| Design | `docs/design/`; the product layer in `apps/web/docs/design/` | What UI is built and judged by | by path on UI files |
| Engineering | `docs/engineering/`; Synapse's older `architecture/`, `ai-guides/`, `developer-guides/` | Conventions, the stack; checks in `tooling/` | on request; checks always |
| Product | `docs/product/`, `apps/web/docs/product-rules.md` | Framing templates; Synapse's product notes | when shaping |

## Precedence (highest first)

1. **Enforced checks.** Lint, types, tests, `yarn verify`, CI.
2. **The session's explicit instruction.** The agent names any rule the instruction breaks.
3. **The design layer.** `canon.md` is the floor. The product's DESIGN, tokens, components, states and anti-patterns (`apps/web/docs/design/`) and `apps/web/docs/product-rules.md` may tighten it, never loosen it.
4. **Accepted decisions** in `docs/decisions/`, including the imported `TECHNICAL-DECISIONS.md` and `DEVIATIONS.md` logs: on-disk reality and these logs beat any stale spec text.
5. **The brief, the UX spec and the contract.** `specs/web/ux/`, or `docs/ux/` for an area not yet promoted. They may request an exception; they never grant one. Stage files (`docs/workflows/stages/`) sit at rung 2 with the session's instruction: their interview mode governs behaviour, never law.
6. **References.**
7. **Role judgment.** It fills silences, labeled as judgment.

A nested `AGENTS.md` adds rules for its folder, never loosening these.

## What loads when

- **Always**, the repo's share of each session (≤4,000 tokens; the tool's own prompt, tools and built-in skills come on top): `AGENTS.md` (≤100 lines), `CLAUDE.md` (shim, ≤20 lines), this file (≤80 lines), the skill and subagent listings (≤12 model-invocable skills, descriptions ≤400 characters), and SessionStart hook output (≤150).
- **By path:**
  - `.claude/rules/ui.md` on UI files loads `canon.md` and the product design layer; `ts.md`, `testing.md`, `next.md`, `turbo.md`, `docs.md`, `specs.md`, `deps.md` and the `house-*` rules load on their globs.
  - Nested `AGENTS.md` files load in `apps/` and `packages/`.
- **By trigger:** `tk-motion` on motion work; `shadcn` on component work; references through `docs/references/README.md`, at most 3 files per task. Not in Synapse yet (PEM's knowledge body).
- **On request:** roles, templates (when filling one), runbooks, decisions (grep the ledger), prompts, workflows.
- **Never:** `docs/research/` (A11: a Frame, Research or UX prompt may attach one file as `[research: <why>]` when nothing distilled covers it; never a build thread); `docs/references/_meta/` outside a library batch; `PROVENANCE.md` outside a disputed finding; `docs/_generated/`; every `README.md` under `docs/` except the references router and `docs/workflows/README.md`.

## Budget per build

This table is the CI contract read by `tooling/budget.ts`.

| Build | Loads | Cap (tokens) |
| --- | --- | --- |
| UI build | always 4,000 + design layer 5,000 + brief and package 2,000 + references 1,500 + one skill body 2,500 | 15,000 |
| Non-UI build | always 4,000 + path rules and nested `AGENTS.md` 1,500 + contract and cited spec 5,000 | 10,500 |
| Critic pass (forked) | `canon-rubric.md` and canon §2 + the cited surface file + ≤3 exemplars (screenshots excluded) | 6,000 |
| Evaluator pass (forked) | evaluator body 4,500 + contract and cited spec 5,000 + evidence index 500 (never the builder's summary) | 10,000 |

A product's own design layer gets about 1,700 of the 5,000; `canon.md` takes the rest. A product `DESIGN.md` holds deltas, never restatements.

## Changing the practice

- Amend the file. A change to a file that came from PEM also gets an entry in `docs/pem/adaptations/`.
- Add a `changelog.md` entry; a ledger line only for a ruling others will cite; a record in `records/` only for a choice that is hard to undo.
- Nothing lives in two places.
