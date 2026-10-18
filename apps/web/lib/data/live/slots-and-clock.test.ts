import { describe, expect, it } from "vitest";
import {
  PlannerRefusal,
  SlotEventRefusal,
  SlotWriteRefusal,
} from "@/lib/data/refusals";
import type { TrpcClient } from "@/lib/trpc/client";
import { LIVE_DOMAINS } from "./domains";
import { slotsAndClock } from "./slots-and-clock";

/**
 * USE-94's live seam: slot events go to `clock.writeEvents` and slot writes
 * to `planner.placeSlot`, `removeSlot` and `writeSlot`, each input parsed
 * first, each refusal back as the class the fixture throws.
 */

const SLOT = "00000000-0000-4000-8000-000000000001";
const BLOCK = "00000000-0000-4000-8000-000000000002";
const TODO = "00000000-0000-4000-8000-000000000003";
const EVENT = "00000000-0000-4000-8000-000000000004";

const STORED = { id: SLOT, onDate: "2026-10-17" };

function fakeClient(refusal?: string) {
  const calls: unknown[] = [];
  const mutation = (name: string, answer: unknown) => ({
    mutate: (input: unknown) => {
      calls.push([name, input]);
      if (refusal === undefined) return Promise.resolve(answer);
      const error = Object.assign(new Error("Refused."), {
        data: { refusal },
      });
      return Promise.reject(error);
    },
  });
  const written = { undo: "token", id: SLOT, slot: STORED };
  const client = {
    clock: { writeEvents: mutation("writeEvents", [{ id: EVENT }]) },
    planner: {
      placeSlot: mutation("placeSlot", written),
      removeSlot: mutation("removeSlot", { undo: "token" }),
      writeSlot: mutation("writeSlot", written),
    },
  } as unknown as TrpcClient;
  return { client, calls };
}

const tap = {
  slotId: SLOT,
  kind: "started" as const,
  clientEventId: EVENT,
  at: "2026-10-17T14:00:00.000Z",
};

describe("the slots-and-clock domain (USE-94)", () => {
  it("is live", () => {
    expect(LIVE_DOMAINS.map((domain) => domain.name)).toContain(
      "slots-and-clock",
    );
  });

  it("sends a batch of slot events to clock.writeEvents", async () => {
    const { client, calls } = fakeClient();
    const m = slotsAndClock.methods(client);
    await expect(m.writeSlotEvents!([tap])).resolves.toEqual([{ id: EVENT }]);
    expect(calls).toEqual([["writeEvents", [tap]]]);
  });

  it("refuses a bad event before any call, and maps the server's refusal", async () => {
    const { client, calls } = fakeClient();
    await expect(
      slotsAndClock.methods(client).writeSlotEvents!([
        { ...tap, kind: "started", stepAwayId: EVENT },
      ]),
    ).rejects.toMatchObject({ name: "SlotEventRefusal", reason: "invalid" });
    expect(calls).toEqual([]);

    const refused = fakeClient("ahead-of-now");
    const thrown = await slotsAndClock.methods(refused.client).writeSlotEvents!(
      [tap],
    ).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(SlotEventRefusal);
    expect(thrown).toMatchObject({ reason: "ahead-of-now" });
  });

  it("writeSlots sends a change to writeSlot and a place to placeSlot, handing back the slot", async () => {
    const { client, calls } = fakeClient();
    const m = slotsAndClock.methods(client);
    await expect(m.writeSlots!({ id: SLOT, tookMin: 5 })).resolves.toEqual(
      STORED,
    );
    await expect(
      m.writeSlots!({
        blockId: BLOCK,
        onDate: "2026-10-17",
        sortOrder: 0,
        todoId: TODO,
      }),
    ).resolves.toEqual(STORED);
    expect(calls.map((call) => (call as [string])[0])).toEqual([
      "writeSlot",
      "placeSlot",
    ]);
  });

  it("maps writeSlots' refusals to SlotWriteRefusal, a place's and a remove's to PlannerRefusal", async () => {
    const { client } = fakeClient("duplicate");
    const m = slotsAndClock.methods(client);
    await expect(
      m.writeSlots!({ id: SLOT, onDate: "2026-10-18" }),
    ).rejects.toBeInstanceOf(SlotWriteRefusal);
    await expect(
      m.placeSlot!({
        blockId: BLOCK,
        onDate: "2026-10-17",
        sortOrder: 0,
        todoId: TODO,
      }),
    ).rejects.toBeInstanceOf(PlannerRefusal);
    await expect(m.removeSlot!({ id: SLOT })).rejects.toBeInstanceOf(
      PlannerRefusal,
    );
  });
});
