---
target: specs/web/ux/work/week/states/time-lens.md
status: approved
promoted:
boards:
  - name: "week / time lens / 1728 / light"
    page: "USE — work"
    at: [1808, 2880]
    note: "Note · week / time lens"
    capture: specs/web/epics/USE-daily-use/ux/work/week/captures/time-lens-1728.png
rulings: [D-USE-41, D-USE-42, D-USE-77, D-USE-94, D-USE-98, D-USE-101]
---

# Week — Time lens

The week as a calendar: blocks at their times, work as chips inside Work blocks, events in plum. Drawn Monday 12 October at 10:20 with "+ Event" pressed on Wednesday and its popover open. `?state=time-lens`; `?state=time-lens-event` opens the popover [ASSUMPTION: key].

## What shows, top to bottom (1728)

- **Rail** with **Week** current; the **pool panel** as in Priority ([`../pool-panel.md`](../pool-panel.md)).
- **Header:** "Plan the week", "‹ 12 to 18 Oct ›"; **Time** selected in the lens control; **Today**.
- **Day heads** (48 px, after a 48 px axis gutter): "Mon 12 ›" with "today" in `--color-now`; "Tue 13 ›"; "Wed 14 ›" with **+ Event** beside it (24 px, `--color-background`, a `--color-input` hairline, semibold caption), shown on the head's hover; "Thu 15 ›", "Fri 16 ›"; "Sat 17" and "Sun 18" muted with no ›.
- **The grid** (800 px): the axis "8:00" to "17:00", 80 px an hour; seven columns of 148 px, each with a hairline left edge; Monday's (today's) shaded `--color-surface`.
- **Blocks** (inset 4 px, radius 5, their kind colours, the label muted): Training at 8:00 (`--color-category-clay-chip`: "Training · gym" Mon and Tue, "Abs and yoga" Wed, "Training, home" Thu and Fri); **Work 9:30 to 12:00** (`--color-category-sky-chip`, a 3 px sky-dot left edge, "Work" semibold); Lunch 12:00 to 13:00 (`--color-category-amber-chip`, "Lunch"); **Work 13:00 to 15:00**; the stretch break 15:00 to 15:10 as a 12 px `--color-category-clay-dot` bar, unlabelled; **Work 15:10 to 17:00**.
- **Work chips** inside Work blocks: `--color-background`, radius 4, a 2 px left edge in the tier's colour (leaf Primary, amber Secondary, slate Stretch), "<emoji> <title>" with a short session mark ("1/3"), a due badge under the title when due soon (16 px). No firing time (D-USE-98).
  - **Mon:** 9:30 "🔐 [Portal sign-in]" and "✍️ [Alder intro] 1/3" (leaf); 13:00 "💬 [SMS copy]" and "🧭 [Desk Today] 1/3" (amber); 15:10 "🧾 [Invoice template]" (slate) and "Work ends 16:20".
  - **Tue:** 9:30 "✍️ [Alder intro] 2/3" and "💬 [SMS copy]" (both leaf); 13:00 "🦸 [Homepage hero]" (amber); 15:10 "Work ends 15:10".
  - **Wed:** 9:30 "✍️ [Alder intro] 3/3" with "Due tomorrow"; 15:10 "Work ends 11:30".
  - **Thu:** 9:30 "🧭 [Desk Today] 2/3" and "📝 [Audit notes]" with "Due today" (both leaf); 15:10 "Work ends 15:30".
  - **Fri:** no chips; 15:10 "Nothing slotted yet".
  - The fit line sits in each day's last Work block (muted caption).
- **Events** in plum inside the block they fall in (`--color-category-plum-chip`, a 3 px plum-dot left edge, inset 12 px left and 8 px right): Mon "11:00 [Kestrel]" in Work 9:30; Tue "15:30 [Dentist]" in Work 15:10.
- **Sat:** "No work blocks". **Sun:** "Sunday reset" (subtle).
- **The now line:** 2 px `--color-now` across Monday's column at 10:20.
- **The "Event popover · Wed"**, drawn open under Wednesday's "+ Event", over Wednesday to Friday's mornings: "New event · Wednesday 14", the name "[Call with Kestrel legal]", Starts 14:00, Ends 14:30, Work, Kestrel Health, Does not repeat, the landing line and **Add event**. Its full anatomy: [`../popovers.md`](../popovers.md); its behaviour: [`../../../interactions/add-event.md`](../../../interactions/add-event.md).

