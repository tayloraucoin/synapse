---
title: Guide — Authoring a Role Prompt
description: Read before writing or materially revising any role prompt, or before making a role available as a subagent.
layer: roles
status: adopted
thread:
role: Plumb
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when:
---
# Guide — Authoring a Role Prompt

> **How to use this file:** Read it before writing any new role in `docs/roles/`, and before materially revising an existing one. It codifies the conventions already carried by the role prompts in this directory — those files are the corpus this guide was derived from, and where a specific prompt and this guide disagree on a settled convention, the corpus wins and this guide gets amended. Everything here is a working contract for the *shape* of a role, never for the *content* of any particular one.

---

## 1. What a role prompt is

A role prompt is not a job description and not a task spec. It is **a person, written down** — a specific practitioner with a career, convictions, and a decision procedure, injected at the start of a thread so the model reasons *as that person* rather than as a generic assistant given a topic.

Three properties make the existing corpus work, and a new role fails without all three:

- **It defines the reader, not the material.** Every prompt says some version of: *this file defines who is reading the attached documents and how that person thinks.* The facts live in the companion docs; the prompt supplies judgment, taste, and refusals. A role that restates spec content is redundant the day the spec changes.
- **The expertise is earned, not asserted.** Nobody in this corpus is "an expert in X." They have a career of specific stops, each producing a specific consequence — Crucible flagged the right risk and was ignored because they flagged forty, so now they rank; Mason watched an architecture kill a company, so portability is audited at write time. **A background item that does not produce a behavior is decoration — cut it.**
- **It is written in second person, throughout.** "You are Mason." "You believe." "You refuse." Never third-person description of a persona; the prompt *is* the instruction.

A role earns its place when there is a recurring class of question the founder wants answered from a consistent, opinionated seat. If the need is one artifact, write a ticket. If the need is a standing lens, write a role.

---

## 2. Decide the scope first — project-bound or universal

This is the first decision and it changes the header, §1, §5, and §7. Make it before drafting.

**Project-bound** (the default in a product repo). The practitioner works *here*: they know the stack, the constitution, the cast, and the phase, so they never ask. They cite binding documents by name. Their standing context is a briefing they already hold.

**Universal.** The practitioner is portable — the same craft, convictions, and decision procedure, with every project fact lifted out and replaced by an intake contract. They arrive knowing their trade and nothing about your project, and their first move is to ask for what they need in a bounded way.

**The rule:** write project-bound when the role's judgment depends on this product's specifics — its constitution, its data sensitivity, its architecture, its cast. Write universal when the craft is genuinely context-independent and you want the role reusable across repos and clients. When in doubt, write it universal, then create a thin project-bound extension (§7) rather than forking the whole file.

### What changes between the two

| Element | Project-bound | Universal |
|---|---|---|
| Title line | `# Role Prompt — Name · Title, <Project>` | `# Role Prompt — Name · Title` |
| How-to-use block | Names the actual companion docs (`codebase-conventions.md`, UX Handoff §11, etc.) | Names *kinds* of documents ("your architecture contract, your design system, the ticket") |
| §1 relationship paragraph | "**Your relationship to this codebase/brand/product:** you wrote it…" — authorship and ownership of specific artifacts | "**Your relationship to the work:** …" — what they own by trade, no named artifacts |
| §2 beliefs | May cite product law as conviction (never paywall the crisis) | Craft convictions only; product law arrives as intake |
| §3.1 Authority check | Names the real precedence ladder and binding logs | States a generic precedence: *attached specs → project conventions → nearest local rules → your judgment*, and instructs the role to ask for the ladder once if it is not supplied |
| §5 cross-references | Routes to the cast by name (Vesper, Vigil, Mason…) | Routes by function ("the design owner," "whoever owns verification") |
| §7 Standing context | Product, stack, topology, workflow, phase — baked in | **Intake contract** instead: the 5–8 facts this role must have, what it assumes if they are not supplied, and how it labels those assumptions |
| Placement | `docs/roles/<department>/` in the product repo | `docs/roles/<department>/` in the toolkit; portable to any repo unchanged |

Everything else — the seven-section skeleton, the naming law, the voice rules, the closing line — is identical.

---

## 3. Naming and placement

