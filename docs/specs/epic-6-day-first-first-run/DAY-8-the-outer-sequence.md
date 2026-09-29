# DAY-8 — The outer sequence: five steps, screen 2 the blocks primer, screen 3 with *Usually*, the routes and redirects, the entry tree's clamp, Settings → Your day's new list

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 4** · Size: L
**Slice type:** The route map and the frame of the first run, renumbered once, plus one new screen. The risk class is *a dead route* (a step the map still lists but nothing renders), *an account stranded mid-flow* (a `first_run_step` of 9 with no screen 9), and *a primer that reads as the person's day*.
**Vigil:** none. **Vesper review:** screen 2 at 375px — the example day fits one screen, the legend reads as nine plain lines, nothing animates, the caption *An example.* is there; screen 3's five values and the disclosure.

**Status:** Complete (2026-09-25)

> **Mason — route audit.** After the change: `setupRoute` accepts 1–5 and the page 404s on 6; `SETUP_TOTAL_STEPS = 5`; `SETUP_STEP_COUNT` in the entry tree is 5 and `clampSetupStep` returns 4 for any stored value above 5; `YourDayScreen` still accepts `work-start`, `work-day-types`, `wake` but each redirects to `your-days` (removed in DAY-13); every added or retired route has its row in `apps/web/AGENTS.md`; the nine v1.2 step files are still present and importable (Settings mounts some until DAY-12/DAY-13) and none is routed by the step page.

---

## Outcome

The first run is five screens: the shape of the week; a one-screen primer that draws Taylor's example day as hued bands with a nine-line legend; which days are work, with *Usually* as the fourth of five values and the `InfoDisclosure` explaining all five; **your days** (the builder, still v1.2's nine screens until DAY-9…DAY-11 fill it); your week. An account that was mid-flow under v1.2 resumes at *Your days*. Settings → Your day lists v1.3's rows with the three retired screens redirecting. After this ships, **DAY-9 fills screen 4 with the builder's first movement.** The builder's contents are unchanged here; the nine v1.2 step files stay on disk, unrouted, until DAY-13.

## Why / intent

