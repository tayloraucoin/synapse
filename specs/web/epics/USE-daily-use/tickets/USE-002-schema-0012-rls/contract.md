---
id: "USE-2"
size: small
objective: "USE's planner and work tables, enum values and owner-private RLS exist as Drizzle schema and one additive migration, 0012_use_daily, ready for Taylor to read and run on staging"
slice_type: "schema and migration, a one-way door; risks a table without owner-private RLS, an editable clock, a DROP or ALTER of an old table, a CHECK the SQL forgot, and an enum value used in the transaction that adds it"
non_negotiables:
  - "0012 makes additions only. No old table, column, policy or migration file changes, except users gaining clients_enabled."
  - "Every new table is owner-private through ownerPrivateCrudPolicies, except slot_events, which is append-only."
  - "No agent runs a migration on any database. Taylor runs 0009, 0010, 0011, then 0012 on staging, after reading the SQL."
  - "Each enum's values are spelled once, in a @syn/constants list; the pgEnum is built from that list through enumValues<Union>(), which proves it exhaustive; validators read the same list."
  - "No integration table: the linear_* and google_* tables ship with Linear connect."
  - "No service, router or UI reads the new tables in this ticket."
devs_call: "File split inside planner/ and work/; index names; comments; the exhaustive-list helper's shape; how the test parses the SQL."
cites:
  - "specs/web/epics/USE-daily-use/ux/dev-notes/blocks-and-todos-model.md"
  - "D-USE-31"
  - "D-USE-74"
  - "D-USE-80"
truth_files: "none: no behaviour changes; the tables are unread until wave 3"
qa: Q3
reviewers:
  - mason
  - warden
focus:
  - "slot_events' append-only policies and the static RLS test (warden, Q3)"
  - "0012's SQL: additions only, ADD VALUE never used in its own transaction (mason, Q3)"
operator_review: false
planned_paths:
  - "packages/types/src/domain/"
  - "packages/constants/src/"
  - "packages/db/src/schema/enums.ts"
  - "packages/db/src/schema/index.ts"
  - "packages/db/src/schema/user/users.ts"
  - "packages/db/src/schema/notification/notification-prefs.ts"
  - "packages/db/src/schema/planner/"
  - "packages/db/src/schema/work/"
  - "packages/db/src/schema/rls/standard-policies.ts"
  - "packages/db/migrations/0012_use_daily.sql"
  - "packages/db/migrations/meta/"
  - "packages/db/migrations/migrations.lock.json"
  - "packages/db/SCHEMA_REFERENCE.md"
  - "tests/use-rls.test.ts"
  - "docs/decisions/ledger.md"
depends_on:
  - "USE-1"
out_of_scope:
  - "linear_* and google_* tables, token columns and their crypto: the Linear connect ticket's migration (Q3)"
  - "Zod schemas for the records: the validators ticket"
  - "Services and routers: wave 3"
  - "The account export gaining the new tables: a wave 3 ticket"
  - "Applying the migration anywhere"
criteria:
  - id: C1
    statement: "Every table 0012 creates except slot_events enables RLS and has select, insert, update and delete policies for authenticated callers, each keyed on the caller owning user_id"
    evidence: test
    command: "yarn test:root"
  - id: C2
    statement: "slot_events enables RLS, lets its owner select and insert, and denies update and delete to every authenticated caller"
    evidence: test
    command: "yarn test:root"
  - id: C3
    statement: "0012 holds no DROP and no RENAME, alters no old table except adding users.clients_enabled, changes enums only by ADD VALUE, and uses no added value as a default"
    evidence: test
    command: "yarn test:root"
  - id: C4
    statement: "0012 holds every CHECK the Build notes list: one of rrule and on_date on a block; ends after starts; one slot target and a tier only with a work item; a block change skipped or with both times; a work item's length range in order"
    evidence: test
    command: "yarn test:root"
  - id: C5
    statement: "0012 holds every unique key the Build notes list, among them a work item, a block item and a to-do each slotted once per date, and client_event_id once per user"
    evidence: test
    command: "yarn test:root"
  - id: C6
    statement: "0012 is recorded in the migrations lock, and nothing in it acts on Supabase's auth schema"
    evidence: check
    command: "yarn check-migrations"
  - id: C7
    statement: "The unions, the value lists and the schema's enums agree, and every workspace type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C8
    statement: "Taylor has read 0012 and applied 0009, 0010, 0011, then 0012 on staging"
    evidence: manual
    reason: "only Taylor runs migrations (C10); the builder defers it"
  - id: review:mason
    statement: "Mason reviews this ticket in fresh context against its contract and evidence."
    evidence: manual
    reason: "a reviewer's judgment, recorded only by yarn review:run mason <id>"
  - id: review:warden
    statement: "Warden reviews this ticket in fresh context against its contract and evidence."
    evidence: manual
    reason: "a reviewer's judgment, recorded only by yarn review:run warden <id>"
---

# Contract — USE-2 schema-0012-rls

## Build notes

The columns are the planner and work tables in `technical/data-contract.md`, plus the additions below. Where the two differ, this ticket wins. C2, C7 and C10 are Taylor's calls (`technical/calls.md`). The integration tables were split out to Linear connect at the Tickets gate (calls.md, Decided here).

