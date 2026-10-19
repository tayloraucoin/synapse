---
title: "Mobile versus desktop layout and breakpoint choice: strategies, origins of conventional breakpoints, and a decision procedure"
description: "Read only to trace a ruling on mobile-versus-desktop layout or breakpoint choice."
layer: research
status: archived
thread: responsive-layout
role: Alembic
date: 2026-10-10
---

# When and how should an interface differ between mobile and desktop, and how should the breakpoint(s) be chosen?

Reading taken: web-first and product-agnostic. Scope runs from content sites to working tools. Native-only guidance (Apple size classes, Android window size classes) is used only as evidence of convention, and the note says where it does not transfer to the web.

## Answer

Change the layout only where the content or the task stops working, not where a device class starts. Reading, form and settings screens should keep one column and cap the measure at about 50–75 characters (Baymard; GOV.UK says no more than 75).\[1\]\[2\] Their extra width goes to margins, or to a persistent navigation rail, not to longer lines. Collection screens that the user works through repeatedly (inbox, queue, file list, admin list) should change at a break into list-detail: a list pane of fixed width and a flexible detail pane. That is the convergent advice of Material 3 and GitHub's Primer, though they disagree on where the break falls: Primer allows two columns from 768px, Material recommends two panes from 840dp.\[3\]\[4\]\[5\]\[6\]\[7\] Add a third pane only at very wide windows (Primer from 1400px; Material says "consider" three at 1600dp and up).\[3\]\[4\] To place each break, add up the minimum widths the content needs (list pane, detail measure, gutters, navigation). Use the nearest token in your scale at or above that sum. Then check three conditions: the screen still works at 320 CSS px (WCAG 1.4.10), at 400% zoom on a 1280px window, and with text at 200%.\[8\]\[9\]\[10\] No published grounding of the conventional values (Tailwind 640/768/1024/1280/1536; Bootstrap 576/768/992/1200/1400) in content was found. Tailwind's documentation calls its values "inspired by common device resolutions", and its author called the earlier Bootstrap-derived values "fairly arbitrary".\[11\]\[12\] Most products need two or three layout breaks, a figure that comes from NN/g's practitioner guidance (2024), not from measurement.\[13\] Components that live in more than one width context should break on their container (container queries), not the viewport.\[14\]\[15\]\[16\] In short: scale-up by default, adapt for working collections, and treat the hybrid as the usual answer for multi-section products.

## TL;DR

- Scale-up (one capped column) is the default for reading, forms, settings, chat transcripts and checkout. Adapt into list-detail for working collections. The hybrid (adaptive navigation, unchanged content) is the usual shape for multi-section products. The strategy is chosen per screen, not per product.
- Conventional breakpoint values come from device widths and convention, not content. Material's values are the only ones published with device-share data, and it is Android data. Tailwind's are "inspired by common device resolutions". Bootstrap's were chosen to hold containers whose widths are multiples of 12. Practitioners (Frost, Hay, Every Layout) say break where the content breaks.
- Place breaks by adding up minimum content widths and checking reflow at 320 CSS px. Use container queries for any component placed in more than one width context. Expect two or three layout breaks, which is practitioner guidance, not measured evidence.

## Strategy comparison

Product-behaviour claims carry the date of the source that states them. Where no dated primary source was found, the cell says so. Costs are judgment (Turner lens), stated as relative counts, not measurements.

| Strategy | Right call for (task / product kind) | Cost: design states, QA surface, code (judgment, Turner) | Failure modes | Named products and what they do at the break |
|---|---|---|---|---|
| (a) One layout scaled up: single column, content max-width, body centred | Reading, long-form content, forms, settings detail pages, checkout steps, chat transcripts (judgment, Vesper) | Lowest. One layout state; QA at narrowest width, measure cap width, and zoom; the only CSS that changes is margins/max-width | Wasted width on large monitors; disputed by some users (Wikipedia RfC, below); "giant phone" feel if touch-scale controls are kept on a pointer device (judgment); wide tables and media squeezed | **Wikipedia, Vector 2022 skin**: article width limited to 960px for readability. Since Nov 2022 a page-width toggle is available to all users at browser windows of 1,600px or more. An English Wikipedia RfC (Jan 19 – Mar 16, 2023) found rough consensus for making unlimited width the default there.\[17\]\[18\] **GOV.UK**: mobile-first single column, no more than 75 characters per line; responsive spacing and type scale step up above the 640px tablet breakpoint (pages undated, accessed 2026-10-10).\[2\]\[19\]\[20\] **NHS website**: mobile-first single column; default max page width 960px; text lines no longer than 70–80 characters (undated, accessed 2026-10-10).\[21\] |
| (b) Adapted layout that reorganises at a break: nav moves, panes multiply, interaction changes | Inboxes, queues, file browsers, admin lists, dashboards with drill-down, editors with inspectors (judgment, Vesper) | Highest. At least two layout states per screen (single-pane with push navigation; two-pane with persistent selection), plus a third pane state if used; selection, back behaviour and focus must survive crossing the break; QA at each break edge and while resizing | Desktop-only features that never reach mobile (keyboard, right-click, drag with no touch equivalent); mobile treated as an afterthought; panes squeezed when the window-based break ignores the actual container (Kanso UI issue: 360px + 104px panes in a 520px container)\[15\] | **GitHub (Primer design system)**: under 768px ("narrow"), one column; list-detail pages such as settings "can be split into different pages"; a pane can open as a bottom sheet from a narrow-only trigger; from 768px ("regular") up to 2 columns; from 1400px ("wide") an optional third column (Primer docs, undated, accessed 2026-10-10).\[3\]\[22\]\[23\] This describes the design system, not observed github.com pages. **Shopify theme editor** (changelog, March 25, 2026): on wide screens the left navigation moved into the top bar and the right sidebar is collapsible; on laptops and smaller screens the settings panel slides up from the bottom with a draggable divider.\[24\] **Slack desktop/web**: tabs that no longer fit when the window is resized go into a "More" overflow menu (help article, undated); consolidated tab set rolling out from September 2025.\[25\]\[26\] No Slack source found for thread-pane behaviour by width. |
| (c) Hybrid: centred column plus persistent rail, or adaptive navigation with unchanged content | Multi-section products where each screen is a reading or form screen but the user moves between sections often: settings areas, documentation, account areas, content sites with tables of contents (judgment, Vesper) | Middle. Navigation has two or three states (bar or menu, rail, expanded rail or sidebar); content has one; QA concentrates on navigation and focus order | Rail plus capped column can still leave dead width; navigation hidden behind a menu on mid widths where it would fit (judgment); duplicated navigation components drift apart (judgment, Turner) | **Material 3 guidance (not a product)**: swap a navigation bar for a navigation rail in medium or expanded windows; collapsed rail can become expanded rail at large or extra-large (m3.material.io, undated, accessed 2026-10-10).\[4\] **GOV.UK**: most pages follow a "two-thirds and one-third" grid layout from the desktop breakpoint (undated).\[2\] **Notion**: side peek opens a database item on the right while the database stays interactive on the left (release notes, July 20, 2022).\[27\] Notion's sources do not tie this to window width, so it is a pane pattern, not a verified breakpoint behaviour. Fewer than three verified hybrid products were found; see Not found. |

