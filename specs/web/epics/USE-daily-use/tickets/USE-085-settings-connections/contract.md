---
id: "USE-85"
size: small
objective: "Settings opens from the avatar menu with Connections and sign out, and /settings/connections shows Google Calendar (the account, each calendar with its dot and switch, Add a Google account) and Linear (each workspace Connected with ··· › Disconnect, Add a workspace), plus nothing connected, loading, a failed connect, a failed list or save, and offline, all on sample data; Connect Linear elsewhere lands here; nothing is ever written to Google or Linear"
slice_type: "a settings page on fixtures; risks a write to Google or Linear, a failed save left looking saved, connect controls live offline, a spinner over the page, and the old Settings sections coming back"
non_negotiables:
  - "Nothing on Connections writes to Google or Linear (C-USE-settings-4)."
  - "A calendar switched off empties its dot and its events leave the day (C-USE-settings-connections-2)."
  - "A failed change reverts with \"Not saved. Try again.\" beside it, in ink; a failed connect says \"Not connected. Try again.\" under its Add row; neither in red (C-USE-settings-error-2, C-USE-settings-connecting-1)."
  - "Offline: connect and disconnect are disabled; switches save on the phone and sync on reconnect (C-USE-settings-offline-1)."
  - "Settings keeps only what USE draws: Connections, Profile and Install through the menu, sign out (calls.md's bend); no legacy section returns."
  - "Reads and writes through useConnections on fixtures; @syn/ui components and preset tokens only."
devs_call: "File split under settings/; the Settings list's rows (SettingsRow); the dot as the calendar's own colour or plum (plum, as drawn)."
cites:
  - "specs/web/epics/USE-daily-use/ux/account/settings/index.md"
  - "specs/web/epics/USE-daily-use/ux/account/settings/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/account/settings/states/connections.md"
  - "specs/web/epics/USE-daily-use/ux/account/settings/states/connecting.md"
  - "specs/web/epics/USE-daily-use/ux/account/settings/states/empty.md"
  - "specs/web/epics/USE-daily-use/ux/account/settings/states/loading.md"
  - "specs/web/epics/USE-daily-use/ux/account/settings/states/error.md"
  - "specs/web/epics/USE-daily-use/ux/account/settings/states/offline.md"
  - "C-USE-settings-1"
  - "C-USE-settings-2"
  - "C-USE-settings-4"
  - "C-USE-settings-5"
  - "C-USE-settings-6"
  - "C-USE-settings-connections-1"
  - "C-USE-settings-connections-2"
  - "C-USE-settings-connections-3"
  - "C-USE-settings-connecting-1"
  - "C-USE-settings-connecting-2"
  - "C-USE-settings-empty-1"
  - "C-USE-settings-loading-1"
  - "C-USE-settings-error-1"
  - "C-USE-settings-error-2"
  - "C-USE-settings-offline-1"
  - "D-USE-89"
  - "D-USE-90"
waiver: "Settings › Connections: the index holds the page and each of connections, connecting, empty, loading, error and offline its own criteria; one page."
truth_files: "none: promotion carries account/settings/"
qa: Q1
reviewers:
  - assay
focus:
  - "connections at 402 against connections-402, and empty, loading, error, connecting and offline (assay)"
operator_review: false
planned_paths:
  - "apps/web/app/(shell)/settings/"
  - "apps/web/components/account/"
  - "apps/web/lib/data/use-connections.ts"
  - "apps/web/lib/routes.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-085-settings-connections/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-10"
  - "USE-56"
  - "USE-83"
out_of_scope:
  - "OAuth, the connect redirects and the real disconnect: Linear connect (Q3) and Google Calendar (wave 3); here Add runs a fixture connect that a scenario lets succeed or fail"
  - "Clients on, the client sheet and the workspace sheet: USE-86"
criteria:
  - id: C1
    statement: "At 402 Connections with clients off shows \"‹ Settings\" and \"Connections\", Google Calendar with \"Personal account\", its line, each calendar's dot and switch and Add a Google account, then Linear with its line, each workspace's letter tile, name, \"Connected\" and ···, and Add a workspace"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-085-settings-connections/evidence/connections-402.png"
  - id: C2
    statement: "At 402 a calendar switched off shows its empty ring and muted name; ··· on a workspace offers Disconnect"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-085-settings-connections/evidence/switch-and-disconnect-402.png"
  - id: C3
    statement: "At 402: nothing connected shows each section's title, line and Add row only; loading shows skeleton rows in each section with no spinner; a failed list shows \"Calendars didn't load.\" with Try again in Google's section only; a failed connect shows \"Not connected. Try again.\" under its Add row; offline shows the StatusLine with connect and disconnect disabled"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-085-settings-connections/evidence/edges-402.png"
  - id: C4
    statement: "At 1440 Settings fills the main pane beside the rail with nothing current, and Connect Linear from the pool sheet lands on Connections"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-085-settings-connections/evidence/desk-1440.png"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — settings-connections

## Build notes

Wave 2, after the integration fixtures and the avatar menu. Match `ux/account/settings/captures/connections-402.png`; the other states are not drawn.

- **Decisions that apply:**
  - D-USE-89, D-USE-90: Settings is reached through the avatar; in this epic it is Connections only (Google calendars, Linear workspaces, clients). Calls.md's bend: Settings keeps Connections, Profile and Install (through the menu) and sign out; the other sections are legacy.
  - Layout: "‹ Settings" over "Connections"; Google Calendar: title, the account on the right, "Events answered yes sit on the day. Maybe or not answered show faintly, to add if wanted.", one 52 px row per calendar (a 10 px dot, plum `--color-category-plum-dot` filled when on, an empty `--color-input` ring with the name muted when off; the name; a `Switch`), "+ Add a Google account" (48 px), a rule; Linear: title, "Issues assigned to Taylor, to slot into work blocks.", per workspace a 24 px letter tile, the name, "Connected" muted and ··· (Disconnect), "+ Add a workspace". With clients off, the Clients title, "Group work by who it's for. Off by default." and its switch sit under Linear [ASSUMPTION] (USE-86 turns it on).
  - D-USE-116: Google asks only for the read-only calendar list and events (C-USE-settings-connecting-2 is the connect ticket's scope check; here the fixture connect states the scopes it would ask).
  - Undrawn lines [PROPOSED]: "Not connected. Try again."; "Calendars didn't load." with "Try again"; "Offline. Changes wait until the connection is back."
  - At 1024 and up Settings fills the main pane beside the rail, nothing current (C-USE-settings-6).
- **Interfaces:** `/settings` (the list: Connections, sign out) and `/settings/connections` pages; `ConnectionsPage` sections in `components/account/`; `settingsRoute()`, `connectionsRoute()`. `useConnections()` from USE-56 gains `connect(kind)` and `disconnect(id)` on fixtures.
- **Per path:** scenarios `settings-connections`, `settings-empty`, `settings-loading`, `settings-error`, `settings-connect-fails`, `settings-offline`.
- **Gotchas:** USE-1 moved the old `/settings`; this is a new segment, nothing reused from `_legacy/`.
- **Model:** Opus 5.5 at medium. A smaller model writes the calendar switch to Google, or brings back the old Settings sections.