- **Approach:**
  1. Unions go into `@syn/types`; plain `as const` value lists go into `@syn/constants`. Neither imports the other: both sit at the bottom of the boundary graph.
  2. Each pgEnum is `pgEnum(name, enumValues<Union>()(LIST))` in `@syn/db`, which may import both, so a missing or extra value fails to compile there. Then the tables; then `ownerAppendOnlyPolicies`.
  3. Run `yarn db:generate`, name the file `0012_use_daily`, and read every statement. Then run `yarn check-migrations --record` and `yarn db:schema-reference`.
- **Decisions that apply:**
  - D-USE-31: tiers slot pool items into a day.
  - D-USE-74: an undone slot returns at its block's end.
  - D-USE-80: one RFC 5545 rule per block.
  - D-USE-95: client colours are rose, leaf, amber, moss, slate and ink.
  - D-USE-28 and D-USE-30: meal topics are saved, each with a name, an icon, one link and an order.
  - D-USE-36: custom colours are saved for reuse.
  - D-USE-34: a transition has no kind and no repeat. It takes its block's colour and days, and can switch Meal on.
- **Every table:**
  - `id` uuid, `created_at`, `updated_at` (`slot_events` has no `updated_at`).
  - `user_id`, a foreign key to `users`, cascading on delete, indexed.
  - `ownerPrivateCrudPolicies({ prefix, ownerColumn })`, keyed on `app.user_id`.
- **Enums:**
  - `block_kind` gains wellness, life, todos and evening.
  - `notification_kind` gains `todo_reminder`.
  - New: `block_fill` (set_items, tasks_for_the_day, from_todos), `todo_type` (home, errand, call, digital, other), `work_tier` (urgent, primary, secondary, stretch), `work_size` (quick, small, medium, large, huge), `slot_event_kind` (data-contract's eight), `done_source` (synapse, linear), `client_color_key`, and `meal_link_kind` (playlist, channel, search).
  - Lists for the seven new-block kinds, the fills, to-do types, tiers, sizes, event kinds and client colours are exported for the validators.
- **Additions and constraints:**
  - `blocks`:
    - `starts_at` and `ends_at` are `time`, with `ends_at > starts_at`; `24:00` is a valid end.
    - CHECK on `num_nonnulls(rrule, on_date) = 1`.
  - `block_items` gains `is_transition` (boolean) and `meal` (boolean). A transition inside a block is an item with `at_time` and `length_min` set, so the items after it move by its length. A transition outside every block is a `blocks` row of kind `transition`, with its own rule or date.
  - `block_changes`: unique on `(block_id, on_date)`; CHECK that the row is `skipped`, or has both times.
  - `slots`:
    - CHECK on `num_nonnulls(block_item_id, todo_id, work_item_id) = 1`;
    - CHECK that `tier` is null unless `work_item_id` is set;
    - unique on `(work_item_id, on_date)`, `(block_item_id, on_date)` and `(todo_id, on_date)`;
    - the id may be supplied by the client (offline taps).
  - `slot_events`: unique on `(user_id, client_event_id)`; `step_away_id` nullable; `received_at` defaults to now; indexed on `(slot_id, at)`.
  - `day_records`: unique on `(user_id, on_date)`.
  - `work_items`: CHECK `length_min_min <= length_max_min`. Its Linear columns are plain nullable columns here; Linear connect adds their foreign key.
  - `clients`: `color_key` is `client_color_key`; `logo_path` (nullable) is for D-USE-42's uploaded logos.
  - `meal_topics`: `name`, `icon`, `link_kind`, `link_value`, `sort_order`.
  - `saved_colours`: `hex` (`#rrggbb`), `sort_order`; unique on `(user_id, hex)`.
  - `IconValue` gains `{ kind: "lucide"; value; color }`: a Lucide name, plus a palette key or a hex (the icon picker's dev note). Icons are jsonb, so this changes no SQL.
- **Interfaces:**
  - The tables, exported from `@syn/db`.
  - `ownerAppendOnlyPolicies({ prefix, ownerColumn })`: owner select and insert; update and delete `denyAuthenticated`.
  - `users.clientsEnabled`.
  - The value lists in `@syn/constants`.
- **Per path:**
  - `planner/`: blocks, block_changes, block_items, todos, slots, slot_events, day_events, day_records, meal_topics, saved_colours.
  - `work/`: work_items, clients.
  - `tests/use-rls.test.ts` reads `0012_use_daily.sql` as text, with one test per criterion from C1 to C5, named after it.
  - The ledger gets a line for the append-only policy shape.
- **Gotchas:**
  - Rabbit hole 2: no default or row in 0012 uses a value it adds.
  - Old schema files stay put. If generate emits anything for an old table, fix the schema, never the SQL.
  - drizzle-kit may re-emit the `auth` stub. `check-migrations` fails it; see `packages/db/AGENTS.md`.
  - A child row's foreign key does not check the parent's owner. Services read the parent through `ctx.rls` before they write a child (wave 3). Composite owner keys are not used here.
- **Model:** Opus 5.5 at medium. A smaller model hand-edits the generated SQL or loses a policy.
