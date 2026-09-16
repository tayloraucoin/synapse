# Official UX Spec v1.1 — Synapse, for a schedule that changes

**Author:** Vesper, Lead UX/UI Designer · Mason on §11 (the data model) · Sage on §5, §7 and every line that comments on the person · Crucible on §14 (one pass, at the end)
**Date:** 12 Sept 2026
**Status:** Accepted by Taylor, 2026-09-12. An iteration version: v1 is the base; this document rewrites the sections the plan model touches and carries the rest forward by reference. Built by [`docs/specs/epic-4-dynamic-schedule/`](../specs/epic-4-dynamic-schedule/README.md); its §0.3 rulings are cited there as `v1.1 R#`. **Superseded in part by [`ux-spec-v1.2.md`](ux-spec-v1.2.md) (draft, 2026-09-16)** for §4 whole and for the amendments it names in §3, §5.2, §5.3, §7, §9, §10, §12; this document stands for the rest. Renamed from `habit_tracker_official_ux_spec_v1_1.md` on 2026-09-16.
**Base:** [`ux-spec-v1.md`](ux-spec-v1.md). Sections of v1 not rewritten here (auth §4.1, timers §5.4, multitask §5.5, the resolver §7.3, the number §7.4, export §7.6, brand §9, accessibility §11) remain in force as written. Where this document and v1 disagree, this document wins.
**Sources:** the ledger, [`2026-09-11-taylor-ux-review-notes.md`](../product/2026-09-11-taylor-ux-review-notes.md) · the Q&A, [`2026-09-11-vesper-questions-for-ux-v1.1.md`](../product/2026-09-11-vesper-questions-for-ux-v1.1.md) · the walkthrough, [`2026-09-12-app-walkthrough-feedback-v1.0.md`](../product/2026-09-12-app-walkthrough-feedback-v1.0.md) · the exclusions, [`phase-2-collection.md`](../product/phase-2-collection.md).
**Companions:** [`synapse_ui_component_needs_and_handoff_v2.md`](synapse_ui_component_needs_and_handoff_v2.md) for component contracts · [`brand-tokens.md`](../ai-guides/brand-tokens.md) for token names.

---

## 0. How to read this document

### 0.1 What kind of document this is

The v1 spec was written as a signed contract. This one is written as the current best draft of a product nobody is using yet, for a founder who will read every section and iron out details by hand. So it does three things v1 did not:

1. **Every screen opens with a walk-through** — who is holding the phone, what they see top to bottom, what they do, what the screen must never do — before the component table. Read the walk-through to picture it; read the table to build it.
2. **Copy is written in-register so screens read as real, and every string is adjustable.** Mechanics first, wording later. Where a line is contentious it is marked; otherwise assume the words are placeholders in the right voice.
3. **Defaults are labelled, not hidden.** `[DEFAULT — L#]` marks a choice made where Taylor's answer left room; `[ASSUMPTION]` marks a fact I needed and did not have; `[OPEN]` marks something only Taylor or real use can settle. All three are collected in §13.

Mobile first, always. Each screen is designed for a phone held in one hand; the desktop line at the end of each walk-through says how the wide layout derives, and nothing else changes between them (cross-cutting §2.4).

### 0.2 Authority ladder for v1.1

1. Taylor's ledger and Q&A answers (they override v1's signed text — ledger §18).
2. This document.
3. v1, for everything this document does not rewrite.
4. The cross-cutting document and the v2 handoff, for navigation and component contracts.
5. My judgment, labelled.

### 0.3 Rulings this version makes

Each row is a decision with a real alternative. The alternative is stated so it can be flipped in one line.

| # | Ruling | Source | The alternative not taken |
|---|---|---|---|
| R1 | This is **v1.1**, an iteration version; v1 stays where it is and gains a one-line superseded note only when this draft is accepted. | Q1 | A v2 rewrite. |
| R2 | **Block kinds are a fixed vocabulary:** orient · morning · training · prep · work · break · activity · wind-down. Each is optional per person; order is editable; *body* is retired. | Q6 | Free-named blocks. |
| R3 | **A fixed-time item inside a block is a pin; the stack flows around it.** | L1 (a) | Fixed-time things live only as fixtures beside the routine. |
| R4 | **Shortening stops at each item's range floor; if it still doesn't fit, the lowest-priority items are cut.** The range is why the range exists. | L2 (a) | Shorten below the range. |
| R5 | **Both a work focus and a work template exist.** A focus is a label with a weekly count; a template is a different shape of work day. A day picks one template and one focus. Focus is the common path. | L3 | One concept for both. |
| R6 | **An unconfirmed day shows the quick-pick with the defaults already chosen.** One tap confirms; anything can be swapped. Nothing is live until confirmed; fixtures show regardless. | L4 (c) | A blank *Choose your morning* (a), or a live day marked unconfirmed (b). |
| R7 | **Over budget is a notice, not a gate.** *12 min over. Set anyway · Adjust.* | L5 | Must fit first. |
| R8 | **Do now** on any item moves it to now and slides what follows; **Adjust** (the slept-in sheet) is the only mechanic that carries a reason. Drags and Do now are re-plans, annotated, never scored. | L6, `[DEFAULT — L6]` on the reason question | Every move needs a reason. |
| R9 | **The landscape list at first run is the library**, no minimum. | L7 | An onboarding-only list. |
| R10 | **Categories stay** as an optional label; the Week Review adds *time by block* beside *time by category*. | L9 (b) | Drop categories. |
| R11 | **Opening the orient frame is the wake moment**; it stamps `woke_at`. The *Immediate wake up* habit and the wake-anchor flag are retired. | Q19 | A wake habit ticked first. |
| R12 | **Re-fit is an action the person takes, never something the app detects.** | Q8 | Google-Maps-style detection. |
| R13 | **Unstructured is a first-class day shape**: orient and wind-down only, everything else added on the day, fixtures still apply. | Q12, Q13 | An empty day. |
| R14 | **Training is a block kind** with a rotation (workouts × weekly counts × typical days) and a placement chosen at the quick-pick from the day's open spans, including *inside work*. | Q18, Q24 | A habit in the morning routine. |
| R15 | **The journal has six prompts, no timer, no push.** | Q32, Q33, Q35 | Four prompts, timed. |
| R16 | **Confirm-yesterday** precedes the Day Review for wind-down items; unconfirmed items are *not confirmed*, excluded from the number, resolvable by hand. `[DEFAULT]` | Q11 | Unconfirmed items become misses. |
| R17 | **A hard anchor may show in the day header as a plain time** (*Work · 9:00*). No countdown, no colour, no shrinking number. | ledger §16 | Hide the deadline. |
| R18 | **One line in the product comments on the person's behaviour**: the skipped-gratitude line. It is the only one, and §5.2 states its rules. | Q20 | None. |
| R19 | **Notifications default to one per block boundary**; per-item reminders are opt-in per block. | ledger §16 | One per item. |
| R20 | **Day parts are removed.** The Today tab is sectioned by block. | Q27 | Both systems at once. |
| R21 | **Every item on a day is editable as a habit-day**; the habit's range is a default, never a clamp. | Q30 | Clamp to range. |
| R22 | **Appointments and fixtures need a confirm to move**; everything else drags freely. | Q25 | Everything drags. |
| R23 | **`original_scheduled_start` is written when the day is set**, not at week build. Before the pick the day is a draft; after it, every move is annotated. `[DEFAULT — L6]` | L6 | Written at week build. |
| R24 | **Work end is asked** (*until about*) as a soft time, so the evening has somewhere to start. `[ASSUMPTION]` | — | Derive it. |
| R25 | **A training swap is a two-day edit** with one confirm line naming the other day. | Q38 | Silent swap. |
| R26 | **The template editor is replaced by the block editor**: durations and gaps, offsets derived, resize by drag. | ledger §6, W8, W9 | Patch the offset editor. |
| R27 | **Fixtures are a layer of their own**, keyed to a weekday, materialised on every planned instance of that day regardless of template. | ledger §21 | Slots in a template. |

### 0.4 What v1 said that no longer holds

- v1 §3.4–3.5 (Template, TemplateSlot with absolute offsets) → §3 and §11 here.
- v1 §4.2 (five-screen first run) → §4.
- v1 §4.4 (template editor) → §3.9 (block editor).
- v1 §5.2 day parts and §6.4 → removed (R20).
- v1 §5.6 shift sheet and §5.8 trim sheet → §6.6 (one Adjust sheet, three entries).
- v1 §0.3 R5 (wake time from the wake-anchor habit) → R11.
- v1 §8.2 N1 default (one push per fixed item) → R19.
- v1 §10.2 vocabulary → §12.

---

## 1. Frame

### 1.1 One sentence

A private daily plan built from blocks — a moment to orient, a morning routine, training, the prep before work, the work itself, a break, the evening's activity, a wind-down — that you set once for the week, confirm in three taps each morning, bend during the day without losing the record, and close at night in your own words.

### 1.2 Who this is for, in this version

One archetype is live: **I set my own structure, and it changes.** Taylor is the reference user, and every worked example in this document is his morning: up at 7:00, working by about 9:00, forty-five minutes of breakfast and a walk as mandatory prep, a workout placed per day, several work focuses across the week. The other three archetypes (consistent shifts · shifts that change · fluid) are named on the first screen and greyed; each will be built around a real person when its turn comes (phase 2, P2-16).

The positioning line the product is built toward: *For when your schedule is as dynamic as you are.*

### 1.3 Who is here, in what state

v1's three states become five. The two additions are the moments this version designs most carefully.

| State | When | Budget |
|---|---|---|
| **Planning** | Sunday, or the night before. Calm. | Depth is fine. The block editor, the week, the library. |
| **Waking** | The first minute of the day. Groggy, one thumb, the world not yet let in. | One screen, one thing to read, one optional line to write, one button. Then three taps to set the day. |
| **Executing** | Mid-morning, mid-day, moving. | One idea per screen. Targets ≥ 44px. No configuration reachable without leaving the tab. |
| **Winding down** | Late evening, tired, willpower low, the phone about to go away. | A short routine that stacks backwards from lights-out. A journal that autosaves and can be left mid-line. Nothing that must be finished. |
| **Reviewing** | Any time the day is closed; often the next morning. | Three taps per item. A confirm-yesterday list that takes ten seconds. An exit that leaves things pending. |

### 1.4 Vocabulary

The words the product uses, fixed here. Schema words are in §11 and stay in the schema.

| Word | Means | Not |
|---|---|---|
| **Block** | A part of the day with a kind (§3.1). The Today tab is sectioned by block. | day part, chunk, section |
| **Template** | A saved block — its items, their lengths, the gaps between them. Every block kind has templates. | variant, preset, plan |
| **Routine** | A morning or wind-down template. *Morning routine*, *wind-down routine*. Same thing as a template; the friendlier word on the two blocks where it fits. | habit list |
| **Pool** | Items you decide between in the morning. A routine can be *opener · pool · closer*. | menu, options |
| **One of** | Exactly one of these happens today — *breakfast: meal-prepped or cook it*. | alternate, either/or |
| **Pin** | An item at a clock time inside a block. The stack flows around it. | fixed, anchor |
| **Fixture** | Something that happens every week on a set day at a set time. Stand-up, a show, dinner on Thursdays. | recurring appointment, event |
| **One-off** | A dated thing that happens once. | task, appointment |
| **Focus** | What a work day is about. *Viewpoint · 2 this week.* | day type, project |
| **Work template** | A different shape of work day — different hours, different fixtures. | schedule |
| **Workout** | One session in the training rotation. *Push · usually Monday.* | exercise, session |
| **Structured / Unstructured** | Whether today is built from templates or set on the fly. | rest day, off day |
| **Set the day** | The morning confirm. Nothing is live until it is set. | start, commit, lock |
| **Adjust** | The one sheet for *I slept in · ran long · something came up*. | shift, trim, re-fit |
| **Do now** | Move this item to now and slide what follows. | start late, reschedule |
| **Habit-day** | This item, on this day. Editable without touching the habit. | instance |
| **Not assigned today** | Left out by a fit, a trim, or your choice. Never a miss. | skipped |
| **Moved** | Done at a different time than planned. A count, never a score. | late |

Retired: *day type* (→ focus / work template), *body* (→ training), *day part* (→ block), *wake-anchor habit* (→ the orient frame), *shift my day* and *I have less time* (→ Adjust).

---

## 2. Guardrails

v1 §2.4's eight guardrails are carried whole. Two amendments and one addition:

1. **A hard anchor's time may be shown as a plain time.** The day header reads *Work · 9:00*; each row keeps its derived start. No countdown, no colour change, no number that shrinks. It informs; it does not pressure. (Amends v1 §2.4.1 and §2.4.4 for this one case.)
2. **One line may comment on the person's behaviour.** The skipped-gratitude line in the orient frame (§5.2). It has rules: it names a fact, once; it never appears two mornings running; it never uses an adjective; it can be turned off. Every other string in the product still states what is, not what the person is.
3. **The morning is confirmed, not detected.** The app never infers that someone is behind, late, or off-plan from the absence of taps. Every adjustment is an action the person takes.

And the product non-negotiables from v1 §2.4 and §10.4, restated because every screen below is measured against them: no streaks or scores on the tabs; no numbers about the day on the tabs (a plain anchor time is a time, not a number about the day); colour never alone; nothing red on the tabs; no second person in product copy; notifications that never report a miss.

