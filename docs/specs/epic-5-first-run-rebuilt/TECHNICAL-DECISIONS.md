# Epic 5 — The first run rebuilt (UX v1.2) — Technical Decisions (append-only)

One section per architectural choice that had real alternatives. Written when the decision is made. Format:

```
## YYYY-MM-DD · <ticket-id> · <the decision, as a statement>
**Context (as it was then):** …
**Options weighed:** A … B … C …
**Decision:** …
**Consequences:** what this buys, what it costs, what it forecloses.
**Revisit trigger:** the condition under which this should be reopened.
```

The first eleven (TD-10…TD-20, continuing Epic 4's numbering) are Mason's architecture pass over UX v1.2 §11 and the engineering handoff's §3 doors, made 2026-09-16 before any ticket was cut, so every ticket builds inside them. Tickets cite them by number. Epic 4's TD-1…TD-9 stand and are consumed, never reopened.

## 2026-09-16 · TD-10 · `day_plans` is a table of references; a plan copies nothing

**Context (as it was then):** v1.2 §3.13 and §11.5 need a named, reusable composition — weekdays, a work-day type, four times, three block templates, training placements, breaks, fixture exclusions — that the week build reads first and the orient frame can set a day from. The handoff's §3.1 names the fork.
**Options weighed:** A — `day_plans` as a row of foreign keys and two small jsonbs, with `templates` untouched. B — a jsonb `users.week_plan` keyed by weekday. C — a `templates` row of kind `day` with child references.
**Decision:** A. B cannot be named, reused by two weekdays, or duplicated into *Day B*; seven slots is not the model Taylor described. C makes a day a block, and the block is the one unit v1.1 made load-bearing (TD-1, TD-2) — a day is an ordered set of blocks, not a block. A plan therefore holds `prep_template_id`, `morning_template_id`, `wind_down_template_id`, `work_template_id` (all `set null`), `weekdays smallint[]`, the four nullable times (null = the profile's or the type's), `training jsonb [{ habitId, placement }]` reusing `day_blocks.placement`'s enum, `breaks jsonb [{ habitId, at: "midday" | "HH:MM" }]`, `excluded_fixture_ids uuid[]`, `sort_order`, `state ∈ {draft, complete}`, `name`, `icon`. The three lists are ordinary named templates the builder creates; a second plan references *Getting ready A* rather than copying it, so editing the template edits every plan, and the block editor's template list says *used by Day A, Day B*.
**Consequences:** Buys reuse, duplication, and a week build whose first read is one join. Costs a service-enforced invariant — a weekday belongs to at most one plan per user — that a check constraint cannot express over arrays (the service validates on every write and the week view treats a double-claimed day as the lower `sort_order`'s, logged as a warning). Forecloses nothing; deleting a plan deletes references only.
**Revisit trigger:** a plan that needs per-block overrides beyond the four times (none foreseen — that is what editing the day in the week build is for).

## 2026-09-16 · TD-11 · Versions are a jsonb on `habits`; the chosen version is a snapshotted key on the item; no alternates rows are written

**Context (as it was then):** v1.2 §3.5 and R34 let a habit carry up to three named lengths (*Quick 5 · Full 20*), shown with the *one of* grammar at the pick and in the editor. The handoff's §3.2 offers jsonb or a `habit_versions` table.
**Options weighed:** A — `habits.versions jsonb [{ key, label, minutes }]` (≤ 3, first is the default) and `day_items.version_key text` snapshotting the choice; the pick and the item sheet change `version_key` and `duration_min` together. B — a `habit_versions` table. C — materialise a version as an `alternates_group` of N items, reusing DYN-4's *one of* rows.
**Decision:** A. C is the tempting one because Vesper said "no new mechanic", but she meant the grammar, not the rows: materialising three items per habit and marking two `not_assigned` for every habit with versions triples the row count on every day for a choice that is a single number. A version is a duration with a label; the item already stores a duration. B is a table for a fact never queried apart from its habit (the same reasoning as TD-3). The validator holds the shape (`habitVersionSchema`, 1–3 entries, unique keys, `label ≤ 20`, `minutes 1–480`); `editHabitDay` and `confirmDay` accept a `versionKey` and resolve it to minutes server-side so a client cannot send a length that no version has while claiming a version.
**Consequences:** Buys one row per habit per day, as today, and a change of version that is one update. Costs a nullable text column most rows leave null and a resolver step in two services. Forecloses a version with its own priority or its own range, which nobody has asked for.
**Revisit trigger:** a version needing more than a label and a length.

## 2026-09-16 · TD-12 · Travel rows are `day_items` with `origin = travel` and a `parent_item_id`; the workout's length never includes them

**Context (as it was then):** v1.2 §3.7 and R35 store `travel_there_min` / `travel_back_min` / `plan_travel` on the workout and want two rows beside it on the day, each droppable, shortenable, movable alone; the Schedule draws them as thin ends of one band.
**Options weighed:** A — two `day_items` rows, `origin = travel`, `parent_item_id uuid → day_items(id) on delete cascade`, materialised into the training block's stack before and after the workout, titled from the location (*→ Gym*, *← Home*) with a plain-arrow icon. B — a `role ∈ {travel_there, workout, travel_back}` column on `day_items` with the three rows sharing a `multitask_id`-style group id. C — fold travel into the workout's `duration_min` and draw the ends from the habit's two numbers.
**Decision:** A. C breaks the one thing Taylor asked for — dropping the ride home without touching the workout — and makes the Review count travel as training. B is A with a second grouping mechanism beside `multitask_id` and `alternates_id`; a parent pointer is the plainer shape and cascades correctly when the workout is one-off-deleted. `stackBlock` is unchanged: the two rows are two more items in the block's stack with `gap_before_min 0`. The Schedule groups by `parent_item_id` for the band; the Today tab renders three `ItemRow`s. When `plan_travel` is false the rows are not materialised and the travel exists only on the habit.
**Consequences:** Buys independence of the three rows in every service that already handles an item (done, not today, move, shorten, Adjust). Costs a self-referencing FK and a materialiser that writes three rows for one placement. Forecloses nothing.
**Revisit trigger:** travel for something other than a workout (a class's commute) — then `parent_item_id` already generalises.

## 2026-09-16 · TD-13 · `quotes` is a shipped catalogue under `catalogReadPolicies`; the admin write surface is a separate, provisional ticket

**Context (as it was then):** v1.2 §3.12 and §11.6 need a bank of quotes every signed-in person can read when opted in, that nobody but Taylor writes. The handoff's §3.4 sizes an admin role as the first non-user-private surface. On disk, `packages/db/src/schema/rls/standard-policies.ts` already has `catalogReadPolicies` — "a table the product ships rather than a person writes … No admin write path exists; a catalogue changes by migration."
**Options weighed:** A — `quotes` under `catalogReadPolicies`; the read query filters `published_at IS NOT NULL`; rows arrive by migration/seed; no admin surface. B — A plus an admin route group (`app/(admin)/quotes`), an `adminProcedure` tier gated by an `ADMIN_USER_IDS` allow-list read through `env.ts`, writing through the service-role client (legitimate here — `quotes` is not user data, and the RLS promise is about user data). C — an `is_admin` column on `users` and an RLS write policy for admins.
**Decision:** A now, in the migration ticket, so the opt-in switch and the carousel ship with a real table; B as its own ticket (RUN-14), **`[PROVISIONAL — Taylor, D3]`**: it is a new procedure tier and the first app path that writes with the service role, and Taylor asked for it, so it is cut and gated rather than declined. C is refused outright — a role column on `users` is one careless policy away from an admin-read on user data, which the schema promises never exists. If RUN-14 ships, the comment on `catalogReadPolicies` gains one line: a catalogue may also change through an admin surface that writes with the service role. Until then the bank is seeded by migration and Taylor edits it that way.
**Consequences:** Buys a table today and a surface only when ratified. Costs a seed path Taylor has to learn if D3 stalls. Forecloses nothing.
**Revisit trigger:** D3's answer; or a second catalogue that needs editing (the curated icon set), which would make the admin tier earn its keep twice.

## 2026-09-16 · TD-14 · Work-day types are `templates` of kind `work`, given the four columns a type needs; the profile keeps its three anchor columns as the defaults

**Context (as it was then):** v1.2 §3.8 and R32 give a work-day type a name, a kind (remote · coworking · office · other), its own *working by* and *until about*, and its own *what gives*. DYN-11 ruled "the second work template stores a name and a start" and every type shares the profile's end; v1.1 §11.4 kept `anchor_time` as the override. TD-1 made `templates` the block template table.
**Options weighed:** A — add `work_end_time time`, `location_kind enum`, `anchor_direction enum` (nullable → the profile's) and `icon jsonb` to `templates`, meaningful only for `kind = work`; `anchor_time` stays the start. B — a `work_day_types` table. C — the profile's three columns become a jsonb array of types.
**Decision:** A. R5 already made a work template a different shape of work day; v1.2 gives it the front door and the two columns DYN-11 declined. B is TD-3's mistake in reverse. C loses the template row that `day_blocks.template_id` and the week build already point at. On screen 3's *Yes* path the one work template is created silently with the profile's values, so `day_plans.work_template_id` always has something to point at; the profile's `work_start_time`, `work_end_time`, `anchor_direction` remain the defaults every other screen reads and take the first type's values when several exist. A validator rule refuses the four columns on any kind but `work`.
**Consequences:** Buys one editor, one archive path, and a plan that picks a type the way it picks a routine. Costs four nullable columns every non-work template leaves null. Forecloses nothing.
**Revisit trigger:** a type needing fixtures of its own (v1.1 §3.8 mentions it) — those are weekday fixtures already, and a plan's `excluded_fixture_ids` is where a type-specific fixture would be turned off.

## 2026-09-16 · TD-15 · Passages are a table with a Markdown body and up to four images in a `passages` bucket

**Context (as it was then):** v1.2 §3.12 and §11.4. The handoff's §3.5 and §3.8 leave the storage form and the bucket to Mason.
**Options weighed:** Body: A — Markdown text, the editor round-trips it. B — Tiptap's JSON document. C — sanitised HTML. Images: D — the `icons` bucket with a `passages/` prefix. E — a `passages` bucket with the same owner-segment grammar and policies.
**Decision:** A and E. Markdown is readable in an export, in a database row, and by the future Expo app without the editor; Tiptap JSON binds the record to one library's schema version, and HTML needs a sanitiser on every read. The five controls v1.2 allows (bold, italic, blockquote, bullet list, link) round-trip through Markdown losslessly, which is the whole reason the toolbar is that small. A separate bucket keeps `parseAssetPath`'s bucket set honest (an image that is a passage's is not an icon) and costs one line in `ASSET_BUCKET_BY_KIND` (`passage: "passages"`) plus the storage policy and the read route's allow-list. `passages.images` stores bucket-qualified paths, ≤ 4; the read route serves them exactly as it serves an icon (owner-segment check, 404 never 403).
**Consequences:** Buys a record that outlives the editor and an export that reads. Costs a Markdown bridge dependency in `@syn/ui` (TD-16) and a fourth bucket. Forecloses inline images inside the body (the gallery is separate by design).
**Revisit trigger:** a formatting need Markdown cannot carry (none in the allowed set).

## 2026-09-16 · TD-16 · `@dnd-kit/*` and `@tiptap/*` (with `tiptap-markdown`) are `@syn/ui`'s alone, enforced like `frimousse`

**Context (as it was then):** v1.2 §10.2 adds `SortableList` (dnd-kit, the Conscious Connections convention) and `RichTextEditor` (tiptap). `packages/config/eslint/boundaries.js` already restricts `frimousse` to the `ui` zone with the comment "web rendering stays behind @syn/ui's re-skin".
**Options weighed:** A — add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `tiptap-markdown` to `RESTRICTED_EXTERNAL` with `owners: ["ui"]`. B — allow the app to import them for app-local composition. C — a hand-rolled sortable and a textarea with Markdown hints.
**Decision:** A. B is the portability leak TD-16's ancestor exists to prevent: a feature folder importing dnd-kit is a rewrite scheduled for the Expo app. C throws away a proven convention (CC ships both) to save a dependency. The existing `DragLayer` stays for the Schedule's two-dimensional drag; `SortableList` is for vertical lists only and the two never share code — a list is not an axis. `frimousse`'s comment is generalised to cover all three.
**Consequences:** Buys two composites the app composes without knowing the engine. Costs seven packages in `@syn/ui`'s dependencies and a Storybook that loads them. Forecloses nothing.
**Revisit trigger:** never for these; a new rendering dependency joins the same list.

## 2026-09-16 · TD-17 · *Set from the plan* calls the existing `confirmDay` with the defaults the quick-pick would have preselected; there is no second confirm path

**Context (as it was then):** v1.2 R37 and §5.3: under `morning_mode = set_from_plan`, *Start the morning* on the orient frame sets the day and the pick is skipped; under `build_each_morning` the pick opens expanded. TD-5 wrote `original_scheduled_start` in `confirmDay`; DYN-14 built the pick's default resolution in `services/day/quick-pick.ts`.
**Options weighed:** A — `day.saveMorning` (the orient write) gains `andSetDay: boolean`; when true the service computes the pick's defaults through the existing `buildQuickPick`-style resolution (the plan's choices where a plan exists, the week build's otherwise) and calls `confirmDay` with them in the same transaction. B — a new `setFromPlan` service that materialises from `day_plans` directly. C — auto-confirm in the entry tree when the frame is opened.
**Decision:** A. B is a second materialiser (TD-4's sin at the day level). C detects — v1.1 §2.3 forbids it, and Vesper's §13 #27 chose the tap. The *Sometimes* day's *Working today?* question is asked on the frame's primary as a two-row dialog before the call, so the service receives an answer, never infers one. A day with an unplaced workout cannot occur under a plan (the plan carries the placement); without a plan, `andSetDay` falls back to the pick as if the mode were *build*, and the response says so.
**Consequences:** Buys one confirm, one place R23 is honoured, and a pick that is still there under the other mode. Costs a `saveMorning` that can fail on confirm after the fields saved — the fields are autosaved already, so the failure line names the set, not the words. Forecloses nothing.
**Revisit trigger:** a plan-time choice the pick cannot represent (none: the plan is a superset of the pick's defaults by construction).

## 2026-09-16 · TD-18 · The stepper composites own the optimistic value and the debounce; screens do not

**Context (as it was then):** v1.2 §2 guardrail 4 and §10.2: every stepper holds its value locally, writes on a 400ms debounce, never disables in flight, reverts with one line on failure. DYN-11's screens waited on the mutation per tap (S7.5).
**Options weighed:** A — `MinutesStepper`, `CountStepper`, `Stepper17` take `value`, `onChange` (synchronous, local) and `onCommit` (debounced by the composite, 400ms, trailing) plus `committing`/`error` props the screen feeds back; a small `useOptimisticValue` hook in `@syn/hooks` holds the shadow value and the revert. B — each screen wraps its own `useDebounce`. C — a tRPC optimistic-update helper per mutation.
**Decision:** A. B is a convention held by vigilance; the first screen that forgets it is S7.5 again. C is transport-bound in the wrong layer. The hook is platform-pure (no DOM) so `@syn/hooks` is its home (placement rule for headless hooks); the composites consume it. `SelectRow`'s tick uses the same hook with a zero debounce (a tick is a commit).
**Consequences:** Buys the rule as a property of the component. Costs a prop contract change on three composites and every existing caller updated in the same ticket. Forecloses nothing.
**Revisit trigger:** a stepper that must not debounce (none — a slow write is never a reason to make the tap slow).

## 2026-09-16 · TD-19 · *Rarely* applies a work-day type to a day through one service and a `days.work_template_id` column

**Context (as it was then):** v1.2 R40 and §3.9: a *Rarely* day is planned as off; the day header sheet offers *Working today*, which applies a type (the work block, its hours, its fixtures) and re-flows.
**Options weighed:** A — `applyWorkType(dayId, templateId)` in `services/day/`: creates the work `day_block` from the type, materialises the day's work fixtures as pins, re-lays through `layOutDay`, records `days.work_template_id`; the reverse (*Not working after all*) archives the block's items as `not_assigned` and nulls the column. B — treat it as a shape change (`days.shape`) with the work block implied. C — re-run the week build for that day.
**Decision:** A. B has no place to remember which type was applied when there are two. C rebuilds touched rows, which the reconcile rule forbids. `days.work_template_id` is also what the week build writes for every planned work day from now on (the plan's type), so the day header's *Remote · 9:00* line has a source.
**Consequences:** Buys one service the header sheet calls and the week build shares. Costs a column and a reverse path. Forecloses nothing.
**Revisit trigger:** never; it is the honest shape of "working today after all".

## 2026-09-16 · TD-20 · The emoji register rule is an ESLint rule on `copy.ts` files; seeds carry `icon` as `IconValue`

**Context (as it was then):** v1.2 R29 and §12.1: no emoji in any string the app speaks; emoji only as the icon of a thing the person owns. The handoff's §1 asks for tooling.
**Options weighed:** A — an ESLint override in `packages/config/eslint` for `**/copy.ts` and `packages/constants/src/**` (except the seed files that carry icons) using `no-restricted-syntax` on string literals matching `\p{Extended_Pictographic}`; seeds carry `icon: { kind: "emoji", value }` beside the title so the glyph never lives in a title string. B — a script in a new root command. C — a review checklist line.
**Decision:** A. It runs inside `yarn lint`, so the verify line in the spine does not change, and a violation is a red line in the editor, which is the cheapest enforcement point. The seed files that legitimately carry glyphs are named in the override's exceptions and carry them only in `icon.value`, never in `title`. The `font-emoji` stack is one `@theme` line in `preset.css` and `ItemIcon` already renders `kind: "emoji"`.
**Consequences:** Buys the rule as a lint failure. Costs one override block and a comment explaining the exception list. Forecloses emoji in copy, which is the point.
**Revisit trigger:** a locale or a person-facing string that needs a glyph (none foreseen; the four archetype cards carry theirs as data, not copy).
