---
epic: USE
status: ratified
role: Mason
support: Warden (personal data, RLS, integration tokens)
date: 2026-10-13
ratified: 2026-10-13
---

# USE — technical notes

The Technical stage for USE ([`docs/workflows/stages/technical.md`](../../../../../docs/workflows/stages/technical.md)). It reads the approved `ux/` ledger (D-USE-1 to 112) against the code at `c7d1ae5`, with Taylor's answers of 2026-10-13. There is one file per template section, because the whole runs past 2,000 tokens. Every ticket reads this folder. Detail that only one ticket needs goes in that ticket's Build notes.

| File                                 | Holds                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| [placement.md](placement.md)         | The legacy move; where each new part goes, by who imports it; the breakpoint; what `@syn/ui` gains |
| [data-contract.md](data-contract.md) | The fresh model, the clock, Linear, Google, validation at the boundary, where state lives    |
| [one-way-doors.md](one-way-doors.md) | The doors touched, and their ratification                                                     |
| [calls.md](calls.md)                 | The calls as Taylor ratified them, and the bends this stage took                              |
| [test-shape.md](test-shape.md)       | The test type for each risk                                                                   |
| [rabbit-holes.md](rabbit-holes.md)   | Each one patched in a sentence or declared out of bounds                                      |
| [morning-reading.md](morning-reading.md) | Delta, 2026-10-20: Settings › Morning reading (D-USE-119 to 133): placement, the write contract, offline read only, the first hard delete |

## Appetite verdict

**Build the whole ledger, until it is done** (Taylor, 2026-10-13, superseding the brief's two days). Possible: yes. Every surface and flow in `ux/` is built. The only parts left out are the ones the ledger itself defers, listed in `ux/dev-notes/later-and-for-technical.md`:

- the whole-pipeline view (D-USE-104);
- a Linear status change ending a timer;
- Evening tasks and label colours;
- the finer points of breaks.

## The old app becomes legacy; USE starts fresh

Everything the app has now is deprecated. It is moved, not deleted, into `_legacy/` folders that nothing builds, lints or imports ([placement.md](placement.md)). The database keeps every old table untouched. USE gets fresh tables shaped like the ledger's records ([data-contract.md](data-contract.md)). Auth, the account row, push and the scheduler stay live, because USE needs them.

## How the tickets run: contract first, then the UI, then the wiring

Taylor asked whether to build the UI and interactions as their own tickets, apart from the database work. **Verdict: yes, with one correction. Lock the types and the pure logic before any UI, or the UI gets built twice.**

- **For UI first.**
  - The ledger is about 460 files of drawn states, and the canon already requires every state reachable by `?state=`, so a fixture layer is owed anyway.
  - UI tickets are cheap: Q1 plus the UI audit.
  - They can run in parallel.
  - Taylor can walk the app early, which is how Taylor finds problems.
- **Against UI first, done naively.**
  - Surfaces built on invented data shapes get rebuilt when real data arrives.
  - The work loop's interactions (one in hand, firing, Step away) are a state machine whose truth is the clock derivation. A UI that fakes it looks done and isn't.
- **The resolution.** The shapes and the derivation are written first, as real code. The UI then runs on them.
  - Each surface reads through one data hook (`useToday()`, `usePool()`, …) whose types come from `@syn/validators`.
  - UI tickets implement the hook from fixtures. A fixture's mutations append to an in-memory event list run through the real `deriveClock`, so firing, Step away and Done truly work before a single table is read.
  - Wiring tickets swap each hook's body for tRPC, one domain at a time. That is a swap, not a rewrite.
  - The fixtures stay afterwards as the `?state=` source for captures.

**The order.**

1. **Wave 0, alone:** the legacy move.
2. **Wave 1, the contract as code:**
   - migration `0012` with its schema and RLS (Q3);
   - the validators and types;
   - the pure functions in `@syn/utils`;
   - the fixtures and the data-hook seam;
   - the new shell (the rail at 1024, the tabs, the breakpoint token).
3. **Wave 2, the UI and interactions, surface by surface, on fixtures, in parallel.**
4. **Wave 3, the wiring, domain by domain:**
   - blocks and days;
   - slots and the clock;
   - to-dos and reminders;
   - the work pool and sessions;
   - Linear connect (Q3);
   - Linear sync and writes (waits on the research below);
   - Google Calendar;
   - clients;
   - push at the desk;
   - offline persistence;
   - the app-shell cache.

## Gate

Taylor ratified on 2026-10-13 ([calls.md](calls.md)). The bends this stage took after those answers are named there and can be reversed with a `git mv`; none of them blocks Tickets. Linear's tickets wait on the research thread's file (`docs/research/platform-apis/linear-api.md`). Google Calendar's tickets wait on `docs/research/platform-apis/google-calendar-api.md`.
