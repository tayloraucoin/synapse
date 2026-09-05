# Synapse — UI Component Needs & Design→Dev Handoff List

**Author:** Vesper (UX), prepared as the joint UI/UX working document
**Date:** 4 Sept 2026
**Inputs:** official UX spec v1 (§9 brand, §9.7 components); Epic 1 §12, Epic 2 §11, Epic 3 §9, and the cross-cutting §12 inventories; shadcn/ui's current catalogue (verified today against ui.shadcn.com).
**Outputs:** (1) per-screen UI needs with shorthand ideas for every non-standard element; (2) what shadcn gives us and what it doesn't; (3) the directory convention; (4) the full component list with handoff detail.
**Status of items 3 and 4 (Conscious Connections):** the repo at `/Users/taylor/lighthouse/conscious-connections` is on your machine and this environment can't read it. §3 proposes the convention I'd expect from your Next.js/Turborepo/shadcn setup; every path in §5 is written against it and marked `[re-slot to CC convention]`. Paste `tree components -L 2 -I node_modules` (or the equivalent for the app package) and I'll re-slot in one pass.

---

## 1. Method and rules

- **shadcn is the base, not the ceiling.** Every component here is either (a) a shadcn primitive used as installed, with only token values changed via the CSS variable map, or (b) a composite built from those primitives. There are no parallel primitives. If a shadcn component is nearly right, we compose over it rather than fork it.
- **One component, one contract.** Each entry states what it is for, what it's built from, its props/variants, its states, its tokens, its sizes, its accessibility, its motion, and where it's used. If a component appears on two screens with different behaviour, it's two variants of one component, not two components.
- **Non-standard means: no shadcn primitive does this.** For those, the per-screen list in §4 gives two or three shorthand directions; §5 fixes one.
- **Tokens by name only.** No hex in this document; the scales are in the official spec §9.3. Names used: `paper`, `ink`, `neutral-{n}`, `accent-{n}`, `violet-{n}`, `cat-{key}-{n}`, `destructive`.
- **Both themes, always.** Every component is specified in light and dark by token, never by colour.
- **Sizes** are stated in px for targets and rem for type, matching the official spec §9.4–§9.5.

---

## 2. What shadcn/ui already gives us (verified 4 Sept 2026)

shadcn's current catalogue, grouped by whether Synapse uses it. Names are the CLI names (`npx shadcn@latest add <name>`). The registry now ships two bases — Radix and Base UI — `[VESPER CALL: stay on Radix; it's what CC already uses, and nothing here needs Base UI's differences]`.

### 2.1 Use as installed (token overrides only)
`button` · `button-group` · `input` · `input-group` (prefix/suffix — used for the minutes unit and the password show/hide) · `textarea` · `label` · `field` (label + control + helper + error in one contract — this replaces most of our hand-rolled form rows) · `checkbox` · `radio-group` · `switch` · `native-select` (timezone on compact) · `combobox` (timezone on wide, searchable pickers) · `command` (the searchable grouped list inside pickers) · `select` · `sheet` (wide right panel) · `drawer` (compact bottom sheet, Vaul) · `dialog` · `alert-dialog` (confirmations) · `popover` (target/usually editors in the template header) · `dropdown-menu` (row overflow) · `tabs` (icon picker's three tabs only — not the app tab bar) · `collapsible` (More, Archived, Reflections, Done) · `toggle-group` (segmented controls, weekday chips, the 1–7 stepper's base) · `separator` · `skeleton` · `spinner` · `sonner` (undo toasts) · `avatar` · `badge` (category chip base, state word base) · `tooltip` (strip squares, wide only) · `kbd` (shortcut list) · `empty` (all empty states) · `item` (the generic list row — our `ListRow` is a thin wrapper) · `scroll-area` (sheet bodies, the schedule) · `sidebar` (the wide rail — used in its non-collapsible mode) · `progress` is installed for the export "preparing" state only.

### 2.2 Installed but constrained
- `button`: variants used are `default` (ink fill), `secondary` (outline), `ghost` (text), `destructive` (one place). The accent never fills a button — enforced by not defining an accent variant.
- `badge`: used only as the base for `CategoryChip` and `StateWord`; never as a count.
- `alert`: installed, used for nothing on the tabs; permitted in Settings only if a future need arises. The status line is not an Alert.
- `tabs`: not the app navigation. The app tab bar is a custom `TabBar` because shadcn Tabs is a content switcher, not a bottom navigation with safe-area handling and a presence dot.

