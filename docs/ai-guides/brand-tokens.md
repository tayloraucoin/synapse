# Brand tokens — the name to type, for the thing you mean

**Authority:** official UX spec §9 is the brand. `packages/config/tailwind/preset.css`
is that spec expressed as CSS, and the **only file in the repository where a hex
may appear**. This page is the lookup table, so you can find `bg-paper` without
reading the CSS.

There is no `branding-design-system.md` here. Conscious Connections needs one
because its visual system lives in a document; Synapse's lives in §9 and in the
token file, and a third description would be a third thing to keep true.

---

## The three layers

```
raw scale        --syn-neutral-800     the value, theme-independent
     ↓
semantic         --ink                 what it means; flips inside .dark
     ↓
shadcn bridge    --foreground          what a shadcn primitive reads
     ↓
Tailwind         text-ink              what you type
```

**Type the semantic name.** `text-ink` is right in both themes; `text-neutral-800`
is right in one. Reach for a raw scale only where the value is genuinely
theme-independent (a category hue's 500, the accent mark).

---

## Colour

| You mean | Utility | Token | Light / dark |
|---|---|---|---|
| The page ground | `bg-paper` | `--paper` | neutral-50 / neutral-900 |
| Primary text | `text-ink` | `--ink` | neutral-800 / neutral-100 |
| A sheet or card surface | `bg-surface` | `--surface` | neutral-100 / neutral-800 |
| A hairline or divider | `border-hairline` | `--hairline` | neutral-200 / neutral-400 @ 40% |
| Body copy | `text-text-body` | `--text-body` | neutral-600 / neutral-200 |
| Secondary text | `text-text-secondary` | `--text-secondary` | neutral-500 / neutral-300 |
| Muted text (**large only**) | `text-text-muted` | `--text-muted` | neutral-400 both |
| Disabled text | `text-text-disabled` | `--text-disabled` | neutral-300 / neutral-500 |
| A link, or the word by a marker | `text-accent-text` | `--accent-text` | accent-600 / accent-300 |
| **The now line, the now/soon dot, the active-timer border** | `bg-accent-mark` / `border-accent-mark` | `--syn-accent-500` | the same in both |
| Off-schedule text | `text-violet-text` | `--violet-text` | violet-600 / violet-300 |
| A moved block's border | `border-violet-mark` | `--syn-violet-500` | the same in both |
| A shift band | `bg-violet-band` `text-violet-band-text` | | violet-100 / violet-800 |
| An ink-filled button | `bg-primary text-primary-foreground` | `--primary` | ink, **never the accent** |
| Delete account, and nothing else | `bg-destructive` | `--destructive` | `#B4463C` |
| The focus ring | (automatic) | `--ring` | accent-500 / accent-400 |

### One trap, named

`--accent` in the bridge layer is the **pale hover surface** (accent-100), not
the marker teal. The token file declares `--accent` twice and the bridge wins,
so `var(--accent)` is not what you want for a now line. Use **`accent-mark`**.
The collision is commented in `preset.css`; it is the handoff §6.2 as written,
flagged for Vesper.

### Category hues

Eight, keyed by name: `leaf · sky · clay · rose · amber · slate · plum · moss`.

- A 2px row edge: `bg-cat-<key>-500`
- A chip: `bg-cat-<key>-100 text-cat-<key>-700`, and in dark
  `dark:bg-cat-<key>-800 dark:text-cat-<key>-200`

The 200 and 800 steps are **derived** by `color-mix` and marked
`[PROPOSED — needs sign-off]` (handoff §11 Q2). Categories never use the accent
teal or the violet, so the semantic layer stays unambiguous.

---

## Type

| You mean | Utility |
|---|---|
| The interface family | `font-sans` (Geist) |
| The reflective family | `font-serif` (Newsreader) — Day/Week Review only |
| A size | `text-(length:--fs-caption \| --fs-secondary \| --fs-body \| --fs-row-title \| --fs-heading \| --fs-review-headline)` |

In practice you almost never type these: use `<Text variant>`. See
[typography-guidelines.md](typography-guidelines.md).

---

## Space, radius, motion

| You mean | Utility |
|---|---|
| Spacing (**the whole scale**: 4·8·12·16·24·32·48) | `gap-(--space-1)` … `gap-(--space-7)` |
| A row's minimum height (56px) | `min-h-(--row-min)` |
| A touch target (44px) | `size-(--target)` / `h-(--target)` |
| Content width | `max-w-(--content-text)` 720px · `max-w-(--content-canvas)` 960px |
| Prose measure (64ch) | `max-w-(--measure)` |
| Radius | `rounded-(--radius)` 6px · `rounded-(--radius-sheet)` 10px · `rounded-(--radius-full)` |
| A state change (120ms) | `duration-(--dur-state)` |
| A sheet or expansion (200ms) | `duration-(--dur-sheet)` |
| Easing | `ease-(--ease-settle)` — settles, never bounces |
| The one breakpoint (768px) | the `wide:` variant |
| An overlay shadow | `shadow-(--shadow-overlay)` |
| A scrim | `bg-(--scrim)` |

Both duration tokens collapse to `0ms` under `prefers-reduced-motion`, and
`globals.css` zeroes any hard-coded duration as a floor.

---

## The rules that outrank convenience

1. **No hex outside `preset.css`.** Not in a component, not in a story, not
   "just for now".
2. **No arbitrary spacing.** `gap-[14px]` is a decision nobody made. The scale
   is 4·8·12·16·24·32·48 (§9.5).
3. **Colour is never the only carrier.** A dot *and* the word *now*; a border
   *and* the word *moved*; a chip *and* the category's name (§9.3).
4. **The accent never fills a surface.** It marks time and takes focus.
5. **Nothing red on the execution tabs.** Errors are ink and a sentence.
   `destructive` appears on one button, on one screen.
6. **No gradients, no shadows except overlays** (§9.3).
