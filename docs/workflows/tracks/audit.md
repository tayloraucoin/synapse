---
title: "Track: audit"
description: "Read when existing code or user journeys should be examined for UX or technical problems, for example before a marketing push or as context for other work: scope by who is asking and why, sweep, and report findings by colour."
layer: workflows
status: draft
thread: PR-19
role: Usher
date: 2026-10-05
last_reviewed: 2026-10-05
supersedes:
load_when: on request
---

# Audit: sweeping the dungeon before the crowd arrives

> **In one line:** an audit examines what already exists and reports what it finds, flagged by colour. It changes nothing. What it looks for depends entirely on who is asking and why, so the builder asks.

## When it applies

Before a launch or a marketing push; before building on top of an area; when something feels off and nobody knows where; when a new teammate or client needs an honest picture of an area. A marketer, a designer and a developer asking for "an audit of onboarding" want three different documents.

## Stages

| Stage       | What happens                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1. Scope    | Fix what is examined (which journeys, which code), from whose point of view, at what depth, and what is out              |
| 2. Sweep    | Walk each journey in the running app and read the code behind it. One sub-thread per lens when several lenses are asked. |
| 3. Findings | One list, flagged by colour, each finding with where, what a person experiences, and the smallest fix                    |

## Cast, by lens

| Lens                      | Role             | Looks for                                                                               |
| ------------------------- | ---------------- | --------------------------------------------------------------------------------------- |
| Does it work as specified | Vigil            | Behaviour against the UX truth and the tickets; dead ends; unhandled states             |
| Is the interface good     | Assay            | Rendered screens against the design canon, at each size and theme                       |
| Can everyone use it       | Threshold        | Keyboard, screen reader, contrast, focus, motion                                        |
| Is it safe                | Warden           | Auth, permissions, personal data, secrets                                               |
| Is it sound underneath    | Mason            | Boundaries, data integrity, error handling, performance traps                           |
| Do the words work         | Gloss, Cantor    | Clarity, tone, consistency; for marketing, whether the page says what the campaign says |
| Will it convert           | Drummer, Tribune | The path from arrival to value, as a first-time visitor meets it                        |

QA level Q0: the audit is itself a review. The operator may ask for a second reader on the findings.

## The builder's own questions for this track

1. Who is this for, and what will they do with it? **A final check before a launch or push**; **context for other work** (name it); **understanding an area** (not hunting for breakage).
2. What should be examined: which journeys, pages or packages? Offer the areas in `specs/<app>/ux/` as options.
3. Through which lenses? Recommend the ones that fit the answer to question 1; the operator adds or removes.
4. How deep? **A pass** (the main path of each journey); **thorough** (every state and edge); **exhaustive** (thorough, plus the code behind every step).
5. In which environment, and with which accounts or seed data?
6. What is already known and should not be reported again?
7. Where should the findings go? **Saved** at `specs/<app>/audits/<date>-<slug>.md` (default: findings get acted on over days); **printed only**.
8. Afterwards, should the thread draft the follow-up work (bug, one-off or epic dumps for the builder) for black and red findings?

## The flags

| Flag       | Meaning                          | Example                                                          |
| ---------- | -------------------------------- | ---------------------------------------------------------------- |
| **Black**  | Stop everything and fix this now | Payments fail; another user's data is visible; sign-up is broken |
| **Red**    | Critical: fix before the push    | A main journey dead-ends; a form loses what was typed            |
| **Orange** | High to medium concern: fix soon | A confusing step with a workaround; a slow page on the main path |
| **Yellow** | Minor concern                    | Inconsistent wording; a rough empty state                        |
| **Grey**   | Low concern, or a note           | A tidy-up; something worth knowing that needs no action          |

The same scale is used by reviewers ([`../qa-levels.md`](../qa-levels.md)). A flag is set by what a person experiences, not by how hard the fix is.

## The findings file

1. **The verdict, first:** ready, ready with these fixes, or not ready, in two sentences, written for the reader named in question 1.
2. **Counts by flag.**
3. **Findings, black first.** Each: where (page and file), what a person experiences, why it matters to this reader, the smallest fix, and how it was seen (walked in the app, read in code, or inferred).
4. **What was not examined,** so silence is never read as a pass.

For an "understanding an area" audit, the file leads with how the area works and what stands out, and the flagged list is secondary.

## An audit never fixes

Each finding worth fixing becomes its own bug, one-off or epic through the builder. This keeps the audit honest and each fix checked at the level it deserves.

## What gets written

The findings file when saved. Nothing else.
