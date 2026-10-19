# DYN-19 — Review amended

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: M
**Slice type:** Existing review surfaces re-pointed at blocks and the journal. The risk class is *synthesis* (a summary over the journal — Reflections is verbatim, chronological, in the person's words) and *a scored container* (the work block is a line, never a decision).
**Vigil:** none. **Vesper review:** the counts line as information; the block bar in the neutral scale with minutes as text; Reflections with no synthesis.

**Status:** Complete (2026-09-13 — authored and built in one thread, with DYN-18; the Day Review by block with the intention line, the moved words, the work line and *shortened*; the Week Review's counts line, time by block, Reflections and the strip's *not confirmed* square; the export's three new files; the four root commands pass; the acceptance walk is blocked at sign-in — logged in `DEVIATIONS.md`)

**Owner:** Reeve (spec) → dev (build) · **Reviewer:** Vesper (both reviews by eye), Mason (the resolver untouched; the strip state; the export's columns)

## Outcome

Day Review per §8.1: undone items grouped under `BlockHeader`s in block order; the confirm-yesterday panel first (DYN-18); *3 moved* in the header's words and *planned 7:20 · done 7:52* on each moved item; *shortened* as a line on items Adjust shortened (`shifts.shortened_item_ids`); the work block as one unscored line *Work · Viewpoint · 9:04–17:40*; the intention in serif under the date. Week Review per §8.2: the counts line as information (*Morning A 2 of 2 · Menu 3 · Viewpoint 2 of 2 · Push 1 of 1 · Unstructured 1 · 2 not confirmed*); **time by block** — a stacked bar in the neutral scale with minutes beside each segment — above **time by category** (kept, R10); **Reflections** in serif listing *Grateful for today* and *Looking forward to* verbatim, dated, no synthesis, empty state *Nothing written this week.*; the strip's *not confirmed* square. Export adds `day_blocks.csv`, `fixtures.csv`, `journal_entries.csv` and the new columns to the JSON. The resolver (v1 §7.3) and the number (§7.4) are untouched.

## Why / intent

- **§8.1** — *"Sections by block … Moved is a line, not a section … The work block is never scored. It appears once as a line … The orient line. If an intention was written that morning, the review header shows it back in serif under the date … No question about it."*
- **§8.2** — *"Counts as information … Tabular, no colour … Time by block (R10): a stacked horizontal bar with one segment per block kind, minutes beside each … Colour: the neutral scale stepped, no hues, because blocks are not categories … Reflections: a region in serif listing the week's Grateful for today and Looking forward to lines verbatim, one per day, dated, no synthesis … Strip states gain not confirmed."*
- **R10, R16, §10.3, §13 #10;** v1 §7.3–7.4 stand.
- **Ground truth (consumed, never rebuilt):** DYN-5's `DayView.blocks`, `days.intention`; DYN-6's `shifts.shortened_item_ids`; DYN-7's `BlockHeader`, `StripSquare` with `not-confirmed`; DYN-18's `lastNight` and the journal; the existing `get-review-day`, `get-review-week`, `computeAdherence`, `stripStateFor`, `build-export`.
- **What this slice is NOT (binding):** any change to the resolver or the number; a monthly view (P2-4); a summary over the journal.

**Rulings this slice makes (labelled, logged):**

- **The Day Review reads the day's views from `blocks` + `unblocked`** (not `parts`) and groups its panels by `item.blockKind`, in the day's block order, the block-less last under *Also today*. Logged.
- **`ReviewDayView` gains `intention`, `blocks` (kind, name, span — for the headers and the work line), `shortenedIds`, `lastNight`.** The work line is the work block's name, the focus and its span; it is never a panel. Logged.
- **`stripStateFor(verdict, completionState?)`** returns `not-confirmed` when the row's state is `not_confirmed`; the resolver's `excluded` is untouched. Logged.
- **`ReviewWeekView` gains `counts` (the pooled things with their used-of-target, as `{ label, used, target | null }`), `blockMinutes` (per kind, done items' lengths — the same source as time by category), `reflections` (per day: `gratitude_today`, `looking_forward`), `notConfirmedCount`.** Logged.
- **The export's three new CSVs** follow the existing per-table shape; the JSON gains the same rows. Logged.

## Experience & states

### Day Review — `components/review-day/`

Under the date: the intention in serif when one was written (*Intention: one thing at a time.*). The summary sentence carries *3 moved* in its words. Sections: **Last night** (DYN-18's panel) first; then one `BlockHeader` per block that has panels, in block order, the panels under it; the work block as one `ListRow` line *Work · Viewpoint · 9:04–17:40* with no control; *Also today* for block-less panels; *Cut when shifted* as v1 (a refit's cuts show *Change* like a shift's); *Done* collapsed with *planned 7:20 · done 7:52* on moved items and *shortened* on Adjust-shortened ones; Reflections (DR-06) as v1.

### Week Review — `components/review-week/`

Under the header: the counts line, tabular, muted, one entry per pooled thing. Then **Time by block**: a stacked horizontal bar with one segment per kind in the neutral scale (stepped opacity of `bg-ink`), each segment's minutes beside its name beneath (*Morning 5 h 10 · Work 41 h*); **Time by category** beneath as v1. **Reflections**: a serif region, one dated entry per day with a line, verbatim; empty → *Nothing written this week.* The strip renders `not-confirmed` squares with the label.

**Failure / edge states:** a split work block → one work line · a day with no blocks (pre-backfill) → panels ungrouped as v1 · no journal in the week → the empty line · no done items → the bar is absent · the export on an account with no fixtures → an empty `fixtures.csv` with its header.

## Non-negotiables (this slice)

- **The resolver and the number are untouched.**
- **The work block is never scored.**
- **Reflections is verbatim, chronological, in the person's words — no synthesis.**
- **No colour on the counts line; the block bar is the neutral scale.**
- **No new `@syn/ui` component.**

## Data & AI

**Schema changes: none.**

**Tables:** read only — `days`, `day_blocks`, `day_items`, `shifts`, `journal_entries`, `fixtures`.

**Placement:** `components/review-day/{review-day,decision-column,copy}.tsx`; `components/review-week/{review-week,copy}.tsx`; `services/review/{get-review-day,get-review-week}.ts`; `packages/utils/src/review/strip.ts`; `services/user/build-export.ts`. Rule 3, rule 9.

**tRPC / validators:** existing `review.day`, `review.week`, `user.requestExport`.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

- Each `BlockHeader` in the review is an `h2`; the work line is a `p`, not a button.
- The block bar is a `figure` with the minutes as its text; the segments carry `aria-hidden` colour and a visible label each.
- Reflections entries are `blockquote`s with the date as `figcaption`.
- The strip announces *Tuesday, not confirmed*.

## Acceptance criteria (observable — local tier; `yarn web:dev`)

1. A reviewed Monday shows its panels under *Morning*, *Before work*, *Wind-down* headers in order, the work block as *Work · Viewpoint · 9:04–17:40* with no decision, the intention under the date in serif. *(Vesper.)*
2. A moved done item shows *planned 7:20 · done 7:52*; an Adjust-shortened item shows *shortened*; the summary reads *… 3 moved …*. *(Vesper.)*
3. The Week Review shows the counts line, the block bar with minutes beside each segment, time by category beneath, and Reflections with the week's lines dated and verbatim; a week with no journal reads *Nothing written this week.* *(Vesper.)*
4. The strip shows a blank *not confirmed* square for a not-confirmed item and announces it. *(Vesper.)*
5. The adherence number for a week is identical before and after this ticket for the same rows. *(Mason.)*
6. The export zip contains `day_blocks.csv`, `fixtures.csv`, `journal_entries.csv` with headers. *(Mason.)*
7. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `getReviewDay` already calls `getDay`; `day.blocks[].items` carries `blockKind` on each view.
- `shifts.shortened_item_ids` is a column (DYN-3); collect across the day's shifts.
- The block bar needs no new composite: a flex row of `div`s with widths from minutes, the neutral scale as `opacity`.

## Dev's call

The counts line's separator (the middle dot) · the bar's minimum segment width · whether *Also today* panels get a header (a caption).

## Out of scope

- **A monthly view** — P2-4.
- **The resolver** — untouched.

## Depends on

- **DYN-18** — `lastNight`, the journal. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet** (the handoff's call); built by Opus in Taylor's batch 10.

---

### Kickoff (paste into the session)

> Build **DYN-19 — Review amended** (attached spec). Model: **Sonnet**. **The resolver untouched; the work block never scored; Reflections verbatim; no colour on the counts.**
> Attach/read first, in order: this spec · v1.1 §8.1, §8.2, R10, R16 · `apps/web/AGENTS.md` · root `AGENTS.md` · the existing `components/review-day/`, `components/review-week/`, `services/review/` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Walk both reviews in the browser. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
