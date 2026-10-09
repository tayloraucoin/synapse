# DAY-3 — Vocabulary, view models, validators, the seeds and the tokens: `transition`, `usually`, `link_kind`, the activity and after-work libraries with groups, the morning groups, the widened breaks, the example day, the link hosts, the block words, the block-hue tokens

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 1** · Size: M
**Slice type:** Contract / types / constants — no UI, no runtime pipeline, no migration. The risk class is *a union and an enum that disagree* (the TypeScript side says `transition`, the Postgres enum does not until DAY-4 — nothing may write it before then) and *a seed that carries a glyph in a title*.
**Vigil:** none. **Mason review:** the unions against `enumValues<…>()` in `packages/db/src/schema/enums.ts` (a value added to the union must be added to the tuple, or the build fails — DAY-4 adds it in the same batch); the token aliases in `preset.css` (no hex; every alias resolves to an existing category step).

**Status:** Complete (2026-09-25)

> **Mason — contract review.** Confirm: `BlockKind` gains `transition` in `@syn/types`, `BLOCK_KINDS` in `@syn/constants`, and the `blockKindEnum` tuple in `@syn/db` (the tuple is typed against the union, so the build refuses one without the other — the tuple change is DAY-4's `ADD VALUE`'s TypeScript half and lands here so the batch stays green); `WorkDayMode` gains `usually` and `workDaysSchema` accepts it; `LinkKind` and `linkKindSchema` exist; every new seed row's `title` is plain text and its glyph is `icon.value`; the lint rule's exception list covers only files that carry glyphs; `preset.css` gains aliases only. State the `grep` you ran for the glyph rule.

---

## Outcome

Every word, union, validator, seed and token v1.3's services and screens compute with exists in one place: `BlockKind` has nine values and `BLOCK_KIND_WORDS` says *Getting ready · After work · Free time* where it said *Before work · Activity*; `WorkDayMode` has five values; `LinkKind` and its schema exist with the host allow-list; the starter library has `transition` and `activity` rows with groups, the morning rows carry a group, the break rows are widened; the example day for the primer is a constant; the block-hue tokens are aliases in `preset.css` with their utilities; the fixture, day-plan, link and preferences validators accept the new fields. After this ships, **DAY-4 has the tuples its `ADD VALUE`s need and DAY-5…DAY-12 have the shapes to write and render.** Nothing here reaches a screen; nothing writes.

## Why / intent

