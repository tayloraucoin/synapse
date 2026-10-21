# Logo exploration: findings

2026-10-20. Brief: [`brief.md`](brief.md). The canvas is the "Logo" page of the Synapse Paper file. That canvas is a view; the code rebuild is the source of truth.

## What was shown

The operator was shown four rows, each with its own screenshot. Every row held:

- the square mark on a 512 grid, the wordmark and a horizontal lockup;
- the reproduction suite: 16px and 32px, one flat colour, reversed on neutral-900, the 40%-radius maskable circle plus a circular mask, and an Android-style themed tint;
- a strip against seven category marks, drawn as simplified silhouettes;
- an R1–R12 table with the failing checks shown.

| Dir                      | Mark                                                                                                           | Tally                                 | Plumb (consulted)                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| A, the day split refined | Disc r192 cut by a 48 gap centred 48 below the middle. A 16 rule sits in the gap and ends on the disc's curve. | 7 pass, 3 partial, 1 fail (R8), 1 n/a | On-system as is                                                                     |
| B, the closed notebook   | Cover with a band standing proud of the top and bottom edges                                                   | 7 / 3 / 1 / 1                         | Needs a rule change: the band is the rule turned upright (§8)                       |
| C, the letter S          | Two half-discs offset into an S, ink only, with a custom S in the wordmark                                     | 7 / 3 / 1 / 1                         | Needs a token and rule change: `--logo-rule` retired, a `SynapseWordmark` primitive |
| D, the rule alone        | One ink bar broken by a central gap                                                                            | 7 / 3 / 1 / 1                         | First draft off-system; the redraw was not re-ruled                                 |

The tallies tie, so the difference lies in what each partial is about.

Found while drawing:

- **The current placeholder fails R7 (verified by geometry).** Its rule runs from x=24 to 488, outside the 204.8 safe circle.
- **D's first draft was redrawn before it was shown.** It split ink and verdigris 240:96 and read as a progress bar at about 70%, which the product rules forbid (Plumb). It was shown as equal ink halves.
- **C's custom S (judgment).** In the wordmark it reads as a split oval before it reads as an S.
- **Competitor marks (Hearth, verified against App Store artwork, 2026-10-20).** None of the seven marks (Things 3, Todoist, TickTick, Sunsama, Structured, Tweek, Day One) uses a cut circle, a half disc, a horizontal rule or a letter S. Four of the seven use a check. Sunsama's mark is a whole warm disc, so A keeps its disc in ink and lets the cool rule carry the cut.

## The operator's decision

The operator's answer at the gate, in their words: **"A: day split (Recommended)"**.

## Refinement of A (done once)

This is the frame "A — Refined: lockup system (chosen)" on the Logo page.

