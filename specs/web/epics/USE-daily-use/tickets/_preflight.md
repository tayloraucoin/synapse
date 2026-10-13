# Pre-flight — USE

> Written by `yarn review:run vigil USE` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: c7d1ae54c977f9a9c0869e37a20fbdde7b217439
- runner: claude 2.1.295 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5-5
- at: 2026-10-13T18:45:32Z
- tokens_input: 28
- tokens_cache_read: 679072
- tokens_cache_write: 63009
- tokens_output: 10488
- seconds: 114.2

## Verdicts

- USE-1: PASS (contract d0f8df1bac4e)
- USE-2: PASS (contract 98fc35acc7a6)
- USE-3: PASS (contract a8682a9d7499)

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil USE`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, running the Tickets gate's pre-flight for epic USE in fresh context. Judge only from the files.

Read the brief (specs/web/epics/USE-daily-use/brief.md), the approved UX proposals under specs/web/epics/USE-daily-use/ux/, specs/web/epics/USE-daily-use/technical.md if it exists, and each drafted contract:
- USE-1: specs/web/epics/USE-daily-use/tickets/USE-001-legacy-move/contract.md
- USE-2: specs/web/epics/USE-daily-use/tickets/USE-002-schema-0012-rls/contract.md
- USE-3: specs/web/epics/USE-daily-use/tickets/USE-003-record-validators/contract.md

For each contract, check: every criterion is testable and names the right evidence type; it cites one surface and the criterion IDs it builds; every state and unhappy path of that surface is covered by this or another ticket; planned paths and depends_on are plausible; nothing is out of the epic's appetite.

Write one line per ticket, exactly in this form, then your findings:
USE-1: PASS or FAIL, with the reason
USE-2: PASS or FAIL, with the reason
USE-3: PASS or FAIL, with the reason

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

USE-1: PASS. Every criterion can be tested and uses the right evidence type, including the deletion guard (C9) and the walk that covers signed-out and sign-out (C8). The paths and the empty `depends_on` fit wave 0, and the live tree matches the move list.
USE-2: PASS. Each of 0012's promises has a static test over the SQL: RLS for every table except `slot_events`, the append-only policies, the CHECKs, the unique keys, and additions only. The token tables went to Linear connect, so the old ciphertext gap is gone. Q3 with Mason and Warden matches call C7, and `SCHEMA_REFERENCE.md` is now in the planned paths.
USE-3: PASS. The earlier blocker is fixed: USE-2 now says where a transition is stored (a `block_items` row with `is_transition`, or a `blocks` row of kind `transition`). C1–C7 can be tested with the right evidence, the second surface is covered by a `waiver:`, and `yarn.lock` is planned.

## Findings

**What I read.** The brief, the `technical/` folder (there is no `technical.md`; I read README, calls and data-contract), the cited dev note, the New block sheet's index and its transition and invalid states, and the three contracts. I also checked the live tree: `enums.ts`, `boundaries.js`, `standard-policies.ts`, `check-migrations.ts`, the root and validators `package.json`, `run-scheduled-jobs.ts` and the vitest row in `tech-stack.md`. I ran nothing.

`_preflight.md` holds an earlier run that failed USE-3. I treated it as a history of what to re-check, not as evidence. Each fix it asked for is now in the contracts on disk, and I confirmed each one there.

### USE-2

1. **Should-fix: Approach step 1 asks for an import the boundaries forbid.** (USE-2 Approach 1, non-negotiable 4)
   - `PACKAGE_IMPORTS.constants` is `["config"]` (`packages/config/eslint/boundaries.js:55`), so `@syn/constants` cannot import a `@syn/types` union, even type-only.
   - A helper in `@syn/constants` that "fails to compile when a value is missing" against that union would be an upward import. The house rule says never to suppress one.
   - **Fix:** keep the lists in `@syn/constants` and put the exhaustiveness check in `@syn/db`, which may import both, as `enum-values.ts` already does. Or derive each union from its list.
   - USE-2 has no criterion for `lint:boundaries`, so this would first fail at batch close.
   - Owner: Mason.
2. **Consider:** the contract lets a child row point at a parent row owned by another user (Gotchas: "Services read the parent through `ctx.rls`… wave 3"). Warden should see that this is a decision, so it stays in Warden's focus. It is low risk while Taylor is the only user.

### USE-3

3. **Should-fix: one of 0012's CHECKs has no validator criterion.** Non-negotiable 3 says every per-row rule 0012 enforces is also refused here. USE-2 C4 enforces "a block change is skipped or has both times", but no USE-3 criterion tests `blockChangeInput` against it. Add it to C2.
4. **Consider: C1 reads two ways on repeats.** It says a transition "takes no repeat", then asks for "a rule or date when it stands outside every block". The outside-a-block case is an undrawn assumption in `transition.md`. Say whether that rule is inherited or chosen, so the test has one answer.
5. **Consider:** no criterion covers the to-do `type` enum or `savedColourInput`'s `#rrggbb` shape, though both are in the interfaces. The bad-hex state belongs to the icon picker's UI ticket. The schema's format still needs a test somewhere.

### USE-1

6. **Should-fix: the push-subscription promise in non-negotiable 4 is never walked.** C8 covers sign-in, sign-out, the landing, the empty Today and the not-found routes. Add "the push toggle still subscribes" to C8's steps.
7. **Consider:** `cites` names `calls.md` only in prose, and calls C8 and C9 share names with the contract's own criteria C8 and C9. Citing the file path would let `checkContract` check that the IDs resolve.
8. **Consider:** `lib/clients` is listed as staying live, but `apps/web/lib/` holds only `routes.ts` at the top level. Check that the name is right.

### Things I could not verify

- **Coverage of the New block sheet's other states.** Clash, error, offline and the rest are UI states for wave 2 tickets that haven't been drafted yet. Only the data side is here: the seven kinds, "Name needed", and the transition. That coverage can only be checked when those tickets exist.
- **Appetite.** I took Technical's call C1 ("everything in the ledger… the brief's two days are superseded") as the appetite. On that reading, none of the three tickets is out of scope.

## Conversations

- **USE-1 turns the current app off before its replacement exists.** After it lands, Taylor has an empty Today and no notifications until wave 3. The brief's measure is two weeks of real use, and that can't start until wave 2 is usable. Will the branch Taylor's phone runs keep the old app until then?

## Operator checks

1. `yarn check-specs` on all three: the 2,500-token cap (USE-2 is close) and whether the cites resolve.
2. USE-1 C8, with the push step added.
3. USE-2 C8: Taylor reads 0012, then applies 0009, 0010, 0011 and 0012 on staging.

VERDICT: PASS