### 2.3 Not used
`accordion` (Collapsible covers it with less chrome) · `breadcrumb` · `navigation-menu` · `menubar` · `context-menu` · `hover-card` · `slider` (we use steppers; sliders fail the 44px-target and precise-value tests) · `calendar` / `date-picker` (native time pickers; the only date field is the one-off's day, which uses native `type=date`) · `input-otp` · `carousel` · `aspect-ratio` · `table` / `data-table` (nothing tabular enough) · `chart` (the category bar is one div, not Recharts) · `pagination` (history uses "Show earlier weeks") · `resizable` · `toast` (Sonner instead) · `typography` (we set our own scale) · `direction` (no RTL in v1).

### 2.4 What shadcn does not have, which we build
A native-time field with our formatting · a 1–7 stepper · a bounded minutes stepper · a from/to range pair · a three-tab icon picker with crop · a bottom tab bar · a status line · a responsive sheet-or-drawer wrapper (the "credenza" pattern — we write our own, thin) · the item row · the schedule axis, now line, blocks, ghosts, bands · the timer control · the growing three-step sheet · the habit strip · the big-number-with-sentence · the category bar · the step frame. All in §5.

---

## 3. Directory convention `[PENDING — re-slot to Conscious Connections once its tree is pasted]`

Proposed, on the assumption CC follows the common Next.js + shadcn layout inside a Turborepo app package (`apps/web` or similar):

```
apps/web/src/
  components/
    ui/                 shadcn primitives, installed by CLI, never hand-edited except the CSS variable map
    shell/              AppShell, TabBar, Rail, AppHeader, StatusLine, ScreenFrame
    forms/              Stepper17, MinutesStepper, RangeInput, NumberUnitInput, SegmentedControl,
                        ChipPicker, WeekdayChips, ColorSwatchRow, IconPicker, TimeField,
                        TimezoneSelect, PickerList, PasswordInput
    lists/              ListRow, GroupHeading, ArchivedSection, CategoryChip, ItemIcon,
                        InlineQuestionRow, ConfirmDialog, DiscardDialog, ResponsiveSheet, UndoToast,
                        SkeletonRow, SkeletonBlock, EmptyState, TrustLine
    day/                ItemRow, MultitaskGroup, DayPartHeader, DayHeader, StateWord, TimeText,
                        ExpanderSection, TimerControl, TimerDisplay, SessionRow, ItemSheet,
                        ShiftSheet, TrimSheet, QuickChipRow, OverflowCutList
    schedule/           ScheduleAxis, NowLine, ScheduleBlock, WindowSpan, GhostBlock, ShiftBand,
                        ShiftDetailSheet
    setup/              StepFrame, StarterSetChooser, HabitForm, TemplateEditor, SlotRow, SlotSheet,
                        ApplyChangesDialog, WeekGrid, DayRow, DaySheet, OneOffSheet, ReasonSheet,
                        CategorySheet
    review/             ReviewRegion, DecisionPanel, TierRadioRows, ReasonChips, TradedUpPicker,
                        DecidedLine, ReflectionBlock, BigNumber, FormulaSentence, FactLine,
                        HabitStrip, StripSquare, TemplateUsageRow, CategoryBar, DayOutcomeRow,
                        WeekRow
    system/             InstallSheet, SyncIssuesSheet, SessionExpiredDialog, ErrorPage,
                        FeedbackForm, ShortcutsDialog, UpdateLine, TimezoneLine
  lib/tokens.css        the CSS variable map (light/dark) from official spec §9.7
```

Naming: PascalCase components, one component per file, `index.ts` barrels per folder, a `*.stories.tsx` beside each composite (if CC uses Storybook; otherwise a `/dev/components` route that renders each in all states). Where CC's convention differs — feature-first folders, `_components` under routes, a `shared/` split — the §5 entries carry a `Folder:` line to update and nothing else changes.

---

## 4. Per-screen UI needs

Format per screen: **standard** (shadcn as-is) · **composed** (ours, from primitives) · **non-standard** with two or three shorthand directions, and the pick noted `→`. Screen IDs refer to the epic documents.

### 4.1 Auth (AU-01…06)
- Standard: `field` + `input` (email), `button` (primary, secondary full-width Google, ghost links), `spinner` inline, `separator` with the word *or*.
- Composed: `PasswordInput` (input-group with a show/hide suffix that is a real button with text "Show"/"Hide"), `TrustLine`, `AuthFrame` (wordmark, heading, form, footer — the same skeleton for all five).
- Non-standard: **Google button** — (a) shadcn secondary with the G mark at left and centred label; (b) full-width outline with the mark inset in a neutral-100 square; → (a), 44px, the mark 18px, no brand colour fill.

### 4.2 First run (FR-01…05)
- Standard: `button`, `field`, `native-select`/`combobox` for timezone.
- Composed: `StepFrame` (progress label, back, Finish later, body, Skip/primary), `TimeField`, `StarterSetChooser`.
- Non-standard: **progress label** — (a) text "Step 2 of 5"; (b) five hairline segments with the current one in ink; (c) both; → (a) only — the sequence is short and a bar reads as a funnel. **Starter set chooser** — (a) checkbox rows inside a Collapsible; (b) a sheet; (c) inline rows with the row itself as the toggle and a check mark at right; → (c), because the row shows three values and needs the width; selected rows get a hairline left edge in ink, not a fill.

### 4.3 Habit library (LB-01…03)
- Standard: `input` (search, with clear), `dropdown-menu` (overflow), `collapsible` (Archived), `empty`, `skeleton`, `alert-dialog` (archive).
- Composed: `ListRow` (over `item`), `GroupHeading`, `CategoryChip`, `ItemIcon`, `ArchivedSection`.
- Non-standard: **the row's two numbers** (*10–20 min · importance 6*) — (a) muted meta line under the title; (b) right-aligned tabular column; → (a) on compact, (b) on wide via a `layout` prop. **Wake-up mark** — (a) a small sunrise glyph before the title; (b) the word *wake-up* as a StateWord-style tag; → (b): words, per the copy rule that icons never stand alone.

### 4.4 Habit sheet (LB-02)
- Standard: `field`, `input`, `textarea`, `toggle-group` (type), `switch`, `collapsible` (More), `tabs` (icon picker), `button`.
- Composed: `RangeInput`, `Stepper17`, `ChipPicker`, `IconPicker`, `ResponsiveSheet`.
- Non-standard: **1–7 stepper** — (a) seven 44px squares in a row, selected filled ink, number as label, end captions *less/more*; (b) a horizontal radio with dots; (c) segmented ToggleGroup with 7 items; → (a) built on ToggleGroup `type=single`, wraps 4+3 under 360px. **Icon picker** — (a) inline three-tab panel below the icon field; (b) a nested sheet; → (a) inline within the sheet's scroll, collapsed until the icon field is tapped; the crop step uses a fixed 1:1 frame with pinch/drag (compact) or wheel/drag (wide), no rotation. **Curated icon tint row** — (a) the eight swatches plus *none* as a ToggleGroup; → that.

### 4.5 Categories (CT-01/02)
- Standard: `field`, `input`, `alert-dialog`, `empty`.
- Composed: `ColorSwatchRow` (ToggleGroup of eight 32px circles with 44px targets and visible names on focus/hover), `ListRow` with a swatch leading slot.

### 4.6 Templates (TP-01…04)
- Standard: `input` (inline name), `popover` (target, usually), `toggle-group` (weekday chips), `dropdown-menu`, `alert-dialog`, `dialog` (TP-04, three buttons stacked), `empty`.
- Composed: `TemplateEditor` (canvas), `SlotRow`, `SlotSheet`, `MinutesStepper`, `Stepper17`, `SegmentedControl`, `PickerList` (Command inside a Popover on wide / a Drawer on compact), `InlineQuestionRow`, `ApplyChangesDialog`.
- Non-standard: **autosave status** — (a) text in the header *Saved / Saving… / Not saved — retrying*; (b) a dot; → (a). **Slot row** — (a) a ListRow variant with a time column at left, ink; (b) time at right; → (a): time leads because the editor is read as a timeline; the title follows; duration, priority, and Fixed/Flexible trail as muted meta; the overridden mark is the word *overridden* in accent-600 at caption size. **Multitask bracket** — (a) a 2px ink line down the left of grouped rows with the word *multitask* above; (b) grouping in a bordered card; → (a): no cards on lists. **Totals footer** — (a) sticky at the bottom of the canvas, tabular, one line; → that. **Inline same-start question** — (a) a row between the two slots with the sentence and two ghost buttons; → that, no border, a neutral-100 background band.

### 4.7 Week build (WK-01…03)
- Standard: `button` (Previous/Next/This week), `alert-dialog` (copy week, remove), `collapsible` (day preview), `empty`.
- Composed: `WeekGrid`, `DayRow`, `DaySheet`, `OneOffSheet`, `PickerList` (templates), `TimeField`.
- Non-standard: **day row/column** — (a) rows on compact with weekday at left, template and start as two lines, one-off count as a tag; columns on wide with the same content stacked; (b) a 7-column grid on both; → (a) with a `layout` prop. **Targets line with the informational marker** — (a) a small accent-500 dot before the most-behind template's text; (b) the text in accent; → (a): one dot, nothing else, and the dot always sits with the words. **Past-day treatment** — 0.55 opacity like passed items, still tappable. **Today mark** — the word *Today* as a caption after the date, not a colour.

### 4.8 Settings (ST-00…12)
- Standard: `item` rows with description, `switch`, `radio-group` (appearance, counts-as), `avatar`, `field`, `input`, `alert-dialog`, `progress` (export), `native-select`.
- Composed: `SettingsRow` (ListRow variant with description and chevron), `TrustLine`, `NotificationRow` (switch + optional time value), `ReasonGroupHeading` (tier definitions as headings).
- Non-standard: **delete-account typed confirm** — a Dialog with an Input and a destructive button that enables on match; → that, the only destructive-styled control. **Notification status line** — the StatusLine component in its inline (non-shell) placement.

### 4.9 Shell (SH-00)
- Standard: `sidebar` (wide rail, non-collapsible), `avatar`.
- Composed: `AppShell`, `TabBar`, `Rail`, `AppHeader`, `StatusLine`.
- Non-standard: **tab bar** — (a) three equal word tabs, active in ink weight 500, inactive neutral-500, no icons, presence dot 6px accent-500 after *Review*; (b) icon+label; → (a). **Presence dot** — always paired with hidden text *items waiting*. **Status line** — (a) a full-width neutral-100 band with body text and an optional trailing text action or dismiss; (b) a floating pill; → (a): it's part of the page, not a notification.

### 4.10 Plain List (LS-00…03)
- Standard: `checkbox` (visual only — the row owns the 44px target), `collapsible` (expanders), `empty`, `skeleton`, `sonner`.
- Composed: `DayHeader`, `DayPartHeader`, `ItemRow`, `MultitaskGroup`, `StateWord`, `TimeText`, `ExpanderSection`.
- Non-standard: **item row** — (a) 56px min height, checkbox target the left 56px, 24px icon, title 1.125rem, state word + time right-aligned tabular, category edge 2px absolute left; (b) card per item; → (a): no cards. **Category edge** — 2px, full row height, `cat-{key}-500`, absent when uncategorised. **State word** — caption size, accent-600 for now/soon/open/closing, violet-600 for moved, neutral-500 for from-Thu/not-today/add-unit, with a 6px dot only for now/soon. **Inline undo** — the state-word slot shows *Done · Undo* as text for 5 s; no toast on the tab. **Quantity tail** — muted text after a middle dot. **Passed opacity** — 0.55 on the whole row except the checkbox target's hit area. **Day part heading** — 0.875rem, neutral-500, with the span in tabular. **Day Complete** — a ghost button at 1.125rem, ink, centred, 24px above the safe area.

### 4.11 Day header sheet, wake time (DH-01/02)
- Standard: `drawer`/`sheet`, `item` rows, `button`.
- Composed: `ResponsiveSheet` with `ActionRow`s, `TimeField`.

### 4.12 Item sheet (IT-01/02)
- Standard: `drawer`/`sheet`, `input` (quantity via input-group with unit suffix), `textarea`, `button`, `scroll-area`.
- Composed: `ItemSheet`, `TimerControl`, `TimerDisplay`, `SessionRow`, `Stepper17`, `CategoryChip`.
- Non-standard: **timer display** — (a) 2rem tabular digits, neutral-800, updating each second, with the control buttons beneath as a ButtonGroup; (b) a ring; → (a): no rings, no progress. **Timer control** — ButtonGroup of two: Start | (nothing) → Pause | Stop → Resume | Stop; labels change, positions don't. **Preflight note** — a quoted block: 2px neutral-300 left edge, italic off, neutral-600 text, label *Before starting* in caption above. **Session list** — muted rows with an *Edit* text action. **Footer** — right-aligned pair, *Not today* ghost, *Done* default; when done: single *Undo done* secondary.

### 4.13 Schedule (SC-01/02)
- Standard: `scroll-area`, `button` (earlier/later), `tooltip` (wide).
- Composed: `ScheduleAxis`, `NowLine`, `ScheduleBlock`, `WindowSpan`, `GhostBlock`, `ShiftBand`, `ShiftDetailSheet`.
- Non-standard: **axis** — (a) 48px left gutter, hour labels caption size neutral-500 at the hour line, 15-min hairlines neutral-200 (neutral-700 dark), 60px per hour, 15px per quarter; (b) 80px per hour; → 64px per hour, so a 15-minute item is 16px and readable as a hairline block with a tag. **Block** — (a) neutral-100 fill, 1px neutral-200 border, radius 6, icon+title inline at ≥32px, title only at 16–32px, hairline+tag under 16px; done: neutral-200 fill with a check glyph; moved: 1.5px violet-500 border; active: 1.5px accent-500 border; fixed: anchor glyph before the title; → that. **Window span** — neutral-50 with a dashed 1px neutral-300 outline the full window height; the block floats at its top until started. **Ghost** — outline only 1px neutral-300, title in neutral-400 with strikethrough, the word *planned* caption beneath the time. **Now line** — 1px accent-500 full width, 6px dot on the axis, time tag caption accent-600 at the right end; moves by re-render per minute. **Shift band** — 20px tall full-width band, violet-100 fill (violet-800 dark), violet-700 caption text; tappable. **Multitask** — blocks share the band width equally with 4px gutters. **Passed opacity** — 0.55 above the line.

### 4.14 Shift sheet (SF-01)
- Standard: `drawer`/`sheet`, `radio-group` (reasons, tiers), `checkbox` (Cut), `input` (custom minutes), `button`.
- Composed: `ShiftSheet` (growing), `LargeTargetRow` (the +15/+30/+60/Custom chooser), `TierRadioRows`, `OverflowCutList`.
- Non-standard: **large targets** — (a) four equal buttons in a row, 56px tall, ink outline, selected filled ink; → that; Custom reveals an input-group with *min* suffix beneath. **Growing steps** — each step's block appears beneath the previous with a 200ms height expansion; the step label *1 of 3* caption at the left of each block. **Overflow list with live tally** — rows with a Cut checkbox at right (the only right-side checkbox in the product), priority as a number tag, the tally line below in tabular; the primary label carries the count.

### 4.15 Trim sheet (TR-01)
- Standard: `input-group` (minutes), `button`.
- Composed: `TrimSheet`, `QuickChipRow` (−15/−30/−45/−60 as a ButtonGroup), trimmed rows as `ItemRow` variant `faded-with-action`.

### 4.16 Review index (RV-00) and History (HS-01)
- Standard: `item` rows, `collapsible` (week → days), `button` (Show earlier weeks), `empty`, `skeleton`.
- Composed: `ReviewRegion` (title, one-line status, one action), `WeekRow`, `DayOutcomeRow` (short form).

### 4.17 Day Review (DR-01…07)
- Standard: `radio-group` (tiers), `checkbox` none, `textarea`, `collapsible` (Done, Reflections), `button`, `drawer`/`sheet` (traded-up picker), `alert-dialog` (discard).
- Composed: `DecisionPanel`, `TierRadioRows`, `ReasonChips`, `TradedUpPicker`, `DecidedLine`, `ReflectionBlock`, `BigNumber`, `FormulaSentence`, `FactLine`.
- Non-standard: **decision panel** — (a) a bordered card per item; (b) a hairline-separated section with the identity line, then two 56px targets side by side (*Carry forward* secondary, *Missed* default-ink); → (b): the only place two large actions sit together, and they are equal weight visually with the ink one on the right; habits show *Missed* alone at full width. **Tier rows** — RadioGroup rows 56px, label at body size, definition beneath in caption neutral-500; selected row gets a 2px ink left edge, no fill. **Reason chips** — Badge-based ToggleGroup, single-select, wrapping; *Other* opens an Input beneath. **Decided line** — body text neutral-600 with the weight phrase in ink; *Change* ghost text at right. **Big number** — Newsreader 1.75rem (2.25rem on wide), ink, with the formula sentence beneath in Newsreader 1rem neutral-600; no colour, no icon.

### 4.18 Week Review (WR-01…04)
- Standard: `item` rows, `tooltip` (squares, wide), `collapsible` none, `skeleton`.
- Composed: `BigNumber`, `FormulaSentence`, `TemplateUsageRow`, `HabitStrip`, `StripSquare`, `CategoryBar`, `DayOutcomeRow`, `ShiftRow`.
- Non-standard: **habit strip** — (a) seven 16px squares with 4px gaps at the row's right, ratio after; (b) squares under the title; → (a) on wide, (b) on compact under 360px. **Square glyph states** — filled ink (done); filled with a 4px paper dot centred (done, moved); 1px outline (not counted); left-half filled (planned it wrong); 1px outline with a diagonal hairline (didn't do it); blank, no square (not assigned); dotted outline (pending). Each has an `aria-label`. **Category bar** — a single 12px-tall flex row of segments in `cat-{key}-500` with 1px paper gaps, radius full, legend list beneath with swatch, name, minutes, share; no labels inside segments.

