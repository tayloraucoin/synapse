---
title: "Track: the epic"
description: "Read when work needs several tickets, a new surface or an unsettled problem, or when teaching someone how a feature goes from idea to shipped: the levels, who plays each, what each writes, and the gates between them."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-08
supersedes:
load_when: on request
---

# The epic: a campaign

> **In one line:** an epic is a folder of tickets sharing one problem, one UX proposal and one set of technical notes.

- **Shaping:** it is played in levels, each in its own thread, each ending at a gate you pass.
- **Building:** then each ticket is built in its own thread, seen by you, and hardened on your word, and shipping updates the living UX truth.

New to the terms? See [`../glossary.md`](../glossary.md). The big picture and the map are in [`../README.md`](../README.md).

## When it applies

Any one of these, for work we mean to ship:

- it needs more than one ticket;
- it adds a new surface (a screen, a flow, a component users meet) whose design is not settled;
- the problem itself is not settled.

## The levels at a glance

| Level                  | Lead           | You do                                           | It writes                              | Gate                                                            |
| ---------------------- | -------------- | ------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------- |
| 0. Entry               | Prompt builder | Brain dump, answer it                            | Prints the Frame prompt                | none                                                            |
| 1. Frame               | Compass        | Answer questions                                 | `brief.md`                             | You say go                                                      |
| 2. Research (optional) | Fits the gap   | Run the research threads                         | `research/<topic>.md`                  | Each question answered, or marked not found                     |
| 3. UX spec             | Vesper         | Answer rounds of questions                       | `ux/` proposals                        | You approve; files marked `approved`                            |
| 3b. Design (optional)  | Vesper         | Name the Paper file, push the design, say "lock" | Artboards; `captures/` beside the spec | You say lock; the UX handoff pass then approves the files       |
| 4. Technical           | Mason          | Ratify routed calls                              | `technical.md`                         | You ratify                                                      |
| 5. Tickets             | Reeve + Mason  | Confirm the ticket table                         | One contract per ticket                | You confirm levels and reviewers; `check-specs`                 |
| 6. Build, Seen, Harden | No role        | Build, walk, say "harden"                        | Code; at harden, proofs and as-builts  | You walk it; then the level each ticket carries; then you merge |

## Every level plays the same five beats

1. **Enter with a prompt.** The builder prints the first one. After that, each level prints the next level's prompt in the thread when its gate passes. Prompts are never saved as files.
2. **Load.** The level's stage file names exactly which laws and files to load.
3. **Interview.** Shaping levels ask every question the output needs, in rounds, each with a recommended answer. Nothing is invented silently. Anything left open carries a marker.
4. **Write.** One output, to a known path, from a template.
5. **Gate, then hand off.** How often the thread stops for you follows the involvement you chose in the builder: at every gate by default for an epic.

**When to start a new thread.** Stay in one thread while you are being interviewed, because your answers are the context. Start a new one when the lead role changes, or when the output is a file someone else will use. A fresh thread is also a test: if Mason has to ask what the UX spec meant, the spec has a hole.

## The builder's own questions for this track

1. A prefix for the epic (two to five capitals or digits; the builder proposes one).
2. The appetite: roughly how much time is this worth?
3. The default QA level, and any parts you already know are critical (each ticket gets its own level later).
4. Does a UX spec, a design or an exploration already exist to start from?
5. Should the tickets build as you approve them, or all be cut first? (Either way, one ticket per thread.)
6. Settle the design in Paper before tickets? **Yes** (recommended for a new surface, an unsettled look, or a version one with notes): the UX level runs in two passes around a canvas beat where you and the thread push the surface in Paper until you say "lock" ([stage file](../stages/design.md)). **No**: one UX pass, straight to code. On yes, the stage asks which Paper file and page when it opens; name it now if you know.

## The level cards

### Level 1: Frame ([stage file](../stages/frame.md))

- **Lead:** Compass. Tribune or Tally can join when the customer's voice or the numbers matter.
- **First move:** `yarn spec:init <app> <EPIC> <slug>` creates the epic folder on the operator's branch.
- **Asks about:** who has the problem; why now; the appetite; what success looks like; what is out; the knowledge gaps.
- **Writes:** `brief.md`. **Gate:** you say go.
- **Hands off:** a research block per real gap, then the UX prompt, both printed.

### Level 2: Research, optional ([stage file](../stages/research.md))

Run this only for a real knowledge gap. The builder's rule decides whether a gap is looked up in the working thread or handed to a research thread ([`../prompt-builder.md`](../prompt-builder.md) §5).

- **Writes:** `research/<topic>.md` in the epic folder, from the research-note template.
- **Gate:** each note answers its question, or says plainly what was not found.

### Level 3: UX spec ([stage file](../stages/ux.md))

