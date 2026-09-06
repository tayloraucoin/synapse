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
  /**
   * Each tab's scroll position, kept for the session (cross-cutting §4.3:
   * "each peer keeps its scroll position … for the session"). Concatenated
   * with the tab name — `syn:scroll:list`.
   */
  SCROLL_PREFIX: "syn:scroll:",
  /** Unsent form-sheet drafts, keyed by the record being edited. */
  DRAFT_PREFIX: "syn:draft:",
  /** Set when the install status line is dismissed; it never returns (§5.1). */
  INSTALL_DISMISSED_UNTIL: "syn:install-dismissed-until",
  /**
   * The address AU-03 is waiting on, so *Check your email* can name it and
   * *Resend the link* can send to it. `sessionStorage`, never the URL: an
   * email address in a query string ends up in history and in any referrer.
   */
  AUTH_PENDING_EMAIL: "syn:auth-pending-email",
  /**
   * The name typed on AU-02, kept only so *Use a different email* can return
   * to the form without retyping it (Epic 1 AU-03).
   *
   * THERE IS NO PASSWORD KEY AND THERE NEVER WILL BE. The document says "name
   * and password retained in memory"; SET-2 keeps the name only and the
   * password is retyped. A password in browser storage is a password on disk.
   */
  AUTH_PENDING_NAME: "syn:auth-pending-name",
  /**
   * The template FR-03 is editing, so returning to step 3 reopens the one that
   * was started rather than creating a second *Morning* (Epic 1 FR-03).
   *
   * `sessionStorage`, and a convenience only: the account carries the step, so
   * a person who resumes in another browser gets step 3 with a fresh template
   * rather than a broken one. It is the one piece of first-run state that does
   * not live on the account, which the ticket permits by name.
   */
  SETUP_TEMPLATE_ID: "syn:setup-template-id",
} as const;
