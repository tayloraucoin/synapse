# First-run walkthrough feedback — v1.1 build

**Author:** Taylor (testing notes) · Vesper (mapping, severity, rulings)
**Status:** Open for Mason's and Reeve's review. Session of 16 Sept 2026, against the build at `92589aa` (DYN-21), first run screens 1–12.
**What this is:** Taylor's notes on the twelve-screen first run **as built to the v1.1 spec**, mapped one by one to a ruling and to the section of [`ux-spec-v1.2.md`](../ux/ux-spec-v1.2.md) that now carries it. This is the design side of the change; the engineering-facing version — placement, data, dependencies, sequencing — is [`2026-09-16-ux-v1.2-engineering-handoff.md`](2026-09-16-ux-v1.2-engineering-handoff.md). Where a note asked me a question, the answer is in §2 with my reasoning, so it can be argued with.
**Precedent:** [`2026-09-12-app-walkthrough-feedback-v1.0.md`](2026-09-12-app-walkthrough-feedback-v1.0.md) (W1–W10). Numbering here is `S<screen>.<n>`; app-wide notes are `A<n>`.

Severity is mine: **Blocking** (breaks a law, a trust contract, or makes the flow fail) / **Should-fix** (hurts the experience) / **Consider** (taste). **Kind** classifies the change the way Reeve will: *defect* (the build departs from the v1.1 text), *amendment* (v1.1 said one thing and Taylor now wants another — the spec changes, with a dated note), *addition* (v1.1 was silent), *reversal* (a v1.1 ruling or a phase-2 pin is overturned — flagged so it is never re-decided silently).

---

## 0. Standing direction from this session

Three things Taylor said that apply everywhere, not to one screen:

1. **Optimistic updates are a design rule across the app** (S7.5). Every control reflects the tap immediately; the request follows; a failure reverts with one line. No control waits for a round trip to change its own state. The v1.1 text assumed this (§10, "latency is a designed experience") and the build did not deliver it on the steppers. It is now a rule in v1.2 §2 so it can be graded.
2. **Save as you go, not at Continue** (S8.4). A screen that gathers many facts writes each one when it is entered; *Continue* is navigation, not a bulk commit. This is the same rule as the journal's autosave (v1.1 §7.2), applied to setup.
3. **The primary action is sticky** (A2). *Continue · Skip for now* pins above the safe area on every setup screen, at every scroll position. v1.1 §4 already says "pinned above the safe area"; the build lets it scroll.

And one from me, drawn from the notes as a whole: **the first run is no longer a questionnaire that ends in arithmetic; it is a questionnaire that ends in building a day.** Screen 12's fit screen — "here is how much doesn't fit" — is replaced by a builder that composes a named day from the parts collected on screens 1–11 and shows the room as room, not as deficit. That is the largest change in this document and the reason v1.2 is a version and not a patch list.

---

## 1. The notes, screen by screen

### Screen 1 — The shape of your week

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| S1.1 | An emoji on the left of each card, chosen thoughtfully, to add emotion and personality. | Consider | amendment | Yes, on the cards — they name kinds of people, which is the one place on this screen where a glyph carries meaning rather than decoration. The four are in v1.2 §4.1. This is the only screen where emoji sit on the app's own copy rather than the person's nouns; §2.1 says why that is the line. The register rule (v1.1 §12.1 *no emoji*) is amended, not dropped — v1.2 §12.1. | v1.2 §4.1, §12.1 |

