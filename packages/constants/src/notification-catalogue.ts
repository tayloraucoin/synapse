/**
 * The notification catalogue — official spec §8.2, N1…N9 in table order.
 *
 * One entry per kind, carrying only what is not copy: the stable `kind` the
 * `notification_prefs` table stores, whether it is on by default, and the build
 * phase it ships in (§12, R4). A missing `notification_prefs` row means the
 * default here (SET-1 ruling); Epic 1 ST-07 renders every row, Phase-2 rows
 * included, as a real preference whose sender does not exist yet.
 *
 * NO COPY. Titles and bodies are USE-8's, in its payload builder, because they
 * are strings a person reads on a lock screen. Nothing here is.
 *
 * `kind` spells `NotificationKind` in `@syn/types` exactly; the two are kept in
 * step by `notification_kind`'s pgEnum in `@syn/db`, which is checked against
 * the type. (`@syn/constants` sits beside `@syn/types` in the layer graph and
 * may not import it — the `as const` tuple carries the literal types instead.)
 */

export type NotificationCatalogueEntry = {
  /** N1…N9 — the row number in official spec §8.2, for citation only. */
  readonly n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  readonly kind:
    | "item_start"
    | "window_open"
    | "window_closing"
    | "review_reminder"
    | "pending_review"
    | "week_build"
    | "week_ready"
    | "timer_running"
    | "calendar_item";
  readonly defaultEnabled: boolean;
  readonly phase: 1 | 2;
};

export const NOTIFICATION_CATALOGUE: ReadonlyArray<NotificationCatalogueEntry> = [
  { n: 1, kind: "item_start", defaultEnabled: true, phase: 1 },
  { n: 2, kind: "window_open", defaultEnabled: false, phase: 2 },
  { n: 3, kind: "window_closing", defaultEnabled: true, phase: 2 },
  { n: 4, kind: "review_reminder", defaultEnabled: true, phase: 1 },
  { n: 5, kind: "pending_review", defaultEnabled: true, phase: 1 },
  { n: 6, kind: "week_build", defaultEnabled: true, phase: 1 },
  { n: 7, kind: "week_ready", defaultEnabled: true, phase: 2 },
  { n: 8, kind: "timer_running", defaultEnabled: true, phase: 2 },
  { n: 9, kind: "calendar_item", defaultEnabled: true, phase: 2 },
] as const;
