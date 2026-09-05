# Epic 3 — Review: how to work this folder

**Read [`../README.md`](../README.md) first** — the global build order, the placement rules, and the cross-track dependencies. This file adds only what is local to Epic 3.

**Governs:** the resolver and the number, the Review tab, the Day Review with tiered miss scoring in its three modes, the pending state, reflections, the traded-up verification, history, and the Week Review. **Source document:** [`docs/ux/epic3_review_ux_architecture.md`](../../ux/epic3_review_ux_architecture.md) (screens `RV-`, `DR-`, `WR-`, `HS-`), under the official spec §7, §9.4, §10. **Register:** considered mode — the person is tired or has room; three taps per item, the number after the decisions, every number with its formula, leaving always allowed, no coach.

**Authors:** Vesper · Mason · Reeve, 2026-09-05. **Executor:** an Opus thread per ticket.

---

## Folder layout

| Path | What |
|---|---|
| `README.md` | This file |
| `00-build-order.md` | The ordered, checkable queue with the critical path |
| `REV-1…REV-4-*.md` | One implementable slice each |
| `PROGRESS.md` · `DEVIATIONS.md` · `TECHNICAL-DECISIONS.md` | The three records |
| `_templates/slice-spec.md` | The blank ticket |

---

## What Vesper decided for this epic (the UI, against what is built)

- **The undone item is `DecisionPanel`** — it already holds the two large targets, the inline `TierRadioRows` + `ReasonChips`, the *Other* text, the note disclosure, `DecidedLine` with *Change*, the traded-up hand-off, and the shift-resolved variant. The Day Review is a column of them under `GroupHeading`s with hairlines and 24px of air — no cards.
- **The Review tab is three `ReviewRegion`s** (Today · This week · History) with `ListRow`s for pending days.
- **The number is `BigNumber` + `FormulaSentence` + `FactLine`s** in the review serif, on DR-07 and WR-01 and nowhere else. Terms with zero counts are omitted by the composite.
- **Reflections are `ReflectionBlock`s** inside a `CollapsiblePanel` whose trigger carries *· {rated} of {rateable}*.
- **The traded-up picker is `PickerList presentation="inline"`** inside a `ResponsiveSheet`, each row's `meta` carrying the verdict tail.
- **The Week Review is `HabitStrip` rows, `TemplateUsageRow`s, `CategoryBar`, `SessionRow`-free summary rows, `WeekRow` / `DayOutcomeRow` / `ShiftRow`** for history and detail. Sorted by what slipped.
- **The footer pair is two `Button`s** — *Finish later* (ghost) · *Finish review* / *Save changes* (primary, disabled until decided).
- **Copy is the document's, verbatim.** Epic 3 §0.3 fixes the vocabulary; §6 the register (never *failed*, *skipped*, *streak*, *great*, *only*, *just*, *again*).

---

## Source precedence

