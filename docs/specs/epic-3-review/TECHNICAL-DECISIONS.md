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
