# Synapse — branding guide

**Source of truth:** the operator's brand kit, the Design System artifact
[`EhNLGGfozdciR27ukmtmxL`](https://claude.ai/artifact/EhNLGGfozdciR27ukmtmxL)
(`project/README.md`, `tokens.json`, `contrast.md`, `brand-pillars.md`,
`voice.md`, `assets/Logos/`). Where the kit and any older spec disagree, the
kit wins. This page is the kit as it lands in this repository: the reasoning
in its order, with the code paths beside it.

| The thing                    | Where it lives in the repo                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Every value, both themes     | [`packages/config/tailwind/preset.css`](../../packages/config/tailwind/preset.css), the only file where a raw colour may appear |
| Which token or class to type | [`brand-tokens.md`](../ai-guides/brand-tokens.md)                                                                               |
| Which text style             | [`typography-guidelines.md`](../ai-guides/typography-guidelines.md)                                                             |
| Product deltas on the canon  | [`apps/web/docs/design/DESIGN.md`](../../apps/web/docs/design/DESIGN.md)                                                        |
| Strings                      | [`specs/web/ux/_global/copy-register.md`](../../specs/web/ux/_global/copy-register.md)                                          |
| The non-negotiables          | [`apps/web/docs/product-rules.md`](../../apps/web/docs/product-rules.md)                                                        |
| The guard                    | `yarn check-brand shape \| docs \| trust`                                                                                       |

The guide before the kit is archived at [`docs/archive/branding-guide.md`](../archive/branding-guide.md).

---

## 1. What Synapse is

A private daily list. Plan the week once, move through each day without
thinking, close it honestly each night. When a comparison is needed it is to a
notebook, never to a habit tracker, a planner or a productivity app.

**Essence:** a notebook that tells the truth and then leaves the day alone.
**Purpose:** to give back attention during the day, and the truth about it
afterwards. **Audience:** one archetype, someone who sets their own structure
and whose days change.

## 2. Three pillars, ranked

| Rank | Pillar               | It is                                                                    | It is not |
| ---- | -------------------- | ------------------------------------------------------------------------ | --------- |
| 1    | **Quiet** (dominant) | silent while the day runs; exactly where it was left when wanted         | absent    |
| 2    | **Candid**           | records what happened in the plainest word, with no verdict              | judging   |
| 3    | **Deliberate**       | decided once, at the start of the week; bends without calling it failure | rigid     |

**When two pull apart, Quiet wins.** A completion figure is true, and Candid
would show it on the List tab; Quiet keeps it for the Review. A reminder would
serve Deliberate; Quiet sends it once and never repeats it.

Where they overlap: _truth with no audience_ (Quiet and Candid: privacy is what
makes candour possible); _held to what was chosen, and nothing more_ (Candid and
Deliberate: the percentage counts only what was assigned); _decided, so it does
not ask again_ (Deliberate and Quiet).

**Explicitly not us:** streaks, a coach, a dashboard, a second brain, anything
that keeps score.

---

## 3. Colour

Every screen is ink on paper. Colour is spent on three meanings only: time and
focus (verdigris), off schedule (violet), and one destructive act (red).

| Role                           | Light            | Dark             | Use                                                          |
| ------------------------------ | ---------------- | ---------------- | ------------------------------------------------------------ |
| `background`                   | neutral-50       | neutral-900      | the page: paper in light, ink in dark                        |
| `surface`                      | neutral-100      | neutral-800      | the one raised layer: sheets, the Review card, hover         |
| `foreground`                   | neutral-900      | neutral-100      | body text and headings                                       |
| `muted-foreground`             | neutral-600      | neutral-400      | times, counts, reasons, helper copy                          |
| `border`                       | neutral-200      | neutral-700      | hairlines; decorative, carries no meaning alone              |
| `input`                        | neutral-500      | neutral-500      | a field's or checkbox's boundary                             |
| `primary`                      | neutral-900      | neutral-100      | the one filled button: ink, never teal                       |
| `now`                          | brand-500        | brand-400        | the now line, the current-item dot, the focus ring           |
| `link`                         | brand-600        | brand-400        | links and the few words in the brand colour                  |
| `off-schedule` / `-text`       | violet-500 / 600 | violet-400 / 300 | the marker and the words for something done outside its time |
| `destructive` / `-text`        | red-500 / 600    | red-500 / 300    | Delete account, and nowhere else                             |
| `category-<hue>-chip` / `-dot` | per hue          | per hue          | a category's chip and dot, always beside its name            |

The rules:

1. **Never fill a button, a banner or a card with verdigris.** `now` is a line
   or a dot, never a fill behind text.
2. **Never set text in brand-500.** It reaches 3.75:1 on paper: enough for a
   line, too little for words. Text in the brand colour is `link`.
3. **Violet means off schedule, once.** Never decoration.
4. **Red stays on the Delete account screen.** Missed items, errors and
   warnings are `foreground` or `muted-foreground` and say what happened.
5. **A category is a name with a colour beside it.** Hue alone carries nothing.
6. **Separate with `border`. There is no shadow token.**
7. **Reach raw steps through a role.** If no role fits, the design is asking
   for something the brand has not decided.

Every pair the kit lists in `contrast.md` holds in both themes: body text
17.62:1 light and 16.55:1 dark, secondary text 6.51:1 and 7.55:1, link 5.33:1
and 6.33:1, the now line and focus ring 3.75:1 and 6.33:1, input borders 4.00:1
and 4.40:1. Text needs 4.5:1; lines, dots, borders and the ring need 3:1.

## 4. Type

| Family          | Job                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Public Sans** | the interface: `title`, `heading`, `body`, `label`, `figure`, `caption`. Weights 400, 500 and 600, no others |
| **Newsreader**  | Review screens only: `review-title`, `review-body`. Its arrival is how the product says the day is over      |

- Every time, count and percentage is set in `figure` with tabular figures, so
  a column of times holds its edge.
- Sentence case. No capitals for emphasis, no letter-spaced eyebrows, no single
  word in italics.
- Until a wordmark is designed, "Synapse" in plain type is Public Sans at 500.

Sizes and leading are in [`typography-guidelines.md`](../ai-guides/typography-guidelines.md).

## 5. Space, shape and motion

- **Space:** `space-1` to `space-12` (4, 8, 12, 16, 24, 32, 48). The screen
  gutter is `space-4`.
- **Shape:** `radius-control` (6px) for buttons, fields, chips and checkboxes;
  `radius-sheet` (10px) for sheets and the Review card. Nothing is a pill.
  Nothing is round except the mark, a category dot, and the current-item dot
  in `now` [ASSUMPTION: the kit's colour rules name a "current-item dot"; the
  operator ruled it round at WEB-1's first gate].
- **Motion:** 120ms for a state change, 200ms for a sheet, one easing curve.
  Nothing loops, bounces or celebrates; `prefers-reduced-motion` cuts to the
  end state. The one moving thing is Workflow's running-thread dot, which fades
  slowly in `now`: the now line in another form.
- **Focus:** a 2px solid ring in `now`, offset 2px, on every focusable control.

## 6. Words

| It says                                   | Example                                         |
| ----------------------------------------- | ----------------------------------------------- |
| What happened, in the plainest word       | "Missed" · "Not assigned today" · "4 of 6 done" |
| A thing once, then nothing                | "Week built."                                   |
| Labels, not sentences, while the day runs | "List" · "Schedule" · "Close the day"           |

| It never says           | Example                                           | Line it crosses                               |
| ----------------------- | ------------------------------------------------- | --------------------------------------------- |
| Praise or encouragement | "Great job" · "Keep it up" · "3-day streak"       | Candid: a record that cheers is keeping score |
| Urgency or guilt        | "Don't forget" · "Only 2 left" · "Falling behind" | Quiet: that is being managed                  |
| Cuteness or hedging     | "Oops" · "Hmm, something went wrong" · any emoji  | Deliberate: it says what it means             |

- Sentence case. No exclamation marks, no emoji.
- No "you" on the List and Schedule tabs. The Review may address the reader.
- Past tense for what is over, present for what is; never the future as a promise.
- Numbers are stated, never characterised: "4 of 6", not "almost there".
- The vocabulary table in the copy register is the authority for single words.
- **The trust line has one wording wherever it appears:** "Only you can see
  your data. Not the people who built this, not anyone you invite."

## 7. Icons and imagery

- Lucide at a 1.5px stroke, in `foreground` or `muted-foreground`, always beside
  a text label.
- Show the product itself: real screens at real size with a believable day in
  them. No stock photography, no illustrated people.
- Never neurons, brains, nodes, sparks or glows. The name is Synapse; the
  picture is a notebook.
- No gradients, confetti, flames, badges, rings or trophies.

## 8. The mark

A day (the disc) split at the present moment (the rule). The gap is the
synapse: the small space between what was decided and what was done.

- In code: `SynapseMark` in `@syn/ui`, drawn from the kit's `mark.svg`, with its
  inks in `--logo-disc` and `--logo-rule` (ink disc and brand-500 rule in light,
  paper disc and brand-400 rule in dark). It sits beside "Synapse" in the rail.
- The PWA icons and the favicon are the light mark on paper, with clear space of
  half the disc's radius (the maskable icons keep the rule inside the safe zone).
- Never recolour or tilt the rule; never place the mark on a `surface` tint or a
  photograph.

---

## 9. Open brand items

| Item                                                                                                                                                                                             | State             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| **The logo is a placeholder.** The kit's mark and logo files are a draft so screens have a face; a designed logo and wordmark replace them before launch, and the icons are regenerated from it. | Open              |
| **Category colours are a proposal.** The kit generated the eight chip and dot pairs by rule; they ship as given and await sign-off.                                                              | Open              |
| **Legacy token names.** Older names (`paper`, `ink`, `hairline`, `text-secondary`, …) resolve to kit roles through a marked alias block in `preset.css`; a codemod retires them.                 | Drafted follow-up |
| **Working name.** "Synapse" is still the working name.                                                                                                                                           | Open              |
