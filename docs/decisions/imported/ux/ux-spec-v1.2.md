# Official UX Spec v1.2 — Synapse, the first run rebuilt

**Author:** Vesper, Lead UX/UI Designer · §11 is written as the data the screens need, for Mason to shape · Sage's lens applied to §4.6 and §5.2 and every line that comments on the person
**Date:** 16 Sept 2026
**Status:** Draft for Taylor's read; Mason and Reeve review the [engineering handoff](../product/2026-09-16-ux-v1.2-engineering-handoff.md) alongside. An iteration version: v1.1 is the base; this document rewrites the sections Taylor's first-run walkthrough touched and carries the rest forward by reference. Rulings here are `v1.2 R#`, continuing v1.1's numbering.
**Base:** [`ux-spec-v1.1.md`](ux-spec-v1.1.md) (accepted 2026-09-12), which in turn stands on [`ux-spec-v1.md`](ux-spec-v1.md). Where this document and v1.1 disagree, this document wins; where it is silent, v1.1 stands; where both are silent, v1.
**Sources:** Taylor's first-run walkthrough, [`2026-09-16-first-run-walkthrough-feedback-v1.1.md`](../product/2026-09-16-first-run-walkthrough-feedback-v1.1.md) (cited as `S#.#` and `A#`) · the ledger, [`2026-09-11-taylor-ux-review-notes.md`](../product/2026-09-11-taylor-ux-review-notes.md) §25 for passages and quotes · the exclusions, [`phase-2-collection.md`](../product/phase-2-collection.md) (P2-14 is pulled forward here).
**Companions:** [`synapse_ui_component_needs_and_handoff_v2.md`](synapse_ui_component_needs_and_handoff_v2.md) for component contracts · [`brand-tokens.md`](../ai-guides/brand-tokens.md) for token names.

---

## 0. How to read this document

### 0.1 What kind of document this is

The same kind as v1.1 (§0.1 there): every screen opens with a walk-through, copy is in-register and adjustable, defaults are labelled. Three labels, as before: `[DEFAULT]` a choice made where Taylor's note left room; `[ASSUMPTION]` a fact I needed and did not have; `[OPEN]` something only Taylor or real use can settle. All three are collected in §13.

What is different about this version: it was written against a build Taylor has used, so most of its rulings are corrections of things that were seen, not predictions of things that might be. The walkthrough document carries the note that caused each change; this document carries the design that answers it. Read the walkthrough for *why*; read this for *what*.

Mobile first, always. Every screen is designed for a phone held in one hand; the desktop line at the end of each walk-through says how the wide layout derives.

### 0.2 Authority ladder for v1.2

1. Taylor's walkthrough notes (they override v1.1's accepted text, as the ledger overrode v1's — ledger §18).
2. This document.
3. v1.1, for everything this document does not rewrite.
4. v1, for everything v1.1 does not rewrite.
5. The cross-cutting document and the v2 handoff, for navigation and component contracts.
6. My judgment, labelled.

### 0.3 Rulings this version makes

Each row is a decision with a real alternative, stated so it can be flipped in one line.

| # | Ruling | Source | The alternative not taken |
|---|---|---|---|
| R28 | This is **v1.2**, an iteration on v1.1: §4 is rewritten whole; §3, §5.2, §5.3, §7, §9, §10, §12 are amended in place; v1.1 stands for the rest. | Taylor's brief | A v2. |
| R29 | **Emoji live on the person's nouns, never in the app's chrome.** A habit, a step, a workout, a focus, a fixture, a passage, the two evening times, and the four archetype cards carry one; no heading, button, caption, status line or sentence the app speaks ever does. Amends v1.1 §12.1. | S1.1, S7.1, S8.1, S9.6, S10.6, A3 | Emoji per screen (A3, declined — §2.1 of the walkthrough). |
| R30 | **Optimistic by rule; save as you go; *Continue* is navigation.** Every control reflects the tap at once; every fact writes when it is entered; a failure reverts with one line. | S7.5, S8.4, A1 | Bulk commit at *Continue*. |
| R31 | **The first run ends in a built day, not a fit number.** A **day plan** composes the block templates, the times, the training placement and the fixtures for one or more weekdays; the room is shown as room. The fit screen and the overflow-mode question leave first run; `overflow_mode` stays as a Settings preference. | S12.2 | Patch the fit screen's strip and sentence. |
| R32 | **Work-day types are work templates with a front door.** Screen 3 asks *Same shape every work day?*; *No* creates named types (remote · coworking · office or site · other) with their own hours. A day plan picks one. The second-template sheet leaves screen 11. | S3.1, S11.3 | Keep the ghost row on screen 11. |
| R33 | **A step, not a habit, in the prep block.** Vocabulary only; one table, as v1.1 §11.3 declined a second. | S7.3 | A separate noun in the schema. |
| R34 | **A habit may carry up to three named lengths — versions.** *Quick · 5 · Full · 30.* The plan and the pick treat versions as *one of* (v1.1 §3.5); no new mechanic. | S8.3 | A single length. |
| R35 | **Travel around a workout is two rows of its own**, stored on the workout, placed beside it, never added to its length; droppable on the day independently. | S9.2 | Fold travel into the workout's duration. |
| R36 | **Passages are a collection.** Title, rich body, up to four images, tags; one per day by list order; a carousel in the orient frame. A **quote bank** the app supplies is opt-in, off by default, one per day mixed into the cycle. The app never speaks the message; nothing in the frame is keyed to anything about the person. Reverses v1.1 §4.6's *must never* and pulls P2-14 forward. | S6.2–S6.7, ledger §25 | One passage, one textarea. |
| R37 | **Two morning modes**, chosen on the last screen: **Set from the plan** — *Start the morning* on the orient frame sets the day from the day plan, and the quick-pick is skipped; **Build each morning** — the quick-pick opens after orient, sections expanded. Amends R6: the pick with collapsed sections is now the *build* path's shape, not every morning's. | S12.2 | The pick every morning (R6). |
| R38 | **The journal has a reminder.** A push at a time the person set, on by default, defaulting to an hour before phone away. Reverses v1.1 §9.1 (Q35). | S10.2 | No push for the journal. |
| R39 | **Wake is one time.** The earliest is not asked; the column stops being written. Reverses v1.1 §13 #6. | S5.2 | Keep the informational range. |
| R40 | **Rarely is a fourth work-day value**: planned as a non-work day; the pick does not ask; the day header sheet offers *Working today* to apply a work-day type on the day. | S2.3 | Three values. |
| R41 | **Last night's lines are one tap away**, collapsed behind a *Last night* row; the setup switch is gone; the metric that would flip it back is named in §5.2. | S6.8 | Shown by default. |
| R42 | **Fixture kinds are a label and an icon, never a mechanic.** *Meeting · Appointment · Class · Event · Social · Chore · Other* set a default emoji and a default block; the person overrides both. | S4.2 | Kinds that change materialisation. |
| R43 | **Setup lists append; empty states are left-aligned; every revealed field can be removed where it was revealed; every value + Change field has a Done.** Frame rules, stated once in §4. | S4.1, S5.3, S9.3, S10.1 | Per-screen fixes. |

### 0.4 What v1.1 said that no longer holds

- v1.1 §4 (twelve screens, the fit last) → §4 here (fourteen, a built day and the week last).
- v1.1 §3.10's overflow-mode question at first run → §3.10 here (a preference; the day builder is the honest answer to overflow).
- v1.1 §4.5's earliest wake → gone (R39).
- v1.1 §4.6's single passage and *must never offer a quote bank* → §3.12 and §4.6 (R36).
- v1.1 §4.6's *Show what I wrote the night before* switch → §5.2's *Last night* row (R41).
- v1.1 §4.11's second-work-template ghost row → §4.3 (R32).
- v1.1 §9.1 "any push for the journal" removed → §9 (R38).
- v1.1 §12.1 *no emoji* → §12.1 (R29).
- v1.1 §13 #7 Sat *sometimes* → Sat *never*.
- v1.1 R6 as the shape of every morning → R37.

---

## 1. Frame

v1.1 §1.1–§1.3 stand. §1.4 gains these rows:

| Word | Means | Not |
|---|---|---|
| **Step** | An item in the prep block — something that has to happen before the day can start. *Breakfast · the drive.* Same table as a habit; a different word because it is a different promise. | habit, task, to-do |
| **Version** | One of up to three named lengths a habit can have. *Quick · 5 min · Full · 30 min.* | option, mode |
| **Work-day type** | A shape of work day with its own hours and kind — *Remote · Coworking · Office or site*. v1.1's *work template*, with a name the person meets. | schedule, day type |
| **Day plan** | A named day — *Day A* — composed of its weekdays, a work-day type, four times, a training placement, a getting-ready list, a morning routine, breaks, fixtures and a wind-down. The unit the week is built from. | template, routine, profile |
| **Getting ready** | The prep block's friendly name on the person's screens. *Getting ready A · 45 min.* | prep, before work (still the block's kind name in code) |
| **Passage** | A saved piece of reading for the morning — a title, a body, maybe an image, maybe tags. The person's own or chosen. | message, affirmation, quote |
| **Quote** | One line the app supplies from its bank, attributed, opted into. Never in the app's voice. | tip, thought of the day |
| **Travel** | The minutes there and back around a workout that happens away from home. Two rows, beside the workout. | commute, transit (a step, in prep) |
| **Morning mode** | *Set from the plan* or *Build each morning*. | auto, manual |

Retired: *earliest wake*, *overflow question* (as a first-run screen), *the fit* (as a screen).

---

## 2. Guardrails

v1.1 §2's three amendments stand, and the product non-negotiables are unchanged. Two additions, both from the walkthrough:

4. **Optimistic by rule (R30).** A control's own state changes on the tap, before any request. Steppers hold their value locally and write on a debounce; ticks create their row at once and undo on failure with one line (*Couldn't save Breakfast. Try again.*); nothing disables itself while a request is in flight except a primary that would double-submit. A second tap on a tick is an un-tick, never a duplicate. Every screen in §4 is graded against this in §10.
5. **Save as you go (R30).** Each fact writes when it is entered; *Continue* and *Done* navigate. A person who leaves a screen half-filled loses nothing. This is the journal's autosave rule (v1.1 §7.2), applied to setup.

