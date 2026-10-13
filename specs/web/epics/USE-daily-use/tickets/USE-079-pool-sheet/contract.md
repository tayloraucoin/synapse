---
id: "USE-79"
size: small
objective: "On the phone, Pool opens the pool sheet over the day: Pool and From Linear tabs (Connect Linear when not connected), filters (All clients, Size, Due date), search growing the sheet to full height across both tabs, the list grouped by client in Taylor's order with team and project lines and Place on each row, a tap on a row opening its Item sheet, the client filter sheet, clients off, the empty pool, and From Linear's issues with Assigned to Taylor, Not done and Sync now, on fixtures"
slice_type: "a filtered, grouped list sheet; risks the client filter narrowing the days, a second client order, a Place that writes to Linear, search that misses one tab, and a tap on the row that places"
non_negotiables:
  - "The client filter narrows the pool only; the days behind are unchanged (C-USE-this-week-client-filter-2)."
  - "Clients come in Settings' order through useClients; with clients off there is no client pill, no client heads, no client in search metas (C-USE-this-week-clients-off-1)."
  - "A tap on a row opens its Item sheet and places nothing; only Place places (C-USE-place-from-the-pool-pool-sheet-2)."
  - "Placing, filtering and searching write nothing to Linear (C-USE-this-week-5)."
  - "Focus is held in the sheet and returns to Pool on close; every Place names its item (C-USE-this-week-6)."
  - "Reads through usePoolView, useLinear and useClients; @syn/ui ResponsiveSheet and preset tokens only."
devs_call: "Whether the grouping is USE-74's poolView (yes, if it fits the phone's lines); the Size and Due date filter sheets' form (not drawn: Any, then each)."
cites:
  - "specs/web/epics/USE-daily-use/ux/work/this-week/pool-sheet-anatomy.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/words-and-access.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/place-from-the-pool/states/pool-sheet.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/states/client-filter.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/states/clients-off.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/states/pool-search.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/states/linear-connected.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/states/linear-not-connected.md"
  - "specs/web/epics/USE-daily-use/ux/work/this-week/states/pool-empty.md"
  - "C-USE-this-week-5"
  - "C-USE-this-week-6"
  - "C-USE-place-from-the-pool-pool-sheet-1"
  - "C-USE-place-from-the-pool-pool-sheet-2"
  - "C-USE-place-from-the-pool-pool-sheet-3"
  - "C-USE-this-week-client-filter-1"
  - "C-USE-this-week-client-filter-2"
  - "C-USE-this-week-client-filter-3"
  - "C-USE-this-week-clients-off-1"
  - "C-USE-this-week-pool-search-1"
  - "C-USE-this-week-pool-search-2"
  - "C-USE-this-week-linear-connected-1"
  - "C-USE-this-week-linear-connected-2"
  - "C-USE-this-week-linear-not-connected-1"
  - "C-USE-this-week-linear-not-connected-2"
  - "C-USE-this-week-pool-empty-1"
  - "D-USE-54"
  - "D-USE-56"
  - "D-USE-57"
  - "D-USE-96"
  - "D-USE-101"
waiver: "The phone's pool sheet: its anatomy, with the pool-sheet frame from Place and This week's sheet states (client filter, clients off, search, From Linear connected and not, pool empty), each holding its own criteria; one sheet."
truth_files: "none: promotion carries work/this-week/ and interactions/place-from-the-pool/"
qa: Q1
reviewers:
  - assay
focus:
  - "pool sheet, client filter, pool search, From Linear connected and not connected, and pool empty at 402 against their captures (assay)"
operator_review: false
planned_paths:
  - "apps/web/components/work/pool-sheet/"
  - "apps/web/lib/data/use-pool-view.ts"
  - "apps/web/lib/data/pool-sheet.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-079-pool-sheet/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-9"
  - "USE-10"
  - "USE-55"
  - "USE-51"
  - "USE-52"
  - "USE-56"
  - "USE-74"
out_of_scope:
  - "The place sheet Place opens, Placed with Undo, doesn't fit: USE-80"
  - "New task (pool empty, a search with no match): USE-51's NewTaskSheet, opened with the title"
  - "The issue list itself: USE-52's, reused on From Linear"
  - "The day it opens over: USE-81"
