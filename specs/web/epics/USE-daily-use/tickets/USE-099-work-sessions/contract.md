---
size: medium
objective: "Place, Move to, the tier drag, Spread across the week and a tier change write real work sessions, one slot per day, across every day they name in one go"
slice_type: "multi-row slot writes for work; risks a spread that lands on some days and not others, a tier change for all sessions that touches done ones, and the one-item-one-block-a-day rule broken by a race"
non_negotiables:
  - "One item, one block a day: the unique (work_item_id, on_date) holds, and a second place on the same day is refused with the fixture's reason, never merged silently."
  - "Spread lands every session or none, and writes the item's remaining length in the same transaction."
  - "A tier change for all sessions changes only open ones; a done session keeps its tier."
  - "Each write runs inside ctx.rls.execute() in one transaction, with one undo token (USE-92) that takes every day back."
  - "Every input is a @syn/validators schema; the wrapper inputs (placeWork, moveWork, spreadWork, setWorkTier) move into @syn/validators."
devs_call: "Procedure names; whether placeAll (USE-80) is one procedure or the hook's loop over placeWork inside one batch."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/spread/index.md"
  - "C-USE-spread-1"
  - "D-USE-40"
truth_files: "none: behaviour is the ledger's; only the data source changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "packages/api/src/services/work/"
  - "packages/api/src/routers/work.ts"
  - "packages/validators/src/work.ts"
  - "apps/web/lib/fixtures/work/"
  - "apps/web/lib/data/live/work.ts"
depends_on:
  - "USE-98"
  - "USE-94"
out_of_scope:
  - "Placing a Linear issue (which also creates its work item): USE-101"
  - "Fit, Next and session counts: pure, in the hooks (USE-8)"
criteria:
  - id: C1
    statement: "placeWork, moveWork and unplaceWork write the slot the fixture writes; placing an item twice on one day is refused with the fixture's reason"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "spreadWork over four days writes four sessions and the item's length together; a refusal on the third day writes none of them"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "setWorkTier for all sessions changes every open session's tier and no done session's, in one transaction"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "Placing on Tue and Wed from the place sheet, then Undo, leaves both days as they were"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "The web app and the API type-check"
    evidence: check
    command: "yarn check-types"
id: USE-99
---

# Contract — work-sessions

## Build notes

The `WorkServer`'s session methods: `placeWork`, `moveWork`, `unplaceWork`, `spreadWork` and `setWorkTier`. Also USE-80's `placeAll`, which today loops `writePlace` in the hook and undoes by hand on a refusal part way.

- **Decisions that apply:**
  - D-USE-40: each day a spread or place lands on is its own session.
  - C-USE-spread-1: Spread writes one session per picked day in the tier, each n of N. Nothing goes to Linear.
  - Data contract: unique `(work_item_id, on_date)`; `tier` only with a work item.
  - Rabbit hole 13: a tier change across sessions runs in one transaction. Its consequence line uses the same fit function as Today.
- **Approach:**
  - `services/work/sessions.ts` holds the five as plans plus apply, with `recordUndo`.
  - Recommended: give `placeAll` a procedure, `work.placeOnDays` (`{ item, days, tier }`). One transaction replaces the hook's partial undo; keep the hook's signature.
  - Move the local inputs to `@syn/validators/work`: `placeWorkInput`, `moveWorkInput`, `spreadWorkInput`, `setWorkTierInput`. Each still composes `placeSlotInput` and `slotUpdateInput`.
- **Per path:** `services/work/sessions.test.ts` holds C1 to C4 over an in-memory store that honours the unique key.
- **Gotchas:**
  - USE-71's drop renumbers only the tier it lands in, and writes only slots whose tier or place changed. Keep `moveWork` per slot, so a drop where it started writes nothing.
  - A Linear issue placed for the first time also creates its work item. That path is USE-101's `placeIssues`, not this ticket's.
- **Model:** Opus 5.5 at medium. A smaller model writes each day in its own request.
