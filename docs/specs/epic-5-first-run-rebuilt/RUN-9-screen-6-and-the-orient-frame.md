# RUN-9 — Screen 6 and the orient frame: passages as a list with the sheet, the quote switch, the three morning-line switches; the carousel, the *Last night* row, the visualisation field; Settings → Before the day

**Epic:** RUN — The first run rebuilt (UX v1.2) · **Phase 3** · Size: L
**Slice type:** One setup screen that is a small CRUD manager, and the one waking-state surface it feeds. The risk class is *the frame growing* (a fourth thing on the one screen designed for zero bandwidth) and *the app speaking* (a quote in the chrome's voice; a starter passage).
**Vigil:** none. **Vesper review and Sage's lens:** the frame stays one read, three optional lines and one button; the *Last night* row's default; the quote's rendering; no example passage anywhere.

**Status:** Complete — 2026-09-16 (batch 5; the signed-in walk could not be run from this thread — Vesper's screen review and Sage's endorsement test pending — see `DEVIATIONS.md`)

> **Vesper — screen review; Sage — endorsement test.** Walk `/setup/6` and `/orient` on an account with two passages and the quote on. Confirm: the passage list is left-aligned with a full-width *Add a passage*; the sheet's editor has five controls and is serif; a saved passage shows a two-line serif excerpt and its tags; the quote switch is off by default and its line reads as written; the three switches show their prompts as captions; on the frame the carousel opens on today's passage with dots beneath, swipe and arrows move, the quote day is attributed in quotation marks under *A quote*; *Last night* is collapsed and expands to the three lines; the third field reads *Today, as I see it*; nothing about the person is written by reading the frame. Sage: the four switches pass because each produces the person's words or an attributed, un-keyed quote.

---

## Outcome

Screen 6 asks what the person wants to hear first thing and lets them build it: passages as an ordered list — each with a title, a rich body, up to four images and tags, added and edited in a sheet, reordered by handle, archived from a menu — a switch that lets a quote from the bank join the cycle, and three switches for the morning's lines. The orient frame reads it back: a carousel of the person's passages (and the quote on its day) with dots, last night's lines one tap away behind a *Last night* row, and up to three optional serif lines — gratitude, intention, and now *Today, as I see it*. The same screen mounts under Settings → Your day → Before the day. After this ships, **the frame is ready for RUN-13 to put *Set from the plan* on its primary.** The single `orient_passage` textarea and the *Show what I wrote the night before* switch are gone from the screen; their columns wait for `0008`.

## Why / intent

- **v1.2 §4.6** — the screen, verbatim: heading *What do you want to hear first thing?*, body *Your own words, a passage you love, a quote you chose. The morning opens on it, before anything else gets in.*; **Passages** (`GroupHeading`; empty *Nothing saved yet. A few lines, a paragraph, a page.* + **Add a passage**; the `PassageSheet`: Title · `RichTextEditor` 8 rows serif with five controls · Images (four 72px tiles + *Add*) · `TagInput` · *Cancel · Save*; `PassageCard`s: title or first line, two-line serif excerpt, first image as a 44px thumbnail, tag chips, drag handle, `EllipsesMenu` *Edit · Archive*); **A quote each day** (`Switch`, off; *A quote from the bank, some mornings* with the muted line `[COPY §13 #29]` *One a day, from a set we keep. Attributed, never ours.*); **Three morning lines** (`GroupHeading` *In the morning*; three `Switch`es on: *Ask one line of gratitude* · *Ask one line of intention* · *Ask one line of visualisation*, captions *Grateful for, this morning* · *Today's intention* · *Today, as I see it*); primary *Continue · 2 passages*; *"must never supply a passage, a starter phrase, or an example passage. Speak a quote in the app's voice. Make anything here required."*
- **v1.2 §5.2, R41** — the frame: the `PassageCarousel` first; the placeholder *Nothing to read yet. A passage, or tonight's journal, shows up here tomorrow.*; the **Last night** ghost row, collapsed, expanding the three lines in order with the tense rewrite, absent when no entry, *"collapsed every morning"*; the three optional fields; *Start the morning*; R18's line unchanged; *"nothing about the person is recorded from the frame"*.
- **v1.2 §3.12, R36, TD-13, TD-15** — the cycle by order and date (RUN-4's `todayIndex`); the quote attributed, in quotation marks, in Newsreader, under *A quote*; Markdown rendered through the editor's read-only mode.
- **v1.2 §13 #16, #17** — the collapse is an assumption Taylor may flip; the metric is named in the spec and the screen writes nothing to measure it (an `[OPEN]` for Taylor, not a counter).
- **v1.2 §11.1** — `orient_ask_intention`, `orient_ask_visualisation`, `quotes_opt_in`; `days.visualisation`.
- **v1.1 §5.2** — everything else about the frame stands: no header, no tab bar, no time; paper; 64ch; `blockquote`/`figcaption`; autosave; the slide-up.
- **Ground truth (consumed):** `apps/web/app/(setup)/_components/step-6-before-the-day.tsx` (DYN-10), `components/orient-frame/{orient-frame,use-orient-frame,copy}.ts(x)` (DYN-13), `app/(shell)/settings/your-day/[screen]` (the *before-the-day* mount), `app/api/assets/…` (the read route; RUN-4's bucket), RUN-4's `passage.*`, `quote.today`, `day.orient`, `asset.createUploadUrl({ kind: "passage" })`, RUN-7's `RichTextEditor`, `TagInput`, `PassageCarousel`, `SortableList`, `Card`, `Textarea serif`, `TextDisclosureButton`, RUN-8's frame.
- **What this slice is NOT (binding):** *Set from the plan* on the primary and the *Sometimes* dialog (RUN-13); the admin surface (RUN-14); dropping the two columns (RUN-15); any change to the journal (v1.1 §7.2 stands) or to R18's rules.

**Rulings this slice makes (labelled, logged):**

- **`components/passages/` is a feature folder** (`passage-sheet.tsx`, `passage-card.tsx`, `passage-list.tsx`, `use-passages.ts`, `copy.ts`, `index.ts`) mounted by screen 6 and by Settings → Before the day; the sheet is `ResponsiveSheet size="tall"` (the right panel on desktop). Logged.
- **Image upload in the sheet is three steps the person never sees as three**: `asset.createUploadUrl({ kind: "passage" })`, the PUT, then the path added to the sheet's `images` state; the passage row is written on *Save* with the paths. An upload that fails leaves a tile with *Didn't upload* `[COPY]` and *Try again*; *Save* still works without it. Logged.
- **The sheet saves on *Save*, not per keystroke** — it is a sheet, and a half-written passage is not a fact; the guardrail's "save as you go" applies to facts on a screen, and a sheet's *Save* is its one fact. The list's reorder and archive write at once. Logged.
- **The frame's `visualisation` field autosaves like the other two** through `day.saveMorning` (RUN-4 widened the read; this ticket widens `saveMorningInput` with `visualisation`). Logged.
- **The *Last night* row is a `TextDisclosureButton` styled as the frame's ghost row**, collapsed on every mount; no preference, no memory (R41). Logged.
- **`step-6`'s old fields are deleted**: the textarea and the *Show what I wrote* switch; `orientPassage` and `orientShowLastNight` are no longer sent (RUN-3 removed them from the input). Logged.

## Experience & states

### Screen 6 — `/setup/6` (§4.6)

Heading and body verbatim. **Passages:** `GroupHeading`; `PassageList` (`SortableList` of `PassageCard`s, from `passage.list`); empty → the muted line + **Add a passage** (full-width secondary); with rows → the cards, then **Add a passage** beneath. `PassageCard`: `Card` with handle · title (or the first line of the body, plain) · two-line serif excerpt (the Markdown stripped to text, clamped) · 44px thumbnail (the first image via the asset route) · tag chips · `EllipsesMenu` (*Edit* → the sheet with the row; *Archive* → `passage.archive`, the card leaves with a 5-second inline undo `[COPY]` *Archived. Undo*). Reorder → `passage.reorder`. `PassageSheet`: title `Input` (placeholder *Untitled*) · `RichTextEditor` (8 rows, serif, placeholder *A few lines, a paragraph, a page.* `[COPY — reuse the empty line]`) · **Images**: up to four 72px tiles + *Add* (file input, `image/*`) · `TagInput` · *Cancel · Save*. **A quote each day:** the switch (off) + the line; writes `quotesOptIn` at once. **In the morning:** the three switches (on) with captions; each writes at once. Primary *Continue · n passages*; *Skip for now*. **States:** empty · listing · sheet-create · sheet-edit · uploading (tile progress, no percentage) · upload-failed · archiving (undo) · saving (switch pulse) · offline (the sheet's Save disabled; switches disabled with the line).

### The orient frame — `/orient` (§5.2)

In order: (1) `PassageCarousel` with `slides` from `day.orient` (`passages` → passage slides; `quote` → a quote slide last), `index = todayIndex`, `resolveImageUrl` from the app's asset route builder; empty → the placeholder in serif. (2) **Last night**: the ghost row when `lastNight` is non-null; expands to the three `blockquote`s with `figcaption` prompts (the tense rewrite as DYN-13). (3) The fields, each present only when its switch is on: *Grateful for, this morning* · *Today's intention* · *Today, as I see it*; autosave on pause through `saveMorning`. (4) **Start the morning** — as DYN-13 (the plan-mode label is RUN-13's). R18's line as DYN-13. **States:** carousel-one · carousel-many · quote-day · nothing-yet · last-night-collapsed · last-night-open · saving · offline · skipped-line (R18).

### Settings → Your day → Before the day

Screen 6 embedded (no frame, *Save*-less — every control already writes); the passage list is the same component.

**Failure / edge states:** `passage.save` fails → the sheet stays open with one line *Couldn't save. Try again.* and the person's text intact · a passage body over the limit → the editor shows the count near the limit and *Save* is disabled with the sentence `[COPY]` · the frame's `todayIndex` is null with slides present (opted in, bank empty, no passages) → the placeholder · the carousel image 404s (archived elsewhere) → the slide renders without it · `saveMorning` fails on the third field → the field keeps its text and a `SaveStatus` reads *Saving on this device* as DYN-13.

## Non-negotiables (this slice)

- **No example passage, no starter phrase, no quote in the app's voice.**
- **The frame is one read, three optional lines, one button.** The *Last night* row is the only disclosure.
- **Nothing is written by reading the frame.**
- **The quote is attributed, in quotation marks, under a neutral caption.**
- **Markdown is rendered through the editor's read-only mode**, never `dangerouslySetInnerHTML`.
- **The person's words are the only second person.**
- **No glyph in `copy.ts`.**

## Data & AI

**Schema changes: none.**

**Tables:** `passages` (read, write) · `quotes` (read) · `users` (update — the four switches) · `days` (update — `visualisation`) · `journal_entries` (read).

**Placement:** `apps/web/components/passages/` (new feature folder), `app/(setup)/_components/step-6-before-the-day.tsx` (rebuilt), `components/orient-frame/*` (amended), `app/(shell)/settings/your-day/[screen]` (*before-the-day* mounts the rebuilt screen), `lib/routes.ts` (no new route; `passages` is not a screen of its own — it is inside *before-the-day*), `packages/validators/src/day.ts` (`saveMorningInput` + `visualisation`), `packages/api/src/services/day/orient.ts` (`saveMorning` writes `days.visualisation`). Rule 9.

**tRPC / validators:** `passage.list/save/archive/reorder`, `quote.today` (via `day.orient`), `asset.createUploadUrl` (`passage`), `user.updatePreferences` (the four), `day.orient`, `day.saveMorning` (+ `visualisation`).

**AI notes:** **None.** Tags are stored and shown; nothing reads them.

## Accessibility

- The passage list's handles are labelled *Reorder {title}*; Alt+↑/↓ works; the menu's *Archive* announces the undo line.
- The sheet traps focus, opens on the title, returns focus to *Add a passage* / the card's menu.
- The editor's toolbar is a `toolbar`; the image tiles are buttons labelled *Add an image* / *Remove image n*.
- The carousel is the `region` *Today's reading* with `tab` dots; the quote slide's attribution is in the `figcaption`.
- The *Last night* row is a `button` with `aria-expanded`; its content keeps the `blockquote` / `figcaption` structure.
- The three fields are labelled by their captions; the frame's heading level 1 is the caption *Last night*? — no: with the carousel first, **the heading level 1 is the caption above the carousel (*Every morning* / *A quote*)** and *Last night* is a level-2 disclosure. Logged as a change from v1.1 §5.2's a11y row.

## Acceptance criteria (observable — local tier, an account with `0007` applied; 375px)

1. `/setup/6` shows the heading and body verbatim; empty state left-aligned with a full-width *Add a passage*; the quote switch off with its line; the three switches on with their captions. *(Vesper.)*
2. *Add a passage* → the sheet; typing a title, `**bold** words`, adding two images (uploaded to `passages/{user_id}/…`), two tags, *Save* → a card with the title, a two-line excerpt without asterisks, a thumbnail, two chips; `passages` has the row with `body_md` containing `**bold**` and two paths. *(Vesper.)*
3. A second passage appends; dragging it above the first calls `passage.reorder` and the order persists on reload; *Archive* removes the card with an undo that restores it within 5 s.
4. Toggling the quote switch writes `quotes_opt_in` at once; toggling *visualisation* off writes `orient_ask_visualisation = false` at once; *Continue · 2 passages* navigates without writing.
5. `/orient` with two passages and the quote on: the carousel shows the passage at `todayIndex` with dots (three, the current ink); arrow keys and swipe move; on the quote slide the text is in quotation marks with the attribution as a caption under *A quote*; the `region` is labelled *Today's reading*. With no passages and opted out: the placeholder sentence. *(Vesper.)*
6. `/orient` with a journal entry from last night: the *Last night* row is collapsed on load; tapping it shows the three lines in order with the tense rewrite; reloading collapses it again; with no entry the row is absent.
7. `/orient` shows three fields when all switches are on, two when *intention* is off; typing in *Today, as I see it* and pausing writes `days.visualisation`; the response of reading the frame writes nothing (`days` and `users` unchanged by a GET, checked by `updated_at`).
8. `grep -rn "dangerouslySetInnerHTML" apps/web/components/passages apps/web/components/orient-frame` returns nothing; `grep -rn "orientPassage\|orientShowLastNight" apps/web` returns nothing.
9. Settings → Your day → Before the day mounts the same screen embedded with the passage list working.
10. Offline: the sheet's *Save* is disabled with the line; the switches are disabled; the frame's fields still autosave locally as DYN-13.
11. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `use-orient-frame.ts` already debounces the two fields; add the third to the same effect.
- The excerpt: strip Markdown with a tiny function in the feature folder (remove `*`, `_`, `>`, `-`, link syntax) — not a library; it is two lines and the excerpt is decorative.
- The asset route builder for images exists for icons (`/api/assets/{bucket}/{user_id}/{file}`); pass it to `PassageCarousel` as `resolveImageUrl`.
- The upload PUT is the same code path as the avatar's (`lib/pwa`? no — `components/habit-sheet/icon-chooser.tsx` has it); reuse.

## Dev's call

Whether `PassageList` is its own component or inline in the screen · the undo's implementation (the existing 5-second inline undo pattern from `ItemRow`) · the excerpt stripper.

## Out of scope

- **`Start the morning · work 9:00` and the *Sometimes* dialog** — RUN-13.
- **The quote bank's contents and the admin surface** — RUN-14.
- **Dropping `orient_passage`, `orient_show_last_night`** — RUN-15.
- **Tags as a selection mechanism** — phase 2.

## Depends on

- **RUN-4** — `passage.*`, `quote.today`, `day.orient`'s new shape, the upload kind. Complete in `PROGRESS.md`.
- **RUN-7** — `RichTextEditor`, `TagInput`, `PassageCarousel`, `SortableList`, `Card`. Complete in `PROGRESS.md`.
- **RUN-8** — the frame rules and the fourteen-step sequence. Complete in `PROGRESS.md`.

## Recommended execution

**Opus.** A CRUD sheet with uploads, a carousel on the one screen with a zero budget, and three register rules (no example, no app voice, nothing written on read); a cheaper model adds a placeholder passage "to show what it looks like" or expands *Last night* by default.

---

### Kickoff (paste into the session)

> Build **RUN-9 — Screen 6 and the orient frame** (attached spec). Model: **Opus**. **No example passage; the app never speaks the quote; the frame is one read, three optional lines, one button; nothing is written by reading it; Markdown through the read-only editor.**
> Attach/read first, in order: this spec · v1.2 §3.12, §4.6, §5.2, §13 #16/#17/#21/#29 · v1.1 §5.2 (what stands) · `apps/web/AGENTS.md` · root `AGENTS.md` · `docs/specs/README.md` § Placement rules · DYN-13 (`orient-frame/` — reuse, don't fork) · DYN-10 (`step-6`) · SET-3 (the upload PUT in `icon-chooser.tsx`) · RUN-4 · RUN-7 · RUN-8 · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-13, TD-15) · Epic 4's `DEVIATIONS.md` (DYN-13's lines).
> Walk screen 6 and the frame at 375px; say what you could not walk. Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands.
