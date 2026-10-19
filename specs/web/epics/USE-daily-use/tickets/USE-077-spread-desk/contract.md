---
id: "USE-77"
size: small
objective: "Spread… on a big pool row (or Spread across the week in an item's ···) opens a dialog over the Week: Work left, Which block, Days, Each session, Tier, then a preview of one row per session with what it shares and the time it gets, the sum of this week's hours and what stays in the pool, Carry on next week, and Add <n> sessions placing them as one item's sessions with Undo"
slice_type: "a pure allocation and its dialog; risks a preview ignoring work already in the block, a session counted at the bottom of a range, today offered once its block began, afternoons used when Morning is picked, Linear written to, and N counting next week's sessions"
non_negotiables:
  - "The preview is a pure function in @syn/utils: each session gets the chosen block's time left after its other work at the top of their ranges, whole minutes, total."
  - "Nothing is placed in a block not chosen: Morning Work leaves afternoons free."
  - "Today is not offered once its chosen block has begun, and says why (C-USE-spread-days-and-tier-1)."
  - "Add <n> sessions makes one item's sessions, each \"n of N\" with N the sessions placed so far (D-USE-102); what is left stays in the pool; Undo removes every one (C-USE-spread-2)."
  - "Spreading writes nothing to Linear, the estimate included (D-USE-57)."
  - "@syn/ui Dialog and preset tokens; the tier's square with its word; lengths, never red."
devs_call: "The function's name and shape; Pick blocks' per-day ticks (not drawn); how the dialog's focus lands (Work left)."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/spread/index.md"
  - "specs/web/epics/USE-daily-use/ux/interactions/spread/states/across-the-week/1728.md"
  - "C-USE-spread-1"
  - "C-USE-spread-2"
  - "C-USE-spread-3"
  - "C-USE-spread-across-the-week-1"
  - "C-USE-spread-across-the-week-2"
  - "C-USE-spread-across-the-week-3"
  - "D-USE-40"
  - "D-USE-42"
  - "D-USE-102"
waiver: "Spread at the desk: the interaction's rules and the dialog's state file."
truth_files: "none: promotion carries interactions/spread/"
qa: Q1
reviewers:
  - assay
focus:
  - "the dialog at 1728 against across-the-week-1728, and the preview's arithmetic (assay)"
operator_review: false
planned_paths:
  - "packages/utils/src/work/spread.ts"
  - "packages/utils/src/work/spread.test.ts"
  - "packages/utils/src/work/index.ts"
  - "apps/web/components/work/spread/"
  - "apps/web/lib/data/use-spread.ts"
  - "apps/web/lib/data/spread.test.ts"
  - "apps/web/lib/fixtures/"
  - "specs/web/epics/USE-daily-use/tickets/USE-077-spread-desk/evidence/"
depends_on:
  - "USE-4"
  - "USE-7"
  - "USE-8"
  - "USE-10"
  - "USE-55"
  - "USE-74"
  - "USE-75"
out_of_scope:
  - "The phone's full sheet and its Days and tier page: USE-78"
  - "Placing next week's sessions when that week is first shown (Carry on next week): the work pool wiring (wave 3); here the box is kept on the item"
  - "Done on one session: USE-60"
criteria:
  - id: C1
    statement: "spreadPreview for SYN-218 at 20 h, Morning Work, Tue to Fri, the whole block, Primary gives Tue 2 h 30, Wed 1 h 30 sharing with ALD-17 3/3, Thu 1 h sharing with SYN-212 2/3, Fri 2 h 30, a sum of 7 h 30 and 12 h 30 left; Monday at 10:20 is not offered because its Morning Work began"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "Add 4 sessions places four sessions of the one item in Primary, each 1 to 4 of 4, leaves the item in the pool with 12 h 30 left, writes no outbox row, and Undo removes all four"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "At 1728 the dialog shows \"Spread across the week\", the item card, Work left \"20 h\" with its helper, Morning Work / Afternoon Work / Pick blocks, the day chips with M not offered, Each session, Tier Primary, What this makes with four rows, \"4 sessions, 7 h 30 this week. 12 h 30 stays in the pool. Afternoons stay free.\", the Carry on box, Cancel and Add 4 sessions"
    evidence: capture
    path: "specs/web/epics/USE-daily-use/tickets/USE-077-spread-desk/evidence/across-the-week-1728.png"
  - id: C4
    statement: "@syn/utils and the web app type-check"
    evidence: check
    command: "yarn check-types"
  - id: C5
    statement: "The web app lints clean"
    evidence: check
    command: "yarn lint"
---

# Contract — spread-desk

## Build notes

Wave 2, after placing. Match `ux/interactions/spread/captures/across-the-week-1728.png`; the dialog's anatomy is `states/across-the-week/1728.md`.

- **Decisions that apply:**
  - D-USE-40, D-USE-42: a task longer than a day is one item placed as sessions. The dialog: Work left (a stepper, "8 Huge means 4 h or more; set the real hours."), Which block (Morning Work, Afternoon Work, Pick blocks), Days (34 px day chips; days with no such block not offered), Each session ("The whole block" or a set length), Tier (one for every session); "What this makes": one row per session with its date, block, what it shares ("shares with [Alder intro] 3/3") and the time it gets; the sum line; "Carry on next week the same way until it's done"; Cancel and "Add <n> sessions".
  - The preview counts what is already there, at the top of the ranges; afternoons stay free when Morning is picked.
  - D-USE-102: N counts the sessions placed so far; it grows when next week's are placed.
  - Defaults when opened: the item's hours, Morning Work, the days left with that block, Primary [ASSUMPTION: the sample's].
  - Toast after adding [ASSUMPTION]: "4 sessions added, Tue to Fri" with Undo.
  - Access: focus to Work left on open and trapped; × "Close"; Esc cancels; focus returns to Spread…; Which block a radio group; each day chip a toggle named "Tuesday 13, picked", Monday disabled with "Its Morning Work has begun"; the preview a list, changes announced politely.
  - Entry: Spread… on an 8 Huge pool row (or any longer than its biggest Work block), the Item sheet's ··· › Spread across the week, a Week chip's right-click menu.
- **Interfaces:** `spreadPreview({ workLeftMin; days: { dateKey; blocks: { id; start; end; slots: { title; sessionLabel; topMin }[] }[]; begun: boolean }[]; pick: "morning" | "afternoon" | { blockIds }; eachMin: number | "whole"; tier }): { rows: { dateKey; blockId; sharesWith: string[]; getsMin }[]; totalMin; leftMin; notOffered: { dateKey; reason }[] }` in `@syn/utils/work/spread.ts`. `SpreadDialog` in `components/work/spread/`; `useSpread(itemId)` placing through `usePlace`.
- **Per path:** `spread.test.ts` holds C1 (append to `work/index.ts`); `spread.test.ts` in `lib/data/` holds C2. Scenario `week-spread`.
- **Gotchas:** Morning and Afternoon Work are the day's first and later Work blocks by start time [ASSUMPTION: the labels are the drawn sample's].
- **Model:** Opus 5.5 at medium. A smaller model ignores the block's other work, or fills afternoons.
