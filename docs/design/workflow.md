---
title: Workflow — tools per loop
description: Read before choosing a design or build tool for a loop, citing a canvas file in a review, putting customer data into a design tool, or writing a UI prompt.
layer: design
status: ruling
thread: "01"
role: Plumb
date: 2026-09-30
last_reviewed: 2026-10-08
supersedes:
load_when: ui-build, spec
---

# Workflow — tools per loop

Lifted from Plumb ruling 01 ([`tools-per-loop.md`](../research/design-tools/tools-per-loop.md), evidence as of 2026-09-30) with product references generalized; prompting checklist from SC and R09 §6. Tool facts are dated; re-verify before relying on a price or capability.

## The ruling

Code is the only source of truth. Divergence gets one tactile canvas (Paper), used as a disposable view; the same canvas serves the optional Design stage, where a surface is settled with the operator before tickets and its captures travel with the spec ([`docs/workflows/stages/design.md`](../workflows/stages/design.md), amended 2026-10-08). Polish is done in code with DevTools-measured values. Onlook is the only candidate that writes direct manipulation straight to source; it gets a one-week trial before it earns a place. Figma drops out of the paid kit: Code to Canvas works from any seat into drafts, which covers the one job it still does uniquely. Claude Design is permitted as a sketching surface for non-builders, never as a loop tool. Cursor Design Mode does not restore the tactile loop: in Cursor 3 it points the agent at an element, and the agent still writes the change.

## The source-of-truth rule

> Tokens, components, and Storybook stories in the product repo are the design system. Every canvas is a view, never authority over a spec, a story or the critic. The Design stage may approve artboards as a proposal: at lock they are exported beside the surface file, the surface file is what a contract cites, and a build adapts the captures into tokens and components. Nothing on a canvas is shipped until it exists as a route or story in a PR that the code critic has scored. Canvas files are never linked from `DESIGN.md` as authority, and a ruling never cites one.

**Enforced by:** the PR template field "story or route link required for any UI decision"; the code critic scores only rendered builds (the design critic on artboards is advisory); a contract cites a surface file, never a canvas; Plumb rejects any ruling request that cites a canvas file.

## The data rule

No real customer data (confidential documents, account names, survey responses, anything a customer gave you in confidence) goes into a vendor canvas: Paper, Figma, Claude Design, Stitch. Divergence uses seeded fixtures. Canvas MCP servers make pulling real content easy; that is why the rule is written down.

**Enforced by:** review only. This is the weakest link in the ruling, and it is named.

## Tool per loop

| Loop                                    | Product surfaces                                                                                                                                                                                                                                                           | Canvas-rendered surfaces (maps, WebGL)                                                                                                                                                  | Personal kit / side work |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **Divergent**                           | Default: 3 directions as Storybook stories in code, with fixture data at real density. Tactile canvas: **Paper**, for pushing a direction by hand before it becomes a story.                                                                                               | Same default for panels and flows. Directions for the canvas itself are prototyped against the real renderer in code, not on any design canvas (no design canvas renders those layers). | Paper.                   |
| **Settle (optional, the Design stage)** | **Paper**, with the operator present: the chosen direction pushed to one artboard per state and breakpoint, composed from the product's Paper kit (tokens and house components mirrored from code), scored by the design critic, commented by teammates, exported at lock. | Panels and flows as product surfaces; the rendered canvas itself is never settled on a design canvas.                                                                                   | Paper.                   |
| **Capture (optional, Recipe A step 5)** | Share preview-deploy URLs of the stories. Use Figma Code to Canvas into drafts **only** if a named reviewer works in Figma — free on any seat.                                                                                                                             | Same.                                                                                                                                                                                   | Same.                    |
| **Convergent**                          | Claude Code (primary), against tokens and `@pem/ui` only.                                                                                                                                                                                                                  | Same.                                                                                                                                                                                   | Same.                    |
| **Polish**                              | By hand in code, values measured in browser DevTools, then written to tokens or component props. **Trial Onlook for one week** (see exit criteria).                                                                                                                        | Chrome and panels: as product surfaces. The canvas: tune its style definition (for a map, the style JSON) in the renderer's own editor against the running app.                         | Same.                    |
| **Stakeholder sketching** (not a loop)  | Non-builder stakeholders may use **Claude Design** with `/design-sync` run against the repo, so sketches start from the house tokens. Output is an input to a brief, never a spec.                                                                                         | Same.                                                                                                                                                                                   | —                        |

## Loop map (what each tool can do)