---

## 3. The plan model, as design

This is the section that changed most. It is written as the person would meet it, with the arithmetic shown, and §11 restates it as tables.

### 3.1 Blocks and their kinds

A day is an ordered set of blocks. Eight kinds, each optional, each with a natural anchor:

| Kind | What it holds | How it is anchored | Taylor's |
|---|---|---|---|
| **orient** | One frame to read and one optional line to write (§5.2). | Opens when the app is first opened for the day. Stamps `woke_at`. | Last night's words, one gratitude line, one intention. ~3 min. |
| **morning** | The morning routine: a stack, or opener · pool · closer. | Forward from `woke_at`, after orient. | Breath work, cold shower, journal read-back, stretch, reading. 40–90 min depending on the pick. |
| **training** | One workout from the rotation. | Placed each morning into an open span: before the routine · after it · inside work · after work · in the break. | Push / pull / legs / conditioning; usually before breakfast, sometimes mid-work. |
| **prep** | What has to happen before work: breakfast, coffee, the walk, transit, the dog. Items can be *one of*. | Backward from work start. Ends exactly at the anchor. | Breakfast (meal-prepped 10 / cook 30), walk outside 15. 45 min with the cook option. |
| **work** | One container. Today's focus. Fixtures inside it (stand-up). Optionally split by training or a break. | Starts at the work anchor; ends at *until about*. | 9:00 to ~17:30; focus per day. |
| **break** | A midday wellness break: a short routine or one item. | Floats inside work; placed at the quick-pick like training, or fixed if the person prefers. | Optional; not in Taylor's default week. |
| **activity** | The evening's life: fixtures and one-offs — a class, dinner, a show, or nothing. Hard-start ones pin. | After work, before wind-down. | Varies; mostly one-offs. |
| **wind-down** | The wind-down routine: opener · pool · closer, with *devices off* as a pin and the journal before it. | Backward from lights-out. | Journal 10, read 20, devices off at 22:15, lights out 22:45. |

Order is editable per person in Settings → Your day. The default order is the table's order; *training* and *break* have no fixed place because they are placed per day.

### 3.2 Stacking, gaps and pins

Inside a block, items **stack**: each item's start is the previous item's end plus a gap. The gap is a thing of its own — visible, resizable, defaulting to zero — so *bathroom then a different room* has somewhere to live that isn't the habit's duration (ledger §6). Nothing inside a block has an absolute time unless it is **pinned**.

