# The Spec System — how we plan, spec, build, and record work

> **A note before you read it.** This guide is Conscious Connections', copied
> whole because the *system* is what transfers: the ticket shape, the
> three-place completion protocol, the append-only logs, the kickoff contract.
> Its worked examples name CC's domain — couples, sessions, agreements — and
> are left as written. They are illustrations, not law; read them for the shape
> of a good ticket, not for facts about this product. Synapse's own facts are
> in `docs/ux/` and `docs/architecture/`.

**Owner:** Scribe (structure, format, craft) · **Content authorities:** Reeve (tickets, sequencing, logs), Mason (architecture, placement), Vesper (design law), Vigil (verification depth)
**Kind:** Guide — maintained, dated, verified against the corpus. Not a contract; where this guide and `codebase-conventions.md`, an `AGENTS.md`, or a track's own README disagree on a *factual* matter, those win.
**Version:** 1.0 · 2026-07-11

---

## 0. What this document is

This is the house's operating manual for the slice-spec system: the documents it is made of, the order they are written in, the anatomy of each, and the standards a ticket must meet before an agent is allowed to read it. It exists so that starting a new epic never again requires explaining the system from scratch — you name the epic, point at this file, and the roles know what to produce.

It is written primarily for the roles who author these documents (Reeve, Mason, Vesper, Scribe) and secondarily for the founder, who commissions them. The builders (Cursor, Claude Code) never read this file; they read its outputs.

**The one premise everything else follows from:** the workforce is AI agents with no memory between sessions, perfect diligence, and no ability to ask a follow-up. Every ambiguity in a spec is a coin-flip forced on a diligent builder. Every fact stated in two places is two behaviors waiting to diverge. Every unlogged decision is a landmine with a delay fuse. The documentation is not a record *of* the management — it *is* the management.

---

## 1. The document set

A track lives in `docs/specs/<track>/` and consists of exactly these kinds. Nothing else belongs there.

| Document | Kind | Job | Freshness model |
|---|---|---|---|
| `README.md` | Contract (per-track) | How to work this folder: kickoff contract, completion protocol, source precedence, locked scope, non-negotiables | Edited when the process changes; rarely |
| `00-build-order.md` | Contract (per-epic) | The ordered, checkable build queue: what to build, in what order, gated on what | Mirrors `PROGRESS.md`; corrected when a spec's `Depends on` disagrees (the spec wins) |
| `<ID>-<slug>.md` | Contract (per-ticket) | One implementable slice: outcome, constraints, acceptance | Frozen at authoring except its `Status:` line; departures go to `DEVIATIONS.md`, never back into the spec |
| `PROGRESS.md` | Record | The authoritative "what is Complete" view for the whole track | Ticked at closure. The only source of truth for Complete |
| `DEVIATIONS.md` | Record (append-only) | One line per intentional divergence from spec or handoff | Append-only. Never rewrite history |
| `TECHNICAL-DECISIONS.md` | Record (append-only) | One section per architectural choice that had real alternatives | Append-only |
| `_templates/slice-spec.md` | Template | The blank ticket | Updated when the ticket format itself evolves |
| A governing UX handoff | Contract | Product behavior source of truth for the epic; its Decision Log is binding | Versioned; superseded versions archived, never cited |

Two documents sit **outside** the track folder but govern it:

