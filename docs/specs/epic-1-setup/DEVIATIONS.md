# Epic 1 — Setup — Deviations (append-only)

One line per intentional divergence from a ticket, a UX document, or a convention. Never edit a ticket to match what shipped; append here. Format:

```
YYYY-MM-DD · <ticket-id> · <what changed> · <why>
```

2026-09-05 · track · All ten tickets authored in one pass by Vesper, Mason, and Reeve, exceeding the spec-system guide's §7.4 ceiling of three per thread · The four UX documents share one data model (official spec §3); tickets written in separate threads would have disagreed about it. The infrastructure track did the same.
2026-09-05 · track · `week_plans` (official spec §3.6) is not created as a table; week status is derived from the week's `days` rows · A table whose only column is a derivable status is a second home for one fact. See `TECHNICAL-DECISIONS.md`.
2026-09-05 · track · `habits.is_wake_anchor` (official spec §3.3) is not a column; `users.wake_anchor_habit_id` (already on the shadow row) is the one home and `HabitSummaryView.isWakeAnchor` is derived · Two columns for one fact ("at most one per user") is a uniqueness rule enforced twice. See `TECHNICAL-DECISIONS.md`.
2026-09-05 · track · `shifts.cut_item_ids[]` (official spec §3.9) is not an array column; a cut item is a `day_items` row with `assignment_state = cut_by_shift` and a `misses` row whose `shift_id` points at the shift · Normalised, so the Day Review's *Change* on a cut item edits one row and the shift's own record stays untouched (Epic 3 DR-05).
