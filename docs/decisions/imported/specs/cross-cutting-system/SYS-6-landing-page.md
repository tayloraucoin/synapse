# SYS-6 — The landing page: `/` for a visitor who is not signed in

**Epic:** SYS — Cross-cutting · **Phase 1 (the front door; outside the §12 launch set)** · Size: M
**Slice type:** One public page composed from built composites, with two small client leaves that read the device clock and hold local interaction state. The risk class is *a false picture or a false frame*: a hydration mismatch that flashes a wrong day, a `dark:` colour that breaks a theme, a second `h1`, a string that drifts from the deck, a number rendered without its sentence.
**Vigil:** a pre-launch sweep after the build — official §11, the copy law (§10, value proposition §5.5 and §7.5), the never-lists, and the human-hand tell inventory; the three-clock check; both themes at first paint; the signed-in redirect.

**Status:** Complete (2026-09-05) — approved by Taylor and built. Two `@syn/ui` accessibility fixes and one routed finding are logged in `DEVIATIONS.md`.

> **Design handoff (the behaviour section of this ticket):** [`docs/ux/landing-page-ux.md`](../../ux/landing-page-ux.md). Every layout, state, string, and ruling is there; this ticket adds placement, the acceptance criteria, and the kickoff. Where this ticket and the handoff disagree, the handoff wins and this ticket is fixed.

---

## Outcome

A person who opens `synapse.day` without an account sees one quiet page in the product's own materials: the sentence *A private daily list.*, three sentences that say what the product does, and an example day rendered by the List's own rows with the now line crossing it at the visitor's actual local time. Three short sections prove the three pillars with the product's own components, one of which the visitor can operate to watch a reason change the arithmetic. The trust line appears once, verbatim. Two ink buttons say *Create an account* and lead to AU-02. A person who is signed in never sees any of it: `/` runs the entry tree first, exactly as today. **This slice does not** add a second page, a blog, pricing, a waitlist, analytics, an OG image, a font, a script, or a package.

## Why / intent

- **Founder's authorisation (Taylor, 2026-09-05)** — `apps/web/AGENTS.md` listed "a marketing surface" as out of Phase-1 scope; the scope line is amended to name exactly this one page, and the deviation is logged in this track's `DEVIATIONS.md`. Nothing else about scope changes.
- **Value proposition §7** — the messaging architecture: the promise first, three pillars each with a checkable proof, the category frame *a private daily list*, the claims register, the never-tell list. The page says what §7 says and nothing §5.5 forbids.
- **Official §2** (frame, emotional contract, guardrails), **§9** (colour, type, space, motion, the mark), **§10** (voice, vocabulary, the never-list, the trust line), **§11** (the accessibility floor).
- **Cross-cutting §2.1** (one break at 768px), **§3.4** (landmarks), **§4.2** (the entry tree, unchanged).
- **Ground truth consumed, never rebuilt:** `apps/web/app/page.tsx` and `lib/entry/resolve-entry-for-request.ts` (INF-7); the root layout's `ThemeProvider`, fonts, and viewport `themeColor` (INF-7); `ItemRow`, `DayPartHeader`, `DayHeader`, `NowLine`, `DecisionPanel`, `BigNumber` + `FormulaSentence`, `TrustLine`, `Text`/`Heading`/`Caption`/`Meta`, `Button` (`asChild`) from `@syn/ui`; `formatClock` from `@syn/utils`; `signInRoute` / `signUpRoute` from `lib/routes.ts`; the shell's skip-link classes.
- **What this slice is NOT (binding):** not the app (the signed-in experience is untouched); not a second design system (no new composite; one prop added to `DayHeader`); not instrumented (the metric is defined below and not wired); not a place for testimonials, social proof, or imagery that is not the product.

**Rulings this slice makes (labelled, logged):**

- **`/` renders the landing when the entry tree returns `null`, and redirects otherwise.** One file, no new route, `homeRoute()` unchanged. The alternative, a separate route with a redirect from `/`, adds a hop for every signed-in cold open to save nothing. Logged.
- **The example day is defined in the app, typed by `@syn/types`.** `packages/ui/src/composed/__fixtures__/view-models.ts` is not exported from `@syn/ui` and its instants are pinned to Vancouver; the brief's "fixture view models" are honoured as the shape, not the import. Logged as a deviation from the brief's wording.
- **`DayHeader` gains `as?: "h1" | "h2" | "p"` (default `"h1"`)**, applied to both its branches, with a story. The page has one `h1`; composing two `Text`s to imitate the header would be the parallel component §9.7 forbids. Logged.
- **Static figures use UTC instants and `timeZone="UTC"`; the live figure uses the device.** Server and client must format identical bytes on first render; the live figure renders with `now === null` on both until the first effect. Logged.
- **No analytics.** The page's one metric is *landing-to-account-start rate*: visits arriving at `/` signed out that reach `/signup` in the same visit. Defined here; measured by a later ticket from server logs or a content-free event; never shown in the product. Logged.

