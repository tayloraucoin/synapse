# DAY-13 — Migration `0010_retirements` (RUN-15's three drops carried in) and the file retirements: the nine v1.2 step files, the work-day type list, the three settings screens, `range-input`, `ensureWorkTemplates` if unreferenced, the native select if unreferenced; references regenerated

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 5** · Size: S
**Slice type:** Cleanup — one drop migration and the deletion of every file and route v1.3 replaced. The risk class is *a drop that a reader still reads* and *a deletion that a Settings screen still imports*.
**Vigil:** none. **Mason migration review:** the three drops (`users.earliest_wake_time`, `orient_passage`, `orient_show_last_night`) are the ones RUN-15 named; nothing else is dropped; every deleted file is unreferenced (`yarn check-types` and `yarn build` are the proof).

**Status:** Complete — 2026-09-25 (`0010` authored and journalled, not applied to any database)

> **Mason — review.** Confirm before committing: `grep -rn "earliest_wake_time\|earliestWakeTime\|orient_passage\|orientPassage\|orient_show_last_night\|orientShowLastNight"` across `packages/` and `apps/` returns only the migration and the schema-reference history; the `0010` SQL drops exactly three columns; the journal's `when` is after `0009`'s; every file in the retirement list is deleted and nothing imports it; the three route keys and `before-the-day` are gone from `YourDayScreen` and `AGENTS.md`; `SCHEMA_REFERENCE.md` and the directory map are regenerated. State which scratch database `0010` was verified on.

---

## Outcome

Nothing of v1.2's first run that v1.3 replaced remains: the three profile columns Epic 5 stopped writing are dropped in `0010_retirements`; the nine v1.2 step files whose bodies moved into the builder are gone, along with the work-day type list, the three retired Settings screens and their route keys, `range-input`, RUN-3's `ensureWorkTemplates` and the native select if nothing imports them; the references are regenerated. After this ships, **Epic 6 is Complete and the repo carries one first run.** Nothing user-facing changes; a person on the fixed build sees the same screens.

## Why / intent

- **TD-30** — `0010_retirements` carries RUN-15's drops (Epic 5 `DEVIATIONS.md`, 2026-09-24 · authoring); RUN-15 is superseded.
- **RUN-15 (Epic 5), verbatim for the drops:** `users.earliest_wake_time` (R39), `users.orient_passage` (copied to `passages` by `0007`), `users.orient_show_last_night` (R41) — none is read or written since RUN-8/RUN-9; the columns stay in `SCHEMA_REFERENCE.md`'s history only.
- **v1.3 §0.4, §4.6, R46, R55, R64** — the retired screens: screen 3's *Same shape?* and the type cards' list (`WorkDayTypeCards`), screens 4, 5, 7, 8, 9, 10, 11, 12 as standalone step files (their bodies live in `components/day-builder/screens/` since DAY-9…DAY-11, or in `components/links/`, `components/landscape-chooser/`, `journal-settings.tsx`); Settings' `work-start`, `work-day-types`, `wake`, `before-the-day` keys (redirecting since DAY-8 / DAY-12).
- **Epic 5's README § Canonical paths** — `range-input` (RUN-7 added `range-editor`; RUN-15 was to remove `range-input` once nothing imports it); `rotation-rows.tsx` is already gone (RUN-11).
- **DAY-5** — `ensureWorkTemplates` stays only if a caller remains; **DAY-2** — `NativeSelect` left screen 2; Settings → Notifications may still use it — audit.
- **Ground truth (consumed):** RUN-15's spec (`docs/specs/epic-5-first-run-rebuilt/RUN-15-migration-0008-and-the-retirements.md` — read it; its file list is this ticket's floor), `0009_v1_3_additive.sql`, DAY-8…DAY-12's placement sections (what moved where).
- **What this slice is NOT (binding):** any behaviour change; any drop beyond the three; deleting `work-day-type-card.tsx`'s `WorkFields` if B3 still imports it (it does — delete only the list and the card's Done path if unreferenced; DAY-9 ruled the extraction); a migration applied to a hosted tier.

**Rulings this slice makes (labelled, logged):**

