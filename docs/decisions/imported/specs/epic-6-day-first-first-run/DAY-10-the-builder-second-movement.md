# DAY-10 — The builder, second movement (B8–B12): first thing with links, the landscape grouped, ranked in place, the routine with the same/varies question, winding down with the starters and the journal

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 4** · Size: L
**Slice type:** Five builder screens — three profile screens shown once, two per-plan lists — composed from the v1.2 screens they replace. The risk class is *a profile screen shown twice* (B8–B10 on a later plan), *a shared routine copied instead of referenced*, *a link whose kind the client chose*, and *a rank number without its cell*.
**Vigil:** none. **Vesper review:** B8's *To open* list and the `LinkSheet`; B9's four groups on *All* and the search collapsing them; B10's cards collapsing in place with the mark; B11's room line, the mark on the rows, the same/varies question at the foot; B12's starters and the journal group on the first plan only.

**Status:** Complete (2026-09-25)

> **Mason — write audit.** B8 writes `passage.*`, `link.*`, `user.updatePreferences` (the four switches); B9 and B10 write `habit.*` and the morning slots as RUN-10 did; B11 writes the plan's `morningTemplateId` and the template's slots, and `same_morning_routine` once; B12 writes the wind-down list and, on the first plan only, the journal's six preference fields. No screen writes on a later plan what a profile screen owns.

---

## Outcome

The builder's middle asks for the morning and the evening's frame where they belong: on the first day, what to hear first thing — passages, links to open, the quote switch, the three lines — then the whole morning landscape in four groups, then how much each matters and how long it takes, collapsing in place with the matters cell; on every day, the morning routine against that day's room with the *Same routine every day · It varies by day* question asked once; and winding down — that day's lights out and phone away, the wind-down list with its starters ticked straight in, the two placed rows, and, on the first day, the journal's switch, prompts and reminder. After this ships, **DAY-11 continues from B13.** B13–B17 keep v1.2's `13f`–`13i` behind them until then.

## Why / intent

