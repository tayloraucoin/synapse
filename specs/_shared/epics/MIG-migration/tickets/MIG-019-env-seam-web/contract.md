---
id: MIG-19
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "The web app's client files read public names through one client-safe module"
slice_type: "configuration seam; risks server env pulled into the browser bundle"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "MIG-migration assess V3"
  - "[FILL: decision and criterion IDs]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q1 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "apps/web/lib/env/**"
  - "apps/web/app/(shell)/settings/about/**"
  - "apps/web/app/_components/service-worker-registration.tsx"
  - "apps/web/lib/pwa/push-subscribe.ts"
  - "apps/web/lib/clients/supabase/client.ts"
  - "apps/web/lib/trpc/provider.tsx"
  - "packages/config/eslint/process-env.js"
  - "apps/web/eslint-suppressions.json"
  - "apps/web/AGENTS.md"
out_of_scope:
  - "Changing any variable's name or value"
depends_on: [ MIG-6 ] # work-ids that must be built first (their own criteria PASS)
criteria:
  - id: C1
    statement: "[FILL: what is true when this is done, observable by a user or caller]"
    evidence: check
    command: "[FILL: yarn <script>]"
---

# Contract — env-seam-web

## Build notes

Drafted by MIG-6 on 2026-10-09; the criteria are written when the ticket starts.

- **Frozen:** `app/(shell)/settings/about/_components/feedback-form.tsx` 1, `app/(shell)/settings/about/page.tsx` 2, `app/_components/service-worker-registration.tsx` 1, `lib/pwa/push-subscribe.ts` 1. All read `NEXT_PUBLIC_*` or `NODE_ENV`.
- **Warden's shape:** the client files cannot import `apps/web/env.ts` (it pulls `node:path`, `@next/env` and the server schema). Add a client-safe `lib/env/public.ts` of literal `NEXT_PUBLIC_*` reads only; make it the one exempt file in the rule (in place of `supabase/client.ts` and `trpc/provider.tsx`, which then import from it), keeping the public-names-only check on it; update apps/web/AGENTS.md's exceptions line.
- **Done when:** the workspace's `eslint-suppressions.json` entries below are gone, pruned in the commit that moves the reads (`yarn lint -- --prune-suppressions`, never alone), and the file is deleted once empty. Counts are the lint run's on 2026-10-09.
