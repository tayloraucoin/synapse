import { runScheduledJobs } from "@syn/api";

import { env } from "@/env";

/**
 * The scheduler's HTTP face. Vercel Cron calls this every fifteen minutes with
 * `Authorization: Bearer $CRON_SECRET`; `runScheduledJobs()` drives whatever
 * time-based jobs are registered.
 *
 * NO USER DATA CROSSES THIS BOUNDARY. The response is job names and counts.
 *
 * Unset secret answers 503 rather than running unauthenticated: for a
 * scheduler the safe failure is silence, not "send everything to everyone".
 */
export async function GET(request: Request) {
  if (!env.CRON_SECRET) {
    return new Response("Scheduler not configured.", { status: 503 });
  }
  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const results = await runScheduledJobs();
  return Response.json({ results });
}