### Screen 2 — Work days

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| S2.1 | Selects, not the three-segment control. | Should-fix | amendment | A `Select` per weekday row. Four options no longer fit a segmented control at 375px without wrapping, which v1.1 §4.2 forbade (W5); the select is the mobile-native answer. | v1.2 §4.2 |
| S2.2 | Default Monday–Friday working, Saturday and Sunday off. | Should-fix | amendment | Sat moves from *Sometimes* to *Never*. v1.1 §13 #7 was labelled an assumption for exactly this. | v1.2 §4.2, §13 |
| S2.3 | Four options: Always · Sometimes · Rarely · Never. | Should-fix | addition | Added. *Rarely* is a new value with a defined behaviour: the day is planned as a non-work day, the pick does not ask, and the day header sheet offers *Working today* so a work-day type can be applied on the day. *Sometimes* keeps v1.1's meaning: the pick asks first. | v1.2 §3.9, §4.2, §11 |
| S2.4 | Replace the muted line *Sometimes means the morning asks* with a collapsed disclosure, *What does each choice do?*, that explains all four. | Should-fix | amendment | A `TextDisclosureButton` (exists in `@syn/ui`) opening four one-line definitions. Collapsed by default; the four lines are in v1.2 §4.2. | v1.2 §4.2 |

### Screen 3 — Work start, and what gives

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| S3.1 | The screen jumps to timing and does not account for days being shaped differently. Ask first: *Are your work days shaped the same?* If yes, proceed; if no, define work-day types with their own times — remote, coworking, office or worksite, and so on. | Blocking | amendment | The screen gains a first question, **Same shape every work day?** — *Yes · No, it depends on the day*. *Yes* is the v1.1 screen. *No* opens a list of **work-day types**, each a card with a name, a kind (*Remote · Coworking · Office or site · Other*), *working by*, *until about*, and its own *what gives*. This is v1.1's *work template* (R5) given the front door it never had; screen 11's ghost row *I have days with different hours* moves here (S11.3). Kinds carry a default emoji and a default name; the person renames freely. | v1.2 §3.8, §4.3, §11 |

### Screen 4 — Standing commitments

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| S4.1 | The centred *Add one* button breaks the design. | Should-fix | defect | v1.1 §4.4 wrote "an empty state in two lines" without saying where. The rule everywhere else in setup is left-aligned content; the centred `EmptyState` is the library's, not setup's. Fix: the empty state is a left-aligned muted line and *Add one* is a secondary button in the flow, full-width on mobile, exactly where the first row will appear. Same treatment for *Add a workout* and *Add a focus*. | v1.2 §4.4 (and the frame rule in §4) |
| S4.2 | The add sheet needs a type: appointment, meeting, event, class, social, and so on. | Should-fix | addition | `FixtureSheet` gains a **kind** chip row: *Meeting · Appointment · Class · Event · Social · Chore · Other*. Each kind sets a default emoji and a default block (*Meeting* → work; *Class · Event · Social* → evening) which the *In work · In the evening* segment can still override. The kind is a label and an icon; it changes nothing about how the fixture is materialised. | v1.2 §3.6, §4.4, §11 |

### Screen 5 — Wake

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| S5.1 | *Add an earliest* has no border and breaks the left alignment. | Should-fix | defect | Moot under S5.2. | — |
| S5.2 | Why is there an earliest at all? Is it to ask the person to get up earlier for the morning practices? | Should-fix | reversal | Answered in §2.2: remove it from the screen. v1.1 stored it and used it nowhere (§3.3, "informational"). One time, *Up at*. The column stays and stops being written, per Mason's cleanup discipline. | v1.2 §4.5, §13 |
| S5.3 | Once added, an earliest cannot be removed. | Should-fix | defect | Moot under S5.2. The general rule it exposes stands: any optional field the person reveals must have a *Remove* in the same place it was added. | v1.2 §4 (frame rule) |

