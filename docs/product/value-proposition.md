# Synapse — Value Proposition

**Status:** Draft → for Taylor's ratification. Sections marked **Ruled** restate settled law (official spec §0.3, §2, §9, §10); everything else is Compass's recommendation with the case against, and moves to settled only through Taylor.
**Role:** Compass (product strategist) — the job, the exchange, the benefits, the positioning, the fit signatures. **Support:** Sage (behavioural scientist) — §5, what the product can honestly change and why; Hearth (brand strategist) — §6–§7, how the brand carries the proposition.
**Date:** 2026-09-05. **Domain:** synapse.day.
**Sources:** `docs/ux/habit_tracker_official_ux_spec_v1.md` (§0.3 signed rulings, §2 product frame, §7 review, §8 notifications, §9 brand, §10 copy, §12 phasing); `docs/ux/branding-guide.md` (derived; §9 wins where they differ); the three epic documents and the cross-cutting document for the screens cited.

> **How to read this.** It is written to be said out loud — to a friend you are sending the link to, to yourself when a feature request arrives, to a future thread deciding what Synapse becomes next. Every benefit here is cashed by a product fact with a section number. Where a claim is a bet rather than a fact, it says so and names what would falsify it.

---

## 0. The proposition in one breath

**For a person who already knows what they want to do with their days and is tired of being managed by the apps that promised to help, Synapse is a private daily list — built once a week, moved through without thinking, closed honestly each night — that gives them back the two things every other tool takes: their attention during the day, and the truth about it afterwards. Unlike streak apps, planners, and doing nothing, it never pressures, never scores, never watches, and cannot see their data; the record is theirs, annotated, never rewritten.**

The shorter version, for the link you send: *A private daily list. Plan the week once, live the day without thinking, close it honestly. No streaks, no scores, nobody watching.*

---

## 1. The job (Compass)

### 1.1 The job as the person would say it

"I know what I want my days to look like. I don't want to decide it again every morning, I don't want to be nagged through it, and at the end of the day I want to know what actually happened — not be told I failed."

Three jobs are hired at once, and the product is built so that each is done completely rather than any of them halfway:

| Job | When it is hired | What "done" means to the person | Where the product does it |
|---|---|---|---|
| **Decide once, not daily** | Sunday night, or the night before a big day, with bandwidth | Tomorrow already has a list when I wake up; I did not have to think about it at 7am | Templates and the week build (Epic 1 §5–§6); materialisation is immediate (official §4.5) |
| **Get through the day without thinking** | Mid-morning, phone in one hand | I can see what is now, what is next, tick it, and get on; nothing asks me anything | The List and the Schedule (Epic 2); one decision per touch; no numbers, no questions on the tabs (Epic 2 §0.1) |
| **Know what happened, honestly** | 9–11pm, tired, possibly disappointed | I closed the day in a few taps, said why the misses happened, and the number describes the day I had — not a verdict on me | The Day Review with tiered reasons, the resolver, the number with its formula (official §7; Epic 3) |

### 1.2 The trigger moments

- **The Sunday reset** — the week ahead has shape and the person wants tomorrow to have a list.
- **The 7am glance** — the first look at the phone; the question is "what is now", not "what should I do with my life".
- **The bad morning** — overslept, a call ran long; the plan is already wrong and the person needs to re-fit the day in one gesture without pretending the plan was never there.
- **The end of day** — the moment most tools either shame or lie. The person wants to close the book and sleep.
- **The bad week** — the moment streak apps lose people. Synapse's whole design is that a bad Tuesday is a fact on Tuesday, not a debt carried into Wednesday.

### 1.3 The alternatives in the person's head

Positioning is against these, never against a named competitor:

| Alternative | What it does well | Why it gets fired |
|---|---|---|
| **Doing nothing** (the default) | Costs nothing; no app to maintain | Every morning re-decides the day; the evenings have no record; the week disappears |
| **A paper notebook** | Private, honest, quiet — the closest cousin | Cannot remind at 7:00; cannot re-fit a day; cannot tell you where the month went |
| **A calendar** | Fixed appointments, shared time | Treats a habit like a meeting; a missed block is just gone; no record of why |
| **A to-do list** | Tasks carry forward | No time, no day shape, no honest close; the list grows and shames by length |
| **A habit tracker with streaks** | A daily nudge, a satisfying grid | Sells the person to their own engagement: streak anxiety, loss framing, confetti, re-engagement pushes. One missed day breaks the chain and the person, and they leave (Sage, §5.3) |

