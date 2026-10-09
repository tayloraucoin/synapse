# SET-7 — First run: FR-01…05, the step frame, resume, and the handover to the List

**Epic:** SET — Setup · **Phase 4** · Size: M
**Slice type:** A five-step sequence composed from three Complete surfaces (the habit sheet, the template editor, the week build) inside its own frame. The risk class is *a fork*: a first-run-only variant of a form that later diverges from the settings version.
**Vigil:** none. **Vesper review:** the frame on compact (progress label, back, *Finish later*, primary last) and FR-05's three body variants.

**Status:** Complete (2026-09-05)

---

## Outcome

A person who has just verified their email lands on *When does your day usually start?*, confirms a wake time and time zone, adds habits (their own or from the starter set), builds a first morning template, applies it to the days they want this week, and reads *Your list is ready* before opening today — in under ten minutes, with nothing required at any step. They can leave at any step with *Finish later* and come back to the same step; the entry tree already routes them there on the first three launches, and after that the status line and the Settings row do. **After this ships, the "invite → first list" path (Epic 1 §8.1) is complete end to end**, except that the List itself is still USE-2's placeholder.

## Why / intent

- **Official spec §4.2** — five screens, progress *2 of 5*, no illustrations, no testimonials, no goal statement, no permission prompt; the starter set is hospitality, none pre-checked; "Taylor's own path through this is the same path; there is no hidden owner mode."
- **Epic 1 §2 (FR-01…05)** — the frame, every read, every default, the *Continue without habits* branch, the starter set (§FR-02's list, already in `STARTER_HABITS`), the embedding of TP-02 and WK-01 "in full — nothing is removed for first run", FR-05's three bodies, `first_run_completed_at`. §0.5: *Finish later* stores progress on the account and resumes; the resume line on the List until finished or dismissed.
- **Cross-cutting §1.3** — in a sequence, back moves to the previous step and never leaves it; *Finish later* is the exit. §4.2 step 3 — the redirect on the first three launches, then the status line (INF-7's `resolveEntry` and `launchCount` already do this).
- **Ground truth:** `apps/web/app/(setup)/layout.tsx` (gate: verified session, no entry tree), `(setup)/setup/[step]/page.tsx` (placeholder, validates 1–5), `lib/entry/resolve-entry.ts` (`firstRunStep`, `firstRunCompletedAt`), `users.first_run_step` / `first_run_completed_at` (INF-5), `user.updatePreferences` (INF-8 — extend its input), SET-4's `components/habit-sheet/` and `components/starter-set/`, SET-5's `components/template-editor/` with `embedded`, SET-6's `components/week-build/`, `TIMEZONE_REGIONS` + `detectTimezone` in `@syn/constants`, `TimezoneSelect`, `TimeField`, `ListRow`, `Button`, `Text`, `EmptyState`.
- **What this slice is NOT (binding):** no new form. FR-02 is a list plus the habit sheet; FR-03 is the editor; FR-04 is the week build. If a step needs a control the three surfaces do not expose, that is a prop on the surface (logged), not a copy.

**Rulings this slice makes (labelled, logged):**

- **The step is the URL** (`/setup/{1–5}`), and `users.first_run_step` is written on every *Continue*, *Skip*, *Finish later*, and back, so a reload or a second device resumes at the same step. Logged.
- **FR-03 opens the editor on a template this step creates on entry** with name *Morning* and `anchor_time = usual_wake_time`; *Skip for now* calls `template.discardIfEmpty` (a nameless… no — it is named *Morning*; **the ruling:** *Skip* on FR-03 archives nothing and deletes the template only if it still has no slots). Cost if wrong: an empty *Morning* template in TP-01. `[PROVISIONAL — Vesper]`. Logged.
- **FR-04 targets next week when today is Saturday or Sunday** (Epic 1 §13.2, Vesper's call) — computed with USE-1's `weekOf` and weekday. Logged.
- **FR-05 marks completion on *Open today*, not on arrival**, so a person who reloads FR-05 still sees it; `first_run_completed_at = now()` and `first_run_step = null` in one write. Logged.
- **`user.updatePreferences` gains `usualWakeTime` and `firstRunStep`** rather than a new `firstRun` router: they are account scalars and the service already exists (INF-8's deviation: an empty patch is `BAD_REQUEST` — keep it). Logged.
- **The setup status line's copy is signed here:** text *Setup isn't finished*, action *Continue* (Epic 1 §0.5). SYS-1 renders it from `shell.status.setupIncomplete`; this ticket changes `STATUS_LINE_COPY.setup` in `@syn/ui` and removes the `[COPY]` marker for that entry. Logged.

## Experience & states

### The frame — `app/(setup)/_components/step-frame.tsx`

Top row: progress label *Step {n} of 5* (`Text variant="caption" tone="secondary"`, also the document `<title>`), a back button (`Button variant="ghost" size="icon"` with `aria-label="Back"`; absent on step 1), *Finish later* (ghost, right). Then one `Heading` (the screen's `h1`), at most one `Text as="p"` body, the step's content, and the actions last: *Skip for now* (secondary weight) where the step allows it, then the primary. The layout is `(setup)/layout.tsx`'s existing column; the frame adds structure, not chrome. No tab bar, no header avatar, no status line.

*Finish later* → writes `firstRunStep = current` and `router.replace(todayRoute())`. Back → `firstRunStep = n − 1` and `router.replace(setupRoute(n − 1))`; the previous step's data is on the account, so "retaining everything" is automatic.

### FR-01 Your day (`/setup/1`)

*Step 1 of 5* · *When does your day usually start?* · *Templates are built around this time. You can change it any day.* · `TimeField` label *Usual wake time* default `07:00` · `TimezoneSelect` label *Time zone* with `zones={TIMEZONE_REGIONS}` and value `detectTimezone()` (client) falling back to the stored zone · *Continue* → `user.updatePreferences({ usualWakeTime, timezone, firstRunStep: 2 })` → `/setup/2`.

### FR-02 Habits (`/setup/2`)

*Step 2 of 5* · *What do you want to keep doing?* · *Add the habits you already have or want. Each one asks for two things: how long it takes, and how much it matters.* · two secondary buttons *Add a habit* (opens the habit sheet, create) · *Start from a small set* (reveals `StarterSetChooser` inline from `components/starter-set/`; already-added examples show *Added* and are unselectable; footer *Add {n} selected* / *Close*) · the list once non-empty: `ListRow` per habit — icon · title · *{min}–{max} min* · *importance {n}* · overflow *Archive* with `ConfirmDialog` *Archive {title}?* — **Keep** · **Archive** (the row leaves) · primary *Continue* / *Continue without habits* (zero habits → `firstRunStep: 5`, `/setup/5`). The list region is **absent** when empty, not a placeholder.

### FR-03 A first template (`/setup/3`)

*Step 3 of 5* · *Build a typical morning* · *Put your habits in order and give each a start time. This becomes a template you can apply to any day.* · `TemplateEditor embedded templateId={…}` (created on entry if the account has no unarchived template named *Morning* with `first_run` provenance — **simplest honest rule:** the step stores the template id in `sessionStorage` under `STORAGE_KEYS.SETUP_TEMPLATE_ID` (add) and creates one when absent) · *Skip for now* · *Continue* (runs `validateForLeave()`; a nameless editor cannot happen here since the name is prefilled) → `firstRunStep: 4`.

Reached only with ≥ 1 habit; with zero, FR-02 routed to FR-05 and a direct `/setup/3` visit redirects to `/setup/2` `[Dev's call on the redirect target — recommend 2]`.

### FR-04 This week (`/setup/4`)

*Step 4 of 5* · *Which days this week?* · *Tap a day to apply a template. Days you leave empty stay empty — nothing is missed on an unplanned day.* · `WeekBuild embedded week={targetWeek}` with today marked; with no template, WK-02's picker shows *No templates yet.* [*New template*] → the editor stacked, returning here · *Skip for now* · *Continue* → `firstRunStep: 5`.

### FR-05 Ready (`/setup/5`)

*Step 5 of 5* · *Your list is ready* · body by state (read `week.get(targetWeek).days` and `habit.list` server-side): planned days > 0 → *{n} days this week are planned. Everything you set up lives in Settings if you want to change it.* · habits but no plan → *Your habits are saved. Plan a week from Settings, or add one-off items from the List.* · nothing → *You can add habits, templates, and a week from Settings whenever you like.* · primary *Open today* → `user.completeFirstRun()` → `router.replace(todayRoute())`.

No *Finish later* and no back on this step? **Back is present** (the document says every step has back; step 5's back returns to 4 or, when habits were skipped, to 2). *Finish later* is present (harmless).

**States (exhaustive), every step:** loading on the primary (`busy`) · error inline (the mutation's sentence; for FR-01 *Couldn't save. Try again.* `[COPY — needs Vesper sign-off; §11 gives the sheet form-level line, not a sequence's]`) · offline (primary disabled + *Offline — you can look, but changes need a connection.*). FR-02 adds: empty · list · chooser-open · row-skeleton while a save returns. FR-03/04 add the embedded surfaces' own states.

**Failure / edge states:** a person with `first_run_completed_at` set who visits `/setup/3` directly → the layout does not gate on it (deliberately); the page renders the step — allowed, harmless, and the document says everything is editable later · a person who deleted every habit after FR-02 and returns to FR-03 → the step renders the editor with an empty picker; *Skip* works.

## Non-negotiables (this slice)

- **No first-run-only form.** The three surfaces are embedded whole; a divergence is a prop on the surface with a deviation line.
- **Nothing is required to proceed.** Every step continues with nothing done; the starter set has nothing pre-selected.
- **No notification permission, no photo, no goal, no commitment** is asked here. The permission sheet (SET-9) checks `first_run_completed_at` and never fires during the sequence.
- **Progress is on the account.** `first_run_step` is written on every transition; nothing about the sequence lives only in the browser except the FR-03 template id convenience.
- **Every string is Epic 1 §2 verbatim**, including FR-05's three bodies.

## Data & AI

**Schema changes: none.**

**Tables:** `users` (update `usual_wake_time`, `timezone`, `first_run_step`, `first_run_completed_at`) · `habits`, `templates`, `days` (read for FR-05's body; written only through the embedded surfaces' own procedures).

**Placement:** `app/(setup)/setup/[step]/page.tsx` (Server Component: reads `user.me` and the step's data, renders the right leaf) · `app/(setup)/_components/{step-frame,step-1-day,step-2-habits,step-3-template,step-4-week,step-5-ready}.tsx` · `app/(setup)/_components/copy.ts` · `user.completeFirstRun` on the `user` router with `services/user/complete-first-run.ts` · `updatePreferencesInput` extended in `packages/validators/src/user.ts` (`usualWakeTime: clockTimeSchema`, `firstRunStep: z.number().int().min(1).max(5).nullable()`).

**tRPC / validators:** `user.updatePreferences` (extended) · `user.completeFirstRun` (mutation, idempotent) · reads: `habit.list`, `template.get`, `week.get`.

**AI notes:** **None.**

## Accessibility

- Each step's `Heading` is the `h1`; the progress label is text before it, not a heading.
- Focus moves to the `h1` on each step change (a sequence, not a page load; announce the step).
- The starter chooser is a group of checkboxes with a live count in the footer button's label; already-added rows are disabled with *Added* in their name.
- *Finish later* and back are in the tab order before the content; the primary is last.
- The embedded editor and week build keep their own landmarks; the step frame does not add a second `main`.

## Acceptance criteria (observable — a fresh verified account on the local tier)

1. After verifying, `/` → `/setup/1` (existing entry tree); *Step 1 of 5*, the heading, the body, the time field at 07:00, the zone select showing the device zone.
2. *Continue* writes `usual_wake_time` and `timezone` and `first_run_step = 2`; `/setup/2` renders with only the heading, body, and two buttons (no list region).
3. *Start from a small set* → the chooser with ten rows, none selected, *Add 0 selected* disabled; selecting three and adding creates three habits (rows appear with range and importance; the wake-up mark on *Wake up immediately* when chosen); reopening the chooser shows those three as *Added* and unselectable.
4. *Add a habit* opens the same habit sheet SET-4 built (verify by the `components/habit-sheet` import); saving adds a row.
5. With zero habits the primary reads *Continue without habits* and lands on `/setup/5` with the third body; `/setup/3` visited directly then redirects to `/setup/2`.
6. `/setup/3` shows the editor with name *Morning* and *Starts at* equal to the FR-01 wake time; adding two slots autosaves; *Continue* → `/setup/4`; *Skip for now* with no slots deletes the template (TP-01 has no *Morning*); with slots it keeps it.
7. `/setup/4` shows the current week (or next week when run on a Saturday or Sunday — verify with a fixed clock or by SQL-shifting the check); applying *Morning* to two days materialises them (SET-6's rows exist).
8. `/setup/5` shows *2 days this week are planned…*; *Open today* sets `first_run_completed_at`, nulls `first_run_step`, and lands on `/today`; `/` now resolves to `/today` on every launch.
9. *Finish later* on step 3 lands on `/today`; the next launch (within three) returns to `/setup/3`; after the third launch, `/` lands on `/today` (the status line is SYS-1's — verify `first_run_step` is still 3).
10. Back from step 4 goes to step 3 with the template intact; from step 2 to step 1 with the values shown.
11. Offline on any step: the primary is disabled with the line; the embedded surfaces show their own read-only states.
12. `grep -rn "Notification.requestPermission\|subscribeToPush" apps/web/app/\(setup\)` returns nothing.
13. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- The page is a Server Component; each step leaf is a client component that receives its initial data as props and mutates through the React client. Reading `user.me` once in the page keeps the step's redirects server-side.
- `detectTimezone()` is a browser call; render the select with the stored zone from the server and swap to the detected one in an effect only while `first_run_step === 1` and the person has not touched the field.
- The starter chooser's `StarterSetItem.added` comes from comparing `STARTER_HABITS` titles against `habit.list` — title match is the honest rule (the document says "already-added examples are shown as Added").
- `completeFirstRun` also clears `STORAGE_KEYS.SETUP_TEMPLATE_ID`.

## Dev's call

The direct-visit redirect targets for out-of-order steps · how the target week is passed to the embedded week build · whether the archive on FR-02 rows uses SET-4's dialog body (recommend yes — same dialog, the template line is naturally absent).

## Out of scope

- **The setup status line and ST-00's resume row** — SYS-1 and SET-8 read `first_run_step`; this ticket writes it and signs the copy.
- **The permission sheet** — SET-9; it checks `first_run_completed_at`.
- **The List** — USE-2. *Open today* lands on the placeholder until then.
- **Google-prefilled display name** — SET-2 already stores it; FR asks for no name.

## Depends on

- **SET-4** — the habit sheet, the starter chooser, `habit.list`. Complete in `PROGRESS.md`.
- **SET-5** — the editor with `embedded`, `template.create`, `discardIfEmpty`. Complete in `PROGRESS.md`.
- **SET-6** — the week build with `embedded`, `week.get`. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** The surfaces exist; the work is a frame, five thin leaves, and the resume bookkeeping. The failure mode of choosing down is a rebuilt habit form inside step 2 — the kickoff forbids it in words, and the acceptance criterion checks the import.

---

### Kickoff (paste into the session)

> Build **SET-7 — First run: FR-01…05, the step frame, resume, and the handover to the List** (attached spec). Model: **Sonnet**. **No first-run-only form; nothing required to proceed; no permission ask; progress on the account at every transition.**
> Attach/read first, in order: this spec · Epic 1 §2 (FR-01…05), §0.5, §8.1, §8.6 · official spec §4.2 · cross-cutting §1.3, §4.2 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · `apps/web/app/(setup)/**` and `lib/entry/resolve-entry.ts` (reuse) · SET-4, SET-5, SET-6 (the three surfaces and their `embedded` props — reuse, don't fork) · `packages/api/src/services/user/preferences.ts` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Sign the `setup` status-line copy in `@syn/ui`'s `copy.ts` as ruled. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
