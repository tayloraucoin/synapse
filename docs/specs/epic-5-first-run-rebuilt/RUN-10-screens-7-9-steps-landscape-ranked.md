# RUN-10 — Screens 7–9: steps as `SelectRow`s with the sortable lengths and the step sheet, the landscape's two tabs, the ranked screen with `HabitSetupCard` and versions

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 3** · Size: L
**Slice type:** Three screens over the library's write path, one fact per tap. The risk class is *the duplicate row* (S7.5 — a tick that creates twice), *persuasion* (a pre-ticked starter), and *the clamp* (a *usually* bounded by the range).
**Vigil:** none. **Vesper review:** the three screens against v1.2 §4.7–§4.9 verbatim; the tick on a slow network; the card's collapse; no fit number anywhere.

**Status:** Not started

> **Vesper — screen review.** Walk `/setup/7`, `/setup/8`, `/setup/9` at 375px on a fresh account with DevTools throttled to *Slow 3G*. Confirm: a tap on 🍳 Breakfast ticks at once and a second tap un-ticks — never two rows; the two parts of screen 7 are under headings with a hairline; the length rows are emoji · title · stepper · menu on one line, centred; the stepper changes on the tap and writes once after a pause; screen 8 has two tabs and no arithmetic; screen 9's cards show *matters* as seven squares, *usually* at the midpoint, *Add a shorter version*, and *Done* collapses to one line; nothing is pre-selected anywhere; *Add something else* and *Add your own* open a sheet with no block and no priority.

---

## Outcome

The three screens that fill the library are rebuilt to the frame rules: screen 7 lists the getting-ready starters as rows with their glyphs — tap to include, tap to exclude, instantly — and, under a second heading, the included steps with their lengths, reorderable, plus a step sheet that asks a name, a glyph and a range and nothing else; screen 8 is the landscape in two tabs, every row with its glyph, a tick creating the habit at once; screen 9 is new — one card per selected habit asking how much it matters, how long it usually takes, and optionally a shorter or longer version, each card collapsing on *Done*. Every stepper is optimistic; every fact writes when entered; *Continue* only navigates. The library's *Before work* group reads *Getting ready* and its sheet says *step*. After this ships, **RUN-12's builder has steps in order with lengths, and habits ranked with versions, to compose.** Screens 10–12 are RUN-11's.

## Why / intent

- **v1.2 §4.7** — two parts: **What's included** (the ten starters as `SelectRow`s with glyphs and ranges, one per row on mobile; *"Tapping selects … and creates the step at once; tapping again un-selects (R30 — never a duplicate)"*; **Add something else** → *A step before work*: emoji (default 📌), name, a compact range, *"and nothing else"*) and **How long each takes** (drag handle · emoji · title · `MinutesStepper` (midpoint) · `EllipsesMenu` — *"all centred on the stepper's 44px height (S7.6). The stepper's accessible name is *Length, Breakfast*; nothing visible says *Takes*"*; the menu: **Make it one of two** · **Remove**; a `SortableList`); the sticky line *Adds up to 45 min · up at 7:00 · work by 9:00 · 72 min for the routine*; primary *Continue · 4 steps*. *"Ask for a start time. Call a step a habit. Wait for the network to show a tick"* — never.
- **v1.2 §4.8** — two tabs **Recommended · All**; twelve `SelectRow`s under *Body · Mind* with glyphs and ranges; *All* with the `SearchField`; *"A tick creates the habit at once (R30); a second tap removes it (archives, if it has never been used)"*; **Add your own** → *A morning habit*: emoji, name, range; primary *Continue · 9 habits*; no arithmetic; nothing pre-selected.
- **v1.2 §4.9** — heading *How much does each one matter, and how long does it take?*, body *Rough is fine. The morning is built from these.*; `HabitSetupCard`: header (glyph 1.5rem · title · range with a pencil → the compact range editor inline) · **Matters** (*How much it matters*, `Stepper17` as seven 40px squares, numbers visible) · **Usually** (*Usually takes*, `MinutesStepper` at the midpoint) · **Versions** (*Add a shorter version* → then *Add a longer version*; label `Input` placeholder *Quick* / *Full* + `MinutesStepper`; ≤ 3; each with *Remove*) · **Done** collapsing to *🌬️ Breath work · matters 5 · usually 8 · quick 5* with *Edit*; collapsed cards sink; primary *Continue*. *"Ask for a time of day. Clamp usually to the range (R21). Wait for the network"* — never.
- **v1.2 §1.4, R33, §4.17, §12.2** — *step*; the library's *Getting ready* group; the sheet titled for the noun.
- **v1.2 §3.5, R34, TD-11** — versions on the habit; `usually` is the default length the plan uses — **where does *usually* live?** On the habit it is the midpoint of the range by convention; v1.2 says *"the length the plan uses"*. Ruling below.
- **v1.2 §12.4** — the glyphs. **R29** — none in copy.
- **Ground truth (consumed):** `app/(setup)/_components/{step-7-before-work,step-8-landscape,step-9-ranked (RUN-8's placeholder)}.tsx`, `components/landscape-chooser/*` (DYN-11: `use-landscape.ts`, the tabs), `components/habit-sheet/*` (the sheet, `icon-chooser.tsx`, `mode`), the library page under `app/(shell)/settings/habits`, RUN-7's `SelectRow` / `SelectRowList`, `SortableList`, `RangeEditor`, `Card`, `Stepper17 layout="row"`, the optimistic steppers, `EmojiSlot`, RUN-3's `habit.createStep`, `habit.update` (versions), `createFromStarterLibrary` (with icons), `template.saveSlot` / `moveSlot` (the prep template's slots, DYN-11's shape), RUN-1's seeds.
- **What this slice is NOT (binding):** screens 10–12 (RUN-11); the builder (RUN-12); the pick's version tabs and the item sheet's version control (RUN-13); deleting `RangeInput` (RUN-15); any fit or budget number on screens 8 or 9.

