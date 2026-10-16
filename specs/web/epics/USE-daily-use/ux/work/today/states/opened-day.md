---
target: specs/web/ux/work/today/states/opened-day.md
status: approved
promoted:
boards:
  - name: "day / Tue 13, opened from Week / 1728 / light"
    page: "USE — work"
    at: [1808, 1440]
    note: "Note · day / opened from Week"
    capture: specs/web/epics/USE-daily-use/ux/work/today/captures/opened-day-1728.png
rulings:
  [
    D-USE-41,
    D-USE-42,
    D-USE-45,
    D-USE-48,
    D-USE-49,
    D-USE-55,
    D-USE-62,
    D-USE-65,
    D-USE-93,
    D-USE-102,
  ]
---

# Today — another day, opened from the Week (planning)

Tuesday 13 opened from the Week on Monday 12: Today's layout for that date in a planning state. Drawn in round 2 (D-USE-41), before the row and lift rounds (D-USE-42 to D-USE-49); where they differ, the later lines win, as Rulings say. `?state=opened-day`.

**Entry:** a day head's › on the Week ("Tue 13 ›"; Sat and Sun heads carry none as drawn on the Week); **Open day** in the Block panel ([`../../block-panel/index.md`](../../block-panel/index.md)). **Route:** `/today?date=2026-10-13` (built USE-58, the ledger's `?date=` first): one route for doing and planning a day, as the note's "One layout"; today's own date is never written, so its strip card and day head go to `/today`. Captures: `/dev/parts?state=today-opened-day&date=2026-10-13`.

## What shows, top to bottom

**Rail:** **Week** current (shaded), not Today: the opened day belongs to the Week.

