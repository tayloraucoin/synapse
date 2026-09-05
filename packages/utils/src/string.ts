/** Trim + lowercase for email input fields and auth comparisons. */
export function normalizeEmailInput(value: string): string {
  return value.trim().toLowerCase();
}

/** Returns the first non-empty string after trimming, or "" if none qualify. */
export function firstNonEmpty(...values: (string | undefined)[]): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/**
 * Truncate at a whole character with an ellipsis, or return the string
 * unchanged. `max` counts the ellipsis, so the result never exceeds it.
 */
export function truncate(value: string, max: number): string {
  if (max <= 0) return "";
  if (value.length <= max) return value;
  if (max === 1) return "…";
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Count-aware noun — `pluralize(1, "item")` → "item", `pluralize(3, "item")` →
 * "items". Pass `plural` for the irregulars.
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

/**
 * Display name with a trailing gap baked into the string so the space cannot be
 * swallowed at a JSX `{expr} word` boundary.
 * Use `{ enSpace: true }` under tracked caps.
 */
export function withTrailingGap(
  name: string,
  options?: { enSpace?: boolean },
): string {
  const gap = options?.enSpace ? "\u2002" : " ";
  return `${name.trimEnd()}${gap}`;
}

/**
 * Up to `max` initials for the default avatar — official spec §9.8. Takes the
 * first letter of the first and last word, so "Taylor Anne Aucoin" reads "TA".
 */
export function getInitials(name: string, max = 2): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1 || max === 1) {
    return (words[0] ?? "").slice(0, max).toUpperCase();
  }
  const first = words[0] ?? "";
  const last = words[words.length - 1] ?? "";
  return `${first.charAt(0)}${last.charAt(0)}`.slice(0, max).toUpperCase();
}