| Tool                     | Divergent (compare many directions)               | Convergent (make one real)       | Polish (last 10% of feel)                      | What is manipulated                                                              |
| ------------------------ | ------------------------------------------------- | -------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------- |
| Code + Storybook stories | **Yes — default**                                 | **Yes — only place**             | Yes, by hand                                   | Source files                                                                     |
| Paper                    | **Yes — sanctioned canvas**; also the Settle beat | No                               | No — edits land in Paper, not the app          | Proxy canvas (HTML/CSS in Paper's cloud); its MCP reads and writes the open file |
| Figma Design             | Credible, but output is Figma-format              | No                               | No as a scalpel — edits need re-translation    | Proxy canvas (Figma format)                                                      |
| Figma Code to Canvas     | No — capture only                                 | No                               | No                                             | Snapshot of rendered DOM into Figma layers                                       |
| Claude Design            | Sketching only (non-builders)                     | Handoff to Claude Code           | No                                             | Proxy canvas (Anthropic cloud)                                                   |
| Stitch                   | Credible but generic                              | No                               | No                                             | Proxy canvas (Google cloud)                                                      |
| Pencil / pen.dev         | Credible                                          | No                               | No                                             | A file in the repo (`.pen`), not the app                                         |
| Subframe                 | Credible within its own components                | Yes, but in its component system | Partial                                        | Its own component model, synced to code                                          |
| Cursor Design Mode       | No — it cannot generate layouts to compare        | Assists (targets edits)          | **Pointer only** — agent writes the change     | Running app's DOM, as context for an agent                                       |
| Onlook (trial)           | No                                                | No                               | **Candidate** — visual edits written to source | Running React + Tailwind app, instrumented to map DOM to source                  |

The polish column is the finding: only two things change the running build directly, a person with a text editor and (unverified) Onlook.

## Ignore list (for now)

- **Subframe** — a second component authority beside the house primitives.
- **Pencil / pen.dev** — a second source of truth in the repo; revisit if it imports real components from code.
- **Stitch** — generic output, cloud source of truth. Its `DESIGN.md` spec is a token file for generation; the house `DESIGN.md` is a governing law with examples and counter-examples. Same name, different job; never let one overwrite the other (CF-41).
- **Figma Make**, **Figma's in-canvas agent**, **Figma write-to-canvas (`use_figma`)** — prompt-to-app or canvas-resident output; components live in code.
- **Glue** — too early to judge; watch.
- **Cursor Design Mode as a sanctioned tool** — demoted, not ignored: allowed if you are already in Cursor, never required.

## Cost per month (as of 2026-09-30)

| Item                     | Cost                                                             | Who pays                                                                                          |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Paper Pro                | $16 (annual) or $20 (monthly) per editor                         | The person running the divergent loop; one seat. Teams buy seats only if their builders adopt it. |
| Figma                    | $0 (Starter; Code to Canvas works into drafts on any seat)       | Upgrade to Professional Full ($16/$20) only when a stakeholder needs shared files.                |
| Claude Design            | $0 incremental; draws from the existing Claude plan's usage pool | Already paid. Watch the shared pool.                                                              |
| Onlook trial             | $0 (open source)                                                 | —                                                                                                 |
| Cursor                   | $0 required; $20 Pro if kept for other reasons                   | Optional.                                                                                         |
| Pencil, Stitch, Subframe | $0 — not adopted                                                 | —                                                                                                 |

## Exit criteria (what would change the ruling)

- **Paper → Figma** as the divergence canvas: Paper's MCP becomes metered below about 1M calls a week, it adds a proprietary component layer to maintain, or a stakeholder group standardizes on Figma and comments there weekly.
- **Paper → Pencil:** pen.dev imports real components from code and round-trips edits back as component props.
- **Hand polish → Onlook:** in a one-week trial on one dense table screen and one panel in the demo app, at least 80% of polish edits land as clean diffs using existing tokens (no raw values, no classes outside the scale), and nothing breaks HMR or routing. `[PROPOSED — needs sign-off]` (ledger WT-07, only-you O-04).
- **Hand polish → Cursor Design Mode:** Cursor restores direct value controls and its edits land as token-aware diffs.
- **Claude Design promoted to a loop tool:** it renders the actual Storybook components and its handoff passes the critic first round more often than a code-first story. Drop it entirely if stakeholder sketching measurably drains the pool builds depend on.

## Prompting checklist for UI

Each line is a rule a prompt can be checked against.

1. **Direct with principles, not pixel specs.** Cite canon and product-layer IDs.
2. **Four blocks in every UI prompt:** anatomy (the sections), behaviour (states and motion), aesthetic (by token name), forbidden (by tell ID). (R09 #1)
3. **Always attach references; one reference, one job.** Crop each to the thing it teaches and write "take X, ignore Y". (R09 #2)
4. **The verb is "adapt into our tokens", never "recreate".** No import-a-site-then-make-it-original workflows. (R09 #3)
5. **List the states explicitly**, from the package's state table.
6. **Turn ambition words into gates before prompting.** "Feels trustworthy" becomes pass/fail lines in the package. (R09 #4)
7. **Constrain the vocabulary:** only `@pem/ui` components, only tokens, no raw values.
8. **Ask for divergence on one axis** (`tk-ui-diverge`), and reset context between directions.
9. **Iterate with annotated screenshots, not prose.**
10. **Separate generate and critique into different roles**, and withhold the builder's rationale from the critic (`canon-rubric.md`, procedure). (R09 #7)
11. **One media-role line per section; review generated batches as a contact sheet** before placing any. (R09 #6)
12. **Timebox the lottery:** after three failed prompts, hand-edit or log the design-system gap.
13. **Extract a skill only after a problem is solved**, from the evidence of what worked. (R09 #8)

The model-defaults note (R09 #5) lives in each product's `anti-patterns.md` (see the template).

## Changelog

- 2026-10-08: the Design stage (operator instructed, Usher; Plumb's ruling amended). The ruling paragraph, the source-of-truth rule and the loop tables gain the Settle beat: Paper is also where a surface is settled with the operator before tickets, its captures exported beside the spec at lock. What did not change: code is the only source of truth, the code critic alone governs what ships, a contract cites a surface file, the data rule. Ledger WT-04 amended, PR-23.
- 2026-10-01: v0.1, lifted from ruling 01 for the toolkit. Product columns generalized to product surfaces and canvas-rendered surfaces; stakeholder names removed; the Onlook trial retargeted to the demo app. Prompting checklist merged from SC and R09 §6 (CF-27, CF-42). Supersedes the tool lists in the original shared context.