- **The product-wide UX handoff** (`docs/ux/ux-design-handoff-v1.3.md`) — §11 Rationale Log is binding law for the Conflict Resolution product. Epic-specific handoffs (`voice-session-ux-handoff-v0.1.md`, `affiliate-crm-ux-handoff-v0.1.md`) govern their own epics and carry their own decision logs.
- **The architecture contracts** — `codebase-conventions.md` (locked), the domain guides, and the nearest `AGENTS.md` (which wins over the conventions doc for its own app's specifics).

---

## 2. The lifecycle

Work moves through six stages. Each stage has one owner and one output. Skipping a stage is how epics arrive at the builder ambiguous.

```
1. Founder brief        → Taylor          → the ask, the constraints, the roles
2. UX handoff           → Vesper          → the decision log + the behavior spec   [when there is a surface]
3. Architecture pass    → Mason           → placement, data contract, the routed calls
4. Build order          → Reeve           → the dependency graph + the phased queue
5. Ticket authoring     → Reeve (+Mason)  → one spec per slice, in authoring batches
6. Build + closure      → the agent       → code + three-place closure
```

**Stage 2 is skippable only when the epic has no surface** (a schema epic, a contract epic, a pure-infrastructure epic). When there is any pixel, Vesper rules first and the tickets cite her decision log by ID. Tickets that invent UX because no handoff existed are the most expensive kind of rework in this system, because the invention arrives already built.

**Stage 3 and 4 interleave.** Mason's placement calls and Reeve's dependency graph inform each other: a placement decision often creates or dissolves a dependency. Run them as one conversation with two outputs.

**Stage 5 is batched.** See §7.4.

---

## 3. The founder brief (stage 1)

This is what *you* write to start an epic. It is short. It is not a spec — it is the commission. What makes it work is that it names the roles, the constraints, the deliverable shape, and the process, so the roles do not have to guess which hat they are wearing.

The shape that has worked:

```markdown
Role: <the lead role, with its role-prompt filename>
Support: <other roles, with filenames>

Task: <one sentence — what is being built, for what tool/app>

Attached:
* <codebase briefing, conventions, README>
* <the raw material — a CSV, a screenshot set, a research doc>
* <exemplar tickets — "here is what good looks like">

Deliverable:
* <the artifact shape — e.g. "a series of markdown files: build order + task tickets">

Should include:
* <the hard constraints, as bullets — surfaces, sources, must-haves>
* <"best standard practices for this context" is a legitimate line; it licenses judgment>

Process:
* <who goes first, what they hand to whom, in what order>
```

**Why each part earns its place:**

- **Role + support** determines whose judgment fills the gaps. A brief without roles gets you a generic answer.
- **Attached exemplars** are the single highest-leverage item. "Here are three prior tickets" teaches the format faster than any description of the format.
- **Should include** is where you spend your constraints. Be specific about the ones that are actually load-bearing (`use the current CSV as the input source and headers`) and explicitly delegate the ones that aren't (`designer's pick`).
- **Process** prevents the roles from collapsing into one voice. Naming the handoff order — Vesper rules, then Reeve and Mason spec, then Reeve writes tickets — is what makes the output feel authored rather than generated.

---

## 4. The UX handoff (stage 2)

Vesper's output. Not a mockup — a spec a developer or agent can build from without a follow-up question.

**Required sections:**

1. **Frame** — who is here, in what state; the one job of the surface; the register (which side of the product's line this sits on). Two paragraphs, no more.
2. **Information architecture & routes** — the actual paths, the actual URL state.
3. **The surfaces** — one section each, with layout, content, and every interactive element's behavior.
4. **States** — default, hover, active, focus-visible, disabled, error, loading, empty, offline. A component is not designed until these exist. This is the section that separates a real handoff from a picture.
5. **Accessibility** — the specific traps of this surface, checked; not a generic WCAG paragraph.
6. **Decision Log** — the numbered, ID'd rulings (`D-CRM-1`, `D-v13`, `D-AFF-8`), each with its status: **Ruled**, `[PROVISIONAL]`, or `[NEEDS DECISION]`. **This log is what the tickets cite.** A ruling not in the log will be re-litigated by the next thread.
7. **Open items routed onward** — what goes to Mason, what goes to the founder, what goes to a later ticket.

**The decision log is the load-bearing part.** Everything else in the handoff can be re-derived; the rulings cannot. Give every ruling an ID, a one-line statement, and a status. Tradeoffs stated out loud ("we lose scanability, we gain intimacy — intimacy is the brand") make a ruling defensible six sessions later; a ruling without its tradeoff gets reopened by anyone who notices the cost.

---

## 5. The track README (stage 4, written once per track)

Written once, when a track is created. It is the source of truth for *the build process*; the UX handoff is the source of truth for *product behavior*. It contains:

1. **Folder layout table** — what each subfolder holds and its status (Shipped / Scoped / Scoping in progress).
2. **The kickoff contract** — the verbatim block a fresh thread is given. See §9.
3. **The completion protocol** — three-place closure, spelled out. See §10.
4. **Build order & current status** — one line per batch, pointing at its build-order file.
5. **Source precedence** — the numbered ladder for when documents disagree. For the CR track:
   1. Product behavior → the UX handoff (its Rationale Log is binding)
   2. Architecture / placement → `codebase-conventions.md` + the nearest `AGENTS.md`
   3. App rules & scope → the app's `AGENTS.md` (wins on conflict with the conventions doc)
   4. **On-disk reality + `DEVIATIONS.md` override any stale string in a spec or the handoff**
6. **Locked scope (do not re-litigate)** — the v1 boundary, stated as a list.
7. **Non-negotiables** — the product laws every ticket honors, in one place, so tickets can cite rather than restate.
8. **Canonical paths & known-stale warnings** — the paths that are real, and the older strings that are wrong. This section pays for itself the first time an agent tries to write to a route that was renamed three months ago.

---

## 6. The build order (`00-build-order.md`)

Reeve's output. The epic's dependency graph made checkable. It is derived from each spec's `## Depends on` section, and **when the two disagree, the spec wins and this file gets fixed.**

**Required sections:**

| Section | What it does |
|---|---|
| Header note | Points at the track README for the process; states what this file is (the ordered queue) and is not (a second source of truth for Complete) |
| **How to work this file** | Find next unchecked ticket → confirm its gate in `PROGRESS.md` → build one ticket per thread → close in three places → tick the box here |
| **Critical path** | The sequential spine as an ASCII arrow chain: `AFF-1 → AFF-3 → AFF-4 → AFF-5 → AFF-9B`. One line. It is the thing you look at when you have one day |
| **Build-order checklist** | Phased checkboxes. A phase is a build *wave* — everything in one phase is parallelizable once prior phases are done. Each line: ID · title · size · dependency set in parentheses · flags (Vigil, Mason review, launch-blocking) |
| **Ordering constraints** | The *why* behind the order, especially where alphabetical order hides it. "AFF-5 precedes AFF-9B — paying before clawback exists creates unrecoverable overpayment paths." This section prevents a well-meaning agent from reordering the queue |
| **Full dependency table** | Ticket → Complete-required dependencies. Redundant with the checklist on purpose: it is the machine-readable view |
| **Ticket-authoring batches** | Distinct from build phases — which tickets get written in one authoring thread, and why they group. See §7.4 |
| **Locked references** | Decision IDs that must not be re-litigated; the binding law that applies to this epic; where whole-track status lives |

**Two rules that keep this file honest:**

- **The checkbox mirrors a completion event; it is never the event.** `PROGRESS.md` is authoritative. If they disagree, `PROGRESS.md` wins and this file is stale.
- **Name what does *not* gate.** "Nothing in AFF gates the CR launch" is as valuable as the critical path. It stops a future session from treating a fast-follow as a blocker.

---

## 7. The ticket spec — the anatomy

This is the core of the system. One spec = one ticket = one thread. The spec is a **self-contained implementation contract**: an agent given this file plus its attach-list can build the slice without asking a question.

### 7.1 The canonical section order

Every ticket has these sections, in this order. Sections that don't apply say so explicitly ("**AI notes: none.**") rather than being omitted — silence is ambiguity, and an agent reads a missing section as "figure it out."

```
# <ID> — <plain-language title>

**Epic:** … · **Phase/Week:** … · Size: S|M|L
**Slice type:** <one line: what kind of work this is, and what class of failure it risks>
**Vigil:** <review flag, when the slice touches a risk surface>
**Status:** Not started | Draft → ready for execution | Complete (YYYY-MM-DD)

> <Review callout — Vigil depth, Mason migration review, content flags>

---

## Outcome
## Why / intent
## Rulings this slice makes (labelled, logged)     [own H2, or nested in Why]
## Experience & states                              [or: Behavior & states]
## Non-negotiables (this slice)
## Data & AI
## Accessibility
## Acceptance criteria (observable)
## Likely-relevant technical notes (ADVISORY — dev decides)
## Dev's call
## Out of scope
## Depends on
## Recommended Cursor execution

### Cursor kickoff (paste into the session)
```

### 7.2 Section by section

---

**Title.** `# SES-4 — Coach Privately: the side-channel, the clarification loop, "[Name] is saying…"`

The ID, then a title that states the *contents*, not the component name. A future session searching for "the queue contract" should be able to find the ticket that owns it. Colons and subclauses are welcome; cleverness is not.

---

**Metadata block.**

- **Epic** — the epic name and its one-phrase identity ("SES — Session/Chat (the heart)").
- **Phase / Week** — where it sits in the build wave.
- **Size** — S / M / L. Sizing is about *reasoning* load, not line count: a 40-line clawback engine is L because the edge cases are the ticket; a 400-line table view is L because it is broad but shallow. Use it to set expectations, not estimates.
- **Slice type** — one line naming *what kind of work this is and what class of failure it risks*. This is the most under-used field and the most useful. Examples: "Money-adjacent core — the engine's mirror. The edge cases *are* the ticket." · "session infrastructure hardening (risk surface — mid-fight failure class)" · "Contract / types — no UI, no capture, no runtime pipeline." It tells the builder how to hold the work before they read a word of the spec.
- **Vigil** — present only when the slice touches a risk surface. When present, it says *how* to review, not that review exists: "review by *inducing* network conditions: hard disconnect mid-compose, disconnect mid-send…"
- **Status** — the at-a-glance signal a future thread sees on opening the file. One of: `Not started` · `Draft → ready for execution (authored YYYY-MM-DD)` · `Complete (YYYY-MM-DD)`.

---

**The review callout (blockquote).** Used when a slice needs a named authority's eyes before or during the build. Three flavors:

- **Vigil depth** — an enumerated review list, ending with what QA must *state* about its run ("QA states which path it exercised — unpaid-full · unpaid-partial · paid-full · paid-partial · chargeback · replay · nothing-to-reverse"). Naming the paths is what stops happy-path verification.
- **Mason review** — for migrations and irreversible calls: "This slice proposes… Two design calls are explicitly routed to you: (1) column placement… (2) ledger FK on-delete semantics. Recommended designs are stated inline; counter-propose in `TECHNICAL-DECISIONS.md`."
- **Content flags** — e.g. SAF-3's `⚠ D-4 CONTENT FLAG`: mechanics ship, content is flagged unreviewed pending legal. Names what is provisional in the *output*, not just the process.

---

**## Outcome**

One paragraph. Prose, not bullets. It describes the world *after* the slice ships, in the language of the person or system that experiences it — not the components that produce it.

The test: could a builder read only this paragraph and know whether they had succeeded? SES-9's Outcome ends "SES-1's crude 'visible line + refetch' hardens into the §6.10 contract: **session recovery that loses nothing.**" That is a success condition, not a description.

Close the Outcome by naming what is *not* in this slice but is adjacent, so the builder does not wander: "No affiliate sees this yet (AFF-7); no money moves here (AFF-9B)."

---

**## Why / intent**

Bulleted. Each bullet is a citation to an authority plus what it obliges. This section exists so the builder can distinguish a rule from a preference — and so a future session can tell whether a change is a fix or a re-litigation.

What belongs here:

- **Handoff and decision-log citations by ID/§:** "§6.5's offline contract, verbatim: 'websocket drop mid-fight → `ReconnectingState` with local buffering…'"
- **What this slice is NOT** — a bolded, binding negative, where the risk of scope drift is real: "**What this slice is NOT (binding, §3.2.1 + DEVIATIONS 2026-07-01):** there is **no route wall**… Never re-introduce a route-level paywall."
- **Ground truth** — what exists on disk and is consumed, never rebuilt: "`subscriptions`, `entitlements`, `billing_events` are live and are **consumed, never rebuilt**."
- **Boundaries that must stay crisp** — where two mechanisms could be confused: SES-9's separation of the *substate queue* from *network catch-up*, with the consequence of conflating them stated ("network flaps would mutate session state").
- **Prior slices this one consumes** — by name, with what it takes from them.

---

**## Rulings this slice makes (labelled, logged)**

Either its own H2 or the last block of `Why`. This is where the ticket **decides something the docs had not decided**, and it is the mechanism that keeps the corpus honest.

Every ruling carries: the decision, the reason, the status marker, and the word **Logged**.

```markdown
- **The ledger is append-and-mark, never destructive.** The invariant is that
  `sum(ledger)` is reconstructible from billing events. An unpaid reversal marks the
  original `reversed`… A post-paid clawback **appends** a negative-amount row… Logged.
- **Partial refunds reverse proportionally** — reversed amount = original × (refund ÷
  invoice), rounded consistently. `[PROVISIONAL — Gardner]`. Logged.
```

**The rule that makes this section trustworthy: never silently invent a value for a flagged-open item.** If the docs left it open, the ticket either surfaces it as `[NEEDS DECISION]` or takes a **reversible default, clearly labeled**, with the cost of being wrong stated. Silent invention is the one failure the slice system cannot recover from — it corrupts the ground truth every future session reads.

---

**## Experience & states** (or **## Behavior & states** for non-visual slices)

The behavioral core. Subsectioned by surface or by phase of the flow. Three things must appear:

1. **The happy path**, in enough detail that no layout decision is left to the builder that the designer already made.
2. **The exhaustive state list.** For a UI slice: default, loading, empty, error, disabled, offline, and every state the domain adds. For a non-UI slice: every reachable state of the entity, enumerated. AFF-5 lists its states as *reversal scenarios* — unpaid-full, unpaid-partial, paid-full, paid-partial, chargeback, replay, nothing-to-reverse — because those *are* the states.
3. **A named failure-state block.** "Failure states (named, per the risk contract)." A failure that is not named in the spec will not be built, and will be discovered in production by the person the product exists to protect.

For a slice with no surface, say so plainly and describe the observable state anyway: "**No surface.** Invoked when the marketing webhook persists a reversal-triggering billing event. Described by the state of the originating commission."

---

**## Non-negotiables (this slice)**

Five to seven bolded imperatives. Not the product's whole law — *the subset that binds this slice*, so an agent under time pressure has a short list it cannot trade against.

The house rule: **if the spec would force a builder to break one of these, they STOP and ask.** Say that in the kickoff. A non-negotiable an agent can silently work around is a suggestion.

```markdown
- **Reverses exactly once.** Idempotent; `reversed_at` guards against double reversal.
- **No money pulled back via Connect (v1).** Recovery is by debiting future payouts only.
- **Ledger reconstructible from billing events.** Append-and-mark, never destructive.
```

---

**## Data & AI**

The contract layer. Six labeled parts; each says "none" explicitly when it is none.

- **Schema changes:** one of `none` · `described` · `possibly — describe; human-review migration; DEVIATIONS.md`. Never left implicit. When described, enumerate the migration groups with columns, types, nullability, FK on-delete semantics, and indexes.
- **Tables:** every table touched, with the access mode in parentheses (`read` / `service-role write` / `seed`).
- **Placement:** where the code goes, by exact path, and *who decided*. If it inherits a prior slice's placement call, say so and say whose ("Mason placement call inherited from AFF-4; reuse that decision").
- **tRPC / validators:** the procedures and their Zod homes — or `none — no procedure, no read, no write in this slice`.
- **AI notes:** the touchpoint, streaming vs structured, whether placeholder prompts are acceptable — or `**None.** No `ai_touchpoint`, no `ai_interactions`, no prompt.` Where a safety classifier interaction is implied but not certain, say **confirm, don't assume**.
- **Instrumentation (forward-contract):** the event names and payload shapes a later instrumentation ticket will wire, with the privacy constraint restated inline (`no customer identity, §10.3`). Defining events here and activating them later is how the event vocabulary stays coherent across an epic.

---

**## Accessibility**

Specific to this surface. Not a WCAG recitation — the traps *this* screen has. "Pills meet AA at their rendered size (the muted-below-14px trap is checked first)." "Connection-state changes announce politely and singly; no announcement storms across flaps." For a slice with no surface: **None — no surface in this slice.**

---

**## Acceptance criteria (observable)**

The objective of the ticket. Everything else is context and constraint; *this* is what "done" means.

Rules:

1. **Numbered, and each one observable.** A criterion that cannot be checked by looking at the running system, the database, or a build output is not a criterion. "Works correctly" is a defect in the ticket.
2. **Attribute the reviewer inline** where a criterion belongs to a role: `*(Vigil.)*` `**[Gardner — proportional rule, [PROVISIONAL].]**`
3. **The edge cases go here, not only in the prose.** If the spec's whole risk is the paid-then-refunded case, there is a numbered criterion for the paid-then-refunded case.
4. **Verification is a criterion.** The last line is always mechanical: "`yarn check-types` and `yarn build` pass." On UI slices: `yarn lint && yarn lint:boundaries && yarn check-types && <app>:build`.
5. **State the conditions of verification in the heading** when they matter: "Acceptance criteria (observable — two devices throughout; fault-injection for failure paths)" or "(observable — induced network conditions on two devices throughout)".
6. **Negative criteria are criteria.** "No route in the app gains a subscription wall — verified by navigation while free." "No AI touchpoint fires."

---

**## Likely-relevant technical notes (ADVISORY — dev decides)**

The label is doing real work: it marks this section as *not binding*. This is where authoring knowledge that would otherwise be lost gets written down without becoming an instruction the agent will follow off a cliff.

"Reuse AFF-4's placement + basis functions — the reversal amount derives from the same NET figures; don't fork the basis math." · "Realtime is overkill here." · "RevenueCat-class entitlement abstraction: the `entitlements` table *is* the v1 abstraction — don't add a vendor layer now."

---

**## Dev's call**

The explicit list of what the builder decides. This is the counterweight to the non-negotiables: naming what is free prevents an agent from treating the whole spec as equally rigid, and prevents it from asking about things it is allowed to just decide.

"Parse library · wizard state held client-side vs nuqs · error-report shape · the exact normalization slug rules (documented in code)."

Anything in this list that has real alternatives lands in `TECHNICAL-DECISIONS.md` at closure.

---

**## Out of scope**

Load-bearing, not decorative. Each line names the thing *and where it actually lives*, so the boundary is a routing instruction rather than a prohibition:

```markdown
- **Pulling paid funds back from affiliates** — never in v1; debit future payouts only.
- **Accrual of positive invoices** — AFF-4.
- **Executing or netting the actual payout** — AFF-9B consumes the debit; AFF-5 only records it.
- **Any affiliate-visible surface** — AFF-7.
```

An out-of-scope list that only says "no" invites the agent to relitigate. One that says "no, and it lives there" closes the question.

---

**## Depends on**

The gate. Every entry must show **Complete** in `PROGRESS.md` before the ticket is built — *marked, not remembered*. Name the dependency and what is taken from it: "**SES-1** — Complete required (message model, ordering, delivery-status, channel, `ReconnectingState`, settle grammar)."

If there are none, say so: "**No slice dependencies.**"

---

**## Recommended Cursor execution**

Which model, and *why* — the why is what makes it trustworthy rather than superstitious.

- **Opus** when the slice's value is in its edge cases, its irreversibility, or its cross-system coordination. "A cheaper model reverses the happy path and quietly corrupts the ledger on the paid-then-refunded case."
- **Sonnet** for hardening a settled model, or for coordination-light work with one careful mechanism. "Not Composer: exactly-once under flap deserves a full pass."
- **Sonnet / Composer** for mechanical authoring against a precise spec where the risky reasoning is already pinned by the ticket.

State the failure mode of choosing down. That sentence is the whole point of the section.

---

**### Cursor kickoff (paste into the session)**

The last section, and the one that gets used most. A self-contained block the founder pastes into a fresh thread. It contains, in this order:

1. **The instruction and the model.** "Build **AFF-5 — Clawback** (attached spec). Model: **Opus**."
2. **The one-line law of the slice, in bold.** "**Reverse exactly once; never pull money back via Connect; keep the ledger reconstructible from billing events.**"
3. **The attach-list, in reading order.** This is the most valuable line in the ticket. It is an ordered list of every document the agent must read *before* writing code — the spec, the app's `AGENTS.md`, the root `AGENTS.md`, the handoff sections by §, the prior tickets it consumes (labeled "reuse, don't fork"), the schema reference, and always `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` last, because on-disk reality overrides the spec.
4. **The restated constraints** — three or four sentences of the non-negotiables in imperative form.
5. **The closure instructions** — `PROGRESS.md`, `DEVIATIONS.md`, `TECHNICAL-DECISIONS.md`, and the verification commands.

### 7.3 Sizing

| Size | Means |
|---|---|
| **S** | One surface or one mechanism, precedented, few states |
| **M** | A surface with a full state matrix, or a mechanism with real edge cases, or a schema with review-worthy calls |
| **L** | Multiple surfaces, cross-app coordination, a state machine, or a slice whose edge cases *are* the work |

Size is a reasoning-load signal for model selection and thread budgeting. It is not an estimate and it is never a commitment.

### 7.4 Authoring batches

Ticket *authoring* batches are distinct from build *phases*. A batch is what one Opus thread writes in one sitting.

- **Three tickets is the ceiling** per authoring thread at full quality.
- **Two of size L plus an S is the heaviest safe mix.**
- **Group by shared model, not by phase.** "AFF-4, AFF-5, AFF-8 — the commission ledger's write path; clawback is the engine's mirror; events name both." A batch whose tickets share a data contract produces tickets that agree with each other.
- **Split permission is stated in advance:** "Split permitted (AFF-7 alone, then 9B+10) if depth demands — say so at kickoff and I will split."

Mid-run, when a thread is running long, compress into a dense handoff file (`01-authoring-handoff-remaining-tickets.md`) rather than degrading the last ticket. A thin ticket is more expensive than a second thread.

---

## 8. The logs

### 8.1 `PROGRESS.md` — the record of state

The **only** authoritative answer to "is this Complete." A row per ticket: ID, title, dependencies, status, date. Plus a checklist mirroring the build order. Nothing else. No narrative, no commentary.

A downstream ticket is not started until every entry in its `Depends on` is ticked here. "Basically done" is not a status.

### 8.2 `DEVIATIONS.md` — the record of departure

Append-only. One line per intentional divergence from a spec or the handoff. House format, exactly:

```
YYYY-MM-DD · <ticket-id> · <what changed> · <why>
```

**A build that never deviates is a build nobody looked at closely.** The sin is never the departure — it is the *undocumented* departure, which the next session inherits as invisible ground truth. When a spec's string no longer matches what shipped, the spec is not edited; a line is appended here. On-disk reality plus this log override any stale string anywhere in the corpus.

### 8.3 `TECHNICAL-DECISIONS.md` — the record of choice

Append-only. One section per architectural choice that had **real alternatives**. Not every decision — the ones where a future engineer would otherwise ask "why on earth."

Shape (the fast-lane ADR):

```markdown
## YYYY-MM-DD · <ticket-id> · <the decision, as a statement>

**Context (as it was then):** …
**Options weighed:** A … B … C …
**Decision:** …
**Consequences:** what this buys, what it costs, what it forecloses.
**Revisit trigger:** the condition under which this should be reopened.
```

Written when the decision is made, never reconstructed archaeologically. An ADR is a gift to a stranger — and the stranger is usually you, in six weeks, with no memory of the tradeoff.

---

## 9. The kickoff contract

The verbatim block a fresh build thread receives, alongside the ticket. It lives in the track README and is quoted, not paraphrased.

```
You are building ONE ticket from docs/specs/<BATCH>/: <TICKET-ID>.

OBJECTIVE
Ship the ticket's Acceptance criteria — nothing more (scope creep), nothing less.

BEFORE WRITING CODE
1. State the ticket ID and title in your first message.
2. Confirm every entry in the ticket's "Depends on" shows Complete in PROGRESS.md.
   If any dependency is not Complete, STOP and say so — never build ahead of it.
3. Read the ticket spec end to end, then its attach-list in order.
4. Read DEVIATIONS.md and TECHNICAL-DECISIONS.md — on-disk reality + those logs
   override any stale string in a spec or the handoff.

CONSTRAINTS
- Honor every non-negotiable verbatim. If the spec would force you to break one,
  STOP and ask — never silently contradict it.
- <house rules: routes from lib/routes.ts; client leaves in _components/ with
  'use client' line 1; Server Components default; v1 scope boundaries>
- If you modify files owned by an upstream Complete ticket, re-check that ticket's
  affected acceptance criteria before finishing.

DEFINITION OF DONE
1. <verification commands> pass.
2. Happy path exercised against local Supabase when the slice touches DB/tRPC flows.
3. The ticket's Status line set to: Status: Complete (YYYY-MM-DD).
4. PROGRESS.md row + checklist ticked.
5. One DEVIATIONS.md line per divergence: YYYY-MM-DD · <ticket-id> · <what> · <why>.
   Architectural choices with real alternatives → TECHNICAL-DECISIONS.md.
6. <directory map / schema reference regeneration if files or schema changed>
7. Close with 3–5 lines: what shipped, deviations, the one thing the next ticket
   must know.

Do not start the next ticket.
```

**On relaxing "one ticket per thread":** it is permitted (a Claude Code session building a whole small epic), but it is a *deviation* and gets a `DEVIATIONS.md` line on day one, plus a hard checkpoint between tickets — three-place closure, a five-line report, and a context clear before the next attach-list is read. The per-thread rule exists to protect ground-truth integrity; if you relax the rule, you must preserve the thing it protects.

---

## 10. Closure — the three places

A thread is not done until all three are updated. Every time, no exceptions.

1. **The ticket file's `Status:` line** → `**Status:** Complete (YYYY-MM-DD)`. This is the at-a-glance signal the next thread sees the moment it opens the file.
2. **`PROGRESS.md`** → the row and its checklist items. The whole-track view.
3. **`DEVIATIONS.md`** → one line per intentional divergence. (Plus `TECHNICAL-DECISIONS.md` when the slice made an architectural choice.)

Then, and only then, tick the box in `00-build-order.md` — which mirrors the completion event and is not a separate source of truth.

"The agent said done" is not done.

---

## 11. Cross-cutting conventions

### 11.1 The marker vocabulary

These are load-bearing words. They are honored as written, preserved verbatim through any restructuring, and never tidied into false confidence.

| Marker | Means | Who resolves it |
|---|---|---|
| `[PROVISIONAL]` | A ruled, reversible default is in force awaiting ratification. Build against it | The founder, or the named role |
| `[NEEDS DECISION]` | Genuinely open. **Must not be silently resolved by an AI.** | Named owner; blocks the tickets it blocks |
| `[NEEDS DECISION — BLOCKING]` | Open *and* the downstream ticket cannot be written until it closes | Founder, urgently |
| `[PENDING]` | Awaiting an input that is expected (a vendor answer, a legal review) | Named owner |
| `[REVISIT]` | Settled for now; a named condition should reopen it | Whoever hits the condition |
| `[NEEDS VALIDATION]` | A hypothesis, honestly labeled | Research / real users |
| `[ASSUMPTION: …, reversible, logged]` | Mason's inline form when proceeding without an answer | Logged at closure |
| `[NEEDS VALUE AT BUILD]` | The builder must read the real value from the running system — **never guess** | The builder, who states what they found |

### 11.2 Decision IDs

Every ruling that outlives its ticket gets an ID and a home in a decision log: `D-07`, `D-v13`, `D-AFF-8`, `D-CRM-1`. Tickets cite by ID. **Re-opening a logged decision requires new evidence routed to the founder** — not a preference, not a fresh opinion, and never a quiet workaround inside a ticket.

### 11.3 Risk-weighted attention

Not all slices are equal, and treating them as equal under-protects the ones that matter. The two worst failure modes in this product are **mid-fight** (a dead end in the session UI) and **trust-breaking** (a privacy, safety, or consent violation). Slices touching those get:

- a **Vigil full-review flag** with an enumerated induction list,
- **explicit failure-state acceptance criteria**, not just happy-path ones,
- and **Opus**, with the failure mode of choosing down stated in the ticket.

A settings copy change gets a light touch and moves on.

### 11.4 What never varies

- **One fact, one home.** Rates are data, not constants. Labels are in `@syn/constants`, not the enum. Route paths come from `lib/routes.ts`. A fact stated in two places will drift.
- **No tests mid-slice.** Tests are a finalization pass after human QA. An agent adding tests mid-slice gets that flagged as scope, not thanked for diligence.
- **Verification is mechanical and reported.** `check-types` + the build, every time. "Should work" is not a status.
- **No real relationship content, real PII, or real secrets** in any example, fixture, or sample payload — anywhere in the corpus, for any reason.

---

## 12. The pre-flight check (before you hand an agent a ticket)

Run this list. It takes two minutes and it is the cheapest defect prevention available.

- [ ] Could a builder who has never seen this repo build the slice from this file plus its attach-list, without asking a question?
- [ ] Is every Acceptance criterion **observable** — checkable in the running system, the database, or a build output?
- [ ] Does the edge case that makes this slice risky have its own numbered criterion?
- [ ] Does `Data & AI` say `none` explicitly wherever it is none?
- [ ] Is every `[PROVISIONAL]` / `[NEEDS DECISION]` marker in the source docs either honored, or resolved with a labeled reversible default and its cost stated?
- [ ] Did the ticket invent anything the docs should have decided? If yes: it is labeled and logged, or it is removed.
- [ ] Does `Out of scope` name where each excluded thing actually lives?
- [ ] Does `Depends on` list only things that are, or will be, marked Complete in `PROGRESS.md`?
- [ ] Does the `Cursor kickoff` attach-list end with `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`?
- [ ] Does the model recommendation state the failure mode of choosing down?

---

## 13. Anti-patterns

**In tickets:**

- Vague acceptance criteria; "works correctly"; happy-path-only criteria on session, safety, privacy, or billing surfaces.
- Silent invention of a value the docs left open.
- A missing section instead of an explicit "none."
- An `Out of scope` list that prohibits without routing.
- Relitigating a binding decision-log row through ticket text.
- A non-negotiable an agent can work around without stopping.
- Tickets written for a surface that has no UX handoff, inventing the UX in passing.

**In the process:**

- Cutting a ticket whose upstream is not Complete. "Basically done" is not a status.
- Sitting on decisions until they are urgent; delivering them unbatched, unframed, or without a recommendation.
- Letting launch-blocking items drift into the feature backlog or trade against features as peers.
- Gold-plating and quiet scope creep — the same disease, different symptoms.
- Closing a slice without the three-place update.

**In the corpus:**

- Two homes for one fact. Copies where references belong.
- Editing a spec to match what shipped instead of appending to `DEVIATIONS.md`.
- Tidying an open marker into false confidence.
- Stale examples left standing because they are "roughly right."
- Length as diligence.

---

## Appendix A — Ticket skeleton (copy this)

```markdown
# <ID> — <title that states the contents>

**Epic:** <EPIC> — <one-phrase identity> · **Phase <n>** · Size: <S|M|L>
**Slice type:** <what kind of work; what class of failure it risks>
**Vigil:** <flag + how to review — omit if not a risk surface>

**Status:** Not started

> **<Role> — <review type>.** <What must be reviewed, enumerated. What QA must state
> about its run.>

---

## Outcome

<One paragraph, prose. The world after this ships, in the language of whoever
experiences it. Close by naming the adjacent things this slice does NOT do.>

## Why / intent

- **<§ or D-ID>** — <the authority and what it obliges>.
- **What this slice is NOT (binding):** <the negative, where drift is a real risk>.
- **Ground truth:** <what exists and is consumed, never rebuilt>.
- **<Prior slice>** — <what this takes from it>.

**Rulings this slice makes (labelled, logged):**

- **<The ruling.>** <Why. The tradeoff.> <`[PROVISIONAL — owner]` if applicable.> Logged.

## Experience & states

<Happy path, subsectioned by surface or phase. Then:>

**States (exhaustive):** <every reachable state>

**Failure / edge states:** <named, each with its handling>

## Non-negotiables (this slice)

- **<Imperative.>** <One line of consequence.>

## Data & AI

**Schema changes: none | described | possibly (describe; human-review migration; log).**

**Tables:** <table (access mode)>

**Placement:** <exact paths; whose call>

**tRPC / validators:** <procedures + Zod homes — or "none">

**AI notes:** <touchpoint, streaming vs structured — or "**None.**">

**Instrumentation (forward-contract; INS-1 wires):** <event { payload } — privacy constraint restated>

## Accessibility

<This surface's specific traps — or "**None — no surface in this slice.**">

## Acceptance criteria (observable<, and under what conditions>)

1. <Observable behavior.> *(<Reviewer>.)*
2. …
N. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn <app>:build` pass.

## Likely-relevant technical notes (ADVISORY — dev decides)

- <Authoring knowledge that would otherwise be lost. Non-binding.>

## Dev's call

<What the builder decides. Real alternatives land in TECHNICAL-DECISIONS.md.>

## Out of scope

- **<Excluded thing>** — <where it actually lives>.

## Depends on

- **<TICKET-ID>** — <what this takes from it>. Complete in `PROGRESS.md`.

## Recommended Cursor execution

**<Model>.** <Why — and the failure mode of choosing down.>

---

### Cursor kickoff (paste into the session)

> Build **<ID> — <title>** (attached spec). Model: **<model>**. **<The one-line law of
> the slice.>**
> Attach/read first, in order: this spec · <handoff §§> · <app AGENTS.md> · root
> `AGENTS.md` · <prior tickets — reuse, don't fork> · `packages/db/SCHEMA_REFERENCE.md`
> (<domain>) · `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> <Restated constraints, imperative, 3–4 sentences.> Add to `PROGRESS.md`, log departures
> in `DEVIATIONS.md`. Run `yarn check-types` + `yarn <app>:build`.
```

## Appendix B — Build-order skeleton

```markdown
# <EPIC> — <name> — Build Order

**New here? Read `../README.md` first** — build process, kickoff
contract, completion protocol. This file is the ordered, checkable build queue.

> Derived from each spec's `## Depends on`. A ticket may start only when everything it
> lists shows **Complete** in `../PROGRESS.md`. If this file and a
> spec's `## Depends on` disagree, **the spec wins** — fix this file.

## How to work this file
1. Find the next unchecked ticket. 2. Confirm its gate in PROGRESS.md.
3. Build one ticket per thread. 4. On done, close in three places, then tick here.

## Critical path (sequential)
<ID> → <ID> → <ID>

## Build-order checklist
### Phase 0 — <name>
- [ ] **<ID>** · <title> — <flags> · (<deps>)

## Ordering constraints (alphabetical order hides these)
- **<ID> precedes <ID>** — <the consequence of getting it wrong>.

## Full dependency table
| Ticket | Complete-required dependencies |

## Ticket-authoring batches (distinct from build phases)
| Batch | Tickets | Why grouped |

## Locked references (do not re-litigate)
- **Decisions:** <D-IDs>. Cite by ID; re-opening requires new evidence routed to the founder.
- **Binding law:** <the subset that applies to this epic>.
- **Launch-blocking set:** <named, or "none in this epic">.
```

## Appendix C — Log line formats

```
DEVIATIONS.md
2026-07-08 · AFF-5 · Reversal columns added here rather than AFF-1 · AFF-1 deferred them; migration was cheaper inside this slice than a separate pass.

TECHNICAL-DECISIONS.md
## 2026-07-08 · AFF-5 · Post-paid clawback appends a negative row rather than mutating the paid original
**Context:** …  **Options:** …  **Decision:** …  **Consequences:** …  **Revisit trigger:** …

PROGRESS.md
| AFF-5 | Clawback | AFF-4 | Complete | 2026-07-07 |
```

---

_The system's whole claim is this: an agent with no memory, given one of these tickets and its attach-list, ships the right thing on the first pass — and leaves behind a record that makes the next agent's first pass just as good. Every rule in this document is downstream of that claim. When a rule stops serving it, change the rule and log the change._
