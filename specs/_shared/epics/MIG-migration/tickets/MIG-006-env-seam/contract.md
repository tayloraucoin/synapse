---
id: MIG-6
size: medium # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "process.env is read only in each workspace's env.ts, and a lint rule keeps it that way"
slice_type: "configuration seam; risks a secret read on the client"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "apps/web/env.ts"
  - "packages/*/src/env.ts"
  - "packages/config/eslint/**"
  - "apps/web/**"
  - "packages/**"
depends_on: [MIG-3] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Changing any variable's name or value"
criteria:
  - id: C1
    statement: "[FILL: what is true when this is done, observable by a user or caller]"
    evidence: test
    command: "[FILL: yarn <script>; a package.json script that runs this criterion's test]"
  - id: C2
    statement: "[FILL]"
    evidence: check
    command: "[FILL: yarn <script>]"
---

# Contract — MIG-6 env-seam

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 5 (signal V3).
- **What did not cross:** 19 files read process.env outside an env.ts (assess.md V3), among them apps/web/app/(shell)/settings/about/_components/feedback-form.tsx, apps/web/app/(shell)/settings/about/page.tsx and apps/web/app/_components/service-worker-registration.tsx. apps/web/AGENTS.md documents two exceptions (lib/clients/supabase/client.ts and lib/trpc/provider.tsx read NEXT_PUBLIC_* literals). The readers that exist: apps/web/env.ts, packages/auth/src/env.ts.
- **Plan:** Adopt the existing env.ts readers (with apps/web/lib/env/ tier resolution); a lint rule against process.env outside env.ts, installed with ESLint bulk suppressions per workspace (verify.md 3.1) so the count only falls; the two documented exceptions named in the rule's config; then one ticket per module folder that moves its reads behind env.ts. env.ts is already a Warden row in toolkit.json.
- **Conflict risk:** medium (19 readers, under the 25 that makes it high). Trigger: the lint with suppressions any time; the moves follow MIG-7's module order.
- **Estimate:** half a day for the rule; the moves about a day. Estimates.
