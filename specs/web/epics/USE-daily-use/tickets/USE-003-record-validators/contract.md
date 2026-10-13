---
id: "USE-3"
size: small
objective: "Every USE record and write has one zod schema in @syn/validators, so routers, forms, fixtures and data hooks share one shape"
slice_type: "pure schemas at the boundary; risks a shape that drifts from 0012, a rule the database enforces but the form does not, and an old block kind accepted as new input"
non_negotiables:
  - "One schema per shape, each exported with its z.infer type; no second copy of a shape anywhere."
  - "New block input takes only the seven kinds: wellness, training, work, life, todos, break, evening."
  - "Every rule 0012 enforces with a CHECK or a unique key per row is also refused here, with the UX's words where the ledger has them."
  - "Platform-pure: no next/*, DOM or Node-only import."
  - "Linear and Google payload schemas are not written here."
devs_call: "File split inside planner.ts, work.ts and todo.ts; names; how far the rrule shape check goes before the expander takes over."
cites:
  - "specs/web/epics/USE-daily-use/ux/dev-notes/blocks-and-todos-model.md"
  - "specs/web/epics/USE-daily-use/ux/set-my-days/new-block-sheet/index.md"
  - "D-USE-31"
  - "D-USE-35"
  - "D-USE-74"
  - "D-USE-80"
  - "D-USE-34"
waiver: 'The records come from the model dev note; the seven kinds, the transition and "Name needed" come from the New block sheet (D-USE-34). Both are the shapes of one write, so one ticket owns them.'
truth_files: "none: no behaviour changes; nothing reads the schemas until the fixtures ticket"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/validators/src/planner.ts"
  - "packages/validators/src/work.ts"
  - "packages/validators/src/todo.ts"
  - "packages/validators/src/*.test.ts"
  - "packages/validators/src/index.ts"
  - "packages/validators/package.json"
  - "packages/validators/vitest.config.ts"
  - "yarn.lock"
depends_on:
  - "USE-2"
out_of_scope:
  - "Per-surface read shapes (Today, the pool, the Week): the fixtures and data-hook ticket composes them from these records"
  - "Linear and Google wire schemas: their wave 3 tickets"
  - "An event time inside its slot's day window and not past the server's now: a pure function in the utils tickets, called by the router"
  - "Expanding an rrule: the repeat-rule ticket"
criteria:
  - id: C1
    statement: "The new block input accepts each of the seven kinds and refuses orient, morning, prep, activity, wind_down and transition; the transition input takes no kind; inside a block it takes no repeat (it takes the block's days) and needs a start and a length; outside every block it chooses its own rule or date, like a block"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: 'A block needs exactly one of rrule and on_date and an end after its start, with 24:00 accepted as an end; a block change is skipped or carries both times; a missing name is refused with "Name needed"'
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "A slot needs exactly one of a block item, a to-do and a work item, and takes a tier only with a work item"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "A slot event needs one of the eight kinds and a uuid client_event_id, and takes a step_away_id only on paused or resumed"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "A work item's length range refuses a minimum above its maximum; size is one of the five or none; a client colour is one of rose, leaf, amber, moss, slate and ink"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "Every record schema parses a sample row of its table and drops a key it does not know"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "@syn/validators and its importers type-check"
    evidence: check
    command: "yarn check-types"
---

# Contract — USE-3 record-validators

## Build notes

Wave 1, after the schema ticket. The README's contract-first rule says the shapes lock before any UI, and this is that lock. Every surface's data hook takes its types from here.

- **Approach:**
  1. The value lists are USE-2's, in `@syn/constants`, each checked exhaustive against its union. Read them; never retype a value.
  2. `z.enum` over those lists.
  3. Per table, a record schema: the row as a router returns it, in camelCase, with dates as `YYYY-MM-DD` keys (reuse `dateKeySchema` in `keys.ts`), times as `HH:MM`, and instants as ISO strings. Beside each record go its write inputs.
  4. Add `"test": "vitest run"` to the package, with vitest at the version `@syn/utils` pins, so turbo runs it.
- **Decisions that apply:**
  - D-USE-31: Work's tiers slot pool items into a day.
  - D-USE-35: to-do types are Home, Errand, Call, Digital and Other; every to-do has Notes.
  - D-USE-74: a To-dos block fills by the pull rule; an undone slot returns at the block's end.
  - D-USE-80: a block stores one RFC 5545 rule, or one date.
  - D-USE-34: the New block sheet's seven kinds; "Name needed" when the name is empty. A transition has no kind and no repeat, and takes its block's colour and days.
  - Storage, as USE-2 built it: a transition inside a block is a `block_items` row with `is_transition`, `at_time`, `length_min` and `meal`. Outside every block it is a `blocks` row of kind `transition`. Meal topics and saved colours are records too.
- **Interfaces:**
  - **Records** (each with its `z.infer` type): `blockRecord`, `blockChangeRecord`, `blockItemRecord`, `todoRecord`, `slotRecord`, `slotEventRecord`, `dayEventRecord`, `dayRecordRecord`, `mealTopicRecord`, `savedColourRecord`, `workItemRecord`, `clientRecord`; `iconValueSchema` with USE-2's lucide variant.
  - **Inputs:**
    - blocks: `newBlockInput`, `newTransitionInput`, `editBlockInput`, `blockChangeInput`, `blockItemInput`;
    - to-dos: `todoInput`;
    - slots: `placeSlotInput`, `slotEventInput` (an array of these is a replay batch);
    - the rest: `dayEventInput`, `mealTopicInput`, `savedColourInput`, `workItemInput`, `clientInput`.
  - Every one is exported from `index.ts`.
- **Per path:**
  - `planner.ts`: blocks, changes, items, slots, slot events, day events, day records, meal topics, saved colours, the icon value.
  - `todo.ts`: to-dos.
  - `work.ts`: work items and clients.
  - `*.test.ts`: one `describe` per criterion, named after it.
  - `yarn.lock`: vitest is added to the package at the version already in the lockfile.
- **Gotchas:**
  - Mirror 0012's CHECKs exactly: one of rrule or on_date; one slot target; tier only with a work item; `ends_at > starts_at`.
  - `24:00` is a valid end and an invalid start.
  - The rrule text is two RFC 5545 lines, `DTSTART;VALUE=DATE:YYYYMMDD` then `RRULE:FREQ=…` (the start anchors INTERVAL and COUNT; decided with USE-6). The check is shape only: both lines, `FREQ=` and known parts. USE-6's expander rejects what it cannot run.
  - A `slotEventInput` carries the device's `at`. The server's two-minute and day-window test is not a zod rule.
  - Records strip unknown keys (zod's default), never pass them through, so a renamed column shows up as a missing required key, not a silent extra.
- **Model:** Opus 5.5 at medium. A smaller model drifts from 0012's constraints or admits the old kinds.
