---
size: small
objective: "Settings › Connections' clients, their order and their mappings to Linear workspaces and projects are Taylor's real rows, and every work row shows its resolved client"
slice_type: "small record writes plus a mapping table; risks client order written row by row and left half reordered, and a mapping that names another user's connection"
non_negotiables:
  - "Every query runs inside ctx.rls.execute(); reordering writes every sort_order in one transaction."
  - "Archive sets archived_at; a client is never deleted while an item names it."
  - "Clients are never written to Linear (data contract)."
  - "Resolution stays the pure function (item, then project, then workspace); the server stores, never resolves."
  - "Every input is a @syn/validators schema; workspaceClientInput and clientArchivedInput move into @syn/validators."
devs_call: "Router name (client); whether setClientOrder takes the whole order or a move."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/settings/states/clients-on.md"
  - "C-USE-settings-clients-on-1"
  - "D-USE-42"
truth_files: "none: behaviour is the ledger's; only the data source changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/clients/"
  - "packages/api/src/routers/client.ts"
  - "packages/api/src/root.ts"
  - "packages/validators/src/work.ts"
  - "packages/validators/src/linear.ts"
  - "apps/web/lib/fixtures/integrations/"
  - "apps/web/lib/data/live/"
depends_on:
  - "USE-100"
out_of_scope:
  - "Uploaded client logos: their own ticket (calls.md)"
criteria:
  - id: C1
    statement: "writeClient creates and edits a client; writeClientArchived archives and restores; writeClientsEnabled sets users.clients_enabled; each as the fixture does"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "setClientOrder writes every client's sort_order in one transaction, and a refusal leaves the old order"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "writeWorkspaceClient sets a connection's client or per_project; writeProjectClient upserts a (connection, project) mapping; a connection the caller does not own is refused"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-104
---

# Contract — clients

## Build notes

The fixture's `writeClient`, `writeClientArchived`, `writeClientsEnabled`, `writeWorkspaceClient`, `writeProjectClient` and the `WorkServer`'s `setClientOrder`.

- **Decisions that apply:**
  - D-USE-42: Taylor's drag order is also client priority.
  - Data contract: `clients` holds `name`, `color_key`, `sort_order` and `archived_at`; `users.clients_enabled` defaults to false. One pure function resolves an item's client: its own, then its project's, then its workspace's.
- **Tables:** `clients`; `users.clients_enabled`; `linear_connections.client_id` and `per_project`; `linear_project_clients` (0016, USE-100).
- **Approach:** `services/clients/` as plans plus apply. The connection is read through rls before its mapping is written, so another user's connection is invisible and the write is refused. Move `workspaceClientInput` and `clientArchivedInput` from `lib/fixtures/integrations/` into `@syn/validators`. `clientInput`, `clientOrderInput`, `clientsEnabledInput` and `linearProjectClientInput` exist.
- **Per path:** `services/clients/clients.test.ts` holds C1 to C3.
- **Model:** Opus 5.5 at medium.
