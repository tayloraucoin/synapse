# Epic 5 — The first run rebuilt (UX v1.2) — Deviations (append-only)

One line per intentional divergence from a spec, the UX document, or the handoff. House format, exactly: `YYYY-MM-DD · <ticket-id> · <what changed> · <why>`. Never rewrite history.

2026-09-16 · authoring · All fifteen tickets were authored in one thread, over the guide's §7.4 ceiling of three · One data model (TD-10…TD-20) — tickets written apart would disagree about it; the same reason Epic 4's batches 1 and 2 gave.
2026-09-16 · authoring · `quotes` ships under the existing `catalogReadPolicies` rather than a new policy kind the handoff's §3.4 anticipated · The factory already existed on disk; the only new door is the admin write path, which is RUN-14 and provisional (TD-13).
2026-09-16 · authoring · Versions are not materialised as `alternates_group` rows despite v1.2 §3.5's "no new mechanic" · Vesper meant the grammar; the rows would triple the day's item count for a duration choice (TD-11). The UI keeps the *one of* tabs.
