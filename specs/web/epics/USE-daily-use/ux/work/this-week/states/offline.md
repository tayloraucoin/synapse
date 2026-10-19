---
target: specs/web/ux/work/this-week/states/offline.md
status: approved
promoted:
boards: []
not_drawn: "Not drawn on row 6; follows 'phone-today / offline / 402 / light' (D-USE-56), Set my days' offline ('set-my-days / offline / 402 / light', D-USE-82) and D-USE-67."
rulings: [D-USE-56, D-USE-67, D-USE-82]
---

# This week on the phone — offline

`?state=offline` [ASSUMPTION: key].

## What shows, top to bottom

[ASSUMPTION, joining three rulings: D-USE-56 (work on the phone: everything works offline, with a StatusLine), D-USE-82 (Set my days offline: the day's own controls read-only) and D-USE-67 (a block's contents edit offline)]

- **The day**, from cache: header ("✓ Saved" hidden), chips live, the blocks and the Work block's tiers as last loaded. A `StatusLine` above the foot: the offline glyph and "Offline. Changes wait until the connection is back." (Set my days' words, kept with D-USE-82). **Pool** live; the + read-only (faded), as D-USE-82 has it.
- **The pool sheet:** the Pool tab from cache, Place live. From Linear: the issues last fetched; the sync line reads [PROPOSED, to Gloss] "Offline. Synced 2 min ago" with no Sync now; search finds only what is cached.

## What the person can do

Place from the pool and from cached Linear issues, add to a tier, open the Item sheet, change a tier or a session: each saves on the phone and syncs in order when back (D-USE-56, D-USE-67; [`../../../dev-notes/timers-across-devices.md`](../../../dev-notes/timers-across-devices.md)). Not: the + (the day's own edit, D-USE-82), Sync now, Open Settings › Connections [ASSUMPTION].

## Rulings

- D-USE-56: offline, everything works, with a StatusLine.
- D-USE-82: Set my days' own controls stay read-only offline.
- D-USE-67: a block's contents edit offline and sync when back.

## Widths

Not drawn. 1024 and up: the Week's offline ([`../../week/states/offline.md`](../../week/states/offline.md)).

## Criteria

| ID                        | When                       | Then                                                                   | Evidence |
| ------------------------- | -------------------------- | ---------------------------------------------------------------------- | -------- |
| C-USE-this-week-offline-1 | Offline on a This week day | The StatusLine shows; Pool and Place work; the + is read-only          | manual   |
| C-USE-this-week-offline-2 | Back online                | Queued placings sync in order; nothing is written to Linear by placing | test     |
