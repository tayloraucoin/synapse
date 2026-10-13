---
id: "USE-74"
size: small
objective: "The desk's pool panel (360, docked on the Week) shows Pool and Linear tabs, Group and Sort, Search across both tabs, clients in Taylor's order with grips to reorder and a collapse each, team and project lines, rows v3 (emoji, title, priority glyph, ID, size, labels, due badge; placed rows faded with their days; Spread… on a big item), + New item in the pool, the sync line with Sync now, the empty pool, and the Linear tab of issues not in the pool; on fixtures"
slice_type: "a grouped, sortable list panel; risks a client order kept apart from Settings', Sort ignoring client order on ties, the Linear tab shown when not connected, a placed item dropped from the pool, and colour alone carrying priority"
non_negotiables:
  - "One client order: dragging a client head writes the same order Settings › Clients reads, and Sort breaks ties by it (C-USE-week-6, D-USE-96)."
  - "Placed items stay in the pool, faded, naming their sessions' days (pool-rows.md)."
  - "With Linear not connected there is no Linear tab and no sync line at the desk (D-USE-101)."
  - "Priority glyphs carry shape and colour together; the client tile carries its letter; colour never alone (D-USE-42)."
  - "Search and Sort run on the device; New item waits in the pool and is never created in Linear (D-USE-57)."
  - "Reads through usePool, useLinear and useClients; @syn/ui components and preset tokens only (canon §2)."
devs_call: "File split under components/work/pool/; the collapse's memory (remembered toggle); the reorder's dnd-kit sortable; Group by Workspace and Project's line forms."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/week/pool-panel.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/states/linear-tab.md"
  - "specs/web/epics/USE-daily-use/ux/work/week/states/pool-empty.md"
  - "C-USE-week-6"
  - "C-USE-week-linear-tab-1"
  - "C-USE-week-pool-empty-1"
  - "D-USE-41"
  - "D-USE-42"
  - "D-USE-95"
  - "D-USE-96"
  - "D-USE-98"
  - "D-USE-101"
  - "D-USE-112"
waiver: "The pool panel, with its Linear tab and empty states and the Week's client-order criterion: one panel."
truth_files: "none: promotion carries work/week/"
qa: Q1
reviewers:
  - assay
focus:
  - "the pool panel on the Pool and Linear tabs at 1728 against priority-lens-1728's panel, and the empty pool (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/work/pool/"
  - "apps/web/app/(shell)/week/_components/"
  - "apps/web/lib/data/use-pool-view.ts"
  - "apps/web/lib/data/pool-view.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-074-pool-panel/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-9"
  - "USE-10"
  - "USE-55"
  - "USE-56"
  - "USE-72"
out_of_scope:
  - "Dragging a row onto the week: USE-75; Spread's dialog: USE-77"
  - "+ New item's form: USE-51's NewTaskSheet with from: \"pool\"; this ticket opens it"
  - "The phone's pool sheet: USE-79"
criteria:
  - id: C1
    statement: "poolView groups by client in client order, then team and project lines; Sort Due date orders by due date, then priority, then client order; a search for \"audit\" matches titles and IDs across both tabs and says where each lives"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 1728 the panel shows Pool selected and Linear, Group: Client and Sort: Due date, Search the pool, \"Clients in your order. Drag a client to reorder.\", Kestrel Health, Alder Studio and Personal with grips, tiles and chevrons, their team and project lines, the drawn rows (due soon, due today, plain, placed \"on Mon, Tue, Wed\", big with Spread…, \"No Linear\"), + New item in the pool, and \"Linear synced 2 min ago\" with Sync now"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-074-pool-panel/evidence/pool-panel-1728.png"
  - id: C3
    statement: "At 1728 the Linear tab shows issues not in the pool grouped by client then team and project, each with its status shape and word, ID, size and due badge, Assigned to Taylor and Not done on, placed ones faded with their days, and the sync line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-074-pool-panel/evidence/linear-tab-1728.png"
  - id: C4
    statement: "At 1728 the empty pool shows \"Nothing in the pool. Bring work in from Linear, or add an item.\" at the top of the list, not centred, with From Linear and + New item in the pool, and no count"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-074-pool-panel/evidence/pool-empty-1728.png"
  - id: C5
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C6
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — pool-panel

## Build notes

Wave 2, after USE-72. The same panel docks on the Week, beside the Block panel (USE-76) and on Today's nothing planned (USE-82). Match the panel in `ux/work/week/captures/priority-lens-1728.png`; rows in `pool-rows.md`.

- **Decisions that apply:**
  - Frame: 360 × full height, `--color-surface`, a 1 px `--color-border` right edge, 24 px top and bottom, 20 px sides, 14 px between regions; rows list-like, not cards (D-USE-42).
  - D-USE-41: Pool first, Linear second (only when connected); Group (Client, Workspace, Project) and Sort (Due date, Priority, Updated); background sync and Sync now. D-USE-98: Sort's default is Due date, then Priority, then client order. D-USE-112: no Size filter at the desk.
  - D-USE-42: client heads (6-dot grip, 20 px tile with its letter, name, collapse chevron); team and project lines ("💻 Product Engineering · 🏥 Patient portal"; one company with two teams is one client with two lines; "In Taylor's workspace · 🎨 Brand site"). D-USE-95: client colours rose, leaf, amber, moss, slate, ink. With clients off there are no client heads [ASSUMPTION: grouped by workspace].
  - Rows: the emoji in an 18 px slot with an 8 px gap; title; meta (priority glyph, ID, size chip "5 Large", label chips with a 6 px dot in Linear's colour); due badge top right ("Due Wed" warning, "Due today" danger, a bend named in D-USE-41, D-USE-42); placed at 60 % with "ALD-17 · 3 Medium · on Mon, Tue, Wed"; big "8 Huge · 20 h" with Spread… (semibold, underlined); "No Linear"; "unsized". Priority glyphs: Urgent a red square with "!", High three yellow bars, Normal two of three blue bars, Low one grey bar [ASSUMPTION], none no glyph.
  - Linear tab [ASSUMPTION, from the phone]: status shape, emoji, title, ID, status word, size, due badge; Assigned to Taylor and Not done on; placed issues faded with where.
  - Pool empty [PROPOSED words]: "Nothing in the pool. Bring work in from Linear, or add an item."; From Linear (hidden when not connected).
  - Words: "Clients in your order. Drag a client to reorder."; "+ New item in the pool"; "Linear synced 2 min ago"; "Sync now"; "Search the pool"; "Group: Client"; "Sort: Due date".
- **Interfaces:** `PoolPanel { mode: "week" | "today" | "beside-panel" }`, `PoolRow`, `ClientHead`, `PriorityGlyph` (or `@syn/ui`'s `PriorityMark`) in `components/work/pool/`; `usePoolView({ group; sort; query; tab })` with pure `poolView` (tested).
- **Per path:** `pool-view.test.ts` holds C1. Scenarios `pool`, `pool-linear-tab`, `pool-empty`, `pool-linear-off`.
- **Gotchas:** a row's click opens the Item sheet's right panel (`itemSheetRoute`); drag lifts it (USE-75).
- **Model:** Opus 5.5 at medium. A smaller model keeps a second client order, or drops placed items from the pool.
