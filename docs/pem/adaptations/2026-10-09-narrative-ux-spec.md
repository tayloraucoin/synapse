---
status: approved
---

# A narrative-first choice at the UX stage

**Date:** 2026-10-09 · **PEM source:** `docs/workflows/stages/ux.md`, `design.md`, `tracks/epic.md`, `tracks/product-spec.md`, `glossary.md`, `tooling/check-specs.ts`, `tooling/lib/specs.ts` at `62d344b`; the template is new · **In Synapse:** the same paths, and `docs/design/templates/ux-narrative.template.md` · **For:** PEM · **Status:** proposed

## What changed

The UX stage's first interview question is now which kind of UX spec. **Narrative-first** writes `ux/narrative.md`, a detailed walkthrough a person reads in the docs app. It holds the moment and the feeling, a day in the life, and each surface as seen top to bottom in named house components, with what a person does, why it matters, stories and every state. It also lists what Paper will hold and the open questions. Its gate is "narrative approved". The AI-focused passes (intent and handoff, or the single pass) then run in a fresh thread and load the narrative, as does the Design stage. At the intent and handoff gates, a fresh-context Alembic subagent traces every narrative point to the spec and lists anything lost (an emotion, an insight, an edge case); the operator carries each lost point into the spec or drops it with a decision line. **Straight to the AI-focused spec** is the stage as it was. The narrative is never required.

When the Design stage is chosen, the narrative pass (or the intent pass without one) also asks two canvas questions. **Variations:** see a few directions first, drawn to gauge feedback, or go straight to one; the Design stage's diverge step now runs only on yes. **Pace:** every screen in one thread, or screen by screen. Screen by screen replaces the Design stage's fixed "one surface per thread" with a relay: the first thread's prompt tells it to work one surface per thread, hand off at "next" or past about 150k tokens, and print the next thread's prompt carrying a fixed block (Paper file, chosen direction, surfaces done and left, new decision IDs, open items, what to read first).

`check-specs` treated every `.md` under an epic's `ux/` as a proposal. That meant a `target:`, `promoted:` and a 2,000-token cap, so a narrative failed it. It now knows a narrative kind: an epic's `ux/narrative.md` or `ux/narrative/<part>.md`, capped at 4,000 tokens, `status` draft or approved, and no `target:`, so it is never promoted. `truth:promote` already skipped files with no target and is unchanged.

## Files

- `docs/workflows/stages/ux.md`: §3 three Loads rows; §4 the first question, the narrative pass and the fidelity check, plus a line each in the one-pass, intent-pass and handoff-pass text; §5 to §7 the narrative's write, gate and handoff.
- `docs/workflows/stages/design.md`: one Loads row for the narrative; §3 all at once or screen by screen; §6 diverge only on variations, and the relay; §9 the screen-by-screen handoff.
- `docs/workflows/tracks/epic.md`: builder question 7, the levels table's row 3, a "With a narrative" bullet in the Level 3 card.
- `docs/workflows/tracks/product-spec.md`: the choice in question 1, the stage table's row 4, "What gets written".
- `docs/workflows/glossary.md`: Narrative spec, Fidelity check, Relay (with Operator notes and PEM adaptation from the same change set).
- `docs/design/templates/ux-narrative.template.md`: new.
- `tooling/lib/specs.ts`: `SPEC_FILE_CAPS.narrative` and `isNarrative`.
- `tooling/check-specs.ts`: the narrative kind in `checkUx`.
- `tooling/fixtures/specs/pass-narrative-in-ux`, `fail-narrative-over-cap`, `fail-narrative-with-target`: new.

## Why

Taylor asked for it (the prompt that set this change, 2026-10-09): to read and approve the experience as a person would before the spec written for agents. A detailed AI-focused spec is hard for a person to judge as an experience, and the feeling and the insight behind a screen are what drop first when a spec is derived. The fidelity check exists to catch that loss; Taylor confirmed it at both gates.

## For a PEM sync

Carry back whole. Synapse-specific to generalise first: the template names `@syn/ui` and the 390 width (the toolkit's product design layer names the component package and the breakpoints); the docs app is assumed as the place the narrative is read, which a host without `apps/docs` lacks (see [the docs-app adaptation](2026-10-09-docs-app-in-migration.md)). The three fixtures use the toolkit's existing fixture shape.