The real competitor is the last row's *pattern*, not any one app: the engagement economy applied to a person's own intentions. Synapse is the deliberate opposite, and its refusals are the positioning (§4).

---

## 2. The value exchange (Compass)

People invest in outcomes. This is what the person gives, and what they get, stated so that both sides can be checked.

### 2.1 What the person gives

| The person gives | How much | Why it is a fair ask |
|---|---|---|
| **One planning session a week** — templates and a week build | Ten to twenty minutes on Sunday; under ten minutes for first run with the starter set (Epic 1 §8.1) | It is the *only* planning the product ever asks for; the morning asks nothing |
| **A tap per item during the day** | Seconds; one decision per touch | The day's interactions are the ones a person moving through a day actually needs — start, done, undo, shift, trim — and nothing configurable is reachable from the tabs (official §5) |
| **An honest close each night** | Three taps per undone item, maximum; leaving is always allowed (Epic 3 §0.1) | The reason is the price of the record being true; the product never forces it at 11pm — what is left becomes *pending*, visibly |
| **Their attention, only at the times they set** | Reminders are only the times the person assigned (official §8.1) | No notification ever reports a miss, a streak, a percentage, or absence (official §8.5) |
| **Nothing else.** No money (Phase 1). No data sold, no ads, no social graph, no coach reading their days | — | Row-level security makes the data unreadable to the people who built it (official §4.1; `SCHEMA_REFERENCE.md` §6); export and delete are one screen |

### 2.2 What the person gets

Stated as outcomes, each with the product fact that cashes it.

| Outcome | What changes in the person's life | Cashed by |
|---|---|---|
| **A day that does not need deciding** | The morning is execution, not deliberation. The list is already there, in time order, with *now* and *soon* marked | Immediate materialisation (official §4.5); day parts from the wake anchor (§6.4); the row's one word of state (§5.2) |
| **A day that survives going wrong** | Overslept? One gesture shifts every flexible item later, keeps the fixed ones, and says what no longer fits. Less time? One number trims the lowest-priority flexible items, unpenalised. Neither rewrites the plan; both annotate it | Shift my day (§5.6), capacity trim (§5.8), ruling R1: a trim is *not assigned*, never *missed* |
| **An honest record instead of a verdict** | A late start leaves a ghost at the planned time and a *moved* mark at the actual one. A miss carries its reason. The number, when it comes, is arithmetic the person can read | Ghost-and-annotate (§5.3); tiered reasons (§7.2); the formula printed beside every number (R6, §7.4) |
| **Relief from all-or-nothing** | A bad day is a bad day, not a broken chain. *Something came up* is not counted; *planned it wrong* counts half. The next morning is clean | The three tiers (R3, §7.3); no streaks (§2.4 guardrail 8); pending review never auto-resolves to missed (§7.2) |
| **Their attention back** | Nothing on the tabs counts, grades, pleads, or asks. Reminders arrive at the times they set, in their own words, and stop the moment the day is closed | Epic 2 §0.1's nine rules; official §8.1, §8.4 *Quiet after Day Complete* |
| **Knowing where the week went** | Which habits slipped, where the timed hours went by category, how templates were used — as counts and lists, never as a coach's opinion | Week Review strips and the category bar (§7.5); no coach (§7.7) |
| **Privacy that is a wall, not a paragraph** | Only they can read their record. Not the builder. Not anyone they invite. They can take all of it or delete all of it in one place | Owner-private RLS on every table; export as CSV and JSON; typed delete (§4.1, §7.6) |

### 2.3 The exchange in one sentence

**Plan once a week and be honest once a night; in return, live the day without being managed and keep a record you can trust.** Both halves are cheap by design, and the product is built so that the person can stop paying either at any time without being punished.

---

## 3. The benefits, from feature to outcome (Compass)

A ladder, so that a feature request can be checked against the rung it claims to serve. A feature that does not reach the top row is a candidate for the roadmap pins, not the build.

