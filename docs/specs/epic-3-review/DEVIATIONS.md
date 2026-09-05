# Epic 3 — Review — Deviations (append-only)

One line per intentional divergence from a ticket, a UX document, or a convention. Never edit a ticket to match what shipped; append here. Format:

```
YYYY-MM-DD · <ticket-id> · <what changed> · <why>
```

2026-09-05 · track · All four tickets authored in one pass by Vesper, Mason, and Reeve, exceeding the spec-system guide's §7.4 ceiling · One resolver, one contract; the other tracks did the same.
2026-09-05 · track · The day's number is never stored (official §3.11), against Epic 3 DR-07's "the number is stored as computed (recomputed on any later edit)" · The official spec outranks the epic document; determinism gives DR-07 what it asked for without a cache that can go stale. See `TECHNICAL-DECISIONS.md`.
2026-09-05 · track · `misses` is one row per item, updated in place by a Day Review *Change*, rather than "a new Miss" as Epic 3 DR-05 says · SET-1 made `day_item_id` unique. The shift's own record (`shifts`) is untouched either way, which is the point of DR-05; `shift_id` stays on the row so *Changed from the shift's reason.* can be shown.
