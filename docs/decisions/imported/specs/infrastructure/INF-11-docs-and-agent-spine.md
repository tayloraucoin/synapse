# INF-11 — Documentation and the agent spine

**Epic:** INF — Infrastructure · **Phase 4** · Size: M
**Slice type:** The management layer — CC's premise that documentation *is* the management. The failure class is a doc that describes CC instead of Synapse, or a rule stated in two places.

**Status:** Complete (2026-09-04)

---

## Outcome

An agent opening the Synapse repo cold reads `AGENTS.md` and knows the precedence ladder, the guardrails, the commands, the layout, and where every kind of code goes; `docs/README.md` indexes every document with one line; `docs/architecture/` holds Synapse's `codebase-conventions.md` and `tech-stack.md` (CC's, made true for this repo), a generated `directory-map.md`, and the pinned `drizzle-orm-conventions.md`; `docs/ai-guides/` holds the component, classnames, copy, typography, and db/RLS guides with Synapse's brand pointers; `docs/developer-guides/` holds database setup, migrations, RLS, authentication, environments; `docs/ux/` holds the seven UX documents; `docs/specs/` holds the spec-system guide and this track; the two scripts (`directory-map`, `docs:check-links`) run clean; every app and package has its `AGENTS.md`/`CLAUDE.md` pointer where CC has one. No doc says "Conscious Connections" except where it names the reference.

## Why / intent

- **CC `AGENTS.md`** (the spine and the "keeping instructions in sync" rule), **CC `docs/README.md`**, **CC `docs/architecture/{codebase-conventions,tech-stack,drizzle-orm-conventions}.md`**, **CC `docs/ai-guides/*`**, **CC `docs/developer-guides/*`**, **CC `docs/specs/spec-system-guide.md`**, **CC `scripts/{generate-directory-map,check-doc-links}.mjs`**, **CC `apps/toolkit/AGENTS.md`**, **CC `docs/roles/role-authoring-guide.md`**.
- **v2 handoff §3.2** — the fifteen rules, which become sections of Synapse's conventions doc where CC's text needs a Synapse example.
- **What this slice is NOT (binding):** no feature specs, no tickets for epics, no role prompts beyond copying Vesper's universal prompt into `docs/roles/product-design/`.
- **Ground truth:** INF-1 left skeleton `AGENTS.md`/`README.md`/`CLAUDE.md`; INF-10 wrote `environments.md`; `docs/ux/` has six documents and a README noting the seventh.

**Rulings this slice makes (labelled, logged):**

- **`codebase-conventions.md` is CC's, edited for truth, not rewritten**: `@cc` → `@syn`; `toolkit` → `web`; the `ai` package and every AI-flow paragraph removed; the couple/tool subpath section (§4B) removed; `mobile` seam kept; the ten rules kept verbatim; §11's table regenerated for Synapse paths. Status line "Locked". Logged.
- **`branding-design-system.md` is not copied.** Synapse's visual authority is the official spec §9; `docs/ai-guides/README.md` points there and to the token file. A short `docs/ai-guides/brand-tokens.md` maps the spec's names to the CSS variables and the Tailwind utilities (the `@theme inline` table) so agents can find `bg-paper` without reading the CSS. Logged.
- **`spec-system-guide.md` is copied verbatim into `docs/specs/`** with the CC-specific examples left as examples (they are illustrations, not law) and a one-paragraph preface saying so. Logged.
- **Role prompts:** `docs/roles/product-design/vesper-ux-ui-designer-role-prompt.md` = the universal Vesper prompt (`~/Documents/universal-roles-files/product-design/Vesper—ux-ui-designer-role-prompt.md`), plus CC's `role-authoring-guide.md`. Other roles arrive when commissioned. Logged.

## Behaviour & states

**No surface.**

### Files (exact)

- `AGENTS.md` (root) — complete CC's structure: Start here (read order: app `AGENTS.md` → conventions → the official spec + the epic doc for the surface → the ticket); Source precedence (README § Source precedence, verbatim); Hard guardrails (never scaffold `apps/mobile`; `docs/archive/**` read-only when it exists; `DEVIATIONS.md`/`TECHNICAL-DECISIONS.md` append-only; migrations append-only, human runs `db:migrate`; never hand-edit `directory-map.md`; no branches/PRs during slices unless the track says so; no tests during slices; product non-negotiables = official spec §2.4 guardrails 1–8 and §10.4 "what the product never says"); Commands (the root scripts); Key docs table; Monorepo map (`apps/web`, `apps/mobile`, the eleven packages); Environment & tooling; Import boundaries (the layer order and the hard bans); Shell command conventions (CC's, verbatim); UI (Storybook-first; audit `@syn/ui` first); Briefing an agent session; Keeping instructions in sync.
- `apps/web/AGENTS.md` — CC toolkit's shape: the Next 16 banner, scope guardrails (Phase 1 per official spec §12; Phase 2 not built), product non-negotiables (spec §2.4), the canonical route map (cross-cutting §4.1 as the table, with the three route groups), the folder layout, stack reminders, "Real schema names" pointing at `packages/db/SCHEMA_REFERENCE.md`. `apps/web/CLAUDE.md` → `@AGENTS.md`. `packages/ui/AGENTS.md` — component-guidelines pointer plus the handoff path remap. `packages/db/AGENTS.md` — db-and-rls-authoring pointer plus the hosted-migration rule.
- `README.md` (root) — final.
- `docs/README.md` — CC's index shape with Synapse's sections: `architecture/`, `ux/`, `specs/`, `ai-guides/`, `developer-guides/`, `roles/`.
- `docs/architecture/codebase-conventions.md`, `tech-stack.md` (versions from the lockfile; the table rows Synapse has; "Testing: none yet — deliberate"), `drizzle-orm-conventions.md` (CC's verbatim; the package layout paragraph edited to Synapse's domains "to be added by the feature tech spec"), `directory-map.md` (generated).
- `docs/ai-guides/{README,component-guidelines,classnames,copy-conventions,typography-guidelines,db-and-rls-authoring,brand-tokens}.md` — CC's four guides edited (brand references → spec §9; `Eyebrow`/`Headline`/`Sub` → `Text`, `Heading`, `Caption`, `Meta`; `darkBackground` paragraphs removed; the `classes` prop, `cn()` chunking, `space-y` warning, `copy.ts` layers, Storybook conventions kept). `brand-tokens.md` new.
- `docs/developer-guides/{database-setup,migrations,rls,authentication}.md` — CC's edited (tiers, `local` default, owner-private RLS table, no couples/admin); `environments.md` from INF-10.
- `docs/specs/spec-system-guide.md` — CC's with the preface. `docs/specs/infrastructure/` — this track, unchanged.
- `docs/roles/product-design/vesper-ux-ui-designer-role-prompt.md`, `docs/roles/role-authoring-guide.md`.
- `scripts/generate-directory-map.mjs`, `scripts/check-doc-links.mjs` — copy CC's; the `ANNOTATIONS` map rewritten for Synapse paths (a note on each load-bearing file this track created); `COLLAPSE` rules for `packages/db/migrations` kept; root `package.json` gains `directory-map` and `docs:check-links`.
- `docs/ux/README.md` — the `[NEEDS VALUE AT BUILD]` line for the v2 handoff resolved (the file present) or escalated.