### 4.19 System (SY-01…07)
- Standard: `textarea`, `switch`, `button`, `dialog`, `alert-dialog`, `kbd`, `table` is not used — the shortcut list is `Item` rows with a `Kbd` at right.
- Composed: `FeedbackForm`, `InstallSheet` (numbered steps as an ordered list), `SyncIssuesSheet`, `SessionExpiredDialog`, `ErrorPage`, `ShortcutsDialog`, `UpdateLine`, `TimezoneLine` (both StatusLine variants).

---

## 5. Component list — design→dev handoff

Each entry: **Purpose · Folder · Built from · Props/variants · Sizes · States · Tokens · A11y · Motion · Used in.** Entries for shadcn primitives used as installed are collapsed into §5.0. Everything after is ours.

### 5.0 shadcn primitives (installed, token-mapped, not modified)
`button` `button-group` `input` `input-group` `textarea` `label` `field` `checkbox` `radio-group` `switch` `select` `native-select` `combobox` `command` `sheet` `drawer` `dialog` `alert-dialog` `popover` `dropdown-menu` `tabs` `collapsible` `toggle-group` `separator` `skeleton` `spinner` `sonner` `avatar` `badge` `tooltip` `kbd` `empty` `item` `scroll-area` `sidebar` `progress`.
Global overrides, once, in `tokens.css`: `--radius: 6px`; the variable map from official spec §9.7; `font-variant-numeric: tabular-nums` on `body`; focus ring `2px accent-500, offset 2px`; `prefers-reduced-motion` disables all transform transitions; Button `default` = ink fill (`--primary`), no accent variant exists; Checkbox visual 20px, target extended by the parent; Sonner: bottom-centre, one at a time, 4 s, no icon, no close button, action button ghost.

