# Synapse — branding guide

**Status: derived, not authoritative.** Everything on this page is assembled
from documents that already exist. It changes nothing and rules nothing. When
this page and a source disagree, **the source wins** — and this page is the
thing that is wrong.

| The thing | Where it is actually decided |
|---|---|
| Colour, type, space, motion, components, the mark | [`ux-spec-v1.md`](ux-spec-v1.md) **§9** |
| Voice and vocabulary | official spec **§10** |
| Pillars, guardrails, the emotional contract | official spec **§2.3–2.4**, **§9.1–9.2** |
| The accessibility floor | official spec **§11** |
| Every state's visual register | official spec **§5.9** |
| The hex values, as code | [`packages/config/tailwind/preset.css`](../../packages/config/tailwind/preset.css) — the one file where a hex may appear |
| Which class to type | [`docs/ai-guides/brand-tokens.md`](../ai-guides/brand-tokens.md) |
| Which typography component | [`docs/ai-guides/typography-guidelines.md`](../ai-guides/typography-guidelines.md) |
| Component contracts | [`synapse_ui_component_needs_and_handoff_v2.md`](synapse_ui_component_needs_and_handoff_v2.md) §5 |
| What shipped differently | each track's `DEVIATIONS.md` |

> **A standing caution.** `brand-tokens.md` records a deliberate decision not to
> carry a separate branding document, on the grounds that "a third description
> would be a third thing to keep true." This page is that third description. It
> is written as a **read-only orientation** — no new values, no new rules, every
> claim pointing back at its source — so that when §9 or `preset.css` moves,
> this page is stale rather than contradictory. Do not cite it in a ticket. Cite
> §9.

---

## 1. The brand in one paragraph

Synapse is a private daily list you build once a week, move through without
thinking, and close honestly each night. The brand is that sentence made
visible: **a good notebook that a considerate person keeps for you — plain,
warm, exact about times, silent about judgement.** Not a dashboard. Not a game.
Not a wellness brand. (§2.1, §9.2)

The test after every screen: *nothing I did was lost; nothing was rewritten on
my behalf; I'm being shown a record, not a verdict; I can undo this.* (§2.3)

## 2. The five pillars, and what each one costs

Each pillar exists because it has a build consequence. (§9.1)

| Pillar | What it forces |
|---|---|
| **The record is honest** | Ghost-and-annotate, shift bands, edit-with-history, no delete on library items |
| **Assignment is the promise** | The trim is first-class and unpenalised; the number counts only assigned items |
| **Hosted, not sold** | No alarm register in the palette at all; no "you failed"; notifications are only the times the person set |
| **Quiet is the material** | Monochrome foundation, colour as punctuation, type doing the emotional work |
| **Your data is yours** | One trust line, one treatment, reused everywhere the promise appears |

## 3. Three states, three budgets

The same person, on different days. Design decisions are made against the state,
not against a persona. (§2.2)

| State | When | Budget |
|---|---|---|
| **Planning** | Sunday night, calm | Depth is fine — multi-step flows, full configuration, the 1–7 thinking |
| **Executing** | Mid-day, phone in one hand, deliberately not thinking | One idea per screen · targets ≥ 44px · no configuration reachable without leaving the tab · zero copy that asks a question they didn't come to answer |
| **Reviewing** | 9–11pm, tired, possibly disappointed | Three taps per item maximum · neutral copy · an exit that leaves things pending rather than forcing them |

An invited friend arrives in a fourth state — curious and uncommitted — for
exactly one session. First run is built for that and then gets out of the way.

---

## 4. Colour

Monochrome base (warm ink and paper, not gray), **one** brand accent, **one**
semantic violet, **one** reserved destructive, eight category hues. Every scale
runs 100–800 with 500 as the base; neutral additionally carries 50 and 900
because it is the ground. (§9.3)

### 4.1 Neutral — warm ink and paper

