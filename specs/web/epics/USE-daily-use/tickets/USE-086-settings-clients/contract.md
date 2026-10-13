---
id: "USE-86"
size: small
objective: "Turning Clients on in Settings › Connections shows the client list in Taylor's order with grips (the same order the pool uses), Add a client and the Personal line, and switches each workspace row to its mapping line; a client row opens the client sheet (tile, Name, six colours, what it covers in Linear, Save, Remove client), and a workspace row opens its sheet (One client or Set per project, each project with its client, Disconnect), on sample data, never writing to Linear"
slice_type: "clients and their mappings on fixtures; risks a second client order, a mapping or a client written to Linear, a removed client's work lost instead of moved to Personal, a reserved colour offered, and an unmapped project given the workspace's client"
non_negotiables:
  - "One client order: the grip here and the pool's client heads write the same order; the pool and the client filter follow it (C-USE-settings-clients-on-2, D-USE-96)."
  - "Nothing here writes to Linear: not a client, a mapping or an order (C-USE-settings-clients-on-3, C-USE-settings-workspace-per-project-2)."
  - "Remove client moves its work under Personal and leaves Linear unchanged (C-USE-settings-client-sheet-2)."
  - "Six colours only (rose, leaf, amber, moss, slate, ink); sky, plum and clay stay with Work, events and firing (D-USE-95)."
  - "A per-project workspace's unmapped project has no client (USE-9's resolveClient); the work regroups at once."
  - "Reads and writes through useClients and useConnections; @syn/ui components and preset tokens; the tile carries its letter."
devs_call: "The grip reorder (dnd-kit sortable, as the pool's); the client sheet's Save versus save-as-made (Save, as drawn); Remove's Undo (the house Toaster)."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/settings/states/clients-on.md"
  - "specs/web/epics/USE-daily-use/ux/account/settings/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/account/settings/states/client-sheet.md"
  - "specs/web/epics/USE-daily-use/ux/account/settings/states/workspace-per-project.md"
  - "C-USE-settings-3"
  - "C-USE-settings-clients-on-1"
  - "C-USE-settings-clients-on-2"
  - "C-USE-settings-clients-on-3"
  - "C-USE-settings-client-sheet-1"
  - "C-USE-settings-client-sheet-2"
  - "C-USE-settings-workspace-per-project-1"
  - "C-USE-settings-workspace-per-project-2"
  - "D-USE-91"
  - "D-USE-95"
  - "D-USE-96"
waiver: "Clients on, with the client sheet and the workspace sheet they open: one switch's consequences in Settings."
truth_files: "none: promotion carries account/settings/"
qa: Q1
reviewers:
  - assay
focus:
  - "clients on, the client sheet and the workspace sheet at 402 against their captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/settings/"
  - "apps/web/components/account/"
  - "apps/web/lib/data/use-clients.ts"
  - "apps/web/lib/data/clients-settings.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-086-settings-clients/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-9"
  - "USE-10"
  - "USE-55"
  - "USE-56"
  - "USE-85"
out_of_scope:
  - "Upload a logo (D-USE-42): the uploaded-logos ticket (calls.md); until it lands the row shows the tile and its line with no upload control"
  - "Setting a project's emoji here: nothing stores it yet; the Linear wiring"
  - "The pool's client heads: USE-74, writing the same order"
criteria:
  - id: C1
    statement: "Through the fixtures, removing Kestrel Health leaves its work items with no client (under Personal) and writes no outbox row; mapping Patient portal to Kestrel regroups its work under Kestrel; an order set here is the order readPool groups by"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 clients on shows the Clients switch on, \"In this order in the pool. Hold the grip to reorder.\", each client with grip, tile, name and what it covers, Add a client and \"Work with no client shows under Personal.\"; workspace rows show their mapping line (\"All projects belong to Alder Studio\", \"Set per project · 3 projects for clients\") and a chevron"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-086-settings-clients/evidence/clients-on-402.png"
  - id: C3
    statement: "At 402 the client sheet shows \"Client\" and ×, the K tile with \"Upload a logo\" and \"Or the letter and colour, as here\", Name, the six colours with rose picked, \"Sky, plum and clay stay with Work, events and firing.\", Linear \"Lighthouse: Patient portal, Records import\", Save and \"Remove client · its work moves to Personal\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-086-settings-clients/evidence/client-sheet-402.png"
  - id: C4
    statement: "At 402 the workspace sheet shows \"Lighthouse\", \"Linear workspace · connected · synced 2 min ago\", Whose work is it with Set per project picked, each project with its emoji and client select, the line about emoji and Linear, and \"Disconnect Lighthouse\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-086-settings-clients/evidence/workspace-per-project-402.png"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — settings-clients

## Build notes

Wave 2, after Connections. Match `ux/account/settings/captures/clients-on-402.png`, `client-sheet-402.png` and `workspace-per-project-402.png`.

- **Decisions that apply:**
  - D-USE-91: with clients off a workspace row reads "Connected" with ···; on, its mapping line and a chevron opening the workspace sheet.
  - D-USE-96: one order, set by the grip here or a client head in the pool; it groups the pool, breaks Sort's ties and orders the client filter. No separate priority field.
  - D-USE-95: client colours rose, leaf, amber, moss, slate, ink.
  - Words: "Clients", "Group work by who it's for. Off by default.", "In this order in the pool. Hold the grip to reorder.", "<n> projects" or "a workspace", "Add a client", "Work with no client shows under Personal."; mapping lines "All projects belong to <client>", "Set per project · <n> projects for clients" (a count of projects in Settings, not of the day); the client sheet's and the workspace sheet's words as drawn.
  - The two text buttons in `--color-destructive-text` (Remove client, Disconnect) are the drawn exception; nothing else is red.
  - At 1024 and up both sheets are the right panel (C-USE-settings-6).
- **Interfaces:** `ClientsSection`, `ClientSheet`, `WorkspaceSheet` in `components/account/`; `useClients()` gains `add`, `update`, `remove`, `setOrder` (the same write as USE-55's `setClientOrder`); `useConnections()` gains `setMapping`, `setPerProject`.
- **Per path:** `clients-settings.test.ts` holds C1. Scenarios `settings-clients-on`, `settings-client-sheet`, `settings-workspace-sheet`.
- **Model:** Opus 5.5 at medium. A smaller model keeps a second order, writes a mapping to Linear, or deletes a removed client's work.
