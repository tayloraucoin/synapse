---
size: medium
objective: "Taylor connects one or more Linear workspaces from Settings › Connections through OAuth, and disconnects them, with each workspace's tokens stored encrypted and never reaching a browser; migration 0016 adds every integration table"
slice_type: "a schema migration, integration tokens at rest and a public OAuth route; risks a token in a router output or a browser bundle, a table without owner-private RLS, a forged OAuth callback, and a refresh token lost to rotation"
non_negotiables:
  - "0016 makes only additions, follows 0015, and is run by Taylor on staging after review (C10); no agent runs it."
  - "Every new table is owner-private and deny-by-default through ownerPrivateCrudPolicies, reached only through ctx.rls.execute()."
  - "Tokens are stored AES-256-GCM encrypted with a key read only through the API's env.ts; only services/linear and services/google import token-crypto, and they name each token column they select."
  - "No procedure's output schema has a token field; nothing NEXT_PUBLIC_ holds a secret."
  - "The callback refuses a missing or mismatched state and a missing PKCE verifier; the verifier and state live in an httpOnly, Secure, SameSite=Lax cookie for ten minutes."
  - "OAuth only (D-USE-114): no API-key path exists."
  - "A refreshed token pair is stored in one write, single-flight per connection, because Linear rotates the refresh token."
devs_call: "The cookie's name and encoding; the crypto's IV and envelope layout (12-byte IV, version byte); service split under services/linear/."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/settings/states/connecting.md"
  - "C-USE-settings-connecting-1"
truth_files: "none: behaviour is the ledger's; the connect flow's states are already drawn and built on fixtures (USE-85)"
qa: Q3
reviewers:
  - mason
  - warden
focus:
  - "token-crypto and every path a token travels: env key, ciphertext columns, the services that select them, router outputs (warden, Q3)"
  - "0016's SQL and RLS: additions only, owner-private on every table, linear_writes' enums including D-USE-113's kinds (mason, Q3)"
  - "the OAuth start and callback routes: state, PKCE, redirect URI, error paths (warden, Q3)"
operator_review: false
planned_paths:
  - "packages/db/src/schema/integrations/"
  - "packages/db/src/schema/enums.ts"
  - "packages/db/src/schema/index.ts"
  - "packages/db/migrations/0016_use_integrations.sql"
  - "packages/db/migrations/meta/"
  - "packages/db/migrations/migrations.lock.json"
  - "packages/db/src/schema/rls/"
  - "packages/db/SCHEMA_REFERENCE.md"
  - "packages/api/src/services/linear/"
  - "packages/api/src/services/integrations/token-crypto.ts"
  - "packages/api/src/env.ts"
  - "packages/api/src/routers/linear.ts"
  - "packages/api/src/routers/connections.ts"
  - "packages/api/src/root.ts"
  - "packages/validators/src/linear.ts"
  - "packages/config/eslint/boundaries.js"
  - "apps/web/app/api/integrations/linear/"
  - "apps/web/env.ts"
  - "apps/web/lib/data/live/"
  - ".env.example"
depends_on:
  - "USE-90"
  - "USE-87"
  - "MIG-17"
out_of_scope:
  - "Sync, the snapshot's contents and placing issues: USE-101"
  - "The outbox's sender: USE-102 (this ticket creates its table)"
  - "Google's OAuth and reads: USE-103 (this ticket creates its tables and the shared crypto)"
  - "Linear webhooks: out of bounds (rabbit holes)"
criteria:
  - id: C1
    statement: "0016 creates linear_connections, linear_snapshots, linear_project_clients, linear_writes, google_accounts, google_calendars and google_event_snapshots, adds work_items' foreign key to linear_connections, and makes only additions"
    evidence: test
    command: "yarn test:migrations"
  - id: C2
    statement: "Every table under packages/db/src/schema/integrations/ carries the owner-private policy factory"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "token-crypto round-trips a token, refuses a tampered ciphertext or a wrong key, and never returns plaintext from a failed decrypt"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "No linear, google or connections procedure's output schema has a field whose name holds token, secret or refresh"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "A file outside services/linear and services/google importing token-crypto fails lint:boundaries"
    evidence: check
    command: "yarn lint:boundaries"
  - id: C6
    statement: "The callback with a state that does not match its cookie, or with no verifier, redirects to Connections with the connecting error state and stores nothing"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "A refresh stores the new access and refresh token together, and two refreshes at once for one connection make one call to Linear"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "Taylor connects two Linear workspaces, each shows in Connections with its name and logo or letter tile, and Disconnect revokes and removes one"
    evidence: manual
    reason: "needs the Linear OAuth app, the key in Vercel and 0016 applied on staging, all Taylor's; recorded as an operator check"
  - id: C10
    statement: "The migration lock and journal list 0016 after 0015"
    evidence: check
    command: "yarn check-migrations"
  - id: C9
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
  - id: review:mason
    statement: "Mason reviews this ticket in fresh context against its contract and evidence."
    evidence: manual
    reason: "a reviewer's judgment, recorded only by yarn review:run mason <id>"
  - id: review:warden
    statement: "Warden reviews this ticket in fresh context against its contract and evidence."
    evidence: manual
    reason: "a reviewer's judgment, recorded only by yarn review:run warden <id>"