| Step | Hex | Light | Dark |
|---|---|---|---|
| 50 | `#FAFAF8` | Paper | — |
| 100 | `#F3F2EE` | Card / sheet surface, skeleton | Ink |
| 200 | `#E7E5DF` | Hairlines, dividers, done-block fill | Secondary text |
| 300 | `#D2CFC7` | Disabled text, ghost outlines | Muted text |
| 400 | `#A6A299` | Muted text (large only), ghost titles | Hairlines (at 40%) |
| 500 | `#78746C` | Secondary text | Disabled |
| 600 | `#57534C` | Body text on paper | Sheet surface |
| 700 | `#3B3834` | Headings | Card surface |
| 800 | `#25231F` | Ink, primary button fill | Elevated surface |
| 900 | `#151412` | — | Paper |

### 4.2 Accent — "verdigris"

The one brand colour. It marks **time** and takes **focus**, and does nothing
else: the now line, the now/soon marker, the focus ring, links, the active-timer
border. Never a button fill. Never a wash.

| 100 | 200 | 300 | 400 | **500** | 600 | 700 | 800 |
|---|---|---|---|---|---|---|---|
| `#E4F1EE` | `#C3E1DB` | `#94C8BE` | `#5FAA9C` | **`#2F8F80`** | `#24736A` | `#1C5A53` | `#14423D` |

Accent **text** is 600 on paper and 300 on dark — 500 is 3.9:1, which passes as
a non-text marker and fails AA as body text.

### 4.3 Violet — off-schedule

Time text, moved-block borders, shift bands. The only semantic colour with its
own scale, because it is the only one that carries meaning alone on a row.

| 100 | 200 | 300 | 400 | **500** | 600 | 700 | 800 |
|---|---|---|---|---|---|---|---|
| `#EFEAF8` | `#DCD2F0` | `#BFAEE1` | `#9E88CE` | **`#7C63B8`** | `#644D9A` | `#4D3B78` | `#372A57` |

Violet text is 600 on paper, 300 on dark. Violet borders are 500 in both. Using
violet decoratively spends the one thing it is for.

### 4.4 Destructive — reserved

`#B4463C`, step 500 only, permitted on **exactly one surface: Delete account.**
Nowhere else — and specifically not on "Missed", which is neutral.

### 4.5 Category hues

Eight, keyed by name. A 2px row edge uses 500; a chip is 100/700 in light and
800/200 in dark. Categories never borrow the accent or the violet, so the
semantic layer stays unambiguous.

| Key | 100 | 500 | 700 |
|---|---|---|---|
| leaf | `#E6F0E4` | `#4F8A5B` | `#2F5A38` |
| sky | `#E4EDF6` | `#4B7FB3` | `#2C5478` |
| clay | `#F6E8E2` | `#C0714F` | `#7E4530` |
| rose | `#F7E6EA` | `#B85C74` | `#7B3A4B` |
| amber | `#F8EFDD` | `#C2923A` | `#7C5B1F` |
| slate | `#E8EAEE` | `#6B7689` | `#434B5A` |
| plum | `#F0E7F1` | `#8E5A93` | `#5C3860` |
| moss | `#EDEFE0` | `#7E8B3F` | `#4F5826` |

All eight 500s pass 3:1 against paper as a 2px non-text edge. The 700-on-100
chip pairings pass AA. **Steps 200 and 800 are derived, not authored** — see
Open items.

### 4.6 The colour rules

1. **Colour is never the only carrier** of a distinction. A dot *and* the word
   *now*; a border *and* the word *moved*; a chip *and* the category's name.
2. **Nothing red, orange, or yellow on the execution tabs.** Amber and clay
   exist only as category hues, only as a 2px edge or a chip.
3. **No gradients.** No shadows except overlays — sheets and dialogs get
   `0 8px 24px rgba(21,20,18,0.12)`, and nothing else gets one.
4. **The accent never fills a surface.**
5. **No hex outside `preset.css`.** Not in a component, not in a story, not
   "just for now."

---

## 5. The four registers

Colour in Synapse is a small vocabulary, and the whole point is that the
registers stay distinct. None of them may be red, flashing, or countdown-shaped.
(§2.4, §5.9)

