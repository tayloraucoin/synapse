# Epic 2 — In Use — Deviations (append-only)

One line per intentional divergence from a ticket, a UX document, or a convention. Never edit a ticket to match what shipped; append here. Format:

```
YYYY-MM-DD · <ticket-id> · <what changed> · <why>
```

2026-09-05 · track · All eight tickets authored in one pass by Vesper, Mason, and Reeve, exceeding the spec-system guide's §7.4 ceiling · One day model, one row contract; tickets written apart would have disagreed about `ItemState`. The infrastructure and Epic 1 tracks did the same.
2026-09-05 · track · Pause/resume (official §12 Phase 2) ships in USE-4 and quantity/reflection capture (Phase 2) ships in USE-3 · `TimerControl`, `NumberUnitInput`, and `ReflectionBlock` are built; an item sheet with their regions removed is a stub that gets rewritten. They are cheap here and expensive as a second pass. Shift (USE-6) and trim (USE-7) stay Phase 2 because they are whole mechanisms, not regions.
2026-09-05 · track · The Schedule tab (USE-5) is launch-blocking, against official §12's Phase-2 placement · `apps/web/AGENTS.md` puts "the two execution tabs" in Phase-1 scope and every Schedule composite is built; only its Phase-2 refinements (drag, zoom) stay out.
2026-09-05 · track · `deferred_today` (Epic 2 IT-01) is the `day_items.deferred_at` timestamp SET-1 created, not a boolean · A timestamp says when; a boolean says only that. Same information, one more fact.
