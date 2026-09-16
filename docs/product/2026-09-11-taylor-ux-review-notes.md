# UX review notes — 11 Sept 2026

**Author:** Taylor (notes, dictated) · Claude (reflections)
**Status:** Working notes. Nothing here is a ruling. Points are logged as spoken; each has a reflection beneath it that says what the spec already covers, what would be a model change, and where the tension is.
**Context:** first pass over [`ux-spec-v1.md`](../ux/ux-spec-v1.md) with the product-as-a-whole in mind, not just the owner's own use. Deeper review to follow.

---

## 1. First run — ask about the shape of the week before anything else

**Taylor's note**

- The first question should be: *do you have any fixed, hard parts of your schedule?* Effectively, what is your work schedule?
- Archetypes, roughly:
  - Regular shifts, consistent week to week.
  - Hard-set shifts that change (hospital worker, restaurant).
  - You control your own hours, with approximate start and stop.
  - Completely fluid (creative work).
- This is the foundation for a lot of what follows — a hospital worker on drastically different times is a very different use case from someone with a structured, consistent routine.
- Right now the flow jumps straight to the user already having all the answers. That's useful for me, but not for building this out for other people.

**Reflection**

- The spec's first-run (§4.2) seeds exactly one thing — `anchor_time` from a wake target — and everything else is authored from scratch. It's a configuration flow, not a discovery flow. This note is asking for one discovery question up front, whose answer *shapes* the configuration that follows. That's a real gap, and it's cheap to add: one screen, one segmented choice.
- The archetype maps almost directly onto machinery that already exists:
  - **Consistent shifts** → hard, fixed-time slots in a template; `typical_days` does the rest.
  - **Hard but varying shifts** → the week build's per-day `anchor_time` override (§4.5) already lets each day start at a different clock time. What's missing is a *second* anchor: the wake anchor moves the morning; nothing today moves the "work starts" point independently. See §5 below (chunks) — this is the same problem.
  - **Self-controlled, approximate** → soft scheduling and windows (`time_mode: window`) are built for this.
  - **Fluid** → mostly `unscheduled` items and the Plain List's "Anytime" section.
- So the archetype isn't a new data concept; it's a *routing* choice for the rest of first-run. A hospital worker's step 4 ("This week") should open with "enter your shifts" before "pick a template". A fluid worker should barely see fixed times at all.
- Worth storing the archetype on the user (`schedule_shape` or similar) even if only first-run reads it now — it's the kind of field a future weekly reviewer would want.

## 2. Wake time as a range, and its dependence on shifts

**Taylor's note**

- Ask what time they want to get up — or what their *range* of wake-up time is.
- How is that influenced by their shifts? Varying-shift workers can't have one wake target.

**Reflection**

- Habits already carry a range (`duration_min`/`duration_max`); the wake target is a single value. Making the wake target a range is consistent with the rest of the model, and the Plain List already tolerates a moving `woke_at` because day parts recompute from it (§6.4).
- The stronger idea in this note is the *dependency*: for shift-driven days, wake time should be **derived** — shift start minus the length of the morning block — rather than entered. That only works once the morning block is a thing of its own (see §5). Until then, the per-day anchor override is the manual version of it.
- Open question to settle: which is the primary anchor on a shift day — the wake anchor or the shift start? The spec makes wake primary everywhere. For a varying-shift worker the shift is the fixed point and wake follows from it.

## 3. Walking through the morning routine, and the "it doesn't fit" moment

**Taylor's note**

- Everybody has a morning routine. Walk through it: what do you want to do in the morning, assign each thing a priority and a time. Things you simply have to do (shower every day) included.
- Then, maybe not first-order: *you have more in your morning than fits — how do you want to approach that?* Get up earlier? Put some things on different days of the week?

**Reflection**

- The spec's template editor footer already computes the fit number ("07:00 – 09:35 · 155 min") and deliberately offers no judgement (§4.4: "the number is the feedback"). This note asks for the next step — when the number exceeds the available span, offer the three honest resolutions: **earlier wake · spread across days · shorter durations**. That's still not persuasion; it's the trim logic (§5.8) applied at planning time instead of in the morning.
- "Spread across days" is exactly what produces Morning A / Morning B with `weekly_target`. Today the user has to know that pattern exists. This would introduce it at the moment it's needed, which is better onboarding than explaining templates in the abstract.
- "Things you have to do" vs "things you want to keep doing" is a distinction the model doesn't draw. Priority 7 + hard scheduling approximates it. Probably fine — a "must" flag would be a second priority axis, and the spec worked hard to keep 1–7 as the single currency.

## 4. Archetype-driven prompts when building the library

**Taylor's note**

- Onboarding-style prompts, but they all feed one full habit list the person builds for themselves.
- Example: a desk worker might be asked *do you want an afternoon stretch — or more broadly a wellness break?* That could be meditation for some people, physical for others.

**Reflection**

- This is compatible with §4.2's "hospitality, not persuasion" rule *only if* the prompts stay offers — nothing pre-checked, plain wording, skippable in one tap. The starter set already works this way; archetype prompts would just make the starter set contextual instead of generic. The line to hold: the app suggests a *slot* ("a midday break?"), never a *behaviour* ("you should meditate"). Fabulous does the second.
- Modelling-wise this is a starter-set lookup keyed by archetype. No schema change.

## 5. Templates should be chunks of a day, not the whole day

**Taylor's note**

- A day is really: **morning routine** (gets you going) → **body of the day** (work, an activity, errands — the thing you have to do) → an optional **wellness break** (midday or late) → **wind-down** (whenever that is — very late for a server, but everyone has one).
- You should be able to answer each of those independently. Then a day is assembled from chunks.

**Reflection**

