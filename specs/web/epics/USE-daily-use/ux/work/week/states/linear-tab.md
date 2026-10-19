---
target: specs/web/ux/work/week/states/linear-tab.md
status: approved
promoted:
boards: []
not_drawn: "The desk's Linear tab is never drawn open; its content follows D-USE-41, D-USE-42, D-USE-57 and the phone's 'this-week / From Linear, connected / 402 / light' (work/this-week/states/linear-connected.md)."
rulings: [D-USE-41, D-USE-42, D-USE-57]
---

# Week — the pool panel on its Linear tab

**Linear** selected in [the pool panel](../pool-panel.md). Shown only when Linear is connected (D-USE-41). `?state=linear-tab` [ASSUMPTION: key].

## What shows

[ASSUMPTION, from the phone's From Linear card] Linear issues not yet in the pool, grouped by client in Taylor's order, then team and project lines, as the Pool tab (D-USE-57). Each row: the status shape (as Linear draws it, D-USE-35), the emoji in its slot, the title, the ID, the status word, the size, the due badge (D-USE-98). Filters **Assigned to Taylor** and **Not done**, on by default (D-USE-57), in place of Group and Sort [ASSUMPTION: the desk keeps Group and Sort above them]. Search searches both tabs. Issues already placed show where, faded ("on Mon, Tue"). The sync line reads "Synced 2 min ago" with **Sync now** (the phone's words; the Pool tab's "Linear synced 2 min ago" [PROPOSED: one wording, to Gloss]).

## What the person can do

Drag an issue into a cell or onto a Work block: it joins the pool and is placed ([`../../../interactions/place-from-the-pool/index.md`](../../../interactions/place-from-the-pool/index.md)) [ASSUMPTION]; open its sheet; Sync now. Placing writes nothing to Linear (D-USE-57).

## Rulings

- D-USE-41: Linear second, only when connected; background sync with Sync now.
- D-USE-42: client, then team and project lines.
- D-USE-57: From Linear connected (grouping, filters, Synced with Sync now, placed issues faded with where).

## Widths

Not drawn. Below 1024: the phone's pool sheet, From Linear tab ([`../../this-week/states/linear-connected.md`](../../this-week/states/linear-connected.md)).

## Criteria

| ID                      | When                  | Then                                                                                                                                   | Evidence |
| ----------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| C-USE-week-linear-tab-1 | Linear tab, connected | Issues not in the pool, grouped by client then team and project; Assigned to Taylor and Not done on; placed ones faded with their days | manual   |
