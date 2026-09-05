# Typography — which component, and when

**Authority:** official UX spec §9.4 (the scale and the two families), v2
component handoff §5.1 (the `Text` contract). This guide is how to pick; those
two are why.

---

## The rule in one line

**Every piece of text is a `Text`.** A bare `<p>`, `<span>`, or `<h1>` with a
`className` is how a scale drifts — one surface at 15px, another at 16px, and
no one able to say which is right.

---

## Two families, each with one job

| Family | Variable | Where |
|---|---|---|
| **Geist Sans** | `--font-sans` | The interface. Every label, row, button, time, setting. |
| **Newsreader** | `--font-serif` | The reflective surfaces only: the Day Review header, the Week Review header, the adherence sentence and its formula, reflection notes as typed. |

Newsreader **never** appears on the List or the Schedule. That is the "ceremony
where bandwidth exists" rule made visible: the execution tabs are for someone
who has asked not to think, and a serif there is the product clearing its
throat.

---

## Choosing a variant

```
Is it the one heading on the screen?
├── yes → <Heading>            (h1, 1.375rem/1.3, weight 600)
└── no
    ├── Is it a row's title?   → variant="row-title"  (1.125rem/1.4, weight 500)
    ├── Is it the reflective surface's headline or its sentence?
    │   ├── headline           → variant="review-headline"  (Newsreader 1.75rem, 2.25rem wide)
    │   └── sentence           → variant="review-sentence"  (Newsreader 1rem/1.5)
    ├── Is it a second line — template name, section span, "from Thu"?
    │                          → <Meta>   (0.875rem, secondary tone)
    ├── Is it the smallest thing — a helper line, a square's label?
    │                          → <Caption> (0.75rem, secondary tone)
    └── otherwise              → variant="body" (1rem/1.5), the default
```

There is **no all-caps variant and no eyebrow**. Official spec §9.4: no
all-caps labels, no tracked-out eyebrows. If you want one, the answer is no.

---

## The presets

| Preset | Is | Use for |
|---|---|---|
| `<Heading>` | `as="h1" variant="heading" tone="ink"` | The one screen heading. Pass `as="h2"` for every heading after the first — the size does not change, the level is document structure. |
| `<Caption>` | `variant="caption" tone="secondary"` | Helper text, the quiet weighting line under a tier name, a strip square's label. |
| `<Meta>` | `variant="secondary" tone="secondary"` | The muted second line: the applied template, a section's span, *from Thu*. |

---

## Tones

`ink · body · secondary · muted · accent · violet` — each maps to a semantic
token that already flips inside `.dark`, so **a component never writes a
`dark:` colour**.

- `muted` is `neutral-400` in both themes and passes AA **at large sizes only**
  (official spec §9.3). Use it on `row-title` and up, or where an accessible
  name carries the meaning.
- `violet` means **off-schedule and nothing else**. It is the one semantic
  colour with its own scale precisely because it carries meaning alone; using
  it decoratively spends that.
- `accent` is for a link or the word beside a now/soon marker. The accent never
  fills a surface.

---

## Tabular figures

**On by default, everywhere** — `body` sets `font-variant-numeric: tabular-nums`
globally. A column of times that does not align is the defect this prevents.

Opt **out** for prose with `tabular={false}` (the adherence sentence, a
reflection note). There is no opt-in, because the default is already on.

---

## Common mistakes

| Wrong | Right | Why |
|---|---|---|
| `<p className="text-sm text-neutral-500">` | `<Meta as="p">` | A raw class is a scale that drifts. |
| `<Text className="text-[17px]">` | a variant | 17px is not on the scale (§9.4). |
| `<Heading>` twice on one screen | `<Heading>` then `<Heading as="h2">` | One `h1` per screen (cross-cutting §11). |
| Newsreader on a day row | `font-sans` | §9.4: the reflective surfaces only. |
| `<Text tone="violet">` for emphasis | `tone="ink"` + weight | Violet means off-schedule. |
| `space-y-(--space-3)` on `Text` children | `flex flex-col gap-(--space-3)` | `Text` ships `m-0`, which wins. See [classnames.md](classnames.md). |
