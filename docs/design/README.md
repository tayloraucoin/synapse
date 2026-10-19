---
title: The design layer — loops, Recipe A, and where verification sits
description: Read when starting any UI work, to know which loop you are in, which step of Recipe A comes next, which file governs it, and where verification happens.
layer: design
status: ruling
thread: P-B
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-08
supersedes:
load_when: ui-build, spec, critique
---

# The design layer

Read before any UI work: which loop you are in, which step of Recipe A comes next, which file governs it, and where verification happens.

| File                                         | Holds                                                                                                                 | Read when                                                           |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [`canon.md`](canon.md)                       | The universal floor: principles C-P01–C-P12, anti-patterns A-01–A-20                                                  | Every UI build, spec and critique (loaded by `.claude/rules/ui.md`) |
| [`canon-rubric.md`](canon-rubric.md)         | The critic's procedure and rubric C-R01–C-R15                                                                         | The critic pass only; builders never load it                        |
| [`workflow.md`](workflow.md)                 | Which tool for which loop; the source-of-truth and data rules; the prompting checklist                                | Choosing a tool, or writing a UI prompt                             |
| [`skills.md`](skills.md)                     | Which design skills load, in what order, and how a third-party skill is reviewed                                      | Adding, updating or triggering a skill                              |
| [`templates/`](templates/DESIGN.template.md) | The blank product design layer: `DESIGN`, `tokens`, `components`, `anti-patterns`, `states`, `coverage-gaps`, `refs/` | Starting a product's design layer                                   |

A product's own design layer (its filled templates) inherits the canon by ID and holds only deltas. The demo app's filled layer lives at `apps/web/docs/design/`.

## The three loops

The source of truth is code (tokens, components, stories). Every canvas is a view (`workflow.md`, ruling 01).

1. **Divergent loop: many directions.** The default is three directions as Storybook stories or isolated routes in code, with fixture data at real density, differing on one named axis (`tk-ui-diverge`). Paper is the one sanctioned tactile canvas, used as a disposable view, and the canvas of the optional Design stage, where divergence and convergence both happen on artboards before any code (`docs/workflows/stages/design.md`).
2. **Convergent loop: one direction made real.** In code, with Claude Code, against tokens and `@pem/ui` only. No new primitive without a justification in the package.
3. **Polish loop: the last ten percent.** By hand in code, with values measured in browser DevTools and written back to tokens or component props. No sanctioned tool is both tactile and lands in code; that gap is named, not papered over.

Prompting is strong at the convergent loop, adequate at the divergent loop, and bad at polish. Using it for all three is the prompt lottery.

## Recipe A — code-first

| Step                 | What happens                                                                                                                                     | Governed by                                                            | Primary role (consulted)                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| 1 Frame              | `specs/<feature>/brief.md`: job, user, metric, evidence, appetite. Passes "Frame go".                                                            | [`brief.template.md`](../product/brief.template.md)                    | the shaper, with Compass (Tally, Threshold)             |
| 2 Shape              | `specs/<feature>/package.md`: breadboard, expected action, states, job lines, instrumentation. Passes "Bet".                                     | [`package.template.md`](../product/package.template.md)                | the shaper, a builder (Tally, Plumb)                    |
| 3 References         | 3 to 6 annotated screenshots in `refs/`, each with the one thing to take and the one to ignore                                                   | [`templates/refs/README.md`](templates/refs/README.md)                   | Plumb                                                   |
| 4 Diverge            | Three directions on one axis, as stories or routes. Layout-level divergence belongs here, in shaping.                                            | `tk-ui-diverge`; `workflow.md`                                         | Vesper (Plumb if a direction needs a new primitive)     |
| 4b Settle (optional) | The chosen direction settled on the canvas; see *Step 4b*, below the table | [`stages/design.md`](../workflows/stages/design.md); `workflow.md` | Vesper (Assay as design critic; Plumb for a new primitive) |
| 5 Capture (optional) | Preview-deploy URLs of the stories; Figma Code to Canvas into drafts only if a named reviewer works in Figma                                     | `workflow.md`                                                          | —                                                       |
| 6 Converge           | The chosen direction, built from tokens and components only. Detail-level divergence happens inside scopes.                                      | `canon.md`; the product layer; `shadcn` skill                          | Vesper's spec; the builder builds (Gloss for strings)   |
| 7 Verify             | The critic, forked, screenshots 390/834/1440 in light and dark, reduced motion, every `?state=`, and scores `canon-rubric.md`. One round per epic, then a re-check (`tk-ui-critic`). | `tk-ui-critic`; `canon-rubric.md`                                      | Assay (Threshold for access depth)                      |
| 8 Polish             | By hand, in code                                                                                                                                 | `workflow.md`                                                          | the builder                                             |
| 9 Ship               | Behind a flag with the package's events; every exposed session watched within 48 hours                                                           | [`variant-testing.md`](../runbooks/variant-testing.md) | Tally (Tribune carries the replays into the next brief) |

**Step 4b, in full.**

- The chosen direction pushed on the canvas, operator present, to one artboard per state and breakpoint from the product's Paper kit.
- Design critic advisory; teammates comment.
- Lock exports the captures beside the surface file.

After three failed prompts on the same problem: hand-edit, or log the design-system gap in the product's `coverage-gaps.md`.

## Where verification sits

Verification is inside "done means deployed", not a phase after it (R05 §3). It happens in three places:

1. **Designed in shaping.** The package carries the state matrix, the rubric additions this feature needs, and the events. A critic with nothing specific to check only checks generic polish.
2. **Run per scope during the cycle.** A scope is not done until its critic pass is clean. The builder never grades itself, and the critic never reads the builder's summary (canon §3, procedure). On day 7 the shaper's edge pass covers the domain cases a rubric cannot see.
3. **Read in cool-down.** The flag-and-replay readout of what shipped ([`readout.template.md`](../measurement/metrics/readout.template.md)).

## Who owns what

Plumb owns this layer and its changelog; Vesper designs within it; Assay scores against it; Gloss owns the words; Threshold owns access depth. The full map of seats is [`docs/roles/product-design/README.md`](../roles/product-design/README.md).

<!-- Generated by `yarn directory-map` from each file's frontmatter. Everything below this line is rewritten; edit above it. -->

## In this folder

| File | What it is for |
| --- | --- |
| [`canon-rubric.md`](canon-rubric.md) | Read when scoring rendered UI against the canon, or when calibrating the critic; the procedure and the fifteen rubric lines every product inherits. Builders never load it. |
| [`canon.md`](canon.md) | Read before designing, building or critiquing any UI. Holds the twelve principles and twenty anti-patterns every product inherits; a product's DESIGN.md may tighten these, never loosen them. |
| [`component-sources.md`](component-sources.md) | Read before adding a component from shadcn or any registry, choosing components for a new product, or finding which source serves a job the product's components.md lacks; holds the source verdicts, the base and style, the registry review deltas, the job index and the starter kits. |
| [`skills.md`](skills.md) | Read before installing, updating, editing or triggering any design skill, or when a skill fires on the wrong task; holds what is adopted, mined, rejected or deferred, the load order, and the review checklist. |
| [`workflow.md`](workflow.md) | Read before choosing a design or build tool for a loop, citing a canvas file in a review, putting customer data into a design tool, or writing a UI prompt. |
| [`templates/`](templates/README.md) | Open when a product starts or changes its design layer: the six templates it fills, and the reference-set guide. |
