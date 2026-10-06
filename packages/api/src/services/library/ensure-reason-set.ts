import { eq } from "drizzle-orm";

import { reasons, type RlsClient } from "@syn/db";
import { DEFAULT_REASONS } from "@syn/constants";

/**
 * Give a person their reason set, once, the first time anything reads it.
 *
 * LAZY AND IDEMPOTENT, NOT A TRIGGER. A trigger on `users` would run inside
 * the auth webhook's transaction and put seven rows of product copy in the
 * signup path; it would also have to be re-run by hand for every account that
 * existed before the seven became eight. `ON CONFLICT (user_id, key) DO
 * NOTHING` does the same job at the first read, survives being called on every
 * read, and quietly backfills a new default for people who signed up before it
 * existed.
 *
 * IT IS SAFE TO CALL FROM EVERY READER. `reason.list` calls it, and so will
 * REV-2's chooser and USE-6's shift — because a person who has never opened
 * Settings still has to be offered reasons the first time something is missed,
 * and none of those callers should have to know whether they are the first.
 *
 * A RENAMED OR ARCHIVED DEFAULT IS NOT RESURRECTED. The conflict is on the
 * key, so a person who renamed *Slept in* to *Overslept* keeps their label,
 * and one who archived *Not feeling well* does not find it back tomorrow.
 */
export async function ensureReasonSet(
  rls: RlsClient,
  userId: string,
): Promise<void> {
  await rls.execute(async (tx) => {
    // The cheap read first: a set that exists is the overwhelmingly common
    // case, and an insert of seven rows on every list call is seven rows of
    // conflict resolution for nothing.
    const existing = await tx
      .select({ id: reasons.id })
      .from(reasons)
      .where(eq(reasons.userId, userId))
      .limit(1);

    if (existing.length > 0) return;

    await tx
      .insert(reasons)
      .values(
        DEFAULT_REASONS.map((reason) => ({
          userId,
          key: reason.key,
          label: reason.label,
          tier: reason.tier,
          structural: reason.structural,
          builtIn: true,
          sortOrder: reason.sortOrder,
        })),
      )
      .onConflictDoNothing();
  });
}
