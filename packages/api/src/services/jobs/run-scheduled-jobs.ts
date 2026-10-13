import { createLogger } from "@syn/observability";
import { expireExportsJob } from "./expire-exports";

const log = createLogger("jobs/scheduler");

/**
 * The scheduled-job registry.
 *
 * A cron calls `/api/jobs/scheduler` every fifteen minutes and this runs
 * whatever is registered. The interval is the ceiling on how late a reminder
 * can be, which is why it is fifteen minutes and not a day: official spec
 * §8.2's N1 fires at an item's `scheduled_start`, and a reminder that arrives
 * hours later is worse than none.
 *
 * Since the legacy move (USE-1, 2026-10-13) only `expire_exports` is live:
 * the old day close and the notification jobs read the old domains and went
 * to `_legacy/` with them. USE's reminder and push tickets register their jobs
 * here the same way; nothing about this file changes when they do.
 *
 * A job that throws is logged and does not stop the others: one broken job
 * must not silence every notification in the product.
 */

export type ScheduledJobResult = {
  job: string;
  count: number;
};

export type ScheduledJob = {
  name: string;
  /** Returns how many notifications (or units of work) it enqueued. */
  run: () => Promise<number>;
};

/** `expire_exports` (SET-10) is order-independent; it touches nothing else reads. */
export const SCHEDULED_JOBS: readonly ScheduledJob[] = [expireExportsJob];

export async function runScheduledJobs(): Promise<ScheduledJobResult[]> {
  const results: ScheduledJobResult[] = [];

  for (const job of SCHEDULED_JOBS) {
    try {
      results.push({ job: job.name, count: await job.run() });
    } catch (error) {
      log.log("job failed", {
        job: job.name,
        message: error instanceof Error ? error.message : String(error),
      });
      results.push({ job: job.name, count: -1 });
    }
  }

  return results;
}
