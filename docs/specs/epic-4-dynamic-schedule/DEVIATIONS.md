# Epic 4 — Dynamic schedule (UX v1.1) — Deviations (append-only)

One line per intentional divergence from a ticket, a UX document, or a convention. Never edit a ticket to match what shipped; append here. Format:

```
YYYY-MM-DD · <ticket-id> · <what changed> · <why>
```

2026-09-12 · track · DYN-1…DYN-6 authored in one pass by Reeve and Mason, exceeding the spec-system guide's §7.4 ceiling of three per thread · One data model (v1.1 §11); the types, the two migrations, and the three services over them written apart would have disagreed about column names and the trigger's transition. Epics 1–3 did the same. DYN-7…DYN-21 are a dense handoff (`01-authoring-handoff-remaining-tickets.md`), to be expanded three per thread.
2026-09-12 · track · Ticket prefix is `DYN-` and the folder is `epic-4-dynamic-schedule/`, though v1.1 is an iteration version over Epics 1–3 rather than a fourth epic of the official spec · The work cuts across all three epics' surfaces; one track with one build order is the only shape under which its dependency graph can be checked. The global build order in `../README.md` gains a fifth row.
2026-09-12 · track · v1.1 §11.2 lists `data_sources` as "not added"; no column, table, or type is reserved for it · Seams are recorded, not scaffolded (root `AGENTS.md`). The note in v1.1 is the record.