### 5.1 Shell

**AppShell** — Purpose: the signed-in frame. Folder: `shell/`. Built from: `sidebar` (wide), `TabBar` (compact), `AppHeader`, `StatusLine`, a `main` landmark, a skip link. Props: `activeTab: list|schedule|review`, `title: ReactNode`, `subtitle?`, `dateContext?: {date, isToday}`, `zoneLabel?`, `statusLines: StatusLine[]` (rendered one at a time by priority). Sizes: header 56px; tab bar 56px + safe-area; rail 220px; content max 720/960px by `contentWidth: text|canvas`. States: online/offline (via status line), sheet-open (tab bar dimmed, `aria-hidden` on main). Tokens: `paper` bg, hairline `neutral-200/600`. A11y: landmarks per cross-cutting §3.4; skip link first in DOM. Motion: none. Used in: every signed-in route.

**TabBar** — Purpose: compact navigation. Folder: `shell/`. Built from: plain `nav` with three `a`/Link children; not shadcn Tabs. Props: `active`, `reviewHasPending: boolean`. Sizes: 56px + `env(safe-area-inset-bottom)`; each tab 44px+ target; label 0.875rem weight 500 active / 400 inactive. States: active, inactive, dimmed (under scrim, `pointer-events:none`). Tokens: active `ink`, inactive `neutral-500`, dot `accent-500` 6px with visually-hidden *items waiting*. A11y: `role=tablist` is wrong here (these are routes) → plain `nav` with `aria-current="page"`. Motion: none. Used in: SH-00 compact.

**Rail** — Purpose: wide navigation. Folder: `shell/`. Built from: `sidebar` fixed variant. Props: `active`, `reviewHasPending`, `user: {initials, image?}`. Sizes: 220px; rows 44px; wordmark 1rem weight 500 at top with 24px padding. States: active row (ink, weight 500, 2px ink left edge), hover (`neutral-100`), focus ring. Tokens: as TabBar. A11y: `navigation` landmark, `aria-current`. Used in: SH-00 wide.

**AppHeader** — Purpose: title, context, back, avatar. Folder: `shell/`. Built from: `button` ghost (back, avatar), `avatar`. Props: `title`, `subtitle?`, `back?: () => void`, `action?: {label, onClick}`, `saveStatus?: saved|saving|retrying`, `dateContext?`, `zoneLabel?`. Sizes: 56px; title 1.375rem weight 600 (the one h1); subtitle 0.875rem `neutral-500`. States: with back, without, with save status (caption right of title, `neutral-500`; retrying in `ink`). Tokens: bg `paper`. A11y: title is `h1`; back has label *Back*; avatar labelled *Settings*. Used in: all screens.

**StatusLine** — Purpose: one-at-a-time system/context message. Folder: `shell/`. Built from: `div role=status` + `button` ghost. Props: `variant: offline|syncing|syncIssues|setup|pending|late|update|timezone|install|permission`, `text`, `action?: {label, onClick}`, `dismissible?: boolean`, `placement: shell|inline`. Sizes: min 40px; padding 8/16; body 0.875rem. States: default, with action, with dismiss. Tokens: bg `neutral-100` (`neutral-800` dark), text `neutral-700` (`neutral-200`), action `ink` underline on hover. Never accent, never violet, never destructive. A11y: `role=status aria-live=polite`; dismiss labelled *Dismiss for today*. Motion: 120ms opacity in/out. Used in: SH-00, ST-07, cross-cutting SY-02/06/07.

**ScreenFrame** — Purpose: standard screen padding/width wrapper. Folder: `shell/`. Props: `width: text|canvas`, `padded: boolean`. Sizes: 16px compact / 32px wide padding; max 720/960. Used in: every screen.

### 5.2 Containers & feedback

**ResponsiveSheet** — Purpose: one API for compact bottom drawer and wide right panel. Folder: `lists/`. Built from: `drawer` (compact, Vaul) / `sheet` (wide, side=right). Props: `open`, `onOpenChange`, `title`, `subtitle?`, `footer?: ReactNode`, `size: default|tall` (compact 60%/90% max height), `preventCloseWhenDirty?: boolean` (routes close through `DiscardDialog`). Sizes: wide 420px; drag handle 32×4 `neutral-300`; footer pinned with safe-area padding. States: open, closing, dirty-guard. Tokens: surface `neutral-50` (`neutral-800`), scrim `rgba(21,20,18,0.4)`, shadow overlay-only. A11y: `aria-modal`, focus trap, initial focus per screen, focus return on close, Esc closes. Motion: 200ms settle; reduced-motion crossfade. Used in: every sheet in the four docs.

