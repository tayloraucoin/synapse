# RUN-1 — Vocabulary, view models, validators, the seeds with their glyphs, the emoji lint rule, and the two guide amendments

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 0** · Size: M
**Slice type:** Contract / types / constants — no UI, no schema, no procedure. The risk class is *a second home for a fact* (a glyph in a title string, a kind list spelled twice, a union in a `pgEnum` tuple that disagrees with `@syn/types`) and *a rule that only a reviewer enforces* (the emoji register).
**Vigil:** none. **Mason review:** the unions and the `pgEnum` tuples move together (as DYN-1 did); the ESLint override's file globs and its exception list.

**Status:** Not started

> **Mason — contract review.** Confirm: every new union in `@syn/types` has its `pgEnum` tuple beside it in `@syn/db`'s enums (the DYN-1 pattern) so RUN-2's migration reads the same list; the lint override fails on a glyph in any `copy.ts` and passes on the five seed files; no seed file carries a glyph anywhere but `icon.value`.

---

## Outcome

The workspace speaks v1.2 before any row or pixel changes: `WorkDayMode` has *rarely*, `MorningMode`, `WorkDayKind`, `FixtureKind`, `WorkoutLocation`, `HabitVersion`, `DayPlanState`, the plan's two jsonb shapes and the passage, quote, work-day-type and day-plan view models exist in `@syn/types`; `ItemOrigin` has *travel* and `NotificationKind` has *journal_reminder*; every validator the services will need is defined once in `@syn/validators`; every starter row in `@syn/constants` carries its glyph as an `IconValue`, and four new seed lists (workout types, fixture kinds, work-day kinds, the archetype glyphs) sit beside it; the placed evening rows have theirs; the notification catalogue has N2; `yarn lint` fails on an emoji in any `copy.ts`; and the two guides carry the two new guardrails. After this ships, **RUN-2 has enums to migrate to, RUN-7 has the seeds to story, and every screen ticket has the words.** No table, no procedure, no component changes here.

## Why / intent

