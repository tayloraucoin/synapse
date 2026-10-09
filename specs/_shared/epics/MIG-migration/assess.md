# Migration assessment: synapse

- Target: `/Users/taylor/lighthouse/synapse` at `f2bfeb139731477819cde82fd57abfa2b5291eb1`
- Toolkit: `62d344bf4a16d19d88aab55510d615e610ddd094`
- Total: **14** of 34 measured (17 of 17 signals)
- Gate: passed
- Path: **near** (total 14: near up to 15, middle 16 to 21, far from 22)

## Shape

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| S1 | Workspaces and turbo.json | 3 | 0 | workspaces ["apps/*","packages/*"] in the root; turbo.json at the root |
| S2 | Toolchain majors against tech-stack | 3 | 0 | every major found matches the practice |

## Checks

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| C1 | One verify command | 2 | 1 | no verify script; .github/workflows/ci.yml chains lint, types, build |
| C2 | CI config | 2 | 0 | .github/workflows/ci.yml |
| C3 | Tests | 2 | 2 | no test runner; no test files |
| C4 | Type check and lint scripts | 2 | 0 | type check: check-types; lint: lint |
| C5 | Read-only format check | 2 | 1 | write-only: format: prettier --write "**/*.{ts,tsx,md}" |

## Conventions

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| V1 | Boundaries lint | 3 | 0 | packages/config/eslint/boundaries.js is tracked |
| V2 | Token preset | 3 | 0 | packages/config/tailwind/preset.css is tracked |
| V3 | process.env outside env.ts | 3 | 1 | 19 files read process.env outside an env.ts: apps/web/app/(shell)/settings/about/_components/feedback-form.tsx, apps/web/app/(shell)/settings/about/page.tsx, apps/web/app/_components/service-worker-registration.tsx and 16 more |
| V4 | "use client" outside a components folder | 3 | 1 | 137 of 322 "use client" files sit outside a _components/ or components/ folder (43%) |
| V5 | SDK importers no reviewer glob matches | 3 | 1 | 3 of 12 SDK-importing files match no reviewer glob |

## Process

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| P1 | Instruction lines that conflict | 1 | 1 | 5 lines against 2 policies (tests, branches): AGENTS.md:11, AGENTS.md:35 and 3 more |
| P2 | Docs with frontmatter | 1 | 2 | 0 of 216 markdown files under docs/ open with frontmatter (0%) |
| P3 | Record kinds in a foreign format | 1 | 2 | 9 deviation logs, 9 decision logs |
| P4 | Living truth | 1 | 1 | 14 UX spec files outside specs/<app>/ux/: docs/ux/README.md, docs/ux/branding-guide.md, docs/ux/epic1_setup_ux_architecture.md and 11 more |
| P5 | Doc paths with spaces or non-ASCII | 1 | 1 | 6 tracked markdown paths hold a space or a non-ASCII character: Forge—staff-engineer-role-prompt.md, Loom—ai-systems-architect-role-prompt.md and 4 more |

## Conflicts

Instruction lines against a toolkit policy; the interview rules each team or operator.

| Policy | File | Line | Text |
| --- | --- | --- | --- |
| tests | AGENTS.md | 11 | 5. **Verify work** the way CI does: `yarn lint && yarn lint:boundaries && yarn check-types && yarn build` (see Commands). There is **no test suite** — do not write tests during slices. |
| branches | AGENTS.md | 35 | - **No git branches or PRs** as part of slice work; commit to the working branch with clear messages. |
| tests | AGENTS.md | 36 | - **No tests during slices** — tests are a separate finalization pass after human QA. |
| branches | AGENTS.md | 145 | 6. **Commits** — commit to the working branch with clear messages. No branches, no PRs. |
| tests | AGENTS.md | 146 | 7. **Tests** — do not write tests as part of a slice. |

## SDK importers

Money, auth, email and AI SDKs, with the toolkit reviewer glob that reaches the file, or none.

