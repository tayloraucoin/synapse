import type { TrpcClient } from "@/lib/trpc/client";
import type { LiveDomain } from "./domains";
import { callLive } from "./errors";

/**
 * The planner's reads, live (USE-91): Today, the Week, Set my days and
 * Review the day read the account's rows through `planner.today` and
 * `planner.week`. The set-up column has no read of its own live: its gate is
 * the week query's own loading state, so it resolves at once.
 */
export const plannerRead: LiveDomain = {
  name: "planner-read",
  methods: (client: TrpcClient) => ({
    readToday: (dateKey) =>
      callLive("planner", () => client.planner.today.query({ dateKey })),
    readWeek: (week) =>
      callLive("planner", () => client.planner.week.query({ week })),
    readSetUpColumn: () => Promise.resolve(),
  }),
};
