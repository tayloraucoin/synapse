# Epic 3 — Review — Technical Decisions (append-only)

One section per architectural choice that had real alternatives. Written when the decision is made. Format:

```
## YYYY-MM-DD · <ticket-id> · <the decision, as a statement>
**Context (as it was then):** …
**Options weighed:** A … B … C …
**Decision:** …
**Consequences:** what this buys, what it costs, what it forecloses.
**Revisit trigger:** the condition under which this should be reopened.
```

## 2026-09-05 · REV-1 · The resolver is one pure function in `@syn/utils`; the number is computed on read and never stored

**Context (as it was then):** Official §7.3 gives the resolver as pseudocode and §7.4 the number; §3.11 forbids a score cache. Epic 3 §5 restates the credit table; DR-07 says the number "is stored as computed (recomputed on any later edit)"; HS-01 lists a percentage per week and per day; RV-00 shows a past day's number.
**Options weighed:** A — compute on every read from the rows (`day_items` + `misses` + the traded item's state). B — store `adherence_pct` on `days` and recompute on every write that could change it. C — a materialised view.
**Decision:** A. B is a cache with eleven invalidation points (done, undo, decide, change, carry, cut, undo-shift, do-anyway, bring-back, remove one-off, edit session… ) and the first missed one is a number that lies — on the one screen whose promise is honesty. C is B with a database in the loop. The arithmetic is a few hundred rows per week at most; HS-01 pages by week.
**Consequences:** Buys a number that is always what the rows say and a resolver the mobile app imports. Costs a per-read computation and a history page that reads a month of items. Forecloses nothing — B is a later optimisation behind the same function.
**Revisit trigger:** HS-01 over 500 ms on a year of history.

## 2026-09-05 · REV-1 · Traded-up verification is resolved at scoring time from the traded item's current row, not frozen at decision time

**Context (as it was then):** R2: *not counted* iff the traded item's priority ≥ the missed item's and it was completed; DR-04 says an active-but-not-done traded item shows *counts half — finish it and this changes* and "if it's finished before *Finish review*, the verdict is recomputed at finish and the decided line updates."
**Options weighed:** A — store the verdict on the miss at decision time. B — store only `traded_up_item_id`; the resolver reads the traded item's `completion_state` and `priority` every time. C — store the verdict and re-derive on finish only.
**Decision:** B. The document says the verdict changes when the traded item finishes; A freezes a guess. C is B with a cache. `DecisionVerdict` on the panel is a display value the client computes from the same function over the cached day.
**Consequences:** Buys the documented behaviour with no extra column. Costs a join in the resolver. Forecloses nothing.
**Revisit trigger:** none foreseen.

## 2026-09-05 · REV-3 · Live and pending modes write decisions on tap; edit mode batches and writes on *Save changes*

**Context (as it was then):** Epic 3 DR-01: in live mode *Finish later* "keeps decided items' decisions"; in edit mode *Finish later* "discards unsaved changes after *Discard changes?*". The same screen, two write grammars.
**Options weighed:** A — write on tap in every mode; edit mode's "discard" reverts by writing the old values back. B — write on tap in live/pending; batch in edit and write once with the `review_edited_at` stamp. C — batch in every mode and write on finish.
**Decision:** B. A makes "discard" a second write that can fail, and stamps the day edited for a change the person then discarded. C loses a tired person's three decisions when the tab dies before *Finish review*, which is the case the pending state exists to protect. The modes differ because the documents say they differ; the code follows.
**Consequences:** Buys the documented behaviour in both modes. Costs two code paths in one hook (`decide` vs `batch.set`) and a `saveChanges` procedure that applies a list. Forecloses nothing.
**Revisit trigger:** offline queuing (Phase 2), when live mode also needs a local batch.

---

## REV-1 — the resolver returns its own sentence

**Context:** One percent appears on the Day Review, the Week Review, the history list and RV-00. Official spec §0.3 R6 requires it to appear only alongside the terms that produced it. Something has to build those terms.

**Options:**

- **A. Return the number; each surface builds its own sentence** from the rows it already has.
- **B. Return the number and a formatted string.**
- **C. Return the number and the TERMS — counts and weights, unformatted.**

**Decision:** C. A is four reconstructions of one arithmetic, and the first one to drift would put a sentence under a number that contradicts it — on the screen where the product asks to be believed. B moves copy into `@syn/utils`, which cannot know the register and would have to be edited from a package that renders nothing.

Terms are the middle: counts and weights are facts about the computation, and `FormulaSentence` already knows how to say them. Both sides filter zero-count terms, which is redundant on purpose — the API sentence and the screen sentence are then identical by construction rather than by agreement.

**The two rules that make the number defensible**, both encoded here rather than at any call site:

- **Excluded leaves the denominator; it is not credited zero.** Something that genuinely could not happen did not fail to happen. Crediting it zero would make a fever look like a choice, and it is the single most tempting simplification in this file.
- **Half is 0.5 and the rounding happens once, at the end.** Rounding per item turns 2.5 of 3 into 100 percent or 67 percent depending on which way each half falls. Neither is 83.

**Consequences:** Nothing is stored (§3.11), so a reviewed day whose items are later undone from the List shows the new number, with `review_edited_at` recording that the record was touched. Every call recomputes; the cost is a query and a pass over tens of items, and the benefit is that this number cannot be stale. 41 cases run as a pure function, including the specification worked example.

**Revisit trigger:** a fifth weight. The terms list is four entries because the resolver has four outcomes; a new tier would add one, and the sentence order in `TERM_LABELS` is where it would go.

---

## REV-2 — decisions write on tap; only the carried row waits for finish

**Context:** *Finish later* must keep what was decided. *Finish review* must be the only thing that changes tomorrow. Those two requirements pull in opposite directions for one decision: *Carry forward*.

**Options:**

- **A. Everything on finish.** One transaction, easy to reason about — and *Finish later* loses every decision, which the document forbids in as many words.
- **B. Everything on tap.** Decisions survive leaving, and a carry that was tapped and then abandoned has already put a task on tomorrow, with no state left to represent "decided but not committed".
- **C. Both decisions write on tap; only the carried ITEM CREATION waits for finish.**

**Decision:** C. The split falls on a real seam: `completion_state = carried` is a fact about TODAY item, and tomorrow row is a fact about tomorrow. Writing the first immediately is what makes *Finish later* keep its promise; deferring the second is what makes *Finish review* the only thing that touches another day.

The resolver already agrees. A `carried` item is excluded from its own day (official spec §7.3), so a day left half-reviewed with three carries scores correctly without any special case — the state means the same thing before and after finish.

Both halves are idempotent. `carryItemForward` finds an existing row by `carried_from_item_id` and does nothing; `finishReview` returns early on `reviewed_at`. A double submit, a retry after a timeout, or a finish racing the 03:00 auto-close all land on the same answer.

**Consequences:** *Finish later* writes nothing, which is why it is a navigation rather than a mutation. The cost is that a person who carries a task and then abandons the review leaves an item in `carried` on an open day — visible to the resolver as excluded, which is the honest reading, and re-decidable when they come back.

**Revisit trigger:** a decision with a side effect on another day that is NOT reversible — scheduling something, sending something. That would need the same split and a way to undo the far half, which this arrangement does not provide because carrying does not need one.
