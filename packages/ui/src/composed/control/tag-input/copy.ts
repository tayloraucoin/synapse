/**
 * TagInput's sentences — UX v1.2 §4.6 (RUN-7). [COPY — needs Vesper sign-off]
 */
export const TAG_INPUT_COPY = {
  remove: (tag: string) => `Remove ${tag}`,
  /** The muted count near the cap: *3 of 5*. */
  count: (used: number, max: number) => `${used} of ${max}`,
  atMax: (max: number) => `That's ${max} — the most a passage carries.`,
} as const;