| File | Module | Matched by |
| --- | --- | --- |
| apps/web/lib/auth/get-request-context.ts | @supabase/supabase-js | **/auth/** |
| apps/web/lib/auth/require-verified-email.ts | @supabase/supabase-js | **/auth/** |
| apps/web/lib/clients/supabase/client.ts | @supabase/ssr | none |
| apps/web/lib/clients/supabase/client.ts | @supabase/supabase-js | none |
| packages/api/src/context.ts | @supabase/supabase-js | none |
| packages/auth/src/admin.ts | @supabase/supabase-js | **/auth/** |
| packages/auth/src/client.ts | @supabase/ssr | **/auth/** |
| packages/auth/src/client.ts | @supabase/supabase-js | **/auth/** |
| packages/auth/src/context.ts | @supabase/supabase-js | **/auth/** |
| packages/auth/src/cookies.ts | @supabase/ssr | **/auth/** |
| packages/auth/src/middleware.ts | @supabase/ssr | **/auth/** |
| packages/auth/src/server.ts | @supabase/ssr | **/auth/** |
| packages/auth/src/server.ts | @supabase/supabase-js | **/auth/** |
| packages/auth/src/session.ts | @supabase/supabase-js | **/auth/** |
| packages/db/scripts/seed-users.ts | @supabase/supabase-js | none |

## Records by kind

| Kind | Path | Lines |
| --- | --- | --- |
| host role prompt | docs/roles/engineering/Forge—staff-engineer-role-prompt.md | 146 |
| host role prompt | docs/roles/engineering/Loom—ai-systems-architect-role-prompt.md | 142 |
| host role prompt | docs/roles/engineering/Mason—cto-principle-dev-role-prompt.md | 144 |
| host role prompt | docs/roles/engineering/Vigil—qa-role-prompt.md | 148 |
| host role prompt | docs/roles/engineering/Warden—security-privacy-engineer-role-prompt.md | 143 |
| host role prompt | docs/roles/marketing-growth/Cantor_copywriter-role-prompt.md | 150 |
| host role prompt | docs/roles/marketing-growth/Cantor_ext_human-hand-mode.md | 105 |
| host role prompt | docs/roles/marketing-growth/Hearth_brand-strategist-role-prompt.md | 148 |
| host role prompt | docs/roles/operations-strategy/Crucible_devils-advocate-role-prompt.md | 133 |
| host role prompt | docs/roles/operations-strategy/Pilot_business-advisor-role-prompt.md | 147 |
| host role prompt | docs/roles/operations-strategy/Reeve—project-manager-role-prompt.md | 142 |
| host role prompt | docs/roles/product-design/Compass_product-strategist-role-prompt.md | 151 |
| host role prompt | docs/roles/product-design/Envoy_user-researcher-role-prompt.md | 148 |
| host role prompt | docs/roles/product-design/Tribune_customer-advocate-role-prompt.md | 143 |
| host role prompt | docs/roles/product-design/vesper-ux-ui-designer-role-prompt.md | 146 |
| host role prompt | docs/roles/role-authoring-guide.md | 232 |
| host role prompt | docs/roles/science-clinical/Sage_behavioral-scientist-role-prompt.md | 145 |
| deviation log | docs/specs/cross-cutting-system/DEVIATIONS.md | 75 |
| progress log | docs/specs/cross-cutting-system/PROGRESS.md | 21 |
| decision log | docs/specs/cross-cutting-system/TECHNICAL-DECISIONS.md | 72 |
| deviation log | docs/specs/epic-1-setup/DEVIATIONS.md | 108 |
| progress log | docs/specs/epic-1-setup/PROGRESS.md | 29 |
| decision log | docs/specs/epic-1-setup/TECHNICAL-DECISIONS.md | 210 |
| deviation log | docs/specs/epic-2-in-use/DEVIATIONS.md | 75 |
| progress log | docs/specs/epic-2-in-use/PROGRESS.md | 25 |
| decision log | docs/specs/epic-2-in-use/TECHNICAL-DECISIONS.md | 177 |
| deviation log | docs/specs/epic-3-review/DEVIATIONS.md | 43 |
| progress log | docs/specs/epic-3-review/PROGRESS.md | 17 |
| decision log | docs/specs/epic-3-review/TECHNICAL-DECISIONS.md | 91 |
| deviation log | docs/specs/epic-4-dynamic-schedule/DEVIATIONS.md | 217 |
| progress log | docs/specs/epic-4-dynamic-schedule/PROGRESS.md | 51 |
| decision log | docs/specs/epic-4-dynamic-schedule/TECHNICAL-DECISIONS.md | 294 |
| deviation log | docs/specs/epic-5-first-run-rebuilt/DEVIATIONS.md | 146 |
| progress log | docs/specs/epic-5-first-run-rebuilt/PROGRESS.md | 39 |
| decision log | docs/specs/epic-5-first-run-rebuilt/TECHNICAL-DECISIONS.md | 118 |
| deviation log | docs/specs/epic-6-day-first-first-run/DEVIATIONS.md | 132 |
| progress log | docs/specs/epic-6-day-first-first-run/PROGRESS.md | 35 |
| decision log | docs/specs/epic-6-day-first-first-run/TECHNICAL-DECISIONS.md | 94 |
| deviation log | docs/specs/epic-7-workflow/DEVIATIONS.md | 71 |
| progress log | docs/specs/epic-7-workflow/PROGRESS.md | 29 |
| decision log | docs/specs/epic-7-workflow/TECHNICAL-DECISIONS.md | 65 |
| deviation log | docs/specs/infrastructure/DEVIATIONS.md | 103 |
| progress log | docs/specs/infrastructure/PROGRESS.md | 31 |
| decision log | docs/specs/infrastructure/TECHNICAL-DECISIONS.md | 76 |
| ux spec | docs/ux/README.md | 19 |
| ux spec | docs/ux/branding-guide.md | 429 |
| ux spec | docs/ux/epic1_setup_ux_architecture.md | 765 |
| ux spec | docs/ux/epic2_in_use_ux_architecture.md | 451 |
| ux spec | docs/ux/epic3_review_ux_architecture.md | 374 |
| ux spec | docs/ux/landing-page-ux.md | 499 |
| ux spec | docs/ux/synapse_navigation_and_system_ux_architecture.md | 371 |
| ux spec | docs/ux/synapse_ui_component_needs_and_handoff.md | 372 |
| ux spec | docs/ux/synapse_ui_component_needs_and_handoff_v2.md | 1826 |
| ux spec | docs/ux/ux-spec-v1.1.md | 1097 |
| ux spec | docs/ux/ux-spec-v1.2.md | 755 |
| ux spec | docs/ux/ux-spec-v1.3.md | 643 |
| ux spec | docs/ux/ux-spec-v1.md | 699 |
| ux spec | docs/ux/workflow-ux-spec-v0.1.md | 551 |
| closed spec folder | docs/specs/cross-cutting-system/ | 12 |
| closed spec folder | docs/specs/epic-1-setup/ | 16 |
| closed spec folder | docs/specs/epic-2-in-use/ | 14 |
| closed spec folder | docs/specs/epic-3-review/ | 10 |
| closed spec folder | docs/specs/epic-4-dynamic-schedule/ | 28 |
| closed spec folder | docs/specs/epic-5-first-run-rebuilt/ | 21 |
| closed spec folder | docs/specs/epic-6-day-first-first-run/ | 19 |
| closed spec folder | docs/specs/epic-7-workflow/ | 17 |
| closed spec folder | docs/specs/infrastructure/ | 17 |

## Collisions

Practice paths the target already holds; each stops for a ruling.

- `AGENTS.md`
- `CLAUDE.md`
- `docs/roles/`
- `.claude/settings.json`
- `.github/workflows/`
- `docs/product/`

## Hygiene

Reported, never scored.

- Branch: `feature/pem-migration`; no `refs/remotes/origin/feature/pem-migration`
- Working tree: clean
- Worktrees: /Users/taylor/lighthouse/synapse/.claude/worktrees/beautiful-bhabha-f7c668
- Tracked files over 10 MB: none
