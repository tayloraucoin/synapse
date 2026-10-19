---
target: specs/web/ux/work/today/states/nothing-planned.md
status: approved
promoted:
boards:
  - name: "today / nothing planned, pool docked / 1728 / light"
    page: "USE — work"
    at: [0, 1440]
    note: "Note · today / nothing planned"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/nothing-planned-1728.png
  - name: "phone-today / nothing planned, left open / 402 / light"
    page: "USE — work"
    at: [4338, 5760]
    note: "Notes · phone, Today (row 5) @ x 4338"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/nothing-planned-402.png
rulings: [D-USE-41, D-USE-42, D-USE-56]
---

# Today — nothing planned (Sunday planning didn't happen)

## What shows, top to bottom

**Desk (1728, 8:40):** the **pool panel** docks between the rail and the content (360 px, the same panel as the Week's, D-USE-41, D-USE-42; its full spec is the week/ thread's): Pool and Linear tabs; "Group: Client" and "Sort: Due date" selects; "Search the pool"; "Clients in your order. Drag a client to reorder."; each client with a grip, its tile and name and a collapse chevron, its Linear team and project lines, and rows (emoji, title, priority glyph, ID, size, labels; due states "Due Wed" in warning, "Due today" in danger; "on Mon, Tue, Wed" for placed sessions, faded; "Spread…" on a Huge item); "+ New item in the pool" (dashed); "Linear synced 2 min ago" with **Sync now**. The week strip reads "Nothing slotted yet" for each day (events still show). The header has no Step away. The band is the current block (Training, "8:00 to 8:57 · Work starts at 9:30"). Then the **start card** (surface grey): "Nothing set for today yet."; "Drag from the pool into a tier, or start from what was left open last week."; "Left open on Friday": each item with "was Primary" and **Add to Primary** (or Secondary); **Add both as they were** (primary) and **Plan the week**. The tiers: Primary as a dashed drop zone "Drop here, or + Add to Primary"; Secondary and Stretch with "+ Add to Secondary", "+ Add to Stretch". To-dos as usual. The day column shows the usual week's blocks (only the work is empty).

**Phone (402, 10:20):** under the Work header, the start card: "Nothing planned for this block", "Left open on Friday, at the tier it had:", each item checked with its tier square and word, **Open the pool** and **Bring these in** (primary). Under the card: "Anything not brought stays in the pool. Nothing is marked missed."

## What the person can do

Desk: add one item at its old tier, add both, drag from the pool into a tier, + Add to a tier, Plan the week (to Week). Phone: uncheck what to leave, Bring these in (at the old tiers), Open the pool (the pool sheet, [`../../../interactions/place-from-the-pool/states/pool-sheet.md`](../../../interactions/place-from-the-pool/states/pool-sheet.md), over [`../../this-week/`](../../this-week/index.md)).

## The notes on the boards

**Note · today / nothing planned** — today / nothing planned, pool docked / 1728 / light

Sunday planning didn't happen. Today opens with the pool docked on the left (the same panel as the Week) and a calm start card: "Nothing set for today yet." It offers what was left open on Friday with the tier it had, one by one or "Add both as they were", and "Plan the week". No count, no word for missed. The tiers show a drop zone and add rows; the current block (Training) is the band; the day column still shows the usual week's blocks, since blocks come from the usual week and only the work is empty. The strip reads "Nothing slotted yet" for each day.

**Notes · phone, Today (row 5) @ x 4338** — Nothing planned, left open

The desk docks the pool; the phone gives the start card: what was left open, checked, at its old tier, with Bring these in and Open the pool. What isn't brought stays in the pool; nothing is marked missed.

## Rulings

- D-USE-42: a day with nothing planned docks the pool with a start card offering what was left open, at its old tier.
- D-USE-56: the phone's start card is its answer to the docked pool.
- D-USE-41: the pool panel's tabs, Group and Sort. Bend: "Due today" in danger on the tabs (named in D-USE-41, D-USE-42).
- Not a "no work slotted" day: that is [no-work-slotted](no-work-slotted.md), where nothing was left open to offer [ASSUMPTION: the two differ by whether anything was left open].

## Widths

Drawn at 1728 and 402.

## Criteria

| ID                            | When                                                   | Then                                                                                | Evidence                            |
| ----------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------------------------------- |
| C-USE-today-nothing-planned-1 | No work slotted today and items left open last workday | Desk: pool docked, start card with each item at its old tier; no count, no "missed" | `captures/nothing-planned-1728.png` |
| C-USE-today-nothing-planned-2 | Phone, Bring these in                                  | The checked items land at their old tiers; the rest stay in the pool                | `captures/nothing-planned-402.png`  |
