# Official UX Spec v1.3 — Synapse, the first run built day-first

**Author:** Vesper, Lead UX/UI Designer · §11 is written as the data the screens need, for Mason to shape · §0.3 rulings continue v1.2's numbering
**Date:** 24 Sept 2026
**Status:** Draft for Taylor's read; Mason and Reeve cut `docs/specs/epic-6-day-first-first-run/` from it. An iteration version: v1.2 is the base; this document rewrites §4 whole, amends §3, §5.2, §7.2, §10, §11, §12 in place, and carries the rest forward by reference.
**Base:** [`ux-spec-v1.2.md`](ux-spec-v1.2.md) (draft 2026-09-16, built as Epic 5), which stands on [`ux-spec-v1.1.md`](ux-spec-v1.1.md) (accepted 2026-09-12), which stands on [`ux-spec-v1.md`](ux-spec-v1.md). Where this document and v1.2 disagree, this document wins; where it is silent, v1.2 stands; then v1.1; then v1.
**Sources:** Taylor's second first-run walkthrough, [`2026-09-24-first-run-walkthrough-feedback-v1.2.md`](../product/2026-09-24-first-run-walkthrough-feedback-v1.2.md) (cited as `T#.#` for a screen note and `G#` for the general restructure), and his spoken clarifications of the same day, cited as `C#`.
**Companions:** [`synapse_ui_component_needs_and_handoff_v2.md`](synapse_ui_component_needs_and_handoff_v2.md) for component contracts · [`brand-tokens.md`](../ai-guides/brand-tokens.md) for token names · [`branding-guide.md`](branding-guide.md) for the derived orientation.

---

## 0. How to read this document

### 0.1 What kind of document this is

The same kind as v1.2 (§0.1 there): every screen opens with a walk-through, copy is in-register and adjustable, defaults are labelled. Three labels, as before: `[DEFAULT]` a choice made where Taylor's note left room; `[ASSUMPTION]` a fact I needed and did not have; `[OPEN]` something only Taylor or real use can settle. All three are collected in §13.

What is different about this version: Taylor walked the v1.2 build and then described, from intuition, the order in which he would want to be asked. That order is day-first — a person builds a day and meets each part where it belongs in that day — and this document is that order made buildable. Most of v1.2's screens survive; what changes is where they sit, what owns their facts, and four things that are genuinely new: the blocks primer, the after-work transition, the free-time library, and links.

Mobile first, always. Every screen is designed for a phone held in one hand; the desktop line at the end of each walk-through says how the wide layout derives.

### 0.2 Authority ladder for v1.3

1. Taylor's walkthrough notes and clarifications (they override v1.2's text, as v1.2's notes overrode v1.1's).
2. This document.
3. v1.2, for everything this document does not rewrite.
4. v1.1, then v1, for what the later versions do not rewrite.
5. The cross-cutting document and the v2 handoff, for navigation and component contracts.
6. My judgment, labelled.

### 0.3 Rulings this version makes

Each row is a decision with a real alternative, stated so it can be flipped in one line.

| # | Ruling | Source | The alternative not taken |
|---|---|---|---|
| R44 | This is **v1.3**, an iteration on v1.2: §4 is rewritten whole; §3, §5.2, §7.2, §10, §11, §12 are amended in place; v1.2 stands for the rest. | Taylor's brief | A v2. |
| R45 | **The first run is day-first.** Five outer screens; the day builder is the fourth and holds every part inside the day it belongs to. The first day collects the libraries once (habits, activities, the reading); later days pick from them. | G1–G16 | Collect the parts on twelve screens, then compose (v1.2). |
| R46 | **A day plan owns its work**: kind (*Remote · Coworking · Office or site · Other*), *working by*, *until about*, *what gives*. The work-day type retires as a first-run noun; on disk it is a work template the plan owns (TD-23). *Same shape every work day?* and Settings → Work-day types leave. | T3.2, C1 | Types as a separate noun a plan picks from (v1.2 R32). |
| R47 | **Blocks are taught once**, on screen 2, with an example day drawn as bands. **Block hues** exist on planning surfaces only — the primer, the builder's review, the week — never on the execution tabs, and every band carries its name. | G2 | No primer; monochrome bands everywhere. |
| R48 | **Transition is a block kind.** The getting-ready block keeps `prep` as its kind and *Getting ready* as its word; one **after-work** transition per plan, kind `transition`, flows forward from the end of work (or of after-work training). Inside work, a meal is a break. Several transitions per day is the revisit trigger, not this version. | G2, C2 | Rename `prep`; or N transition blocks with keyed reconciliation now. |
| R49 | **Five work-day values**: *Always · Usually · Sometimes · Rarely · Never*. *Usually* is planned as a work day, never asked, and the day's menu offers *Not working today*. | T2.2, C3 | Four values with *Always* meaning most weeks. |
| R50 | **Free time is a library and a pool.** An activity starter library, grouped, ranked like habits; a plan's evening carries a pool (*Evenings A*); the day's activity block is pooled and chosen at the pick or on the day. Reverses v1.2 §12.4's *the sheet suggests nothing*. | G13, C4 | The activity sheet as a blank. |
| R51 | **A fixed event carries a place and travel**: a location line, getting there and back, *plan for the travel*. Travel rows sit beside it, as a workout's do (TD-12). | G4.6, C5 | Travel as a step in getting ready. |
| R52 | **Several workouts on a day**, each with a placement; workouts with the same placement stack in the order chosen. Lifts RUN-5's one-per-day. | G4.4 | One workout per plan. |
| R53 | **Links**: a list of things to open — a playlist, a track, a page — with a title and a URL; Spotify recognised by host and marked; shown on the orient frame as callouts under the reading; several. | T6.2, C6 | One link; or no links until phase 2. |
| R54 | **A quote after the journal**, on quote-days, when the bank is opted in. The app never speaks it. *Keyed to the entries* is phase 2 (P2-18) and needs the AI the product does not have. | T11.1, C7 | No evening quote. |
| R55 | **Focus leaves first run.** Work is time here; a notice line says what happens inside it lives in the person's work tools. Settings keeps *Focuses*; the week build keeps its focus row. | T12.3, C8 | Keep screen 12 with quick-pick chips. |
| R56 | **One selection grammar**: a chosen row or card is `bg-surface`, a 1.5px ink border and a check in the trailing slot. The ink fill is the primary button's alone. Amends v1.1 §9.7's `LargeTargetRow`. | T1.1, T3.1 | Ink fill on the selection. |
| R57 | **Collapsed cards are two lines**: the glyph, the name and *Edit* on the first; the facts as a muted caption beneath. Amends R43. | T3.3 | One truncated line. |
| R58 | **Cards keep their order.** *Done* collapses in place; focus stays where the card was. Amends R43's *open cards stay above collapsed ones*. | T9.2 | Sink collapsed cards. |
| R59 | **The matters number is the chosen cell, miniature**, beside the glyph on the collapsed card and on the routine's rows. Never a bare digit. | T9.3 | *matters 5* in the summary. |
| R60 | **Every "what does this do?" is an `InfoDisclosure`**: an info glyph with a text label; open, a surface panel of term-and-definition lines. | T2.3 | The bare text toggle. |
| R61 | **The morning-routine question is asked once**, after the first ranking: *Same routine every day?* Stored; later days skip the routine screen or pick a routine accordingly. | G4.9.2 | Ask on every day. |
| R62 | **Steppers move by one**; the field can be emptied and reads *0* as a placeholder; the write is on blur. Amends the v2 handoff §5.4's *buttons move by 5*. | T9.1 | Five by button, one by typing. |
| R63 | **Loading is designed.** Every route transition in the sequence shows the frame's skeleton; the primary shows pending; a list that is fetching shows rows, never a blank. | T10.4, T13.1 | Spinners, or nothing. |
| R64 | **Times live on the plan.** *Up at*, *lights out*, *phone away*, *working by*, *until about* are asked per day inside the builder; the profile's copies are the first plan's, written when the profile has none. Screens 5 and 11 leave the outer sequence. | G4.2, G4.3, G5 | One wake for all days (v1.2 R39). |
| R65 | **Workouts and every setup list read in created order.** A sort menu is not offered. | T10.3 | Alphabetical; or a sort setting. |
| R66 | **The library's *All* tab is grouped**: *Body · Mind · Practice · Home* for the morning; *Move · Make · Connect · Rest · Tend* for free time. Recommended stays *Body · Mind*. | T8.2 | Flat lists. |
| R67 | **Progress is shown twice inside a day** — after the fixed things (so far), and before free time — as the same strip the review draws, read-only, tap-to-edit. | G4.7, G4.11, G4.12 | Once, at the end. |
| R68 | **Another day starts from the last.** *Build another day* duplicates the plan just saved (references, not copies), clears its weekdays, and opens on name and days. | G4.15 | An empty plan. |

