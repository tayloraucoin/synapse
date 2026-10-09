---
id: MIG-6
size: medium # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "process.env is read only in each workspace's env.ts, and a lint rule keeps it that way"
slice_type: "configuration seam; risks a secret read on the client"
non_negotiables:
  - "No read moves in this ticket; the follow-on tickets move them per module folder."
  - "The rule is an error inside each workspace's yarn lint, so yarn verify carries it; never a warning, never turned off to go green."
  - "Today's readers are frozen by ESLint bulk suppressions, one committed file per workspace that has readers; a count never rises."
  - "Exactly two files are exempt by name, the two apps/web/AGENTS.md documents, and they may read only NEXT_PUBLIC_* names (and NODE_ENV)."
  - "No variable's name or value changes, and no boundaries error is suppressed."
devs_call: "The rule's form (no-restricted-properties plus a small local rule for the exempt files), where it sits in the shared ESLint config, and how the test proves it."
cites:
  - "MIG-migration assess V3"
  - "toolkit migrate verify recipe 3.1 (bulk suppressions)"
truth_files: "none: lint configuration; the app's behaviour does not change" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: []
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "apps/web/env.ts"
  - "packages/config/eslint/**"
  - "apps/web/eslint-suppressions.json"
  - "packages/*/eslint-suppressions.json"
  - "scripts/check-env-seam.test.mjs"
  - "package.json"
depends_on: [ MIG-3 ] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Changing any variable's name or value"
criteria:
  - id: C1
    statement: "A new environment read outside the workspace's own env.ts (member, destructured, or an env import from the process module) is a lint error in every workspace; env.ts itself reads freely"
    evidence: test
    command: "yarn test:env-seam --test-name-pattern C1"
  - id: C2
    statement: "Each workspace with readers commits eslint-suppressions.json; its counts are exact, so one more read in a frozen file fails, and a count left above the reads fails until pruned"
    evidence: test
    command: "yarn test:env-seam --test-name-pattern C2"
  - id: C3
    statement: "The two documented NEXT_PUBLIC_* readers are named in the rule's config and exempt, a sibling file is not, and inside them any non-public name is still an error"
    evidence: test
    command: "yarn test:env-seam --test-name-pattern C3"
  - id: C4
    statement: "yarn lint is green over every workspace with the rule on and the suppressions in place"
    evidence: check
    command: "yarn lint"
---

# Contract — MIG-6 env-seam

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 5 (signal V3).
- **What did not cross:** 19 files read process.env outside an env.ts (assess.md V3), among them apps/web/app/(shell)/settings/about/_components/feedback-form.tsx, apps/web/app/(shell)/settings/about/page.tsx and apps/web/app/_components/service-worker-registration.tsx. apps/web/AGENTS.md documents two exceptions (lib/clients/supabase/client.ts and lib/trpc/provider.tsx read NEXT_PUBLIC_* literals). The readers that exist: apps/web/env.ts, packages/auth/src/env.ts.
- **Plan:** Adopt the existing env.ts readers (with apps/web/lib/env/ tier resolution); a lint rule against process.env outside env.ts, installed with ESLint bulk suppressions per workspace (verify.md 3.1) so the count only falls; the two documented exceptions named in the rule's config; then one ticket per module folder that moves its reads behind env.ts. env.ts is already a Warden row in toolkit.json.
- **Conflict risk:** medium (19 readers, under the 25 that makes it high). Trigger: the lint with suppressions any time; the moves follow MIG-7's module order.
- **Estimate:** half a day for the rule; the moves about a day. Estimates.
