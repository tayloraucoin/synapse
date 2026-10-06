# First-run walkthrough feedback — v1.2 build

**Author:** Taylor (testing notes and the spoken clarifications) · Vesper (mapping, severity, rulings) · Mason (the causes found in the build)
**Status:** Open for Mason's and Reeve's review. Session of 23–24 Sept 2026, against the build at `baed840` (RUN-13), first run screens 1–14.
**What this is:** Taylor's notes on the fourteen-screen first run **as built to the v1.2 spec**, mapped one by one to a ruling and to the section of [`ux-spec-v1.3.md`](../ux/ux-spec-v1.3.md) that now carries it; then his restructure, item by item. The engineering side — placement, data, the doors — is the Epic 6 track: [`docs/specs/epic-6-day-first-first-run/`](../specs/epic-6-day-first-first-run/).
**Precedent:** [`2026-09-16-first-run-walkthrough-feedback-v1.1.md`](2026-09-16-first-run-walkthrough-feedback-v1.1.md). Numbering here is `T<screen>.<n>` for a screen note, `G<n>` for the restructure's numbered items, `C<n>` for a spoken clarification.

Severity is mine: **Blocking** / **Should-fix** / **Consider**. Kind: *defect* (the build departs from the v1.2 text), *amendment* (v1.2 said one thing and Taylor now wants another), *addition* (v1.2 was silent), *reversal* (a ruling or a phase-2 pin is overturned — flagged so it is never re-decided silently).

---

## 0. Standing direction from this session

1. **Day-first.** The first run asks for each part of a day inside the day it belongs to; the first day collects the libraries once; later days pick (G1–G16 → v1.3 R45).
2. **Blocks are the mental model**, taught once with an example (G2 → R47).
3. **The fix batch ships first.** Everything in §1 that is a defect or a small amendment survives any flip of the restructure and is built before it (DAY-1, DAY-2).

---

## 1. The notes, screen by screen

