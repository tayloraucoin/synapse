---
id: USE-138
size: small
objective: "A signed-in account on a hosted tier always has its public.users row, so user.me and planner.today answer 200 and Now and Set my days load; db:setup backfills rows that are missing and fails on a tier that is not ready"
slice_type: "bug fix in hosted setup SQL, a one-way door on production; risks a security definer path that widens access, a backfill that writes rows it should not, and a check that writes"
non_negotiables:
  - "The trigger stays in packages/db/supabase/setup: check-migrations fails any migration that acts on auth or sets search_path (MIG-4), and that check is not loosened."
  - "No row is inserted by the user.me resolver or any app code; the database creates it."
  - "RLS on users is unchanged: owner-only select and update, insert and delete denied, no admin read."
  - "No agent runs db:setup, db:migrate or any SQL against a hosted tier; Taylor applies it."
  - "04_verify_setup.sql only reads."
  - "No real user id or email in any file; tests use none."
devs_call: "Where in 02 the backfill sits (after the trigger is armed); 04's wording; how the test parses the SQL."
cites:
  - "packages/db/SETUP.md"
truth_files: "none: no behaviour changes for a tier that was set up; production now matches it"
qa: Q3
reviewers:
  - mason
  - warden
focus:
  - "the backfill and the run order: 02 arms the trigger before it backfills, 04 runs last (mason, Q3)"
  - "handle_new_user's security definer, the RLS on the backfilled row, no admin-read path (warden, Q3)"
operator_review: false
planned_paths:
  - "packages/db/supabase/setup/01_init_functions.sql"
  - "packages/db/supabase/setup/02_apply_triggers_rls.sql"
  - "packages/db/supabase/setup/04_verify_setup.sql"
  - "packages/db/scripts/run-setup-sql.ts"
  - "packages/db/SETUP.md"
  - "tests/use-138-hosted-setup.test.ts"
  - "packages/ui/src/primitives/display/avatar/"
  - "docs/runbooks/postmortem/convention-log.md"
depends_on: []
out_of_scope:
  - "A migration for the trigger: check-migrations forbids it by design"
  - "Running setup in CI or on deploy"
  - 'First-run copy: no change needed; "didn''t load" shows only when the read errors, and an empty day already renders its first-run state'
  - "Vercel Deployment Protection (a project setting)"
criteria:
  - id: C1
    statement: "handle_new_user() is security definer with search_path pinned to public, and inserts only the new auth user's own row"
    evidence: test
    command: "yarn test:root"
  - id: C2
    statement: "db:setup arms on_auth_user_created after insert on auth.users, so a new sign-up gets a row with nothing done by hand"
    evidence: test
    command: "yarn test:root"
  - id: C3
    statement: "db:setup backfills a public.users row for every auth user without one, after the trigger is armed, and touches no existing row"
    evidence: test
    command: "yarn test:root"
  - id: C4
    statement: "db:setup ends with a read-only check that fails the run when the trigger, any auth user's row, or RLS on a public table is missing"
    evidence: test
    command: "yarn test:root"
  - id: C5
    statement: "Taylor ran db:setup on production; it verified, and user.me and planner.today return 200 with Now and Set my days loading"
    evidence: manual
    reason: "only Taylor applies SQL to a hosted tier"
  - id: C6
    statement: "With no photo and no name, the avatar shows the person glyph in ink on paper with a hairline, never an empty circle"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-138-hosted-user-trigger/evidence/avatar-no-name.png"
---

# Contract — USE-138 hosted-user-trigger

## Build notes

Production went live with `db:migrate` applied and `db:setup` never run. With no `on_auth_user_created` trigger on `auth.users`, the operator's account had no `public.users` row: `user.me` threw NOT_FOUND (`packages/api/src/routers/user.ts:43`) and `planner.today` threw a plain error, a 500 (`packages/api/src/services/planner/select-rows.ts:71`). Taylor's `db:setup` run on production printed `trigger "on_auth_user_created" ... does not exist, skipping` before creating it.

- **Approach:** keep the trigger in setup. 02 backfills missing shadow rows right after arming it; a new 04 checks the tier read-only and fails `db:setup` (psql `ON_ERROR_STOP`) when it is not ready.
- **Decisions that apply:** MIG-4: a migration may not act on `auth` or set `search_path`; such SQL belongs in `packages/db/supabase/setup`. SETUP.md §0: an agent never runs setup or migrations against a hosted tier.
- **Interfaces:** `db:setup` runs 01 to 04. No table, policy or export changes.
- **Per path:** 01: run order comment. 02: section A2, the backfill. 04: the check. `run-setup-sql.ts`: runs 04 last. SETUP.md §4: setup runs after every migrate, on every tier. The test reads the SQL as text.
- **Avatar (added at Taylor's word, 2026-10-19):** a new account has no `display_name`, so `Avatar` got `""` and drew an empty circle. With no initial the fallback shows lucide's `UserIcon` (`@syn/ui`'s `ProfileIcon`) at half the mark's size. `run-setup-sql.ts` passes the URL to psql as an argument (Warden S1), so a failed run never prints the password.
- **Gotchas:** the trigger fires only on inserts after it exists, so the backfill is what fixes an account created before it. The backfill must follow the trigger, or a sign-up between the two is missed.
- **Model:** Opus 5.5 at medium. A smaller model writes the trigger as a migration and fails check-migrations, or inserts the row in the resolver.

## As-built so far (the ticket has not started)

Kept here, not in `as-built.md`: check-specs refuses an as-built for a ticket that never started, and USE-138 waits on the USE pre-flight. Move these sections into `as-built.md` once `yarn contract:init` starts it.

### Shipped against the contract

- C1: `handle_new_user()` unchanged: security definer, `search_path = public`, inserts `new.id`'s row only; the test pins it.
- C2: `02_apply_triggers_rls.sql` arms `on_auth_user_created`; the test fails without it (mutation run: C2 and C3 failed, restored).
- C3: `02` section A2 backfills a row for every auth user without one, after the trigger; `on conflict do nothing`.
- C4: `04_verify_setup.sql` runs last from `run-setup-sql.ts` and raises on a missing trigger, a missing row, a non-definer function or RLS off; it only reads.
- C5: Taylor ran `db:setup` on production 2026-10-19 (the log showed the trigger absent, then created) and reported Now and Set my days loading.
- C6: `Avatar` falls back to the person glyph when the name is empty; the `NoName` story renders it, captured in Storybook.

### Deviations

- The brief asked for the trigger in an append-only migration. `check-migrations` (MIG-4) fails any migration that acts on `auth` or sets `search_path`, so the trigger stays in setup and the fix is setup plus its verification; no migration was added.
- The ticket stays a draft: `contract:init` refuses to start it without a cited surface with `status: approved` and a USE pre-flight line, and the epic's last pre-flight is FAIL (USE-133 to 137 wait on the same gate). So `contract:run` and `review:run` did not run; the criteria were run by hand and the Mason and Warden reviews ran in fresh context with their verdicts reported in the thread, not as review files (the results gate blocks a review file not written by `review:run`).
- Warden S1 taken: `run-setup-sql.ts` uses `spawnSync` with the URL as an argument.

### Not verified

- C5 rests on Taylor's report; the thread could not reach production (Vercel Deployment Protection).
- C6 is a Storybook capture, not a 390/834/1440 capture set of the header and menu.
- The `04` check has not run against a local stack in this thread.

### Next

Taylor runs `yarn review:run vigil USE` (or waives the gate) so USE-138 can start, then `review:run mason` and `review:run warden` keep the review files.
