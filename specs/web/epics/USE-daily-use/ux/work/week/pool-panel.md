---
target: specs/web/ux/work/week/pool-panel.md
status: approved
promoted:
---

# Week — the pool panel (v3)

The desk's pool: work saved and not yet on a day (D-USE-31), the pipeline for now (N6). One panel, docked in three places: the Week (both lenses, [`states/priority-lens.md`](states/priority-lens.md), [`states/time-lens.md`](states/time-lens.md)), Today with nothing planned ([`../today/states/nothing-planned.md`](../today/states/nothing-planned.md)), and beside the Block panel ([`../block-panel/index.md`](../block-panel/index.md)). Drawn identically on `week / priority lens, add on hover / 1728 / light` and `week / time lens / 1728 / light` ([capture](captures/priority-lens-1728.png)). The phone's pool is a sheet over This week, [`../this-week/`](../this-week/index.md) (D-USE-54); cited, not repeated. Rows and their marks: [`pool-rows.md`](pool-rows.md).

## Frame

360 × full height, `--color-surface`, a 1 px `--color-border` right edge, 24 px top and bottom and 20 px side padding, 14 px between regions. Rows are list-like on the grey panel, not cards (round 3, D-USE-42).

## Top to bottom

1. **Tabs** (`Tabs`, segmented on `--color-fill-muted`, 3 px inset, each 32 px): **Pool** (selected: `--color-background`, semibold) and **Linear** (muted). Pool first, Linear second; the Linear tab shows only when Linear is connected (D-USE-41). The Linear tab's content: [`states/linear-tab.md`](states/linear-tab.md).
2. **Group and Sort** (two `Select`s side by side, 36 px, `--color-background` with a hairline): "Group: Client" and "Sort: Due date", each with a chevron. Group offers Client, Workspace or Project; Sort offers Due date, Priority, Updated (D-USE-41). Sort's default order is Due date, then Priority, then client order (D-USE-98); client order also breaks ties in any Sort (D-USE-96).
3. **Search** (36 px, a search glyph, placeholder "Search the pool" in subtle). [ASSUMPTION] It searches titles and IDs across both tabs and says where each result lives, and no match offers a new item with the query, as the phone's pool search (D-USE-57, "Pool search").
4. **The list**, grouped by client in Taylor's order (with Group: Client):
   - The order line, subtle caption: "Clients in your order. Drag a client to reorder."
   - **A client head** (34 px): a 6-dot grip (12 px, subtle), the client's 20 px tile (radius 5) with its letter in white bold 11 px, the name (semibold), and a collapse chevron at the right. Drawn: Kestrel Health [placeholder] (rose, "K"), Alder Studio [placeholder] (moss, "A"), Personal (ink tile, "T" in `--color-background`). Logos come from the Linear workspace's logo, or are uploaded in Synapse for a client inside Taylor's own workspace (round 3 note) [ASSUMPTION: unverified in Linear's docs; the letter tile is the fallback]. Client colours are the six of the client sheet: rose, leaf, amber, moss, slate, ink (D-USE-95).
   - **Team and project lines** (26 px, indented 20 px): the team's emoji in an 18 px slot, the team name (semibold, muted), then "· <project emoji> <project>" in subtle. Drawn: "💻 Product Engineering · 🏥 Patient portal" and "💼 Business Development · 🤝 Partnerships" under Kestrel (one company with two teams reads as one client with two lines, D-USE-42); "In Taylor's workspace · 🎨 Brand site" under Alder (a project set to a client inside Taylor's own workspace); "🧠 Synapse" under Personal.
   - **Rows** under their line: [`pool-rows.md`](pool-rows.md).
5. **"+ New item in the pool"** (38 px, dashed `--color-input` border, muted, centred), 20 px under the list. It opens New task with no days, which waits in the pool and is never created in Linear (D-USE-57; the desk form is the right-panel sheet, D-USE-65).
6. **The sync line**, 16 px below with a hairline between (round 3: "16 px and a rule between them"): "Linear synced 2 min ago" (subtle) at the left, **Sync now** (semibold, underlined) at the right. Linear syncs in the background (D-USE-41); polling may stand in for webhooks on client workspaces (open-8, round 2: webhooks need admin scope).

## Client order (D-USE-96)

One order kept in two places: drag a client head here, or hold the grip in Settings › Connections › Clients ([`../../account/settings/states/clients-on.md`](../../account/settings/states/clients-on.md)); both change the same order. No separate priority field. The order groups the pool, breaks ties in Sort, and orders the client filter (the phone's sheet). With clients off (the default, D-USE-40) there are no client heads [ASSUMPTION: the list groups by workspace, then team and project lines]. No client filter is drawn at the desk; collapsing a client head stands in for N6's client `Select` [ASSUMPTION; D-USE-41 put Group and Sort in its place].

## What the person can do

Switch tabs; change Group or Sort; search; drag a client head (reorder); collapse a client; drag a row into a Priority cell or onto a Work block ([`../../interactions/place-from-the-pool/index.md`](../../interactions/place-from-the-pool/index.md)); click a row for its Item sheet [ASSUMPTION, as N6]; "Spread…" on a big item ([`../../interactions/spread/index.md`](../../interactions/spread/index.md)); + New item in the pool; Sync now.

## Rulings

D-USE-112 (no Size filter at the desk; N6's "size filter" is the phone pool sheet's, D-USE-54); D-USE-41 (tabs, Group, Sort, rich rows, background sync, Sync now); D-USE-42 (pool v3: client order, team and project lines, logos, the space above the sync line); D-USE-95 (client colours); D-USE-96 (client order); D-USE-98 (due badges, Sort); D-USE-57 (New item to the pool, never to Linear). Decided (D-USE-101): Linear not connected at the desk: D-USE-41 hides the Linear tab, while the phone's second tab reads "Connect Linear" and goes to Settings › Connections (D-USE-56). Ruled: D-USE-41 as written, no Linear tab and no sync line at the desk.
