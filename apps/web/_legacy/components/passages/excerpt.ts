/**
 * The card's excerpt — UX v1.2 §4.6: "two-line serif excerpt". The Markdown
 * stripped to text for a decorative preview; the body itself is rendered by
 * the editor's read-only mode wherever it is read (TD-15). Two lines of
 * regex, not a library, because the excerpt is clamped and decorative.
 */
export function excerptOf(bodyMd: string): string {
  return bodyMd
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^[>\-*+#\s]+/gm, "")
    .replace(/[*_`~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** The first line of the body, plain — the card's name when there is no title. */
export function firstLineOf(bodyMd: string): string {
  const line = bodyMd.split(/\r?\n/).map((entry) => excerptOf(entry)).find((entry) => entry !== "");
  return line ?? "";
}
