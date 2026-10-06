/**
 * The state-word vocabulary — Epic 2 §0.3, official spec §9.7.
 *
 * Exactly one word in a row's state slot, or none. The list is closed: a new
 * state means a new entry here, reviewed, not an ad-hoc string at a call site.
 *
 * `from` and `add-unit` take a `text` argument because the word is only half
 * the phrase — "from Thu", "add pages".
 *
 * NOTHING HERE GRADES THE DAY. There is no "late", no "overdue", no "behind"
 * (official spec §2.4). `passed` says *not today* only when a person chose it;
 * an item that simply went by carries no word at all.
 */
import type { StateWordKind } from "@syn/types";

export const STATE_WORDS: Record<StateWordKind, string> = {
  now: "now",
  soon: "soon",
  open: "open",
  closing: "closing",
  moved: "moved",
  from: "from",
  "not-today": "not today",
  "add-unit": "add",
  updated: "updated",
  pending: "pending",
  archived: "archived",
  /** UX v1.1 §7.1 — a wind-down row after devices-off; ticked the next morning. */
  "confirm-later": "confirm in the morning",
  /** UX v1.1 §3.11 — the role captions in an opener · pool · closer routine. */
  opener: "opener",
  closer: "closer",
};

/** Kinds whose word is completed by `text`. */
export const STATE_WORDS_WITH_TEXT: readonly StateWordKind[] = [
  "from",
  "add-unit",
];

/** The two that may carry the 6px dot — official spec §9.3. */
export const STATE_WORDS_WITH_DOT: readonly StateWordKind[] = ["now", "soon"];
