# <ID> — <title that states the contents>

**Epic:** <EPIC> — <one-phrase identity> · **Phase <n>** · Size: <S|M|L>
**Slice type:** <what kind of work; what class of failure it risks>
**Vigil:** <flag + how to review — omit if not a risk surface>

**Status:** Not started

> **<Role> — <review type>.** <What must be reviewed, enumerated. What QA must state about its run.>

---

## Outcome

<One paragraph, prose. The world after this ships, in the language of whoever experiences it. Close by naming the adjacent things this slice does NOT do.>

## Why / intent

- **<§ or screen ID>** — <the authority and what it obliges>.
- **What this slice is NOT (binding):** <the negative, where drift is a real risk>.
- **Ground truth:** <what exists on disk and is consumed, never rebuilt>.
- **<Prior ticket>** — <what this takes from it>.

**Rulings this slice makes (labelled, logged):**

- **<The ruling.>** <Why. The tradeoff.> <`[PROVISIONAL — owner]` if applicable.> Logged.

## Experience & states

<Happy path, subsectioned by surface or phase. Copy verbatim from the UX document, cited by screen ID.>

**States (exhaustive):** <every reachable state>

**Failure / edge states:** <named, each with its handling>

## Non-negotiables (this slice)

- **<Imperative.>** <One line of consequence.>

## Data & AI

**Schema changes:** none | described | possibly (describe; human-review migration; log).

**Tables:** <table (access mode)> — real names from `packages/db/SCHEMA_REFERENCE.md`.

**Placement:** <exact paths; whose call — cite `../README.md` § Placement rules by number>.

**tRPC / validators:** <procedures + Zod homes — or "none">.

**AI notes:** **None.** Phase 1 has no AI touchpoint.

## Accessibility

<This surface's specific traps — or "**None — no surface in this slice.**">

## Acceptance criteria (observable<, and under what conditions>)

1. <Observable behaviour.> *(<Reviewer>.)*
2. …
N. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- <Authoring knowledge that would otherwise be lost. Non-binding.>

## Dev's call

<What the builder decides. Real alternatives land in TECHNICAL-DECISIONS.md.>

## Out of scope

- **<Excluded thing>** — <where it actually lives>.

## Depends on

- **<TICKET-ID>** — <what this takes from it>. Complete in `<track>/PROGRESS.md`.

## Recommended execution

**<Model>.** <Why — and the failure mode of choosing down.>

---

### Kickoff (paste into the session)

> Build **<ID> — <title>** (attached spec). Model: **<model>**. **<The one-line law of the slice.>**
> Attach/read first, in order: this spec · <UX document §§ by screen ID> · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · <prior tickets — reuse, don't fork> · `packages/db/SCHEMA_REFERENCE.md` (<domain>) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> <Restated constraints, imperative, 3–4 sentences.> Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