- **v1.3 §1, §3.1** — the ninth kind and the words: `transition`; *Getting ready* for `prep`, *After work* for `transition`, *Free time* for `activity`; sleep is not a kind.
- **v1.3 R49, §3.9, §11.1** — `WorkDayMode = always | usually | sometimes | rarely | never`; `work_days` is a jsonb, so the validator is the whole change.
- **v1.3 R53, §3.17, §11.4, TD-28** — `LinkKind = spotify | other`; `LINK_HOSTS` (`open.spotify.com`, `spotify.link`; scheme `spotify:`); `linkFormSchema` (`title 1–80`, `url` https or `spotify:` ≤ 2048), `linkIdInput`, `listLinksInput`.
- **v1.3 R50, R66, §12.4** — the activity library in five groups with *Recommended* marks; the morning rows' groups (*Body · Mind · Practice · Home*); the after-work (`transition`) rows; the widened break rows (🍽️ Lunch 20–45 · 🥪 Eat something 10–20).
- **v1.3 §4.2, §12.4** — `EXAMPLE_DAY`: twelve spans as `{ kind | "sleep", startMin, endMin, name? }` from 7:00 to 7:00 (Taylor's own, G2); `BLOCK_LEGEND` is copy, not a constant, and lives in DAY-8's `copy.ts`.
- **v1.3 R47, §3.1, §10.2, TD-29** — `--block-orient` … `--block-wind-down`, `--block-sleep` as aliases of the named category scales' 100 and 700 steps (`[PROPOSED — v1.3 §13 #31]` mapping: orient slate · morning leaf · training clay · prep amber · transition amber · work sky · break moss · activity plum · wind-down rose · sleep neutral-200 / neutral-700); utilities `bg-block-<kind>` and `text-block-<kind>-label`; a row in `brand-tokens.md`'s table saying where they may be used.
- **v1.3 §11.2, §11.3, §11.1** — `dayPlanPatchSchema` gains `afterWorkTemplateId`, `activityTemplateId` (uuid, nullable, optional); `fixtureFormSchema` gains `location` (trim, ≤ 80, nullable), `travelThereMin`, `travelBackMin` (int 0–`TRAVEL_MAX`, default 0), `planTravel` (boolean, default true); `updatePreferencesInput` gains `sameMorningRoutine` (boolean, nullable, optional).
- **v1.3 §10.2 (`DayPlanView`, `FixtureView`, `LinkView`)** — `DayPlanView` and `DayPlanSummaryView` gain `afterWork` and `evenings` refs of the same shape as `gettingReady`; `FixtureView` gains `location`, `travel: { thereMin, backMin, planned }`; `LinkView { id, title, url, kind, sortOrder }`; `HabitSummaryView` needs nothing (an activity is a habit); `ProfileView` (`user.me`) gains `sameMorningRoutine`.
- **v1.3 §11.5** — `DEFAULT_BLOCK_ORDER` gains `transition` after `work`; `PLACEABLE_KINDS` unchanged; `templates.flow` for `transition` is `forward` (a constant `DEFAULT_FLOW_BY_KIND` if one exists; else the service's default in DAY-5).
- **TD-20** — the emoji lint rule: `packages/config/eslint/no-emoji.js`'s exception list already names `src/starter-library.ts`; `example-day.ts` and `link-hosts.ts` carry no glyph and are **not** added.
- **Ground truth (consumed):** RUN-1 (the unions in `packages/types/src/domain/domain.ts`, `enumValues`, the seed files, the lint rule), `packages/constants/src/{block-kinds.ts, starter-library.ts, limits.ts, index.ts}`, `packages/validators/src/{preferences.ts, block.ts, day-plan.ts, fixture.ts, user.ts, index.ts}`, `packages/config/tailwind/preset.css`, `docs/ai-guides/brand-tokens.md`.
- **What this slice is NOT (binding):** the migration (DAY-4); any service or router (DAY-5, DAY-6); any component (DAY-7); a change to `SETUP_TOTAL_STEPS` (DAY-8); a change to the emoji rule's logic.

**Rulings this slice makes (labelled, logged):**

- **The `blockKindEnum` tuple gains `transition` in this ticket, not DAY-4** — the tuple is `enumValues<BlockKind>()([...])` and fails to type-check the moment the union grows; DAY-4's SQL is the database half. Nothing writes the value before DAY-4 is applied locally. Logged.
- **`StarterLibraryEntry` gains `group?: string`** — a display group key (`body · mind · practice · home` for morning; `move · make · connect · rest · tend` for activity); `prep`, `transition`, `break`, `wind_down` rows carry none. The group's word is copy in the screen's `copy.ts`, keyed by the constant's key. Logged.
- **`EXAMPLE_DAY` lives in `packages/constants/src/example-day.ts`** as minutes from midnight with `kind: BlockKindValue | "sleep"`; the two breaks are two entries; the second carries `name: "Lunch"` (a noun on the example, not copy the app speaks — the same exception the seed titles use, documented in the file's header). Logged.
- **`LinkKind` is derived, never chosen** — `linkFormSchema` has no `kind`; `deriveLinkKind(url)` in `@syn/utils` (`packages/utils/src/link.ts`, pure) returns `spotify` for the allow-listed hosts and the `spotify:` scheme, `other` otherwise; DAY-5's service calls it. Logged.
- **The hue tokens are declared once, in `preset.css`, as `--block-<kind>: var(--syn-<hue>-100)` and `--block-<kind>-label: var(--syn-<hue>-700)`**, with dark-theme values the same aliases at the dark pairing the chips use (`800` / `200`); the mapping is a nine-line block with a comment naming v1.3 §13 #31 as the sign-off. Logged.

## Behaviour & states

**No surface.** The observable state is the code: `yarn check-types` passes with the new unions and every existing switch over `BlockKind` exhaustive (the ones that break name where `transition` must be handled — `orderBlocks`, `BLOCK_KIND_WORDS`, the block editor's kind list — and this ticket adds the minimal case so the build stays green, with the real behaviour in DAY-6 and DAY-11); the seeds render in a scratch story (DAY-7 adds the story; here a `node -e` probe pasted into the report lists the activity groups and counts); `preset.css` compiles and `bg-block-work` resolves to the sky 100 in light and the sky 800 in dark.

**States (exhaustive):** authored · type-checked · probed. **Failure / edge states:** a switch over `BlockKind` without a default → the build names it; the lint rule refusing a glyph in a title → fix the seed.

## Non-negotiables (this slice)

- **A glyph is `icon.value`, never a character in a `title`.**
- **No hex in `preset.css`'s new lines; aliases only.**
- **Nothing writes `transition` to the database in this ticket.**
- **Every new validator field is optional or defaulted so existing callers still pass.**
- **The library's existing rows keep their titles, ranges and glyphs byte-identical** (the person's habits were created from them).

## Data & AI

**Schema changes: none in SQL** (the TypeScript tuple only; DAY-4 is the migration).

**Tables:** none.

**Placement:** `packages/types/src/domain/domain.ts` (`BlockKind`, `WorkDayMode`, `LinkKind`), `domain/view.ts` (`DayPlanView`, `DayPlanSummaryView`, `FixtureView`, `LinkView`, `ProfileView`), `packages/types/src/index.ts`; `packages/db/src/schema/enums.ts` (the tuple; `linkKindEnum` declared here, created by DAY-4's SQL); `packages/constants/src/{block-kinds.ts, starter-library.ts, example-day.ts (new), link-hosts.ts (new), limits.ts (LINK_TITLE_MAX 80, LINK_URL_MAX 2048, FIXTURE_LOCATION_MAX 80), index.ts}`; `packages/validators/src/{preferences.ts (workDaysSchema, updatePreferencesInput), block.ts (blockKindSchema), day-plan.ts, fixture.ts, link.ts (new), index.ts}`; `packages/utils/src/link.ts` (new, `deriveLinkKind`) + `index.ts`; `packages/config/tailwind/preset.css`; `docs/ai-guides/brand-tokens.md` (one row). Rules 1 (enum colocation), 7, 8.

**tRPC / validators:** the schemas above; no procedure.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — the workspace, a scratch probe, no database)

1. `BlockKind` in `@syn/types` and `BLOCK_KINDS` in `@syn/constants` both list nine kinds with `transition` between `break` and `activity`; `blockKindEnum`'s tuple matches; `DEFAULT_BLOCK_ORDER` reads `orient · morning · prep · work · transition · activity · wind_down`. *(Mason.)*
2. `BLOCK_KIND_WORDS` reads `prep: "Getting ready"`, `transition: "After work"`, `activity: "Free time"`; a `grep -rn '"Before work"' packages/constants` returns nothing.
3. `workDaysSchema.parse({ "0": "usually", … })` passes; `"most_weeks"` fails.
4. `linkFormSchema.parse({ title: "Focus", url: "https://open.spotify.com/playlist/abc" })` passes; `http://…` fails; `spotify:playlist:abc` passes; `deriveLinkKind` returns `spotify` for both Spotify forms and `other` for `https://example.com`.
5. `STARTER_LIBRARY.activity` has at least 30 rows across the five groups with the eight *Recommended* marked; `STARTER_LIBRARY.transition` has eight rows; `STARTER_LIBRARY.break` has eight; every morning row carries a `group`; the pasted probe lists the counts.
6. `EXAMPLE_DAY` has twelve entries summing to 24 hours from 420 to 1860 minutes with no gap and no overlap.
7. `fixtureFormSchema` accepts `{ …existing, location: "The clinic", travelThereMin: 20, travelBackMin: 20, planTravel: true }` and, with the four omitted, defaults `travel*` to 0 and `planTravel` to true; `dayPlanPatchSchema.parse({ afterWorkTemplateId: null })` passes; `updatePreferencesInput.parse({ sameMorningRoutine: true })` passes.
8. `preset.css` declares `--block-orient` … `--block-wind-down`, `--block-sleep` and their `-label` pairs in both themes as `var(--syn-…)` aliases; `grep -n "#" ` on the added lines returns nothing; `bg-block-work` and `text-block-work-label` exist as utilities (a scratch class in a story or `yarn ui:build` output shows them).
9. `yarn lint` passes with the emoji rule on (no glyph in any `title`, none in `example-day.ts` or `link-hosts.ts`).
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The exhaustive switches: `packages/api/src/services/day/materialize-day.ts` (`orderBlocks` — add `transition` to the rank map after `work`), `apps/web/components/block-editor/copy.ts` and `BLOCK_HEADER_COPY` in `@syn/ui`'s `block-header/copy.ts` (a word), `apps/web/components/day-builder/copy.ts`'s `blocks` record. Add the case with the v1.3 word; behaviour is DAY-6/DAY-11.
- `linkKindEnum` in `enums.ts` is declared now so `links.ts` (DAY-4) can import it; nothing references it until then.
- The Tailwind v4 `@theme` block is where the utilities come from: declare `--color-block-work: var(--block-work)` pairs so `bg-block-work` exists, matching how `bg-surface` is produced today.

## Dev's call

The group keys' spelling · whether `EXAMPLE_DAY` uses minutes or `"HH:mm"` (minutes recommended — the axis takes minutes) · where `deriveLinkKind`'s allow-list constant lives (`@syn/constants` recommended, imported by `@syn/utils`, which sits above it).

## Out of scope

- **The SQL** — DAY-4.
- **Reading or writing any of this** — DAY-5, DAY-6.
- **`BlockBand hue`** — DAY-7.
- **The primer's legend copy** — DAY-8.
- **`SETUP_TOTAL_STEPS = 5`** — DAY-8.

## Depends on

- **No slice dependencies.** RUN-1 (Epic 5) is Complete and consumed.

## Recommended execution

**Sonnet.** Mechanical authoring against a precise list where the types do the checking; the one judgement — which switches must gain a case — is named above. Opus is not needed; Composer would miss the tuple-and-union pairing.

---

### Kickoff (paste into the session)

> Build **DAY-3 — Vocabulary, seeds, validators, tokens** (attached spec). Model: **Sonnet**. **A glyph is data, never a title; no hex in the tokens; nothing writes `transition` yet; every new field optional or defaulted.**
> Attach/read first, in order: this spec · v1.3 §1, §3.1, §3.9, §3.17, §11, §12.4, §13 #31 · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · `docs/ai-guides/brand-tokens.md` · RUN-1 (Epic 5 — the unions, the seeds, the lint rule; reuse, don't fork) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-25, TD-28, TD-29) · Epic 5's `TECHNICAL-DECISIONS.md` (TD-20).
> Paste the probe of the libraries and the example day. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