- **The step components' bodies that DAY-10 mounted by import (`Step6BeforeTheDay`, `Step8Landscape`, `Step9Ranked`, the journal group) move into `components/day-builder/screens/b08…b10` and `journal-settings.tsx`'s final home** (`components/journal-settings/` if Settings and the builder both mount it — two consumers, rule 9) **without behaviour change**, then the step files are deleted. One move, one delete, verified by the four commands. Logged.
- **`0010` drops three columns and nothing else**; no rename, no type change; the `orient_passage` data is already in `passages` (`0007`'s backfill) — the migration asserts nothing about it. Logged.
- **`YourDayScreen` loses `work-start`, `work-day-types`, `wake`, `before-the-day`**; the redirects go with them; a request for one is a 404 as any unknown segment is. Logged.
- **A file is deleted only when `grep -rn` across `apps/` and `packages/` finds no import** — the report lists each file with its grep result. Logged.

## Behaviour & states

**No new surface.** The observable state: the schema after `0010` on a scratch database (three columns gone); the repo after the deletions (the four commands pass; the directory map and the schema reference regenerated); every route in `apps/web/AGENTS.md` resolves.

**States (exhaustive):** authored · verified on scratch · deleted · regenerated · **not applied to any tier**. **Failure / edge states:** a deleted file was imported by a story → the Storybook build names it; restore the import's target in its new home, never the file.

## Non-negotiables (this slice)

- **Drops only the three named columns; never edits `0004`–`0009`.**
- **Deletes only unreferenced files; the four commands and the Storybook build are the proof.**
- **No behaviour change; no copy change.**
- **Stop before `db:migrate` on any hosted tier.**

## Data & AI

**Schema changes: described** — three drops on `users`.

**Tables:** `users` (three columns dropped).

**Placement:** `packages/db/migrations/0010_retirements.sql` + `meta/0010_snapshot.json` + `meta/_journal.json`; `packages/db/src/schema/user/users.ts` (the three columns removed); `packages/db/SCHEMA_REFERENCE.md` (regenerated); `docs/developer-guides/migrations.md`. Deletions: `apps/web/app/(setup)/_components/{step-3-work-shape.tsx, step-4-commitments.tsx, step-5-wake.tsx, step-6-before-the-day.tsx, step-7-before-work.tsx, step-8-landscape.tsx, step-9-ranked.tsx, step-10-training.tsx, step-11-closing.tsx, step-12-focuses.tsx, use-prep-steps.ts (if lifted into the builder in DAY-9), work-day-type-card.tsx's list (WorkDayTypeCards)}` with their strings pruned from `copy.ts`; `apps/web/app/(shell)/settings/your-day/[screen]/_components/your-day-screen.tsx` (the four keys' branches); `apps/web/lib/routes.ts` (the four keys); `apps/web/AGENTS.md`; `packages/ui/src/composed/control/range-input/` (if unreferenced); `packages/api/src/services/plan/templates.ts` (`ensureWorkTemplates`, if unreferenced) + `routers/template.ts` (`ensureWork`); `packages/ui/src/composed/control/native-select/` (if unreferenced). Moves: DAY-10's mounted bodies into their final homes. Rules 1, 9.

**tRPC / validators:** `template.ensureWork` removed if unreferenced; nothing else.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — a scratch database with `0004`–`0009` applied; the workspace)

1. After `db:migrate` on the scratch database, `\d users` shows none of `earliest_wake_time`, `orient_passage`, `orient_show_last_night`, and every other column unchanged; the journal's idx 10 has a `when` after idx 9's. *(Mason.)*
2. `grep -rn "earliestWakeTime\|orientPassage\|orientShowLastNight" packages apps` returns nothing outside `migrations/`.
3. The nine step files, `WorkDayTypeCards`, and the four Settings keys are gone; `grep -rn "step-3-work-shape\|step-12-focuses\|WorkDayTypeCards\|work-day-types\|before-the-day" apps packages` returns nothing; `/settings/your-day/wake` is a 404; `apps/web/AGENTS.md`'s route table lists only live keys.
4. For each of `range-input`, `ensureWorkTemplates`, `native-select`: the report states the grep result and whether it was deleted.
5. `/setup/1`–`/setup/5`, the builder B1–B17, Settings → Your day's every row, `/orient`, `/today` render as before (a five-minute walk; no behaviour change).
6. `SCHEMA_REFERENCE.md` regenerated; `yarn directory-map` run; `yarn docs:check-links` passes.
7. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands); `yarn workspace @syn/ui run build-storybook --quiet` passes.
8. No hosted tier was touched — the report says so.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `drizzle-kit generate` will emit the three `DROP COLUMN`s from the schema change; check there is nothing else in the diff before journalling.
- Delete in this order: Settings' branches → route keys → step files → `copy.ts` strings → the UI folders; run `check-types` after each group so the failing import names the next move.
- RUN-15's spec lists `range-input`'s last importer as of 2026-09-16; re-check.

## Dev's call

The final home of `journal-settings.tsx` · whether `copy.ts`'s pruned strings are removed or left with a `@deprecated` note until the next epic (remove — one home, no dead strings).

## Out of scope

- **Anything user-facing.**
- **RUN-14 (the quotes admin surface)** — Epic 5's, provisional, untouched.
- **The `users.work_start_time` / `work_end_time` / `anchor_direction` columns** — they stand as the profile's defaults (R64, TD-23).

## Depends on

- **DAY-8, DAY-9, DAY-10, DAY-11, DAY-12** — nothing is dropped while a surface still writes or imports it. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** A drop migration with a fixed list and deletions the compiler polices; the only judgement is the order of deletions. Opus is not needed; Composer would delete a referenced file and fix the import by re-adding it.

---

### Kickoff (paste into the session)

> Build **DAY-13 — Migration `0010_retirements` and the file retirements** (attached spec). Model: **Sonnet**. **Three drops and nothing else; delete only what nothing imports; no behaviour change; never a hosted tier.**
> Attach/read first, in order: this spec · RUN-15 (Epic 5 — the drops and the file list this absorbs) · `packages/db/AGENTS.md` · root `AGENTS.md` · `docs/developer-guides/migrations.md` · DAY-4 (`0009`) · DAY-8…DAY-12 (their placement sections say what moved where) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-30, TD-31) · Epic 5's `DEVIATIONS.md`.
> List every deleted file with its grep result. Close in three places (and tick RUN-15 as superseded in Epic 5's `PROGRESS.md` with a note pointing here); log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands, then `yarn db:schema-reference`, `yarn directory-map`, `yarn docs:check-links`.
