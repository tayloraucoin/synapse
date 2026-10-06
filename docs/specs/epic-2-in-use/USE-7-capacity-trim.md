# USE-7 — Capacity trim: TR-01, *Keep instead*, and LS-02 as a consequence — Phase 2

**Epic:** USE — In Use · **Phase 5 (Phase 2 per official §12; does not gate launch)** · Size: M
**Slice type:** One sheet over one day-level mutation with a preview loop. The risk class is *a trim that scores*: a trimmed item counted as missed, a hard item trimmed, a second trim that forgets the first.
**Vigil:** none. Induce: a trim that cannot fit (nothing else flexible); a second trim the same day that brings items back; a trim with done and active items on the day.

**Status:** Complete (2026-09-06)

---

## Outcome

With less time than planned, a person opens *I have less time today*, types (or chips down to) the minutes they have, sees which flexible items would be set aside — lowest importance first — swaps any back with *Keep instead*, and applies. Those items leave the list body and sit under *{n} not assigned today* with *Bring back* (USE-2 built the expander and the action). Nothing is scored; the Day Review never asks about them. A second trim replaces the first and says which items come back. **Nothing else changes.**

## Why / intent

- **Official spec §5.8** — the sheet, the pre-filled planned total, the four chips, the result line, *Keep instead* swapping the next-lowest, hard items never trimmed, trimmed items `not_assigned` and never scored. §6.6 — the trim order. §6.8 — the swap when nothing else can be trimmed. §0.3 R1 — a trim is *not assigned*, never *missed*. §2.4 guardrail 2.
- **Epic 2 §7 (TR-01) and §2 (LS-02)** — every read, interact, rule, and state: *Time available* 5–1440 prefilled; *Planned: {planned} min ({first}–{last})*; a value ≥ planned → *That's the whole plan — nothing to trim.* with Apply disabled; *Fits in {capacity} min.* · *Not assigned today:* rows with priority and *Keep instead*; *Nothing else is flexible. {r} min over.*; *Kept — {r} min over.*; hard, done, and active items never trimmed and included in the planned total; a second trim replaces the first with *{n} come back.*; Apply writes `capacity_min` with no toast — the expander is the confirmation.
- **Ground truth:** USE-2's LS-02 expander (`DayView.notAssigned`, `capacityMin` in the explanation) and `item.bringBack`; USE-3's `day-header-sheet/` (the `hidden` row); USE-1's `compareForTrim`, `DayView`; `@syn/ui` `ResponsiveSheet`, `NumberUnitInput chips`, `QuickChipRow`, `ItemRow variant="faded-with-action"`, `Text`, `Button`; `CAPACITY_MIN/MAX`.
- **What this slice is NOT (binding):** no scoring change; no shift interaction beyond "cut items are not trim candidates".

**Rulings this slice makes (labelled, logged):**

- **The trim is computed by one pure function** `computeTrim(items, capacityMin, keep: Set<id>)` in `@syn/utils/day/trim.ts`: candidates = assigned, soft, undone, not running items; sort by `compareForTrim` ascending; planned total = every assigned item's duration (hard, done, active included); trim from the lowest until `planned − trimmed ≤ capacity`, skipping ids in `keep`; returns `{ trimmed: id[], kept: id[], overMin, comeBack: id[] }` where `comeBack` is currently `not_assigned` items that now fit. The service and the sheet call the same function (the sheet, for the live preview, over the cached `DayView`). Logged.
- **`trim.apply({ date, capacityMin, keep })`** recomputes server-side, writes `days.capacity_min`, sets trimmed items `assignment_state = not_assigned` and previously trimmed-now-fitting items back to `assigned`, in one transaction. A trimmed item keeps its times (so *Bring back* returns it to its slot). Logged.
- **Items with no duration are 0 minutes in the total and never trimmed** (there is nothing to free). Logged.
- ***Keep instead* is client state** (the `keep` set) until Apply; the preview re-runs `computeTrim` locally on each change. Logged.
- **DH-01's *I have less time today* row un-hides** (hidden when closed). Logged.

## Experience & states

### TR-01 (`?sheet=trim`)