| Register | Carries | Colour | Word |
|---|---|---|---|
| **Time** — now, soon, open, running | accent-500 dot / line / 1.5px block border | teal | "now" · "soon" · "open" |
| **Off-schedule** — moved, shifted | violet-500 border, violet-600/300 time text, violet band | violet | "moved" · "→ actual" |
| **Passed / done** — the quiet register | 0.55 opacity, or checkbox filled and title to neutral-600 | none | — |
| **Missed / not assigned** — the record | neutral text only, ghost outline | none, ever | "missed · reason" · "not assigned today" |

**Faded is not disabled.** Every passed item stays fully interactive; every done
item stays live. **Not assigned today** is a capacity decision, not a failure,
and never reads as one.

---

## 6. Typography

Two families, clearly distinct, each with exactly one job. (§9.4)

| Family | Job |
|---|---|
| **Geist Sans** (variable) | The interface. Every label, row, button, time, setting. |
| **Newsreader** (variable, optical size on) | The reflective surfaces **only**: the Day Review header line, the Week Review header, the adherence sentence and its formula, reflection notes as typed. |

Newsreader never appears on the List or the Schedule. That is the "ceremony
where bandwidth exists" rule made visible — the execution tabs belong to someone
who has asked not to think, and a serif there is the product clearing its
throat.

**Tabular figures are on by default, everywhere** a time or a count appears, so
columns of times align. Prose opts out.

**Weights:** 400 body · 500 labels and titles · 600 for the one heading on a
screen.

**Scale** (rem / line-height):

| Role | Size | Line |
|---|---|---|
| caption | 0.75 | 1.2 |
| secondary | 0.875 | 1.4 |
| body | 1 | 1.5 |
| row title | 1.125 | 1.4 |
| screen heading | 1.375 | 1.3 |
| review headline (Newsreader) | 1.75 (2.25 wide) | 1.2 |

Prose is capped at **64ch**. There are **no all-caps labels, no tracked-out
eyebrows, and no single-word italics** — and no variant exists for them, so
asking is the same as being told no.

---

## 7. Space, radius, elevation

4px base. The allowed scale is **4 · 8 · 12 · 16 · 24 · 32 · 48** and nothing
else; `gap-[14px]` is a decision nobody made. (§9.5)

| Thing | Value |
|---|---|
| Row minimum height | 56px (44px target + rhythm) |
| Touch target | 44px minimum, always |
| Radius | 6px controls · 10px sheets · full for avatars and the checkbox mark |
| Hairline | 1px neutral-200 light / neutral-400 @ 40% dark |
| Content width | 720px text · 960px canvas |
| The one breakpoint | 768px (`wide:`) |
| Overlay shadow | `0 8px 24px rgba(21,20,18,0.12)` |
| Scrim | `rgba(21,20,18,0.4)` |

**No borders on cards in the List** — separation is rhythm and hairline.

## 8. Motion

Two durations and one easing. (§9.6)

- **120ms** state changes · **200ms** sheets and expansions
- Easing `cubic-bezier(0.2, 0, 0, 1)` — it settles, it does not bounce
- The now line moves by **re-render**, not by animation
- Checkbox completion: the mark draws in over 120ms; nothing else moves
- `prefers-reduced-motion`: sheets crossfade, the mark appears without drawing,
  everything else is already still. Both duration tokens collapse to `0ms`.

Reduced motion is **designed**, not tolerated. (§11)

---

## 9. Components, icons, avatar, mark

### 9.1 Components

shadcn/ui is the base, token-mapped so the defaults do not leak a generic
dashboard look. Everything is a shadcn primitive or a composition of them; there
is **no parallel component with a small difference**. (§9.7)

