---
title: "Track: product spec only"
description: "Read when a product lead is preparing work to hand to developers: the UX spec alone, or the spec plus UI and basic function, ending in a ticket the developer can start from."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-08
supersedes:
load_when: on request
---

# Product spec only: drawing the map for someone else

> **In one line:** the product lead empties their head, the thread asks until the picture is complete, the spec (and as much UI as agreed) is produced, and the work ends with a ticket a developer can pick up, including what to paste into their own starting prompt.

## When it applies

The person starting the work is not the person who will finish it. The line between the two differs every time, so the builder asks where it sits. It often follows a [feature exploration](feature-exploration.md) whose direction has been chosen.

## Stages

| Stage                   | What happens                                                                               | Shared with                        |
| ----------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------- |
| 1. Context              | The product lead's dump, plus attachments                                                  | The builder                        |
| 2. Frame                | Questions until the mental model is complete; a brief                                      | [Frame](../stages/frame.md)        |
| 3. Research (optional)  | Gaps go to research threads                                                                | [Research](../stages/research.md)  |
| 4. UX spec              | Surface files with every state, as for an epic                                             | [UX](../stages/ux.md)              |
| 4b. Design (optional)   | The surfaces settled in Paper, you present, until you say "lock"; captures beside the spec | [Design](../stages/design.md)      |
| 5. Prototype (optional) | UI and basic function, up to the handoff line                                              | [Build](../stages/build.md), at Q1 |
| 6. Handoff              | The developer's ticket, the open questions for them, and their starter dump                | This file                          |

The work is filed as an epic (`specs/<app>/epics/<EPIC>-<slug>/`) that stops after its UX level. The developer continues the same epic at Technical, so nothing is rewritten.

## Cast and QA

Lead: Compass through Frame, then Vesper. Support: Gloss for words, Threshold for access, Tribune when a customer's voice is the source. The check on the spec is the product lead's approval of each surface file. A prototype is Q1: it shows intent, and the developer's own tickets carry the real QA.

## The builder's own questions for this track

1. What are you handing over? **The UX spec only**; **the spec and the UI**; **the spec, the UI and basic function**. Then the exact line: what must the developer not have to redo, and what must you not touch (data, auth, payments, integrations)? And: settle the UI in Paper first (recommended when the look is not settled; the stage asks which file), or straight to the spec?
2. Does this continue an exploration? If yes, which one, which direction was chosen, and should its experimental code be moved into the product as part of this work?
3. Who is the developer, and how do they receive work: a Linear ticket (recommended when Linear is connected), or a printed ticket to send another way?
4. What do you already know the developer will ask? (The thread adds its own.)
5. Is there a deadline or an order this must ship in?

## Stage 6: the handoff

When the spec is approved, the thread works with the operator to produce three things:

1. **The ticket for the developer,** written to be read cold: the problem in two sentences; what is specified and where (paths to the brief and each surface file); what already exists in code and its state (prototype, experimental, none); what is theirs to decide; what is out of scope; the open questions. Created in Linear when the connector is available, after the operator has read it; otherwise printed.
2. **Questions for the developer,** each with the product lead's own lean, so the first conversation starts from a position.
3. **The developer's starter dump:** a short paragraph they paste into the prompt builder, which routes it to the same epic at the Technical level.

## What gets written

`brief.md` and the `ux/` proposals in the epic folder; the locked `captures/` when the Design stage ran; research notes; prototype code when agreed; the ticket (in Linear or printed). No contracts: the developer's Tickets level writes those.
