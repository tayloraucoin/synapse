---
title: Cycle charter (template)
description: Fill when a product team adopts fixed-time cycles; read before shaping, betting, or deciding whether unfinished work ships. Sets rhythm, appetites, the betting table, the circuit breaker, cool-down and discovery cadence.
layer: product
status: draft
thread: "05"
role: Compass
date: 2026-10-01
last_reviewed: 2026-10-01
supersedes:
load_when: spec, discovery
---

# [FILL: product] cycle charter — v[FILL: version, month year]

> **Who fills:** Compass with the decision-maker, once, before cycle 1.
> **Changes:** go through `docs/decisions/`. Change a default only by stating why.
> **What the critic checks:** nothing here. This charter governs the people, not the pixels.

**Why this exists.** We decide what a problem is worth before we build, we build it in fixed time, and we stop. Agents make building cheap. This charter protects the expensive parts: deciding, verifying, and learning.

1. **Rhythm.** Every two weeks: 8 build days, then 2 cool-down days. The betting table meets on the last cool-down day, 45 minutes maximum. The next cycle starts the following working day.
   - `[FILL: start weekday and cycle-1 dates]` — the calendar anchor, including holidays that shorten a cycle.
2. **Appetites.** Three sizes only.
   - **Big batch:** one full cycle, the whole build team.
   - **Small batch:** 1–3 build days, shipped inside the cycle.
   - **Spike:** 1 day or less, answers one named question, never ships.

   Anything bigger is split into sequenced bets, each worth shipping against today's baseline.

3. **Mode.** Declared at every table: **R&D** (spike, don't ship), **Production**, or **Cleanup** (pre-launch only, one cycle maximum, unshaped).
4. **The pitch is a brief and a package.** `specs/<feature>/brief.md` (frame, the "Frame go" gate) and `specs/<feature>/package.md` (clarity, the "Bet" gate), from the templates in `docs/product/`. A package with an empty field does not go to the table.
5. **Shaping.**
   - `[FILL: shaper role]` shapes on a parallel track. This is the person who frames problems and writes packages.
   - Each package gets one technical shaping session with a builder, 90 minutes maximum, in cool-down or a pre-booked slot. It is the only scheduled pull on builders mid-cycle.
   - Prototypes made before the table are evidence, not candidates: throwaway branch, never merged, and the question each answered written into the package.
6. **Betting table.**
   - **Seats:** `[FILL: decision-maker]`, who has the last word on whether we bet, and `[FILL: shaper]`, who brings packages and owns scope inside a bet.
   - **Builder veto:** builders read packages at least 24 hours before. Any builder can mark a package "not possible in this appetite", which returns it to shaping.
   - **Advisors** feed framing; they hold no seats.
   - **What's on the table:** only packages posted this cycle, or deliberately revived.
   - **Output:** the cycle plan (bets, people, mode), posted as a kickoff note the same day.
   - **If nothing is shaped:** a spike cycle or cleanup, never an unshaped bet.
7. **During the cycle.**
   - Builders own the project. They create scopes in `[FILL: tracker]` (the tool where scopes live); nobody assigns tasks.
   - Every scope is marked uphill or downhill. A scope unmoved for 2 days is a raised hand.
   - Day 4: a 10-minute async check; anything still uphill gets hammered.
   - **No interruptions, except** `[FILL: critical defect class]` — the one failure that breaks the product's core promise, fixed immediately, with the bet's scope (not its date) absorbing it.
   - Requests from `[FILL: stakeholders]` (customers, investors, sales: whoever generates raw ideas) go to the shaper as raw ideas.
8. **Verification is inside the cycle.**
   - No scope is done until its critic pass is clean: 3 breakpoints, every state, rubric scored, at most 3 rounds.
   - After 3 failed prompts on the same problem: hand-edit, or log the design-system gap.
   - Day 7: the shaper's edge pass on `[FILL: domain edge cases]` — the cases a rubric can't see (conflicting data, missing sources, extreme values).
   - Day 8: deploy.
9. **Done means deployed.** In production, behind a flag, events firing, critic pass clean, and enabled for at least one `[FILL: real customer environment]` — the unit a real user works in (account, workspace, site).
10. **Circuit breaker.**
    - At the end of day 8, unshipped work does not roll over.
    - One extension of up to 2 days (it eats cool-down) is allowed only if every remaining scope is downhill and a must-have, and only once per bet.
    - Otherwise the bet is killed, a one-paragraph lesson is logged, and it returns only as a newly framed pitch.
11. **Cool-down, in this order:**
    - (a) A written 30-minute readout of flags and replays, using `docs/measurement/metrics/readout.template.md`.
    - (b) Harness maintenance: update `AGENTS.md`, `DESIGN.md`, `anti-patterns.md` and the critic rubric from every failure this cycle.
    - (c) Non-critical bugs and small reactive items.
    - (d) The technical shaping session.
    - (e) The betting table.
12. **Discovery never stops.**
    - `[FILL: target]` customer conversations a week, with a floor of `[FILL: floor]`, on the shaper's track. Defaults: target 3, floor 2. The floor is what a bad week still delivers.
    - The opportunity solution tree is updated every cool-down.
    - Interviews double as assumption tests for prototypes.
    - Feedback goes to shaping, never straight to builders.
13. **Lists.** No central backlog. The shaper keeps pins; builders keep their own bug and tech lists; `[FILL: decision-maker]` keeps raw ideas. The default answer to a raw idea: "Interesting. Maybe some day."
14. **Retires.** `[FILL: planning habits this charter replaces]` — for example, a shared priority list, or review-meeting feedback turned into direction for builders.
15. **Review.** After cycle 3, through `docs/decisions/`.
