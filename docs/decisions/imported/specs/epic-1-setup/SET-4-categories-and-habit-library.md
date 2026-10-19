# SET-4 — Categories and the habit library: the API, CT-01/02, LB-01/02/03, and the habit sheet every later screen reuses

**Epic:** SET — Setup · **Phase 2** · Size: L
**Slice type:** The first CRUD domain — two routers, two list screens, two form sheets, one detail view, and the icon chooser. The risk class is *a sheet that forks*: LB-02 is opened from five places (LB-01, FR-02, TP-03, WK-03, ST-08) and if it is built for one, the other four rebuild it.
**Vigil:** none. **Vesper review:** the icon chooser (three tabs, crop) and the wake-anchor replacement line — state how each reads on compact.

**Status:** Complete (2026-09-05) — the API, both list screens, both sheets, the detail view and the icon chooser; **the browser-observable criteria and Vesper's review are unrun** (no Supabase project, so the signed-in shell cannot be reached). See `DEVIATIONS.md`.

> **Vesper — review.** LB-02 is the densest form in setup and the one place a real judgement (importance) is asked. Review the field order, the *More* disclosure's default state in edit mode, and that the three icon tabs read as one control. Reply in `DEVIATIONS.md` if a component contract had to bend.

---

## Outcome

A person can create, edit, search, duplicate, archive, and restore habits; give each one a type, an icon (emoji, curated glyph with a hue, or their own square image), a category, a time range, and a 1–7 importance; attach the optional quantity unit, reflection axes, preflight note, and the wake-anchor flag; and see where a habit is used. Categories have their own list and sheet with the eight hues. The habit sheet is a feature folder (`components/habit-sheet/`) that first run, the slot sheet, the one-off sheet, and Day & time will open without change. Templates do not exist yet (SET-5), so LB-03's *In templates* section renders its empty state and the archive dialog's template line does not appear.

## Why / intent

- **Official spec §3.2, §3.3, §4.3** — the habit is the library entry, never on a day directly; archive never deletes; a category is used for reporting only, never a mechanic; a habit has at most one category.
- **Epic 1 §3 (LB-01, LB-02, LB-03) and §4 (CT-01, CT-02)** — every read, interact, state, and validation string. §9 is the validation table; §10 the dirty-state rules; §11 the four states per screen family.
- **Cross-cutting §8.1** — habit edits: "Past DayItems snapshot title and icon; range/importance changes affect future slots only; archive never deletes." §9.1: the habit lifecycle's owning screens.
- **v2 handoff §5** — `ListRow`, `GroupHeading`, `ArchivedSection`, `SearchField`, `EllipsesMenu`, `ConfirmDialog`, `ResponsiveSheet`, `DiscardDialog`, `Stepper17`, `RangeInput`, `SegmentedControl`, `ChipPicker`, `ColorSwatchRow`, `CuratedIconGrid`, `EmojiPicker`, `ImageCropper`, `ItemIcon`, `CategoryChip`, `Tag`, `TextDisclosureButton`, `Textarea`, `Input`, `Switch`, `Tabs`, `EmptyState`, `SkeletonRow`, `AppHeader`, `ScreenFrame` — all built. **No new composite.**
- **Ground truth:** SET-1's `categories`, `habits`, `template_slots`, `day_items`; SET-3's upload rail and `iconImageUrl`; `apps/web/lib/hooks/use-icon-upload.ts`, `use-local-draft.ts`, `use-leave-guard.ts`; `lib/forms/use-synapse-form.ts`; the `user` router's `me`.
- **What this slice is NOT (binding):** no template, slot, or day writes. No first-run frame. The library is reached from ST-00's placeholder link and by URL; ST-00 itself is SET-8.

**Rulings this slice makes (labelled, logged):**

