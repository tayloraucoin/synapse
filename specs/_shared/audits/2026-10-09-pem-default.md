# Audit: PEM as the default for every shared file

- **Date:** 2026-10-09. **For:** Taylor, as the file-by-file table the rebuild threads act on (context for other work).
- **Lead:** Usher. **Consulted:** Scribe (placement), Mason (conventions).
- **Compared:** PEM `62d344b` against Synapse committed at `dfd67ee`, over `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/`, `.claude/` and `tooling/`.
- **QA:** Q0.
- **Evidence labels:** V = diffed or read; J = judgment; S = secondary (a sub-agent's report, spot-checked where marked).

## Verdict

Not ready as migrated. Ruling 42 kept a "locked" conventions doc above PEM, and much of that doc describes Conscious Connections domains Synapse never had. The tracked settings and the age gate also fell short of PEM's floor. Tier A, the 16 shared files that differed, was rewritten to PEM's version with named adjustments on 2026-10-09 (Taylor: "Do the A tier for now"). Tiers B to E are pending, as are the rulings R1 to R8.

## Counts

| Group | Count |
|---|---|
| Shared paths | 459 |
| Shared and differing | 16, every one a `derive` entry in PEM's migrate manifest |
| Synapse-only | 237; the starting measure of 231 missed six imported role files whose names contain an em dash |
| PEM-only | 291, none under `specs/` |

| Flag | Rows |
|---|---|
| black | 0 |
| red | 8 |
| orange | 12 |
| yellow | 17 |
| grey | 17 |

## Findings by tier

### A. The 16 shared files that differed: done 2026-10-09

The adjustments are named in [`docs/pem/adaptations/2026-10-09-migration-kept-host-versions.md`](../../../docs/pem/adaptations/2026-10-09-migration-kept-host-versions.md).

| Path | Verdict | Flag | State |
|---|---|---|---|
| `AGENTS.md` | PEM default; Synapse facts, conventions exceptions and platform split kept; House rules not yet re-homed kept (V) | red | done |
| `CLAUDE.md` | PEM default (V) | yellow | done |
| `README.md` | PEM's shape with Synapse facts; stale status and pre-`verify` chain gone (V) | orange | done |
| `docs/README.md` | PEM's "Start here" page (V) | orange | done |
| `docs/index.md` | PEM's map and seven-rung ladder; imported logs at rung 4, `docs/ux` at rung 5 until MIG-1 (V) | red | done |
| `.claude/rules/ts.md` | PEM text; ruling 42's "wins on any conflict" line gone (V) | red | done |
| `.claude/rules/ui.md` | PEM text with Synapse's paths (V) | yellow | done |
| `.claude/rules/next.md` | PEM text; "never `app/_components/`" back, with 3 entries for MIG-8 to move (V) | orange | done |
| `.claude/rules/testing.md`, `turbo.md` | Named adjustments: no capture harness yet; MIG-3's env hashing (V) | grey | kept |
| `.claude/settings.json` | PEM's floor rows added; Synapse's hosts kept; rulings-22 operator rows unchanged (V) | red | done |
| `tooling/tsconfig.json` | Extends `@syn/config/tsconfig/base.json` (V) | yellow | done |
| `ledger.md`, `changelog.md`, `refs-pending.json` | Per-repo by design; `refs-pending` shrinks as brought files arrive, each in the commit that brings them (V) | grey | kept |
| `tooling/hooks/fixtures/bash-guard.json` | PEM default (V) | grey | MIG-13 |

### B. docs/ux: read only; another thread is moving it

Since the sweep, another thread has moved v1, v1.1 and v1.2, the epic architecture docs and the v1 component handoff to `docs/decisions/imported/` (its changelog entry, uncommitted). At the sweep, only `_global` was approved, `auth` was drafted, and six areas had no files.

| Path | Verdict | Flag | Owner |
|---|---|---|---|
| `docs/ux/` | Stays until MIG-1 closes. Its exit changes ladder rung 5 in the same commit. Where it goes (`imported/ux` or legacy) is R3 (S) | yellow | MIG-1 |
| `branding-guide.md`, `docs/ux/README.md` | Not truth; legacy after MIG-1. The v2 handoff's component contracts are only thinly covered in `apps/web/docs/design/components.md` (S/J) | yellow | MIG-1, MIG-9 follow-up |

### C. Conventions (Synapse-only)

| Path | Verdict | Flag | Owner |
|---|---|---|---|
| `docs/architecture/codebase-conventions.md` | To legacy. Large parts are Conscious Connections (V: `chat-session/`, `agreement/`, `safety/` at lines 233–236). Its "client leaves in `_components/`" is contradicted by the code (V: 105 client files in `components/<domain>/`, 79 in `_components/`). Named adjustments keep (S): the Expo split, `ui→hooks`, services in `@syn/api`, two tRPC tiers, user-private RLS, the `@syn/ui` barrel (time-limited) | red | P3 |
| `docs/architecture/tech-stack.md` | Its pins replace the content of `docs/engineering/tech-stack.md`. `deps.md` currently sends agents to PEM's stack (zod 4, base-ui, Storybook 10) (S) | orange | P3 |
| `drizzle-orm-conventions.md` | Synapse specifics to `packages/db`; the generic syntax upstream to PEM (S) | yellow | P3, P7 |
| `directory-map.md`, `house-directory-map.md` | PEM's generator and path; it skips under overlay today (R6) (S) | yellow | P3 |
| `ai-guides/db-and-rls-authoring.md`, `trpc-foundation-patterns.md` | To `packages/db/AGENTS.md` and a new `packages/api/AGENTS.md`: they hold the user-private rules, and no ticket owns them (S) | orange | P3 |
| `ai-guides/classnames.md`, `copy-conventions.md`, `README.md` | Add to MIG-21 (S) | yellow | MIG-21 |
| `ai-guides/` brand-tokens, typography, component-guidelines | As MIG-21 drafts them (S) | grey | MIG-21 |
| `developer-guides/rls.md` | To legacy now: describes `super_admin`, couple-scoped policies and `verify-admin.ts`, none of which exist (V) | red | P4, MIG-22 |
| `developer-guides/authentication.md` | Trimmed by MIG-22, then an app runbook (S) | grey | MIG-22 |
| `developer-guides/database-setup.md`, `migrations.md` | Into `packages/db`; originals to legacy (S) | yellow | P3 |
| `developer-guides/environments.md` | Checklists kept. The tier model conflicts with PEM §5 (R5) (S) | orange | R5 |
| `developer-guides/remove-supabase-auth.md` | To PEM's path `docs/runbooks/remove/supabase-auth.md`; repoint `toolkit.json` (S) | grey | P3 |
| `house-api`, `house-db`, `house-auth`, `house-env` | Retire once their content sits in the nested `AGENTS.md` files (S) | yellow | P3 |
| `house-deps` | Drop (S) | grey | P3 |
| `house-records` | Keep (J) | grey | none |
| `house-ui` | MIG-21 (S) | grey | MIG-21 |
| `AGENTS.md` House rules still carried | Detail below this table (S/J) | orange | P3, R1, R4 |

The House rules still carried in `AGENTS.md`:
- **Move:** "never scaffold mobile" to `apps/web/AGENTS.md`; Phase 1 absences to tech-stack.
- **Keep:** RLS and product-rules, as pointers.
- **Needs a ruling:** "never re-litigate §0.3" (R4) and "superseded docs go to `docs/archive/`" (R1).

### D. Other Synapse-only docs

| Path | Verdict | Flag | Owner |
|---|---|---|---|
| `docs/product/`: six dated notes, v1.1 primer | To legacy (S) | grey | P4 |
| `docs/product/marketing-changelog.md` | Open entries to the landing surface; file to legacy (J) | yellow | P4, MIG-1 |
| `phase-2-collection.md`, `value-proposition.md` | To `apps/web/docs/` (J) | yellow | P4 |
| `docs/reviews/2026-09-06-full-build-review.md` | To `specs/web/audits/` (S) | grey | P4 |
| `docs/pem/` | Keep as an adjustment, the sync log PEM lacks. Needs frontmatter and an inbound link (S) | yellow | P7 |
| `docs/decisions/imported/` (183), `records/0001` | Stay: PEM's archive slot (V) | grey | none |

### E. PEM-only (bring 268, leave 23)

| Family | Verdict | Flag | Owner |
|---|---|---|---|
| `research` 44, `prompts` 18, `references` 4 | Bring, byte for byte. No broken links. Restores the references router the index names. About 1.4 MB, while the docs-app search index is already past record 0007's 5 MB trigger (S) | orange | P5 |
| `runbooks` | Bring 12 (README, `add/*`, `migrate/*`, `postmortem/*`, release, variant-testing, branding-process). Leave 15 starter-only ones, with their 8 links listed in refs-pending (R7) (S) | yellow | P5 |
| Records 0002–0012, decisions README, `conflicts.md`, `decision.template.md` | Bring at PEM's paths. 34 citations and 30 CF-ids resolve nowhere today, and the records README has 12 dead rows. PEM's 0001 goes under `docs/pem/`; Synapse's next record is 0013 (R2). Leave `only-you.md` (S) | orange | P5 |
| `measurement`, `engineering`, `product` READMEs; `engineering/tooling.md`; `component-sources.md` | Bring (S) | grey | P5 |
| `docs/_generated/` | Leave and regenerate (R6) (S) | grey | none |
| Skills: `REGISTRY.md`, `tk-motion`, `tk-ui-critic`, `tk-ui-diverge` | Bring. The skills folder is protected, so Taylor lands them. `tk-motion` needs `--motion-*` tokens the preset lacks (S) | orange | P5, Taylor |
| Tooling | Bring 13 tests that pass unmodified, plus `check-client-bundle`, `check-ui-layout`, `migrate-assess`, `contrast-audit`, `critic-verdict` and their fixtures. Add `test:tooling` to `verify` (V: it is absent). Leave the `boundaries`, `token-lint` and `preset-tokens` tests, `check-catalog`, `local-dev-origins`, `print-local-urls` (S) | orange | P5 |
| `.yarnrc.yml` | `deps.md` asserts a 7-day age gate that is not set (V) | red | one-off |

## Rulings pending (Taylor)

| # | Question | Recommended |
|---|---|---|
| R1 | One legacy folder: today `docs/archive/` (named in 6 places, never created), `docs/decisions/imported/`, and the brief's `docs/_legacy/` | `docs/_legacy/`, with the House rule, `check-doc-links` skip list, MIG-2 and MIG-21 amended in one commit; `imported/` stays as PEM's archive |
| R2 | Where PEM's records land, given both repos have a record 0001 | PEM's 0002–0012 at their paths; PEM's 0001 under `docs/pem/`; Synapse continues at 0013 |
| R3 | Where `docs/ux` goes at MIG-1's close | Follow MIG-1's contract (`imported/ux`), which is PEM's archive |
| R4 | The "never re-litigate §0.3" House rule, given the spec is now treated as a prototype | Drop it; PEM rung 5 says a spec never grants an exception |
| R5 | The env tier model | A record keeping Synapse's model until a ticket adopts PEM's local mirror |
| R6 | Which directory-map generator | PEM's, at `docs/_generated/`, once overlay stops skipping it |
| R7 | The 15 starter-only runbooks | Leave them out; list their links in refs-pending |
| R8 | Run order | The knowledge body before any rewrite that links into it |

## Follow-up prompts, in run order (not yet printed in full)

| # | Prompt |
|---|---|
| P2b | The `.yarnrc.yml` age gate, as a one-off |
| P5 | The PEM knowledge body, records, runbooks, tooling tests and skills (Taylor lands the skills) |
| P3 | Conventions: the named adjustments into nested `AGENTS.md` and a record; the tech-stack swap; MIG-8's objective rewritten to PEM §1; MIG-21 and MIG-22 scope added |
| P4 | The legacy moves, with R1's House-rule amendment |
| P6 | The record superseding record 0001 in part (rulings 41 and 42), in plan mode |
| P7 | Runbook findings to `docs/pem/adaptations/`, and `docs/pem/` registered |

## What was not examined

- Other threads' uncommitted edits during the audit: the narrative UX stage, `check-specs`, fixtures, the `docs/ux` moves and the app files.
- `apps/` and `packages/` beyond the facts cited.
- Whether PEM blocks a reset or push against a hosted database: the grep for those command names was denied by the bash guard and not retried.
- Whether the tier-A text passes a cold-read trial.
