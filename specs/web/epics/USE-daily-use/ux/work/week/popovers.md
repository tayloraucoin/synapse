---
target: specs/web/ux/work/week/popovers.md
status: approved
promoted:
---

# Week — the two popovers, as drawn

What the Week's two frames draw open, split out of their state files to keep them under the cap. Each popover's behaviour is its flow's: [`../../interactions/place-from-the-pool/index.md`](../../interactions/place-from-the-pool/index.md) and [`../../interactions/add-event.md`](../../interactions/add-event.md). Both are a shadcn `Popover` [ASSUMPTION: the house primitive; the add one holds a `Command` list].

## "Add to Friday · Primary" (Priority lens)

On `week / priority lens, add on hover / 1728 / light`, carried by [`states/priority-lens.md`](states/priority-lens.md) ([capture](captures/priority-lens-1728.png)).

**The "Add to Friday · Primary" popover** (drawn open, anchored under Friday's Primary cell, over Friday to Sunday): 340 px, `--color-background`, a hairline, the sheet radius, a soft shadow, 10 px padding, 6 px gaps. "Add to Friday · Primary" (semibold, muted); the search field (36 px, a 1.5 px `--color-ring` border, focused) holding "audit"; the group label "Pool" (subtle) and its row, shaded `--color-surface` as the active result: 📤 "[Audit log export]" with "KES-58 · 5 Large" at the right; the group label "Linear, not in the pool yet" and 🧮 "[Audit trail retention]" with "KES-71 · unsized"; a rule; '+ New item "audit"'. Behaviour: [`../../interactions/place-from-the-pool/index.md`](../../interactions/place-from-the-pool/index.md).

## "Event popover · Wed" (Time lens)

On `week / time lens / 1728 / light`, carried by [`states/time-lens.md`](states/time-lens.md) ([capture](captures/time-lens-1728.png)).

**The "Event popover · Wed"** (drawn open, anchored under Wednesday's "+ Event", over Wednesday to Friday's mornings): 340 px, `--color-background`, a hairline, the sheet radius, a soft shadow, 14 px padding, 12 px gaps. "New event · Wednesday 14" (semibold); the name field (38 px, focused, a 1.5 px `--color-ring` border) with "📞" in its 18 px slot and "[Call with Kestrel legal]"; **Starts** "14:00" and **Ends** "14:30", side by side, each a 36 px field with "− +" steppers; a segmented **Work** (selected) / **Personal**; "Client" with the rose "K" tile and "Kestrel Health" at the right; "Repeats" with "Does not repeat" at the right; above a hairline, the landing line (muted): "Sits inside Work, 13:00 to 15:00. Nothing moves: that block has room until 15:00."; **Add event** (primary, ink, full width, 38 px). Behaviour: [`../../interactions/add-event.md`](../../interactions/add-event.md).