**ConfirmDialog** — Purpose: two-action confirmation. Folder: `lists/`. Built from: `alert-dialog`. Props: `title`, `body`, `confirmLabel`, `cancelLabel`, `destructive?: boolean` (only ST-10a), `typedConfirm?: string` (renders an Input; confirm enabled on match). Sizes: ≤320 compact / ≤420 wide. Tokens: confirm = `default` ink; destructive variant only when `destructive`. A11y: `alertdialog`, initial focus on cancel. Used in: archive/delete/remove/sign-out/copy-week/disconnect/ST-10a.

**DiscardDialog** — ConfirmDialog preset: *Discard changes?* — **Keep editing** · **Discard**. Used by every form sheet.

**ThreeOptionDialog** — Purpose: TP-04. Built from: `dialog` with three stacked `default`/`secondary`/`ghost` buttons. Props: `title`, `body`, `options: [{label, onSelect}]×3`, `busy`.

**UndoToast** — Purpose: the only toast. Folder: `lists/`. Built from: `sonner` with an action. Props: `text`, `onUndo`, `duration: 5000|10000`. Tokens: bg `neutral-800` (`neutral-100` dark), text inverted, action ghost. A11y: `polite`. Used in: LS-01, IT-01, SF-01, LS-00, TP-02, WK-01, IT-02.

**EmptyState** — Purpose: all empties. Built from: `empty`. Props: `text`, `actions: [{label, onClick}]` (1–3; the third is ghost). Sizes: text 1rem `neutral-600`; 24px gap. No illustration slot in v1. Used in: every list, LS-00.

**SkeletonRow / SkeletonBlock** — Built from: `skeleton`, no shimmer (`animate-none`). Sizes: row 56px with icon 24 and two bars; block = ScheduleBlock size. Tokens: `neutral-200` (`neutral-700`). Used in: all lists, SC-01, WR-01.

**TrustLine** — Purpose: the one privacy sentence. Props: none (text is fixed). Sizes: 0.75rem `neutral-500`, max 64ch. Used in: AU-01/02, ST-10, ST-11, SY-01.

### 5.3 Form controls

**Stepper17** — Purpose: every 1–7 rating and priority. Folder: `forms/`. Built from: `toggle-group type=single` + `field`. Props: `value: 1..7|null`, `onChange`, `label`, `helper?`, `error?`, `resting?: number` (shows the life default as a hollow ring when `value` is null — used for template overrides), `captions: boolean` (*less/more*), `required`. Sizes: seven 44×44 targets, 4px gaps; wraps 4+3 under 360px; number 1rem weight 500. States: unselected (1px `neutral-300` outline), selected (ink fill, paper number), resting (1px ink dashed outline), hover (`neutral-100`), focus ring, error (helper text in ink + 1px ink outline on the group). Tokens: as stated; never accent. A11y: `radiogroup`, arrow keys, number keys 1–7 select. Motion: 120ms fill. Used in: LB-02, TP-03, WK-03, IT-01, DR-06.

**MinutesStepper** — Purpose: bounded minutes. Built from: `input-group` (number input, *min* suffix, −/+ addon buttons). Props: `value`, `min`, `max`, `step: 5`, `onChange`, `boundedNote?: string` (shown on snap). Sizes: input 88px, addons 44px. States: at-bound (the relevant addon disabled), snapped (note appears 2 s). A11y: `spinbutton` with `aria-valuemin/max`. Used in: TP-03, WK-03.

**NumberUnitInput** — Purpose: numeric with trailing unit or preset chips. Built from: `input-group` (+ optional `ButtonGroup` for chips). Props: `value`, `unit`, `min`, `max`, `decimal?: boolean`, `chips?: [{label, delta}]`. Used in: IT-01 quantity, TR-01, SF-01 custom.

**RangeInput** — Purpose: from/to minutes pair. Built from: two `input` in a `field` with a shared error. Props: `from`, `to`, `onChange`, `required`, `error?`. Sizes: two 96px inputs, *to* label between, *min* after. Validation surfaced by the parent. Used in: LB-02.

**SegmentedControl** — Purpose: 2–3 option choice with a helper line. Built from: `toggle-group type=single` + a helper slot that changes with the value. Props: `options: [{value, label, helper}]`, `value`, `onChange`, `label`. Sizes: full width, 44px, equal segments; selected ink fill. A11y: `radiogroup`. Used in: LB-02 type, TP-03 when/timing, WK-03 when/timing, ST-09 could use it but uses RadioGroup for its descriptions.

**ChipPicker** — Purpose: single-select from labelled chips, with a create row. Built from: `toggle-group type=single` of `badge`-styled items + a ghost *+ New* chip. Props: `options: [{value, label, colorKey?}]`, `value`, `onChange`, `onCreate?`, `noneLabel`. Sizes: chips 32px tall, 44px target via padding, wrap. Tokens: category chip colours `cat-{key}-100/700` (`800/200` dark); selected gets a 1px ink outline. Used in: LB-02 category.

**WeekdayChips** — Built from: `toggle-group type=multiple` of seven 44×44 initials M T W T F S S with visually-hidden full names. Used in: TP-02.

**ColorSwatchRow** — Built from: `toggle-group type=single` of eight 32px circles (44px targets) in `cat-{key}-500`, selected = 2px ink ring at 2px offset, name shown on focus/hover as a tooltip on wide and beneath on compact. Props: `value: key|none`, `allowNone`. Used in: CT-02, IconPicker.

**IconPicker** — Purpose: emoji / curated icon+tint / image with crop. Folder: `forms/`. Built from: a trigger (48px icon well), `tabs` (three), emoji grid (a virtualised list of native emoji with `input` search), curated grid (~80 Lucide glyphs at 24px in 44px cells) + `ColorSwatchRow`, image tab (file input, `Cropper` — a small in-house 1:1 crop with drag/pinch, canvas export 256px), buttons *Use image* / *Choose another* / *Remove image*. Props: `value: {kind, value, colorKey?}`, `onChange`, `allowImage: boolean`, `imageOnly?: boolean` (ST-01 avatar). States: collapsed, expanded, uploading (Spinner in the well, parent Save waits), error. Tokens: well `neutral-100`, grid cells hover `neutral-100`. A11y: emoji cells labelled by name; curated cells by glyph name. Used in: LB-02, ST-01.

**TimeField** — Purpose: native time with our display. Built from: `input type=time` inside `field`, displayed value formatted per locale in tabular. Props: `value`, `onChange`, `min?`, `max?`, `label`, `helper?`. Sizes: 44px. Used in: FR-01, TP-02/03, WK-02/03, DH-02, IT-02, ST-07/08.

**DateField** — `input type=date` in `field`. Used in: WK-03 (Day) only.

**TimezoneSelect** — `combobox` on wide / `native-select` on compact, IANA list grouped by region. Used in: FR-01, ST-08.

**PickerList** — Purpose: searchable grouped list with a trailing *New …* row. Built from: `command` inside `popover` (wide) or `drawer` (compact). Props: `groups: [{heading, items: [{id, icon, title, meta}]}]`, `value`, `onSelect`, `createLabel?`, `onCreate?`, `emptyText`. Sizes: rows 48px; search 44px. A11y: Command's listbox semantics. Used in: TP-03 habit, WK-03 what, WK-02 template, ST-08 wake habit.