### Screen 6 — Before the day

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| S6.1 | Underwhelming compared to what was described during speccing. Are things missing? | — | question | Yes, by ruling, not by accident — §2.4 has the account. Ledger §25 described multiple passages, a quote bank, and "chosen against the day ahead"; v1.1 took the cheapest medium (one passage) and pinned the rest as P2-14. This session pulls it forward. | §2.4 |
| S6.2 | Multiple passages, saved. They cycle, and can be browsed horizontally like a carousel. | Should-fix | reversal (P2-14 partially) | **Passages** become a thing of their own: a CRUD list on this screen, a carousel in the orient frame. Cycling rule: one passage per day, in list order, advancing at day-open; swipe or arrow to browse; the one shown at *Start the morning* is not recorded (nothing about the person). | v1.2 §3.12, §4.6, §5.2 |
| S6.3 | Each passage has an optional image, or a small gallery. | Should-fix | addition | Up to four images per passage, shown above the body as a single image or a horizontal strip; uploaded through the existing `icons`-style asset path (Mason decides the bucket). Optional, and the design reads well with none — most passages will have none. | v1.2 §3.12, §4.6 |
| S6.4 | Each passage has a title and a body. | Should-fix | addition | Title 1–80, body rich text. The title is a caption in the frame, never a heading; the body is the reading. | v1.2 §3.12 |
| S6.5 | Use tiptap for a markdown-rich editor; make it a well-designed reusable component. | Should-fix | addition | A `RichTextEditor` composite in `@syn/ui` (Storybook-first) with a deliberately small toolbar — paragraph, bold, italic, blockquote, bulleted list, link — stored as Markdown, rendered in Newsreader. No headings inside a passage (the title is the heading), no images inline (the gallery is separate), no colour. Tiptap is the engine; the boundary and the storage form are Mason's (handoff §3). | v1.2 §3.12, §10.2 |
| S6.6 | Tags or an identifier per passage, to help future AI selection for a given day. | Consider | addition | Free-text **tags**, shown as chips, optional, no vocabulary supplied. Their only v1.2 use is filtering the list on this screen; "chosen against the day" stays a phase-2 layer (ledger §25 last bullet) and the tags are the seam for it. | v1.2 §3.12, §13 |
| S6.7 | Quotes, managed in an `/admin` layer; a person opts in or out here. | Should-fix | reversal (P2-14) | A **quote bank** the app supplies, opt-in, off by default, one quote per day mixed into the passage cycle. This reverses v1.1 §4.6's *must never* and the ledger §25 ordering ("not first"). Two conditions from Sage's rule still hold and are written into v1.2: the quote is never in the app's voice (it is attributed, in quotation marks, in Newsreader), and it is never keyed to anything about the person. The `/admin` surface is a new route group and a new role — handoff §3 sizes it and offers a smaller first cut. | v1.2 §3.12, §4.6, §5.2, §13 |
| S6.8 | Don't ask *Show what I wrote the night before*; make it a button in the frame, not rendered by default. | Should-fix | amendment | The switch goes. In the orient frame last night's lines sit behind a ghost row **Last night** that expands them; collapsed by default. `[ASSUMPTION: "not rendered by default" means the lines are collapsed, not that the row is hidden.]` Noted in §2.4: this puts the playback — the one mechanism with evidence behind it — one tap away; the tap count is what to watch. | v1.2 §4.6, §5.2 |
| S6.9 | Add *Ask one line of visualisation in the morning*. | Should-fix | addition | A third optional field in the frame, after gratitude and intention: **Today, as I see it**. Same rules as the other two: the person's words, autosaved, never read back by the app. Passes Sage's test for the same reason the gratitude line does. | v1.2 §4.6, §5.2, §11 |
| S6.10 | The copy could use an emotional nudge — *what is your morning pep talk to yourself?* | Consider | amendment | Heading becomes *What do you want to hear first thing?* with the body *Your own words, a passage you love, a quote you chose. The morning opens on it, before anything else gets in.* "Pep talk" itself stays out of the chrome — it is a register the product refuses (v1 §9.1.3) — but the heading now asks for the thing Taylor means. | v1.2 §4.6 |