- **v1.2 §1.4** — the vocabulary rows: *step*, *version*, *work-day type*, *day plan*, *getting ready*, *passage*, *quote*, *travel*, *morning mode*. The unions are their code names.
- **v1.2 R29, §12.1, TD-20** — *"the product's copy never contains one; a thing the person owns may carry one as its icon … An agent can grep the copy files for the rule."* The rule lives in lint.
- **v1.2 §12.4** — the seeds and their glyphs, verbatim: morning (recommended and all), getting ready, break, wind-down, workout types, fixture kinds, work-day kinds, the archetype cards, the placed evening rows. *"Where the same noun appears in two blocks … it carries the same glyph."*
- **v1.2 §2 guardrails 4–5** — optimistic by rule; save as you go. These go to `docs/ai-guides/component-guidelines.md` (a section, with TD-18's prop contract) and `docs/ai-guides/copy-conventions.md` gains the emoji rule.
- **v1.2 §9** — N2 *Journal reminder*, on by default, *"A few lines · 20:45"*, in the catalogue.
- **v1.2 §11** — the columns RUN-2 adds are typed here first: `rarely`; `morning_mode`; `location_kind`; `kind` on fixtures; `location`; `versions`; `origin: travel`; `day_plans.state`, `training`, `breaks`.
- **TD-11, TD-12, TD-14, TD-19** — the shapes.
- **Ground truth (consumed, never rebuilt):** `packages/types/src/domain/{domain,view,ui-state}.ts`; `packages/db/src/schema/enums.ts` (the five DYN-1 tuples); `packages/validators/src/{habit,fixture,template,user,preferences,notification,asset}.ts`; `packages/constants/src/{starter-library,block-kinds,notification-catalogue,journal-prompts,limits}.ts`; `packages/config/eslint/` (the boundaries file and the base config); `IconValue` and `iconValueSchema`.
- **What this slice is NOT (binding):** the migration (RUN-2); any service (RUN-3…RUN-6); any composite (RUN-7); any `copy.ts` (the screen tickets). It changes no runtime behaviour.

**Rulings this slice makes (labelled, logged):**

- **The five seed files that carry glyphs are named in the lint override's exception list** — `starter-library.ts`, `workout-types.ts`, `fixture-kinds.ts`, `work-day-kinds.ts`, `schedule-shapes.ts` — and the rule still forbids a glyph in any `title` string within them (the override matches literals in `icon.value` positions only where that is expressible; otherwise the exception is the file and the acceptance criterion greps titles). Logged.
- **`HabitVersion.key` is a short slug the client generates** (`quick`, `full`, or a nanoid when custom); uniqueness within the habit is the validator's; the first entry is the default. Logged.
- **`DayPlanBreak.at` is `"midday" | ClockTime`** — a string union, validated by `clockTimeSchema` for the second arm. Logged.
- **`FixtureKind`'s default block is data beside the kind** (`FIXTURE_KINDS[kind].defaultBlockKind`), never a switch in a screen. Logged.
- **N2's kind is `journal_reminder`**; its catalogue row carries `defaultOn: true` and the title *A few lines*. Logged.

## Behaviour & states

**No surface.** Described by the exports:

- `@syn/types`: `WorkDayMode` += `"rarely"`; `MorningMode`; `WorkDayKind`; `FixtureKind`; `WorkoutLocation`; `HabitVersion`; `DayPlanState`; `DayPlanTraining { habitId; placement: TrainingPlacement }`; `DayPlanBreak { habitId; at }`; `ItemOrigin` += `"travel"`; `NotificationKind` += `"journal_reminder"`; view models `WorkDayTypeView`, `PassageView`, `QuoteView`, `DayPlanSummaryView`, `DayPlanView` (the plan with its three templates' names and lengths resolved), `HabitSummaryView` += `versions`, `location`, `travel`, `workoutType`; `FixtureView` += `kind`, `icon`; `DayItemView` += `versionKey`, `parentItemId`; `OrientView` += `passages: PassageView[]`, `quote: QuoteView | null`, `askIntention`, `askVisualisation`, `morningMode`.
- `@syn/db` enums: `work_day_mode` (if it is an enum — on disk `work_days` is jsonb, so this is a zod union only; confirm), `morning_mode`, `work_day_kind`, `fixture_kind`, `workout_location`, `day_plan_state`; `item_origin` and `notification_kind` tuples extended. `[NEEDS VALUE AT BUILD: read `enums.ts` to see which of these are `pgEnum`s and which are jsonb-typed; add tuples only for the `pgEnum`s.]`
- `@syn/validators`: `workDaysSchema` accepts `rarely`; `morningModeSchema`; `workDayKindSchema`; `fixtureKindSchema`; `workoutLocationSchema`; `habitVersionSchema` and `habitVersionsSchema` (1–3, unique keys, `label ≤ 20`, `minutes DURATION_MIN…DURATION_MAX`); `habitFormSchema` += `versions`, `workoutType`, `location`, `travelThereMin`, `travelBackMin`, `planTravel` (the last four refused unless `type = workout`); `fixtureFormSchema` += `kind`, `icon`; `templatePatchSchema` += `workEndTime`, `locationKind`, `anchorDirection`, `icon` (refused unless `kind = work`); `updatePreferencesInput` += `morningMode`, `quotesOptIn`, `orientAskIntention`, `orientAskVisualisation`, `journalReminderEnabled`, `journalReminderTime`; `passageFormSchema` (`title ≤ 80` nullable, `bodyMd 1…8000`, `images ≤ 4` of asset paths, `tags ≤ 10 × ≤ 24`); `dayPlanFormSchema` and `dayPlanPatchSchema` (name `1…TEMPLATE_NAME_MAX`, weekdays ⊂ 0–6, the FKs nullable, the four times `clockTimeSchema` nullable, `training`, `breaks`, `excludedFixtureIds`); `assetKindSchema` += `passage`; `versionKeySchema` for item edits.
- `@syn/constants`: `limits.ts` += `PASSAGE_TITLE_MAX 80`, `PASSAGE_BODY_MAX 8000`, `PASSAGE_IMAGES_MAX 4`, `PASSAGE_TAGS_MAX 10`, `PASSAGE_TAG_MAX 24`, `HABIT_VERSIONS_MAX 3`, `VERSION_LABEL_MAX 20`, `TRAVEL_MAX 180`, `VISUALISATION_MAX 280`, `DAY_PLAN_NAME_MAX 40`, `STEPPER_COMMIT_DEBOUNCE_MS 400`, `JOURNAL_REMINDER_OFFSET_MIN 60`, `DEVICES_OFF_OFFSET_MIN 60`; `starter-library.ts` — every entry gains `icon: IconValue` per §12.4; `workout-types.ts` (13 rows: key, title, icon); `fixture-kinds.ts` (7 rows: key, title, icon, `defaultBlockKind`); `work-day-kinds.ts` (4 rows); `schedule-shapes.ts` (the four archetype glyphs keyed by `ScheduleShape`); `block-kinds.ts` or a new `placed-rows.ts` — the glyphs for *Phone away*, *Lights out*, *A few lines*; `notification-catalogue.ts` += N2.
- `packages/config/eslint`: the override (TD-20).
- `docs/ai-guides/component-guidelines.md` += *Optimistic by rule* (the `value/onChange/onCommit` contract, the 400ms debounce, revert with one line, never disabled in flight); `docs/ai-guides/copy-conventions.md` += *Emoji* (R29's sentence and the lint).

**States (exhaustive):** exported · not exported. **Failure / edge states:** a `pgEnum` tuple that omits a union member fails `check-types` through the DYN-1 `satisfies` pattern — keep it.

## Non-negotiables (this slice)

- **One union, one tuple, one zod enum** — spelled from the union, never a second literal list.
- **No glyph in any `title`**; a glyph is `icon.value` and nothing else.
- **No runtime behaviour changes.** Nothing imports the new exports yet.
- **The lint rule is a real failure**, not a warning.
- **The seeds match v1.2 §12.4 verbatim** — titles, ranges, glyphs.

## Data & AI

**Schema changes: none** (the tuples change TypeScript only; RUN-2 migrates).

**Tables:** none.

**Placement:** `packages/types/src/domain/{domain,view}.ts`; `packages/db/src/schema/enums.ts`; `packages/validators/src/{habit,fixture,template,user,preferences,asset}.ts` and new `passage.ts`, `day-plan.ts`; `packages/constants/src/{limits,starter-library,notification-catalogue}.ts` and new `workout-types.ts`, `fixture-kinds.ts`, `work-day-kinds.ts`, `schedule-shapes.ts`, `placed-rows.ts`; `packages/config/eslint/` (the override in the shared config, so every workspace inherits it); `docs/ai-guides/{component-guidelines,copy-conventions}.md`. Placement rules 5 (types), 7 (one Zod home), 6 (constants).

**tRPC / validators:** validators only; no procedure.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable)

1. `@syn/types` exports every union and view model listed above; `check-types` passes with the `pgEnum` tuples extended and `satisfies` intact.
2. `workDaysSchema.parse({ "5": "rarely", … })` succeeds; `habitVersionsSchema` refuses four entries, a duplicate key, a label of 21 characters, and minutes of 0; `habitFormSchema` refuses `travelThereMin` on `type: habit`; `templatePatchSchema` refuses `locationKind` on `kind: morning`; `passageFormSchema` refuses five images; `dayPlanFormSchema` refuses weekday 7 and a `breaks[].at` of `"noon"` (probes pasted in the closing report).
3. `STARTER_LIBRARY` entries all carry `icon.kind === "emoji"`; `grep -n "🍳\|🧘" packages/constants/src/starter-library.ts` finds glyphs only on `icon` lines; *Walk*, *Stretch*, *Meditate*, *Journal*, *Skincare* carry the same glyph in every block they appear in.
4. `WORKOUT_TYPES` has 13 rows, `FIXTURE_KINDS` 7 with `defaultBlockKind` (*meeting*, *appointment* → `work`; the rest → `activity`), `WORK_DAY_KINDS` 4, `SCHEDULE_SHAPE_ICONS` 4, `PLACED_ROW_ICONS` 3 — titles and glyphs as v1.2 §12.4.
5. `NOTIFICATION_CATALOGUE` has a `journal_reminder` row, default on, title *A few lines*.
6. A `copy.ts` containing `"Continue 🎉"` fails `yarn lint` with the override's message; the five seed files pass; a glyph inside a seed's `title` fails (or, if the selector cannot distinguish, the closing report states the grep in criterion 3 is the guard and says so in `DEVIATIONS.md`).
7. `component-guidelines.md` has an *Optimistic by rule* section naming the prop contract; `copy-conventions.md` has the emoji rule; `yarn docs:check-links` passes.
8. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- DYN-1 moved the unions and the tuples together with a `satisfies readonly BlockKind[]`-style check; copy that shape for each new enum.
- `no-restricted-syntax` with a selector like `Literal[value=/\p{Extended_Pictographic}/u]` plus `TemplateElement` covers both string forms; scope it with `files: ["**/copy.ts", "packages/constants/src/**"]` and `ignores` for the five seeds.
- Keep the glyph beside the title in the seed literal (`{ title: "Breath work", icon: { kind: "emoji", value: "🌬️" }, … }`) so a reviewer reads them together.
- `DEFAULT_HABIT_ICON` stays the fallback for *Add your own*; the sheet's picker (RUN-10) opens on it.

## Dev's call

The exact selector for the lint rule · whether `PLACED_ROW_ICONS` lives in `block-kinds.ts` or its own file · view-model field names beyond those listed.

## Out of scope

- **The migration** — RUN-2.
- **Any service reading these** — RUN-3…RUN-6.
- **The composites and the `font-emoji` stack** — RUN-7.
- **The copy files** — each screen ticket.

## Depends on

- **No slice dependencies.** DYN-21 is Complete in `../epic-4-dynamic-schedule/PROGRESS.md` and is consumed.

## Recommended execution

**Sonnet.** Mechanical authoring against a precise list; the risky reasoning (which facts, which glyphs) is pinned. Choosing down to Composer risks a tuple that drifts from its union and a glyph typed into a title.

---

### Kickoff (paste into the session)

> Build **RUN-1 — Vocabulary, seeds, and the emoji rule** (attached spec). Model: **Sonnet**. **One union, one tuple, one zod enum; a glyph is `icon.value` and nothing else; the lint rule is a failure, not a warning.**
> Attach/read first, in order: this spec · v1.2 §1.4, §2, §9, §11, §12.1, §12.4 · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-1 (the union + tuple pattern — reuse, don't fork) · `packages/constants/src/starter-library.ts` · `packages/config/eslint/boundaries.js` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-11, TD-12, TD-14, TD-19, TD-20) · Epic 4's `TECHNICAL-DECISIONS.md` (TD-1…TD-3).
> Add nothing that runs. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands; paste the validator probes.
