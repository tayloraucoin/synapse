---
target: specs/web/ux/work/week/states/priority-lens.md
status: approved
promoted:
boards:
  - name: "week / priority lens, add on hover / 1728 / light"
    page: "USE — work"
    at: [0, 2880]
    note: "Note · week / priority lens"
    capture: specs/web/epics/USE-daily-use/ux/work/week/captures/priority-lens-1728.png
rulings: [D-USE-41, D-USE-42, D-USE-94, D-USE-95, D-USE-96, D-USE-98, D-USE-102]
---

# Week — Priority lens, add on hover

Tiers by day: the planning view. Drawn Monday 12 October (today) with a drop just made on Tuesday and "+ Add to Primary" open on Friday. `?state=priority-lens`; `?state=priority-lens-add` opens the popover [ASSUMPTION: key].

## What shows, top to bottom (1728)

- **Rail** with **Week** current; the **pool panel** on the Pool tab ([`../pool-panel.md`](../pool-panel.md), [`../pool-rows.md`](../pool-rows.md)).
- **Header:** "Plan the week", "‹ 12 to 18 Oct ›"; **Priority** selected in the lens control; **Today**.
- **The matrix** (1084 px): an 84 px label column, then seven equal columns (about 143 px), each with a hairline left edge; every row divided by a hairline.
  - **Rows, top to bottom:** the day heads (52 px); **Events** (72 px, muted label); **Primary** (200 px), **Secondary** (200), **Stretch** (120), each label semibold beside its 8 px colour square (leaf, amber, slate); **Fits** (48 px, muted label). No Urgent row is drawn [ASSUMPTION: an Urgent row shows above Primary only in a week where an item is Urgent, as Today's tiers, D-USE-41].
  - **Day heads:** "Mon 12 ›" (semibold) with "today" under it in `--color-now` and a 2 px `--color-now` line under the head; "Tue 13 ›" to "Fri 16 ›"; "Sat 17" and "Sun 18" muted, with no ›.
  - **A chip** (8 px inset in its cell, 4 px apart): `--color-surface`, radius 5, no border, 6 × 8 px padding; "<emoji> <title>" (caption, the emoji followed by two non-breaking spaces, D-USE-48), the meta in muted under it, a due badge under that when due soon (18 px, radius 4, 11 px semibold). No firing time on a chip (D-USE-98).
  - **Events:** plum chips (`--color-category-plum-chip`, a 3 px plum-dot left edge): Mon "11:00 [Kestrel weekly]", Tue "15:30 [Dentist]".
  - **Mon:** Primary "🔐 [Portal sign-in]" "KES-42 · 3 Medium", "✍️ [Alder intro]" "ALD-17 · session 1 of 3"; Secondary "💬 [SMS copy]" "KES-51 · 2 Small", "🧭 [Desk Today layout]" "SYN-212 · 1 of 3"; Stretch "🧾 [Invoice template]" "1 Quick"; Fits "Work ends 16:20".
  - **Tue, the drop** (column "Col · Tue, drop"): Primary "✍️ [Alder intro]" "ALD-17 · session 2 of 3" with "Due Thu" (warning), ringed 1.5 px in ink, the chip just dropped; under it, muted, "Added as session 2 of 3. Undo". Secondary "💬 [SMS copy]" "KES-51 · 2 Small"; Stretch empty; Fits "Work ends 15:10".
  - **Wed:** Primary "✍️ [Alder intro]" "ALD-17 · session 3 of 3" with "Due tomorrow" (warning); the rest empty; Fits "Work ends 11:30".
  - **Thu:** Primary "🧭 [Desk Today layout]" "SYN-212 · 2 of 3"; Secondary "📝 [Audit notes]" "KES-60 · 2 Small" with "Due today" (danger, on its due date's column); Fits "Work ends 15:30".
  - **Fri, hovered:** the Primary cell shaded `--color-surface` with **+ Add to Primary** (a `--color-background` button with a `--color-input` hairline, radius 5) at its top; the rest empty; Fits "Nothing slotted yet" (subtle).
  - **Sat, Sun:** one region under the head, "No work blocks" (subtle).
- **The "Add to Friday · Primary" popover**, drawn open under Friday's Primary cell, over Friday to Sunday: the title, the search holding "audit", a Pool result, a "Linear, not in the pool yet" result and '+ New item "audit"'. Its full anatomy: [`../popovers.md`](../popovers.md); its behaviour: [`../../../interactions/place-from-the-pool/index.md`](../../../interactions/place-from-the-pool/index.md).

## What the person can do

Drag a pool row into a cell; hover a cell for "+ Add to <tier>" and search; pick a result or '+ New item "<query>"'; Undo after a drop; click a chip for its Item sheet [ASSUMPTION, as N6]; a day head's › opens the day ([`../../today/states/opened-day.md`](../../today/states/opened-day.md)); switch to Time; ‹ › and Today. Placing, Undo and sessions: [`../../../interactions/place-from-the-pool/index.md`](../../../interactions/place-from-the-pool/index.md), [`../../../interactions/sessions.md`](../../../interactions/sessions.md).

## Words

"Events", "Primary", "Secondary", "Stretch", "Fits"; "today"; "Work ends 16:20"; "Nothing slotted yet"; "No work blocks"; "session 2 of 3"; "Due Thu", "Due tomorrow", "Due today"; "Added as session 2 of 3. Undo"; "+ Add to Primary"; "Add to Friday · Primary"; "Pool"; "Linear, not in the pool yet"; '+ New item "audit"'.

## The notes on the boards

**Note · week / priority lens** — week / priority lens, add on hover / 1728 / light

One week, two lenses (Priority and Time), remembered per person. Round 3: chips sit on the page in surface grey with no border, not white; today's column is marked by its header line. Due badges are worked out per day: a chip shows "Due today" in danger on its due date's column, "Due tomorrow" or "Due Thu" in the warning tone within two days before it [PROPOSED]. An item can sit in several cells as sessions (n of N). Pool panel v3: Pool first, Linear second; grouped by client in Taylor's own order (drag a client head to reorder; this order is the client priority and breaks ties in Sort), then Linear team (💻 Product Engineering, 💼 Business Development) and project, so one company with two teams reads as one client with two lines. Client logos come from the Linear workspace's logo, or are uploaded in Synapse for a client inside Taylor's own workspace [ASSUMPTION; unverified in Linear's docs]. Rows are list-like on the grey panel with label chips in Linear's colours. The New item button and the sync line now have 16 px and a rule between them.

## Rulings

- D-USE-41: one view, two lenses, remembered per person; "+ Add to <tier>" on a cell's hover opening one search over the pool and Linear; a day head opens the day.
- D-USE-42: chips in surface grey; sessions in several cells; pool v3.
- D-USE-98: the note's [PROPOSED] due badges are decided as drawn; Week chips show no firing time.
- D-USE-96: client order is the client priority; D-USE-95: client colours.
- D-USE-94: from 1024 to 1727 the columns shrink to about 120 px, then the week scrolls sideways.
- [PROPOSED] to Gloss: the session meta is drawn two ways, "session 1 of 3" (ALD-17) and "1 of 3" (SYN-212); one form, "session n of N", as Today's rows.
- [ASSUMPTION] Cells keep the drawn row heights and a row grows to its tallest cell when it overflows (not drawn).
- Decided (D-USE-102): Waiting (D-USE-78) is not drawn on the Week. Ruled: a Blocked, Paused or In review item keeps its tier cell; Waiting is Today's grouping only.

## Widths

Drawn at 1728. 1024 to 1727: D-USE-94. Below 1024: Set my days › This week (D-USE-55, D-USE-93; [`../../this-week/`](../../this-week/index.md)).

## Criteria

| ID                         | When                                    | Then                                                                                                       | Evidence                          |
| -------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------- |
| C-USE-week-priority-lens-1 | The Week opens on Priority              | Label column and seven day columns, today's head marked in `--color-now`; chips in surface grey, no border | `captures/priority-lens-1728.png` |
| C-USE-week-priority-lens-2 | An item due Thu is placed Tue to Thu    | Tue "Due Thu" and Wed "Due tomorrow" in warning; Thu "Due today" in danger                                 | `captures/priority-lens-1728.png` |
| C-USE-week-priority-lens-3 | Hover on a cell, "+ Add to Primary"     | The popover: Pool, then "Linear, not in the pool yet", then '+ New item "<query>"'                         | `captures/priority-lens-1728.png` |
| C-USE-week-priority-lens-4 | A placed item is dropped on another day | It lands as "session n of N" with "Added as session n of N. Undo" under it                                 | `captures/priority-lens-1728.png` |
