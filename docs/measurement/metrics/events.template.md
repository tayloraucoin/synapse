---
title: Events (template) — the event taxonomy
description: Fill before a package's instrumentation section cites an event, or when an event is added, renamed or retired; the names, properties, owners and status of every tracked event.
layer: measurement
status: adopted
thread: "03"
role: Tally
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: metrics, spec
---

# [FILL: product] events

> **Who fills:** Tally (metrics analyst) owns the taxonomy; engineering proposes events in the package; Gloss checks nouns against the glossary.
> **When:** before any package cites an event ID; every change in the same PR as the code that fires it.
> **Lives at:** `docs/measurement/metrics/events.md` in the product repo. Delete this instruction block when you fill it.
> **What the critic checks:** nothing; this is measurement, not pixels. The intended enforcement is a typed event registry that fails the build on a name missing here (Toolkit Map §5; thread P-G).
> **Grammar (CF-45, v0.1):** `object_action`, snake_case, past tense; a category prefix is optional. A change to the grammar goes through P-G as a versioned amendment that keeps both series.

## The example test

- **Good:** `record_archived` — object, then what happened to it, past tense.
- **Bad:** `clickArchiveButton` — names the control instead of the outcome, wrong case, present tense.

## Events

| Event    | Trigger (client or server, and the exact moment) | Properties | Feeds (metric ID or guardrail) | Owner    | Status                      | Since             |
| -------- | ------------------------------------------------ | ---------- | ------------------------------ | -------- | --------------------------- | ----------------- |
| `[FILL]` | `[FILL]`                                         | `[FILL]`   | `[FILL]`                       | `[FILL]` | `[FILL: live / deprecated]` | `[FILL: version]` |

- **Exposure events** carry `$feature/<flag-key>` and fire when the variant actually renders (`docs/runbooks/variant-testing.md` §4).

## Property hygiene

Opaque IDs only. Never put a name, title, document or message content, or a filename in any event property. The analytics store must be safe to breach.

## Renames and retirements

An event is never renamed in place. Add the new name, mark the old one `deprecated` with the date and its replacement, and keep both series until every metric that reads it has moved (`definitions.template.md`, versioning).

## Changelog

- `[FILL: YYYY-MM-DD]`: `[FILL: added, deprecated or retired, with the reason]`.