| # | Note (Taylor) | Severity | Kind | Ruling · cause where found | Lands in |
|---|---|---|---|---|---|
| T1.1 | The selected card as full black is a bit much; think about the component against the branding kit. | Should-fix | amendment | The ink fill was right when nothing else on the screen was ink; the sticky primary is ink now, so a chosen card reads as a second button. One selection grammar for every chooser: surface, 1.5px ink border, a check — the grammar `SelectRow` already has. | v1.3 R56, §4 frame rules |
| T2.1 | The native select's options open far from the trigger. | Should-fix | defect | It is a native `<select>`; the OS positions the menu. The `Select` primitive, anchored. | v1.3 §4.3 |
| T2.2 | Add "most weeks" or similar. | Should-fix | addition | *Always* means the plan never moves; *Sometimes* asks. Taylor works most Saturdays and skips a Friday for a hike now and then (C3). *Usually*: planned as work, *Not working today* one tap away. | v1.3 R49, §3.9 |
| T2.3 | Make the "What does each choice do?" a reusable, standardised component with an info glyph and differentiated text. | Should-fix | amendment | `InfoDisclosure` in `@syn/ui`: Lucide `Info` with the label; open, a surface panel of term-and-definition lines. Not an emoji (R29). | v1.3 R60, §10.2 |
| T3.1 | The dark selected state is confusing beside the button. | Should-fix | amendment | As T1.1. | R56 |
| T3.2 | Kinds of work day (remote etc.) should be available on the one-only path too. | Should-fix | amendment | Moot under R46: every plan has its work with a kind; the one-type question is gone. | v1.3 R46, §4.4 B3 |
| T3.3 | Collapsed types with the time beneath the name, muted, more like a card. | Should-fix | amendment | Yes — the one-liner truncates at 375px in the screenshots. Two lines for every setup card. | v1.3 R57 |
| T4.1 | The copy should say these are fixed-schedule things, not routine items. | Should-fix | amendment | B6's heading and body: *Anything fixed on this day? A stand-up, an appointment, a class. Things with a set time.* | v1.3 §4.4 B6 |
| T5.1 | Wake should differ by day of week; add sleep here for the full cycle. | Blocking | amendment | The times move into the day: *Up at · Lights out · Phone away* per plan, on B2; the profile's are the first plan's. v1.2 R39's one wake is superseded by per-day wakes, not by a range. | v1.3 R64, §4.4 B2 |
| T6.1 | Elements inside a saved passage are not centred. | Should-fix | defect | `PassageCard` aligns its row to `items-start`; the handle and menu sit above the title's baseline. Centre on the first line. | DAY-2 |
| T6.2 | CRUD links to Spotify playlists; rows that open the playlist. Several; a callout, like Notion; the Spotify icon per row; playlists or tracks (C6). | Should-fix | addition | A `links` table; *To open* on B8; callouts on the orient frame with the Spotify mark for Spotify hosts. | v1.3 R53, §3.17, §5.2 |
| T7.1 | Steps differ by day: breakfast on a training day, yoga and a fast on a rest day, transit on an office day. | Blocking | amendment | The getting-ready list is per plan already (13d); the global screen 7 was the problem. Under day-first the starters appear inside B5 on a new list, and each plan has its own or picks another's. | v1.3 §4.4 B5 |
| T8.1 | Love the search. | — | — | Kept. | — |
| T8.2 | The items need grouping. | Should-fix | amendment | *All* grouped *Body · Mind · Practice · Home*; Recommended stays *Body · Mind*. | v1.3 R66 |
| T9.1 | Steppers jump by 5; make it 1; cannot delete to empty; empty should show 0 as placeholder. | Should-fix | amendment | The cards pass `step={5}` and the handler ignores an empty field. By one; empty allowed with a *0* placeholder; write on blur. | v1.3 R62 |
| T9.2 | Done scrolled oddly and moved the card to the bottom; it should stay put, collapsed. | Should-fix | reversal | R43's *open cards stay above collapsed ones* did this on purpose, and the focus move to the sunk card's *Edit* is the scroll. Reversed: collapse in place. | v1.3 R58 |
| T9.3 | A "5" between the emoji and the name instead of "matters 5" — good move? | Consider | amendment | Yes, as the chosen cell in miniature (`PriorityMark`), so the number is self-labelling; never a bare digit. | v1.3 R59 |
| T10.1 | Keystrokes or selects closed the workout being edited as if Done was tapped. | Blocking | defect | `SetupCards` renders a draft card keyed `draft-N`; when the first write lands and the row arrives, the draft is dropped and the row's card mounts with `initiallyOpen` false. The card must keep its identity across its first write. | DAY-2 |
| T10.2 | Something unselects *Usual days*. | Should-fix | defect | The same remount: a fresh card sends `typicalDays: []`, the server reads it as flexible, and the remounted card shows *Flexible*. Fixed with T10.1; a card with no days chosen sends `null` explicitly only when *Flexible* is on. | DAY-2 |
| T10.3 | Workouts in created order, not alphabetical; or a sort setting. | Should-fix | amendment | `listHabits` sorts by category then title for the library. Setup lists read created order. No sort menu. | v1.3 R65 |
| T10.4 | A delay before data loads on return; loading UI everywhere. | Should-fix | defect | The step page is a Server Component awaiting its queries with no `loading.tsx`; client lists show `SkeletonRow`s but the route transition shows nothing. A frame skeleton per route transition; pending on the primary. | v1.3 R63, §2 guardrail 6 |
| T11.1 | Also add custom messages to read, and quotes; the quote generated after the journal entries. | Consider | addition | Custom messages are passages (B8). The generated quote needs the AI the product does not have (C7): phase 2, P2-18. In v1.3 the morning's bank quote closes the journal on quote-days. | v1.3 R54, §7.2 |
| T12.1 | The emoji input is misaligned with the input. | Should-fix | defect | `FocusSetupCard`'s header aligns to the bottom and the first card's helper line pushes the input up. Fixed even though the screen leaves first run (Settings keeps it). | DAY-2 |
| T12.2 | Quick-click types with emoji for focuses. | Consider | — | Moot under T12.3. | — |
| T12.3 | Remove the step; work tasks live in other tools; this is about allocating time (C8). | Should-fix | reversal | Focus leaves first run; a notice line on B3; Settings and the week build keep it. | v1.3 R55 |
| T13.1 | My day took a while to load; confusion. | Should-fix | defect | As T10.4, plus the builder's own per-screen skeletons. | R63 |
| T13.2 | The search input's border is against its value. | Should-fix | defect | Padding on the `SearchField`'s input. | DAY-1 |
| T13.3 | No way to navigate forward and back through the days' screens. | Should-fix | amendment | *Back* as ghost text on the action row beside the header arrow, every builder screen. | v1.3 §4 frame |

## 2. The restructure (G1–G16), item by item

