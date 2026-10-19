import { and, eq, isNull } from "drizzle-orm";

import { buildServiceRoleAuthContext } from "@syn/auth";
import { createRlsClient, days, db, users } from "@syn/db";
import { createLogger } from "@syn/observability";
import { dayWindow } from "@syn/utils";

import { closeDay } from "../day/close-day";
import { resolveTodayFor } from "../day/today";
import type { ScheduledJob } from "./run-scheduled-jobs";

/**
 * Close days that have run past their boundary — official spec §6.1, §7.2.
 *
 * A day ends whether or not the app was open, so this cannot wait for someone
 * to visit. Every fifteen minutes it walks the people who have days, applies
 * any deferred settings change that has come due, and closes what is over.
 *
 * NOTHING IS MARKED MISSED. Undone items become `pending_review` and wait for
 * the Day Review. The scheduler's job is to notice that a day ended, not to
 * decide how it went.
 *
 * THE ONE RLS BYPASS IS NAMED. The user-id list uses the singleton `db`
 * because there is no session to scope it by — that is the definition of a
 * system path — and everything after it runs under
 * `buildServiceRoleAuthContext(userId)`, so every bypass in this codebase is
 * greppable by that one call.
 */

const log = createLogger("jobs/auto-close");

export async function autoCloseDays(now: Date = new Date()): Promise<number> {
  // System path: no session exists, so there is nothing to scope by. Every
  // read after this is per-user under the named service-role context.
  const accounts = await db.select({ id: users.id }).from(users);

  let closed = 0;

  for (const account of accounts) {
    try {
      const rls = createRlsClient(buildServiceRoleAuthContext(account.id));

      // Applies the pending pair, so a zone switch lands even with no app open.
      const today = await resolveTodayFor(rls, account.id, now);
      if (!today) continue;

      const open = await rls.execute((tx) =>
        tx
          .select({ date: days.date })
          .from(days)
          .where(and(eq(days.userId, account.id), isNull(days.closedAt))),
      );

      for (const day of open) {
        const dateKey = String(day.date);
        const window = dayWindow(dateKey, today.timeZone, today.dayCloseTime);

        // Still inside its window — not this day's turn.
        if (now.getTime() < window.end.getTime()) continue;

        const result = await closeDay(rls, account.id, {
          dateKey,
          reason: "auto",
          timeZone: today.timeZone,
          dayCloseTime: today.dayCloseTime,
        });

        if (result.closed) closed += 1;
      }
    } catch (error) {
      // One person's bad zone must not stop everyone else's day from closing.
      log.log("auto-close failed for one account", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return closed;
}

export const autoCloseDaysJob: ScheduledJob = {
  name: "auto_close_days",
  run: () => autoCloseDays(),
};