- **Buttons:** `default` = ink fill, one primary action per screen · `secondary`
  = outlined · `ghost` = text · `destructive` = Delete account only. A label is
  a verb, and the resulting toast reuses it ("Finish review" → "Review
  finished").
- **Toasts:** bottom, one at a time, 4s, no icons, used for undo affordances
  only.
- **Empty states:** two lines and at most two actions. No illustrations in v1.
- **The 1–7 control** (`Stepper17`) is seven 44px segments in a row — selected
  filled ink, the number is the label, wrapping 4 + 3 on narrow screens. **Never
  a slider.**

The named composites and their contracts are in handoff v2 §5.

### 9.2 Iconography

Lucide, **20px on rows, 24px in sheets, 1.5px stroke**. An icon never appears
without a text label, with two exceptions — the checkbox and the timer glyph —
both of which carry `aria-label`s. The habit icon set is a hand-picked subset of
~80 glyphs, tinted by the category key's 500. (§9.9)

### 9.3 Avatar

A single-player product, so the avatar has exactly two homes: the header button
(32px) and Settings → Account (64px). Default is up to two initials in Geist 500
on neutral-200 with neutral-700 text (dark: neutral-700 / neutral-100). Optional
image upload is a 256px square crop through the custom-icon pipeline.

**No status dots, no rings, no presence** — there is no one to be present to.
(§9.8)

### 9.4 The app mark

The stated direction: a filled neutral-800 circle on neutral-50, with a single
horizontal accent-500 rule crossing its lower third — **the now line through a
day**. The PWA manifest is `#FAFAF8` for both `theme_color` and
`background_color` (a manifest is static and cannot follow
`prefers-color-scheme`), while the in-app viewport `themeColor` follows the
theme: `#FAFAF8` light, `#151412` dark.

This is a **direction, not a logo**, and what ships today is a generated
placeholder. See Open items.

---

## 10. Voice

### 10.1 Register

Plain, present, specific. Sentence case. Full stops on sentences, none on
labels. **No exclamation marks anywhere in the product. No emoji in product
copy.** The product does not have a personality that talks; it has a notebook's
voice — it states what is. (§10.1)

On the execution tabs every string is a noun, a time, or a verb in the
imperative. No question marks except inside a sheet the person opened. No "you".
No adjectives. (§5.10)

### 10.2 Say this, not that (§10.2)

| Say | Not | Where |
|---|---|---|
| Habit · Task · Deep work | Activity, routine item, to-do | everywhere |
| Template | Routine, variant, plan, preset | setup |
| Week | Schedule, plan | week build |
| Fixed · Flexible | Hard · Soft | template editor |
| Multitask | Superset, group, stack | everywhere |
| Not assigned today | Skipped, trimmed, removed | trim |
| Missed | Failed, incomplete, overdue | review |
| Something came up · Planned it wrong · Didn't do it | Excused, penalised, weak, lazy | tiers |
| counts as done for the record · counts half · counts as missed | penalty, deduction, points | tiers |
| Moved | Late, rescheduled, delayed | off-schedule |
| Shift my day | Push back, snooze, I'm late | shift |
| Carry forward | Roll over, postpone | review |
| Done | Complete, check off, finish | item |
| Start · Stop · Pause · Resume | Begin, end, track | timer |
| Reminder | Notification, alert, nudge | notifications |
| Archive | Delete | library |
| Only you can see your data | Private, secure, encrypted | trust line |

### 10.3 What the product never says (§10.4)

> "You failed" · "you're behind" · "don't break" · "streak" · "keep it up" ·
> "great job" · "oops" · "unfortunately" · "we" · anything about the reader's
> character · anything in the second person on the execution tabs.

### 10.4 Reference strings (§10.5)

- **Empty day** — *Nothing planned today.* / Plan this day · Add a one-off
- **Trim result** — *Fits in 45 min. Not assigned today: Yoga, Face training,
  Vocal.*
- **Shift, step 3** — *2 items no longer fit before your 11:00 call.*
- **Day Review complete** — *9 of 12 done · 86%* / *9 done, 1 planned wrong (½),
  1 didn't do (0), 1 excused (not counted) → 9.5 / 11.*
- **All done** — *Every item was done.*
- **Pending** — *Yesterday has 3 items to review.*
- **Permission** — *Want a reminder at 7:00 when this comes up? Reminders are
  only ever the times you set.*
- **Offline** — *Offline — changes save on this device.*
- **Trust line** — *Only you can see your data. Not the people who built this,
  not anyone you invite.*

The trust line has **one wording and one treatment**, reused in all three places
it appears: first run, Settings, and export.

---

## 11. Accessibility floor — WCAG 2.2 AA (§11)

- Every interactive target ≥ 44×44px; a row checkbox's hit area extends across
  the row's left 56px.
- Contrast is checked in **both** themes. The known traps: accent-500 and
  violet-500 as text (use 600 / 300), and category 500s as text (never — chips
  are 700-on-100).
- Every state carries a non-colour signal: a word, a glyph, a border, a
  strikethrough.
- Focus-visible on every control — a 2px accent-500 ring at 2px offset, both
  themes. Sheets trap focus; Escape closes.
- Screen readers get "title, time, state" from a row (*"Cold bath, 7:20, done,
  moved from 7:20 to 4:32"*).
- Text scales to 200% with no horizontal scroll; the Schedule axis switches to
  30-minute hairlines above 150%.
- Timers and the now line are `aria-live="off"`. Nothing announces on its own
  except toasts, which are `polite`.

---

## 12. The never list

The consolidated form of §2.4, §9.3, §10.4 and
[`apps/web/AGENTS.md`](../../apps/web/AGENTS.md). These bind every change.

1. No streaks, badges, confetti, HP, scores, commitment contracts, party damage,
   or re-engagement pushes.
2. No numbers about the day on the execution tabs — no counts, no percentages,
   no progress. The only numbers there are times and durations.
3. Nothing red on the execution tabs. Errors are ink and a sentence. "Missed" is
   neutral. `destructive` appears on one button, on one screen.
4. Colour is never the only carrier of a distinction.
5. No second person on the tabs. No "you". No question marks outside a sheet the
   person opened.
6. No hard countdowns; closing-window signals inform, they never pressure.
7. Faded is not disabled. The record is annotated, never rewritten.
8. A notification is a scheduled fact in the person's own words — never a miss,
   a streak, a percentage, or how long since they last opened the app.
9. No gradients; no shadows except overlays; the accent never fills a surface.
10. No hex outside `preset.css`; no arbitrary spacing; no all-caps labels.

---

## 13. Open brand items

Recorded so they are not mistaken for settled. Each already has a home; this
list only gathers them.

| Item | State | Source |
|---|---|---|
| **The final app mark.** §9.8 gives a direction and marks it `[OPEN]`. What ships is a generated placeholder at the token hex values — replace before launch. | Open | official spec §9.8, §13.2 · infrastructure `DEVIATIONS.md` (INF-9) |
| **Category steps 200 and 800.** §9.3 specifies dark chips as 800/200 but the table gives only 100/500/700; `preset.css` derives the other two with `color-mix()`, marked `[PROPOSED — needs sign-off]`. Either confirm the derivation or supply sixteen hexes. | Open | handoff v2 §11 Q2 |
| **The `--accent` collision.** The token file declares `--accent` twice — semantically as accent-500, then in the shadcn bridge as accent-100. The bridge wins, so `var(--accent)` is the pale hover surface, not the marker teal. Use the `accent-mark` utility. Copied verbatim as ruled; renaming the semantic one `--accent-mark` would make the file say what it means. | Flagged for Vesper | infrastructure `DEVIATIONS.md` (INF-3) · [`brand-tokens.md`](../ai-guides/brand-tokens.md) |
| **Working name.** "Synapse" is still the working name. | Open | official spec §13.2 |

---

## 14. Building against this

Nothing here is a class name. When you go to type something:

1. **A colour, size, or duration** → [`brand-tokens.md`](../ai-guides/brand-tokens.md)
2. **Any text at all** → [`typography-guidelines.md`](../ai-guides/typography-guidelines.md) — every piece of text is a `Text`
3. **`className` patterns** → [`classnames.md`](../ai-guides/classnames.md)
4. **A component's anatomy, props, story** → [`component-guidelines.md`](../ai-guides/component-guidelines.md)
5. **Where a string lives** → [`copy-conventions.md`](../ai-guides/copy-conventions.md)

And audit `packages/ui/src/` before building anything — the primitives are
already installed and re-slotted, and most composites already have a contract in
handoff v2 §5. Building a second one is how a design system forks.
