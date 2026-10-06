import { createAdminClient } from "@syn/auth";
import { EXPORTS_BUCKET } from "@syn/constants";
import { createLogger } from "@syn/observability";

/**
 * Delete the account — Epic 1 ST-10a, official spec §9.3, cross-cutting §8.4.
 *
 * THE ONE DESTRUCTIVE ACTION IN THE PRODUCT, and the one place a person can
 * lose everything. Four things must all be true when it returns: every row is
 * gone, every stored object is gone, the session is over, and nothing about any
 * of it was written into a log.
 *
 * IT IS REAL, NOT SOFT. `users.deleted_at` exists from INF-5 and is
 * deliberately NOT used: the column predates this ticket, and a soft delete
 * keeps exactly the data the person just asked to be rid of. If a row survives
 * the word *delete*, the promise on the screen was a lie. Logged in the
 * track's `DEVIATIONS.md`.
 *
 * THE ORDER IS STORAGE, THEN ROWS. Objects first because they are the part
 * with no cascade: `auth.admin.deleteUser` takes every table with it, but a
 * bucket knows nothing about a foreign key, and a prefix whose owner no longer
 * exists is a prefix nothing will ever revisit. Storage cleanup is best-effort
 * and never blocks the delete — the rows are what was asked for, and an
 * orphaned object is unreachable (the read route 404s a missing user) rather
 * than exposed.
 *
 * THE COST OF THAT ORDER, STATED: if `deleteUser` then fails, the images are
 * gone and the account remains. The ticket names this and rules it acceptable —
 * a person who typed *delete* and saw an error has still lost only pictures,
 * where the reverse ordering risks leaving their whole record behind after
 * telling them it was removed.
 *
 * NOTHING PERSONAL IS LOGGED. Counts and the fact, never an email, a path, a
 * file name, or a title. Every log line below is auditable against that rule.
 */

const log = createLogger("user/delete");

/** Supabase lists at most this many objects per call. */
const LIST_PAGE = 100;

/** 100 passes × 100 objects — far past any real account, and bounded. */
const MAX_CLEANUP_PASSES = 100;

export type DeleteAccountResult = {
  ok: true;
  /** How many stored objects went, for the log line and for nothing else. */
  objectsRemoved: number;
};

/**
 * Every bucket that keys objects by user id. `exports` is included and is why
 * this is not `READABLE_ASSET_BUCKETS` — an export is a person's whole record
 * and is the last thing that should outlive the account.
 */
const OWNED_PREFIX_BUCKETS = ["icons", "avatars", EXPORTS_BUCKET] as const;

export async function deleteAccount(
  userId: string,
): Promise<DeleteAccountResult> {
  const admin = createAdminClient();

  let objectsRemoved = 0;

  for (const bucket of OWNED_PREFIX_BUCKETS) {
    try {
      objectsRemoved += await removePrefix(admin, bucket, userId);
    } catch (error) {
      // Best-effort, by ruling. The delete proceeds; the failure is recorded
      // without naming anything.
      log.log("storage cleanup failed for one bucket", {
        bucket,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    // Nothing else is attempted. The screen says "Nothing was removed", which
    // is true of the rows — the images are the acknowledged cost above.
    throw new Error(`account delete failed: ${error.message}`);
  }

  log.log("account deleted", { objectsRemoved });

  return { ok: true, objectsRemoved };
}

/**
 * List and remove everything under `{userId}/`, a page at a time.
 *
 * The prefix is built from the session's user id and never from input, which is
 * the whole authorization story: there is no path here a caller could steer.
 */
async function removePrefix(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  userId: string,
): Promise<number> {
  let removed = 0;

  /*
   * ALWAYS PAGE ZERO, never an advancing offset. Removing a full page shrinks
   * the listing, so the next page-zero read returns what used to be page one;
   * paginating as well would step over that many objects and leave them
   * behind — the classic delete-while-iterating bug, and here it would leave a
   * person's images on a server after their account was gone.
   *
   * The pass count bounds the loop: a `remove` that reports success without
   * removing anything would otherwise spin forever, and an unbounded loop in
   * the delete path is worse than an incomplete cleanup (which the caller
   * already treats as best-effort).
   */
  for (let pass = 0; pass < MAX_CLEANUP_PASSES; pass += 1) {
    const { data, error } = await admin.storage
      .from(bucket)
      .list(userId, { limit: LIST_PAGE });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return removed;

    const paths = data.map((object) => `${userId}/${object.name}`);
    const { error: removeError } = await admin.storage
      .from(bucket)
      .remove(paths);

    if (removeError) throw new Error(removeError.message);
    removed += paths.length;

    if (data.length < LIST_PAGE) return removed;
  }

  return removed;
}
