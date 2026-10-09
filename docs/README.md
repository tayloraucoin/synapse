# Documentation index

One line per document. Start with [`../AGENTS.md`](../AGENTS.md) — it is the
instruction spine and carries the precedence ladder these documents sit in.

---

## `ux/` — product behaviour (the source of truth)

Never edited. See [`ux/README.md`](ux/README.md) for what each covers; in short:

| Document | What |
|---|---|
| [`ux-spec-v1.md`](ux/ux-spec-v1.md) | **The authority.** Data model, all three epics, notifications, brand (§9), copy (§10), a11y floor. Its §0.3 rulings are signed. |
| [`ux-spec-v1.1.md`](ux/ux-spec-v1.1.md) | **v1.1 — accepted 2026-09-12.** Blocks, the twelve-screen first run, the orient frame, the quick-pick, the editable Schedule, Adjust, the evening, Mason's data model, the open-items table. Mobile walk-through per screen. Supersedes v1 for the sections it rewrites; built by `specs/epic-4-dynamic-schedule/`. |
| [`ux-spec-v1.2.md`](ux/ux-spec-v1.2.md) | **v1.2 — draft 2026-09-16.** The first run rebuilt from the v1.1 walkthrough: fourteen screens ending in a day builder and the week; work-day types, steps, versions, travel, passages and a quote bank, day plans, two morning modes, a journal reminder, emoji on the person's nouns, optimistic-and-save-as-you-go guardrails. Rulings R28–R43. Supersedes v1.1 for what it rewrites. |
| [`ux-spec-v1.3.md`](ux/ux-spec-v1.3.md) | **v1.3 — draft 2026-09-24.** The first run built day-first from the v1.2 walkthrough: five screens with the day builder as the middle (B1–B17); the blocks primer and block hues; a plan that owns its work; per-day times; the after-work transition; several workouts a day; fixed events with place and travel; the free-time library and pool; links on the frame; the quote after the journal; *Usually*; the selection grammar and the other frame amendments. Rulings R44–R68; open items §13 #31–#43. Supersedes v1.2 for what it rewrites. |
| [`workflow-ux-spec-v0.1.md`](ux/workflow-ux-spec-v0.1.md) | **Workflow v0.1 — draft 2026-10-03.** A second feature area beside the habit day: a board of lanes (groups) by columns (states) for juggling AI-driven threads — the firing toggle and its breathing mark, the one *next*, *first today*, views that own their columns, templates, the queue, screens WF-01…WF-05, the copy deck, component needs. Rulings W1–W19; open items §13. From Taylor's stakeholder notes of the same day. |
| [`epic1_setup_ux_architecture.md`](ux/epic1_setup_ux_architecture.md) | Setup: auth, first run, library, templates, week build, settings. |
| [`epic2_in_use_ux_architecture.md`](ux/epic2_in_use_ux_architecture.md) | In use: the List, the Schedule, sheets, shift, trim. |
| [`epic3_review_ux_architecture.md`](ux/epic3_review_ux_architecture.md) | Review: the Day Review, the Week Review, history. |
| [`synapse_navigation_and_system_ux_architecture.md`](ux/synapse_navigation_and_system_ux_architecture.md) | Cross-cutting: navigation, breakpoints, routes, PWA, offline, time, record integrity, the SY screens. |
| [`branding-guide.md`](ux/branding-guide.md) | The brand on one page — colour, type, space, motion, voice, the never list. **Derived from §9/§10 and `preset.css`; not authoritative.** |
| [`synapse_ui_component_needs_and_handoff.md`](ux/synapse_ui_component_needs_and_handoff.md) | The v1 component handoff. Superseded by v2; kept for archaeology. |
| [`synapse_ui_component_needs_and_handoff_v2.md`](ux/synapse_ui_component_needs_and_handoff_v2.md) | **Component contracts.** §3.5 fixes the type unions, §6.2 the token file. |
| [`landing-page-ux.md`](ux/landing-page-ux.md) | The landing page at `/` for a signed-out visitor: design handoff, copy deck, seat reviews, decision log. The one marketing page. |

## `product/` — what Synapse is for, and why anyone would use it

