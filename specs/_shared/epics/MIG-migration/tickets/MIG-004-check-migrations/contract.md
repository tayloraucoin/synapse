---
id: MIG-4
size: medium # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "A migration that touches the auth schema or breaks the append-only rule fails verify before it can be applied"
slice_type: "schema tooling; risks a migration check that passes a dangerous migration"
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
  - "packages/db/scripts/check-migrations.ts"
  - "package.json"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Renaming or moving any migration"
  - "Any hosted migration (Operator)"
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

# Contract — MIG-4 check-migrations

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 2.
- **What did not cross:** the toolkit's migration check and local database conventions. migrationsDir stays packages/db/migrations (Drizzle, 0000 to 0011 with meta/); 0000 is hand-edited to guard the auth schema (packages/db/AGENTS.md).
- **Plan:** Install check-migrations modelled on the toolkit's packages/db/scripts/check-migrations.ts (in the toolkit checkout (/Users/taylor/lighthouse/product-engineering-mastery)): it scans migration contents for DDL against the auth schema and never reads names, so Drizzle's file names need no rename; it must pass 0000's guarded form and fail the unguarded form drizzle-kit regenerates. Add it to verify after build. A local database follows Taylor's choice. Operator: any hosted migration.
- **Conflict risk:** low (one script, one verify step). Trigger: the first ticket that writes a migration under the practice.
- **Estimate:** half a day. An estimate.
