---
epic: USE
status: ratified
role: Mason
---

# Rabbit holes

Each one is patched in a sentence or declared out of bounds.

## Patched

1. **Drizzle and the old tables.** `drizzle-kit generate` writes a `DROP TABLE` for any table that has left the schema. So every old schema file stays where it is, and only app and API code moves to legacy.
2. **New enum values in `0012`.** A value added with `ALTER TYPE … ADD VALUE` cannot be used in the same transaction that adds it. The migration adds the values and writes no rows, so it needs no backfill.
3. **Legacy code that still compiles.** The legacy files sit outside `app/` and are excluded from tsconfig, ESLint and Vitest, so a broken import inside them breaks nothing. The boundaries rule keeps live code from importing them.
4. **The live code the legacy move leaves behind.** `root.ts`, the scheduler's job list and `lib/routes.ts` are cut down in the same commit, so `yarn verify` is green at the end of wave 0.
5. **The repeat rule.** A pure expander covers Google's presets and Custom… (interval, by-day, nth weekday of the month, until, count). The rule is stored as RFC 5545 text, so a library can replace the expander without a migration. EXDATE is not used: a skipped date is a `block_changes` row.
6. **DST.** Block times are wall-clock times in `users.timezone`, resolved per date with `packages/utils/src/day/boundaries.ts`.
7. **Fixtures that drift from the real data.** Every fixture is parsed by the same zod schema the router outputs. A fixture that stops parsing fails `yarn test`.
8. **One tick per screen.** `useWorkClock` drives every row from one interval, never one per row. Pausing while the tab is hidden stays in the app.
9. **Linear status position, token expiry, query budget, several workspaces.** Each is answered by `docs/research/platform-apis/linear-api.md` before the Linear tickets are cut. Until then, any statement about them here is [NOT VERIFIED]. The fill is recomputed on every sync and never stored.
10. **Google tokens.** Calendar gets its own OAuth with read-only calendar scope, never the sign-in's scopes. The consent screen is published "In production", because refresh tokens issued while it is in Testing expire after seven days ([Google](https://developers.google.com/health/setup)).
11. **iOS push.** Checked on 2026-10-13: Home Screen web apps get web push from iOS 16.4, and permission can only be asked for after a tap, never from a Safari tab ([WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)). The install sheet's states are the fallback.
12. **The edge swipe in standalone mode.** Still [NOT VERIFIED]. The reveal starts at least 24 px in from the left edge, and Taylor's phone checks it.
13. **This session or all.** A tier change across sessions runs in one transaction. Its consequence line uses the same fit function as Today.

## Out of bounds

- The whole-pipeline view (D-USE-104); a Linear status change ending a timer; Evening tasks and label colours; the finer points of breaks. These are the ledger's own deferrals.
- Linear webhooks; any write to Google; any hook into Claude Code (N6: firing is set by hand).
- Realtime (C3).
- Push for a Google event's start (D-USE-92).