**TierRadioRows** — Purpose: the three tiers with definitions. Built from: `radio-group` with custom item layout. Props: `value`, `onChange`, `showChips: boolean`, `reasons: {tier: [reason]}`, `selectedReason`, `onReasonSelect`, `otherText`, `onOtherText`. Sizes: rows 56px; label 1rem; definition 0.75rem `neutral-500`. States: unselected, selected (2px ink left edge), chips revealed (200ms). A11y: `radiogroup`; chips are a nested ToggleGroup labelled *Reason*. Used in: DR-03, SF-01 step 2, ST-06a (without chips).

**ReasonChips** — `toggle-group type=single` of `badge`-styled chips, wrapping, with *Other* revealing an `input` (maxlength 80) and a ghost *Keep this reason*. Used in: DR-03.

**PasswordInput** — `input-group` with a suffix `button` ghost *Show/Hide* (text, not an icon), `autocomplete` per screen. Used in: AU-01/02/05, ST-01.

### 5.4 Lists & rows

**ListRow** — Purpose: the generic setup-list row. Folder: `lists/`. Built from: `item`. Props: `leading: ReactNode` (ItemIcon or swatch), `title`, `meta?: string|ReactNode`, `chip?: CategoryChip`, `tag?: string` (*wake-up*, *archived*, *default*), `trailing?: ReactNode` (chevron, overflow menu, text action), `layout: stacked|columns` (compact/wide), `muted?: boolean` (archived), `onClick`. Sizes: min 56px; title 1.125rem weight 500; meta 0.875rem `neutral-500`; 16px horizontal padding; hairline separator `neutral-200`. States: default, hover `neutral-100`, pressed, focus ring, muted 0.55. A11y: whole row is the button; trailing menu is a separate focusable. Used in: LB-01, TP-01, CT-01, ST-*, FR-02, LB-03, WR-03/04.

**ItemIcon** — Renders emoji (24px), curated glyph (Lucide 20px in a 24px box, tinted `cat-{key}-500` or `neutral-600`), or image (24px, radius 6). Props: `icon`, `size: 20|24|48`. Used everywhere an item appears.

**CategoryChip** — `badge` variant: `cat-{key}-100` bg / `cat-{key}-700` text (dark `800/200`), 0.75rem, 24px tall, name only. Used in: rows, sheets.

**GroupHeading** — 0.875rem `neutral-500` weight 500, 24px top / 8px bottom spacing, optional count. Used in: LB-01, TP-01, ST-06.

**ArchivedSection** — `collapsible` with heading *Archived (n)* and muted rows carrying a *Restore* ghost. Used in: LB-01, TP-01, ST-06.

**InlineQuestionRow** — Purpose: the same-start question. Built from: a `div` band with sentence + two ghost buttons. Tokens: bg `neutral-100`, no border. Used in: TP-02, TP-03 (replaces the footer), WK-03.

**SettingsRow** — ListRow preset with description meta and a chevron. **NotificationRow** — ListRow with a `switch` trailing and an optional inline `TimeField` value. **StarterSetChooser** — list of selectable rows (row is the toggle; check glyph at right; selected = 2px ink left edge) with a footer *Add {n} selected* / *Close*.

### 5.5 Day (List) components

**DayHeader** — Purpose: the tappable day title. Folder: `day/`. Built from: `button` ghost, full-width, left-aligned. Props: `date`, `templateName?`, `wokeAt?`, `shiftedMin?`, `zoneLabel?`, `isToday`, `onOpen`. Sizes: title 1.375rem weight 600; second line 0.875rem `neutral-500`. A11y: labelled *Day options*. Used in: LS-01, SC-01.

**DayPartHeader** — Props: `part: morning|afternoon|evening|anytime`, `span?: {start, end}`. Sizes: 0.875rem `neutral-500`, span tabular; 32px top spacing. Used in: LS-01.

**StateWord** — Purpose: the one-word state. Props: `state: now|soon|open|closing|moved|from|notToday|addUnit|updated|pending`, `text?` (for *from Thu*, *add pages*), `withDot: boolean`. Tokens: `accent-600` for now/soon/open/closing (dot `accent-500` 6px for now/soon only), `violet-600` moved, `neutral-500` others. Size 0.75rem weight 500. A11y: read as part of the row label. Used in: ItemRow, IT-01.

**TimeText** — Props: `mode`, `start`, `end?`, `actual?` (renders *7:20 → 4:32*), `elapsed?` (renders running time), `violet: boolean`. Tabular, 0.875rem, `neutral-600` (`violet-600` when moved). Used in: ItemRow, SlotRow, blocks.

**ItemRow** — Purpose: the execution row. Folder: `day/`. Built from: `checkbox` (visual) inside a 56px-wide target, `ItemIcon`, title, `StateWord`, `TimeText`, category edge, inline undo. Props: `item`, `variant: default|fadedWithAction|readOnly`, `state` (from the §5.9 matrix), `onToggle`, `onOpen`, `action?: {label, onClick}` (Bring back / Do it anyway), `undo?: {label, onUndo, ms}`. Sizes: min 56px; checkbox visual 20px centred in the left 56px; icon 24; title 1.125rem; right cluster tabular. States: all 14 from the matrix; opacity 0.55 for passed/deferred/faded; done title `neutral-600` with the check filled ink. Tokens: edge `cat-{key}-500` 2px; hover `neutral-100`; no borders. A11y: row `button` labelled "{title}, {time}, {state}"; checkbox labelled "Mark {title} done"; inline undo is a real button. Motion: check draws 120ms; nothing else. Used in: LS-01, LS-02/03 (faded variant), cross-cutting record/plan modes.

**MultitaskGroup** — Wrapper: 2px ink left line spanning members, the word *multitask* 0.75rem `neutral-500` above; members are ItemRows. Used in: LS-01.

**ExpanderSection** — `collapsible` with a heading line *{n} not assigned today* / *{n} cut when shifted*, an explanatory line, and faded ItemRows. Used in: LS-02/03.

**DayCompleteAction** — `button` ghost, 1.125rem ink, centred, 24px above safe area; hidden after close, replaced by a muted line with a *Review* link. Used in: LS-01.

**TimerDisplay** — 2rem tabular digits `ink` (`neutral-500` when idle at 00:00), updating each second via `requestAnimationFrame` throttled to 1 Hz; `aria-live=off`. **TimerControl** — `button-group` of two: [Start | —] → [Pause | Stop] → [Resume | Stop]; labels change, positions fixed; primary ink for Start/Resume, secondary for Pause/Stop. Props: `status: idle|running|paused`, handlers, `pauseEnabled` (Phase 2). Used in: IT-01, N8.

**SessionRow** — muted row *7:22–7:31 · 9 min* with an *Edit* ghost; manual sessions carry the word *by hand*. Used in: IT-01.

