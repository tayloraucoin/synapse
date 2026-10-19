import { describe, expect, it } from "vitest";
import { PlannerRefusal } from "@/lib/data/refusals";
import type { TrpcClient } from "@/lib/trpc/client";
import { LIVE_DOMAINS } from "./domains";
import { plannerRead } from "./planner";

/**
 * USE-91's live seam: readToday and readWeek call `planner.today` and
 * `planner.week` with their inputs; the set-up column resolves at once, its
 * gate being the week query's own loading state.
 */

function fakeClient(fail = false) {
  const calls: unknown[] = [];
  const answer = (name: string) => (input: unknown) => {
    calls.push([name, input]);
    if (!fail) return Promise.resolve({ name });
    const error = Object.assign(new Error("Nothing to read."), {
      data: { refusal: "unknown" },
    });
    return Promise.reject(error);
  };
  const client = {
    planner: {
      today: { query: answer("today") },
      week: { query: answer("week") },
    },
  } as unknown as TrpcClient;
  return { client, calls };
}

describe("the planner-read domain (USE-91)", () => {
  it("is live", () => {
    expect(LIVE_DOMAINS.map((domain) => domain.name)).toContain("planner-read");
  });

  it("reads the day and the week through the planner router", async () => {
    const { client, calls } = fakeClient();
    const methods = plannerRead.methods(client);
    await expect(methods.readToday!("2026-10-19")).resolves.toEqual({
      name: "today",
    });
    await expect(methods.readWeek!("2026-W43")).resolves.toEqual({
      name: "week",
    });
    expect(calls).toEqual([
      ["today", { dateKey: "2026-10-19" }],
      ["week", { week: "2026-W43" }],
    ]);
  });

  it("resolves the set-up column with no call", async () => {
    const { client, calls } = fakeClient();
    await expect(
      plannerRead.methods(client).readSetUpColumn!(),
    ).resolves.toBeUndefined();
    expect(calls).toEqual([]);
  });

  it("maps a refused read to the planner's refusal", async () => {
    const { client } = fakeClient(true);
    await expect(
      plannerRead.methods(client).readToday!("2026-10-19"),
    ).rejects.toBeInstanceOf(PlannerRefusal);
  });
});
