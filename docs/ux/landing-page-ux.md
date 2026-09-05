# Synapse — the landing page: UX handoff and copy deck

**Product:** Synapse · synapse.day
**Surface:** `/`, for a visitor who is not signed in. The one marketing page. Nothing else on the site exists.
**Authors:** Vesper (design) and Cantor (copy, `[HUMAN-HAND]`) lead. Hearth, Compass, and Sage append labelled reviews (§10–§12). Mason appends the placement ruling (§13) and writes the ticket, [`SYS-6-landing-page.md`](../specs/cross-cutting-system/SYS-6-landing-page.md).
**Date:** 2026-09-05
**Status:** Handoff for Taylor's mark-up. **Nothing is built.** Copy and layout stop here until approved.
**Authority above this document:** official spec §2, §9, §10, §11 (`habit_tracker_official_ux_spec_v1.md`); the value proposition §5.5 and §7 (`../product/value-proposition.md`); cross-cutting §2.1 and §3.4. Where this document and those differ, those win. `branding-guide.md` is orientation only and is not cited here.

> **How to read this.** §0–§8 are Vesper's handoff in the usual shape: frame, IA, the surface section by section, states, motion, accessibility. §9 is Cantor's copy deck, every string final, in the shape of `apps/web/content/landing.ts`. §10–§13 are the seats. §14 is the numbered decision log with status. §15 routes what is still open. A builder holding this document and SYS-6 should not need a call.

---

## 0. Frame

