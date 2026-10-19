# DYN-8 — The block editor, step one, and Settings → Your day

**Epic:** DYN — Dynamic schedule (UX v1.1) · **Phase 1** · Size: L
**Slice type:** The planning canvas rebuilt around blocks, with tap fallbacks for every gesture DYN-9 adds later; the settings surface that lists the twelve first-run screens; the library by block. The risk class is *a form* (the editor turning into fields) and *a fork* (two editors coexisting — the v1.0 template editor is deleted here, not left beside the new one).
**Vigil:** none. **Vesper review:** the editor against §3.11's walk-through; Your day's twelve rows; the library's grouping; the habit sheet without its type segment.

**Status:** Complete (2026-09-13 — authored and built in one thread; `components/block-editor/` (strip at 96 px/h, client walk, footer, Add, the slot sheet with the three-answer question), Settings → Your day with its twelve rows, the six embedded screens, the per-kind editor page, Block order, the library grouped by block then category, the habit sheet's block chip row, the two redirects; `components/template-editor/` deleted; the four root commands and the Storybook build pass; the acceptance walk is blocked at sign-in because credentials are never entered — logged in `DEVIATIONS.md`)

> **Vesper — screen review.** Open Taylor's *Before work* in the editor: the strip reads backward to 9:00, the one-of group is one block with two tabs, the footer is *8:35 – 9:00 · 25 min · 0 min slack*. Open the slot sheet on breakfast: gap stepper, pin time, role, *one of* with the second member, *Move up / Move down* under the overflow. Pin something at 8:00 in a morning: the stack flows around it; make it overrun and the footer reads *runs 8 min past …* in muted text with no colour. Open Settings → Your day: twelve rows, block-kind rows opening the editor for their kind. Open the library: grouped by block, then category; the habit sheet has no type segment, a block chip row, and no category picker on a category-less account. `/settings/templates` redirects.

---

## Outcome

One editing surface for any block template: a `ScheduleAxis` strip at 96 px/hour whose `ScheduleBlock`s are as tall as their durations, with `GapBand`s between them, pins with the anchor glyph, opener and closer captions, the pool band, one-of groups as one block with two tabs, and a sticky footer that says *7:03 – 8:15 · 72 min · 0 min slack* from `stackBlock` on the client. *Add* opens the library filtered to the block's kind and lands the item at the end at the midpoint of its range; the slot sheet carries the gap stepper, the pin time, the role, *one of* with the second member, and *Move up / Move down* — the tap fallbacks §13 #4 names, so the editor is complete before DYN-9 adds drag. Settings → Your day lists the twelve first-run screens without the frame; the block-kind rows open the editor for that kind with the template list above it when there is more than one; *Block order* is a sortable list. The library is grouped by block then category, the habit sheet loses its type segment and gains the block chip row, and the category picker hides until a category exists. `/settings/templates` and `/settings/templates/{id}` redirect to Your day. After this ships, **DYN-9 has a strip to add drag to, DYN-11 has the editor to embed in screens 7, 9 and 10, and DYN-12 has Your day's block editor to link from the week build.** The v1.0 `components/template-editor/` is deleted in this ticket: its only consumers are the routes this ticket redirects, and leaving it is the fork.

## Why / intent

- **v1.1 §3.11 (the block editor)** — *"The header carries the block's name (*Morning routine*), the anchor line in muted text (*forward from wake · 7:00*, or *backward to work · 9:00*, or *backward to lights-out · 22:45*), and the save status. Below it, a vertical strip: the time gutter on the left with hour and quarter-hour hairlines, and the items as blocks whose height is their duration … Between items, the gaps render as thin empty bands with the minutes written in the gutter (*+5*); a gap of zero is a hairline. A pin shows the anchor glyph and its clock time; opener and closer rows in an opener-pool-closer routine carry a small *opener* / *closer* caption, and pool items sit in a lighter band labelled *decide in the morning*. A one-of group is a single block with two tabs at its top (*meal-prepped 10 · cook it 30*); the default tab is filled. The footer is sticky: *7:03 – 8:15 · 72 min · 0 min slack* in tabular figures. No judgement copy; the number is the feedback. Within thumb reach: **Add** (opens the library filtered to this block's kind; tap to add, the item lands at the end at the midpoint of its range) and the footer."* … *"Tap a block to open the slot sheet (priority for this template, pin at a time, make it one of, opener/closer/pool role, remove). Tap the footer to see the block's arithmetic in a sentence."* … *"It must never clamp a duration to the habit's range (R21), and it must never rearrange a pin."* States: *"create · edit · saving · saved · retrying · failed … offline (read-only, standard line) · in-use (*Applied to 3 days this week*) · overrun (footer reads *runs 8 min past work · 9:08*, muted, no colour) · empty (*Nothing here yet. Add from the library.*)"*. Copy: *Add · decide in the morning · opener · closer · one of · runs 8 min past work*. §13 #8: the seam-drag's fallback is *a small + gap row in the slot sheet* — the gap stepper.
- **§3.5** — *"An alternates group extends the block editor's same-start question from two answers to three: *Do these happen at the same time?* → **Yes, multitask** · **No, one or the other** · **Move it**."*
- **§4.14 (Settings → Your day)** — *"The first-run screens, without the frame, as a list: **Shape of the week · Work days · Work start · Standing commitments · Wake · Before the day · Before work · Morning routine · Training · Closing the day · Work focuses · Block order**. Each opens its screen; the block-kind rows (Morning, Before work, Wind-down under *Closing the day*, Training, Work) open the block editor (§3.11) for that kind, with the template list above it when more than one exists. **Block order** is a sortable list of the eight kinds with drag handles."* … *"**Templates** (→ folded into *Your day*)"*.
- **§4.15 (the library)** — *"The library holds habits only … The list is grouped by **block** first (*Morning · Before work · Break · Wind-down · Anywhere*), then by category if the person uses them; a `SearchField` at the top; archived collapsed at the bottom. The habit sheet loses the *Type* segment (W5, W6) and gains a **Block** chip row (one of the kinds, or *Anywhere*); the category picker hides until a category exists and shows *+ New category* beside *None* when it does (W7); duration is a range; priority is the `Stepper17`; *More* holds quantity unit, reflection axes, and the preflight note. The wake-anchor toggle is gone (R11)."*
- **§13 #4** — the editor ships in two steps: fallbacks (this ticket), drag and resize (DYN-9). **W5–W9** — no wrapping segment; no type in the sheet; the empty category picker; midpoint default on add; gaps first-class.
- **R21** — no clamp; the range is a faint band while adjusting, never a limit. **R3** — a pin never moves.
- **Ground truth (consumed, never rebuilt):** DYN-4's `template.*` (`create({kind})`, `get` with `SlotView`s and derived clocks, `saveSlot` with the same-position `CONFLICT` payload, `moveSlot`, `removeSlot`/`restoreSlot`, `update` with `kind/flow/structure/anchorTime`), `habit.list({ blockKind })`, `createFromStarterLibrary`; DYN-1's `stackBlock`, `STARTER_LIBRARY`; DYN-7's `ScheduleBlock` (+pinned/lifted), `GapBand`, `BlockBand`, `SlotRow`, `BudgetLine`, `QuickChipRow selected`, `InlineQuestionRow tertiary`, `StepFrame`; DYN-10's six screens with `embedded`; the v1.0 `components/template-editor/` (its `SlotSheet`'s habit picker and the `ApplyChangesDialog` are reused by reading, then deleted with the folder); `settings/habits/_components/library.tsx` (LB-01), `components/habit-sheet/`; the app's `useBack`, `ShellPageHeader`, `PageFrame`, `SaveStatus`.
- **What this slice is NOT (binding):** drag to reorder, resize by the bottom edge, seam-drag gaps, the keyboard equivalents beyond focus order (DYN-9); screens 7–12 (DYN-11 — the Your day rows for the routine, training, closing the day and focuses open the editor for their kind here, and DYN-11 re-points *Training* and *Work focuses* at its own screens); the week build's per-block day sheet (DYN-12); removing `DayPartHeader` or day parts (DYN-21).

**Rulings this slice makes (labelled, logged):**

- **The footer arithmetic is `stackBlock` on the client over the `SlotView`s the page already has.** No fetch per edit: `walkTemplate`'s inputs are the slots' `durationMin`, `gapBeforeMin`, `pinnedClock`, the groups; the anchor is the template's `anchorClock`. The server's `footer` is read on load; every local edit re-walks. One arithmetic, two callers (TD-4). Logged.
- **The strip is `ScheduleAxis` at 96 px/hour** (§3.11 *pxPerHour 96 in the editor*), from the walk's start rounded down to the hour to its end rounded up; a placeable kind (training, break) with no anchor is drawn from 0 with the gutter's clocks hidden. Logged.
- **`Add` is a habit picker filtered by the block's kind** (`habit.list({ blockKind })`, *Anywhere* habits included), with *New habit* opening the habit sheet stacked; tapping a habit saves a slot at the end with `durationMin` = the range midpoint (W8), `gapBeforeMin` 0, `role` stack (or `pool` when the structure is opener·pool·closer and the person picks *pool* in the sheet later). Logged.
- **The slot sheet is the editor's one form**, and it is a form on purpose (§3.11: *"number fields exist only inside the slot sheet as the keyboard fallback"*): habit (read-only once saved; *Change* re-opens the picker), *Takes* `MinutesStepper` with the range as muted text and no clamp, *Gap before* `MinutesStepper` (0–`GAP_MAX`, step 5; disabled and 0 when pinned), *At* `SegmentedControl` *In the stack · At a time* with a `TimeField` (pin), *Role* (only under opener·pool·closer: *opener · pool · closer*, else hidden), *Priority for this template* `Stepper17`, *Fixed / Can move* (`scheduling`), *One of* — a ghost row *Make it one of two* that opens the second member (a habit picker + `MinutesStepper`) and which is the default; the overflow menu: *Move up · Move down · Duplicate · Remove*. Logged.
- **The same-position question has three answers** (`InlineQuestionRow` with `tertiary`): *Yes, multitask* → `multitaskWith`, *No, one or the other* → `alternatesWith`, *Move it* → the sheet stays open with the gap stepper focused. Logged.
- **A pin never moves by *Move up / Move down***: the moving slot passes it (DYN-4's `moveSlot` swaps positions; the pin keeps its `pinned_at`); the strip re-walks and the pin is where it was. Logged.
- **Settings → Your day mounts DYN-10's six screens `embedded`** at `/settings/your-day/{shape,work-days,work-start,commitments,wake,before-the-day}`; the block-kind rows open `/settings/your-day/block/{kind}` for `morning`, `prep`, `training`, `wind_down`, `work`; *Work focuses* opens the work editor until DYN-11; *Block order* is `/settings/your-day/order`, a list with *Move up / Move down* per row (the drag handles are DYN-9's `DragLayer reorder` — logged as the same two-step rule the editor follows). Logged.
- **The block editor page for a kind lists that kind's templates above the strip when there is more than one** (`template.list({ kind })`); with one, the strip opens on it; with none, *New* creates one (`template.create({ kind })`). Logged.
- **`/settings/templates` → `/settings/your-day`; `/settings/templates/{id}` → `/settings/your-day/block/{kind}`** (the template's kind read on the server). The ST-00 *Templates* row becomes *Your day*; *Habits* becomes *Library*. Logged.
- **The library groups by block then category; the type segment is gone; the block chip row is a `QuickChipRow selected`** with the six habit-holding kinds (*Morning · Before work · Break · Wind-down · Anywhere*, and *Training*/*Work* excluded — those are rotations, §4.15) writing `blockKind`; the category picker renders only when a category exists (W7). Logged.
- **`components/template-editor/` is deleted; its list strings move to `settings/your-day/_components/copy.ts`.** Logged.

## Experience & states

### The block editor — `components/block-editor/`

**Header** (`ShellPageHeader`): the template's name as the `h1` (an inline `Input`, as TP-02 did), the anchor line as the subtitle in muted text — *forward from wake · 7:00* / *backward to work · 9:00* / *backward to lights-out · 22:45* / *placed each morning* for training and break — and the `SaveStatus`. Back leaves; with slots and no name, the name is asked for once (TP-02's rule); with days applied and a change, the `ApplyChangesDialog` (TP-04) asks.

**The strip:** `ScheduleAxis` at 96 px/hour; one `ScheduleBlock` per slot on the walk (`draggable={false}` — DYN-9), `pinned` from `pinnedClock`, the one-of group's chosen member drawn with a two-tab header inside the block (the `SlotRow`'s tab treatment, lifted into the block face), opener/closer captions as `StateWord`s inside the block, pool slots in a lighter `BlockBand` labelled *decide in the morning* stacked under the strip (they have no clock); `GapBand`s between blocks for every non-zero gap, a hairline for zero. Tap a block → the slot sheet. Focus order is time order (SYS-4's roving focus over `data-item-row`).

**The footer** (sticky, tabular): *7:03 – 8:15 · 72 min · 0 min slack* — start, end, total, slack from the client walk against the kind's bound (work start for morning/prep, lights-out for wind-down). Overrun: *runs 8 min past work · 9:08*, muted, no colour. Tapping the footer opens a one-line `Popover` with the arithmetic in a sentence (*Up 7:00 · orient 3 · 72 available · prep 45 · work 9:00 · this block adds up to 80.*) `[COPY]`. Within thumb reach beside it: **Add**.

**Add:** a `ResponsiveSheet` with a `SearchField` and a `PickerList` of `habit.list({ blockKind: kind })` plus *Anywhere* habits, grouped *This block · Anywhere*; *New habit* at the bottom opens the habit sheet stacked with `blockKind` preset. Tap → `template.saveSlot` at the end with the midpoint; the sheet closes; the block appears.

**The slot sheet** (`components/block-editor/slot-sheet.tsx`): as ruled. Save → `template.saveSlot`; a `CONFLICT` with `same_position` → the three-answer `InlineQuestionRow` in the footer. Remove → `template.removeSlot` with the five-second undo (`restoreSlot`). Move up/down → `template.moveSlot`.

**States (exhaustive):** create (a new template of the kind, unnamed) · edit · saving · saved · retrying · failed (*Changes aren't saving. Check your connection.*) · offline (read-only, the standard line) · in-use (*Applied to 3 days this week*) · overrun · empty (*Nothing here yet. Add from the library.*) · sheet open · same-position question · undo toast.

### Settings → Your day — `/settings/your-day`

Twelve `SettingsRow`s in §4.14's order, each with a one-line value where one exists (*Mon–Fri · Sat sometimes*, *9:00 · routine gets cut*, *2 fixtures*, *7:00*, *passage · both*): 1–6 open the embedded DYN-10 screens; *Before work* → the prep editor; *Morning routine* → the morning editor; *Training* → the training editor (DYN-11 re-points); *Closing the day* → the wind-down editor; *Work focuses* → the work editor (DYN-11 re-points); *Block order* → the order list. Back to Settings. ST-00's *Templates* row is replaced by *Your day*; *Habits* is renamed *Library*.

**`/settings/your-day/block/{kind}`:** the templates of the kind as `ListRow`s above the editor when more than one (the editor opens the first; tapping another switches), `New` in the header; archive/duplicate/restore in each row's menu (TP-01's actions, kept); with exactly one template, the editor alone.

**`/settings/your-day/order`:** the six orderable kinds (`blockOrder`) as `ListRow`s with *Move up / Move down*; saves through `user.updatePreferences({ blockOrder })` on each move; training and break are not in the list (§3.1).

### The library — `/settings/habits` amended

Grouped by block (*Morning · Before work · Break · Wind-down · Anywhere*) as `GroupHeading`s, then by category within each when the person has categories; the `SearchField` at the top; archived collapsed at the bottom (unchanged). The habit sheet: no type segment; a *Block* `QuickChipRow selected` (*Morning · Before work · Break · Wind-down · Anywhere*); the `ChipPicker` for categories renders only when `categories.length > 0` (W7); the rest as it was.

**Failure / edge states:** `saveSlot` on a habit whose kind differs from the template's → allowed (a habit's block is a default, §11.3) · adding to a template with no anchor (training) → blocks with no clocks, the footer shows the total only · a template of kind `work` → the strip shows the work span from the profile's work start to work end with fixtures drawn as pins, slots inside it (the work template is *hours, fixtures, whether it has a break*, §3.8) · `/settings/templates/{id}` for an archived template → redirects to its kind's page, which lists it under archived · the habit sheet opened from the editor's *Add* → `blockKind` preset to the kind and the chip row shows it · a category-less account → no picker; the first category created (CT-02) makes it appear · offline → the strip renders, every write is disabled, the line shows.

## Non-negotiables (this slice)

- **One editor.** `components/template-editor/` is gone when this ships; nothing imports it.
- **The strip, not a form.** Every adjustment is on the strip or in the slot sheet; the sheet's number fields are the keyboard fallback, not the primary path.
- **No clamp** (R21). A duration of 90 on a 10–30 habit saves; the range is muted text.
- **A pin never rearranges.** Move up/down passes it.
- **The footer is `stackBlock`**, client-side, one walk per change.
- **Nothing pre-checked in the picker; nothing suggested** beyond the block's own library.
- **Every route added has its builder in `lib/routes.ts` and its row in `apps/web/AGENTS.md`.**
- **Every write through the DYN-4 procedures;** no new procedure.

## Data & AI

**Schema changes: none.**

**Tables:** `templates`, `template_slots` (through `template.*`) · `habits` (through `habit.*`) · `users.block_order` (through `user.updatePreferences`).

**Placement:** `apps/web/components/block-editor/{block-editor.tsx,use-block-editor.ts,block-strip.tsx,editor-footer.tsx,add-sheet.tsx,slot-sheet.tsx,apply-changes-dialog.tsx,copy.ts,index.ts}`; `apps/web/app/(shell)/settings/your-day/{page.tsx,_components/{copy.ts,your-day-list.tsx}}`, `your-day/[screen]/page.tsx` (the six embedded screens), `your-day/block/[kind]/{page.tsx,_components/kind-editor.tsx}`, `your-day/order/{page.tsx,_components/block-order.tsx}`; `settings/templates/page.tsx` and `templates/[id]/page.tsx` become redirects; `settings/_components/{copy,settings-index}.tsx` (the rows); `settings/habits/_components/library.tsx` (grouping); `components/habit-sheet/{habit-sheet,use-habit-sheet,copy}.ts(x)` (the chip row, the picker rule); `lib/routes.ts` (`settingsYourDayRoute()`, `settingsYourDayScreenRoute(screen)`, `settingsYourDayBlockRoute(kind)`, `settingsYourDayOrderRoute()`); `apps/web/AGENTS.md` (the rows). Rule 9 (app-local composition), rule 2 (composites from `@syn/ui`).

**tRPC / validators:** `template.list/get/create/update/saveSlot/removeSlot/restoreSlot/moveSlot/duplicate/archive/restore/discardIfEmpty`, `week.appliedDays/applyChanges`, `habit.list/create/update`, `user.me/updatePreferences`, `fixture.list` — no additions.

**AI notes:** **None.**

**Instrumentation:** none.

## Accessibility

- The strip's blocks are the roving-focus targets (SYS-4) in time order; `Enter` opens the slot sheet; a gap band's seam is a `separator` (DYN-7) but not yet interactive (DYN-9).
- The footer is a button (*Show the arithmetic*) that opens the sentence in a popover; its text is the accessible name.
- The slot sheet traps focus; *Move up / Move down* are menu items with the slot's title in the menu's name.
- The same-position question is a labelled group with three buttons.
- Your day's rows are links with their value as the description; the order list's *Move up / Move down* buttons are labelled with the kind.
- The library's `GroupHeading`s are `h2`s; the block chip row is a group with `aria-pressed` on the chosen chip.
- 200% text: the strip goes to 96 px/hour already; the footer wraps to two lines rather than clipping.

## Acceptance criteria (observable — local tier, the DYN-5 seed; `yarn web:dev`)

1. `/settings/your-day/block/prep` opens Taylor's *Before work*: the strip reads backward to 9:00 with breakfast (the 10-min default member, two tabs) at 8:35 and the walk at 8:45; the footer reads *8:35 – 9:00 · 25 min · 0 min slack*; the header's anchor line reads *backward to work · 9:00*. *(Vesper.)*
2. Open breakfast's slot sheet → *One of* shows both members with the 10-min one as default; switching the default to the 30-min member re-walks the strip to 8:15 and the footer to *8:15 – 9:00 · 45 min*; the change persists (`template.saveSlot` with `alternatesDefault`). *(Vesper.)*
3. In a morning template, pin a slot at 8:00 (*At a time*) → the gap stepper reads 0 and is disabled; the stack flows around the pin; *Move up* on the slot after the pin swaps it with the one before the pin and the pin stays at 8:00. *(Vesper.)*
4. Make the morning overrun (add a 60-min item) → the footer reads *runs 8 min past work · 9:08* in muted text; nothing turns a colour; save is allowed. *(Vesper.)*
5. *Add* lists only this block's kind and *Anywhere*; tapping *Read* adds it at the end at 22 min (the 15–30 midpoint); a duration of 90 on a 10–30 habit saves through the sheet with no clamp. *(Vesper.)*
6. Saving a slot at a position already taken (a pin at the same clock) → the footer question with three answers; *Yes, multitask* writes `multitaskWith`; *No, one or the other* writes `alternatesWith` and the group shows two tabs; *Move it* leaves the sheet open on the gap stepper.
7. `/settings/your-day` lists twelve rows in §4.14's order with their current values; each opens its screen; the six fact screens render without the frame and *Save* returns to the list with the value updated. *(Vesper.)*
8. `/settings/your-day/order` lists six kinds; *Move down* on *Morning* writes `blockOrder` with morning third; training and break are absent.
9. `/settings/templates` redirects to `/settings/your-day`; `/settings/templates/{prepId}` redirects to `/settings/your-day/block/prep`; ST-00 shows *Your day* and *Library*, no *Templates*. *(Vesper.)*
10. `/settings/habits` groups by block then category; the habit sheet has no type control, shows the block chip row, and shows no category picker on a category-less account; creating a category makes the picker appear. *(Vesper.)*
11. `grep -rn "template-editor" apps/web` returns nothing; `components/template-editor/` does not exist.
12. Offline: the strip renders read-only with the standard line; *Add*, the sheet and the moves are disabled.
13. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `use-block-editor.ts` keeps `useTemplateEditor`'s shape (the autosave queue, `SaveStatus`, `validateForLeave`, `hasChanged`) — read it before writing; it is the one part of the v1.0 editor worth carrying by reading.
- The client walk: build `StackItem`s from `SlotView`s exactly as `services/plan/to-view.ts`'s `toStackItems` does (duration, gap, pinned minutes, groups, the default as chosen) and call `stackBlock` with the template's flow and `anchorClock`; derive `startClock`/`endClock` per slot from the result rather than trusting the server's after a local change.
- Geometry: `topPx = (startMin − axisStartMin) / 60 × 96`; a slot under 10 minutes is a `hairline` block, which is why the gutter also carries the gap minutes — a five-minute gap at 8px is legible only by its label.
- The one-of tabs inside the block: render the `SlotRow`'s tab group at the block's top when `heightPx ≥ 48`, else the chosen member's title alone with the *one of* caption.
- `apply-changes-dialog.tsx` moves into the new folder unchanged.

## Dev's call

Whether the pool slots render under the strip as rows or as a lighter band at the strip's end (recommend: a `BlockBand pooled` at the end of the walk, with the pool slots as `SlotRow`s beneath it) · the footer popover's sentence · whether the kind page's template list is `ListRow`s or a `PickerList`.

## Out of scope

- **Drag, resize, seam-drag, keyboard moves** — DYN-9.
- **Screens 7–12 and the Training / Work focuses screens** — DYN-11.
- **The week build's per-block day sheet** — DYN-12.
- **Removing day parts, `DayPartHeader`, `STARTER_HABITS`** — DYN-21.

## Depends on

- **DYN-4** — the template procedures by kind, the position rule's payload, `habit.list({ blockKind })`. Complete in `PROGRESS.md`.
- **DYN-7** — the strip's composites, the three-answer question row, the chip row. Complete in `PROGRESS.md`.
- **DYN-10** — the six embedded screens Your day mounts. Built in the same batch; its components exist before this ticket's pages mount them.

## Recommended execution

**Opus.** The editor is the one screen that earns density; a cheaper model ships it as a form, clamps a duration to the range, or leaves the v1.0 editor beside the new one.

---

### Kickoff (paste into the session)

> Build **DYN-8 — The block editor, step one, and Settings → Your day** (attached spec). Model: **Opus**. **One editor — delete the old one; the strip, not a form; no clamp; a pin never rearranges; the footer is `stackBlock` on the client.**
> Attach/read first, in order: this spec · v1.1 §3.5, §3.11, §4.14, §4.15, §13 #4/#8, W5–W9, R21 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · `components/template-editor/` (read `use-template-editor.ts`, `slot-sheet.tsx`, `apply-changes-dialog.tsx`; delete the folder) · DYN-4 (`template.*`, the `same_position` payload) · DYN-7 (`ScheduleBlock`, `GapBand`, `BlockBand`, `SlotRow`, `InlineQuestionRow tertiary`) · DYN-10 (the six screens' `embedded` prop) · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
