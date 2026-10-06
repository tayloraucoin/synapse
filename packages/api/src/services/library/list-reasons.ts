import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";

import { reasons, type RlsClient } from "@syn/db";
import type { MissTier, ReasonView } from "@syn/types";

import { ensureReasonSet } from "./ensure-reason-set";

/**
 * ST-06's three groups, plus the archived ones.
 *
 * `byTier` IS THE SHAPE THE CONSUMERS ALREADY TAKE. `TierRadioRows` and
 * `DecisionPanel` want a `Record<MissTier, ReasonView[]>`, and REV-2's chooser
 * and USE-6's shift will want the same. Grouping once here saves three callers
 * from three mapping steps that could disagree about ordering.
 *
 * *OTHER* IS EXCLUDED FROM `byTier` and returned separately. Its tier is not a
 * property of the row — the person picks one at the moment they use it — so
 * filing it under `scoping` because that is what the seed stored would put it
 * in a group it does not belong to. `TierRadioRows` and `ReasonChips` already
 * append it themselves via `OTHER_REASON_KEY`.
 *
 * ARCHIVED ROWS ARE IN NEITHER: they are what `ArchivedSection` renders, and a
 * chooser must never offer one.
 */
export type ReasonList = {
  byTier: Record<MissTier, ReasonView[]>;
  /** The structural *Other* row, for callers that render it themselves. */
  other: ReasonView | null;
  archived: ReasonView[];
};

const EMPTY_BY_TIER = (): Record<MissTier, ReasonView[]> => ({
  circumstance: [],
  scoping: [],
  chose_not_to: [],
});

export async function listReasons(
  rls: RlsClient,
  userId: string,
): Promise<ReasonList> {
  await ensureReasonSet(rls, userId);

  return rls.execute(async (tx) => {
    const active = await tx
      .select({
        key: reasons.key,
        label: reasons.label,
        tier: reasons.tier,
        builtIn: reasons.builtIn,
        structural: reasons.structural,
      })
      .from(reasons)
      .where(and(eq(reasons.userId, userId), isNull(reasons.archivedAt)))
      .orderBy(asc(reasons.sortOrder), asc(reasons.label));

    const archivedRows = await tx
      .select({
        key: reasons.key,
        label: reasons.label,
        tier: reasons.tier,
        builtIn: reasons.builtIn,
        structural: reasons.structural,
      })
      .from(reasons)
      .where(and(eq(reasons.userId, userId), isNotNull(reasons.archivedAt)))
      .orderBy(asc(reasons.sortOrder), asc(reasons.label));

    const byTier = EMPTY_BY_TIER();
    let other: ReasonView | null = null;

    for (const row of active) {
      const view = toView(row);
      if (row.key === "other") {
        other = view;
        continue;
      }
      byTier[row.tier].push(view);
    }

    return { byTier, other, archived: archivedRows.map(toView) };
  });
}

type ReasonRow = {
  key: string;
  label: string;
  tier: MissTier;
  builtIn: boolean;
  structural: boolean;
};

/** `ReasonView` carries no id: a miss stores the key, so the key is identity. */
export function toView(row: ReasonRow): ReasonView {
  return {
    key: row.key,
    label: row.label,
    tier: row.tier,
    builtIn: row.builtIn,
  };
}

/** Whether a row may be archived or re-tiered — ST-06's structural rule. */
export function isStructural(row: { structural: boolean }): boolean {
  return row.structural;
}
