---
target: specs/web/ux/work/this-week/states/linear-connected.md
status: approved
promoted:
boards:
  - name: "this-week / From Linear, connected / 402 / light"
    page: "USE — work"
    at: [6266, 7200]
    note: "Notes · phone, editing and This week (row 6, cont.) @ x 6266"
    capture: specs/web/epics/USE-daily-use/ux/work/this-week/captures/linear-connected-402.png
rulings: [D-USE-35, D-USE-41, D-USE-42, D-USE-54, D-USE-57, D-USE-96, D-USE-98]
---

# This week on the phone — From Linear, connected

The pool sheet on its From Linear tab: Linear issues not yet in the pool. `?state=linear-connected` [ASSUMPTION: key].

## What shows, top to bottom

- Behind, under the scrim: "‹ Week" and "Pool" (drawing shorthand, as [`client-filter.md`](client-filter.md)).
- **The pool sheet** ([`../pool-sheet-anatomy.md`](../pool-sheet-anatomy.md)), top at 150: grabber, "Pool", ×; tabs "Pool" (muted) and **"From Linear"** (selected).
- **Filters:** "All clients ▾" (outline), **"Assigned to Taylor"** and **"Not done"** (filled ink, on).
- **Sync line:** "Synced 2 min ago" and **Sync now**.
- **Kestrel Health** (rose "K"):
  - "Portal team · 🏥 Patient portal"
  - Backlog (a dashed circle) "[Reminder opt-out link]", "KES-63 · Backlog · 2 Small · due Thu", **Place**.
  - Placed, faded (title, meta and shape in `--color-disabled-foreground`): In progress (a half-filled circle) "[Portal sign-in: magic link flow]", "KES-42 · already on Mon 12, Primary", no Place.
  - "Records team · 📁 Records import"
  - Todo (an empty circle) "[CSV mapping screen]", "REC-9 · Todo · 3 Medium", **Place**.
- **Alder Studio** (moss "A"): Todo "[Brand site: contact form]", "ALD-25 · Todo · 1 Quick", **Place**.
- No emoji on these rows: the lead slot holds Linear's status shape (D-USE-35) [ASSUMPTION: an issue's emoji shows once it is in the pool].

All titles, clients, teams and IDs are [placeholder].

## What the person can do

- **Place:** the place sheet ([`../../../interactions/place-from-the-pool/index.md`](../../../interactions/place-from-the-pool/index.md)); the issue joins the pool and is placed in one step [ASSUMPTION, as the desk]. Placing writes nothing to Linear (D-USE-57).
- A row: the Item sheet of the issue (`../../../day/item-sheet/`, Linear linked) [ASSUMPTION]. A placed row opens its sheet, whose Sessions adds another day [ASSUMPTION].
- Turn either filter off (it takes the outline look); "All clients ▾" opens [`client-filter.md`](client-filter.md).
- **Sync now:** fetches now; the line reads the new time [ASSUMPTION: "Syncing…" while it runs, as the item sheet's `linear-syncing`]. Linear also syncs in the background (D-USE-41).
- Search (the glyph, [ASSUMPTION] at the filters' right): [`pool-search.md`](pool-search.md).

## Words

"From Linear" · "All clients ▾" · "Assigned to Taylor" · "Not done" · "Synced 2 min ago" · "Sync now" · "<ID> · <status word> · <size> · due <day>" · "already on Mon 12, Primary" · "Place". [PROPOSED, to Gloss] one sync wording across desk and phone ("Synced 2 min ago" here, "Linear synced 2 min ago" on the desk Pool tab); one placed form ("already on Mon 12, Primary" here, "on Mon, Tue, Wed" on the desk). "Place" passed by Gloss (open-9's words).

## The notes on the boards

**Notes · phone, editing and This week (row 6, cont.) @ x 6266** — From Linear, connected

Grouped by client, then by team and project lines; status shape, ID, status word, size, due. Filters Assigned to Taylor and Not done on by default. "Synced 2 min ago" with Sync now. Already-placed issues show where, faded.

## Rulings

- D-USE-57: From Linear connected: grouped by client, team and project lines, Assigned to Taylor and Not done on, Synced with Sync now, placed issues faded with where.
- D-USE-42: one company with two teams is one client with two lines.
- D-USE-96: clients in Taylor's order. D-USE-98: due words from two days before.
- D-USE-35: the status shape as Linear draws it.
- D-USE-54: tap to place, on each row.

## Widths

Drawn at 402. 1024 and up: the Week's Linear tab ([`../../week/states/linear-tab.md`](../../week/states/linear-tab.md), not drawn, which follows this frame).

## Criteria

| ID                                 | When                           | Then                                                                                              | Evidence                            |
| ---------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------- | ----------------------------------- |
| C-USE-this-week-linear-connected-1 | From Linear opens              | Issues not in the pool, by client then team and project lines; Assigned to Taylor and Not done on | `captures/linear-connected-402.png` |
| C-USE-this-week-linear-connected-2 | An issue already sits on a day | Faded, with its day and tier, no Place                                                            | `captures/linear-connected-402.png` |
| C-USE-this-week-linear-connected-3 | Place on an issue, then Undo   | Placing wrote nothing to Linear; Undo leaves it out of the pool                                   | test                                |
