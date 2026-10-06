import { and, eq, isNotNull, lt } from "drizzle-orm";

import { buildServiceRoleAuthContext, createAdminClient } from "@syn/auth";
import { EXPORTS_BUCKET, exportStorageKey } from "@syn/constants";
import { createRlsClient, dataExports, db } from "@syn/db";
import { createLogger } from "@syn/observability";

import type { ScheduledJob } from "./run-scheduled-jobs";

/**
 * `expire_exports` — the promise on the screen, kept.
 *
 * ST-10 says *Links last for 24 hours.* A link that expires while the FILE
 * stays in a bucket is a sentence that is technically true and materially
 * false: the person's whole record would still be sitting on a server after
 * they were told it was gone. So the row flips to `expired` AND the object is
 * removed, and the removal is the part that matters.
 *
 * THE ORDER IS OBJECT FIRST, ROW SECOND. If the delete succeeds and the update
 * fails, the next run finds the same row, deletes an object that is already
 * gone (which Supabase treats as success) and updates it — no harm. Reversed,
 * a failed delete after a successful update would leave a file nothing points
 * at and nothing will ever revisit.
 *
 * THE ONE RLS BYPASS IS NAMED, the same way `auto-close-days` names it: the
 * candidate scan uses the singleton `db` because no session exists, and every
 * write runs under `buildServiceRoleAuthContext(userId)`.
 *
 * NOTHING PERSONAL IS LOGGED — a count, and an export id on failure.
 */

const log = createLogger("jobs/expire-exports");

export async function expireExports(now: Date = new Date()): Promise<number> {
  // System path: this asks "which exports anywhere are past their expiry",
  // which is not a question any one session can answer.
  const due = await db
    .select({
      id: dataExports.id,
      userId: dataExports.userId,
    })
    .from(dataExports)
    .where(
      and(
        eq(dataExports.status, "ready"),
        isNotNull(dataExports.expiresAt),
        lt(dataExports.expiresAt, now),
      ),
    );

  if (due.length === 0) return 0;

  const admin = createAdminClient();
  let expired = 0;

  for (const row of due) {
    try {
      const { error } = await admin.storage
        .from(EXPORTS_BUCKET)
        .remove([exportStorageKey(row.userId, row.id)]);

      if (error) throw new Error(error.message);

      const rls = createRlsClient(buildServiceRoleAuthContext(row.userId));
      await rls.execute((tx) =>
        tx
          .update(dataExports)
          .set({ status: "expired", updatedAt: new Date() })
          .where(eq(dataExports.id, row.id)),
      );

      expired += 1;
    } catch (error) {
      // One stuck object must not stop the rest from being reaped.
      log.log("could not expire one export", {
        exportId: row.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return expired;
}

export const expireExportsJob: ScheduledJob = {
  name: "expire_exports",
  run: () => expireExports(),
};
