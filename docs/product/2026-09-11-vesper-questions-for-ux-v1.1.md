# Questions before UX spec v1.1

**From:** Vesper
**To:** Taylor
**Status:** First round answered 11 Sept 2026 (dictated, fasting, low capacity — answers are terse and I've kept them that way). Nine questions were badly framed; they're re-asked in plain scenario form in §L. Section K still waits on the app walkthrough.
**Inputs:** [`ux-spec-v1.md`](../ux/ux-spec-v1.md) · the ledger, [`2026-09-11-taylor-ux-review-notes.md`](2026-09-11-taylor-ux-review-notes.md) · the built app as of `b3e439e`.
**Companions:** [`phase-2-collection.md`](phase-2-collection.md) (everything Taylor said "phase two" to) · [`marketing-changelog.md`](marketing-changelog.md).

---

## How to read this

**Versioning, corrected.** This is **v1.1**, not v2. The product is in design iteration, not in use; each pass is an iteration version that pulls the next layer of insight out of Taylor's head. Nothing is superseded — v1 is the base, v1.1 amends and extends it, and the numbering continues.

**Phasing, corrected.** Everything in the ledger is in scope for v1.1 **unless Taylor says "phase two"**. Phase two means *not now — too much overhead until the structure exists* (modules, integrations, sets-and-reps). The phase-two items are collected in [`phase-2-collection.md`](phase-2-collection.md) so they stop appearing in these questions.

**Standing rule from this round:** mechanics first, copy later. Where a question was about wording, the answer is "later" and I'll write the copy in the spec for adjustment.

Severity: **Blocking** / **Shaping** / **Detail**, as before. Each question carries the answer as given, and a *Ruling* line stating what the spec will do with it.

---

## A. Scope and shape

**Q1 · Blocking** — Full spec or amendment layer?
**Answer:** Neither as framed. It's **v1.1** — an iteration version. Early product-design phase; nobody is using this yet.
*Ruling:* v1.1 is a full document that carries v1 forward and rewrites the sections the plan model touches; it says so in its header. v1 stays where it is, marked superseded-by-1.1, not archived.

**Q2 · Blocking** — What's in the first build?
**Answer:** Everything I'm talking about, unless I say phase two. Phase two so far: sets and reps inside workouts; deciding actual tasks for the day (Linear, ClickUp); integrations generally.
*Ruling:* v1.1 scope = the whole ledger chain + orient + journal + Schedule with dragging. See the phase-two doc for the exclusions.

**Q3 · Shaping** — Archetypes on screen 1.
**Answer:** Yes — whatever archetypes make sense, all disabled except *I set my own structure and it changes*. Name them around people if you want. Use **me** as the archetype for the live one: if it works for me it works for others. As each further archetype gets built, I'll find a real person who fits it.
*Ruling:* four cards, one live, named. Taylor is the reference user for the live one; the spec's worked examples use his actual morning.

**Q4 · Detail** — Positioning line and the landing page.
**Answer:** I like *For when your schedule is as dynamic as you are* — it's what speaks to me now and would excite me as a headline. The marketing page is barely looked at and not something we're married to. Keep a **marketing changelog** doc: as the UX changes, log what the marketing should change; when a UX version is done and warrants it, the log gets executed.
*Ruling:* [`marketing-changelog.md`](marketing-changelog.md) created with the headline as its first entry. Landing page untouched in v1.1.

**Q5 · Shaping** — Surfaces.
**Answer:** Yes, stay PWA.
*Ruling:* PWA only.

---

## B. The plan model

**Q6 · Shaping** — Block kinds.
**Answer:** Work is missing from the list. Default order: **orient · morning · body · prep · work · break · wind-down** — the order of body and prep vs work can change per person. When I said *body* I meant *training*; they can be one and the same. Also add an **activity** block before break/wind-down: lifestyle — social plans, a show with a hard start, or just Netflix. It's still logged. *What are you spending your life doing?* — so people don't only track routines and forget to live. Social plans and hard-start evening things haven't been talked about at all yet and they need to factor in. "Your habits are just where the conversation starts."
*Ruling:* Block kinds for v1.1: **orient · morning · training · prep · work · break · activity · wind-down**. Fixed vocabulary, each optional per person, order editable. *Body* is retired as a name (it meant training). Evening fixtures (a show at 8:00, dinner with a friend) are weekday fixtures or one-offs placed in *activity*; hard-start ones pin.

**Q7 · Blocking** — Pins inside a block.
**Answer:** Yes, items can be pinned to a time. The stack matters most for wellness — things sit on top of each other and can move. Appointments and hard-set things change the rules. (The "meditate at 7:30 sharp" example was bad; the question was confusing.) *Re-asked in §L.*
*Ruling (provisional):* stack by default; any item can be pinned; a pinned item is a hard anchor the stack flows around. Confirm via L1.

**Q8 · Blocking** — Re-trim live during the morning?
**Answer:** Think Google Maps — "something changed, do you want this adjustment?" But the trigger is the problem: not having checked things off doesn't mean you're behind; you may just be doing them back to back without logging. So it's an **action you take**, not something the app detects: *I'm behind — adjust the rest.* Then it asks: **do everything but shorter**, or **cut some** (by priority, it decides). Show the proposal, you approve or **swap** an item, then set. Meaty topic; ask if more nuance is needed.
*Ruling:* no live re-trim, no detection. A *Re-fit the rest* action in the day header (and offered once, quietly, when a pinned anchor is within reach) opens a three-step sheet: shorten-all / cut-some → proposal → approve or swap. This is v1's trim (§5.8) re-pointed at the remaining morning. One nuance re-asked in L2.

**Q9 · Shaping** — Vocabulary.
**Answer:** A saved morning is a **routine** — specifically a *morning routine*, a subtype of routine. *Day type* — don't like it; maybe *workday type*; show me a fleshed-out example. *One of* — sure. *Pool* — yes, and a nuance: a routine can have a **mandatory opener and closer with a pool in between** chosen by inspiration on the day. Women especially won't want rigidity — they grow through softness and flow — but everyone benefits. *Every week* — fine. **Template** — keep it; it's the most literal and clear. Adjust later if the UX makes it feel wrong.
*Ruling:* *routine* (with *morning routine*, *wind-down routine* as subtypes) · *one of* · *decide in the morning* (pool) · *every week* (fixture) · *template* kept for a saved block. Routines gain **fixed opener / pool / fixed closer** structure. The workday name is re-asked with an example in L3.

**Q10 · Detail** — Weekly counts: target or cap?
**Answer:** That's a bigger conversation — phase two. Mid-week progress and check-ins ("it's Thursday, how far through are you, what's mandatory, how do your stats look"), possibly a self-set check-in day, a cousin of the Week Review.
*Ruling:* counts are informational in v1.1. The check-in module is logged in the phase-two doc.

**Q11 · Shaping** — What anchors wind-down?
**Answer:** Lights-out, yes. Also: we've only talked about people adding their own habits — we need a **library of typical items per block** (wind-down: reading, stretching, meditating, a bath). And a **devices-off time**: prompt everyone for it — "what time do you get off your phone?" — with a line of science if they say ten minutes before bed. Bedtime is fluid and willpower is low, so a **checklist of what you actually did**, confirmed after the fact (in the moment or next morning), like Oura's *confirm yesterday's activities* — before the Day Review.
*Ruling:* profile gets `lights_out_time` and `devices_off_time`; wind-down stacks backwards from lights-out. Starter library becomes per-block. A **confirm-yesterday** step precedes the Day Review for wind-down items. The science line is copy — later.

**Q12 · Detail** — Rest days.
**Answer:** You're still doing stuff. The real question is *do you want structure on this day?* For me Sundays are the one day I make a list — but on the day, not before. So: an **unstructured day** type where you set the day on the fly, grab-and-go, but it can still carry hard items (meal prep, "write out your week").
*Ruling:* a day can be *structured* (blocks from templates) or *unstructured* (orient + wind-down only, everything else added on the day, fixtures still apply). Unstructured is a first-class day shape, not an empty day.

**Q13 · Detail** — "Sometimes" work days.
**Answer:** (covered by Q12)
*Ruling:* not working today → the day takes the unstructured shape.

---

## C. First run

**Q14 · Detail** — Screen order vs anchor direction.
**Answer:** Question was robotic. Not concerned. Practically: if *work waits*, a long breath-work session just bumps everything back — it's a post-hoc thing, not live. If *work doesn't wait*, ask what to cut.
*Ruling:* one screen order. Anchor direction only changes what the re-fit sheet (Q8) offers: work-waits → *shift the rest*; work-doesn't-wait → *shorten / cut*.

**Q15 · Detail** — Landscape screen rules.
**Answer:** Didn't understand the question. *Re-asked in §L.*

**Q16 · Detail** — Starter suggestions.
**Answer:** Fine as you think it works.
*Ruling:* Vesper writes, per block (Q11), nothing pre-checked.

**Q17 · Detail** — Overflow mode at first run.
**Answer:** Confused. What came out instead: there are two different reasons for multiple templates — (a) genuinely different schedules on different days (two jobs), and (b) the same schedule but **different morning routines for variety** across the week. Different mechanisms. Wants a fleshed-out situational example. *Re-asked in §L.*

**Q18 · Blocking** — Training: block or habit?
**Answer:** A workout can have sub-parts (warm-up, main, abs) but what matters is **what time and how long**. Onboarding collects the **list of workouts** and how many of each per week (upper, lower…) and when you typically do them. The morning menu asks: *sticking to the plan, or adjusting?*
*Ruling:* **training is a block kind** with a rotation (workouts × weekly counts × typical days), a total length, and a placement chosen at the morning pick. Sub-parts are phase two (sets/reps live there too).

---

## D. The morning

**Q19 · Blocking** — First act.
**Answer:** (a). Open the app → orient frame → quick-pick locks the day. For this archetype a schedule is already in place — Monday shows what Monday looks like from the week — and the pick is **swapping things out**, not building from scratch.
*Ruling:* opening the orient frame is the wake moment and stamps `woke_at`. The *Immediate wake up* habit is retired. The quick-pick shows the planned day with swap affordances, not blank choices.

**Q20 · Detail** — Gratitude line skippable, silent?
**Answer:** Optional, yes. "You skipped yesterday too" is cheeky and effective — fine.
*Ruling:* optional. I'll put the skip-memory line in as `[PROPOSED]` with a note: it's the first sentence in the product that comments on the person's behaviour, and the alarm test is the check. If it survives your read of the spec it ships.

**Q21 · Shaping** — Pick dismissed unfinished.
**Answer:** Didn't follow the question. Then: "you have to pick one of them for items to show up."
*Ruling:* nothing materialises until the pick is made; the List shows the day header and *Choose your morning* until then. Confirm via L4.

**Q22 · Shaping** — Finish over budget?
**Answer:** Confused; "you can probably figure that out."
*Ruling:* default stands — finishing over budget is allowed, the number is the feedback. Scenario in L5 so you can veto.

**Q23 · Detail** — Late wake and the budget.
**Answer:** Budget shrinks. And this is where anchor direction matters: work moves → everything moves back, maybe less work that day; work doesn't move → shrink the routine and anything not mandatory.
*Ruling:* as Q14.

**Q24 · Shaping** — Training placement.
**Answer:** Ask people where it fits *between blocks* — before breakfast, before lunch, wherever. My own case: before breakfast, or a micro deep-work block → workout → back to deep work (a long Claude run makes that work).
*Ruling:* placement options are the block boundaries plus *inside work*; *inside work* splits the work block. Taylor's micro-deep-work case is the worked example.

---

## E. The day

**Q25 · Shaping** — What drags.
**Answer:** Everything drags **except appointments**, which need a formal reschedule with a layer of protection so you don't move one by accident.
*Ruling:* items and blocks drag; pinned/appointment items require a confirm sheet (*Move Dentist to 3:15?*).

**Q26 · Blocking** — What a slide does to the record.
**Answer:** Didn't understand the question. *Re-asked in §L — this one matters.*

**Q27 · Shaping** — Blocks replace day parts?
**Answer:** Yes, built on blocks. **Morning / afternoon / evening → phase two** — there's neurochemical reasoning in that layer and it's easier to add once the structure exists; risk of confusion now.
*Ruling:* List sections are blocks. Day parts removed from v1.1; logged for phase two.

**Q28 · Shaping** — Work block as one row with nested items.
**Answer:** (not reached)
*Ruling:* default stands — one container row, nested rows.

**Q29 · Detail** — Plain-time anchor; morning elapsed timer.
**Answer:** Sure. New: the orient frame should have an optional **intention or theme for today** — state and declare it.
*Ruling:* plain time yes; morning timer no. Orient frame gains `intention` (one optional line) after gratitude.

**Q30 · Detail** — Edit today beyond dragging.
**Answer:** Yes — **all blocks are editable** on the day. You're not changing the base habit, you're changing the *habit-day* (the instance in the schedule). And durations must be allowed **outside the habit's range** — the current UI clamps to the range and shouldn't; "it's not like you're not allowed to meditate past thirty minutes."
*Ruling:* day-instance editing on every item; range is a default, never a clamp. **Built-app bug to log:** duration inputs clamp to the habit range.

---

## F. The evening

**Q31 · Shaping** — Shape of the evening.
**Answer:** Approach it like the morning routines. See what you come up with.
*Ruling:* wind-down is a routine (opener / pool / closer), with the confirm-yesterday checklist (Q11) and the journal as items in it. Review and journal are independent entries.

**Q32 · Detail** — Journal prompts.
**Answer:** Add *what do you want to make happen tomorrow*. Don't remove anything. Keep visualisation last.
*Ruling:* six prompts — day went · grateful for today · grateful for in life · looking forward to · **make happen tomorrow** · visualisation. Editable per person.

**Q33 · Detail** — Journal timer.
**Answer:** Phase two — too much complexity up front.
*Ruling:* no timer on the journal in v1.1.

**Q34 · Detail** — Where "you said 10 · usually 24" appears.
**Answer:** Didn't understand. *Re-asked in §L* — though with Q33 it may be moot.

**Q35 · Detail** — Journal gets no push.
**Answer:** Didn't understand.
*Ruling:* default stands — one push at wind-down start, none for the journal.

---

## G. Review

**Q36 · Shaping** — Landscape vs assigned number.
**Answer:** Not concerned right now.
*Ruling:* default — no number; plain list in Week Review.

**Q37 · Shaping** — Work block scored?
**Answer:** (not reached)
*Ruling:* default — container, never scored.

**Q38 · Detail** — Training swaps.
**Answer:** Yes. "Monday is usually upper, Tuesday lower — I want lower today → *you're trading with Tuesday*, confirm." Could carry extra logic later.
*Ruling:* swap is a two-day edit with one confirm line naming the other day.

**Q39 · Detail** — Monthly reflection.
**Answer:** Phase two. Leave anything existing as is.
*Ruling:* no monthly view in v1.1.

---

## H. Register and copy

**Q40 · Shaping** — Tab names.
**Answer:** Copy later; mechanics first.
*Ruling:* default *Today · Schedule · Review*, flagged for adjustment.

**Q41 · Detail** — First-person cards.
**Answer:** Yes.

**Q42 · Blocking** — Register on reflective surfaces.
**Answer:** (garbled) — reads as "use your judgment; I'll adjust as needed."
*Ruling:* default — bounded warmth: greeting allowed, no second person, no adjectives about the person.

---

## I. Notifications

**Q43 · Shaping** — Defaults.
**Answer:** "Not really" — unclear which part.
*Ruling:* default stands; flagged for your read of the spec.

---

## J. Integrations

**Q44 · Detail** — Calendar / Linear / ClickUp.
**Answer:** All phase two.

**Q45 · Detail** — Reserve `data_sources`.
**Answer:** (covered) — phase two, seam recorded.

---

## K. After the walkthrough

Walkthrough findings live in their own document so they can grow screen by screen: [`2026-09-12-app-walkthrough-feedback-v1.0.md`](2026-09-12-app-walkthrough-feedback-v1.0.md). First session covered first-run steps 1–2, the habit sheet, and the template editor (W1–W10). Standing direction from it: **mobile first, always** — v1.1 screen specs state the mobile layout first and derive desktop.

What the first session settles for the spec:
- The habit library holds **habits only**; appointments are fixtures/one-offs, deep work is the work block (W6 — already the v1.1 shape).
- Pre-filled first-run fields show **value + Change**, never an open control (W1).
- Selection is a **single commit**: tick = added, *Continue* saves (W4).
- The template editor is replaced by the **block editor** with resizable gaps and blocks (W8, W9 — ledger §6, §22).

**New question raised → L9.**

**Walkthrough findings:** see the feedback doc; nothing recorded here directly.

---

## L. Re-asked, plainly

Each is one scenario and one choice. Answer with the letter.

**L1 (was Q7) — pinning inside the morning.** Your morning is a stack: breath work, cold shower, journal, stretch. Now you add *call Mum at 8:00* — a thing at a fixed clock time, in the middle of the stack.
(a) The stack flows around it: whatever was going to be at 8:00 slides after the call.
(b) Fixed-time things can't live inside the morning routine; they go in as a fixture next to it, and the routine just has to end before 8:00.
*My read of your answer: (a).*

**Answer:**

**L2 (was Q8, the nuance) — "shorten everything" needs a floor.** You pick *do everything but shorter*. Meditation is 20 min with a range of 10–30. Does shortening go to the bottom of the range (10) and stop, or can it go below the range if that's what fits?
(a) Stops at the range floor; if that's still over, it falls back to cutting.
(b) Goes as low as it needs to; range is only a default.
*Your Q30 answer ("range is not a clamp") suggests (b). But "meditate for 4 minutes" might be worse than not meditating.*

**Answer:**

**L3 (was Q9/Q17) — what to call a saved work day, with the example you asked for.** Two situations:
- *Same schedule, different content.* Monday and Wednesday both work 9–5, but Monday is Viewpoint AI and Wednesday is job applications. Same shape, different **focus**.
- *Different schedule.* Someone with two jobs: Mon–Wed at the café 7–3, Thu–Fri at the studio 10–6. Different **shape** entirely.
Proposal: the first is a **work focus** (a label and a weekly count, picked per day — *Viewpoint · 1 of 2 this week*); the second is a different **work template** (different times, different fixtures). A day picks one template and one focus. Does that split feel right, and do *focus* and *work template* read correctly?

**Answer:**

**L4 (was Q21) — Monday, 7:10, you open the app, see the orient frame, then close the app without doing the quick-pick.** You open it again at 8:30. What's on the Today tab?
(a) Nothing but *Choose your morning* until you pick.
(b) Monday's planned day, already there, with a line at the top saying it's unconfirmed.
*Your answer sounded like (a). Your Q19 answer ("Monday shows what Monday looks like, you swap things out") sounds like (b).*

**Answer:**

**L5 (was Q22) — the daily menu adds up to more than you have.** You have 60 minutes before prep. You tap seven things that add up to 75. Can you just start the morning anyway with 75 chosen, or does the app make you get to 60 first?
(a) Start anyway; it shows *75 chosen · 60 available* and that's the feedback.
(b) Must fit first.
*I'm defaulting to (a).*

**Answer:**

**L6 (was Q26) — dragging a block on the Schedule, and what it means for the record.** Three things you might do with a drag:
1. Move breath work from 7:20 to 7:40, *before* 7:20 — you changed the plan.
2. It's 7:50, breath work was at 7:20 and hasn't happened — you drag it to 7:55.
3. You drag the whole morning 30 minutes later because you slept in.
In v1, the third one needs a **reason** (slept in / ran long / something came up) because the reason is what the review scores. Question: do 1 and 2 need a reason too, or is only 3 the "reasoned" one?
(a) Only 3 needs a reason. 1 is just a re-plan; 2 is just a late start; both are noted, neither is scored.
(b) All three need a reason.
*I'm strongly for (a). (b) turns the Schedule into a form.*

**Answer:**

**L7 (was Q15) — the "everything you do" list at first run.** The screen where you dump every wellness practice you'd ever want. Two questions: is there any minimum ("add at least three")? And is this the same list you'd see later under Settings → Library, or a separate onboarding-only thing?
*My defaults: no minimum, and it's the same list.*

**Answer:**

**L8 (was Q34) — probably moot now that timers are phase two.** If a habit's timers keep showing it takes 24 minutes when you planned 10, the app can *offer* to update the plan. Where? Only relevant if timers exist. Skip unless you have a view.

**Answer:**

**L9 (from walkthrough W7) — do categories survive?** In v1.0 a habit can have a category (*Wellness*, *Work*…), used only for the Week Review's *time by category* bar. In v1.1 every item already lives in a block (*morning · training · prep · work · break · activity · wind-down*), which does most of the same grouping.
(a) Drop categories; *time by category* becomes *time by block*.
(b) Keep categories as an optional second label for people who want finer grouping.
*I'm for (a) — one fewer concept in the habit sheet, and the sheet is already too long on a phone.*

**Answer:**

---

## New in this round (not in the original questions)

Logged here so they reach the spec; each has a home above.

- **Activity block** — lifestyle and social plans as a logged block with hard-start items (Q6).
- **Routine structure** — fixed opener, inspiration pool, fixed closer (Q9).
- **Per-block starter library** — typical items for each block, not just a flat starter set (Q11).
- **Devices-off time** on the profile, prompted for everyone (Q11).
- **Confirm-yesterday** checklist before the Day Review, Oura-style (Q11).
- **Unstructured day** as a first-class day shape (Q12).
- **Intention / theme for today** in the orient frame (Q29).
- **Habit-day editing** — every instance editable, range is a default not a clamp (Q30). Built-app bug logged in K.
- **Journal prompt six** — what you want to make happen tomorrow (Q32).
- **Training swap confirm** names the day being traded with (Q38).
- **Marketing changelog** as a standing doc (Q4).

## Parked, not asked

- *Want* vs *priority* as a second axis — parked by you.
- Gender difference in journal time — observe, never ask.
- The work block knowing it has "unattended stretches" — not modelled; observe first.