| Feature (spec) | Capability | Benefit | Outcome the person buys |
|---|---|---|---|
| Templates with offsets from an anchor (§3.4–3.5) | A kind of day described once, applied to any morning | No re-authoring; the whole plan slides to a 6:00 or an 8:00 start | Deciding once |
| Week build with materialisation (§4.5) | Tomorrow's items exist tonight, at absolute times | The list is real before the day; it works when the phone is offline at 7am (Phase 2) | Deciding once |
| Wake anchor sets `woke_at` (R5) | The day re-anchors to when it actually began | Day parts and reminders follow the real morning, not the planned one | A day that survives going wrong |
| Shift my day with a required reason (§5.6) | Every flexible item moves; fixed ones stay; the overflow is shown and cut by priority | One gesture instead of ten edits; the plan is annotated, not rewritten | A day that survives going wrong |
| Capacity trim, unpenalised (§5.8, R1) | The lowest-priority flexible items step aside for today | Less time is a decision, not a failure | Relief from all-or-nothing |
| Ghost-and-annotate (§5.3) | Late starts leave the planned time visible | The record is honest without being accusing | An honest record |
| Tiered reasons with honest weights (R1–R3, §7.3) | *Something came up* is excluded; *planned it wrong* is half; *didn't do it* is zero | Circumstance is not blame; scoping is information; choice is owned | An honest record; relief from all-or-nothing |
| Traded-up verification (R2) | "I stayed on something more important" is checked against the data | Honesty rewarded, self-report not required | An honest record |
| Pending review, never auto-missed (§7.2) | A tired night leaves items pending, visibly | The person is never forced at 11pm and never quietly penalised for sleeping | Their attention back |
| The number with its formula (R6, §7.4) | One inspectable percent per day and per week, with priority bands | A missed 7 cannot hide behind six done 1s; the arithmetic is readable | Knowing where the week went |
| Notifications as scheduled facts (§8) | Only the times set; nothing after Day Complete; never a miss | The phone is a notebook that speaks at the agreed hour, then stops | Their attention back |
| Owner-private RLS, export, delete (§4.1, §7.6) | The data is unreadable to the builder and portable to the person | Trust that does not depend on a promise | Privacy that is a wall |

---

## 4. Differentiation is what Synapse refuses (Compass, with Hearth)

Features can be copied in a quarter. Refusals that a business model forbids cannot. Synapse's durable difference is the list below, every line of which is enforced in the product's code or economics, not in its marketing.

| Refusal | Enforced by | Why a competitor funded by engagement cannot follow |
|---|---|---|
| **No streaks, badges, confetti, scores, or re-engagement pushes** | Official §2.4 guardrail 8; the palette has no alarm register (§9.3); the tabs carry no numbers (Epic 2 §0.1) | Their retention curve is the streak. Removing it removes the business |
| **Nothing red, nothing that flashes or counts down** | The destructive token is permitted on exactly one button (§9.3) | Urgency is the engagement economy's primary lever |
| **No second person on the tabs; no question the person did not come to answer** | Official §5.10, §10.4 | "You" is how a product talks a person into things |
| **A notification never reports a miss, a streak, a percentage, or how long since the app was opened** | Official §8.1, §8.5 | The absence-guilt push is the industry's highest-converting notification |
| **Only the person can read their data — not the people who built it** | Owner-private RLS on every table; no admin-read policy exists in the schema (`SCHEMA_REFERENCE.md` §6) | An ad or data business cannot make this promise; a coach product will not |
| **No social surface, ever** | Official §1.1 A4; "there is no one to be present to" (§9.8) | Social comparison is the second-highest lever |
| **No coach in Phase 1, and the data is kept clean enough that a future one could only describe, never judge** | Official §7.7 | The AI-coach category monetises judgment |
| **Archive, never delete; the record is annotated, never rewritten** | Cross-cutting §8; `original_scheduled_start` is immutable at the database (SET-1) | A product that lets the record be tidied is a product that lets it lie |
| **Free to try and free to leave: export everything, delete everything, one screen** | Official §4.1, §7.6 | Lock-in is a retention strategy; this product's retention has to be earned by usefulness |

