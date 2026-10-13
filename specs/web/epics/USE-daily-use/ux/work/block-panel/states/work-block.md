---
target: specs/web/ux/work/block-panel/states/work-block.md
status: approved
promoted:
boards:
  - name: "block-panel / work block, from Time / 1728 / light"
    page: "USE — work"
    at: [0, 4320]
    note: "Note · block-panel / work"
    capture: specs/web/epics/USE-daily-use/ux/work/block-panel/captures/work-block-1728.png
rulings: [D-USE-38, D-USE-39, D-USE-41, D-USE-42, D-USE-48, D-USE-93, D-USE-94]
---

# Block panel — a Work block, from the Time lens

Tue 13's 9:30 Work block clicked in the Week's Time lens on Monday 12 at about 10:20. The panel shows the block's slice of Tuesday's tiers. `?state=work-block`.

## What shows, top to bottom

**Behind (the Week, Time lens; its own spec is [`../../week/states/time-lens.md`](../../week/states/time-lens.md)):** the rail with **Week** current; the pool panel open at 360 (Pool tab, "Group: Client", "Sort: Due date", "Search the pool", the clients and rows, "+ New item in the pool", "Linear synced 2 min ago" with **Sync now**; [`../../week/pool-panel.md`](../../week/pool-panel.md)); the header "Plan the week" (serif) with "‹ 12 to 18 Oct ›", the Priority / Time `SegmentedControl` with Time selected, and **Today**; the day heads "Mon 12 ›" with "today", "Tue 13 ›" to "Fri 16 ›", "Sat 17", "Sun 18"; the hours 8:00 to 17:00 with each day's blocks. Tuesday's column: Training · gym; **Work 9:30, ringed in ink**, with the chips "✍️ [Alder intro] 2/3" (a leaf edge, Primary) and "💬 [SMS copy]" (an amber edge, Secondary); Lunch; Work 13:00 with "🦸 [Homepage hero]"; the stretch break; Work 15:10 with "Work ends 15:10" and "15:30 [Dentist]" in plum. Monday's column carries the now line. The panel covers Friday to Sunday.

**The panel:**

