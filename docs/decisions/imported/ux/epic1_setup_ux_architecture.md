# Epic 1 — Setup: UX Architecture & Interaction Design

**Product:** Synapse (working name, confirmed)
**Author:** Vesper
**Date:** 4 Sept 2026
**Governs:** every screen a person meets before and outside execution mode — auth, first run, the habit library, categories, templates, the week build, settings. The official spec (`ux-spec-v1.md`, §3, §4, §8, §9, §10) is the authority above this document; the rulings in its §0.3 are now signed and are treated as settled here.
**Next consumer:** the UI designer, who will derive the component list from §12 of this document; then the UI/UX collaboration per screen.

---

## 0. How this document works

### 0.1 What it is and isn't
This is the backbone: for every screen, what a person is there to accomplish, what they read, what they can touch, what each control does, what it rejects, where they go next, and what the screen looks like when it's empty, waiting, broken, or offline. It is not visual design. Where it names a layout region, that is information order, not pixels. Where it names a control type ("segmented", "stepper"), that is an interaction contract the UI designer may realise however the system allows, as long as the contract holds.

### 0.2 Screen record format
Every screen carries the same record:
- **ID** — stable reference for tickets (`AU-` auth, `FR-` first run, `LB-` library, `CT-` categories, `TP-` templates, `WK-` week build, `ST-` settings).
- **Job** — one sentence. If it needs two, the screen is split.
- **State / budget** — which of the three user states (official spec §2.2) and what that permits.
- **Entry / Exit** — every way in and every way out.
- **Reads** — every text element, top to bottom, in its final copy. Placeholder copy is not permitted; if a string isn't here, it doesn't exist.
- **Interacts** — a table of every control: type, default/content, behaviour, validation, and what changes.
- **States** — empty, loading, error, offline, and any screen-specific state.
- **Done when** — the observable condition that means the job was accomplished.

### 0.3 Conventions that apply to every screen in this epic
- **One primary action per screen**, placed last in reading order. Secondary actions are text-weight. Destructive actions are never primary and never adjacent to the primary.
- **Forms save on the primary action**, never on blur — with the exception of the template editor and the week build, which autosave per change because they are canvases, not forms (each says "Saved" quietly in the header after a change).
- **Validation is on submit, then live per field once a field has erred.** Error text sits under the field, specific, in the product voice. No field turns red; the error text and a hairline are the signal.
- **Back** is always available (system back, header back) and never destroys typed input without asking: a sheet with unsaved changes asks *Discard changes?* — **Keep editing** · **Discard**.
- **Sheets** (bottom on mobile, side panel on desktop) hold create/edit forms. Full screens hold lists, canvases, and sequences.
- **Required fields are marked by their absence from "optional"** — the form says which fields are optional; everything else is required. Asterisks are not used.
- **Numbers are typed with numeric keyboards; times with the native time picker.**
- **Copy vocabulary** is fixed by official spec §10.2. Fixed/Flexible in the interface; hard/soft in the schema.
- **Offline** in Phase 1: screens that write show one line — *Offline — you can look, but changes need a connection.* — and disable the primary. Phase 2 queues.

### 0.4 Information architecture

```
Signed out
  AU-01 Sign in
  AU-02 Create account
  AU-03 Check your email
  AU-04 Forgot password
  AU-05 Reset password

First run (once per account, resumable)
  FR-01 Your day
  FR-02 Habits           ── uses LB-02 Habit sheet
  FR-03 A first template ── uses TP-02 Template editor (embedded)
  FR-04 This week        ── uses WK-01 Week build (embedded)
  FR-05 Ready

App shell (signed in)
  Tabs: List · Schedule · Review          (Epics 2–3)
  Header avatar → ST-00 Settings

Settings
  ST-00 Settings index
  ST-01 Account
  ST-02 Habits            ── LB-01 Library
                          ── LB-02 Habit sheet
                          ── LB-03 Habit detail (read view with usage)
  ST-03 Templates         ── TP-01 Template list
                          ── TP-02 Template editor
                          ── TP-03 Slot sheet
                          ── TP-04 Apply-changes dialog
  ST-04 Week              ── WK-01 Week build
                          ── WK-02 Day sheet
                          ── WK-03 One-off sheet
  ST-05 Categories        ── CT-01 List · CT-02 Category sheet
  ST-06 Reasons           ── ST-06a Reason sheet
  ST-07 Notifications
  ST-08 Day & time
  ST-09 Appearance
  ST-10 Your data         ── ST-10a Delete account
  ST-11 Share the app
  ST-12 Calendar (Phase 2)
```

Week build is reachable in three ways: Settings → Week, the "Plan this day" action on an empty List, and notification N6. Habit and template creation are reachable from anywhere they're needed (the template editor can create a habit inline; the week build can create a template inline). Nothing in this epic is reachable from inside the List or Schedule tabs except the two escape hatches the official spec permits (empty-day actions and the day-header sheet), and those lead here rather than opening configuration in place.

### 0.5 Navigation rules
- Header back returns to the screen that opened the current one, not to the index.
- Completing a create sheet returns to the list that spawned it with the new item visible and briefly highlighted (200ms hairline emphasis, no toast). Completing an edit returns the same way.
- Saving a template asks about applied weeks (TP-04) only when the template is already in use.
- The first-run sequence can be left at any step via **Finish later**; the app opens to the List; the sequence resumes at the same step next launch, from the Settings index, and via a single line at the top of the List until it's finished or dismissed (*Setup isn't finished — continue* · dismiss).

---

## 1. Auth (AU)

### AU-01 Sign in
**Job:** get a returning person into their space.
**State / budget:** could be any state, including tired or rushed; one form, no reading required.
**Entry:** app open while signed out; "Sign in" link on AU-02; after password reset; after sign out.
**Exit:** success → app shell (List) or first run if incomplete · "Create an account" → AU-02 · "Forgot password" → AU-04 · Google → OAuth → shell/first run.

**Reads (top to bottom)**
1. Wordmark: *Synapse*
2. Heading: *Sign in*
3. (Google button label) *Continue with Google*
4. Divider word: *or*
5. Field labels: *Email* · *Password*
6. Link: *Forgot your password?*
7. Primary: *Sign in*
8. Footer: *New here?* [*Create an account*]
9. Trust line (small, muted, below footer): *Only you can see your data. Not the people who built this, not anyone you invite.*

**Interacts**

| Element | Type | Default / content | Behaviour · validation |
|---|---|---|---|
| Continue with Google | button (secondary weight, full width) | — | Starts OAuth. On return: existing account → shell; new account → FR-01 with display name prefilled from Google. Loading state on the button only. |
| Email | text input, `type=email`, autocomplete `email` | empty | Required. Trim. Format check on submit: *That doesn't look like an email address.* |
| Password | password input, autocomplete `current-password` | empty | Required. Show/hide toggle (icon + label "Show"/"Hide"). |
| Forgot your password? | text link | — | → AU-04, carrying the email if typed. |
| Sign in | primary button | — | Disabled while a request is in flight; label unchanged, inline spinner. Errors: wrong credentials → under the form, *That email and password don't match.* (deliberately not field-specific — don't reveal which). Unverified email → *This email isn't verified yet.* [*Resend the link*] → AU-03. Rate-limited → *Too many attempts. Try again in a few minutes.* |
| Create an account | text link | — | → AU-02 |

