/**
 * The three miss tiers — Epic 3 DR-03, verbatim.
 *
 * The order is fixed and the definitions are the weighting, said plainly. The
 * spec's weights (official spec §3.4: circumstance excluded, scoping half,
 * chose_not_to full) are never shown as numbers — *done for the record*,
 * *counts half*, *counts as missed*. A percentage here would turn a reckoning
 * into a score.
 */
import type { MissTier } from "@syn/types";

export interface TierCopy {
  tier: MissTier;
  label: string;
  definition: string;
}

export const TIER_ROWS: readonly TierCopy[] = [
  {
    tier: "circumstance",
    label: "Something came up",
    definition: "done for the record",
  },
  {
    tier: "scoping",
    label: "Planned it wrong",
    definition: "counts half",
  },
  {
    tier: "chose_not_to",
    label: "Didn't do it",
    definition: "counts as missed",
  },
];

export const TIER_RADIO_ROWS_COPY = {
  reasonsLabel: "Reason",
  otherLabel: "Other",
  keepReason: "Keep this reason",
  otherPlaceholder: "",
  otherError: "Say what it was, in a few words.",
} as const;

/** Tier 3 decides on selection; tiers 1 and 2 reveal chips. */
export const TIERS_WITH_REASONS: readonly MissTier[] = [
  "circumstance",
  "scoping",
];
