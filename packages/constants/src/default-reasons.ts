/**
 * The default reason set — official spec §3.10, the seven rows in table order.
 *
 * Reasons are per user and editable (Epic 1 ST-06), so these are not a
 * catalogue the app reads at runtime; they are the rows a new person's set
 * starts from. Two writers read this one table: the dev seed (`@syn/db`
 * `seed-reasons.ts`) for the smoke account, and SET-9's service, which seeds a
 * person's set lazily the first time anything reads it.
 *
 * `key` is the stable identifier `misses.reason_key` and `shifts.reason_key`
 * store — text, not a foreign key, so a later-archived reason keeps its record
 * (cross-cutting §8.1). `label` is what ST-06 shows and the person may rename.
 * `tier` is the default; the person may change it in ST-06a — except on the
 * two `structural` rows, whose tier is locked and which are never archivable
 * (ST-06: "*Didn't do it* and *Other*, which are structural").
 *
 * The labels are the spec's words. They are data the person owns and edits,
 * which is why they may live here rather than in a `copy.ts`.
 */

export type DefaultReasonTier = "circumstance" | "scoping" | "chose_not_to";

export type DefaultReason = {
  readonly key: string;
  readonly label: string;
  readonly tier: DefaultReasonTier;
  /** Tier locked, never archivable — `chose_not_to` and `other` only. */
  readonly structural: boolean;
  readonly sortOrder: number;
};

export const DEFAULT_REASONS: ReadonlyArray<DefaultReason> = [
  { key: "something_came_up", label: "Something came up", tier: "circumstance", structural: false, sortOrder: 0 },
  { key: "unwell", label: "Not feeling well", tier: "circumstance", structural: false, sortOrder: 1 },
  { key: "ran_long", label: "Earlier thing ran long", tier: "scoping", structural: false, sortOrder: 2 },
  { key: "slept_in", label: "Slept in", tier: "scoping", structural: false, sortOrder: 3 },
  // "scoping → may resolve to *traded up*" (§7.3). The tier stored is scoping;
  // the resolver (REV-1) upgrades it when `misses.traded_up_item_id` verifies.
  { key: "stayed_on_important", label: "Stayed on something more important", tier: "scoping", structural: false, sortOrder: 4 },
  { key: "chose_not_to", label: "Didn't do it", tier: "chose_not_to", structural: true, sortOrder: 5 },
  // "user picks tier" — the row exists so *Other* has a key; the tier stored
  // here is the ST-06a default (*Planned it wrong*, Vesper's call) and the
  // person's pick is written on the miss, not on this row.
  { key: "other", label: "Other", tier: "scoping", structural: true, sortOrder: 6 },
] as const;
