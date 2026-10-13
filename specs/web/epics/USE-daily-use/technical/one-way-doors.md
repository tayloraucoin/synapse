---
epic: USE
status: ratified
role: Mason
---

# One-way doors

Each door below is matched against a reviewer row in `toolkit.json`. At C7's Q3 level, Mason and Warden read the migration ticket and the Linear connect ticket in full. Every other door path below is in a Q1 ticket: Mason samples it, and Taylor merges.

| Door                                                                                                                             | Path glob                                                                | Ratification                                         | Reviewer      |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------- | ------------- |
| The fresh schema: planner, work and integration tables, `users.clients_enabled`, the new enum values                             | `packages/db/src/schema/**`                                              | C2, C10, 2026-10-13; Q3 (C7)                         | mason, warden |
| Migration `0012_use_daily`, additions only, run by Taylor on staging                                                             | `packages/db/migrations/**`, `**/*.sql`                                  | C10, 2026-10-13; Q3 (C7)                             | mason         |
| An append-only policy shape (`slot_events`), new to the repo                                                                     | `packages/db/src/schema/rls/**`                                          | C7, 2026-10-13; recorded by a ledger line when built | mason, warden |
| Integration tokens at rest, and their key                                                                                        | `packages/api/src/services/{linear,google}/token-crypto.ts`, `**/env.ts` | C5, 2026-10-13; Q3 for Linear (C7)                   | warden, mason |
| Public API: OAuth start and callback for Linear and Google                                                                       | `apps/web/app/api/integrations/**`                                       | C6, 2026-10-13; the routes follow the research files | mason, warden |
| The boundary graph: a rule that stops any live file importing from `_legacy/`                                                    | `packages/config/eslint/boundaries.js`                                   | Ratified with the legacy move, 2026-10-13            | mason         |
| Package exports: the subpaths `@syn/api` loses to `_legacy/`, and the ones `@syn/utils`, `@syn/validators` and `@syn/hooks` gain | `packages/*/package.json`                                                | Ratified with the legacy move, 2026-10-13            | mason         |
| The cron cadence                                                                                                                 | `apps/web/vercel.json`                                                   | C12, 2026-10-13                                      | mason         |
| The service worker gains an app-shell cache                                                                                      | `apps/web/public/sw.js`                                                  | C4, 2026-10-13                                       | mason         |

**Not touched:**

- `**/auth/**` and `**/proxy.ts`: connecting an integration is not signing in.
- `**/rls.ts`
- any Realtime publication (C3)
- `apps/mobile/`
- every old table and every applied migration
