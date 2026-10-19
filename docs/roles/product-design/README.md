---
title: Product-design department — role coverage report
description: Read when starting a product-design thread and unsure which role to inject; maps each class of question to its seat and each Recipe A step to its roles.
layer: roles
status: adopted
thread:
role: Plumb
date: 2026-09-30
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Product-design department — role coverage report

> What this is: a short map of which seat answers which class of question, now that the department has eleven roles. Read it when starting a thread and you are not sure who to inject. Where a thread genuinely needs two seats, the primary is named first and the second is consulted, not co-piloting.

## The roster

| Role | Seat | Scope | Verb | Never |
|---|---|---|---|---|
| **Compass** | Product Strategist | fill §7 | decides *whether* and *why* | sequencing, feasibility, funnel math |
| **Tribune** | Customer Advocate | fill §7 | represents the customer in the room | decides, operates a channel |
| **Envoy** | User Research Specialist | fill §7 | designs and fields studies; owns the ledger's truth | cites fictional research |
| **Vesper** | Lead UX/UI Designer | universal | designs screens and specs within the system | manufactures urgency |
| **Vitrine** | Lead Web Designer | universal | designs marketing and portfolio sites | applies a house style |
| **Plumb** | Design Director | universal | owns `DESIGN.md`, the design layer, the canon, the workflow; rejects off-system work | designs screens, scores builds |
| **Assay** | UI Critic | universal | screenshots at real breakpoints and states, scores against the rubric, ranks five | writes or edits code |
| **Gloss** | Content Designer | universal | owns in-product register, the glossary, and every string that carries trust | marketing voice in-task |
| **Threshold** | Accessibility Auditor | universal | specifies access before build, audits after, ranks by cost to the person | ARIA on divs, overlays |
| **Alembic** | Research Synthesizer | universal | distills raw corpora into traceable atoms, clusters, and source digests | adds anything not in the source |
| **Tally** | Metrics Analyst | universal | defines, instruments, and reads the numbers with denominators and a paired why | significance theater |

All six new roles are **universal** with an intake contract (§7), following the Vesper pattern rather than the Compass/Tribune/Envoy "fill §7 socket" pattern — because you will run them across DealReady, Fybr, and your own products, and the guide's rule is: write universal when the craft is context-independent, then add a thin `Name_ext—<project>.md` extension if a product needs standing context baked in. Filenames use the em dash per the guide.

## What was iterated versus reflected

None of the five existing roles fit any of the six seats directly, so nothing was forked. Each new role states its boundary against its nearest neighbour in the how-to-use block:

- **Plumb vs. Vesper** — Vesper designs *within* the system; Plumb owns the system, the gate, and the workflow (which loop, which tool). Vesper's §3.4 drift test and buildability test informed Plumb's swap, dialect, and agent-readability tests.
- **Assay vs. Vesper** — Vesper reviews with authority to redesign; Assay only scores rendered evidence against the rubric and names the smallest fix. Assay's severity ranking (Blocking / Should-fix / Consider) is Vesper's, deliberately, so the two reviews speak the same grammar.
- **Alembic vs. Envoy** — Envoy designs, recruits, fields, and owns the readout; Alembic processes what comes back (and any other corpus) into atoms and clusters and feeds Envoy's ledger. Envoy's provenance and "never cite fictional research" laws are Alembic's whole constitution, turned up.
- **Tally vs. Compass** — Compass names the fit signatures and reads them for the thesis; Tally defines how each is measured, instruments it, and says how far the data can be trusted.
- **Gloss vs. Vesper and the voice owner** — Vesper writes in-register while designing; Gloss owns the register and the glossary and rules when they disagree. Brand voice outside the product stays with whoever owns the voice guide (Cantor, in the wider corpus).
- **Threshold vs. Assay** — Assay checks the accessibility floor as one rubric line; Threshold owns the depth and the acceptance criteria.

The Shift Nudge `sn-ui-checklist` skill and the accessibility checklist you attached were read as reflection material: Assay's standing rubric (§3.3) is structured so that skill can be plugged in as one input, and Threshold's passes (§3.3) cover everything the accessibility checklist covers and add the keyboard, screen-reader, zoom, and reduced-motion passes it lacks.

## Which use case warrants which role

**Deciding what to build, for whom, or whether at all** → Compass. Bring Tribune when the customer's seat would otherwise be empty; bring Tally when the question is "did the last thing work."

**A screen, component, or flow to design or spec** → Vesper. Plumb is consulted only if the work would add a token, a primitive, or a rule. Gloss is consulted when a string carries trust (errors, confirmations, onboarding, destructive actions). Threshold writes the accessibility section of the spec before build.

**A marketing site, landing page, or portfolio** → Vitrine, not Vesper. Product UX and web design are different genres with different jobs.

**Anything that would change `DESIGN.md`, tokens, components, anti-patterns, references, design skills, or the sanctioned tool for a loop** → Plumb. This includes tool investigations whose purpose is to set the official workflow.

**Verifying a build (Recipe A step 7)** → Assay, as the evaluator subagent, capped at two or three rounds. Assay never fixes; the builder fixes. A third-round failure goes to Plumb (system gap) or the brief's owner (brief gap).