- **The habit sheet is a feature folder with a headless hook.** `apps/web/components/habit-sheet/{use-habit-sheet.ts, habit-sheet.tsx, icon-chooser.tsx, copy.ts, index.ts}`. It takes `{ open, mode: "create" | "edit", habitId?, defaults?: { type }, onSaved(habit), onOpenChange }` and owns its own form, mutations, and discard guard. Every later caller passes props, never re-implements. Logged.
- **`@syn/validators` `habit.ts` is the one place the LB-02 rules live** — the form resolver and the procedure share it, including the cross-field rule "range required for `habit` and `deep_work`" and "from ≤ to". Logged.
- **Editing a habit re-snapshots `title` and `icon` on untouched future items.** Cross-cutting §8.1 says past items keep their snapshot and says nothing about tomorrow's already-materialised items; a person who renames *Run* to *Morning run* and sees *Run* tomorrow will file a bug. "Untouched" = `assignment_state = assigned`, `completion_state = upcoming`, no `deferred_at`, no timer session, on a day with `closed_at IS NULL` and `date >= today`. Range and importance are **not** propagated (slots own duration and priority). `[PROVISIONAL — Vesper]`. Logged.
- **Archiving removes the habit's slots from every template and clears the wake anchor**, as the dialog says. Restoring does not put slots back (LB-01 states this). Logged.
- **Duplicate names are allowed** with the non-blocking note; the note is computed client-side from the loaded list, not a server rule. Logged.
- **The archived habit opened from the archived section is read-only** (`ResponsiveSheet` with every field `disabled`, footer *Restore* · *Close*), not a separate sheet. Logged.
- **CT-02's default hue is the first unused of the eight, else `leaf`**, computed client-side from the loaded categories. Logged.

## Experience & states

### The library — LB-01 (`/settings/habits`)

`AppHeader` title *Habits* with the count as `subtitle` (`{n}`) and `action` *Add*; `onBack` → `settingsRoute()`. Below, `SearchField` with placeholder *Search habits* (label visually hidden: *Search habits*). Groups in fixed order, each a `GroupHeading` (*Habits* · *Tasks & appointments* · *Deep work*), rendered only when non-empty, rows sorted by category name then title, uncategorised last. Each row is `ListRow` with `leading={<ItemIcon icon size={24} imageUrl={iconImageUrl(icon)} />}`, `title`, `chip` when categorised, `meta` = *{min}–{max} min · importance {n}* (the middle dot as a text separator; omit the range segment when the type is task and no range is set), `tag="wake-up"` when the habit is the anchor, `trailing={<EllipsesMenu … />}` with *Duplicate* · *Archive*, `href={settingsHabitRoute(id)}`. Archived: `ArchivedSection count` with the same rows `muted`, trailing a text `Button variant="ghost"` *Restore*.

Empty: `EmptyState text="No habits yet." actions=[Add a habit, Start from a small set]` — the second opens `StarterSetChooser` inline (the same chooser FR-02 uses; it lives in `components/starter-set/` here and SET-7 reuses it). Search with no matches: *No habits match "{query}"* as a `Text` line, no actions. Loading: five `SkeletonRow`. Error: `RegionRetry` *Couldn't load. Pull to try again.* — the label verbatim even on wide, where the action is a button. Offline: list readable; *Add*, overflow *Archive*, and *Restore* disabled; `StatusLine variant="offline" placement="inline"`.

Archive dialog (`ConfirmDialog`): title *Archive {title}?* · body *It leaves your templates and the library. Past days keep their record.* + *It's in {n} templates and will be removed from them.* when `n > 0` + a line when it is the anchor: *It's your wake-up habit; archiving clears that.* `[COPY — needs Vesper sign-off: the document says "Archiving the wake anchor clears the anchor and says so in the body" without the sentence]` · **Keep** · **Archive**.

### The habit sheet — LB-02

`ResponsiveSheet` `title` *New habit* / *Edit habit*, `subtitle` in edit mode *In {n} templates* rendered as a link to LB-03 (`settingsHabitRoute(id)` — see LB-03), `size="tall"`, `dirty` from the form, `onDiscardRequest` → `DiscardDialog`, `initialFocus="first-field"` in create.

Fields in this order, labels verbatim: *Name* (`Input`, maxlength 60, `autoFocus` create) · *Type* (`SegmentedControl` — *Habit* · *Task / appointment* · *Deep work*, each with its `helper` line from the document) · *Icon* (the chooser: a well showing the current `ItemIcon` at 48; tapping expands `Tabs` *Emoji* · *Icon* · *Image* — `EmojiPicker`, `CuratedIconGrid` with its hue row, and the image tab: a file `Input` accepting `ICON_ACCEPT`, then `ImageCropper` with *Use image* · *Choose another*, then *Uploading…* while `useIconUpload.status === "uploading"`; *Remove image* returns to the dot) · *Category* (`ChipPicker` with `noneLabel="None"`, `createLabel="+ New category"`, `onCreate` opens CT-02 stacked; on save the new chip is selected) · *Time it might take* (`RangeInput`, helper per type) · *How important is this to your life?* (`Stepper17` `captions`, helper *This becomes its default priority. You can change it per template.*) · *More* (`TextDisclosureButton`, collapsed in create, open in edit when any optional field is set): *Quantity* (`Input` maxlength 16, placeholder *e.g. pages*, helper verbatim) · *Reflection* (up to two `Input`s maxlength 24, placeholder *e.g. focus*, *Add another* after the first) · *Note before starting* (`Textarea` maxlength 280) · *This is my wake-up habit* (`Switch`, only for type Habit, helper verbatim; when on and another habit holds the flag: *This replaces {other} as your wake-up habit.*). Footer: *Cancel* · *Save* / *Save changes*.

