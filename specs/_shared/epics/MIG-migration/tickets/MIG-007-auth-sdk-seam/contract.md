---
id: MIG-7
size: medium # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "Every Supabase SDK call sits behind the auth or db module and is reached by a reviewer glob"
slice_type: "auth topology; risks an unreviewed path to identity or data"
non_negotiables:
  - "[FILL: at most seven, one line each]"
devs_call: "[FILL: what the builder decides freely]"
cites:
  - "[FILL: the one surface file, as specs/<app>/ux/<area>/<surface>.md]"
  - "[FILL: decision and criterion IDs from it, as D-OB2-1 or OB2-W3]"
truth_files: "none: [FILL: why no living UX file changes]" # or a list of specs/<app>/ux/ paths edited in this PR
qa: Q3 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers: [mason, warden] # who reviews, as the operator confirmed; role names, as in vigil or warden
focus: [] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "apps/web/lib/clients/supabase/client.ts"
  - "packages/api/src/context.ts"
  - "packages/db/scripts/seed-users.ts"
  - "packages/auth/**"
  - "toolkit.json"
depends_on: [MIG-6] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Billing, email and AI families (none in Phase 1)"
  - "Vendor dashboard changes (Operator)"
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

# Contract — MIG-7 auth-sdk-seam

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 6 (signal V5).
- **What did not cross:** 3 of 12 SDK-importing files match no reviewer glob (assess.md): apps/web/lib/clients/supabase/client.ts (@supabase/ssr, @supabase/supabase-js), packages/api/src/context.ts (@supabase/supabase-js), packages/db/scripts/seed-users.ts (@supabase/supabase-js). The imports reviewer rows for @supabase/* (mason, warden) keep every change at the right level until then.
- **Plan:** Read the toolkit's docs/runbooks/remove/supabase-auth.md and supabase-database.md (in the toolkit checkout (/Users/taylor/lighthouse/product-engineering-mastery)) backwards as the checklist of what the module must own; move or wrap each of the three importers behind @syn/auth or @syn/db (or name it an accepted exception with a reviewer glob); then add the auth stack entry to toolkit.json and install check-stack into verify with it. Operator: Supabase dashboard settings if an endpoint changes.
- **Conflict risk:** high for the call sites (auth). Trigger: Taylor opens it; one family only (auth).
- **Estimate:** one to two days. An estimate.