**ItemSheet** — Purpose: IT-01. Folder: `day/`. Built from: `ResponsiveSheet`, `ItemIcon`, `CategoryChip`, `TimeText`, `StateWord`, preflight quote block, `TimerDisplay`, `TimerControl`, `SessionRow`, `NumberUnitInput`, `Stepper17`, `textarea`, footer buttons, header *Edit* ghost (one-offs), footer *Remove* ghost (one-offs). Props: `item`, `mode: live|record|plan`, handlers. States: upcoming/active/paused/done/deferred/saving/error/offline; `record` hides *Not today*; `plan` is read-only with *Edit in week*. Used in: LS-01, SC-01, PN-*, cross-cutting §8.2.

**ActionRowSheet** — ResponsiveSheet preset of `item` rows (DH-01): title, subtitle, N action rows, *Close*. Used in: DH-01.

**ShiftSheet** — Purpose: SF-01. Folder: `day/`. Built from: `ResponsiveSheet size=tall`, `LargeTargetRow`, `NumberUnitInput`, `TierRadioRows` (reasons grouped by tier, no chips), `OverflowCutList`, footer. Props: `day`, `onShift`. States: step1/step2/step3-fits/step3-over/applying/error. Motion: each step block expands 200ms beneath the previous; reduced-motion appears instantly. Used in: SF-01.

**LargeTargetRow** — four equal `button` secondary at 56px, selected becomes `default`; Props: `options`, `value`. Used in: SF-01.

**OverflowCutList** — rows: ItemIcon, title, new time, duration, priority number tag, a right-side `checkbox` labelled *Cut {title}*; a tally line beneath in tabular; a second muted list *Already passed — will show as late*. Props: `items`, `cut: Set`, `onChange`, `over: number`. Used in: SF-01 step 3.

**TrimSheet** — ResponsiveSheet with `NumberUnitInput` (prefilled planned), `QuickChipRow`, a result block (*Fits in N min.* / *Nothing else is flexible. N min over.*), trimmed ItemRows `fadedWithAction` (*Keep instead*), footer *Cancel* / *Apply*. Used in: TR-01.

**QuickChipRow** — `button-group` of four secondary chips (−15/−30/−45/−60). Used in: TR-01.

### 5.6 Schedule components

**ScheduleAxis** — Purpose: the vertical time grid. Folder: `schedule/`. Built from: `scroll-area`, a positioned layer. Props: `start`, `end` (minutes from day start), `pxPerHour: 64`, `children` (absolutely positioned blocks/spans/ghosts/bands), `onExtend: earlier|later`. Sizes: gutter 48px; hour labels 0.75rem `neutral-500` at the hour line; 15-min hairlines 1px `neutral-200` (`neutral-700`); hour lines `neutral-300` (`neutral-600`); at 150%+ text scale `pxPerHour` 96 and 30-min hairlines. A11y: rows announced per 15-min band via `aria-rowindex`; blocks are focusable in time order. Used in: SC-01.

**NowLine** — 1px `accent-500` rule full width, 6px dot on the gutter, time tag 0.75rem `accent-600` at the right end; position recomputed per minute; hidden in record/plan modes; reads *closed* at the close time on closed days. Used in: SC-01.

**ScheduleBlock** — Purpose: an item in time. Built from: `button` unstyled. Props: `item`, `state`, `size: full|compact|hairline` (derived from height ≥32 / 16–32 / <16), `multitaskIndex?`, `multitaskCount?`, `onOpen`. Sizes: radius 6; padding 4/8; icon 20; title 0.875rem weight 500; time 0.75rem tabular. States: upcoming (`neutral-100` fill, 1px `neutral-200`), passed (0.55), active (1.5px `accent-500`), done (`neutral-200` fill + check), moved (1.5px `violet-500` + *moved* 0.75rem `violet-600` top-right), fixed (anchor glyph 14px before title), calendar (calendar glyph), hairline size (2px ink rule with the title in a 0.75rem tag to its right). A11y: label "{title}, {start}–{end}, {state}". Used in: SC-01.

**WindowSpan** — absolutely positioned span: `neutral-50` fill (`neutral-900` dark), 1px dashed `neutral-300` outline, radius 6; not focusable. **GhostBlock** — outline 1px `neutral-300`, title `neutral-400` strikethrough, *planned* 0.75rem beneath; focusable, opens the live item's sheet. **ShiftBand** — 20px band, `violet-100` (`violet-800`), text 0.75rem `violet-700` (`violet-200`), `button`, opens ShiftDetailSheet. **ShiftDetailSheet** — ResponsiveSheet of read-only lines + conditional *Undo this shift* ghost.

### 5.7 Setup canvases and sheets

**StepFrame** — Purpose: first-run frame. Folder: `setup/`. Built from: `AppHeader` variant (progress caption left, *Finish later* ghost right, back), body, footer with optional *Skip for now* ghost and the primary. Props: `step`, `total`, `onBack`, `onFinishLater`, `onSkip?`, `primary: {label, onClick, disabled}`. Sizes: progress 0.75rem `neutral-500`; heading 1.375rem; body ≤64ch. Used in: FR-01…05.

**HabitForm** — LB-02 as a form: `field`s for Name, `SegmentedControl` type, `IconPicker`, `ChipPicker`, `RangeInput`, `Stepper17`, `collapsible` More (`input` unit, up to two `input` axes with *Add another*, `textarea`, `switch` wake anchor), footer. Props: `mode: create|edit`, `initial`, `onSave`, `onCancel`, `inUseCount?`. States per Epic 1 LB-02. Used in: LB-02 via ResponsiveSheet, FR-02, TP-03→, WK-03→.

**TemplateEditor** — Purpose: TP-02 canvas. Built from: `AppHeader` (inline name `input`, save status), a settings line of three `popover` triggers (Starts at → `TimeField`; Target → small stepper 0–7; Usually → `WeekdayChips`), `SlotRow` list, `InlineQuestionRow`, add button, sticky totals footer, *Manage habits* link. Props: `template`, `onChange` (autosave), `inUseDays?`. Sizes: canvas width 960 wide; rows 56px; totals footer 44px tabular. States: create/edit/saving/saved/retrying/offline/in-use. Used in: TP-02, FR-03 (embedded: no AppHeader, name field inline in the step body).

**SlotRow** — ListRow variant: time column at left (tabular 0.875rem `ink`, 64px), `ItemIcon`, title, meta (*15 min · 6 overridden · Flexible*), multitask bracket via `MultitaskGroup` reuse, overflow `dropdown-menu` (Move up/down, Duplicate, Remove). Props: `slot`, `resolvedPriority`, `overridden`, `grouped`, `onOpen`, `menu`. Used in: TP-02.

**SlotSheet** — TP-03: `ResponsiveSheet` with `PickerList` (Habit), a muted line of the habit's range/importance, `SegmentedControl` When, `TimeField`(s), `MinutesStepper` Takes with *Edit range* ghost, `Stepper17` with `resting`, `SegmentedControl` Timing with helpers, footer, and the `InlineQuestionRow` that replaces the footer on same-start. Used in: TP-03.

**ApplyChangesDialog** — `ThreeOptionDialog` preset for TP-04.

**WeekGrid** — WK-01 canvas: header with Previous/Next/This week (`button` ghost), targets line (text with one 6px `accent-500` dot before the most-behind), the unplanned hint line, seven `DayRow`s, *Copy last week* ghost, *Templates* link. Props: `week`, `layout: rows|columns`. Used in: WK-01, FR-04.

