# Epic 2 — In Use: how to work this folder

**Read [`../README.md`](../README.md) first** — the global build order, the placement rules, and the cross-track dependencies. This file adds only what is local to Epic 2.

**Governs:** the day model (boundaries, state derivation, auto-close), the Plain List, the item sheet, the day header sheet, timers, manual time, the Schedule, shift-my-day, the capacity trim, and notifications with their landings — everything a person sees and touches while moving through a day. **Source document:** [`docs/ux/epic2_in_use_ux_architecture.md`](../../ux/epic2_in_use_ux_architecture.md) (screens `SH-`, `LS-`, `DH-`, `IT-`, `SC-`, `SF-`, `TR-`, `PN-`), under the official spec §5, §6, §8, §9.7, §10. **Register:** execution mode — ruthless plainness; one decision per touch; nothing asks; nothing counts; nothing configurable is reachable.

**Authors:** Vesper · Mason · Reeve, 2026-09-05. **Executor:** an Opus thread per ticket.

---

## Folder layout

| Path | What |
|---|---|
| `README.md` | This file |
| `00-build-order.md` | The ordered, checkable queue with the critical path |
| `USE-1…USE-8-*.md` | One implementable slice each |
| `PROGRESS.md` · `DEVIATIONS.md` · `TECHNICAL-DECISIONS.md` | The three records |
| `_templates/slice-spec.md` | The blank ticket (identical to Epic 1's) |

---

## What Vesper decided for this epic (the UI, against what is built)

Every Epic 2 surface composes existing `@syn/ui` exports. The decisions that shape every ticket:

- **The row is `ItemRow` and nothing else renders an item on the tabs.** Its `item.state` (an `ItemState`) drives every visual; the row derives nothing. The state is computed by one function (USE-1) and re-computed on the client each minute — the row never reads a clock.
- **The List is `DayHeader` → `StatusLineSlot` → `DayPartHeader` sections of `ItemRow`s (grouped by `MultitaskGroup`) → `ExpanderSection`s → `DayCompleteAction`.** Nothing else appears. No count, no greeting, no progress.
- **The item sheet is `ResponsiveSheet` with `header` (identity row), `PreflightNote`, `TimerDisplay` + `TimerControl`, `SessionRow`s, `NumberUnitInput`, `ReflectionBlock`, `Textarea`, and a footer of *Not today* (ghost) · *Done* (primary).** It is a feature folder opened from both tabs and from a notification.
- **The day header sheet is `ActionRowSheet`** — four rows, nothing else.
- **The Schedule is `ScheduleAxis` with `ScheduleBlock`, `WindowSpan`, `GhostBlock`, `ShiftBand`, and `NowLine` positioned by minutes-from-day-start × `pxPerHour`.** No drag. No zoom. A block is a button to the item sheet.
- **Shift is a `ResponsiveSheet size="tall"` that grows through three steps** (`LargeTargetRow` → `TierRadioRows` grouped reasons → `OverflowCutList`), the primary's label carrying the cut count. Trim is a `ResponsiveSheet` with `NumberUnitInput` + `QuickChipRow` and a result region of faded `ItemRow`s with *Keep instead*.
- **Undo is `toastUndo`** (5 s done/undone, 10 s shift, 10 s apply-template) or the row's inline `StateWord kind="updated"` — never a confirmation dialog.
- **Copy is the document's, verbatim.** Epic 2 §0.3 fixes the vocabulary; a word not in that list does not appear on the tabs.

---

## Source precedence

1. **Product behaviour** → official spec §0.3 (signed), §5, §6, §8 → `epic2_in_use_ux_architecture.md` for its screens → the cross-cutting document (§7 time, §8 record integrity, §9.3 gaps G1–G4) between them → the v2 handoff for component contracts.
2. **Architecture & placement** → [`../README.md`](../README.md) § Placement rules → `codebase-conventions.md` → the domain guides.
3. **App rules** → [`apps/web/AGENTS.md`](../../../apps/web/AGENTS.md) — its § Product non-negotiables bind every line of this epic.
4. **This track's rulings**, labelled and logged.
5. **On-disk reality + `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`** (this track's, Epic 1's, and the infrastructure track's).

---

## The kickoff contract (one ticket per thread)

```
You are building ONE ticket from docs/specs/epic-2-in-use/: <TICKET-ID>.

OBJECTIVE
Ship the ticket's Acceptance criteria — nothing more (scope creep), nothing less.

BEFORE WRITING CODE
1. State the ticket ID and title in your first message.
2. Confirm every entry in the ticket's "Depends on" shows Complete in the owning
   track's PROGRESS.md (epic-1-setup/, epic-3-review/, cross-cutting-system/ as
   named). If any is not Complete, STOP and say so.
3. Read the ticket spec end to end, then its attach-list in order.
4. Read this track's DEVIATIONS.md and TECHNICAL-DECISIONS.md, Epic 1's, and the
   infrastructure track's — on-disk reality + those logs override any stale
   string in a spec or a UX document.
5. State the exact file paths you will create or change before implementing.

CONSTRAINTS
- Honor every non-negotiable verbatim. If the spec would force you to break one,
  STOP and ask — never silently contradict it.
- The execution tabs: no numbers about the day, nothing red, no second person, no
  question marks (the late offer excepted), faded is never disabled, the record is
  annotated never rewritten. These are apps/web/AGENTS.md's product non-negotiables
  and they bind every pixel here.
- Item state is derived by @syn/utils' one function, never by a component and
  never stored. Times come from the day's snapshotted zone, never the device's.
- Execution-mode mutations are optimistic and revert with a sentence on failure.
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
2. Happy path exercised on the local tier against seeded days; every acceptance
   criterion checked and stated, including the induced ones.
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

Three places, every time: the ticket's `Status:` line, `PROGRESS.md`, `DEVIATIONS.md` (+ `TECHNICAL-DECISIONS.md` when a choice had alternatives). Then tick `00-build-order.md`. "The agent said done" is not done.

---

## Locked scope (do not re-litigate)

- **Official spec §0.3 R1–R7 are signed.** Here: R1 (trims are *not assigned*, never missed; shift-cuts inherit the shift's reason and tier), R5 (the wake anchor sets `woke_at`), R7 (7 highest; trims and cuts sort ascending).
- **Epic 2 §12's nine calls are signed:** the quantity tail, *Do it anyway*, *Apply {most-used template}*, no Day Complete on the Schedule, no drag-to-reschedule, the 10-minute true undo on a shift, *Stayed on something more important* is never a shift reason, the late offer as the one permitted question, foregrounded pushes surface nothing.
- **Cross-cutting §13's calls are signed:** one breakpoint; the tab bar dims under a sheet; template-derived items on today cannot have their time edited directly; `done_at` prefers the earlier value.
- **Phase 1 vs Phase 2 (official §12):** USE-1…5 and USE-8 are launch-blocking; USE-6 (shift) and USE-7 (trim) are Phase 2 and do not gate. Pause/resume (USE-4) and quantity/reflection capture (USE-3) ship with their sheets because the composites exist and the sheet without them is a stub — logged in `DEVIATIONS.md`.
- **Offline writes are Phase 2.** Every ticket here shows *Offline — changes save on this device.* is **not** the Phase-1 line; Phase 1 blocks writes with the standard line and keeps the surface readable. The timer keeps running locally while offline and syncs on reconnect only as far as USE-3 specifies.
- **Google Calendar items (N9, `calendar_import`)** render nothing in Phase 1; the `ItemIcon calendar` prop and the `origin` value exist as seams.

---

## Non-negotiables (every ticket honours these)

- **No numbers about the day on the tabs.** Times and durations only. A count, a percentage, a streak, or a progress mark anywhere on List or Schedule is a defect.
- **Nothing red. Nothing that flashes, counts down, or pleads.** *Missed* is neutral; *now/soon* is the accent dot and a word; *moved* is violet and a word.
- **No second person and no question on the tabs**, except the late offer, once a day, dismissable.
- **Faded is not disabled.** Every passed and done item stays fully interactive.
- **The record is annotated, never rewritten.** A late start leaves a ghost (`original_scheduled_start` is immutable — the DB enforces it). A shift leaves a band. Undo keeps sessions and notes.
- **One state function.** `deriveItemState` in `@syn/utils` is the only place an `ItemState` is decided; it takes the row, the day, the clock, and the zone.
- **Times in the day's zone.** Every formatter takes `day.timezone`; nothing reads the device zone except the mismatch check (SYS-2).
- **Execution-mode mutations are optimistic** and revert with one sentence on failure. Never a spinner over the row.
- **Nothing configurable is reachable from the tabs** except through the two doors (LS-00's actions, DH-01's rows), and both open Epic 1's sheets.
- **Every read and write through `ctx.rls.execute()`.**

---

## Canonical paths & known-stale warnings

- The route placeholders exist for `/today`, `/today/schedule`, `/day/{date}`, `/day/{date}/schedule`, `/day/{date}/item/{id}` (INF-7). This epic replaces them; `/day/{date}/item/{id}` becomes a redirect to the query form (SYS-1's ruling, `../README.md` rule 12).
- `apps/web/lib/stores/README.md` names the running-timer tick as the first sanctioned Zustand store. USE-3 creates `lib/stores/use-timer-store.ts`. Nothing else may add a store without the same justification.
- `apps/web/lib/hooks/use-elapsed.ts` exists (INF-8) — USE-3 replaces its consumer with the store; check whether it survives or is removed and log it.
- `packages/api/src/services/jobs/run-scheduled-jobs.ts` has an empty `SCHEDULED_JOBS`; USE-1 registers `auto_close_days`, USE-8 registers the four notification jobs, SET-10 registers `expire_exports`.
- The status line's `pending-review` copy in `@syn/ui`'s `copy.ts` is marked for Vesper. **Signed in SYS-1:** *Yesterday has {n} items to review* (official §10.5) with the weekday when it is not yesterday.
- `DayItemView.timerElapsedSec` is filled by the API at read time for `active` items; the store owns the tick after first paint.