**Rulings this slice makes (labelled, logged):**

- ***Usually* is the habit's default version when versions exist, else a `default_minutes`? No — no new column.** *Usually* is written as the **first version** when the person adds any version (the card seeds `versions[0] = { key: "usual", label: "Usual", minutes }` when the first *Add a … version* is tapped) and otherwise as the prep/morning **slot's `duration_min`** — the plan's length has always been the slot's (DYN-11's screen 8 wrote the slot at the chosen length). So: no versions → the slot's `duration_min` is *usually*; versions → `versions[0]` is *usually* and the slot's `duration_min` mirrors it. The builder (RUN-12) reads the slot. `[ASSUMPTION — reversible, logged; Mason may prefer a `usual_minutes` column, in which case RUN-15's `0008` adds it and this ticket's slot write stands as the fallback.]` Logged.
- **Screen 7's tick writes two things**: `habit.createStep` (or `createFromStarterLibrary` for a starter) and `template.saveSlot` on the prep template (priority 7, hard, midpoint, appended); un-tick removes the slot and archives the habit if it has never been used elsewhere (`habit.usage`). The row is keyed by the starter's title (or the habit id once created) so a second tap during an in-flight create is an un-tick queued behind it, never a second create. Logged.
- **Screen 8's tick writes `createFromStarterLibrary` per row** (one title per call) and the morning template's slot at the midpoint; un-tick as above. The *Selected* tab is gone; the count is on the primary. Logged.
- **Screen 9 lists the morning habits with a slot in the morning template**, in tick order (slot `sort_order`); *matters* writes `habit.update({ lifePriority })`; *usually* writes `template.saveSlot({ durationMin })` on that slot (and `versions[0]` when versions exist); the pencil writes `habit.update({ durationMinMin, durationMaxMin })`; versions write `habit.update({ versions })`. Nothing on this screen reorders (the builder does). Logged.
- **The step sheet and the morning-habit sheet are `HabitSheet` in a new `mode: "step" | "morning-habit"`**: title from the mode (*A step before work* · *A morning habit*), fields emoji · name · range only, block fixed by the mode, no priority, no category, no *More*. Logged.
- **The library's group *Before work* → *Getting ready***, and its *Add* in that group opens the step mode. Logged.

## Experience & states

### Screen 7 — `/setup/7` (§4.7)

Heading *What has to happen before you can start?*, body *Breakfast, coffee, the walk, the drive.* **What's included** (`GroupHeading`): `SelectRowList columns={1}` (2 from 720px) of the ten starters — *🍳 Breakfast · 10–30 min* … — plus any custom steps the person added, selected state from the prep template's slots; **Add something else** (full-width secondary) → the step sheet. Hairline. **How long each takes** (`GroupHeading`): `SortableList` of the included steps — handle · `EmojiSlot` · title · `MinutesStepper` (aria *Length, {title}*) · `EllipsesMenu` (*Make it one of two* → DYN-11's inline second row; *Remove*) — all `items-center` on 44px; empty → *Nothing yet — tap what applies.* muted, left-aligned. Sticky line above the action row (tabular; `computeBudget` as DYN-11). Primary *Continue · n steps*. **States:** empty · listing · sheet · saving (row pulse) · failed (revert + line) · offline.

### Screen 8 — `/setup/8` (§4.8)

Heading and body as v1.1. `Tabs` **Recommended · All**. Recommended: two `GroupHeading`s, twelve `SelectRow`s with glyphs; All: `SearchField` + the full list; rows already in the library with `block_kind morning` show selected and, if used on a day, `disabled` with *in your library*. **Add your own** at the foot of each tab → *A morning habit*. Primary *Continue · n habits*. **States:** recommended · all · searching · no-matches · saving · failed · offline. **Never:** a number about minutes.

### Screen 9 — `/setup/9` (§4.9)

Heading and body verbatim. `HabitSetupCard` per morning habit with a slot, in slot order: as quoted; collapsed cards render as a one-line `Card` with *Edit* and sink beneath open ones (two lists: open, then collapsed, each in order). Primary *Continue*. Empty (no habits ticked on 8): *Nothing to rank yet.* `[COPY]` + *Continue*. **States:** open · collapsed · editing-range · versions-1..3 · saving · failed · offline.

### The library (§4.17)

The *Before work* group is titled *Getting ready*; rows show glyphs (already, via `ItemIcon`); *Add* in that group opens the step mode.

**Failure / edge states:** a create fails → the row un-ticks and a `StatusLine` reads *Couldn't save Breakfast. Try again.* · the prep template does not exist yet → created on first arrival as DYN-11 · a habit archived while its card is open on screen 9 (another tab) → the card's writes 404 and the card shows *This one was removed.* `[COPY]` · versions: the third *Add* hides the ghost row; *Remove* on `versions[0]` when others exist promotes the next to default · at 200% the seven squares wrap 4 + 3.

## Non-negotiables (this slice)

- **Never a duplicate row.** A tick is idempotent; a second tap is an un-tick.
- **Nothing pre-selected** on either chooser.
- **No fit number on screens 8 or 9.** Screen 7's line is the only arithmetic.
- **Range is a default, never a clamp** — *usually* and versions bounded by `DURATION_MIN…MAX` only.
- **The step sheet asks emoji, name, range — nothing else.**
- **Every stepper is optimistic and debounced.**
- **No glyph in `copy.ts`.**

## Data & AI

**Schema changes: none.**

**Tables:** `habits` (create, update, archive) · `templates` (read; prep and morning) · `template_slots` (create, update, delete).

**Placement:** `app/(setup)/_components/{step-7-before-work,step-8-landscape,step-9-ranked}.tsx` (rebuilt / filled), `habit-setup-card.tsx` (new), `copy.ts` (7–9); `components/landscape-chooser/*` (two tabs; `SelectRow`); `components/habit-sheet/*` (the two modes; `copy.ts`); the library page (the group title). Rule 9.

**tRPC / validators:** `habit.createStep`, `habit.createFromStarterLibrary`, `habit.update` (versions, priority, range), `habit.archive`, `habit.usage`, `template.create` (prep / morning when none), `template.saveSlot`, `template.removeSlot`, `template.list` / `get`.

**AI notes:** **None.**

## Accessibility

- `SelectRow`s are `button[aria-pressed]` with the title as the name; the range is read as the description.
- The length list's handles are labelled *Reorder {title}*; the stepper is *Length, {title}*; Alt+↑/↓ reorders.
- The step sheet opens on the name field; the glyph button is *Choose an icon*.
- Screen 9's cards are `group`s labelled by their title; the seven squares are a radio group labelled *How much it matters* with the number as each option's name; *Done* moves focus to the collapsed card's *Edit*.
- 200%: the squares wrap; the length rows keep one line until the title truncates.

## Acceptance criteria (observable — local tier, fresh account, 375px, *Slow 3G* for 1–3)

1. `/setup/7`: tapping *🍳 Breakfast* ticks instantly; a second tap within 200 ms un-ticks; after the network settles there is at most one prep habit *Breakfast* and one slot; tapping five rows quickly yields five habits and five slots, no duplicates. *(Vesper.)*
2. The length rows are one line each, centred on the stepper; `+` five times changes the value five times at once and the network shows one `saveSlot` after the pause; nothing visible says *Takes*; the sticky line updates.
3. Dragging *Walk* above *Shower* persists the slot order on reload; *Make it one of two* still opens the inline second row and saves with `alternatesWith`; *Add something else* opens *A step before work* with emoji · name · range only and creates `block_kind prep`, `life_priority 7`.
4. `/setup/8`: two tabs, no *Selected*; rows carry glyphs; a tick creates the habit with its glyph at once and a slot at the midpoint; the primary reads *Continue · 3 habits*; `grep -n "min" apps/web/app/\(setup\)/_components/step-8-landscape.tsx` finds no minutes total; nothing is pre-selected on a fresh account. *(Vesper.)*
5. `/setup/9`: one card per ticked habit, in tick order; *matters* shows seven squares with numbers; tapping 6 writes `life_priority 6` after the pause; *usually* defaults to the midpoint and writes the slot's `duration_min`; the pencil opens the compact editor and writes the range; `usually 90` on a 5–10 habit is accepted. *(Vesper.)*
6. *Add a shorter version* reveals a row; *Quick · 5* writes `versions = [{usual, 8}, {quick, 5}]`; *Add a longer version* then appears; a third version hides the ghost; *Remove* works; *Done* collapses to *🌬️ Breath work · matters 6 · usually 8 · quick 5* with *Edit* and the card sinks below open ones.
7. Settings → Habits shows the group *Getting ready*; its *Add* opens *A step before work*.
8. Offline: ticks show the line and do not write; steppers disabled with the line.
9. `yarn lint` passes the emoji rule on the three `copy.ts` files; `grep -rn "habit" apps/web/app/\(setup\)/_components/copy.ts` finds the word only in screen 8–9 strings, never in screen 7's.
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `use-landscape.ts` holds the tick state today; key it by starter title until the create returns an id, then by id; queue the un-tick behind an in-flight create with a promise map.
- `computeBudget` (DYN-1) feeds the sticky line; nothing changes.
- The card's collapse is local; the summary reads the card's current values.
- The `Stepper17 layout="row"` is RUN-7's; do not build a second seven-square control.

## Dev's call

The in-flight create/un-tick queue's shape · whether screen 9's open/collapsed partition is one list with a sort or two lists · the `[COPY]` empty-state lines.

## Out of scope

- **Screens 10–12** — RUN-11. **The builder** — RUN-12. **Version tabs at the pick and in the item sheet** — RUN-13.
- **`RangeInput`'s removal** — RUN-15.
- **A `usual_minutes` column** — if Mason wants it, `0008` (RUN-15), with this ticket's slot write as the fallback.

## Depends on

- **RUN-8** — the fourteen-step sequence, the frame rules, the placeholder at 9. Complete in `PROGRESS.md`.
- **RUN-3** — `createStep`, versions on `habit.update`, icons on `createFromStarterLibrary`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The duplicate-row defect is a race, the version rules have an ordering invariant, and every screen carries a persuasion guardrail; a cheaper model debounces the tick instead of the write, or clamps *usually* to the range because the range is right there.

---

### Kickoff (paste into the session)

> Build **RUN-10 — Screens 7–9** (attached spec). Model: **Opus**. **Never a duplicate row; nothing pre-selected; no fit number on 8 or 9; range never clamps; the step sheet asks three things; every stepper is optimistic.**
> Attach/read first, in order: this spec · v1.2 §1.4, §3.5, §4.7–§4.9, §4.17, §12.4 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-11 (screens 7–8, `use-landscape.ts`, the slot writes — reuse, don't fork) · DYN-8 (`habit-sheet/`) · RUN-7 · RUN-8 · RUN-3 · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-11, TD-18) · Epic 4's `DEVIATIONS.md` (DYN-11's lines).
> Walk the three screens on *Slow 3G* and say what you could not walk. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