**The category frame** (Hearth, §7.3): Synapse is not a habit tracker and not a productivity app. It is **a private daily list** — the official spec's own noun (§2.1). Accepting either incumbent frame inherits its graveyard: "habit tracker" means streaks and grids; "productivity" means dashboards and optimisation. The frame we defend is the notebook's.

---

## 5. What Synapse can honestly change, and why (Sage)

People invest in outcomes, so the claims about outcomes have to be true. This section grades every behavioural mechanism the product relies on, states the honest effect range, names what the product must not claim, and says why the refusals in §4 are not only ethics but the empirically stronger strategy for this audience.

**Grading vocabulary:** *replicated core* — survived the replication era with a stable effect; *measured* — real effect, moderate evidence, size known; *contested* — real but disputed in size or mechanism; *folk* — popular, not supported.

### 5.1 The behavioural facts of the product's shape

Synapse is genuinely **daily-habit-shaped** for the execution tabs and **weekly-ritual-shaped** for planning and review. That matters: importing habit machinery is legitimate here, where in an availability-at-need product it would manufacture engagement. The target behaviours, in observable terms:

1. The person opens today's list in the morning and acts from it rather than deciding afresh.
2. The person marks items done at or near the time they happen.
3. The person closes the day and attributes each miss to a tier.
4. The person plans the coming week from templates.
5. The person keeps doing 1–4 after a bad day and after a bad week.

Behaviour 5 is the one the whole product is designed around, and the one most habit products lose.

### 5.2 The mechanisms, graded

| Mechanism in the product | The science | Grade | Honest effect | Failure mode designed against |
|---|---|---|---|---|
| **Templates and the week build as implementation intentions** — "on Tuesday at 7:20 I will run" decided on Sunday, in a calm state | Implementation intentions ("when X, I will Y") are among the field's best-replicated tools for turning intention into action; meta-analytic effects are medium (roughly d ≈ 0.6 across goal domains) | Replicated core | Medium: materially more follow-through on planned actions than intention alone; not a guarantee | Over-planning fatigue — the product asks for one planning session a week, not daily re-authoring |
| **Fixed-time reminders in the person's own words** | Cue-based prompting at the moment of action; effective when the cue is specific and self-authored, ineffective or reactance-inducing when generic or evaluative | Measured | Small-to-medium on time-bound actions; effect decays if cues become noise, which is why there is one per item and none after Day Complete | Notification fatigue — official §8's catalogue is small, defaults are conservative, and nothing arrives that the person did not set |
| **Self-monitoring — the honest record** (done, moved, missed with reason, sessions) | Self-monitoring of behaviour is one of the most consistently effective behaviour-change techniques across domains (diet, activity, adherence); works through awareness and feedback, not judgment | Replicated core | Small-to-medium, sustained while monitoring continues; effect depends on the monitoring being *low-cost and non-evaluative*, which the tabs' no-numbers rule protects | Monitoring becoming surveillance — the tabs show no count; the number appears only after the person chooses to review |
| **Autonomy-preserving structure** — trim and shift as first-class, unpenalised; "not assigned today"; the person sets every reminder | Self-determination theory: autonomy, competence, and relatedness sustain behaviour; controlling structures and contingent rewards undermine intrinsic motivation | Replicated core (the autonomy–persistence link); the crowding-out magnitude is contested but the direction is stable | Sustained engagement without the drop-off that follows removed rewards; the product never had rewards to remove | Reactance — the audience is manipulation-literate; a controlling grammar would produce exit, not compliance |
| **Tiered attribution of misses** — circumstance / planned it wrong / didn't do it | Attribution and self-compassion literatures: attributing a lapse to circumstance or to a planning error, rather than to character, predicts recovery; global self-blame predicts abandonment | Measured (self-compassion and lapse recovery: moderate evidence, small-to-medium effects); the causal-attribution frame is well established | Small-to-medium on *persistence after a lapse* — behaviour 5, the one that matters most | The what-the-hell effect (§5.3) |
| **Fresh starts** — every day opens at day-close; every week starts Monday; pending is cleared, never carried as debt | Fresh-start framing: temporal landmarks increase goal-directed behaviour | Measured (field-observed, modest) | Small, but free — the product's day and week boundaries already are landmarks | Streak logic, which converts a landmark into a liability |
| **Ranges instead of point estimates; a capacity trim** | The planning fallacy — people systematically under-estimate duration and over-fill days | Replicated core | The trim and the range cannot fix optimism, but they make its consequence a one-gesture correction instead of a day of failure | Shame spirals from an over-planned day; the trim is *not assigned*, never *missed* |
| **Traded-up verification against the data** (R2) | Self-report of "I did something more important" is unreliable and self-serving; checking it against a completed higher-priority item makes honesty the easy path | Measured (stated-vs-revealed preference gaps are robust) | Keeps the record honest without accusing; the effect is on the *record*, not on behaviour | A reason set that becomes a set of excuses |

