# p-6-0 "USE — work": notes, row labels and text cards

Verbatim text of every text-only root artboard on the page, sorted by y then x. Each text node is its own paragraph, in layer order. Read from Paper file 01M49AX02VV4SSBKNCN6NRTS6Y on 2026-10-12.

## Progress @ x 0, y -700

USE — work · Design locked 2026-10-10 (D-USE-49)

Work at a desk, MacBook 16" at 1728 × 1117, light only. Row 1, Today at a desk: the work loop in order, with firing in place, the two clocks and Step away. Row 2: other Today states. Row 3: the Week, planning. Row 4: Block panels. A note sits under each frame, and the D-USE log in specs/web/epics/USE-daily-use/ux/day/overview.md holds every decision (D-USE-39 to D-USE-49). Colours: verdigris is Taylor's hands (running); rust on grey is waiting on AI (firing, Prompt sent); ink is the day's structure; Next is a light grey shade on its row, and hover uses the same shade. Below y 9000: the three first directions, archived.

## Row label · Today at a desk @ x -560, y 0

Row 1 · the work loop / Today at a desk / In order: working (Next lifted) → Start, running → Prompt sent, both firing → brought back, with a Done record → stepped away.

## Note · today / working @ x 0, y 1157

today / working, firing in place / 1728 / light — round 5 (D-USE-44, D-USE-45, D-USE-47)

No Firing group. [Portal sign-in] fires in its own tier and place: the ring becomes the breathing mark (a rust dot in a grey halo that breathes), the title and its meta recede, and "firing · 4 min" sits on the right in dark rust (D-USE-49). The daily reminder line ("While it fires: Kegels") sits under the first firing row in order. Next is [Case studies]: nothing is in Taylor's hands, so Next lifts as the card with Start and Done, shaded light grey with no border (D-USE-45, D-USE-49); the Next strip under the header names it too. Hover on any task row shows the same light grey shade. No Step away here: no work timer is running (D-USE-46). Every emoji has its own 18 px slot with a 7 px gap (22 px on the 17 px card title). [ASSUMPTION] Project icons come from Linear's project icon; not verified. Bends: N4 note 56 at the desk only.

## Note · today / running @ x 1808, y 1157

today / running, work clock, add menu / 1728 / light — rounds 3 and 5 (D-USE-42, D-USE-44, D-USE-46)