And the register rule on emoji is amended, not dropped — §12.1.

---

## 3. The plan model, as design

v1.1 §3.1–§3.4, §3.11 stand. The rest is amended or added here.

### 3.5 One of — and versions

v1.1 §3.5 stands. A **version** (R34) is *one of* applied to a single habit: *Meditate · Quick 5 · Full 20*. Up to three, each with a short label and a length; the first is the default the arithmetic uses. On the setup cards (§4.9) the versions are a row of tabs under the length; in the block editor and at the pick, a habit with versions renders as one row with its version tabs — the *one of* group's grammar, unchanged. Choosing *Quick* at the pick hands the difference to the budget line live, as an alternates choice does. On the Today tab the chosen version's length is the item's; the version label shows in the item sheet only.

### 3.6 Fixtures and one-offs — kinds

v1.1 §3.6 stands. A fixture carries a **kind** (R42): *Meeting · Appointment · Class · Event · Social · Chore · Other*. The kind sets a default emoji (§12.4) and a default block — *Meeting · Appointment* → work; *Class · Event · Social · Chore* → evening — which the sheet's *In work · In the evening* segment overrides. Nothing about materialisation reads the kind; it is how the row looks and what the person calls it. One-offs gain the same kind chips.

### 3.7 Training — where, and the travel

v1.1 §3.7 stands (the rotation, the placement, the swap). Added:

- **Type.** A workout has a type from a curated list (§12.4) that fills its name and emoji when the person has not; *Other* fills nothing. The type is a label.
- **Where.** *Home · Gym or studio · Outside.* For the last two the rotation asks **getting there** and **getting back**, two lengths, default 0, and one switch, **Plan for the travel** (on).
- **Travel rows (R35).** When the travel is planned, the day carries three rows — *→ Gym · 15* · *Push · 60* · *← Home · 15* — the workout's emoji on the middle one, a plain arrow on the others. The two travel rows are items in their own right: each can be *Not today* (a cancelled ride home), shortened, or moved, without touching the workout; the workout's length is never the sum. The Schedule shows the three as one band with two thin ends. Where the travel is not planned, the workout is placed alone and the travel exists only on the habit.
- **Placement in a day plan (§3.13, §4.13c).** The plan may fix a placement per workout — *Before work · Midday · After work* — so that under *Set from the plan* nothing is unplaced. *Before work* sits before the routine by default `[DEFAULT: Taylor's own — before breakfast]`, with *after the routine* as the alternative in the same row. At the pick under *Build each morning*, the plan's placement is the preselected chip, as v1.1 §3.7 preselects the last placement.

### 3.8 Work: focus and work-day type

