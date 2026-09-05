import { cva } from "class-variance-authority";

/**
 * The Synapse type scale — official spec §9.4, fixed by v2 handoff §5.1.
 *
 * Two families, each with one job. Geist Sans is the interface: every label,
 * row, button, time, setting. Newsreader is the reflective surfaces only — the
 * Day Review header, the Week Review header, the adherence sentence, and
 * reflection notes as typed. Never on the List or the Schedule; that is the
 * "ceremony where bandwidth exists" rule made visible.
 *
 * There is no all-caps variant (§9.4: no all-caps labels, no tracked-out
 * eyebrows). If you want one, the answer is no.
 */
export const TEXT_VARIANTS = [
  "caption",
  "secondary",
  "body",
  "row-title",
  "heading",
  "review-headline",
  "review-sentence",
] as const;

export const TEXT_TONES = [
  "ink",
  "body",
  "secondary",
  "muted",
  "accent",
  "violet",
] as const;

export type TextVariant = (typeof TEXT_VARIANTS)[number];
export type TextTone = (typeof TEXT_TONES)[number];

/** Newsreader variants — the reflective surfaces. */
export const REVIEW_TEXT_VARIANTS = [
  "review-headline",
  "review-sentence",
] as const satisfies readonly TextVariant[];

/**
 * Every heading tag maps to the one heading variant. Synapse has a single
 * screen heading size (§9.4) — the level is a document-structure decision, not
 * a size decision, so `as="h2"` renders at the same size as `as="h1"` and the
 * consumer keeps one `h1` per screen (cross-cutting §11).
 */
const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export function inferVariantFromElement(tag: string): TextVariant | undefined {
  return (HEADING_TAGS as readonly string[]).includes(tag)
    ? "heading"
    : undefined;
}

/**
 * textVariants — the CVA definition for the Text primitive.
 *
 * THEMING — tones map to semantic tokens that already flip inside `.dark`
 * (`preset.css`), so there is no `dark:` utility here and no second colour to
 * keep in sync. One token, both themes.
 *
 * FONT FAMILIES — `font-sans` / `font-serif`, mapped in `@theme inline` to
 * `--font-sans` / `--font-serif`. Do NOT write `font-(--font-serif)`:
 * Tailwind v4 mis-parses a font-family arbitrary value as a font-weight.
 *
 * SIZES — canonical CSS-variable syntax, `text-(length:--fs-body)`, never
 * `text-[length:var(--fs-body)]`.
 *
 * tone="muted" is neutral-400, which passes AA only at large sizes — official
 * spec §9.3 says "muted text (large only)". Use it on `row-title` and up, or
 * for non-essential text with an accessible name elsewhere.
 */
export const textVariants = cva("m-0", {
  variants: {
    variant: {
      caption: "font-sans text-(length:--fs-caption) leading-(--lh-caption)",
      secondary:
        "font-sans text-(length:--fs-secondary) leading-(--lh-secondary)",
      body: "font-sans text-(length:--fs-body) leading-(--lh-body)",
      "row-title":
        "font-sans font-medium text-(length:--fs-row-title) leading-(--lh-row-title)",
      heading:
        "font-sans font-semibold text-(length:--fs-heading) leading-(--lh-heading)",
      "review-headline":
        "font-serif text-(length:--fs-review-headline) leading-(--lh-review-headline) wide:text-(length:--fs-review-headline-wide)",
      "review-sentence":
        "font-serif text-(length:--fs-body) leading-(--lh-body)",
    },
    tone: {
      /** neutral-800 light / neutral-100 dark — primary text. */
      ink: "text-ink",
      /** neutral-600 / neutral-200 — body copy on paper. */
      body: "text-text-body",
      /** neutral-500 / neutral-300 — secondary text. */
      secondary: "text-text-secondary",
      /** neutral-400 both themes — large text only (§9.3). */
      muted: "text-text-muted",
      /** accent-600 / accent-300 — links and the accent word beside a marker. */
      accent: "text-accent-text",
      /** violet-600 / violet-300 — off-schedule, and only off-schedule (§9.3). */
      violet: "text-violet-text",
    },
    weight: {
      400: "font-normal",
      500: "font-medium",
      600: "font-semibold",
    },
    tabular: {
      true: "tabular-nums",
      /** `body` sets tabular globally; this is the documented opt-out. */
      false: "tabular-off",
    },
  },
  defaultVariants: {
    variant: "body",
    tone: "ink",
  },
});