**The name.** One word, capitalized, drawn from old trades, monastic offices, instruments, or landmarks — the register the corpus already uses: Mason, Millwright, Wainwright, Sexton, Forge, Loom, Warden, Scribe, Vigil, Vesper, Cantor, Reeve, Crucible, Cairn, Hearth, Lantern, Limner, Quire, Antiphon, Lector, Tribune, Porter, Chancery. No human first names, no acronyms, no cute portmanteaus, no "AI" in the name.

The name must be **explicable in one parenthetical** in §1 — nearly every prompt in the corpus contains some form of *"the name is deliberate"* followed by why the word fits the seat. If you cannot write that sentence convincingly, the name is wrong. The explanation should also place the role among the others metaphorically ("Mason framed this house, Vesper lit it, Vigil keeps watch; you are…") in project-bound roles; universal roles skip the cast placement and keep the etymology.

**The filename.** `<name>-<kebab-case-title>.md`, lowercase ASCII, name first, no em dash and no `-role-prompt` suffix (`docs/decisions/records/0006-file-naming-and-filing.md`; CF-17 superseded the em-dash form). The human title, em dash included, lives in the `title` frontmatter field. Examples: `warden-security-privacy-engineer.md`, `cairn-seo-paid-search.md`.

**The folder.** Folders are departments — `engineering/`, `product-design/`, `marketing-growth/`, `operations-strategy/`, `science-clinical/`, `trust-legal-compliance/`. In the toolkit every role is universal, so there is no `universal/` folder (CF-21); project extensions live in each product repo at `docs/roles/_extensions/`. Adding a department needs a real cluster behind it (two-plus roles that fit nowhere else), not a single orphan.

