---
title: "Workflow glossary"
description: "Read when a term in the workflows, a stage file or a hook message is unfamiliar; one line per term, plus old words from the previous spec system mapped to new ones."
layer: workflows
status: draft
thread: P-J
role: Usher
date: 2026-10-02
last_reviewed: 2026-10-08
supersedes:
load_when: on request
---

# Workflow glossary

One line per term, grouped by system. If a term needs more than a line, it links to where it lives.

## The work

| Term | Meaning |
|---|---|
| **Track** | A kind of work with its own path: epic, one-off, feature exploration, product spec only, bug, question or report, audit, new project. See [`tracks/`](tracks/README.md). |
| **One-off** | One buildable change with a known outcome, with or without a formal ticket. A side quest. |
| **Batch** | The tickets one thread builds in order because they share context. |
| **Wave** | The batches that can run at the same time because nothing depends between them. |
| **Epic** | A folder of tickets that share one problem, one UX proposal and one set of technical notes. A campaign. |
| **Ticket** | One unit of buildable work, sized to fit one build thread. Its folder holds a contract, results and an as-built record. |
| **Work-id** | A ticket's name. `WEB-41` for a one-off (app prefix), `OB2-3` for an epic ticket (epic prefix). Scripts allocate the numbers. |
| **Epic prefix** | Two to five capitals or digits naming one epic (`OB2`). Unique in the repo. |
| **Level** | One stage of an epic: Frame, Research, UX, Design (optional), Technical, Tickets, Build. Each runs in its own thread. |
| **Design stage** | The optional canvas beat between the UX intent pass and the UX handoff pass: the surface is settled in Paper, with the operator present, until they say "lock". See [`stages/design.md`](stages/design.md). |
| **Lock** | The operator's word that ends the Design stage: every state artboard is exported as a capture beside the spec, and the canvas stops being where decisions are made. |
| **Paper kit** | A product's tokens and house components mirrored into its Paper file once, so artboards are on-system; a snapshot of code, never authority. |
| **Gate** | The test a level must pass before the next one starts. A check where possible; otherwise you. |
| **Brief** | The epic's problem statement: who has the problem, why now, the appetite, what is out, and the knowledge gaps. |
| **Appetite** | How much time the problem is worth. Set before the solution, it shapes how big the solution may be. |
| **Research note** | The output of an optional research thread, saved in the epic's `research/` folder. |
| **Living UX truth** | `specs/<app>/ux/`: always describes how the app works now. |
| **Surface file** | One screen, flow step or component: layout, every state, accessibility, and criteria with IDs. |
| **Area overview** | The frame, routes and decision log for one area of the app (onboarding, settings). |
| **Proposal** | An epic's version of a surface file, which becomes truth when its tickets ship. |
| **Promotion** | The scripted step that copies a shipped proposal into the living truth. |
| **Technical notes** | Mason's `technical.md`: placement, data contract, one-way doors, calls routed to you. |

## The proof

| Term | Meaning |
|---|---|
| **Contract** | A ticket's definition of done: criteria, how each is proven, planned paths, what it cites, what's out of scope, what it depends on, and who reviews it. |
| **Criterion** | One checkable statement in a contract. |
| **Evidence type** | How a criterion is proven: `test` (an automated test), `check` (lint, types, boundaries), `capture` (a screenshot of a UI state) or `manual` (a human check, reported as not verified). |
| **QA level** | Q0 to Q3: how the work is proven, who reviews it and what is written down. Recommended by the builder, confirmed by the operator, set per ticket. See [`qa-levels.md`](qa-levels.md). |
| **Focus** | A named part of the work raised to a higher level on request ("the webhook handling"), without raising the rest. |
| **Ledger** | A Q3 ticket's `results.json` and kept review files: proofs that are checked for staleness before a merge. |
| **`results.json`** | A ticket's PASS or FAIL per criterion, written only by scripts. Below Q3 it is a status note that never goes stale; at Q3 it is the ledger. |
| **Run record** | Proof stamped into each Q3 result: the command, its exit code and the time. |
| **As-built** | The closing record: what shipped, deviations and why, what wasn't verified, and the next step. Written at Q2 and Q3, or when something deviated. |
| **Reviewer** | A role that checks work in fresh context. Recommended from what the work touches, confirmed by the operator. |
| **Flag** | The colour on a review or audit finding: black (fix now), red (critical), orange (high to medium), yellow (minor), grey (low). |
| **Vigil** | The QA evaluator. It runs as a read-only subagent and never sees the builder's summary. |
| **Assay** | The UI critic. It scores rendered UI against the canon rubric. |
| **One-way door** | A change that's hard to undo: schema, migrations, auth, billing, package boundaries, public API shape. |
| **Critical path** | Files where a one-way door lives. Work that touches one below Q3 is flagged once, never blocked. |