**Who is here, in what state.** A person who is not signed in. Two arrivals: a friend sent them `synapse.day` (the invite link itself lands on `/invite`, but people type the domain), or search brought them. Disposition on arrival, per the value proposition §1 and §6.3: curious, uncommitted, manipulation-literate, and probably worn by the category. They have read landing pages before and expect to be worked. Bandwidth is moderate: this is a considered read, not execution, but it is often a phone, one-handed, in the evening. The design budget is therefore *host* (cross-cutting §2.2's Planning budget, not Executing), with one hard limit from the product's own law: nothing on the page may plead.

**The one job.** Let a visitor understand, in one screen, what this is and what it refuses, and let a visitor for whom it is right start an account. Compass names the metric in §11.

**The emotional contract.** After the first screen the visitor should find it cheap to believe: *nothing here is trying to work me.* That is the same contract as official §2.3, turned outward. The page earns it by being made of the product: the picture is the List, the review, the plan, rendered by the product's own components, and the page's own voice is the notebook's with the door open (Cantor, §9.1).

**Surface, theme, voice.** A marketing surface inside the app's own frame (same root layout, same tokens, same `ThemeProvider`). Both themes, from the visitor's system preference. Host register, plain.

**What this page is not.** Not the app. Not a tour. Not a feature list, an FAQ, a pricing page, or a waitlist. It does not explain the whole product, and that is deliberate (Compass, §11).

---

## 1. Information architecture

One column, six parts, in reading order. The order is the messaging architecture (value proposition §7): the category frame and the promise first, then the three pillars each with a checkable proof, then the trust line under all three, then the door.

```
Header            wordmark · Sign in
Hero              h1 · lede · the live day (figure) · Create an account · note
Pillar 1          Decide once                      + a planned day (figure)
Pillar 2          Live the day without being managed + two done rows (figure)
Pillar 3          Close it honestly                + one decision and its arithmetic (figure)
Close             Only yours · Create an account · Sign in · the trust line
Footer            wordmark · Privacy · Terms (when SYS-3 lands)
```

There is no navigation, because there is nowhere else to go. There is no "How it works" section, because the three figures are how it works. There is no refusals section of its own: the refusals are pillar 2's proof, and a second list of them would be the page saying the same thing twice.

---

## 2. Layout

**The one breakpoint** is 768px (cross-cutting §2.1): compact below, wide at and above. Text scaling to 200% reflows within each layout; at 200% a 1440px window is 720 CSS px and simply becomes compact.

**The column.** `max-w-(--content-canvas)` (960px), centred with `mx-auto` — centred rather than left-aligned because there is no rail here to align to. Horizontal padding `px-(--space-4)` compact, `wide:px-(--space-6)`. Every paragraph is capped at `max-w-(--measure)` (64ch).

**Sections** are separated by a hairline (`border-t border-hairline`) and `py-(--space-7)` (48px, the top of the scale). There is no larger step; the page is as dense as the app and that is the point. Inside a section, the vertical stack is `flex flex-col gap-(--space-5)`.

**Compact:** one column. In the hero the order is h1 → lede → the live day → the primary action → the note, so the action comes after the proof. In each pillar: h2 → body → figure.

**Wide:** the hero and each pillar share one grid, `grid grid-cols-12 gap-(--space-6) items-start`: text in `col-span-5`, the figure in `col-span-7`. Text is always left, the picture always right; the page does not zigzag. In the hero on wide, the primary action and its note sit in the text column under the lede, and the live day is beside them, in view. The close section and the footer are single-column.

**Header:** `h-(--header-h)` (56px), `flex items-center justify-between`. The wordmark is text, `Text variant="body" weight={500}` reading *Synapse*, exactly as `AuthFrame` sets it (official §9.8: the mark is a placeholder and the wordmark is the name). On the right, *Sign in* as a `Button variant="ghost" size="md" asChild` around a `Link` to `signInRoute()`. The header does not stick.

**Footer:** `border-t border-hairline py-(--space-5)`, `flex flex-wrap items-center gap-(--space-4)`: the wordmark, then *Privacy* and *Terms* as text links to `legalPrivacyRoute()` / `legalTermsRoute()` once SYS-3 has shipped them. Until then the footer is the wordmark alone.

**Type.** Every piece of text is a `Text` (typography-guidelines). The h1 is `<Heading>` (1.375rem / 1.3, weight 600) and every section head is `<Heading as="h2">` at the same size, because that is the product's one heading size and the level is document structure. Body copy is `Text as="p" variant="body" tone="body"`. Captions on figures are `<Caption as="figcaption">`. Nothing is all-caps, nothing is tracked, no word is italic (official §9.4: no variant exists, so asking is being told no).

> **Decision 3 (see §14).** The h1 is the product's heading size, not a display size, and the hierarchy comes from space and the picture. There is no larger sans step on the scale, and inventing one for a single page is drift. If the built page reads too small at the top, the fix is a token proposal, not an inline size: `--fs-display` (2rem / 1.2, Geist 600) in `preset.css` and a `display` variant on `Text`, used only here. `[PROPOSED — Taylor decides after seeing it built]`

---

## 3. The surface, section by section

Strings are the keys in §9; the text below quotes them for reading flow.

### 3.1 Header

| Element | Component | Behaviour |
|---|---|---|
| Skip link | `<a href="#main">` with the shell's own sr-only/focus classes | First focusable element. *Skip to content.* |
| Wordmark | `Text variant="body" weight={500}` | *Synapse*. Not a link (it is the page). |
| Sign in | `Button variant="ghost" asChild` → `Link href={signInRoute()}` | 44px target. |

### 3.2 Hero

| Element | Component | Notes |
|---|---|---|
| h1 | `<Heading>` | *A private daily list.* The one `h1` on the page. |
| Lede | `Text as="p" variant="body" tone="body"` | Three sentences (§9.3). `max-w-(--measure)`. |
| The live day | `LiveDay` client leaf, inside `<figure>` | §4. |
| Caption | `<Caption as="figcaption">` | *An example day, at your local time.* |
| Primary action | `Button` (default, ink) `asChild` → `Link href={signUpRoute()}` | *Create an account.* The one ink button in the hero. Full width on compact; intrinsic width on wide. |
| Note | `<Meta as="p">` | *It's free. The first list takes about ten minutes.* Sits directly under the button, `gap-(--space-2)`. |

### 3.3 Pillar 1 — Decide once

| Element | Component | Notes |
|---|---|---|
| h2 | `<Heading as="h2">` | *Decide once* |
| Body | `Text as="p"` | §9.4 |
| Figure | `<figure>` containing `DayHeader as="p"` and an `<ol>` of three read-only `ItemRow`s | The header reads *Tuesday* / *Weekday* (`dateLabel="Tuesday"`, `templateName="Weekday"`, `mode="plan"`, no wake time, no `notUntilWeekday`, no `onOpen`). Rows: Run 7:00–7:40 AM · Writing 9:30–11:30 AM · Walk 3:00 PM, all `upcoming`, `variant="read-only"`, no checkbox. |
| Caption | `<Caption as="figcaption">` | *A planned day, before it starts.* |

`DayHeader` renders an `h1` when it has nothing to open. The page already has its `h1`, so the composite gains one prop: `as?: "h1" \| "h2" \| "p"`, default `"h1"`, applied to both branches (Decision 9). The landing passes `"p"`.

### 3.4 Pillar 2 — Live the day without being managed

| Element | Component | Notes |
|---|---|---|
| h2 | `<Heading as="h2">` | *Live the day without being managed* |
| Body | `Text as="p"` | §9.5 |
| Figure | `ExampleList` (the same leaf as the hero, `live={false}`) with two rows | Run 7:00–7:40 AM in state `done` (checkbox filled), and Stretch 8:15 AM in state `done-off-schedule`: the time in violet, the word *moved*. Both toggleable with the product's five-second inline undo. |
| Caption | `<Caption as="figcaption">` | *Two things done. One of them late.* |

### 3.5 Pillar 3 — Close it honestly

| Element | Component | Notes |
|---|---|---|
| h2 | `<Heading as="h2">` | *Close it honestly* |
| Body | `Text as="p"` | §9.6 |
| Figure | `ReviewFigure` client leaf: one `DecisionPanel` in `decided` state, then `BigNumber size="day"` and `FormulaSentence` | §5. |
| Caption | `<Caption as="figcaption">` | *Change the reason. The arithmetic follows.* |

### 3.6 Close — Only yours

Single column, `max-w-(--measure)`.

| Element | Component | Notes |
|---|---|---|
| h2 | `<Heading as="h2">` | *Only yours* |
| Body | `Text as="p"` | §9.7 |
| Actions | a `flex flex-wrap items-center gap-(--space-3)` row: `Button` default `asChild` → `Link signUpRoute()` *Create an account*; `Button variant="ghost" asChild` → `Link signInRoute()` *Sign in* | The second time the ink button appears on the page. One per screen holds: the hero's is off-screen by the time this one is reached on compact, and on wide the two are a full page apart. |
| Trust line | `<TrustLine />` | Once, verbatim, in its one treatment (the `Caption` the composite renders). Below the actions, `gap-(--space-4)`. It is the last thing in `main`. |

### 3.7 Footer

Wordmark; *Privacy* · *Terms* as `Text as="a"`-style links when their routes exist. `role="contentinfo"` comes from `<footer>` being outside `main`.

---

## 4. The live day (the hero figure)

The hero's picture is a day rendered by `DayPartHeader` and `ItemRow`, with the now line (the app mark's own motif, official §9.8) crossing it at the visitor's actual local time. It is quietly alive: the line moves by re-render on the minute (§9.6), nothing animates, and every state on every row is derived from the visitor's clock the way the List derives it.

