import { createLogger } from "@syn/observability";
import { blockStartsJob } from "./block-starts";
import { expireExportsJob } from "./expire-exports";
import { sendLinearWritesJob } from "./send-linear-writes";
import { todoRemindersJob } from "./todo-reminders";

const log = createLogger("jobs/scheduler");

/**
 * The scheduled-job registry.
 *
 * A cron calls `/api/jobs/scheduler` every 5 minutes (C12, USE-105) and this
 * runs whatever is registered. The interval is the ceiling on how late a
 * reminder can be: a to-do's reminder or a block's start that arrives long
 * after its time is worse than none.
 *
 * Since the legacy move (USE-1, 2026-10-13) the old day close and the old
 * notification jobs live in `_legacy/`; USE-105 registers USE's own pushes
 * (`todo_reminder`, `block_start`) and USE-102's Linear outbox sweep.
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

/** Order-independent: no job reads what another writes. */
export const SCHEDULED_JOBS: readonly ScheduledJob[] = [
  expireExportsJob,
  todoRemindersJob,
  blockStartsJob,
  sendLinearWritesJob,
];

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