| # | Taylor's item | Ruling | Lands in |
|---|---|---|---|
| G1 | Set work structure first; it decides the rest. | Screen 1, unchanged. | §4.1 |
| G2 | A "days are built in blocks" primer with an example day as coloured blocks, like a calendar day view. | Screen 2: the example day on the Schedule's own axis, hued bands, a legend. Hues on planning surfaces only. The example is Taylor's day. | R47, §4.2, §12.4 |
| G3 | Which days do you work. | Screen 3, with *Usually*. | §4.3 |
| G4 | "We will start building your first day now" with the helper about the first work day. | The builder is screen 4; B1 carries the helper on the first plan. | §4.4 B1 |
| G4.1 | Choose *usual day* vs *days of week*, then which days. | The weekday chips already are that choice: a plan with no weekdays is a usual day nobody is assigned to; with chips it is those days. No extra control. `[DEFAULT]` | B1 |
| G4.2 | Wake and sleep first. | B2. | R64 |
| G4.3 | Ideal start and clock-out. | B3, the plan's own work, with kind and what gives. | R46 |
| G4.4 | Log all workouts, select which go on this day; all at once vs spaced out; each to a block. | B4: the cards, then the rows with a placement each; same placement stacks in order; no *all at once* question. Several per day. | R52, §3.15 |
| G4.5 | Transition things before and after work, including meals. | B5 (getting ready) and B14 (after work); a meal inside work is a break (B13). | R48 |
| G4.6 | Fixed events with type, location and transit. | B6 with *Where · Place · Getting there / back*. Google Places is P2-19. | R51 |
| G4.7 | Progress: the day so far, coloured. | B7. | R67 |
| G4.8 | "Every day begins with a spark of momentum" — the orient page as is. | B8, the heading kept as v1.2's (*What do you want to hear first thing?*); Taylor's sentence is a register Vesper keeps out of the chrome, as v1.2 §4.6 explained. | B8 |
| G4.9 | Habits as now; then, given x minutes, add a morning block; same every day vs varies; results saved as *Morning Wellness Routine A*, renameable. | B9, B10, B11; the same/varies question once; *Morning routine A* (the v1.2 name; *Wellness* is not in the vocabulary). | R61 |
| G4.10 | How the day ends, as now. | B12. | B12 |
| G4.11 | Progress; schedule breaks and meals in the work day. | B13, with the work band above. | B13 |
| G4.12 | Progress; after work: x hours between off work and wind-down; choose activities. | B14 (the transition) and B16 (this day's pool), with the evening room line. | R48, R50 |
| G4.13 | Favourite activities, like habits, recommended and all, with a priority. | B15a and B15b. Reverses v1.2 §12.4's *suggests nothing*. | R50 |
| G4.14 | Review and edit; set *does work move* here. | B17 with the what-gives row. | B17 |
| G4.15 | Another day, pre-selected to the last; routines as a list to choose from, new ones pre-selected to the every-day ones. | *Build another day* duplicates the last (references), clears the weekdays; list screens open on the picker with the last plan's list chosen; a new routine preselects by rank as before. | R68 |
| G4.16 | Review all days as a week. | Screen 5, with a hue strip per row. | §4.5 |

## 3. The clarifications (C1–C8), for the record

- **C1** Remote — Training Day and Remote — Rest Day differ by half an hour of morning; the office day adds transit. → Those are day plans, not work-day types; a plan owns its hours (R46).
- **C2** Transition means the space-fillers between registered blocks: meals, the drive, ten minutes. → One after-work transition block; meals inside work are breaks; several transitions is open item #37 (R48).
- **C3** *Always* means always the plan; most Saturdays but not all; a Friday off for a hike. → *Usually* (R49).
- **C4** Free time is a menu — walk, socialise, a call, reading, basketball, a sport, archery, chess — so the default is not Netflix. → The activity library and the pool (R50). The *four days running* observation is P2-20.
- **C5** Location and transit on fixed events so travel time lands; Google Places later. → R51; P2-19.
- **C6** Links: a playlist or a track; several; callouts; the Spotify icon; a name per link. → R53.
- **C7** Generated quotes are not phase 1; the idea reads the calendar and the entries. → R54 now; P2-18 later.
- **C8** Work tasks live in other tools; this allocates time; a notice is fine. → R55.

## 4. Reversals, in one table for the log

| Reversed | Was | Now | Where |
|---|---|---|---|
| v1.2 R32 (types as a chooser) | A plan picks a work-day type | A plan owns its work | R46 |
| v1.2 R39 (one wake) | One wake for all days | A wake per plan | R64 |
| v1.2 R43 (collapsed cards sink; one line) | Sink beneath open; one truncated line | In place; two lines | R57, R58 |
| v1.2 §12.4 (activity suggests nothing) | No starters for the evening | The free-time library | R50 |
| v1.1 §9.7 (`LargeTargetRow` ink fill) | Ink fill on the selection | Surface, ink border, check | R56 |
| v2 handoff §5.4 (stepper by five) | Five by button | One | R62 |
| RUN-5 deviation (one workout per day) | One placed workout | Several | R52 |
| v1.2 §4.12 (focus at first run) | Screen 12 | Settings only | R55 |
