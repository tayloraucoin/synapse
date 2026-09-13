# Phase 2 collection

**What this is:** everything Taylor has said "phase two" to. Phase two means *not now — too much overhead until the structure is in place*, not "less important." Each entry records what it is, why it waits, and what in v1.1 it depends on, so it can be picked up without re-deriving the reasoning.
**Rule:** an item lands here only when Taylor says so. Agents don't move things here on their own judgment.
**Sources:** the ledger, [`2026-09-11-taylor-ux-review-notes.md`](2026-09-11-taylor-ux-review-notes.md) · the Q&A, [`2026-09-11-vesper-questions-for-ux-v1.1.md`](2026-09-11-vesper-questions-for-ux-v1.1.md).

---

## Modules within the system

| # | Item | What it is | Why it waits | Depends on (v1.1) |
|---|---|---|---|---|
| P2-1 | **Sets and reps inside workouts** | A workout's sub-parts (warm-up, main, abs) with sets, reps, load; the training block becomes a programme, not just a time and a length. | A whole feature set on its own; only worth building once the training block exists and is placed reliably. | Training block kind, rotation, placement (Q18, Q24). |
| P2-2 | **Task selection for the day** | Deciding the actual tasks inside a work block — from Linear, ClickUp, or a native task list. | A module on its own; the work block in v1.1 is a container with a focus label, not a task list. | Work block as container (Q28, Q37); work focus (L3). |
| P2-3 | **Mid-week check-in / weekly progress** | "It's Thursday — how far through your counts are you, what's still mandatory this week, how do the stats look." Possibly a self-set check-in day and time. A cousin of the Week Review — same module, a similar one, or a connected one. | Needs weekly counts to exist and be trusted first; the conversation about targets vs caps happens here. | Informational weekly counts on routines, workouts, focuses (Q10). |
| P2-4 | **Monthly reflection** | A read view over journal entries by calendar month: gratitude lines, visualisations next to what happened, life-gratitude in sequence. | Weeks are the unit in the model; a month view is new construct and new surface. Leave anything already in place as is. | Journal entries (Q32), Week Review reflections region. |
| P2-5 | **Journal timer / "the app learns how long the evening takes"** | Silent timing of the journal; the plan's duration offered an update from observed medians ("you said 10 · usually 24"). | Too much complexity up front. | Timer sessions on wind-down items; the offer pattern (L8). |
| P2-6 | **Day parts (morning / afternoon / evening)** | The wake-relative time-of-day layer from v1 §6.4, re-added over blocks. There's neurochemical reasoning in it (what the brain is good for at which hour). | Easier to add once the block structure is visible; adding it now risks confusing two section systems. | Block sections on the List (Q27). |

## Integrations

| # | Item | Access model (checked 11 Sept 2026) | Lands in |
|---|---|---|---|
| P2-7 | **Google Calendar** (read-only) | Open; OAuth 2.0, sensitive-scope verification needed. | Weekday fixtures and one-offs in *activity* / *work*. Already specced in v1 §4.7. |
| P2-8 | **Linear** | Open, self-serve; GraphQL, OAuth 2.0. | P2-2 task selection. |
| P2-9 | **ClickUp** | Open, self-serve; REST, OAuth 2.0. | P2-2 task selection. |
| P2-10 | **Oura** | Open; OAuth-only (personal tokens deprecated Dec 2025); sandbox available. | Heart-rate against `timer_sessions`; sleep against `woke_at` / lights-out. |
| P2-11 | **Apple Health / Health Connect** | No web or server API; needs a native app. | The `apps/mobile` seam's first real job. Gate for P2-12 and P2-13. |
| P2-12 | **MacroFactor** | No official API; writes to Apple Health. | Through P2-11 only. |
| P2-13 | **MyFitnessPal** | Private partner API, programme closed; email with a company case. Writes to Apple Health. | Through P2-11, or partnership. Low priority. |

All integrations are read-only into Synapse. A `data_sources` seam on the profile is recorded in v1.1's model, not built.

## Content and register

| # | Item | Why it waits |
|---|---|---|
| P2-14 | **Quote bank** for the orient frame | Needs a content, licensing, and tone decision; the set-passage and own-words mediums come first. |
| P2-15 | **Messages keyed to the day** (a passage per work focus or mood) | A later layer over the orient block; needs focuses and the frame to exist. |
| P2-16 | **Other schedule archetypes** — the three greyed cards | Each gets built around a real person Taylor knows who fits it. Names to be written around people. |
| P2-17 | **Landing page rewrite** | Tracked in [`marketing-changelog.md`](marketing-changelog.md); executed when a UX version warrants it. |

## Research hypotheses (observe, don't build)

- Whether journal time differs by gender — read it from timer data (P2-5) if ever; never asked.
- Whether a work block "has long unattended stretches" (the Claude-run case) — observe placement choices per focus before modelling it.
- Whether *want* vs *priority* needs to be a second axis — revisit only if the single-axis pool produces mornings that feel wrong.