`ResponsiveSheet` title *I have less time today* · `NumberUnitInput label="Time available" unit="min" min={CAPACITY_MIN} max={CAPACITY_MAX}` prefilled with the planned total · `Text tone="secondary"` *Planned: {planned} min ({first}–{last})* · `QuickChipRow chips=[−15, −30, −45, −60] onApply` (subtracts from the current value) · result region once the value is below planned: *Fits in {capacity} min.* · *Not assigned today:* then `ItemRow variant="faded-with-action" action={Keep instead}` per trimmed item (icon · title · *{duration} min* · priority — the row shows the time; the priority number is a `Tag`) · when nothing more can be trimmed: *Nothing else is flexible. {r} min over.* · after a *Keep instead* with nothing left: *Kept — {r} min over.* · when a previous trim exists and items now fit: *{n} come back.* · footer *Cancel* · *Apply* (disabled when value ≥ planned with *That's the whole plan — nothing to trim.*).

On Apply: `trim.apply`; the sheet closes; the List re-renders with LS-02 populated and its explanation *Trimmed to fit {capacity} min. These don't count.*; no toast.

**States (exhaustive):** idle (value = planned; no result) · result-fits · result-over (nothing else flexible) · kept-over · come-back · applying · error (*Couldn't save. Try again.* `[COPY — needs Vesper sign-off: TR-01 lists no error string]`) · offline (Apply disabled).

**Failure / edge states:** every candidate is hard → the result region reads *Nothing else is flexible. {r} min over.* immediately and Apply is enabled (the document: "lets the total exceed capacity") · the day closes mid-sheet → apply refuses (`CONFLICT`) with the sentence · a value typed below 5 → the field's min error `[COPY — needs Vesper sign-off]`.

## Non-negotiables (this slice)

- **Hard, done, and active items are never trimmed** and always count in the planned total.
- **A trimmed item is `not_assigned`, never `missed`, and never gets a `misses` row.**
- **The trim order is §6.6's**, through `compareForTrim`.
- **A second trim replaces the first**; items that now fit come back automatically and the sheet says so.
- **No toast on apply.**

## Data & AI

**Schema changes: none.**

**Tables:** `days` (update `capacity_min`) · `day_items` (update `assignment_state`).

**Placement:** `trim.preview` (optional — the client computes; provide it for the future mobile app) and `trim.apply` on the `day` router (no separate `trim` router; it is a day action); service `services/day/apply-trim.ts`; pure `packages/utils/src/day/trim.ts`; validators `packages/validators/src/day.ts` (`applyTrimInput`: capacity 5–1440, keep ids); feature folder `components/trim-sheet/`; DH-01's row un-hidden.

**tRPC / validators:** `day.applyTrim` · `day.previewTrim`.

**AI notes:** **None.**

## Accessibility

- The result region is `aria-live="polite"` and announces the fits/over sentence once per change (debounced on typing).
- Each trimmed row's *Keep instead* names the item.
- The chips are buttons with their labels (*minus 15 minutes*).
- Apply's disabled reason is visible text, not only a disabled state.

## Acceptance criteria (observable — a seeded day with hard, soft, done, and active items)

1. DH-01 shows *I have less time today*; the sheet opens with *Time available* prefilled to the planned total and the planned line with first–last times.
2. Typing 45 shows *Fits in 45 min.* and the trimmed rows in ascending priority (ties: shorter first, then later start), none hard, done, or active; the chips subtract.
3. *Keep instead* on a row returns it and trims the next-lowest; when nothing else is flexible, *Kept — {r} min over.* and Apply stays enabled.
4. A value ≥ planned shows *That's the whole plan — nothing to trim.* and Apply disabled.
5. Apply writes `days.capacity_min = 45` and sets the trimmed rows `not_assigned`; the List hides them and shows *{n} not assigned today* with *Trimmed to fit 45 min. These don't count.*; no toast appears.
6. *Bring back* (USE-2) returns one; a second trim to 60 shows *{n} come back.* for items that now fit and applying restores them and trims per the new value.
7. A trimmed item has no `misses` row and REV-2's Day Review (if Complete) does not list it under *To decide*.
8. Offline: Apply disabled with the line.
9. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `computeTrim` over `DayItemView[]` needs `assignmentState` and `scheduling` — both are on the view (`scheduling`; `state === "not-assigned"`); the running check is `state === "active"`.
- The planned total's `{first}–{last}` uses the day's scheduled items' min start and max end via `formatWindow` in the day's zone.

## Dev's call

Whether `day.previewTrim` ships now or is left for mobile · the debounce on the live region.

## Out of scope

- **The expander and *Bring back*** — USE-2 (built).
- **Shift** — USE-6; cut items are not trim candidates (they are `cut_by_shift`, not `assigned`).
- **Keeping `capacity_min` history** — never (cross-cutting §8.1's *Consider* note; not built).

## Depends on

- **USE-2** — LS-02, `item.bringBack`. Complete in `PROGRESS.md`.
- **USE-3** — the day-header sheet whose hidden row this ticket reveals. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** One pure function with a stated order, one mutation, one sheet. The failure mode of choosing down is trimming a hard or active item — both are in the acceptance criteria.

---

### Kickoff (paste into the session)

> Build **USE-7 — Capacity trim: TR-01, *Keep instead*, and LS-02 as a consequence** (attached spec). Model: **Sonnet**. **Hard, done, and active items are never trimmed; a trimmed item is `not_assigned`, never missed; a second trim replaces the first; no toast.**
> Attach/read first, in order: this spec · Epic 2 §7 (TR-01), §2 LS-02 · official spec §0.3 R1, §5.8, §6.6, §6.8 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · USE-2 (LS-02, `item.bringBack`) · USE-3 (`day-header-sheet/`) · USE-1 (`compareForTrim`) · `packages/ui/src/composed/control/{number-unit-input,quick-chip-row}/` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