Rules from the document that the hook enforces: Save disabled until valid on the first attempt, live per-field after a failed submit (`useSynapseForm`'s mode); type change in edit when in templates shows *Changing type keeps it in your templates.*; duplicate name shows *You already have a habit called this.* non-blocking; in edit, when the range changed and any slot's duration falls outside it, a `ConfirmDialog` before saving: *{n} template slots use a duration outside this range. They'll keep their duration; you can adjust them in the template.* — **Cancel** · **Save anyway** (the count comes from `habit.slotsOutsideRange` — until SET-5 this is always 0 and the dialog never shows).

Image upload ordering: create mode parks the blob and commits **after** `habit.create` returns the id, then `habit.update({ icon })`; edit mode commits first. This is `useIconUpload`'s pick/commit grammar — do not re-derive it.

### Habit detail — LB-03 (`/settings/habits/{id}`)

A screen (not a sheet): `AppHeader` title `{title}`, `onBack`. Sections: `GroupHeading` *In templates* with `ListRow`s (template name · slot time · duration · priority with `tag="overridden"` when overridden) linking to `settingsTemplateRoute(id)`; empty *Not in any templates yet.* · `GroupHeading` *Recent days* — the last 14 days it was assigned, each `ListRow` (date · outcome word *done* / *moved* / *missed* / *not assigned*), not links. Until SET-6 there are no days; the section renders nothing (not an empty state — the document gives none). **The route `/settings/habits/{id}` renders LB-03 with LB-02 open over it** on arrival from LB-01 (`?sheet=habit`), so a person editing sees usage one tap away and the URL is the habit's.

### Categories — CT-01 (`/settings/categories`) and CT-02

`AppHeader` *Categories* with `action` *Add*. Rows: `ListRow` with a `leading` swatch (a 16px circle in `bg-cat-{key}-500` with the key as `sr-only` text), `title`, `meta` *{n} habits*, `trailing` `EllipsesMenu` *Delete*; `onClick` → CT-02 edit. Empty: `EmptyState text="No categories yet. They group your time in the week review — wellness, work, whatever you like." actions=[Add a category]`. Delete: `ConfirmDialog` *Delete {name}?* / *{n} habits will have no category. Past reports keep the name.* — **Keep** · **Delete**.

CT-02: `ResponsiveSheet` *New category* / *Edit category* · *Name* (`Input` maxlength 24) · *Colour* (`ColorSwatchRow`, no `allowNone`) · *Cancel* · *Save*. Unique-name error *You already have a category called this.* from the server (`CONFLICT` → the field error) and pre-checked client-side.

**States (exhaustive):** LB-01: empty · loading · loaded · searching · no-matches · offline · error. LB-02: create · edit · saving · field error · form error (*Couldn't save. Try again.*) · offline (Save disabled) · image-uploading · archived-read-only · discard-prompt. LB-03: loading · loaded · empty-templates. CT-01: empty · loading · loaded · offline. CT-02: create · edit · saving · error · offline.

**Failure / edge states:** save succeeds but the icon commit fails → the habit exists with the dot icon and the hook's sentence shows; the sheet stays open on the icon field. Archiving the anchor → `users.wake_anchor_habit_id` nulled in the same transaction. Deleting a category with habits → `category_id` set null by the FK; the list re-renders without chips.

## Non-negotiables (this slice)

- **One habit sheet.** Any second implementation of LB-02's fields is a defect.
- **Archive never deletes a habit.** No `DELETE FROM habits` anywhere; the procedure is `habit.archive`.
- **Snapshots are never rewritten on past, started, done, or reviewed items.** The re-snapshot rule's predicate is exactly the one stated.
- **Validation copy is Epic 1 §9, verbatim, as zod messages.**
- **`Fixed`/`Flexible` never appear here** (they are TP-03's); `hard`/`soft` never appear anywhere a person reads.
- **Every read and write through `ctx.rls.execute()` with an explicit `where(eq(table.userId, userId))`.**

## Data & AI

**Schema changes: none.**

**Tables:** `categories` (CRUD) · `habits` (create, update, archive, restore, list, get) · `template_slots` (read for usage counts and `slotsOutsideRange`; delete on archive) · `day_items` (update snapshots on untouched future items; read for LB-03's recent days) · `users` (read/update `wake_anchor_habit_id`) · `days` (read for LB-03).

**Placement:** routers `packages/api/src/routers/{category,habit}.ts` (rule 3); services `services/library/{list-habits,save-habit,archive-habit,restore-habit,duplicate-habit,habit-usage,set-wake-anchor,save-category,delete-category,to-view}.ts` (rules 4, 5 — `to-view.ts` maps a `habits` row + category + the user's anchor id to `HabitSummaryView`, and a `categories` row to `CategoryView`); validators `packages/validators/src/{category,habit}.ts` (rule 7); feature folders `apps/web/components/habit-sheet/`, `components/category-sheet/`, `components/starter-set/` (rule 9); pages replace the three placeholders; route-local leaves in each `_components/`.

**tRPC / validators:**
- `category.list` · `category.create` · `category.update` · `category.delete` — `createCategoryInput`, `updateCategoryInput` (name 1–24 → *You already have a category called this.* on conflict).
- `habit.list({ includeArchived })` → `{ habits: HabitSummaryView[], categories: CategoryView[] }` · `habit.get({ id })` → the editable row · `habit.create` · `habit.update` · `habit.archive` · `habit.restore` · `habit.duplicate` → the new id · `habit.usage({ id })` → `{ templates: [...], recentDays: [...] }` · `habit.slotsOutsideRange({ id, min, max })` → count · `habit.createFromStarterSet({ ids })` → the created habits (the chooser's *Add {n} selected*).
- Zod (`habit.ts`): `habitTypeSchema`, `iconValueSchema` (discriminated), `habitFormSchema` with `superRefine` for the range rules and the messages *Give it a name.* · *How long does it usually take? A rough range is fine.* · *"From" should be less than or equal to "to".* · *Pick a number — 7 is most important.*; bounds from `@syn/constants` `limits.ts`.

**AI notes:** **None.**

## Accessibility

- The icon well is a `button` with `aria-label="Icon: {description}"` and `aria-expanded`; the three tabs are Radix `Tabs` (arrow keys move, one Tab stop).
- `Stepper17` is a radiogroup; the number keys 1–7 select (already built — verify it holds inside the sheet's focus trap).
- The swatch in CT-01 rows carries `sr-only` text with the hue key; the `ColorSwatchRow` in CT-02 already labels each swatch by key.
- The duplicate-name note is `aria-live="polite"` and not an error (no `aria-invalid`).
- The sheet's discard dialog returns focus to the sheet's *Cancel* on *Keep editing*.
- Search results announce the count on change (`aria-live="polite"`, one sentence, debounced).

## Acceptance criteria (observable — local tier, signed in as the smoke account after `db:seed`)

1. `/settings/habits` lists the seeded ten habits under *Habits* grouped by category then title, uncategorised last; *Wake up immediately* carries the *wake-up* tag once the anchor is set (set it via LB-02 in this run and confirm).
2. *Add* → LB-02 create: *Save* is disabled until name, range (for Habit), and importance are set; submitting with a missing range shows *How long does it usually take? A rough range is fine.*; from > to shows the "From"/"to" sentence; the habit appears at the correct group position with a 200 ms hairline emphasis and **no toast**.
3. Icon: emoji, curated with a hue, and an uploaded image each save and render in the row via `iconImageUrl`; *Remove image* returns to the dot; an upload that fails leaves the habit saved with the dot and the hook's sentence visible.
4. *+ New category* inside LB-02 opens CT-02 stacked; saving selects the new chip; the category appears in `/settings/categories` with *1 habits*.
5. Turning on *This is my wake-up habit* when another habit holds it shows *This replaces {other} as your wake-up habit.*; saving moves `users.wake_anchor_habit_id` (verify in the DB); the old habit loses the tag.
6. Search filters across groups and hides empty groups; a query with no match shows *No habits match "{query}"*.
7. Overflow *Duplicate* creates *{title} copy* and opens it in edit; *Archive* shows the dialog with the document's body; confirming moves the row to *Archived ({n})*; *Restore* returns it to its group; archiving the anchor nulls `users.wake_anchor_habit_id`.
8. Opening an archived habit shows every field disabled and the footer *Restore* · *Close*.
9. Editing a habit's title updates `day_items.title` only on rows matching the untouched-future predicate (insert one untouched future item and one done past item by SQL; only the first changes). *(Mason.)*
10. `/settings/categories`: create, edit (name and hue), delete with the dialog; deleting a category with habits nulls their `category_id` and the library re-renders without the chip; a duplicate name shows *You already have a category called this.* both client-side and from the server.
11. As user B (second smoke account), every `habit.*` and `category.*` procedure returns only B's rows; `habit.get` on A's id is `NOT_FOUND`.
12. A dirty LB-02 closed by the corner control, Esc, the scrim, or a downward drag shows *Discard changes?* — **Keep editing** · **Discard**; a clean one closes.
13. Offline: the list is readable; *Add*, *Archive*, *Restore*, *Delete*, and every sheet's *Save* are disabled with the inline line.
14. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `habit.list` returning categories alongside saves the sheet a second query and keeps the "first unused hue" and "duplicate name" checks client-side and cheap.
- The 200 ms hairline emphasis on the new row: a `data-highlight` attribute toggled by the list after `onSaved`, styled with `DURATION_SHEET_MS`; do not animate anything else (official §9.6).
- `useLocalDraft(STORAGE_KEYS.DRAFT_PREFIX + habitId)` for the sheet's unsent values is optional in Phase 1 — the discard prompt is the contract; a draft is a nicety.
- The re-snapshot write is one `UPDATE … WHERE habit_id = $1 AND assignment_state = 'assigned' AND completion_state = 'upcoming' AND deferred_at IS NULL AND NOT EXISTS (timer_sessions …) AND day_id IN (SELECT id FROM days WHERE user_id = $2 AND closed_at IS NULL AND date >= $today)`. `$today` is `resolveDayKey` from USE-1 if it is Complete by then; if not, the calendar date in the user's zone via `toDateKey` is acceptable **and must be logged** with a `[REVISIT: USE-1]` marker.
- `habit.createFromStarterSet` maps `STARTER_HABITS` ids to rows; the anchor flag on the first starter is applied only when `users.wake_anchor_habit_id` is null.

## Dev's call

Whether the icon chooser is inline (expanding) or a nested sheet on compact (recommend inline — the document says "inline three-tab chooser") · the search debounce · how the stacked CT-02 over LB-02 is presented on compact (recommend a second `Drawer` — Vaul supports nesting; on wide a second `Sheet` over the first) · draft persistence.

## Out of scope

- **Templates, slots, `slotsOutsideRange` returning non-zero, LB-03's template rows populating** — SET-5.
- **Days and LB-03's recent days populating** — SET-6.
- **The starter set inside first run** — SET-7 composes `components/starter-set/`.
- **ST-00's *Habits — {n} habits* row** — SET-8.
- **ST-08's *Wake-up habit* link into a filtered LB-01** — SET-8 (this ticket supports `?type=habit` as a nuqs filter so SET-8 can link to it).

## Depends on

- **SET-1** — the tables. Complete in `PROGRESS.md`.
- **SET-3** — the upload rail and `iconImageUrl`. Complete in `PROGRESS.md`.
- **SYS-1** — the shell chrome (back, tab bar) the library renders inside. Complete in `../cross-cutting-system/PROGRESS.md`.

## Recommended execution

**Opus.** The sheet has thirteen fields, four conditional rules, a three-way icon control with an async commit ordering, and it is reused by four later tickets. A cheaper model builds the happy path and leaves the create-then-commit icon ordering, the anchor replacement, or the re-snapshot predicate subtly wrong — and every later screen inherits it.

---

### Kickoff (paste into the session)

> Build **SET-4 — Categories and the habit library** (attached spec). Model: **Opus**. **One habit sheet for the whole product; archive never deletes; snapshots on past, started, done, or reviewed items are never rewritten; every string is Epic 1 §3–§4 and §9 verbatim.**
> Attach/read first, in order: this spec · Epic 1 §3 (LB-01/02/03), §4 (CT-01/02), §9, §10, §11 · official spec §3.2, §3.3, §4.3 · cross-cutting §8.1 · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · SET-3 (the upload rail — reuse) · `apps/web/lib/hooks/use-icon-upload.ts` · `packages/ui/src/index.ts` (audit the exports before building anything) · `packages/db/SCHEMA_REFERENCE.md` (library, plan, day groups) · `docs/ai-guides/trpc-foundation-patterns.md` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> Build the sheet as `apps/web/components/habit-sheet/` with a headless hook and a `copy.ts`. Nothing in this slice needs a new `@syn/ui` composite — if you think it does, stop and say why. Close in three places. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
