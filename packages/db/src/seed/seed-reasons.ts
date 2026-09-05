/**
 * The default reason set, for one person.
 *
 * Idempotent by `ON CONFLICT (user_id, key) DO NOTHING`, so re-running the
 * seed never duplicates a row and never overwrites a label or tier the person
 * has since edited — which is the whole point of the set being theirs.
 *
 * SET-9's service does the same thing lazily for a real account, reading the
 * same `DEFAULT_REASONS`. This file exists so the smoke account has a set
 * without an app running.
 */
import { DEFAULT_REASONS } from "@syn/constants";

import { reasons } from "../schema";
import type { Db } from "../client";

export async function seedDefaultReasons(
  db: Db,
  userId: string,
): Promise<number> {
  const rows = DEFAULT_REASONS.map((reason) => ({
    builtIn: true,
    key: reason.key,
    label: reason.label,
    sortOrder: reason.sortOrder,
    structural: reason.structural,
    tier: reason.tier,
    userId,
  }));

  const inserted = await db
    .insert(reasons)
    .values(rows)
    .onConflictDoNothing({ target: [reasons.userId, reasons.key] })
    .returning({ id: reasons.id });

  return inserted.length;
}