1. "Tue 13 › Work" · **Open day** · ×.
2. The sky bar, "Work", "9:30 to 12:00 · ends 11:40 at the top of the ranges".
3. **The tiers in this block**, 14 px apart. Each tier: a 24 px heading, the tier's 8 px colour square and its word (13 px semibold): Primary (`--color-category-leaf-dot`), Secondary (`--color-category-amber-dot`), Stretch (`--color-category-slate-dot`) (D-USE-38). Then its rows, then "+ Add to <tier>" (13 px, `--color-subtle-foreground`, indented 28 px to the title's edge, 32 px tall).
   - **Primary:** "[Case studies: write the Alder intro]", meta "Alder · 🎨 Brand site · ALD-17 · session 2 of 3", "1 to 2 h"; "+ Add to Primary".
   - **Secondary:** "[Appointment reminders: SMS copy]", meta "Kestrel · 🏥 Patient portal · KES-51 · 2 Small", "30 to 60 min"; "+ Add to Secondary".
   - **Stretch:** no rows; "+ Add to Stretch".
   - No Urgent heading [ASSUMPTION: Urgent shows only when it holds something, as on Today (D-USE-38); the phone's Block view draws "+ Add to Urgent" alone (`../../../day/block-view/states/work-tiers.md`)].
4. **A row** (at least 52 px, a hairline under it, 4 px side padding, 10 px gaps): a grip (six dots, 14 px, `--color-subtle-foreground`) at the leading edge; the emoji in its 18 px slot (D-USE-48); the title (14/20, ink) over the meta (12/16, muted: client short name, project emoji and name, ID, size or "session n of N"); the length range on the right (12 px, muted). No ring, firing mark, checkbox, Start or Done: the panel plans (the opened day's line, "Firing, Start and Done wait for the day itself").
5. **The scope line,** under a hairline: "Tiers belong to Tuesday, not to this block. Items here go first; what's undone carries to the 13:00 Work block."

## What the person can do

- **Drag a grip** to reorder within the tier [ASSUMPTION: and across tiers, as on Today; the week's chips follow the new order].
- **Drag a pool row** into a tier here (the note: "The pool stays open to the left for dragging in"), or **+ Add to <tier>**: placing, [`../../../interactions/place-from-the-pool/index.md`](../../../interactions/place-from-the-pool/index.md) [ASSUMPTION: the same "Add to <day> · <tier>" popover as a Priority cell's hover add, anchored under the add row]. The week's chip and the fit line update as the item lands.
- **A row:** the Item sheet [ASSUMPTION, `../index.md` › Entry and exit].
- **Open day**, **×**, Esc, as [`../index.md`](../index.md).
- **Another block** clicked in the week: the panel shows that block and the ring moves [ASSUMPTION: not drawn].

## Words

"Tue 13 › Work" · "Open day" · "Work" · "9:30 to 12:00 · ends 11:40 at the top of the ranges" · "Primary", "Secondary", "Stretch" · "+ Add to Primary", "+ Add to Secondary", "+ Add to Stretch" · "session 2 of 3" · "Tiers belong to Tuesday, not to this block. Items here go first; what's undone carries to the 13:00 Work block." The fit line past the block's end is not drawn [ASSUMPTION: the time it ends, said in words, never red, as add's consequence line (`../../../interactions/add/index.md`)]. With no later Work block that day the carry clause is not drawn [ASSUMPTION: "what's undone stays on Tuesday"; to Gloss].

## The notes on the boards

**Note · block-panel / work** — block-panel / work block, from Time / 1728 / light

A Work block opened from the Time lens: ResponsiveSheet's right panel at --sheet-w (as built, D-USE-39; drawn at 440) over the week, the block ringed in ink. Breadcrumb "Tue 13 › Work", Open day, and ×. The block's slice of the day's tiers with grips, "+ Add to <tier>" rows, and the line that tiers belong to the day (refinement 6): what isn't reached carries to the next Work block. The pool stays open to the left for dragging in.

## Rulings

- D-USE-41: any block opens a right-hand Block panel; a Work block shows its tiers.
- D-USE-39: `ResponsiveSheet`'s right panel at `--sheet-w`, as built.
- Refinement 6 (N2): tiers belong to the day, not to a block; the block shows the day's tiers in order, and what is not reached carries to the next Work block that day.
- D-USE-42: an item can sit on several days as sessions ("session 2 of 3"). D-USE-48: the emoji slot. D-USE-38: the tier colours.
- D-USE-93, D-USE-94: the desk from 1024; the panel follows the week's narrowing rule.

## Widths

Drawn at 1728. 1024 to 1727: D-USE-94 ([`../index.md`](../index.md) › Platforms). Below 1024: the phone's Block view of a Work block in This week (D-USE-55, `../../../day/block-view/states/work-tiers.md`).

## Criteria

| ID                             | When                                         | Then                                                                                                                        | Evidence                       |
| ------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| C-USE-block-panel-work-block-1 | A Work block is clicked in the Time lens     | The right panel opens at `--sheet-w`; the block is ringed in ink; the pool stays docked and open                            | `captures/work-block-1728.png` |
| C-USE-block-panel-work-block-2 | The panel shows a Work block                 | The day's tiers in order with that block's items, grips, an add row per tier, and the scope line naming the next Work block | `captures/work-block-1728.png` |
| C-USE-block-panel-work-block-3 | A pool row is dropped on a tier in the panel | It lands in that tier on that date; the week's chip and the header's fit line update                                        | test                           |
| C-USE-block-panel-work-block-4 | Any row in the panel                         | No firing mark, ring, checkbox, Start or Done                                                                               | `captures/work-block-1728.png` |