- **Lead:** Vesper. Support: Gloss for words, Threshold for accessibility.
- **Interview:** every empty slot in the surface template is a question. Every surface needs every state, an accessibility section and criteria with IDs.
- **Writes:** `ux/` proposals that mirror the truth paths: an area overview with a decision log (`D-OB2-1`), and one file per surface with `target:` naming the truth file it will replace or add.
- **Gate:** you approve, and each file is marked `status: approved`. The detail test: a fresh thread could build any one surface file without asking a question.
- **With the Design level:** this level runs twice. The intent pass writes the overview and, per surface, the job, the states by key and the primary action, then hands to the canvas. The handoff pass, in a fresh thread after lock, fills the rest from the locked captures and reconciles the two by the stage's rules.

### Level 3b: Design, optional ([stage file](../stages/design.md))

- **Lead:** Vesper. Assay as the design critic, forked and advisory; Plumb when something drawn is not a house primitive.
- **Venue:** Claude Code with Paper Desktop open, you present. The thread's first question is which Paper file and page; it never writes to one you have not named.
- **Does:** mirrors the tokens and the house components into the file once per product; captures the current screens when a version one exists; diverges on one axis; converges to one artboard per state and breakpoint, light and dark, from the components page; reads your teammates' comments as decisions.
- **Writes:** the artboards; at lock, a PNG per state in `ux/<area>/captures/` and a `design:` block in each surface file.
- **Gate:** you say "lock", every state has an artboard or an `N/A` with the reason, and the design critic's last round holds no black or red finding.

### Level 4: Technical ([stage file](../stages/technical.md))

- **Lead:** Mason. Support as the spec calls for: Warden, Loom, Tally, Quartermaster.
- **Writes:** `technical.md`: only what every ticket shares. Placement, the data contract, one-way doors, and the calls routed to you, each with a recommendation. Detail that belongs to one ticket goes in that ticket.
- **Gate:** you ratify the routed calls.

### Level 5: Tickets ([stage file](../stages/tickets.md))

- **Lead:** Reeve, with Mason.
- **Writes:** one contract per ticket. Each ticket is buildable from itself plus `technical.md`: its Build notes carry the approach, the decisions it builds on, the interfaces and the gotchas.
- **Waves:** Reeve puts tickets with no dependency between them in the same wave (threads that can run at the same time).
- **Gate:** one table, a row per ticket: QA level, reviewers, focus, wave, model, hardens later. You confirm it once, changing any row. `check-specs` validates every contract.
- **Hands off:** the execution table, printed: order, wave, depends on, model.

### Level 6: Build, Seen, Harden ([build](../stages/build.md), [harden](../stages/harden.md))

Three beats per ticket, in the execution table's order:

1. **Build.** You say "build OB2-3" in a new thread, one ticket per thread, on the model its row names. The thread builds, runs the ticket's tests and its workspace's suite, and ends on five lines and the links.
2. **Seen.** You walk the running surface and each `?state=`, get whoever must approve to approve, and ask for changes by "fix" or a follow-up ticket.
3. **Harden.** You say "harden OB2-3". A new thread runs every proof, capture and review the ticket's level asks for, once. The epic's last hardening thread runs `yarn verify` and closes the epic.

- A ticket that depends on another starts once that one is built. Nobody waits on a review to start the next build.
- **Promotion:** when every ticket citing a surface file has shipped, `truth:promote` copies the proposal into `specs/<app>/ux/`, reconciled with what was actually built.

## Gates: law or judgment

| Gate                                                                       | Enforced by                           |
| -------------------------------------------------------------------------- | ------------------------------------- |
| UX approved before tickets start                                           | `contract:init` refuses (law)         |
| No blocking decision left open                                             | `contract:init` refuses (law)         |
| Contracts well-formed and sized                                            | `check-specs` (law)                   |
| A Q3 ticket is done only when proven and reviewed                          | Results written by scripts only (law) |
| The brief is worth building; the UX is right; the levels and reviewers fit | You (judgment)                        |

## Version two of anything

"Onboarding v2" is a new epic (`OB2`). Its Frame reads the current truth as the starting point, and its `ux/` holds only the files it changes. As its tickets ship, those files replace the truth. Version one stays in git history and in the earlier epic's folder.

## Explain it back

> "An epic is a campaign in levels. The builder opens it. Compass frames the problem, optional research fills real gaps, Vesper interviews me into a UX proposal (and, when I choose it, we settle the surface in Paper between the intent and the handoff), Mason works out the shared technical calls, and Reeve cuts it into tickets grouped into waves, each with its own QA level and model that I confirm in one table. Each level prints the next prompt. Then I build each ticket in its own thread, walk what it built, and say harden when I am happy; hardening checks it as carefully as its row says, I merge, and the UX proposal becomes the living truth."