| Document | What |
|---|---|
| [`value-proposition.md`](product/value-proposition.md) | The job, the value exchange, the benefits ladder, differentiation by refusal, what the product can honestly change (graded), how the brand carries it, messaging architecture, fit signatures. Compass, with Sage and Hearth. Draft for ratification. |
| [`2026-09-11-taylor-ux-review-notes.md`](product/2026-09-11-taylor-ux-review-notes.md) | Taylor's first-pass notes over the official spec with reflections — schedule archetypes, chunked templates, transition gaps, primary focus, the morning menu. Working notes, not rulings. |
| [`2026-09-11-vesper-questions-for-ux-v1.1.md`](product/2026-09-11-vesper-questions-for-ux-v1.1.md) | Vesper's intake for UX spec v1.1 — 45 questions over the ledger with Taylor's first-round answers and rulings, eight re-asked plainly in §L. Section K waits on the app walkthrough. |
| [`2026-09-12-app-walkthrough-feedback-v1.0.md`](product/2026-09-12-app-walkthrough-feedback-v1.0.md) | Taylor's testing notes on the v1.0 build, screen by screen, with severity and whether each lands as a v1.0 patch or is absorbed by v1.1. Fills §K of the Q&A. Standing direction: mobile first. |
| [`2026-09-16-first-run-walkthrough-feedback-v1.1.md`](product/2026-09-16-first-run-walkthrough-feedback-v1.1.md) | Taylor's notes on the v1.1 first run, screen by screen (S1.1–S12.2, A1–A3), each with severity, kind (defect · amendment · addition · reversal), a ruling, and where it lands in v1.2. Vesper's answers to the four questions (section emoji, the earliest wake, *habit* vs *step*, what screen 6 was missing). The reversals in one table for the log. |
| [`2026-09-16-ux-v1.2-engineering-handoff.md`](product/2026-09-16-ux-v1.2-engineering-handoff.md) | The same changes for Mason and Reeve: rules to encode, a change inventory by surface with placement, data and door, the one-way doors with decline paths, the defects that can ship first, a sequence sketch, and Taylor's decision queue with defaults. |
| [`2026-09-24-first-run-walkthrough-feedback-v1.2.md`](product/2026-09-24-first-run-walkthrough-feedback-v1.2.md) | Taylor's notes on the v1.2 first run, screen by screen (T1.1–T13.3), his day-first restructure item by item (G1–G16), and his spoken clarifications (C1–C8), each with severity, kind, a ruling (with the cause found in the build where it was a defect), and where it lands in v1.3. The reversals in one table for the log. |
| [`phase-2-collection.md`](product/phase-2-collection.md) | Everything Taylor has said "phase two" to — modules, integrations, content — each with why it waits and what in v1.1 it depends on. Append-only by Taylor's say-so. |
| [`ux-v1.1-thread-primer.md`](product/ux-v1.1-thread-primer.md) | The paste-in primer for the thread that writes UX spec v1.1 — roles, reading order, code to inspect, working steps, and the per-screen walk-through shape. |
| [`marketing-changelog.md`](product/marketing-changelog.md) | Running log of what the marketing surface should change as the UX changes; executed in batches when a UX version warrants it. |

## `architecture/` — how the code is organised

| Document | What |
|---|---|
| [`codebase-conventions.md`](architecture/codebase-conventions.md) | **The locked contract** — placement, naming, the package graph, tRPC rules, the ten rules. |
| [`tech-stack.md`](architecture/tech-stack.md) | Every canonical choice with its pinned version, and what is deliberately absent. |
| [`drizzle-orm-conventions.md`](architecture/drizzle-orm-conventions.md) | The pinned Drizzle syntax — the only syntax an agent may use for schema work. |
| [`directory-map.md`](architecture/directory-map.md) | The full tree, generated by `yarn directory-map`. Never hand-edited. |

## `ai-guides/` — domain conventions

Index: [`ai-guides/README.md`](ai-guides/README.md).

