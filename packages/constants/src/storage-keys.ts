/**
 * Browser-storage keys, namespaced once so nothing collides and every key is
 * greppable. `@syn/constants` is platform-pure: this module names the keys, it
 * never touches browser storage — the web-only leaf that reads them does.
 *
 * Prefix keys are concatenated with the id they scope (`syn:draft:${habitId}`).
 */
export const STORAGE_KEYS = {
  /** next-themes writes the System/Light/Dark choice here (official spec §9.3). */
  THEME: "syn:theme",
  /** Per-surface dismissals — the install line, the once-a-day late offer. */
  DISMISSED_PREFIX: "syn:dismissed:",
  /** Unsent form-sheet drafts, keyed by the record being edited. */
  DRAFT_PREFIX: "syn:draft:",
  /** Set when the install status line is dismissed; it never returns (§5.1). */
  INSTALL_DISMISSED_UNTIL: "syn:install-dismissed-until",
} as const;