### 4.1 The example day

Seven items, wall-clock times in the visitor's zone. Categories and glyphs are from the product's own sets (`CategoryKey`, the curated glyph names). The example person is nobody in particular; there is no name anywhere.

| # | Title | Type | Category (key) | Glyph | Time | Notes |
|---|---|---|---|---|---|---|
| 1 | Run | habit | Health (leaf) | `footprints` | 7:00–7:40 AM | |
| 2 | Stretch | habit | Health (leaf) | `sunrise` | 8:15–8:30 AM | **left undone** in the story: it is never in the done set |
| 3 | Writing | deep_work | Deep work (sky) | `pencil` | 9:30–11:30 AM | |
| 4 | Book the dentist | task_appointment | Admin (slate) | `phone` | 12:30–12:45 PM | origin `one_off` |
| 5 | Walk | habit | Health (leaf) | `tree-pine` | 3:00–3:30 PM | |
| 6 | Cook | habit | Home (clay) | `chef-hat` | 6:00–6:45 PM | |
| 7 | Read | habit | Quiet (plum) | `book-open` | 9:00–9:20 PM | |

Every item is `timeMode: "fixed_time"`, `scheduling: "soft"`, `origin: "template"` except #4, priority 3–6, `multitask: "none"`, no quantity, no timer. These are the shapes in `packages/ui/src/composed/__fixtures__/view-models.ts`, which is the pattern, not the import (Mason, §13).

**Day parts.** The product's rule (official §6.4) from a fixture wake anchor of **5:00 AM, never shown**: Morning 5:00–1:00, Afternoon 1:00–9:00, Evening 9:00 onward. Items 1–4 are Morning, 5–6 Afternoon, 7 Evening. The three `DayPartHeader`s render without their span, so the anchor stays a fixture and the picture carries no numbers beyond the items' times. `[REVISIT: when USE-1 lands a day-part helper in `@syn/utils`, the leaf's local arithmetic is replaced by it.]`

### 4.2 Structure

```
<figure>                         hairline frame, rounded-(--radius-sheet), ps-(--space-4), py-(--space-2)
  <DayPartHeader part="morning" />
  <ol>  ItemRow ×4  (+ the now-line slot when it falls here) </ol>
  <DayPartHeader part="afternoon" />
  <ol>  ItemRow ×2  (+ slot) </ol>
  <DayPartHeader part="evening" />
  <ol>  ItemRow ×1  (+ slot) </ol>
  <figcaption>
```

The frame is a hairline and nothing else: no fill, no shadow. The rows sit on the page's paper, the way they sit on the List. The frame is not `overflow-hidden`, because the now line's dot sits 12px outside its row and must land inside the frame's padding.

### 4.3 Deriving each row's state

Let `now` be the device clock, read through one `readNow()` function so it can be overridden for the three-clock check. Let `doneAtMount` be the set of items whose scheduled end was already past when the page hydrated, minus Stretch. Then, for each item, in order:

1. **Toggled by the visitor** → `done` if the toggle time is inside `[scheduledStart, scheduledEnd]`, else `done-off-schedule` (the word *moved*, the time in violet). Toggled off → fall through to the rules below.
2. **In `doneAtMount`** → `done`, `doneAt = scheduledEnd`.
3. **`scheduledEnd ≤ now`** → `passed` (faded, silent). This is the state Stretch always has once its window is gone, and the state any item takes if its window closes while the visitor is watching. Nothing ticks itself done in front of a person (Decision 6).
4. **`scheduledStart ≤ now < scheduledEnd`** → `now` (the accent dot and the word).
5. **`scheduledStart − 15 min ≤ now < scheduledStart`** → `soon` (official §6.2).
6. Otherwise → `upcoming` (silent).

### 4.4 The now line

`NowLine` from `@syn/ui`, rendered inside a zero-height `<li aria-hidden="true" className="relative h-0">` with `topPx={0}`, `atMin` set to minutes since day start, and `label` = `formatClock(now, zone)` (*3:12 PM*). The slot is inserted **after the last item whose scheduled end is at or before `now`**, in that item's `<ol>`; before the first row of the day if nothing has ended yet. Everything above the line is behind the visitor; the item in progress is always below it, carrying its own *now* word. Zero layout height, so its placement and its minute-by-minute movement never shift a row (Decision 5). Under reduced motion nothing changes: the line already moves by re-render only.

The line and the row's word are two carriers of the same fact. The line gives the time and is the motif; the word is the List's own law (official §5.2). Both stay.

### 4.5 The clock

