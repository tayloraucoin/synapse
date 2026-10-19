---
id: MIG-20
size: small # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "No server secret is listed in next.config.ts's env block"
slice_type: "configuration seam; risks a database password or service-role key inlined into a browser bundle"
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
  - "apps/web/next.config.ts"
  - "packages/db/src/build-database-env-for-next-config.ts"
  - "packages/auth/src/env.ts"
out_of_scope:
  - "Changing any variable's name or value"
depends_on: [ MIG-6 ] # work-ids that must be built first (their own criteria PASS)
criteria:
  - id: C1
    statement: "[FILL: what is true when this is done, observable by a user or caller]"
    evidence: check
    command: "[FILL: yarn <script>]"
---

# Contract — next-config-env-secrets

## Build notes

Drafted by MIG-6 on 2026-10-09; the criteria are written when the ticket starts.

- **Warden, red and latent (MIG-6's consult):** `apps/web/next.config.ts` spreads `DATABASE_URL` (via `build-database-env-for-next-config.ts`) and `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` (via `packages/auth/src/env.ts`) into `env:`. Next inlines `env:` values wherever a literal read of that name appears, client code included, and bakes them into the server build output. No client file reads them today, so nothing ships; MIG-6's rule now errors on such a read in the two exempt files.
- **Plan:** drop the secrets from `env:` and let the server read them at runtime through `env.ts`; confirm the build output no longer holds them.
- **Level:** secrets, so Q3 with Warden is the likely call; the operator confirms at start.