- This is the biggest structural note here, and it's the one that unlocks §1 and §2. Today a `Template` is a whole day anchored at one time (§3.4). A chunked model would make a template a **block** with a `kind` (morning · body · break · wind-down · custom), each with its own anchor, and a `Day` an ordered set of blocks.
- What it buys:
  - The wake anchor moves the morning block; a shift start moves the body block; nothing else has to move. This is what makes the varying-shift archetype work without re-authoring.
  - Shift-forward (§5.6) becomes a per-block operation, which is closer to how a late morning actually plays out — the work block often doesn't move.
  - Weekly targets ("two A mornings, one C") attach to the *morning* block, and work blocks get their own counts. See §8.
  - First-run becomes four short questions instead of one long template build.
- What it costs: `Template`, `TemplateSlot`, `Day.template_id`, and materialisation all change shape. It's a Phase-2-sized change, but the offsets-from-anchor design already in the schema makes it tractable — a block is a template with a smaller scope and its own anchor.
- The v1 draft's "Cluster" (reduced to a `typical_days` hint by amendment A1) was groping at this from the other direction. Worth re-reading A1 with this note in hand.

## 6. Transition time lives in the template, not the habit

**Taylor's note**

- Habits have a time range; the transition out of one thing into the next isn't the habit's responsibility (bathroom → different room, etc.).
- Transition time should be a thing in the schedule itself — a small increment between slots that you can grow or shrink, like resizing a textarea, showing the minutes it equates to.
- Things should **slot next**, not require an exact time each. Right now the UI makes me set particular times.

**Reflection**

- Confirmed on disk: slots are stored as absolute `offsetStartMin` from the anchor ([`template-slots.ts`](../../packages/db/src/schema/plan/template-slots.ts), [`save-slot.ts`](../../packages/api/src/services/plan/save-slot.ts)). Gaps exist implicitly (the space between one slot's end and the next's start) but nothing owns them, so nothing lets you resize them, and inserting a slot mid-template means re-entering every downstream start.
- The spec *intended* stacking — §4.4 says "start defaults to the end of the previous slot (so a template builds like a stack)" — but only as a default at insert time. Once set, offsets are independent.
- The cleaner model is **durations + gaps, offsets derived**: each slot carries `gap_before_min` (default 0), and `offset_start` is computed by walking the stack. Fixed-time slots (appointments) become pins the stack flows around. Shift-forward gets cheaper still. This is a data-model change but a contained one; materialisation already recomputes absolute times from offsets.
- The resizable gap in the editor is the right affordance for it and fits the "one screen that earns density" rule.

## 7. Work: primary and secondary focus, not just "work"

**Taylor's note**

- Ask whether they want work as one generic block, or as **main focus + secondary focuses**.
- In weekly planning I mostly think about *what is the primary focus per day*, and that dominates how I see the week. Sometimes it's locked to a day; sometimes it floats on resources, mood, timing.
- Juggling many projects, the task-switching cost is real; being crystal clear on the day's primary thing is what I need. (Waiting on external resources for Kurt and Krishan's work makes this acute right now.)

**Reflection**

- Nothing in the model today ranks work items against each other within a day beyond priority 1–7. A `deep_work` item with a `focus: primary | secondary` attribute is the smallest change; the week build then headlines each day with its primary focus, which is the "dominates how I see the week" view.
- "Locked to a day vs floating" is the hard/soft distinction (§3.5) applied to the *item's day* rather than its *time*. The spec only uses hard/soft for time. Extending it to day-placement — "this focus must happen Tuesday" vs "this focus happens once this week, I'll pick the day" — is what §8's morning menu needs.
- The clarity benefit is real and cheap: one primary per day, displayed once in the day header. It's a noun, not a number, so it doesn't break the "nothing numeric on the tabs" rule.

## 8. A morning menu — choose from what you prepared, day-of

**Taylor's note**

- Say I have morning routines A, B, C with counts (two A, two B, one C a week), and five work blocks (four unique, one repeated). When I get up Monday I want to pick: *today is A* and *today is work block 3*. Checking those off preloads what I prepared. A menu I choose from.

**Reflection**

- This is a direct reversal of amendment **A1**, which removed the v1 draft's daily "which variant" prompt on the grounds that "the morning is execution." That reasoning was the owner's own preference at the time; this note says the preference is actually *both* — some days are decided Sunday, some are decided at wake.
- The reconciling shape: the week build assigns either a **specific** block or a **pool** ("one of A/B/C, counts remaining"). Locked days open straight to the List, as now. Pool days open to a one-screen picker showing the remaining options with their counts ("A · 1 of 2 left"), and picking materialises the day. Execution mode stays clean for anyone who never uses pools.
- Materialisation timing changes for pool days: today items materialise at week build so the List works offline (§4.5). A pool day materialises at pick time, so the "Nothing planned — pick a morning" state needs to be a first-class empty state, not an error.
- Depends on §5 (chunks) to be clean — without blocks, a "pool" can only be whole-day templates, which is coarser than the note wants.

## 9. The day view should be both micro and macro

**Taylor's note**

- Coming into the day itself, I want to see where I am in the day (micro) *and* be able to step back and update my plan for the day at certain points (macro). Haven't checked the current UX for this yet.

**Reflection**

- The spec splits this into two tabs: List (micro, "move through today without deciding") and Schedule (macro, "where does the day sit against the plan"). What it deliberately forbids is *editing the plan* from either — §5 opens with "nothing configurable is reachable inside either tab," and the only mutations are start, done, undo, one-off, shift, trim, note.
- This note wants a third thing: a mid-day re-plan. It doesn't have to break the rule — it can live behind the day header sheet (§5.2) as **Edit today**, opening the day's items in the block editor scoped to today. What the spec's guardrails require is that the edit is *annotated*: the original plan stays visible in Review (the ghost-and-annotate principle, §2.4.6), and the change is logged like a shift is. Done that way, it's a planning-mode surface reached from execution mode, which the spec permits ("no configuration reachable without leaving the tab" — this leaves it).
- Worth checking the built Schedule tab (USE-4) against this before designing anything; the note says it hasn't been looked at yet.

