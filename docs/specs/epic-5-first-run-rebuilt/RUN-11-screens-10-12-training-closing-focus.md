# RUN-11 — Screens 10–12: `WorkoutSetupCard` with type, where and travel; closing the day with the new defaults, wind-down rows, sortable prompts and the reminder; `FocusSetupCard` with *Flexible*; Settings → Notifications gains N2

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 3** · Size: L
**Slice type:** Three screens — two of them cards over the rotation and the focuses, one the evening's facts. The risk class is *a time asked where placement belongs* (a workout's time on screen 10), *the travel folded into the length*, and *a reminder framed as a nag*.
**Vigil:** none. **Vesper review:** the cards against §4.10 and §4.12; screen 11's defaults and the reminder's caption; the prompt list's truncation and handle; the wind-down rows.

**Status:** Not started

> **Vesper — screen review.** Walk `/setup/10`, `/setup/11`, `/setup/12` at 375px. Confirm: a new workout card appends **below** and opens; picking a type fills the name and glyph; *Gym or studio* reveals two travel steppers and the switch with its line; *Done* collapses to *🏋️ Upper body · 2 a week · Mon Thu · 60 min · gym +15/+15*; screen 11's phone away defaults to lights out − 60 and follows lights out until touched; the wind-down rows are `SelectRow`s with glyphs and no lengths; the prompt list truncates and has handles; the reminder field reads *20:45* with the caption *In your words: "A few lines · 20:45"*; the ghost row *Order and lengths* is gone; screen 12's heading is *What is your work about?* and the first card's *Flexible* chip is preselected.

---

## Outcome

Screens 10–12 are rebuilt to the frame rules and v1.2: training is a list of `WorkoutSetupCard`s — type chips that set a name and a glyph, count and usual days with *Flexible*, length, and *where*, with two travel lengths and a *plan for the travel* switch when the workout happens away from home — each collapsing on *Done*; closing the day has lights out and phone away with their glyphs (phone away defaulting to an hour before and following lights out until touched), the wind-down starters as glyph rows, the journal switch with its prompts as a truncated, sortable list, and a reminder time with its own switch; the focus screen asks *What is your work about?* with `FocusSetupCard`s and a visible *Flexible* chip, the second-work-template row gone. Settings → Notifications gains the N2 row. After this ships, **RUN-12's builder has workouts with placement candidates and travel, wind-down habits, and focuses to compose.** Screen 13 is RUN-12's.

## Why / intent