**DayRow** — Props: `date`, `isToday`, `isPast`, `templateName?`, `anchor?`, `oneOffCount`, `onOpen`. Layout: compact = ListRow with weekday+date leading, two-line meta, count tag; wide = a 44px-wide column card-less cell with the same content stacked, hairline separators between columns. Past = 0.55. *Today* as a caption after the date. Used in: WeekGrid.

**DaySheet** — WK-02: ResponsiveSheet with `PickerList` (templates, with target status meta and the single dot), `TimeField` Starts at, One-offs `ListRow`s + *Add a one-off*, `collapsible` preview of read-only rows, footer *Remove template* ghost / *Done*. Used in: WK-02, LS-00 *Plan this day*.

**OneOffSheet** — WK-03: ResponsiveSheet with `PickerList` + *Just a title* toggle (`switch` styled as a text toggle) → `input`, `DateField` Day (when opened from the day header), `SegmentedControl` When, `TimeField`(s), `MinutesStepper` Takes, `SegmentedControl` Timing, `Stepper17`, footer; same-start handled by `InlineQuestionRow`. Used in: WK-03, DH-01, LS-00, IT-01 *Edit*.

**ReasonSheet** — ST-06a: `field` Reason `input`, `TierRadioRows` without chips, footer. **CategorySheet** — CT-02: `input`, `ColorSwatchRow`, footer.

### 5.8 Review components

**ReviewRegion** — Purpose: RV-00 region. Folder: `review/`. Built from: heading 1.125rem, status line 0.875rem `neutral-600`, one `button` (default or ghost). Props: `title`, `status`, `action?`. Used in: RV-00.

**DecisionPanel** — Purpose: DR-02/05. Built from: identity line (`ItemIcon`, title, `CategoryChip`, type word), time line, two 56px targets (`button` secondary *Carry forward*, `button` default *Missed*; habits: *Missed* alone full width), `TierRadioRows` with chips revealed beneath on *Missed*, `DecidedLine`, optional *Add a note* ghost → `textarea`. Props: `item`, `decision?`, `reasons`, `onDecide`, `onChange`, `mode: undecided|deciding|decided|pending|resolvedByShift`. Sizes: section separated by hairlines, 24px vertical padding; no card. Motion: chooser reveals 200ms. Used in: DR-01.

**DecidedLine** — 1rem `neutral-600` with the weight phrase in `ink` weight 500; *Change* ghost at right; optional second line *Changed from the shift's reason.* 0.75rem. Used in: DecisionPanel.

**TradedUpPicker** — ResponsiveSheet: title, body, rows (ItemIcon, title, *priority n*, *done 12:40* / *running*, verdict tail 0.75rem `neutral-500` right-aligned), last row *Something not on the list* → `input`, footer *Cancel*. Used in: DR-04.

**ReflectionBlock** — per item: ItemIcon + title, per axis a `Stepper17` (label above, no captions), `textarea` Note. Used in: DR-06, IT-01 reflection region (shared).

**BigNumber** — Purpose: the adherence number. Built from: `p` in Newsreader. Props: `value: number|null`, `size: day|week`. Sizes: 1.75rem compact / 2.25rem wide; `ink`; tabular. When null, renders nothing (the sentence carries *Nothing was counted today.*). **FormulaSentence** — Newsreader 1rem `neutral-600`, ≤64ch, the sentence assembled from counts (zero terms omitted). **FactLine** — Geist 0.875rem `neutral-600`, one per fact (off-schedule, by priority, shifts, carried, not assigned). Used in: DR-07, WR-01.

**TemplateUsageRow** — ListRow preset: name + *2 of 2* / *used 3* tabular trailing. Used in: WR-01.

**HabitStrip** — Purpose: WR-01 row. Built from: `button` row with ItemIcon, title, seven `StripSquare`s, ratio tabular. Props: `habit`, `days: StripState[7]`, `credit`, `counted`, `layout: inline|stacked`, `onOpen`. Sizes: squares 16px with 4px gaps (inline) / 20px (stacked); ratio 0.875rem. A11y: row label "{title}, {credit} of {counted} this week"; each square labelled "{weekday}, {outcome}". Used in: WR-01, WR-02 (larger, 24px).

**StripSquare** — Props: `state: done|doneMoved|notCounted|half|didntDo|notAssigned|pending`, `size`. Rendering: filled `ink`; filled with a 4px `paper` dot; 1px `neutral-400` outline; left-half `ink` fill with 1px outline; 1px outline with a 1px diagonal hairline; nothing rendered (a spacer); 1px dotted outline. Radius 2. Tooltip on wide. Never colour.

**CategoryBar** — 12px tall flex row, radius full, segments `cat-{key}-500` (uncategorised `neutral-300`) with 1px `paper` gaps; legend beneath as rows: 12px swatch, name, minutes tabular, share. Props: `segments: [{key, name, minutes}]`. A11y: `role=img` with a text summary; legend is the accessible content. Used in: WR-01.

**DayOutcomeRow** — weekday · scheduled time · outcome line (`neutral-600`, weight phrase in `ink`) · *· 9 min* · *· 24 pages*; long form in WR-02, short form (weekday · percent or state word) in HS-01. **ShiftRow** — weekday · *+60 min at 8:10* · reason · *cut 2*. **WeekRow** — `collapsible` trigger row with date range and percent/state, expanding to short DayOutcomeRows.

### 5.9 System components

**FeedbackForm** — `textarea` (1000), `switch` with helper, `button` Send, sent/error lines. **InstallSheet** — ResponsiveSheet with an ordered list of steps per platform (`ol`, 1rem, 16px gaps) and a *Done* footer; on Android, a *Install* default button when the prompt is available. **SyncIssuesSheet** — ResponsiveSheet of rows (ItemIcon, title, change words 0.875rem `neutral-600`, two ghosts *Try again* / *Discard*), footer *Try all again* / *Close*. **SessionExpiredDialog** — `dialog`, non-dismissable, one default button. **ErrorPage** — ScreenFrame with heading 1.375rem, body, one or two buttons; two copy variants. **ShortcutsDialog** — `dialog` listing `item` rows with `kbd` trailing. **UpdateLine / TimezoneLine / InstallLine** — StatusLine presets.

---

## 6. Counts and phasing

- shadcn primitives installed: 35.
- Ours: 9 shell/containers · 16 form controls · 9 list pieces · 17 day/list · 6 schedule · 12 setup · 13 review · 7 system = **89 composites**, of which the Phase-1 build needs 61 (everything outside `schedule/`, ShiftSheet, TrimSheet, OverflowCutList, LargeTargetRow, QuickChipRow, TimerControl's pause state, HabitStrip/StripSquare/CategoryBar, and the Phase-2 system lines).
- Every composite has a `Folder:` line to re-slot once CC's convention is confirmed; nothing else in this document changes.

## 7. What I need from you for items 3 and 4
Paste the output of `tree src/components -L 2 -I node_modules` from the CC app package (or the equivalent path), plus one representative composite file (any `*.tsx` outside `ui/`) so I can match your naming, export, and props conventions exactly. If CC has a `components.json`, paste that too — it tells me whether you're on the Radix or Base UI base and the alias style, which decides how §5.0 is installed.