## 10. Owner-fit vs product-fit

**Taylor's note**

- All of this is currently built for me specifically — custom control. Maybe that's actually the best way to get it started. Logging these for the product as a whole.

**Reflection**

- The spec agrees with the instinct (§2.2: "three states, not three personas"; §4.2: "Taylor's own path is the same path; there is no hidden owner mode"). The notes above don't argue for personas either — they argue for one *discovery question* (§1) that routes the same configuration differently, and for a more composable plan model (§5, §6) that the owner's own use case also wants.
- Suggested order if any of this moves: **§6 (gaps/stacking)** is the cheapest and fixes a felt pain now → **§7 (primary focus)** is small and high-value for the current juggling → **§5 (chunks)** is the structural change and should be specified before §1, §2, §8 are designed on top of it → **§1/§2/§4** are first-run changes that read the archetype → **§8** last, since it depends on chunks and pools → **§9** after the Schedule tab has been reviewed.
- None of these touch the honesty core (tiers, the resolver, annotate-never-rewrite). They're all on the planning side.

---

# Second pass — narrowing to one archetype

## 11. Sub-stories per archetype, but build for one first

**Taylor's note**

- Ultimately onboarding and profile management will have sub-stories per schedule archetype.
- For a functional thing now, focus on my archetype only: I control my own hours, but I try to set my own structure. Consistency is the goal; the days have a dynamism that isn't predictable or repeatable. Shifting and structure play a dance with each other. It resembles my internal mental map.
- The marketing line I keep writing down: **"For when your schedules are as dynamic as you are."**

**Reflection**

- This is a clean scoping call and it agrees with §10 above. It also sharpens §1's third archetype into something more specific: not "approximate hours" but **structure-seeking with daily variance**. That's the person the trim, the shift, and the annotated record were already built for — the honesty core is the product's answer to a schedule that doesn't repeat.
- The positioning line is worth pinning against [`value-proposition.md`](value-proposition.md) when that gets ratified. It reframes the archetype question as the product's *audience*, not just an onboarding branch: the app is for people whose plan has to bend and who want to know honestly how it bent.
- Storing `schedule_shape` on the profile (§1) still makes sense even with one archetype built — it's the seam the other sub-stories hang off later, and Settings can show it as a read-only line until there's a second branch.

## 12. Onboarding inputs for this archetype — the fixtures

**Taylor's note**

- Pick archetype, then establish the fixtures, in this order:
  1. **Which days do you work?** Three answers per day: always · sometimes · never. (Saturday sometimes, Sunday never.)
  2. **What time do you typically like to start work?**
  3. **What time would you like to wake up?**
  4. The **morning wellness routine** — whatever you do to feel good.
  5. The **logistical / operational / preparation** stuff between wellness and work — breakfast, coffee, transit, driving, walking the dog. Different per person; not something you can skip past. Working from home makes mine simple; an office worker in the same archetype has more here.
- The app should then show the room: *you have this time, this time, and this time — here are the slots to work with.* Mine: up at 7, working by ~9, 45 minutes of breakfast + a walk outside is mandatory prep → everything before that is available for wellness.
- Someone else may be "zero and zero — get up, walk to the computer, start." Fine; establish that and move on.
- A small review page of what was submitted, then proceed.

**Reflection**