A pin is an item at a clock time — *call Mum at 8:00*. The stack flows around it: whatever would have started at 8:00 starts after the call ends (R3). If the items before the pin overrun it, they are shown overrunning (the block editor's footer says so in plain arithmetic); the pin never moves. Fixtures inside a block behave as pins.

### 3.3 Flow direction and the morning's arithmetic

Two blocks flow in opposite directions, and that is what makes the morning honest:

- **Morning flows forward** from wake (orient first, then the routine).
- **Prep flows backward** from the work anchor, so it ends exactly when work starts.

The backward flow is how the **budget** is computed; it is not how the day is lived. Once the day is set, everything flows forward from wake — routine, then prep, in order — and whatever is left over lands as **slack** just before the anchor: ready early, not idle in the middle. The slack is shown as a plain number on the Schedule, never as a judgement. Prep flows backward only when the arithmetic has to say what gives (the pick's budget line, the fit screen, Adjust). Taylor's default day:

```
wake 7:00 ─ orient 3 ─ morning routine ……… ─ [slack] ─ prep 45 ─ work 9:00
                       available for the routine: 120 − 3 − 45 = 72 min
```

If the routine chosen adds up to 60, prep starts at 8:03, ends at 8:48, and the Schedule shows a 12-minute empty band before 9:00; the day header says nothing about it. If the routine adds up to 80, the pick shows *80 chosen · 72 available* and §5.3 says what happens next.

**Anchor direction** (Q19) decides what the arithmetic *means*:

| *When your morning runs long, what gives?* | Work anchor is | The budget line reads as | Adjust offers first |
|---|---|---|---|
| **Work waits** | soft | an estimate: *routine runs to ~9:20* | *Start work later* |
| **The routine gets cut** | hard | a limit: *72 min available* | *Shorten* · *Cut some* |
| **Depends on the day** | asked at the pick | either, by today's answer | by today's answer |

Wake as a range (ledger §2) is stored as a preferred time plus an earliest; only the preferred time is used for the arithmetic. The range is shown back at the fit screen and nowhere else. `[ASSUMPTION: the range is informational in v1.1.]`

### 3.4 Routines: opener, pool, closer

A morning or wind-down routine has one of two structures:

- **Stack** — a fixed ordered list. Every item is assigned every day the routine is used.
- **Opener · pool · closer** — a fixed opener (say, breath work), a pool decided in the morning by inspiration and budget, a fixed closer (say, stretch). Openers and closers are assigned; the pool is chosen at the pick.

Both structures can be duplicated into variants with weekly counts (*Morning A · 2 a week*, *Morning B · 2*, *Long Sunday · 1*) for the person who wants different *content* on different days, not just different length (ledger §13). The week build assigns a variant per day or leaves the day pooled (*one of A/B*).

### 3.5 One of

Any two items in a block can be an **alternates group**: exactly one happens, chosen at the pick, each with its own duration. *Breakfast: meal-prepped 10 · cook it 30.* The block editor shows the group as one row with two tabs of duration; the fit arithmetic uses whichever is the default (the person picks which is default; the other is the swap). Choosing the shorter one at the pick hands the difference back to the morning routine's budget in the same sheet, live (ledger §14).

An alternates group extends the block editor's same-start question from two answers to three: *Do these happen at the same time?* → **Yes, multitask** · **No, one or the other** · **Move it**.

### 3.6 Fixtures and one-offs

A **fixture** belongs to a weekday, not to a template (R27): *Stand-up · Tuesday 9:30 · 20 min*, *Football · Thursday 19:00 · 90 min*. It materialises on every planned instance of that weekday, whatever template the day gets, and the quick-pick cannot remove it. Fixtures live in work or activity by default and are pins in their block. This is where Google Calendar import lands in phase 2 (P2-7).

A **one-off** is a dated item added from the week build or the day header: a dentist appointment, a friend's birthday dinner. One-offs with a clock time are pins and count as appointments for R22.

### 3.7 Training

Onboarding collects the **rotation**: each workout's name, how many a week, which days it usually falls on, and a typical length. The training block is one item per day — today's workout — and the quick-pick asks two things about it: *Monday's is push — still?* (with *swap* offering the rotation's other entries and their remaining counts) and *when?* (the open spans on today's axis, with the last placement for this focus preselected). An unplaced workout does not disappear; the pick will not set the day with the workout unplaced unless the person says *not today*, which makes it *not assigned today* (ledger §22).

*Inside work* splits the work container around the workout on the Schedule; the Today tab shows the workout between the two halves of the work row.

Sub-parts (warm-up · main · abs) and sets and reps are phase 2 (P2-1).

### 3.8 Work: focus and template

A **focus** is a label with a weekly count and optional typical days: *Viewpoint · 2*, *Conscious Connections · 1*, *Applications · 1*, *Krishan · 1*. The week build headlines each work day with its focus; a day can be pooled (*decide in the morning*) and the quick-pick offers the remaining counts (*Viewpoint · 1 of 2 left*).

A **work template** is a different shape of work day — hours, fixtures, whether it has a break. Most people have one. The person with an office day and a home day has two. A day picks one template and one focus (R5).

The work block is one container row on the Today tab; task selection inside it is phase 2 (P2-2). Nothing inside work is scored; the block records its span and whether it was started.

### 3.9 Day shapes

- **Structured** — blocks from templates. The default on work days.
- **Unstructured** — orient and wind-down only; everything else is added on the day from the library or as one-offs, grab-and-go. Fixtures still apply. Sunday, for Taylor: the one day he makes a list, on the day. An unstructured day still has a wake and a lights-out.

*Sometimes* work days (Saturday) are a pool of two shapes; the pick asks *Working today?* first and the rest of the sheet follows the answer.

### 3.10 The fit, at planning time

The block editor's footer and the first run's last screen show the same arithmetic: *Up 7:00 · orient 3 · routine 72 available · prep 45 · work 9:00 · your routine adds up to 140.* When the landscape exceeds the budget the person chooses an **overflow mode** (ledger §20):

- **A daily menu** — see the whole list each morning, tap what fits, the budget line live. The default, and the strongest.
- **Variants by day** — Morning A / B / C with counts, assigned in the week build.
- **Cut the lowest automatically** — the ranked list, the budget cuts from the bottom, *Keep instead* to swap.

The mode is a preference, changeable in Settings → Your day → Morning.

### 3.11 The block editor

*This replaces v1 §4.4. It is the one screen in the product that earns density.*

**Who is here, in what state.** Someone planning, calm, on a Sunday or in Settings, with a routine to shape or a prep list to time.

**The one job.** Put items in order with the right lengths and gaps, and see at once whether they fit the block's anchor.

**What you see.** The header carries the block's name (*Morning routine*), the anchor line in muted text (*forward from wake · 7:00*, or *backward to work · 9:00*, or *backward to lights-out · 22:45*), and the save status. Below it, a vertical strip: the time gutter on the left with hour and quarter-hour hairlines, and the items as blocks whose height is their duration — the Schedule tab's own language, so the person learns one visual grammar for planning and for the day. Between items, the gaps render as thin empty bands with the minutes written in the gutter (*+5*); a gap of zero is a hairline. A pin shows the anchor glyph and its clock time; opener and closer rows in an opener-pool-closer routine carry a small *opener* / *closer* caption, and pool items sit in a lighter band labelled *decide in the morning*. A one-of group is a single block with two tabs at its top (*meal-prepped 10 · cook it 30*); the default tab is filled. The footer is sticky: *7:03 – 8:15 · 72 min · 0 min slack* in tabular figures. No judgement copy; the number is the feedback. Within thumb reach: **Add** (opens the library filtered to this block's kind; tap to add, the item lands at the end at the midpoint of its range) and the footer.

**What you do.** Long-press a block to lift it and drag it up or down to reorder; the stack re-flows under it as it moves. Drag a block's bottom edge to change its duration; the gutter shows the minutes live and nothing clamps to the range — the range is shown as a faint band on the block while dragging, as information. Drag the seam between two blocks to open a gap, exactly like resizing a textarea; the minutes appear in the gutter. Tap a block to open the slot sheet (priority for this template, pin at a time, make it one of, opener/closer/pool role, remove). Tap the footer to see the block's arithmetic in a sentence.

**What it must never do.** Turn into a form. Every adjustment is direct manipulation on the strip; number fields exist only inside the slot sheet as the keyboard fallback. It must never clamp a duration to the habit's range (R21), and it must never rearrange a pin.

**On desktop.** The strip sits in the 960px canvas with the library docked as a right panel, so *Add* is drag-from-panel as well as tap.

**Spec.**

| Item | Detail |
|---|---|
| Component | `BlockEditor` (feature folder, replaces `TemplateEditor`), built from `ScheduleAxis` (reused; `pxPerHour` 96 in the editor), `ScheduleBlock` with a new `editable` prop, a new `GapBand`, `SlotSheet` (amended), `SaveStatus`, `AppHeader`. |
| Props | `{ templateId: string \| null; kind: BlockKind; embedded?: boolean; onLeave?: () => void }` |
| Gestures | long-press 300ms lifts (haptic where available); drag reorders; bottom-edge drag resizes in 5-minute steps; seam drag opens a gap in 5-minute steps; tap opens the slot sheet. Keyboard: arrow keys move focus in time order; Alt+↑/↓ reorders; Shift+↑/↓ resizes; `g` then a number sets the gap. |
| States | create · edit · saving · saved · retrying · failed (*Changes aren't saving. Check your connection.*) · offline (read-only, standard line) · in-use (*Applied to 3 days this week*) · overrun (footer reads *runs 8 min past work · 9:08*, muted, no colour) · empty (*Nothing here yet. Add from the library.*). Focus-visible ring on every block, gap and the footer. |
| Motion | re-flow 120ms settle; reduced-motion: positions jump. |
| Copy | *Add* · *decide in the morning* · *opener* · *closer* · *one of* · *runs 8 min past work* — adjustable. |
| Open | `[OPEN]` whether the seam-drag gesture reads as discoverable without a hint; fallback is a small *+ gap* row in the slot sheet. |

---

## 4. First run, screen by screen

*Replaces v1 §4.2. Twelve screens. Every screen either captures a fact or shows a consequence of the facts so far; nothing asks the person to reconcile facts by hand (ledger §20). Progress reads "n of 12" in the header caption. Everything after screen 1 is skippable with *Skip for now* and revisitable from Settings → Your day, which is the same set of screens without the frame. Nothing here asks for notification permission, a photo, a goal, or a commitment.*

**The frame, once.** Every screen sits in `StepFrame`: a caption top-left (*3 of 12*), *Finish later* top-right as ghost text, the heading at 1.375rem, at most one paragraph of body under it, the content, and the primary button pinned above the safe area with *Skip for now* as ghost text beside it where skipping is allowed. Back is the header back and the system back. Pre-filled fields show **value + Change** and open their control only on demand (W1). Selection is a single commit: a tick is the selection, and the primary always reads *Continue*, counting where a count helps (*Continue · 6 habits*) (W4).

**On desktop, once.** The frame centres in the 720px content column; sheets become the 420px right panel. Nothing else changes.

### 4.1 Screen 1 — The shape of your week

**Who is here, in what state.** A curious stranger, or Taylor on a fresh account; one session of patience.

**The one job.** Say which kind of week this is, so the rest of the flow can route.

**What you see.** Heading: *Which is closest?* Four full-width cards, stacked, each a `LargeTargetRow` at 72px: a title in row-title size and one line of secondary text beneath. Only the third is live: **I set my own structure, and it changes** — *Work starts around a time, not at one. Mornings bend.* The other three (**My shifts are the same every week** · **My shifts change week to week** · **My days are fluid**) render at `text-text-disabled` with a caption *not yet* on the right, not tappable, no explanation. The live card is preselected, so *Continue* is one tap. Below the fold: nothing. Not on the screen: any explanation of what an archetype does; the routing is invisible.

**What you do.** Tap *Continue*. (Tapping a grey card does nothing; there is no toast, because a toast would be an apology.)

**What it must never do.** Read as a paywall or a waitlist. The grey cards are honest scope, in the quietest possible treatment.

**Spec.** `StepFrame` + four `LargeTargetRow`s (`disabled` on three). Stores `users.schedule_shape`. States: default · saving · offline (primary disabled, standard line). Copy adjustable; card names are placeholders to be written around real people (P2-16).

### 4.2 Screen 2 — Work days

**The one job.** Which days have a work block, and which are undecided until the morning.

**What you see.** Heading: *Which days do you work?* Body: *Tap a day to change it.* Seven full-width rows, Monday first, each a `ListRow` with the weekday on the left and a three-way `SegmentedControl` on the right: **Always · Sometimes · Never**. Mon–Fri preselected *Always*, Sat *Sometimes*, Sun *Never* — Taylor's own week as the default, because it is also the common one. `[ASSUMPTION]` One line under the list, muted: *Sometimes means the morning asks.* Primary: *Continue*.

**What you do.** Tap a segment. Nothing else moves.

**What it must never do.** Wrap the segments (W5): three short words fit at 375px with 12px padding; if a locale needs longer words, the control stacks under the day name rather than wrapping.

**Spec.** Seven `SegmentedControl`s (three segments, 44px high). Stores `users.work_days` as `{0..6: always | sometimes | never}`. A *sometimes* day seeds a shape pool (§3.9).

### 4.3 Screen 3 — Work start, and what gives

**The one job.** The anchor the morning is built backward from, and whether it is hard.

**What you see.** Heading: *When do you like to be working by?* A `TimeField` showing *9:00* as value + Change (default from nothing; 9:00 is the placeholder because most people's answer is near it). Under it, smaller: *Until about* with *17:30* as value + Change (R24). Then a second heading in body weight: *When your morning runs long, what gives?* Three `LargeTargetRow`s as a radio group: **Work waits** — *I start when the routine is done.* · **The routine gets cut** — *Work starts when it starts.* · **Depends on the day** — *Ask me in the morning.* Nothing preselected; the primary is disabled until one is chosen, because this is the one screen whose answer changes the arithmetic everywhere.

**What you do.** Change the time if it isn't 9:00; tap one row; *Continue*.

**What it must never do.** Editorialise about the choice. *The routine gets cut* is stated as neutrally as *Work waits*.

**Spec.** Two `TimeField`s (value + Change), one `RadioGroup` of `LargeTargetRow`s. Stores `users.work_start_time`, `users.work_end_time`, `users.anchor_direction`.

### 4.4 Screen 4 — Standing commitments

**The one job.** Capture the fixtures so the week is honest before any routine is designed.

**What you see.** Heading: *Anything that happens every week at a set time?* Body: *A stand-up, a class, dinner on Thursdays.* An empty state in two lines: *Nothing yet.* / **Add one**. Adding opens the `FixtureSheet` (bottom sheet): title `Input` (autofocus), weekday `WeekdayChips` (multi-select, so a Mon/Wed/Fri class is one fixture), `TimeField` at, `MinutesStepper` for, and a `SegmentedControl` **In work · In the evening** that decides the block. Saved fixtures list as `ListRow`s: *Stand-up · Tue · 9:30 · 20 min*. Primary: *Continue* (or *Skip for now* as the ghost; skipping is one tap).

**What it must never do.** Suggest fixtures. This is a fact-capture screen; the app has no opinion about what happens on Thursdays.

**Spec.** `EmptyState`, `FixtureSheet` (new, feature folder), `ListRow`s with `EllipsesMenu` (*Edit · Remove*). Writes `fixtures` rows (§11.6).

### 4.5 Screen 5 — Wake

**The one job.** The morning's start.

**What you see.** Heading: *When would you like to be up?* One `TimeField`, *7:00* as value + Change. A ghost text row beneath: *Add an earliest* — tapping reveals a second `TimeField` (*6:30*), for the person whose wake is a range (ledger §2). Under the field, the first computed consequence in the flow, muted, tabular: *7:00 to 9:00 · 2 h before work.* Primary: *Continue*.

**What it must never do.** Call it an alarm. Nothing here sets a notification.

**Spec.** `TimeField` ×2 (second hidden until revealed). Stores `users.usual_wake_time`, `users.earliest_wake_time` (nullable).

### 4.6 Screen 6 — Before the day

**The one job.** Choose what the first screen of every morning shows.

**What you see.** Heading: *What do you want to read before the day starts?* Body: *Your own words, a passage, or both. It stays private.* A `Textarea` labelled *A passage* (optional; placeholder in muted text: *A few lines you want to see every morning.*), 6 rows, serif — the first Newsreader on a setup screen, because the frame it fills is a reflective surface. Beneath it a `Switch` row: **Show what I wrote the night before** — on by default, with one muted line: *From the evening journal, if you write one.* Then a second `Switch`: **Ask one line of gratitude in the morning** — on by default. Primary: *Continue*; *Skip for now* as ghost.

**What it must never do.** Offer a quote bank or an affirmation library. Content in the frame is the person's own or the person's chosen; the app never supplies the words (ledger §25; P2-14).

**Spec.** `Textarea` (serif variant), two `Switch` rows. Stores `users.orient_passage`, `users.orient_show_last_night`, `users.orient_ask_gratitude`. Sage's note: the default-on switches pass the endorsement test because both produce content the person wrote; neither produces content about the person.

### 4.7 Screen 7 — Before work

**The one job.** The prep list with a length each, so the morning's budget can be computed.

**What you see.** Heading: *What has to happen before you can start?* Body: *Breakfast, coffee, the walk, the drive. Each with a rough length.* A list of `ListRow`s, each with a title and a `MinutesStepper` on the right; empty at first with a starter row of six offers rendered as unchecked `CheckboxField`s in a chooser band: *Breakfast · Coffee · Shower · Walk · Transit · Walk the dog* — ticking one adds it with a default length (breakfast 20, coffee 5, shower 10, walk 15, transit 30, dog 20). A free-entry row *Add something else* at the bottom of the list. Each row's `EllipsesMenu` offers **Make it one of two** — which opens a small inline second row under it (*or… cook it · 30 min*) and marks the pair with the *one of* caption. A sticky footer line in tabular: *Adds up to 45 min · work by 9:00 · up at 7:00 · 72 min left for the routine.* Primary: *Continue*.

**What you do.** Tick three offers; change breakfast to *one of* meal-prepped 10 / cook 30; watch the footer move.

**What it must never do.** Ask for a start time. Items here only have lengths; the stack is computed backward from work (§3.3).

**Spec.** `CheckboxField` chooser band (nothing pre-checked), `ListRow` + `MinutesStepper`, inline one-of row, sticky footer (`Text` tabular). Writes a prep block template with slots, `alternates_group` for pairs. States: empty · listing · offline. Priority is not asked here; prep items default to 7 and hard (mandatory), and the slot sheet in Settings can lower one.

### 4.8 Screen 8 — Your routine, the whole landscape

**Who is here, in what state.** The habit junkie with thirty practices, or the person with three. Both are hosted the same way.

**The one job.** Capture everything the person does or wants to do to start the day well, ranked — without asking any of it to fit (ledger §20, R9).

**What you see.** Heading: *What do you do, or want to do, to start the day well?* Body: *Everything. It doesn't have to fit.* A `Tabs` bar with three word tabs: **Recommended · All · Selected (0)**. Recommended lists ~12 offers grouped under two `GroupHeading`s (*Body* · *Mind*), each a `CheckboxField` row with a title and a muted range on the right (*Cold shower · 3–10 min*); nothing pre-checked. *All* lists the full per-block starter library (≈40 morning items) with a `SearchField` at the top. *Selected* lists what is ticked, each row with a `Stepper17` for priority (default 4) and a `MinutesStepper` for a rough length (default the range midpoint) — the two facts the rest of the system needs. A free-entry row at the bottom of every tab: *Add your own* (opens the habit sheet, shortened: title, block, range, priority). Primary: *Continue · 9 habits*. No footer arithmetic on this screen, by rule.

**What you do.** Tick across Recommended and All; switch to Selected; adjust two priorities; *Continue*.

**What it must never do.** Show a fit number. This screen is the data bank; the fit is screen 12's job. And nothing is ever pre-checked: hospitality, not persuasion.

**Spec.** `Tabs` (word tabs), `CheckboxField` rows, `SearchField`, `Stepper17`, `MinutesStepper`, `HabitForm` (short mode). Writes `habits` rows with `block_kind: morning` and a morning routine template whose structure defaults to *stack* in priority order (the pick makes the menu). Starter content is mine to write, per block (Q16); see §12.4 for the first set.

### 4.9 Screen 9 — Training

**The one job.** The rotation: what, how often, usually when, how long.

**What you see.** Heading: *Do you train?* Two `LargeTargetRow`s: **Yes** · **Not right now** (choosing the second skips ahead). On yes: a list of workout rows, empty with **Add a workout**; each row is a `ListRow` with the name, a `CountStepper` (*× 2 a week*), `WeekdayChips` for usual days, and a `MinutesStepper` for typical length (default 60). A muted line under the list: *Where it fits is decided each morning.* Primary: *Continue · 3 workouts*.

**What it must never do.** Ask for a time. Placement is a morning decision (§3.7).

**Spec.** `LargeTargetRow` ×2, `ListRow` with `CountStepper`, `WeekdayChips`, `MinutesStepper`. Writes `habits` rows with `type: workout`, `weekly_target`, `typical_days`, `duration_*`, and a training block template.

### 4.10 Screen 10 — Closing the day

**The one job.** Lights-out, devices-off, and whether a few lines at night are wanted.

**What you see.** Heading: *How does the day end?* `TimeField` **Lights out** · *22:45* as value + Change. `TimeField` **Phone away** · *22:15* as value + Change, with one muted line under it: *Half an hour before lights out is a common choice.* (The science line is copy, later — Q11; Sage asks that it stay one sentence and cite nothing it can't.) A `Switch` row: **A few lines at night** — on by default; expanding beneath it, the six journal prompts as plain text rows with a drag handle and an `EllipsesMenu` (*Edit · Remove*), and *Add a prompt* at the bottom. A muted line: *Around 10 minutes, before the phone goes away.* Primary: *Continue*.

**What it must never do.** Frame devices-off as a rule. It is a time the person set, shown back as such.

**Spec.** Two `TimeField`s, `Switch`, sortable prompt list. Stores `users.lights_out_time`, `users.devices_off_time`, `users.journal_enabled`, `users.journal_prompts` (ordered). Writes a wind-down template whose closer is the journal and whose *devices off* is a pin (§7.1).

### 4.11 Screen 11 — What your work days are about

**The one job.** The focuses and their weekly counts.

**What you see.** Heading: *What kinds of work day do you have?* Body: *One is fine.* A list of focus rows, empty with **Add a focus**; each `ListRow` has the name, a `CountStepper` (*× 2 a week*), and `WeekdayChips` as optional usual days; unset days mean *decide in the morning*. Beneath, a ghost row: **I have days with different hours** → opens a second `FixtureSheet`-like sheet to create a second work template (start, until, name). Most people never open it. Primary: *Continue · 4 focuses*.

**Spec.** `ListRow` + `CountStepper` + `WeekdayChips`. Writes `habits` rows with `type: deep_work` (the focus), `weekly_target`, `typical_days`; optional second `templates` row of kind work.

### 4.12 Screen 12 — The fit

**Who is here, in what state.** Ten minutes in, mildly tired of tapping, curious whether it adds up.

**The one job.** Show the computed consequence of everything entered, and let the person choose how the days that don't fit will be handled.

**What you see.** Heading: *Here's the room you have.* A block strip — the same `ScheduleAxis` the editor and the Schedule use, read-only, compact — from 7:00 to 9:00 with the blocks laid in: *orient 3 · routine 72 available · prep 45 · work 9:00*, each block labelled, the routine block's height showing the available span with a lighter band. Under it, one sentence in body text: *Your routine adds up to 140 min. 72 fit before prep on a usual day.* Then the question, as three `LargeTargetRow`s (§3.10): **A daily menu** — *See the list each morning, tap what fits.* · **Different routines on different days** — *Morning A, Morning B, with counts.* · **Cut the lowest automatically** — *The list, ranked; the budget cuts from the bottom.* Daily menu preselected. If the landscape already fits, the question is replaced by one line — *It all fits on a usual day.* — and the rows don't appear. Two primaries are not allowed, so: primary **Open today**, ghost **Plan this week first**.

**What you do.** Read; leave the default; tap *Open today*, which lands on the orient frame if the day hasn't started, or the quick-pick if it has.

**What it must never do.** Judge the 140. The number is a fact; the three rows are three honest ways to live with it.

**Spec.** `ScheduleAxis` read-only with `ScheduleBlock`s (`size: compact`), `Text`, `RadioGroup` of `LargeTargetRow`s. Stores `users.overflow_mode`. Marks `first_run_completed_at`; the week build's first state is *This week: planned from your defaults* (§4.13).

### 4.13 The week build, amended

v1 §4.5 stands with these changes:

- A day row shows its **shape** (structured / unstructured), its **morning** (a routine name, or *menu*, or *one of A/B*), its **focus** (or *decide in the morning*), its **workout** (from typical days), and its fixtures — as one line of muted text: *Menu · Viewpoint · Push · Stand-up 9:30*.
- Tapping a day opens the `DaySheet`, amended: a row per block kind present, each a `PickerList` of that kind's templates with target status (*Morning A · 1 of 2 this week*), plus the shape toggle at the top and *Add a one-off* at the bottom.
- The first week after first run is pre-filled from typical days and counts, so the week build's first job is reading, not authoring.
- Applying materialises the structured parts immediately (fixtures, pins, assigned routines) and leaves pooled parts to the pick. The Today tab for a future day says *Set in the morning* where a pool is.
- Training swap in the week build: dragging *Push* from Monday onto Tuesday shows one confirm line — *Trade with Tuesday's pull?* — **Trade** · **Cancel** (R25).

### 4.14 Settings → Your day

The first-run screens, without the frame, as a list: **Shape of the week · Work days · Work start · Standing commitments · Wake · Before the day · Before work · Morning routine · Training · Closing the day · Work focuses · Block order**. Each opens its screen; the block-kind rows (Morning, Before work, Wind-down under *Closing the day*, Training, Work) open the block editor (§3.11) for that kind, with the template list above it when more than one exists. **Block order** is a sortable list of the eight kinds with drag handles.

The v1 Settings entries **Habits** (→ *Library*, §4.15), **Templates** (→ folded into *Your day*), **Categories** (kept), **Week** (kept), **Reasons**, **Notifications** (§9), **Day** (close time, review reminder, timezone), **Your data**, **Share**, **Appearance**, **About** remain.

### 4.15 The library

*Amends v1 §4.3 and answers W2, W3, W6.*

The library holds habits only. Appointments are fixtures or one-offs; workouts and focuses are managed on their block screens. The list is grouped by **block** first (*Morning · Before work · Break · Wind-down · Anywhere*), then by category if the person uses them; a `SearchField` at the top; archived collapsed at the bottom. The habit sheet loses the *Type* segment (W5, W6) and gains a **Block** chip row (one of the kinds, or *Anywhere*); the category picker hides until a category exists and shows *+ New category* beside *None* when it does (W7); duration is a range; priority is the `Stepper17`; *More* holds quantity unit, reflection axes, and the preflight note. The wake-anchor toggle is gone (R11).

---

## 5. The morning

*New. Two screens, in order: the orient frame, then the quick-pick. Together they are the waking state's whole budget: one thing to read, one line to write, three taps to set the day.*

### 5.1 When the morning begins

The day opens at `day_close_time` (03:00). The first time the app is opened after that — cold open, notification tap, anything — and the day has no `woke_at`, the orient frame is shown, full screen, before any tab. Opening it stamps `woke_at = now`, source *orient* (R11). The day header's *Set wake time* row still exists for corrections. If the app is first opened at 14:00, the frame still shows and the pick's morning budget is simply zero; the day starts where it starts, honestly.

If the day was already set and the app is re-opened, the Today tab shows as normal. The frame is never shown twice for one day.

### 5.2 The orient frame

**Who is here, in what state.** Just awake. One thumb. The phone was the first thing picked up, deliberately, and this is the first thing on it. Sheltering from the world for a minute.

**The one job.** Point the mind the way the person wants it pointed before the day gets in — with the person's own words, never the app's.

**What you see.** No header, no tab bar, no time. Paper, and a single column of reading at 64ch. At the top, a caption in muted sans: *Last night* and the date. Under it, in Newsreader at body size, the lines the person wrote the night before, verbatim, in this order: *make happen tomorrow*, then *visualisation*, then *looking forward to*. Each has a hairline above and its prompt as a caption (*What I want to make happen today*, rewritten from tomorrow's tense to today's — the only transformation the app performs on the person's words, and it changes one word). If there was no entry, the passage takes this place. If both exist, the passage follows the journal lines under a caption *Every morning*. Then one optional line to write: a single serif `Textarea`, one row, growing, with the prompt as a caption — *Grateful for, this morning* — and, under it, a second one-row field — *Today's intention* (Q29). Both autosave. Within thumb reach, pinned above the safe area: one primary, ink fill, **Start the morning**. Nothing else on the screen. No skip button: the primary is the skip, because both lines are optional.

**The one behaviour line (R18).** If the gratitude line was left empty yesterday and today's field is empty as the person taps *Start the morning*, the caption under the field reads, for that tap only: *Skipped yesterday too.* It then proceeds. Rules, from Sage: it appears on the second consecutive skip only, never on the first and never on the third and later (a third would be nagging; the person has decided); it never appears more than once in seven days; it is one fact with no adjective and no question mark; the *Ask one line of gratitude* switch in Settings turns the line off with the field. Sage's grade: a single recall cue of a recent choice is low-reactance for a manipulation-literate audience *only* because it is rare, factual and about a thing the person set up themselves; the endorsement test passes as long as it stays one line. If Taylor reads it here and it lands as pressure, delete it and nothing else changes.

**What you do.** Read. Type a few words, or don't. Tap *Start the morning*. The frame slides up (200ms settle) and the quick-pick is underneath.

**What it must never do.** Speak in the app's voice about the person. Show a time, a count, a streak, a "day 12". Show anything red or urgent. Play a sound. Require anything.

**On desktop.** The same column, centred in 720px, on paper; no rail until *Start the morning*.

**Spec.**

| Item | Detail |
|---|---|
| Component | `OrientFrame` (feature folder). Built from `Text` (serif), `Textarea` (serif, autogrow, one row), `Button`. |
| Props | `{ date: string; lastNight: { makeHappen: string \| null; visualisation: string \| null; lookingForward: string \| null } \| null; passage: string \| null; askGratitude: boolean; skippedYesterday: boolean; onStart: (fields: { gratitude: string; intention: string }) => void }` |
| States | with-journal · passage-only · both · nothing-yet (first morning: the passage placeholder reads *Nothing to read yet. Tonight's journal shows up here tomorrow.* — the frame never opens onto blank paper) · saving (the primary keeps its label, spinner inline; the fields are already saved by autosave) · offline (fields save locally; primary works) · focus-visible on the fields and the button. Confirm-yesterday is not here (§7.3). |
| Motion | none in; slides up 200ms out. Reduced-motion: crossfade. |
| Tokens | `bg-paper`, `text-ink`, `font-serif` for content, `font-sans` captions in `text-text-secondary`, hairlines `border-hairline`. |
| A11y | heading level 1 is the caption *Last night*; the journal lines are `blockquote`s with the prompt as `figcaption`; the two fields are labelled by their captions. |
| Copy | *Last night* · *Every morning* · *Grateful for, this morning* · *Today's intention* · *Start the morning* · *Skipped yesterday too.* — all adjustable. |
| Writes | `days.woke_at`, `days.woke_at_source = orient`, `days.morning_gratitude`, `days.intention`. |

### 5.3 The quick-pick: set the day

**Who is here, in what state.** Thirty seconds after waking. Wants the list, not a form. Knows roughly what today is.

**The one job.** Confirm today with the defaults already in place, swapping only what's different about today — three taps, then the list.

**What you see.** This is the Today tab in its **unconfirmed** state (R6), not a modal: the tab bar is visible beneath it, the day header sits at the top reading the date and, in muted text, *Not set yet*, and the body is a stack of sections, one per open question, each already answered with today's default. **Every section is collapsed to one summary row** — *Routine · 6 things · 68 min* · *Breakfast · meal-prepped* · *Push · after the routine* · *Focus · Viewpoint* — with **Change** as ghost text on the right; a section opens only when tapped. So the common morning is a glance down four rows and one tap on *Set the day*; the taps below are what happens when something about today is different. Sections that have no question (a locked routine, a structured day with one focus, no training today) do not appear. If yesterday has unconfirmed wind-down items (§7.3), a first section **Last night** sits at the top with those items as `CheckboxField` rows, none pre-ticked. For Taylor on a Monday, expanded:

1. **Routine** — the daily menu (his overflow mode): the morning landscape as `CheckboxField` rows, each with its length on the right, the highest-priority items pre-ticked down to the budget. A sticky line at the section's foot in tabular figures: *68 chosen · 72 available*. Ticking one more turns it to *83 chosen · 72 available*; nothing changes colour. Under the list, a ghost row: *Shorten to fit* (applies R4 to the ticked set). If his mode were *variants*, this section is instead one `PickerList` row per routine with counts (*Morning A · 1 of 2 left*), the week's assignment preselected.
2. **Before work** — one row per *one of*: *Breakfast* with a two-segment control **Meal-prepped 10 · Cook it 30**, last choice preselected. Choosing the shorter one makes the routine's line read *68 chosen · 92 available*, live.
3. **Training** — a row: *Monday's is push* with a **Still** · **Swap** control; Swap reveals the rotation's other workouts with counts remaining (*Legs · 1 of 1 left*); picking one shows the trade line *Trades with Tuesday's legs* (R25). Under it, **When**: a `QuickChipRow` of today's open spans — *Before the routine · After the routine · Inside work · After work* — with the last placement for this focus preselected, and *Not today* as the last chip.
4. **Work** — *Focus* as a `PickerList` row with the week's assignment preselected, or, if today floats, the focuses with remaining counts. If anchor direction is *depends*: a two-segment **Work waits · Routine gets cut** under it. On a *sometimes* day this section comes first as **Working today?** — *Yes · No*, and *No* collapses everything but the routine into the unstructured shape.
5. Fixtures for today, listed read-only under a caption *Already in place*: *Stand-up · 9:30*. No control; fixtures cannot be removed here.

Within thumb reach, pinned: primary **Set the day** (label carries the anchor when it is hard: *Set the day · work 9:00*), ghost **Unstructured today** (one tap to the grab-and-go shape).

**What you do.** Glance down the summary rows; tap *Change* on Breakfast and pick meal-prepped; leave the rest; tap *Set the day*. The sections settle into the list (§6.1) over 200ms, and the day header now reads *Work · 9:00*. On a morning where nothing is different, it is one tap.

**Over budget (R7).** If the routine line is over when *Set the day* is tapped, a `Dialog` (≤ 320px): *11 min over.* / *Everything you ticked is on the list. The routine runs to 9:11 on this plan.* — **Set anyway** · **Adjust** (returns to the list with *Shorten to fit* highlighted). With a soft anchor the dialog says *routine runs to ~9:11* and no other word changes. That is the whole notice.

**What it must never do.** Open blank. Ask a question that was already answered on Sunday. Refuse to set the day (except an unplaced workout, §3.7, which is one chip away). Show a percentage. Use the word *late*.

**On desktop.** Same sections in the 720px column; the rail is present; the primary sits at the bottom of the column.

**Spec.**

| Item | Detail |
|---|---|
| Component | `QuickPick` (feature folder) rendering inside the Today route when `day.confirmed_at` is null. Built from `DayHeader` (new `unset` line), section `GroupHeading`s, `CheckboxField`, `PickerList`, `SegmentedControl`, `QuickChipRow`, a sticky `BudgetLine` (new: two tabular numbers and a middle dot; no colour states), `Button`s, `Dialog`. |
| Props | `{ date: string; sections: QuickPickSection[]; budget: { chosenMin: number; availableMin: number; anchorIsHard: boolean; anchorLabel: string } \| null; onSet: (choices) => void; onUnstructured: () => void }` |
| States | unconfirmed (this) · setting (primary busy) · over (dialog) · workout-unplaced (primary label *Choose a time for push*, disabled until a chip is picked or *Not today*) · offline (choices queue; the day sets locally) · fixtures-only (unstructured day: the header, fixtures, **Add from the library** and **Add a one-off**). |
| Motion | sections collapse 200ms into the list. Reduced-motion: swap. |
| Writes | `days.confirmed_at`, `days.shape`, `days.work_focus_habit_id`, `days.anchor_is_hard`, `day_blocks` rows, `day_items` rows materialised for pooled parts, `original_scheduled_start` written now for every item on the day (R23). Notifications enqueue now (§9). |
| Copy | *Not set yet* · *chosen · available* · *Shorten to fit* · *Still · Swap* · *Trades with Tuesday's legs* · *Already in place* · *Set the day* · *Unstructured today* · *11 min over.* · *Set anyway · Adjust* — adjustable. |

### 5.4 After the pick

The Today tab is the list (§6.1). The day header reads the date, the focus, and the anchor as a plain time: *Monday 14 Sept · Viewpoint · Work 9:00*. There is no morning timer (Q29). The transition pushes are enqueued at block boundaries (§9).

---

## 6. The day

*Replaces v1 §5.1–5.3, §5.6, §5.8. Timers (§5.4), multitask (§5.5) and calendar items (§5.7) stand.*

### 6.1 Today tab

**Who is here, in what state.** Mid-morning, phone in one hand, between two things. Not deciding.

**The one job.** Move through today without deciding anything you don't have to.

**What you see.** The `DayHeader` at the top: *Monday 14 Sept* at 1.375rem; beneath it in muted text the focus and the anchor: *Viewpoint · Work 9:00* (or *Work ~9:00* when soft; the tilde is the whole difference). If `woke_at` differs from the wake target, *Woke 7:12* follows. Tapping the header opens the day header sheet (§6.2). The body is sectioned by **block** (R20), each with a `BlockHeader`: the block's name and its computed span in muted tabular text — *Morning · 7:03–8:11*, *Before work · 8:15–9:00*, *Work · 9:00–17:30*, *Wind-down · 22:00–22:45*. Inside each, `ItemRow`s exactly as v1 §5.2 specifies them: 44px checkbox on the left, icon, title, time text on the right, the 2px category edge if the habit has a category, the now/soon dot and word. A pin carries the small anchor glyph before its title; a *one of* item shows the chosen version's title only. The work block is one row: a container `ItemRow` variant with the focus as its title, its span as its time text, and the fixtures inside it nested beneath with a shallow indent; if training or a break splits it, the workout row sits between two work rows labelled *Work · 9:00–11:00* and *Work · 12:00–17:30*. The now line's dot sits on whichever row is now. Passed rows are at 0.55 opacity and fully interactive. Below the last block: the **not assigned today** expander (v1 §5.2), then **Day Complete** as v1 places it.

**What you do.** Tap a checkbox: done, with the 5-second inline undo. Tap a row: the item sheet (§6.3). Tap the header: the day header sheet.

**What it must never do.** Show a count, a percentage, a countdown, or anything red. Ask a question. Reach any configuration without leaving the tab — the item sheet's *Edit today's* is the one designed exception, and it edits the day, never the library.

**On desktop.** The same list in 720px with the rail; nothing else changes.

**Spec.** `DayHeader` (+ `focusLabel`, `anchorLabel`, `anchorIsHard`), `BlockHeader` (new; replaces `DayPartHeader`: `{ kind: BlockKind; name: string; span: { startLabel; endLabel } | null }`), `ItemRow` (+ `pinned`, `container` variant with nested children), `MultitaskGroup`, `ExpanderSection`, `DayCompleteAction`. States per §10.

### 6.2 The day header sheet

An `ActionRowSheet` with five rows, in this order: **Do now** is not here (it lives on items); **Adjust the day** (§6.6) · **Set wake time** · **Add from the library** · **Add a one-off** · **Edit today** (opens the Schedule tab with the drag layer live, §6.5). On a closed day: only *Edit today* in record mode. On an unstructured day, *Add from the library* is the primary way the day is built and appears first.

### 6.3 The item sheet, amended

v1's `ItemSheet` (identity row, time line, state line, timer, quantity, reflection, notes, footer) stands, with four additions:

1. **Do now** — a secondary button in the footer, present whenever the item is upcoming or passed and not done. Tapping it moves the item's `scheduled_start` to now, starts its timer, and slides every later item in the same block by the minimum needed so nothing overlaps; pins and fixtures don't move, and if the slide would push a soft item into a pin or past a hard anchor, the sheet says so in one line — *Stretch no longer fits before work* — with **Do now anyway** (the overflow item becomes not assigned today) · **Adjust instead** (§6.6). A ghost stays at the original time on the Schedule (v1 ghost-and-annotate). No reason is asked (R8).
2. **Edit today's** — a ghost text button in the header that opens the habit-day editor (§6.4).
3. **One of** — for an alternates member, a two-segment control at the top (*Meal-prepped · Cook it*) so the choice can be changed after the pick; changing it re-flows prep.
4. **Not today** — kept exactly as v1 §5.2: it collapses the item to the bottom of its block so you stop scanning past it, and the Day Review still asks about it. Leaving an item out *without* a review question is what the quick-pick (before the day is set) and Adjust (after) are for; a mid-afternoon *Not today* on something assigned is a decision the record should hold.

### 6.4 Habit-day editing

**The one job.** Change this item on this day — length, time, priority, whether it's in — without touching the habit.

**What you see.** A bottom sheet titled with the item's name and a caption *Today only*. Four controls: **Takes** — a `MinutesStepper` with the habit's range shown beneath as muted text (*usually 10–30*), never as a limit (R21); **At** — *In the stack* or a `TimeField` (setting a time pins it for today); **Priority today** — `Stepper17` showing the resolved value; and a ghost row **Leave out today** (→ not assigned). Footer: *Cancel · Save*. A muted line at the bottom: *Changes the day, not the habit.* with a text link **Also change the habit** that opens the habit sheet.

**What it must never do.** Clamp (W10). Write to the library. Ask for a reason.

**Spec.** `HabitDaySheet` (feature folder): `MinutesStepper` (no bounds beyond 1–480), `SegmentedControl` + `TimeField`, `Stepper17`, ghost `Button`. Writes `day_items.duration_min`, `scheduled_start`/`pinned`, `priority`, `assignment_state`. The block re-flows on save.

### 6.5 Schedule tab, now editable

**Who is here, in what state.** Late morning, checking where the day sits; or 7:40 with a workout to place; or 18:00 moving the evening around. Calm enough to drag.

**The one job.** See the day against the plan, and move things by hand where the natural gesture is to move them.

**What you see.** v1 §5.3's axis, blocks, now line, ghosts, shift bands — all stand. Added: each block kind renders as a **band** behind its items, a very light fill (`bg-surface`) with the block's name in the gutter at the band's top, so the day reads as *morning · prep · work · wind-down* at a glance and the empty spans between bands are visibly *open*. The work band is the tallest; fixtures sit inside it as pinned blocks with the anchor glyph. The training block, once placed, sits where it was placed; if *inside work*, the work band visibly splits around it. The day header from §6.1 is at the top of the tab too.

**What you do.** Long-press an item block to lift it; drag to a new time; it snaps to 5 minutes and the items it displaces re-stack beneath it as it moves; release to drop. Drag a block band's header to move the whole block (the morning 30 minutes later). Drag an item's bottom edge to change its length for today. Tap an appointment or fixture and drag: the block does not lift; instead a `Dialog` asks *Move Dentist to 3:15?* — **Move** · **Cancel** (R22) — so a fixed thing cannot move by accident. Tap any block: the item sheet.

**What a drag means for the record (R8, R23).** A drag on an item that hasn't happened is a re-plan: `scheduled_start` moves, `original_scheduled_start` doesn't, the ghost shows on the axis only after the original time has passed, and the item, when done, counts as *moved* in Review — a count, never a score. A drag on the whole morning is offered as **Adjust** instead (§6.6), because moving the morning is a decision with a reason, and the person's thumb should land on the sheet that asks for it.

**What it must never do.** Move a pin, a fixture, or the hard anchor by a slip of the thumb. Leave two things overlapping (multitask is created only through the same-start question, never by dropping one block on another — dropping onto an occupied time inserts, and the occupant slides). Lose the ghost.

**On desktop.** Mouse drag without long-press; the item sheet opens beside the axis; keyboard per §10.4.

**Spec.**

| Item | Detail |
|---|---|
| Components | `ScheduleAxis` (+ `BlockBand` children), `ScheduleBlock` (+ `draggable`, `resizable`, `pinned`), `DragLayer` (new: handles lift, snap, re-stack preview, drop; touch and pointer), `ConfirmDialog` for pins. |
| Gestures | long-press 300ms lifts; drag; 5-min snap; bottom-edge resize; band-header drag for a whole block. Two-finger scroll while lifted. Haptic on lift and drop where available. |
| Keyboard | focus a block; Alt+↑/↓ moves it 5 min; Shift+↑/↓ resizes; Enter opens the sheet; `m` then a time moves it. |
| States | idle · lifted (block at 0.9 opacity, 1.5px `border-accent-mark`, the re-stack preview drawn beneath) · dropping (120ms settle) · refused (a pin under the drop: the block returns, a one-line `StatusLine` *Fixed things don't move by drag*) · confirming (dialog) · closed day (record mode: no drag layer) · future day (plan mode: drag allowed, no ghosts, no now line). Focus-visible on every block and band. |
| Motion | lift scales to 1.02 over 120ms; re-stack preview moves 120ms; drop settles 120ms. Reduced-motion: no scale, positions jump. |
| Writes | `day_items.scheduled_start/end`, `duration_min`, `pinned`; `day_blocks.start/end` on a band drag. Never `original_scheduled_start`. |

### 6.6 Adjust: one sheet for slept in, ran long, something came up

*Replaces v1 §5.6 (shift) and §5.8 (trim), and answers Q8, Q14, L2 and L6. Written from how a person actually decides: first what happened, then what gives, then how, then approve.*

**Who is here, in what state.** 8:10, the morning was set for 7:03, nothing has been ticked because sleep won; or 8:40, breath work ran long and the walk is now in question; or 7:50 and a call just landed. Slightly stressed. Wants the day to make sense again in three taps.

**Entries.** The day header sheet's **Adjust the day** row; the Schedule's band-header drag on the morning (§6.5); and one quiet offer: when the orient frame is opened more than 30 minutes after the wake target *and* the day was set the night before with a hard anchor, the Today tab shows a single dismissable `StatusLine` at the top — *Up later than planned · Adjust the morning* — once, never repeated that day. (On a day that hasn't been set yet, no offer is needed: the quick-pick's budget already reflects the later wake, and the defaults are pre-shortened to it.)

**The one job.** Get the rest of the day to fit, with the person choosing what gives, and the record keeping why.

**What you see — step by step, one sheet, each step expanding beneath the last.**

1. **What happened.** A `QuickChipRow` of the reason set, preselected by the entry (*Slept in* from the late offer; *Ran long* from the header row; *Something came up* when entered from a one-off's sheet): **Slept in · Ran long · Something came up · Other**. This is v1's reason step made one row; the tier travels with the chip (§11.9). One tap, usually none.
2. **What gives.** Two or three `LargeTargetRow`s, ordered by anchor direction: with a soft anchor, **Start work later** first (*Work moves to 9:40; everything slides.*), then **Keep work at 9:00**; with a hard anchor, only the second; with *depends*, both, neither preselected. Choosing *Start work later* skips step 3 — the whole remainder slides, and the sheet goes to the proposal.
3. **How.** Three rows: **Shorten everything** — *Each thing to the short end of its range; then the lowest priorities go.* (R4) · **Cut some** — *The lowest priorities go; everything else keeps its length.* · **Choose what stays** — *Tap the list.* The third opens the remaining items as `CheckboxField`s with the live budget line, the quick-pick's grammar again.
4. **The proposal.** The remaining morning as a compact read-only list: each item with its new length and time (*Breath work · 10 min · 8:12*), the items that don't fit listed beneath under *Not assigned today* with **Keep instead** on each (swapping trims the next-lowest, v1 §6.8), and one sentence above it all: *Fits. Work at 9:00.* or *Work moves to 9:40.* Primary: **Set** (label carries the consequence: *Set · 2 not assigned* or *Set · work 9:40*). Secondary: **Cancel**.

**What it must never do.** Detect. Score in the sheet (the tier is a chip, the words *counts half* live in Review only). Use *late*, *behind*, *catch up*. Shorten below a range floor (R4). Move a pin or a fixture — if a fixture makes the fit impossible, the proposal says *Stand-up 9:30 stays; the walk doesn't fit before it* and offers cutting the walk.

**On desktop.** The right panel, 420px, same steps.

**Spec.**

| Item | Detail |
|---|---|
| Component | `AdjustSheet` (feature folder; replaces `ShiftSheet` and `TrimSheet`). Built from `ResponsiveSheet size="tall"`, `QuickChipRow`, `LargeTargetRow`, `CheckboxField`, `BudgetLine`, `OverflowCutList` (reused for *Keep instead*), `Button`s. |
| Props | `{ open; onOpenChange; date: string; entry: "late-offer" \| "header" \| "one-off" \| "band-drag"; bandDragDeltaMin?: number }` |
| Logic (`useAdjust`) | computes the remaining span to the next hard thing (anchor or pin); shorten = each soft item to `max(duration_min_min, current)` then cut ascending by priority (v1 §6.6 ties) until fits; cut = cut ascending until fits; choose = the person's ticks; slide = a `shifts` row with `kind: shift`. Hard items never trimmed. 10-second undo after Set. |
| States | step 1–4 · fits · doesn't-fit-even-cut (*Nothing soft is left to cut. Work runs to 9:20 on this plan.* — Set is still allowed; the number is the feedback) · applying · error (*Couldn't adjust. Nothing changed — try again.*) · offline (disabled with the standard line). Each step's block expands 200ms; reduced-motion appears instantly. |
| Writes | a `shifts` row (`kind: shift \| refit`, reason, tier, `cut_item_ids`); cut items → `assignment_state: cut_by_shift` with a Miss inheriting the tier (v1 R1 and §6.5 stand); shortened items → `duration_min` on the habit-day; slid items → `scheduled_start`. |
| Copy | as written above; adjustable. |

---

## 7. The evening

*New. The wind-down routine, the journal, and confirm-yesterday. Sage's lens applies to every line here: the evening is the lowest-willpower hour of the day, and the phone is about to go away.*

### 7.1 The wind-down routine

The wind-down block stacks **backward from lights-out** (Q11). Its structure is opener · pool · closer like a morning routine, with two fixed things the app places for the person from first-run screen 10:

- **Devices off** — a pin at `devices_off_time`, rendered as a hairline row with the anchor glyph and the time, no checkbox. It is a marker, not a task: nothing after it expects the phone.
- **The journal** — the closer, placed so it ends at devices-off. It needs the phone; everything after devices-off doesn't.

So a typical stack, backward from 22:45 lights-out with devices-off at 22:15: *Journal 22:05–22:15 · Devices off 22:15 · Read 22:15–22:35 · Stretch 22:35–22:45 · Lights out 22:45.* On the Today tab the wind-down section shows these rows in time order; the items after devices-off render without a checkbox and with the caption *confirm in the morning* — they are confirmed after the fact, never ticked live (§7.3).

The starter library for wind-down (Q11): reading · stretching · meditation · a bath · tidy the kitchen · lay out tomorrow · devices off (placed) · journal (placed). Nothing pre-checked.

**Notification.** One push at the wind-down block's start (§9), in the person's words. None for the journal, none for devices-off unless the person turns that one on (it is a time they set, so it qualifies).

### 7.2 The journal

**Who is here, in what state.** Late. Tired. Possibly disappointed in the day. Willpower gone. Ten minutes at most before the phone goes away.

**The one job.** A few lines in the person's own words — where they want to be, not what happened — so the morning has something true to read back.

**What you see.** Opened from the wind-down section's *Journal* row, or from the push. No header bar beyond a back and the date; paper; a single reading column. Six prompts in order (Q32), each a caption in muted sans over a serif `Textarea` that starts at one row and grows: *How the day went* · *Grateful for today* · *Grateful for, in life* · *Looking forward to* · *What I want to make happen tomorrow* · *Tomorrow, as I see it* (the visualisation, last). Every field autosaves on pause; a `SaveStatus` in the corner says *saved* in caption size and nothing louder. There is no finish button, no word count, no timer (Q33), no "done" ceremony. The row in the wind-down section ticks itself when any field has text. Within thumb reach: nothing but the fields; the back is the exit and always works.

**What you do.** Write in whichever fields you want. Leave. That's all.

**What it must never do.** Nag for an empty field. Time the person (P2-5). Comment on length. Summarise. Show yesterday's entry alongside (that's the morning's job). Turn empty into pending — an empty journal night is nothing, not a miss (ledger §26).

**On desktop.** The 720px column, serif, the same six prompts.

**Sage's note.** Two gratitudes stay two fields: the first is a record (it feeds the Week Review's reflections), the second is a state. The prompts are the person's (editable in Settings → Closing the day); the app never supplies an answer, a starter phrase, or an example. Playback in the morning is the mechanism that gives this feature its effect — implementation intentions written at night, read at the moment they apply — and it is the best-replicated tool in the toolkit, with a modest, honest effect. Nothing here should be dressed as more.

**Spec.**

| Item | Detail |
|---|---|
| Component | `JournalScreen` (feature folder). `Text` captions, `Textarea` (serif, autogrow), `SaveStatus`. |
| Props | `{ date: string; prompts: readonly { key: string; label: string }[]; entry: Record<string, string>; onChange: (key, value) => void }` |
| States | empty · writing · saved · retrying (*Saving on this device*) · offline (local) · read-only (a past day, from Review; the fields render as serif text with hairlines). Focus-visible on each field; Escape and back leave. |
| Writes | `journal_entries` (one row per day, `answers` keyed by prompt key). Marks the wind-down journal item done when any field is non-empty. |
| Copy | the six prompts — Taylor's words, adjustable per person. |

### 7.3 Confirm yesterday

**Who is here, in what state.** The next morning, on the orient frame, or opening the Day Review. Ten seconds of attention.

**The one job.** Say what actually happened after the phone went away, once, with one tap per item.

**What you see.** The first section of the quick-pick (§5.3), only when yesterday has unconfirmed wind-down items: a caption *Last night*, then the items after devices-off as `CheckboxField` rows — *Read · Stretch* — none pre-ticked, each 44px. It is not on the orient frame, which stays one thing to read and one line to write. If the Day Review is opened before the morning (the person reviews at 23:30 with the phone still in hand), the same panel is the first section of the review. Confirming writes done for ticked items. Unticked items become **not confirmed** when *Set the day* is tapped: excluded from the number, shown in the Week Review's strip as blank with the label *not confirmed*, counted in plain words on the Week Review (*2 not confirmed*), listed at the top of the Day Review as needing a decision whenever it is opened, and resolvable there with one tap (R16). They are excluded, never hidden.

**What it must never do.** Pre-tick (that fabricates the record). Ask for a reason (the evening has none worth a tier; Sage's worst-state rule). Block the morning: the section is optional, the primary is still *Set the day*.

**Spec.** `ConfirmYesterdayPanel` (feature folder; used by `QuickPick` and `DayReview`). `CheckboxField` rows. Writes `day_items.completion_state: done` (ticked) or `not_confirmed` (unticked, on Set). `[DEFAULT — R16]`

---

## 8. Review under the new model

*Amends v1 §7. The resolver (§7.3) and the number (§7.4) stand.*

### 8.1 Day Review

v1 §7.2 stands with these changes:

- **Sections by block.** Undone items are grouped under `BlockHeader`s in block order. The wind-down block shows the confirm-yesterday panel (§7.3) first if it hasn't been done.
- **What appears.** Items left out by the pick or by Adjust's *Choose what stays* are *not assigned today* and don't appear (v1 R1); *Not today* items appear as v1; cut-by-shift items appear resolved with the Adjust reason and a *Change* affordance, as v1; *not confirmed* wind-down items appear at the top as needing a decision (§7.3).
- **Moved is a line, not a section.** *3 moved* in the header's plain words; each moved item's panel shows *planned 7:20 · done 7:52*.
- **The work block is never scored.** It appears once as a line: *Work · Viewpoint · 9:04–17:40* with no decision.
- **The orient line.** If an intention was written that morning, the review header shows it back in serif under the date: *Intention: one thing at a time.* No question about it. `[Consider: cut if it reads as a report card.]`

### 8.2 Week Review

v1 §7.5 stands with these changes:

- **Counts as information** (Q10): under the header, one muted line per pooled thing — *Morning A 2 of 2 · Menu 3 · Viewpoint 2 of 2 · Applications 0 of 1 · Push 1 of 1 · Legs 1 of 1 · Unstructured 1 · 2 not confirmed*. Tabular, no colour, no marker beyond the existing most-behind dot in the week build.
- **Time by block** (R10): a stacked horizontal bar with one segment per block kind, minutes beside each — *Morning 5 h 10 · Training 3 h · Prep 5 h 15 · Work 41 h · Activity 4 h 30 · Wind-down 4 h 40*. Colour: the neutral scale stepped, no hues, because blocks are not categories. **Time by category** remains beneath it for people who use categories, in the category hues, as v1.
- **Reflections** (ledger §30): a region in serif listing the week's *Grateful for today* and *Looking forward to* lines verbatim, one per day, dated, no synthesis. Empty state: *Nothing written this week.* Nothing else.
- **Strip states** gain *not confirmed* (blank square, label) alongside not assigned.
- **History** as v1. No monthly view (P2-4).

---

## 9. Notifications

*Amends v1 §8. Principles (§8.1), permission (§8.3), never-sent (§8.5) and plumbing (§8.6) stand.*

### 9.1 The catalogue, revised

| # | Trigger | Default | Title / body | Change from v1 |
|---|---|---|---|---|
| N1a | **Block start** — the start of each block after the pick: prep · training (when placed) · work (the anchor) · break · activity's first fixture · wind-down | On | *Before work · 8:15* / (nothing) · *Work · 9:00* · *Wind-down · 22:00* | Replaces N1's one-per-item default (R19). Enqueued at Set the day. |
| N1b | **Item start** — any fixed-time item inside a block | Off, per block | *Cold shower · 7:23* | The v1 N1, now opt-in per block in Settings → Notifications. |
| N1c | **Pins and fixtures** | On | *Stand-up · 9:30* | Fixtures always notify, they are the times most worth a push. |
| N1d | **Devices off** | Off | *Phone away · 22:15* | A time the person set; qualifies under §8.1. |
| N4 | Day Review reminder | On | as v1 | — |
| N5 | Pending review | On | as v1 | — |
| N6 | Week build | On | as v1 | — |
| N7 | Week Review ready | On | as v1 | — |
| N8 | Timer running | On | as v1 | — |

Removed: the wake push (there is no wake habit); any push for the journal (Q35); any push for the orient frame. The orient frame is what the person opens, not what the app sends.

### 9.2 Timing rule

Nothing derived from the pick exists before the pick, so N1a/N1b enqueue at `days.confirmed_at`; fixtures (N1c) enqueue at week build. On an unconfirmed day at 9:00, the only push that fires is a fixture's.

### 9.3 Settings → Notifications

One toggle per row above; N1b renders as a group of block-kind toggles under one heading *Every item in…*. The reminder-time and week-build pickers stay. **Quiet after Day Complete** stays on and non-editable.

---

## 10. State matrix, tokens, accessibility

### 10.1 Item states — additions to v1 §5.9

The v1 matrix stands. Rows added or changed:

| State | Visual (Today) | Visual (Schedule) | Interactive | Notes |
|---|---|---|---|---|
| Unconfirmed day | The quick-pick replaces the list; header line *Not set yet* | Axis with fixtures and bands only; no now line; a centred line *Set the day first* with a link | Set the day · Unstructured today | Not an error; not empty |
| Pinned | Anchor glyph before the title | Anchor glyph; block does not lift on drag | Confirm to move | Fixtures and timed one-offs |
| Pool item (before pick) | Not shown; the pick shows it | Not shown | — | Exists only in the pick |
| One of, chosen | The chosen title; the alternative in the sheet | Chosen block only | Change in the sheet | Prep re-flows on change |
| Training unplaced | Not shown; the pick refuses to set | Not shown | Choose a time · Not today | Never a miss |
| Container (work) | Title = focus; nested fixtures; no checkbox | Tall band; splits around training | Open; start/stop the block timer | Never scored |
| Split work | Two rows *Work · 9:00–11:00* and *Work · 12:00–17:30* | Two bands | As container | Only when training or a break is inside |
| Slack | Not shown | Empty band between two block bands, labelled in the gutter (*12 min*) | Drop target | Never coloured |
| Lifted (drag) | — | 0.9 opacity, 1.5px `border-accent-mark`, re-stack preview beneath | Drop · Escape cancels | Motion 120ms |
| Refused drop | — | Returns; one `StatusLine` line | — | Pins and fixtures |
| Moved (re-plan) | Time text unchanged until done; then *→ actual* in `text-violet-text` | Ghost after original time passes; live block | Yes | Count, not score |
| Confirm in the morning | Row without checkbox; caption *confirm in the morning* | Block at default | Sheet opens read-only | Items after devices-off |
| Not confirmed | Absent; listed in Review as *not confirmed* | Ghost outline | Resolve from Day Review | Excluded from the number |
| Devices off | Hairline row, anchor glyph, time, no checkbox | Hairline at the time | None | A marker |
| Unstructured day | Header, orient, wind-down, fixtures; two actions between | Bands for orient and wind-down only | Add from the library · Add a one-off | Hospitality, not apology |

Focus-visible on every interactive element: 2px `--ring`, 2px offset, both themes (v1 §5.9). Drag targets are also keyboard targets (§10.4).

### 10.2 Component states — the new components

| Component | States |
|---|---|
| `BlockEditor` | create · edit · saving · saved · retrying · failed · offline · in-use · overrun · empty · lifted · resizing · gap-dragging |
| `OrientFrame` | with-journal · passage-only · both · nothing-yet · saving · offline |
| `QuickPick` | unconfirmed (sections collapsed) · section-open · with-last-night · setting · over · workout-unplaced · working-today? · offline · fixtures-only |
| `BudgetLine` | under · exact · over (no colour change in any; the second number is the feedback) |
| `AdjustSheet` | step 1–4 · fits · doesn't-fit-even-cut · applying · error · offline · undo (10 s) |
| `HabitDaySheet` | default · pinned-today · left-out · saving · error |
| `DragLayer` | idle · lifted · dropping · refused · confirming |
| `JournalScreen` | empty · writing · saved · retrying · offline · read-only |
| `ConfirmYesterdayPanel` | pending · confirmed · none |
| `FixtureSheet` | create · edit · saving · error |
| `BlockHeader` | with-span · no-span (unstructured) · split |

### 10.3 Tokens

No new colours. The block bands use `bg-surface` at rest; nothing else is introduced. The gutter labels are `text-text-secondary` caption size, tabular. Drag affordances use `border-accent-mark`, the same mark as the now line — the accent marks time, and a lifted block is a thing being placed in time. *Time by block* steps through `neutral-300 … neutral-700` in the light theme (`neutral-600 … neutral-200` in dark), with the minutes printed beside each segment so colour is never the only carrier. Newsreader appears on three new surfaces — the orient frame, the journal, the Week Review's reflections — all reflective, per v1 §9.4's rule. Spacing stays on the 4·8·12·16·24·32·48 scale; the block band's gutter label sits at 8px from the band's top.

### 10.4 Accessibility

v1 §11 stands. Additions:

- **Every drag has a keyboard equivalent** (§3.11, §6.5): Alt+arrows move, Shift+arrows resize, `g` sets a gap, `m` sets a time. The `DragLayer` announces *Lifted {title}* on lift and *{title} moved to {time}* on drop via a polite live region; refused drops announce the status line.
- **Long-press has a fallback**: an *Edit today* row in the day header sheet puts the Schedule into an explicit move mode where a single tap lifts and a second tap drops, for people who cannot hold a press.
- **The quick-pick's budget line** is `aria-live="polite"` with a 500ms debounce so tapping three boxes announces once.
- **The orient frame's journal lines** are `blockquote`s with `figcaption` prompts, so a screen reader reads the prompt then the words, in order.
- **The confirm-yesterday rows** are labelled *Read, last night, not confirmed*.
- **Text at 200%**: the block editor's strip switches to 96px per hour and the gutter labels wrap under the hour; the quick-pick's rows stack the length under the title.
- **Reduced motion** is designed on every new surface: no lift scale, positions jump, sheets crossfade, the mark appears without drawing.

---

## 11. The data model, as Mason

*This section is written in Mason's voice against what is on disk: [`templates.ts`](../../packages/db/src/schema/plan/templates.ts), [`template-slots.ts`](../../packages/db/src/schema/plan/template-slots.ts), [`save-slot.ts`](../../packages/api/src/services/plan/save-slot.ts), [`materialize-day.ts`](../../packages/api/src/services/day/materialize-day.ts), and [`SCHEMA_REFERENCE.md`](../../packages/db/SCHEMA_REFERENCE.md). Field names are the ones I'd expect to see. Everything is owner-private with the standard three policies; nothing here changes the RLS posture. Migrations are append-only; each subsection names its migration cost so Reeve can size the tickets.*

### 11.1 The shape of the change, in one paragraph

v1 had one plan noun, `templates`, meaning a whole day, and one instance noun, `day_items`, hanging off a `days.template_id`. v1.1 keeps both tables and changes what a template *is*: a **block**, with a kind and a flow direction. A day is then an ordered set of `day_blocks`, each pointing at the template it came from, and a `day_item` belongs to a `day_block`. Slots stop storing absolute offsets and store a duration plus a gap; offsets are derived by walking the stack in the block's flow direction. That is the load-bearing change. Everything else — pins, alternates, pools, fixtures, workouts, focuses, the journal — is a column or a small table on top of it. I've chosen the cheapest shape at every fork and said where a richer one was declined.

### 11.2 `users` — profile additions

| Column | Type | Note |
|---|---|---|
| `schedule_shape` | enum `own_structure_dynamic · consistent_shifts · varying_shifts · fluid`, nullable | Only the first is live. Stored so the seam exists (ledger §11). |
| `work_days` | jsonb `{ "0": "always" … "6": "never" }` | Mon = 0. Seven keys, three values. A jsonb, not seven columns, because it is read as one thing. |
| `work_start_time` | time, nullable | The anchor. |
| `work_end_time` | time, nullable | *Until about* (R24). |
| `anchor_direction` | enum `work_waits · routine_cut · depends`, nullable | §3.3. |
| `earliest_wake_time` | time, nullable | Informational in v1.1. |
| `lights_out_time` | time, nullable | Wind-down flows backward to it. |
| `devices_off_time` | time, nullable | A pin in the wind-down template. |
| `overflow_mode` | enum `daily_menu · variants · auto_trim`, default `daily_menu` | §3.10. |
| `orient_passage` | text ≤ 2000, nullable | |
| `orient_show_last_night` | boolean, default true | |
| `orient_ask_gratitude` | boolean, default true | Also switches the R18 line. |
| `journal_enabled` | boolean, default true | |
| `journal_prompts` | jsonb `[{ key, label }]` | Ordered, editable; seeded from `DEFAULT_JOURNAL_PROMPTS` in `@syn/constants`. |
| `block_order` | jsonb `BlockKind[]` | Default order; training and break placed per day. |
| `data_sources` | — | **Not added.** Recorded as a seam: a future `data_sources` table, one row per connection. Nothing to reserve now. |

`usual_wake_time` stays. `wake_anchor_habit_id` **stays as a column and stops being written** (R11); dropping it is a later cleanup migration once nothing reads it. Removing a column in the same migration that changes its meaning is how records get corrupted.

### 11.3 `habits` — block kind, workouts, focuses

| Column | Type | Note |
|---|---|---|
| `block_kind` | enum `BlockKind`, nullable | The block this habit lives in by default; null = anywhere. Drives the library grouping and the *Add* filter. |
| `weekly_target` | smallint 1–7, nullable | For workouts and focuses only (a rotation count). The same name as the template column, deliberately. |
| `typical_days` | smallint[], nullable | Mon = 0. For workouts and focuses. |

`item_type` gains **`workout`**. A focus is a `deep_work` habit (the type already exists and means "a timed block of work"); the work block's item is the focus. Categories stay (R10). `task_appointment` stays for one-offs and calendar imports; it is no longer offered in the library's habit sheet (W6), only in the one-off and fixture sheets.

*Declined:* a separate `workouts` table and a `focuses` table. Both would be a name, a count, typical days and a length — which is a habit. Two tables would mean two sheets, two archive paths, two RLS sets, for no query that needs them apart.

### 11.4 `templates` → block templates

| Column | Change |
|---|---|
| `kind` | **add**, enum `BlockKind`, not null. Backfill: existing rows → `morning`. |
| `flow` | **add**, enum `forward · backward`, not null, default `forward`. Prep and wind-down templates are `backward`. |
| `structure` | **add**, enum `stack · opener_pool_closer`, default `stack`. |
| `anchor_time` | **keep**, now nullable. A block template's anchor comes from the profile (wake, work start, lights-out) at materialisation; `anchor_time` remains only as an explicit override for work templates with their own hours (R5). |
| `weekly_target`, `typical_days`, `name`, `archived_at` | unchanged. Routine variants with counts are exactly what these already do. |

The v1 idea "a template is a whole day" is gone; a day's template list is `day_blocks`.

### 11.5 `template_slots` — durations, gaps, pins, roles, alternates

| Column | Change |
|---|---|
| `offset_start_min`, `offset_end_min` | **drop** (after backfill — see below). |
| `gap_before_min` | **add**, smallint 0–240, not null, default 0. |
| `pinned_at` | **add**, time, nullable. A pin. Mutually exclusive with a non-zero gap (a check constraint: `pinned_at IS NULL OR gap_before_min = 0`). |
| `role` | **add**, enum `stack · opener · pool · closer`, default `stack`. Only meaningful when the template's `structure` is `opener_pool_closer`. |
| `alternates_group` | **add**, text, nullable. Same local-id pattern as `multitask_group`; members share a position. `alternates_default` boolean marks which member the fit arithmetic uses. |
| `sort_order` | **now the stack order**, not just a tie-break inside a bracket. |
| `time_mode`, `scheduling`, `duration_min`, `priority_override`, `multitask_group` | unchanged. `window` and `unscheduled` survive for items that genuinely float inside a block. |

**Backfill migration.** For each template, order slots by `offset_start_min`; set `sort_order` to that order; set `gap_before_min = this.offset_start − (prev.offset_start + prev.duration)`, floored at 0; slots that overlapped their predecessor without a multitask group get gap 0 and a warning logged to the migration output for a human to look at. No data is lost: the derived offsets reproduce the originals exactly for well-formed templates.

**`save-slot.ts`.** The same-start rule becomes a same-position rule with three answers (§3.5): the service keeps the invariant that two slots at one position must share a `multitask_group` **or** an `alternates_group`, and refuses otherwise with a `SamePositionError` carrying both options. `findCollisions` reads the same rule. This is the one service change with a real edge: an alternates group's members must have `sort_order` equal and `gap_before_min` equal, enforced in the service, not the sheet.

### 11.6 `fixtures` — new

| Column | Type |
|---|---|
| `id`, `user_id`, `created_at`, `updated_at`, `archived_at` | standard |
| `title` | text 1–60 |
| `weekdays` | smallint[] ⊂ 0–6, not null, non-empty |
| `at_time` | time, not null |
| `duration_min` | smallint 1–480 |
| `block_kind` | enum, default `activity` (or `work`) |
| `scheduling` | enum, default `hard` |
| `habit_id` | uuid nullable — a fixture may point at a library habit for icon and category; usually null |

Materialised into `day_items` with `origin: fixture` and `pinned: true` on every planned instance of the weekday. This is where calendar import lands later (P2-7): an imported event is a fixture-shaped row with `calendar_event_id`.

### 11.7 `days` and `day_blocks`

`days` additions:

| Column | Type | Note |
|---|---|---|
| `shape` | enum `structured · unstructured`, default `structured` | |
| `confirmed_at` | timestamptz, nullable | Set the day. Null = unconfirmed. |
| `anchor_is_hard` | boolean, nullable | Today's answer under *depends*; else copied from the profile. |
| `work_start_time` | time, nullable | Today's anchor, after any slide. |
| `work_focus_habit_id` | uuid → habits, `set null` | |
| `morning_gratitude` | text ≤ 280 | |
| `intention` | text ≤ 140 | |
| `woke_at_source` | enum gains `orient` | |

`days.template_id` **stops being written** and is dropped in the cleanup migration with `wake_anchor_habit_id`. `anchor_time` stays as the wake anchor (what it always was in practice).

`day_blocks` — **new, the load-bearing table**:

| Column | Type | Note |
|---|---|---|
| `id`, `user_id`, `day_id`, `created_at`, `updated_at` | standard | |
| `kind` | enum `BlockKind`, not null | |
| `template_id` | uuid → templates, `set null` | |
| `template_name_snapshot` | text | Same discipline as `day_items`. |
| `sort_order` | smallint | The day's block order. |
| `scheduled_start`, `scheduled_end` | timestamptz, nullable | Derived at materialisation; moved by a band drag or Adjust. |
| `original_scheduled_start` | timestamptz, nullable | Written at Set the day (R23). Immutable by trigger, like the item's. |
| `placement` | enum `before_morning · after_morning · inside_work · after_work · in_break`, nullable | Training and break only; the choice, kept for the *remember last placement* default. |
| `state` | enum `planned · pooled · set · not_today`, default `planned` | `pooled` before the pick on a pool day; `not_today` for an unplaced workout the person declined. |

Unique on `(day_id, kind, sort_order)`; two work blocks exist when training splits work.

### 11.8 `day_items` additions

| Column | Type | Note |
|---|---|---|
| `day_block_id` | uuid → day_blocks, cascade | Nullable only for legacy rows; the cleanup migration makes it not null. |
| `pinned` | boolean, default false | |
| `gap_before_min` | smallint, default 0 | Snapshotted from the slot; edited by a seam drag on the day. |
| `alternates_id` | uuid, nullable | Per-day group id, like `multitask_id`. |
| `alternates_chosen` | boolean, nullable | Which member is live; the other is `assignment_state: not_assigned` with a reason of *one of*. |
| `origin` | enum gains `fixture` | |
| `completion_state` | enum gains `not_confirmed` | R16. |

`original_scheduled_start` keeps its immutability trigger; **the change is when it is written**: null at week build for items on a pool day or inside an unconfirmed structured day, set by the confirm service at Set the day. The trigger allows the null → value transition once and refuses every later write. For fixtures and pins on structured days it is still written at week build, because those are set regardless of the pick.

### 11.9 `shifts` — reused for Adjust

| Column | Change |
|---|---|
| `kind` | **add**, enum `shift · refit`. A slide of the anchor is a `shift`; a shorten-or-cut with the anchor held is a `refit`. Both carry `reason_key`, `tier`, `cut_item_ids[]` as v1. |
| `shortened_item_ids` | **add**, uuid[] — items whose `duration_min` was reduced, so the Day Review can say *shortened* rather than *moved*. |

The resolver (v1 §7.3) is unchanged: cut items inherit the tier; shortened items are done or missed like any other.

### 11.10 `journal_entries` — new

| Column | Type |
|---|---|
| `id`, `user_id`, `day_id` (unique per day), `created_at`, `updated_at` | standard |
| `answers` | jsonb `Record<promptKey, string>` |

A jsonb keyed by prompt key, not six columns, because the prompts are editable per person and a renamed prompt must not orphan an answer. The morning reads `make_happen_tomorrow`, `visualisation`, `looking_forward` by key; if a person deletes a prompt, the orient frame reads what exists.

### 11.11 Materialisation, restated

`materializeDay` becomes one pass per `day_block`, in `block_order`, in two phases:

1. **Week build (`state: planned`)** — for each structured day: create `day_blocks` for every kind the day has; for blocks whose template is assigned and whose items are all resolved (no pool, no alternates, no placement), materialise `day_items` with derived times and `original_scheduled_start`; for pooled blocks, create the block with `state: pooled` and no items; materialise fixtures into their block as pins. Tomorrow's list is real tonight for everything that was decided on Sunday, which keeps the offline promise for the decided parts and is honest about the rest.
2. **Set the day (`confirmed_at`)** — resolve pools, alternates, placement and focus from the pick; walk each block in its flow direction (forward from `woke_at` for morning; backward from `work_start_time` for prep; backward from `lights_out_time` for wind-down; training and break at their placement); write times; write `original_scheduled_start` where null; enqueue notifications. The reconcile-not-rebuild rule from the existing service still holds: touched rows are never rebuilt.

The walk itself is a pure function in `@syn/utils` — `stackBlock(items, { flow, anchor, pins })` — returning start times, the slack, and any overrun. The block editor's footer, the quick-pick's budget line, the fit screen, the Adjust proposal and the materialiser all call the one function. That is the whole reason the arithmetic can be shown live in four places without four implementations.

### 11.12 What this costs, honestly

- **Two migrations that touch live tables** (`template_slots` backfill; `days`/`day_items` additions with a trigger change). A human reviews both; neither runs against a hosted database without Taylor. The cleanup migration (drop `offset_*`, `days.template_id`, `wake_anchor_habit_id`) is a third, later.
- **Three services rewritten**: `save-slot`, `materialize-day`, and a new `confirm-day`. `shift-day` and `trim-day` fold into `adjust-day`.
- **One pure function** that everything depends on, which is the best kind of dependency.
- **No change** to RLS, to the resolver, to the number, to the export shape (new tables are added to the zip), or to notification delivery — only to when things enqueue.

*Declined, and why:* a generic `pools` table (every pool in v1.1 is "the active habits of a kind with counts", which is a query, not a table); a `moves` log for drags (the ghost needs only the original start; a full move history is a Review feature nobody has asked for); day parts on `day_blocks` (P2-6, and the block already carries a kind).

---

## 12. Copy register and vocabulary

### 12.1 Register

v1 §10.1 stands: plain, present, specific; sentence case; no exclamation marks; no emoji; a notebook's voice. Two surfaces are exempt from *no second person* because the words are the person's own: the orient frame's content and the journal. The app's chrome on both stays in the neutral register.

### 12.2 Vocabulary, amended (replaces v1 §10.2 rows where they differ)

| Say | Not | Where |
|---|---|---|
| Block | Day part, section, chunk | everywhere |
| Routine · Template | Variant, preset, plan, day type | setup |
| Morning routine · Wind-down routine | Morning template | the two blocks |
| Focus | Day type, project, work type | work |
| Workout | Session, exercise | training |
| Fixture | Recurring, event, appointment | setup |
| One-off | Task, appointment | day |
| Pin · Fixed | Hard, anchor | setup, day |
| One of | Alternate, either/or, option | setup, pick |
| Decide in the morning | Pool, TBD | setup, week |
| Set the day | Confirm, start, lock, commit | pick |
| Adjust the day | Shift, trim, re-fit, I'm late | day header |
| Slept in · Ran long · Something came up | Late, behind, overslept | Adjust |
| Do now | Start late, reschedule | item sheet |
| Shorten everything · Cut some · Choose what stays | Trim, reduce, optimise | Adjust |
| Not assigned today | Skipped, cut, removed | everywhere |
| Not confirmed | Missed, unknown | review |
| Moved · Shortened | Late, changed | review |
| Unstructured | Rest day, off, free | week, pick |
| Phone away · Lights out | Bedtime, curfew, screen time | setting |
| Before the day | Morning message, affirmation | orient |

### 12.3 What the product never says — additions

*Late*, *behind*, *catch up*, *on track*, *streak*, *day 12*, *you skipped* (except the one R18 line, which says *Skipped yesterday too* without a subject), *good morning* in the app's voice, any adjective about the person, any sentence about how the person is doing.

### 12.4 Starter libraries, per block (Q11, Q16)

Nothing pre-checked; plain nouns; ranges are defaults the person edits. Mine to extend.

- **Morning (Recommended):** Breath work 5–10 · Cold shower 3–10 · Meditate 10–20 · Stretch 5–15 · Journal 5–10 · Read 15–30 · Walk 15–30 · Sunlight 5–10 · Make the bed 2–5 · Plan the day 5–10 · Water 1–2 · Gratitude 2–5.
- **Morning (All):** the above plus Yoga 20–45 · Mobility 10–20 · Run 20–45 · Swim 30–60 · Pray 5–20 · Language practice 10–20 · Music practice 15–30 · Write 20–45 · Skincare 5–10 · Vocal warm-up 5–15 · Face training 5–10 · Visualise 5–10 · Affirmations 2–5 · Sauna 10–20 · Ice bath 2–5 · Tidy 5–15 · Podcast 15–30 · Draw 15–30 · Garden 15–30 · Call someone 10–20.
- **Before work:** Breakfast 10–30 · Coffee 5–10 · Shower 5–15 · Get dressed 5–10 · Walk 10–30 · Transit 15–60 · Drive 10–45 · Walk the dog 15–30 · Kids' school run 20–45 · Pack lunch 5–10.
- **Break:** Walk 10–20 · Stretch 5–10 · Meditate 5–15 · Nap 15–25 · Lunch away from the desk 20–40 · Eyes off screens 5–10.
- **Wind-down:** Read 15–30 · Stretch 5–15 · Meditate 5–15 · Bath 15–30 · Tidy the kitchen 5–15 · Lay out tomorrow 5–10 · Skincare 5–10 · Tea 5–10 · Journal (placed) · Phone away (placed).
- **Activity (offers, not items):** the sheet suggests nothing; it asks *What's on tonight?*

---

## 13. Open items and defaults

Everything a reader can flip, in one place.

| # | Label | What it is | Where | My default |
|---|---|---|---|---|
| 1 | `[DEFAULT — L6]` | Only Adjust carries a reason; Do now and drags don't. | R8, §6.3, §6.5 | (a) |
| 2 | `[DEFAULT — L6]` | `original_scheduled_start` written at Set the day, not week build. | R23, §11.8 | at the pick |
| 3 | `[DEFAULT — R16]` | Unconfirmed wind-down items are *not confirmed*, excluded, resolvable. | §7.3 | excluded |
| 4 | `[DEFAULT]` | The block editor ships in two steps: the slot sheet's fallbacks (up/down, a gap stepper) first, drag and resize second (§14). | §3.11, §14 | two tickets |
| 5 | `[ASSUMPTION]` | Work end (*until about*) is asked at first run. | R24, §4.3 | 17:30 placeholder |
| 6 | `[ASSUMPTION]` | The wake range is informational in v1.1. | §3.3, §4.5 | preferred time only |
| 7 | `[ASSUMPTION]` | Work-day defaults are Mon–Fri always, Sat sometimes, Sun never. | §4.2 | Taylor's week |
| 8 | `[OPEN]` | The seam-drag gap gesture's discoverability. | §3.11 | fallback *+ gap* row |
| 9 | `[OPEN]` | Whether the R18 line survives Taylor's read. | §5.2 | ships, with its rules |
| 10 | `[OPEN]` | Whether the intention line in the Day Review header reads as a report card. | §8.1 | ships; cut if it does |
| 11 | `[OPEN]` | Tab names: Today · Schedule · Review. | Q40 | as written |
| 12 | `[OPEN]` | Archetype card names, to be written around real people. | §4.1 | placeholders |
| 13 | `[OPEN]` | The devices-off science line. | §4.10 | one sentence, cites nothing |
| 14 | `[OPEN]` | Day auto-close 03:00 (carried from v1 §13). | — | 03:00 |
| 15 | `[OPEN]` | A `break` block's default placement when the person adds one. | §3.1 | inside work, placed at the pick like training |

Phase-2 items referenced and not built: P2-1 sets and reps · P2-2 tasks in the work block · P2-3 mid-week check-in · P2-4 monthly reflection · P2-5 journal timer and the "you said 10 · usually 24" offer (L8) · P2-6 day parts · P2-7 calendar import · P2-14 quote bank · P2-16 the other archetypes.

---

## 14. Crucible pass, convergence tests, sign-off

### 14.1 Crucible — one pass on the whole draft

**Steelman.** v1.1 makes the plan composable so that one archetype's genuinely dynamic morning can be confirmed in one tap on an ordinary day and re-fitted in three on a bad one, keeps every honesty rule of v1 intact (assignment is the promise, annotate never rewrite, no persuasion), and adds a self-authored loop — journal at night, own words in the morning — that no habit tracker has. The model is small enough to build on the existing tables and one pure function.

**Verdict: survives with changes.** Five findings decided the matter; all five are applied above. The rest is appendix.

| Rank | Finding | Mechanism | Fix applied | Falsifier |
|---|---|---|---|---|
| **Serious → fixed** | The quick-pick was a form every morning. Six expanded sections, twenty checkboxes for a daily-menu user, in the waking state whose budget is one screen. | The strongest feature of the version fails the worst-moment test on the person it was built for; the daily menu is abandoned by week two. | §5.3: every section collapses to a summary row with *Change*; the common morning is one tap. | Taylor's own mornings: if the summary rows are expanded more often than not, the defaults are wrong, not the design. |
| **Serious → fixed** | Two flow directions put the slack in the middle of the morning. | Nobody sits idle for twelve minutes between stretching and breakfast; the lived day contradicts the shown one and the Schedule stops being trusted. | §3.3: backward flow is budget arithmetic only; the day is lived forward from wake; slack lands before the anchor. | None needed; it is a rule change. |
| **Serious → fixed** | The orient frame had become four things (read, confirm, gratitude, intention). | The one screen designed for zero bandwidth was the one screen that grew a checklist. | §7.3: confirm-yesterday moves to the quick-pick's first section. | If the *Last night* section is skipped most mornings, move it to the Day Review only. |
| **Serious → fixed** | *Not confirmed* was a hole in the number: leave the evening unconfirmed and it never counts. | Gaming by omission; the record stops being honest without anyone lying. | §7.3, §8: excluded but never hidden — a plain count on the Week Review, a decision row at the top of the Day Review. | If the not-confirmed count grows week on week, the evening list is too long, and that is a product finding. |
| **Serious → fixed** | My own default turned *Not today* into a penalty-free trim at any hour. | Assignment stops being the promise at 16:00. Taylor never asked for it; I introduced it. | §6.3 reverted to v1. | — |
| Friction | The block editor's three touch gestures are the most expensive UI in the product, and if it slips, the offset editor lingers and the model drifts. | Hidden invoice in founder attention. | §13 #4: ship the slot sheet's fallbacks (up/down, a gap stepper) first; drag and resize as a second ticket. The model change does not wait for the gesture. | — |
| Friction | Twelve first-run screens against v1's "under ten minutes". | Fatigue at screen 8. | Skips are one tap on 4, 6, 9, 10, 11; a person who skips them sees seven screens. Stated as the target: seven screens for the person in a hurry, twelve for Taylor. | Time the first three real users. |
| Friction (success attack) | If the daily menu works, routine variants with weekly counts are dead machinery; if it doesn't, the morning is a form. | One of the two overflow modes is unused by everyone. | Kept both; logged as a hypothesis to read from usage, and the variants mode is the smaller build (it is v1's templates). | Usage after a month. |
| Friction | Everything derives from one pure function, `stackBlock`. | A bug in it is a bug in five screens at once. | That is the point; it is also the one function whose correctness is worth a human's careful read at ticket time. No tests during slices, per the spine. | — |
| Friction | The R18 line is a persuasion mechanic in a product that promised none; the manipulation-literate skeptic will find it. | Trust cost if it lands as a nudge. | Bounded by Sage's rules and a switch; flagged §13 #9 for Taylor's read. | Taylor's reaction on reading §5.2. |

**Pre-mortem obituaries, for the record.** (1) *The morning was a form* — retired by the first fix. (2) *The block editor never shipped on a phone, so the template editor stayed and two models coexisted* — retired by the two-step ticket. (3) *Block-boundary pushes fired for days that were never set* — already prevented by §9.2's enqueue-at-pick rule.

**What was not tested.** The wide layout beyond derivation; the other three archetypes; anything in the phase-2 collection.

### 14.2 Convergence tests run

- **Worst-moment:** the orient frame is one read and one button; the quick-pick is one tap on an ordinary day; Adjust is three taps with a preselected reason; every drag has a tap fallback and a keyboard path.
- **Register:** every string is a noun, a time, or an imperative on the tabs; the person's own words are the only second person; one behaviour line, bounded.
- **Trust:** nothing detected, everything confirmed; the record is annotated at every move; not-confirmed is excluded and visible; fixtures cannot move by accident.
- **Alarm:** no red, no countdown (a plain anchor time is a time), no shrinking numbers, no motion that pleads; the over-budget notice is a dialog with two verbs.
- **Contrast:** no new colours; the neutral-stepped block bar carries its minutes in text.
- **State:** §10 covers every new component including focus-visible, offline, reduced-motion, and the drag states.
- **Drift:** block bands are a light fill and a gutter word, not cards; the accent still never fills a button; three serif surfaces, all reflective.
- **Buildability:** every table has columns, every screen has states and a component list, every string is written; §11 names the migrations and the services.

### 14.3 What to do with this document

1. Taylor reads it top to bottom and marks up. The §13 table is the shortest route to the decisions that are his.
2. On acceptance, v1 gets its one-line superseded note, and Reeve's thread turns §3–§11 into tickets in the order §11.12 implies: the pure function and the slot migration first, then blocks and materialisation, then the first run, then the morning, then the day, then the evening, then review and notifications.
3. Anything Taylor says "phase two" to goes to the collection by his say-so; anything that should change the landing page goes to the marketing changelog the same way.

### 14.4 Sign-off

Vesper — draft, not signed. Everything above traces to the ledger, the Q&A, the walkthrough, or a call labelled as mine; nothing flagged open was invented silently. Mason's section is written against the code on disk and names its own cost. Sage's lines are bounded and switchable. Crucible's five changes are in. Ready for Taylor's read.

