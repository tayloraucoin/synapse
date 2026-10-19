---
id: MIG-4
size: medium # small: under half a day, the default; medium: half a day to two days; large: split it
objective: "A migration that touches the auth schema or breaks the append-only rule fails verify before it can be applied"
slice_type: "schema tooling; risks a migration check that passes a dangerous migration"
non_negotiables:
  - "The auth rule reads every statement of every migration; it never allows or skips a file by its name."
  - "0000 as committed passes; the unguarded form drizzle-kit generate re-emits fails, under any file name."
  - "The guard exception is exact: one IF NOT EXISTS on information_schema.tables for auth.users, then CREATE SCHEMA IF NOT EXISTS auth and CREATE TABLE auth.users with a plain column list, nothing else."
  - "A recorded migration that is edited, removed, renamed or re-timestamped in the journal fails; recording appends and never rewrites an entry."
  - "No existing migration, journal entry or Drizzle file name changes."
  - "Nothing runs against any database: the check and its tests read files only."
devs_call: "How the SQL is cut into statements, the rule set and its messages, where the lock lives and its shape, the fixture's form, and the script names."
cites:
  - "specs/_shared/epics/MIG-migration/rulings.md"
  - "migrationsDir"
truth_files: "none: tooling only; the app's behaviour does not change"
qa: Q3 # Q1, Q2 or Q3, as the operator confirmed (docs/workflows/qa-levels.md)
reviewers:
  - mason
  - warden
focus: [ "0000's guard: the unguarded regenerated form fails (warden)" ] # named parts to examine more closely, as in "the webhook handler: every event type handled (warden)"
operator_review: false # true when Taylor wants to look it over himself, as for a new surface in the browser; the ticket still closes
planned_paths:
  - "packages/db/scripts/check-migrations.ts"
  - "packages/db/scripts/check-migrations.test.ts"
  - "packages/db/scripts/fixtures/check-migrations/"
  - "packages/db/migrations/migrations.lock.json"
  - "packages/db/package.json"
  - "package.json"
  - "docs/developer-guides/migrations.md"
depends_on: [] # work-ids that must be built first (their own criteria PASS)
out_of_scope:
  - "Renaming or moving any migration"
  - "Any hosted migration (Operator)"
criteria:
  - id: C1
    statement: "yarn check-migrations passes on packages/db/migrations as committed, 0000's guarded auth stub included"
    evidence: check
    command: "yarn check-migrations"
  - id: C2
    statement: "The unguarded 0000 drizzle-kit regenerates (fixture) fails on CREATE SCHEMA \"auth\" and CREATE TABLE \"auth\".\"users\", under any file name; every loosened guard and each kind of auth DDL or write fails; a foreign key to auth.users and auth.uid() pass"
    evidence: test
    command: "yarn test:migrations"
  - id: C3
    statement: "An edited, removed, renamed or re-timestamped earlier migration fails; a new one fails until recorded; recording appends only, and refuses while anything recorded changed or the new migration touches auth"
    evidence: test
    command: "yarn test:migrations"
  - id: C4
    statement: "yarn verify runs yarn test:migrations and yarn check-migrations after yarn build"
    evidence: test
    command: "yarn test:migrations"
  - id: review:mason
    statement: Mason reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run mason <id>
  - id: review:warden
    statement: Warden reviews this ticket in fresh context against its contract and evidence.
    evidence: manual
    reason: a reviewer's judgment, recorded only by yarn review:run warden <id>
  - id: C5
    statement: A migration file with no journal entry, or a journal entry with no file, fails
    evidence: test
    command: yarn test:migrations
---

# Contract — MIG-4 check-migrations

## Build notes

Drafted by the migration (rulings.md, record 0001) on 2026-10-09; the criteria are written when the ticket starts.

- **Layer:** 3, part 2.
- **What did not cross:** the toolkit's migration check and local database conventions. migrationsDir stays packages/db/migrations (Drizzle, 0000 to 0011 with meta/); 0000 is hand-edited to guard the auth schema (packages/db/AGENTS.md).
- **Plan:** Install check-migrations modelled on the toolkit's packages/db/scripts/check-migrations.ts (in the toolkit checkout (/Users/taylor/lighthouse/product-engineering-mastery)): it scans migration contents for DDL against the auth schema and never reads names, so Drizzle's file names need no rename; it must pass 0000's guarded form and fail the unguarded form drizzle-kit regenerates. Add it to verify after build. A local database follows Taylor's choice. Operator: any hosted migration.
- **Conflict risk:** low (one script, one verify step). Trigger: the first ticket that writes a migration under the practice.
- **Estimate:** half a day. An estimate.
