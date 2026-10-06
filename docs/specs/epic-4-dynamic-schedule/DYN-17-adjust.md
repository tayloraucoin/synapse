# DYN-17 — Adjust: the one sheet for slept in, ran long, something came up

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: L
**Slice type:** The day's one reasoned mutation, replacing two v1.0 sheets. The risk class is *detection* (an offer that infers lateness from taps) and *a scored word in the sheet* (*late*, *behind*, *catch up*, *counts half* — the tier's words live in Review only).
**Vigil:** the doesn't-fit-even-cut path (Set is allowed; the number is the feedback), the stale-apply `CONFLICT` (a fresh preview, nothing changed), the 10 s undo, the band-drag entry (DYN-16's, with the delta preset). **Vesper review:** the four steps against §6.6; none of §12.3's never-said words.

**Status:** Complete (2026-09-13 — authored and built in one thread, with DYN-15; `components/adjust-sheet/` with its four steps over `adjust.preview/commit/undo`, mounted from the day header sheet, the item sheet's *Adjust instead* and the late-wake offer (`shell.status.lateWakeOffer`, the status line's v1.1 words); the shift and trim rows are gone from the day header sheet; the four root commands and the Storybook build pass; the acceptance walk is blocked at sign-in — logged in `DEVIATIONS.md`)