Gmail: the reading pane ("No split", "Right of inbox", "Below inbox") is a user setting (Gmail Help, undated).\[28\] No Google source was found describing what Gmail changes automatically at narrow widths, so Gmail is not used as an example of (b).

## Choosing the breakpoint

### Conventional breakpoint systems and their origins

| System | Values | Stated origin (source's own account) | Grounded in | Label |
|---|---|---|---|---|
| Tailwind CSS (v4 docs, current as of 2026) | sm 40rem (640px), md 48rem (768px), lg 64rem (1024px), xl 80rem (1280px), 2xl 96rem (1536px); container-query sizes from @3xs, @sm = 24rem (384px)\[29\]\[30\] | Docs: five breakpoints "inspired by common device resolutions". PR #683 (Adam Wathan, Feb 23, 2019): prior values were taken from Bootstrap; values moved to nearest common device resolution: 768 iPad width, 1024 iPad height and 12.9" iPad Pro width, 1280 13" MacBook Pro width, sm 568 iPhone SE landscape\[11\]\[12\] | Device resolutions (2019 devices) | verified |
| Tailwind: why sm is now 640 and why 2xl is 1536 | 640, 1536 | Not found in Tailwind's docs or the PR found | Unknown | Not found |
| Bootstrap 5.3 (and 6.0 docs) | xs <576, sm ≥576, md ≥768, lg ≥992, xl ≥1200, xxl ≥1400\[31\] | Each breakpoint chosen to "comfortably hold containers whose widths are multiples of 12"; also representative of a subset of common device sizes, not every device\[31\]\[32\] | Grid arithmetic plus device convention | verified |
| Contradiction on Bootstrap's grounding | Same values | Tailwind's author (2019): Bootstrap's values "fairly arbitrary" as far as he could tell. Bootstrap's own docs: chosen for multiples-of-12 containers\[12\]\[31\] | Both sides reported; not reconciled | verified (both sources) |
| Material 3 / Android window size classes | Compact <600dp, Medium 600–839dp, Expanded 840–1199dp, Large 1200–1599dp, Extra-large ≥1600dp; height classes compact <480dp, medium <900dp\[5\]\[33\] | Android docs: compact covers 99.96% of phones in portrait; medium 93.73% of tablets in portrait; expanded 97.22% of tablets in landscape. Material: "opinionated window sizes" matched to available space, device conventions and ergonomics.\[34\] Large and Extra-large added in Jetpack WindowManager 1.5\[4\]\[5\]\[35\]\[36\] | Device-population data (Android ecosystem), applied to window not device | verified |
| Material: dp versus CSS px on the web | — | No source found stating that dp thresholds transfer one-to-one to CSS px | — | Not found |
| Apple HIG size classes | Two values per axis: regular, compact; assigned per device and multitasking configuration (table in HIG Layout)\[37\]\[38\] | HIG defines regular as larger screen or landscape, compact as smaller or portrait; no numeric width threshold published in the HIG extract found. A secondary source (Medium, Tyler Howarth) says iPad compact is below about 640pt\[39\]\[40\] | Device and multitasking configuration | verified (classes); secondary (640pt) |
| Microsoft Windows apps | Small <640, Medium 641–1007, Large ≥1008 effective px\[41\] | Design for the window, not the screen\[41\] | Device categories in effective pixels | verified |
| GitHub Primer | Viewport ranges: narrow <768 (1 column), regular ≥768 (up to 2), wide ≥1400 (up to 3).\[3\] Older breakpoints: 544, 768, 1012, 1280\[3\]\[42\] | Older primer/css docs: breakpoints "based on screen widths where our content starts to break"\[43\] | Content (stated) | verified |
| GOV.UK / NHS | GOV.UK tablet 640px; NHS mobile 320, tablet 641, desktop 769, large desktop 990\[19\]\[21\] | Not stated in pages found. A GitHub issue on govuk-frontend (#7461) assumes the 768 desktop value derived from iPad widths, but this is a contributor's assumption\[44\] | Unknown; secondary assumption of device origin | verified (values); secondary (origin) |
| NN/g (2024) | Extra-small to about 500px (4 cols), small 500–1200 (8), medium 1200–1400 (12), large ≥1400\[13\] | Practitioner guidance; designers usually design for 2–3 breakpoints in practice\[13\] | Device classes (phone, tablet, laptop) | verified (that NN/g says it) |

Interpretation (judgment, Alembic): no system found grounds its values in content measurements. The only system to publish device-share data is Material/Android, and that data is Android-ecosystem data. Primer is the only one that states a content origin, and it gives no measurements. The conventions are therefore safe defaults, not evidence of where any one product's layout should break.

### Content-out versus device-class: what sources recommend, and where they disagree

| Position | Source (dated) | What it says (paraphrase unless quoted) | Label |
|---|---|---|---|
| Content-out | Brad Frost, "7 Habits of Highly Effective Media Queries", Sept 18, 2013 | Let content determine breakpoints; do not use popular device dimensions; use major and minor breakpoints; relative units; "Don't go overboard"\[45\] | verified |
| Content-out | Stephen Hay, BDConf Orlando talk "Responsive Design Workflow", relayed in Brad Frost's live notes (bradfrost.com, Apr 17, 2012) and Jeremy Keith's Adactio journal (Apr 26, 2012) | Under "Design for various breakpoints": start small, widen until the design breaks, insert a breakpoint there (paraphrase of a quote relayed by Frost's notes; Hay's own text not found, slides on SlideShare) | secondary |
| Intrinsic, no viewport query | Every Layout, "The Sidebar" (undated, accessed 2026-10-10) | Viewport @media queries have "no bearing on the actual available space"; components should lay themselves out intrinsically\[46\] | verified |
| Window classes, not devices | Android "Use window size classes" (undated) | Classes are determined by the app window, "not intended for isTablet-type logic"\[5\] | verified |
| Window classes, flex between | Android/Material adaptive codelab (undated) | Don't lock layouts to fixed sizes at each breakpoint; layouts must flex between classes\[47\] | verified |
| Window, not screen | Microsoft Windows apps (undated) | Design for the app window's space, not the screen size\[41\] | verified |
| Device-class ranges as working defaults | NN/g, Kelley Gordon, Apr 5, 2024 | Gives ranges labelled by device class (mobile, tablet, laptop); 2–3 breakpoints in practice\[13\] | verified |

Where they agree: every source found says to respond to the available space (window or container), not to device identity. Where they disagree: practitioners (Frost, Hay, Every Layout) say to derive values from the content, while platforms and NN/g publish fixed opinionated values for everyone to use. Material and Android justify theirs with device-population data; NN/g gives device-labelled ranges. The disagreement is about where the numbers come from, not about what triggers the change.

### How to measure

| Quantity | Value | Source (dated) | Label | Caveat that travels with it |
|---|---|---|---|---|
| Readable measure | 50–75 characters per line, including spaces; Ruder's 50–60 cited as the origin\[1\] | Baymard Institute, "Readability: The Optimal Line Length" (first published 2010, updated 2014 per a secondary account; accessed 2026-10-10)\[48\] | verified | Built on print typography; Baymard notes line length is only one component of readability\[1\] |
| Measure cap, government | No more than 75 characters per line (GOV.UK); 70–80 (NHS)\[2\]\[21\] | GOV.UK Design System Layout; NHS service manual Layout (both undated, accessed 2026-10-10) | verified | The two systems differ by about 5 characters at the top end |
| Accessibility upper bound | 80 characters (40 for CJK), WCAG 1.4.8, Level AAA:\[49\]\[50\] "Width is no more than 80 characters or glyphs (40 if CJK)." | W3C, Understanding SC 1.4.8 Visual Presentation (undated; wording from W3C search extract, page not fetched) | verified | AAA, not a conformance requirement for most products; W3C gives CJK characters being roughly twice as wide as the reason for 40 |
| Contested cap at wide widths | Wikipedia's 960px limit vs. RfC rough consensus for unlimited default on English Wikipedia (2023)\[17\]\[18\] | Wikipedia:Vector 2022; MediaWiki Vector 2022 design documentation | verified | Contradiction: a readability rationale versus user preference for density on reference content; both reported |
| Reflow minimum | Content must work at 320 CSS px wide without two-dimensional scrolling; equals 1280px at 400% zoom\[9\]\[10\]\[51\] | W3C, Understanding SC 1.4.10 Reflow (WCAG 2.1, undated) | verified | Excepts content needing two-dimensional layout (maps, data tables)\[52\] |
| Target size | 24×24 CSS px minimum, WCAG 2.5.8 AA: targets "at least 24 by 24 CSS pixels", with five exceptions (Spacing, Equivalent, Inline, User Agent Control, Essential); 44×44 CSS px, WCAG 2.5.5 AAA | W3C, Understanding SC 2.5.8 Target Size (Minimum) (undated, fetched via enrichment); W3C, Understanding SC 2.5.5 Target Size (Enhanced) (undated; wording from search extract) | verified | 24px is a floor; W3C itself suggests aiming for 2.5.5 on important controls; the 44px practice default is AAA |
| Platform targets | Apple 44pt; Material 48dp\[53\] | Secondary (WebAbility glossary) | secondary | Native units; transfer to CSS px not sourced |
| List-detail pane widths | List pane fixed width, detail pane flexible; at least one flexible pane\[6\]\[54\] | SAP Fiori for Android summarising Material (undated); Material layout pages | secondary | Pane-width principle is consistent across sources |
| Fixed pane value | 360dp (also 412dp) for Material's fixed pane;\[55\] 24dp gutter | Third-party implementations: material_layout (Flutter, undated); compose-ui-builder PR #452 (Oct 4, 2026), which used 400dp inbox and 380dp agenda panes\[56\] | secondary | No Material primary page with these numbers was fetched |
| Panes per class | Compact and medium: single pane; expanded and large: two panes recommended; extra-large: consider three\[4\] | m3.material.io Breakpoints (undated; text from search extract because page requires JavaScript) | verified | Native-first guidance |
| Panes per range (web) | Narrow 1, regular up to 2, wide up to 3 (wide from 1400px)\[3\] | Primer Layout (undated) | verified | Primer's content max-width at xlarge is 1280px including 24px padding |
| Current spread of widths, mobile | 414×896 13.35%, 360×800 7.54%, 384×832 7.1%, 390×844 6.05%, 393×873 4.18%, 360×780 3.39%\[57\] | StatCounter, Mobile Screen Resolution Stats Worldwide, September 2026 | verified | Screen resolution, not viewport; browser chrome, split screen and zoom reduce the usable width |
| Current spread of widths, desktop | 1920×1080 28.07%, 1536×864 10%, 1366×768 7.95%, 1280×720 4.71%, 2560×1440 3.95%\[58\] | StatCounter, Desktop Screen Resolution Stats Worldwide, September 2026 | verified | Screen, not window; desktop windows are often narrower than the screen |
| Combined | 1920×1080 10.12%, 414×896 7.1%, 360×800 5.86%\[59\] | StatCounter, Desktop/Mobile/Tablet, July 2026 | verified | Page-view weighted, not user weighted |

Interpretation (judgment, Alembic): the mobile spread clusters between 360 and 414 CSS px, and every phone width in the top six is below 600. Desktop screens start at 1280, but the window is not the screen. WCAG 1.4.10 also means a 1280px desktop user at 400% zoom gets the 320px layout, so the narrow layout serves desktop users too, not just phones.\[10\]

### Container queries versus viewport media queries

| Claim | Source (dated) | Label |
|---|---|---|
| Container queries apply styles based on a container's size, name or styles, as "an alternative to media queries"\[14\]\[16\] | MDN, CSS container queries (undated, accessed 2026-10-10) | verified |
| Container queries are supported in all major browsers (as of the post's year)\[16\] | MDN blog, "Getting started with CSS container queries" (date not captured) | verified |
| Tailwind v4 ships container-query variants alongside viewport breakpoints (e.g. @sm = 24rem)\[30\] | Tailwind responsive design docs (current 2026) | verified |
| Viewport-keyed list-detail breaks when placed in a narrower container: 360px + 104px panes measured in a 520px container on a 1200px window; fix proposed was to key on the container's inline size\[15\] | Kanso UI issue #1488 (undated) | secondary (single source) |
| Material layouts resolve pane widths against the window\[55\] | material_layout (Flutter) README (undated) | secondary |

Ruling (judgment, Turner): use viewport (or window) queries for page-level decisions, meaning navigation placement and the number of top-level panes. Use container queries for any component that can appear in more than one width context: cards, list rows, a detail pane rendered inside a pane, dialogs, side sheets. A component that queries the viewport is only correct in the one context it was designed in.

### How many breakpoints

| Evidence | Source (dated) | Label |
|---|---|---|
| Designers usually design for only 2–3 breakpoints in practice\[13\] | NN/g, Apr 5, 2024 | verified (single source) |
| "Don't go overboard"; use major and minor breakpoints\[45\] | Brad Frost, Sept 18, 2013 | verified |
| Primer: 3 viewport ranges for layout, plus 5 fine-tuning breakpoints\[23\]\[42\] | Primer Layout (undated) | verified |
| Material: 5 width classes; Tailwind: 5; Bootstrap: 6 tiers\[4\]\[11\]\[60\] | Respective docs | verified |
| Empirical study of how many breakpoints products of different sizes need | — | Not found |

Interpretation (judgment, Alembic): the counts above describe toolkits, which have to serve every product, not what any one product needs. The only claim about need is NN/g's, which is practitioner guidance and a single source.

## Decision procedure

Every step is judgment (Vesper and Turner lenses) built on the verified quantities above. Run it per screen.

1. **One job and worst moment (Vesper).** What is the screen's one job, and what does the user need at the worst moment (one-handed, interrupted, zoomed to 200%)? Design the narrowest layout for that moment first, at 320 CSS px.
2. **Flow or collection?** If the screen is one flow read or filled top to bottom (article, form, settings page, checkout step, chat transcript), choose (a) scale-up. If it is a collection the user moves through repeatedly while needing context from the previous item, go to step 3.
3. **Does seeing two things at once save a navigation round-trip?** If users triage, compare or edit item after item, choose (b) adapt (list-detail). If not, keep (a) and let the list scale up.
4. **Is navigation used constantly across sections?** If yes and the content is a flow, choose (c) hybrid: navigation adapts (bar or menu, then rail, then sidebar) and content stays the same.
5. **Place each break by sum, not by device.** Break width = navigation (if persistent) + minimum list pane + gutters + minimum detail width (the detail's measure, not the window). Round up to the nearest token in your scale. Add a third pane only when the sum with an inspector still leaves the detail at its minimum.
6. **Choose the query type (Turner).** Navigation and pane count use the viewport. Everything inside a pane uses its container.
7. **Count the cost (Turner).** List the layout states the screen now has: panes visible, selection present or absent, empty, loading, error. Each must be reachable by keyboard, and back and focus must survive a resize across the break. If the count doubles and step 3 was marginal, go back to (a).
8. **Verify.** Test at 320 CSS px, at each break edge (one token below and above), with text at 200%, at 400% zoom on a 1280 window, by keyboard before mouse, and on a mid-range phone before a laptop (Turner).

### Worked screen A (synthetic): account profile form, eight fields, one save action

| Step | Answer | Result |
|---|---|---|
| 1 | One job: update details and save; worst moment is a phone with keyboard open | Labels above inputs, single column at 320 |
| 2 | One flow | (a) scale-up |
| 4 | It sits in a settings area of about six sections visited often | (c) hybrid for the settings area: navigation becomes a rail or sidebar when it fits; the form stays the same |
| 5 | Form measure capped at about 60–75 characters (Baymard, GOV.UK). Sidebar break = sidebar width + gutter + form measure + margins. The sidebar and form widths are the team's own values (Not in source) | One break, for navigation only; no content break |
| 6 | The sidebar break uses the viewport; the form's field-pair rows use the container | — |
| 7 | States: navigation as menu or as sidebar; form idle, dirty, saving, error, saved | About 2 navigation × 5 form states |
| Ruling | Hybrid at area level, scale-up at screen level. Tradeoff named (Vesper): dead width beside a capped form on wide monitors, accepted for readability and lower QA surface | — |

### Worked screen B (synthetic): support ticket queue, list of tickets plus ticket detail with reply box

| Step | Answer | Result |
|---|---|---|
| 1 | One job: clear the next ticket; worst moment is an agent on a phone between tasks | Narrow: list, then push to detail, with back returning to the list item focused |
| 2–3 | A collection worked repeatedly; seeing the list while replying saves a round-trip per ticket | (b) adapt to list-detail |
| 5 | Using the secondary Material fixed-pane figure (360) as the list width, a 24 gutter, and a detail minimum the team derives from its own measure (Not in source; for example 480): 360 + 24 + 480 + 2 × 24 margins = 912 CSS px. That falls above Primer's 768 and Material's 840 | Break at the nearest token at or above about 912, not at 768 or 840 by default |
| 5 (third pane) | Customer-info inspector at a team-chosen width (Not in source; for example 320) + gutter: 912 + 344 = 1256 | Third pane from about 1256; compare Primer wide 1400 and Material extra-large 1600 |
| 6 | Navigation and pane count use the viewport; ticket rows and detail use container queries, so the detail also works inside the narrow single-pane state | — |
| 7 | States: 1-pane list, 1-pane detail, 2-pane with and without selection, 3-pane; each with empty, loading, error | About 5 layouts × 3 data states; the main QA cost |
| Ruling | Adapt. Tradeoff named (Vesper): the two-pane state roughly doubles the layout states. Keyboard triage (next or previous ticket) must also have a touch equivalent so it does not stay desktop-only | — |

## Rules of thumb

| # | Rule | Label | Override when |
|---|---|---|---|
| 1 | Default every screen to one column at 320 CSS px; it must reflow without horizontal scrolling\[8\]\[52\]\[61\] | verified (WCAG 1.4.10) | Content that needs two-dimensional layout (maps, data tables, canvases), the WCAG exception |
| 2 | Cap prose and form measure at 50–75 characters\[1\]\[2\] | verified (Baymard; GOV.UK 75) | Reference or tabular content where users have shown they prefer density (Wikipedia RfC); then offer a width toggle, not a silent removal |
| 3 | Break where the content's minimum widths no longer fit, rounded up to the scale; do not import device values\[43\]\[62\]\[63\] | judgment (Turner), consistent with Frost 2013 and Primer | A shared design system across many products needs common tokens; use them, but check each screen's sum against the token |
| 4 | Two or three layout breaks per product is the ceiling to start from | judgment (Vesper), supported by NN/g 2024 (single source) | Working tools with a third inspector pane, or very wide dashboards |
| 5 | List-detail: list pane fixed, detail pane flexible; never two fixed panes\[6\]\[54\] | verified (Material, via secondary summaries) | Comparison views where both panes are equal peers (split even), which Material allows below expanded |
| 6 | Third pane only at very wide windows\[3\] | verified (Primer wide ≥1400; Material XL ≥1600 "consider")\[3\]\[4\] | The inspector is the primary task (e.g. a property editor); then it may replace the list instead of being added |
| 7 | Navigation adapts (bar or menu, rail, sidebar); content does not have to\[4\] | verified (Material bar-to-rail guidance) | Products with two or three destinations; a top bar may serve all widths (judgment) |
| 8 | Components in more than one width context use container queries; page structure uses viewport queries\[16\]\[46\]\[64\] | judgment (Turner), supported by MDN and Every Layout | Single-context components with no reuse; a viewport query is cheaper to reason about |
| 9 | Targets at or above 44 CSS px on touch layouts; never below 24 | verified (W3C Understanding SC 2.5.8 AA floor 24 CSS px; SC 2.5.5 AAA 44 CSS px) | Dense pointer-first layouts at wide widths may go toward 24 with spacing, only if the same control is not the touch layout |
| 10 | Every desktop-only interaction (hover, right-click, drag, shortcut) has a touch-reachable equivalent | judgment (Turner) | Purely additive accelerators where the same action is already one tap away |
| 11 | Test each break one token below and above, while resizing, with text at 200% and at 400% zoom on a 1280 window | judgment (Turner), built on WCAG 1.4.10 | None |
| 12 | Treat dp and pt thresholds as native conventions, not CSS px values | judgment (Alembic): no source found equating them | A project that ships native and web from one layout spec and has measured its own mapping |

## Evidence

| Claim | Source (dated) | Label | Note |
|---|---|---|---|
| Tailwind's five default breakpoints are 640/768/1024/1280/1536 (rem in v4), "inspired by common device resolutions"\[11\]\[29\] | tailwindcss.com/docs/responsive-design, Overview (current docs; accessed 2026-10-10) | verified | Also documents container-query sizes, @sm 24rem |
| Tailwind's pre-2019 values were taken from Bootstrap; changed to device resolutions (768 iPad, 1024 iPad Pro, 1280 13" MacBook Pro, sm 568)\[12\] | github.com/tailwindlabs/tailwindcss/pull/683, Feb 23, 2019 | verified | Author called Bootstrap's values "fairly arbitrary" |
| Bootstrap breakpoints 576/768/992/1200/1400, chosen to hold multiples-of-12 containers\[31\] | getbootstrap.com/docs/5.3/layout/breakpoints, Available breakpoints (undated; accessed 2026-10-10) | verified | Same wording in 6.0 docs |
| Android width classes: 600/840/1200/1600dp with device-share coverage (99.96%, 93.73%, 97.22%)\[5\] | developer.android.com, Use window size classes (undated; accessed 2026-10-10) | verified | Window, not device; not isTablet logic |
| Large and Extra-large classes added in Jetpack WindowManager 1.5\[35\] | developer.android.com blog, Jetpack WindowManager 1.5 is stable (date not captured) | verified | — |
| Material: five breakpoints; compact and medium single pane; expanded and large two; extra-large consider three; bar to rail\[4\] | m3.material.io/foundations/layout/applying-layout (undated; page requires JavaScript, text from search extract) | verified | Native-first |
| Layouts must flex between classes\[47\] | developer.android.com codelab, Design an Adaptive Layout with Material Design (undated) | verified | — |
| Apple size classes regular and compact, per device and multitasking\[37\]\[38\] | developer.apple.com HIG Layout (undated; text from search extract) | verified | No numeric threshold found in HIG |
| iPad compact below about 640pt\[40\] | Medium, Tyler Howarth (undated) | secondary | Single secondary source |
| Windows breakpoints 640/1008 effective px; design for window\[41\] | learn.microsoft.com, Screen sizes and breakpoints (undated) | verified | — |
| Primer viewport ranges narrow <768, regular ≥768, wide ≥1400; narrow list-detail split into pages; bottom-sheet pane\[3\]\[22\]\[23\] | primer.github.io/design/foundations/layout and primer.style (undated; accessed 2026-10-10) | verified | Design system, not observed product |
| Older Primer breakpoints based on where content starts to break\[43\] | github.com/primer/css docs/content/support/breakpoints.md (commit b5e0097, undated) | verified | — |
| Narrow/regular/wide nomenclature introduced\[65\] | github.com/primer/css/pull/1995 (date not confirmed) | verified | — |
| GOV.UK: no more than 75 characters per line; tablet breakpoint 640px; two-thirds/one-third layout\[2\]\[19\]\[20\] | design-system.service.gov.uk Layout, Spacing, Type scale (undated) | verified | — |
| NHS: breakpoints 320/641/769/990; max page width 960px; 70–80 characters\[21\] | service-manual.nhs.uk Layout (undated) | verified | — |
| The 768 desktop value was derived from iPad widths\[44\] | github.com/alphagov/govuk-frontend/issues/7461 (undated) | secondary | Contributor's assumption |
| Wikipedia Vector 2022 limits article width to 960px for readability\[17\] | mediawiki.org Skin:Vector/2022/Design documentation (undated) | verified | — |
| Width toggle at windows ≥1,600px (Nov 2022); RfC rough consensus for unlimited width default (Jan–Mar 2023)\[18\] | en.wikipedia.org Wikipedia:Vector 2022, timeline | verified | Contradiction with the readability rationale |
| Shopify theme editor: nav to top bar and collapsible sidebar on wide; settings panel slides up on smaller\[24\] | changelog.shopify.com, Redesigned theme editor navigation, Mar 25, 2026 | verified | Theme editor, not core admin |
| Slack: tabs that don't fit on resize go into "More"; consolidated tabs from Sept 2025\[25\]\[26\] | slack.com help articles 360000411963 (undated) and 44134792609555 (Sept 2025 per text) | verified | No thread-pane width behaviour found |
| Notion side peek keeps database interactive on the left\[27\] | notion.com/releases/2022-07-20 | verified | Not tied to width |
| Gmail reading pane is a user setting\[28\] | support.google.com/mail/answer/9499937 (undated) | verified | No automatic width behaviour found |
| Optimal measure 50–75 characters\[1\] | baymard.com research article, Line Length Readability (2010, updated 2014 per secondary; accessed 2026-10-10) | verified | — |
| WCAG 1.4.8: width no more than 80 characters or glyphs (40 if CJK) | w3.org/WAI/WCAG20/Understanding/visual-presentation (undated; wording from search extract) | verified | W3C page not fetched; AAA |
| Reflow at 320 CSS px = 1280 at 400%\[10\] | w3.org/WAI/WCAG21/Understanding/reflow (undated) | verified | Two-dimensional exception |
| Target size at least 24 by 24 CSS pixels (2.5.8 AA, five exceptions); at least 44 by 44 CSS pixels (2.5.5 AAA) | W3C Understanding SC 2.5.8 Target Size (Minimum) (undated, fetched); w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html (undated; search extract) | verified | W3C suggests aiming for 2.5.5 on important controls |
| Apple 44pt, Material 48dp targets\[53\] | webability.io glossary (undated) | secondary | — |
| Container queries as alternative to media queries\[14\]\[16\] | developer.mozilla.org, CSS container queries (undated) | verified | — |
| Viewport-keyed list-detail squeezes in narrow containers\[15\] | github.com/kanso-labs/kanso-ui/issues/1488 (undated) | secondary | Single source |
| Fixed pane 360/412dp;\[55\] 24dp gutter\[56\] | material_layout README; compose-ui-builder PR #452 (Oct 4, 2026) | secondary | Not from a Material primary page |
| Content-determined breakpoints; don't go overboard\[45\] | bradfrost.com, 7 Habits of Highly Effective Media Queries, Sept 18, 2013 | verified | — |
| Stephen Hay's "expand until it breaks" heuristic,\[66\] from his BDConf Orlando 2012 talk "Responsive Design Workflow" | bradfrost.com, "BDConf: Stephen Hay presents Responsive Design Workflow", Apr 17, 2012 (earliest relay found); adactio.com/journal/5425, Apr 26, 2012 | secondary | Frost's live notes, not Hay's own text |
| Viewport queries have no bearing on available space; intrinsic layout\[46\] | every-layout.dev/layouts/sidebar (undated) | verified | — |
| 2–3 breakpoints in practice; device-class ranges\[13\] | nngroup.com, Breakpoints in Responsive Design, Kelley Gordon, Apr 5, 2024 | verified | Single source for the count |
| Mobile and desktop resolution shares\[57\]\[58\]\[59\] | gs.statcounter.com, Mobile and Desktop Screen Resolution Stats Worldwide, Sept 2026; combined July 2026 | verified | Screen, not viewport |
| Strategy fit by task kind, costs, decision procedure, worked screens | This note | judgment | Vesper and Turner lenses |

## Not found

- Origin of Tailwind's current sm 640 and 2xl 1536 values; the 2019 PR gives 568 for sm, and no source for the move to 640 was found.
- Origin of Bootstrap's specific 576 and 992 values beyond the multiples-of-12 statement.
- A primary Apple source giving numeric width thresholds for size classes.
- Any source equating Material dp or Apple pt thresholds with CSS px for web use.
- A Material primary page (fetched) stating the 360dp fixed list-pane width or a minimum detail-pane width.
- A minimum pane width for a three-pane web layout from any primary source.
- An empirical study of how many breakpoints products of different sizes need.
- Viewport (window) width distributions, as opposed to screen resolution, dated 2026.
- Verified width-triggered behaviour for Gmail, Linear, Discord, Medium, Substack, Amazon, and Slack's thread pane.
- Fewer than three verified, dated examples of the hybrid strategy (c) in named products; Material guidance, GOV.UK's grid and Notion's side peek are the closest found.
- Stephen Hay's own text of the heuristic; the earliest relay found is Brad Frost's BDConf live notes (Apr 17, 2012).
- The W3C Understanding pages for WCAG 1.4.8 and 2.5.5 were not fetched; those claims rest on W3C wording in search extracts (2.5.8 was fetched).

## Promote to library

Yes. The procedure and rules hold for any web product, and the breakpoint-origins table settles a recurring argument with sourced origins. Two refresh triggers before reuse: the product examples are thin (fewer than three verified per strategy), and the viewport-share figures date from September 2026. The examples and shares should be refreshed in each review cycle; the rules and procedure should not need to change.

## Sources

1. [Readability: The Optimal Line Length](https://baymard.com/research-articles/line-length-readability)
2. [design-system.service.gov.uk](https://design-system.service.gov.uk/styles/layout)
3. [Layout](https://primer.github.io/design/foundations/layout/)
4. [Breakpoints](https://m3.material.io/foundations/layout/applying-layout)
5. [Use window size classes](https://developer.android.com/develop/ui/views/layout/use-window-size-classes)
6. [List-Detail](https://www.sap.com/design-system/fiori-design-android/v25-4/layouts/list-detail)
7. [Material 3 list-detail layout on tablets and wide windows by sreichholf · Pull Request #589 · sreichholf/dreamDroid](https://github.com/sreichholf/dreamDroid/pull/589)
8. [Accessibility - PageLayout](https://primer.style/product/components/page-layout/accessibility/)
9. [Responsive](https://primer.style/product/getting-started/foundations/responsive/)
10. [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html)
11. [Responsive Design - Tailwind CSS](https://v2.tailwindcss.com/docs/responsive-design)
12. [Update default breakpoints by adamwathan · Pull Request #683 · tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss/pull/683)
13. [Breakpoints in Responsive Design](https://www.nngroup.com/articles/breakpoints-in-responsive-design/)
14. [CSS container queries - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)
15. [fix(list-detail): lay the panes out by their container rather than the window · Issue #1488 · kanso-labs/kanso-ui](https://github.com/kanso-labs/kanso-ui/issues/1488)
16. [getting started with css container queries](https://developer.mozilla.org/en-US/blog/getting-started-with-css-container-queries)
17. [Skin:Vector/2022/Design documentation - MediaWiki](https://www.mediawiki.org/wiki/Skin:Vector/2022/Design_documentation)
18. [Wikipedia:Vector 2022](https://en.wikipedia.org/wiki/Wikipedia:Vector_2022)
19. [Spacing](https://design-system.service.gov.uk/styles/spacing/)
20. [Type scale](https://design-system.service.gov.uk/styles/type-scale/)
21. [Layout](https://service-manual.nhs.uk/design-system/styles/layout)
22. [Layout](https://primer.style/foundations/layout)
23. [Layout](https://primer.style/product/getting-started/foundations/layout/)
24. [redesigned theme editor navigation](https://changelog.shopify.com/posts/redesigned-theme-editor-navigation)
25. [Use Slack with a screen reader](https://slack.com/help/articles/360000411963-Use-Slack-with-a-screen-reader)
26. [A consolidated set of tabs for Slack on desktop](https://slack.com/help/articles/44134792609555-A-consolidated-set-of-tabs-for-Slack-on-desktop)
27. [July 20, 2022](https://www.notion.com/releases/2022-07-20)
28. [Preview your emails - Gmail Help](https://support.google.com/mail/answer/9499937?hl=en)
29. [Tailwind Media Queries](https://tailkits.com/blog/tailwind-media-queries/)
30. [Responsive design - Core concepts - Tailwind CSS](https://tailwindcss.com/docs/responsive-design)
31. [Breakpoints · Bootstrap v5.3](https://getbootstrap.com/docs/5.3/layout/breakpoints/)
32. [Breakpoints · Bootstrap v6.0](https://getbootstrap.com/docs/6.0/layout/breakpoints/)
33. [Googlebook: what Android developers must do for laptops](https://creuto.com/googlebook-android-adaptive-app-requirements)
34. [Layout](https://m3.material.io/foundations/layout/layout-overview/overview)
35. [Jetpack WindowManager 1.5 is stable](https://developer.android.com/blog/posts/jetpack-window-manager-1-5-is-stable)
36. [Master Adaptive Layouts in Compose Multiplatform: Build Truly Responsive UIs](https://medium.com/@thebackbit/master-adaptive-layouts-in-compose-multiplatform-build-truly-responsive-uis-89184bf8b6de)
37. [Layout - Foundations - Human Interface Guidelines - Design - Apple Developer](https://developers.apple.com/design/human-interface-guidelines/foundations/layout/)
38. [Adaptivity and Layout - Human Interface Guidelines - GitBook](https://miniring.gitbook.io/hig/visual-design/adaptivity-and-layout)
39. [Stop discussing devices; start discussing size classes!](https://sanzaru84.medium.com/stop-discussing-devices-start-discussing-size-classes-066d75b30664)
40. [Regular and Compact iOS display size breakdown for designers](https://medium.design/regular-and-compact-ios-display-size-breakdown-for-designers-d3ff3044e06e?gi=959ea509997a)
41. [screen sizes and breakpoints for responsive design](https://learn.microsoft.com/windows/uwp/design/layout/screen-sizes-and-breakpoints-for-responsive-design)
42. [Primer CSS Breakpoint and Up - GeeksforGeeks](https://www.geeksforgeeks.org/css/primer-css-breakpoint-and-up/)
43. [css/docs/content/support/breakpoints.md at b5e009778ec01b6e983cba6cbf89cebfdc5a4124 · primer/css](https://github.com/primer/css/blob/b5e009778ec01b6e983cba6cbf89cebfdc5a4124/docs/content/support/breakpoints.md)
44. [Consider adjusting tablet/desktop breakpoints · Issue #7461 · alphagov/govuk-frontend](https://github.com/alphagov/govuk-frontend/issues/7461)
45. [7 Habits of Highly Effective Media Queries](https://bradfrost.com/blog/post/7-habits-of-highly-effective-media-queries/)
46. [The Sidebar: Every Layout](https://every-layout.dev/layouts/sidebar/)
47. [Design an Adaptive Layout with Material Design](https://developer.android.com/codelabs/adaptive-material-guidance)
48. [Line length and how responsive design has reshaped how we read](https://www.ethicalpixels.com/insights/2022/line-lengths/)
49. [Controlling Line Length in CSS for Better Readability](https://blog.openreplay.com/controlling-line-length-css-readability/)
50. [Implement Optimal Line Length for Better Readability and WCAG Compliance · outline/outline · Discussion #8461](https://github.com/outline/outline/discussions/8461)
51. [WCAG 1.4.10 Reflow — No Horizontal Scrolling at 320px (Level AA)](https://accessibility.build/wcag/1-4-10)
52. [1.4.10 Reflow - AAArdvark](https://aaardvarkaccessibility.com/wcag-plain-english/1-4-10-reflow/)
53. [Target Size - Complete Guide](https://www.webability.io/glossary/target-size)
54. [Canonical Layouts](https://www.sap.com/design-system/fiori-design-android/v24-12/foundations/adaptive-layout/canonical-layouts)
55. [GitHub - kacpmu/material\_layout: Material 3 adaptive layouts for Flutter: the canonical list-detail, supporting-pane and feed layouts, adaptive navigation placement, resizable panes, adaptive sheets and foldable support. · GitHub](https://github.com/kacpmu/material_layout)
56. [feat: support adaptive list-detail and pane sizing by yschimke · Pull Request #452 · yschimke/compose-ui-builder](https://github.com/yschimke/compose-ui-builder/pull/452)
57. [Mobile Screen Resolution Stats Worldwide](https://gs.statcounter.com/screen-resolution-stats/mobile/worldwide)
58. [Desktop Screen Resolution Stats Worldwide](https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide)
59. [Desktop, Mobile & Tablet Screen Resolution Stats Worldwide](https://gs.statcounter.com/screen-resolution-stats/desktop-mobile-tablet/worldwide/)
60. [bootstrap/site/content/docs/5.3/layout/breakpoints.md at v5.3.3 · twbs/bootstrap](https://github.com/twbs/bootstrap/blob/v5.3.3/site/content/docs/5.3/layout/breakpoints.md)
61. [WCAG 2.2 1.4.10 Reflow - Complete Guide with Examples](https://www.thewcag.com/criteria/1.4.10)
62. [Responsive Breakpoints: A Practical Guide (2026)](https://ultimatedesigntools.com/blog/how-to-use-responsive-breakpoints/)
63. [Responsive Web Design: Breakpoints, Layouts & Real Testing Guide - DEV Community](https://dev.to/prateekshaweb/responsive-web-design-breakpoints-layouts-real-testing-guide-5ee5)
64. [Relearn CSS layout: Every Layout — Fuzzy Logic](https://fuzzylogic.me/posts/relearn-css-layout-every-layout/)
65. [Add narrow/regular/wide viewport range utilities by vdepizzol · Pull Request #1995 · primer/css](https://github.com/primer/css/pull/1995)
66. [Adactio: Journal—Fanfare for the common breakpoint](https://adactio.com/journal/5425)