- **Master.** Disc r192 centred on the 512 grid; the unit is 16, which is 1px at 32. The gap runs from y280 to y328. The rule runs from y296 to y312 as an arc-ended band that follows the disc's curve, with no clipPath.
- **Small master (16 to 31px).** No rule; caps cut at y272 and y336, so the gap is 64.
- **Clear space.** x = r/2 around the disc's bounds, which is 96 on the master. Around a lockup it is D/4.
- **Horizontal lockup.** Disc diameter D = 1.4 × cap height, centred on the cap height. The gap from the disc to the S is D/2. The wordmark is Public Sans 500, -0.02em, set type with no letter changes.
- **Stacked lockup.** D = 3 × cap height, centred over the word. The disc sits D/4 above the cap top.
- **Minimum sizes.** Mark 16px, using the small master below 32px. Lockup at a 16px wordmark. Wordmark alone at 14px.
- **Icons.** The light mark on paper (#FAFAF8) with disc r170 on 512. That leaves 86 to the edge, which covers the r/2 clear space of 85, and stays inside the 204.8 circle. The same art serves the 180 apple-touch icon, 192/512 any and 192/512 maskable. Favicon: master at 32, small master at 16.
- **Inks.** Unchanged: `--logo-disc` and `--logo-rule`, light and dark as in preset.css today.
- **Rubric after refinement:** 8 pass, 3 partial (R2, R3, R6), 1 n/a (R12). R8 moves from fail to pass.

## What is untested (rule 11)

- **Fame and uniqueness** among category buyers (C1). Nobody outside this thread has seen the mark.
- **The R2 two-second pick-out and the R3 recognition after one look.** Both need real people. No model rated any mark as memorable, and none should (F3).
- **Apple's tinted and clear appearances** (R6). They were not drawn, and the 2026-06 Human Interface Guidelines grid was not read (research, Not found).
- **Real rendering of the 16px master.** The canvas renders vectors with antialiasing; a raster favicon at 16px needs checking in a browser tab.
- **Competitor silhouettes.** They were drawn from Hearth's descriptions, not traced from the artwork.

## Open items

- [NEEDS DECISION] Where the placeholder notice and pillar line live in code: the SVG `<desc>` or the component's header comment (research, "Put to Plumb" 3).
- [PROPOSED] Add one line to branding guide §8 that records the 16px master, the clear space x = r/2 and the icon disc r170. This is Plumb's paperwork note; it changes no rule.

## Round 3: deeper into A (2026-10-20, rejected)

Brief: push A deeper, not wider, under the operator's new framing of the name (brief.md, Meaning). Drawn on the frame "Round 3 — rejected by the operator" on the Logo page, which was left unfinished.

- **Dropped before the gate (judgment):** four changes to the mark's silhouette. The past faded above the rule read as a two-tone ball and as disabled. A heavier rule (gap 64, rule 32) turned the band loud. Stacked list slits read as a menu icon. Shearing the halves read as a glitch and broke the mirror symmetry. Each made A worse, so the master stayed as chosen.
- **Shown in part:** "A, one line". The disc was raised 0.034em so its rule's centre sat on the centre of the final e's crossbar, which was drawn in the rule's ink. Measured on Public Sans 500 (Google Fonts v21, canvas pixel scan): the crossbar spans 234–303/1000 em above the baseline, cap height 723, round overshoot 9–10 (verified by measurement). Hearth: it fits Quiet, then Deliberate, and a coloured letter part is a common device (judgment, not checked). Plumb: it needs a carve-out from branding guide §3 rule 2, and no new token.
- **The operator's words:** "everything you're doing for round 3 looks terrible just go with the original A."

Decision: the frame "A — Refined: lockup system (chosen)" ships as it stands. Wordmark: set Public Sans 500, -0.02em, no letter change.

## Rebuild (2026-10-20)

- `SynapseMark` (`packages/ui/src/composed/display/synapse-mark/`) draws the chosen master: disc r192, gap y280–328, arc-ended rule y296–312. `small` gives the small master (no rule, gap y272–336) for a disc under 32px. The viewBox is the disc's bounds, so the element's size is the disc's diameter. Before this, code still drew the kit placeholder: r200, with a square-ended rule from x24 to x488 overhanging the disc.
- PWA icons (`apps/web/public/icons/`, 192 and 512, any and maskable) and the 180 apple-touch icon: the light mark on paper (#FAFAF8), disc r170 on 512, opaque RGB. `apps/docs/public/icon-192.png` uses the same art.
- `apps/web/app/favicon.ico`: the small master at 16 and the master at 32, on paper. The entries must be RGBA PNGs, or Next fails to decode the ICO and every route, the manifest included, answers 500 in dev (verified, then fixed).
- Rendered by a one-off sharp script, not committed. The inks are the token values converted from oklch: neutral-50 #FAFAF8, neutral-900 #151412, brand-500 #2F8F80.

## The installed PWA shows an "S"

The operator's phone shows a letter "S" in place of the icon. On a local dev server, `/manifest.webmanifest` returns 200 JSON with all four icons. The head carries `apple-touch-icon` at 180, and every icon loads without cookies (verified, port 3120). The proxy's matcher skips `.png` and `favicon.ico` (verified, `apps/web/proxy.ts`). Not found: the deployed URL, so the hosted site was not checked. [ASSUMPTION: the cause is on the host, for example deployment protection answering the phone's cookie-less icon request with a sign-in page, or a home-screen icon cached from an earlier install.]

## What is still untested (rule 11)

Everything under the first round's list still holds. Also untested: the new icons on a real iOS and Android home screen, and the favicon in a browser tab at 16px.
