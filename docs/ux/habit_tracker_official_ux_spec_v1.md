# Official UX Spec v1 — Personal Habit & Day Planner (working name: Synapse)

**Author:** Vesper, Lead UX/UI Designer
**Date:** 4 Sept 2026
**Status:** Ready to build against, subject to the seven proposed rulings in §0.3 (one pass of yes/no from Taylor).
**Supersedes:** `habit_tracker_ux_spec_v1.md` (the working draft) and folds in every decision recorded in `habit_tracker_actionable_insights.md`.

> **Working name.** Your brief said "user avatar(s) synapse". I've read that as a working product name, which fits the prefrontal-to-cerebellum framing you keep returning to. `[ASSUMPTION: "Synapse" is the working name — confirm or replace; the brand guide in §9 doesn't depend on it.]`

---

## 0. How to read this document

### 0.1 Authority ladder
1. Rulings you've already made (logged in §1.2) — built on, not relitigated.
2. This spec.
3. shadcn/ui component contracts and platform (PWA) conventions, for their own scope.
4. My judgment, labelled `[VESPER CALL]` where it fills a silence, `[PROPOSED — needs sign-off]` where it touches something you flagged open.

### 0.2 The three epics
- **Epic 1 — Setup:** auth, first run, habit library, categories, templates, the week build, hard/soft marking. Planning mode. Full depth allowed.
- **Epic 2 — In use:** Plain List, Schedule, timers, multitask, late start, shift-forward, capacity trim, closing windows. Execution mode. Ruthless plainness.
- **Epic 3 — Review:** Day Review with tiered scoring, Week Review, history, export. Considered mode. Ceremony is allowed here, briefly.

### 0.3 Rulings I'm proposing (the six open ones from the last thread, plus one mine)

You never answered the six rulings at the bottom of the actionable-insights file. I haven't invented values silently; each one below is a reversible default with its cost stated. A "yes" to the whole block moves this spec to signed.

| # | Ruling | My default | Cost if wrong |
|---|---|---|---|
| R1 (F1) | Capacity trims vs. scored misses | **Separate, as you settled in v1.** A trim at assignment time is "not assigned today" and never scores. Only items that were assigned and stayed assigned can be missed. Items cut by a *shift-forward* are a third thing: they were assigned, then removed by a reasoned event, so they inherit the shift's reason and tier (§6.5). | If you'd rather shift-cuts also be penalty-free, it's a one-line rule change in §7.3. |
| R2 (F2) | "Stuck on a higher-priority thing" | **Its own no-penalty outcome, "traded up", verified by data, not self-report.** When you pick this reason you name the item you stayed on. If that item's priority is ≥ the missed item's and it was completed, the miss drops out of the score entirely (like circumstance). If not, it's scoped as mis-scoping at half. | If you'd rather keep it at half regardless, delete the verification branch in §7.3; the UI is unchanged. |
| R3 (F3) | Scoring copy | **Honest math, neutral copy.** The three tiers are labelled "Something came up / Planned it wrong / Didn't do it". The words "weak", "fail", "penalty" never appear in the interface. See §10 copy guide. | None — the math is yours verbatim. |
| R4 (F4) | Scope vs. one-day build | **Everything is specified here; the build is phased.** Phase 1 (one long day): auth, library, templates, week build, Plain List, completion, timers, a minimal Day Review (done / missed with tier). Phase 2: Schedule tab, multitask, shift-forward, capacity trim, Week Review. The schema in §3 is shaped for all of it from day one. | If you want Phase 2 in the first build, nothing changes except your day. |
| R5 (CH3) | Where wake time comes from | **From your wake-anchor habit.** One habit in the library is flagged as the wake anchor ("Immediate wake up"). The moment it's marked done, that timestamp becomes the day's `woke_at`; day parts re-anchor to it. Manual override lives in the day header. If no anchor is set, the day uses the template's planned start. | If you'd rather enter it separately every morning, the override field is already there — just unflag the anchor. |
| R6 (F5) | Review math | **Simple and inspectable, not decaying.** One unweighted adherence number per day and per week (done ÷ counted, with tiers applied), shown *with its formula* on the review screen, plus a breakdown by priority band so a missed 7 can't hide behind six done 1s. Loop-style decay is not adopted. Exact math in §7.4. | If you later want priority weighting in the headline number, the breakdown already computes it. |
| R7 (mine) | Priority scale direction | **7 is highest.** You never said which end is which. "How important is this to your life, 1–7" reads naturally as 7 = most. The trim cuts lowest first. | Flip one comparison. |

Smaller calls I made without a ruling, each reversible and flagged inline as `[VESPER CALL]`: "soon" = 15 minutes before a fixed start (§6.2); the closing-window nudge applies to windowed items only (§6.7); Week Review shows numbers first with a seven-day strip per habit, not a contribution grid (§7.5); Google Calendar sync is Phase 2, read-only (§5.7); adjustable trims are allowed as a swap after the auto-trim is shown (§6.8).

### 0.4 Assumptions carried
- `[ASSUMPTION: accessibility target is WCAG 2.2 AA]` — none was stated; I've designed to it.
- `[ASSUMPTION: surfaces in scope are the installed PWA on iOS Safari, Android Chrome, and desktop Chrome/Safari, both light and dark themes]`.
- `[ASSUMPTION: shadcn/ui on Tailwind, Supabase (Postgres + Auth + Edge Functions) — per your actionable-insights file and your default stack]`.
- `[ASSUMPTION: the "invite friends" addition means private per-user accounts, no shared or social data of any kind, and no billing]`.
- `[ASSUMPTION: day auto-close is 3:00 local]` — you gave "around 3am" as an example in round 3 and never confirmed it. Still open, still the working default.

---

## 1. Review of the last thread — do I agree?

Short answer: yes on the substance, with six amendments. The process was sound — three lenses on a raw transcript, then narrowing rounds, then a spec, then research integration — and the honesty core survived every round intact. That's the thing worth protecting and it was protected. What follows is where I'd correct the record, not where I'd reopen it.

### 1.1 Where I diverge or amend

**A1. Two scheduling models were never reconciled.** The v1 spec built a Routine → Cluster → Variant → weekly-quota hierarchy with a daily "which variant" prompt. Your onboarding answers in the research round describe a flat Habit library → Templates → Week build. Both are in the current record and they contradict each other. I've reconciled them (§3): a **Template** *is* the former Variant. It carries an optional weekly target (the former quota), and "cluster" is reduced to a typical-days hint on the template. The daily variant prompt is gone; the week build is where you decide which day gets which template. The morning is execution, as you said. Nothing you asked for is lost.

**A2. Google Calendar sync fell out of the record.** The synthesis report put it in v1 build; the v1 spec never mentioned it; nothing since has re-raised it. I've put it back as Phase 2, read-only import into hard-scheduled appointments (§5.7). Flagging so it stops disappearing.

**A3. Required reasons collide with the low-bandwidth night.** Tiered scoring makes the reason mandatory (the tier *is* the score), which Sage rightly worried about back in round 2. I accept the mechanic and resolve the collision structurally: the Day Review can be left partially done. Unreviewed items enter a visible **pending** state — never missed, never scored, never disappearing — and the review can be finished the next morning. Nothing is silently resolved, and nothing is forced at 11pm.

**A4. Multi-user changes the trust posture, not the product.** The reasoning behind "always-on features, cloud-first, no toggles" was "you're the only user and you know what you want." That still holds for the product. What changes with invited friends: row-level security is a design promise, every user gets export and delete-account, onboarding has to work for someone who never read these documents, and a small optional starter library becomes hospitality rather than persuasion (§4.3). No social surface of any kind — nobody can see anyone else's data, including you as the owner of the project.

**A5. Wake-relative day parts produce an odd third block.** Three consecutive 8-hour blocks from a 7:00 wake give Morning 7–15, Afternoon 15–23, Evening 23–7 — an "Evening" that's mostly asleep. I've kept your rule exactly (it's a logged decision) and made the Plain List's Evening section simply end at the last scheduled item, so the label never sits over a dead five-hour span. `[Consider: if you'd rather have Evening end at your lights-out target, say so; it's a one-value change.]`

**A6. Two undefined terms in the v1 spec.** "Soon" never had a threshold and priority never had a direction. Both are now defined (§0.3 R7, §6.2).

### 1.2 Decisions I'm treating as settled (the log)

From rounds 2–3 and the v1 spec: two tabs, Plain List default · execution vs. planning are separate modes · no live percentage during the day · closing-window nudge at ~5–10% remaining, loose · missed items resolve at review, case by case, nothing vanishes · habits reset weekly, tasks and appointments carry forward · coach not designed in v1, data shaped for it · three-tier icons (emoji / curated + color / custom upload) · timers across types, never the completion signal · pause/resume supported, lower priority · passed items fade but stay interactive · one item per exact time unless deliberately multitasked · each multitask member completes independently · ghost-and-annotate for late starts · capacity trim = "not assigned today", never missed · no alarm register anywhere.

From the research integration: superset → **Multitask** · ghost-and-annotate kept, compress-forward rejected · accessibility baked into tokens · Fabulous/Habitica persuasion patterns are explicit non-goals · Way of Life's consequence-free skip rejected — a skip has a consequence, relief comes only from the reason · all features always-on · no widgets in v1 · no reference-app trials · 1–7 is the universal rating currency · monochrome foundation with semantic color as punctuation · day parts wake-relative · quantity is an optional field, not a type · vacation mode is unnecessary (an unplanned week produces nothing to miss) · Supabase cloud-first · shift-my-day-forward is first-class with required reason, hard anchors don't move, cuts inherit the reason · tiered miss scoring · onboarding as a full configuration flow · time range on the habit, duration chosen per slot · two-level priority (life default → per-template override) · hard vs. soft scheduling on every item.

Added in this brief: free sign-up/sign-in so friends can try it.

---

## 2. Product frame

### 2.1 One sentence
A private daily list — habits, tasks, appointments, deep-work blocks — that you build once a week from templates, move through without thinking, and close honestly each night, recording what happened rather than rewriting it.

### 2.2 Who is here, in what state
Three states, not three personas. The same person is each of them on different days.

| State | When | Budget |
|---|---|---|
| **Planning** | Sunday, or the night before a big day. Calm, has bandwidth. | Depth is fine. Multi-step flows, full configuration, the 1–7 thinking. |
| **Executing** | Mid-morning, mid-day, phone in one hand, deliberately not thinking. | One idea per screen. Targets ≥ 44px. No configuration reachable without leaving the tab. Zero copy that asks a question you didn't come to answer. |
| **Reviewing** | 9–11pm, tired, possibly disappointed in the day. | Three taps per item, maximum. Neutral copy. An exit that leaves things pending rather than forcing them. |

Invited friends arrive in a fourth state — **curious and uncommitted** — for exactly one session. First-run (§4.2) is designed for that state and then gets out of the way.

### 2.3 Emotional contract
After every screen, the user should find it cheap to believe: *nothing I did was lost; nothing was rewritten on my behalf; I'm being shown a record, not a verdict; I can undo this.*

### 2.4 Binding guardrails (all carried from prior rounds; none new)
1. The now/soon marker, the off-schedule violet, and the missed treatment are three distinct registers; none may be red, flashing, or countdown-shaped.
2. A capacity-driven trim is *not assigned today*, never *missed*.
3. Faded is not disabled. Every passed item is fully interactive.
4. Closing-window signals inform; they never pressure. No hard countdowns.
5. Multitask members never infer completion from each other.
6. The record is annotated, never rewritten: ghost-and-annotate for late starts, shift events logged, edits keep history.
7. No AI commentary ships in v1. The data must be clean enough that it could.
8. No streaks, badges, confetti, HP, commitment contracts, party damage, re-engagement pushes, or any copy that says "you failed".

---

## 3. Data model (v2 — supersedes Part 2 of the draft spec)

Field names are the ones I'd expect to see in the schema. Everything is scoped to `user_id` with row-level security; no table is readable across users.

### 3.1 User
- `id`, `email`, `display_name`, `avatar` (initials by default; optional image via the same upload pipeline as custom icons)
- `timezone` (defaults from device; editable)
- `day_close_time` `[PROPOSED: 03:00]`
- `review_reminder_time` (default 21:00; §8)
- `notification_prefs` (§8.4)
- `wake_anchor_habit_id` (nullable)

### 3.2 Category
- `name`, `color_key` (one of the eight category hues, §9.3), `user_id`
- Free-defined. A habit has at most one category. Used for time-distribution reporting only — never for any mechanic.

### 3.3 Habit (the library entry)
The reusable definition. It never appears on a day directly; it gets *slotted* into a template or placed as a one-off.
- `type`: `habit` | `task_appointment` | `deep_work`
- `title`, `icon` (`{kind: emoji|curated|custom, value, color_key?}`)
- `category_id` (nullable)
- `duration_min` / `duration_max` — the **range** of time it might take (required for `habit` and `deep_work`; optional for `task_appointment`)
- `life_priority` 1–7 (7 highest) — "how important is this to your life"; the default priority wherever it's slotted
- `is_wake_anchor` (bool; at most one per user)
- `quantity_unit` (nullable; e.g. "pages", "reps", "min") — presence of this field means the item captures a number; it never changes the binary completion
- `reflection_axes`: 0–2 labels (e.g. "focus", "ease") rated 1–7 at reflection time
- `default_notes_preflight` (nullable free text)
- `archived_at` — library entries are never hard-deleted while any day references them

### 3.4 Template (the former Variant)
A named day plan, built in planning mode, applied to days during the week build.
- `name` (e.g. "Morning A", "Workout day", "Vacation")
- `typical_days` (nullable set of weekdays — a hint shown during the week build, nothing more; this is what "cluster" reduced to)
- `weekly_target` (nullable int — the former quota; shown as "used 1 of 2" during the week build)
- `anchor_time` — the time the template's `00:00` offset maps to when applied (default 07:00; overridable per day)
- `slots[]` → TemplateSlot

### 3.5 TemplateSlot
- `habit_id`
- `time_mode`: `fixed_time` | `window` | `unscheduled`
- `offset_start`, `offset_end` — minutes from the template anchor (so the whole template can be applied at 06:00 or 08:00 without editing slots; this is also what makes shift-forward cheap)
- `duration` — a specific value chosen from within the habit's range
- `priority_override` (nullable 1–7) — per-template override of `life_priority`
- `scheduling`: `hard` | `soft` — hard anchors never move under shift-forward
- `multitask_group` (nullable local id) — two slots sharing a start offset must be in the same group or the template won't save
- `sort_order` within its time position

### 3.6 WeekPlan and Day
- **WeekPlan**: `week_start_date`, `status` (`unplanned | planned`), `days[]`
- **Day**: `date`, `template_id` (nullable — a day with no template is an empty day, which is how vacation works), `anchor_time` (the applied start), `woke_at` (nullable; set by the wake anchor or by hand), `closed_at`, `close_reason` (`manual | auto`), `capacity_min` (nullable — set only if a trim was requested that day)

### 3.7 DayItem (the instance)
Materialised from the template when the week is built, or created one-off. This is the row the two execution tabs render.
- `habit_id`, `day_id`, `title` (snapshotted), `icon` (snapshotted)
- `time_mode`, `scheduled_start`, `scheduled_end` (absolute timestamps, computed from offsets + anchor; recomputed on shift)
- `original_scheduled_start` — never changes after materialisation; the ghost renders here
- `duration`, `priority` (resolved: override → life default), `scheduling` (`hard|soft`)
- `multitask_id` (nullable)
- `assignment_state`: `assigned` | `not_assigned` (trimmed) | `cut_by_shift`
- `completion_state`: `upcoming` | `active` | `done` | `missed` | `carried` | `pending_review`
- `done_at` (nullable) — if outside `original_scheduled_start..scheduled_end`, the item is *off-schedule*; that's derived, not stored
- `timer_sessions[]` `{started_at, ended_at, source: timer|manual}`
- `quantity_value` (nullable)
- `notes_preflight`, `notes_reflection`, `reflection_ratings` `{axis: 1–7}`
- `miss` (nullable) → Miss
- `origin`: `template` | `one_off` | `carried_from(day_item_id)` | `calendar_import(event_id)`

### 3.8 Miss
Exists only after a Day Review or a shift-forward resolves an item as missed.
- `tier`: `circumstance` (0 — no weight) | `scoping` (1 — half) | `chose_not_to` (2 — full)
- `reason_key` (from the user's reason set) and `reason_text` (nullable free entry)
- `traded_up_item_id` (nullable) — set when reason is "stayed on something more important"; the resolver (§7.3) checks it
- `resolved_by`: `day_review` | `shift(shift_id)`

### 3.9 Shift
- `day_id`, `at`, `delta_min`, `reason_key`, `reason_text`, `tier`, `cut_item_ids[]`
- One row per shift so the Day Review can show "shifted 60 min at 8:10 — slept in".

### 3.10 ReasonSet (per user, editable)
Default rows, each with a default tier:

| reason_key | Label | Default tier |
|---|---|---|
| something_came_up | Something came up | circumstance |
| unwell | Not feeling well | circumstance |
| ran_long | Earlier thing ran long | scoping |
| slept_in | Slept in | scoping |
| stayed_on_important | Stayed on something more important | scoping → may resolve to *traded up* (§7.3) |
| chose_not_to | Didn't do it | chose_not_to |
| other | Other (free entry) | user picks tier |

New free-entry reasons can be promoted to the set from the Day Review with one tap ("keep this reason").

### 3.11 Deliberately not in the model
No streak, no score cache (computed on read), no social graph, no coach output table. Reports are views over DayItem + Miss + Shift.

---

## 4. Epic 1 — Setup (planning mode)

### 4.1 Auth

**Job:** get a person into their own private space with the least ceremony that still keeps the space private.

- **Methods:** Google sign-in (primary button, because Calendar consent later reuses the same identity) and email + password (secondary). `[VESPER CALL: no magic links — the email round-trip on a phone breaks the install flow more than a password does.]`
- **Screens:** Sign in · Create account (display name, email, password) · Forgot password · Check your email (verify) · Reset password. One form per screen, one primary action, the alternate route as a text link below. No marketing copy, no feature bullets, no "join thousands".
- **Free:** nothing in the product references a plan, a tier, or a limit. No paywall components exist.
- **Invite a friend:** in Settings — a single "Share the app" action using the Web Share API (falls back to copy-link). No invite tokens, no referral counts, no "3 friends joined".
- **Trust surface:** Settings → Your data: "Export everything (CSV/JSON)" and "Delete account and all data" (typed confirmation, the only place the destructive red token is permitted, §9.3). A one-line promise sits above both, in the same treatment everywhere it appears: *Only you can see your data. Not the people who built this, not anyone you invite.*
- **States:** loading (button shows an inline spinner, label unchanged) · error (specific: "That password doesn't match this email", never "Something went wrong") · offline (form disabled with "You're offline — sign-in needs a connection") · verify-pending (the app is usable read-only? No — `[VESPER CALL]` block until verified; a single screen says which address to check and offers "Resend").

### 4.2 First run (new account, empty state)

**Job:** turn a curious stranger into someone with a usable Monday, in under ten minutes, without persuading them of anything.

Sequence, one screen each, progress shown as "2 of 5" in the header (this is a sequence; numbering is earned):

1. **Your day, roughly.** Wake time target (time picker, default 07:00) and timezone confirmation. This seeds `anchor_time` and nothing else.
2. **Habits.** "What do you want to keep doing?" — a flat list builder. Two ways in: type your own, or "Start from a small set" which reveals ~10 editable examples (wake up immediately, cold shower/bath, meditate, stretch, read, walk, lift, plan tomorrow…). Each added habit immediately asks the two things it needs (§4.3). Starter items are plain and editable, and none of them is pre-checked. `[Hospitality, not persuasion: this is the whole difference from Fabulous.]`
3. **A first template.** "Build a typical morning" — drag the habits you just made onto a vertical list, set start offsets and durations. Skippable; the week build can happen later.
4. **This week.** Apply the template to the days you want. Skippable.
5. **Done.** One line: *Your list is ready. Change anything from Settings.* Primary action: "Open today".

Nothing here asks for notification permission (§8.3), a photo, a goal statement, or a commitment. Taylor's own path through this is the same path; there is no hidden owner mode.

### 4.3 Habit library (CRUD)

**Job:** define each thing once, with the two facts the rest of the system needs.

**Create/edit sheet** (bottom sheet on mobile, side panel on desktop), fields in this order:
1. Title (autofocus)
2. Type — segmented: Habit · Task/appointment · Deep work. Copy under the control explains the consequence in one line each: *Habits reset each week. Tasks carry forward until done. Deep work is a timed block.*
3. Icon — emoji picker · curated icon + color · upload image (crop to square, 256px, stored per user)
4. Category — chip picker, "+ New category" inline
5. **Time it might take** — range slider or two fields, minutes. Required for Habit and Deep work.
6. **How important is this to your life?** — 1–7 stepper, 7 highest. One line under it: *This becomes its default priority. You can change it per template.*
7. Optional, collapsed under "More": quantity unit · reflection axes (up to 2) · preflight note · "This is my wake-up habit" toggle (turning it on moves the flag from any other habit, with a confirmation line)

**Library list:** grouped by type, then category; search; archive (never delete — the copy says "Archive" and explains "Past days keep their record"). Archived section collapsed at the bottom.

**States:** empty ("No habits yet. Add one, or start from a small set.") · saving (sheet stays open, button label unchanged, spinner inline) · error (field-level, specific) · offline (edits queue locally and show a small "Saved on this device — syncs when you're back" line; `[VESPER CALL: Phase 2 — Phase 1 can simply block with a plain message]`).

### 4.4 Templates (CRUD)

**Job:** describe a kind of day once so building a week is placement, not authoring.

**Template editor** — the one screen in the product that earns density:
- Header: name, anchor time (default 07:00), optional weekly target, typical-days hint (weekday chips).
- Body: a vertical list of slots. Each slot row shows icon, title, time mode, `start–end` (displayed as clock times against the anchor, stored as offsets), duration, priority (shows the life default; tapping reveals the override stepper and a small "overridden" mark when changed), and a hard/soft toggle rendered as a text pair: **Fixed** · Flexible. `[Copy note: "hard/soft" is the schema word; the interface says Fixed/Flexible.]`
- Adding a slot: pick from the library; the duration defaults to the midpoint of the habit's range; time mode defaults to fixed; start defaults to the end of the previous slot (so a template builds like a stack).
- Same-start conflict: if a second slot lands on an occupied start, the editor asks inline — *Do these happen at the same time?* — with **Yes, multitask** · **No, move it**. There is no third option and no silent stacking.
- Footer: total planned minutes and the sum against the anchor ("07:00 – 09:35 · 155 min"). No judgement copy; the number is the feedback.

**Reduction pass applied:** no drag handles on mobile (reorder via up/down in the row's overflow), no color wash per row, no card borders — rows are separated by a hairline and vertical rhythm.

**Duplicate template** is a first-class action (Morning A → Morning B is the common case).

### 4.5 Week build

**Job:** assign templates to days for the coming week, in one sitting, with the week's targets visible.

- Layout: seven columns on desktop, seven stacked rows on mobile, Monday-first (`[VESPER CALL: week starts Monday; Sunday is your rest day and the natural build day]`).
- Each day shows: the applied template name and anchor time, or "Nothing planned" in muted text. Tapping opens a picker listing templates with their weekly-target status ("Morning A · 1 of 2 this week") and typical-days hint. The most-behind template gets a light visual nudge — a single small marker, not a sort — the informational default you signed off on in draft §3.4.
- Per day: change anchor time; add one-off items (a task, an appointment) without a template; remove the template.
- One-off items placed here are `hard` by default when given a fixed time (appointments), `soft` otherwise.
- Applying a template **materialises** DayItems immediately (so the Plain List works offline the next morning). Editing the template later asks: *Apply to this week's planned days too?* — Yes · Only future days · No.
- Next-week build reminder: §8.

**States:** unplanned week (every day "Nothing planned", a single line at top: *Pick a template for each day you want planned. Days you leave empty are empty.*) · partially planned · offline (read-only, plain message) · a template was archived after being applied (day keeps its items; the picker shows the archived name greyed).

### 4.6 Settings
Account (name, avatar, email, password, sign out) · Notifications (§8.4) · Day (close time, review reminder time, timezone) · Reasons (edit the reason set and default tiers) · Categories · Your data (export, delete) · Share the app · Appearance (System / Light / Dark).

### 4.7 Google Calendar (Phase 2, read-only)
Connect via the Google identity already used for sign-in (or a separate OAuth if the account is email-based). Events import as `task_appointment` DayItems, `fixed_time`, `hard`, `origin: calendar_import`. They render with a small calendar glyph instead of an icon, can be marked done or missed like anything else, and are never written back. Declined/all-day events are skipped. `[OPEN: which calendars, and whether imports count in the adherence number — my default is they count, because you assigned yourself the appointment by accepting it.]`

---

## 5. Epic 2 — In use (execution mode)

The two tabs share one state matrix (§5.9) and one card component (§9.7). Nothing configurable is reachable inside either tab; the only mutations available are the ones a person moving through a day actually needs: start, done, undo, add a one-off, shift the day, trim for capacity, and note.

### 5.1 App shell
Bottom tab bar, three tabs: **List** · **Schedule** · **Review**. Settings is a small avatar button in the header, not a tab. On desktop the bar becomes a left rail. Tabs are word labels, no icons alone (§10).

### 5.2 Plain List (default tab)

**Job:** move through today without deciding anything you don't have to.

**Layout**
- Header: the day ("Friday 4 Sept"), the applied template name in muted text, and — only if `woke_at` is set — "Woke 7:04". Tapping the header opens a small sheet: set wake time · I have less time today (§5.8) · Shift my day (§5.6) · Add a one-off. Four rows, nothing else.
- Sections by day part, computed from `woke_at` (fallback: `anchor_time`): **Morning · Afternoon · Evening**. The Evening section ends at the last scheduled item. Unscheduled items sit at the bottom of the day part they were slotted in, or under a final "Anytime" section if they have no part.
- Rows in time order. Each row (§9.7): 44px checkbox target on the left; icon; title; time text on the right (`7:20` for fixed, `1:00–4:00` for windows, blank for unscheduled); a hairline category accent on the far left edge, 2px wide — colour as punctuation, never a wash.
- **Now / soon marker:** a small filled dot in `accent-500` plus the word *now* or *soon* in `accent-600` text beside the time. Soon = 15 minutes before a fixed start `[VESPER CALL]`. Windows show *open* while inside the window. Because the marker is dot + word, it survives colour-blindness and monochrome.
- Off-schedule completion: time text turns `violet-600` and reads "7:20 → 4:32". Colour plus the arrow — never colour alone.
- Passed items: opacity 0.55, fully interactive.
- Multitask members: rendered as one grouped block with a shared left bracket, each row still has its own checkbox.
- Not-assigned items (trimmed): absent from the list; a single muted line at the bottom of the day, "3 not assigned today", expands to show them in the same faded treatment without checkboxes, with a **Bring back** action per item (§5.8).

**Interactions**
- Tap checkbox → done (`done_at = now`). Undo available for 5 seconds inline (the row shows *Done · Undo*), and always by tapping again.
- Tap the row → item sheet: Start / Stop timer · quantity field if the habit has one · preflight note (read) · reflection (two 1–7 steppers if configured, free text) · Mark done · Not today (only reachable here; it does not resolve the item, it simply collapses it to the bottom of its section so you stop scanning past it — the Day Review still asks about it).
- A done item with a quantity unit shows the value inline after the title ("Read · 24 pages").

### 5.3 Schedule (second tab)

**Job:** where does the day sit against the plan — the "on time or behind" check-in.

- A vertical time axis on the left (hour labels, 15-minute hairlines), starting one hour before the first item and ending one hour after the last; the axis scrolls; the current time is scrolled into view on open.
- Items are blocks whose height is duration; windows render as a lighter, taller span with the item block floating at its top until started, then at the actual start.
- **Now line:** a 1px `accent-500` rule with a small dot at the axis, moving each minute. Everything above it drops to 0.55 opacity, fully interactive.
- Same time, no multitask → cannot exist (§4.4 prevents it). Multitask → blocks sit side by side in the same time band, each with its own state.
- **Late start (ghost-and-annotate):** tapping a passed block and hitting Start leaves a ghost at `original_scheduled_start` (block outline only, title struck through, `neutral-400`) and creates the live block at now with a 1.5px `violet-500` border and a small "moved" word. Both remain. Done later at the live position.
- Hard items show a small anchor glyph beside the title; soft items don't. This is the only place the distinction is visible in execution mode.
- Shift events render as a thin `violet-300` horizontal band at the time of the shift with the reason text in small type ("Shifted +60 min · slept in").

### 5.4 Timers
- Start/Stop on the item sheet and as a secondary control on the Schedule block. Starting sets `completion_state = active` and shows a running elapsed time in the row (tabular figures).
- Pause/Resume: same control, lower build priority; each segment is a `timer_session`.
- Stop does not mark done. Done does not require a timer. Manual entry of start/end after the fact is always available on the sheet ("Add time by hand").
- Only one timer runs at a time except inside a multitask group.

### 5.5 Multitask (formerly superset)
- Created in the template editor or by adding a one-off at an occupied time (same inline question as §4.4).
- In execution: a grouped block; each member has its own checkbox, timer and state; a running timer on one member does not start the other.
- Dissolving a group is a template-level action, not an execution-mode one.

### 5.6 Shift my day forward
**Entry:** day header sheet → *Shift my day*. Also offered inline once when the first fixed item of the day is 30+ minutes passed and untouched: a single quiet row at the top of the List — "Running late? Shift the day" — dismissable, never repeated that day. `[VESPER CALL: this is an offer, not a nudge; it appears once and says nothing about being behind.]`

**Flow (one sheet, three steps):**
1. Amount — +15 · +30 · +60 · custom minutes.
2. Reason — the reason set as a vertical list of large targets; "Other" opens a text field and a tier picker. Required; the primary button stays disabled until chosen.
3. Fit — the sheet applies the shift to every soft item and shows the consequence: *2 items no longer fit before your 11:00 call.* Below, the items that overflow (a soft item now overlapping a hard item, or pushed past the day's last hard anchor / past `day_close_time`), pre-sorted lowest priority first with the lowest ones pre-selected as cuts. You can change the selection. Primary: **Shift and cut 2** (label carries the number). Secondary: **Cancel**.

**Result:** a Shift row; cut items become `assignment_state = cut_by_shift`, `completion_state = missed`, with a Miss inheriting the shift's reason and tier; a violet shift band appears on the Schedule; the List re-sorts. Undo for 10 seconds; after that, the shift is a logged event and reversing it is another shift.

Hard items never move. If the shift makes a hard item's start earlier than now, it's flagged in step 3 as "already passed — will show as late" rather than cut.

### 5.7 Calendar-imported items
Per §4.7; in execution they behave as hard, fixed appointments with a calendar glyph.

### 5.8 Capacity trim ("I have less time today")
**Entry:** day header sheet. **Flow:** one sheet — "How much time do you have?" with a minutes field pre-filled with today's planned total, and quick chips (−15, −30, −45, −60). On confirm the system trims soft, assigned items lowest priority first until the total fits, then shows the result: *Fits in 45 min. Not assigned today: Yoga, Face training, Vocal.* Each trimmed item has a **Keep instead** control that swaps it back in and trims the next-lowest (`[VESPER CALL on draft Q7]` — allowing the swap after the auto-trim keeps the morning decision light while not locking you out). Hard items are never trimmed.

Trimmed items are `not_assigned`, absent from the list body, never scored, and visible under "not assigned today" with **Bring back**.

### 5.9 State matrix — item card, both tabs

| State | Visual (List) | Visual (Schedule) | Interactive | Notes |
|---|---|---|---|---|
| Upcoming | Default row | Default block | Yes | |
| Soon (≤15 min to fixed start) | `accent-500` dot + "soon" | Same marker on block | Yes | Informational register only |
| Now / window open | dot + "now" / "open" | Now line intersects block | Yes | |
| Active (timer) | Elapsed time replaces time text; small pulse-free running glyph | Block border `accent-500` 1.5px | Yes — Stop/Pause | No motion beyond the digits changing |
| Passed, untouched | 0.55 opacity | 0.55 opacity | Yes, fully | Never disabled |
| Done, on schedule | Checkbox filled, title `neutral-600` | Block filled `neutral-200`, check | Yes — undo/edit | |
| Done, off-schedule | As above; time text `violet-600` with "→ actual" | Ghost at original; live block with `violet-500` border | Yes | Both visible; the record is annotated |
| Multitask member | Grouped bracket, own checkbox | Side-by-side in band | Yes, independently | |
| Not assigned today | Absent; listed under a muted expander, no checkbox | Absent | Bring back only | Capacity decision, not a failure |
| Cut by shift | Absent; listed under "cut when you shifted", no checkbox | Ghost outline only | Read-only until Day Review (where the inherited reason can be edited) | Scored by the shift's tier |
| Missed (resolved) | Only visible in Review/history: title, small neutral "missed · reason" | Ghost outline | Editable via Day Review history | Never red |
| Carried forward | Appears next day with "from Thu" in muted text | Placed unscheduled | Yes | Tasks/appointments only |
| Pending review | Only after day close: row in Review with "needs a decision" | — | Yes | Never auto-resolves |
| Offline (any) | Small header line "Offline — changes save on this device" | Same | Yes for local actions | Timer keeps running locally |
| Loading | Skeleton rows in `neutral-200`, no shimmer | Skeleton blocks | No | Reduced-motion identical |
| Empty day | Two lines: *Nothing planned today.* / **Plan this day** · **Add a one-off** | Axis only, same two actions | Yes | Hospitality, not apology |

Focus-visible on every interactive element: 2px `accent-500` ring, 2px offset, in both themes.

### 5.10 Copy in execution mode
Every string on these two tabs is a noun, a time, or a verb in the imperative. No question marks except inside sheets the user opened. No "you". No adjectives. The full register is in §10.

---

## 6. Epic 2 supplement — rules the screens depend on

### 6.1 Day boundaries
A Day opens at `day_close_time` (default 03:00) and closes by **Day Complete** or automatically at the next 03:00. Items done between midnight and 03:00 belong to the day that started the previous morning.

### 6.2 Now and soon
*Now* is any minute inside `[scheduled_start, scheduled_end)` for fixed items, or inside the window for windowed items (labelled *open*). *Soon* is the 15 minutes before a fixed start `[VESPER CALL]`. Unscheduled items are never now or soon.

### 6.3 Off-schedule
Derived: `done_at` outside `[original_scheduled_start, scheduled_end]`. Done is done; off-schedule is a separate count in Review. A shifted item's `scheduled_start` moves but its `original_scheduled_start` does not, so an item done on the shifted schedule still reads as off-schedule against the plan — which is honest, and which is why the shift's reason is required.

### 6.4 Day parts
`woke_at` (or `anchor_time` until it's set) starts Morning; Afternoon at +8h; Evening at +16h. Section headers recompute when `woke_at` is captured; items keep their times.

### 6.5 Shift-cut inheritance
Cut items get `Miss{tier: shift.tier, reason_key: shift.reason_key, resolved_by: shift}`. Editable at Day Review.

### 6.6 Priority resolution
`priority = slot.priority_override ?? habit.life_priority`. Trims and shift-cut suggestions sort ascending (1 first). Ties: shorter duration first, then later start.

### 6.7 Closing-window nudge
For windowed items only `[VESPER CALL]`: when the remaining window falls to the greater of 10% or 10 minutes, one push (§8) and the row's word changes from *open* to *closing*. No countdown, no colour change. For fixed items with a hard next anchor, nothing — the Schedule tab is the check-in for that.

### 6.8 Trim swap
After an auto-trim, **Keep instead** re-adds the item and trims the next-lowest soft item; if nothing else can be trimmed, the sheet says so and lets the total exceed capacity.

---

## 7. Epic 3 — Review (considered mode)

### 7.1 Review tab
Three regions, in order: **Today** (or the most recent unclosed day), **This week**, **History**. The Week Review is reachable any day; it simply says "so far" until Sunday closes.

### 7.2 Day Review

**Job:** close the day honestly, once, without dragging it out. Three taps per item, maximum.

**Entry:** "Day Complete" at the bottom of the List and on the Review tab; the review reminder push (§8); or automatically at `day_close_time`, which does *not* run the review — it closes the day and leaves undone items **pending review**, visible the next morning at the top of the Review tab and as a single muted line at the top of the List ("Yesterday has 3 items to review"). Pending items are never scored and never disappear.

**Screen**
- Header: the date, done count in plain words ("9 of 12 done · 2 moved"), and — only here, never on the List — nothing else numeric. The percentage appears after the review is finished, not before, so the number describes the reviewed day rather than the unreviewed one.
- One section per undone item, in schedule order. Each is a small panel: icon, title, scheduled time, and two large targets:
  - **Carry forward** (tasks/appointments only; hidden for habits and deep work)
  - **Missed**
- Choosing **Missed** expands the panel in place with the three tiers as full-width rows, each with its sub-reasons beneath as chips:
  - *Something came up* — Something came up · Not feeling well · Other
  - *Planned it wrong* — Earlier thing ran long · Slept in · Stayed on something more important · Other
  - *Didn't do it* — (no chip; the row itself is the answer)
  - A small line under the tier names, visible but quiet: *counts as done for the record · counts half · counts as missed*. This is the only place the weighting is stated in words.
- "Stayed on something more important" opens a one-tap picker of today's done items; picking one sets `traded_up_item_id` (§7.3).
- Optional free-text note per miss; optional "keep this reason" to add a free entry to the reason set.
- Shift-cut items appear in the same list, already resolved with the shift's reason, with a single "Change" affordance.
- Reflection: any done item with reflection axes shows its 1–7 steppers here if not already rated; free text; collapsed by default under "Add reflections".
- Footer: **Finish review** (primary) · **Finish later** (secondary — leaves the rest pending). Finishing shows the day's number and the one-line formula beneath it (§7.4), then returns to the Review tab.

**States:** nothing to review (*Every item was done. Nice, plainly.* — no confetti) · partially reviewed (pending count at top) · offline (decisions queue) · editing a past day's review (same screen, header says "Editing Thursday").

### 7.3 Resolver — how a miss becomes a number
```
if item.assignment_state == not_assigned         → excluded
if miss.tier == circumstance                     → excluded
if miss.reason == stayed_on_important:
    t = traded_up_item
    if t.done and t.priority >= item.priority    → excluded  ("traded up")
    else                                         → credit 0.5