**States (exhaustive):** `yarn docs:check-links` exits 0 · `yarn directory-map` regenerates without drift warnings · `grep -rn "Conscious Connections" docs AGENTS.md README.md apps packages` returns only lines that name CC as the reference.

## Non-negotiables (this slice)

- **One fact, one home.** Shared agent guidance is written only in root `AGENTS.md`; `CLAUDE.md` files are one-line pointers; app/package `AGENTS.md` files add only local rules.
- **Docs are true to the tree.** Every path in every doc resolves (`docs:check-links`); every command in `AGENTS.md` exists in `package.json`.
- **Never edit a spec to match what shipped**; the track's `DEVIATIONS.md` carries it.
- **`docs/ux/` is never edited** except its README.

## Data & AI

**Schema changes: none.** **Tables:** none. **Placement:** as listed. **tRPC / validators:** none. **AI notes: None.** **Instrumentation: none.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. `yarn docs:check-links` exits 0; `yarn directory-map` runs and reports no stale annotations.
2. Root `AGENTS.md` has every CC section; every command it lists exists in root `package.json`; every path it lists exists.
3. `apps/web/AGENTS.md`'s route table matches `apps/web/lib/routes.ts` builder for builder.
4. `grep -rn "@cc/\|toolkit\|couple\|Cormorant\|Jost" docs/architecture docs/ai-guides docs/developer-guides AGENTS.md README.md` returns nothing.
5. `docs/README.md` has one line per file under `docs/` (excluding `docs/ux/` bodies, which its own README covers).
6. `docs/ux/synapse_ui_component_needs_and_handoff_v2.md` is present, or `docs/ux/README.md` carries an escalation dated in the ticket thread.
7. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- CC's `generate-directory-map.mjs` sources from `git ls-files`; untracked new files appear, ignored ones don't — commit before running.
- The conventions doc's §11 quick-reference table is what agents paste into sessions; get its paths exactly right.

## Dev's call

Wording throughout, within the copy rule that Synapse documentation uses the product's own register (official spec §10.1: plain, present, specific; no exclamation marks) even in developer docs.

## Out of scope

- **Feature epic tracks and tickets** — Reeve/Mason, after this track. **Role prompts beyond Vesper** — when commissioned. **`docs/archive/`** — nothing to archive yet; the folder is created only when the first document is superseded.

## Depends on

- **INF-10** — `environments.md` and the final env surface the docs describe. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Editing CC's conventions doc for truth without breaking its rules is judgement work; a cheaper model will either leave CC facts in or rewrite rules it should have kept.

---

### Build kickoff (paste into the session)

> Build **INF-11 — Documentation and agent spine** (attached spec). Model: **Opus**. **CC's `AGENTS.md`, conventions, guides, scripts, and docs index, made true for Synapse; one fact, one home; every link resolves.**
> Attach/read first, in order: this spec · `docs/specs/infrastructure/README.md` · CC `AGENTS.md`, `README.md`, `docs/README.md` · CC `docs/architecture/{codebase-conventions,tech-stack,drizzle-orm-conventions}.md` · CC `docs/ai-guides/*` · CC `docs/developer-guides/{database-setup,migrations,rls,authentication}.md` · CC `docs/specs/spec-system-guide.md` · CC `apps/toolkit/AGENTS.md` · CC `scripts/{generate-directory-map,check-doc-links}.mjs` · CC `docs/roles/role-authoring-guide.md` · `~/Documents/universal-roles-files/product-design/Vesper—ux-ui-designer-role-prompt.md` · `docs/ux/synapse_ui_component_needs_and_handoff_v2.md` §3.2 · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Edit for truth; keep the rules; remove CC-only facts. Close in three places; run `yarn docs:check-links && yarn directory-map && yarn lint && yarn lint:boundaries && yarn check-types && yarn build`.
