# SET-5 — Templates: the API, TP-01, the TP-02 canvas, TP-03, and the same-start multitask rule

**Epic:** SET — Setup · **Phase 3** · Size: L
**Slice type:** A canvas that autosaves plus its child sheet, over a domain with one invariant that must never be violated (two slots at one start must be a multitask group). The risk class is *a silent stack*: the invariant enforced only in the sheet and bypassed by a reorder, a duplicate, or a second device.
**Vigil:** none. **Mason review:** the collision rule's server enforcement (AC 8–9).

**Status:** Complete (2026-09-05) — the API, TP-01, the TP-02 canvas, TP-03 and the same-start invariant; **the browser-observable criteria are unrun** (the screens are behind the auth gate and no Supabase project is wired). The invariant itself was probed directly. See `DEVIATIONS.md`.

> **Mason — invariant review.** The same-start rule is enforced in the service on every slot write and reported back on every template read as `collisions`. Confirm no write path (add, update, move, duplicate, the habit picker's "New habit" return) can leave two ungrouped slots on one start without the editor showing the inline question.

---

## Outcome

A person can describe a kind of day once: name it, set when it starts, how many days a week they mean to use it, and which days it usually falls on; then stack habits into it as slots with a start (or a window, or none), a duration inside the habit's range, a priority that defaults to the habit's importance, and a Fixed/Flexible marking. Two slots that start together are asked about — *Do these happen at the same time?* — and either become a multitask group or move. The editor autosaves and says so in its header. Templates can be duplicated, archived, restored, and listed with their usage. **No day is created by this ticket** — applying a template is SET-6; the *Applied to {n} days* line and TP-04 render only once days exist.

## Why / intent

- **Official spec §3.4, §3.5, §4.4** — the Template is the former Variant; slots carry offsets from an anchor so the whole template applies at any time; "two slots sharing a start offset must be in the same group or the template won't save"; the editor "earns density"; no drag handles on mobile; *Fixed · Flexible* in the interface; duplicate is first-class.
- **Epic 1 §5 (TP-01, TP-02, TP-03)** — every read, interact, validation, and state. §0.3: canvases autosave per change and never prompt to discard. §9: the validation copy. §10: destructive row actions on a canvas get a 5-second undo toast, not a confirmation, except archive.
- **Cross-cutting §8.1** — a template is always editable; days already applied ask via TP-04 (SET-6).
- **v2 handoff §5** — `AppHeader` with `saveStatus`, `ListRow`, `GroupHeading`, `ArchivedSection`, `EllipsesMenu`, `ResponsiveSheet`, `PickerList`, `SegmentedControl`, `TimeField`, `MinutesStepper`, `Stepper17` (`resting`, `onReset`), `CountStepper` (`zeroLabel="none"`), `WeekdayChips`, `InlineQuestionRow`, `MultitaskGroup`, `ItemIcon`, `TimeText`, `Tag`, `EmptyState`, `toastUndo`, `SaveStatusText` — all built. `SlotView` in `@syn/types` is the slot row's view model.
- **Ground truth:** SET-1's `templates`, `template_slots`; SET-4's `habit.list`, the habit sheet, `@syn/validators` `habit.ts`; `lib/hooks/use-leave-guard.ts` (for the "back is held once" rule).
- **What this slice is NOT (binding):** no `days` or `day_items` writes; no materialisation; no TP-04; no first-run frame (SET-7 embeds this editor with an `embedded` prop this ticket provides and does not otherwise use).

**Rulings this slice makes (labelled, logged):**

- **The template editor is a feature folder** `apps/web/components/template-editor/{use-template-editor.ts, template-editor.tsx, slot-row.tsx, slot-sheet.tsx, copy.ts, index.ts}` taking `{ templateId, embedded?: boolean, onLeave? }`. TP-03 (the slot sheet) lives inside it because nothing else opens a slot sheet. Logged.
- **Create mode creates the row on open with an empty name.** The document allows a nameless draft with slots to exist ("if empty on back with slots, the field errors *Name this template.* and back is held once"), and slots need a template id. `templates.name` therefore admits `''` at the column; the validator for *leaving* requires 1–40. A nameless, slotless template is deleted by `template.discardIfEmpty` on leave. TP-01 never lists a nameless template with no slots (it was discarded); one with slots lists as *Untitled* `[COPY — needs Vesper sign-off]`. Logged.
- **The same-start rule is a server invariant, not a sheet behaviour.** `template.saveSlot` rejects with `CONFLICT` `{ code: "same_start", withSlotId, withTitle, atClock }` when another ungrouped slot shares `offset_start_min` (fixed-time slots only; windows and anytime never collide), unless the input carries `multitaskWith: <slotId>`, in which case both join one group. `template.get` returns `collisions: Array<[slotId, slotId]>` for any pair the rule finds (reachable only by a second device or a bug), and the editor renders the inline question row between them. Logged.
- **Offsets are wall-clock minutes from the anchor; the editor converts clock ↔ offset with plain arithmetic.** A template has no zone; the zone enters at materialisation (SET-6). Displayed clock = anchor + offset, allowed to cross midnight (offset > 24 h − anchor displays as the next day's clock with no marker — the document gives none). Logged.
- **Reorder is only within a shared start** (the document); otherwise order is time order and *Move up/down* are hidden. `sort_order` is written only for grouped slots. Logged.
- **Autosave is per field, debounced 400 ms, with `SaveStatus` in the header**: `saving` on the first pending write, `saved` after the last resolves, `retrying` after one failure (auto-retry with backoff ×3), `failed` after three with the line *Changes aren't saving. Check your connection.* and local state kept. Logged.

## Experience & states

### TP-01 Template list (`/settings/templates`)

`AppHeader` *Templates*, `action` *New* → `template.create` then `router.push(settingsTemplateRoute(id))`. Rows: `ListRow` `title` = name (*Untitled* when empty), `meta` = *{n} items · {total} min* + typical-days initials in `Text tone="secondary"` (*M T W T F*, from `typical_days`) + *target {n}/week* when set + *Used {k} days this week* (from `template.list`'s `usedThisWeek`, 0 until SET-6), `trailing` `EllipsesMenu` *Duplicate* · *Archive*, `href` to the editor. Duplicate name rule: `{name} B` when the name ends in a single letter A–Y after a space, else `{name} copy`; opens the copy. Archive: `ConfirmDialog` *Archive {name}?* / *Days it's already applied to keep their items. It won't be offered for new days.* — **Keep** · **Archive**. `ArchivedSection` with *Restore*. Empty: `EmptyState text="No templates yet. A template is a kind of day — a morning, a workout day, a rest day." actions=[New template]`.

### TP-02 Template editor (`/settings/templates/{id}`)

A screen with `ScreenFrame width="canvas"`. `AppHeader`: `title` is the **inline name field** — an `Input` styled as the heading (`variant="heading"` typography, no border until focus) with `aria-label="Template name"`, maxlength 40; `saveStatus`; `onBack` (held once when name empty and slots exist: focus the field, show *Name this template.* under it, and only the second back leaves). Under the header, the settings row — one line of three values, each a `Button variant="ghost"` opening a `Popover`: *Starts at* **{anchor}** (`TimeField`) · *Target* **{n}/week** or *none* (`CountStepper min=0 max=7 zeroLabel="none"`, helper *How many days a week you mean to use this. Shown when you build a week.*) · *Usually* **{days}** or *any day* (`WeekdayChips`, helper *Just a hint for when you build a week.*).

The slot list: one `slot-row.tsx` per `SlotView` — `ItemIcon` · title · time-mode word (*at* / *within* / *anytime*) · time text (`TimeText` `mode="at"`/`"window"` — build the `Date`s from a fixed reference day so the composite formats them; **or** render `startClock`/`endClock` strings directly since `SlotView` already carries them formatted — do the latter) · *{duration} min* · priority number with `Tag` *overridden* when it differs · *Fixed* / *Flexible* word · row overflow `EllipsesMenu` (*Move up* · *Move down* only when grouped · *Duplicate* · *Remove*). Grouped slots render inside `MultitaskGroup label="multitask"`. Between two colliding ungrouped slots: `InlineQuestionRow text="These start at the same time." primary="Multitask them" secondary="Move one"` (secondary opens TP-03 for the later-added slot). *Add an item* (`Button variant="secondary"`, full width) at the bottom. Footer totals as two `Text` lines: *{first} – {last} · {n} items · {total} min planned* and, only with flexible items, *{flex} min flexible*. Empty: `EmptyState density="inline" text="Nothing in this template yet. Add habits in the order you'd do them." actions=[Add an item]`. Beneath: text link *Manage habits* → `settingsHabitsRoute()`.

*Remove* → immediate `template.removeSlot` and `toastUndo("Removed {title}", { onUndo })` for 5 s (undo calls `template.restoreSlot` with the removed slot's payload — the service returns it).

In-use line: when `template.get().appliedDays > 0`, `subtitle` *Applied to {n} days this week* (SET-6 populates; render the prop now).

`embedded` (for SET-7): no `AppHeader`; the name field and settings row render as the first block inside the frame; `onLeave` is not wired (the step's *Continue* calls `useTemplateEditor().validateForLeave()`).

### TP-03 Slot sheet

`ResponsiveSheet` *Add an item* / *Edit item*, `size="tall"`, dirty guard. Fields: *Habit* (`PickerList presentation="inline"` grouped as LB-01 — *Habits* · *Tasks & appointments* · *Deep work* — archived hidden, `createLabel="New habit"` → the habit sheet stacked; on its `onSaved`, the new habit is selected; under the field once chosen: *usually {min}–{max} min · importance {n}*) · *When* (`SegmentedControl` *At a time* · *Within a window* · *Anytime*) · *Starts at* (`TimeField`, default the previous slot's end or the anchor) / *Between* … *and* (two `TimeField`s, default previous end → +180) · *Takes* (`MinutesStepper min max` from the habit's range, `step=5`, `boundedNote`, helper *Within {min}–{max} min.* [*Edit range*] → the habit sheet in edit) · *Priority in this template* (`Stepper17 resting={lifeDefault} onReset` with helper *Defaults to {n}. Change it only if it matters differently on this kind of day.*) · *Timing* (`SegmentedControl` *Fixed* · *Flexible*, helpers verbatim; default Flexible for Habit/Deep work, Fixed for Task). Footer *Cancel* · *Save*.

Changing the habit on an existing slot keeps time, resets duration and priority, and shows *Duration and priority reset for the new habit.* Window rule errors: *The window is shorter than the item.* and start < end (no copy given — use the same sentence's sibling *"From" should be less than or equal to "to".*? **No** — that is LB-02's; mark `[COPY — needs Vesper sign-off: window start after end]`).

On *Save* with a `same_start` conflict, the footer is replaced by `InlineQuestionRow` *Another item starts at {time}: {title}. Do these happen at the same time?* — **Yes, multitask** (re-submit with `multitaskWith`) · **No, move this one** (focus *Starts at*). Never a third option.

**States (exhaustive):** TP-01: empty · loading · loaded · offline. TP-02: create · edit · saving · saved · retrying · failed · offline (read-only, inline line) · in-use · collision-present · empty-slots. TP-03: create · edit · saving · field error · collision-question · offline.

**Failure / edge states:** autosave conflict from a second device (`updated_at` older than the server's) → last write wins, no prompt (cross-cutting §6.3 per-field LWW is Phase 2; here the whole patch wins) · a slot whose habit was archived elsewhere → the slot is gone on next read (SET-4 removed it) · `Takes` typed outside the range → snapped with *Bounded to the habit's range.* · Edit range from TP-03 changes the habit's range → on return, `Takes` re-bounds and re-snaps.

## Non-negotiables (this slice)

- **Two fixed slots on one start are a group or a question. Never a silent stack.** Enforced in the service; surfaced on every read.
- **Fixed / Flexible in the interface; `hard` / `soft` in the schema.**
- **Canvases autosave and never prompt to discard.** TP-02 has no discard dialog; TP-03 (a form sheet) has one.
- **No slider.** `MinutesStepper` and `Stepper17` only.
- **Every string is Epic 1 §5 and §9 verbatim**, including the three helper lines under *Timing* and *Priority*.
- **Every read and write through `ctx.rls.execute()`.**

## Data & AI

**Schema changes: none.**

**Tables:** `templates` (CRUD, archive, restore, duplicate) · `template_slots` (CRUD, move, duplicate, restore-after-remove) · `habits` (read) · `days` (read count for `appliedDays` / `usedThisWeek` — zero until SET-6).

**Placement:** router `packages/api/src/routers/template.ts` (rule 3); services `services/plan/{list-templates,get-template,save-template,save-slot,remove-slot,move-slot,duplicate-template,archive-template,template-usage,to-view}.ts` (`to-view.ts` maps rows to `TemplateSummaryView` and `SlotView` — `startClock`/`endClock` computed from anchor + offset with `formatClock`-style output but **without** a zone: a template has none; add `formatClockFromMinutes(minutes)` to `@syn/utils` `time.ts`); validators `packages/validators/src/template.ts`; feature folder `apps/web/components/template-editor/`; pages replace the two placeholders.

**tRPC / validators:**
- `template.list({ includeArchived })` → `TemplateSummaryView[]` · `template.get({ id })` → `{ template, slots: SlotView[], collisions, appliedDays }` · `template.create()` → `{ id }` · `template.update({ id, patch })` (name, anchorTime, weeklyTarget, typicalDays) · `template.discardIfEmpty({ id })` · `template.archive` · `template.restore` · `template.duplicate({ id })` → `{ id }` · `template.saveSlot({ templateId, slotId?, …, multitaskWith? })` → `SlotView` or `CONFLICT same_start` · `template.removeSlot({ id })` → the removed payload · `template.restoreSlot({ payload })` · `template.moveSlot({ id, direction })` · `template.duplicateSlot({ id })`.
- Zod (`template.ts`): `templatePatchSchema` (name ≤ 40, `anchorTime` via `clockTimeSchema`, `weeklyTarget` 1–7 or null, `typicalDays` 0–6 unique), `templateLeaveSchema` (name 1–40 → *Name this template.*), `slotFormSchema` with `superRefine` for: `fixed_time` requires `offsetStartMin`; `window` requires both and start < end and `(end − start) >= durationMin` → *The window is shorter than the item.*; `offsetStartMin >= TEMPLATE_OFFSET_MIN`; duration within the habit's range is **snapped client-side**, and the server clamps too.

**AI notes:** **None.**

## Accessibility

- The inline name field is the screen's `h1` (`AppHeader` `title` accepts a node; wrap the input in the heading element so the landmark holds).
- Popovers for the three settings values trap focus and return it to their trigger; each trigger's accessible name includes the current value (*Starts at, 7:00*).
- The slot list is a `ul`; a `MultitaskGroup` is a nested list with `aria-label="multitask"`.
- *Move up/down* are menu items, not drag handles (official §4.4); the row's accessible name reads title, time, duration, priority, and *fixed*/*flexible*.
- The collision question row is `role="group"` with the sentence as its label; its two buttons are the only new focusables.
- `SaveStatusText` is `aria-live="polite"` and announces *Saved* once per burst, not per field.

## Acceptance criteria (observable — local tier, smoke account)

1. `/settings/templates` lists the seeded *Morning* with *5 items · {total} min* and no typical-days or target text; *New* creates a nameless draft and opens the editor; leaving it untouched deletes it (row count unchanged).
2. In the editor, typing a name, changing *Starts at*, setting *Target 3/week*, and picking *M W F* each autosave (`saving` → `saved` in the header, `templates` row updated); reloading shows the values; TP-01 shows *M W F* and *target 3/week*.
3. *Add an item* → TP-03: choosing a habit prefills *Takes* with the midpoint and *Priority* resting on the life default with the helper; *Starts at* defaults to the previous slot's end; saving adds the row in time order with the totals line updated.
4. Saving a second fixed slot at an occupied start shows the inline question with the other slot's title and time; **Yes, multitask** groups both (they render inside the bracket with the word *multitask*; `multitask_group` set on both rows); **No, move this one** returns focus to *Starts at* and nothing is saved. *(Mason.)*
5. A window slot with `end − start < Takes` shows *The window is shorter than the item.* and does not save.
6. Typing 500 into *Takes* for a 10–20 habit snaps to 20 with *Bounded to the habit's range.*
7. Overriding the priority shows the *overridden* tag on the row and the *reset* link in the sheet; reset clears the override.
8. Inserting two ungrouped fixed slots at one offset **by SQL** and reloading the editor shows *These start at the same time.* — **Multitask them** · **Move one** between them; *Multitask them* groups them. *(Mason.)*
9. `template.saveSlot` without `multitaskWith` against an occupied start returns `CONFLICT` with `withSlotId`, `withTitle`, `atClock`; with `multitaskWith` it succeeds and both rows share a group; a call from user B naming A's template is `NOT_FOUND`. *(Mason.)*
10. *Remove* on a slot removes it at once and shows *Removed {title}* [*Undo*] for 5 s; *Undo* restores the slot with its group, offset, duration, and priority.
11. *Move up/down* appear only on grouped slots and reorder within the group; `sort_order` changes; ungrouped slots show neither.
12. *Duplicate* on TP-01 for *Morning A* creates *Morning B*; for *Morning* creates *Morning copy*; the copy has the same slots and groups with new ids.
13. Archive → dialog with the document's body → the row moves to *Archived ({n})*; *Restore* returns it; an archived template's editor opens read-only (no writes; footer absent).
14. Back on a nameless editor with slots is held once with *Name this template.*; the second back leaves and the template lists as *Untitled*.
15. Offline: the editor is read-only with the inline line; TP-03 cannot open; TP-01's *New*, *Duplicate*, *Archive* are disabled.
16. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `SlotView.startClock` is already the display string; compute it in `to-view.ts` from `anchor_time + offset_start_min` with a 24-hour wrap and the app's clock format (`formatClockFromMinutes`). Keep the composite dumb.
- The multitask group id is a short random string (`crypto.randomUUID().slice(0, 8)`) local to the template; SET-6 turns it into a per-day `multitask_id` uuid.
- The "held once" back: `useLeaveGuard(active)` exists for `beforeunload`; for in-app back, intercept `onBack` with a ref flag — do not fight the browser's history.
- Autosave: one `useMutation` per field family with a 400 ms debounce and a serial queue so a name keystroke and an anchor change do not race; optimistic `template.get` cache patching keeps the totals line instant.
- `usedThisWeek` and `appliedDays` are one `COUNT(*) FROM days WHERE template_id = $1 AND date BETWEEN monday AND sunday` — write the query now; it returns 0 until SET-6.

## Dev's call

Debounce and retry timings · whether the three settings popovers are `Popover` or a single `ResponsiveSheet` on compact (recommend `Popover` on both — they are one field each) · the *Untitled* fallback's exact placement pending Vesper · how the stacked habit sheet over TP-03 is presented (same answer as SET-4's stacked CT-02).

## Out of scope

- **Applying a template to a day, `appliedDays > 0`, `usedThisWeek > 0`, TP-04** — SET-6.
- **The first-run frame around the editor** — SET-7 (`embedded` is provided here and left unused).
- **WK-02's *New template* row** — SET-6 opens this editor.
- **Per-field last-write-wins across devices** — Phase 2 (cross-cutting §6.3).

## Depends on

- **SET-4** — habits, the habit sheet (opened from the picker), `habit.list`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The invariant, the autosave state machine, the clock/offset conversion across midnight, and the undo-restore of a removed slot are four places a plausible implementation is wrong in a way no happy-path check reveals. A cheaper model enforces the same-start rule in the sheet only, and the first duplicated template stacks two slots silently.

---

### Kickoff (paste into the session)

> Build **SET-5 — Templates: the API, TP-01, the TP-02 canvas, TP-03, and the same-start multitask rule** (attached spec). Model: **Opus**. **Two fixed slots on one start are a group or a question, enforced in the service; canvases autosave and never prompt; Fixed/Flexible on screen, hard/soft in the schema.**
> Attach/read first, in order: this spec · Epic 1 §5 (TP-01/02/03), §0.3, §9, §10 · official spec §3.4, §3.5, §4.4 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · SET-4 (the habit sheet and `habit.list` — reuse) · `packages/ui/src/index.ts` (audit) · `packages/types/src/domain/view.ts` (`SlotView`, `TemplateSummaryView`) · `packages/db/SCHEMA_REFERENCE.md` (plan group) · `docs/ai-guides/trpc-foundation-patterns.md` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Build the editor as `apps/web/components/template-editor/` with a headless hook, TP-03 inside it, and a `copy.ts`. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