- This is the discovery flow §1 asked for, now concrete. Five inputs, and four of them already have homes in the model: work days → `typical_days` (with a new *sometimes* state — today it's a boolean set); work start → a hard fixed-time anchor; wake → `anchor_time` / the wake anchor habit; wellness and prep → two blocks (§5).
- The important structural idea is the last bullet of the note: **the morning is scheduled backwards from a hard anchor, not forwards from wake.** Today the stack flows forward from `anchor_time` (§4.4). This archetype's morning has a fixed *end* (work start) and a preferred *start* (wake); the span between them, minus mandatory prep, is the wellness budget. That's a second flow direction the stacking model (§6) needs: forward from wake for the day, backward from the work anchor for the morning. Once gaps and durations are first-class, both directions are the same arithmetic.
- "Here are the slots to work with" is the capacity number from §5.8 shown at *planning* time — the same trim maths, surfaced as an affordance rather than a rescue. That's the §3 reflection again, now with a concrete trigger.
- "Sometimes" days are the interesting case. A *sometimes* work day is a day whose body block is a pool of two (work / not work) — which is exactly §8's morning menu applied to the work block. So the *sometimes* answer at onboarding doesn't need a new mechanic; it seeds a pool.
- The review page fits §4.2's "5 of 5 — Done" screen; it just needs to show the computed span ("Wake 7:00 · prep 45 min · wellness 75 min · work 9:00") instead of one line of copy.

## 13. Per block: list everything you want, ranked — it doesn't have to fit

**Taylor's note**

- For each block, list *all* the habits you want to be doing there and rank them by priority. This is not "what fits" — it's every step you'd want, ranked.
- There may be room to distinguish "I want to do this" from "this is a priority", but for now priority is the one axis and that's fine.

**Reflection**

- This matters more than it looks: it turns the morning template from something you *author to fit* into something you *rank and let the budget cut*. Combined with §12's computed wellness span, the assigned morning falls out automatically — highest-ranked items until the budget is spent — and the rest are "not assigned today" in the spec's own vocabulary (§2.4.2). A later wake shrinks the span and the trim re-runs. That is the "structure and shifting dance" in mechanism form, and it uses only machinery the spec already has (priority resolution §6.6, trim §5.8, not-assigned state §5.9).
- It also softens the need for Morning A / B / C as hand-built variants: one ranked list plus a variable budget generates most of the variation. Explicit variants are still useful when the *content* differs (a workout morning vs a writing morning), not just the length — keep both, but let the ranked list be the default path and variants the advanced one.
- Keeping priority as the single axis is the right call; the spec spent effort making 1–7 the only currency (§1.2). "Want" vs "priority" can be revisited if the ranked-list trim produces mornings that feel wrong.

## 14. The preparation block: durations, mandatory items, and pick-one-of-two

**Taylor's note**

- Each practical item has a typical duration — how long the meal takes, how long the drive is. It's a range, but establish a baseline.
- Some are 100 % mandatory every time (the drive).
- Some are **pick one of two**: breakfast is either "meal-prepped" or "cook it now", with different durations. Hybrid workers either transit or don't. This feels required for this section in particular.

**Reflection**

- Durations and ranges are already on the habit (`duration_min/max`); the baseline is the slot's chosen `duration`. Nothing new there.
- "Mandatory" is priority 7 + hard scheduling in today's model, and the trim never touches hard items (§5.8). Sufficient for now; a `mandatory` flag would be a second axis and §13 just declined one.
- **Pick-one-of-two is genuinely new.** The model has one grouping concept, `multitask_group`, which means *concurrent* — both happen. This is *exclusive* — exactly one happens, chosen day-of. It's an **alternates group** on the template slot (`alternates_group` alongside `multitask_group`), with the editor rule that members share a position and differ in duration. Materialisation for a day with unresolved alternates has to hold the choice open until the morning pick (§15). Small schema addition, but it touches the template editor's same-start rule (§4.4 currently offers only "multitask" or "move it" — it would need a third answer, "one or the other").
- Because alternates change the duration of the prep block, they feed straight into the wellness budget in §12 — "meal-prepped today" hands 20 minutes back to the morning routine. That's a satisfying loop and it's the reason this section is "required".

## 15. Work day types, and the morning quick-pick

**Taylor's note**

- Work is really its own thing; establish the habit side first, because that's where most of the configuration is. Even if only the habit side is set up and everything around work is thin, that's a success.
- What I need now: **day types** for the week — a Viewpoint AI day, a Conscious Connections day, a job-applications day, a day for Krishan's work.
- The morning, first thing, should be click-click-click: *Morning routine A* → *I did meal-prep* (prep alternates resolved) → *(when's my workout — its own distinction, skip for now)* → *which work day type*. Then: here is your list, and your goal is to be starting work by 9:45.

**Reflection**

- Day types are work-block templates with weekly counts — §7 and §8 above, now with the block model (§5) making them independent of the morning. The week build headlines each day with its type; a day can also be a pool if the type is decided day-of.
- The morning quick-pick is §8's menu with a defined shape: one screen, one question per unresolved thing — morning variant (if pooled), each alternates group, the work type (if pooled). Everything already locked on Sunday is skipped, so a fully-planned day still opens straight to the List. Three or four taps, then materialise. This keeps "the morning is execution" true for anyone who doesn't use pools, and honest for Taylor's use where the morning *is* a small decision.
- Sequencing implication for the build: the habit/wellness/prep side is ahead of the work side in dependency order anyway (blocks → ranked trim → alternates → morning pick), so "establish the habit part first" costs nothing.
- The workout-placement question is real (it can belong to the morning, the break, or the evening) and is exactly what a "float between blocks" placement rule would handle. Parked, as the note says.

## 16. The morning as a countdown to work, with transition notifications

**Taylor's note**

- Once the picks are made, the output is a to-do list with a target: *be starting work by 9:45.* That gives me a timer I can start.
- Notifications to transition between things would help.

**Reflection**

- **This is the one place the notes touch a signed guardrail.** §2.4.1 and §2.4.4 rule out anything "countdown-shaped" and "hard countdowns" — the pressure register. The need here is legitimate, though: a morning scheduled backwards from a hard anchor *has* a deadline and hiding it would be dishonest. The reconciling shape is to show the anchor as a **time, not a countdown**: the List's day header reads *Work · 9:45* and each row keeps its derived start time, in the neutral register, no colour change, no shrinking number. The block-level timer that "I can start" is then just the existing timer (§5.4) running on the block rather than the item — elapsed, tabular figures, nothing red. It informs; it doesn't pressure. Worth a `[PROPOSED]` ruling rather than a quiet change.
- Transition notifications already exist as N1 (§8.2) — one push at each fixed-time item's `scheduled_start`. In a stacked morning every item has a derived start, so N1 covers it with no new plumbing. The risk is noise: a nine-item morning is nine pushes in two hours. Default to one notification per **block boundary** (wellness → prep → work), with per-item notifications opt-in per block. §8.1's test still holds: each one is a time you set, in your words, reporting nothing.
- Materialisation timing needs care: derived starts only exist after the quick-pick, so N1's scheduler has to enqueue at pick time, not at week build. That's the same change §8 flagged for pool days.

## 17. What this changes about the order in §10

- The narrowed scope makes the dependency chain explicit and short: **stacking + gaps (§6)** → **blocks (§5)** with backward flow from a hard anchor (§12) → **ranked-list trim at planning time (§13)** → **alternates groups (§14)** → **pools + the morning quick-pick (§8, §15)** → **block-anchor display and block-boundary notifications (§16)**. Primary focus (§7) folds into work-block day types and no longer needs its own step.
- The first-run rewrite (§12) should be *last*, not first — it's a thin layer over the model above and is cheap once the model exists; designing it earlier means redesigning it.
- One proposed ruling to put in front of Vesper before any of this is specced: **a hard anchor's time may be shown in the day header as a plain time** (§16). Everything else stays inside the signed guardrails.

---

# Third pass — corrections, additions, and what onboarding looks like now

## 18. How to read the spec's "signed" rulings from here

**Taylor's note**

- The guardrails and rulings are an ongoing prototype, not hard-set law. Don't treat what was in place before as overriding what I'm saying now. If something genuinely collides, break out and ask me directly — but don't gate on the old text.

**Reflection**

- Logged as the operating rule for this ledger and for any spec work that follows from it: the official spec is the *current best draft*, these notes amend it, and the amendments win until Vesper's next pass folds them in. Collisions get a direct question, not a `[PROPOSED]` ceremony. The §16 countdown point stands as an example of the kind of thing worth one question, not a blocker.
- Practical consequence: when these notes become tickets, the tickets should cite this ledger as an authority *above* the spec text for the sections they touch, and `DEVIATIONS.md` records the divergence as usual. The spec's own §0.1 ladder already puts "rulings you've made" above the spec — this is just that ladder, applied.

## 19. Ask directly whether work start is a hard anchor

**Taylor's note**

- I'm assuming work start is the hard anchor. Ask it instead. Two mental archetypes inside the same schedule shape:
  - The leisurely creative: *I finish my morning routine when I finish it and start work when I want.*
  - The road-grader: *work starts when it starts; I cut off wellness when I get there.*
- I don't know what the in-between looks like yet.

**Reflection**

- This is one question with three answers, and it decides the flow direction from §12: **"When your morning runs long, what gives?"** — *work waits* (wellness-anchored; work start is soft and floats) · *the routine gets cut* (work-anchored; work start is hard and the wellness budget trims) · *depends on the day* (ask at the morning pick).
- The in-between is probably the third answer, and it's the cheapest to build because the morning pick already exists (§15): on "depends" days the quick-pick shows one more toggle. The other two are just the hard/soft flag on the work block's start, which the model already has.
- The creative archetype still benefits from the budget number — it just reads as information ("routine runs to ~9:40") instead of a limit. Same component, different anchor.

## 20. Correction — the ranked list is the landscape, not the trim

**Taylor's note**

- I don't mean "list everything and rank it so the trim can cut it." I mean *capture what habits matter to them.* If someone is a habit junkie with thirty wellness practices, at least we understand the landscape, and that becomes a menu for deciding what fits on what kind of day.
- Then ask how they want to handle the overflow: variation by day type, or a daily menu — see the twenty, tap tap tap, it shows *60 minutes to work with, this adds up to 70*, reduce scope on one or cut one. That's a flow state. There are micro-modes like this.
- The premise: build structure around the way humans actually schedule themselves. Everything should feel natural. Onboarding creates **sources of truth** — a data bank — and everything after is decisions made over that data.

**Reflection**

- Correction taken; §13's framing was too mechanical. The library (§3.3) *is* the data bank, and onboarding's job is to fill it without asking anything to fit. Fitting is a separate, later decision, and the note names three ways to make it — which is a per-user preference, not a system rule: `overflow_mode: day_types | daily_menu | auto_trim`. The auto-trim from §13 survives as the third option, not the default.
- The daily menu is the strongest of the three and it's a small design: the quick-pick (§15) with a **live budget line** — *60 min available · 70 chosen*. That's the template editor footer's "the number is the feedback" pattern (§4.4), running live over a tap list. Two ways to close the gap, both inline: shorten an item within its own range, or untick one. No judgement copy; the arithmetic is the feedback. This is also where "micro-modes" should be understood — not new screens, the same list with a different question over it.
- "Sources of truth" is a good discipline for the whole first-run rewrite (§12, §24): every screen should either *capture a fact* (library, fixtures, preferences) or *show a computed consequence* of the facts so far. Nothing should ask the person to reconcile facts by hand — that's the app's job, and it's what makes the flow feel natural rather than like configuration.

## 21. Standing meetings

**Taylor's note**

- Ask if they have consistent meetings or commitments per week. My archetype has no hard start/stop, but I could have a regular stand-up at a set time on a set day.

**Reflection**

- The model has `task_appointment` + `fixed_time` + `hard`, but nothing recurring outside a template slot — and template slots belong to a *day type*, which floats across days (§15). A Tuesday stand-up belongs to *Tuesday*, whatever day type Tuesday gets. That's a small new layer: **weekday fixtures** — items pinned to a day of the week that materialise on every planned instance of that day regardless of template. Onboarding captures them; the week build shows them already placed; the morning pick can't remove them.
- Long-term this is what Google Calendar import (§4.7, Phase 2) feeds. Building the fixture layer first means the import has somewhere to land.
- Fixtures are also the natural "pins" the stack flows around (§6) — the reason to model gaps and durations rather than absolute offsets shows up again here.

## 22. Committing to a workout time

**Taylor's note**

- I need to lock in *what time* I'm doing my workout, every day, at the morning pick. If I don't set a time it falls away — it gets stuck behind work, or the routine feels rushed and I skip it.
- The pick is two questions: *Monday is typically this workout — still doing it?* (sometimes I want legs today and swap Monday/Tuesday, or there's a practical reason) and *what time?*
- The right time depends on the day's work: a long Claude run gives me an hour to train in the middle of work; investment-asset work for Kurt doesn't, so the workout is better before deep work. So I want to *slide* it — Google Calendar-style time blocks, drag and drop, and it all just works.

**Reflection**

- Two separate mechanisms in here:
  - **A rotation with typical days** ("Monday is usually push") is a pool with a default — same as §8/§15, applied to workouts. "Still doing it?" is the pool's confirm-or-swap step. Swapping Monday and Tuesday is a two-day edit, which the week build can offer inline ("swap with Tuesday's").
  - **A floating block with a required placement** — the workout has no fixed offset; it must be given a start at the morning pick, chosen from the day's open spans (before work · a gap in work · after). The rule "unplaced means it disappears" is exactly what the note diagnoses, so the pick should refuse to finish with the workout unplaced (or make the person explicitly say *not today*, which is the trim state, never a miss).
- The work-shape dependency ("does today's work have an unattended hour?") is real but shouldn't be modelled yet. Offer the open spans, remember the last placement per work type, and let the person slide it. That covers 90 % of it without a "work has long stretches" flag.
- **Drag-and-drop time blocks** is the Schedule tab (§5.3) becoming editable for today. The spec's reduction pass removed drag on mobile *for the template list* (§4.4), which was right for a list; a time axis is the one surface where dragging is the natural gesture and the Google Calendar reference is the right one. This is §9's "Edit today" realised as direct manipulation instead of a form — and every drag is an annotation, so the record principle holds. It also gives §12's "here are the slots to work with" a place to live: the open spans are just the empty bands on the axis.

## 23. Scope check

**Taylor's note**

- If all of this were incorporated right away, I'd feel pretty good.

**Reflection**

- Everything in passes two and three sits on the same short chain (§17) plus three additions: the anchor-direction question (§19), weekday fixtures (§21), and floating placement with the editable Schedule (§22). None of it reopens the review side. The list is coherent enough to become a track — call it *Epic 1b — Setup for a dynamic schedule* — once §24 below reads right.

## 24. What onboarding looks like now — the walk-through

One archetype built; the others are named on screen 1 and greyed. Every screen either captures a fact or shows a consequence. Progress shown as "n of 10". Everything after screen 1 is skippable and revisitable from Settings.

1. **The shape of your week.** *Which is closest?* — four archetype cards (§1). Only "I set my own structure, and it changes" is live. Stored on the profile.
2. **Work days.** Seven chips, each cycling *always · sometimes · never*. (Sat sometimes, Sun never.) "Sometimes" seeds a pool for that day.
3. **Work start, and what gives.** *When do you like to be working by?* (time) · *When your morning runs long, what gives?* — work waits / the routine gets cut / depends on the day (§19).
4. **Standing commitments.** *Anything that happens every week at a set time?* — add rows: day, time, length, title (§21). Skip is one tap.
5. **Wake.** *When would you like to be up?* — one time, or a range (§2). Seeds the wake anchor.
6. **Between the routine and work.** *What has to happen before you can start?* — list with a duration each (breakfast, coffee, walk, transit, the dog). Any item can be marked *one of two* with a second version and its own duration (§14). Shows the running total.
7. **Your routine — the whole landscape.** *What do you do, or want to do, to start the day well?* — free entry plus a starter set as offers, nothing pre-checked. Each item gets a priority (1–7) and a rough length. No fit check on this screen (§20).
8. **Training.** *Do you train?* — if yes: the rotation (names × typical days) and a typical length. Placement is decided each morning, not here (§22).
9. **Work day types.** *What kinds of work day do you have?* — names, how many of each per week, and whether each is fixed to a day or floats (§15).
10. **The fit.** The first computed screen: *Up 7:00 · prep 45 min · routine time ~75 min · work 9:00 · your routine list adds up to 140 min.* Then *how do you want to handle the days it doesn't fit?* — day variants / a daily menu / cut the lowest automatically (§20). Then **Open today** or **Plan this week**.

**A typical morning after that** (the quick-pick, §15/§20/§22) — only the unresolved things appear:

- *Routine* — the daily menu with the live budget line, or a variant pick if that mode was chosen.
- *Prep* — each one-of-two: *meal-prepped today?*
- *Training* — *Monday's is push — still?* (swap) → *when?* (open spans on today's axis).
- *Work* — which day type, if today floats.
- Then the List opens with the day header reading *Work · 9:00*, and the Schedule tab shows it all as blocks you can slide.

---

# Fourth pass — orienting the internal world first

## 25. An opening message before the day starts

**Taylor's note**

- I struggle with starting the day in a negative, dwelling mindset. I need something that reminds me, realigns me, to the mindset I want — *good morning, let's get your mind and emotion pointed the right way.*
- Could be a passage from a document, a quote, an affirmation — the medium is open. Treat it as a micro-feature and do independent design research on how to do it well.
- It's its own **block**, ahead of the wellness routine, deliberately small. It blurs into wellness but stands alone: even the "I just get started" archetype might want one thing to read before jumping in. The question it answers: *what do I need to read on the screen before I enter the day?*
- Context: I'm about to use an app blocker so Synapse is the first thing I open. I want to shelter from the external world's incoming noise and intentionally influence myself internally. That is the whole premise — *orient the internal world first thing in the morning.*
- Options that come to mind: a provided document or text to read daily (affirmations); a daily quote, possibly from a large bank; multiple of these; possibly chosen against the day ahead.

**Reflection**

- This is a new block kind (§5): **orient** — sits before *morning*, has one item, and its "done" is having read it. It's the natural first screen after the wake anchor is tapped: *Immediate wake up* → done → the message. That sequencing also answers the "first app I open" intent without any new mechanism — the wake anchor already exists, and the orient block is what it opens onto.
- The spec's copy rules are the thing to be careful with. §5.10 and §10 forbid second person and adjectives in app copy, and §2.4.7 forbids AI commentary. The clean way through: **the message is content, not copy.** The app's chrome stays in its neutral register ("Before the day · 1 min"); what's inside the frame is either the person's own words, a text they chose, or a quote they opted into. The app never speaks the message in its own voice. That keeps the emotional contract (§2.3, "a record, not a verdict") intact.
- Mediums, as a first cut for the research pass:
  - **A passage you set** — a document or paragraph in the library, shown as-is. Cheapest, fully private, no content problem. Probably the default.
  - **A quote bank** — curated, opt-in, shown one per day. Needs a content and licensing decision, and a tone rule so it never drifts toward the persuasion register the product refuses (§9.1.3). Not first.
  - **Your own words from last night** — §26. The strongest option and the one that makes this feature distinct.
  - **Combinations** — a passage plus last night's line. Fine once the pieces exist.
- "Chosen against the day ahead" (a message keyed to the day type) is a nice later layer: a passage per work type, or per mood, selected by the morning pick. Park it; the block kind and the self-authored loop come first.
- Research deliverable, as asked: a short think-tank pass on morning-orientation mediums — what people actually read, how long, what the failure modes are (skipped, skimmed, becomes noise), and how the good examples (a daily reading, a fixed page, a mantra) avoid becoming persuasion. Output is a one-page brief that picks the default medium and the frame design.

## 26. The evening journal, and your higher self speaking to you in the morning

**Taylor's note**

- Part of the bedtime routine should be a short journal in here: *how did the day go, what are you grateful for, what are you most looking forward to tomorrow, what's your visualisation for tomorrow.*
- That works hand in hand with the morning message — it's like your higher self speaking to you. I really like that as I say it. Account for it in the flow.

**Reflection**

- This closes a loop the product didn't have: the Day Review (§7.2) captures *what happened* in the honest register; the journal captures *where you want to be* in your own words; the orient block plays it back. The whole thing is you speaking to you, so it clears every rule in one move — no second person from the app, no AI, no persuasion, and it's the record principle applied to intention rather than events.
- Placement: it's a **wind-down block** item (§5), *not* part of the Day Review. The review is tired, three-taps-per-item, neutral; the journal is reflective and deserves the serif register the brand reserves for reflective surfaces (§9.1.4). They can sit next to each other in the evening — review first, journal second — but they're different screens with different tones. Keep "Finish later" true for the review and let the journal be skippable without pending state; an empty journal night is nothing, not a miss.
- Model: `journal_entries` per day with the four prompts as fields (`day_went`, `gratitude`, `looking_forward`, `visualisation`), free text, timestamped, RLS-private like everything else. The morning message reads `visualisation` and `looking_forward` from the previous entry. Prompts should be editable in Settings the way the reason set is (§3.10) — the four in the note are Taylor's; someone else's higher self asks different questions.
- The orient frame for this medium: date-stamped, the person's own text verbatim, and one neutral chrome line ("Last night you wrote"). If there's no entry, fall back to the set passage (§25) rather than an empty frame — the block should never open onto nothing.
- Notification: if any push exists for this, it's the wind-down block's start (N1 on a fixed slot), never a "you haven't journalled" nudge. §8.5 stands.

## 27. Amendments to the walk-through (§24)

- Add to onboarding, after screen 5 (Wake): **5b. Before the day.** *What do you want to read before the day starts?* — a text field for a passage (optional), and a toggle for *and what I wrote the night before*. Skippable; both live in Settings.
- Add after screen 8 (Training): **8b. Closing the day.** *A few lines at night?* — shows the four prompts, editable, and a toggle. Skippable.
- Morning after the wake anchor, before the quick-pick: **the orient frame** — one screen, the chosen content, one action (*Start the morning*). No time text, no counter, nothing else on it.
- Evening, in the wind-down block: **the journal** — four prompts, serif, autosaves, no finish button ceremony. Sits after the Day Review if both are due.
- Block kinds are now: **orient · morning · body · break · wind-down · custom.**

---

# Fifth pass — gratitude in both directions, the evening's own time, and the integration landscape

## 28. Two kinds of gratitude at night, and one in the morning

**Taylor's note**

- The evening journal needs two distinct gratitude prompts: *what happened today that you're grateful for* (event-based) and *what are you feeling most grateful for in your life right now* (holistic, in the heart — not logical, whatever comes forth).
- The morning should have a version too: **pre-emptive gratitude** as part of the visualisation — *what are you feeling most grateful for as you wake up this morning?* These are there to shift you emotionally in a meaningful way.

**Reflection**

- The evening prompt set (§26) becomes five: `day_went` · `gratitude_today` · `gratitude_life` · `looking_forward` · `visualisation`. The two gratitudes are genuinely different questions and shouldn't be merged into one field — the first is a record (it feeds review, §30), the second is a state.
- The morning one changes the orient block's shape slightly (§25): it was *read-only*; now it has one optional **write** — a single line, `morning_gratitude`, captured before the quick-pick. That's fine as long as it stays one field and skippable; the orient block's job is still under a minute. The frame becomes: last night's words (read) → *and this morning?* (one line, optional) → *Start the morning*.
- "Pre-emptive gratitude as part of the visualisation" suggests the morning frame should show last night's `visualisation` *directly above* the morning gratitude line, so the two read as one exercise. Layout detail, but it's the whole point of the feature.
- Both entries are the person's own words, so the copy rules (§25) still hold. The app asks the question in its neutral register; it never supplies the gratitude.

## 29. The evening takes as long as it takes — notifications and time tracking

**Taylor's note**

- We need a notification process and time tracking for the evening so the app learns how long a person actually takes. Three minutes for one person, thirty or forty for another who really thinks it through. Could differ a lot by gender.

**Reflection**

- The journal is a wind-down block item, so it already gets a slot with a `duration` and a `timer_sessions[]` record (§3.7, §5.4) — the timer plumbing exists; the journal just needs to start its timer on open and stop on leave, silently. No new model.
- What "the app learns" means in practice: the slot's `duration` starts at whatever they said at onboarding (§27, screen 8b — add *roughly how long?*), and the week build shows the observed median from `timer_sessions` beside it ("you said 10 · usually 24") with a one-tap *use this*. That's the honest-record principle: the app reports what happened and offers, never silently rewrites the plan. Same pattern would serve every habit with a range, so build it once.
- Notification: the wind-down block's start is a fixed slot → N1 fires (§8.2). The journal itself gets *no* separate push, and certainly not a "you haven't written" one (§8.5). If the evening runs past `day_close_time` because someone wrote for forty minutes, the timer keeps the entry on the right day (§6.1 — items done before 03:00 belong to the day that started the previous morning).
- Gender difference is a hypothesis to *observe* from timer data, not to design for. Don't ask it at onboarding; the timer will show it if it's there.

## 30. Weekly and monthly reflection over the journal

**Taylor's note**

- Weekly and monthly reviews built over everything shared in the journal. I think that would be very healthy.

**Reflection**

- Two levels, and only one exists today. The Week Review (§7.5) is adherence maths; it can gain a **Reflections** region that lists the week's `gratitude_today` and `looking_forward` lines verbatim, in the serif register, with no synthesis. That's cheap, honest, and reads well — seven lines of your own gratitude is a review nobody has to design.
- **Monthly** is new (there's no month construct in the model — weeks are the unit). A monthly reflection can be a plain view over `journal_entries` by calendar month: the gratitude lines, the visualisations next to what happened (adherence by day is already computed), and the `gratitude_life` entries in sequence, which will change slowly and are interesting *because* they change slowly. It's a read view over existing tables; no schema, and no new Review-tab region until it earns one — reachable from History first.
- Synthesis ("your themes this month were…") is the coach the spec deliberately doesn't build (§7.7). The data shape is right for it later; the rule for now is verbatim playback, chronological, in the person's words.

## 31. Micro-research — the Phase 2 integration landscape

**Taylor's note**

- APIs I'd love to connect in Phase 2: MacroFactor, MyFitnessPal, Linear, ClickUp, Google Calendar, Apple Health, Oura. Do these need a true partnership or do they have open developer APIs? Eventually: *your heart rate rose when you did this thing* — and it understands that.

**Findings (checked 11 Sept 2026 — verify again before any ticket)**

| Source | Access model | Practical read |
|---|---|---|
| **Google Calendar** | Open. Google Cloud project + OAuth 2.0; `calendar.readonly` is a *sensitive* scope, so a verification review is needed before non-test users can consent. | Already in the spec as Phase 2 (§4.7). Cheapest of the lot. Read-only import into weekday fixtures (§21) is the right landing. |
| **Linear** | Open, self-serve. GraphQL, OAuth 2.0 (PKCE supported), personal API keys, signed webhooks, TypeScript SDK, free tier. | Easiest project-management source. Issues assigned to you → candidate work items for a day type (§15). |
| **ClickUp** | Open, self-serve. REST (v2/v3), OAuth 2.0 app created in ClickUp settings; personal tokens for own-use. | Same shape as Linear, slightly rougher API. Tasks → work-block candidates. |
| **Oura** | Open developer platform, OAuth 2.0 only — personal access tokens were deprecated in Dec 2025, so even own-ring use goes through an OAuth app. Has a **sandbox** (`/v2/sandbox/usercollection/*`) with deterministic sample data, no ring needed. | The heart-rate idea is buildable: daily sleep / readiness / activity and heart-rate series are in the API. Build against the sandbox first. |
| **Apple Health** | **No server or web API.** HealthKit is device-only; data leaves the phone only through a native iOS app that reads it and uploads it. A PWA cannot touch it. | This is the first concrete reason the `apps/mobile` Expo seam exists. Until there's a native app, Apple Health is out of reach. Same story for Android Health Connect. |
| **MacroFactor** | **No official public API.** Only unofficial community clients (reverse-engineered Firestore access, requires a subscription — fragile and against the spirit of their terms). MacroFactor *does* write to Apple Health / Health Connect. | Reach it through Apple Health (i.e. through the native app), not directly. Don't build on the unofficial clients. |
| **MyFitnessPal** | **Private partner API.** OAuth 2.0 with diary/measurements scopes exists, but the developer programme is closed to new applicants; access is by emailing `API@myfitnesspal.com` with a company case. | Partnership required. Also writes to Apple Health, so the same fallback applies. Low priority. |

**What this means for the plan**

- Three are open and cheap: **Google Calendar, Linear, ClickUp** — all OAuth 2.0, all read-only imports into existing concepts (fixtures, work-block candidates). They can be Phase 2 as the spec already assumes for Calendar.
- **Oura** is open and has a sandbox; it's the one biometric source reachable from a PWA. The "heart rate rose when you did this" idea is a join between Oura's heart-rate series and `timer_sessions` — the timers are the thing that makes it possible, which is a good reason to keep them accurate.
- **Apple Health, MacroFactor, MyFitnessPal** all funnel through one door: a native iOS app reading HealthKit. That's the Expo seam's first real job, and it's the argument for not scaffolding it until a health integration is actually next.
- Every integration is **read-only into Synapse**. Nothing writes back; the record stays the person's own. Imported items are still marked done/missed by hand, per §4.7.
- A `data_sources` seam on the profile (which connections exist, last sync, revoke) is worth reserving in the model now — it's the "seams are recorded, not scaffolded" rule.

Sources: [MacroFactor GitHub org](https://github.com/MacroFactor) · [unofficial MacroFactor client (LobeHub)](https://lobehub.com/mcp/sjawhar-macrofactor) · [Sahha on MacroFactor via Health platforms](https://sahha.ai/integrations/macrofactor/) · [MyFitnessPal developer portal](https://www.myfitnesspal.com/api.php?op=link) · [MFP partner authentication](https://myfitnesspalapi.com/docs/partner-authentication/) · [Validic on the MFP API](https://help.validic.com/space/VCS/4698636289/MyFitnessPal+API+Integration+for+Developers) · [Oura API v2 docs](https://cloud.ouraring.com/v2/docs) · [Oura API profile (API Evangelist)](https://github.com/api-evangelist/oura-ring) · [Open Wearables on HealthKit](https://openwearables.io/blog/apple-healthkit-api-what-data-you-can-access-and-how) · [Momentum on HealthKit limits](https://www.themomentum.ai/blog/what-you-can-and-cant-do-with-apple-healthkit-data) · [Linear developers](https://linear.app/developers) · [Linear GraphQL getting started](https://linear.app/developers/graphql) · [ClickUp authentication](https://developer.clickup.com/docs/authentication) · [ClickUp getting started](https://developer.clickup.com/docs/Getting%20Started)
