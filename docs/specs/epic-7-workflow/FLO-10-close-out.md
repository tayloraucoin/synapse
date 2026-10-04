# FLO-10 — Close-out: the placement rules' new domain and router, the tracks table, the docs index, the directory map, the link check, the scope line confirmed

**Epic:** FLO — Workflow · **Phase 5** · Size: S
**Slice type:** Documentation only — the corpus made to say what was built. The risk class is *a second home for a fact*, and *an index that describes the plan instead of the code*.

**Status:** Not started

---

## Outcome

A thread that has never seen this epic can find Workflow from the documents alone: the specs index lists the track and says it is Complete; the placement rules name the `workflow/` schema domain and the `workflow` router; the docs index and the UX folder's index point at the spec and the track; the app's instruction file lists the routes that exist; the directory map is regenerated with a note on each load-bearing file; every link resolves. **No code changes in this ticket.**

## Why / intent

- **Root `AGENTS.md` § Build-slice workflow 5 and § Keeping instructions in sync** — files moved or added mean `yarn directory-map`; a load-bearing file gets its note in the generator's `ANNOTATIONS` map first; `yarn docs:check-links` before committing.
- **`../README.md` § Placement rules 1 and 3** — the domain list and the router list are enumerated there; Workflow added one of each (TD-33, TD-40) and the rules must say so, or the next schema ticket in any track reads a stale list.
- **Assessment §6 slice J** — this ticket.
- **Ground truth (consumed):** what FLO-1…FLO-8 (and FLO-9, if built) actually shipped, read from `PROGRESS.md`, `DEVIATIONS.md` and the tree — not from the tickets.
- **What this slice is NOT (binding):** any code; any edit to the UX spec (never edited to match what shipped); any edit to a prior entry in `DEVIATIONS.md` or `TECHNICAL-DECISIONS.md`; a new document.

**Rulings this slice makes (labelled, logged):**

- **The docs index rows written at authoring (2026-10-03) are corrected, not duplicated**: `docs/README.md`'s `epic-7-workflow/` row and `docs/specs/README.md`'s tracks row say *Authored 2026-10-03; not started*; each becomes the track's one-line description with its completion date, in the house form of the Epic 6 row. Logged.
- **If FLO-9 is not Complete when this ticket runs, the index says so in the track's row** rather than waiting. Logged.

## Behaviour & states

**No surface.** The edits:

1. **`docs/specs/README.md`** — the tracks table's `epic-7-workflow/` row (written at authoring) gains **Complete** with its date; a short *Epic 7 (Workflow), added 2026-10-03* section after Epic 6's, in the same shape (the critical path, what does not gate, migration `0011`); placement rule 1's domain list gains `workflow/` with its six tables; rule 3's router names gain `workflow`; the screen-prefix list gains `WF-`.
2. **`docs/README.md`** — the `specs/` table's `epic-7-workflow/` row rewritten (README · build order · PROGRESS · TECHNICAL-DECISIONS · the assessment); the `ux/` row for the Workflow spec checked.
3. **`docs/ux/README.md`** — the Workflow row gains *Built by `docs/specs/epic-7-workflow/`*.
4. **`apps/web/AGENTS.md`** — the route map rows FLO-5 wrote, checked against `apps/web/lib/routes.ts` as it stands (the `?sheet=` values and `?col=` named in the row's screen column); the scope sentence confirmed, or amended if Taylor answered README Q1.
5. **`scripts/generate-directory-map.mjs`** — `ANNOTATIONS` entries for the load-bearing files: `packages/db/src/schema/workflow/`, `packages/api/src/routers/workflow.ts`, `packages/api/src/services/workflow/move-task.ts`, `packages/utils/src/workflow/resolve-next.ts`, `packages/ui/src/composed/layout/board/`, `apps/web/app/(shell)/workflow/[view]/_components/use-workflow-board.ts`. Then `yarn directory-map`.
6. **`docs/ai-guides/brand-tokens.md`** — confirmed to carry FLO-4's three tokens; added if FLO-4 did not.
7. **This track** — `00-build-order.md`'s batch table and checklist reflect `PROGRESS.md`; the README's decision queue shows each of Q1–Q5 as answered (with the date) or still on its default.

**States:** n/a. **Failure / edge states:** `docs:check-links` fails on a link this epic did not write → fix it only if this epic moved the target; otherwise report it and leave it.

## Non-negotiables (this slice)

- **`docs/architecture/directory-map.md` is generated, never hand-edited.**
- **`DEVIATIONS.md` and `TECHNICAL-DECISIONS.md` are appended to, never edited.**
- **The UX spec is not edited.**
- **One home per fact**: the index points; it does not restate the track's README.
- **No code.**

## Data & AI

**Schema changes: none.**

**Tables:** none.

**Placement:** the seven documents above and `scripts/generate-directory-map.mjs`.

**tRPC / validators:** none.

**AI notes:** **None.**

## Accessibility

**None — no surface in this slice.**

## Acceptance criteria (observable — the documents and two commands)

1. `docs/specs/README.md`'s tracks table has an `epic-7-workflow/` row with prefix `FLO-`; placement rule 1 names the `workflow/` domain and its six tables; rule 3 names the `workflow` router.
2. `docs/README.md`'s row for `epic-7-workflow/` no longer says *not started*, and links the README, the build order, `PROGRESS.md`, `TECHNICAL-DECISIONS.md` and the assessment.
3. Every route builder in `apps/web/lib/routes.ts` whose name begins `workflow` has a row in `apps/web/AGENTS.md`'s route map, and every Workflow row there has a builder.
4. `docs/architecture/directory-map.md` contains the paths listed in edit 5, each with its note, and the file's diff is the generator's output only.
5. `yarn docs:check-links` reports that all links resolve.
6. `00-build-order.md`'s checklist and batch statuses match `PROGRESS.md` row for row.
7. `git diff --stat` for this ticket lists only `.md` files and `scripts/generate-directory-map.mjs`.
8. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The Epic 6 row in each index is the model for length and form.
- `ANNOTATIONS` is keyed by path; read two existing entries for the tone of a note before writing six.

## Dev's call

The wording of each note and row.

## Out of scope

- **Phase 2 pins from UX §12** — Taylor's to say (the collection's rule); not added here.
- **A marketing-changelog entry** — only if Taylor asks; Workflow is not on the landing page.
- **Memory or role-prompt edits.**

## Depends on

- **FLO-8** — the last launch-blocking surface; the corpus is written against what exists. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** Mechanical authoring against a precise list. The failure mode of choosing down is a hand-edited directory map or a restated README, which criteria 4 and 7 catch.

---

### Kickoff (paste into the session)

> Build **FLO-10 — Close-out** (attached spec). Model: **Sonnet**. **The corpus says what was built: indexes point, they do not restate; the map is generated; the logs are appended to.**
> Attach/read first, in order: this spec · root `AGENTS.md` (§ Build-slice workflow, § Keeping instructions in sync) · `docs/specs/README.md` · `docs/README.md` · `docs/ux/README.md` · `apps/web/AGENTS.md` · `apps/web/lib/routes.ts` · `scripts/generate-directory-map.mjs` · this track's `README.md`, `00-build-order.md`, `PROGRESS.md`, `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> No code. Add the annotations, then run `yarn directory-map`, then `yarn docs:check-links`. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