Start turns the lifted card into the running card, edged in verdigris (Taylor's hands). Its clock is WORK TIME: it runs only while the item is in Taylor's hands (Start, Pause, Resume) and still counts down from the top of the range ("1:24:10 left of 2 h · worked 35 min since 9:45"; past it, "n min over" in the D-USE-29 colours). Prompt sent is grey with a rust edge and dot, the colour of waiting on AI (D-USE-49); it pauses work time and starts firing time on the row (next frame). [Portal sign-in] fires in place in Primary: rust dot in a grey halo, "firing · 4 min" in dark rust. Next is the SMS copy: while something runs, the running card holds the lift, so Next is a grey-shaded row in its own tier, plus the strip. "Step away" sits in the header only while a work timer runs (the last frame in this row). "+ Add" is the shadcn DropdownMenu: Task to a tier, From the pool, To-do, Event; T, P, D, E [PROPOSED].

## Note · today / prompt sent @ x 3616, y 1157

today / prompt sent, both firing, Next lifts / 1728 / light — round 5 (D-USE-43, D-USE-44, D-USE-45)

One press of Prompt sent (or F, or the ring on any work row): [Case studies] stays in Primary, second in place, and its row changes. The breathing mark (rust dot, grey halo) replaces the ring, the title recedes, its meta keeps "worked 35 min", and "firing · 1 min" starts on the right in dark rust. Work time is paused and does not restart when the item comes back; Start or Resume restarts it. Two items now fire in Primary, and nothing is in Taylor's hands, so Next lifts: the SMS copy becomes the grey-shaded card with Start and Done in Secondary, and the strip names it with Go (Enter). Next is order only (resolve-next.ts): Urgent, Primary, Secondary, Stretch, then tier order; the first item neither firing nor done. Many items can fire at once; one is in Taylor's hands at a time.

## Note · today / brought back, Done @ x 5424, y 1157

today / brought back, Next follows order, Done / 1728 / light — round 5 (D-USE-44, D-USE-45, D-USE-48)

11:52. The thread finished and Taylor pressed the breathing mark on [Portal sign-in]. It simply looks like the others again: no "back" caption (D-USE-44). It keeps "fired 12 min" in its meta, a length. Being first in order, it is Next: the lifted card, shaded light grey, and the strip reads "Primary". Its work time does not restart until Start. [Case studies] still fires in place ("firing · 6 min", worked 35 min), with the reminder line under it. The SMS copy is done and shows the Done record on its row: a filled done mark, the title receded, meta trimmed to client, project and ID, and "Took 1 h 10 · fired 32 min" on the right (work time, then firing time; "fired" is left off when an item never fired). When every work item fires, the strip reads "Everything is firing." No sound, and nothing changes with how long something fires [NEEDS DECISION: a soft chime when something comes back; default off].

## Note · today / stepped away @ x 7232, y 1157

today / stepped away / 1728 / light — round 5, new (D-USE-44, D-USE-46)

Step away is a light switch for work time. Pressed at 10:42, it paused every running work timer at once (here, [Case studies] at 57 min worked); firing time keeps counting, because the AI keeps working ([Portal sign-in] reads "firing · 35 min"). The header button gives way to a quiet bar under the title: "Stepped away at 10:42", "Work time held · firing keeps counting" and Resume all [PROPOSED wording, to Gloss]. Resume all resumes exactly the timers Step away paused, nothing else. The paused card reads WORK TIME · PAUSED in muted ink, its edge drops from verdigris to the hairline, and Pause becomes Resume, which resumes that one card and clears the bar when nothing else is held. Prompt sent and Done still work while stepped away. Next and its shading are unchanged. [NEEDS DECISION] Whether a long step away (past the block's end) asks anything on return; default: no, the bar just waits.

## Row label · Today, edges @ x -560, y 1440

Row 2 · other Today states / Today, edges / A day with nothing planned (the pool docked); a day opened from the Week, planning.

## Note · today / nothing planned @ x 0, y 2597

today / nothing planned, pool docked / 1728 / light

Sunday planning didn't happen. Today opens with the pool docked on the left (the same panel as the Week) and a calm start card: "Nothing set for today yet." It offers what was left open on Friday with the tier it had, one by one or "Add both as they were", and "Plan the week". No count, no word for missed. The tiers show a drop zone and add rows; the current block (Training) is the band; the day column still shows the usual week's blocks, since blocks come from the usual week and only the work is empty. The strip reads "Nothing slotted yet" for each day.

## Note · day / opened from Week @ x 1808, y 2597

day / Tue 13, opened from Week / 1728 / light

A day opened from the week (a day head's ›, or Open day in the Block panel) is the Today layout for that date, in a planning state: "‹ Week" on the left, no firing toggle, no Start or Done, add rows per tier, the strip with that day selected, and the day column with its events (the dentist at 15:30). One layout for doing and for planning a day, so nothing new to learn. Answers Taylor's "click into a day"; a Priority matrix for one day would only repeat these tiers.

## Row label · Week @ x -560, y 2880

Row 3 · planning / Week / Priority lens with add on hover; Time lens; spreading a big task across the week.

## Note · week / priority lens @ x 0, y 4037

week / priority lens, add on hover / 1728 / light

One week, two lenses (Priority and Time), remembered per person. Round 3: chips sit on the page in surface grey with no border, not white; today's column is marked by its header line. Due badges are worked out per day: a chip shows "Due today" in danger on its due date's column, "Due tomorrow" or "Due Thu" in the warning tone within two days before it [PROPOSED]. An item can sit in several cells as sessions (n of N). Pool panel v3: Pool first, Linear second; grouped by client in Taylor's own order (drag a client head to reorder; this order is the client priority and breaks ties in Sort), then Linear team (💻 Product Engineering, 💼 Business Development) and project, so one company with two teams reads as one client with two lines. Client logos come from the Linear workspace's logo, or are uploaded in Synapse for a client inside Taylor's own workspace [ASSUMPTION; unverified in Linear's docs]. Rows are list-like on the grey panel with label chips in Linear's colours. The New item button and the sync line now have 16 px and a rule between them.

## Note · week / time lens @ x 1808, y 4037

week / time lens / 1728 / light

The Time lens: blocks at their times, work as chips inside Work blocks, events in plum, due badges per day as in Priority. Events: hover a day head for "+ Event" (or "+ Add › Event" on Today); the popover asks name, Starts and Ends, Work or Personal, the client, Repeats, and says where it lands and what moves ("Sits inside Work, 13:00 to 15:00. Nothing moves"). Events added here live in Synapse; calendar events from Google stay read-only. Clicking any block opens the Block panel.

## Note · week / spread @ x 3616, y 4037

week / spread a big task / 1728 / light

A big task (SYN-218, 20 h) spread across mornings: "Spread…" on the pool row, or on a session's menu. Choose the hours left, which Work block (Morning, Afternoon, or Pick blocks for any mix), the days, the session length (the whole block, or a set length), and the tier. The preview shows each session with what it shares the block with and how long it gets once the block's other work is counted; afternoons stay free for changing work. "Carry on next week" keeps placing sessions until the hours are done. Sessions are one item: checking a session is "Done for today", and every session shows n of N. Editing one session later asks This session or All sessions [PROPOSED].

## Row label · Block panel @ x -560, y 4320

Row 4 · from the Time lens / Block panel / Any block opened from the week: a right-hand panel over the week. A Work block shows its tiers; any other block shows its items.

## Note · block-panel / work @ x 0, y 5477

block-panel / work block, from Time / 1728 / light

A Work block opened from the Time lens: ResponsiveSheet's right panel at --sheet-w (as built, D-USE-39; drawn at 440) over the week, the block ringed in ink. Breadcrumb "Tue 13 › Work", Open day, and ×. The block's slice of the day's tiers with grips, "+ Add to <tier>" rows, and the line that tiers belong to the day (refinement 6): what isn't reached carries to the next Work block. The pool stays open to the left for dragging in.

## Note · block-panel / non-work @ x 1808, y 5477

block-panel / non-work block, from Time / 1728 / light

The same panel on a non-work block (Training · gym on Monday): the phone's Block view, widened. Items with start times on the left, transitions in italics, Swap on the workout, "+ Add to Training", and the scope line: changes apply to this date only, the usual Monday is unchanged (N3). Every block kind opens the same panel; only a Work block shows tiers.

## Row label · Phone, Today @ x -560, y 5760

Row 5 · round 7 · new / Work on the phone: Today / The desk's rules at 402: the work loop, the thumb, and every state a build needs (paused, over, start while running, long-press, Done for today, Linear writes, loading, error, past the block, the sheet while firing). A (rec.) and B differ only on the Next strip.

## Notes · phone, Today (row 5) @ x 0, y 6674

A, working, firing in place · recommended

Pick: no Next strip on the phone. Next is the shaded row, or the lifted card with Start and Done when nothing is in hand, in its own tier. The strip repeats that row, costs 48 px above the running card, and Go is a desk key. Rows trim to 402: client tile, project emoji in its 18 px slot, ID, priority chip, size chip; client and project names and labels move to the item sheet. Firing reads on the right in two lines, "firing / 5 min", dark rust. + in the header opens Add.

B, the Next strip kept

The desk's strip at 402: NEXT, emoji, title, Go. It repeats the lifted card one screen-third away and pushes Secondary down. Not picked.

Running, work time, Step away

Start makes the running card, verdigris edge: WORK TIME counts down from the top of the range, "left of 2 h · worked 57 min since 9:23". Pause, Prompt sent (grey, clay edge and dot, dark rust words) and Done at 84 / fill / 84. Step away sits in the block header beside ···, only while a work timer runs. Next is the shaded row.

Prompt sent, both firing, Next lifts

The item fires in place: rust dot in a grey halo, title receded, meta at 60 % with "worked 57 min". Next lifts at once, the first undone item in tier order. "While it fires: Kegels" shows once, under the first firing row.

Stepped away, Resume all

The quiet bar under the block header: "Stepped away at 10:42", "Work time held · firing keeps counting" [PROPOSED, to Gloss], Resume all. The held card reads WORK TIME · PAUSED, edge to hairline, Pause becomes Resume. Prompt sent and Done still work.

Brought back, Next follows order, Done

A tap on the firing mark brings it back to its tier and place; first in order, it lifts as Next with Resume (bringing back never restarts work time). The Done record sits under the title on the phone: "Took 1 h 10 · fired 32 min". Sub-issues fold under their issue; opened, each is a checkbox, and one placed alone shows its day.

Firing with a thumb

The ring's target is the whole 44 × 44 lead slot (dashed). Swipe right on a work row reveals Prompt sent and fires it [PROPOSED]; the ring is the tap fallback, and a one-time hint teaches the swipe until it's used. Bringing back is a tap on the mark only, never a swipe.

Everything firing

"Everything is firing." The to-dos lift into a card under the block header, and the reminder line hides because the card holds it. Nothing changes with how long things fire.

No work slotted

Each tier offers "Add to Primary" and the others; a row points to Set my days › This week. Anchored under the title.

Nothing planned, left open

The desk docks the pool; the phone gives the start card: what was left open, checked, at its old tier, with Bring these in and Open the pool. What isn't brought stays in the pool; nothing is marked missed.

Offline

Everything works, firing and timers included; Linear changes wait. A StatusLine under the block header says so.

Not updated in Linear

A failed Linear write (here, Done) shows on its own row: "Not updated in Linear." with Try again, in ink, never red.

## Notes · phone, Today (row 5, cont.) @ x 5784, y 6674

Paused, one item

Pause on the card holds that item only: WORK TIME · PAUSED, edge to hairline, "paused at 10:40", Resume. No timer runs, so Step away hides.

Running, over the range

Past the top of the range the clock counts up as "12 min over" in warning; well over, danger, as on the phone's running card (D-USE-29). Firing past an hour reads "1 h 20".

Start while one runs

One item in hand at a time. Starting another asks where the running one goes: Firing (default) or Paused (D-USE-43). Cancel leaves both as they were.

Row long-press, work menu

Tap a row for its sheet; long-press for the menu: Start, Prompt sent, Done, Move to tier ›, Move to another day, Back to the pool, Open in Linear. The menu opens on the side with room. Reordering stays the existing grip drag on Now.

Done for today, a session

A session's Done closes today's share only: "Done for today · took 2 h 05 · next session Wed 14", and a toast with Undo. Nothing goes to Linear until the task itself is done.

Linear updating, closed in Linear

A write on its way: a quiet spinner and "Moving to In progress in Linear…" under the row. Closed in Linear by someone else: the row shows done with the time, all sessions close, and Reopen [PROPOSED] reopens it in Linear.

Loading

Skeleton rows under the block header, in the tiers' rhythm. The header and tabs are real at once.

Error, Today didn't load

RegionRetry under the title, with Try again. Running timers keep their time, since they are events, not a ticking number (the Mason line).

Lunch, work still firing

When the Work block ends with items firing, Now shows them on top of the next block as "Still firing, from Work". Bring back and Done work there; the item waits in its tier for the next Work block. Firing ends at the day's close [ASSUMPTION].

Item sheet, while firing

Tapping a firing row opens its sheet with the firing panel ("Firing · 22 min", when the prompt went out, worked before it). Bring back and Done replace Start and Done.

## Row label · Phone, editing and This week @ x -560, y 7200

Row 6 · round 7 · new / Work on the phone: editing and This week / Add, new task, item sheet with sessions, sub-issues, the pool sheet with Place (A, rec.) or placing mode (B), filters, search, fit, Spread, Undo, and Settings › Connections with clients.

## Dev note · What stays at the desk, and the phone's answer @ x 11086, y 7200

Desk-only · the phone's answer

What stays at the desk

The two-pane Week

Phone: Set my days › This week, one day at a time behind the day chips. The pool is a sheet (Pool, From Linear, client filter). Place and Spread stand in for drag.

The Time lens

Phone: the Schedule tab for today, and Set my days' day view for any other day. No lens switch.

The opened day

Phone: a day chip in Set my days opens that day's blocks and tiers. Now shows only today, as designed.

The pipeline

Phone: nothing. Workflow (beta) and the later whole-pipeline view stay at the desk; the pool sheet is the pipeline for now.

Also desk-only

The Next strip with Go (pick A), the week strip, the day column beside Today, keyboard keys, and the browser tab's "Next: …" title.

## Notes · phone, editing and This week (row 6) @ x 0, y 8114

+ Add, four choices

+ in the Now header opens Add as a sheet: Task to a tier, From the pool, To-do, Event. The desk's four, as shadcn rows with muted leading icons.

New task, tier, size, days

Title, client and project (optional), Tier, Size (sets the range), Days. Two days make two sessions of one task. The consequence line names where each day's tier ends; the action names the days.

Item sheet, tier and sessions

Tier changes this session and asks before changing all (the D-USE-42 default). Sessions list each day and its tier; × drops a day, Add a day adds one. Sub-issues check here, and ··· on one offers "Place on a day by itself". Done for today on a session; "Mark the task done" is in ···.

Sub-issue, placed alone

One day, one tier, the consequence, Place. It stays a checkbox inside its issue too; checking it in either place checks it in Linear.

A, pool sheet, tap to place · recommended

Pick for drag on the phone: tap to place. The pool is a sheet over This week: Pool and From Linear tabs, client, size and due-date filters, search, grouped by client in Taylor's order. Place opens the place sheet. Why: one hand, the consequence shows before anything moves, several days (sessions) in one step, and it reuses the item sheet's Move-to pattern.

A, place sheet, days and tier

Days (one or more), Tier, the fit per day, an action that names the days. Past Work's end is said in words, never in red.

B, placing mode

Variation: Place collapses the sheet into a bar, and each tier on the day becomes a "Place in Primary · ends 11:40" target; the chips switch days. Quick for one item, but one day at a time and no sessions in one step. Not picked.

Client filter sheet

All clients, then each client in Settings order. Narrows the pool only, never the days. Not shown when clients are off.

Spread across the week

The desk's spread as a full sheet: hours left, session length, which Work block, days and tier, the sessions previewed with each day's fit, and what carries on to next week [PROPOSED, as at the desk].

From Linear, not connected

The second tab reads Connect Linear; it explains and goes to Settings › Connections.

Pool empty

Under the title, not centred, with From Linear and New task.

## Notes · phone, editing and This week (row 6, cont.) @ x 5302, y 8114

This week, the day, Pool entry

Set my days › This week on a day: the Work block opens to its tiers, sessions carry the link mark and "2 of 3", due words on the row, and the fit line at the foot ("Doesn't fit by 40 min at the top of the ranges", in ink). Pool sits beside the + at the foot.

Placed, Undo

After Place the sheet closes, the new row is marked once on the day shown, and a toast names where it went with Undo.

From Linear, connected

Grouped by client, then by team and project lines; status shape, ID, status word, size, due. Filters Assigned to Taylor and Not done on by default. "Synced 2 min ago" with Sync now. Already-placed issues show where, faded.

Pool search

The search grows the sheet to full height and searches both tabs by title and ID, each result saying where it lives. No match offers a new task with that title.

Place, doesn't fit

When a day can't hold it, the sheet says by how much, offers Spread or the next day with room, and still lets it be placed. Lengths only, never red.

Tier, this session or all

Changing the tier (or length) of a spread task asks This session (default) or All sessions, with the consequence for the others (D-USE-42's default).

Item sheet ··· menu

Mark the task done (closes every session and the Linear issue), Back to the pool, Spread across the week, Open in Linear, Remove from Synapse (Linear untouched).

New task, save to the pool

From the pool's New task: no days means it waits in the pool. Synapse-only work is never created in Linear.

Spread, days and tier

Spread's sub-page: each day with its free time in the chosen block, and one tier for every session. Back returns to the preview.

Connections, clients on

Each Linear workspace says how its work maps to clients. The Clients switch (off by default) shows the client list, in pool order, with a grip to reorder and Add a client.

Linear workspace, per project

One client for the whole workspace, or set per project. Never written to Linear. Disconnect sits at the foot.

Client sheet

Name, colour (not sky, plum or clay), logo upload or the letter tile, the Linear projects it covers. Removing a client moves its work to Personal.

Desk-only, drawn once

The answers point to frames that exist: Set my days on "USE — set up" and this row's day view, the Schedule tab on "USE — daily use".

## Archive · A: week strip (Today A, Week A-) @ x -560, y 9000

Archive · Direction A / Today, with a week strip / Today and its day column, with seven days across the top. Week is its own view: a matrix of tiers by day, the pool beside it.

## Note · today / A @ x 0, y 10157

today / A: week strip, one firing / 1728 / light

Shared by all three Todays (N6): the rail (Today, Week, Schedule, Workflow beta); the current block as a band; Firing above the tiers (KES-42, "firing · 4 min", the toggle a breathing verdigris dot) with "While it fires: Kegels"; Primary lifted with Start and Done; Secondary with sub-issues folded under SYN-212; Stretch; To-dos open with the daily Kegels and stretch. Each work row carries client · project · ID · status · size word, and "session n of 3" when it spans days. The day column on the right at 56 px an hour with the now-line. A only: the week strip names each day's first Primary and its first event; click a day to preview it in place. [PROPOSED] The strip shows no counts, only words. Bends N4 note 56 (more than the active block) at the desk only. Clients and titles are [placeholder].

## Note · week / A @ x 1808, y 10157

week / A: tier matrix, pool open / 1728 / light

Plan week as a matrix: rows are Events, Primary, Secondary, Stretch; columns are the seven days; a fit line per day ("Work ends 16:20", a time, never a count). The pool panel (N6): From Linear and Pool tabs, Client (All, then each client; gone when Clients is off), a size filter, search; issues grouped client, then project, with ID, size word and range, and where they already sit ("on Mon, Tue, Wed"). Dragging ALD-17 onto Tuesday's Primary adds session 2 of 3, with Undo. [PROPOSED] Urgent gets a row only when it holds something (D-USE-20 open). [PROPOSED] A Huge issue reads "bigger than a block" in the pool (D-USE-31). Strength: tiers are the planning unit, so the week reads as priorities. Cost: no sense of time inside the day; a meeting is only a chip.

## Archive · B: accordion (Today C, Week A-) @ x -560, y 10440

Archive · Direction B / The accordion week / Today wide, the other six days narrow beside it in one canvas; click one to widen it. Week makes all seven equal as a calendar, work inside its blocks.

## Note · today / B @ x 0, y 11597

today / B: accordion week, one firing / 1728 / light

Today and the day column as in A, narrower (640 and 300), with the other six days as narrow columns to the right: tier-coloured rules over each day's titles and its events. [PROPOSED] Clicking a narrow day widens it and narrows Today, the accordion; Week opens all seven at equal width with the pool. Strength: the rest of the week is always in sight, no click to glance ahead. Cost: titles wrap at that width and the frame is busy; the narrow days read as texture more than content.

## Note · week / B @ x 1808, y 11597

week / B: calendar week, pool open / 1728 / light

Plan week as a calendar: 8:00 to 18:00 at 80 px an hour, the usual week's blocks at their times, work items as chips inside their Work block with a tier-coloured edge, events in plum at their time (Kestrel at 11:00, the dentist at 15:30), a fit line in the last Work block. Same pool panel as A. [PROPOSED] Dropping onto a Work block puts the item in it, tier asked in a small menu (default Primary while Primary has room). Strength: time is real, so a meeting or a dentist visibly eats the work. Cost: tiers are only an edge colour; an item's tier is a second step on drop.

## Archive · C: planner page (Today B, Week D) @ x -560, y 11880

Archive · Direction C / Today plus a planner page / Today on the left, the week as a list of days on the right, like the Passion Planner. To plan, the pool slides over Today and the page stays.

## Note · today / C @ x 0, y 13037

today / C: planner page, one firing / 1728 / light

Today as in A on the left at 720, with no day column; the right pane is the week as a planner page (the Passion Planner, note 69): today on top as a horizontal day bar 7:00 to 22:30 at 32 px an hour with the now-line, then one row per day with its work by tier, events, and where work ends. "Plan the week" opens the pool. Strength: calm, bookish, the week always readable in words. Cost: today's schedule shrinks to a bar; times are read, not seen.

## Note · week / C @ x 1808, y 13037

week / C: pool over Today, planner page / 1728 / light

Planning in C keeps the page: the pool slides in over Today (a scrim behind it, 400 wide) and items drop onto a day row; the row shows a dashed edge and "dropping here". [PROPOSED] A drop lands in the day's first open tier, Primary while it has room, and the row's menu changes it. "Done planning" closes the pool. Strength: planning and doing share one screen; nothing new to learn. Cost: no time grid, so a crowded day shows only in its "Work ends" line.