**Week strip** (as [`../index.md`](../index.md)'s, centred over the content): Mon 12 with "today" in `--color-now` and its lines "[Portal sign-in]" (leaf square), "11:00 [Kestrel]" (plum square); **Tue 13 selected**, its card filled `--color-surface` and outlined in ink, "[Case studies] · 2/3" and "15:30 [Dentist]"; Wed 14 "[Case studies] · 3/3"; Thu 15 "[Desk Today layout]"; Fri 16 "Nothing slotted yet"; Sat 17 "No work" and Sun 18 "Sunday reset", their dates muted. Today keeps its "today" word; the ink outline marks the selected day here [ASSUMPTION: on Today itself the outline marks today, which is also the selected day].

**Main column (720):**

1. **Header:** "Tuesday, 13 October" (serif 30); on the right "Work ends 15:10" (13 px, muted) where Today has the time, Step away and + Add ⌄. No band (no current block on another date) and no Next strip.
2. **The planning line** (36 px): **‹ Week** (13 px semibold, ink: back to the Week) and "Planning Tuesday. Firing, Start and Done wait for the day itself." (muted).
3. **Primary:** the first item as a card (1 px `--color-border`, `--radius-sheet`): "✍️ [Case studies: write the Alder intro]" (17 px, 500), meta "Alder Studio · 🎨 Brand site · ALD-17 · 3 Medium · 1 to 2 h · session 2 of 3 · #copy". No Start, no Done, no ring.
4. **Secondary:** a row (at least 56 px): "💬 [Appointment reminders: SMS copy]" (15 px), meta "Kestrel · 🏥 Patient portal · KES-51 · 2 Small · #copy", "30 to 60 min" right-aligned in a 120 px slot.
5. **Stretch:** empty; "+ Add to Stretch" (13 px, subtle, 40 px).
6. **To-dos,** under a rule: an 18 px `Checkbox` (`--color-input` edge) on each: "🧘 Kegels" "daily · 14:00"; "🤸 Hip and hamstring stretch" "daily · 10:00"; "📞 [Call the mechanic]" "Call".

**Day column (340):** "The day" with "whole day, then 8:00 to 18:00"; the day bar from 7:00 to "Lights out 22:30" with "Work ends 15:10" under it, the blocks in their kind colours (Training clay, Work sky, Lunch amber, the stretch break as a 3 px clay mark, the Dentist plum, an amber evening block and a muted stretch to Lights out); the hours 8:00 to 18:00 at 56 px an hour: Training · gym, Breakfast, "Work · 9:30 to 12:00", Lunch, "Work · 13:00 to 15:00", Stretch break, "Work · 15:10 to 17:00" with "15:30 [Dentist]" in plum inside. No `NowLine`: the day is not today.

## What the person can do

- **+ Add to <tier>:** the add popover, [`../../../interactions/place-from-the-pool/index.md`](../../../interactions/place-from-the-pool/index.md). Add rows per tier (the note): drawn only on the empty Stretch [ASSUMPTION: a tier with items shows "+ Add to <tier>" on hover, as a Week cell (D-USE-41)].
- **Drag** between tiers to reorder [ASSUMPTION: as on Today]; no pool is docked here, so placing from the pool goes through + Add.
- **A row:** the Item sheet (`../../../day/item-sheet/`), its Sessions included ([`../../../interactions/sessions.md`](../../../interactions/sessions.md)).
- **A block** in the day column: its Block panel ([`../../block-panel/index.md`](../../block-panel/index.md)).
- **A strip day:** opens that date the same way [ASSUMPTION]; Mon 12 (today) opens Today itself, live.
- **‹ Week:** the Week, its lens as left (remembered per person, D-USE-41). The rail's Today: Today.
- **To-dos** [ASSUMPTION: the to-dos for that date, with the daily ones; checking one ahead follows the To-dos rules (`../../../day/`), not drawn].
- Not here: the ring, F, D and Enter, Start, Done, Step away (the planning line). J and K move focus [ASSUMPTION, D-USE-62].

## Words

"Tuesday, 13 October" · "Work ends 15:10" · "‹ Week" · "Planning Tuesday. Firing, Start and Done wait for the day itself." · "+ Add to Stretch" · the strip's "Nothing slotted yet", "No work", "Sunday reset" · "today". Labels show here as "#copy" in the meta; D-USE-42 later makes them chips in Linear's colours.

## The notes on the boards

**Note · day / opened from Week** — day / Tue 13, opened from Week / 1728 / light

A day opened from the week (a day head's ›, or Open day in the Block panel) is the Today layout for that date, in a planning state: "‹ Week" on the left, no firing toggle, no Start or Done, add rows per tier, the strip with that day selected, and the day column with its events (the dentist at 15:30). One layout for doing and for planning a day, so nothing new to learn. Answers Taylor's "click into a day"; a Priority matrix for one day would only repeat these tiers.

## Rulings

- D-USE-41: a day head opens that day in the Today layout, planning state.
- D-USE-42, D-USE-48: rows take the locked anatomy of [`../index.md`](../index.md) (emoji in its 18 px slot with a 7 px gap, priority chip, size chip, label chips in Linear's colours), without the 44 px lead slot, since nothing fires here [ASSUMPTION: the slot goes rather than stays empty].
- D-USE-45, D-USE-49: Decided (D-USE-102): The first Primary's card. Ruled, as drawn and in the locked form: the first undone item in order (Urgent, Primary, Secondary, Stretch) keeps the card, shaded `--color-surface` with no border (D-USE-49 replaced round 2's bordered card), with no Start or Done; it is Next's place on that day, not Next.
- D-USE-65: outside a Work block Today shows no Next lift and no Start; the opened day goes further, no firing either.
- D-USE-55: the phone's answer is a day chip in Set my days, which opens that day's blocks and tiers (`../../../set-my-days/set-my-days/states/the-day.md`); Now shows only today.
- A past date opened [ASSUMPTION: not drawn; the same layout with what was done shown done and the rest still editable, nothing marked missed, as N6's Week "a past day"].

## Widths

Drawn at 1728; the other widths and the as-built notes: [`opened-day-widths.md`](opened-day-widths.md).

## Criteria

| ID                       | When                                    | Then                                                                                                            | Evidence                       |
| ------------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| C-USE-today-opened-day-1 | A day head's › on the Week, or Open day | Today's layout for that date: "‹ Week" with the planning line, the strip with that day selected, its day column | `captures/opened-day-1728.png` |
| C-USE-today-opened-day-2 | Any row on a day not today              | No ring, firing mark, Start or Done; F, D and Enter do nothing                                                  | `captures/opened-day-1728.png` |
| C-USE-today-opened-day-3 | The opened day's day column             | Its blocks and events (the 15:30 Dentist) show; no now line                                                     | `captures/opened-day-1728.png` |
| C-USE-today-opened-day-4 | ‹ Week                                  | The Week shows in the lens it was left in                                                                       | manual                         |