1. **Product behaviour** → official spec §0.3 (signed — R1, R2, R3, R6 bind this epic), §7 → `epic3_review_ux_architecture.md` for its screens (its §5 restates the number's contract) → the cross-cutting document (§8 record integrity, §9.3 G3) → the v2 handoff for component contracts.
2. **Architecture & placement** → [`../README.md`](../README.md) § Placement rules → `codebase-conventions.md` → the domain guides.
3. **App rules** → [`apps/web/AGENTS.md`](../../../apps/web/AGENTS.md).
4. **This track's rulings**, labelled and logged.
5. **On-disk reality + the three tracks' `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.**

---

## The kickoff contract (one ticket per thread)

```
You are building ONE ticket from docs/specs/epic-3-review/: <TICKET-ID>.

OBJECTIVE
Ship the ticket's Acceptance criteria — nothing more (scope creep), nothing less.

BEFORE WRITING CODE
1. State the ticket ID and title in your first message.
2. Confirm every entry in the ticket's "Depends on" shows Complete in the owning
   track's PROGRESS.md (epic-1-setup/, epic-2-in-use/, cross-cutting-system/ as
   named). If any is not Complete, STOP and say so.
3. Read the ticket spec end to end, then its attach-list in order.
4. Read this track's DEVIATIONS.md and TECHNICAL-DECISIONS.md, Epic 1's, Epic 2's,
   and the infrastructure track's — on-disk reality + those logs override any
   stale string in a spec or a UX document.
5. State the exact file paths you will create or change before implementing.

CONSTRAINTS
- Honor every non-negotiable verbatim. If the spec would force you to break one,
  STOP and ask — never silently contradict it.
- The number is computed by @syn/utils' one resolver, never stored, and never
  shown without its sentence. Nothing here is evaluative: no adjective about the
  day, no colour on an outcome, no coach sentence.
- Three taps per undone item, maximum. Leaving is always allowed; what is left
  becomes pending, visibly.
- Every string a person reads comes from the UX document, verbatim, in a copy.ts.
- Filenames kebab-case; named exports only; Server Components default; client
  leaves in _components/ or components/<feature>/ with "use client" line 1; routes
  from lib/routes.ts; every user-scoped query through ctx.rls.execute().
- Audit @syn/ui before building a component. If a composite is genuinely missing,
  STOP and say why.
- No tests. No AI. No schema change without a logged deviation and a journalled
  migration a human applies.
- If you modify files owned by an upstream Complete ticket, re-check that ticket's
  affected acceptance criteria before finishing.

DEFINITION OF DONE
1. yarn lint · yarn lint:boundaries · yarn check-types · yarn build pass (four
   separate commands).
2. Happy path exercised on the local tier; the resolver's cases run and pasted.
3. The ticket's Status line set to: Status: Complete (YYYY-MM-DD).
4. PROGRESS.md row + checklist ticked.
5. One DEVIATIONS.md line per divergence. Architectural choices with real
   alternatives → TECHNICAL-DECISIONS.md.
6. yarn directory-map if files were added/moved/removed.
7. Close with 3–5 lines: what shipped, deviations, the one thing the next ticket
   must know.

Do not start the next ticket.
```

---

## Completion protocol

Three places, every time. Then tick `00-build-order.md`. "The agent said done" is not done.

---

## Locked scope (do not re-litigate)

- **Official spec §0.3 is signed.** R1: trims are excluded; shift-cuts inherit the shift's tier. R2: *traded up* is verified by data — excluded when the traded item's priority ≥ the missed item's and it was completed, else half. R3: honest math, neutral copy; *weak*, *fail*, *penalty* never appear. R6: one unweighted number per day and per week with its formula, plus the priority-band breakdown; no decay.
- **Official spec §3.11: no score cache.** The number is computed on read, every time. Epic 3 DR-07's "stored as computed" is satisfied by determinism (REV-1 ruling).
- **Epic 3 §8's eight calls are signed:** strips sort by what slipped; category time from timer sessions only; *Carried {n} times since {date}* as a plain fact; tier 3 has no sub-reasons; a cut item's attribution changes without altering the shift; *Something not on the list* decides at half; reflections never affect the number; history only from the Review tab.
- **Phase 1 vs Phase 2:** REV-1, REV-2, REV-3 are launch-blocking; REV-4 (Week Review) is Phase 2 and does not gate.
- **Export** lives in Epic 1 (SET-10); HS-01 links to it.
- **No coach.** No sentence generated about the person, anywhere in this epic, ever. Official §7.7 is a recorded non-feature.

---

## Non-negotiables (every ticket honours these)

- **The number comes after the decisions, never before.** DR-01 shows no percentage; DR-07 does. RV-00 shows a past day's number only once reviewed.
- **Every number carries its formula in words.** `BigNumber` never renders without `FormulaSentence`.
- **Three taps per undone item.** Missed → tier → (chip). Carry forward is one.
- **Leaving is always allowed.** *Finish later* on every review surface; undecided items become pending, visibly; pending is never scored and never disappears.
- **The record is editable, with history.** Any past day's review reopens; a change stamps `review_edited_at`; the shift's own record is never rewritten by a *Change*.
- **Colour is absent from outcomes.** Neutral words and glyphs; violet only as the *moved* marker it already is.
- **The copy is descriptive.** Epic 3 §6's never-list is a lint you run by eye before closing.
- **Every read and write through `ctx.rls.execute()`.**

---

## Canonical paths & known-stale warnings

- Route placeholders exist for `/review`, `/review/day/{date}`, `/review/week/{week}`, `/review/week/{week}/habit/{id}`, `/review/history` (INF-7). This epic replaces them.
- `DecisionPanel` (`packages/ui/src/composed/control/decision-panel/`) exports `Decision`, `DecisionVerdict`, `TRADED_UP_REASON_KEY`, and the `WEIGHT_PHRASE` / `TRADED_UP_PHRASE` copy — the panel's `onDecide` fires only when a decision is complete (tier 3 on selection; tiers 1–2 on a chip; *Other* on text; *Stayed on…* after the picker). Build on it; do not fork it.
- `USE-1`'s `closeDay` is the one way a day closes; REV-2 calls it with `reason: "manual"`.
- `SET-9`'s `reason.list` returns `byTier` in the shape the panel takes and `reason.keep` implements *Keep this reason*.
- The status line's `pending-review` copy is signed in SYS-1; RV-00's pending rows are this epic's.
- `misses.shift_id` retained after a Day Review *Change* is how DR-05 says *Changed from the shift's reason.*
