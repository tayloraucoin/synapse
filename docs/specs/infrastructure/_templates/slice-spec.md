# NN — [Slice Title]

**Status:** Not started    <!-- Not started | In progress | Complete (YYYY-MM-DD) — a build thread flips this on finish -->

[One-sentence purpose — what the user can do after this slice ships.]

**File(s):** `apps/web/...` (and `packages/...` if shared)
**Used by:** `NN+1-....md`, `...`
**Depends on:** `NN-1-....md`, `Foundation`, ...

---

## Why

[Design/product rationale. Cite UX handoff §§ (`docs/ux/habit_tracker_official_ux_spec_v1.md`) and UI-spec variant IDs where applicable. §0.3 rulings are signed.]

---

## Behavior & states

[Step-by-step UX; loading/error/empty/success + named edge cases. Name screens using UX-handoff identifiers, e.g. `CollaborativeReviewScreen`. Copy verbatim where the handoff gives it.]

**States:** `idle` → `loading` → `success` | `error`

---

## Non-negotiables (this slice)

[Only the guardrails that actually bind here — drop the rest. See README for the full set.]

---

## Data

[Tables by real name from `packages/db/SCHEMA_REFERENCE.md`, e.g. `couples`, `discovery_responses`, `insights`.]

- tRPC procedures / route handlers touched
- Validators in `@syn/validators`
- **Schema changes:** none | describe (flag for human review; log in `DEVIATIONS.md`)

---

## AI notes

[Touchpoint by enum value (`get_perspective` | `coach_privately` | `insight_extraction` | none) · streaming vs structured · placeholder-quality OK for v1?]

---

## Accessibility

[Labels, targets, contrast, scaling, and any state that must reach assistive tech — where relevant.]

---

## Acceptance criteria

- [ ] Observable behavior 1
- [ ] Observable behavior 2
- [ ] Routes use `lib/routes.ts` builders — no hardcoded paths
- [ ] Client leaves in `_components/` with `'use client'` line 1
- [ ] Ticket **Status** set to Complete; `PROGRESS.md` ticked; departures logged in `DEVIATIONS.md`

---

## Out of scope

[Explicitly what this slice does NOT build — deferrals, Phase 2, other paths.]

---

## Recommended Cursor execution

[Opus (planning-heavy / cross-cutting) · Sonnet (standard slice) · Composer (minor/mechanical) — one line, with a reason.]
