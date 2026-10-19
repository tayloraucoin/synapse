# DAY-7 — `@syn/ui` for v1.3: `BlockBand` hue and the compact axis, `LinkCallout`, `BrandGlyph`, `SelectRow` with a leading `PriorityMark`, the `FixtureSheet`'s where / place / travel fields, `WeekHueStrip`, stories

**Epic:** DAY — The first run built day-first (UX v1.3) · **Phase 3** · Size: M
**Slice type:** New and amended composites in `@syn/ui`, plus one feature sheet's new fields — every state a story. The risk class is *a hue that leaks onto the execution tabs* (a `hue` prop passed where TD-29 forbids), *a callout that fetches*, and *a brand mark drawn wrong*.
**Vigil:** none. **Vesper review:** the hued bands in both themes against the Schedule's monochrome ones on one canvas; the callout beside a `PassageCarousel`; the Spotify mark at 20px in ink; the `FixtureSheet`'s *Away* reveal at 375px.

**Status:** Complete (2026-09-25)

> **Vesper — story review.** Open Storybook. Confirm: nine hued bands read as one family (the 100 washes, the 700 labels) and none reads as an alarm; a pooled hued band keeps its dashed edge over the wash; the compact axis at 28px/h fits a 24-hour example day in one phone screen with every in-band label legible; `LinkCallout` is surface-and-hairline, 56px minimum, the title in row-title weight 500, the host as a caption, the external glyph on the right; the Spotify mark is the circle mark in ink at 20px with no colour; a `SelectRow` with a leading `PriorityMark` keeps the glyph, the mark and the title on one 56px line at 375px; the `FixtureSheet` on *Away* reveals place, the two steppers and the switch without the sheet scrolling more than one screen. Say what you would change before DAY-8 composes them.

---

## Outcome

Every composite v1.3's screens compose that did not exist after DAY-1 exists with its story: a `BlockBand` can take a `hue`, and `ScheduleAxis` a compact `pxPerHour` of 28 for the primer; `LinkCallout` and `BrandGlyph` draw a link the frame can show; `SelectRow` takes a `leading` slot beside its glyph for the matters cell; `WeekHueStrip` draws a plan's blocks as a thin proportional strip for the week's rows; the `FixtureSheet` asks *Here · Away* and, away, a place and the travel. After this ships, **DAY-8 has the primer's parts and DAY-9…DAY-12 have every composite they name.** Nothing here reaches a route.

## Why / intent