The leaf reads `Intl.DateTimeFormat().resolvedOptions().timeZone` once and constructs the example day's instants as local dates for today. It ticks at the next minute boundary, then every 60 seconds, and re-reads the clock on `visibilitychange` because a backgrounded tab's timers are throttled. The zone and the date are the device's; the page never asks the server what time it is.

### 4.6 First paint and hydration

The server does not know the visitor's clock. It renders the same structure, all seven rows in `upcoming`, no now line, checkboxes unchecked. The client's first render is identical (the leaf's `now` state is `null` until its first effect), so there is no hydration mismatch; the first effect sets `now` and the states, the checked marks, and the line appear in one re-render. Nothing moves except opacity on the passed rows and the checkbox fill, and neither has layout. The picture is never wrong: a day with nothing ticked is a true day, just an early one.

Time strings are formatted with `formatClock` in the fixed `en-US` locale (the product's rule, `@syn/utils` `time.ts`), so the server's and the client's text agree byte for byte.

With JavaScript off the page shows that first-paint day and a caption that says it is an example. Acceptable.

### 4.7 Toggling

Every row has its checkbox (the `ItemRow` default variant with `onToggleDone`). A tap marks the example item done or not done exactly as the List would: the state slot shows *Undo* for five seconds (Epic 2 §0.1 rule 8) via `ItemRow`'s `undo` prop, then the state word returns. State lives in the leaf and resets on reload; nothing is stored. Marking the 7:00 Run done at 3:00 PM produces *moved*, because that is what the product would do. The row body does not open anything (`onOpen` is absent), so the body renders as a span, not a dead button.

**The checkbox draw-in.** Official §9.6 says the mark draws in over 120ms. The built `Checkbox` primitive transitions its colours over 120ms and renders the mark instantly (`transition-none` on the indicator). The landing page uses the primitive as it is and adds no animation of its own. `[REVISIT — @syn/ui, not this ticket: the mark's draw-in is not implemented in the primitive.]`

---

## 5. The review figure (pillar 3)

One `DecisionPanel` for Stretch, already decided, followed by the number and its sentence. The visitor can press *Change*, pick a tier (and a reason for tiers 1 and 2), and watch the arithmetic move. This is the product's real mechanic, on the product's real component, and it is the only place on the page where a percentage appears.

**Initial decision:** `kind: "missed"`, `tier: "circumstance"`, `reasonKey: "something_came_up"`, `reasonText: "Something came up"` (the panel prints `reasonText`, so the label is passed, not the key), `verdict: "not-counted"`. The decided line reads *Missed — Something came up · not counted* with *Change*.

**The rest of the example night is fixed** and only appears in the sentence: five done, one *didn't do*. The figure's arithmetic, by the visitor's choice for Stretch:

| Stretch decided as | Terms | Credit / counted | Percent |
|---|---|---|---|
| Something came up (not counted) | 5 done · 1 didn't do (0) · 1 something came up (not counted) | 5 of 6 | 83% |
| Planned it wrong (½) | 5 done · 1 planned wrong (½) · 1 didn't do (0) | 5.5 of 7 | 79% |
| Didn't do it (0) | 5 done · 2 didn't do (0) | 5 of 7 | 71% |

`percent = Math.round(credit / counted × 100)`. The `BigNumber` is never rendered without the `FormulaSentence` beneath it (Sage, §12).

**Reasons offered** (`reasons` prop): circumstance → *Something came up*, *Not feeling well*; scoping → *Earlier thing ran long*, *Slept in*; chose_not_to → none. *Stayed on something more important* is deliberately absent so `onTradedUp` can never fire. `ReasonChips` appends its own *Other* chip; `DecisionPanel` returns without deciding on *Other* until text exists, so the leaf passes `otherText` and `onOtherTextChange` through the panel's own props and decides with `reasonText = otherText` when the person leaves the field. `[Dev's call — see SYS-6.]`

`canCarry` is `false` (a habit cannot be carried), `timeZone` is `"UTC"` with the item's instants built in UTC (§13, the static-figure rule), `note` and `onNoteChange` are omitted so no *Add a note* appears.

**Copy note (Cantor).** The two em dashes in this figure are the product's own strings (`DecisionPanel` and `FormulaSentence` print them). The page's own copy carries none. The fourth term's label is the open item in §15: official §10.5's reference string says *excused*; §10.2 forbids it; the figure uses *something came up* until REV-2 rules.

---

## 6. States (exhaustive)

| State | What is on screen |
|---|---|
| **First paint (server)** | Header, hero text, the example day with every row `upcoming` and no line, the three pillars with their static figures, the review figure decided at 83%, the close, the footer. Theme already correct (§8). |
| **Hydrated** | States derived, done rows checked, passed rows at 0.55, the now line at the visitor's time with its label. |
| **Minute tick** | The line moves; `soon` becomes `now` becomes `passed` as the clock passes. The done set does not change. |
| **Visitor toggles a row** | Checkbox fills or clears, *Undo* in the state slot for five seconds, then the derived word. |
| **Visitor changes the decision** | The panel shows the tier rows; a tier (and reason) chosen returns it to decided; the number and sentence recompute. |
| **Reduced motion** | Identical. Both duration tokens are already 0ms; nothing on the page animates. |
| **Dark theme** | Every tone is a semantic token. The category edges and the now line are 500 in both themes by law. |
| **200% text** | Compact layout on any window under 1536px; rows truncate titles; the now-line label stays right-aligned; no horizontal scroll. |
| **Offline** | The page is a document: it is there or it is not. If it is, the clock still moves, because it is the device's. The actions lead to the auth screens, which carry their own offline line. No treatment here (Decision 10). |
| **JavaScript off** | The first-paint day, static. The checkboxes do nothing. |
| **Signed in** | Never shown: `/` runs the entry tree first (Mason, §13). |

**Failure and edge cases.** A visitor at 3:00 AM sees the whole day ahead, the line above Run, and *Evening* as the last section, which is true. A visitor whose device zone is unavailable falls back to `"UTC"` and sees the same day. A tab left open across midnight keeps yesterday's instants until reload; the line runs off the end of the day and stays there, which is honest enough for an example. `readNow()` is the only place the clock is read.

---

## 7. Motion

Two durations, one easing, and on this page almost nothing to apply them to.

- The now line moves by re-render on the minute. No transition.
- The checkbox: the primitive's 120ms colour transition. Nothing else on the row moves.
- Buttons and rows: the built hover colour transitions (120ms, `--ease-settle`).
- **No scroll-triggered reveals.** Vesper rules they do not earn it. The page's claim is stillness, and a section that fades in as the visitor arrives is the page performing (Decision 7).
- Reduced motion: designed by having nothing to remove.

---

## 8. Theme and time

**Theme** follows the visitor's system preference through the existing `ThemeProvider` (next-themes, `defaultTheme="system"`, class on `<html>`, the pre-hydration script, `suppressHydrationWarning` on `<html>` only). A person who is signed out and has a stored choice in this browser gets that choice, because the provider reads the same `syn:theme` key. The page adds no theme logic, sets no `dark:` colour utility, and never switches theme by the clock: time of day is shown by the now line and the day parts, not by the palette (Decision 2).

**Time** is the device's, read client-side, formatted in the fixed locale, as §4.5.

---

## 9. Copy deck (Cantor, `[HUMAN-HAND]`)

### 9.1 Register ruling

**The notebook's voice with the door open.** Not a separate host register. Same vocabulary (official §10.2), sentence case, plain, present, specific, no exclamation marks, no emoji, no *we*, nothing about the reader's character. Two things are looser than on the tabs: *you* is permitted (the ban is on the execution tabs, official §10.4), and a sentence may carry one more clause than a row would. The reason is the picture: the page is made of the List, and a host voice beside it would be two people talking. Logged as Decision 8.

### 9.2 The deck, in the shape of `apps/web/content/landing.ts`

```ts
export const LANDING_COPY = {
  meta: {
    /** 54 characters. True. */
    title: "Synapse · A private daily list. No streaks, no scores.",
    /** 125 characters. The value proposition's short version, said once. */
    description:
      "Plan the week once, live the day without being managed, close it honestly. No streaks, no scores, nobody watching. It's free.",
    siteName: "Synapse",
  },
  skipLink: "Skip to content",
  header: {
    wordmark: "Synapse",
    signIn: "Sign in",
  },
  hero: {
    heading: "A private daily list.",
    lede:
      "Plan the week once, on a Sunday, and the mornings are already decided. During the day nothing keeps score or nags. At night you say what happened and why, and the record keeps it as it was.",
    cta: "Create an account",
    note: "It's free. The first list takes about ten minutes.",
    figureCaption: "An example day, at your local time.",
  },
  pillars: {
    decide: {
      heading: "Decide once",
      body:
        "A template is a kind of day, written down once: the run at 7:00, the two hours of writing. Build the week from a few of them on Sunday and every morning already has its list, in time order, before you're awake enough to argue with it.",
      figureCaption: "A planned day, before it starts.",
    },
    live: {
      heading: "Live the day without being managed",
      body:
        "No streaks. No scores. Nothing red. Reminders only at the times you set, and none once the day is closed. If you run late the plan isn't rewritten. The late thing is marked moved, and the time it was meant for stays on the record.",
      figureCaption: "Two things done. One of them late.",
    },
    close: {
      heading: "Close it honestly",
      body:
        "At night, each thing you didn't do gets a reason, and the reason decides how it counts. Something that came up isn't counted. A plan that was wrong counts half. The number, when there is one, comes with its arithmetic beside it, so you can check it.",
      figureCaption: "Change the reason. The arithmetic follows.",
    },
  },
  close: {
    heading: "Only yours",
    body:
      "There's no one else in it. No feed, no coach. Export everything or delete everything, from one screen.",
    cta: "Create an account",
    signIn: "Sign in",
  },
  footer: {
    wordmark: "Synapse",
    privacy: "Privacy",
    terms: "Terms",
  },
  /** The example day's titles and category names live with the fixture, not here. */
} as const;
```

The trust line is not in this module. It is `TRUST_LINE_COPY.text` from `@syn/ui`, rendered by `TrustLine`, and is not repeated anywhere on the page: *Only you can see your data. Not the people who built this, not anyone you invite.*

OG title and description are `meta.title` and `meta.description`. There is no OG image (§15).

### 9.3 Read aloud, once

*A private daily list.* Four words, a stance, the category frame as the h1. *Plan the week once, on a Sunday, and the mornings are already decided.* Long. *During the day nothing keeps score or nags.* Short. *At night you say what happened and why, and the record keeps it as it was.* The three sentences are the three jobs (value proposition §1.1), which is the page's one triad, spent here. *before you're awake enough to argue with it* is the seam: one line a person wrote on an afternoon. *Two things done. One of them late.* Two fragments, a caption that could be a note in a margin. *Change the reason. The arithmetic follows.* An invitation that says what will happen, not what to feel.

### 9.4 The tell scan

- Em dashes authored by Cantor: **zero**. (Two appear inside pillar 3's figure; they are the product's own strings.)
- Triads: one, the lede, structural. Pillar 2's *No streaks. No scores. Nothing red. Reminders…* is four beats, from value proposition §7.2. *No feed, no coach* is a pair.
- *It's not X, it's Y*: none. *isn't rewritten* is followed by what happens instead, not by an antithesis.
- Parallel headings: the three pillar heads are §7.2's, imperative, deliberately alike; *Only yours* breaks the pattern.
- Rhetorical questions: none. Summary closers: none. Semicolons: none.
- Contractions: *you're*, *isn't*, *there's*, *it's*. Present.
- Sentence lengths in the lede: 15 · 9 · 19. In pillar 3: 17 · 6 · 7 · 19.
- Vocabulary: no *journey*, *space*, *intentional*, *meaningful*, *unlock*, *empower*, *transformative*, no fused adjective pairs, no generic empathy opener.
- Point of view: the page believes things and says them (*No streaks.* *There's no one else in it.*).

### 9.5 The law scan

- Official §10.4: no *you failed*, *you're behind*, *don't break*, *keep it up*, *great job*, *oops*, *unfortunately*, *we*. *Streak* and *score* appear only as refusals, which is how value proposition §7.2 uses them.
- Official §10.1: sentence case; full stops on sentences, none on labels (*Sign in*, *Create an account*, *Privacy*); no exclamation marks; no emoji.
- Value proposition §5.5: no timeline to a habit, no transformation or character claim, no *science-backed*, no *never miss again*.
- Value proposition §7.5 and §6.5: no social proof, no growth story, no comparison, no named competitor.
- The trust line: once, verbatim, in its one treatment.
- Every claim is cashed: *the mornings are already decided* (materialisation, official §4.5) · *nothing keeps score or nags* (§2.4 guardrail 8, Epic 2 §0.1 rule 7) · *the record keeps it as it was* (§2.4 guardrail 6) · *ten minutes* (Epic 1 §8.1's first-run target with the starter set, labelled *about*) · *Reminders only at the times you set, and none once the day is closed* (§8.1, §8.4) · *marked moved, and the time it was meant for stays on the record* (§5.3 ghost-and-annotate, `original_scheduled_start` immutable) · the three weights (§7.3, R1–R3) · *its arithmetic beside it* (R6) · *No feed, no coach* (§1.1 A4, §7.7) · *Export everything or delete everything, from one screen* (§7.6, ST-10).

### 9.6 The CTA ruling

**Create an account**, both times. The next screen is AU-02, whose heading is *Create an account* and whose button is *Create account*; official §10.3 says a button says what happens and the next screen reuses the verb. *Start your list* would land a person on an account form, which is a small lie at the exact moment they decided to trust the page. The feeling is carried by the line beneath the button, not by the verb. Logged as Decision 11.

---

## 10. Hearth — brand review

**The promise at stake:** *a private daily list that gives you back your attention during the day and the truth about it afterwards* (value proposition §7.1), told to a person at the start of the arc, who does not yet believe anything.

**Promise first.** The h1 is the category frame and the lede is the promise in the person's altitude. Nothing precedes it. ✓

**Three pillars, each with a checkable proof.** *Decide once* is proved by a planned day rendered by the product. *Live the day without being managed* is proved by the refusals stated as facts and by a row marked *moved* with its planned time kept. *Close it honestly* is proved by the tier mechanic the visitor can operate and the arithmetic printed beside the number. Each proof is a product fact, not an adjective. ✓

**The category frame held.** *A private daily list* is the h1, the title tag, and the meta description. *Habit tracker*, *productivity*, and *planner* appear nowhere. The comparison, where one is implied, is to a notebook (*the record*), never to an app. ✓

**The enemy as a pattern.** *No streaks. No scores. Nothing red.* names the pattern; no competitor is named or alluded to. ✓

**The never-tell list.** No transformation, character, streak, comparison, science-badge, or growth story. No *join thousands*. No later product implied. ✓

**Two audiences, one story.** The friend who sends the link could send this page without flinching: nothing to apologise for, no claim the product will not cash, and the invite line's own promise (*your list is private to you*) is the same promise the close section makes. ✓

**Findings.** *Blocking:* none. *Should-fix:* none. *Consider:* (1) The meta description's *nobody watching* is the value proposition's own phrase and reads as a refusal; keep it, but if Taylor hears surveillance in it, *no one watching* is the same claim in a softer key. (2) The close section's *There's no one else in it* is the strongest line on the page and is exactly the brand's thesis; do not let a future edit soften it into *private and secure*, which §10.2 rules out.

**The short ruling.** The promise is stated once at the top and proved three times by the product itself; the risk is a future hand adding adjectives; the call is ship as written.

---

## 11. Compass — the job, the metric, the one thing left undone

**The job in the first screen.** The lede states all three jobs (value proposition §1.1) in three sentences a person could repeat: decide once, live the day without being managed, close honestly. The h1 names the category. ✓

**Displacing the alternatives** (§1.3), each in the first screen: *doing nothing* by *the mornings are already decided* (every morning otherwise re-decides the day); *the streak app* by *nothing keeps score or nags*; *the calendar and the to-do list* by *the record keeps it as it was* (a missed block is not just gone). The notebook is not displaced; it is the cousin the page borrows its voice from. ✓

**Free, said once.** The note under the button. Official §4.1 keeps plans and tiers out of the product; the share copy (ST-11) already says *Synapse is free*, so the page may. ✓

**The page's one metric, defined and not wired:** *landing-to-account-start rate* — the share of visits that arrive at `/` signed out and reach AU-02 (`/signup`) in the same visit. Counted later, from server logs or a page event that carries no content. Never shown to anyone in the product. No analytics ship in SYS-6; the definition is recorded in the ticket so it is not re-invented.

**The one thing the page deliberately does not do:** it does not explain the whole product. No feature list, no tour of screens, no FAQ, no *how it works* beyond the three figures. A visitor who wants more creates an account, and the starter set (Epic 1 §8.1) is the tour. The subtraction is the point: every added section is one more thing for a wary person to be worked by.

**Displaced by this page:** nothing on the critical path. It sits outside the §12 launch set and is the front door to it.

---

## 12. Sage — reactance and endorsement pass

**The behaviour.** A visitor reads a page and, if the product fits the job they came with, starts an account. The goal is the visitor's own. The analysis proceeds.

**The persuasion mechanics on the page, graded:**

| Element | Mechanism | Grade | Endorsement test | Call |
|---|---|---|---|---|
| The live now line at the visitor's time | Truthful demonstration: the product is shown doing what it does. Not urgency: the line is a position, not a remaining-time. | Fact | A visitor who understood it would find it plain and a little charming. | Keep. |
| Toggleable example rows with the five-second undo | A taste of competence, and of the product's autonomy grammar (undo is easy, nothing is scored). No reward, no confetti, no count. | SDT autonomy/competence, replicated core in direction | Yes. Nothing is gained or lost by tapping. | Keep. |
| The 83% with its sentence | The product's own position on scoring (R6). Risk: at a glance a percentage reads as the enemy's grade to exactly this audience. | Fact about the product; the reactance risk is real | Yes, *if* the sentence is beside it and the visitor can change the reason and see the arithmetic move. Alone, no. | Keep, with two conditions: the `FormulaSentence` is never omitted, and the figure is interactive so the number is seen to be arithmetic, not judgment. |
| *It's free. The first list takes about ten minutes.* | Friction disclosure. | The ten-minute figure is Epic 1 §8.1's design target, not yet field-measured | Yes; *about* keeps it honest. | Keep. Re-check the number after first-run data exists. |
| *Create an account* | Asks exactly what the visitor came to do, or nothing. No scarcity, no countdown, no *maybe later* needed because there is no pressure to leave from. | — | Yes. | Keep. |
| The refusals in pillar 2 | Naming the pattern the audience has learned to detect. For a manipulation-literate reader this is the credibility signal (value proposition §5.4). | Reactance literature, replicated core in direction | Yes. | Keep. |

**Struck against §5.5:** nothing was drafted that §5.5 forbids. No timeline, no transformation, no badge, no *never miss again*.

**Claims graded against §5.2 and §7.4:** *the mornings are already decided* is the implementation-intention mechanism stated as a product fact, without a citation badge, which is how §7.4 says it may be said. *the record keeps it as it was* is self-monitoring's precondition, stated as a fact about the record. No effect size is claimed anywhere.

**Reactance check on the copy:** no second-person evaluation, no *you should*, no question the visitor did not come to answer, no urgency word. *before you're awake enough to argue with it* is about mornings, not about the reader's character. Pass.

**The short ruling.** The page's mechanisms are a truthful demo, a taste of the product's own autonomy grammar, and the honest naming of a pattern; the one reactance risk is the percentage, and it is contained by the sentence and the interaction beside it; the call is ship as written with the number never rendered alone.

---

## 13. Mason — placement ruling (summary; the ticket is SYS-6)

**Where `/` resolves.** `apps/web/app/page.tsx` stays the one file. It calls `resolveEntryForRequest()`; when that returns a destination there is a session and the page redirects exactly as today; when it returns `null` there is no session and the page renders the landing. `homeRoute()` is unchanged, no new route exists, and the `(auth)` layout's redirect of a signed-in person to `/` still lands them in the entry tree. Because the page reads cookies it renders dynamically; nothing about caching needs configuring.

**A Server Component with three client leaves.** The page composition is a Server Component. `"use client"` on line 1, in `apps/web/app/_components/landing/`, for exactly the things that need a browser: the example list (the clock, the toggles, the undo timers) and the review figure (the decision state machine). Both are route-local to `/`, so they live under `app/_components/` (placement rule 9), not under `apps/web/components/`.

**Copy** in `apps/web/content/landing.ts` (copy-conventions: surface prose lives in `content/`). The page's metadata is built from the same module.

**The fixtures.** `packages/ui/src/composed/__fixtures__/view-models.ts` is not exported from `@syn/ui` (enumerated exports; the file's own header says no component imports it), and its instants are fixed to Vancouver for story stability. The landing therefore defines its own example day in `apps/web/app/_components/landing/example-day.ts`, typed by `@syn/types` (`DayItemView`, `CategoryView`, `ReasonView`) so it is shaped exactly as the app will pass them. The brief's wording ("with the fixture view models") is honoured as the pattern, not the import. Logged in SYS-6.

**One `@syn/ui` amendment, no new component.** `DayHeader` gains `as?: "h1" | "h2" | "p"` (default `"h1"`) with a story, so a plan-mode header can appear on a page that already has its `h1`. Composing two `Text`s to imitate it would be the parallel component §9.7 forbids.

**No new package, no new dependency, no analytics, no font, no script, no pixel.** Everything the page loads, the app already loads.

**Two hydration rules the build must obey.** Static figures build their instants with `Date.UTC` and pass `timeZone="UTC"`, so the server and the client format the same bytes. The live figure builds local instants and reads the device zone, and renders with `now === null` on the server and the first client render.

---

## 14. Decision log

| # | Decision | Owner | Status |
|---|---|---|---|
| 1 | Section order: header · hero · three pillars (§7.2's order) · close with the trust line · footer. No refusals section of its own; the refusals are pillar 2's proof. | Vesper, Hearth | Settled |
| 2 | Theme follows the system through the existing provider; the page never switches theme by the clock. Time of day is carried by the now line and the day parts. | Vesper | Settled (binding requirement, confirmed) |
| 3 | The h1 is `<Heading>` at the product's heading size. No display size is invented. If it reads too small built, the remedy is a `--fs-display` token proposal, used only here. | Vesper | `[PROPOSED — Taylor, after seeing it built]` |
| 4 | **Newsreader appears only where the product itself uses it:** the review arithmetic in pillar 3. The h1 and every line of page copy are Geist. A serif hero would give the page a voice the product's interface never has, and would be the most generic considered-SaaS move available. We lose editorial warmth at the top; we gain a page that looks like the thing it describes. | Vesper | Settled |
| 5 | The now line is a zero-height overlay slot, placed after the last ended item; it moves by re-render and never shifts a row. | Vesper | Settled |
| 6 | The done set is fixed at hydration. An item whose window closes while the visitor watches becomes `passed`, not `done`. Nothing ticks itself in front of a person. | Vesper, Sage | Settled |
| 7 | No scroll-triggered reveals. They do not earn it. | Vesper | Settled |
| 8 | Register: the notebook's voice with the door open; *you* permitted; no host register. | Cantor | Settled |
| 9 | `DayHeader` gains an `as` prop; no parallel component. | Mason, Vesper | Settled |
| 10 | No offline treatment on the page; the auth screens carry theirs. | Vesper | Settled |
| 11 | The CTA is *Create an account*, both times, because the next screen says so. | Cantor | Settled |
| 12 | `HabitStrip` does not appear on the page. Seven squares in a row read as the enemy's grid at the glance a wary visitor gives, and the page has no room to teach the difference. The brief listed it as permitted imagery; permitted is not required. | Vesper, Sage | Settled |
| 13 | The `BigNumber` is never rendered without its `FormulaSentence`, and the review figure is interactive so the number is seen to be arithmetic. | Sage | Settled |
| 14 | The hero shows every row of the example day with its checkbox live; the picture works. Rows do not open anything. | Vesper | Settled |
| 15 | The example day's wake anchor (5:00 AM) is a fixture and is never shown; day-part headers render without spans. | Vesper | Settled |
| 16 | The static figures use UTC instants and `timeZone="UTC"`; the live figure uses the device. | Mason | Settled |
| 17 | The example day is defined in the app, typed by `@syn/types`; the `@syn/ui` fixtures are the pattern, not the import. | Mason | Settled, logged in SYS-6 |
| 18 | No OG image in this ticket. | Vesper | Settled; revisit in §15 |

---

## 15. Open items, routed onward

| Item | Owner | Where it lands |
|---|---|---|
| Approve the copy deck and the layout (this document) | Taylor | Mark-up on this file; then SYS-6 builds |
| Decision 3: the h1 size, seen built | Taylor | A `--fs-display` token proposal if wanted |
| The formula's fourth label (*excused* in §10.5 vs *something came up* per §10.2) | Vesper → REV-2 | The landing uses *something came up* until REV-2 rules; then it follows |
| An OG image rendered from the same example day via `next/og` | Vesper | A later ticket, once the page is live |
| The checkbox mark's 120ms draw-in (§9.6) is not implemented in the `Checkbox` primitive | Vesper → `@syn/ui` | Not this ticket |
| The legal links in the footer | SYS-3 | SYS-3 adds them when the routes exist |
| The day-part arithmetic moves to `@syn/utils` when USE-1 lands | USE-1 | Replace the leaf's local function |
| The ten-minute claim, re-checked against first-run data | Sage, Compass | After launch |
| The metric's measurement | Compass | A later ticket; never shown in the product |

---

*Vesper and Cantor. The product is the picture, the picture is alive at the visitor's own time, and every sentence on the page could be read aloud by the friend who sends the link.*
