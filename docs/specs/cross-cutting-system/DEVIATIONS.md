# Cross-cutting — Deviations (append-only)

One line per intentional divergence from a ticket, a UX document, or a convention. Never edit a ticket to match what shipped; append here. Format:

```
YYYY-MM-DD · <ticket-id> · <what changed> · <why>
```

2026-09-05 · track · All five tickets authored in one pass by Vesper, Mason, and Reeve, exceeding the spec-system guide's §7.4 ceiling · The shell frames every epic's screens; tickets written apart would have disagreed about the header and the status line. The other tracks did the same.
2026-09-05 · track · The `permission` status-line variant (v2 handoff §5.10's `PermissionLine`) is never rendered in the shell · Cross-cutting §12 lists nine status-line variants and permission is not one; official §8.3 puts the fallback ask on ST-07 alone. The component stays exported; nothing wires it.
2026-09-05 · track · The shell arrives with SYS-1, not "Epic 2's first ticket" as `apps/web/app/(shell)/layout.tsx`'s doc block says · The shell is the cross-cutting document's §1–§3, not the List's; Epic 1's library screens need it before the List exists. SYS-1 updates the doc block.
2026-09-05 · track · Two legal pages (`/legal/privacy`, `/legal/terms`) are added to the route map by SYS-3 · Cross-cutting SY-01 links to them ("each a short static page"); §4.1 does not list them because their copy is `[OPEN]`. The pages exist with the trust line and a pending marker until Taylor writes the copy.