## What the person can do

Click any block for its Block panel ([`../../block-panel/index.md`](../../block-panel/index.md); D-USE-77 the same at Schedule); drag a pool row onto a Work block, which files it under the day's first tier with room [PROPOSED] ([`../../../interactions/place-from-the-pool/index.md`](../../../interactions/place-from-the-pool/index.md)); hover a day head for "+ Event"; fill the popover and Add event; a day head's › opens the day ([`../../today/states/opened-day.md`](../../today/states/opened-day.md)); switch to Priority. Synapse events are editable; Google events stay read-only (D-USE-42).

## Words

"+ Event"; "New event · Wednesday 14"; "Starts", "Ends"; "Work", "Personal"; "Client"; "Repeats", "Does not repeat"; "Sits inside Work, 13:00 to 15:00. Nothing moves: that block has room until 15:00."; "Add event"; "Work ends 11:30"; "Nothing slotted yet"; "No work blocks"; "Sunday reset"; "1/3".

## The notes on the boards

**Note · week / time lens** — week / time lens / 1728 / light

The Time lens: blocks at their times, work as chips inside Work blocks, events in plum, due badges per day as in Priority. Events: hover a day head for "+ Event" (or "+ Add › Event" on Today); the popover asks name, Starts and Ends, Work or Personal, the client, Repeats, and says where it lands and what moves ("Sits inside Work, 13:00 to 15:00. Nothing moves"). Events added here live in Synapse; calendar events from Google stay read-only. Clicking any block opens the Block panel.

## Rulings

- D-USE-41: the Time lens beside Priority, same pool and rules; events are not a pool tab ("+ Event" on a day head); any block opens the Block panel.
- D-USE-42: the event popover names where the event lands and what moves; Synapse events editable, Google read-only.
- D-USE-98: due badges per day; no firing time on Week chips.
- D-USE-94: the Time lens follows the Week's 1024 to 1727 rule.
- [ASSUMPTION] The frames' sample data differ ([placeholder]): Tuesday's "[SMS copy]" carries a Primary edge here and sits in Secondary on the Priority frame, and Tuesday's "[Alder intro] 2/3" shows no "Due Thu". The rules hold: a chip's edge is its tier, and D-USE-98 gives Tuesday's chip "Due Thu".
- [PROPOSED] to Gloss: the short session mark "1/3" on Time chips, where Priority writes "session 1 of 3".
- Decided (D-USE-101): A Time chip shows its tier by its edge colour alone. Ruled: as drawn, with the tier word in the chip's accessible name and its hover title; the Priority lens is the tier view.
- [ASSUMPTION] Hours outside 8:00 to 18:00 scroll within the grid, as Today's day column ("whole day, then 8:00 to 18:00"); not drawn.

## Widths

Drawn at 1728. 1024 to 1727: D-USE-94. Below 1024: the Schedule tab for today and Set my days' day view for other days (D-USE-55).

## Criteria

| ID                     | When                                       | Then                                                                                                                    | Evidence                                         |
| ---------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| C-USE-week-time-lens-1 | Time is chosen                             | Blocks at their times in kind colours, work chips inside Work blocks, events in plum, the now line on today             | `captures/time-lens-1728.png`                    |
| C-USE-week-time-lens-2 | "+ Event" on a day head                    | The popover with name, Starts, Ends, Work or Personal, Client, Repeats, and a line naming where it lands and what moves | `captures/time-lens-1728.png`                    |
| C-USE-week-time-lens-3 | A block is clicked                         | Its Block panel opens on the right                                                                                      | `../../block-panel/captures/work-block-1728.png` |
| C-USE-week-time-lens-4 | The lens is switched and the Week reopened | It opens on the lens last used by that person                                                                           | test                                             |
