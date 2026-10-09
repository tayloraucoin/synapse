---
title: "Stage: Design (optional canvas beat between the UX intent pass and the UX handoff pass)"
description: "Open when the builder chose to settle a surface in Paper before tickets: the operator names the file, the thread builds from the house tokens and components and what is already on screen, the design critic scores the artboards, teammates comment, and lock exports the captures beside the spec."
layer: workflows
status: draft
thread: PR-23
role: Usher
date: 2026-10-08
last_reviewed: 2026-10-08
supersedes:
load_when: on request
---

# Stage: Design (optional, between the two UX passes)

> **In one line:** the surface is settled on a canvas before anyone builds it, so a rejected direction costs an artboard and not a route. The UX stage writes the intent first, this stage makes it visible in Paper until the operator says "lock", and the UX stage's handoff pass then writes the spec a build thread can follow from the locked captures.

Shared by the epic and product-spec tracks. The UX stage ([`ux.md`](ux.md)) runs twice around it: the intent pass before, the handoff pass after. The canvas is a view throughout: the surface file is what a contract cites, and the code critic is what ships ([`../../design/workflow.md`](../../design/workflow.md), the source-of-truth rule).

## 1. When it applies

Chosen in the builder's interview (the epic track's sixth question, the product-spec track's first). Recommend it when a surface is new, when its look is not settled, or when a version one exists and the operator arrives with notes. Skip it when the change is behaviour with no visual question, or when the components and layout are already on screen and the change is small.

## 2. Lead and support

Lead: Vesper (`docs/roles/product-design/vesper-ux-ui-designer.md`). Support: Gloss (`gloss-content-designer.md`) once the layout is settled, for the words on the artboards; Plumb (`plumb-design-director.md`) whenever something drawn is not a house primitive; Assay (`assay-ui-critic.md`) as the design critic, forked and advisory.

## 3. Venue

Claude Code on the operator's branch, with Paper Desktop open on the operator's machine and the Paper MCP connected, on the Pro seat (ledger PU-01). The operator is present: this stage never runs autonomously, because the canvas is where their taste is decided and the MCP works on a file open on their machine. Involvement here is "decide together" whatever the builder chose for the rest of the work.

**One surface per thread.** The area overview carries what the other surfaces decided, so no thread holds every surface at once. Close a thread past 200k tokens of context and start the next from the overview and the surface file. Take a canvas screenshot only after a change, and scaled down.

**The file is the operator's to name.** Before any Paper call, ask one question: which Paper file and which page. Offer the files the MCP lists by name, "a new file" (then ask where), and "a new page in <file>". Never create, rename or write to a file or page the operator has not named, and never guess from what is open. Record the file and page in the area overview's Design line.

## 4. Loads (the whole picture before the first artboard)

| File or source                                                                     | Reason                                                                                  |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| The intent-pass `ux/` files for the area (overview and surfaces)                   | What is being designed: the job, the flow order, every state by key, the primary action |
| `specs/<app>/ux/<area>/` and `specs/<app>/ux/_global/`                             | How the app works now; a version one is designed from its truth, not from memory        |
| The app's route tree for the area (`apps/<app>/app/<area>/`, its `_components/`)   | What is already on screen and which client leaves exist                                 |
| `packages/ui/src/` exports and the product's `components.md`                       | The vocabulary: every element on an artboard comes from here when one exists            |
| `packages/config/tailwind/preset.css` and the product's `tokens.md`                | The tokens the Paper kit mirrors                                                        |
| `docs/design/canon.md` and the product's `DESIGN.md`                               | The floor and the deltas; A-01 to A-20 apply to artboards as to builds                  |
| The running app (`yarn web:dev`), each current surface and its `?state=`           | The capture of what exists, taken from reality                                          |
| The epic's `refs/` set and at most three files through `docs/references/README.md` | What to take and what to ignore                                                         |
| Never a `docs/research/` file; never customer data                                 | A11; the data rule                                                                      |

## 5. The Paper kit, once per product

The kit is what makes an artboard on-system instead of generic. Build it the first time a product uses this stage, say so in the thread, and refresh it when a component or token changes. It is a snapshot of code, never authority over it.

1. **Tokens.** Push the preset's colour, spacing, radius, shadow, type and duration tokens into the file with Paper's token tools, so artboards use named tokens and an off-system value is visible.
2. **Components page.** A page named `Components` holding each `@pem/ui` primitive, and each primitive the product's `components.md` rules in, written from its real markup and classes in its variants and states. Paper renders HTML and CSS, so a primitive whose markup cannot be produced simply is captured as a screenshot with a note naming the gap.
3. **Current screens page.** For an existing surface, a page named `Current` holding the running route captured as artboards, one per state, so edits start from what users see today.

## 6. The loop

1. **Name the file** (§3). Load §4. Check the kit (§5); build or refresh what is missing.
2. **Capture what exists** when a version one is on screen: the operator's notes become a change list against the `Current` artboards, each note tied to a state or an element.
3. **Diverge.** Three directions on one named axis, as artboards composed from the components page, from the intent pass's states and primary action, with fixture data at real density. The operator picks one, or names a fourth axis. Layout-level divergence belongs here, never at build.
4. **Converge.** The chosen direction pushed by the operator's hand and by the thread, in small rounds. The end state is one artboard per state per breakpoint, at 390 and 1440 at least (834 when the surface has its own tablet layout), light and dark, named `<surface> / <state> / <width> / <scheme>`. Every element comes from the components page; an element that does not exist there is drawn once, flagged in the thread, and logged as a proposal to Plumb in the overview's decision log. Never redrawn silently as a lookalike.
5. **Design critic.** Assay, forked, from Paper screenshots and computed styles: the twenty tells, the principles, one primary action, state coverage against the intent pass's list, token use, consistency across breakpoints and schemes. Advisory, at most three rounds. It does not score access, motion, responsiveness between breakpoints or reachability by `?state=`: those are the code critic's (`tk-ui-critic`), run at build and hardening.
6. **Teammates.** Share the Paper file. The thread reads the comment threads through the MCP; a resolved comment that changes the design becomes a `D-<EPIC>-n` line in the overview, and a comment that changes behaviour becomes a `[NEEDS DECISION]` for the operator. The operator decides when the round of comments is closed.
7. **Lock.** The operator says "lock". The thread exports every state artboard as PNG to `specs/<app>/epics/<EPIC>-<slug>/ux/<area>/captures/<surface>/<state>-<width>[-dark].png`, writes the `design:` block into each surface file's frontmatter (file, page, artboard names, lock date), and adds the Design line to the overview. After lock, a canvas edit reopens this stage with a new decision, or becomes a follow-up ticket; the captures are the record a build thread and a reviewer trust, the Paper file is where the next round starts.

## 7. Writes

Artboards in the named Paper file; `captures/` beside the surface files; the `design:` block in each surface file's frontmatter; decision-log lines in the overview. Nothing under `docs/`.

## 8. Gate

The operator says "lock", and: every state in the intent pass has an artboard at every breakpoint, or is marked `N/A` with the reason; the captures are exported; every element off the components page has a Plumb proposal logged; the design critic's last round holds no black or red finding; no customer data is on the canvas.

## 9. Handoff

Print the UX handoff-pass prompt ([`ux.md`](ux.md) §4) and say: open a new thread with it. The fresh thread reads the intent files, the captures and the Paper file cold, and that is the test: if it cannot tell from them what was decided, the lock was early.
