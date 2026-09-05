/**
 * @syn/ui — the web component library. Storybook-first.
 *
 * This is the one web-only package: it may reach for the DOM, and nothing else
 * shared may. That is what makes the future Expo app a re-skin — logic stays
 * platform-pure in `@syn/{types,constants,utils,validators,hooks}`, and only
 * this package is rebuilt.
 *
 * Every export is enumerated here and mirrored by an explicit subpath in
 * package.json. There is no `"./*"` wildcard export.
 */

export { cn } from "./lib/cn";
export { useIsWide, useMediaQuery } from "./lib/use-media-query";
export { usePrefersReducedMotion } from "./hooks/use-prefers-reduced-motion";
export { useAppTheme } from "./hooks/use-theme";
export { ThemeProvider } from "./providers/theme-provider";

export {
  Caption,
  Heading,
  Meta,
  REVIEW_TEXT_VARIANTS,
  TEXT_TONES,
  TEXT_VARIANTS,
  Text,
  inferVariantFromElement,
  textVariants,
  type TextClasses,
  type TextProps,
  type TextTone,
  type TextVariant,
} from "./primitives/typography/text";

export {
  THEME_CONTROL_COPY,
  THEME_OPTIONS,
  ThemeControl,
  type ThemeControlProps,
  type ThemeOption,
} from "./composed/control/theme-control";

export {
  ACCENT_STEPS,
  CATEGORY_AUTHORED_STEPS,
  CATEGORY_DERIVED_STEPS,
  CATEGORY_KEYS,
  CATEGORY_STEPS,
  DESTRUCTIVE_TOKEN,
  NEUTRAL_STEPS,
  SEMANTIC_TOKENS,
  VIOLET_STEPS,
  accentToken,
  categoryToken,
  neutralToken,
  violetToken,
  type AccentStep,
  type CategoryStep,
  type NeutralStep,
} from "./branding";