### 5.3 The mechanism the product is built to avoid

**The what-the-hell effect and streak collapse.** The dieting literature documented that a single perceived failure against an all-or-nothing rule produces disinhibition — "the diet is already broken, so…" (measured; moderate evidence in eating, weaker generalisation elsewhere). Streak mechanics manufacture exactly this rule: one missed day makes the chain "broken", and the loss-framed push that follows converts a lapse into abandonment. The best-known habit-formation field study also found that **missing a single day did not materially affect habit formation** (measured; one well-cited study, medium confidence) — which is the empirical case against treating a miss as a break. Synapse's three-tier attribution, its refusal of streaks, and its *pending, never missed* rule are the direct design consequences.

### 5.4 Why the refusals are the winning strategy, not just the ethical one

For a **manipulation-literate audience** — and anyone who has left a streak app is one — detected pressure produces the opposite of compliance: resistance, devaluation, exit. This is the reactance literature, one of the field's sturdier corners (replicated core in direction; magnitude varies). Add crowding-out: layering points and badges onto an intrinsically motivated activity (the person *already wants* to run, read, meditate) measurably reduces intrinsic motivation, and the behaviour collapses when the reward stops. The dark playbook is therefore **negative expected value on this audience**: it borrows short-term engagement against long-term trust, and Synapse's audience has already been burned by that loan once. The charter and the science agree.

### 5.5 What the product must never claim

- **Not "build a habit in 21 days" or "66 days".** The first is folk; the second is a median from one study with a range of 18 to 254 days. Synapse makes no timeline promise.
- **Not "transform your life", "become your best self", or any character claim.** Effects are small-to-medium and depend on the person; the product's own copy law forbids second-person evaluation (official §10.4).
- **Not "science-backed" as a badge.** Say what the mechanism is and what it does, in plain words, when asked. A badge is a claim without a grade.
- **Not "never miss again".** The whole design assumes misses; its promise is that a miss is a fact, not a verdict.

### 5.6 The honest outcome statement

*Synapse makes it more likely that the things you decided to do get done, by deciding once in a calm moment, reminding you at the times you set, and keeping a record that is honest about misses without punishing them — which is what lets people keep going after a bad day, and a bad day is where every other tool loses them.* Effects are real and modest; the product's job is to make them cheap and to get out of the way.

---

## 6. How the brand carries the proposition (Hearth)

The brand's raw material already exists and is largely settled law: the five pillars (§9.1), the emotional contract (§2.3), the registers (§9.3), the two typefaces with one job each (§9.4), the voice (§10), the trust line. This section does not restate the branding guide; it says how those settled things *carry* the value proposition, so that the brand and the pitch are one thing said twice.

### 6.1 The promise, stated so the person can hold us to it

**Nothing you did is lost; nothing is rewritten on your behalf; you are shown a record, not a verdict; you can undo this — and only you can see it.** (Official §2.3, plus the trust line.) Every screen is a test of that sentence, which is why the brand is built in the product's hardest moments — the bad morning, the tired night, the export screen — and not in marketing.

### 6.2 Pillars as proofs

| Pillar (§9.1) | The proposition it carries | The proof a person can check |
|---|---|---|
| **The record is honest** | An honest record instead of a verdict | The ghost at the planned time; the *moved* word; the reason on every miss; `original_scheduled_start` cannot be changed, even by us |
| **Assignment is the promise** | Relief from all-or-nothing | The trim is a first-class action with no penalty; the number counts only what was assigned |
| **Hosted, not sold** | Their attention back | No red in the palette; no streak, no confetti, no "you"; notifications only at the times set and none after Day Complete |
| **Quiet is the material** | A day that does not need deciding | Monochrome tabs, one accent that marks *time* and nothing else, a serif that appears only when there is bandwidth (§9.4) |
| **Your data is yours** | Privacy that is a wall | One trust line, one treatment, three places; export everything; delete everything; no admin read in the schema |