v1.1 §3.8 stands, with the second noun renamed and given a screen. A **work-day type** (R32) is a work template with a name the person wrote or accepted, a kind (*Remote · Coworking · Office or site · Other*) that sets a default emoji, its own *working by* and *until about*, and its own answer to *what gives* (defaulting to the profile's). Most people have one and never see the word. A person with a remote day and an office day has two, created on screen 3, and each day plan picks one (§4.13b). The **focus** is unchanged: what the work is about, with a weekly count and typical days or *Flexible*.

### 3.9 Day shapes — rarely

v1.1 §3.9 stands. *Rarely* (R40) is a work-day value between *Sometimes* and *Never*: the day is planned as a non-work day and the pick does not ask; the day header sheet gains a row **Working today** that applies a work-day type to the day (the work block, its fixtures, the type's hours) and re-flows what follows. *Sometimes* still asks first, as v1.1 wrote.

### 3.10 The room, at planning time

v1.1 §3.10's arithmetic stands and its **question does not** (R31). The block editor's footer and the day builder's morning screen (§4.13e) show the same numbers, worded as room: *72 min for the routine · 45 chosen* — and, when over, *12 over · the routine runs to 9:12*, muted, no colour, as the block editor's overrun already reads. The person who wants different routines on different days builds Day A and Day B, which is what *variants* always was; the person who wants to choose each morning picks *Build each morning* on the last screen, which is what the *daily menu* always was. `overflow_mode` remains a preference in Settings → Your day → Morning, defaulting to *daily menu*, and governs how the pick's routine section behaves when the person is in *Build each morning*; it is not asked at first run.

### 3.12 Passages and the quote bank

*New (R36). Replaces the single passage of v1.1 §4.6.*

A **passage** is a saved piece of morning reading: a **title** (1–80), a **body** (rich text: paragraphs, bold, italic, a blockquote, a bulleted list, a link — nothing else; stored as Markdown; rendered in Newsreader), up to **four images** (optional; a single image sits above the body at the column's width; two to four sit in a horizontal strip the person swipes; the images are never cropped by the app), and **tags** (free text, chips, optional, no vocabulary supplied). Passages are ordered; the list is the person's to reorder, edit and archive. Nothing about a passage is required except the body.

**The cycle.** One passage per day: the frame opens on the next in list order after yesterday's, advancing at day-open, wrapping. `[DEFAULT]` The person can swipe or arrow to any other passage in the frame (§5.2) and the app does not remember which one was read — nothing about the person is recorded from the frame.

**The quote bank.** A set of quotes the app supplies — text, attribution, source, tags — managed by Taylor on an admin surface (§11.6 says what it needs). A person opts in on screen 6 (off by default); when on, a quote from the bank joins the cycle as if it were a passage — one per day, chosen by date order over the bank, so two people on the same day see the same quote and nobody sees one "for them". A quote renders in the frame in quotation marks with its attribution as a caption, in Newsreader, under the chrome caption *A quote*. The app's own voice never appears around it. Tone rule for the bank, binding on whoever curates it: nothing that instructs, exhorts, or uses the second person as a command; the register is the notebook's, not the poster's.

**Tags.** In v1.2 a tag filters the passage list on screen 6 and in Settings. "Chosen against the day" — a passage picked for a work-day type, a focus, a mood — is the layer the tags exist for and is phase 2 by the ledger's own ordering (§25, last bullet). `[OPEN]` whether tags are worth their chrome before that layer exists; they ship because they are cheap and the seam is the point.

### 3.13 Day plans

*New (R31). The unit the week is built from, and the thing screen 13 builds.*

A **day plan** is a named day. It holds:

| Part | What it is | Where it comes from |
|---|---|---|
| Name | *Day A*, renameable; an optional emoji | 13a |
| Weekdays | The days this plan applies to; a weekday belongs to at most one plan | 13a |
| Work-day type | One of the person's types, or *No work on this day* | 13b |
| Times | *Up at · Working by · Until about · Lights out* — from the profile and the type, confirmable per plan | 13b |
| Training | Which workouts, each with a placement (and its travel, if planned) | 13c |
| Getting ready | A prep template — *Getting ready A* — its steps in order with lengths | 13d |
| Morning routine | A morning template — *Morning routine A* — its habits with lengths, against the room | 13e |
| Breaks | Habits placed inside work, at a time or *Midday* | 13f |
| Evening | The weekday fixtures that apply, and any excluded | 13g |
| Wind-down | A wind-down template — *Wind-down A* — its habits in order with lengths, *Phone away* and the journal placed | 13h |

The three lists are ordinary block templates (v1.1 §11.4) with names; a second plan can pick *Getting ready A* rather than build *Getting ready B*, which is the reuse Taylor asked for ("grabbing and going from pre-set blocks"). A plan is therefore a row of references and times, not a copy of anything — editing *Morning routine A* in the block editor changes every plan that uses it, and the plan's card says so (*used by Day A, Day B*).

**What a plan does.** The week build (§4.15) pre-fills each weekday from its plan: `day_blocks` in block order, the templates assigned, the training placed, the fixtures materialised, the times set. Under *Set from the plan* (R37) the orient frame's *Start the morning* sets that day as materialised; under *Build each morning* the quick-pick opens with the plan's choices preselected and everything swappable. A weekday with no plan is **Unstructured** (v1.1 §3.9) — orient and wind-down only.

**What a plan is not.** It is not v1's whole-day template with offsets: nothing inside it has an absolute time except the four anchors and the pins; every block still stacks in its flow direction from `stackBlock`. Deleting a plan deletes references, never templates.

---

## 4. First run, screen by screen

*Replaces v1.1 §4.1–§4.14. Fourteen screens, in two movements: screens 1–12 collect the parts; screen 13 builds a day from them; screen 14 shows the week and asks how mornings should go. Progress reads "n of 14". Everything after screen 1 is skippable and revisitable from Settings → Your day. Nothing asks for notification permission, a photo, a goal, or a commitment. A person in a hurry skips 4, 6, 10 and 12 and builds one day in under ten minutes; Taylor builds two days in twenty. Stated as the target; to be timed on the first three real users.*

**The frame, once.** Every screen sits in `StepFrame`: a caption top-left (*3 of 14*), *Finish later* top-right as ghost text, the heading at 1.375rem, at most one paragraph of body under it, the content, and **the action row pinned above the safe area at every scroll position** (A2) — a hairline above it, `bg-paper` behind it, the primary on the right, *Skip for now* as ghost text on the left where skipping is allowed. Content scrolls beneath the action row with 96px of bottom padding so the last row is never hidden. Back is the header back and the system back.

**The frame rules (R43), once:**

- **Pre-filled fields show value + Change** and open their control on demand (W1); the open control has a **Done** that returns it to the value state, and blur does the same (S10.1).
- **A field the person reveals can be removed where it was revealed** (S5.3): the same row that said *Add …* says *Remove* once it exists.
- **Empty states are left-aligned and in the flow** (S4.1): one muted line where the first row will sit, and the add control as a full-width secondary button on mobile (a text button from 720px), never centred, never an illustration.
- **Lists append** (S9.3): a new row lands at the end and opens; the person reorders if they want to.
- **A sheet is scoped to its screen's block** (S7.3): it never asks which block, and its title names the noun — *A step before work* · *A morning habit* · *A wind-down habit* · *A workout* · *A focus* · *A work-day type* · *A fixture*.
- **Selection is a row, not a checkbox** (S7.2): a `SelectRow` — emoji, title, a muted detail on the right; the whole row is the target; selected rows show a tick in the trailing slot and an ink border; the tick is the selection (W4) and the primary always reads *Continue*, counting where a count helps.
- **Cards collapse** (S8.2): a setup card, once its facts are entered, collapses on **Done** to a one-line summary with *Edit*; open cards stay above collapsed ones.
- **Every fact writes when entered** (R30): ticks create rows; steppers write on a 400ms debounce; text writes on blur; *Continue* only navigates.

**On desktop, once.** The frame centres in the 720px content column; sheets become the 420px right panel; `SelectRow` lists run in two columns from 720px (S7.1, S10.3). Nothing else changes.

### 4.1 Screen 1 — The shape of your week

**Who is here, in what state.** A curious stranger, or Taylor on a fresh account; one session of patience.

**The one job.** Say which kind of week this is, so the rest of the flow can route.

**What you see.** Heading: *Which is closest?* Four full-width cards, stacked, each a `LargeTargetRow` at 72px with a leading emoji at 1.5rem in a 44px slot, a title in row-title size and one line of secondary text beneath. Only the third is live: **🧭 I set my own structure, and it changes** — *Work starts around a time, not at one. Mornings bend.* The other three (**🗓️ My shifts are the same every week** · **🔁 My shifts change week to week** · **🌊 My days are fluid**) render at `text-text-disabled` including their emoji (at 0.4 opacity, so the glyph does not shout what the text whispers), with the caption *not yet* on the right, not tappable. The live card is preselected, so *Continue* is one tap.

**What it must never do.** Read as a paywall or a waitlist. The grey cards are honest scope, in the quietest possible treatment. Nor may the emoji become decoration: each names the kind of person on that card and nothing else on the screen carries one.

**Spec.** `StepFrame` + four `LargeTargetRow`s (`leading` slot new, `disabled` on three). Stores `users.schedule_shape`. Copy adjustable; card names are placeholders (P2-16); the four glyphs are in §12.4 and change with the names.

### 4.2 Screen 2 — Work days

**The one job.** Which days have a work block, and which are undecided until the morning.

**What you see.** Heading: *Which days do you work?* Body: *Most weeks, that is.* Seven full-width `ListRow`s, Monday first, each with the weekday on the left and a `Select` on the right (44px high, 160px wide at 375px, the value as its label, a chevron): **Always · Sometimes · Rarely · Never**. Mon–Fri preselected *Always*; Sat and Sun *Never* (S2.2). Beneath the list a `TextDisclosureButton`, collapsed, reading *What does each choice do?* — opening four lines, one per value, in `Text` caption size:

- *Always — a work day. The morning is built around it.*
- *Sometimes — the morning asks, "Working today?" and builds from the answer.*
- *Rarely — planned as a day off. "Working today" is one tap away in the day's menu if it turns out otherwise.*
- *Never — a day off. Nothing about work is asked.*

Primary: *Continue*.

**What you do.** Change a select or two. Open the disclosure if curious; most won't.

**What it must never do.** Wrap or truncate a value; the select is the control because four words do not fit a segment at 375px (W5).

**Spec.** Seven `Select`s (the `@syn/ui` primitive), `TextDisclosureButton`. Stores `users.work_days` as `{0..6: always | sometimes | rarely | never}`; *sometimes* seeds a shape pool (v1.1 §3.9); *rarely* seeds a non-work day with the header-sheet row (§3.9).

### 4.3 Screen 3 — The shape of a work day

**The one job.** The anchor the morning is built backward from, whether it is hard, and whether every work day shares it.

**What you see.** Heading: *Do your work days all look the same?* Body: *Same hours, same place.* Two `LargeTargetRow`s as a radio: **Yes, near enough** · **No, it depends on the day**. *Yes* preselected `[DEFAULT]`.

- **On Yes** the screen continues as v1.1 §4.3: a `TimeField` *Working by* (*9:00* as value + Change), *Until about* (*17:30*), then the body-weight heading *When your morning runs long, what gives?* with the three rows (*Work waits · The routine gets cut · Depends on the day*), nothing preselected, primary disabled until one is chosen.
- **On No** the times and the question move inside **work-day type cards**, listed beneath, empty with *Add a work-day type* (a full-width secondary button, left-aligned, in the flow). Adding opens a `WorkDayTypeCard` inline: a **kind** `ChipPicker` first — **🏠 Remote · ☕ Coworking · 🏢 Office or site · 💼 Other** — which fills the name and the emoji (both editable; *Other* fills neither); *Working by*; *Until about*; the *what gives* radio; **Done** collapses it to *Remote · 9:00–17:30 · work waits* with *Edit*. Cards append. The person must have at least one to continue; the primary counts — *Continue · 2 types*.

**What it must never do.** Editorialise about the choice; ask which weekdays a type is for — that is the day plan's job (§4.13a), where a day picks a type rather than a type claiming days.

**Spec.** `LargeTargetRow` ×2, `TimeField` ×2, `RadioGroup`; `WorkDayTypeCard` (new, feature folder) with `ChipPicker`, `Input`, `EmojiPicker` (exists), `TimeField` ×2, `RadioGroup`. On Yes: stores `users.work_start_time`, `users.work_end_time`, `users.anchor_direction`, and the one work template is created silently with those hours (so a day plan always has a type to pick). On No: one work template per card with its own hours, kind and anchor direction; the profile's three columns take the first card's values as the defaults every other screen reads.

### 4.4 Screen 4 — Standing commitments

**The one job.** Capture the fixtures so the week is honest before any routine is designed.

**What you see.** Heading: *Anything that happens every week at a set time?* Body: *A stand-up, a class, dinner on Thursdays.* The empty state is one muted line in the flow, left-aligned — *Nothing yet.* — and beneath it **Add one** as a full-width secondary button (S4.1). Adding opens the `FixtureSheet`: a **kind** `ChipPicker` at the top — **🗣️ Meeting · 📌 Appointment · 🎓 Class · 🎟️ Event · 🍽️ Social · 🧺 Chore · 📍 Other** (R42) — then title (`Input`, autofocus; the kind's emoji shows in the field's leading slot and opens the picker), `WeekdayChips` (multi), `TimeField` *at*, `MinutesStepper` *for*, and the `SegmentedControl` **In work · In the evening**, preselected from the kind. Saved fixtures list as `ListRow`s with their emoji: *🗣️ Stand-up · Tue · 9:30 · 20 min*, each with an `EllipsesMenu` (*Edit · Remove*); the add button sits under the list as *Add another*. Primary: *Continue*; *Skip for now* as ghost.

**What it must never do.** Suggest fixtures. The kinds are a vocabulary, not a suggestion; the sheet opens on none selected.

**Spec.** `FixtureSheet` (+ kind chips, emoji), `ListRow` (+ leading emoji), `EllipsesMenu`. Writes `fixtures` rows with `kind` and `icon` (§11.3).

### 4.5 Screen 5 — Wake

**The one job.** The morning's start.

**What you see.** Heading: *When would you like to be up?* Body: *Most days. Every day can differ.* One `TimeField` **Up at**, *7:00* as value + Change. Under it, muted, tabular, the first computed consequence: *7:00 to 9:00 · 2 h before work* (or, with several work-day types, the first type's hours and *on a remote day*). Primary: *Continue*.

**Amended 2026-09-16 (Taylor, S5.2):** the earliest-wake field is removed (R39). v1.1 stored a range and used it nowhere; a range with no mechanic behind it was a question without a purpose, and the one mechanic that could have used it — nudging an earlier wake to fit the practices — is one the product refuses.

**What it must never do.** Call it an alarm. Nothing here sets a notification.

**Spec.** `TimeField` ×1. Stores `users.usual_wake_time`. `users.earliest_wake_time` stops being written.

### 4.6 Screen 6 — Before the day

**Who is here, in what state.** Someone deciding what the first thing they read each day will be. Reflective, if the screen lets them be.

**The one job.** Choose what the first screen of every morning shows — the person's own words, a passage they love, a quote they chose — and which of the three morning lines to ask.

**What you see.** Heading: *What do you want to hear first thing?* Body: *Your own words, a passage you love, a quote you chose. The morning opens on it, before anything else gets in.*

**Passages.** A `GroupHeading` *Passages*, then the list: empty with one muted line — *Nothing saved yet. A few lines, a paragraph, a page.* — and **Add a passage** as a full-width secondary button. Adding opens the `PassageSheet` (tall bottom sheet; the right panel on desktop): **Title** (`Input`, optional, placeholder *Untitled*), the **body** as a `RichTextEditor` (new, `@syn/ui`, §10.2) at 8 rows minimum, serif, with a five-control toolbar pinned above the keyboard — bold · italic · quote · list · link — and nothing else; **Images** — a row of up to four 72px thumbnails with an *Add* tile, using the app's existing upload path; **Tags** — a `TagInput` (new; chips, Enter to add, free text). Footer: *Cancel · Save*. Saved passages list as `PassageCard`s: the title (or the first line), a two-line serif excerpt, the first image as a 44px thumbnail on the right if any, tags as small chips beneath, a drag handle on the left (`SortableList`), an `EllipsesMenu` (*Edit · Archive*). The order here is the cycle's order (§3.12).

**A quote each day.** A `Switch` row, off by default: **A quote from the bank, some mornings** — with one muted line: *One a day, from a set we keep. Attributed, never ours.* `[COPY — Taylor's line to write; this one states the rule.]` When on, a quote joins the cycle (§3.12).

**Three morning lines.** A `GroupHeading` *In the morning*, then three `Switch` rows, all on by default: **Ask one line of gratitude** · **Ask one line of intention** · **Ask one line of visualisation** — each with a muted caption showing the prompt the frame will use: *Grateful for, this morning* · *Today's intention* · *Today, as I see it*.

Primary: *Continue · 2 passages*; *Skip for now* as ghost.

**Amended 2026-09-16 (Taylor, S6.2–S6.10):** passages are a collection with a rich body, images and tags; the quote bank is opt-in (reversing v1.1's *must never*, per ledger §25's own second medium); the *Show what I wrote the night before* switch is gone — last night's lines live behind a row in the frame (R41, §5.2); the visualisation line is added. The heading now asks for the feeling Taylor described ("your morning pep talk to yourself") without using that register in the chrome.

**What it must never do.** Supply a passage, a starter phrase, or an example passage. Speak a quote in the app's voice. Make anything here required.

**Spec.** `PassageSheet` (feature folder) with `RichTextEditor`, `TagInput`, the image tile row; `PassageCard` in a `SortableList`; four `Switch` rows. Writes `passages` rows (§11.4); stores `users.quotes_opt_in`, `users.orient_ask_gratitude`, `users.orient_ask_intention`, `users.orient_ask_visualisation`. `users.orient_passage` and `users.orient_show_last_night` stop being written; an existing `orient_passage` is migrated into one passage row. Sage's note: the three default-on switches pass the endorsement test because each produces content the person wrote and none produces content about the person; the quote switch passes because it is off, attributed, and never keyed to the person.

### 4.7 Screen 7 — Before work

**The one job.** The steps that have to happen before the day can start, each with a rough length, so the room can be computed.

**What you see.** Heading: *What has to happen before you can start?* Body: *Breakfast, coffee, the walk, the drive.* Two parts under `GroupHeading`s with a hairline between (S7.7):

1. **What's included.** The starter steps as `SelectRow`s, one per row on mobile — **🍳 Breakfast · ☕ Coffee · 🚿 Shower · 👕 Get dressed · 🚶 Walk · 🚌 Transit · 🚗 Drive · 🐕 Walk the dog · 🎒 School run · 🥪 Pack lunch** — each with its range on the right in muted text (*10–30 min*); nothing pre-selected. Tapping selects (tick, ink border) and creates the step at once; tapping again un-selects (R30 — never a duplicate). Beneath the rows: **Add something else**, a full-width secondary button opening the step sheet — *A step before work*: emoji (the picker, defaulting to 📌), name, a compact range (§10.2), and nothing else (S7.3).
2. **How long each takes.** One row per selected step, in order: drag handle · emoji · title · `MinutesStepper` (default the range midpoint) · `EllipsesMenu` — all centred on the stepper's 44px height (S7.6). The stepper's accessible name is *Length, Breakfast*; nothing visible says *Takes*. The menu offers **Make it one of two** (the inline second row, as v1.1) · **Remove**. The list is a `SortableList` (S7.8): order here is the getting-ready order the day builder starts from.

A sticky line above the action row, tabular: *Adds up to 45 min · up at 7:00 · work by 9:00 · 72 min for the routine*. Primary: *Continue · 4 steps*.

**What you do.** Tap three rows; change breakfast to *one of*; drag the walk above the shower; watch the line move.

**What it must never do.** Ask for a start time. Call a step a habit. Wait for the network to show a tick.

**Spec.** `SelectRow` (new, `@syn/ui`), `SortableList` (new, `@syn/ui`, dnd-kit), `MinutesStepper` (optimistic, debounced), `StepSheet` (the habit sheet in *step* mode: emoji, name, range; `block_kind: prep`, priority 7, hard). Writes the prep template's slots as DYN-11 does, one write per change. States: empty · listing · saving (per row, a 1px `border-hairline` pulse, never a spinner) · failed (row reverts; one `StatusLine`) · offline.

### 4.8 Screen 8 — Your routine, the whole landscape

**Who is here, in what state.** The habit junkie with thirty practices, or the person with three. Both are hosted the same way.

**The one job.** Capture everything the person does or wants to do to start the day well — without ranking or fitting any of it yet (that is screen 9).

**What you see.** Heading: *What do you do, or want to do, to start the day well?* Body: *Everything. It doesn't have to fit.* A `Tabs` bar with two word tabs: **Recommended · All** (S8.2 — *Selected* is now screen 9). Recommended lists twelve `SelectRow`s under two `GroupHeading`s (*Body · Mind*), each with its emoji and range — *🌬️ Breath work · 5–10 min* — one per row on mobile; nothing pre-selected. *All* lists the full morning starter library with a `SearchField`. A tick creates the habit at once (R30); a second tap removes it (archives, if it has never been used). **Add your own** at the bottom of each tab opens *A morning habit*: emoji, name, range — no block, no priority. Primary: *Continue · 9 habits*. No arithmetic on this screen, by rule.

**What it must never do.** Show a fit number. Pre-select anything. Ask for importance or length — screen 9's job, on a card that has room for them.

**Spec.** `Tabs`, `SelectRow`, `SearchField`, the habit sheet in *morning* mode. Writes `habits` rows with `block_kind: morning` per tick.

### 4.9 Screen 9 — Your routine, ranked

*New (S8.2, S8.3). The Selected tab, given a screen and a card.*

**Who is here, in what state.** The same person, a minute later, with a list of nine and a question per item.

**The one job.** For each habit: how much it matters, how long it usually takes, and — optionally — a shorter or longer version.

**What you see.** Heading: *How much does each one matter, and how long does it take?* Body: *Rough is fine. The morning is built from these.* Then one `HabitSetupCard` per selected habit, in the order they were ticked, each a `Card` (the shadcn base, `bg-surface`, `border-hairline`, 16px padding) with:

- **Header:** emoji at 1.5rem · title in row-title size · the range in muted text on the right, with a small pencil (`IconButton`, 44px target) that opens the compact range editor inline (§10.2).
- **Matters:** a caption *How much it matters* and the `Stepper17` as seven 40px squares in one row (they fit at 375px with 4px gaps); the chosen one ink-filled; the numbers stay visible, so colour is never alone.
- **Usually:** a caption *Usually takes* and a `MinutesStepper` defaulting to the range midpoint — the length the plan uses.
- **Versions:** a ghost row **Add a shorter version** (and, once one exists, **Add a longer version**), each revealing a row with a short label (`Input`, placeholder *Quick* / *Full*) and a `MinutesStepper` (S8.3, R34). At most three lengths in all; each has *Remove*.
- **Footer:** **Done** (secondary, right) collapses the card to one line — *🌬️ Breath work · matters 5 · usually 8 · quick 5* — with *Edit*; collapsed cards sink beneath open ones (frame rule).

Primary: *Continue* (no count; nothing here changes the count).

**What you do.** Tap a number, nudge a stepper, tap *Done*; nine times, faster each time. Add a *Quick 5* to meditation because some mornings that is what there is.

**What it must never do.** Ask for a time of day. Clamp *usually* to the range (R21). Wait for the network: every stepper writes on a debounce and the card never disables.

**Spec.** `HabitSetupCard` (new, feature folder; `Card` primitive, `Stepper17` row variant, `MinutesStepper`, `RangeEditor compact`, `Input`). Writes `habits.life_priority`, `habits.duration_min_min/max`, and `habits.versions` (§11.2) per change. States: open · collapsed · saving (row pulse) · failed (one line, value reverts) · offline.

### 4.10 Screen 10 — Training

**The one job.** The rotation: what, how often, usually when, how long, where.

**What you see.** Heading: *Do you train?* Two `LargeTargetRow`s: **Yes** · **Not right now** (the second skips ahead). On yes: a list of `WorkoutSetupCard`s, empty with one muted line — *Nothing yet.* — and **Add a workout** as a full-width secondary button. A new card appends and opens (S9.3):

- **Header:** emoji (the picker; the type's default) · name (`Input`).
- **Type:** a `ChipPicker`, wrapping — **🏋️ Upper body · 🦵 Lower body · 🏋️‍♀️ Full body · 🎽 Core · ⚡ HIIT · 🪷 Yoga · 🚴 Cardio · ⚽ Sport · 🏊 Swim · 🤸 Mobility · 🧗 Climb · 🥾 Hike · 💪 Other** — picking one fills the name and the emoji when they are empty.
- **How often:** *a week* with a `CountStepper` (default 2).
- **Usual days:** `WeekdayChips` with a leading **Flexible** chip.
- **Length:** *Usually takes* with a `MinutesStepper` (default 60).
- **Where:** a `SegmentedControl` **Home · Gym or studio · Outside**. For the last two, two `MinutesStepper` rows appear — **Getting there** · **Getting back** (default 0 each) — and a `Switch` **Plan for the travel** (on) with one muted line: *Kept beside the workout, never added to it. Either trip can be dropped on the day.*
- **Footer:** **Done** collapses to *🏋️ Upper body · 2 a week · Mon Thu · 60 min · gym +15/+15* with *Edit*.

A muted line under the list: *Where it fits on the day is set when you build one.* Primary: *Continue · 2 workouts*.

**What it must never do.** Ask for a time. Add the travel to the length. Slot a new workout above the last.

**Spec.** `WorkoutSetupCard` (new, feature folder), `ChipPicker`, `EmojiPicker`, `CountStepper`, `WeekdayChips` (+ *Flexible*), `MinutesStepper`, `SegmentedControl`, `Switch`. Writes `habits` rows with `type: workout`, `workout_type`, `icon`, `weekly_target`, `typical_days`, `duration_*`, `location`, `travel_there_min`, `travel_back_min`, `plan_travel` (§11.2), and the training template.

### 4.11 Screen 11 — Closing the day

**The one job.** Lights-out, phone-away, the wind-down habits, and whether a few lines at night are wanted — and when to be reminded.

**What you see.** Heading: *How does the day end?* Body: *The evening stacks back from lights out.*

- `TimeField` **🌙 Lights out** · *22:45* as value + Change.
- `TimeField` **📵 Phone away** · *21:45* as value + Change — the default is an hour before lights out (S10.2) — with one muted line: *An hour before lights out is a common choice.* (One sentence, cites nothing — v1.1 §13 #13 stands.) Changing lights out moves phone away with it until phone away has been touched.
- A `GroupHeading` *Wind-down*, then the wind-down starters as `SelectRow`s with emoji — **📖 Read · 🤸 Stretch · 🧘 Meditate · 🛁 Bath · 🧽 Tidy the kitchen · 👔 Lay out tomorrow · 🧴 Skincare · 🍵 Tea** — one per row on mobile, two columns from 720px, nothing pre-selected; a tick creates the habit. **Add something else** opens *A wind-down habit*. Lengths and order are set in the day builder (§4.13h); nothing about them is asked here, and the ghost row *Order and lengths* is gone (S10.4).
- A `Switch` row **✍️ A few lines at night** — on by default — with the six journal prompts beneath as rows: drag handle (left, 44px) · the prompt truncated at one line with an ellipsis · `EllipsesMenu` (*Edit · Move up · Move down · Remove*); **Add a prompt** at the bottom. A muted line: *Around 10 minutes, before the phone goes away.* Then, still under the switch, a `TimeField` **A reminder** · *20:45* as value + Change (an hour before phone away — S10.2, R38) with a `Switch` beside it (on); the caption reads *In your words: "A few lines · 20:45".* Turning the journal off hides the reminder with it.

Primary: *Continue*.

**Amended 2026-09-16 (Taylor, S10.2):** the journal gains a reminder push, on by default; v1.1 §9.1 had removed every journal push (Q35). It qualifies under v1 §8.1 because it is a time the person set, phrased in their words, and reports nothing. Phone away's default moves from thirty minutes to an hour before lights out.

**What it must never do.** Frame phone-away as a rule. Pre-tick a wind-down habit. Nag about the journal — the reminder is one push, once, and silent if the journal already has text tonight.

**Spec.** `TimeField` ×3 (leading emoji slot on the first two), `SelectRow`, `Switch` ×2, `SortableList` for the prompts (dnd-kit; the menu's *Move up / Move down* stay as the keyboard path). Stores `users.lights_out_time`, `users.devices_off_time`, `users.journal_enabled`, `users.journal_prompts`, `users.journal_reminder_time`, `users.journal_reminder_enabled`; writes wind-down habits per tick and the wind-down template.

### 4.12 Screen 12 — What your work is about

**The one job.** The focuses and their rough share of the week.

**What you see.** Heading: *What is your work about?* Body: *One is fine. Each gets a rough share of the week.* A list of `FocusSetupCard`s, empty with *Nothing yet.* and **Add a focus** as a full-width secondary button. Each card: an optional emoji (the picker, defaulting to none — a focus is the one noun where a blank is the honest default) · name (`Input`, label *Focus*, placeholder *The main thing*, one muted line beneath on the first card only: *A name for the work itself — a project, a client, a kind of work.*) · **a week** with a `CountStepper` · **Usual days** as `WeekdayChips` with a leading **Flexible** chip (S11.4), *Flexible* preselected · **Done**, collapsing to *Viewpoint · 2 a week · flexible*. Primary: *Continue · 3 focuses*; *Skip for now* as ghost.

**Amended 2026-09-16 (Taylor, S11.1–S11.4):** the screen is about focus only; the second-work-template row moved to screen 3 (R32); the heading no longer mixes *kinds* and *day*; *Flexible* is a visible chip.

**Spec.** `FocusSetupCard` (new, feature folder). Writes `habits` rows with `type: deep_work`, `weekly_target`, `typical_days` (null = flexible), `icon` (nullable).

### 4.13 Screen 13 — Build a day

*New (R31, S12.2). The centre of this version: the parts collected on screens 1–12 become one named day, then another.*

**Who is here, in what state.** Twelve screens in, holding a list of everything they do and wanting to see it become a day. Calm enough for nine short screens if each one is obviously about one thing. This is the planning state (v1.1 §1.3) and it earns depth.

**The one job.** Compose a named day from the parts, see it as a day, and keep it.

**The builder's frame.** Screen 13 is a list — **Your days** — with the builder as a sub-flow. On first arrival the list is empty and the builder opens at 13a directly, its caption reading *Day A · 1 of 9* beneath the outer *13 of 14*. Back from 13a returns to the list. Each builder screen writes as it goes (R30); leaving mid-way keeps a draft plan the list shows as *Day A · unfinished* with *Continue building*.

#### 13a — Name and days

Heading: *Build a day.* Body: *Most people have one or two. Give it a name and say which days it's for.* An `Input` **Name** prefilled *Day A* (then *Day B* …) with the emoji picker in its leading slot (optional; blank by default). Then **Which days** as seven `WeekdayChips` (multi); chips a work day *Always* or *Sometimes* are preselected on the first plan `[DEFAULT]`; a chip already held by another plan shows that plan's name beneath it and, on tap, moves with one line — *Thursday moves from Day A.* — and an inline undo. Primary: *Next*.

#### 13b — Shape and times

Heading: *Day A — the shape of it.* If work-day types exist, **Work** first: the types as `LargeTargetRow`s with their emoji and hours (*🏠 Remote · 9:00–17:30*), the first preselected, and a last row **No work on this day**. Then four `TimeField`s as value + Change: **Up at** (from screen 5) · **Working by** and **Until about** (from the type; hidden under *No work*) · **Lights out** (from screen 11). Under the times, muted, tabular: *2 h before work · 5 h 15 after.* Primary: *Next*.

#### 13c — Training

Only if screen 10 said yes; otherwise skipped without a trace. Heading: *Train on this day?* Body: *Pick what, then where it goes.* Each workout from the rotation as a `SelectRow` with its emoji and length; selecting reveals beneath it a `QuickChipRow` **When** — **Before work · Midday · After work** — and, on *Before work*, a smaller `SegmentedControl` **Before the routine · After it** (*Before the routine* preselected `[DEFAULT]`). Planned travel shows as a caption under the row: *+15 there · +15 back, beside it.* Several workouts may be selected, each with its own placement. A muted line at the foot: *Nothing is fixed. The morning can still swap or skip it.* Primary: *Next*; *Not on this day* as ghost.

#### 13d — Getting ready

Heading: *Getting ready.* Body: *What has to happen before work on this day, in order.* At the top, if a getting-ready list already exists from another plan, a `PickerList` — *Getting ready A · 45 min* · **New list** — so a second day can reuse the first's. Then the list: the steps from screen 7, all selected `[DEFAULT: all on, in screen 7's order]`, each a row — drag handle · emoji · title · `MinutesStepper` · `EllipsesMenu` (*One of two · Leave out on this day*) — in a `SortableList`. Steps left out sink beneath a hairline as *Not on this day* with *Include*. **Add a step** beneath. Above the action row, sticky, tabular: *Getting ready A · 45 min · 8:15 to 9:00*. The list's name sits in a small `Input` at the top of the list, prefilled *Getting ready A*, editable inline — the list is saved as it is built, under that name (S12.2, "save as … to allow custom naming"). Primary: *Next · 45 min*.

#### 13e — Morning routine

Heading: *The morning routine.* Body, tabular, the room stated as room (§3.10): *72 min for the routine on this day — up at 7:00, orient 3, getting ready 45, work by 9:00.* On a *No work* day: *No anchor on this day. The routine runs as long as it runs.* Then, as on 13d, a `PickerList` for an existing routine (*Morning routine A · 68 min* · **New routine**); then the habits from screen 9 as `SelectRow`s sorted by how much they matter, each with its emoji and its *usually* length on the right; a habit with versions shows its versions as small tabs under the title, the default filled. Selecting adds it to the routine in order; the highest-ranked are preselected down to the room `[DEFAULT]`, the rest unselected below them — everything visible, nothing hidden. A sticky `BudgetLine`: *45 chosen · 72 for the routine*; over reads *84 chosen · 72 for the routine · runs to 9:12*, muted, no colour (R7). Beneath the list: **Shorten to fit** as a ghost row (R4). Selected rows can be dragged to reorder (`SortableList`). The routine's name in a small `Input` at the top, prefilled *Morning routine A*. Primary: *Next · 45 min*.

**What it must never do.** Say *doesn't fit*, *over budget*, *too much*. The second number is the whole feedback.

#### 13f — During the day

Heading: *Anything during the day?* Body: *A break, a walk, ten minutes away from the desk.* Empty: *Nothing yet.* and **Add a break** (full-width secondary). Adding shows the break starters as `SelectRow`s (**🚶 Walk · 🤸 Stretch · 🧘 Meditate · 😴 Nap · 🥗 Lunch away from the desk · 👀 Eyes off screens**) plus **Something else**; a selected row reveals **When** — a `QuickChipRow` **Midday · At a time** with a `TimeField` on the second. Primary: *Next*; *Skip for now* as ghost. Skipped is the common path.

#### 13g — The evening

Heading: *The evening.* Body: *What's already in place on these days.* The fixtures whose weekdays overlap this plan's days, as `SelectRow`s preselected, each with its emoji, the days it applies to and its time — *🎟️ Football · Thu · 19:00 · 90 min* (S12.2: "if set in step 4 and there is a match based on day, set that option to already selected"). Fixtures on other days are listed beneath under *Other days*, unselected, selectable (which adds this plan's days to the fixture with one confirm line). **Add one** opens the `FixtureSheet`. Un-selecting a matched fixture excludes it from this plan only (*Not on Day A*), never from the fixture. Primary: *Next*.

#### 13h — Wind-down

Heading: *Winding down.* Body, tabular: *Lights out 22:45 · phone away 21:45.* A `PickerList` for an existing wind-down (*Wind-down A · 35 min* · **New**). Then the wind-down habits from screen 11 as rows — drag handle · emoji · title · `MinutesStepper` (midpoint) · menu — in a `SortableList`, with two placed rows the person cannot remove shown in position and muted: **✍️ A few lines · 10** (the closer, ending at phone away) and **📵 Phone away · 21:45** (the pin); habits dragged below the pin become *confirm in the morning* rows, exactly as v1.1 §7.1 lays them out. The bottom row, fixed: **🌙 Lights out · 22:45**. Sticky, tabular: *Wind-down A · starts 21:10*. The name in a small `Input`, prefilled *Wind-down A*. Primary: *Next*.

#### 13i — Day A, as it stands

Heading: *Day A, as it stands.* The whole day as a `ScheduleAxis` at `pxPerHour` 96 (the editor's scale — S12.1: never the compact strip) from *up at* to *lights out*, with a `BlockBand` per block, **the block's name and span inside the band's top edge, never in the gutter**, and every item as a `ScheduleBlock` with its emoji and title; travel rows as thin ends on the workout's band; slack as an empty band labelled *12 min* in the gutter; fixtures with the anchor glyph. Tap any band to jump back to its builder screen; tap any item for the slot sheet (§3.11). The wide layout puts the axis in the 960px canvas. Primary: **Save Day A**; ghost: *Back*.

Saving lands on **Your days**: one `DayPlanCard` per plan — emoji and name; the days as small chips; one muted summary line (*🏠 Remote · up 7:00 · work 9:00–17:30 · 🏋️ Upper body before the routine · lights out 22:45*); a disclosure chevron that expands the card to the three named lists and their lengths; an `EllipsesMenu` (*Edit · Duplicate · Delete*). *Duplicate* is how Day B usually starts. Beneath: **Build another day** (full-width secondary). Primary: *Continue · 2 days*.

**What it must never do.** Judge the routine. Show a percentage. Leave a weekday claimed by two plans. Copy a template when it can reference one.

**Spec.** `DayBuilder` (feature folder; nine screens in one client component with its own caption), `DayPlanCard`, `SelectRow`, `SortableList`, `PickerList`, `BudgetLine`, `QuickChipRow`, `ScheduleAxis` + `BlockBand` (+ in-band labels), `ScheduleBlock` (+ emoji). Writes `day_plans` (§11.5) and the three templates with names, each as it is built. States: draft · complete · reused-list (the summary says *shared with Day B*) · saving · failed · offline.

### 4.14 Screen 14 — Your week

**Who is here, in what state.** Done building. Wants to see it was worth it, and to leave.

**The one job.** Show the week the plans make, let a day be changed, and ask how mornings should go.

**What you see.** Heading: *Your usual week.* Seven `ListRow`s, Monday first: the weekday on the left; the plan's emoji and name and its one-line summary (*Day A · 7:00 → 22:45 · 🏋️ Upper body*) or *Unstructured* (a *Never* / *Rarely* day with no plan) or *Off* — muted, all of it. Tapping a row opens a `PickerList` sheet of the plans plus *Unstructured*; *Edit Day A* at its foot returns to 13i. On desktop the seven are columns.

Then one question, as two `LargeTargetRow`s (R37): **Set from the plan** — *Each morning opens on the plan for that day. Change anything from the day's menu.* (preselected) · **Build each morning** — *After the orient screen, choose what fits today. The plan is the starting point.*

Primary **Open today**; ghost **Plan this week first** (the week build, §4.15).

**What it must never do.** Show a number about the week. Ask anything already answered.

**Spec.** `ListRow` ×7, `PickerList` sheet, `RadioGroup` of `LargeTargetRow`s. Stores `users.morning_mode`; marks `first_run_completed_at`; pre-fills the current week from the plans (§4.15). *Open today* lands on the orient frame if the day hasn't started, else on the Today tab (under *Set from the plan*, set; under *Build each morning*, the quick-pick).

### 4.15 The week build, amended

v1.1 §4.13 stands with these changes:

- A day row's line reads its **plan** first: *Day A · Viewpoint · Push · Stand-up 9:30*. An unplanned weekday reads *Unstructured*.
- The `DaySheet` gains a **Plan** row at the top (a `PickerList` of day plans plus *Unstructured*) above the per-block rows; picking a plan fills the block rows from it, and any block row can still be changed for that day alone.
- Pre-fill after first run comes from the plans by weekday, then typical days and counts for anything the plan leaves pooled (a *Flexible* focus, a *Sometimes* day).

### 4.16 Settings → Your day

The list becomes: **Shape of the week · Work days · Work-day types · Standing commitments · Wake · Before the day (passages, the quote, the three lines) · Getting ready · Morning habits · Ranked (screen 9) · Training · Closing the day · Focuses · Your days (the plans, the builder) · Each morning (the mode) · Block order**. The block-kind rows still open the block editor (§3.11) for that kind, listing named templates (*Getting ready A · used by Day A, Day B*) above it.

### 4.17 The library

v1.1 §4.15 stands. Every row shows its emoji (`ItemIcon` already renders `IconValue`); the *Before work* group is titled *Getting ready* and its sheet says *step*.

---

## 5. The morning

v1.1 §5.1 and §5.4 stand. §5.2 and §5.3 are amended.

### 5.2 The orient frame, amended

**What you see.** No header, no tab bar, no time. Paper, a single reading column at 64ch. In order:

1. **The reading.** A `PassageCarousel`: today's passage (§3.12's cycle) — its images above if any (one at column width; a strip if more), its title as a caption in muted sans, its body in Newsreader at body size; or, on a quote day, the quote in quotation marks with its attribution as a caption under the chrome caption *A quote*. Beneath the column, a row of dots (one per passage, plus one for the quote if opted in) at 8px, `text-text-secondary`, the current one ink; the dots are the only chrome. Swipe, or the arrow keys, moves between passages with a 200ms settle (crossfade under reduced motion). If there are no passages and no quote, the placeholder: *Nothing to read yet. A passage, or tonight's journal, shows up here tomorrow.*
2. **Last night** (R41). A ghost row — *Last night* — collapsed. Tapping expands the lines the person wrote, verbatim, in this order: *make happen tomorrow* (its caption rewritten to today's tense — the one transformation the app performs), *visualisation*, *looking forward to*, each a `blockquote` with the prompt as `figcaption`, hairlines between. Absent when there is no entry. The row remembers nothing: collapsed every morning. **The metric:** if the row is opened on fewer mornings than not over the first month, the playback has been lost to the collapse and the default flips to expanded; Taylor decides on the number.
3. **Three lines** — each an optional one-row serif `Textarea`, growing, with its prompt as a caption, present only if its switch is on: *Grateful for, this morning* · *Today's intention* · *Today, as I see it* (new, S6.9). All autosave.
4. Within thumb reach: **Start the morning**. Under *Set from the plan* (R37) this sets the day — the primary's label carries the anchor when it is hard: *Start the morning · work 9:00* — and the Today tab beneath is the list; under *Build each morning* it slides up to the quick-pick.

**The one behaviour line (R18)** stands as v1.1 wrote it, on the gratitude field only.

**Amended 2026-09-16 (Taylor, S6.2–S6.9):** the frame reads a carousel of passages rather than one; a quote can join the cycle; last night's lines are behind a row; a third line asks for the day as the person sees it.

**Spec.** `OrientFrame` (+ `PassageCarousel` new, `@syn/ui`; the *Last night* `TextDisclosureButton`; a third `Textarea`). Props gain `passages: PassageView[]`, `quote: QuoteView | null`, `askIntention`, `askVisualisation`, `mode: "set_from_plan" | "build"`. Writes `days.woke_at`, `days.morning_gratitude`, `days.intention`, `days.visualisation` (§11.1); under *set from the plan*, `onStart` calls the confirm service with the plan's choices. States as v1.1 plus *carousel* (n passages) · *quote-day* · *last-night-open*.

### 5.3 The quick-pick, under the two modes

v1.1 §5.3 stands for the sheet itself. Which mornings see it changes (R37):

- **Set from the plan.** The pick is not shown. *Start the morning* on the orient frame sets the day from the day plan — routine, one-ofs at their defaults, training at its planned placement, focus from the week build, fixtures. The day header sheet's *Adjust the day* and the item sheet's controls cover every change. If yesterday has unconfirmed wind-down items, the `ConfirmYesterdayPanel` (v1.1 §7.3) renders at the top of the Today list, collapsible, until resolved or until the Day Review takes it. A *Sometimes* day is the one exception: its *Working today?* question is asked on the orient frame's primary — the label reads *Start the morning · working today?* and tapping it shows a two-row `Dialog` (**Working** · **Not today**) before the day sets. A workout on a plan is never unplaced.
- **Build each morning.** The pick as v1.1 §5.3, with its sections **expanded** by default rather than collapsed — the person chose to build — and the plan's choices preselected in every section. *Set the day* as before.

The mode is changeable in Settings → Your day → Each morning, and the day header sheet on any set day still offers everything v1.1 §6.2 lists.

---

## 6. The day

v1.1 §6 stands. Three rendering additions, no new mechanics:

- `ItemRow` shows the item's emoji in the icon slot (it already renders `IconValue`; the starters now carry one).
- Travel rows (§3.7) render as `ItemRow`s with a plain arrow glyph and the destination as the title (*→ Gym*), the workout's category edge if any; each has its own checkbox and sheet.
- The day header sheet gains **Working today** on a *Rarely* day (§3.9).

---

## 7. The evening

### 7.1 The wind-down routine

v1.1 §7.1 stands. The two placed rows and lights-out carry their glyphs everywhere they render — *📵 Phone away · 21:45*, *🌙 Lights out · 22:45* (S10.6) — fixed, not editable, and the journal's row carries ✍️. The starter library for wind-down is §12.4's, with emoji.

### 7.2 The journal, and its reminder

v1.1 §7.2 stands for the screen. Added (R38): one push, **the reminder**, at `journal_reminder_time`, in the person's words — title *A few lines*, body the time — sent only if the journal is enabled, the reminder is on, and tonight's entry is empty at send time. Never a second one. Never a word about yesterday's entry or its absence.

### 7.3 Confirm yesterday

v1.1 §7.3 stands; under *Set from the plan* its panel lives at the top of the Today list (§5.3).

---

## 8. Review under the new model

v1.1 §8 stands. A habit with versions is one habit in every count; the version chosen is a fact on the item's panel (*quick · 5 min*), never a separate line. Travel rows are items and count like any other; they carry no tier of their own beyond what Adjust gives them.

---

## 9. Notifications

v1.1 §9 stands with one row added to the catalogue:

| # | Trigger | Default | Title / body | Change |
|---|---|---|---|---|
| N2 | **Journal reminder** — `journal_reminder_time`, when the journal is enabled and tonight's entry is empty | On | *A few lines · 20:45* / (nothing) | New (R38). Reverses v1.1 §9.1's "any push for the journal" removal; qualifies under v1 §8.1 as a time the person set, in their words, reporting nothing. |

**Amended 2026-09-16 (Taylor, S10.2).** Settings → Notifications gains the row with its time picker; the N-catalogue numbering reuses N2, which v1 retired.

---

## 10. State matrix, tokens, accessibility

v1.1 §10.1 and §10.3 stand. §10.2 gains the new components; §10.4 gains three notes.

### 10.2 Component states — the new and amended components

| Component | Where | States |
|---|---|---|
| `SelectRow` (`@syn/ui`) | §4.7, §4.8, §4.11, §4.13 | default · selected (tick, ink border) · saving (hairline pulse) · failed (reverts, one line) · disabled (already in the library elsewhere: *in your library*) · focus-visible |
| `SortableList` (`@syn/ui`, dnd-kit) | §4.6, §4.7, §4.11, §4.13d/e/h | idle · lifted (0.9 opacity, 1.5px `border-accent-mark`, the same lift grammar as `DragLayer`) · dropping (120ms) · keyboard (Alt+↑/↓) · reduced-motion (positions jump) |
| `RangeEditor compact` (`@syn/ui`; replaces `RangeInput` in sheets) | §4.7, §4.9, sheets | default · editing · invalid (to < from: one line, *The second number is the longer one.*) · focus-visible on each field |
| `HabitSetupCard` · `WorkoutSetupCard` · `FocusSetupCard` · `WorkDayTypeCard` (feature folder) | §4.3, §4.9, §4.10, §4.12 | open · collapsed (one-line summary, *Edit*) · saving (per control) · failed · offline |
| `RichTextEditor` (`@syn/ui`, tiptap) | §4.6 | empty (placeholder) · writing · toolbar-active · link-editing · read-only (renders as prose) · offline (edits local) · focus-visible · reduced-motion (no toolbar animation) |
| `TagInput` (`@syn/ui`) | §4.6 | empty · adding · chips · focus-visible |
| `PassageSheet` · `PassageCard` (feature folder) | §4.6, Settings | create · edit · saving · uploading (thumbnail progress, no percentage) · failed · archived |
| `PassageCarousel` (`@syn/ui`) | §5.2 | one · many (dots) · quote-day · empty (placeholder) · reduced-motion (crossfade) |
| `DayBuilder` · `DayPlanCard` (feature folder) | §4.13 | draft · complete · reused-list · saving · failed · offline; card: collapsed · expanded |
| `TimeField disclosed` (amended) | everywhere | value (+Change) · open (+Done) · saving · error |
| `MinutesStepper` · `CountStepper` · `Stepper17` (amended) | everywhere | local value at once; write on 400ms debounce; never disabled in flight; failed reverts with one line |
| `WeekdayChips` (+ *Flexible*) | §4.10, §4.12 | as v1.1 plus flexible (all chips clear; the chip is ink) |
| `FixtureSheet` (+ kind, emoji) | §4.4, §4.13g | as v1.1 |
| `LargeTargetRow` (+ `leading`) | §4.1, §4.13b | as v1.1 |
| `ListRow` (+ leading emoji) | everywhere | as v1.1 |
| `ScheduleAxis` / `BlockBand` (+ in-band labels) | §4.13i | as v1.1; labels never in the gutter below 3 hours of height |

**Emoji rendering.** One rule for every slot: the glyph sits in a 44px square, `text-[1.25rem]` on rows and `text-[1.5rem]` in card headers, `font-emoji` (the system's colour emoji font stack, declared once in the preset), vertically centred on the row's control, with `aria-hidden` — the title is the accessible name, never the glyph.

### 10.4 Accessibility — additions

- **Every `SortableList` has a keyboard path**: Alt+↑/↓ moves the focused row; the row's menu keeps *Move up / Move down*; the drag handle is a 44px button labelled *Reorder {title}*; lifts and drops announce via a polite live region as `DragLayer` does.
- **`SelectRow` is a `button` with `aria-pressed`**; the tick is decorative.
- **The `RichTextEditor` toolbar** is a `toolbar` role with labelled buttons and the standard shortcuts; the editor announces its formatting on focus change; at 200% the toolbar wraps to two rows and stays pinned.
- **The carousel** is a `region` labelled *Today's reading*; dots are `tablist`/`tab`s; arrow keys move; swipe has the arrow keys as its fallback.

---

## 11. The data the screens need

*Written as needs, for Mason to shape. Where I name a column it is the name I would expect; where a fork is real I say so and Mason decides. Everything stays owner-private under the standard three policies except §11.6, which is app content. Nothing here changes the RLS posture for user data.*

### 11.1 `users` and `days`

| Need | Suggested shape |
|---|---|
| Four work-day values | `work_days` values gain `rarely` |
| Morning mode | `morning_mode` enum `set_from_plan · build_each_morning`, default `set_from_plan` |
| The quote opt-in | `quotes_opt_in` boolean, default false |
| The three morning lines | `orient_ask_intention`, `orient_ask_visualisation` boolean default true, beside the existing `orient_ask_gratitude` |
| The journal reminder | `journal_reminder_enabled` boolean default true; `journal_reminder_time` time nullable (default derived: `devices_off_time − 60`) |
| Stop writing | `earliest_wake_time`, `orient_passage` (migrated into one passage row), `orient_show_last_night` — columns stay; the cleanup migration is later, per Mason's discipline |
| The visualisation line | `days.visualisation` text ≤ 280 |

### 11.2 `habits` — versions, workout details

| Need | Suggested shape |
|---|---|
| Versions (R34) | `versions` jsonb `[{ key, label ≤ 20, minutes 1–480 }]`, nullable, ≤ 3 — a jsonb because a version is never queried apart from its habit. *Alternative:* a `habit_versions` table; declined unless the pick needs to address a version by id. |
| Workout type | `workout_type` text, nullable, from the curated list in §12.4 (a label; not an enum, so the list can grow without a migration) |
| Where | `location` enum `home · gym · outside`, nullable |
| Travel (R35) | `travel_there_min`, `travel_back_min` smallint 0–180 default 0; `plan_travel` boolean default true |

### 11.3 `fixtures` and one-offs

| Need | Suggested shape |
|---|---|
| Kind (R42) | `kind` enum `meeting · appointment · class · event · social · chore · other`, default `other` |
| Emoji | `icon` jsonb `IconValue`, not null, defaulted from the kind — the same column shape as habits so `ItemIcon` renders it unchanged |
| One-offs | the same two on `day_items` where `origin = one_off`; a fixture's are snapshotted as habits' are |

### 11.4 `passages` — new

| Column | Type |
|---|---|
| `id`, `user_id`, `created_at`, `updated_at`, `archived_at` | standard |
| `title` | text ≤ 80, nullable |
| `body_md` | text ≤ 8000 — Markdown, the storage form; the editor round-trips it |
| `images` | jsonb `string[]` of bucket-qualified paths, ≤ 4 (the `icons` bucket's path grammar, or a `passages` bucket — Mason) |
| `tags` | text[] ≤ 10, each ≤ 24 |
| `sort_order` | smallint |

RLS: owner-private, the standard three. Export: added to the zip.

### 11.5 `day_plans` — new

| Column | Type |
|---|---|
| `id`, `user_id`, `created_at`, `updated_at` | standard |
| `name` | text 1–40 |
| `icon` | jsonb `IconValue`, nullable |
| `weekdays` | smallint[] ⊂ 0–6 — unique per user across plans, enforced in the service (a weekday belongs to one plan) |
| `work_template_id` | uuid → templates (kind work), `set null`; null = no work on this day |
| `wake_time`, `work_start_time`, `work_end_time`, `lights_out_time`, `devices_off_time` | time, nullable — null means "the profile's / the type's" |
| `prep_template_id`, `morning_template_id`, `wind_down_template_id` | uuid → templates, `set null` |
| `training` | jsonb `[{ habit_id, placement: before_morning · after_morning · inside_work · after_work · in_break }]` — reusing `day_blocks.placement`'s enum |
| `breaks` | jsonb `[{ habit_id, at: "midday" \| "HH:MM" }]` |
| `excluded_fixture_ids` | uuid[] — fixtures are matched by weekday; the plan stores only exclusions |
| `sort_order` | smallint |
| `state` | enum `draft · complete` |

*The fork.* (a) This table, a row of references — recommended: a plan is composition, editing a template edits every plan, deleting a plan deletes nothing else. (b) A jsonb `users.week_plan` — declined: seven slots is not the model; the plan is named and reused. (c) A `templates` row of kind `day` with child references — declined: the block model is the one thing v1.1 made load-bearing and a day is not a block.

Templates gain nothing; they already have `name`. The prep template's rows are steps by `block_kind`.

### 11.6 `quotes` — new, app content

| Column | Type |
|---|---|
| `id`, `created_at`, `updated_at`, `published_at` (nullable) | standard |
| `text` | text ≤ 400 |
| `attribution` | text ≤ 120 |
| `source` | text ≤ 200, nullable |
| `tags` | text[] |

Read by every authenticated user (a policy that reads `published_at IS NOT NULL`); written only through the admin surface. The admin surface is a route group behind a role — the smallest honest version is an allow-list of user ids in server env read through `env.ts`, and a `/admin/quotes` page with a list, a form, and publish/unpublish. Mason sizes this in the handoff; if the role is a one-way door he would rather not open this week, the reversible alternative is a seeded table edited by migration, with the opt-in switch still shipping.

### 11.7 Materialisation, restated

v1.1 §11.11 stands; one input changes. Week build reads the weekday's `day_plan` first: block order, the three templates, the training placement, the breaks, the type's hours, and the four times; then typical days and counts for whatever the plan leaves pooled. Set the day under *set_from_plan* is the confirm service called with the plan's choices from the orient frame; under *build_each_morning* it is the quick-pick as before. Travel rows are materialised as `day_items` with `origin: travel` and a `parent_item_id` pointing at the workout `[Mason: or a `role` on the item; either is fine as long as the two rows are droppable alone]`. Nothing about `stackBlock` changes: the travel rows are two more items in the training block's stack.

---

## 12. Copy register and vocabulary

### 12.1 Register — amended

v1.1 §12.1 stands with one line changed. **Emoji (R29):** the product's copy never contains one; a thing the person owns may carry one as its icon — a habit, a step, a workout, a focus, a fixture, a one-off, a passage, a day plan, the two evening times — and the four archetype cards on screen 1 carry theirs as the one exception in the chrome, because they name kinds of people. No heading, body line, button, caption, status line, dialog, notification, or sentence in the app's voice ever carries one. An agent can grep the copy files for the rule: no emoji in `copy.ts`; emoji only in the constants that seed the person's things.

### 12.2 Vocabulary — additions

| Say | Not | Where |
|---|---|---|
| Step · Getting ready | Habit, task, prep (in copy) | the prep block |
| Version · Quick · Full | Mode, option | ranked screen, pick |
| Work-day type · Remote · Coworking · Office or site | Schedule, work template (in copy) | screen 3, the builder |
| Day plan · Day A | Template, profile, routine | the builder, the week |
| Passage · A quote | Message, affirmation, tip | before the day, the frame |
| Getting there · Getting back | Commute, transit (a step) | training |
| Set from the plan · Build each morning | Auto, manual | the week screen |
| Working today | Override, switch to work | the day header sheet |
| For the routine · chosen | Available, budget, left, fits, over budget | the room line |
| Flexible | Any day, TBD | days chips |

### 12.3 What the product never says — additions

*Doesn't fit*, *too much*, *over budget*, *cut* (as a verb about the person's list, outside Adjust's three rows), *pep talk*, *habit* for a step. The v1.1 list stands.

### 12.4 Starter libraries and curated lists, with their glyphs

Nothing pre-selected; plain nouns; ranges are defaults the person edits. The glyph is the row's default `icon`, editable through the picker. Mine to extend.

- **Morning (Recommended):** 🌬️ Breath work 5–10 · 🥶 Cold shower 3–10 · 🧘 Meditate 10–20 · 🤸 Stretch 5–15 · ✍️ Journal 5–10 · 📖 Read 15–30 · 🚶 Walk 15–30 · ☀️ Sunlight 5–10 · 🛏️ Make the bed 2–5 · 🗒️ Plan the day 5–10 · 💧 Water 1–2 · 🙏 Gratitude 2–5.
- **Morning (All):** the above plus 🪷 Yoga 20–45 · 🦵 Mobility 10–20 · 🏃 Run 20–45 · 🏊 Swim 30–60 · 🕊️ Pray 5–20 · 🔤 Language practice 10–20 · 🎵 Music practice 15–30 · ✒️ Write 20–45 · 🧴 Skincare 5–10 · 🎤 Vocal warm-up 5–15 · 😌 Face training 5–10 · 🔭 Visualise 5–10 · 💬 Affirmations 2–5 · 🔥 Sauna 10–20 · 🧊 Ice bath 2–5 · 🧹 Tidy 5–15 · 🎧 Podcast 15–30 · ✏️ Draw 15–30 · 🌱 Garden 15–30 · 📞 Call someone 10–20.
- **Getting ready (steps):** 🍳 Breakfast 10–30 · ☕ Coffee 5–10 · 🚿 Shower 5–15 · 👕 Get dressed 5–10 · 🚶 Walk 10–30 · 🚌 Transit 15–60 · 🚗 Drive 10–45 · 🐕 Walk the dog 15–30 · 🎒 School run 20–45 · 🥪 Pack lunch 5–10.
- **Break:** 🚶 Walk 10–20 · 🤸 Stretch 5–10 · 🧘 Meditate 5–15 · 😴 Nap 15–25 · 🥗 Lunch away from the desk 20–40 · 👀 Eyes off screens 5–10.
- **Wind-down:** 📖 Read 15–30 · 🤸 Stretch 5–15 · 🧘 Meditate 5–15 · 🛁 Bath 15–30 · 🧽 Tidy the kitchen 5–15 · 👔 Lay out tomorrow 5–10 · 🧴 Skincare 5–10 · 🍵 Tea 5–10 · ✍️ A few lines (placed) · 📵 Phone away (placed) · 🌙 Lights out (placed).
- **Workout types:** 🏋️ Upper body · 🦵 Lower body · 🏋️‍♀️ Full body · 🎽 Core · ⚡ HIIT · 🪷 Yoga · 🚴 Cardio · ⚽ Sport · 🏊 Swim · 🤸 Mobility · 🧗 Climb · 🥾 Hike · 💪 Other.
- **Fixture kinds:** 🗣️ Meeting · 📌 Appointment · 🎓 Class · 🎟️ Event · 🍽️ Social · 🧺 Chore · 📍 Other.
- **Work-day kinds:** 🏠 Remote · ☕ Coworking · 🏢 Office or site · 💼 Other.
- **Archetype cards (screen 1):** 🗓️ same every week · 🔁 change week to week · 🧭 my own structure, and it changes · 🌊 fluid.
- **Placed evening rows:** 📵 Phone away · 🌙 Lights out · ✍️ A few lines.
- **Activity (offers, not items):** the sheet suggests nothing; it asks *What's on tonight?* and offers the fixture kinds.

Where the same noun appears in two blocks (Walk, Stretch, Meditate, Journal, Skincare) it carries the same glyph, so the Today tab reads one vocabulary.

---

## 13. Open items and defaults

| # | Label | What it is | Where | My default |
|---|---|---|---|---|
| 16 | `[ASSUMPTION]` | "Not rendered by default" for last night's lines means collapsed behind a row, not absent. | §5.2, R41 | collapsed row |
| 17 | `[OPEN]` | The number of mornings the *Last night* row must go unopened before the default flips back to expanded. | §5.2 | Taylor's call; I'd say more than half over the first month |
| 18 | `[DEFAULT]` | *Before work* training sits before the routine. | §3.7, §4.13c | before |
| 19 | `[DEFAULT]` | The first day plan preselects every *Always* and *Sometimes* weekday. | §4.13a | as written |
| 20 | `[DEFAULT]` | Getting ready in the builder starts with every step on, in screen 7's order; the routine preselects by rank down to the room. | §4.13d, §4.13e | as written |
| 21 | `[DEFAULT]` | The passage cycle is by list order, advancing at day-open, wrapping; nothing is remembered about which was read. | §3.12 | as written |
| 22 | `[OPEN]` | Whether tags earn their chrome before the "chosen against the day" layer exists. | §3.12 | ship them; they are the seam |
| 23 | `[OPEN]` | The admin surface's first cut: a role and a page, or a seeded table edited by migration. | §11.6 | Mason's sizing; the opt-in switch ships either way |
| 24 | `[OPEN]` | The quote bank's tone rule in one sentence, for the curator. | §3.12 | *Nothing that instructs, exhorts, or commands in the second person.* |
| 25 | `[DEFAULT]` | Phone away defaults to lights out − 60; the journal reminder to phone away − 60. | §4.11 | as written |
| 26 | `[DEFAULT]` | *Same shape every work day?* preselects *Yes*. | §4.3 | yes |
| 27 | `[OPEN]` | Whether *Set from the plan* should set the day on *Start the morning* (this document) or on opening the frame. | §5.3, R37 | on the tap — the morning is confirmed, not detected |
| 28 | `[OPEN]` | The wide layout of the builder's nine screens beyond the 720px derivation. | §4.13 | derive; nothing else changes |
| 29 | `[COPY]` | The quote switch's muted line. | §4.6 | *One a day, from a set we keep. Attributed, never ours.* |
| 30 | `[OPEN]` | Whether the version tabs on a row read at 375px with three versions and a long title. | §3.5, §4.13e | stack the tabs under the title at 200% and below 360px |

v1.1 §13's items 1–15 stand except #6 (retired by R39) and #7 (Sat is now *never*). Phase-2 items referenced and not built: P2-1, P2-2, P2-3, P2-4, P2-5, P2-6, P2-7, P2-16, and the "chosen against the day" layer from ledger §25, now with tags as its seam. P2-14 is pulled forward here.

---

## 14. Convergence tests, and what to do with this

### 14.1 Tests run

- **Worst-moment:** the orient frame is still one read and one button; under *Set from the plan* the morning is that one button; the builder is the planning state and earns its nine screens; every stepper is instant.
- **Register:** no emoji in any sentence the app speaks; the room is stated as room; *step* where *habit* was wrong; nothing new in the second person.
- **Trust:** the quote is attributed and never keyed to the person; the passage cycle records nothing; travel rows are the person's to drop; nothing is pre-selected on a chooser; the only preselections are in the builder, where the person is composing from their own list.
- **Alarm:** no red, no *doesn't fit*, no shortfall sentence; the over line is muted arithmetic.
- **Contrast:** emoji are `aria-hidden` and never the only carrier; disabled cards fade the glyph with the text.
- **State:** §10.2 covers every new component including failed-and-reverted, offline, focus-visible, reduced-motion, and the keyboard path for every drag.
- **Drift:** no section glyphs; cards are the shadcn base with a hairline, not elevated tiles; the builder's review is the Schedule's own grammar.
- **Buildability:** every screen names its components and writes; §11 names every column the screens need and the one real fork; the handoff sizes the doors.

### 14.2 What to do with this document

1. Taylor reads §0.3 and §13 first — the rulings and the defaults are the shortest route to what is his — then §4 top to bottom against the phone.
2. Mason reads §3.12, §3.13 and §11 with the handoff and rules on the doors.
3. Reeve turns §4 into tickets in the order the handoff sketches, and brings §13 to Taylor as one batch.
4. On acceptance, v1.1 gets its one-line superseded note (it already carries a pointer here), and the epic-4 logs record each reversal in §4 of the walkthrough as one line.

### 14.3 Sign-off

Vesper — draft, not signed. Everything above traces to a walkthrough note, a ledger entry, or a call labelled as mine; nothing flagged open was invented silently; the one thing I disagree with (R41) is built as asked with its falsifier named.
