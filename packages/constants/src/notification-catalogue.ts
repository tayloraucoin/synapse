/**
 * The notification catalogue — official spec §8.2, N1…N9 in table order, then
 * UX v1.1 §9.1's three additions.
 *
 * One entry per kind, carrying only what is not copy: the stable `kind` the
 * `notification_prefs` table stores, whether it is on by default, and the build
 * phase it ships in (§12, R4). A missing `notification_prefs` row means the
 * default here (SET-1 ruling); Epic 1 ST-07 renders every row, Phase-2 rows
 * included, as a real preference whose sender does not exist yet.
 *
 * NO COPY. Titles and bodies are the payload builder's, because they are
 * strings a person reads on a lock screen. Nothing here is.
 *
 * `kind` spells `NotificationKind` in `@syn/types` exactly; the two are kept in
 * step by `notification_kind`'s pgEnum in `@syn/db`, which is checked against
 * the type. (`@syn/constants` sits beside `@syn/types` in the layer graph and
 * may not import it — the `as const` tuple carries the literal types instead.)
 *
 * UX v1.1 R19 FLIPS N1. `item_start` was one push per fixed item; it becomes
 * opt-in per block, and `block_start` — one push at each block boundary after
 * the day is set — takes its place as the default. Rows 10–12 are v1.1 §9.1's
 * N1a/N1c/N1d; their `n` is a citation number, not a §8.2 row.
 */

export type NotificationCatalogueEntry = {
  /** N1…N9 — the row in official spec §8.2; 10–12 — UX v1.1 §9.1's additions; 13 — UX v1.2 §9's N2. */
  readonly n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  readonly kind:
    | "item_start"
    | "window_open"
    | "window_closing"
    | "review_reminder"
    | "pending_review"
    | "week_build"
    | "week_ready"
    | "timer_running"
    | "calendar_item"
    | "block_start"
    | "fixture_start"
    | "devices_off"
    | "journal_reminder";
  readonly defaultEnabled: boolean;
  readonly phase: 1 | 2;
};

export const NOTIFICATION_CATALOGUE: ReadonlyArray<NotificationCatalogueEntry> = [
  // Opt-in per block since UX v1.1 R19 (was on by default under v1.0).
  { n: 1, kind: "item_start", defaultEnabled: false, phase: 1 },
  { n: 2, kind: "window_open", defaultEnabled: false, phase: 2 },
  { n: 3, kind: "window_closing", defaultEnabled: true, phase: 2 },
  { n: 4, kind: "review_reminder", defaultEnabled: true, phase: 1 },
  { n: 5, kind: "pending_review", defaultEnabled: true, phase: 1 },
  { n: 6, kind: "week_build", defaultEnabled: true, phase: 1 },
  { n: 7, kind: "week_ready", defaultEnabled: true, phase: 2 },
  { n: 8, kind: "timer_running", defaultEnabled: true, phase: 2 },
  { n: 9, kind: "calendar_item", defaultEnabled: true, phase: 2 },
  // UX v1.1 §9.1 — N1a: one push at each block boundary, enqueued at *Set the day*.
  { n: 10, kind: "block_start", defaultEnabled: true, phase: 1 },
  // N1c: a pin or fixture; enqueued at week build.
  { n: 11, kind: "fixture_start", defaultEnabled: true, phase: 1 },
  // N1d: *Phone away* — a time the person set; off unless they turn it on.
  { n: 12, kind: "devices_off", defaultEnabled: false, phase: 1 },
  // UX v1.2 §9 N2 (R38): the journal reminder — one push at the person's
  // time, only when the journal is on and tonight's entry is empty. Reverses
  // v1.1's "no push for the journal"; qualifies under v1 §8.1 as a time the
  // person set, in their words, reporting nothing.
  { n: 13, kind: "journal_reminder", defaultEnabled: true, phase: 1 },
] as const;