## Experience & states

The handoff §1–§8 is the behaviour section. In brief, for the reader who has it open beside this ticket:

- **Header** — wordmark (text), *Sign in* (ghost, 44px). Skip link first.
- **Hero** — `Heading` *A private daily list.* · the lede · the live day (`ExampleList live`) in a hairline frame with its caption · `Button` *Create an account* → `signUpRoute()` · `Meta` *It's free. The first list takes about ten minutes.* Compact: text, figure, action. Wide: text left (`col-span-5`), figure right (`col-span-7`), action under the lede.
- **Pillar 1 — Decide once** — body · figure: `DayHeader as="p"` (*Tuesday* · *Weekday*, plan mode) + three read-only `ItemRow`s, all `upcoming`.
- **Pillar 2 — Live the day without being managed** — body · figure: `ExampleList live={false}` with Run `done` and Stretch `done-off-schedule`, both toggleable with the five-second undo.
- **Pillar 3 — Close it honestly** — body · figure: `ReviewFigure` (`DecisionPanel` decided for Stretch, then `BigNumber` and `FormulaSentence`, recomputed from the visitor's choice).
- **Close — Only yours** — body · *Create an account* (ink) · *Sign in* (ghost) · `TrustLine`, the last thing in `main`.
- **Footer** — wordmark; *Privacy* · *Terms* when SYS-3's routes exist.

**States (exhaustive):** first paint (server; every example row `upcoming`, no now line) · hydrated (states derived, done rows checked, the line at the visitor's time) · minute tick · a row toggled (undo for 5 s) · the decision changed (deciding → decided; number recomputed) · reduced motion (identical) · dark · 200% text (compact) · offline (a document) · JavaScript off (first-paint day) · signed in (never shown).

**Failure / edge states:** device zone unavailable → `"UTC"` · a tab open across midnight keeps the day it loaded · `visibilitychange` re-reads the clock · the *Other* reason chip (see Dev's call) · `onTradedUp` cannot fire (the traded-up reason is not offered).

## Non-negotiables (this slice)

- **Nothing on the page is hex, arbitrary spacing, all-caps, tracked, italic, gradient, or shadowed.** Tokens by name; the scale is 4·8·12·16·24·32·48.
- **No `dark:` colour utility in any landing file.** Tones come from semantic tokens. (`Button`'s built variants are the primitive's concern, not the page's.)
- **Exactly one `h1`.** `DayHeader` renders as `p` here.
- **Every string a visitor reads comes from `apps/web/content/landing.ts` or the composites' own `copy.ts`,** verbatim from the handoff §9. A string not in the deck is a `[COPY — needs Cantor]` marker, never an improvisation. The trust line is `TrustLine` and appears once.
- **The `BigNumber` is never rendered without its `FormulaSentence`.** The hero and the pillars carry no number about the day beyond times.
- **No streak, score, badge, count, urgency, social proof, exclamation mark, emoji, or *we*.** No named competitor. Not *habit tracker*, *productivity app*, or *planner* as the noun.
- **The theme never switches by the clock.** Time of day is the now line and the day parts.
- **The page loads nothing the app does not already load.** No script, pixel, font CDN, or analytics.
- **`resolveEntryForRequest()` runs first.** A session is never shown the landing.
- **The now line, timers, and the clock are `aria-live="off"`;** nothing announces on its own.

## Data & AI

**Schema changes:** none.

**Tables:** none read. (`resolveEntryForRequest` reads `users` through RLS as it does today; unchanged.)

**Placement (Mason; rules cited from `../README.md` § Placement rules):**

| Path | What | Rule |
|---|---|---|
| `apps/web/app/page.tsx` | Edited: `const destination = await resolveEntryForRequest(); if (destination) redirect(destination); return <LandingPage />;` plus `export const metadata` built from `LANDING_COPY.meta` (`title`, `description`, `openGraph` `{ title, description, type: "website", siteName }`, `twitter` `{ card: "summary" }`; no image). | INF-7's file; one file, no new route |
| `apps/web/content/landing.ts` | `LANDING_COPY` exactly as the handoff §9.2. | copy-conventions § Marketing surface copy |
| `apps/web/app/_components/landing/landing-page.tsx` | Server Component. The skip link, `<header>`, `<main id="main">` with the six sections, `<footer>`. Composes the leaves; holds the static figures (pillar 1's `DayHeader` + read-only rows). Named export `LandingPage`. | rule 9 (route-local) |
| `apps/web/app/_components/landing/example-day.ts` | No React. `EXAMPLE_CATEGORIES`, `EXAMPLE_ITEMS` (the seven, handoff §4.1), `EXAMPLE_REASONS`, `EXAMPLE_NIGHT` (five done, one didn't do), `readNow()`, `deviceTimeZone()`, `localInstant(h, m)` / `utcInstant(h, m)`, `dayPartOf(minutes)` (the §6.4 arithmetic from the 5:00 fixture anchor), `deriveState(item, now, doneAtMount, toggled)` (handoff §4.3), `nowLineIndex(items, now)` (handoff §4.4), `reviewArithmetic(decision)` (handoff §5). Typed by `@syn/types`. | rule 6's spirit for pure logic; kept local because it is a page fixture, `[REVISIT: the day-part arithmetic moves to `@syn/utils` when USE-1 ships one]` |
| `apps/web/app/_components/landing/example-list.tsx` | `"use client"` line 1. Props `{ items, live: boolean, timeZone?: string }`. Owns `now` (null until mounted; the minute tick; `visibilitychange`), the toggled set with `doneAt`, the undo timers (`UNDO_WINDOW` from `@syn/constants` if it exists, else 5000 ms local and logged), and renders the three day parts, the rows, and the `NowLine` slot. Named export `ExampleList`. | rule 9; `"use client"` on line 1 |
| `apps/web/app/_components/landing/review-figure.tsx` | `"use client"` line 1. Owns `DecisionState` (`decided` ↔ `deciding`) and the `Decision`; renders `DecisionPanel`, `BigNumber`, `FormulaSentence`. Named export `ReviewFigure`. | rule 9 |
| `packages/ui/src/composed/display/day-header/day-header.tsx` + `.stories.tsx` | `as?: "h1" \| "h2" \| "p"`; a `AsParagraph` story. Doc block updated. | the one `@syn/ui` amendment |
| `apps/web/AGENTS.md` | Route map row for `/`: *the landing page when signed out (SYS-6); otherwise resolves per §4.2*. (The scope line was already amended by Taylor's authorisation.) | logged edit |
| `scripts/generate-directory-map.mjs` | `ANNOTATIONS` entries for `apps/web/content/landing.ts` and `apps/web/app/_components/landing/` ; then `yarn directory-map`. | root `AGENTS.md` § Hard guardrails |

**tRPC / validators:** none.

**AI notes:** **None.**

## Accessibility

- Landmarks: `banner` (the `<header>`), `main#main`, `contentinfo` (the `<footer>`). No `navigation` (one link is not a nav). The skip link *Skip to content* is the first focusable element, using the shell layout's sr-only/focus classes.
- One `h1`; section heads are `h2`; `DayPartHeader`'s own `h2`s sit inside figures, which is correct outline (a figure titled *Morning*).
- Every figure is `<figure>` with a `<figcaption>` (`Caption as="figcaption"`).
- The example checkboxes are real controls with the row's own labels (*Mark Run done*); the caption tells a screen-reader user it is an example. The row body is a span, not a button.
- The `NowLine` is `aria-hidden` by construction; its slot `li` is `aria-hidden`. Nothing on the page has `aria-live` other than the built composites' own (`toast` is not used).
- Focus-visible: the global 2px accent ring; every button and link is a built primitive.
- Targets: every button `size="md"` (44px); the checkbox target is the row's 56px column.
- Contrast: body copy is `text-body` (neutral-600 on paper, AA); captions are `secondary`; the now-line label is `accent-text` (600/300). Nothing uses `muted` below `row-title`.
- 200%: compact layout; `truncate` on row titles; no horizontal scroll (verify at 320px CSS width).
- Reduced motion: nothing animates; the duration tokens are already 0ms.

## Acceptance criteria (observable — compact and wide, both themes)

1. `/` with no session renders the landing; `/` with a session redirects exactly as before (verify with a signed-in browser and a private window). `homeRoute()` and `lib/entry/*` are unchanged (`git diff` shows no edit there). *(Vigil.)*
2. The page's `<title>` is *Synapse · A private daily list. No streaks, no scores.*; the meta description and OG title/description match `LANDING_COPY.meta`; there is no OG image tag.
3. Every visible string matches the handoff §9.2 byte for byte (a grep of `landing.ts` against the deck); the trust line appears exactly once and is rendered by `TrustLine`.
4. Exactly one `h1` in the DOM; `banner`, `main`, and `contentinfo` landmarks present; the skip link is the first tab stop and moves focus to `main`.
5. **First paint theme:** with the OS in dark and no stored choice, the first frame is dark (no flash; check with a throttled reload and the paint timeline); with a stored `syn:theme` of `light`, light. No `dark:` colour utility appears in any file under `_components/landing/` or in `landing.ts` (grep).
6. **The now line at three fake clocks.** With `readNow()` overridden (`Date.now` stubbed in the console before reload, or a one-line edit reverted afterwards) to 7:20 AM, 3:12 PM, and 10:05 PM local: the line sits above Run with Run reading *now* and nothing else changed; below Book the dentist with Walk faded to *soon* at 2:50 PM and *now* at 3:12 PM, Run/Writing/Book the dentist checked and Stretch faded and silent; below Read with every earlier row checked except Stretch. The label reads the stubbed time. *(Vigil.)*
7. **First paint of the live day** is every row `upcoming`, unchecked, with no line, and no hydration warning in the console; after hydration the states and the line appear in one re-render with no layout shift (Layout Shift in DevTools: 0 for the figure).
8. Tapping an example checkbox toggles it, shows *Undo* in the state slot for five seconds, then the derived word; marking a past item done shows *moved* with its time in violet; reload clears everything.
9. In pillar 3, *Change* opens the tier rows; choosing *Planned it wrong* → *Slept in* returns to decided at *79%* with *5 done, 1 planned wrong (½), 1 didn't do (0) — 5.5 of 7, 79%.*; *Didn't do it* → *71%*; *Something came up* → *83%*. The number never appears without its sentence.
10. Reduced motion on: nothing differs from motion on (compare screenshots). Dark and light: no hex, no colour that is not a token (grep the four files for `#`).
11. At 200% zoom on a 1440px window the layout is compact and there is no horizontal scroll; at 320px CSS width likewise.
12. The page issues no request the app did not already issue (Network tab: no third-party host, no analytics, no font beyond the self-hosted two).
13. `DayHeader`'s story shows the `as="p"` variant; existing stories are unchanged.
14. `apps/web/AGENTS.md`'s route map describes `/` correctly; `yarn docs:check-links` passes; `yarn directory-map` was run and the two annotations appear.
15. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- **Hydration.** `ExampleList` must render identically on the server and on the client's first pass: keep `now` in state initialised to `null`, derive everything from `now === null` as "upcoming, no line, unchecked", and only set `now` in an effect. Do not read `Date` or `Intl` during render. `TimeText` already carries `suppressHydrationWarning` on its `<time>`; the `dateTime` attribute will differ between the server's and the client's local instants, which that flag covers, and the first effect's re-render updates it.
- **The minute tick.** `setTimeout` to the next `:00` second, then `setInterval(60_000)`; clear both on unmount; add a `visibilitychange` listener that re-reads the clock when the tab becomes visible.
- **`NowLine` inline.** Render it inside `<li aria-hidden="true" className="relative h-0">` with `topPx={0}`; its `absolute inset-x-0` then spans the row width and its dot sits 12px outside the `li`, inside the figure's `ps-(--space-4)`. Do not put `overflow-hidden` on the figure.
- **`ItemRow` without a body button.** Omit `onOpen`; pass `onToggleDone` so the checkbox renders; `variant="default"` for the live and pillar-2 figures, `variant="read-only"` (no `onToggleDone`) for pillar 1.
- **`DecisionPanel` and *Other*.** `ReasonChips` appends an *Other* chip; the panel returns without deciding until text exists. Pass `otherText`/`onOtherTextChange` through the panel's props if it forwards them; if it does not, decide on blur of the *Other* field from the leaf, or compose `DecidedLine` + `TierRadioRows` directly and log it. Either way the figure must never be left undecidable.
- **`reasonText` not `reasonKey`.** The panel prints `reasonText ?? reasonKey`; pass the label.
- **Static instants.** `new Date(Date.UTC(2026, 8, 8, h, m))` with `timeZone="UTC"` for pillar 1, pillar 2, and the review figure; the calendar date is irrelevant and never shown.
- **Buttons as links.** `Button asChild` wraps exactly one `Link` child (Slot's rule; see the primitive's doc block).
- **Grid on wide only.** `wide:grid wide:grid-cols-12 wide:gap-(--space-6)` on the section, `wide:col-span-5` / `wide:col-span-7` on the children; compact stays a flex column.
- **Metadata.** `export const metadata: Metadata` on `page.tsx` overrides the root layout's title for `/` only. No `metadataBase` is needed without an image.
- **The undo window.** Check `@syn/constants` for an undo-window constant before hard-coding 5000; log whichever.

## Dev's call

The exact `dayPartOf` implementation (minutes vs. Date comparison) · whether `ExampleList` and `ReviewFigure` share a small `Figure` wrapper in `landing-page.tsx` or repeat three lines of classes · the *Other* chip handling above · whether the footer renders the legal links behind a check for the route builders' existence or SYS-3 adds them (recommend: SYS-3 adds them; the footer ships as the wordmark alone).

## Out of scope

- **A second page of any kind** — nothing exists and nothing is scaffolded (founder's authorisation).
- **Analytics or the metric's measurement** — defined above; a later ticket.
- **An OG image** — a later ticket via `next/og` from the same example day.
- **The legal links** — SYS-3.
- **The `Checkbox` mark's draw-in** — `@syn/ui`, not this ticket.
- **A `--fs-display` token** — Decision 3 in the handoff; Taylor decides after seeing the built h1.
- **Any change to the signed-in experience, the entry tree, `proxy.ts`, or the manifest.**

## Depends on

- **Nothing that is not Complete.** `page.tsx` and the entry tree are INF-7 (Complete); the composites are INF-4 and the epic composites (Complete in `infrastructure/PROGRESS.md`); the fonts and `ThemeProvider` are INF-7.
- **Taylor's approval of the handoff** — `docs/ux/landing-page-ux.md`, marked up. The build does not start before it.
- **SYS-3 (soft, not gating)** — the footer's legal links arrive with it.

## Recommended execution

**Opus.** The slice is small but every line of it is on the trust surface, and the two hydration rules and the three-clock derivation are exactly where a model reaching for a remembered pattern (`new Date()` in render, a `dark:` class, a hardcoded `#`) ships a wrong first frame. The failure mode of choosing down is a page that is right on the second render.

---

### Kickoff (paste into the session)

> Build **SYS-6 — The landing page** (attached spec). Model: **Opus**. **The product is the picture; the picture is alive at the visitor's own time; every string is the deck's; one `h1`; no `dark:`; no hex; nothing pleads.**
> Attach/read first, in order: this spec · `docs/ux/landing-page-ux.md` (the behaviour — every section) · `docs/product/value-proposition.md` §5.5, §7 · official spec §2, §9, §10, §11 · `apps/web/AGENTS.md` (route map — amend the `/` row) · root `AGENTS.md` (hard guardrails and shell conventions: no heredocs, no `&&`, no `$(...)`, one command per call, Edit/Write for files) · `docs/specs/README.md` § Placement rules · `docs/ai-guides/{brand-tokens,typography-guidelines,classnames,component-guidelines,copy-conventions}.md` · `apps/web/app/page.tsx`, `apps/web/lib/entry/resolve-entry-for-request.ts`, `apps/web/app/layout.tsx`, `apps/web/app/(shell)/layout.tsx` (the skip-link classes) · `packages/ui/src/composed/display/{item-row,day-part-header,day-header,now-line,trust-line,big-number}/`, `packages/ui/src/composed/control/{decision-panel,tier-radio-rows,reason-chips}/`, `packages/ui/src/composed/__fixtures__/view-models.ts` (the shapes) · `packages/utils/src/time.ts` · `packages/config/tailwind/preset.css` · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` · `docs/specs/infrastructure/DEVIATIONS.md`.
> State the exact file paths before implementing. Build the Server Component and the two client leaves as placed above; add the one `DayHeader` prop with its story; write the copy module verbatim from the deck. Verify both themes at first paint, both breakpoints, 200% text, reduced motion, and the now line at three stubbed clocks; report each. Then run Vigil's pre-launch sweep as a separate pass (official §11, the copy law, the never-lists, the human-hand tell inventory), fix Blocking and Should-fix, log Consider. Close in three places; log departures in `DEVIATIONS.md`; run `yarn directory-map`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands. Commit to the working branch with repeated `-m` flags. Close with five lines: what shipped, deviations, what Taylor should look at first.
