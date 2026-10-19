# Brand tokens — the name to type, for the thing you mean

**Authority:** the operator's brand kit (Design System artifact
`EhNLGGfozdciR27ukmtmxL`, `project/tokens.json`), re-mapped into
`packages/config/tailwind/preset.css` by WEB-1. The preset is the **only file in
the repository where a raw colour may appear**. This page is the lookup table,
so you can find `bg-background` without reading the CSS. The reasoning is in
[`docs/ux/branding-guide.md`](../ux/branding-guide.md). `yarn check-brand docs`
fails when this page and the preset disagree.

---

## The three layers

```
raw ramp         --syn-neutral-900     the kit's OKLCH value, theme-independent
     ↓
role             --foreground          what it means; flips inside .dark
     ↓
Tailwind         text-foreground       what you type
```

The shadcn bridge (`--card`, `--popover`, `--secondary`, `--muted`, `--accent`,
`--ring`, `--sidebar-*`) points at roles: `--card` is `--background`;
`--popover`, `--secondary`, `--muted` and `--accent` are `--surface`; `--ring`
is `--now`. **Type the role.** A raw step (`--syn-brand-500`) is never typed in
a component; `yarn check-brand shape` fails on one.

---

## Colour roles

| Token                      | Light         | Dark          | You mean                                           | Utility                       |
| -------------------------- | ------------- | ------------- | -------------------------------------------------- | ----------------------------- |
| `--background`             | `neutral-50`  | `neutral-900` | the page                                           | `bg-background`               |
| `--surface`                | `neutral-100` | `neutral-800` | a sheet, the Review card, hover                    | `bg-surface`                  |
| `--foreground`             | `neutral-900` | `neutral-100` | body text and headings                             | `text-foreground`             |
| `--muted-foreground`       | `neutral-600` | `neutral-400` | times, counts, reasons, helper copy                | `text-muted-foreground`       |
| `--border`                 | `neutral-200` | `neutral-700` | a hairline between rows, around sheets             | `border-border`               |
| `--input`                  | `neutral-500` | `neutral-500` | a field's or checkbox's boundary                   | `border-input`                |
| `--primary`                | `neutral-900` | `neutral-100` | the one filled button                              | `bg-primary`                  |
| `--primary-foreground`     | `neutral-50`  | `neutral-900` | its label                                          | `text-primary-foreground`     |
| `--now`                    | `brand-500`   | `brand-400`   | the now line, the current-item dot, the focus ring | `bg-now` `border-now`         |
| `--link`                   | `brand-600`   | `brand-400`   | a link, a word in the brand colour                 | `text-link`                   |
| `--off-schedule`           | `violet-500`  | `violet-400`  | the off-schedule marker                            | `border-off-schedule`         |
| `--off-schedule-text`      | `violet-600`  | `violet-300`  | the words "Off schedule" and their time            | `text-off-schedule-text`      |
| `--destructive`            | `red-500`     | `red-500`     | Delete account's fill, and nothing else            | `bg-destructive`              |
| `--destructive-foreground` | `neutral-50`  | `neutral-50`  | its label                                          | `text-destructive-foreground` |
| `--destructive-text`       | `red-600`     | `red-300`     | the warning above Delete account                   | `text-destructive-text`       |

**Never:** text in `brand-500` (3.75:1 on paper); a teal fill; red for missed,
errors or warnings. Those are `foreground` or `muted-foreground`.

## Category chips and dots

