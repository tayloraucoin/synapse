# Pre-flight — MIG

> Written by `yarn review:run vigil MIG` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: b3b28f63ea6ec6ae3de543d21a04f7d94cb4788a
- runner: claude 2.1.295 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-fable-5-1
- at: 2026-10-09T20:55:20Z
- tokens_input: 162
- tokens_cache_read: 279118
- tokens_cache_write: 85641
- tokens_output: 11542
- seconds: 136.1

## Verdicts

- MIG-7: PASS (contract 9816346d9afe)
- MIG-8: FAIL (contract 599095ecf6d1)
- MIG-10: FAIL (contract 67393c01fcb8)
- MIG-12: FAIL (contract 3c78c9f611be)
- MIG-13: FAIL (contract 55cbc4a062e8)
- MIG-14: FAIL (contract fd737ecdc712)
- MIG-15: FAIL (contract f009a2f13a52)
- MIG-16: FAIL (contract 2caf29c36bd2)
- MIG-17: FAIL (contract 00f0c4e1ddb1)
- MIG-18: FAIL (contract b03404d6da83)
- MIG-19: FAIL (contract 2358dbb2bd82)
- MIG-20: FAIL (contract 13267e104a97)
- MIG-21: FAIL (contract d83adf904a20)

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil MIG`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, running the Tickets gate's pre-flight for epic MIG in fresh context. Judge only from the files.

Read the brief (specs/_shared/epics/MIG-migration/brief.md), the approved UX proposals under specs/_shared/epics/MIG-migration/ux/, specs/_shared/epics/MIG-migration/technical.md if it exists, and each drafted contract:
- MIG-7: specs/_shared/epics/MIG-migration/tickets/MIG-007-auth-sdk-seam/contract.md
- MIG-8: specs/_shared/epics/MIG-migration/tickets/MIG-008-use-client-placement/contract.md
- MIG-10: specs/_shared/epics/MIG-migration/tickets/MIG-010-format-all/contract.md
- MIG-12: specs/_shared/epics/MIG-migration/tickets/MIG-012-bash-guard-split/contract.md
- MIG-13: specs/_shared/epics/MIG-migration/tickets/MIG-013-bash-guard-fixture-restore/contract.md
- MIG-14: specs/_shared/epics/MIG-migration/tickets/MIG-014-coverage-thresholds/contract.md
- MIG-15: specs/_shared/epics/MIG-migration/tickets/MIG-015-env-seam-auth/contract.md
- MIG-16: specs/_shared/epics/MIG-migration/tickets/MIG-016-env-seam-observability/contract.md
- MIG-17: specs/_shared/epics/MIG-migration/tickets/MIG-017-env-seam-api/contract.md
- MIG-18: specs/_shared/epics/MIG-migration/tickets/MIG-018-env-seam-db/contract.md
- MIG-19: specs/_shared/epics/MIG-migration/tickets/MIG-019-env-seam-web/contract.md
- MIG-20: specs/_shared/epics/MIG-migration/tickets/MIG-020-next-config-env-secrets/contract.md
- MIG-21: specs/_shared/epics/MIG-migration/tickets/MIG-021-retire-domain-guides/contract.md

For each contract, check: every criterion is testable and names the right evidence type; it cites one surface and the criterion IDs it builds; every state and unhappy path of that surface is covered by this or another ticket; planned paths and depends_on are plausible; nothing is out of the epic's appetite.

Write one line per ticket, exactly in this form, then your findings:
MIG-7: PASS or FAIL, with the reason
MIG-8: PASS or FAIL, with the reason
MIG-10: PASS or FAIL, with the reason
MIG-12: PASS or FAIL, with the reason
MIG-13: PASS or FAIL, with the reason
MIG-14: PASS or FAIL, with the reason
MIG-15: PASS or FAIL, with the reason
MIG-16: PASS or FAIL, with the reason
MIG-17: PASS or FAIL, with the reason
MIG-18: PASS or FAIL, with the reason
MIG-19: PASS or FAIL, with the reason
MIG-20: PASS or FAIL, with the reason
MIG-21: PASS or FAIL, with the reason

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

Pre-flight read complete: brief, assess, rulings, record 0001, the prior pre-flight, the contract schema, `tickets.md` §4 and §6, `qa-levels.md`, `_status.md`, MIG-6's and MIG-9's as-builts, and all thirteen contracts, with the MIG-7 artefacts (test file, `toolkit.json`, `browser.ts`, `client.ts`, boundaries config, C5 walk) spot-checked for path plausibility. No `ux/` or `technical.md` exists under the epic, so `brief.md`, `assess.md`, `rulings.md` and record 0001 are the spec. Writing the verdict now.

# Pre-flight — MIG (second run)

MIG-7: PASS — all six criteria are observable and typed (four `test` with `--test-name-pattern` per criterion on a script that exists in `package.json`, one `check`, one `manual` with a reason); the first run's Blocking finding is closed by C6 (the `@syn/auth/browser` import walk, which `scripts/check-auth-seam.test.mjs` implements against `packages/auth/package.json`'s `./browser` export and `packages/auth/src/browser.ts`, which imports only the SDK and `./context` types); C5 now walks the return after token expiry, the invalid cookie and the unverified account, so every non-negotiable has a criterion; Q3 with mason and warden matches the reviewer map; `depends_on: [MIG-6]` is closed; the ordering against MIG-15 and MIG-19 is now stated in the contract; one `cites` line, `truth_files: none` with a reason; inside record 0001's part 6.
MIG-8: FAIL — criteria, non-negotiables, devs_call and cites are still `[FILL]`; the premise is unchanged from the first run (the repo-wide V4 count takes `packages/ui` and `apps/web/lib/hooks/` as misplaced while every leaf under `apps/web/app/` is already in `_components/`), so the planned path `apps/web/app/**` and "the count only falls" describe work the tree does not hold; `depends_on: [MIG-9]` has no stated reason for a check.
MIG-10: FAIL — criteria, non-negotiables and cites are `[FILL]`; `depends_on: []` still contradicts its own trigger ("after every open branch has merged") and the first run's finding that a format pass over `docs/ux/` before MIG-1 promotes it rewrites bodies the archive keeps byte for byte.
MIG-12: FAIL — criteria and cites are `[FILL]`; the trigger is an external toolkit event with no path or commit the contract can prove; agent-permission paths (`.claude/settings.json`, `tooling/hooks/**`, both warden rows) at Q1 with no reviewers, flagged once.
MIG-13: FAIL — criteria and cites are `[FILL]`; "byte for byte the toolkit's" is testable only against a toolkit path and commit the contract does not record; `tooling/hooks/**` (warden row) at Q1.
MIG-14: FAIL — criteria and cites are `[FILL]`; one `check` cannot stand for both halves of the plan (measure, then threshold); only `@syn/utils` has a suite, so `packages/*/vitest.config.ts` overstates the paths; the new dependency has no tech-stack row named.
MIG-15: FAIL — criteria, non-negotiables and the second `cites` line are `[FILL]`; "the entries below" cites a list that is not in the file; its build note still asks for the reverse of MIG-7's stated order (MIG-7 now says MIG-15 adds MIG-7 to its `depends_on`), so the two contracts disagree; `packages/auth/**` and `**/env.ts` (mason and warden rows) at Q1 with no reviewers.
MIG-16: FAIL — criteria and cites are `[FILL]`; "the entries below" is absent; the planned paths cannot deliver "the caller passes a debug flag" (19 files import `@syn/observability`, none planned, nor an app entry that configures it); `NEXT_PUBLIC_SYN_LOG_DEBUG`, the browser's debug source in `logging.ts` line 19, is unnamed and its replacement is MIG-19's client-safe module, with no dependency on it.
MIG-17: FAIL — criteria and cites are `[FILL]`; "the entries below" is absent; a VAPID private-key seam at Q1 with no reviewer though its own note calls the new `env.ts` a Warden row; no criterion for a missing key failing at the seam rather than inside the push fan-out.
MIG-18: FAIL — criteria and cites are `[FILL]`; "the entries below" is absent; `build-database-env-for-next-config.ts` is also planned by MIG-20 and `seed-users.ts` by MIG-7 with no ordering stated (MIG-6's as-built asks for MIG-20 first); renaming `connection-env.ts` changes an import `next.config.ts` makes; no criterion pins "an unset tier resolves exactly as today".
MIG-19: FAIL — criteria and cites are `[FILL]`; "the entries below" is absent; it rewires `lib/clients/supabase/client.ts`, which MIG-7 now owns and wraps, with no `depends_on: [MIG-7]` even though MIG-7's contract says MIG-19 adds it; `settings/about/page.tsx` is a Server Component and belongs behind `apps/web/env.ts`, not the client-safe module; the browser-bundle boundary at Q1 with no warden.
MIG-20: FAIL — criteria and cites are `[FILL]`; the body says Q3 with Warden is the likely call while the frontmatter is Q1 with no reviewers; the plan drops the canonical names from `env:` (which `next.config.ts` lines 25 to 78 spread today) with no criterion that the server still resolves `DATABASE_URL` and the service key at runtime on each tier, and "build output holds no secret" needs a sentinel to be provable.
MIG-21: FAIL — criteria, non-negotiables, devs_call and cites are `[FILL]`; the plan edits `docs/ai-guides/` files that ruling 41 kept "indexed" and a path rule at 1,445 of 1,500 tokens, so the done-condition (which sections go, where each remaining section lands, the budget row still green) needs its own criteria before a builder can take it from the ticket alone.

## Findings

**Blocking**

1. Twelve of thirteen contracts carry `[FILL]` criteria. Per `tickets.md` §4, "every criterion is observable and names its evidence type"; a `[FILL]` statement is neither, and `contract:init` starts a ticket only on a PASS line. Expected: real criteria on each, or the contracts stay drafts and the gate is re-run on the ones the operator wants to start. Owner: the drafting thread per ticket.

**Should-fix**

2. MIG-15 / MIG-19 order against MIG-7. MIG-7's contract now settles it (MIG-7 first; MIG-15 and MIG-19 add MIG-7 to `depends_on` when they start), and `client.ts` already imports `@syn/auth/browser`. MIG-15's note still says the reverse and MIG-19's `depends_on` is `[MIG-6]` alone. Write `depends_on: [MIG-6, MIG-7]` into both and drop MIG-15's line.
3. MIG-18 / MIG-20 overlap on `packages/db/src/build-database-env-for-next-config.ts`. MIG-6's as-built asks for MIG-20 first. Give MIG-18 `depends_on: [MIG-6, MIG-20]`, or say why not.
4. MIG-20 needs the outage-path criterion: a `test` that resolves `DATABASE_URL` and the service key from staging-shaped and production-shaped environments after the `env:` entries are dropped, plus a sentinel-grep `check` on the build output. Its level should be Q3 with warden, as its own body says.
5. MIG-16's planned paths cannot reach the change. Either plan one `configureLogging` entry the app calls (and `apps/web/app/error.tsx` for the browser seat) or plan every importer; name `NEXT_PUBLIC_SYN_LOG_DEBUG` and either depend on MIG-19 or document the browser flag as off.
6. MIG-15 to MIG-20: "the entries below are gone" cites a list absent from every contract. Paste the suppression entries or name the file and count explicitly.
7. MIG-10 must depend on MIG-1 and on every drafted ticket that edits `.ts`, `.tsx` or `.md`; `depends_on` is the only way the "quiet window" becomes a gate.
8. QA levels, flagged once per `qa-levels.md`: MIG-12, MIG-13 (agent permissions), MIG-15 (auth), MIG-17 (VAPID key), MIG-18 (tier and seeds), MIG-19 and MIG-20 (the browser-bundle boundary) are critical paths at Q1 with `reviewers: []`. The operator settles the table; each contract should carry the map's suggestion beside the chosen level.
9. MIG-8 needs re-scoping. Scoped to `apps/*/app/**` minus Next's conventional files, the baseline is zero; the ticket becomes "the check, baseline 0, scoped" or closes as already met.

**Consider**

10. MIG-12 to MIG-21 are not in record 0001's "Gaps drafted" list, which the brief says "lists them". They derive from MIG-5, MIG-6, MIG-9 and MIG-11 and sit inside the appetite; one amendment block on the record would close the gap.
11. MIG-21 touches guides ruling 41 kept and `house-ui.md`'s budget row. A criterion that `yarn budget` stays green and one that every moved section is reachable from the rule that used to point at it would make the "risks losing the name-to-type guidance" slice type testable.
12. MIG-14: thresholds only where a suite exists; `@vitest/coverage-v8` pinned at the Vitest version with its tech-stack row (`deps.md`).
13. MIG-13 and MIG-12: record the toolkit path and commit the copy is taken from, so "byte for byte" is a hash a check can compare.
14. MIG-7: `apps/web/app/(auth-pending)/verify/layout.tsx` imports the `@syn/auth` barrel; it is a Server Component today, so this is fine, but C6 proves only `client.ts`. A line in the non-negotiables ("no `"use client"` file imports the barrel") would keep the next client leaf honest; the sign-in and sign-up forms reach the SDK only through `client.ts`, which holds.

## Conversations

- MIG-7 C5's step 4 is the one support tickets are made of ("came back the next day, got bounced to sign-in"). The walk names it; would the operator do it on a phone rather than a laptop tab, since the PWA seat is where cookies expire unseen?

## Runtime checklist

1. Fill the twelve `[FILL]` contracts, then re-run `yarn review:run vigil MIG` on the set the operator wants to start.
2. `yarn status MIG-7`: confirm no `results.json` exists yet and the code in the tree is the ticket branch's uncommitted work.
3. On MIG-7's hardening, Taylor walks C5 steps 1 to 5 against staging as written in `evidence/C5-walk.md`.

Assumptions: no `ux/` or `technical.md` exists under the epic, so `brief.md`, `assess.md`, `rulings.md` and record 0001 were the spec; the migration tickets have no UX surface, so one `assess` signal line was accepted as the cited surface, as the first run accepted for MIG-4; `[FILL]` criteria were judged untestable rather than a drafting convention, since a FAIL here costs only a re-run and a PASS would let `contract:init` start a ticket with no criteria.

VERDICT: FAIL