| Document | What |
|---|---|
| [`brand-tokens.md`](ai-guides/brand-tokens.md) | The token lookup: what to type for the thing you mean. |
| [`typography-guidelines.md`](ai-guides/typography-guidelines.md) | Which `Text` variant, and when. |
| [`classnames.md`](ai-guides/classnames.md) | `cn()`, class ordering, the `space-y` trap. |
| [`component-guidelines.md`](ai-guides/component-guidelines.md) | Component anatomy, the `classes` prop, stories. |
| [`copy-conventions.md`](ai-guides/copy-conventions.md) | Voice, `copy.ts` layering, the strings a person reads. |
| [`db-and-rls-authoring.md`](ai-guides/db-and-rls-authoring.md) | The schema and policy checklist. |
| [`trpc-foundation-patterns.md`](ai-guides/trpc-foundation-patterns.md) | Context, the two tiers, error codes, the RLS rule. |

## `developer-guides/` — how to run things

| Document | What |
|---|---|
| [`environments.md`](developer-guides/environments.md) | The tier table and five setup checklists — Supabase, Vercel, GitHub, local, migrations. |
| [`database-setup.md`](developer-guides/database-setup.md) | Getting a database up. Companion to [`../packages/db/SETUP.md`](../packages/db/SETUP.md). |
| [`migrations.md`](developer-guides/migrations.md) | Generating, hand-editing, journalling, applying. Append-only, human-run. |
| [`rls.md`](developer-guides/rls.md) | How policies are authored and how the bridge sets the session. |
| [`authentication.md`](developer-guides/authentication.md) | Sessions, the callback routes, the Supabase dashboard settings. |

## `specs/` — executable work