The chip is filled with `bg-category-<hue>-chip` and the name on it is
`text-foreground`; the dot (and a Schedule block's leading edge) is
`bg-category-<hue>-dot`. Always beside the category's name. The kit gives these
per theme in sRGB, and the values live only in the preset (copied from the kit's
`tokens.json`); they are a proposal until signed off. Chip text holds 14:1 or
more in light and 10.8:1 or more in dark; every dot holds 3.3:1 or more on
`background`.

| Token                   | Light         | Dark          |
| ----------------------- | ------------- | ------------- |
| `--category-leaf-chip`  | `tokens.json` | `tokens.json` |
| `--category-leaf-dot`   | `tokens.json` | `tokens.json` |
| `--category-sky-chip`   | `tokens.json` | `tokens.json` |
| `--category-sky-dot`    | `tokens.json` | `tokens.json` |
| `--category-clay-chip`  | `tokens.json` | `tokens.json` |
| `--category-clay-dot`   | `tokens.json` | `tokens.json` |
| `--category-rose-chip`  | `tokens.json` | `tokens.json` |
| `--category-rose-dot`   | `tokens.json` | `tokens.json` |
| `--category-amber-chip` | `tokens.json` | `tokens.json` |
| `--category-amber-dot`  | `tokens.json` | `tokens.json` |
| `--category-slate-chip` | `tokens.json` | `tokens.json` |
| `--category-slate-dot`  | `tokens.json` | `tokens.json` |
| `--category-plum-chip`  | `tokens.json` | `tokens.json` |
| `--category-plum-dot`   | `tokens.json` | `tokens.json` |
| `--category-moss-chip`  | `tokens.json` | `tokens.json` |
| `--category-moss-dot`   | `tokens.json` | `tokens.json` |

**Block hues, planning surfaces only** (the primer, the builder's B7, B13, B14,
B17, screen 5; never `/today` or the Schedule): `bg-block-<kind>` is the kind's
category chip and `text-block-label` is `foreground` (UX v1.3 R47, TD-29;
mapping `[PROPOSED]` §13 #31).

## Raw ramps

`--syn-neutral-*`, `--syn-brand-*`, `--syn-violet-*` and `--syn-red-*`, steps
50 to 900, in the kit's OKLCH. Step 500 is the exact brand value in each hue;
neutral-50 is paper and neutral-900 is ink. Raw steps are reached through a
role, never typed.

## The mark

`--logo-disc` and `--logo-rule` hold the placeholder mark's fixed inks for
`SynapseMark`: neutral-900 and brand-500 in light, neutral-50 and brand-400 in
dark.

---

## Type

| You mean             | Utility                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| The interface family | `font-sans` (Public Sans)                                                                                                       |
| The Review family    | `font-serif` (Newsreader), Review screens only                                                                                  |
| A style              | `text-title`, `text-heading`, `text-body`, `text-label`, `text-figure`, `text-caption`, `text-review-title`, `text-review-body` |

In practice you rarely type these: use `<Text variant>`. Sizes and leading are
in [typography-guidelines.md](typography-guidelines.md).

---

## Space, radius, motion

| You mean                                            | Token                                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Spacing, the whole scale (4, 8, 12, 16, 24, 32, 48) | `--space-1` `--space-2` `--space-3` `--space-4` `--space-6` `--space-8` `--space-12`, as `gap-(--space-4)` |
| The screen gutter                                   | `--space-4`                                                                                                |
| A row's minimum height (56px)                       | `--row-min`                                                                                                |
| A touch target (44px)                               | `--target`                                                                                                 |
| Content width                                       | `--content-text` 720px · `--content-canvas` 960px                                                          |
| Workflow's board tracks                             | `--board-col-wide` 320px · `--board-col` 240px                                                             |
| Prose measure (64ch)                                | `--measure`                                                                                                |
| A control's corners (6px)                           | `--radius-control` (also `--radius`), as `rounded-(--radius)`                                              |
| A sheet's corners (10px)                            | `--radius-sheet`                                                                                           |
| A state change (120ms)                              | `--dur-state`                                                                                              |
| A sheet (200ms)                                     | `--dur-sheet`                                                                                              |
| Easing                                              | `--ease-settle`                                                                                            |
| The running thread's dot (2400ms)                   | `--dur-breathe`, as `motion-safe:animate-breathe` on `FiringMark` only                                     |
| A scrim                                             | `--scrim` (ink at 40%)                                                                                     |

There is no shadow token and no pill radius. Both duration tokens collapse to
`0ms` under `prefers-reduced-motion`.

---

## The rules that outrank convenience

1. **No raw colour outside `preset.css`.** Not in a component, not in a story.
   The only exceptions are static metadata CSS cannot reach (the viewport
   `themeColor`, the manifest) and Google's own mark.
2. **No arbitrary spacing.** The scale is 4, 8, 12, 16, 24, 32, 48.
3. **Colour is never the only carrier.** A dot and the word; a chip and the name.
4. **Verdigris never fills a surface and is never body text.**
5. **Nothing red except Delete account.**
6. **No shadows, no gradients, nothing round** except the mark, a category dot
   and the current-item dot.

## Retired names

Kept as one-line aliases in the preset's marked block until a codemod retires
them; new code uses the role. `--paper` is `--background`; `--ink` and
`--text-body` are `--foreground`; `--text-secondary`, `--text-muted` and
`--text-disabled` are `--muted-foreground`; `--hairline` and `--fill-muted` are
`--border`; `--edge` is `--input`; `--accent-text` is `--link`; `--violet-text`
is `--off-schedule-text`; the `accent-mark` and `violet-mark` utilities are
`now` and `off-schedule`; `--fs-secondary` is `--fs-label` and `--fs-row-title`
is `--fs-heading`. Removed outright: `--shadow-overlay`, `--radius-full`, the
`--syn-accent-*`, `--syn-cat-*` and `--syn-destructive-500` scales, `--chip-*`,
`--violet-band`, `--accent-hover-surface`, `--space-5` and `--space-7` (now
`--space-6` and `--space-12`; the old `--space-6` is `--space-8`).
