# RUN-15 — Migration `0008` and the retirements: drop `earliest_wake_time`, `orient_passage`, `orient_show_last_night`; remove `range-input` and `rotation-rows.tsx`; add what the builder asked for; regenerate the references

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 5** · Size: S
**Slice type:** Cleanup — one small migration of drops (and up to two adds the builder's assumptions may have earned), and the deletion of code nothing imports. The risk class is *a drop that something still reads* and *a delete that something still imports*.
**Vigil:** none. **Mason migration review:** the three drops after a grep proves nothing reads them; the optional adds only if RUN-10/RUN-12's assumptions were ratified in `TECHNICAL-DECISIONS.md`.

**Status:** Not started

> **Mason — migration review.** Before the SQL is committed: `grep -rn "earliestWakeTime\|orientPassage\|orientShowLastNight\|earliest_wake_time\|orient_passage\|orient_show_last_night"` across `packages/` and `apps/` returns only the schema file and the migration; the drops are in `0008` and nowhere earlier; if `usual_minutes` on `habits` or `version_key` on `template_slots` is added, the decision that asked for it is cited by TD number and the columns are additive. State the scratch database.

---

## Outcome

The schema and the tree carry nothing v1.2 retired: `users.earliest_wake_time`, `orient_passage` and `orient_show_last_night` are dropped by `0008` (their data already moved or unused); `RangeInput` and `rotation-rows.tsx` are gone; and, only if Mason ratified either assumption, `habits.usual_minutes` and/or `template_slots.version_key` are added and the one service each names reads them. `SCHEMA_REFERENCE.md` and the directory map are regenerated. After this ships, **Epic 5 is whole.** The migration is verified on a scratch database and **is not applied to any hosted tier — Taylor runs `0007` and `0008` in order after `0004`–`0006`.**

## Why / intent

- **v1.2 §11.1** — *"Stop writing … columns stay; the cleanup migration is later, per Mason's discipline."* RUN-2 left them; RUN-8 and RUN-9 stopped writing them; this drops them.
- **TD-11, RUN-10's and RUN-12's `[ASSUMPTION]`s** — `usual_minutes` (a habit's default length as its own column rather than the slot's) and `template_slots.version_key` (the chosen version on a slot rather than a minutes match). Both are **only if ratified**; otherwise this ticket adds nothing and says so.
- **`README.md` § Canonical paths** — `range-input` after `RangeEditor` replaced it in every sheet; `rotation-rows.tsx` after RUN-11.
- **Root `AGENTS.md`** — migrations append-only; `directory-map` after files move; never `db:migrate` on a hosted tier.
- **Ground truth (consumed):** `0007` (RUN-2), `packages/db/src/schema/user/users.ts`, `packages/ui/src/composed/control/range-input/` and its importers (LB-02's habit sheet — RUN-10 switched it to `RangeEditor`? **`[NEEDS VALUE AT BUILD: grep the importers; if the habit sheet still uses `RangeInput` outside the setup modes, switch it here and story the change]`**), `apps/web/app/(setup)/_components/` (RUN-11 deleted `rotation-rows.tsx` — verify), `scripts/generate-directory-map.mjs` (`ANNOTATIONS`).
- **What this slice is NOT (binding):** any behaviour change; any new column not named above; any change to `0004`–`0007`.

**Rulings this slice makes (labelled, logged):**

- **The drops are three `ALTER TABLE users DROP COLUMN` statements**, plus the Drizzle schema edits and a snapshot; no backfill (the passage moved in `0007`; the other two were unread). Logged.
- **`usual_minutes` / `version_key` are added only with a citing TD line**; absent that, the ticket's `DEVIATIONS.md` line says they were not needed. Logged.
- **`RangeInput` is deleted with its story and its `package.json` export**; every importer already uses `RangeEditor` or is switched here (logged per file). Logged.

## Behaviour & states

**No surface.** Observable: the three columns absent from `\d users`; `SCHEMA_REFERENCE.md` without them; the two files absent from the tree; the directory map without them; the app unchanged to the eye.

**States:** authored · journalled · verified on scratch · not applied to any tier. **Failure / edge states:** a reader of a dropped column survives somewhere → `check-types` fails on the Drizzle type, which is the point; a hosted tier still on `0006` → nothing here runs against it.

## Non-negotiables (this slice)

- **Nothing reads a dropped column** — proven by grep before the SQL.
- **Never edit `0004`–`0007`.**
- **No behaviour change.**
- **Stop before any hosted tier.**

## Data & AI

**Schema changes: described** — drops of `users.earliest_wake_time`, `users.orient_passage`, `users.orient_show_last_night`; optionally `habits.usual_minutes smallint null` and/or `template_slots.version_key text null`.

**Tables:** `users` (drop) · `habits`, `template_slots` (add, conditional).

**Placement:** `packages/db/migrations/0008_v1_2_cleanup.sql` + journal + snapshot; `packages/db/src/schema/user/users.ts` (and `library/habits.ts`, `plan/template-slots.ts` if adding); `packages/db/SCHEMA_REFERENCE.md`; `packages/ui/src/composed/control/range-input/` (deleted), `packages/ui/package.json`; `apps/web/app/(setup)/_components/rotation-rows.tsx` (verify deleted); `scripts/generate-directory-map.mjs` (`ANNOTATIONS` entries for the removed files removed; entries for `day-builder/`, `passages/`, the new composites added if RUN-7/9/12 did not); `docs/architecture/directory-map.md` (regenerated).

**tRPC / validators:** none (RUN-3 already removed the three inputs).

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — scratch database with `0000`–`0007` applied)

1. The grep in the review callout returns only `users.ts` (before the edit) and `0008`; after the edit, only `0008`.
2. `yarn db:migrate` applies `0008` once; `\d users` lacks the three columns; a second run applies nothing.
3. If added: `habits.usual_minutes` / `template_slots.version_key` exist, nullable, and the TD line that asked for them is cited in `DEVIATIONS.md`; if not added, the `DEVIATIONS.md` line says so.
4. `packages/ui/src/composed/control/range-input/` does not exist; `grep -rn "RangeInput\|range-input" packages apps` returns nothing; `rotation-rows.tsx` does not exist.
5. `yarn db:schema-reference` and `yarn directory-map` regenerate cleanly; `yarn docs:check-links` passes; `README.md` § Canonical paths' stale warnings for these files are still accurate (they say "removed in RUN-15").
6. `yarn workspace @syn/ui run build-storybook --quiet` passes; `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- DYN-21 is the shape: the grep first, the drops, the schema edits, the snapshot, the regenerations, one closing report.
- If LB-02's habit sheet still uses `RangeInput` for the full sheet, `RangeEditor` at its default (non-compact) width is the replacement; check the story.

## Dev's call

The migration's name · whether the `ANNOTATIONS` additions for the new folders belong here or were done by their tickets (check; add only what is missing).

## Out of scope

- **Any further retirement** — nothing else in this epic retires code.
- **Applying migrations to a tier** — Taylor.

## Depends on

- **RUN-9** — `orient_passage` and `orient_show_last_night` unwritten. Complete in `PROGRESS.md`.
- **RUN-10** — the assumption on *usually*; `RangeEditor` in the sheets. Complete in `PROGRESS.md`.
- **RUN-11** — `rotation-rows.tsx` deleted. Complete in `PROGRESS.md`.
- **RUN-13** — the fit screen deleted; the last reader of anything v1.1-only gone. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** A precedented cleanup (DYN-21's shape) with a grep as its guard; choosing down to Composer risks a drop before the grep.

---

### Kickoff (paste into the session)

> Build **RUN-15 — Migration `0008` and the retirements** (attached spec). Model: **Sonnet**. **Grep before you drop; never edit an applied migration; no behaviour change; stop before any hosted tier.**
> Attach/read first, in order: this spec · v1.2 §11.1 · `docs/architecture/drizzle-orm-conventions.md` · `packages/db/AGENTS.md` · root `AGENTS.md` · DYN-21 (the cleanup shape — reuse, don't fork) · RUN-2 · RUN-10's and RUN-12's `[ASSUMPTION]` lines and this track's `TECHNICAL-DECISIONS.md` for whether they were ratified · `packages/db/SCHEMA_REFERENCE.md` (users) · this track's `DEVIATIONS.md`.
> Author the SQL and the journal entry, verify on a scratch database, regenerate the references, and stop. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn workspace @syn/ui run build-storybook --quiet`, then `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
