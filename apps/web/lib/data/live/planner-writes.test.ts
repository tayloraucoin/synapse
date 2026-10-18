import { describe, expect, it } from "vitest";
import { PlannerRefusal } from "@/lib/data/refusals";
import type { TrpcClient } from "@/lib/trpc/client";
import { LIVE_DOMAINS } from "./domains";
import { plannerWrites } from "./planner-writes";

/**
 * USE-92's live seam: each planner write calls its `planner.*` procedure with
 * the parsed input (and the scope beside it), a bad input is refused with the
 * schema's words before any call, and Undo sends the token back.
 */

const BLOCK = "00000000-0000-4000-8000-000000000001";
const ITEM = "00000000-0000-4000-8000-000000000002";
const EVENT = "00000000-0000-4000-8000-000000000003";

function fakeClient(fail = false) {
  const calls: unknown[] = [];
  const mutation = (name: string) => ({
    mutate: (input: unknown) => {
      calls.push([name, input]);
      if (!fail) return Promise.resolve({ undo: "token", id: BLOCK });
      const error = Object.assign(new Error("No block with that id."), {
        data: { refusal: "unknown" },
      });
      return Promise.reject(error);
    },
  });
  const names = [
    "writeBounds",
    "createBlock",
    "createTransition",
    "editBlock",
    "splitBlock",
    "writeBlockChange",
    "writeBlockItem",
    "editBlockItem",
    "removeBlockItem",
    "reorderItems",
    "writeDayEvent",
    "copyDay",
    "copyBlock",
    "clearDay",
    "resetDay",
    "undo",
  ];
  const client = {
    planner: Object.fromEntries(names.map((name) => [name, mutation(name)])),
  } as unknown as TrpcClient;
  return { client, calls };
}

describe("the planner-writes domain (USE-92)", () => {
  it("is live", () => {
    expect(LIVE_DOMAINS.map((domain) => domain.name)).toContain(
      "planner-writes",
    );
  });

  it("sends each write's parsed input, its scope beside it", async () => {
    const { client, calls } = fakeClient();
    const m = plannerWrites.methods(client);
    await expect(
      m.createBlock!(
        {
          kind: "life",
          name: "Groceries",
          startsAt: "10:00",
          endsAt: "11:00",
          onDate: "2026-10-22",
        },
        { weekday: 3 },
      ),
    ).resolves.toEqual({ undo: "token", id: BLOCK });
    await m.removeBlockItem!({ id: ITEM, date: "2026-10-20" });
    await m.reorderItems!({ blockId: BLOCK, ids: [ITEM] }, { weekday: 1 });
    await m.splitBlock!({
      id: BLOCK,
      fromDate: "2026-10-20",
      patch: { name: "Early" },
    });
    await m.writeDayEvent!({
      id: EVENT,
      title: "Dentist",
      onDate: "2026-10-19",
      startsAt: "14:00",
      endsAt: "15:00",
    });
    await m.undo!("token");
    expect(calls).toEqual([
      [
        "createBlock",
        {
          input: expect.objectContaining({
            kind: "life",
            checklist: false,
            meal: false,
            notify: false,
          }),
          scope: { weekday: 3 },
        },
      ],
      [
        "removeBlockItem",
        { input: { id: ITEM, date: "2026-10-20" }, scope: undefined },
      ],
      [
        "reorderItems",
        { input: { blockId: BLOCK, ids: [ITEM] }, scope: { weekday: 1 } },
      ],
      [
        "splitBlock",
        { id: BLOCK, fromDate: "2026-10-20", patch: { name: "Early" } },
      ],
      [
        "writeDayEvent",
        {
          input: expect.objectContaining({ title: "Dentist", tag: "personal" }),
          id: EVENT,
          scope: undefined,
        },
      ],
      ["undo", { token: "token" }],
    ]);
  });

  it("sends the day-level four (USE-93) as parsed", async () => {
    const { client, calls } = fakeClient();
    const m = plannerWrites.methods(client);
    await m.copyDay!({ from: { weekday: 0 }, to: { date: "2026-10-22" } });
    await m.copyBlock!({
      blockId: BLOCK,
      from: { date: "2026-10-19" },
      to: { weekday: 3 },
      startsAt: "09:00",
    });
    await m.clearDay!({ date: "2026-10-22" });
    await m.resetDay!({ date: "2026-10-22" });
    expect(calls).toEqual([
      ["copyDay", { from: { weekday: 0 }, to: { date: "2026-10-22" } }],
      [
        "copyBlock",
        {
          blockId: BLOCK,
          from: { date: "2026-10-19" },
          to: { weekday: 3 },
          startsAt: "09:00",
        },
      ],
      ["clearDay", { date: "2026-10-22" }],
      ["resetDay", { date: "2026-10-22" }],
    ]);
  });

  it("refuses a day named both ways before any call", async () => {
    const { client, calls } = fakeClient();
    await expect(
      plannerWrites.methods(client).clearDay!({
        weekday: 1,
        date: "2026-10-20",
      } as never),
    ).rejects.toMatchObject({ reason: "invalid" });
    expect(calls).toEqual([]);
  });

  it("refuses a bad input with the schema's words before any call", async () => {
    const { client, calls } = fakeClient();
    const refused = plannerWrites.methods(client).writeBounds!({
      weekday: 0,
      upAt: "08:00",
      lightsOut: "07:00",
    });
    await expect(refused).rejects.toBeInstanceOf(PlannerRefusal);
    await expect(refused).rejects.toMatchObject({
      reason: "invalid",
      message: "Lights out comes after Up at.",
    });
    expect(calls).toEqual([]);
  });

  it("maps a refused write to the planner's refusal", async () => {
    const { client } = fakeClient(true);
    await expect(
      plannerWrites.methods(client).editBlock!({ id: BLOCK, name: "Late" }),
    ).rejects.toMatchObject({ reason: "unknown" });
  });
});
