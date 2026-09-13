# DYN-18 — The evening: the wind-down section, the journal, confirm-yesterday in the review, Settings → Closing the day

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: L
**Slice type:** The winding-down state's surfaces — the lowest-willpower hour. The risk class is *a nag* (any pressure on an empty journal — a count, a "done" ceremony, a pending state) and *a fabricated record* (a pre-ticked confirm).
**Vigil:** none. **Vesper review:** the journal screen against §7.2 verbatim; the confirm panel never pre-ticked. **Sage's lens (§7.2), quoted:** *"Two gratitudes stay two fields: the first is a record (it feeds the Week Review's reflections), the second is a state. The prompts are the person's … the app never supplies an answer, a starter phrase, or an example. Playback in the morning is the mechanism that gives this feature its effect … Nothing here should be dressed as more."*

**Status:** Complete (2026-09-13 — authored and built in one thread, with DYN-19; `/day/{date}/journal` and `components/journal/`, the journal row's self-tick, `review.confirmLastNight` with the panel first in the Day Review, Settings → Your day → Closing the day as the embedded screen with the wind-down starters; the four root commands pass; the acceptance walk is blocked at sign-in — logged in `DEVIATIONS.md`)

**Owner:** Reeve (spec) → dev (build) · **Reviewer:** Vesper (the screen by eye), Mason (the jsonb merge; `confirmLastNight` against `confirmDay`'s)

## Outcome

The journal screen at `/day/{date}/journal` (`journalRoute(date)`) per §7.2 verbatim: back and the date, paper, one column; the person's prompts as captions over serif autogrow `Textarea`s; every field autosaves on pause through `journal.save` (one key per save, merged); a `SaveStatus` *saved* in caption size; no finish button, no timer, no count; read-only serif for a past day. The wind-down section's *Journal* row opens it, and ticks itself when any field has text (`syncJournalItem`). The confirm-yesterday panel is the first section of the Day Review whenever the day has wind-down items still waiting (`ReviewDayView.lastNight`); ticking writes done, the rest become *not confirmed* through `review.confirmLastNight` — the same rule `confirmDay`'s morning uses, on the review's day. **Settings → Your day → Closing the day** opens first run's screen 10 frame-less (lights-out, phone-away, the journal switch and prompts) with the wind-down starters as a chooser band (`habit.createFromStarterLibrary({ blockKind: "wind_down" })` + a slot each on the wind-down template) and a ghost row to the wind-down routine's editor. After this ships, **DYN-19 has the journal to list and the panel to place, and DYN-20 has the wind-down block's start to push at.**

## Why / intent

- **§7.2** — *"A few lines in the person's own words — where they want to be, not what happened — so the morning has something true to read back … [It must never] nag for an empty field. Time the person. Comment on length. Summarise. Show yesterday's entry alongside. Turn empty into pending — an empty journal night is nothing, not a miss."*
- **§7.3** — *"Say what actually happened after the phone went away, once, with one tap per item … If the Day Review is opened before the morning … the same panel is the first section of the review … [It must never] pre-tick. Ask for a reason. Block the morning."*
- **§7.1** — the wind-down rows, the journal as the closer; the starter library for wind-down, nothing pre-checked.
- **R15, R16, §12.3, §13 #3.**
- **Ground truth (consumed, never rebuilt):** DYN-5's `journal.get/save/lastNight` (`getJournalEntry`, the jsonb merge), `afterDevicesOff`, `findDevicesOffMarker`, `confirmLastNight`'s rule; DYN-11's `Step10Closing` with `embedded`; DYN-14's `ConfirmYesterdayPanel`; DYN-15's wind-down rows; DYN-7's serif `Textarea`, `SaveStatus`; the existing `review.*`.
- **What this slice is NOT (binding):** the Day Review's grouping by block, the intention line, the Week Review's reflections region (DYN-19); the journal push and the wind-down push (DYN-20); the prompts' drag handles (DYN-9).

**Rulings this slice makes (labelled, logged):**

- **The journal row is recognised the way the materialiser places it:** the wind-down block's item whose role is closer, else whose title is *journal* (case-insensitive). Tapping it navigates to `journalRoute(date)` instead of opening the item sheet; `syncJournalItem` (called after every `journal.save`) marks it done when any answer is non-empty and clears it when all are, without touching a row the person ticked by hand (`done_at` set with no journal text stays). Logged.
- **`review.confirmLastNight({ date, doneItemIds })`** resolves the day's own after-devices-off items — `upcoming` or `not_confirmed` — to done (ticked) or *not confirmed* (the rest); R16's one-tap resolution for a `not_confirmed` item is the same call with its id ticked. `ReviewDayView.lastNight` lists what is still waiting; they are removed from `toDecide` so the panel is the one place they are asked about. Logged.
- **Settings → Your day → *Closing the day* opens the screen, not the editor;** the screen carries a ghost row **Wind-down routine** to `settingsYourDayBlockRoute("wind_down")`. DYN-8's row pointed at the editor as a stand-in. Logged.
- **The wind-down starters are a chooser band on the Closing-the-day screen** (both frames), ticking a starter creates the habit and a slot on the wind-down template (created when absent); the placed entries (*Journal*, *Phone away*) are never offered — the app places them. Logged.
- **A past day's journal is read-only serif** from Review; `journal.save` already refuses a future day; a past day is allowed to be written (the person may finish last night's lines the next morning) — only Review's read-only mode renders it as text. Logged.
- **Offline: fields keep their text and the status reads *Saving on this device*;** there is no local queue in Phase 1 — the status line and the retry are the honest state. Logged.

## Experience & states

### The journal — `/day/{date}/journal`, `components/journal/`

`PageFrame` with a `ShellPageHeader` (back to the day, the date as the title, no action). One column (`contentWidth="text"`): for each prompt in order, a caption in muted sans and a serif `Textarea` (`rows={1}`, autogrow); the `SaveStatus` under the last field in caption size. Autosave: 600 ms after the last keystroke and on blur, one key per save. Read-only (a past day opened from Review): each answer as serif text under its caption with hairlines; empty prompts omitted; nothing written at all → *Nothing written.* `[COPY]`. States: empty · writing · saved · retrying (*Saving on this device*) · offline · read-only.

### The Day Review's first section

When `day.lastNight.length > 0`: `ConfirmYesterdayPanel` with its own caption, nothing ticked, and one primary under it **Confirm** `[COPY]` → `review.confirmLastNight`; the section disappears once resolved. A `not_confirmed` item resolved to done re-scores through the existing resolver.

### Settings → Your day → Closing the day

`/settings/your-day/closing-the-day`: `Step10Closing` embedded; beneath its fields the **Wind-down** chooser band (*Read · Stretch · Meditate · Bath · Tidy the kitchen · Lay out tomorrow · Skincare · Tea*, nothing checked; an entry already in the library reads *in your library*); the ghost row **Wind-down routine**.

**Failure / edge states:** a day with no journal row → the first save creates the day and the row · two fields from two devices → both survive (the merge) · a future day → refused by the service (the route 404s ahead of today) · a day with no wind-down block → the row never appears, the screen still writes · a journal item ticked by hand with nothing written → left alone · the panel with every item ticked → all done, nothing not confirmed · offline → *Saving on this device*, the fields hold.

## Non-negotiables (this slice)

- **Never pre-ticked.** Nothing on the panel or the band starts checked.
- **No nag, no count, no timer, no ceremony** on the journal.
- **No starter phrase, no example** in a field.
- **An empty night is nothing** — no pending state, no miss.
- **No new `@syn/ui` component.**

## Data & AI

**Schema changes: none.**

**Tables:** `journal_entries` (upsert), `day_items` (update — the journal row's done state; the wind-down items' confirm), `habits` + `template_slots` (insert — the starters).

**Placement:** `app/(shell)/day/[date]/journal/page.tsx`; `components/journal/{journal-screen.tsx,use-journal.ts,copy.ts,index.ts}`; `components/day-list/block-section.tsx` (the row's navigation); `components/review-day/{review-day,copy}.tsx` (the panel); `app/(shell)/settings/your-day/{[screen]/…,_components/…}` (the seventh screen); `app/(setup)/_components/step-10-closing.tsx` (the band and the ghost row); `packages/api/src/services/day/journal.ts` (`syncJournalItem`); `services/review/{confirm-last-night,get-review-day}.ts`; `routers/review.ts`; `packages/validators/src/review.ts`; `lib/routes.ts`; `apps/web/AGENTS.md`. Rule 9, rule 3.

**tRPC / validators:** `review.confirmLastNight({ date, doneItemIds })` · existing `journal.get/save`, `habit.createFromStarterLibrary`, `template.*`.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

- Each prompt is the `label` of its field; the save status is `aria-live="polite"`.
- Read-only answers are `blockquote`s with the prompt as `figcaption`.
- The panel's checkboxes are 44px rows; **Confirm** is the section's one button.
- The chooser band's checkboxes are labelled by their titles; *in your library* is part of the label.

## Acceptance criteria (observable — local tier; `yarn web:dev`)

1. Tapping the wind-down *Journal* row opens `/day/{today}/journal`: back and the date, six prompts as captions over serif fields, no button, no count. *(Vesper.)*
2. Typing in *Grateful for today* saves that key alone; a second field written elsewhere survives (the jsonb merge); leaving mid-line keeps the text. *(Mason.)*
3. The wind-down *Journal* row is done when any field has text and undone when all are cleared; a row ticked by hand with nothing written stays done. *(Mason.)*
4. The Day Review on a day with unconfirmed wind-down items shows the panel first with nothing ticked; **Confirm** with one ticked writes `done` for it and `not_confirmed` for the rest; the panel disappears. *(Mason.)*
5. A past day's journal opened from Review is read-only serif; a future day's route 404s. *(Vesper.)*
6. Settings → Your day → *Closing the day* opens the screen with lights-out, phone-away, the switch, the prompts, the wind-down band and the ghost row; ticking *Read* creates the habit and a slot on the wind-down template. *(Vesper, Mason.)*
7. `grep -rn "pending\|streak\|word count\|well done" apps/web/components/journal/copy.ts` returns nothing; `days.morning_gratitude` is not written by anything in this ticket.
8. Offline: the fields keep their text and the status reads *Saving on this device*.
9. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `getJournalEntry` returns `{ answers, prompts }`; the screen's fields are the prompts in order, values from `answers`.
- `syncJournalItem` needs the day's wind-down block and its items; `readDay` + `readDayBlocks` from `materialize-day.ts` give both.
- `confirmLastNight` in `confirm-day.ts` is written for yesterday-from-today; the review's version takes the day itself and includes `not_confirmed` in `pending`.

## Dev's call

The save debounce (600 ms) · whether the panel's **Confirm** is a button or each tick writes at once (a button — one write, R16's "once") · the empty read-only line.

## Out of scope

- **Grouping the review by block, the intention line, Reflections** — DYN-19.
- **The pushes** — DYN-20.
- **Prompt drag handles** — DYN-9.

## Depends on

- **DYN-15** — the wind-down rows on the tab. Complete in `PROGRESS.md`.
- **DYN-14** — `ConfirmYesterdayPanel`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The lowest-willpower surface in the product; a cheaper model adds a finish button, a count, or a pre-tick.

---

### Kickoff (paste into the session)

> Build **DYN-18 — The evening** (attached spec). Model: **Opus**. **Never pre-ticked; no nag, count, timer or ceremony; no starter phrase; an empty night is nothing.**
> Attach/read first, in order: this spec · v1.1 §7.1–§7.3, §12.3, R15, R16 · `apps/web/AGENTS.md` · root `AGENTS.md` · DYN-5 (`journal.ts`, `wind-down.ts`, `confirm-day.ts`) · DYN-14 (`confirm-yesterday/`) · DYN-11 (`step-10-closing.tsx`) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md`.
> Walk the journal and the panel in the browser. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