### Screen 7 — Before work

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| S7.1 | One item per row on mobile, with an emoji per item. | Should-fix | amendment | The chooser band becomes a list of `SelectRow`s (new: an emoji, a title, a range on the right, the whole row a toggle with a tick that appears on selection — no checkbox square). One per row on mobile, two columns from 720px. Every starter item carries a default emoji (v1.2 §12.4). | v1.2 §4.7, §10.2, §12.4 |
| S7.2 | A select toggle over a checkbox. | Should-fix | amendment | As S7.1. The tick is the selection (W4 stands); the control is the row. | v1.2 §4.7 |
| S7.3 | *Add something else* opens a sheet called *New habit*; these aren't habits, they're must-dos to get ready, and the sheet offers a block choice that is already decided. Is *habit* even the right word? | Should-fix | amendment | Answered in §2.3. On this screen the word is **step**; the sheet is titled *A step before work* and asks a name, an emoji and a rough range — no block, no priority. The schema keeps one table (a prep habit is `block_kind: prep`, priority 7, hard); only the vocabulary changes. | v1.2 §1.4, §4.7, §12.2 |
| S7.4 | The time-range UI is breaking; needs to be tighter. | Should-fix | defect | `RangeInput` is the library's from/to pair and is too wide for a sheet at 375px. A new compact variant — two 3-digit fields, *to*, *min*, on one line, 44px high, right-aligned — replaces it in every sheet. | v1.2 §10.2 |
| S7.5 | Tapping Breakfast did not change immediately; tapped again and got two Breakfast rows. The UI must update optimistically — a design rule across the app. The stepper is brutally slow, waiting on the API per tap. | Blocking | defect | Two defects and one rule. (1) The tick must reflect instantly and the second tap must be a no-op or an un-tick, never a duplicate — the row is keyed by the starter, not by the request. (2) The stepper holds its value locally, debounces the write, and never disables between taps. (3) The rule is A1 in §0 and v1.2 §2. | v1.2 §2, §4.7, §10 |
| S7.6 | The name and the ellipsis are not vertically centred on the stepper; *Takes: Breakfast* above the stepper is noise; the emoji is missing from the row. | Should-fix | defect | The row is one line: emoji · title · stepper · ellipsis, all centred on the stepper's height. The *Takes:* label was the stepper's accessible name rendered visibly; it becomes `aria-label` only. | v1.2 §4.7 |
| S7.7 | With one item per row, the lengths come after the list under a brief section title and a divider; *Add something else* belongs with the list, before the lengths. | Should-fix | amendment | The screen is two parts under `GroupHeading`s with a hairline between: **What's included** (the rows, then *Add something else*) and **How long each takes** (one row per selected step with its stepper). | v1.2 §4.7 |
| S7.8 | Possibly a third part for the order, before finishing. | Consider | addition | Yes, but not here: the order is set where the length is, and again in the day builder where it matters. The *How long each takes* list is sortable (drag handle, dnd-kit — S10.5's component), so order and length are one list, and the day builder shows the same list again in context. A third part on this screen would ask the same question twice. | v1.2 §4.7, §4.12 |

### Screen 8 — Your routine, the whole landscape

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| S8.1 | An emoji for each wellness habit. | Should-fix | amendment | Every morning starter carries one (v1.2 §12.4); *Add your own* opens the habit sheet's existing emoji picker. | v1.2 §4.8, §12.4 |
| S8.2 | The *Selected* tab looks horrible — no room for a row's contents. Consider a card per habit (shadcn base) with the emoji, and the ability to complete and close the card so checking off is easier to manage. | Blocking | amendment | The *Selected* tab is removed from this screen and becomes its own screen (S8.3). On that screen each habit is a `HabitSetupCard`: emoji and title in the header, then importance (`Stepper17` as a row of seven, wrapping never — it becomes a segmented 1–7 at 375px with the number as the label), then length (S8.3), then **Done** which collapses the card to a one-line summary (*Breath work · 5–10 min · usually 8 · importance 5*) with *Edit*. Collapsed cards sink below open ones. The tab bar on screen 8 becomes *Recommended · All* with the count on the primary (*Continue · 9 habits*). | v1.2 §4.8, §4.9, §10.2 |
| S8.3 | The selected stage should be its own step, because it asks importance and length. Length should be a range with an edit affordance, and the "aim for" time should be the ideal; the exact time belongs to schedule building. Maybe multiple commitment lengths (5 min quick, 30 min proper) as a short-list. | Should-fix | amendment + addition | New **screen 9 — Your routine, ranked**. Per card: the range as *5–10 min* with a pencil that opens the compact range editor (S7.4); **usually** as a `MinutesStepper` defaulting to the midpoint — this is the length the plan uses; and an optional **Add a short version** / **Add a long version** ghost row that reveals a second (and at most third) named length (*Quick · 5* · *Full · 30*). At planning and at the pick, a habit with versions shows as one row with version tabs, exactly the *one of* grammar (v1.1 §3.5) — no new mechanic. | v1.2 §3.5, §4.9, §11 |
| S8.4 | Continue is slow — a lot of API work at the end. Save as the user fills things in. | Blocking | defect + rule | Each tick creates the habit (optimistic row, undo on failure); each stepper change writes on debounce; *Continue* only navigates. Rule A1/A3 in §0. | v1.2 §2, §4.8 |

### Screen 9 — Training

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| S9.1 | The workout row is horrible — the layout was not designed for its copy; worse than the habit row. A card again. | Blocking | amendment | `WorkoutSetupCard`: emoji and name in the header; type; count a week; usual days; length; location; **Done** collapses it to *Upper body · 2 a week · Mon Thu · 60 min · gym*. Same collapse grammar as S8.2. | v1.2 §4.10, §10.2 |
| S9.2 | Location: home or gym/studio. If gym/studio, transit before and after as separate values, saved separately, never added to the base length — someone may cancel or extend the transit after — and the person can opt not to factor it here. | Should-fix | addition | **Where** — *Home · Gym or studio · Outside*. For gym/studio and outside: **Getting there** and **Getting back** as two `MinutesStepper`s (default 0), plus a switch **Plan for the travel** (on). The travel is stored on the workout as two separate minutes; the day builder and the pick place the workout as *travel · workout · travel* with the two travel spans as their own rows, so either can be dropped on the day without touching the workout. Off means stored but not placed. | v1.2 §3.7, §4.10, §11 |
| S9.3 | A second workout slotted above the first. It should append. | Should-fix | defect | Sort by creation; new cards append and open. Applies to every list in setup. | v1.2 §4 (frame rule) |
| S9.4 | Save and close a workout card the way the habit card does. | Should-fix | amendment | As S9.1. | v1.2 §4.10 |
| S9.5 | A list of workout types: upper body, lower body, full body weightlifting, abs/core, HIIT, yoga, cardio, athletic, and so on. | Should-fix | addition | A **type** `ChipPicker` (exists) with a curated list in v1.2 §12.4; picking one fills the name and the emoji when they are empty. *Other* leaves both blank. | v1.2 §4.10, §12.4 |
| S9.6 | An emoji per workout; the type sets a default. | Should-fix | addition | As S9.5; the emoji is editable through the existing picker. Workouts are habits and already carry `icon`. | v1.2 §4.10 |

### Screen 10 — Closing the day

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| S10.1 | After changing a time there is no way to close the input and return to the value + Change state. | Should-fix | defect | `TimeField disclosed` needs a **Done** (and blur) that returns to the disclosed state. Rule for every value + Change field. | v1.2 §4 (frame rule), §10.2 |
| S10.2 | A notification time for the nightly prompts, defaulting to one hour before phone away. Phone away defaults to one hour before lights out. | Should-fix | reversal (v1.1 R15 / Q35 "no push for the journal") | **Nightly prompt reminder** — a `TimeField` under the journal switch, on by default, default *phone away − 60 min*; **Phone away** default becomes *lights out − 60 min* (was 30). This reverses v1.1 §9.1's "any push for the journal" removal. Under v1 §8.1 it qualifies because it is a time the person set, in their own words (*A few lines · 21:15*), and it never reports anything. Dated note in v1.2 §9. | v1.2 §4.11, §7.2, §9, §11 |
| S10.3 | Wind-down routine selection like the morning habits: rows with emoji, no checkboxes, one per row on mobile, two per row on desktop. | Should-fix | amendment | The same `SelectRow` list as S7.1, from the wind-down starters, each with an emoji. | v1.2 §4.11 |
| S10.4 | *Wind-down routine · Order and lengths* renders nothing beneath, even after selections. What is it for? | Should-fix | defect | It was a ghost row meant to open the block editor for the wind-down template — a link styled as a section. In v1.2 lengths and order for wind-down are set in the day builder (S12), so the row goes. | v1.2 §4.11 |
| S10.5 | *What I want to make happen tomorrow* is too wide and breaks the ellipsis alignment; truncate to a max width. Prompts need a drag handle on the left to reorder, per the Conscious Connections convention. | Should-fix | defect + amendment | Prompt rows: drag handle (left, 44px target) · label truncated with an ellipsis at one line · `EllipsesMenu` (right). Reorder is `@dnd-kit/sortable`, the CC convention, wrapped once as a `SortableList` composite in `@syn/ui` so the journal prompts, the prep steps, the wind-down steps and Block order all share it. Keyboard: the existing *Move up / Move down* stay in the menu as the fallback. | v1.2 §4.11, §10.2, §10.4 |
| S10.6 | An emoji on *Lights out* and *Phone away*. | Consider | amendment | Yes — they are the person's two evening times and they render as rows on the Today tab, where the glyph does the same fast-read job as a habit's. Fixed, not editable. | v1.2 §4.11, §7.1 |

### Screen 11 — What your work days are about

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| S11.1 | Confusing; the heading mixes plural *kinds* with singular *day*. | Should-fix | amendment | With work-day *shape* now on screen 3 (S3.1), this screen is only about **focus** — what the work is about. Heading: *What is your work about?* Body: *One is fine. Each gets a rough share of the week.* | v1.2 §4.12 |
| S11.2 | Left alignment is poor on the focus row. | Should-fix | defect | A `FocusSetupCard` with the same header grammar as the workout card (emoji optional, name), count a week, days or *Flexible*. | v1.2 §4.12 |
| S11.3 | *Name your primary work day type* as the first label; the second kind of work day should also have a count and days. | Should-fix | amendment | The "second kind of work day" concept leaves this screen entirely — it is a work-day type on screen 3 (S3.1), where it has a name, hours and a kind. Days-per-week for a type are not asked; the day builder assigns types to weekdays (S12), which is the honest place. On this screen the first card's name field is labelled *Focus* with the placeholder *The main thing* and a muted line *A name for the work itself — a project, a client, a kind of work.* | v1.2 §4.3, §4.12 |
| S11.4 | The "what days" phrasing must allow *flexible*. | Should-fix | amendment | `WeekdayChips` gain a leading **Flexible** chip that clears the days; unset days already meant *decide in the morning* (v1.1 §4.11), so this only makes the state visible and tappable. | v1.2 §4.12 |

### Screen 12 — The fit

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| S12.1 | The calendar strip has overlapping text and is confusing. | Blocking | defect | The compact `ScheduleAxis` at 2 hours tall cannot label four bands in the gutter; the labels collide. The strip is retired with the screen (S12.2); where the axis is used in the builder's review it runs at the editor's `pxPerHour` 96 with labels inside the bands, never in the gutter. | v1.2 §4.13 |
| S12.2 | The approach is wrong — it jumps to scarcity (*192 min · 95 fit*). Instead, let the person build their days: Day A with its weekdays, work schedule, times, workout placement, getting-ready list, morning habits against the time available, day breaks, activities, wind-down, a review, a card per day, add another; then the week overview with a choice between "stays the same unless changed" and "build each morning after orient". | Blocking | amendment (v1.1 §3.10, §4.12, R6 amended) | **The day builder** — v1.2 §4.13, the centre of this version. One named day (*Day A*, renameable) composed in nine short screens from the parts already collected; the room shown as room (*72 min for the routine · 45 chosen*), never as a shortfall; three named lists saved as templates on the way (*Getting ready A*, *Morning routine A*, *Wind-down A*); a review as a time-blocked strip; a card per day; add another. Then **screen 14 — Your week**: seven columns, each weekday's day card or *Unstructured*, tap to change, and the one question: **Set from the plan** (the day is set when the orient frame opens; Adjust and the header sheet for changes) · **Build each morning** (the quick-pick opens expanded after orient). The overflow-mode question is gone from first run: a person who builds Day A and Day B *is* in variants mode; the daily menu is the pick's own behaviour under *Build each morning*. `overflow_mode` stays as a Settings preference. | v1.2 §3.10, §3.13, §4.13, §4.14, §5.3, §13 |

### Overall

| # | Note (Taylor) | Severity | Kind | Ruling | Lands in |
|---|---|---|---|---|---|
| A1 | Optimistic updates as a design rule across the app. | Blocking | rule | v1.2 §2 guardrail 4. Graded per component in §10. | v1.2 §2, §10 |
| A2 | The *Continue · Skip for now* CTA should be sticky. | Should-fix | defect | `StepFrame` pins the action row above the safe area at every scroll position, with a hairline and a paper fill so content scrolls beneath it. | v1.2 §4 (frame) |
| A3 | An emoji or icon per section to give each page distinction — is that helping or hurting? | — | question | §2.1: hurting, for the app's own chrome; helping, on the person's nouns. Recommendation: no section glyphs; the heading is the distinction. | §2.1 |

---

## 2. The questions, answered

### 2.1 Emoji per section — helping or hurting?

**Hurting, on the screens; helping, on the items.** My recommendation is no glyph on any setup heading, caption or section, and a glyph on every noun the person owns. The reasoning:

1. **A screen has one focal point and it is the heading.** A glyph beside or above it is a second thing competing for the first read, on screens whose budget is "one idea per screen" (v1.1 §1.3). The heading already does the distinguishing — *Do you train?* and *How does the day end?* are not confusable.
2. **Thirteen screens with thirteen glyphs read as an onboarding kit.** It is the rhythm of every SaaS setup wizard, and the drift test (role §3.4) fails it: it would be at home in a generic template. Restraint is the brand; the v1 register rule (*no emoji*) existed for this reason.
3. **Item emoji earn their keep; section emoji appear once.** A habit's emoji is chosen or accepted by the person, follows the habit onto the Today tab, the Schedule, the Review, and the notification, and becomes the fast-read vocabulary Taylor wants (S7.6, "quicker chunk comprehension"). A section glyph is seen on one screen during one session and never again. Personality that persists is character; personality that appears once is decoration.
4. **The line is ownership.** Emoji live on things the person owns — habits, steps, workouts, focuses, fixtures, passages, the two evening times, and the archetype cards on screen 1 (which describe the person, not the app). They never appear in the app's chrome: headings, buttons, captions, status lines, notifications' chrome, or any sentence the app speaks. That is the amended register rule in v1.2 §12.1, and it is a rule an agent can grep.

If, after living with it, the screens still feel undifferentiated, the lever to pull is not a glyph but the body line under each heading — several are currently missing (screens 3, 5, 9, 10, 12) and a body line is what gives a screen its temperature.

### 2.2 Why an earliest wake time?

It was Taylor's own ledger §2 ("wake as a range"), carried into v1.1 as a stored-but-unused fact and labelled `[ASSUMPTION — informational]` (§13 #6). There was no mechanic behind it and no plan for one: it was never used to suggest an earlier wake, and I would not build that — an app that nudges someone to get up earlier for their practices is the persuasion register the product refuses. **Remove it from the screen.** One time, *Up at*. The column stays and is not written; if a real range mechanic ever earns its place (a soft alarm window, say), it is a new decision with a new screen.

### 2.3 Is *habit* the right word for a getting-ready item?

No, on that screen, and Taylor's instinct is right about why: a habit is something you are trying to make true about your life; breakfast and the drive are things that have to happen before the day can start. Same table, different noun. The rule in v1.2 §1.4: the product says **step** for an item in the prep block (*a step before work*, *Getting ready · 4 steps*), **habit** for morning, break and wind-down items, **workout** and **focus** as before. The sheet that adds one is scoped to its block — it never asks which block, because the screen already decided — and titled for the noun: *A step before work* · *A morning habit* · *A wind-down habit*. Mason's v1.1 §11.3 decline of a second table stands; a step is `block_kind: prep`, priority 7, hard, exactly as DYN-11 wrote it.

### 2.4 Screen 6 — is something missing?

Yes, deliberately. Ledger §25 asked for a micro-feature with independent design research: a passage, a quote, an affirmation, "multiple of these", "possibly chosen against the day ahead". v1.1 §4.6 took the cheapest medium — one passage, one textarea — because it was fully private and had no content problem, and pinned the quote bank as P2-14 ("needs a content, licensing and tone decision"). The "chosen against the day" layer was parked in the same ledger entry. So the build is exactly what v1.1 specified, and v1.1 specified the floor.

This session raises the floor: passages become a collection with a title, a rich body, images and tags; a quote bank is added as an opt-in; a visualisation line joins the morning. Two things I hold onto from the original ruling, written into v1.2: **the app never speaks the message** (a quote is attributed, in quotation marks, in the reading face; the chrome stays neutral), and **nothing in the frame is keyed to anything about the person** (tags are the person's, for the person; the cycle is by order and date, never by mood or adherence). The content, licensing and tone decision for the bank is now Taylor's to make as the admin; the handoff names what the admin surface needs and offers a smaller first cut.

One honest note on S6.8. Reading last night's lines at the moment they apply is the mechanism Sage graded as the best-evidenced thing in the product (v1.1 §7.2). Putting it behind a tap does not remove it, but it makes it optional in a way a default-shown block was not. I have built it as asked and named the metric: if the *Last night* row is opened on fewer mornings than not, the collapse cost the effect, and the default should flip back.

---

## 3. What this does not touch

- **The Today tab, the Schedule, Adjust, the journal, Review, notifications beyond N-journal** — unchanged except where a new fact needs rendering: the emoji on item rows (already supported by `ItemIcon`), the travel rows around a workout, the visualisation field's playback, the passage carousel. Each is named in v1.2 where it lands.
- **The product non-negotiables** — none is touched. The one guardrail amended is the register rule on emoji (v1.1 §12.1), and it is amended with a line, not dropped.
- **Phase-2 pins other than P2-14** — untouched. P2-5 (journal timer), P2-7 (calendar), P2-16 (archetypes) stay where they are.

## 4. Reversals, in one place (for Reeve's log)

| Reversal | Was | Now | Dated note in |
|---|---|---|---|
| Wake range | stored, informational (v1.1 §3.3, §13 #6) | not asked | v1.2 §4.5 |
| Quote bank | never (v1.1 §4.6), P2-14 | opt-in, admin-managed | v1.2 §4.6 |
| Last-night playback | shown by default, switchable (v1.1 §4.6, §5.2) | collapsed behind *Last night*, no switch | v1.2 §5.2 |
| Journal push | none (v1.1 §9.1, Q35) | a reminder at a time the person set, on by default | v1.2 §9 |
| Phone-away default | lights out − 30 | lights out − 60 | v1.2 §4.11 |
| Work-day defaults | Sat sometimes | Sat never | v1.2 §4.2 |
| The fit screen and the overflow question | screen 12 (v1.1 §4.12) | the day builder + the week screen; overflow mode a preference | v1.2 §4.13, §4.14 |
| R6, the quick-pick | always shown, one tap | under *Set from the plan*, the day sets at orient; the pick is the *Build each morning* path | v1.2 §5.3 |
| Register: emoji | none (v1.1 §12.1) | on the person's nouns only | v1.2 §12.1 |

## 5. What to do with this

1. Mason reads the [engineering handoff](2026-09-16-ux-v1.2-engineering-handoff.md) against this and rules on the one-way doors it names (day templates, passages, the admin role, the tiptap and dnd-kit boundaries).
2. Reeve classifies each row's *Kind* into the log, sequences the tickets the handoff sketches, and brings Taylor the decision queue in §13 of the spec as one batch.
3. Taylor corrects anything in the *Ruling* column he reads differently; the `[ASSUMPTION]` marks are the places I had to choose.