id: USE-100
---

# Contract — linear-connect

## Build notes

C7's second Q3 ticket. 0016 follows 0015 (USE-87).

- **0016 tables** (data contract, with the Tickets-gate additions):
  - `linear_connections`, one per workspace: `organization_id` (unique per user), `name`, `url_key`, `logo_url`, `access_token_ct` and `refresh_token_ct` (bytea), `token_expires_at`, `scopes`, `client_id`, `per_project`, `last_synced_at`, `last_sync_error`.
  - `linear_snapshots` (`connection_id`, `fetched_at`, `payload jsonb`); `linear_project_clients` (`(connection_id, project_id)` unique, `client_id`).
  - `linear_writes`: `work_item_id`, `connection_id`, `issue_id`, `kind`, `payload jsonb`, `state`, `attempts`, `last_error`, `sent_at`. `kind` is `linear_write_kind`: `status`, `done`, `reopen`, `priority`, `description`, `estimate` (D-USE-113). `state` is `linear_write_state`: `pending`, `sent`, `failed`.
  - `google_accounts`: `label`, `refresh_token_ct`, `token_expires_at`, `refresh_token_expires_at`, `last_synced_at`, `last_sync_error`.
  - `google_calendars`: `account_id`, `calendar_id`, `name`, `color`, `primary`, `access_role`, `enabled`.
  - `google_event_snapshots`: `account_id`, `week_start`, `fetched_at`, `payload jsonb`, unique per account and week.
  - `work_items.linear_connection_id` gains its FK (`on delete set null`).
- **Token crypto** (C5): `services/integrations/token-crypto.ts` uses Node `crypto` AES-256-GCM. The envelope is version byte, 12-byte IV, ciphertext and 16-byte tag. The key is `INTEGRATION_TOKEN_KEY` (32 bytes, base64), read through `packages/api/src/env.ts` (MIG-17's seam). Taylor sets it in Vercel; add it to `.env.example` without a value.
- **Linear OAuth** (copied from the platform research, checked 2026-10-13):
  - **App:** one OAuth2 application, `distribution: public`, so other workspaces can authorize it. Taylor creates it under Linear Settings › Administration › API. Its `client_name` must not contain "Linear". [NOT VERIFIED] whether a public app needs a listing.
  - **Authorize:** `GET https://linear.app/oauth/authorize` with `client_id`, `redirect_uri`, `response_type=code`, `scope=read,write` (comma-separated), `state`, `actor=user`, `code_challenge` with `code_challenge_method=S256`, and `prompt=consent` on every connect, so "+ Add a workspace" shows the consent screen again.
  - **Exchange:** `POST https://api.linear.app/oauth/token`, form-encoded: `code`, `redirect_uri`, `client_id`, `code_verifier`, `grant_type=authorization_code`. It returns `{ access_token, token_type: "Bearer", expires_in: 86399, scope, refresh_token }`.
  - **Refresh:** `POST` the same URL with `grant_type=refresh_token`, `refresh_token`, `client_id`. It returns a new pair, and the old refresh token stops working. Store both atomically and single-flight per connection. A lost response can be replayed within 30 minutes. Refresh-token lifetime: [NOT VERIFIED]. Refresh when `token_expires_at` has passed or on a 401; on a failed refresh, set `last_sync_error` (the Reconnect state).
  - **Revoke:** `POST https://api.linear.app/oauth/revoke` with `token`; a 400 (already revoked) counts as done.
  - **Identify the workspace:** `viewer { organization { id name urlKey logoUrl } }` [NOT VERIFIED; confirm live]. A Linear-hosted logo may need auth; fall back to the letter tile (calls.md).
- **Routes:**
  - `apps/web/app/api/integrations/linear/start/route.ts`: signed-in only; sets the cookie (`state`, `verifier`, `return`), then redirects.
  - `callback/route.ts`: checks the cookie, exchanges, reads the org, upserts the connection (`services/linear/connect.ts`, inside rls), clears the cookie, redirects to `/settings/connections`; errors land on USE-85's connecting error state.
- **Procedures:** `connections.list` (`readConnections`: connections without tokens, Google accounts, clients, `clients_enabled`) and `linear.disconnect` (revoke, then delete the row; snapshots, mappings and outbox cascade).
- **Per path:** tests `token-crypto` (C3), `rls-integrations` (C2, beside USE-2's), `outputs` (C4), `callback` (C6, stubbed fetch), `refresh` (C7). The boundaries rule's message says the fix.
- **Gotchas:**
  - Read the generated SQL: a table missing from the schema makes drizzle-kit write a DROP (rabbit hole 1).
- **Model:** Opus 5.5 at medium. A smaller model returns the connection row whole and ships its token to the browser.
