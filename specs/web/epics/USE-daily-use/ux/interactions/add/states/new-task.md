---
target: specs/web/ux/interactions/add/states/new-task.md
status: approved
promoted:
boards:
  - name: "phone-edit / new task, tier, size, days / 402 / light"
    page: "USE — work"
    at: [482, 7200]
    note: "Notes · phone, editing and This week (row 6) @ x 482"
    capture: specs/web/epics/USE-daily-use/ux/interactions/add/captures/new-task-402.png
rulings: [D-USE-40, D-USE-54, D-USE-57, D-USE-58, D-USE-65]
---

# + Add — New task, tier, size and days

Step 2a of [`../index.md`](../index.md): "Task to a tier" in [`add-sheet.md`](add-sheet.md), on Monday 12 at 10:20 during Work. `?state=new-task`.

## What shows, top to bottom

- Behind the scrim: the status bar (10:20), "Now", the Work band.
- The sheet from y 170 (704 high), the grab handle; × on the left.
- "Mon 12 · Work · Task to a tier" (muted), then "New task" (title).
- **Title**: label, and a field holding "[Pricing page: tighten the copy]".
- **Client and project**: a row between rules, the moss "A" letter tile, "Alder · 🎨 Brand site" muted, and a chevron.
- **Tier**: label and the coloured `SegmentedControl`: Urgent, Primary (selected, white with a border, bold), Secondary, Stretch, each with its square.
- **Size**: label, and on the right muted "1 to 2 h"; pill chips "1 Quick", "2 Small", "3 Medium" (selected, filled ink), "5 Large", "8 Huge".
- **Days**: label, and on the right muted "two days make it two sessions"; seven day chips (letter over date): M 12 and W 14 selected (filled ink); T 13, T 15, F 16 outlined; S 17 and S 18 dashed and greyed.
- The consequence line, muted: "Mon's Primary runs to 11:40 at the top of its ranges; Wed's to 11:10. Sat and Sun have no Work block."
- "Add to Primary, Mon and Wed", full width in ink.

## What the person can do

- Type the title; Client and project opens a picker (optional) [ASSUMPTION: not drawn; the pool's client order, then the client's projects].
- Pick a tier, a size (sets the range on the right; the range stays editable per the size dev note), one or more days. Two or more days make sessions of one task ([`../../sessions.md`](../../sessions.md)).
- A day with no Work block is dashed and cannot be picked [ASSUMPTION: as drawn, greyed].
- The consequence line and the action follow every change: the line names where each picked day's tier ends at the top of its ranges; the action names tier and days.
- With no days picked the task saves to the pool, never to Linear: [`save-to-the-pool.md`](save-to-the-pool.md) (D-USE-57) [ASSUMPTION: the action then reads "Save to the pool", as that frame].
- The action adds it; step 3 of [`../index.md`](../index.md) (the toast with Undo).

## Words

"Mon 12 · Work · Task to a tier" · "New task" · "Title" · "Client and project" · "Tier" · "Size" · "1 to 2 h" · "1 Quick" … "8 Huge" · "Days" · "two days make it two sessions" · "Mon's Primary runs to 11:40 at the top of its ranges; Wed's to 11:10. Sat and Sun have no Work block." · "Add to <tier>, <days>". Gloss passed them; past the block's end would be said in words, never red, as everywhere.

## Access

The sheet traps focus; × named "Close". The tier and size groups are radio groups, each segment named by its word (colour never alone); day chips are toggle buttons named "Monday 12, selected" [PROPOSED]; a dashed day is disabled with "no Work block" in its name [PROPOSED]. The consequence line is announced politely when it changes [ASSUMPTION]. Controls at least 44 × 44 (the chips are 36 high: a 44 hit area around the 36 drawn chip, the access floor, so the drawn size stands; Threshold).

## The notes on the boards

**phone-edit / new task, tier, size, days / 402 / light** (Notes · phone, editing and This week (row 6) @ x 482, card "New task, tier, size, days"):

> New task, tier, size, days
>
> Title, client and project (optional), Tier, Size (sets the range), Days. Two days make two sessions of one task. The consequence line names where each day's tier ends; the action names the days.

## Rulings

- D-USE-54: New task's fields; two or more days make sessions of one task, a fit line per day, an action naming the days. D-USE-40: one item as sessions.
- D-USE-57: no days saves to the pool, never to Linear. D-USE-58: locked as drawn.

## Widths

Drawn at: 402. Desk: the right-panel sheet with these fields (D-USE-65, D-USE-39).

## Criteria

| ID                   | When                     | Then                                                                                   | Evidence                    |
| -------------------- | ------------------------ | -------------------------------------------------------------------------------------- | --------------------------- |
| C-USE-add-new-task-1 | Two days picked          | One task, two sessions; the line names each day's tier end; the action names both days | `captures/new-task-402.png` |
| C-USE-add-new-task-2 | A size picked            | The range shows beside Size and stays editable                                         | `captures/new-task-402.png` |
| C-USE-add-new-task-3 | A day with no Work block | It cannot be picked and the line says so in words                                      | manual                      |