- **v1.3 R47, §3.1, §4.2, §10.2, TD-29** — `BlockBand hue?: boolean`: the wash `bg-block-<kind>`, the in-band label `text-block-<kind>-label`; `pooled` keeps the dashed edge over the wash; a `sleep` band is a `BlockBand` of a new `kind: "sleep"`? — **no**: sleep is not a `BlockKind`; the primer and the review draw sleep with a `SleepBand` (feature-local in DAY-8/DAY-11) using `bg-block-sleep`; `BlockBand` takes only real kinds. `ScheduleAxis.pxPerHour` gains `28` for the primer (labels inside, no hour labels below 48px/h — the gutter shows every third hour).
- **v1.3 R53, §3.17, §5.2, §10.2, §10.4, TD-28** — `LinkCallout`: an `<a target="_blank" rel="noopener noreferrer">`, `bg-surface border-hairline rounded-[12px] min-h-14`, the `BrandGlyph` left, the title (row-title, 500) and the host (caption, secondary) stacked, Lucide `ExternalLink` at 20px right; hover one neutral step darker; *opens in a new tab* appended for screen readers; reduced-motion: no transition. `BrandGlyph kind: "spotify" | "link"`: the Spotify mark as an inline monochrome SVG path (the circle with three arcs, viewBox 0 0 24 24, `currentColor`, no wordmark) at 20px; `link` is Lucide `Link`.
- **v1.3 R59, §4.4 B11, B16, §10.2** — `SelectRow leading?: React.ReactNode` rendered between the `EmojiSlot` and the title; DAY-1's `PriorityMark` is what the builder passes.
- **v1.3 §4.5, §13 #36** — `WeekHueStrip segments: { kind, minutes }[]`: a 12px-high flex row of hued segments proportional to their minutes, `aria-hidden`, with the row's summary line as the text; a `sleep` segment allowed here (the strip is not a band).
- **v1.3 R51, §3.14, §4.4 B6** — the `FixtureSheet` (feature folder, `apps/web/components/fixture-sheet/`) gains after the title: **Where** `SegmentedControl` **Here · Away**; on *Away*: **Place** `Input` (optional, `FIXTURE_LOCATION_MAX`, placeholder *The clinic, the studio, the office…*), **Getting there** · **Getting back** `MinutesStepper`s (0–`TRAVEL_MAX`, default 0), the `Switch` **Plan for the travel** (on) with the line *Kept beside it, never added to it. Either trip can be dropped on the day.* `[COPY — v1.3 §4.4 B6]`; the save sends the four fields (DAY-5's `fixture.save`); edit mode reads them back; *Here* sends `location: null, travel 0/0, planTravel: true`.
- **Ground truth (consumed):** RUN-7 (`BlockBand`, `ScheduleAxis`, `SelectRow`, `EmojiSlot`, `PassageCarousel`), DYN-7 (`ScheduleAxis`'s gutter and hour labels), DAY-1 (`PriorityMark`), DAY-3 (the tokens and utilities), RUN-8 (`FixtureSheet` with kinds), `packages/ui/src/composed/display/list-row/` (the leading-slot pattern).
- **What this slice is NOT (binding):** any route; the primer's `BlockLegend` and `SleepBand` (feature-local, DAY-8); the `LinkSheet` (feature folder, DAY-10); passing `hue` from `/today` or the Schedule (never); a brand mark for any host but Spotify.

**Rulings this slice makes (labelled, logged):**

- **`BlockBand`'s `hue` is a boolean, not a colour** — the kind decides the hue through the tokens; a caller cannot pick a colour. The `bandVariants` cva gains `hue: { true: "" }` compound variants per kind (`kind × hue → bg-block-<kind>`), and the label's class switches to `text-block-<kind>-label` when hued. Logged.
- **`ScheduleAxis` at 28px/h labels every third hour in the gutter** and forces `inside` band labels; the `pxPerHour` union becomes `28 | 64 | 96`. Nothing on `/today` passes 28. Logged.
- **`BrandGlyph`'s SVG lives in `packages/ui/src/composed/display/brand-glyph/spotify.tsx`** as a single path, `aria-hidden`, `fill="currentColor"`; the component's header comment names Spotify's brand guidelines (the icon may be used to link to Spotify content; never recoloured, never altered) and that it is monochrome by the product's own rule. Logged.
- **`LinkCallout` never renders the URL as text** — the host only (`new URL(url).host`, computed by the caller and passed as `host`), so a long URL never breaks the callout. Logged.
- **`WeekHueStrip` is `aria-hidden`** — the row's summary line carries the meaning; the strip is a picture. Logged.
- **The `FixtureSheet`'s *Where* is derived on edit from the four fields** (`Away` when `location` is set or either travel length is positive; `Here` otherwise) — no fifth column. Logged.

## Behaviour & states

**No route.** Storybook is the surface. Stories added or amended (both themes):

- `block-band.stories.tsx` — *Nine kinds, hued, on one axis* · *Hued and pooled* · *Monochrome beside hued (the rule)* · *Inside labels at 28px/h*.
- `schedule-axis.stories.tsx` — *Compact 28px/h, 24 hours*.
- `link-callout.stories.tsx` — *Spotify* · *Other host* · *Two stacked* · *Hover* · *Focus-visible* · *Long title truncates*.
- `brand-glyph.stories.tsx` — *Spotify at 20px in ink, both themes* · *Link*.
- `select-row.stories.tsx` — *With a leading `PriorityMark`* · *With mark, long title, 375px*.
- `week-hue-strip.stories.tsx` — *A work day* · *A no-work day* · *Unstructured (no strip)*.
- The `FixtureSheet` has no story (feature folder); its states are checked on Settings → Standing commitments in the acceptance criteria.

**States (exhaustive):** as v1.3 §10.2's rows for `BlockBand hue`, `LinkCallout`, `BrandGlyph`, `FixtureSheet (+ away)`; `SelectRow` as v1.2 plus *with leading*. **Failure / edge states:** a `hue` band for a kind with no token (none — nine kinds, nine tokens; the type is exhaustive) · a `LinkCallout` with an empty host → the title alone · the sheet's *Away* with everything blank → saves as *Here*.

## Non-negotiables (this slice)

- **`hue` is decided by the kind; no caller picks a colour; no new hex.**
- **`LinkCallout` opens in a new tab and fetches nothing.**
- **The Spotify mark is monochrome `currentColor`, unaltered, never a wordmark.**
- **Every new or amended state has a story in both themes.**
- **Nothing on `/today` or the Schedule changes.**

## Data & AI

**Schema changes: none.**

**Tables:** `fixtures` (write, through DAY-5's `fixture.save` — the sheet only).

**Placement:** `packages/ui/src/composed/display/block-band/{block-band.tsx, band.variants.ts, block-band.stories.tsx}`; `composed/display/schedule-axis/schedule-axis.tsx` (+ stories); `composed/display/link-callout/{link-callout.tsx, copy.ts, index.ts, link-callout.stories.tsx}` (new); `composed/display/brand-glyph/{brand-glyph.tsx, spotify.tsx, index.ts, brand-glyph.stories.tsx}` (new); `composed/control/select-row/select-row.tsx` (+ stories); `composed/display/week-hue-strip/{week-hue-strip.tsx, index.ts, week-hue-strip.stories.tsx}` (new); `packages/ui/src/index.ts`; `apps/web/components/fixture-sheet/{fixture-sheet.tsx, copy.ts}`. Rule 9.

**tRPC / validators:** `fixture.save` (DAY-5's) called with the four fields; nothing new.

**AI notes:** **None.**

## Accessibility

- Hued bands keep their in-band label; contrast of `text-block-<kind>-label` on `bg-block-<kind>` is the chip pairing (AA) in both themes — check the amber and moss pairs first.
- `LinkCallout`: the link's accessible name is *{title}, opens in a new tab*; the glyphs are `aria-hidden`; 56px target.
- `SelectRow` with a leading mark: the mark's `aria-label` joins the row's name (*Cold shower, matters 5, usually 12, pressed*).
- The `FixtureSheet`'s revealed fields are announced by the segment change (`aria-live="polite"` on the revealed group's heading).
- `WeekHueStrip` is `aria-hidden`.

## Acceptance criteria (observable — Storybook at 375px and 1024px, both themes; the sheet on the local tier)

1. `BlockBand` with `hue` for each of the nine kinds resolves `background-color` to the kind's `--block-<kind>` and the label's `color` to `--block-<kind>-label`; without `hue`, unchanged (`--surface`); `hue` + `pooled` shows the dashed border over the wash. *(Vesper.)*
2. `ScheduleAxis` at `pxPerHour={28}` over 1440 minutes is 672px tall, labels every third hour, and every child band's label is inside.
3. `LinkCallout` renders an `a[target="_blank"][rel~="noopener"]` with the title, the host and the two glyphs; hovering darkens the surface one step; focus-visible shows the ring; no network request is made on render or hover (the network panel is empty).
4. `BrandGlyph kind="spotify"` renders a 20px SVG with `fill="currentColor"` and no other fill; in dark theme it is the light ink.
5. `SelectRow` with `leading={<PriorityMark value={5} />}` keeps the glyph, the mark and a 20-character title on one line at 375px with the detail and the check intact.
6. `WeekHueStrip` with segments summing to 1440 renders a 12px strip whose segment widths are proportional (a 570-minute work segment is ~40% of the width); the element is `aria-hidden`.
7. Settings → Standing commitments → *Add one*: the sheet shows **Where** after the title; *Away* reveals **Place**, the two steppers and the switch; saving with *The clinic*, 20, 20 stores the four fields (DAY-5's row); reopening shows *Away* with the values; switching to *Here* and saving nulls the place and zeroes the travel.
8. `grep -rn "hue" apps/web/components/schedule-canvas apps/web/components/day-list` returns nothing.
9. `yarn workspace @syn/ui run build-storybook --quiet` passes; every story renders in both themes without a console error.
10. `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` pass (four separate commands).

## Likely-relevant technical notes (ADVISORY — dev decides)

- `bandVariants` compound variants: nine entries `{ hue: true, kind: "work", class: "bg-block-work" }`; pass `kind` into the cva rather than switching in JSX.
- The 28px/h axis: `MIN_PER_BAND` and the hour loop are in `schedule-axis.tsx`; add a `labelEvery` derived from `pxPerHour` (`28 → 3`, else `1`).
- The Spotify mark path: the standard icon geometry (a circle and three curved bars) drawn as one compound path; keep it under 1 KB.
- `SelectRow.leading` slots between the `EmojiSlot` and the title `span`; the title's `min-w-0 flex-1` keeps truncation working.
- The `FixtureSheet` already derives `where` (block) from the kind; name the new segment state `away` to avoid the collision with `where`.

## Dev's call

The `labelEvery` rule at 28px/h · whether `LinkCallout` takes `host` or derives it (take it — the caller has the URL and the service could also store the host later) · the strip's minimum segment width for a 5-minute orient (a 2px floor).

## Out of scope

- **The primer's legend and the sleep band** — DAY-8 (feature-local).
- **The `LinkSheet`** — DAY-10.
- **Hues on the Schedule or the Today tab** — never (TD-29).

## Depends on

- **DAY-1** — `PriorityMark`, the grammar. Complete in `PROGRESS.md`.
- **DAY-3** — the tokens and their utilities. Complete in `PROGRESS.md`.

## Recommended execution

**Sonnet.** Precedented composites with exact contracts; the one judgement (the hue as a kind-keyed variant) is ruled above. Opus is not needed; Composer would hand-pick colours.

---

### Kickoff (paste into the session)

> Build **DAY-7 — `@syn/ui` for v1.3** (attached spec). Model: **Sonnet**. **The hue is the kind's, never a caller's colour; the callout opens and never fetches; the mark is monochrome; nothing on the execution tabs changes.**
> Attach/read first, in order: this spec · v1.3 §3.1, §3.14, §3.17, §4.2, §4.5, §5.2, §10.2, §10.4, R47, R51, R53, R59 · `packages/ui/AGENTS.md` · root `AGENTS.md` · `docs/ai-guides/component-guidelines.md`, `brand-tokens.md` · RUN-7, RUN-8 (Epic 5 — `BlockBand`, `ScheduleAxis`, `SelectRow`, the `FixtureSheet`; reuse, don't fork) · DAY-1, DAY-3, DAY-5 · this track's `DEVIATIONS.md` + `TECHNICAL-DECISIONS.md` (TD-27…TD-29).
> Close in three places; log departures in `DEVIATIONS.md`. Run `yarn lint`, `yarn lint:boundaries`, `yarn check-types`, `yarn build` as separate commands, then `yarn workspace @syn/ui run build-storybook --quiet`.