criteria:
  - id: C1
    statement: "With a client picked the pool view holds only that client's rows and the week's records are untouched; a search for \"booking\" returns matches from both tabs, each meta starting \"Pool\" or \"Linear\"; with clients off no row carries a client"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "At 402 the sheet shows \"Pool\" with ×, Pool and From Linear, All clients, Size and Due date with the search glyph, Kestrel Health, Alder Studio and Personal with tiles, rows with emoji, title, meta and Place, and the foot line"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-079-pool-sheet/evidence/pool-sheet-402.png"
  - id: C3
    statement: "At 402 the client filter shows All clients then each client in Settings' order with tile and letter and its line; search shows the full-height sheet with \"In the pool and in Linear\" and, with no match, \"Nothing called that. New task with this title\""
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-079-pool-sheet/evidence/filter-and-search-402.png"
  - id: C4
    statement: "At 402 From Linear shows issues by client then team and project lines with status shapes, Assigned to Taylor and Not done on, \"Synced 2 min ago\" with Sync now, and a placed one faded \"already on Mon 12, Primary\" with no Place; not connected, the tab reads Connect Linear with \"Linear isn't connected\", its line and Open Settings › Connections"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-079-pool-sheet/evidence/from-linear-402.png"
  - id: C5
    statement: "At 402 the empty pool shows \"Nothing in the pool\" and its line under the tabs, not centred, with From Linear and New task"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-079-pool-sheet/evidence/pool-empty-402.png"
  - id: C6
    statement: "The web app type-checks"
    evidence: check
    command: "yarn check-types"
  - id: C7
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — pool-sheet

## Build notes

Wave 2, after the pool panel. Match `ux/interactions/place-from-the-pool/captures/pool-sheet-402.png` and `ux/work/this-week/captures/` client-filter, pool-search, linear-connected, linear-not-connected, pool-empty.

- **Decisions that apply:**
  - The anatomy file: a `ResponsiveSheet` (724 tall, search grows it to 818); "Pool" and ×; tabs Pool and From Linear (Connect Linear when not connected, D-USE-56; the phone always shows the second tab, D-USE-101); filter pills "All clients ▾", "Size ▾", "Due date ▾" and a search glyph (D-USE-54); From Linear: "All clients ▾", Assigned to Taylor and Not done, on by default (D-USE-57), and the sync line; the list grouped by client in Taylor's order (D-USE-96), team and project lines, rows ≥ 60 px with a lead slot (emoji, or the status shape on From Linear), title over meta, and Place.
  - The foot line: "Place puts it on a day and a tier. Tap the row itself for its sheet. The client filter narrows this list only, never the days."
  - Client filter: "Client", "All clients", each client with its tile, letter and line ("two Linear teams"), "Narrows the pool only. The days keep every client's work. In the order set in Settings › Clients."
  - Search: "In the pool and in Linear"; "Pool · <client> · <ID> · <size>", "Linear · <client> · <ID> · <size>"; "Nothing called that. New task with this title"; Cancel.
  - Not connected: "Linear isn't connected"; "Connect a workspace to pull in the issues assigned to Taylor. Each workspace connects on its own; clients stay off unless turned on."; "Open Settings › Connections" (the signed-in name, never "you").
  - Pool empty: "Nothing in the pool"; "Work saved for later lands here, and anything left open at a day's end. Every item in Linear is one tab over."; From Linear; New task.
  - Size and Due date open small sheets of the same shape (Size: Any, then Quick to Huge; Due date: Any, Due this week, Due today) [ASSUMPTION].
- **Interfaces:** `PoolSheet { dateKey; onPlace(itemRef) }`, `ClientFilterSheet` in `components/work/pool-sheet/`; filters extend `usePoolView` with `client`, `size`, `due`.
- **Per path:** `pool-sheet.test.ts` holds C1. Scenarios `pool-sheet`, `pool-filter`, `pool-search`, `pool-search-none`, `pool-from-linear`, `pool-linear-off`, `pool-sheet-empty`, `pool-clients-off`. Captured over `/dev/parts` until USE-81 mounts it.
- **Model:** Opus 5.5 at medium. A smaller model filters the days too, or places on a row tap.