- **v1.2 §4.10** — heading *Do you train?*; *Yes · Not right now*; `WorkoutSetupCard`: header (glyph · name) · **Type** `ChipPicker` (*🏋️ Upper body … 💪 Other* from `WORKOUT_TYPES`; *"picking one fills the name and the emoji when they are empty"*) · **How often** (*a week*, `CountStepper` 2) · **Usual days** (`WeekdayChips` + *Flexible*) · **Length** (*Usually takes*, `MinutesStepper` 60) · **Where** (`SegmentedControl` *Home · Gym or studio · Outside*; for the last two **Getting there** · **Getting back** `MinutesStepper`s (0) and a `Switch` **Plan for the travel** (on) with *Kept beside the workout, never added to it. Either trip can be dropped on the day.*) · **Done** → *🏋️ Upper body · 2 a week · Mon Thu · 60 min · gym +15/+15*; the muted line *Where it fits on the day is set when you build one.*; primary *Continue · 2 workouts*; *"Ask for a time. Add the travel to the length. Slot a new workout above the last"* — never.
- **v1.2 §4.11, R38** — heading *How does the day end?*, body *The evening stacks back from lights out.*; `TimeField` **🌙 Lights out** 22:45; **📵 Phone away** 21:45 with *An hour before lights out is a common choice.*; *"Changing lights out moves phone away with it until phone away has been touched"*; **Wind-down** `GroupHeading` + the eight starters as `SelectRow`s with glyphs, *"Lengths and order are set in the day builder … the ghost row *Order and lengths* is gone (S10.4)"*; **Add something else** → *A wind-down habit*; `Switch` **✍️ A few lines at night** (on) with the six prompts as rows (handle · label truncated at one line · `EllipsesMenu` *Edit · Move up · Move down · Remove*), **Add a prompt**, the muted line *Around 10 minutes, before the phone goes away.*, then `TimeField` **A reminder** 20:45 with a `Switch` (on) and the caption *In your words: "A few lines · 20:45".*; *"Turning the journal off hides the reminder with it."*; *"Frame phone-away as a rule. Pre-tick a wind-down habit. Nag about the journal"* — never.
- **v1.2 §4.12** — heading *What is your work about?*, body *One is fine. Each gets a rough share of the week.*; `FocusSetupCard`: optional glyph (*"defaulting to none — a focus is the one noun where a blank is the honest default"*) · name (label *Focus*, placeholder *The main thing*, the first card's muted line *A name for the work itself — a project, a client, a kind of work.*) · **a week** `CountStepper` · **Usual days** with *Flexible* preselected · **Done** → *Viewpoint · 2 a week · flexible*; primary *Continue · 3 focuses*; *Skip for now*; *"the second-work-template row moved to screen 3 (R32)"*.
- **v1.2 §7.1, §12.4** — the placed rows' glyphs (`PLACED_ROW_ICONS`).
- **v1.2 §9** — N2 in Settings → Notifications with its time picker.
- **v1.2 §13 #25** — the two defaults (−60, −60); **§13 #13** — the science line stays one sentence citing nothing.
- **TD-12** — travel on the habit; never in the length. **TD-18** — optimistic.
- **Ground truth (consumed):** `app/(setup)/_components/{step-10-training,step-11-closing,step-12-focuses}.tsx` (RUN-8's moves of DYN-11's files), `rotation-rows.tsx` (DYN-11 — to be replaced), the prompt list in `step-11-closing` (DYN-11's *Move up / Move down*), `app/(shell)/settings/notifications/*` (ST-07, DYN-20's *Every item in…* group), `components/habit-sheet/*` (RUN-10's modes; add `wind-down-habit`), RUN-7's `Card`, `ChipPicker`, `WeekdayChips flexible`, `SelectRow`, `SortableList`, `TimeField leading/Done`, the optimistic steppers, `EmojiPicker`, `EmojiSlot`, RUN-3's `habit.createWorkout` / `updateRotation` / `update` (workout columns, versions not here), `createFromStarterLibrary` (wind-down), `habit.createFocus`, `user.updatePreferences` (the reminder pair; `devicesOffTime`), `user.me` (the effective times), `notification.prefs` / `setPref`.
- **What this slice is NOT (binding):** screen 13 (RUN-12); the reminder's sending (RUN-6, done); wind-down lengths and order (RUN-12's 13h); any workout time or placement (RUN-12's 13c); the work-day types (RUN-8).

**Rulings this slice makes (labelled, logged):**

- **`WorkoutSetupCard` writes per control**: the card is created on *Add a workout* through `habit.createWorkout` with a blank name and the *Other* glyph? **No** — a blank habit row is not a fact. The card opens **unsaved** and its first write is on the first fact that makes it a habit: a type pick or a typed name creates the row (`createWorkout`), and every later control updates it. *Done* only collapses. A card abandoned with nothing typed creates nothing. Logged.
- **Type chips fill name and glyph only when empty**; a later type change never overwrites a name the person typed (`nameTouched`) or a glyph they picked (`iconTouched`). Logged.
- **Phone away follows lights out until touched**: `devicesOffTime` is written only when the person changes it; the field shows `user.me`'s `devicesOffTimeEffective`; the reminder shows `journalReminderTimeEffective` and is written only when touched (RUN-3's derived reads). Logged.
- **The wind-down starters tick like the morning's** (`createFromStarterLibrary({ blockKind: "wind_down" })`, no slot yet — the builder's 13h writes the wind-down template's slots when the list is built; until then a wind-down habit is a library row). The v1.1/DYN-18 behaviour of the wind-down template placing the journal and *Phone away* at materialisation stands. Logged.
- **The prompt list is a `SortableList`**; the menu keeps *Move up / Move down* as the keyboard path; reorder writes `journalPrompts` at once. Logged.
- **`FocusSetupCard` follows the workout card's create-on-first-fact rule** through `habit.createFocus`; *Flexible* means `typical_days = null`. Logged.
- **`rotation-rows.tsx` is deleted here**; nothing else imports it. Logged.
- **Settings → Notifications' N2 row** uses `notification.setPref({ kind: "journal_reminder", enabled })` for the switch and `user.updatePreferences({ journalReminderTime })` for the time — the time is a profile fact, the switch a pref; both already exist as patterns (the review-reminder row). `[ASSUMPTION — reversible: RUN-6 may have keyed the switch on `users.journal_reminder_enabled` instead; then this row writes that. Read RUN-6's closing report.]` Logged.

## Experience & states

### Screen 10 — `/setup/10` (§4.10)

*Yes · Not right now* (the second skips ahead, as DYN-11). On yes: empty *Nothing yet.* (left-aligned) + **Add a workout** (full-width secondary); cards append and open: `EmojiSlot`-button (the picker) · name `Input` · **Type** chips (none selected) · **How often** · **Usual days** + *Flexible* · **Length** · **Where** segment; *Gym or studio* / *Outside* reveal the two travel steppers and the switch with its line; **Done** collapses to the summary with *Edit*; the muted line under the list; primary *Continue · n workouts*. **States:** no · yes-empty · card-open-unsaved · card-open-saved · card-collapsed · saving · failed · offline.

### Screen 11 — `/setup/11` (§4.11)

Heading and body verbatim. **🌙 Lights out** (`TimeField leading`, 22:45) · **📵 Phone away** (21:45 effective; the one-sentence line) · **Wind-down** `GroupHeading` + `SelectRowList` of the eight starters (glyphs; nothing pre-selected) + **Add something else** → *A wind-down habit* (the sheet's third mode) · **✍️ A few lines at night** `Switch` (on) → the prompts as a `SortableList` (handle · truncated label · menu) + **Add a prompt** + the muted line + **A reminder** `TimeField` (20:45 effective) with its `Switch` (on) and the caption. Journal off → the prompts and the reminder hide. Primary *Continue*. **States:** default · phone-away-following · phone-away-touched · journal-off · prompt-editing · reminder-off · saving · failed · offline.

### Screen 12 — `/setup/12` (§4.12)

Heading and body verbatim. Empty *Nothing yet.* + **Add a focus**; cards: glyph (optional, blank) · *Focus* `Input` (placeholder; the first card's muted line) · **a week** · **Usual days** with *Flexible* preselected · **Done** → *Viewpoint · 2 a week · flexible*. Primary *Continue · n focuses*; *Skip for now*. No second-work-template row. **States:** empty · card-open · card-collapsed · saving · failed · offline.

### Settings → Notifications

A row **A few lines** with the time picker and the switch, under the existing rows; the catalogue's N2 copy.

**Failure / edge states:** a workout card with a name typed then cleared → the row exists with a blank title? **No**: the create fires on the first non-blank name or type; clearing later is refused by the validator (title required) and the field shows the sentence · travel steppers with the switch off → stored, not planned (RUN-6 honours `plan_travel`) · lights out set earlier than phone away (touched) → the validator's existing rule (`devices_off < lights_out`) shows its sentence and lights out is not written · a prompt label over `JOURNAL_PROMPT_MAX` → the sentence · the reminder time later than phone away → allowed (a person may want it after), no rule · journal off with the reminder on → the reminder is hidden and RUN-6's scan already skips (journal disabled).

## Non-negotiables (this slice)

- **No time asked for a workout.** Placement is the builder's.
- **Travel never added to the length**, on the card or in the summary's *60 min*.
- **Lists append.**
- **Nothing pre-selected on the wind-down chooser; no type pre-picked.**
- **Phone away is a time the person set**, shown back as such; the line cites nothing.
- **The reminder's caption is the person's words**; no sentence about missing.
- **Every control optimistic; save as you go; no glyph in `copy.ts`.**

## Data & AI

**Schema changes: none.**

**Tables:** `habits` (create, update — workouts, wind-down, focuses) · `users` (update — the evening columns, prompts, the reminder) · `notification_prefs` (read, write — N2, per the assumption).

**Placement:** `app/(setup)/_components/{step-10-training,step-11-closing,step-12-focuses}.tsx` (rebuilt), `workout-setup-card.tsx`, `focus-setup-card.tsx` (new), `rotation-rows.tsx` (deleted), `copy.ts` (10–12); `components/habit-sheet/*` (+ `wind-down-habit` mode); `app/(shell)/settings/notifications/*` (+ the row); `app/(shell)/settings/your-day/[screen]` (*closing-the-day* mounts the rebuilt 11; *training* and *focuses* rows mount 10 and 12 embedded — `YourDayScreen` += `training`, `focuses` if DYN-8 routed them to the block editor only; read `routes.ts`). Rule 9.

**tRPC / validators:** `habit.createWorkout` / `updateRotation` / `update` / `archive`, `habit.createFromStarterLibrary` (wind_down), `habit.createFocus`, `user.updatePreferences`, `user.me`, `notification.prefs` / `setPref`.

**AI notes:** **None.**

## Accessibility

- Cards are `group`s labelled by their name (or *New workout* until named `[COPY]`); the type chips are a radio group *Type*; the where segment is *Where*; the travel steppers are *Getting there, minutes* / *Getting back, minutes*.
- The two evening `TimeField`s have their glyphs `aria-hidden` and names *Lights out* / *Phone away*.
- The prompt list: handles *Reorder {prompt}*; the truncated label's full text is the row's accessible name; Alt+↑/↓ and the menu's moves.
- The reminder switch is labelled *Remind me* `[COPY]` with the time as its description.
- 200%: cards stack the segment under its label; the prompt rows keep the handle and menu at 44px.

## Acceptance criteria (observable — local tier, fresh account, 375px)

1. `/setup/10` *Yes*: *Add a workout* appends an open card and creates nothing; picking *Upper body* fills *Upper body* and 🏋️ and creates the workout (`workout_type upper_body`, `icon 🏋️`); typing a different name then picking *Lower body* keeps the typed name and changes nothing else; a second *Add a workout* appends **below** the first. *(Vesper.)*
2. *Gym or studio* reveals *Getting there* / *Getting back* and the switch on; setting 15 / 15 writes `travel_there_min`, `travel_back_min` and leaves `duration_min_min/max` at 60; *Done* collapses to *🏋️ Upper body · 2 a week · Mon Thu · 60 min · gym +15/+15*; `grep -n "rotation-rows" -r apps/web` returns nothing.
3. `/setup/11`: lights out 22:45, phone away *21:45*; changing lights out to 23:00 moves phone away to *22:00* with no write to `devices_off_time`; changing phone away to 21:30 writes it and lights out 23:15 leaves it at 21:30. *(Vesper.)*
4. The wind-down rows are `SelectRow`s with glyphs, nothing pre-selected; a tick creates the habit (`block_kind wind_down`) at once with its glyph; no lengths, no *Order and lengths* row (`grep -n "windDownRoutineMeta" apps/web` returns nothing).
5. The prompts render with handles and truncate *What I want to make happen tomorrow* to one line with an ellipsis; dragging reorders and `journal_prompts` persists; the menu's *Move up* still works; the reminder reads *20:45* effective with the caption; setting it to 21:00 writes `journal_reminder_time`; the reminder switch writes its pref; turning the journal off hides both. *(Vesper.)*
6. `/setup/12`: heading *What is your work about?*; a card with a blank glyph, the placeholder, the first card's muted line, *Flexible* preselected; typing *Viewpoint* creates the focus; *Done* → *Viewpoint · 2 a week · flexible*; `grep -n "differentHours\|secondWork" apps/web/app/\(setup\)/_components/copy.ts` returns nothing.
7. Settings → Notifications shows *A few lines* with the time and switch; toggling it writes; the time writes.
8. Settings → Your day mounts 10, 11 and 12 embedded (or the report states which DYN-8 rows already open the block editor instead and why they stay).
9. Offline: every write disabled with the line.
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The create-on-first-fact rule: hold the card's state locally until `createWorkout` returns an id, then switch every control's write to `update`; queue writes made during the create (same pattern as RUN-10's tick queue).
- `user.me`'s two effective times are RUN-3's; render them, and write only on touch.
- The `SortableList` for prompts is small; the `EllipsesMenu`'s *Move up / Move down* handlers already exist in `step-11-closing` — keep them.
- The N2 row copies the review-reminder row's shape in `settings/notifications/_components`.

## Dev's call

The unnamed card's accessible name `[COPY]` · whether *Not right now* archives existing workouts (no — as DYN-11, it skips and writes nothing) · the N2 pref keying (read RUN-6).

## Out of scope

- **Placement, wind-down lengths and order, the builder** — RUN-12.
- **The reminder's sending** — RUN-6.
- **Work-day types** — RUN-8.
- **Version tabs on a workout** — none; workouts have no versions (v1.2 gives versions to habits; a workout's variants are workouts).

## Depends on

- **RUN-8** — the sequence and the frame rules. Complete in `PROGRESS.md`.
- **RUN-3** — the workout columns, `createFocus`, the reminder pair, the effective reads. Complete in `PROGRESS.md`.
- **RUN-6** — the reminder exists to be set. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** Two card grammars with create-on-first-fact and touched-tracking, a following default, and a notification setting with a register rule; a cheaper model creates a blank habit on *Add a workout*, or writes phone away on every lights-out change.

---

### Kickoff (paste into the session)

> Build **RUN-11 — Screens 10–12** (attached spec). Model: **Opus**. **No time for a workout; travel never in the length; lists append; nothing pre-selected; phone away follows until touched; the reminder is the person's words.**
> Attach/read first, in order: this spec · v1.2 §3.7, §4.10–§4.12, §7.1, §9, §12.4, §13 #13/#25 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-11 (screens 9–11 as they were, `rotation-rows.tsx` — replace, don't extend) · DYN-18 (the closing-the-day mount) · DYN-20 / ST-07 (the notifications rows) · RUN-7 · RUN-8 · RUN-3 · RUN-6's closing report · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-12, TD-18) · Epic 4's `DEVIATIONS.md`.
> Walk the three screens at 375px; say what you could not walk. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