**Words inside the product** → Gloss. A string set for a state matrix, a register ruling on a screen that reads wrong, a glossary amendment, an onboarding sequence.

**Access** → Threshold, twice per feature: the spec section before build, the audit after. Assay routes anything past the floor here.

**Turning raw material into knowledge without adding to it** → Alembic. Interview transcripts, ticket exports, reviews, a folder of notes — and equally a course's public materials, a book's available text, a newsletter archive, or a thought leader's written work when the job is "what does this actually say" before anyone builds a curriculum or a skill from it. The rule "only direct things, don't make up gaps" is Alembic's entire discipline.

**Numbers** → Tally. The event plan in every brief, the North Star and inputs, the rollout or experiment plan, the weekly readout, and the honest "what this scale can't tell us."

**Reviewing an educational resource for adoption into the canon** → Vesper reviews the craft on its merits, and the verdict is addressed to Plumb, who decides whether it enters the design layer, the reference set, or a skill.

## How the roles map onto Recipe A

| Step | Primary | Consulted |
|---|---|---|
| 1 Frame | the shaper, with Compass | Tally, Threshold |
| 2 Shape | the shaper, a builder | Tally, Plumb |
| 3 References | Plumb | [NEEDS DECISION] |
| 4 Diverge | Vesper | Plumb, if a direction needs a new primitive |
| 4b Settle (optional) | Vesper | Assay as design critic; Plumb for a new primitive |
| 5 Capture (optional) | — | — |
| 6 Converge | Vesper's spec; the builder builds | Gloss for strings |
| 7 Verify | Assay | Threshold for access depth |
| 8 Polish | the builder | [NEEDS DECISION] |
| 9 Ship | Tally | Tribune carries the replays into the next brief |

The steps and roles follow [`docs/design/README.md`](../../design/README.md), Recipe A; that table is the source.

## Housekeeping the guide requires after adding roles

Update the `roles/` section of `docs/README.md` (the guide notes it under-reports the roster), run `yarn directory-map`, and — if any of these seats needs standing context for a specific product — write a `Name_ext—<project>.md` rather than editing the portable file.

<!-- Generated by `yarn directory-map` from each file's frontmatter. Everything below this line is rewritten; edit above it. -->

## In this folder

| File | What it is for |
| --- | --- |
| [`alembic-research-synthesizer.md`](alembic-research-synthesizer.md) | Inject when a thread must turn raw material into traceable atoms, clusters or source distillations without adding to it — transcripts, tickets, reviews, notes, or a course, book or archive's "what is actually said here" layer. |
| [`assay-ui-critic.md`](assay-ui-critic.md) | Inject at the start of any thread — or as the evaluator subagent in a generate/critique loop — that needs a rendered interface scored against a rubric: post-build verification, pre-merge design review, screenshot critique, a state-coverage audit, or a calibration pass on the rubric itself. |
| [`compass-product-strategist.md`](compass-product-strategist.md) | Inject at the start of any thread that needs product judgment — what to build, in what order of importance, for whom, at what price framing, against which alternative. |
| [`envoy-user-researcher.md`](envoy-user-researcher.md) | Inject at the start of any thread that needs research thinking or execution — study design, questionnaires, interview guides, discovery-conversation planning, synthesis and readouts, segment definition, recruitment strategy, or a ruling on what we actually know versus believe. |
| [`gloss-content-designer.md`](gloss-content-designer.md) | Inject at the start of any thread that needs the words inside the product decided — labels, buttons, error and empty states, confirmations, onboarding sequences, notifications, tooltips, form copy, the product glossary, or a register ruling on a screen that reads wrong. |
| [`plumb-design-director.md`](plumb-design-director.md) | Inject at the start of any thread that needs the owner of the design system's law — amendments to `DESIGN.md` and the design layer, token and primitive proposals, curation of references and design skills, tool and workflow rulings, and the gate that decides whether a piece of work is on-system or gets sent back. |
| [`tally-metrics-analyst.md`](tally-metrics-analyst.md) | Inject at the start of any thread that needs the numbers defined, instrumented, read, or defended — an event plan, a metric definition, a rollout or experiment plan, a readout, or what the data can and cannot say at this scale. |
| [`threshold-accessibility-auditor.md`](threshold-accessibility-auditor.md) | Inject at the start of any thread that needs access judged or specified — a pre-ship accessibility audit, a keyboard or screen-reader pass, the accessibility section of a spec or brief, an ARIA or semantics ruling, a contrast or motion or target-size question, or acceptance criteria that can be verified. |
| [`tribune-customer-advocate.md`](tribune-customer-advocate.md) | Inject at the start of any thread that needs the customer's seat filled in a room where customers aren't — customer-lens reviews of features and hospitality surfaces, community-design rulings, cross-source signal synthesis, or "how does this land for the person it's for?" |
| [`vesper-ux-ui-designer.md`](vesper-ux-ui-designer.md) | Inject at the start of any thread that needs the design lead's perspective — screen and component specs, design review, exploration, or a product question that is secretly an interaction question. |
| [`vitrine-web-designer.md`](vitrine-web-designer.md) | Inject at the start of any thread that needs a website designed rather than a product interface — reading a client dossier and taste profile, setting a design direction, architecting pages, writing the style guide, specifying a build, reviewing a first look, or triaging revision feedback. |
