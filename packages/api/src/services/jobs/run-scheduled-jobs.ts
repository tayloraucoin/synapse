import { createLogger } from "@syn/observability";

import { autoCloseDaysJob } from "./auto-close-days";

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
 * `auto_close_days` (USE-1) is the first entry. The notification jobs — N1
 * fixed-time start, N4 review reminder, N5 pending review, N6 week build —
 * register the same way as USE-8 lands them; nothing about this file changes
 * when they do.
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

export const SCHEDULED_JOBS: readonly ScheduledJob[] = [autoCloseDaysJob];

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