- **v1.3 R45, §4** — *"Five screens: the shape of the week; how days are built; which days are work; your days — the builder; your week. Progress reads 'n of 5' outside the builder."*
- **v1.3 R47, §4.2** — screen 2, verbatim: heading *Days are built in blocks.*, body *Nine kinds. Every day uses some of them. Here is one day, as an example.*, the caption *An example.*, the `ScheduleAxis` at 28px/h from 7:00 to 7:00 with hued `BlockBand`s from `EXAMPLE_DAY`, the sleep band, the nine-row legend with its lines (§4.2 lists them), primary *Continue*, no skip.
- **v1.3 R49, §4.3** — five values; the `Select` (DAY-2's) with *Usually* added; the `InfoDisclosure` with the five lines verbatim from §4.3.
- **v1.3 §4.4 (the builder's frame)** — screen 4 is `YourDays` (RUN-12's) under the outer *4 of 5*; its nine screens are v1.2's until DAY-9; the caption's total is `BUILDER_SCREENS.length` as today.
- **v1.3 §4.5** — screen 5 is RUN-13's `Step14Week` renumbered; hue strips are DAY-12's.
- **v1.3 §4.6** — Settings → Your day's list: *Shape of the week · Work days · Your days · First thing · Morning habits · Ranked · Free-time activities · Training · Standing commitments · Closing the day · Focuses · Getting ready · Morning routine · After work · Evenings · Wind-down · Each morning · Block order*. In this ticket the rows exist; the ones whose screens do not yet exist embedded (*First thing* with links, *Free-time activities*, *After work*, *Evenings*, *Each morning*) point at their v1.2 equivalents or the block editor, and DAY-12 re-points them. The three retired rows (*Work start*, *Work-day types*, *Wake*) leave the list; their routes redirect.
- **TD-31** — `SETUP_TOTAL_STEPS = 5`; `clampSetupStep(step > 5) = 4`; the redirects.
- **v1.3 R63, §2 guardrail 6** — DAY-2's `loading.tsx` stands; screen 2 renders from constants and needs none.
- **Ground truth (consumed):** RUN-8 (`step-frame.tsx`, `fact-screen.tsx`, `copy.ts`, `step-1-shape.tsx`, `step-2-work-days.tsx`), RUN-12 (`step-13-days.tsx`, `YourDays`), RUN-13 (`step-14-week.tsx`), DYN-8/DYN-10 (Settings → Your day, `YourDayScreen`, `your-day-list.tsx`), `lib/entry/resolve-entry.ts`, `lib/routes.ts`, DAY-3's `EXAMPLE_DAY`, DAY-7's hued band and compact axis, DAY-2's `Select` and `InfoDisclosure` on screen 2 (now screen 3).
- **What this slice is NOT (binding):** the builder's v1.3 screens (DAY-9…DAY-11); deleting any v1.2 step file (DAY-13); the week's hue strips, the Settings screens for links, free time, after work, evenings, each morning (DAY-12); a change to `YourDays` or `DayBuilder` beyond the outer step number.

**Rulings this slice makes (labelled, logged):**

- **The step files are renamed to their new numbers and the old ones stay** — `step-1-shape.tsx` (unchanged), `step-2-blocks.tsx` (new), `step-3-work-days.tsx` (from `step-2-work-days.tsx`, the file renamed with `git mv`), `step-4-days.tsx` (from `step-13-days.tsx`), `step-5-week.tsx` (from `step-14-week.tsx`); `step-3-work-shape`, `step-4-commitments`, `step-5-wake`, `step-6-before-the-day`, `step-7-before-work`, `step-8-landscape`, `step-9-ranked`, `step-10-training`, `step-11-closing`, `step-12-focuses` keep their names and are not routed; Settings' `YourDayScreen` keeps importing them until DAY-12 re-points and DAY-13 deletes. Logged.
- **The primer is `components/blocks-primer/`** — a feature folder (`blocks-primer.tsx`, `block-legend.tsx`, `sleep-band.tsx`, `copy.ts`, `index.ts`) because Settings → Your day may show it later as *How days are built* `[REVISIT — not in v1.3's Settings list; the folder is the seam]`; `step-2-blocks.tsx` mounts it in a `FactScreen` with `save: null`, `skippable: false`. Logged.
- **The example day's bands are `BlockBand hue` for real kinds and one `SleepBand` for the two sleep spans** — `SleepBand` is a local absolutely-positioned div with `bg-block-sleep` and the label *Sleep · 22:30 to 7:00* inside; the axis is 7:00 to 7:00 (1440 minutes) so the evening's sleep is one band at the bottom and the morning's is not drawn twice. `[DEFAULT]` Logged.
- **`clampSetupStep`**: `null`, `< 1` → 1; `> 5` → 4; else the value. The entry tree's `SETUP_STEP_COUNT` becomes 5 and is imported from `SETUP_TOTAL_STEPS` rather than duplicated (one fact, one home). Logged.
- **The three retired Settings routes redirect** in `[screen]/page.tsx` (`redirect(settingsYourDayScreenRoute("your-days"))`) rather than 404 — a bookmark or a back-stack entry lands somewhere true. DAY-13 removes the keys. Logged.
- **Screen 3's write and disclosure are DAY-2's screen 2, with the fifth value inserted second** — `MODES = ["always", "usually", "sometimes", "rarely", "never"]`; `COPY.workDayModes.usually = "Usually"`; `COPY.workDayModeLines.usually` verbatim from v1.3 §4.3. Logged.

## Experience & states

### Screen 1 — as v1.2 §4.1 with R56 (DAY-1's grammar).

### Screen 2 — Days are built in blocks (v1.3 §4.2)
`FactScreen step={2}`, heading and body verbatim. Content: the caption *An example.* (`Text caption secondary`), the `ScheduleAxis` (`pxPerHour={28}`, `startMin=420`, `endMin=1860`, no `onExtend`, `timeZone="UTC"`), one `BlockBand hue` per `EXAMPLE_DAY` entry of a real kind with `name` the kind's word (or *Lunch* for the named break) and `span` the clock pair, `labelPlacement="inside"`, no children; one `SleepBand` for the sleep span; then `BlockLegend`: a two-column list (one column under 360px) of nine rows — a 12px swatch (`bg-block-<kind>` with a hairline), the word in weight 500, the line in secondary — from `BLOCKS_PRIMER_COPY.legend`. Primary *Continue*; no skip. Desktop: the axis in the 960px canvas, the legend beside it.

### Screen 3 — Work days (v1.3 §4.3)
DAY-2's screen with five values and the five lines. Mon–Fri *Always*, Sat and Sun *Never*.

### Screen 4 — Your days
`Step4Days` mounts `YourDays` (unchanged) with `step={4}`; the builder's `BuilderFrame` passes `step={4}`.

### Screen 5 — Your week
`Step5Week` is `Step14Week` with `step={5}`; nothing else changes here.

### Settings → Your day
`your-day-list.tsx` renders v1.3's rows in §4.6's order; *Getting ready · Morning routine · After work · Evenings · Wind-down* open the block editor for `prep · morning · transition · activity · wind_down` (the editor lists templates by kind; `transition` and `activity` kinds render with their words from DAY-3); *First thing* → `before-the-day` (DAY-12 re-points to `first-thing`); *Morning habits* → a new `YourDayScreen` key `morning-habits` mounting `Step8Landscape` embedded; *Ranked* → `ranked` mounting `Step9Ranked` embedded (RUN-10 gave both an `embedded` prop); *Free-time activities* → `free-time` (DAY-12; until then the row is absent); *Each morning* → `each-morning` (DAY-12; absent until then). The three retired rows are gone; their routes redirect.

**States (exhaustive):** screens 1, 3, 4, 5 as their tickets wrote them; screen 2 — rendered · reduced-motion (identical; nothing animates) · 375px (one column legend) · wide (two columns beside the axis). **Failure / edge states:** an account with `first_run_step = 12` → lands on `/setup/4`; `/setup/9` → 404; `/settings/your-day/wake` → redirects to `your-days`; screen 2 offline → renders (constants only), *Continue* still navigates (it writes `first_run_step`, which fails silently as today).

## Non-negotiables (this slice)

- **Five routes, no dead ones; every route in `AGENTS.md`.**
- **Screen 2 asks nothing, animates nothing, and says *An example.***
- **Block hues on screen 2 and nowhere on the execution tabs.**
- **No v1.2 step file is deleted here.**
- **Every string in `copy.ts`; no glyph in `copy.ts`.**

## Data & AI

**Schema changes: none.**

**Tables:** `users` (write — `first_run_step`, `work_days` with `usually`).

**Placement:** `apps/web/app/(setup)/_components/{step-2-blocks.tsx (new), step-3-work-days.tsx, step-4-days.tsx, step-5-week.tsx (renames), copy.ts (SETUP_TOTAL_STEPS = 5; the primer's strings live in the feature folder), step-frame.tsx}`; `apps/web/app/(setup)/setup/[step]/page.tsx` (five cases); `apps/web/components/blocks-primer/{blocks-primer.tsx, block-legend.tsx, sleep-band.tsx, copy.ts, index.ts}` (new); `apps/web/components/day-builder/builder-frame.tsx` (`step={4}`); `apps/web/lib/routes.ts` (`setupRoute` 1–5; `YourDayScreen` += `morning-habits`, `ranked`; the three retired keys marked for DAY-13); `apps/web/lib/entry/resolve-entry.ts` (the clamp, the import); `apps/web/app/(shell)/settings/your-day/_components/{your-day-list.tsx, copy.ts}`; `apps/web/app/(shell)/settings/your-day/[screen]/{page.tsx, _components/your-day-screen.tsx}` (the redirects, the two new keys); `apps/web/AGENTS.md` (the route rows). Rules 9, 10, 11.

**tRPC / validators:** `user.updatePreferences` (`workDays` with `usually`, DAY-5's); nothing new.

**AI notes:** **None.**

## Accessibility

- Screen 2's axis is `role="grid"` with `aria-label` *An example day* and its bands read their labels; the legend is a `ul` whose rows read *word, line*; the swatches are `aria-hidden`.
- Screen 3's `Select` announces five options; the disclosure as DAY-1.
- The redirects preserve focus at the destination's heading as any route change does.

## Acceptance criteria (observable — local tier, 375px)

1. `/setup/1` → `/setup/5` render the five screens with captions *1 of 5* … *5 of 5*; `/setup/6` and `/setup/14` are 404s. *(Mason.)*
2. Screen 2 draws twelve entries — eleven hued bands and one sleep band — inside one phone screen without scrolling the axis; every band's label is inside it; the legend lists nine rows with the lines verbatim from v1.3 §4.2; the caption *An example.* is present; no `useEffect` timer or animation exists in the folder (`grep -rn "setTimeout\|animate" apps/web/components/blocks-primer` returns nothing). *(Vesper.)*
3. Screen 3's selects list *Always · Usually · Sometimes · Rarely · Never*; choosing *Usually* for Saturday writes `work_days["5"] = "usually"`; the disclosure shows five lines.
4. An account with `first_run_step = 12` and no `first_run_completed_at` opens the app and lands on `/setup/4`; one with `first_run_step = 3` lands on `/setup/3`; `null` lands on `/setup/1`.
5. `/setup/4` shows *Your days* under *4 of 5* and the builder opens at its first screen with the caption *Day A · 1 of 9* (v1.2's nine, until DAY-9).
6. `/setup/5` shows *Your usual week* and completes first run as RUN-13 did.
7. `/settings/your-day` lists v1.3 §4.6's rows in order (the DAY-12 rows absent); *Work start*, *Work-day types* and *Wake* are absent; `/settings/your-day/wake` redirects to `/settings/your-day/your-days`; *Morning habits* and *Ranked* open their embedded screens; *After work* and *Evenings* open the block editor for `transition` and `activity` with those words as headings.
8. `apps/web/AGENTS.md`'s route table reads `/setup/{1–5}` with the five screens named and the `your-day/{screen}` row lists the current keys with the three retired ones marked *redirects to your-days until DAY-13*.
9. `grep -rn "SETUP_STEP_COUNT = 14\|SETUP_TOTAL_STEPS = 14" apps/web` returns nothing; `SETUP_TOTAL_STEPS` has one definition.
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands); `yarn directory-map` run.

## Likely-relevant technical notes (ADVISORY — dev decides)

- The primer's axis needs `timeZone`; pass `"UTC"` and minutes from midnight — `hourLabel` formats in UTC, so 420 reads *7 AM*.
- `EXAMPLE_DAY`'s spans that cross midnight (sleep 1350–1860) are already in the 7:00-to-7:00 frame; nothing wraps.
- `git mv` the four renamed files so history follows; update the `page.tsx` switch and the Settings imports in one pass.
- The block editor's kind page (`settings/your-day/block/[kind]`) validates the kind against `BLOCK_KINDS`; `transition` passes once DAY-3 landed.

## Dev's call

Whether the legend is a `ul` of `ListRow`s or a plain list (plain recommended — no 56px rows for nine one-liners) · the legend's column breakpoint · the `[REVISIT]` on the primer under Settings.

## Out of scope

- **The builder's v1.3 screens** — DAY-9…DAY-11.
- **Hue strips on screen 5; the Settings screens for links, free time, after work, evenings, each morning** — DAY-12.
- **Deleting the v1.2 step files and the three retired route keys** — DAY-13.

## Depends on

- **DAY-3** — `EXAMPLE_DAY`, the words, `usually`. Complete in `PROGRESS.md`.
- **DAY-5** — `usually` accepted by the profile. Complete in `PROGRESS.md`.
- **DAY-7** — `BlockBand hue`, the compact axis. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** A renumbering that touches the route map, the entry tree, Settings and the frame at once, where a missed reference strands an account or leaves a dead route; the primer must be read-only and register-true. A cheaper model renumbers the files and misses the clamp.

---

### Kickoff (paste into the session)

> Build **DAY-8 — The outer sequence** (attached spec). Model: **Opus**. **Five routes and no dead ones; the primer asks and animates nothing; hues on screen 2 only; no v1.2 file deleted; every route in `AGENTS.md`.**
> Attach/read first, in order: this spec · v1.3 §4 (the frame), §4.1–§4.6, §12.4 (the example day), R45, R47, R49, R63 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · RUN-8, RUN-12, RUN-13 (Epic 5 — the frame, the list, the week; reuse, don't fork) · DYN-8, DYN-10 (Epic 4 — Settings → Your day) · DAY-2, DAY-3, DAY-5, DAY-7 · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-29, TD-31).
> Walk `/setup/1`–`/setup/5` at 375px and the three redirects; paste the route table. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands, then `yarn directory-map`.
