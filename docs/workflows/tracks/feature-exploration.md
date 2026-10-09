---
title: "Track: feature exploration"
description: "Read when the work is early product thinking: trying directions, showing them to clients or teammates and collecting what they say, before anything is committed to the product."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when: on request
---

# Feature exploration: scouting ahead

> **In one line:** build something rough enough to react to, put it where the right people can see it, collect what they say, and decide. Nothing here is the product yet, so the paperwork is light and the code is allowed to be thrown away.

## When it applies

The question is "what should this be?" and not yet "build this". There may be several directions, a client whose reaction matters, or an idea that needs to be seen to be judged. When a direction is chosen, the work moves to a [product spec](product-spec.md) or an [epic](epic.md).

## Stages

| Stage                  | What happens                                                                          | Shared with                                         |
| ---------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1. Frame-lite          | A half-page brief: the idea, who it is for, what we want to learn, how we will know   | [Frame](../stages/frame.md), rounds 1, 4 and 6 only |
| 2. Research (optional) | Knowledge gaps go to research threads; results are saved in the exploration folder    | [Research](../stages/research.md)                   |
| 3. Explore             | The directions are built: on a canvas, in code, or both                               | This file                                           |
| 4. Review              | The right people look; feedback is collected; the operator picks a direction or stops | This file                                           |

## Cast and QA

Lead: Vesper. Support: Compass for what is worth learning; Envoy when real users or clients give feedback; Turner when a new primitive is tried. Default Q1 on the experimental code; the check is the operator and the invited reviewers looking at it. Tokens and `@pem/ui` components still apply, so a chosen direction can move into the product without being rebuilt. No tests are written here.

## The builder's own questions for this track

1. What is the idea, and what do you want to learn from trying it? (Usually in the dump; ask what is missing.)
2. Which app is it for?
3. Where should the exploring happen? **All in code** (recommended when the components exist); **canvas first, then code**; **canvas only for now**. For a canvas, follow `docs/design/workflow.md`: the canvas is a view, never the source of truth, and a direction is brought into code by an agent reading the chosen frame and rebuilding it with the repo's tokens and components.
4. How many directions, and how do they differ? Ask for the differences in detail: one named axis per variant set (layout, flow order, tone, density).
5. Is this an A/B comparison where each viewer sees one variant, or does everyone see all of them side by side?
6. Who needs to see it? Teammates with a developer or admin role; clients or outsiders by access code; both.
7. What feedback do you want? Comments on the page; a short review form at the end; both; none (you will ask them yourself).
8. Should the feedback be collected into an admin view of results for this experiment?
9. When is it over: a date, a number of responses, or when you decide?

## Where it lives

- **Pages:** under the app's experimental area, at `/experimental/<slug>`, one route per direction or one route with a variant switch. Experimental pages are kept apart from product routes and are not linked from the product.
- **Who can open them:** a signed-in user with a developer or admin role goes straight in. Anyone else is asked for an access code; a visitor who is not signed in gives an email address first, so their feedback has a name.
- **Feedback and results:** comments and review forms are stored per experiment and shown in the admin results view when the operator asked for one.
- **Notes:** `specs/<app>/explorations/<slug>/` holds `brief.md`, any `research/` notes, and `findings.md`.

The gate, the feedback collection and the results view are one shared feature of the app. Until it is built, the thread says so plainly and puts pages at `/experimental/<slug>` behind sign-in only, collecting feedback however the operator chose in question 7.

## How it ends

The thread writes `findings.md`: what was shown, to whom, what they said (verbatim where it matters), and what the operator decided. Then it prints one of:

- a product-spec or epic dump for the chosen direction, ready for the builder, naming the experimental code that can be migrated;
- "stopped: not pursuing", with the reason, and a note of which experimental pages to delete.

## What gets written

`brief.md` and `findings.md` in the exploration folder; research notes; the experimental pages. No ticket, no contract, no as-built.