**The frontmatter.** Every role opens with the §2.7 block (`layer: roles`, `role: <Name>`, a `description` written as the injection trigger, usually the how-to-use block's first sentence, at most 400 characters). A role that should also run as a Claude Code subagent adds `subagent: true`, and `subagent_tools` when it must not inherit every tool (record 0008); `yarn gen:agents` then writes `.claude/agents/<name>.md`. Never edit that output by hand.

**After adding a role:** add it to the department's `index.md` seat map, run `yarn lint:docs`, and run `yarn gen:agents` if it opts in as a subagent.

---

## 4. The seven-section skeleton

Every role prompt in this directory has the same spine, in the same order, with the same numbering. Deviating from it is a defect, not a style choice. Target **100–160 lines** total; the corpus runs 101–156 and that ceiling is load-bearing — a role prompt is injected alongside real documents and must not crowd them out.

Before §1: the **title line**, the **how-to-use blockquote**, and a `---` rule. The blockquote always states three things: when to inject this role, what companion documents sit alongside, and the precedence rule — *where this file and those documents disagree on a factual or spec matter, the documents win; where they are silent, this role's judgment fills the gap.* That sentence appears in some form in every file and is non-negotiable.

### §1. Who you are

Opens `You are **Name**` and the deliberate-name parenthetical. Then the career — either three-to-four bulleted stops each ending in an italicized *Consequence:* clause, or the same content as tight prose ("~14 years, four apprenticeships that add up to exactly this job"). Then the **relationship paragraph**: what this person owns, authored, or is accountable for. Then **Temperament:** one or two sentences of how they behave under pressure.

Career stops should include at least one **scar** — a failure that produced a law the role now enforces. It is the single highest-leverage paragraph in the file.

### §2. What you believe

Numbered convictions, typically 6–9, each a **bolded claim sentence** followed by two to four sentences of mechanism. Beliefs are stated as convictions with teeth, not preferences: *"Constraints are only real when tooling enforces them"*, not *"prefers strong tooling."* At least one belief should be genuinely costly — something the role will defend when it slows things down.

### §3. How you make decisions (the mechanics)

The operating procedure, as `### 3.1`–`### 3.5` (a sixth is fine when the role needs a follow-through step). The corpus default:

- **3.1 Authority check** — the precedence ladder, plus how open markers (`[PENDING]`, `[NEEDS DECISION]`) are honored and never silently invented.
- **3.2 Frame before acting** — the questions asked before producing anything, worded for the trade ("Frame the threat before the control," "Frame the letter before the layout").
- **3.3 Generate within constraints** — how output is produced inside the law.
- **3.4 Convergence tests** — a named, runnable battery. **This is the section that makes a role useful.** Each test needs a name a person can invoke ("the tired-reader test," "the portability test," "the blindfold test") and a pass condition. Six to ten tests.
- **3.5 Decide and record** — one recommendation not a menu, and where the decision gets written down.

Rename subsections to fit the trade, keep the arc: *authority → frame → generate → test → record.*

### §4. Craft standards (what "good" means in your hands)

Three to seven `### A good <artifact>` subsections — one per deliverable the role actually produces — each a short paragraph describing the excellent version concretely. Not a checklist; a picture of the finished thing.

### §5. Working style & voice

Bulleted. Covers, at minimum: how they work **with the founder** (peer, not vendor — with the pushback and concession rules stated); how they handle **ambiguity** (the corpus norm is *at most one sharp clarifying question, otherwise proceed on labeled assumptions*); how they interact with **other roles** (route rather than absorb); **default deliverable shapes** (named formats with their internal structure in parentheses); and **format discipline**. Optionally a closing *calibration note* naming the one line to soften if the posture needs tuning.

### §6. Anti-patterns you refuse (fast reference)

A flat scannable list of 8–14 specific refusals. Specificity is everything — *"fat resolvers; the same rule implemented in two seams"* beats *"bad code structure."* Include at least one anti-pattern aimed at the role's own failure mode: reviewers who manufacture findings, red-teamers who perform adversarialism, writers who mistake elegance for clarity.

### §7. Standing context (so you never ask)

Bolded-label bullets that eliminate re-briefing. Project-bound roles carry: **Product**, **Stack** or the domain equivalent, **Topology**, **Workflow**, **Phase**, and the role's own live constraints. Universal roles replace this with the intake contract (Appendix B).

The section closes with **the tension you resolve daily** — one bullet naming the genuine conflict at the heart of the seat and how this person resolves it (agent velocity vs. architectural entropy; emotional resonance vs. comprehension). Present in most of the corpus and consistently the sharpest paragraph in it.

### The closing line

After a final `---`, one italicized second-person paragraph: *"You are Name. \<the job in imperative verbs\> — \<the metaphor the name earned\>."* One sentence, no bullets, no new instruction.

---

## 5. Voice and format rules

- **Second person throughout.** No third-person persona description anywhere.
- **No emoji, ever.** Stated inside nearly every prompt, and it binds this guide too.
- **Prose where thinking is needed, structure where building is needed.** §1, §2, and §4 lean prose; §3, §5, §6, and §7 lean structured.
- **Em dashes are fine in role prompt text and internal docs** (never in filenames). The em-dash budget in `cantor-ext-human-hand-mode.md` governs customer-facing copy only.
- **Sentence case in headings**, bold for claim sentences, italics for consequence clauses and the closing line.
- **Never re-litigate binding decisions** inside a role. If a role's craft genuinely conflicts with a settled rule, the role's instruction is to *route an amendment*, not to route around it — see Cantor §3.5 and Crucible §2.8 for the established handling.

---

## 6. Anti-patterns in role authoring

- Writing a job description: responsibilities and deliverables with no convictions, no scars, no refusals.
- Asserted expertise ("you are a world-class X") in place of a career that produced specific behavior.
- Beliefs that cost nothing — a list nobody would ever argue with is a list that never changes an output.
- Convergence tests that cannot be run or named; "use good judgment" as a test.
- Duplicating spec content the companion documents already own; the role goes stale the moment the spec moves.
- Overlapping an existing seat without stating the boundary. Pilot and Crucible both attack plans and the distinction is written into both files — do that work explicitly or don't add the role.
- Cast cross-references in a universal role; project facts baked into a role meant to travel.
- Running long. Past ~160 lines the prompt starts competing with the documents it is supposed to be reading.
- Skipping or reordering the seven sections, or dropping the precedence sentence from the how-to-use block.

---

## 7. Extensions and modes

When a role needs a conditional posture rather than a permanent change, write an **extension** instead of editing the role: `<name>-ext-<mode>.md`, same folder, with `extends:` naming the base role's file, its own numbering starting at `## 0. Why this mode exists`. An extension states its activation tag (`[HUMAN-HAND]`), what it adds, what it does **not** license, and how it changes severity thresholds. It runs *on top of* the base role — it never replaces it. `cantor-ext-human-hand-mode.md` is the reference implementation.

This is also the recommended way to project-bind a universal role: keep the portable file clean, and add `docs/roles/_extensions/<name>-ext-<project>.md` in the product repo carrying the standing context, the cast routing, and the binding-document ladder.

---

## 8. Ship checklist

1. Scope decided — project-bound or universal — and the header, §1, §3.1, §5, and §7 all reflect it consistently.
2. Name passes the one-parenthetical test; filename is ASCII kebab-case, name first; folder is the department; frontmatter passes `yarn lint:docs`.
3. All seven sections present, in order, correctly numbered; how-to-use block carries the precedence sentence.
4. At least one career stop is a scar with a named consequence.
5. §3.4 tests are named and runnable; §6 refusals are specific; §7 closes with the daily tension.
6. Boundary against the nearest existing role is stated in §5 (project-bound) or noted in the how-to-use block.
7. Under ~160 lines. No emoji. Closing italic line present.
8. The department's `index.md` seat map updated; `yarn gen:agents` run if the role is a subagent.

---

## Appendix A — Skeleton (project-bound)

```markdown
# Role Prompt — Name · Title, <Project>

> **How to use this file:** Inject at the start of any thread that needs <the lens> — <the recurring question classes>. Companion documents (<the real doc names>) are typically attached alongside. **Where this file and those documents disagree on a factual or spec matter, the documents win.** Where they are silent, Name's judgment fills the gap. This file defines who is reading them and how that person thinks.

---

## 1. Who you are
You are **Name**. (The name is deliberate: <etymology + placement among the cast>.)
<Career: 3–4 stops, each ending in an italic _Consequence: …_>
**Your relationship to <the thing you own>:** <authorship and accountability.>
**Temperament:** <behavior under pressure.>

## 2. What you believe
1. **<Conviction.>** <Mechanism, 2–4 sentences.>
   … 6–9 total, at least one costly.

## 3. How you make decisions (the mechanics)
### 3.1 Authority check
### 3.2 Frame <the thing> before <the output>
### 3.3 Generate within constraints
### 3.4 Convergence tests (run before <shipping>)
### 3.5 Decide and record

## 4. Craft standards (what "good" means in your hands)
### A good <artifact>   … 3–7 of these

## 5. Working style & voice
- **With the founder:** … - **With ambiguity:** … - **With the other roles:** …
- **Default deliverable shapes:** … - **Format discipline:** … No emoji, ever.

## 6. Anti-patterns you refuse (fast reference)
- … 8–14 specific refusals, including this role's own failure mode.

## 7. Standing context (so you never ask)
- **Product:** … **Stack:** … **Topology:** … **Workflow:** … **Phase:** …
- **The tension you resolve daily — <A> vs. <B>:** <how this person resolves it.>

---

_You are Name. <The job, in imperatives> — <the metaphor the name earned>._
```

## Appendix B — The universal deltas

Same skeleton; four substitutions.

**Title and how-to-use block** drop the project name and cite document *kinds*: "your architecture contract, your design system, the ticket or brief." The precedence sentence stays verbatim.

**§3.1 Authority check** becomes generic and self-repairing:

```markdown
### 3.1 Authority check
1. **Attached specs and tickets** govern the immediate work.
2. **Project conventions** — whatever locked contract or style law the project supplies.
3. **The nearest local rules** (an AGENTS.md, a README, a house guide) win over general convention for their own scope.
4. **Your craft judgment** fills every remaining silence, labeled as judgment.
If the precedence ladder was not supplied, ask for it once, then proceed on the order above and say you did.
```

**§5** routes by function, never by name: "the design owner," "whoever owns verification," "the person accountable for the roadmap."

**§7 Standing context** becomes the **intake contract** — the facts this role must hold, the defaults it assumes when they are missing, and how it labels those assumptions:

```markdown
## 7. Intake (what you need, and what you assume without it)
**Ask for, once, in one message:** <5–8 facts — the product in a sentence, the audience, the stack or medium, the binding constraints, the phase, the decision you are being asked to make.>
**If they are not supplied,** proceed on the most probable reading, state each assumption inline as `[ASSUMPTION: …]`, and repeat them in the sign-off. Never invent a value for something the project has explicitly flagged open.
**Standing regardless of project:** <the 2–4 things true of this trade everywhere — the tests, the refusals, the failure contract.>
- **The tension you resolve daily — <A> vs. <B>:** <resolution.>
```
