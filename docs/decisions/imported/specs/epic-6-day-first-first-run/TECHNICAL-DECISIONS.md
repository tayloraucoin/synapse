# Epic 6 — The first run built day-first (UX v1.3) — Technical Decisions (append-only)

One section per architectural choice that had real alternatives. Written when the decision is made. Format:

```
## YYYY-MM-DD · <ticket-id> · <the decision, as a statement>
**Context (as it was then):** …
**Options weighed:** A … B … C …
**Decision:** …
**Consequences:** what this buys, what it costs, what it forecloses.
**Revisit trigger:** the condition under which this should be reopened.
```

The first nine (TD-23…TD-31, continuing Epic 5's numbering) are Mason's architecture pass over UX v1.3 §3 and §11, made 2026-09-24 before any ticket was cut, so every ticket builds inside them. Tickets cite them by number. Epic 4's TD-1…TD-9 and Epic 5's TD-10…TD-22 stand and are consumed, never reopened.

## 2026-09-24 · TD-23 · The work template is plan-owned: created with the plan, named after it, archived with it; the profile's anchors are the first plan's

**Context (as it was then):** v1.3 R46 and §3.8 retire the work-day type as a noun the person meets: a plan owns its work (kind, *working by*, *until about*, *what gives*). On disk the work-day type is a `templates` row of kind `work` with TD-14's four columns; `day_plans.work_template_id`, `days.work_template_id` (TD-19), `applyWorkType` / `removeWorkType` (RUN-6), `prefillWeek` (RUN-5) and TD-21's snapshot all key on that row. The profile's three anchor columns (`work_start_time`, `work_end_time`, `anchor_direction`) are what a day with no plan reads.
**Options weighed:** A — keep the template as the carrier and make it plan-owned by service rule: `ensureWorkFor(planId)` creates the row on the plan's first work fact with `name = plan.name`, `updateDayPlan` renames it with the plan and patches its four columns, `deleteDayPlan` archives it; `listWorkPlans` (for *Working today*) lists complete plans with a work template, labelled by plan name; the first plan's values are written to the profile's three columns when they are null. B — move the four facts onto `day_plans` as columns (`work_kind`, `anchor_direction`; the two times exist) and drop `work_template_id` from the plan, keeping a hidden template only for `days.work_template_id`. C — keep the type as a shared noun a plan picks (v1.2 R32) and only hide the question.
**Decision:** A. B is a second home for the same four facts (the plan's columns and the day's snapshot would both derive from a template that still had to exist for `applyWorkType`), and the day-side services would need a plan-to-template shim that A does not. C is what Taylor rejected (C1): he named his "types" *Remote — Training Day* because a type was standing in for a day. Under A nothing on the day side changes; `Working today` on a *Rarely* day offers plans instead of types (*Working today · as Day A*); Settings → Work-day types retires because Your days is that list. Two plans with the same hours have two templates with the same numbers, which is honest data and costs nothing.
**Consequences:** Buys R46 with the day-side untouched and one service rule. Costs one more template per plan and a rename hook. Forecloses sharing a work template between plans, which nobody asked for and the plan card can show as identical numbers.
**Revisit trigger:** a person with six plans and one set of hours asking to change them once — then a *same as Day A* reference on the work step, not a return to types.

## 2026-09-24 · TD-24 · Several training blocks per day, keyed by the placed workout; no new column

**Context (as it was then):** v1.3 R52 lifts RUN-5's one-workout-per-day deviation. `day_blocks` has a unique index `(day_id, kind, sort_order)`, so two `training` rows are already legal (the split work container uses it). `reconcileBlocks` in `materialize-day.ts` matches a desired block to an existing one by `kind` alone (the first match), so a second training block would be re-pointed onto the first; `orderBlocks` ranks a placeable block by its `placement` and a bias; `confirmDay` and `prefillWeek` place `plan.training[0]`.
**Options weighed:** A — `DesiredBlock` gains a `key` (`training:<habitId>` for a placed workout; the kind for everything else) and `reconcileBlocks` matches training rows by the workout item the existing block holds (its first `day_items` row with `type = workout`); `orderBlocks` ties by the plan's list order; the materialiser writes one block per `training` entry with its travel rows; `confirmDay`'s single-block path becomes a loop. B — a `day_blocks.habit_id` column written for training blocks and matched on. C — one training block holding N workouts in its stack.
**Decision:** A. C loses per-workout placement, which is the whole ask (before the routine and after work on one day). B is A with a denormalised column the item already carries; it is the fallback if matching by item proves brittle across the untouched-block rule. A touched training block whose workout is no longer placed keeps its rows and loses its link, exactly as SET-6's rule treats every block. The Schedule already groups a workout's travel by `parent_item_id`; N blocks are N bands.
**Consequences:** Buys R52 with no schema change. Costs a keyed match in one function and a loop in two callers. Forecloses nothing.
**Revisit trigger:** the item-based match misfiring on a day where a workout was swapped by *Trade* (`trade-workouts.ts`) — then B's column lands in `0010` and the match reads it.

## 2026-09-24 · TD-25 · `transition` is a ninth block kind, one per day, forward from the end of work

**Context (as it was then):** v1.3 R48 and §3.1: the getting-ready block keeps `prep`; an after-work hand-off is new; inside work a meal is a break. Taylor's model (C2) is "little blocks between registered blocks"; the day builder must draw and materialise one after work now. `block_kind` is a Postgres enum used by `templates`, `habits`, `fixtures`, `day_blocks`, `notification_prefs`; `DEFAULT_BLOCK_ORDER` is six kinds; `BLOCK_KIND_WORDS` names them.
**Options weighed:** A — `ADD VALUE 'transition'` in `0009`; `templates.kind = transition` flows `forward`; `DEFAULT_BLOCK_ORDER` gains `transition` after `work`; the materialiser stacks it from the end of the work block or, when a workout is placed `after_work`, from that block's end; `day_plans.after_work_template_id` references it; the starter library gains `transition` rows. B — reuse `prep` with `flow = forward` and a name. C — N transition blocks per day with a keyed reconcile like TD-24, placed by an anchor enum (`after_work`, `before_wind_down`, `after_training:<id>`).
**Decision:** A. B mislabels: the block editor's *Getting ready* list would hold an after-work list, and `BLOCK_KIND_WORDS` cannot say two things. C is the honest end state of Taylor's sentence and is open item #37; it costs a second keyed reconcile, a plan-side list of anchors, and a builder screen per transition, none of which a real day has needed yet. One after-work block plus breaks inside work draws Taylor's own example day exactly.
**Consequences:** Buys the example day and the after-work list with one enum value and one plan column. Costs the enum value, which cannot be removed. Forecloses nothing: C extends A.
**Revisit trigger:** a person's real day needing a transition that is neither before work, inside it, nor right after it.

## 2026-09-24 · TD-26 · Free time is a pooled `activity` template; the day's activity block materialises pooled and is filled in place by one service

**Context (as it was then):** v1.3 R50 and §3.16: an activity is a `habits` row (`block_kind = activity`); a plan's free time is a pool (*Evenings A*) the evening chooses from; the day's activity block holds its fixtures as pins and waits. `day_blocks.state = pooled` exists (v1.1 §11.7) and means "no items until the pick"; the quick-pick fills pooled morning blocks; `addFromLibrary` adds one habit to a block on the day.
**Options weighed:** A — `templates` of kind `activity` and structure `pool`; `day_plans.activity_template_id`; the materialiser creates the activity block `pooled` with `template_id` set and its fixtures pinned; a new service `chooseFromPool(rls, userId, { date, habitIds })` adds the chosen pool members as items in rank order through `addFromLibrary`'s path and flips the block to `set`; the pick's *Free time* section and the Today row *Choose when you're there* both call it. B — materialise every pool member as an item and let the person drop the rest. C — no template; the pool as a jsonb list on the plan.
**Decision:** A. B turns a menu into a to-do list and the Review would count untouched activities as misses — the opposite of "Free time is never a miss". C forgoes the block editor, *used by*, and reuse between plans, which every other list has. A pooled block that is never filled stays pooled and counts nothing.
**Consequences:** Buys the evening as a choice with the machinery the morning already has. Costs one service and one router procedure. Forecloses nothing.
**Revisit trigger:** choosing the evening the night before (open item #38) — then `chooseFromPool` is called from the journal's close with tomorrow's date.

## 2026-09-24 · TD-27 · A fixture's travel reuses TD-12 whole: the same three columns, the same two rows, one shared writer

**Context (as it was then):** v1.3 R51 and §3.14 give a fixture a place and travel. `habits` carries `travel_there_min`, `travel_back_min`, `plan_travel`; `writeWorkoutRows` in `habit-item.ts` writes the workout's item and its two travel rows with `origin = travel` and `parent_item_id`; the materialiser pins a fixture as one `day_items` row.
**Options weighed:** A — the same three columns on `fixtures` plus `location text`; extract `writeTravelRows(tx, parentItem, { thereMin, backMin, title })` from `writeWorkoutRows` and call it from the fixture pin path when `plan_travel` and either length is positive; the rows stack around the pin inside the fixture's block. B — a fixture-specific origin (`fixture_travel`) and its own writer. C — travel as steps in getting ready.
**Decision:** A. TD-12's own revisit trigger named this case ("a class's commute — then `parent_item_id` already generalises"). B duplicates a writer for the same row shape. C puts an appointment's travel in the wrong block on the wrong day. The location is text the sheet shows; nothing reads it; Google Places is P2-19.
**Consequences:** Buys travel on fixtures with one extracted function. Costs four columns on `fixtures`. Forecloses nothing.
**Revisit trigger:** a third parent kind needing travel (none foreseen).

## 2026-09-24 · TD-28 · `links` is its own table; the kind is derived by the service from an allow-list of hosts; nothing is fetched; the Spotify mark is an inline SVG in `@syn/ui`

**Context (as it was then):** v1.3 R53 and §3.17: a title and a URL, several, Spotify recognised, callouts on the orient frame. The product makes no outbound request on a person's behalf (no oEmbed, no metadata fetch); Lucide carries no brand marks.
**Options weighed:** A — `links` (owner-private; `title`, `url`, `kind link_kind ∈ {spotify, other}`, `sort_order`, `archived_at`); `link_kind` derived server-side from the URL's host against `LINK_HOSTS` in `@syn/constants` and stored, so the frame never parses; URLs validated `https:` (or the `spotify:` scheme, which the service rewrites to `https://open.spotify.com/…` and stores as `spotify`); rendered as `<a target="_blank" rel="noopener noreferrer">`; `BrandGlyph` in `@syn/ui` with the Spotify mark as an inline monochrome SVG path (the mark, not the wordmark, at 20px, ink) and Lucide `Link` for `other`. B — links as a `kind` of passage. C — an icon package for brand marks.
**Decision:** A. B mixes reading with opening and puts a URL into the carousel. C adds a dependency for one path. Spotify's brand guidelines permit the icon for linking to Spotify content; the mark is stored once, no colour, no wordmark. The service never requests the URL.
**Consequences:** Buys links with no network egress and no dependency. Costs a table and a small SVG. Forecloses nothing.
**Revisit trigger:** a second brand mark being wanted — then `BrandGlyph` gains a case, still inline.

## 2026-09-24 · TD-29 · Block hues are token aliases onto the category scales, exposed through one `hue` prop on `BlockBand`, passed only from planning surfaces

**Context (as it was then):** v1.3 R47 and §3.1: bands carry a hue on the primer, the builder's progress and review screens, and the week; never on `/today` or the Schedule. `preset.css` is the one home for hex; the eight category scales exist with 100 and 700 steps that pass AA as a pair.
**Options weighed:** A — `--block-<kind>` and `--block-sleep` declared in `preset.css` as `var(--syn-<hue>-100)` / `-700` aliases (no new hex), utilities `bg-block-<kind>` / `text-block-<kind>-label`; `BlockBand` gains `hue?: boolean` that switches its fill and in-band label to those; `ScheduleAxis` consumers on the execution tabs never pass it; the rule is recorded here and in `brand-tokens.md`'s table. B — new hex for nine block colours. C — pass a CSS variable name per band from the caller.
**Decision:** A. B is a new colour family the brand rules forbid. C spreads token names into feature code. The mapping in v1.3 §13 #31 is `[PROPOSED — needs sign-off]`; the mechanism is not.
**Consequences:** Buys hued planning surfaces with zero new colours. Costs ten aliases and a prop. Forecloses nothing; the mapping flips in one file.
**Revisit trigger:** Taylor's sign-off changing the mapping — one edit in `preset.css`.

## 2026-09-24 · TD-30 · Two migrations: `0009_v1_3_additive` (DAY-4) and `0010_retirements` (DAY-13), the latter absorbing RUN-15's drops

**Context (as it was then):** Epic 5's cleanup, RUN-15, is not started and was renumbered to `0009` by TD-21. v1.3 needs an additive migration now (`transition`, `link_kind`, `links`, the fixture and plan columns, `same_morning_routine`) and retires more (`0009`'s three columns, `users.work_days`' semantics unchanged, `range-input`, `rotation-rows.tsx` already gone, the nine v1.2 step files, the `work-day-types` settings screen). Migrations are numbered by journal order and never reordered.
**Options weighed:** A — `0009` is v1.3's additive migration; `0010` is the one retirements migration for v1.2 and v1.3 together; RUN-15 is marked superseded by DAY-13 with a `DEVIATIONS.md` line in Epic 5. B — build RUN-15 first as `0009`, then v1.3 as `0010`. C — one migration for both.
**Decision:** A. B blocks the fix batch and the additive work on a cleanup nothing waits for. C mixes an additive change with drops, which the migration discipline forbids. RUN-15's content is carried into DAY-13's spec verbatim so nothing is lost.
**Consequences:** Buys the additive work now. Costs a renumbering line in Epic 5's log. Forecloses nothing.
**Revisit trigger:** none; the journal is the record.

## 2026-09-24 · TD-31 · The outer sequence is five steps; the builder owns its own progress; `first_run_step` above five resumes at four

**Context (as it was then):** v1.3 §4 collapses fourteen outer screens into five, with the builder as screen 4 carrying its own caption. `setupRoute(step)` accepts 1–14; `SETUP_TOTAL_STEPS = 14`; `users.first_run_step` on accounts mid-first-run holds values up to 14; Settings → Your day mounts the step components embedded.
**Options weighed:** A — `SETUP_TOTAL_STEPS = 5`, `setupRoute` 1–5, `first_run_step` read through one clamp (`> 5` → `4`) in the entry tree so a mid-flow account lands on Your days; the builder's screen position is not persisted beyond the plan's draft state (a draft resumes at its first missing part, as RUN-12 ruled); Settings routes for the retired screens (`work-start`, `work-day-types`, `wake`) redirect to `your-days`. B — keep fourteen routes and hide nine. C — persist the builder's screen on the plan.
**Decision:** A. B leaves nine dead routes in the map. C persists UI state the plan's parts already imply. The clamp is one line and needs no migration.
**Consequences:** Buys a five-step route map. Costs three redirects and a clamp. Forecloses nothing.
**Revisit trigger:** a sixth outer screen (none foreseen).

## 2026-09-25 · TD-32 · A plan owns a work template when no other plan references it; a shared v1.2 type is copied, never renamed, patched or archived by one plan

**Context (as it was then):** TD-23 makes the work template plan-owned: created by the plan's write, named after it, renamed with it, archived with it, never shared. Before v1.3 a plan picked a work-day type, and two plans could point at one row (*Remote* on Day A and Day B). Nothing on disk says which templates a plan owns, and `0009` is already written.
**Options weighed:** A — read ownership: a work template another plan also references is shared; the first v1.3 work write on a plan that points at a shared row creates the plan's own template (copying the shared row's four values) and repoints; rename, patch and archive touch only a row no other plan references. B — an owner column (`templates.day_plan_id`), written by `ensureWorkFor`, backfilled in `0010`. C — ignore sharing and let the last plan's rename or archive win.
**Decision:** A. C renames Day B's work when Day A is renamed and archives it when Day A is deleted — the drift TD-23 exists to stop. B is honest but needs a migration and a backfill rule for rows two plans share; A needs neither and converges: every plan's first v1.3 work write leaves it owning its own row, and `duplicateDayPlan` never shares.
**Consequences:** Buys TD-23's rule without a schema change, safe on v1.2 data. Costs one lookup per ownership check. Forecloses nothing — B can land later if a third thing needs to know a template's plan.
**Revisit trigger:** a surface outside the plan (Settings, the block editor) needing to ask *whose work is this?* — then B's column.