- **v1.3 §4.4 B8–B12** — verbatim; quoted in *Experience & states*.
- **v1.3 R53, §3.17** — B8's *To open*: `ListRow`s with a `BrandGlyph` leading, the host as detail, an `EllipsesMenu`; the `LinkSheet` (title, URL; *That link doesn't look right.*); DAY-5's `link.*`.
- **v1.3 R66, §4.4 B9, §12.4** — *All* under *Body · Mind · Practice · Home* from the rows' `group`; the search collapses groups to matching rows.
- **v1.3 R57–R59, R62, §4.4 B10** — DAY-2's ranked screen, mounted in the builder; the cards in ticked order, in place, `CardSummary` with `PriorityMark`.
- **v1.3 R61, §4.4 B11, §13 #42** — the room line; rows with `PriorityMark` leading (DAY-7's `SelectRow leading`); the question at the foot on the first plan; a later plan skipped or `PickerList`.
- **v1.3 §4.4 B12, R64** — 13h with the starters inline and, on the first plan, screen 11's journal group; the times are B2's (*Change* returns there).
- **v1.3 §4.4 (which screens a later day shows)** — B8, B9, B10 first plan only; B11 per `same_morning_routine`.
- **Ground truth (consumed):** RUN-9 (`step-6-before-the-day.tsx`, `components/passages/*`), RUN-10 (`step-8-landscape.tsx` + `components/landscape-chooser/*`, `step-9-ranked.tsx` + `habit-setup-card.tsx` as fixed in DAY-2), RUN-11 (`step-11-closing.tsx`'s journal group and wind-down rows), RUN-12 (`13e-morning.tsx`, `13h-wind-down.tsx`, `use-list-screen.ts`), DAY-9's frame, `visibleScreens` and `preview.ts`, DAY-5's `link.*` and `sameMorningRoutine`, DAY-7's composites.
- **What this slice is NOT (binding):** B13–B17 (DAY-11); the orient frame's callouts (DAY-12); Settings' *First thing* re-point (DAY-12); deleting the v1.2 step files (DAY-13).

**Rulings this slice makes (labelled, logged):**

- **The profile screens are the v1.2 screen components mounted `embedded` inside the builder's frame** — `Step6BeforeTheDay`, `Step8Landscape`, `Step9Ranked`, and `Step11Closing`'s journal group — through thin `b08-first-thing.tsx`, `b09-landscape.tsx`, `b10-ranked.tsx` wrappers that pass `embedded` and hide their own primary (the builder's *Next* is the primary). Until DAY-13 the step files are the one home of that logic; DAY-13 moves the component bodies into `components/day-builder/screens/` when it deletes the step files, without behaviour change. Logged.
- **B8's *To open* is `components/links/`** (feature folder: `link-list.tsx`, `link-sheet.tsx`, `use-links.ts`, `copy.ts`, `index.ts`) — Settings → First thing (DAY-12) and the builder both mount it. The sheet validates with `linkFormSchema`; the kind comes back from the server. Logged.
- **B9's groups come from `StarterLibraryEntry.group`** and the words from the landscape chooser's `copy.ts` (`groups: { body, mind, practice, home }`); a habit the person added has no group and lists under *Your own* `[COPY]` at the end of *All*. Logged.
- **B11 on the first plan writes `same_morning_routine` on the tap of either row**, and *Next* waits for it; a later plan reads it from `user.me`: `true` → B11 is not in `visibleScreens` and B12's body opens with the routine line and the ghost row *Change for this day* (which pushes B11 with the `PickerList` for this plan only); `false` → B11 shown with the `PickerList`. The shared routine is one template referenced by every plan (§13 #42): on a later plan with `true`, `morningTemplateId` is written to the first plan's morning template on arrival at B12. Logged.
- **B11's rows carry `PriorityMark` in `SelectRow.leading`** and the detail *usually 12*; the version tabs as 13e. Logged.
- **B12 is 13h with two additions**: the starters as a `SelectRowList` above the list while the list is new and empty (the tick creating the habit with `block_kind: wind_down` and its slot at the midpoint, the row moving into the list, as B5); and, on the first plan only, the journal group (`Step11Closing`'s switch, prompts, reminder — extracted into `journal-settings.tsx` in the closing screen's folder or the builder's; the same component Settings → Closing the day mounts). The body's *Lights out 22:45 · phone away 21:45* has a *Change* that goes to B2. Logged.
- **`Step11Closing`'s two `TimeField`s leave the profile screen** — the times are per plan (R64); Settings → Closing the day shows the profile's two times as read-only values with one line *Each day sets its own — change them under Your days.* `[COPY]`. Logged (DAY-12 lands the Settings side).

## Experience & states

### B8 — First thing *(first plan only)*
Heading *What do you want to hear first thing?* Body verbatim. **Passages** as RUN-9 (the cards centred per DAY-2). **To open**: `GroupHeading` *To open*; empty line *A playlist, a track, a page. It opens with one tap from the morning.*; `ListRow`s (a `BrandGlyph` leading, the title, the host, `EllipsesMenu` *Edit · Remove*); **Add a link** → `LinkSheet` (**Title** autofocus, **Link** `type="url"`, *Cancel · Save*; invalid → *That link doesn't look right.*). **A quote each day** switch with its line and the added caption *It also closes the journal, on the nights it's on.* **In the morning** three switches. Primary *Next · 2 passages · 1 link*; ghost *Skip for now*.

### B9 — The landscape *(first plan only)*
Heading and body as v1.2 §4.8. `Tabs` **Recommended · All**; Recommended under *Body · Mind*; All: `SearchField`, then *Body · Mind · Practice · Home* (+ *Your own*), the search collapsing groups; **Add your own** on each tab. Primary *Next · 9 habits*. Nothing preselected; no arithmetic.

### B10 — Ranked *(first plan only)*
Heading and body as v1.2 §4.9. `HabitSetupCard`s in ticked order, DAY-2's behaviour (by one; in place; `CardSummary` with the mark). Primary *Next*.

### B11 — The morning routine, on this day
Heading *The morning routine.* Body the room line (or *No anchor…*). First plan: `ListHeader` (name *Morning routine A*); `SelectRowList` of ranked habits by rank — `PriorityMark` leading · glyph · title · *usually 12* · version tabs — preselected by rank to the room (§13 #20); `BudgetLine`; **Shorten to fit**; drag to reorder. At the foot: **Same routine every day** — *This list, wherever it fits. Days with less room take less of it.* · **It varies by day** — *Each day picks or builds its own.* (nothing preselected; *Next* waits). Later plan (`varies`): the `PickerList` (*Morning routine A · 68 min* · **New routine**) then the list. Primary *Next · 45 min*.

### B12 — Winding down
Heading *How does the day end?* Body *Lights out 22:45 · phone away 21:45.* with *Change* → B2. On a later plan with a shared routine: the line *Morning routine A · 45 chosen · 62 for the routine on this day* and the ghost *Change for this day* above the body. `ListHeader` (the `PickerList`, the name). New empty list: the eight starters as `SelectRow`s; the `SortableList` with the two placed rows and lights out fixed; habits below the pin *confirm in the morning*. First plan only: `GroupHeading` *A few lines*; the switch, the prompts (sortable, menu), **Add a prompt**, the muted line, **A reminder** with its switch and caption. Sticky *Wind-down A · starts 21:10*. Primary *Next*.

**States (exhaustive):** as DAY-9's list plus *profile-screen (first plan)* · *shared-routine (later plan, true)* · *own-routine (later plan, false)*. **Failure / edge states:** B11 with zero ranked habits → *Nothing to rank yet.* and the question still asked · a later plan whose shared template was archived → B12's line reads *This list was removed — start a new one?* and B11 is pushed · the `LinkSheet` with `http://` → the line · B12's journal group offline → the switch disabled with the standard line.

## Non-negotiables (this slice)

- **A profile screen shows once; a later plan never re-asks.**
- **A shared routine is one referenced template; nothing copies it.**
- **A link's kind is the server's; the sheet never sets it; nothing is fetched.**
- **The room is stated as room; never *doesn't fit*.**
- **Nothing pre-selected on a chooser except §13's defaults.**
- **Every string in `copy.ts`; no glyph in `copy.ts`.**

## Data & AI

**Schema changes: none.**

**Tables:** `passages`, `links` (read, write) · `habits`, `templates`, `template_slots` (read, write) · `day_plans` (read, write — `morningTemplateId`, `windDownTemplateId`) · `users` (write — the four orient switches, `same_morning_routine`, the six journal fields on the first plan).

**Placement:** `apps/web/components/day-builder/screens/{b08-first-thing.tsx, b09-landscape.tsx, b10-ranked.tsx, b11-morning.tsx (from 13e, git mv), b12-wind-down.tsx (from 13h, git mv)}`; `apps/web/components/day-builder/{use-day-builder.ts (visibleScreens reads sameMorningRoutine), day-builder.tsx (the switch; the 13x table shrinks to 13f–13i), copy.ts, use-list-screen.ts (kind += transition, activity for DAY-11 — leave the union widened here or in DAY-11, one place)}`; `apps/web/components/links/{link-list.tsx, link-sheet.tsx, use-links.ts, copy.ts, index.ts}` (new); `apps/web/components/landscape-chooser/{landscape-chooser.tsx, copy.ts}` (groups); `apps/web/app/(setup)/_components/step-11-closing.tsx` (the journal group extracted to `journal-settings.tsx` beside it; the times removed). Rule 9.

**tRPC / validators:** `passage.*`, `link.list/save/archive/reorder`, `user.updatePreferences`, `habit.list/createFromStarterLibrary/patch/archive`, `template.*`, `dayPlan.update`, `user.me`.

**AI notes:** **None.**

## Accessibility

- The `LinkSheet` traps focus; the URL field announces its error; the list rows' menus are labelled by the title.
- B9's groups are `GroupHeading`s the rows are grouped under; the search's result count announces politely (*4 habits match*).
- B11's rows read *title, matters 5, usually 12, pressed*; the question's two rows are a `radiogroup`.
- B12's *Change* is a link to B2 with the label *Change the times*.

## Acceptance criteria (observable — local tier, 375px; continue DAY-9's walk from B8; paste the plan row after B11)

1. On the first plan the caption runs *8 of 17* … *12 of 17*; on a duplicate plan B8, B9, B10 are absent and the caption's total is eleven (with `same_morning_routine = true`) or twelve (`false`). *(Mason.)*
2. B8: adding a link *Focus* with `spotify:playlist:abc` lists it with the Spotify mark and host `open.spotify.com`; an `http://` URL shows *That link doesn't look right.* and saves nothing; *Remove* archives; the quote switch and the three line switches write at once; the passage cards are centred.
3. B9's *All* lists four groups (plus *Your own* when a custom habit exists); searching *me* collapses to *Meditate* under *Mind* only; ticking creates the habit at once.
4. B10 collapses in place with the mark and caption (DAY-2's criterion 5 holds inside the builder).
5. B11: the room line reads *72 min for the routine on this day — up at 7:00, orient 3, getting ready 45, work by 9:00.*; rows carry the mark; the top-ranked preselect to 72; tapping *Same routine every day* writes `same_morning_routine = true` and enables *Next*; `grep -rn "doesn't fit\|over budget\|too much" apps/web/components/day-builder` returns nothing. *(Vesper.)*
6. On a duplicate plan with `same_morning_routine = true`: B11 is absent; B12 opens with the line *Morning routine A · 45 chosen · 62 for the routine on this day* and *Change for this day*; `morning_template_id` on the copy equals the first plan's; tapping *Change for this day* opens B11 with the `PickerList`.
7. B12 on a new list shows the eight starters; ticking *Read* creates the habit (`block_kind = wind_down`) and a slot and moves it under *In order*; the two placed rows and lights out are in position; on the first plan the journal group writes `journal_enabled`, `journal_prompts`, `journal_reminder_time`, `journal_reminder_enabled`; on a duplicate the group is absent.
8. B12's *Change* opens B2; nothing on B12 writes a time.
9. `SELECT count(*) FROM day_blocks` unchanged across the walk.
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands); `yarn directory-map` run.

## Likely-relevant technical notes (ADVISORY — dev decides)

- `FactScreen embedded` renders a *Save* primary; the wrappers need a `hidePrimary` (or a `frame="none"`) prop on `FactScreen` so the builder's action row is the only one — add it to `fact-screen.tsx`, default false.
- `use-list-screen.ts`'s `kind` union is `prep | morning | wind_down`; widen to include `transition | activity` now so DAY-11 does not touch the hook's signature twice.
- The landscape chooser's rows already carry `entries`; group by `entry.group` and render `GroupHeading`s in the fixed order.
- `links/` mirrors `passages/` (RUN-9): `use-links.ts` with the optimistic list and the per-row queue; the sheet a `ResponsiveSheet`.
- `journal-settings.tsx`: lift the switch, prompts and reminder JSX out of `step-11-closing.tsx` unchanged; the closing screen keeps mounting it for Settings until DAY-12 re-points.

## Dev's call

`FactScreen`'s prop name for hiding its primary · whether B12's *Change* is a ghost row or a link in the body · the *Your own* group's placement.

## Out of scope

- **B13–B17, Your days' duplicate-from-last** — DAY-11.
- **The orient frame's callouts; Settings → First thing / Closing the day re-points** — DAY-12.
- **Deleting the step files** — DAY-13.

## Depends on

- **DAY-9** — the frame, `visibleScreens`, the screen order. Complete in `PROGRESS.md`.
- **DAY-5** — `link.*`, `sameMorningRoutine`. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** The once-only rule for profile screens, the shared-routine reference, and a link sheet that must never decide its own kind are the places a cheaper model quietly copies a template or shows the journal group twice.

---

### Kickoff (paste into the session)

> Build **DAY-10 — The builder, second movement (B8–B12)** (attached spec). Model: **Opus**. **Profile screens show once; a shared routine is referenced, never copied; a link's kind is the server's; the room is stated as room.**
> Attach/read first, in order: this spec · v1.3 §4.4 (which screens a later day shows), B8–B12, §3.17, §12.4, §13 #42, R53, R57–R59, R61, R62, R66 · v1.2 §13 #20 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · RUN-9, RUN-10, RUN-11, RUN-12 (Epic 5 — the screens this composes; reuse, don't fork) · DAY-2, DAY-5, DAY-7, DAY-9 · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-28) · Epic 5's `TECHNICAL-DECISIONS.md` (TD-10, TD-11, TD-15, TD-18).
> Walk B8–B12 on the first plan and on a duplicate; paste both plans' rows. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands, then `yarn directory-map`.