**Owner:** Reeve (spec) → dev (build) · **Reviewer:** Vesper (the four steps by eye), Mason (`useAdjust` against `adjust.preview`; the offer's four conditions), Vigil (the paths named above)

## Outcome

`components/adjust-sheet/` per §6.6 verbatim: a `ResponsiveSheet size="tall"` with four steps expanding beneath each other — **What happened** (a `QuickChipRow` of the person's reason set, preselected by entry), **What gives** (`LargeTargetRow`s ordered by anchor direction; *Start work later* skips step 3), **How** (*Shorten everything* · *Cut some* · *Choose what stays* with `CheckboxField`s and the `BudgetLine`), **The proposal** (the compact list with new lengths and times, *Not assigned today* with *Keep instead*, the one sentence *Fits. Work at 9:00.* / *Work moves to 9:40.* / *Nothing soft is left to cut. Work runs to 9:20 on this plan.*, primary **Set · 2 not assigned** / **Set · work 9:40**, secondary **Cancel**); the 10 s undo toast. Entries: the day header sheet's **Adjust the day** row; the item sheet's **Adjust instead** on a *Do now* overflow; and the **late-wake offer** — one dismissable `StatusLine` *Up later than planned · Adjust the morning* when the orient frame opened more than `LATE_WAKE_OFFER_MIN` after the wake target and the day was set the night before with a hard anchor, once. The band-drag entry is wired by prop (`entry: "band-drag"`, `bandDragDeltaMin`) for DYN-16. The shift and trim rows leave the day header sheet; the status line's v1.0 *Running late? · Shift the day* becomes the v1.1 line; the components are deleted in DYN-21. After this ships, **DYN-16 has a sheet to open from the morning band, and DYN-21 can delete the shift and trim sheets.**

## Why / intent

- **§6.6** — *"Get the rest of the day to fit, with the person choosing what gives, and the record keeping why … [It must never] detect. Score in the sheet (the tier is a chip, the words counts half live in Review only). Use late, behind, catch up. Shorten below a range floor (R4). Move a pin or a fixture."*
- **§6.6 (entries)** — *"one quiet offer: when the orient frame is opened more than 30 minutes after the wake target and the day was set the night before with a hard anchor, the Today tab shows a single dismissable StatusLine at the top — Up later than planned · Adjust the morning — once, never repeated that day. (On a day that hasn't been set yet, no offer is needed …)"*
- **R4, R7, R8, R12, §2.3, §13 #1** — shortening stops at the floor; over is a number, never a refusal; only Adjust carries a reason; the record annotates.
- **Ground truth (consumed, never rebuilt):** DYN-6's `adjust.scope/preview/commit/undo` (`AdjustPreview` with `proposal`, `notAssigned`, `keptHard`, `slideMin`, `newAnchorClock`, `overMin`, `fits`, `fingerprint`; the `CONFLICT` on a changed day; `undoAdjust`'s (b)), `reason.list` (the person's set with tiers), `LATE_WAKE_OFFER_MIN`; DYN-7's `QuickChipRow`, `LargeTargetRow stacked`, `BudgetLine`, `CheckboxField`; the existing `OverflowCutList`? — no: the proposal's *Not assigned today* list is rows with an action, `ItemRow`'s `faded-with-action` shape reused as plain rows here; DYN-15's day header sheet and item sheet as the entries; the app's `StatusLineSlot` and `useDismissed`.
- **What this slice is NOT (binding):** the Schedule's band drag itself (DYN-16 — the entry and the delta are accepted by prop); deleting `shift-sheet/`, `trim-sheet/` and their services (DYN-21); the reason set's editing (ST-06 as it is).

**Rulings this slice makes (labelled, logged):**

- **The offer is computed on the server, in `shell.status`,** as `lateWakeOffer` from four facts — `woke_at_source = orient`, `confirmed_at < woke_at` (set the night before), the day's anchor hard (its own answer, else the profile's direction), no shift today yet — and the wake more than `LATE_WAKE_OFFER_MIN` after `usual_wake_time`; never on a closed day. The client scopes the dismissal to the day (`useDismissed("late-offer", "day")`), so it shows once. The v1.0 *Running late?* offer (`isLateOffer`) is no longer rendered; its fields stay in the status until DYN-21. Logged.
- **The reason chips are the person's own set** (`reason.list`, built-ins first) and the preselection maps the entry to a built-in key when it exists — *Slept in* ← `late-offer`, *Ran long* ← `header`, *Something came up* ← `one-off` — else the first chip. The tier travels with the key; no tier word is rendered. Logged.
- **Step 2's rows follow the scope's anchor:** soft → *Start work later* first, then *Keep work at {clock}*; hard → *Keep work at {clock}* only; under *depends* both, neither preselected. *Start work later* skips step 3 and previews with `what: "slide"`. Logged.
- **Step 3's *Choose what stays* is the scope's soft items as `CheckboxField`s with the `BudgetLine`** reading the ticked lengths against the scope's span; the preview runs on every change with `chosenIds`. Logged.
- **The proposal renders `preview.proposal` as plain rows** (*Breath work · 10 min · 8:12*, `shortened` marked), the not-assigned items beneath with **Keep instead** (`keepInstead` re-previews), `keptHard` named in the sentence when the fit fails at a pin or fixture (*Stand-up 9:30 stays; the walk doesn't fit before it*). *Set* is always allowed; the sentence carries the number. Logged.
- **Set calls `adjust.commit` with the preview's fingerprint;** a `CONFLICT` shows *Couldn't adjust. Nothing changed — try again.* and re-runs the preview; success closes the sheet, refreshes the day, and shows the 10 s undo toast (`adjust.undo`) whose text says what comes back (DYN-6's (b): cuts and the slide, not lengths). Logged.
- **The sheet is mounted in three places** — the day header sheet (`entry: "header"`), the item sheet (`entry: "one-off"` for a one-off, `"header"` otherwise), and the Today list via `?sheet=adjust&entry=late-offer` from the status line (the chrome has no day to hand a sheet; it navigates, as the v1.0 offer did). Logged.

## Experience & states

### `components/adjust-sheet/`

Title *Adjust* with the scope word as its subtitle (*the morning* · *the evening*, from `adjust.scope`). **1 What happened** — the `QuickChipRow`, one chip preselected. **2 What gives** — the rows. **3 How** — three `LargeTargetRow`s stacked with their descriptions; *Choose what stays* expands the soft items as checkboxes with the sticky `BudgetLine`. **4 The proposal** — the sentence, the rows, *Not assigned today*, the primary and secondary pinned. Each step renders once the one before it is answered; changing an earlier answer re-runs the preview. States: step 1–4 · previewing (the proposal shows a skeleton) · fits · over (*Nothing soft is left to cut. Work runs to 9:20 on this plan.*) · applying · error (*Couldn't adjust. Nothing changed — try again.*) · offline (disabled with the standard line) · reduced motion (no expand transition).

### The offer — the status line

*Up later than planned* · action **Adjust the morning** · dismiss. Tapping navigates to the day route with `?sheet=adjust&entry=late-offer`; the Today list opens the sheet with *Slept in* preselected.

**Failure / edge states:** an unconfirmed day → the entries are absent (the header sheet's row hidden; the offer never computed) · a closed day → absent · `adjust.preview` refuses `no_slide` (not the morning) → *Start work later* is not offered · no reasons at all → the first step is skipped and the preview sends the built-in `other` key `[ASSUMPTION: the seed always carries the four]` · undo after the window → the service's sentence in a toast · the sheet opened twice → one instance.

## Non-negotiables (this slice)

- **No detection.** The offer's conditions are the four above and nothing inferred from taps.
- **No tier word in the sheet.** `grep -n "counts half\|late\b\|behind\|catch up" components/adjust-sheet/copy.ts` returns nothing.
- **Never below a floor; never a pin or a fixture moved.** Both are the service's; the sheet only reports them.
- **Set is always allowed;** over budget is a sentence.
- **No new `@syn/ui` component.**

## Data & AI

**Schema changes: none.**

**Tables:** `shifts` (insert), `day_items` (update — lengths, times, `cut_by_shift`), `misses` (insert) — all DYN-6's.

**Placement:** `apps/web/components/adjust-sheet/{adjust-sheet.tsx,use-adjust.ts,copy.ts,index.ts}`; `components/day-header-sheet/` (the row, the shift/trim rows removed); `components/item-sheet/` (*Adjust instead*); `components/day-list/day-list.tsx` (`?sheet=adjust`); `app/(shell)/_components/status-line-slot.tsx` + `components/page-frame/shell-status-line.tsx` (the offer); `packages/ui/src/composed/feedback/status-line/copy.ts` (the v1.1 words); `packages/api/src/services/shell/status.ts` (`lateWakeOffer`). Rule 9, rule 2.

**tRPC / validators:** existing — `adjust.scope`, `adjust.preview`, `adjust.commit`, `adjust.undo`, `reason.list`; `shell.status` gains `lateWakeOffer`.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

- The four steps are `section`s with `h3`s; a step that is not yet reachable is not rendered rather than disabled.
- The chip row is a group with `aria-pressed`; the rows are radio groups.
- The proposal's sentence is `aria-live="polite"`; the `BudgetLine` carries its own.
- The undo toast is the app's; focus returns to the day header after Set.

## Acceptance criteria (observable — local tier, a confirmed Monday; `yarn web:dev`)

1. *Adjust the day* opens the sheet with *Ran long* preselected; *Adjust instead* from a one-off's *Do now* overflow opens it with *Something came up*; the late-wake offer opens it with *Slept in*. *(Vesper.)*
2. With a hard anchor step 2 shows only *Keep work at 9:00*; with a soft anchor *Start work later* is first; choosing it skips step 3 and the proposal reads *Work moves to 9:40.* with the primary *Set · work 9:40*. *(Vesper.)*
3. *Shorten everything* reaches the floors then cuts; the proposal lists the cut under *Not assigned today*; *Keep instead* on one swaps the next-lowest; the primary reads *Set · 2 not assigned*. *(Mason.)*
4. When nothing soft is left the sentence reads *Nothing soft is left to cut. Work runs to 9:20 on this plan.* and *Set* is enabled. *(Vigil.)*
5. A day changed under the sheet → *Set* shows *Couldn't adjust. Nothing changed — try again.* and a fresh proposal. *(Vigil.)*
6. Undo within 10 s restores the cut items and the slide; the toast says what comes back. *(Vigil.)*
7. The offer appears once at 7:45 on a hard-anchor day set last night; not on an unset day; not after dismissal; not after an Adjust. *(Mason.)*
8. `grep -n "counts half\|late\b\|behind\|catch up\|%" apps/web/components/adjust-sheet/copy.ts` returns nothing; the day header sheet has no *Less time today* / *Shift my day* rows.
9. Offline: *Set* disabled with the line.
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `adjust.preview` is a query; run it through `utils.adjust.preview.fetch` on each answer change with a small debounce.
- The scope's soft items for *Choose what stays* are the preview's `proposal` + `notAssigned` under `how: "cut"`; a first preview with `how: "choose"` and every id chosen lists them all.
- `useDismissed("late-offer", "day", dayKey)` already exists on the slot; reuse the key.

## Dev's call

Whether step 1 shows when the entry preselects (yes — one tap, usually none) · the subtitle's scope word · the undo toast's exact sentence.

## Out of scope

- **The band-drag entry from the Schedule** — DYN-16 (the prop exists).
- **Deleting `shift-sheet/`, `trim-sheet/`, `shift.*`, `isLateOffer`** — DYN-21.

## Depends on

- **DYN-15** — the day header sheet and the item sheet as entries. Complete in `PROGRESS.md`.
- **DYN-6** — `adjust.*`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Four steps feeding one preview with a fingerprint, and a status line that must never infer; a cheaper model writes *late* into the sheet or detects lateness from a tap.

---

### Kickoff (paste into the session)

> Build **DYN-17 — Adjust** (attached spec). Model: **Opus**. **No detection; no tier word; never below a floor; pins and fixtures reported, never moved; Set is always allowed.**
> Attach/read first, in order: this spec · v1.1 §6.6, §12.3, R4, R7, R8 · `apps/web/AGENTS.md` · root `AGENTS.md` · DYN-6 (`adjust-day.ts`, `adjust.ts`) · DYN-15 (the two entries) · the existing `shift-sheet/` and `trim-sheet/` (read for the undo toast and the reason chips; do not reuse) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Walk the sheet in the browser on a confirmed Monday. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
