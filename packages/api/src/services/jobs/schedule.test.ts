import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SCHEDULED_JOBS } from "./run-scheduled-jobs";

/** USE-105 C1: the scheduler's cron runs every 5 minutes (C12). */

const VERCEL = join(import.meta.dirname, "../../../../../apps/web/vercel.json");

describe("the scheduler (C-USE-105-1)", () => {
  it("vercel.json runs /api/jobs/scheduler every 5 minutes", () => {
    const config = JSON.parse(readFileSync(VERCEL, "utf8")) as {
      crons: Array<{ path: string; schedule: string }>;
    };
    expect(config.crons).toContainEqual({
      path: "/api/jobs/scheduler",
      schedule: "*/5 * * * *",
    });
  });

  it("registers the reminders, the block starts and the Linear sweep", () => {
    expect(SCHEDULED_JOBS.map((job) => job.name)).toEqual(
      expect.arrayContaining([
        "todo_reminder",
        "block_start",
        "send_linear_writes",
      ]),
    );
  });
});