| Document | What |
|---|---|
| [`README.md`](decisions/imported/specs/README.md) | **Start here for feature work.** The four tracks, the global build order across them, the placement rules every feature ticket obeys, and the cross-track dependencies. |
| [`spec-system-guide.md`](decisions/imported/specs/spec-system-guide.md) | How a ticket is written and worked. |
| [`infrastructure/`](decisions/imported/specs/infrastructure/) | The foundation track — **Complete**: [README](decisions/imported/specs/infrastructure/README.md) · [build order](decisions/imported/specs/infrastructure/00-build-order.md) · [PROGRESS](decisions/imported/specs/infrastructure/PROGRESS.md) · [DEVIATIONS](decisions/imported/specs/infrastructure/DEVIATIONS.md) · [TECHNICAL-DECISIONS](decisions/imported/specs/infrastructure/TECHNICAL-DECISIONS.md). |
| [`epic-1-setup/`](decisions/imported/specs/epic-1-setup/) | `SET-1…10` — the domain schema, auth, library, templates, week build, first run, settings: [README](decisions/imported/specs/epic-1-setup/README.md) · [build order](decisions/imported/specs/epic-1-setup/00-build-order.md) · [PROGRESS](decisions/imported/specs/epic-1-setup/PROGRESS.md). |
| [`epic-2-in-use/`](decisions/imported/specs/epic-2-in-use/) | `USE-1…8` — the day model, the List, the sheets and timers, the Schedule, shift, trim, notifications: [README](decisions/imported/specs/epic-2-in-use/README.md) · [build order](decisions/imported/specs/epic-2-in-use/00-build-order.md) · [PROGRESS](decisions/imported/specs/epic-2-in-use/PROGRESS.md). |
| [`epic-3-review/`](decisions/imported/specs/epic-3-review/) | `REV-1…4` — the resolver, the Day Review, history, the Week Review: [README](decisions/imported/specs/epic-3-review/README.md) · [build order](decisions/imported/specs/epic-3-review/00-build-order.md) · [PROGRESS](decisions/imported/specs/epic-3-review/PROGRESS.md). |
| [`cross-cutting-system/`](decisions/imported/specs/cross-cutting-system/) | `SYS-1…5` — the shell, time zones, About & feedback, keyboard, PWA install and update: [README](decisions/imported/specs/cross-cutting-system/README.md) · [build order](decisions/imported/specs/cross-cutting-system/00-build-order.md) · [PROGRESS](decisions/imported/specs/cross-cutting-system/PROGRESS.md). |
| [`epic-4-dynamic-schedule/`](decisions/imported/specs/epic-4-dynamic-schedule/) | `DYN-1…21` — UX v1.1: the block model, the block editor, first run, the orient frame, the quick-pick, Today by block, the editable Schedule, Adjust, the evening, the amended Review, notifications, the cleanup: [README](decisions/imported/specs/epic-4-dynamic-schedule/README.md) · [build order](decisions/imported/specs/epic-4-dynamic-schedule/00-build-order.md) (with the v1.1 coverage matrix) · [PROGRESS](decisions/imported/specs/epic-4-dynamic-schedule/PROGRESS.md) · [authoring handoff](decisions/imported/specs/epic-4-dynamic-schedule/01-authoring-handoff-remaining-tickets.md) for DYN-7…21. **Complete 2026-09-13.** |
| [`epic-5-first-run-rebuilt/`](decisions/imported/specs/epic-5-first-run-rebuilt/) | `RUN-1…15` — UX v1.2: the contract and migration `0007`, the plan, passage, day-plan and day-side services, the composites, the fourteen setup screens, the day builder, the week and the morning modes, the provisional quotes admin surface, the cleanup: [README](decisions/imported/specs/epic-5-first-run-rebuilt/README.md) · [build order](decisions/imported/specs/epic-5-first-run-rebuilt/00-build-order.md) (with the v1.2 coverage matrix) · [PROGRESS](decisions/imported/specs/epic-5-first-run-rebuilt/PROGRESS.md) · [TECHNICAL-DECISIONS](decisions/imported/specs/epic-5-first-run-rebuilt/TECHNICAL-DECISIONS.md) (Mason's TD-10…TD-20). |
| [`epic-6-day-first-first-run/`](decisions/imported/specs/epic-6-day-first-first-run/) | `DAY-1…13` — UX v1.3: the fix batch, the contract and migration `0009`, the plan and day services, the composites, the five-screen sequence with the primer, the builder in three movements, the week, the frame and the evening, the retirements (`0010`, absorbing RUN-15): [README](decisions/imported/specs/epic-6-day-first-first-run/README.md) · [build order](decisions/imported/specs/epic-6-day-first-first-run/00-build-order.md) (with the build batches and the v1.3 coverage matrix) · [PROGRESS](decisions/imported/specs/epic-6-day-first-first-run/PROGRESS.md) · [TECHNICAL-DECISIONS](decisions/imported/specs/epic-6-day-first-first-run/TECHNICAL-DECISIONS.md) (Mason's TD-23…TD-31). |
| [`epic-7-workflow/`](decisions/imported/specs/epic-7-workflow/) | `FLO-1…10` — Workflow UX v0.1: the contract, the `workflow/` schema domain and migration `0011`, the services and the export, the `@syn/ui` composites, the shell, the board with its toggle and its *next*, tasks and groups, views and columns, the drag, the close-out: [README](decisions/imported/specs/epic-7-workflow/README.md) (kickoff contract, decision queue) · [build order](decisions/imported/specs/epic-7-workflow/00-build-order.md) (with the build batches and the coverage matrix) · [PROGRESS](decisions/imported/specs/epic-7-workflow/PROGRESS.md) · [TECHNICAL-DECISIONS](decisions/imported/specs/epic-7-workflow/TECHNICAL-DECISIONS.md) · Mason's [technology assessment](decisions/imported/specs/epic-7-workflow/01-technology-assessment.md) (TD-33…TD-46). **Complete 2026-10-04.** |

## `reviews/` — what was checked, and what was found

| Path | What |
|---|---|
| [`2026-09-06-full-build-review.md`](reviews/2026-09-06-full-build-review.md) | Mason, Forge and Vigil over all 39 tickets. Verdict, red/orange/yellow findings, the executed-check table, and the recommended order of work. |

## `roles/` — who is reading

| Document | What |
|---|---|
| [`role-authoring-guide.md`](decisions/imported/roles/role-authoring-guide.md) | How a role prompt is written. |
| [`product-design/Vesper-ux-ui-designer-role-prompt.md`](decisions/imported/roles/product-design/Vesper-ux-ui-designer-role-prompt.md) | Vesper — UX/UI design. |
| [`engineering/Mason—cto-principle-dev-role-prompt.md`](decisions/imported/roles/engineering/Mason—cto-principle-dev-role-prompt.md) | Mason — architecture, placement, the data contract. |
| [`operations-strategy/Reeve—project-manager-role-prompt.md`](decisions/imported/roles/operations-strategy/Reeve—project-manager-role-prompt.md) | Reeve — tickets, sequencing, the logs. |