**States:** loading (button) · error (as above) · offline (form disabled, line: *You're offline — sign-in needs a connection.*) · already signed in (never shown; redirect).
**Done when:** a session exists and the shell or first run is displayed.

### AU-02 Create account
**Job:** create a private space for a new person with the three facts an account needs.
**State / budget:** curious and uncommitted; must feel like two minutes, ask for nothing beyond the three facts.
**Entry:** "Create an account" on AU-01; the shared invite link (§ST-11) lands here directly.
**Exit:** submit → AU-03 · Google → OAuth → FR-01 · "Sign in" → AU-01.

**Reads**
1. Wordmark *Synapse*
2. Heading: *Create an account*
3. One line under the heading, only when arrived via the invite link: *Someone shared Synapse with you. It's free, and your list is private to you.*
4. *Continue with Google* · *or*
5. Field labels: *Your name* · *Email* · *Password*; helper under Password: *At least 8 characters.*
6. Primary: *Create account*
7. Footer: *Already have an account?* [*Sign in*]
8. Trust line (same string, same treatment as AU-01).

**Interacts**

| Element | Type | Default | Behaviour · validation |
|---|---|---|---|
| Continue with Google | button | — | As AU-01; new Google identity → FR-01. |
| Your name | text, autocomplete `name`, maxlength 40 | empty | Required. 1–40 characters after trim. Error: *Add a name — it's just what the app calls you.* Used as `display_name`; initials derive from it. |
| Email | email input | prefilled if invite link carried none (it doesn't) | Required, format check. Existing account: *There's already an account with this email.* [*Sign in instead*]. |
| Password | password, autocomplete `new-password`, show/hide | empty | Required, ≥ 8 chars. No complexity rules, no strength meter. Error: *Passwords need at least 8 characters.* |
| Create account | primary | — | Submits; success → AU-03. Loading inline. |
| Sign in | text link | — | → AU-01 |

**States:** loading · error (field-level and form-level as above) · offline (disabled + line).
**Done when:** the account exists and AU-03 is shown.

### AU-03 Check your email
**Job:** get the address verified without losing the person.
**State / budget:** waiting; one instruction, one fallback.
**Entry:** AU-02 submit; AU-01 "resend" path.
**Exit:** tapping the emailed link → app opens → FR-01 (new) or shell · "Use a different email" → AU-02 with the form prefilled except email · "Sign in" → AU-01.

**Reads**
1. Heading: *Check your email*
2. Body: *We sent a sign-in link to* **{email}**. *Open it on this device to continue.*
3. Secondary: *Resend the link* (with cooldown text when active: *Resend in 24s*)
4. Text links: *Use a different email* · *Sign in*
5. Small note beneath, muted: *Didn't get it? Check spam, or wait a minute — they sometimes take a moment.*

**Interacts**

| Element | Type | Behaviour |
|---|---|---|
| Resend the link | secondary button | Sends; disables for 30 s with countdown label; after 3 sends shows *Sent again. If it still doesn't arrive, try a different email.* |
| Use a different email | text link | → AU-02 (name and password retained in memory for this session only) |
| Sign in | text link | → AU-01 |

**States:** sending · sent (label changes to *Sent* for 2 s, then the countdown) · offline (resend disabled; the instruction still stands) · link opened on another device → the app on this device polls session on focus and proceeds when it exists.
**Done when:** a verified session exists.

### AU-04 Forgot password
**Job:** start a reset without confirming whether the email exists.
**Entry:** AU-01 link. **Exit:** submit → the same screen in its sent state · *Back to sign in* → AU-01.

**Reads:** heading *Reset your password* · body *Enter your email and we'll send a reset link.* · label *Email* · primary *Send reset link* · link *Back to sign in*.
**Sent state reads:** heading *Check your email* · body *If there's an account for* **{email}**, *a reset link is on its way.* · secondary *Resend* (30 s cooldown) · link *Back to sign in*.

**Interacts:** Email (email input, prefilled from AU-01 if present; required; format check) · Send reset link (primary; always succeeds visibly regardless of account existence) · Back to sign in.
**States:** loading · sent · offline.
**Done when:** the sent state is shown.

### AU-05 Reset password
**Job:** set a new password from an emailed link.
**Entry:** reset link. **Exit:** success → AU-01 with a one-line confirmation *Password changed. Sign in with the new one.* · expired link → AU-04 with *That link has expired. Request a new one.*

**Reads:** heading *Choose a new password* · label *New password* · helper *At least 8 characters.* · label *Confirm password* · primary *Save password*.
**Interacts:** New password (password, new-password, show/hide, ≥ 8) · Confirm password (must match: *These don't match.*) · Save password (primary).
**States:** loading · error · expired · offline.
**Done when:** the password is changed and AU-01 shows the confirmation.

### AU-06 Sign out (action, not a screen)
Lives in ST-01. Confirmation dialog: *Sign out?* / *Your data stays in your account.* — **Stay signed in** · **Sign out**. Local timer state is flushed to the server before sign-out; if offline, the dialog says *You're offline — a running timer won't be saved until you're back. Sign out anyway?*

---

## 2. First run (FR)

A five-step sequence. Every step has the same frame: a small progress label top-left (*Step 2 of 5*), a header back (returns to the previous step, retaining everything), a **Finish later** text action top-right (exits to the List; progress is stored on the account and the sequence resumes at this step), one heading, at most one paragraph of body, the step's content, and one primary action last. Steps 3 and 4 also carry **Skip** as a secondary action. There are no illustrations, no testimonials, no goal statements, and no request for notification permission.

The starter set, the wake anchor, and every default in this sequence are editable later in Settings; the sequence says so once, on FR-05.

### FR-01 Your day
**Job:** capture the one number the rest of the setup is anchored to.
**State / budget:** curious; one decision.
**Entry:** first successful sign-in on a new account; resumed sequence. **Exit:** primary → FR-02 · Finish later.

**Reads**
1. Progress: *Step 1 of 5*
2. Heading: *When does your day usually start?*
3. Body: *Templates are built around this time. You can change it any day.*
4. Label: *Usual wake time*
5. Label: *Time zone* with the detected zone shown as the value.
6. Primary: *Continue*

**Interacts**

| Element | Type | Default | Behaviour |
|---|---|---|---|
| Usual wake time | native time picker | 07:00 | Sets the default `anchor_time` for new templates. 24-hour or 12-hour follows device locale. |
| Time zone | select (searchable list of IANA zones, grouped by region) | device zone | Sets `users.timezone`. Rarely touched; shown so the default is visible, not hidden. |
| Continue | primary | — | Saves both; → FR-02. |

**States:** loading on Continue · offline (disabled + line).
**Done when:** wake time and timezone are stored.

### FR-02 Habits
**Job:** build a first, small habit library — the person's own words, or an editable starter set.
**State / budget:** curious; this step carries the only real thinking in first run (the 1–7), so it's allowed to take a few minutes, but nothing is required to proceed.
**Entry:** FR-01. **Exit:** Continue → FR-03 · Finish later · (Continue is available with zero habits; it says *Continue without habits* in that case and FR-03 and FR-04 are skipped, landing on FR-05).

**Reads**
1. Progress *Step 2 of 5*
2. Heading: *What do you want to keep doing?*
3. Body: *Add the habits you already have or want. Each one asks for two things: how long it takes, and how much it matters.*
4. Two entry controls: *Add a habit* · *Start from a small set*
5. The list (once non-empty), each row: icon · title · *{min}–{max} min* · *importance {n}* · edit affordance
6. Primary: *Continue* / *Continue without habits*

**Interacts**

| Element | Type | Behaviour |
|---|---|---|
| Add a habit | secondary button | Opens LB-02 Habit sheet (create mode). On save, the row appears at the bottom of the list. |
| Start from a small set | secondary button | Reveals an inline chooser (not a sheet): ten example habits as selectable rows, none pre-selected, each showing title, suggested range, suggested importance, and a *This is my wake-up habit* mark on the first. Footer of the chooser: *Add {n} selected* (disabled at 0) · *Close*. Adding creates real library entries with the suggested values; each row can then be edited like any other. The chooser can be reopened; already-added examples are shown as *Added* and unselectable. |
| Habit row | list row → LB-02 (edit) | Tap opens the sheet in edit mode. Row overflow: *Archive* (with confirmation *Archive {title}?* — **Keep** · **Archive**; the row leaves the list). |
| Continue | primary | → FR-03 (or FR-05 if empty). |

**The starter set** (title · range · importance · notes): Wake up immediately · 1–2 · 7 · wake anchor · Cold shower or bath · 3–8 · 5 · Meditate · 10–20 · 6 · Stretch or yoga · 10–30 · 4 · Breathwork · 5–10 · 4 · Read · 15–30 · 4 · Walk · 20–40 · 4 · Lift · 40–60 · 6 · Write tomorrow's plan · 5–10 · 5 · Lights out on time · 1–1 · 6. All type Habit, no category, no quantity, no reflection axes. `[VESPER CALL: ten plain items with no aspirational language; "importance" values are suggestions the sheet shows as prefilled and the person confirms by saving. Categories are deliberately absent so the first list stays monochrome and uncluttered.]`

**States:** empty (only the heading, body, and two entry controls; the list region is absent, not a placeholder) · loading (row skeletons while a save returns) · error (sheet-level, from LB-02) · offline (both entry controls disabled; line).
**Done when:** the person continues, with any number of habits.

### FR-03 A first template
**Job:** turn the habits into one kind of day.
**State / budget:** curious, slightly invested; the template editor's full depth is available but the step frames a single ask.
**Entry:** FR-02 with ≥ 1 habit. **Exit:** Continue → FR-04 · Skip → FR-04 (with no template, FR-04 shows its empty state) · Finish later.

**Reads**
1. Progress *Step 3 of 5*
2. Heading: *Build a typical morning*
3. Body: *Put your habits in order and give each a start time. This becomes a template you can apply to any day.*
4. The embedded template editor (TP-02) with the name prefilled *Morning* and the anchor prefilled from FR-01. All of TP-02's controls are present; nothing is removed for first run.
5. Secondary: *Skip for now* · Primary: *Continue*

**Interacts:** TP-02 in full (see §4). *Continue* saves the template (validation per TP-02) and proceeds; *Skip for now* discards an unsaved editor without asking (nothing was committed) and proceeds.
**States:** editor states per TP-02 · offline.
**Done when:** a template exists or the step was skipped.

### FR-04 This week
**Job:** apply the template to the days the person actually wants planned, so tomorrow has a list.
**Entry:** FR-03. **Exit:** Continue → FR-05 · Skip → FR-05 · Finish later.

**Reads**
1. Progress *Step 4 of 5*
2. Heading: *Which days this week?*
3. Body: *Tap a day to apply a template. Days you leave empty stay empty — nothing is missed on an unplanned day.*
4. The embedded week build (WK-01) for the current week (or next week if today is Saturday or Sunday — `[VESPER CALL]`), with today marked.
5. Secondary *Skip for now* · Primary *Continue*

**Interacts:** WK-01 in full (see §5). With no template (FR-03 skipped), WK-01 shows its empty-templates state: *No templates yet.* [*Build one*] → TP-02 in a sheet, returning here.
**Done when:** the person continues, with any number of planned days.

### FR-05 Ready
**Job:** hand over to the List and say where everything lives.
**Entry:** FR-04, or FR-02 with no habits. **Exit:** primary → List tab. The sequence is marked complete; the resume line never appears again.

**Reads**
1. Progress *Step 5 of 5*
2. Heading: *Your list is ready*
3. Body (varies by what was done): with planned days — *{n} days this week are planned. Everything you set up lives in Settings if you want to change it.* · with habits but no plan — *Your habits are saved. Plan a week from Settings, or add one-off items from the List.* · with nothing — *You can add habits, templates, and a week from Settings whenever you like.*
4. Primary: *Open today*

**Interacts:** Open today (primary) → shell, List tab.
**States:** none beyond loading.
**Done when:** the List is shown and `first_run_completed_at` is set.

---

## 3. Habit library (LB)

### LB-01 Library
**Job:** see every habit, find one, add one, archive one.
**State / budget:** planning.
**Entry:** ST-00 → Habits; the template editor's "Manage habits" link; FR-02 (embedded variant without the header).
**Exit:** back → ST-00 · row → LB-02 (edit) · Add → LB-02 (create).

**Reads**
1. Header: *Habits* · count in muted text *{n}* · header action *Add*
2. Search field placeholder: *Search habits*
3. Group headings, in this fixed order and only when non-empty: *Habits* · *Tasks & appointments* · *Deep work*; within a group, rows are sorted by category name then title; uncategorised last.
4. Row: icon · title · category chip (name, in its hue) if any · *{min}–{max} min* · *importance {n}* · small *wake-up* mark if `is_wake_anchor`
5. Collapsed section at the bottom: *Archived ({n})* — expands to the same rows in a muted treatment with a *Restore* action each.
6. Empty state: *No habits yet.* [*Add a habit*] · [*Start from a small set*] (the same chooser as FR-02).

**Interacts**

| Element | Type | Behaviour |
|---|---|---|
| Add | header button | → LB-02 create. |
| Search | text input, clearable | Filters rows across all groups by title and category as typed; groups with no matches are hidden; *No habits match "{query}"* when nothing matches. |
| Row | list row | → LB-02 edit. |
| Row overflow | menu | *Duplicate* (creates "{title} copy", opens LB-02 edit) · *Archive*. |
| Archive | confirmation dialog | *Archive {title}?* / *It leaves your templates and the library. Past days keep their record.* — **Keep** · **Archive**. If the habit is in any template, the body adds *It's in {n} templates and will be removed from them.* Archiving the wake anchor clears the anchor and says so in the body. |
| Restore | row action (archived section) | Un-archives; the row returns to its group. Templates it was removed from are not restored (stated in the archive dialog, not here). |

**States:** empty · loading (skeleton rows) · searching · offline (Add and Archive disabled; the list is readable).
**Done when:** n/a — a list screen; its child sheets have completion conditions.

### LB-02 Habit sheet (create / edit)
**Job:** define one habit with the two facts the system needs, and anything optional the person wants to attach.
**State / budget:** planning; the one place in setup where a genuine judgement (importance) is asked, so it's allowed to take a moment, and it's the only required judgement.
**Entry:** LB-01 Add / row; FR-02; TP-03 "New habit"; WK-03 "New" (task variant). **Exit:** Save → the caller, with the habit added or updated · Cancel / back → the caller (with the discard prompt if dirty).

**Reads**
1. Sheet title: *New habit* / *Edit habit* (edit mode additionally shows *In {n} templates* as a muted line under the title, linking to LB-03 usage)
2. Field labels, in order: *Name* · *Type* · *Icon* · *Category* · *Time it might take* · *How important is this to your life?*
3. Under Type, one line that changes with the selection: Habit — *Habits reset each week.* · Task/appointment — *Tasks carry forward until done.* · Deep work — *A timed block. What you work on lives elsewhere.*
4. Under importance: *This becomes its default priority. You can change it per template.*
5. Disclosure: *More* (collapsed by default; open by default in edit mode if any of its fields are set)
6. Inside More, labels: *Quantity* (helper: *Optional. Adds a number to capture when you mark it done — pages, reps, minutes.*) · *Reflection* (helper: *Optional. Up to two things to rate 1–7 after you do it.*) · *Note before starting* (helper: *Optional. Shown on the item before you start.*) · *This is my wake-up habit* (helper: *Marking it done sets the day's wake time.*)
7. Footer: *Cancel* · *Save* / *Save changes*

**Interacts**

| Element | Type | Default | Behaviour · validation |
|---|---|---|---|
| Name | text, maxlength 60, autofocus in create | empty | Required, 1–60 after trim. Error: *Give it a name.* Duplicate names are allowed but the sheet notes *You already have a habit called this.* (non-blocking). |
| Type | segmented, three options: *Habit* · *Task / appointment* · *Deep work* | Habit (Task when opened from WK-03) | Changing type after creation is allowed; if the habit is in templates, a line appears: *Changing type keeps it in your templates.* Deep work and Habit require the time range; Task makes it optional (helper text updates). |
| Icon | icon picker control showing the current icon; tap opens an inline three-tab chooser: *Emoji* · *Icon* · *Image* | curated neutral "dot" glyph | Emoji: system emoji grid with search. Icon: the curated ~80-glyph set with a colour key row (the eight category hues, plus *none*); selecting a hue tints the glyph. Image: file input (image/*, ≤ 5 MB), square crop step with *Use image* · *Choose another*; stored per user. *Remove image* returns to the dot. |
| Category | chip picker (single-select) with the person's categories in their hues, plus *None* and *+ New category* | None | *+ New category* opens CT-02 inline; on save the new chip is selected. |
| Time it might take | two numeric inputs *from* and *to*, unit *min*, side by side | empty (create) | Required for Habit and Deep work; optional for Task. Integers 1–480. Rules: from ≤ to (error: *"From" should be less than or equal to "to".*); a single value is allowed by entering the same number twice. Error when missing: *How long does it usually take? A rough range is fine.* |
| How important is this to your life? | 1–7 stepper (seven selectable segments, 7 highest, the number is the label; end captions *less* · *more* in muted text) | none selected (create); prefilled from starter set or existing value | Required. Error: *Pick a number — 7 is most important.* |
| More | disclosure | collapsed | Reveals the four optional fields. |
| Quantity | text input for the unit, maxlength 16, placeholder *e.g. pages* | empty | Optional. Presence of a unit enables quantity capture on items. Clearing it removes capture from future items; past values are kept. |
| Reflection | up to two text inputs, maxlength 24 each, placeholder *e.g. focus*, with *Add another* after the first | empty | Optional. Each non-empty label becomes a 1–7 axis at reflection time. Removing an axis keeps past ratings. |
| Note before starting | textarea, maxlength 280 | empty | Optional. |
| This is my wake-up habit | switch | off | Only shown for type Habit. Turning on when another habit holds the flag shows a line: *This replaces {other} as your wake-up habit.* Saving moves the flag. Turning off with none other set clears `wake_anchor_habit_id`; the Day header's manual wake entry remains. |
| Cancel | text button | — | Discard prompt if dirty. |
| Save / Save changes | primary | disabled until required fields are valid on first attempt; after a failed submit, live validation | Creates or updates; returns to the caller. In edit mode, if the habit's range changed and any template slot's duration is now outside the new range, the sheet warns before saving: *{n} template slots use a duration outside this range. They'll keep their duration; you can adjust them in the template.* — **Cancel** · **Save anyway**. |

**States:** create · edit · saving (footer buttons disabled, inline spinner on Save) · error (field-level; form-level *Couldn't save. Try again.* with the form intact) · offline (Save disabled; line) · image uploading (the Image tab shows *Uploading…* and the Save button waits) · archived habit opened from the archived section (read-only fields, footer *Restore* · *Close*).
**Done when:** the habit is saved and visible in the caller.

### LB-03 Habit detail (usage)
**Job:** show where a habit is used so archiving or changing it isn't a surprise.
**Entry:** the *In {n} templates* line on LB-02. **Exit:** back → LB-02.
**Reads:** heading *{title}* · section *In templates* listing template name, slot time, duration, and priority (with *overridden* mark) per row · section *Recent days* listing the last 14 days it was assigned with its outcome word (*done*, *moved*, *missed*, *not assigned*) · nothing else.
**Interacts:** template rows → TP-02 for that template. Day rows are not links in this epic (Review owns days).
**States:** empty (*Not in any templates yet.*) · loading.

---

## 4. Categories (CT)

### CT-01 Categories
**Job:** keep the small set of labels the reports group time by.
**Entry:** ST-00 → Categories; the *+ New category* chip in LB-02 (opens CT-02 directly, not this list). **Exit:** back → ST-00.
**Reads:** header *Categories* · header action *Add* · rows: colour swatch · name · *{n} habits* · empty state *No categories yet. They group your time in the week review — wellness, work, whatever you like.* [*Add a category*]
**Interacts:** Add → CT-02 create · row → CT-02 edit · row overflow → *Delete* → dialog *Delete {name}?* / *{n} habits will have no category. Past reports keep the name.* — **Keep** · **Delete**.
**States:** empty · loading · offline (Add/Delete disabled).

### CT-02 Category sheet
**Job:** name a category and give it one of the eight hues.
**Reads:** title *New category* / *Edit category* · labels *Name* · *Colour* · footer *Cancel* · *Save*.
**Interacts:** Name (text, 1–24, required, unique among the person's categories: *You already have a category called this.*) · Colour (a row of eight swatches, each with its key as an accessible label — *leaf, sky, clay, rose, amber, slate, plum, moss*; single-select; default: the first hue not yet used, or leaf) · Save (primary) · Cancel.
**States:** saving · error · offline.
**Done when:** saved and selected/visible in the caller.

---

## 5. Templates (TP)

### TP-01 Template list
**Job:** see the kinds of day that exist, open one, make one, copy one.
**Entry:** ST-00 → Templates; WK-02's *Manage templates* link. **Exit:** back · row → TP-02 · New → TP-02 (create).
**Reads:** header *Templates* · header action *New* · rows: name · *{n} items · {total} min* · typical-days hint as short weekday initials in muted text (e.g. *M T W T F*) · weekly target if set (*target {n}/week*) · *Used {k} days this week* in muted text · empty state *No templates yet. A template is a kind of day — a morning, a workout day, a rest day.* [*New template*]
**Interacts:** New → TP-02 create · row → TP-02 edit · row overflow → *Duplicate* (creates "{name} B" if the name ends in a single letter A–Y, otherwise "{name} copy"; opens the copy in TP-02) · *Archive* → dialog *Archive {name}?* / *Days it's already applied to keep their items. It won't be offered for new days.* — **Keep** · **Archive**. Collapsed *Archived ({n})* section with *Restore* per row.
**States:** empty · loading · offline (New/Duplicate/Archive disabled).

### TP-02 Template editor
**Job:** describe one kind of day, once, as an ordered set of slots against an anchor time.
**State / budget:** planning; this is the densest screen in the product and it earns it. Autosaves per change; the header shows *Saved* or *Saving…*.
**Entry:** TP-01 New / row; FR-03 (embedded); WK-02 *New template*; LB-03 template rows. **Exit:** header back → caller. In create mode, leaving with no name and no slots deletes the draft silently; otherwise the draft is kept as a real template (autosave), so there is no discard prompt here — there is nothing unsaved.

**Reads (top to bottom)**
1. Header: name field (inline, editable) · autosave status · back
2. Settings row (a single line of three editable values): *Starts at* **{anchor}** · *Target* **{n}/week** or *none* · *Usually* **{days}** or *any day*
3. Slot list heading: none (the list is the body)
4. Each slot row: icon · title · time mode word (*at* / *within* / *anytime*) · time text (*7:20* · *1:00–4:00* · blank) · *{duration} min* · priority number with a small *overridden* mark when it differs from the life default · *Fixed* or *Flexible* word · multitask bracket when grouped
5. Between rows where a gap exists: nothing (gaps are implied by times); where two rows share a start and are grouped: a bracket and the word *multitask*
6. Add control at the bottom of the list: *Add an item*
7. Footer totals line: *{first} – {last} · {n} items · {total} min planned* — with a second line only when the template contains flexible items: *{flex} min flexible*
8. Empty state (no slots): *Nothing in this template yet. Add habits in the order you'd do them.* [*Add an item*]
9. Beneath the list, a text link: *Manage habits* → LB-01

**Interacts**

| Element | Type | Default | Behaviour · validation |
|---|---|---|---|
| Name | inline text, maxlength 40 | *Morning* (FR-03) or empty | Required to leave create mode with slots; if empty on back with slots, the field errors *Name this template.* and back is held once. |
| Starts at | time value → native time picker | wake time from FR-01 / ST-08 | Sets `anchor_time`. Changing it re-labels every slot's displayed clock time (offsets don't change). |
| Target | numeric value → small stepper 0–7 in a popover; 0 displays *none* | none | Optional `weekly_target`. Helper in the popover: *How many days a week you mean to use this. Shown when you build a week.* |
| Usually | weekday chips (M–S, multi-select) in a popover | none | Optional `typical_days`. Helper: *Just a hint for when you build a week.* |
| Slot row | tap → TP-03 edit | — | |
| Slot row overflow | menu | *Move up* · *Move down* (only within a shared start; otherwise order is time order and these are hidden) · *Duplicate* · *Remove* (no confirmation — undo toast *Removed {title}* [*Undo*] for 5 s). |
| Add an item | button → TP-03 create | — | |
| Manage habits | text link | — | → LB-01; returning re-renders the list. |

**Validation and rules enforced by the editor**
- Two slots with the same start offset must be in a multitask group. The editor never lets this state exist: TP-03 asks at save time (below). If a habit edit or a start-time change creates a collision after the fact, the editor shows an inline row between the two slots: *These start at the same time.* — **Multitask them** · **Move one** (opens TP-03 for the later-added slot).
- A window's start must be before its end; a window must be at least the slot's duration long (error in TP-03: *The window is shorter than the item.*).
- Offsets may be negative (an item before the anchor) down to −120 min; the editor shows these with clock times normally.
- Nothing prevents overlap between a fixed item and a window, or between two fixed items with different starts whose durations overlap — overlap is a fact the totals line and the Schedule tab show, not an error. `[VESPER CALL: enforcing non-overlap would make the editor argue with the person; the same-start rule is enough to keep multitask explicit.]`
- Priority overrides are per slot; the life default is shown as the resting value.

**States:** create (name empty, list empty) · edit · saving/saved · error (autosave failure: header shows *Not saved — retrying*; after three failures a line: *Changes aren't saving. Check your connection.* and the editor keeps local state) · offline (read-only; line) · template in use (the header line *Applied to {n} days this week* appears; edits trigger TP-04 on leaving).
**Done when:** the template has a name and the person leaves; nothing else is required.

### TP-03 Slot sheet
**Job:** place one habit in the template: which habit, when, how long, how important today, fixed or flexible.
**Entry:** TP-02 Add / row. **Exit:** Save → TP-02 with the row added/updated · Cancel (discard prompt if dirty) · *New habit* → LB-02 → back here with the habit selected.

**Reads**
1. Title: *Add an item* / *Edit item*
2. Labels: *Habit* · *When* · (mode-dependent) *Starts at* / *Between* … *and* · *Takes* · *Priority in this template* · *Timing*
3. Under Habit (once chosen): the habit's range and life importance in muted text: *usually {min}–{max} min · importance {n}*
4. Under Takes: *Within {min}–{max} min.* [*Edit range*]
5. Under Priority: *Defaults to {n}. Change it only if it matters differently on this kind of day.*
6. Under Timing, changing with the choice: Fixed — *Stays put when you shift the day. Use for appointments and anchors.* · Flexible — *Moves with the rest of the day when you shift it.*
7. Footer: *Cancel* · *Save*

**Interacts**

| Element | Type | Default | Behaviour · validation |
|---|---|---|---|
| Habit | picker field → inline searchable list grouped as LB-01, archived hidden; last row *New habit* | empty (create) | Required. Choosing prefills Takes with the range midpoint and Priority with the life default. Changing the habit on an existing slot keeps time, resets duration and priority (stated inline: *Duration and priority reset for the new habit.*). |
| When | segmented: *At a time* · *Within a window* · *Anytime* | At a time | Sets `time_mode`. Anytime hides the time fields. |
| Starts at | native time picker (displayed as clock time, stored as offset from anchor) | end of the previous slot, or the anchor if first | Required for At a time. |
| Between / and | two native time pickers | previous slot end → +180 min | Required for Within a window. Rules: start < end; window ≥ Takes. |
| Takes | numeric stepper in minutes, step 5 (fine step 1 via typing), bounded to the habit's range | range midpoint | Required. Out-of-range typed values snap to the bound with a line *Bounded to the habit's range.* *Edit range* opens LB-02 for the habit and returns. |
| Priority in this template | 1–7 stepper showing the life default as the resting selection; a small *reset* link appears when overridden | life default | Optional override. |
| Timing | segmented: *Fixed* · *Flexible* | Flexible for Habit and Deep work; Fixed for Task/appointment | Sets `scheduling`. |
| Save | primary | disabled until valid | On save, if another slot shares the start: an inline question replaces the footer — *Another item starts at {time}: {title}. Do these happen at the same time?* — **Yes, multitask** (both slots join a group; if one already has a group, this slot joins it) · **No, move this one** (returns focus to Starts at). Never a third option. |

**States:** create · edit · saving · error · offline.
**Done when:** the slot exists in TP-02 and no same-start collision is ungrouped.

### TP-04 Apply-changes dialog
**Job:** make sure an edit to a template that's already in use doesn't silently change, or silently fail to change, this week's days.
**Entry:** leaving TP-02 after any change to a template applied to one or more days in the current or a future planned week.
**Reads:** title *Apply these changes to planned days?* · body *{name} is applied to {n} days: {day list}. Items already done or reviewed on those days are kept as they are.* · options.
**Interacts:** three buttons — **All planned days** · **Only days from tomorrow** · **Don't apply** (template saved; days untouched). Re-materialisation rules: DayItems not yet started/done/reviewed are replaced; started, done, missed, carried, or pending items are kept and the new slots are merged around them; removed slots whose items are untouched are removed; a one-line result afterwards in the caller's header: *Applied to {n} days.*
**States:** applying (buttons disabled) · error (*Couldn't update the days. The template is saved; try again from the week.*).

---

## 6. Week build (WK)

### WK-01 Week build
**Job:** decide which template each day gets, so every planned day has a materialised list before it begins.
**State / budget:** planning; the Sunday ritual. Autosaves per change.
**Entry:** ST-00 → Week; empty-List *Plan this day*; notification N6; FR-04 (embedded). **Exit:** back → caller.

**Reads**
1. Header: week label *{Mon date} – {Sun date}* · week navigation *Previous* · *Next* · a *This week* return action when not on the current week
2. Under the header, a targets line, only when any template has a target: *{name} {used} of {target}* … (one entry per targeted template, separated by middle-weight spacing; the most-behind one carries a single small marker — the informational nudge from official spec §4.5)
3. A single line above the days when the week is entirely unplanned: *Pick a template for each day you want planned. Days you leave empty are empty.*
4. Seven day rows (Mon → Sun; stacked on mobile, columns on desktop). Each day shows: weekday and date · *Today* mark where relevant · template name or *Nothing planned* · anchor time when a template is applied (*starts {time}*) · one-off count when any (*+{n} one-off*) · a small *past* treatment for days before today (still openable; editing a past day is allowed for one-offs only).
5. Beneath the days: *Copy last week* (text action; hidden when last week was unplanned) · *Templates* (link → TP-01)
6. Empty-templates state (no templates exist): the day rows still render; tapping one opens WK-02 whose picker says *No templates yet.* [*New template*].

**Interacts**

| Element | Type | Behaviour |
|---|---|---|
| Previous / Next / This week | header actions | Navigate weeks; unlimited forward; backward to the account's first week. |
| Day row | tap → WK-02 | |
| Copy last week | action → dialog | *Copy last week's plan?* / *Applies the same templates and start times to this week. One-offs aren't copied.* — **Cancel** · **Copy**. Days already planned this week are overwritten only if the dialog's additional line is confirmed: *{n} planned days will be replaced.* |
| Templates | link | → TP-01; returning refreshes. |

**Materialisation rule (stated once, here):** applying a template to a day creates that day's DayItems immediately at absolute times computed from the day's anchor. Changing the day's anchor recomputes them. Removing the template deletes untouched DayItems and keeps any that were started, done, or reviewed (shown as one-offs from then on, with a muted *from {template}* note).

**States:** unplanned · partial · fully planned · past week (read-only except one-offs) · loading (row skeletons) · offline (read-only; line) · autosave error (as TP-02).
**Done when:** n/a — a canvas; the week's `status` becomes `planned` when any day has a template or one-off.

### WK-02 Day sheet
**Job:** set one day: its template, its start, its one-offs.
**Entry:** WK-01 day row. **Exit:** Done → WK-01 (changes are already saved) · one-off row → WK-03.

**Reads**
1. Title: *{Weekday} {date}* (+ *Today*)
2. Label *Template* with the current value or *Nothing planned*
3. Picker (inline list when the field is tapped): each template as a row — name · *{n} items · {total} min* · target status *{used} of {target}* when targeted (with the same single marker on the most-behind) · typical-days hint; a *None* row at the top; a *New template* row at the bottom; archived templates absent (a day already using an archived one shows it as the current value with *(archived)*).
4. Label *Starts at* with the anchor time (only when a template is applied); helper *Defaults to the template's start.*
5. Section *One-offs* listing this day's one-off items: icon · title · time text · *Fixed/Flexible*; *Add a one-off* beneath.
6. Preview section *This day* (collapsed by default): the materialised list for the day in time order, read-only — icon · title · time · duration. Helper: *This is what the List will show.*
7. Footer: *Remove template* (text, only when applied) · *Done* (primary)

**Interacts**

| Element | Type | Behaviour · validation |
|---|---|---|
| Template | picker | Selecting applies immediately (materialises). Selecting *None* on a day with started/done items shows the keep rule inline before applying: *{n} items already started or done stay on the day.* |
| Starts at | native time picker | Recomputes the day's times. If the day is today and some items are done, the done ones keep their `done_at`; scheduled times still recompute. |
| One-off row | → WK-03 edit | |
| Add a one-off | → WK-03 create | |
| Remove template | text button → confirm | *Remove {name} from {day}?* / *Untouched items are removed. Started or done items stay.* — **Keep** · **Remove**. |
| Done | primary | Closes the sheet. |

**States:** no template · applied · past day (template and start read-only; one-offs editable) · loading · offline.

### WK-03 One-off sheet
**Job:** put one item on one day without a template — an appointment, a call, a single task.
**Entry:** WK-02 Add; the List's day-header *Add a one-off* (Epic 2 links here); the empty-List action. **Exit:** Save → caller · Cancel.

**Reads**
1. Title *Add a one-off* / *Edit one-off*
2. Labels: *What* · *When* · time fields per mode · *Takes* (optional) · *Timing* · *Priority*
3. Under What, two ways in: the picker of existing library items (grouped as LB-01) and *Just a title* (a text field for something that shouldn't join the library)
4. Under Timing: the same Fixed/Flexible helper lines as TP-03
5. Footer *Cancel* · *Save*

**Interacts**

| Element | Type | Default | Behaviour · validation |
|---|---|---|---|
| What | picker with *Just a title* toggle → text input (1–60) | empty | Required: either a library item or a title. *Just a title* creates a DayItem with `habit_id` null and type Task/appointment; helper *It won't be added to your habits.* A link *Save to habits instead* opens LB-02 (Task type) and returns with it selected. |
| When | segmented *At a time* · *Within a window* · *Anytime* | At a time | As TP-03. |
| Starts at / Between–and | native time pickers (absolute, this day) | now rounded up to the next 15 min if today, else 09:00 | As TP-03 rules. |
| Takes | minutes stepper | empty | Optional; if a library habit with a range is chosen, bounded to it and prefilled with the midpoint. |
| Timing | segmented Fixed · Flexible | Fixed | |
| Priority | 1–7 stepper | library default, or 4 for a bare title | Required (prefilled). |
| Save | primary | | Same-start collision with an existing DayItem on that day asks the multitask question as TP-03 (against the day's items). |

**States:** create · edit (one-offs created from the List open here too) · saving · error · offline.
**Done when:** the DayItem exists on the day.

---

## 7. Settings (ST)

### ST-00 Settings index
**Job:** route to every configuration surface from one place.
**Entry:** header avatar (any tab). **Exit:** rows → sections · back → the tab that opened it.
**Reads:** header *Settings* · a top card with avatar · display name · email · then rows in this order with one-line descriptions:
- *Setup isn't finished — continue* (only while first run is incomplete; → the resumed step)
- *Habits* — *{n} habits*
- *Templates* — *{n} templates*
- *Week* — *{this week: n days planned}*
- *Categories* — *{n}*
- *Reasons* — *What you can pick when something's missed*
- *Notifications* — *Reminders are only the times you set*
- *Day & time* — *Wake time, day close, time zone*
- *Appearance* — *System / Light / Dark*
- *Calendar* — *Not connected* (Phase 2; hidden in Phase 1)
- *Your data* — *Export or delete everything*
- *Share the app*
- Footer: *Sign out* (text) · version line in muted text
**Interacts:** each row → its screen; the top card → ST-01; Sign out → AU-06 dialog.
**States:** loading counts · offline (rows open; writes inside are disabled per screen).

### ST-01 Account
**Reads:** header *Account* · avatar (large) with *Change photo* · *Remove photo* (when set) · labels *Name* · *Email* · *Password* · footer *Save changes* · a separate section *Sign out*.
**Interacts:** Change photo (file input → square crop → save; same pipeline as custom icons) · Name (text 1–40, required) · Email (email; changing sends a verification to the new address and shows *Check {new email} to confirm the change. Your current email works until then.*) · Password (a row *Change password* → inline fields *Current password* · *New password* · *Confirm* · *Update password*; errors *That's not your current password.* / *These don't match.*) · Save changes (primary; disabled until dirty) · Sign out → AU-06.
**States:** saving · error · offline · Google-only account (Password section reads *You sign in with Google.* and has no fields).

### ST-06 Reasons
**Job:** keep the set of reasons the Day Review and shift-forward offer, and what each counts as.
**Reads:** header *Reasons* · header action *Add* · intro line *When something's missed, you pick a reason. The reason decides how it counts.* · three groups with headings that double as the tier definitions: *Something came up — counts as done for the record* · *Planned it wrong — counts half* · *Didn't do it — counts as missed* · rows: reason label · *default* mark on the built-ins · overflow · a line at the bottom: *"Stayed on something more important" can count as done for the record when the thing you stayed on was at least as important and got done.*
**Interacts:** Add → ST-06a · row → ST-06a edit · overflow *Archive* (built-ins can be archived except *Didn't do it* and *Other*, which are structural; their overflow has no Archive) · drag or Move to another group is not offered — tier is edited in the sheet.
**States:** default set only · loading · offline.

### ST-06a Reason sheet
**Reads:** title *New reason* / *Edit reason* · labels *Reason* · *Counts as* · under Counts as, the three tier rows with their definitions · footer *Cancel* · *Save*.
**Interacts:** Reason (text 1–40, required, unique: *You already have this reason.*) · Counts as (three radio rows: *Something came up — done for the record* · *Planned it wrong — half* · *Didn't do it — missed*; required; default *Planned it wrong* `[VESPER CALL: the middle tier is the least presumptuous default]`) · Save.
**States:** saving · error · offline · editing a structural built-in (label editable, tier locked with a line *This one's tier can't change.*).

### ST-07 Notifications
**Job:** show every reminder the product can send, each with its default, and let the person turn any of them off.
**Reads:** header *Notifications* · status line at top, one of: *Reminders are on for this device.* / *Reminders are off. Turn them on in your device settings to get the times you set.* [*How*] / *Install Synapse to your home screen to get reminders on iPhone.* [*How*] / *Reminders aren't turned on yet.* [*Turn on reminders*] · then rows, grouped:
- *When an item starts* — *Fixed-time items, at the time you set* (N1) · *Calendar items, 10 minutes before* (N9, Phase 2)
- *Windows* — *When a window opens* (N2, Phase 2, default off) · *When a window is closing* (N3, Phase 2)
- *Reviews* — *Close out today* with a time value (N4; default 21:00) · *Yesterday's pending items, the morning after* (N5) · *Your week is ready* (N7, Phase 2)
- *Planning* — *Next week isn't planned yet* with a day-and-time value (N6; default Sunday 18:00)
- *While a timer runs* — *Show the running timer as a notification* (N8, Phase 2; a line *Not available on iPhone* on iOS)
- A closing line, not a control: *Nothing arrives after you've marked a day complete, and nothing is ever sent about missed items.*
**Interacts:** Turn on reminders → the in-context permission sheet (official spec §8.3) · each row a switch · time/day values → native pickers · How → a short instruction sheet per platform with no external links required.
**States:** permission granted / denied / not asked / unsupported (not installed on iOS) · offline (switches still toggle — they're preferences — with a note that they sync later; Phase 1 may disable).

### ST-08 Day & time
**Reads:** header *Day & time* · labels *Usual wake time* (helper *Used as the start time for new templates.*) · *Wake-up habit* (value: the flagged habit or *None*; helper *Marking it done sets the day's wake time. Set this on a habit.*) · *Day closes at* (helper *Anything undone at this time waits for you to review. Nothing is marked missed on its own.*) · *Review reminder* (mirrors N4's time; helper *Also under Notifications.*) · *Time zone* · footer *Save changes*.
**Interacts:** Usual wake time (time picker) · Wake-up habit (link → LB-01 filtered to Habits; choosing opens LB-02 with the switch focused) · Day closes at (time picker; bounded 00:00–06:00 `[VESPER CALL]`; default 03:00, still the working default pending your confirmation) · Review reminder (time picker) · Time zone (select) · Save changes.
**States:** saving · error · offline.

### ST-09 Appearance
**Reads:** header *Appearance* · three radio rows *System* · *Light* · *Dark* · helper *Follows your device unless you choose.*
**Interacts:** selection applies immediately; no save button.

### ST-10 Your data
**Job:** make the two trust promises tangible.
**Reads:** header *Your data* · trust line (the same string and treatment) · section *Export* — body *Everything in your account as CSV files and one JSON file. Nothing is left out.* · button *Export everything* · after a request: *Preparing your export…* then *Your export is ready ({size}).* [*Download*] with a line *Links last for 24 hours.* · section *Delete account* — body *This removes your account and every item, day, and note in it. There's no undo.* · text button *Delete account and all data* → ST-10a.
**Interacts:** Export everything (secondary; disabled while preparing; the result persists on the screen until downloaded or expired) · Download (opens the file) · Delete account and all data → ST-10a.
**States:** idle · preparing · ready · expired (*That export has expired.* [*Export again*]) · error (*Couldn't prepare the export. Try again.*) · offline (Export disabled).

### ST-10a Delete account
**Reads:** title *Delete your account?* · body *Type* **delete** *to confirm. Everything is removed straight away.* · label *Confirm* · footer *Cancel* · *Delete account* (the one destructive-styled control in the product).
**Interacts:** Confirm (text; the primary enables only when the value equals *delete*, case-insensitive) · Delete account → session ends → AU-01 with the line *Your account was deleted.* · Cancel.
**States:** deleting (both buttons disabled) · error (*Couldn't delete. Nothing was removed — try again.*) · offline (disabled).

### ST-11 Share the app
**Reads:** header *Share the app* · body *Synapse is free. Anyone you share it with gets their own private list — you can't see theirs and they can't see yours.* · the link shown as text · button *Share* (Web Share) / *Copy link* (fallback) · after copy: *Copied.* for 2 s.
**Interacts:** Share · Copy link. Nothing else — no counters, no contact import.

### ST-12 Calendar (Phase 2)
**Reads (not connected):** header *Calendar* · body *Connect Google Calendar to bring appointments in as fixed items. Nothing is written back.* · button *Connect Google Calendar*.
**Reads (connected):** *Connected as {email}* · section *Calendars* with a switch per calendar · section *Rules* — *Imported items count in your day's number* (switch, default on; helper *You accepted the appointment, so it's assigned.*) · *Skip all-day events* (switch, on, locked) · footer *Disconnect* (text) → dialog *Disconnect Google Calendar?* / *Imported items already on your days stay. Nothing new comes in.* — **Keep** · **Disconnect**.
**States:** not connected · connecting (OAuth) · connected · error (*Google didn't complete the connection. Try again.*) · offline.

---

## 8. Cross-screen interaction flows

### 8.1 Invite → first list (the friend path)
Share link → AU-02 (invite line shown) → AU-03 → email link → FR-01 → FR-02 (starter set) → FR-03 → FR-04 → FR-05 → List. Nine screens, one required judgement per habit, no permission prompts. Target: under ten minutes with the starter set; the sequence is resumable at every step.

### 8.2 Create a habit from inside a template
TP-02 → Add an item → TP-03 → Habit picker → *New habit* → LB-02 (create) → Save → returns to TP-03 with the habit selected, duration and priority prefilled → Save → TP-02 row appears.

### 8.3 Edit a template that's in use
TP-01 → TP-02 (header shows *Applied to 3 days this week*) → edits autosave → back → TP-04 → choice → caller shows *Applied to {n} days.* (or nothing if *Don't apply*).

### 8.4 Sunday build
N6 → WK-01 (next week) → targets line → tap Monday → WK-02 → pick template (marker on the most-behind) → Done → repeat, or *Copy last week* → adjust → back. Nothing is confirmed at the end; the week is planned as soon as one day is.

### 8.5 Change the wake anchor
ST-08 → Wake-up habit → LB-01 (Habits only) → LB-02 → switch on → line names the habit being replaced → Save changes → ST-08 shows the new value.

### 8.6 Leave and come back mid-setup
Any FR step → Finish later → List (empty state with *Plan this day* / *Add a one-off* and the resume line) → next launch: resume line → the same step with everything retained.

### 8.7 Turn on reminders at the right moment
TP-03 or WK-03 → Save with *At a time* for the first time on this account → permission sheet (*Want a reminder at 7:00 when this comes up? Reminders are only ever the times you set.* — **Turn on reminders** · **Not now**) → OS prompt → ST-07 reflects the result. *Not now* is remembered; the sheet never returns; ST-07's status line offers the switch.

---

## 9. Validation summary (every rule in one place)

| Field | Rule | Error copy |
|---|---|---|
| Email | required, RFC-ish format | *That doesn't look like an email address.* |
| Password (new) | ≥ 8 chars | *Passwords need at least 8 characters.* |
| Confirm password | equals new | *These don't match.* |
| Your name / Name (account) | 1–40 | *Add a name — it's just what the app calls you.* |
| Habit name | 1–60 | *Give it a name.* |
| Time range | ints 1–480, from ≤ to; required for Habit/Deep work | *"From" should be less than or equal to "to".* / *How long does it usually take? A rough range is fine.* |
| Importance | 1–7 selected | *Pick a number — 7 is most important.* |
| Quantity unit | ≤ 16 chars | — |
| Reflection axis | ≤ 24 chars, max 2 | — |
| Preflight note | ≤ 280 | — |
| Category name | 1–24, unique | *You already have a category called this.* |
| Template name | 1–40, required to leave create with slots | *Name this template.* |
| Weekly target | 0–7 | — |
| Slot start | required for At a time | — |
| Window | start < end; length ≥ Takes | *The window is shorter than the item.* |
| Takes | within habit range (snapped) | *Bounded to the habit's range.* |
| Same start | must be multitask or moved | inline question, no error state |
| One-off title | 1–60 when *Just a title* | *Give it a title.* |
| Reason label | 1–40, unique | *You already have this reason.* |
| Delete confirm | equals "delete" | (button stays disabled; no error) |
| Day closes at | 00:00–06:00 | — |

---

## 10. Autosave, undo, and dirty-state rules
- **Form sheets** (LB-02, CT-02, TP-03, WK-03, ST-06a, ST-01, ST-08) save on the primary; dirty + leave → *Discard changes?* — **Keep editing** · **Discard**.
- **Canvases** (TP-02, WK-01, WK-02) autosave per change; header status *Saving… / Saved / Not saved — retrying*; no discard prompt; destructive row actions get a 5-second undo toast instead of a confirmation, except archive and delete, which confirm.
- **Toasts** are used only for undo; never for success on a save that returns the person to a list where the result is visible.

---

## 11. Empty, loading, error, offline — the four states, per screen family
- **Lists** (LB-01, TP-01, CT-01, ST-06, WK-01): empty = one sentence + one or two actions; loading = row skeletons; error = *Couldn't load. Pull to try again.*; offline = readable, writes disabled with the standard line.
- **Sheets:** empty = the blank form; loading = primary disabled with inline spinner; error = field or form line, form intact; offline = primary disabled with the standard line.
- **Sequences (FR):** never empty (each step has its own content); loading on the primary; error inline; offline disables the primary and says so.
- **Canvases:** empty = one sentence + one action inside the canvas; loading = skeleton; error = header retry status; offline = read-only.

---

## 12. Interaction inventory (input to the UI component list)

Every control type this epic uses, with where it appears. The UI designer's component list should cover exactly these and nothing this epic doesn't need.

| Control | Appears in |
|---|---|
| Text input (single line, with maxlength, optional inline error) | AU-01/02/04/05, LB-02, CT-02, TP-02 (inline name), TP-03 (search), WK-03, ST-01, ST-06a, ST-10a |
| Email input · Password input with show/hide | AU-*, ST-01 |
| Textarea (280) | LB-02 |
| Numeric input pair (from/to, min) | LB-02 |
| Minutes stepper (bounded, step 5) | TP-03, WK-03 |
| 1–7 stepper (seven segments, number-labelled, end captions) | LB-02, TP-03, WK-03 |
| Small integer stepper (0–7) | TP-02 target |
| Segmented control (2–3 options with helper line) | LB-02 type, TP-03 when/timing, WK-03 when/timing |
| Switch with helper | LB-02 wake anchor, ST-07 rows, ST-12 rules |
| Radio rows with descriptions | ST-06a counts-as, ST-09 |
| Chip picker, single-select, with "+ New" | LB-02 category |
| Weekday chips, multi-select | TP-02 usually |
| Colour swatch row (8, labelled) | CT-02, LB-02 icon tint |
| Icon picker (3-tab: emoji / curated / image) with crop | LB-02, ST-01 (image tab only) |
| Searchable picker list, grouped, with "New …" row | TP-03 habit, WK-03 what, WK-02 template |
| Native time picker field · timezone select | FR-01, TP-02/03, WK-02/03, ST-07/08 |
| List row (icon · title · meta · overflow) with optional chip and mark | LB-01, TP-01, CT-01, ST-06, FR-02 |
| Slot row (template) with multitask bracket | TP-02 |
| Day row (week build) · Day sheet preview row | WK-01, WK-02 |
| Group heading · collapsed "Archived (n)" section · disclosure ("More") | LB-01, TP-01, LB-02 |
| Inline question row (two actions) | TP-02 collision, TP-03 save |
| Confirmation dialog (title, body, two actions) · destructive variant (typed confirm) | archive/delete/remove/sign-out/copy-week, ST-10a |
| Three-option dialog | TP-04 |
| Bottom sheet / side panel container with title and footer | all sheets |
| Step frame (progress label, back, Finish later, primary, Skip) | FR-* |
| Header with back, title, action, autosave status | most screens |
| Status line (offline / permission / setup-incomplete) | many |
| Undo toast | TP-02, WK-01 |
| Trust line | AU-01/02, ST-10, ST-11 |
| Avatar (initials / image), 32 and 64 | shell header, ST-00, ST-01 |
| Skeleton row · skeleton block | all lists and canvases |
| Primary / secondary / text / destructive buttons; full-width OAuth button | everywhere |

---

## 13. Open items carried from this pass
1. Day close time bound (00:00–06:00) and the 03:00 default — still awaiting your one-line confirmation.
2. Whether first-run FR-04 should target next week when today is Saturday — my call, cheap to flip.
3. The exact ten starter habits and their suggested numbers — mine; edit freely, the mechanism doesn't care.
4. Calendar import "counts in the number" default — on, per the official spec's open item.

## 14. Sign-off
Vesper — every screen in this epic has its job, its reads, its interacts, its four states, and its exit. Nothing here reaches into execution mode except through the two doors the official spec allows. Ready for the UI component list.