if miss.tier == scoping                          → credit 0.5
if miss.tier == chose_not_to                     → credit 0
if done (on or off schedule)                     → credit 1
pending_review                                   → excluded until resolved
carried                                          → excluded today; scored on the day it resolves
```

### 7.4 The number
`adherence = sum(credit) / count(items not excluded)`, rounded to a whole percent. Shown with its formula in words directly beneath: *9 done, 1 planned wrong (½), 1 didn't do (0), 1 excused (not counted) → 9.5 / 11 = 86%.* No decimals, no colour, no arrow. A second row: *Off-schedule: 2 of 9 done.* A third: *By priority — high (5–7): 4 of 4 · mid (3–4): 4 of 5 · low (1–2): 1.5 of 2.*

### 7.5 Week Review
- Header: the week, adherence for the week (same formula over seven days), the priority-band row, and template usage against targets ("Morning A 2 of 2 · Morning B 1 of 2 · Workout 3 of 3").
- Per-habit strip: one row per habit assigned that week — icon, title, then seven small squares (Mon–Sun) using the tier register: filled `neutral-800` done · half-filled done-off-schedule glyph · `neutral-300` outline "excused" · hatched half for scoping · empty for chose-not-to · blank for not assigned. Each square has a text tooltip and an accessible label; the row ends with "4 of 5" in tabular figures. `[VESPER CALL: this is the seven-day strip, not a GitHub grid — it answers "which habit slipped" faster than a heatmap and carries the tier information a binary grid can't.]`
- Below: **Carried across the week** (tasks that rolled over the Sunday boundary), **Shifts this week** (count, total minutes, most common reason), **Time by category** (a single horizontal stacked bar using category hues, with minutes listed beside each segment — no pie).
- History region: past weeks as a plain list; past days open the Day Review in editing mode.

### 7.6 Export
Settings → Your data → Export. Produces a zip: `days.csv`, `items.csv`, `misses.csv`, `shifts.csv`, `timer_sessions.csv`, and `synapse-export.json` (full graph). Generated by an Edge Function, delivered as a download link; the button label is "Export everything" and the confirmation is "Your export is ready" with the file size.

### 7.7 The coach (not designed)
No surface, no copy, no cadence. The only obligation this version has: every field in §3 is captured with timestamps and reasons, so a future weekly, invited, descriptive-only reviewer could read it. Recorded so no one "improves" the Week Review into a coach by accident.

---

## 8. PWA notifications

### 8.1 Principles
A notification is a scheduled fact, delivered once, at the time you assigned it, in your own words. It never reports a miss, a streak, a percentage, or how long it's been since you opened the app. If a notification wouldn't be welcome as a line in your own notebook at that moment, it doesn't exist.

### 8.2 Catalogue

| # | Trigger | When | Title / body | Actions | Default | Phase |
|---|---|---|---|---|---|---|
| N1 | Fixed-time item start | At `scheduled_start`, for `fixed_time` items with `scheduling: hard` or `soft` | *Immediate wake up · 7:00* / (preflight note if any, else nothing) | Start · Done | On | 1 |
| N2 | Window opens | At window start, `window` items | *Calls · window open until 4:00* | Open | Off | 2 |
| N3 | Window closing | Remaining ≤ max(10%, 10 min) of the window, once | *Calls · window closes at 4:00* | Open | On | 2 |
| N4 | Day Review reminder | `review_reminder_time`, only if the day has undone items and isn't closed | *Close out today* / *3 items to decide on* | Review · Later (snoozes 60 min, once) | On | 1 |
| N5 | Pending review | The morning after an auto-close, at `anchor_time` + 60 min, once | *Yesterday has 3 items to review* | Review | On | 1 |
| N6 | Week build | Sunday 18:00 local (editable), only if next week is `unplanned` | *Next week isn't planned yet* | Plan | On | 1 |
| N7 | Week Review ready | When Sunday closes | *Your week is ready to look at* | Open | On | 2 |
| N8 | Timer running | While any timer is active — a silent, persistent notification showing elapsed time (Android/desktop; not supported on iOS, degrade silently) | *Weightlifting · 23:14* | Stop · Pause | On | 2 |
| N9 | Calendar item start | Same as N1 for imported appointments, plus a 10-minute lead | *Dentist · 2:30 (in 10 min)* | — | On | 2 |

Grouping: items with the same start minute collapse into one notification listing both titles. Multitask groups send one.

### 8.3 Permission
Never requested at sign-up or first run. Requested in context the first time a fixed-time slot is saved into a template or a one-off, from a small sheet: *Want a reminder at 7:00 when this comes up? Reminders are only ever the times you set.* — **Turn on reminders** · **Not now**. If denied at the OS level, Settings shows one line with a link to the OS steps; the app never re-prompts. iOS requires the app to be installed to the home screen before push is available; if it isn't, the sheet says so plainly with an "How to install" link and no pressure.

### 8.4 Settings → Notifications
One toggle per row in the catalogue, with its default; the reminder time and week-build time pickers; **Quiet after Day Complete** (on, non-editable: once you close a day, nothing arrives until the next day's first item). No global "engagement" switch because there is nothing to engage.

### 8.5 Never sent
Missed-item notices · "you're behind" · "you haven't opened the app" · weekly summaries with a percentage in the body · anything from anyone other than the scheduler (no product updates, no friend activity — there is no friend activity).

### 8.6 Plumbing (for the ticket writer)
Web Push (VAPID) via service worker; a Supabase cron Edge Function scans `day_items` due in the next window and enqueues; notification actions deep-link to the item sheet. Time-zone from `users.timezone`, not the server.

---

## 9. Brand guide

### 9.1 Pillars
Five, each with a consequence you can build:

1. **The record is honest.** Nothing is rewritten; everything is annotated. *Consequence:* ghost-and-annotate, shift bands, editable-with-history everywhere, no delete on library items.
2. **Assignment is the promise.** The only thing the product asks of you is to do what you assigned yourself, and it lets you assign less. *Consequence:* the trim is first-class and unpenalised; the number only counts assigned items.
3. **Hosted, not sold.** No urgency, no persuasion, no streaks, no confetti. *Consequence:* the alarm register doesn't exist in the palette; copy never uses "you failed"; notifications are only the times you set.
4. **Quiet is the material.** Monochrome foundation, colour as punctuation, type doing the emotional work. *Consequence:* the accent never fills a button; category colour is a 2px edge; one serif for the reflective surfaces only.
5. **Your data is yours.** Private by construction, exportable in full, deletable in one place. *Consequence:* one trust line, one treatment, reused everywhere the promise appears.

### 9.2 Characteristics (how it should feel)
Like a good notebook that a considerate person keeps for you: plain, warm, exact about times, silent about judgement. Not a dashboard. Not a game. Not a wellness brand.

### 9.3 Colour

Base is monochrome (warm neutral, not gray — Notion/Vercel/shadcn lineage with a degree of warmth). One brand accent, one semantic violet, one reserved destructive, eight category hues. Every scale is 100–800 with 500 as the base; neutral additionally carries 50 and 900 because it is the ground.

**Neutral (warm ink and paper)**

| Step | Hex | Use (light) | Use (dark) |
|---|---|---|---|
| 50 | `#FAFAF8` | Paper (page background) | — |
| 100 | `#F3F2EE` | Card/sheet surface, skeleton | Ink (primary text) |
| 200 | `#E7E5DF` | Hairlines, dividers, done-block fill | Secondary text |
| 300 | `#D2CFC7` | Disabled text, ghost outlines | Muted text |
| 400 | `#A6A299` | Muted text (large only), ghost titles | Hairlines |
| 500 | `#78746C` | Secondary text | Disabled |
| 600 | `#57534C` | Body text on paper (AA) | Sheet surface |
| 700 | `#3B3834` | Headings | Card surface |
| 800 | `#25231F` | Ink (primary text), primary button fill | Elevated surface |
| 900 | `#151412` | — | Paper |

**Accent — "verdigris"** (brand colour: the now line, the now/soon marker, focus ring, links, active timer border. Never a button fill, never a wash.)

| 100 | 200 | 300 | 400 | **500** | 600 | 700 | 800 |
|---|---|---|---|---|---|---|---|
| `#E4F1EE` | `#C3E1DB` | `#94C8BE` | `#5FAA9C` | **`#2F8F80`** | `#24736A` | `#1C5A53` | `#14423D` |

Text in accent uses 600 on paper (500 is 3.9:1 — passes for markers and the now line as non-text, fails AA for body text). On dark, accent text uses 300.

**Violet — off-schedule** (time text, moved-block border, shift bands. The only semantic colour with its own scale because it's the only one that carries meaning on its own row.)

| 100 | 200 | 300 | 400 | **500** | 600 | 700 | 800 |
|---|---|---|---|---|---|---|---|
| `#EFEAF8` | `#DCD2F0` | `#BFAEE1` | `#9E88CE` | **`#7C63B8`** | `#644D9A` | `#4D3B78` | `#372A57` |

Violet text uses 600 on paper, 300 on dark. Violet borders use 500 in both.

**Destructive — reserved.** `#B4463C` (500) only. Permitted on exactly one surface: Delete account. Nowhere else, including "Missed", which is neutral.

**Category hues** (eight; a category picks one by key; chips use 100 background with 700 text in light, 800 background with 200 text in dark; the 2px row edge uses 500):

| Key | 100 | 500 | 700 |
|---|---|---|---|
| leaf | `#E6F0E4` | `#4F8A5B` | `#2F5A38` |
| sky | `#E4EDF6` | `#4B7FB3` | `#2C5478` |
| clay | `#F6E8E2` | `#C0714F` | `#7E4530` |
| rose | `#F7E6EA` | `#B85C74` | `#7B3A4B` |
| amber | `#F8EFDD` | `#C2923A` | `#7C5B1F` |
| slate | `#E8EAEE` | `#6B7689` | `#434B5A` |
| plum | `#F0E7F1` | `#8E5A93` | `#5C3860` |
| moss | `#EDEFE0` | `#7E8B3F` | `#4F5826` |

Categories never use the accent teal or the violet, so the semantic layer stays unambiguous. All eight 500s pass 3:1 against paper as a 2px non-text edge; the 700-on-100 chip pairings pass AA text.

**Rules**
- Colour is never the only carrier of a distinction (dot + word, border + "moved", chip + name).
- Nothing red, orange, or yellow appears on the execution tabs. Amber and clay exist only as category hues, only as a 2px edge or a chip.
- No gradients. No shadows except overlays (sheets, dialogs: `0 8px 24px rgba(21,20,18,0.12)`).

### 9.4 Typography
Two families, clearly distinct, each with one job.

- **Geist Sans** (variable) — the interface. Every label, row, button, time, setting. Tabular figures on (`font-variant-numeric: tabular-nums`) everywhere a time or count appears, so columns of times align. Weights: 400 body, 500 labels and titles, 600 only for the one heading on a screen.
- **Newsreader** (variable, optical size on) — the reflective surfaces only: the Day Review header line, the Week Review header, the adherence sentence and its formula, reflection notes as typed. Never on the List or Schedule. This is the "ceremony where bandwidth exists" rule made visible.

Scale (rem, line-height): 0.75/1.2 caption · 0.875/1.4 secondary · 1/1.5 body · 1.125/1.4 row title · 1.375/1.3 screen heading · 1.75/1.2 review headline (Newsreader). Line length capped at 64ch for any prose. No all-caps labels, no tracked-out eyebrows, no single-word italics.

### 9.5 Spacing, radius, elevation
4px base; the allowed scale is 4·8·12·16·24·32·48. Row height 56px minimum (44px target + rhythm). Radius: 6px controls, 10px sheets, full for avatars and the checkbox mark. Hairlines are 1px `neutral-200` (light) / `neutral-400` at 40% (dark). No borders on cards on the List — separation is rhythm and hairline.

### 9.6 Motion
Two durations: 120ms (state changes) and 200ms (sheets, expansions). Easing `cubic-bezier(0.2, 0, 0, 1)` — settles, doesn't bounce. The now line moves by re-render, not by animation. Checkbox completion: the mark draws in over 120ms; nothing else moves. `prefers-reduced-motion`: sheets crossfade, the mark appears without drawing, everything else is already still.

### 9.7 Components — shadcn/ui as the base

Yes to shadcn/ui, with the token map below so the defaults don't leak a generic dashboard look. Everything is a shadcn primitive or a composition of them; no parallel component with a small difference.

**CSS variable map (light / dark)**
`--background` neutral-50 / neutral-900 · `--foreground` neutral-800 / neutral-100 · `--card` neutral-50 / neutral-800 · `--popover` neutral-100 / neutral-700 · `--primary` neutral-800 / neutral-100 (ink, not accent) · `--primary-foreground` neutral-50 / neutral-900 · `--secondary` neutral-100 / neutral-700 · `--muted` neutral-100 / neutral-700 · `--muted-foreground` neutral-500 / neutral-300 · `--accent` accent-100 / accent-800 (hover surfaces only) · `--accent-foreground` accent-700 / accent-200 · `--border` neutral-200 / neutral-600 · `--ring` accent-500 / accent-400 · `--destructive` destructive-500 · `--radius` 6px.

**Composed components** (names for the codebase):
- `ItemRow` — Checkbox (44px hit area, 20px visual) · Icon (24px) · Title · TimeText (tabular) · CategoryEdge (2px, absolute left) · NowMarker (dot + word). Variants: `list | schedule-block`; props: `state` from §5.9, `multitaskPosition: none|first|middle|last`.
- `ItemSheet` — shadcn Sheet (side=bottom on mobile, right on desktop): timer control, quantity Input, reflection Steppers, Notes Textarea, actions.
- `Stepper17` — the 1–7 control everywhere a rating or priority is set: seven 44px segments in a single row, selected segment filled ink, others outlined; the number is the label; on narrow screens it wraps to 4 + 3 with the same targets. No slider.
- `TierRows` — the three-tier chooser: full-width RadioGroup rows with sub-reason Chips revealed inline.
- `DayPartHeader` — section heading with the computed span in muted text ("Morning · 7:04–15:04").
- `ShiftSheet`, `TrimSheet`, `WeekGrid`, `TemplateEditor`, `HabitForm`, `WeekStrip` (the seven-square habit row), `TrustLine` (the one privacy sentence, one style, reused).
- Buttons: `default` = ink fill (primary action, one per screen) · `secondary` = outlined · `ghost` = text · `destructive` = Delete account only. Labels are verbs that match the resulting toast ("Finish review" → "Review finished").
- Toasts: bottom, one at a time, 4s, no icons; used for undo affordances only.
- Empty states: two lines of text and at most two actions. No illustrations in v1.

### 9.8 User avatars
Single-player product, so the avatar appears in exactly two places: the header button (32px) and Settings → Account (64px). Default is initials (up to two) in Geist 500 on `neutral-200` with `neutral-700` text (dark: `neutral-700` / `neutral-100`); optional image upload through the custom-icon pipeline (square crop, 256px). No status dots, no rings, no presence — there's no one to be present to. The PWA app icon follows the same restraint: a filled `neutral-800` circle on `neutral-50` with a single horizontal `accent-500` rule crossing its lower third — the now line through a day. `[OPEN: final mark — this is a direction, not a logo.]`

### 9.9 Iconography
Lucide (ships with shadcn), 20px on rows, 24px in sheets, 1.5px stroke. Icons never appear without a text label except the checkbox and the timer glyph, both of which carry `aria-label`s. The curated icon set for habits is a hand-picked subset of ~80 Lucide glyphs tinted by category-key 500.

---

## 10. Copywriting guide

### 10.1 Register
Plain, present, specific. Sentence case. Full stops on sentences, none on labels. No exclamation marks anywhere in the product. No emoji in product copy. The product does not have a personality that talks; it has a notebook's voice — it states what is.

### 10.2 Vocabulary (use these words, not their synonyms)

| Say | Not | Where |
|---|---|---|
| Habit · Task · Deep work | Activity, routine item, to-do | everywhere |
| Template | Routine, variant, plan, preset | setup |
| Week | Schedule, plan | week build |
| Fixed · Flexible | Hard · Soft | template editor (schema words stay in the schema) |
| Multitask | Superset, group, stack | everywhere |
| Not assigned today | Skipped, trimmed, removed | trim |
| Missed | Failed, incomplete, overdue | review |
| Something came up · Planned it wrong · Didn't do it | Excused, penalised, weak, lazy | tiers |
| counts as done for the record · counts half · counts as missed | penalty, deduction, points | tiers |
| Moved | Late, rescheduled, delayed | off-schedule |
| Shift my day | Push back, snooze, I'm late | shift |
| Carry forward | Roll over, postpone | review |
| Done | Complete, check off, finish | item |
| Start · Stop · Pause · Resume | Begin, end, track | timer |
| Reminder | Notification, alert, nudge | notifications |
| Archive | Delete | library |
| Only you can see your data | Private, secure, encrypted | trust line |

### 10.3 Actions
A button says what happens: "Finish review", "Shift and cut 2", "Turn on reminders", "Export everything". The confirmation reuses the verb. Destructive confirmations require typing "delete".

### 10.4 What the product never says
"You failed", "you're behind", "don't break", "streak", "keep it up", "great job", "oops", "unfortunately", "we", anything about the reader's character, anything in the second person on the execution tabs.

### 10.5 Reference strings
- Empty day: *Nothing planned today.* / Plan this day · Add a one-off
- Trim result: *Fits in 45 min. Not assigned today: Yoga, Face training, Vocal.*
- Shift step 3: *2 items no longer fit before your 11:00 call.*
- Day Review complete: *9 of 12 done · 86%* / *9 done, 1 planned wrong (½), 1 didn't do (0), 1 excused (not counted) → 9.5 / 11.*
- All done: *Every item was done.*
- Pending: *Yesterday has 3 items to review.*
- Permission: *Want a reminder at 7:00 when this comes up? Reminders are only ever the times you set.*
- Offline: *Offline — changes save on this device.*
- Trust line: *Only you can see your data. Not the people who built this, not anyone you invite.*

---

## 11. Accessibility floor (WCAG 2.2 AA)
- Every interactive target ≥ 44×44px; row checkbox hit area extends to the row's left 56px.
- Contrast checked in both themes; the known traps are accent-500 and violet-500 as text (use 600/300) and category 500s as text (never — chips use 700-on-100).
- Every state carries a non-colour signal (word, glyph, border, strikethrough).
- Focus-visible ring on all controls; sheets trap focus; Escape closes.
- Screen reader labels: `ItemRow` announces "title, time, state" (e.g. "Cold bath, 7:20, done, moved from 7:20 to 4:32"); the Week Strip squares announce "Tuesday, done" etc.
- Text scales to 200% without horizontal scroll; the Schedule axis switches to 30-minute hairlines above 150%.
- Reduced motion designed (§9.6), not tolerated.
- Timers and the now line update `aria-live="off"`; nothing announces on its own except toasts (`polite`).

---

## 12. Build phasing (R4)

**Phase 1 — the one long day.** Auth (email + Google) · first run · habit library · template editor (fixed/flexible, multitask conflict question) · week build · Plain List with day parts, now/soon, off-schedule violet, faded-interactive, undo · item sheet with timer start/stop and manual time · wake anchor → `woke_at` · Day Review with carry/missed + tiers + traded-up picker + pending-review · N1, N4, N5, N6 · Settings (account, reasons, categories, export, delete) · light and dark. The schema is the full §3.

**Phase 2 — week two.** Schedule tab with ghost-and-annotate and shift bands · shift-my-day-forward · capacity trim with swap · multitask execution grouping · pause/resume · quantity capture · reflection axes · Week Review with strips and category bar · N2, N3, N7, N8 · offline queueing · Google Calendar import (N9).

**Not in v1, recorded so they aren't accidentally built:** coach · widgets/Live Activities · workout set/rep tracking (capture a quantity and a timer on the lifting habit first; see the synthesis's cheaper-fix note) · any social or shared surface · billing.

---

## 13. Open items (deliberately short)
1. Day auto-close time — still "around 3am", still unconfirmed.
2. Working name "Synapse" and the final app mark.
3. Calendar import: which calendars; whether imports count in adherence (default: yes).
4. Evening section end: last scheduled item (current) vs. lights-out target.
5. The seven proposed rulings in §0.3.

## 14. Convergence tests run
Worst-moment: the List works one-handed with the phone at arm's length; every action is a 44px target; nothing on it asks a question. Register: every string in §10 was written for its surface. Trust: one trust line, one treatment, three places (first run, Settings, export). Alarm: no red, no countdown, no motion that pleads, no second-person copy in execution. Contrast: traps named in §11. State: §5.9 covers both tabs including offline, loading, empty; focus-visible everywhere. Drift: the accent never fills a button, no cards-with-shadows, one serif on one surface — it would not be at home in a template. Buildability: every field has a name, every screen has a state list, every string is written.

## 15. Sign-off
Vesper — signing on the condition of one yes/no pass over §0.3. Everything above traces to something you said or to a call labelled as mine. Nothing in a flagged-open item was invented silently. Ready for tickets.