### 0.4 What v1.2 said that no longer holds

- v1.2 §4 (fourteen screens; twelve of parts, then the builder) → §4 here (five screens; the builder holds the parts).
- v1.2 §4.3's *Same shape every work day?* and work-day types as a chooser → §3.8 and §4.4 B3 (a plan owns its work; R46).
- v1.2 §4.5's one wake and §4.11's two evening times on profile screens → §4.4 B2 (per plan; R64).
- v1.2 §4.12 (focus) → gone from first run (R55).
- v1.2 §12.4's *Activity (offers, not items): the sheet suggests nothing* → §12.4 here (R50).
- v1.2 R43's *open cards stay above collapsed ones* and the one-line summary → R57, R58.
- v1.1 §9.7's `LargeTargetRow` ink fill on the selection → R56.
- The v2 handoff §5.4's stepper moving by five → R62.
- RUN-5's one workout per day (Epic 5 `DEVIATIONS.md`) → R52.

---

## 1. Frame

v1.2 §1's vocabulary stands. Rows added or changed:

| Word | Means | Not |
|---|---|---|
| **Block** | One of the kinds a day is made of. Taught on screen 2: *Orient · Morning routine · Training · Getting ready · Work · Break · After work · Free time · Wind-down*, and *Sleep* as the span between lights out and up. | section, phase |
| **Transition** | The after-work block: the hand-off between work and the evening — the drive home, cooking, dinner. One per plan. | commute (a step), break (inside work) |
| **Free time** | The evening's own hours and what the person chooses to spend them on. The activity block's friendly name. | activity (the kind's name in code), leisure |
| **Activity** | A thing to spend free time on — a walk, a call, a show, chess. A library row like a habit, `block_kind: activity`. | hobby, task |
| **Pool** | A list the day chooses from rather than does whole. The evening's pool is *Evenings A*. | menu, options |
| **Link** | A thing to open from the morning — a playlist, a track, a page. A title and a URL. | bookmark, integration |
| **Usually** | A work-day value: planned as work; *Not working today* is one tap away. | most weeks (the body line), always |
| **Work on this day** | The plan's own work block: kind, hours, what gives. The person never meets the word *type*. | work-day type, template |

Retired as first-run nouns: *work-day type*, *focus* (both stay in Settings).

---

## 2. Guardrails

v1.2 §2 stands whole, including guardrails 4 (optimistic by rule) and 5 (save as you go). One addition:

6. **The sequence never blanks.** A route transition shows the frame's skeleton; a list fetching shows skeleton rows in the list's own shape; the primary shows its pending state while the next screen loads. Nothing a person taps produces a white screen (R63).

---

## 3. The plan model, as design

v1.2 §3 stands except as amended here. §3.5 (versions), §3.6 (fixture kinds), §3.7 (training), §3.9 (rarely), §3.10 (the room), §3.12 (passages) carry forward; §3.8 and §3.13 are rewritten; §3.14–§3.17 are new.

### 3.1 Blocks — amended

v1.1 §3.1's eight kinds gain a ninth, **transition**, and two friendly names. The table a person meets on screen 2:

| Kind (code) | Word on the person's screens | What it holds | How it is anchored |
|---|---|---|---|
| `orient` | Orient | The reading and the lines | At wake |
| `morning` | Morning routine | The habits, against the room | Forward, after orient |
| `training` | Training | A workout, with its travel | Placed: before or after the routine, midday, after work |
| `prep` | Getting ready | The steps before work | Backward to *working by* |
| `work` | Work | The container; fixtures inside | *Working by* to *until about* |
| `break` | Break | A break or a meal inside work | Floats inside work |
| `transition` | After work | The hand-off: home, cook, eat | Forward from the end of work |
| `activity` | Free time | The evening's fixtures and the pool | After the transition, before wind-down |
| `wind_down` | Wind-down | The habits, the lines, phone away | Backward to lights out |

Sleep is not a block; it is the span from lights out to up, drawn on the primer and the review as the quiet band at both ends.

**Block hues (R47).** Each kind has a hue, keyed by name onto the category scales so no new colour enters the palette: `orient` slate · `morning` leaf · `training` clay · `prep` amber · `transition` amber · `work` sky · `break` moss · `activity` plum · `wind_down` rose · sleep neutral-200. A band's wash is the 100 step; its label the 700 on it (the chip pairing, which passes AA). Hues appear on the primer, the builder's two progress screens and its review, and the week — planning surfaces where the person has bandwidth. **They never appear on the Today tab or the Schedule**, which keep their monochrome bands; the execution tabs' rule that colour is punctuation stands. `[PROPOSED — needs sign-off]` the kind-to-hue mapping; the mechanism (a wash and a label, planning only) is ruled.

### 3.8 Work: the plan's own — rewritten

A day plan carries its work (R46): a **kind** (*Remote · Coworking · Office or site · Other*, each with its default glyph), *working by*, *until about*, and *what gives* (*Work waits · The routine gets cut · Depends on the day*). On disk this is still a `templates` row of kind `work` (TD-14's four columns), but the plan owns it: created with the plan, named after it, archived with it (TD-23). Nothing asks the person to name a type or to say whether their days share one; two plans with the same hours simply have the same numbers. The profile's three anchor columns (`work_start_time`, `work_end_time`, `anchor_direction`) are the first plan's values, written when the profile has none, and remain the defaults a day with no plan reads.

*Working today* on a *Rarely* day (v1.2 §3.9) offers the plans that have work, by the plan's name — *Working today · as Day A* — and applies that plan's work template. *Not working today* on a *Usually* day is the reverse (§3.9).

**Focus (R55).** A focus is what the work is about. It is not asked at first run. The builder's work screen carries one muted line: *Work is a block of time here. What happens inside it lives in your work tools.* Settings → Your day → Focuses keeps screen 12's cards; the week build keeps its focus row; `days.work_focus_habit_id` keeps its meaning.

### 3.9 Day shapes — amended

v1.2 §3.9 stands. *Usually* (R49) is a fifth work-day value between *Always* and *Sometimes*: the day is planned as a work day and the pick does not ask; the day header sheet offers **Not working today**, which is `removeWorkType` (RUN-6) — the work block goes *not today*, its items *not assigned*, the day's anchors revert to the profile's, and the evening re-flows. *Always* keeps its meaning: never asked, and the row is not offered. The disclosure on screen 3 says all five.

### 3.13 Day plans — rewritten

A **day plan** is a named day. It holds:

| Part | What it is | Where it comes from |
|---|---|---|
| Name | *Day A*, renameable; an optional emoji | B1 |
| Weekdays | The days this plan applies to; a weekday belongs to at most one plan | B1 |
| Times | *Up at · Lights out · Phone away* — the plan's own | B2 |
| Work | The plan's own work block: kind, *working by*, *until about*, *what gives* — or *No work on this day* | B3 |
| Training | Which workouts, each with a placement (and its travel, if planned) | B4 |
| Getting ready | A prep template — *Getting ready A* — its steps in order with lengths | B5 |
| Fixed events | The weekday fixtures that apply, and any excluded | B6 |
| Morning routine | A morning template — *Morning routine A* — its habits with lengths, against the room | B11 |
| Wind-down | A wind-down template — *Wind-down A* — its habits in order, *A few lines* and *Phone away* placed | B12 |
| Breaks | Habits placed inside work, at a time or *Midday*; a meal is a break | B13 |
| After work | A transition template — *After work A* — its steps in order | B14 |
| Free time | An activity pool — *Evenings A* — the activities this day chooses from | B16 |

The five lists are ordinary block templates with names; a second plan can pick *Getting ready A* rather than build *Getting ready B* — the reuse v1.2 §3.13 established. A plan is a row of references and times, not a copy of anything; *used by Day A, Day B* stands.

**What a plan does.** Unchanged from v1.2 §3.13: the week build pre-fills each weekday from its plan; *Set from the plan* sets that day; *Build each morning* opens the pick with the plan's choices preselected. Two additions: the after-work transition materialises as one `transition` block forward from the end of work (or of after-work training); the free-time pool materialises as a pooled `activity` block whose contents the pick or the day chooses (§3.16).

### 3.14 Fixed events — a place and travel

*New (R51).* A fixture gains **where** — *Here · Away* — and, for *Away*, a **location** line (free text, 1–80, optional even when away), **getting there** and **getting back** (two lengths, default 0), and **plan for the travel** (on). When the travel is planned the day carries three rows — *→ Clinic · 20* · *Physio · 45* · *← Home · 20* — the fixture's glyph on the middle one, a plain arrow on the others; the travel rows are items in their own right, droppable alone, never added to the fixture's length (TD-12 reused whole). The location line is a fact the row shows in its sheet; nothing reads it. Google Places and a map are phase 2 (P2-19).

### 3.15 Training — several on a day

*Amends v1.2 §3.7 (R52).* A plan may place several workouts; each has its own placement. Two with the same placement stack in the order they were chosen, each with its own travel rows. There is no *all at once · spaced out* question: the placements are the answer, and the order inside a placement is the list's order. The materialiser writes one training block per placed workout, keyed by workout, so two before-the-routine workouts are two bands, in order (TD-24).

### 3.16 Free time — the library and the pool

*New (R50).* An **activity** is a library row like a habit (`type: habit`, `block_kind: activity`) with a glyph, a name, a range, and *how much it matters* — the same card as a morning habit, without versions. The starter library (§12.4) offers them grouped; nothing is preselected; *Add your own* opens *A free-time activity*.

A plan's **free time** is a **pool** — an activity template of structure `pool` named *Evenings A* — holding the activities this day chooses from, in rank order. At materialisation the activity block is **pooled** (v1.1 §11.7's state, already there): its fixtures land as pins; its pool waits. Under *Set from the plan*, *Start the morning* sets the day with the activity block still pooled, and the block's row on the Today tab reads *Choose when you're there* with the pool one tap away — the evening is decided in the evening. Under *Build each morning* the pick gains a section, *Free time*, with the pool as `SelectRow`s, nothing preselected, *Decide later* as the default. The room line for the evening — *2 h 15 between after work and wind-down* — reads on the builder and the pick; nothing about the evening is scored.

The premise, in Taylor's words: *otherwise the default is free time, therefore Netflix*. The pool is the menu that makes the default a choice. The observation that would make it more — *you chose this four days running* — is a Review surface and phase 2 (P2-20); nothing in v1.3 counts or comments.

### 3.17 Links

*New (R53).* A **link** is a title (1–80) and a URL (https only, ≤ 2048), with a **kind** the app derives from the host — `spotify` for `open.spotify.com` and `spotify:` URIs, `other` for anything else — and a sort order. Links are the person's; nothing reads them but the orient frame and Settings. On the frame a link is a callout the person taps to open the thing in a new tab (the Spotify app intercepts its own links on a phone). Several links; each removable where it was added.

---

## 4. First run, screen by screen

*Replaces v1.2 §4.1–§4.14. Five screens: the shape of the week; how days are built; which days are work; your days — the builder, where every part of a day is met inside that day; your week. Progress reads "n of 5" outside the builder; inside, the builder's own caption. Everything after screen 1 is skippable and revisitable from Settings → Your day. A person in a hurry builds one day with the defaults and skips the libraries in under ten minutes; Taylor builds three days in twenty-five. Stated as the target; to be timed on the first three real users.*

**The frame, once.** v1.2 §4's frame stands: `StepFrame`, the caption top-left, *Finish later* top-right, the heading, one paragraph, the content, the action row pinned above the safe area with the primary on the right and *Skip for now* on the left where allowed. Two additions: the **skeleton** (R63) — a route transition renders the frame with skeleton rows of the arriving screen's shape until the data is there; and the **back** — every screen inside the builder shows *Back* as ghost text on the action row's left beside the header arrow, so forward and back are both in thumb reach (T13.3).

**The frame rules (R43), amended once:**

- **Pre-filled fields show value + Change** with **Done**; **revealed fields have Remove**; **empty states are left-aligned and in the flow**; **lists append**; **a sheet is scoped to its screen's block**; **selection is a row** — all as v1.2 wrote them.
- **Selection is one grammar (R56):** a chosen `SelectRow` or `LargeTargetRow` is `bg-surface`, a 1.5px `border-ink`, and a check at 20px in the trailing slot; the text stays ink; hover on an unchosen row is `bg-surface` alone. The ink fill (`bg-primary`) is the primary button's and the `Stepper17` cell's, nowhere else.
- **Cards collapse in place (R57, R58):** *Done* collapses a setup card to two lines — glyph · name · *Edit* on the first, the facts as a caption on the second, wrapping to two lines at most — and the card stays where it was; focus moves to its *Edit*. Nothing sinks.
- **Steppers move by one (R62):** the buttons step by one; the field accepts an empty value and shows *0* as its placeholder; the write is on blur; typing never snaps mid-word.
- **Every "what does each choice do?" is an `InfoDisclosure` (R60).**
- **Every fact writes when entered (R30).**

**On desktop, once.** The frame centres in the 720px content column; sheets become the 420px right panel; `SelectRow` lists run in two columns from 720px. The primer's example day and the review strip take the 960px canvas.

### 4.1 Screen 1 — The shape of your week

v1.2 §4.1 stands whole, with the selection grammar of R56: the live card is chosen — surface, ink border, check — and the three grey cards are as they were. Stores `users.schedule_shape`.

### 4.2 Screen 2 — Days are built in blocks

*New (R47, G2).*

**Who is here, in what state.** Someone who has just said what kind of week they have and is about to be asked, screen by screen, to build a day. One minute of patience for a picture.

**The one job.** Give the person the vocabulary the next screens use — *a day is blocks; here is one* — so nothing later has to explain itself.

**What you see.** Heading: *Days are built in blocks.* Body: *Nine kinds. Every day uses some of them. Here is one day, as an example.* Then the **example day**: a `ScheduleAxis` from 7:00 to 7:00 the next morning at a compact scale (`pxPerHour` 28, so the whole day fits one phone screen with the sleep band shortened), a `BlockBand` per block with its **hue wash and its name inside the band's top edge** — *7:00 Orient · 7:05 Morning routine · 8:00 Training · 9:00 Getting ready · 9:30 Work · 3:00 Break · 3:15 Break · 3:45 Work · 7:00 After work · 7:30 Free time · 9:00 Wind-down · 10:30 Sleep*. The bands carry no items; the axis has no now line. Beneath, the **legend** as a two-column list of nine rows: a 12px hue swatch, the block's word in weight 500, one line of secondary text — *Orient — the reading and the lines.* · *Morning routine — the habits, as much as fits.* · *Training — a workout, with the travel.* · *Getting ready — what has to happen before work.* · *Work — the container.* · *Break — a break or a meal inside work.* · *After work — the hand-off: home, cook, eat.* · *Free time — the evening, chosen from a pool.* · *Wind-down — back from lights out.* Primary: *Continue*. No skip: the screen is one read.

The example is Taylor's own day, as data in `@syn/constants` (§12.4), not a live plan; it never changes with the person's answers.

**What it must never do.** Ask anything. Animate. Read as the person's day — the caption above the axis says *An example.* in muted text.

**Spec.** `ScheduleAxis` (compact scale, no now line) + `BlockBand` with a new `hue` variant (§10.2) + a `BlockLegend` list (feature-local). The bands' wash is the kind's 100 step; the in-band label is the 700. Desktop: the axis at 960px, the legend beside it in a second column.

### 4.3 Screen 3 — Work days

v1.2 §4.2 stands with three changes:

- **Five values (R49):** the `Select` reads *Always · Usually · Sometimes · Rarely · Never*. Mon–Fri preselected *Always*, Sat and Sun *Never*.
- **The control is the `Select` primitive**, anchored to its trigger, not the native `<select>` — the native menu opens where the OS puts it (T2.1).
- **The disclosure is an `InfoDisclosure` (R60):** the info glyph and *What does each choice do?*; open, five lines with the value in weight 500 and the definition after it:
  - *Always — a work day. The morning is built around it.*
  - *Usually — a work day, most weeks. "Not working today" is one tap away in the day's menu.*
  - *Sometimes — the morning asks, "Working today?" and builds from the answer.*
  - *Rarely — planned as a day off. "Working today" is one tap away in the day's menu if it turns out otherwise.*
  - *Never — a day off. Nothing about work is asked.*

Stores `users.work_days` with the fifth value. Primary: *Continue*.

### 4.4 Screen 4 — Your days: the builder

*Rewrites v1.2 §4.13 whole (R45). The centre of every version since v1.2, now the whole middle of the first run.*

**Who is here, in what state.** Three screens in, holding a picture of a day in blocks, ready to build theirs. Calm enough for a run of short screens if each is obviously about one thing. The planning state; it earns depth.

**The one job.** Build a named day from its blocks, in the order a day happens, collecting each library the first time it is met; then another day, from the last; then see the week.

**The builder's frame.** Screen 4 is a list — **Your days** — with the builder as its sub-flow, as v1.2 §4.13 had it. On first arrival the list is empty and the builder opens at B1 directly, its caption *Day A · 1 of 17* under the outer *4 of 5*. The count is the screens this day will show: seventeen on the first day (it collects the libraries), eleven on a later one (it picks from them), and one fewer where there are no workouts. Every builder screen writes as it goes; leaving mid-way keeps a draft the list shows as *Day A · unfinished* with *Continue building*. **Back** is on the action row (the frame amendment above) and in the header.

**Which screens a later day shows.** B8 (the reading), B9 and B10 (the habit library and the ranking), and B15 (the activity library and its ranking) are **profile screens**: they are shown once, on the first plan, and skipped on every later plan. B11 is shown on a later plan only when *Same routine every day?* was answered *No* (R61); otherwise the plan takes the shared routine and B11 is a one-line confirmation inside B12's body. Everything else is per plan.

#### B1 — Name and days

Heading: *Build a day.* Body: *Most people have two or three. Give it a name and say which days it's for.* Under the body, one muted line on the first plan only: *If your days differ, start with the first work day of the week — the rest can start from this one.* `[COPY — Taylor's G4.1, made a line]` An `Input` **Name** prefilled *Day A* (then *Day B* …) with the emoji picker in its leading slot (blank by default). Then **Which days** as seven `WeekdayChips` (multi); on the first plan the chips for a work day *Always*, *Usually* or *Sometimes* are preselected `[DEFAULT — v1.2 §13 #19 widened by the fifth value]`; a chip held by another plan shows that plan's name beneath it and, on tap, moves with one line — *Thursday moves from Day A.* — and an inline undo. Primary: *Next*.

**Amended from v1.2 §4.13a:** the helper line; *Usually* joins the preselection.

#### B2 — Up and lights out

*New here (R64); the times of v1.2 §4.5 and §4.11, per plan.*

Heading: *Day A — when it starts and ends.* Three `TimeField`s as value + Change + Done: **Up at** (*7:00*, or the profile's), **Lights out** (*22:45*), **Phone away** (*21:45*, an hour before lights out, following lights out until touched) with its one muted line: *An hour before lights out is a common choice.* Under the three, muted, tabular: *15 h 45 awake.* Primary: *Next*.

Writes the plan's `wake_time`, `lights_out_time`, `devices_off_time` when touched; on the first plan, writes the profile's `usual_wake_time`, `lights_out_time`, `devices_off_time` too when the profile has none (R64). Nothing here is an alarm.

#### B3 — Work on this day

*Rewrites v1.2 §4.3 and §4.13b (R46).*

Heading: *Work on this day?* Two `LargeTargetRow`s as a radio: **Work** (preselected on a plan whose weekdays are all *Always* or *Usually*) · **No work on this day** (preselected when they are all *Never*; nothing preselected otherwise `[DEFAULT]`). On **Work**, beneath the rows:

- **Kind** — a `ChipPicker`: **🏠 Remote · ☕ Coworking · 🏢 Office or site · 💼 Other** — sets the work block's glyph; nothing preselected; the block reads *Work* whatever the kind.
- **Working by** · **Until about** — `TimeField`s as value + Change + Done, *9:00* and *17:30* or the last plan's.
- **When your morning runs long, what gives?** as a body-weight heading over three `LargeTargetRow`s — *Work waits · The routine gets cut · Depends on the day* — nothing preselected on the first plan; the last plan's answer on a later one `[DEFAULT]`; *Next* disabled until one is chosen.
- One muted line at the foot: *Work is a block of time here. What happens inside it lives in your work tools.* `[COPY — R55]`
- Under it, tabular: *2 h before work · 5 h 15 after.*

Primary: *Next*. Writes the plan-owned work template (TD-23): created on the first fact with the plan's name, patched per field; `work_template_id` on the plan; on the first plan the profile's three anchor columns when they are null. *No work* writes `work_template_id = null` and archives nothing.

**What it must never do.** Say *type*. Ask which weekdays share these hours. Preselect a kind.

#### B4 — Training

*Merges v1.2 §4.10 and §4.13c (R52).*

Heading: *Train on this day?* On the first plan, two `LargeTargetRow`s first — **Yes** · **Not right now** (the second skips B4 on every plan until a workout exists; Settings → Training keeps the cards) — then the rotation: `WorkoutSetupCard`s as v1.2 §4.10 wrote them (type chips, how often, usual days, length, where, the travel), in created order (R65), empty with *Nothing yet.* and **Add a workout**. Beneath the cards, once at least one exists, **On this day** as a `GroupHeading` and each workout as a `SelectRow` (glyph, name, length); selecting reveals **When** — `QuickChipRow` **Before work · Midday · After work** — and, on *Before work*, the segment **Before the routine · After it** (the first preselected `[DEFAULT — v1.2 §13 #18]`); planned travel captioned *+15 there · +15 back, beside it.* Several may be selected; two with the same placement show a small drag handle to order them. Foot: *Nothing is fixed. The morning can still swap or skip it.* On a later plan the cards are collapsed above the rows and **Add a workout** stays. Primary: *Next*; ghost *Not on this day* (clears the plan's training and moves on).

Writes `habits` (the card) and `day_plans.training` as `{ habitId, placement }[]` in list order.

#### B5 — Getting ready

*Amends v1.2 §4.13d; absorbs §4.7.*

Heading: *Getting ready.* Body: *What has to happen before work on this day, in order.* At the top, when another getting-ready list exists, the `PickerList` (*Getting ready A · 45 min* · **New list**). Then the list name in its small `Input`. Then, **on a new, empty list**, the starters — **🍳 Breakfast · ☕ Coffee · 🚿 Shower · 👕 Get dressed · 🚶 Walk · 🚌 Transit · 🚗 Drive · 🐕 Walk the dog · 🎒 School run · 🥪 Pack lunch** — as `SelectRow`s with their ranges, nothing preselected; a tick creates the step and its slot at the midpoint and the row moves into the list beneath (R30's queue per row). Under a `GroupHeading` *In order*, the list as v1.2 §4.13d: handle · glyph · title · `MinutesStepper` (by one) · `EllipsesMenu` (*One of two · Leave out on this day*) in a `SortableList`; left-out steps under a hairline as *Not on this day* with *Include*; **Add a step** beneath. Sticky, tabular: *Getting ready A · 45 min · 8:15 to 9:00*. On a *No work* day the sticky reads *Getting ready A · 45 min* and the list is offered as *Getting going* `[COPY]`. Primary: *Next · 45 min*.

**What it must never do.** Ask for a start time. Call a step a habit. Show the starters again once the list has rows (they live behind **Add a step**).

#### B6 — Fixed on this day

*Amends v1.2 §4.13g; absorbs §4.4 with R51.*

Heading: *Anything fixed on this day?* Body: *A stand-up, an appointment, a class. Things with a set time.* The fixtures whose weekdays overlap this plan's as `SelectRow`s preselected — glyph · title · *Tue · 9:30 · 20 min* · a second caption line when travel is planned: *+20 there · +20 back*; **Other days** beneath, unselected, selectable (adding this plan's days to the fixture after one confirm line); **Add one** opens the `FixtureSheet`, which gains after its kind chips and title: **Where** — a `SegmentedControl` **Here · Away**; on *Away*, **Place** (`Input`, optional, placeholder *The clinic, the studio, the office…*), **Getting there** · **Getting back** (`MinutesStepper`s, default 0), and the `Switch` **Plan for the travel** (on) with its line *Kept beside it, never added to it. Either trip can be dropped on the day.* Then, as before, `WeekdayChips`, *at*, *for*, and **In work · In the evening**. Un-selecting a matched fixture excludes it from this plan only. Primary: *Next*; *Skip for now* as ghost.

The empty state on the first plan is one muted line — *Nothing yet.* — and **Add one** full width. The sheet's kinds are a vocabulary, not a suggestion; it opens on none.

#### B7 — So far

*New (R67).*

Heading: *Day A, so far.* Body: *Up to the end of work. Tap a block to change it.* The `ScheduleAxis` at 96px/h from *up at* to *until about* (or to the end of the last placed block on a *No work* day) with a hued `BlockBand` per block so far — orient, training, the routine as an **open band** labelled *Morning routine · not built yet* in the 200 hairline (dashed, the pooled grammar), getting ready, work with its fixtures pinned inside — and slack as *12 min* in the gutter. Tap a band to jump to its screen; *Next* returns here. Primary: *Next*.

The strip is the review's (B17), cut at work's end; the same client preview through `stackBlock`, never a service.

#### B8 — First thing *(profile; first plan only)*

*v1.2 §4.6 with links (R53) and the alignment fix (T6.1).*

Heading: *What do you want to hear first thing?* Body: *Your own words, a passage you love, a quote you chose. The morning opens on it, before anything else gets in.* Then, in order:

- **Passages** — as v1.2 §4.6: the list of `PassageCard`s (handle · thumbnail · title · two-line serif excerpt · tags · menu, every element vertically centred on the row's first line — the fix), **Add a passage** → the `PassageSheet`.
- **To open** — a `GroupHeading` `[COPY]`, one muted line when empty: *A playlist, a track, a page. It opens with one tap from the morning.* Then the links as `ListRow`s — a leading **brand glyph** (the Spotify mark at 20px for a Spotify link; Lucide `Link` for any other) · the title · the host as muted detail (*open.spotify.com*) · an `EllipsesMenu` (*Edit · Remove*) — and **Add a link** (full-width secondary) opening the `LinkSheet`: **Title** (`Input`, autofocus) · **Link** (`Input`, `type="url"`, placeholder *https://…*; on paste of a Spotify URL with no title yet, the title stays the person's to write — the app does not fetch the track's name) · *Cancel · Save*. Invalid URL: one line, *That link doesn't look right.* `[COPY]`
- **A quote each day** — the `Switch` row as v1.2 §4.6, with one added caption beneath its line: *It also closes the journal, on the nights it's on.* `[COPY — R54]`
- **In the morning** — the three `Switch` rows as v1.2 §4.6.

Primary: *Next · 2 passages · 1 link* (counts where a count helps); *Skip for now* as ghost. Writes `passages`, `links`, `users.quotes_opt_in`, the three `orient_ask_*`.

#### B9 — The morning routine, the whole landscape *(profile; first plan only)*

*v1.2 §4.8 with groups (R66).*

Heading: *What do you do, or want to do, to start the day well?* Body: *Everything. It doesn't have to fit.* `Tabs` **Recommended · All**. Recommended: twelve `SelectRow`s under *Body · Mind*. **All**: the `SearchField` (its input padded so the text never touches the border — T13.2), then the whole morning library under four `GroupHeading`s — **Body · Mind · Practice · Home** — each row with its glyph and range; a search that matches collapses the groups to the rows that match, headings kept where a row remains. **Add your own** at the bottom of each tab. Primary: *Next · 9 habits*. No arithmetic; nothing preselected.

#### B10 — The morning routine, ranked *(profile; first plan only)*

*v1.2 §4.9 with R58, R59, R62.*

Heading: *How much does each one matter, and how long does it take?* Body: *Rough is fine. The morning is built from these.* One `HabitSetupCard` per selected habit **in the order they were ticked, kept**; the card as v1.2 §4.9 — the seven squares, *Usually takes* as a `MinutesStepper` **by one**, the versions — and **Done** collapses **in place** to two lines: glyph · the **matters cell** (`PriorityMark`: a 24px ink square with the number, `aria-label` *matters 5*) · title · *Edit*; beneath, the caption *usually 12 min · quick 5*. Focus lands on that card's *Edit*; the page does not scroll. Primary: *Next*.

#### B11 — The morning routine, on this day

*v1.2 §4.13e with R61.*

Heading: *The morning routine.* Body, tabular, the room stated as room: *72 min for the routine on this day — up at 7:00, orient 3, getting ready 45, work by 9:00.* (or the *No anchor* line). On the first plan: the routine name `Input` (*Morning routine A*), the ranked habits as `SelectRow`s sorted by rank — glyph · the matters cell · title · *usually 12* on the right · version tabs under the title where they exist — preselected by rank down to the room `[DEFAULT — v1.2 §13 #20]`, the `BudgetLine`, **Shorten to fit**, drag to reorder. Then, at the foot of the first plan's screen only, the question as two `LargeTargetRow`s: **Same routine every day** — *This list, wherever it fits. Days with less room take less of it.* · **It varies by day** — *Each day picks or builds its own.* Nothing preselected; *Next* waits for it (R61). On a later plan: when *same*, this screen is skipped and B12's body opens with one line — *Morning routine A · 45 chosen · 62 for the routine on this day* — and a ghost row *Change for this day* that opens B11 with the `PickerList`; when *varies*, B11 as v1.2 §4.13e with the `PickerList` (*Morning routine A · 68 min* · **New routine**). Primary: *Next · 45 min*.

Writes the morning template's slots per change; `users.same_morning_routine` once.

**What it must never do.** Say *doesn't fit*, *over budget*, *too much*. The second number is the whole feedback.

#### B12 — Winding down

*Merges v1.2 §4.11 and §4.13h.*

Heading: *How does the day end?* Body, tabular: *Lights out 22:45 · phone away 21:45.* (B2's times; *Change* returns to B2.) When another wind-down list exists, the `PickerList`. The list name `Input`. **On a new, empty list**, the starters — **📖 Read · 🤸 Stretch · 🧘 Meditate · 🛁 Bath · 🧽 Tidy the kitchen · 👔 Lay out tomorrow · 🧴 Skincare · 🍵 Tea** — as `SelectRow`s, a tick creating the habit and its slot and moving the row into the list (as B5). Under *In order*, the `SortableList` with the two placed rows in position, muted, unremovable — **✍️ A few lines · 10** and **📵 Phone away · 21:45** — and **🌙 Lights out · 22:45** fixed at the bottom; habits below the pin are *confirm in the morning*. Then, on the first plan only, under a `GroupHeading` *A few lines* `[COPY]`: the `Switch` **A few lines at night** (on), the six prompts as sortable rows, **Add a prompt**, the muted line *Around 10 minutes, before the phone goes away.*, and **A reminder** · *20:45* with its `Switch` and the caption *In your words: "A few lines · 20:45".* Sticky: *Wind-down A · starts 21:10*. Primary: *Next*.

#### B13 — During work

*v1.2 §4.13f, widened.*

Heading: *Anything during work?* Body: *A break, a meal, ten minutes away from the desk.* Empty: *Nothing yet.* and **Add a break**; the break starters as `SelectRow`s — **🚶 Walk · 🤸 Stretch · 🧘 Meditate · 😴 Nap · 🥗 Lunch away from the desk · 🍽️ Lunch · 🥪 Eat something · 👀 Eyes off screens** — plus **Something else**; a selected row reveals **When** — `QuickChipRow` **Midday · At a time** with a `TimeField` on the second. Above the list, the strip once more, cut to the work block only, at 96px/h, so a break can be seen landing `[DEFAULT — the same preview, one band]`. Primary: *Next*; *Skip for now* as ghost. Skipped is the common path; a *No work* plan skips this screen without a trace.

#### B14 — After work

*New (R48).*

Heading: *After work.* Body: *The hand-off between work and the evening — the drive, the cooking, dinner.* The strip again, cut from *until about* to *lights out*: the transition as an open band, free time open, wind-down in place, the after-work workout if any. When another after-work list exists, the `PickerList`. The list name `Input` (*After work A*). On a new list the starters — **🚗 Drive home · 🚌 Transit home · 🛒 Groceries · 🍳 Cook · 🍽️ Dinner · 🚿 Shower · 🐕 Walk the dog · 🧺 Chores** — as `SelectRow`s, a tick creating the step (`block_kind: transition`) and its slot; under *In order*, the `SortableList` with steppers. Sticky, tabular: *After work A · 40 min · 17:30 to 18:10.* Primary: *Next · 40 min*; *Nothing after work* as ghost (writes no list; the evening starts at *until about*). On a *No work* day this screen is skipped.

#### B15 — Free time, the landscape and the ranking *(profile; first plan only)*

*New (R50). Two sub-screens under one caption number, B15a and B15b.*

**B15a.** Heading: *What do you like to do with free time?* Body: *A menu for the evening, so the default isn't the default.* `Tabs` **Recommended · All**; Recommended as `SelectRow`s under *Move · Rest*; **All** with the `SearchField` under five groups — **Move · Make · Connect · Rest · Tend** — from §12.4's activity library, each row with its glyph and range; **Add your own** → *A free-time activity* (glyph, name, range). Nothing preselected. Primary: *Next · 7 activities*; *Skip for now* as ghost (the evening then holds fixtures only, and the pool is empty until Settings).

**B15b.** Heading: *How much does each one matter?* Body: *For the nights you have to choose.* One `HabitSetupCard` per activity, **without the versions row**: the seven squares and *Usually takes*; *Done* collapses in place as B10. Primary: *Next*.

**What it must never do.** Count, rank across days, or say anything about last night. Pre-select.

#### B16 — Free time on this day

*New (R50).*

Heading: *Free time on this day.* Body, tabular: *2 h 15 between after work and wind-down.* (or *The evening, after 17:30.* when no transition). When another pool exists, the `PickerList` (*Evenings A · 7 to choose from* · **New pool**). The pool name `Input` (*Evenings A*). The ranked activities as `SelectRow`s by rank — glyph · the matters cell · title · *usually 30* — those with *matters* 4 and above preselected `[DEFAULT]`; selecting adds the activity to the pool; the order is by rank, draggable. One muted line under the list: *The evening chooses from these. Nothing here is scheduled.* Primary: *Next · 5 to choose from*.

Writes the activity template (structure `pool`) and `day_plans.activity_template_id`.

#### B17 — Day A, as it stands

*v1.2 §4.13i with hues and the what-gives row.*

Heading: *Day A, as it stands.* The whole day as the `ScheduleAxis` at 96px/h from *up at* to *lights out* with a **hued** `BlockBand` per block — the name and span inside the band's top edge — every item as a `ScheduleBlock` with its glyph and title; each workout its own band with travel as thin ends; fixtures with the anchor glyph and their travel ends; the free-time band drawn as a **pool band** — the plum wash, dashed edge, labelled *Free time · 5 to choose from*; slack as *12 min* in the gutter; sleep as the neutral band at both ends, labelled *Sleep · 22:45 to 7:00*. Under the strip, one `ListRow` — **When the morning runs long** · *Work waits* · *Change* — that opens B3's three rows inline (the plan's what-gives, confirmable here per G4.14). Tap any band to jump to its screen; tap any item for the slot sheet. Primary: **Save Day A**; ghost *Back*.

Saving lands on **Your days**.

#### Your days

The list as v1.2 §4.13 wrote it — one `DayPlanCard` per plan (two lines: glyph · name · the days as chips · menu; beneath, the muted summary *Remote · up 7:00 · work 9:00–17:30 · Upper body before the routine · lights out 22:45*), the disclosure to the five lists, *Edit · Duplicate · Delete* — with **Build another day** now **starting from the last saved plan (R68)**: `dayPlan.duplicate` on it, weekdays cleared, name *Day B*, opened at B1 with everything else pre-filled, the profile screens skipped, and each list screen opening on the `PickerList` with the last plan's list chosen. Primary: *Continue · 2 days*.

**Desktop:** the builder's screens derive in the 720px column; B7, B13, B14 and B17's strips take the 960px canvas.

**States (the builder).** draft · complete · reused-list · saving (row pulse) · failed (revert + one line) · offline (read-only, the standard line) · skeleton (R63: every screen has a skeleton of its own rows, shown while its query is out). **Edge states:** a plan whose list was archived → *This list was removed — start a new one?* with **New list**; the room negative → the *no room* line, nothing preselected; two plans race for a weekday → the service refuses the second and the chip reads *Thursday is Day A's.*; no workouts → B4 shows the cards only and its rows appear as the first card is named; a *No work* plan → B3's *No work*, B5 as *Getting going*, B13 and B14 skipped, B16's body reads *The day, after the routine.*

### 4.5 Screen 5 — Your week

v1.2 §4.14 stands whole, with hues: each weekday row carries a 12px swatch strip of its plan's blocks in order (orient · morning · training · prep · work · transition · activity · wind-down as thin hued segments proportional to their spans) beneath the summary line, so the seven rows read as seven days at a glance `[DEFAULT]`. *Unstructured* rows show no strip. The mode question and the two primaries are unchanged. Stores `users.morning_mode`; marks `first_run_completed_at`; pre-fills the current week from the plans.

### 4.6 Settings → Your day — amended

The list becomes: **Shape of the week · Work days · Your days (the plans, the builder) · First thing (passages, links, the quote, the three lines) · Morning habits (the landscape) · Ranked · Free-time activities (the landscape and the ranking) · Training (the workouts) · Standing commitments · Closing the day (the journal and its reminder; the times are each day's) · Focuses · Getting ready · Morning routine · After work · Evenings · Wind-down · Each morning (the mode) · Block order**. Retired rows: *Work start*, *Work-day types*, *Wake*. The block-kind rows open the block editor for that kind, listing named templates with *used by*; *After work* and *Evenings* are new rows of the same kind.

### 4.7 The library

v1.2 §4.17 stands. Groups: *Getting ready* (prep), *After work* (transition), *Free time* (activity) join *Morning* and *Wind-down*; each row shows its glyph; an activity's sheet says *activity*.

---

## 5. The morning

### 5.2 The orient frame — amended

v1.2 §5.2 stands, with one insertion between the reading and *Last night*:

**1b. To open (R53).** Beneath the carousel's dots, the person's links as **callouts**: each a full-width `LinkCallout` — `bg-surface`, a hairline, 12px radius, 56px minimum — with the brand glyph on the left (the Spotify mark, or Lucide `Link`), the title in row-title weight 500, the host as a caption, and an `ExternalLink` glyph at 20px on the right; the whole callout is an `<a target="_blank" rel="noopener">`. Several stack with 8px between. Absent when there are none. Tapping opens the link in a new tab and writes nothing.

Everything else in the frame — the carousel, *Last night*, the three lines, *Start the morning* — is as v1.2 wrote it. The frame still records nothing about what was read or opened.

### 5.3 The quick-pick — amended

v1.2 §5.3 stands. Under *Build each morning* the pick gains a section, **Free time**, when the day's plan has a pool: the pool as `SelectRow`s, nothing preselected, one ghost row *Decide later* preselected by default; choosing one or more sets those as the activity block's items for the day; *Decide later* leaves the block pooled (§3.16). Under *Set from the plan* the block stays pooled and the Today tab's activity section shows *Choose when you're there* with the pool one tap away — a `PickerList` sheet — which adds the chosen activities to the block in place.

---

## 6. The day

v1.2 §6 stands. Additions, no new mechanics:

- The after-work transition renders as a block section *After work* with its items, between work and free time.
- A pooled activity block renders as v1.1 §11.7's pooled state with the row *Choose when you're there*; chosen activities are ordinary items.
- A fixture's travel rows render as a workout's do (`→ Clinic`, `← Home`), each with its own checkbox and sheet.
- The day header sheet offers **Not working today** on a *Usually* day (§3.9) and *Working today · as Day A* on a *Rarely* day (§3.8).

---

## 7. The evening

### 7.2 The journal — amended

v1.2 §7.2 stands. After the last prompt is answered and the entry closes, on a quote-day and when the bank is opted in, the closing screen shows **one quote** in Newsreader, in quotation marks, with its attribution as a caption, under the chrome caption *A quote* — the same quote the morning showed, so the day opens and closes on one line (R54). Nothing about the entry chooses it; the app's own voice never appears around it. When the bank is off, the closing screen is as v1.1 §7.2 wrote it.

---

## 8. Review under the new model

v1.2 §8 stands. A fixture's travel rows count like a workout's. Activities chosen from the pool are items and count like any other; an evening with nothing chosen has nothing to count — *Free time* is never a miss. The transition's steps are steps.

---

## 9. Notifications

v1.2 §9 stands. No new push. The block-boundary push for the transition reads its name — *After work · 17:30* — as every block's does.

---

## 10. State matrix, tokens, accessibility

### 10.2 Component states — the new and amended components

| Component | Where | States |
|---|---|---|
| `LargeTargetRow` (amended, R56) | every radio | default (hairline) · hover (surface) · **selected (surface, 1.5px ink border, check)** · disabled (as v1.2) · focus-visible |
| `SelectRow` (unchanged grammar; the check already there) | every chooser | as v1.2 |
| `InfoDisclosure` (`@syn/ui`, new — R60) | screen 3, and anywhere a *what does this do?* is asked | collapsed (glyph + label) · expanded (surface panel; term in weight 500, definition secondary) · focus-visible |
| `PriorityMark` (`@syn/ui`, new — R59) | B10 collapsed, B11 rows, B15b collapsed, B16 rows | the number, ink square, 24px, `aria-label` *matters n* |
| `Card` collapsed summary (amended, R57) | every setup card | two lines: glyph · title · *Edit* / caption facts (line-clamp 2) |
| `MinutesStepper` · `CountStepper` (amended, R62) | everywhere | step by one · empty with *0* placeholder · write on blur · pulse · revert |
| `Select` (the shadcn primitive, on screen 3) | screen 3 | closed · open (anchored) · focus-visible · disabled |
| `BlockBand` `hue` (amended, R47) | screen 2, B7, B13, B14, B17, screen 5 | the wash at 100 and the label at 700; `pooled` keeps the dashed edge over the wash; never on `/today` or the Schedule |
| `BlockLegend` (feature-local) | screen 2 | static |
| `LinkCallout` (`@syn/ui`, new — R53) | the orient frame | default · hover (surface darkens one step: `bg-neutral-200` light / `bg-neutral-700` dark) · focus-visible · reduced-motion (no transition) |
| `BrandGlyph` (`@syn/ui`, new) | links | `spotify` (the mark, monochrome ink at 20px) · `link` (Lucide) |
| `LinkSheet` (feature folder) | B8, Settings | create · edit · invalid URL · saving · failed |
| `StepFrameSkeleton` (`@syn/ui`, new — R63) | every `/setup/*` transition | the caption, a heading bar, three `SkeletonRow`s, the action row |
| `FixtureSheet` (+ where, place, travel) | B6, Settings | as v1.2 plus *away* (the three fields revealed) |
| `DayBuilder` (amended) | screen 4 | as v1.2 plus skeleton per screen · profile-screens-skipped · shared-routine |
| `WorkoutSetupCard` (fixed) | B4 | as v1.2; the card never remounts on its first write |

**The matters cell.** `PriorityMark` is the `Stepper17` row cell at 24px: `bg-primary`, `text-primary-foreground`, the number in caption size, tabular, 4px radius. It is never interactive; the card's *Edit* is. Colour is not the carrier — the number is.

**Block hues, as tokens.** `--block-orient` … `--block-wind-down` and `--block-sleep` in `preset.css`, each an alias of the named category scale's 100 (wash) and 700 (label) steps; the utilities `bg-block-<kind>` / `text-block-<kind>-label`. No new hex. `[PROPOSED — needs sign-off]` the mapping in §3.1.

### 10.4 Accessibility — additions

- **`InfoDisclosure`** is a `button[aria-expanded]` controlling a `region`; the glyph is `aria-hidden`; the label is the accessible name; each line reads *term, definition*.
- **`LinkCallout`** is a link with the title as its name and *opens in a new tab* appended for screen readers; the brand glyph is `aria-hidden`.
- **Hued bands** keep their in-band label; the hue is never the only carrier; the 700-on-100 pairing passes AA at caption size.
- **`PriorityMark`** carries `aria-label="matters 5"`; the collapsed card's accessible name is *title, matters 5, usually 12 min*.
- **The builder's *Back*** on the action row and the header arrow are one action with one label; focus moves to the previous screen's heading.
- **The skeleton** is `aria-busy` on the frame's main region; nothing announces.
- **The `Select`** primitive announces its value and the five options; arrow keys move; Escape closes.

---

## 11. The data the screens need

*Written as needs, for Mason to shape; his rulings are TD-23 onward in the Epic 6 track. Everything stays owner-private under the standard three policies. Nothing here changes the RLS posture.*

### 11.1 `users`

| Need | Suggested shape |
|---|---|
| Five work-day values | `work_days` is a jsonb — the validator's union gains `usually`; no column change |
| The routine question (R61) | `same_morning_routine` boolean, nullable (null = not yet asked) |
| The profile's times as the first plan's (R64) | no new column; `usual_wake_time`, `lights_out_time`, `devices_off_time`, `work_start_time`, `work_end_time`, `anchor_direction` written by the first plan when null |

### 11.2 `day_plans`

| Need | Suggested shape |
|---|---|
| The after-work list (R48) | `after_work_template_id` uuid → templates (kind `transition`), `set null` |
| The free-time pool (R50) | `activity_template_id` uuid → templates (kind `activity`, structure `pool`), `set null` |
| Several workouts (R52) | no change — `training` already holds a list; the service lifts the one-per-day rule and the materialiser writes a block per entry |
| The plan-owned work (R46) | no change — `work_template_id` stands; the template's `name` is the plan's; ownership is the service's rule (TD-23) |

### 11.3 `fixtures`

| Need | Suggested shape |
|---|---|
| A place (R51) | `location` text ≤ 80, nullable |
| Travel (R51) | `travel_there_min`, `travel_back_min` smallint 0–180 default 0; `plan_travel` boolean default true — the same three as `habits` |
| Travel rows on the day | none — `day_items.origin = travel` and `parent_item_id` (TD-12) with the fixture's item as the parent |

### 11.4 `links` — new

| Column | Type |
|---|---|
| `id`, `user_id`, `created_at`, `updated_at`, `archived_at` | standard |
| `title` | text 1–80 |
| `url` | text ≤ 2048, https only (validator) |
| `kind` | enum `link_kind`: `spotify · other` — derived by the service from the host, stored so the frame does not parse |
| `sort_order` | smallint |

RLS: owner-private, the standard three. Export: added to the zip.

### 11.5 `templates`, `habits`, `day_blocks`

| Need | Suggested shape |
|---|---|
| The transition kind (R48) | `block_kind` enum += `transition`; a template of that kind flows `forward`; a habit may carry it as `block_kind` |
| Activities (R50) | none — `habits` rows with `block_kind = activity`, `type = habit`; the pool is a `templates` row of kind `activity`, structure `pool` |
| N training blocks (R52) | none — `day_blocks`' unique index is `(day_id, kind, sort_order)`; the materialiser keys training blocks by the placed workout (TD-24) |
| The transition block on a day | none — one `day_blocks` row of kind `transition`; `block_order` gains it after `work` |

### 11.6 Materialisation, restated

v1.2 §11.7 stands with these additions: after the work block (or the after-work training) the transition block stacks forward from that end; the activity block is created **pooled** from the plan's `activity_template_id` with its fixtures pinned; a placed workout is one block each, in `training` order, with its travel rows; a fixture with planned travel writes its two travel rows around its pinned item; *Set from the plan* leaves the activity block pooled; the pick's *Free time* section fills it. `stackBlock` is unchanged.

### 11.7 What is not asked for

No new notification. No column for the blocks primer (it is constants). No column for the location beyond text. No AI touchpoint: the quote after the journal is the same `cycleIndex` the morning used (RUN-4).

---

## 12. Copy register and vocabulary

### 12.1 Register

v1.2 §12.1 stands whole. The primer's legend lines and the notice line on B3 are the app's voice: no emoji, no second person on the tabs, plain present tense.

### 12.2 Vocabulary — additions

| Say | Not | Where |
|---|---|---|
| Work on this day · Work · No work on this day | Work-day type, template | B3 |
| After work | Transition (in copy), commute | B14, the block |
| Free time · Evenings A · to choose from | Activity (in copy), leisure, options | B15, B16, the block |
| Activity (the sheet's noun) | Hobby, thing | the sheet |
| Usually | Most weeks (as a value) | screen 3 |
| Not working today · Working today · as Day A | Override, switch | the day's menu |
| To open · Link · a playlist, a track, a page | Integration, Spotify (in a heading) | B8, the frame |
| Choose when you're there · Decide later | Pick, TBD | the pick, Today |
| So far · as it stands | Preview, summary | B7, B17 |
| Same routine every day · It varies by day | Static, dynamic | B11 |

### 12.3 What the product never says — additions

*Type* (for a work day), *transition* (as a heading), *activity* (as a heading), *Spotify* (in a heading or button — the glyph carries it), *four days in a row*, *balance*. The v1.2 list stands.

### 12.4 Starter libraries and curated lists, with their glyphs

v1.2 §12.4 stands for the morning, getting ready, break (widened), wind-down, workout types, fixture kinds, work-day kinds, archetypes, placed rows. Amended and added:

- **Morning, groups (R66):** *Body* — Breath work · Cold shower · Stretch · Walk · Sunlight · Water · Make the bed · Yoga · Mobility · Run · Swim · Sauna · Ice bath · Skincare · Face training. *Mind* — Meditate · Journal · Read · Gratitude · Plan the day · Pray · Visualise · Affirmations · Podcast. *Practice* — Language practice · Music practice · Write · Vocal warm-up · Draw. *Home* — Tidy · Garden · Call someone. Recommended stays the twelve under *Body · Mind*.
- **Break (widened):** 🚶 Walk 10–20 · 🤸 Stretch 5–10 · 🧘 Meditate 5–15 · 😴 Nap 15–25 · 🥗 Lunch away from the desk 20–40 · 🍽️ Lunch 20–45 · 🥪 Eat something 10–20 · 👀 Eyes off screens 5–10.
- **After work (transition), new:** 🚗 Drive home 10–45 · 🚌 Transit home 15–60 · 🛒 Groceries 15–40 · 🍳 Cook 20–45 · 🍽️ Dinner 20–45 · 🚿 Shower 5–15 · 🐕 Walk the dog 15–30 · 🧺 Chores 15–45.
- **Free time (activity), new — R50:** *Move* — 🚶 Walk 20–45 · 🏃 Run 20–45 · 🏀 Shoot hoops 30–60 · ⚽ Play a sport 60–120 · 🏹 Archery 45–90 · 🧗 Climb 60–120 · 🚴 Ride 30–90 · 🪷 Yoga 20–45. *Make* — ✏️ Draw 30–60 · ✒️ Write 30–60 · 🎵 Play music 20–60 · 🍳 Cook something new 45–90 · 📷 Photograph 30–90 · 🧶 Craft 30–90. *Connect* — 📞 Call someone 15–45 · 🍽️ Dinner with people 60–150 · 🎲 Board games 60–120 · ♟️ Chess 30–60 · 🎮 Play with friends 60–120. *Rest* — 📖 Read 30–60 · 🎬 A film 90–150 · 📺 A show 30–60 · 🎧 A podcast 30–60 · 🛁 Bath 20–40 · 😴 Nap 20–40 · 🎮 A game 30–90 · 🧘 Meditate 10–20. *Tend* — 🧺 Chores 20–60 · 🛒 Errands 30–90 · 🌱 Garden 30–60 · 🧹 Tidy 15–45 · 🔧 Fix something 30–90. Recommended: Walk · Read · Call someone · A film · Board games · Cook something new · Garden · Play a sport.
- **The example day (screen 2), as constants:** `EXAMPLE_DAY`: orient 7:00–7:05 · morning 7:05–8:00 · training 8:00–9:00 · prep 9:00–9:30 · work 9:30–15:00 · break 15:00–15:15 · break 15:15–15:45 (*Lunch*) · work 15:45–19:00 · transition 19:00–19:30 · activity 19:30–21:00 · wind_down 21:00–22:30 · sleep 22:30–7:00. Taylor's own (G2).
- **Link kinds:** `spotify` (hosts `open.spotify.com`, `spotify.link`, scheme `spotify:`) · `other`.
- **Block words and legend lines** (§4.2) live in the primer's `copy.ts`; `BLOCK_KIND_WORDS` in `@syn/constants` gains `transition: "After work"` and changes `prep: "Getting ready"`, `activity: "Free time"`.

Where the same noun appears in two blocks (Walk, Read, Meditate, Stretch, Shower, Cook, Chores, Call someone) it carries the same glyph.

---

## 13. Open items and defaults

| # | Label | What it is | Where | My default |
|---|---|---|---|---|
| 31 | `[PROPOSED — needs sign-off]` | The kind-to-hue mapping for block bands. | §3.1, §10.2 | orient slate · morning leaf · training clay · prep and transition amber · work sky · break moss · activity plum · wind-down rose · sleep neutral-200 |
| 32 | `[DEFAULT]` | B3 preselects *Work* when every weekday is *Always* or *Usually*, *No work* when every weekday is *Never*, nothing otherwise. | §4.4 B3 | as written |
| 33 | `[DEFAULT]` | A later plan's *what gives* preselects the last plan's answer. | §4.4 B3 | as written |
| 34 | `[DEFAULT]` | B16 preselects activities with *matters* 4 and above. | §4.4 B16 | as written |
| 35 | `[DEFAULT]` | B13 and B14 show the strip cut to their span above the list. | §4.4 | as written; drop if it crowds 375px |
| 36 | `[DEFAULT]` | Screen 5's rows carry a proportional hue strip of the plan's blocks. | §4.5 | as written |
| 37 | `[OPEN]` | Whether the after-work transition should be several blocks (Taylor's *little blocks throughout the day*), or whether one after work plus breaks inside work covers it. | §3.1, R48 | one; revisit when a real day needs a second |
| 38 | `[OPEN]` | Whether the free-time pool should be chosen the evening before (at the journal) rather than in the morning or on arrival. | §3.16 | on arrival; the pick under *build* is the second door |
| 39 | `[OPEN]` | Whether links belong on the wind-down screen too (a sleep playlist). | §3.17 | morning only in v1.3 |
| 40 | `[COPY]` | B1's helper line, B3's notice line, B5's *Getting going*, B8's *To open* and its empty line, B14's heading pair, B15a's body, B16's muted line, the *Choose when you're there* row, the invalid-link line. | §4 | as written here, for Taylor's read |
| 41 | `[DEFAULT]` | The example day's numbers. | §12.4 | Taylor's own, as given |
| 42 | `[ASSUMPTION]` | *Same routine every day* means one shared morning template referenced by every plan; the room per day decides how much of it fits, exactly as the pick already does. | §4.4 B11 | as written |
| 43 | `[OPEN]` | Whether *Usually* should also change the week build's pre-fill (planned as work with the *Not working today* row) or only the day header. | §3.9 | both — a *Usually* day pre-fills as work |

v1.2 §13's items 16–30 stand except #19 (widened by *Usually*), #26 (retired with the question), #28 (the builder's wide layout now derives per screen as §4.4's last line). Phase-2 items referenced and not built: P2-15 (messages keyed to the day), **P2-18** (a quote keyed to the entries — needs AI), **P2-19** (Google Places on a fixture's location), **P2-20** (the Review's *four days running* observation over free time). All three are new pins for `phase-2-collection.md`.

---

## 14. Convergence tests, and what to do with this

### 14.1 Tests run

- **Worst-moment:** the orient frame gains one row of callouts and nothing else; under *Set from the plan* the morning is still one button; the evening under the pool is *Choose when you're there* — one tap, one list; the builder is the planning state and earns its screens; every stepper is instant.
- **Register:** no emoji in any sentence the app speaks; the room stated as room; *free time* and *after work* where *activity* and *transition* were code words; nothing new in the second person on the tabs; the primer's legend is nine plain lines.
- **Trust:** links open in a new tab and write nothing; the quote is the morning's, attributed, never chosen by the entry; the pool counts nothing; the frame records nothing; the location line is read by nothing.
- **Alarm:** no red; block hues are washes at 100 with labels, on planning surfaces only; the execution tabs are untouched; *Free time* is never a miss.
- **Contrast:** every hued band has its label at 700 on 100; `PriorityMark` is ink on primary-foreground; the selection grammar carries a border and a check, never a wash alone.
- **State:** §10.2 covers the new and amended components including the skeleton, the fixed remount, and the shared-routine path.
- **Drift:** the primer is the Schedule's own axis, not an illustration; the legend is a list, not tiles; the callouts are surface-and-hairline, not cards with shadows.
- **Buildability:** every screen names its components and writes; §11 names every column and the one new table; TD-23 and TD-24 are the doors Mason rules on in the Epic 6 track.

### 14.2 What to do with this document

1. Taylor reads §0.3 and §13 first, then §4 against the phone.
2. Mason reads §3.8, §3.15, §3.16, §11 and rules TD-23…TD-30 in `docs/specs/epic-6-day-first-first-run/TECHNICAL-DECISIONS.md`.
3. Reeve's tickets are DAY-1…DAY-13 in that track; the fix batch (DAY-1, DAY-2) ships first and survives any flip of §13.
4. On acceptance, v1.2 gets its one-line superseded note, and Epic 5's `DEVIATIONS.md` records RUN-15's absorption into DAY-13.

### 14.3 Sign-off

Vesper — draft, not signed. Everything above traces to a walkthrough note, a clarification, or a call labelled as mine; nothing flagged open was invented silently; the two things I would argue with Taylor about are recorded as open items with my default (#37, the single transition; #38, when the evening is chosen), not as rulings.