### 6.3 The arc: where the person starts, and what the brand does

The person arrives **worn by the category** — sold to, nagged, graded, and left with a grid full of gaps. The brand does not ask them to believe anything on arrival. First run offers a starter set with nothing pre-checked (*hospitality, not persuasion* — official §4.2); the first list appears without a permission prompt, a goal statement, or a tour. The arc is **from managed to hosted**: the product behaves like a considerate person keeping a notebook for you (§9.2), and the person stops examining the promise because it keeps being kept. Every messaging choice is checked against the start of that arc, not its end: a story that requires the person to already trust us has failed the brand's premise.

### 6.4 The enemy as a pattern

Never a named competitor. The enemy is **the engagement economy applied to a person's own intentions** — the streak, the guilt push, the confetti, the leaderboard, the coach that grades. Naming the pattern lets an ordinary person recognise it in any app, including ours if we ever drift.

### 6.5 The refuse-list of stories this brand never tells

- Transformation stories ("Synapse changed my life").
- Character stories (discipline, willpower, "the kind of person who").
- Streak or milestone stories ("100 days").
- Comparison stories (anyone else's numbers).
- Science-badge stories ("backed by research") without the plain mechanism beside them.
- Growth stories about the product itself ("join thousands"); official §4.1 forbids them in the product and the brand forbids them everywhere else.
- Any story in which a later product is what Synapse was "really for".

### 6.6 Two audiences, one story

There is no professional endorser in this category. The second audience is **the friend who sends the link** — the person using Synapse who wants someone they care about to have it. The messaging must let them share any artefact without flinching: no hype to apologise for, no claim the product will not cash, nothing that makes the friend a salesperson. ST-11's copy is the model: *Synapse is free. Anyone you share it with gets their own private list — you can't see theirs and they can't see yours.*

---

## 7. Messaging architecture (Hearth, with Compass)

Promise → pillars → proofs, at two altitudes, with claim grades and the never-tell list. Voice (Cantor) writes from this; design law wins on execution.

### 7.1 The promise (one sentence)

*A private daily list that gives you back your attention during the day and the truth about it afterwards.*

### 7.2 Three pillars, each with a proof

| Pillar | Person's altitude (the app, the landing line) | Friend's altitude (the share) | Proof |
|---|---|---|---|
| **Decide once** | *Plan the week on Sunday. The mornings are already decided.* | *You build the week once; every day already has its list.* | Templates, week build, immediate materialisation |
| **Live the day without being managed** | *No streaks. No scores. Nothing red. Reminders only at the times you set.* | *It never nags. It tells you the time you asked to be told, then stops.* | §2.4 guardrails; §8.1 and §8.5; the palette |
| **Close it honestly** | *A miss has a reason, and the reason decides how it counts.* | *A bad day is a bad day, not a broken chain. The number is arithmetic you can read.* | Tiered reasons; the formula beside every number; pending never auto-missed |

Underneath all three, the trust line, verbatim and unaltered: *Only you can see your data. Not the people who built this, not anyone you invite.*

### 7.3 The category frame

**A private daily list.** Never "habit tracker", never "productivity app", never "planner" as the noun. When a description needs a comparison, the comparison is to a notebook, not to an app.

### 7.4 The claims register

| Claim | Grade | May be said as |
|---|---|---|
| Deciding in a calm moment makes follow-through more likely | Replicated core (implementation intentions) | Plainly, without a citation badge: *Deciding once, when you have the bandwidth, is most of the work.* |
| Keeping an honest record helps | Replicated core (self-monitoring) | *A record you can trust is easier to keep.* |
| Blaming circumstance rather than character helps people keep going | Measured | *A bad day is a bad day.* Never as a promise about resilience |
| Streaks make people quit after one miss | Measured (what-the-hell effect; the single-miss finding) | *One missed day breaks a streak. It doesn't break a habit.* |
| Only the person can read their data | Fact (architecture) | The trust line, verbatim |
| Any timeline to a habit | Folk / one study's median | **Never** |
| Any transformation or character outcome | Not cashable | **Never** |

### 7.5 The never-tell list

Section 6.5, and official §10.4's words: *you failed, you're behind, don't break, streak, keep it up, great job, oops, unfortunately, we*, anything about the reader's character, anything in the second person on the execution tabs.

---

## 8. Pricing and the business model (Compass)

**Ruled (official §4.1):** free; nothing in the product references a plan, a tier, or a limit; no paywall components exist; invite by a shared link with no tokens or counts.

**What "free" says, and its risk.** Free positions Synapse as a notebook, not a service — right for the category frame. Its risk is the sentence every manipulation-literate person now knows: *if it's free, you're the product.* The trust line and the architecture behind it are the answer, and they must be visible where the person would ask the question — first run, Settings, export. That is already the ruling (one line, one treatment, three places).

**The unanswered question.** What sustains the product past Phase 1 is `[NEEDS DECISION — Taylor]`. Compass's recommendation, labelled as a thesis bet: keep Phase 1 free and single-player, and if a price ever arrives, make it a **flat, optional, pay-what-it's-worth contribution that gates nothing** — because a tier that gates the honest close, the export, or the reminders would break the promise in §6.1, and a tier that gates convenience features re-introduces the funnel this brand is the opposite of. Any pricing change is a one-way door: founder-decided, with Hearth on the brand cost and outside counsel on the business shape. **Displaced by this recommendation:** any Phase-2 revenue feature. **Falsified by:** a retention plateau (§9) with no sustainable way to keep the lights on.

---

## 9. Fit signatures, named in advance (Compass, with Sage)

So the team cannot grade its own homework after launch. Each is behavioural, not stated; each has a window.

| Signature | What fit looks like | Read by |
|---|---|---|
| **The second Sunday** | A person who built a week builds the next one, unprompted or from N6 alone | `days` rows with a template in week 2, per account |
| **The reviewed-day rate** | Days closed by *Finish review* (not auto-closed with everything pending) as a share of planned days, settling above one half by week 3 | `days.reviewed_at` vs `close_reason` |
| **Return after a bad day** | A day with two or more misses is followed by an opened List the next morning at the same rate as a good day | Day-after-open rate conditioned on miss count — **the signature that tests the whole thesis** |
| **Retention plateau** | Weekly actives flatten rather than decay to zero by week 6 (the plateau is fit; its height is scale) | Weekly active accounts, cohort by sign-up week |
| **The share** | A person who has reviewed ten days sends the invite link | ST-11 share/copy events (counts only — the product never shows them) |
| **Job language** | When asked what it is, people say "my list" or "my day", not "a habit app" | Research interviews (Envoy), stated-preference — labelled as such |

**Kill criteria, pre-committed:** if *return after a bad day* is materially worse than after a good day at week 6, the honest-record thesis is not doing its job and the Day Review's register is the first suspect; if the reviewed-day rate stays under a third, the close is too expensive and REV-2's three-tap budget is the suspect. Both are logged here so they are recalled, not renamed.

---

## 10. Open items and routing

| Item | Owner | State |
|---|---|---|
| Ratify this document's non-ruled sections (§1–§3, §5, §7–§9) | Taylor | `[NEEDS DECISION]` |
| What sustains the product past Phase 1 (§8) | Taylor, with outside counsel and Hearth | `[NEEDS DECISION]` |
| The landing page and share copy, written from §7 | Cantor (voice), reviewed by Hearth against §6 and Sage against §5.5 | Landing page drafted and reviewed — `docs/ux/landing-page-ux.md`, awaiting Taylor's approval; share copy is ST-11's as written |
| Research instrument for the *job language* signature | Envoy, audited by Sage for demand characteristics | Not started |
| Mature `docs/ux/branding-guide.md`'s §1–§2 from derived to settled using §6 here | Hearth → Taylor | Pending ratification of this document |
| Category steps, the app mark, the working name | Vesper / Taylor | Open (branding guide §13) |

---

*Compass, with Sage and Hearth. The job is decided once, lived without management, and closed honestly; the exchange is a week's planning and a night's honesty for a day's attention and a record you can trust; the difference is what the product refuses, enforced where a competitor cannot follow; and the outcome is modest, real, and the one every other tool loses on a bad Tuesday.*
