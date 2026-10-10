# Typography — which component, and when

**Authority:** the operator's brand kit (Design System artifact
`EhNLGGfozdciR27ukmtmxL`, `tokens.json` → `type`), carried into `preset.css` by
WEB-1, and the v2 component handoff §5.1 (the `Text` contract). This guide is
how to pick; those two are why. `yarn check-brand docs` holds the ramp below to
the preset.

---

## The rule in one line

**Every piece of text is a `Text`.** A bare `<p>`, `<span>`, or `<h1>` with a
`className` is how a scale drifts.

---

## Two families, each with one job

| Family          | Variable                                                           | Where                                                                                            |
| --------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Public Sans** | `--font-sans` (`next/font`, `--font-public-sans`)                  | The interface. Every label, row, button, time, setting. Weights 400, 500 and 600, and no others. |
| **Newsreader**  | `--font-serif` (`next/font`, `--font-newsreader`, optical size on) | Review screens only: the Day Review and Week Review titles and their written summary.            |

Newsreader appears nowhere else: not on the List, the Schedule, the journal,
the orient frame or a passage. Its arrival is how the product says the day is
over.

---

## The ramp

| Style          | Size | Leading | Weight       | Use                                       |
| -------------- | ---- | ------- | ------------ | ----------------------------------------- |
| `title`        | 22px | 28px    | 600, -0.01em | the day or screen name; one per screen    |
| `heading`      | 17px | 24px    | 600          | sheet titles and section names            |
| `body`         | 15px | 22px    | 400          | item names and running copy               |
| `label`        | 13px | 18px    | 500          | buttons, tabs, chips and states           |
| `figure`       | 13px | 18px    | 500          | times, counts and percentages, tabular    |
| `caption`      | 12px | 16px    | 400          | reasons and provenance under an item      |
| `review-title` | 26px | 32px    | 500          | a Day or Week Review's title (Newsreader) |
| `review-body`  | 17px | 26px    | 400          | a Review's written summary (Newsreader)   |

Each is a `--fs-*` and `--lh-*` pair in the preset and a Tailwind utility
(`text-title`, `text-label`, …). One product delta sits outside the ramp:
`--fs-timer` (2rem), the focus timer's figure only.

---

## Choosing a variant

The `Text` variant names predate the kit; each now resolves to a kit style.

```
Is it the one heading on the screen?
├── yes → <Heading>            variant="heading" → the kit's title (22/28, 600)
└── no
    ├── Is it a row's title?   → variant="row-title" → the kit's heading (17/24)
    ├── Is it a Review's title or its summary?
    │   ├── title              → variant="review-headline" → review-title (Newsreader 26/32, 500)
    │   └── summary            → variant="review-sentence" → review-body (Newsreader 17/26)
    ├── Is it a second line — template name, section span, "from Thu"?
    │                          → <Meta>   variant="secondary" → the kit's label (13/18)
    ├── Is it the smallest thing — a helper line, a square's label?
    │                          → <Caption> → caption (12/16)
    └── otherwise              → variant="body" → body (15/22), the default
```

There is **no all-caps variant, no eyebrow and no single-word italic.** Labels
are sentence case.

---

## The presets

| Preset      | Is                                     | Use for                                                                   |
| ----------- | -------------------------------------- | ------------------------------------------------------------------------- |
| `<Heading>` | `as="h1" variant="heading" tone="ink"` | The one screen heading. Pass `as="h2"` for every heading after the first. |
| `<Caption>` | `variant="caption" tone="secondary"`   | Helper text, a tier's weighting line, a strip square's label.             |
| `<Meta>`    | `variant="secondary" tone="secondary"` | The muted second line: the applied template, a section's span.            |

---

## Tones

| Tone                 | Role                | Holds                       |
| -------------------- | ------------------- | --------------------------- |
| `ink`, `body`        | `foreground`        | 17.62:1 light, 16.55:1 dark |
| `secondary`, `muted` | `muted-foreground`  | 6.51:1 light, 7.55:1 dark   |
| `accent`             | `link`              | 5.33:1 light, 6.33:1 dark   |
| `violet`             | `off-schedule-text` | 6.38:1 light, 7.41:1 dark   |

Every tone holds 4.5:1 on `background` and `surface` in both themes, so no tone
is "large text only". `violet` means off schedule and nothing else. `accent` is
a link or a word in the brand colour; text is never set in brand-500.

---

## Tabular figures

**On by default, everywhere**: `body` sets `font-variant-numeric: tabular-nums`
globally, so every time, count and percentage holds its column. Opt out for
prose with `tabular={false}`.

---

## Common mistakes

| Wrong                                      | Right                                | Why                                                                 |
| ------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------- |
| `<p className="text-sm text-neutral-500">` | `<Meta as="p">`                      | A raw class is a scale that drifts, and a raw step skips the role.  |
| `<Text className="text-[14px]">`           | a variant                            | 14px is not on the ramp.                                            |
| `<Heading>` twice on one screen            | `<Heading>` then `<Heading as="h2">` | One `h1` per screen.                                                |
| Newsreader on a day row or a journal field | `font-sans`                          | Newsreader is Review screens only.                                  |
| `font-bold`                                | `weight={600}`                       | The kit uses 400, 500 and 600, no others.                           |
| `<Text tone="violet">` for emphasis        | `tone="ink"` + weight                | Violet means off schedule.                                          |
| `space-y-(--space-3)` on `Text` children   | `flex flex-col gap-(--space-3)`      | `Text` ships `m-0`, which wins. See [classnames.md](classnames.md). |