## The physics

| Term | Meaning |
|---|---|
| **Hook** | A script Claude Code runs automatically before or after an agent action. It can block the action and say why. |
| **Check** | A script in `yarn verify`, the git hooks or CI that fails when a rule is broken. |
| **Path rule** | A file in `.claude/rules/` that loads only when the agent touches matching files. |
| **Skill** | A packaged instruction set an agent loads when the work calls for it. The house ones are `tk-prompt` (the front door) and `tk-batch` (building tickets); plain language triggers both. |
| **`tk-`** | Short for "toolkit": the prefix on this repo's own skills, to tell them from third-party ones. |
| **HUD** | Heads-up display, from games: what the system shows you without being asked (the status line when a session opens, a denial that names the right move, "Left to go" when a session stops). |
| **Subagent** | A role run in its own fresh context with limited tools (Vigil, Assay). |
| **Settings and sandbox** | `.claude/settings.json`: what the agent may never do, must ask about, or may do freely. |
| **`toolkit.json`** | The one file that says where things live in this repo: apps, prefixes, specs root, reviewer map. |
| **Always-on** | What loads in every session (`AGENTS.md`, `CLAUDE.md`, `docs/index.md`, the skill and subagent listings, the SessionStart hook output), kept to 4,000 tokens or fewer; the cap lives in [`docs/index.md`](../index.md). |
| **Budget** | The token caps for each kind of thread, held by `yarn budget`. |
| **Status** | Generated views of every item's state: `yarn status`, `specs/_status.md`. |
| **Left to go** | The generated list of what remains on the active ticket, printed when a session stops. |
| **Markers** | `[PROVISIONAL]`, `[NEEDS DECISION]`, `[NEEDS DECISION — BLOCKING]`, `[ASSUMPTION: …]`. A blocking marker stops tickets that cite it. |

## The flow

| Term | Meaning |
|---|---|
| **Prompt builder** | The front door of every piece of work. It interviews you, then prints the prompt, what to expect and any research prompts. It saves nothing. |
| **Fast lane** | The builder doing a tiny piece of work in its own thread, with no prompt and no new thread. |
| **Involvement** | How often a thread stops for you: autonomous (once, at the end), check in at gates (a few named stops), decide together (every meaningful choice). |
| **Pace** | Fast, balanced or careful: how much checking and how deep a model the work gets. |
| **Prompt standard** | The checklist every printed prompt is checked against. |
| **Stage file** | One file per stage telling the agent who leads, what to load, how to interview, what to write, the gate and the handoff. Tracks share stages. |
| **Handoff prompt** | The next stage's prompt, printed in the thread by the stage that just finished. Never saved as a file. |
| **Research block** | The printed instruction to run a research thread: the role, the model, the prompt, and where to save the result. |
| **Venue** | Where a prompt runs: Claude Code, or a general Claude thread. Every prompt states it on its first line. |
| **Adoption tier** | How the toolkit is adopted in a repo. Starter: the full toolkit. Overlay: a minimum harness in a repo you don't own. Overlay-local: the same, kept in ignored files. |

## Old words, new words

For anyone who used the previous spec system.

| Old | New |
|---|---|
| Founder brief | The prompt the builder prints |
| UX handoff | The epic's `ux/` proposal, then the living truth |
| Slice spec / ticket file | Contract |
| `00-build-order.md` | `yarn status --epic <EPIC>`, generated |
| `PROGRESS.md` | `results.json` plus generated status |
| `DEVIATIONS.md` | The Deviations section of each as-built |
| `TECHNICAL-DECISIONS.md` | Decision logs and the ledger |
| Three-place closure | One act: the as-built lands and `check-specs` validates it |
| Kickoff contract paste | The kickoff prompt plus `contract:init` |
| "Left to go" at batch end | Printed by the Stop hook |
| No tests during slices | Every criterion names its evidence type; UI defaults to capture |
| Slice / bet (report language) | One-off ticket / epic |
