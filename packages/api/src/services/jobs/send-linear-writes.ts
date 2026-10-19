import { and, eq, lt } from "drizzle-orm";
import { buildServiceRoleAuthContext } from "@syn/auth";
import { createRlsClient, db, linearWrites } from "@syn/db";
import { createLogger } from "@syn/observability";
import { LINEAR_SEND_DUE_MS, sendDueLinearWritesFor } from "../linear";
import type { ScheduledJob } from "./run-scheduled-jobs";

/**
 * `send_linear_writes` (USE-102; USE-105 registers it, every 5 minutes):
 * the outbox rows a request left pending, sent. A request sends its own row
 * after its transaction; this catches the one whose request died between
 * the two. Each row is still sent once (`sendLinearWrite`'s claim), and a
 * Linear failure marks it failed for Try again, never a loop.
 *
 * THE ONE RLS BYPASS IS NAMED, as `expire-exports` names it: the scan for
 * accounts with a due row uses the singleton `db`, since no session exists;
 * every read and write after it runs under `buildServiceRoleAuthContext`.
 *
 * NOTHING PERSONAL IS LOGGED: a count, and a message on failure.
 */

const log = createLogger("jobs/send-linear-writes");

export async function sendLinearWrites(
  now: Date = new Date(),
): Promise<number> {
  const before = new Date(now.getTime() - LINEAR_SEND_DUE_MS);
  // System path: "which accounts anywhere have a stuck row" is no session's question.
  const due = await db
    .selectDistinct({ userId: linearWrites.userId })
    .from(linearWrites)
    .where(
      and(
        eq(linearWrites.state, "pending"),
        lt(linearWrites.updatedAt, before),
      ),
    );

  let sent = 0;
  for (const { userId } of due) {
    try {
      const rls = createRlsClient(buildServiceRoleAuthContext(userId));
      sent += await sendDueLinearWritesFor(rls, userId);
    } catch (error) {
      // One account's failure must not stop the rest.
      log.log("could not send one account's Linear writes", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return sent;
}

export const sendLinearWritesJob: ScheduledJob = {
  name: "send_linear_writes",
  run: () => sendLinearWrites(),
};
