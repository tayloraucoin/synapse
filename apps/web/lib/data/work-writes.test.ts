import { describe, expect, it } from "vitest";
import { clientRecord, slotRecord, workItemRecord } from "@syn/validators";
import { PlannerRefusal } from "@/lib/fixtures/planner";
import { resolveScenario, scenarioNames } from "@/lib/fixtures/scenarios";
import { POOL_IDS } from "@/lib/fixtures/scenarios/pool";
import { SET_UP_IDS, SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import { groupPool } from "./pool-records";

const C = POOL_IDS.clients;
const W = POOL_IDS.workItems;
const S = POOL_IDS.slots;
const WORK = SET_UP_IDS.blocks.work;
const [MON, TUE, WED, THU] = [
  "2026-10-12",
  "2026-10-13",
  "2026-10-14",
  "2026-10-15",
];

function setup() {
  return createFixtureServer(
    resolveScenario("pool"),
    () => new Date(SET_UP_NOW),
  );
}

type Server = ReturnType<typeof setup>;

/** Every row a work write can touch: the pool, the week, and each day's work items, clients and slots. */
async function snapshot(server: Server) {
  const days = await Promise.all(
    [MON, TUE, WED, THU].map((date) => server.readToday(date)),
  );
  return {
    pool: await server.readPool(),
    week: await server.readWeek("2026-W42"),
    days: days.map(({ workItems, clients, slots }) => ({
      workItems,
      clients,
      slots,
    })),
  };
}

async function slotsOf(server: Server, workItemId: string) {
  const { slots } = await server.readPool();
  return slots.filter((slot) => slot.workItemId === workItemId);
}

describe("C1: every record in the pool scenarios parses with its schema", () => {
  it.each(scenarioNames().filter((name) => name.startsWith("pool")))(
    "%s",
    (name) => {
      const { records } = resolveScenario(name);
      for (const [rows, schema] of [
        [records.workItems, workItemRecord],
        [records.clients, clientRecord],
        [records.slots, slotRecord],
      ] as const) {
        for (const row of rows) expect(schema.parse(row)).toEqual(row);
      }
    },
  );
});

describe("C2: readPool returns open work with its session dates, client and clientsEnabled", () => {
  it("leaves out done and archived work", async () => {
    const records = await setup().readPool();
    const ids = records.workItems.map((item) => item.id);
    expect(ids).not.toContain(W.done);
    expect(ids).not.toContain(W.archived);
    expect(ids).toEqual(expect.arrayContaining([W.kes58, W.synapseOnly]));
    expect(
      records.workItems.every(
        (i) => i.doneAt === null && i.archivedAt === null,
      ),
    ).toBe(true);
  });

  it("gives each item the dates its sessions sit on, its client and clientsEnabled", async () => {
    const pool = groupPool(await setup().readPool());
    expect(pool.clientsEnabled).toBe(true);
    const entry = (id: string) => pool.items.find((e) => e.item.id === id)!;
    expect(entry(W.ald17).sessionDates).toEqual([MON, TUE, WED]);
    expect(entry(W.syn212).sessionDates).toEqual([MON, WED, THU]);
    expect(entry(W.ald17).client?.id).toBe(C.alder);
    expect(entry(W.kes63).sessionDates).toEqual([]);
    expect(entry(W.synapseOnly).client).toBeNull();
  });

  it("with clients off, one group of every item", () => {
    const pool = groupPool({
      clientsEnabled: false,
      clients: [],
      workItems: [],
      slots: [],
    });
    expect(pool).toEqual({ clientsEnabled: false, items: [], groups: [] });
  });
});

describe("C3: a tier change moves this session or all; one item sits once per date", () => {
  it("with this, only the one slot", async () => {
    const server = setup();
    await server.setWorkTier({
      slotId: S.syn212Mon,
      tier: "urgent",
      sessions: "this",
    });
    const tiers = Object.fromEntries(
      (await slotsOf(server, W.syn212)).map((s) => [s.id, s.tier]),
    );
    expect(tiers).toEqual({
      [S.syn212Mon]: "urgent",
      [S.syn212Wed]: "primary",
      [S.syn212Thu]: "secondary",
    });
  });

  it("with all, every session of that item and no other", async () => {
    const server = setup();
    await server.setWorkTier({
      slotId: S.syn212Mon,
      tier: "primary",
      sessions: "all",
    });
    expect((await slotsOf(server, W.syn212)).map((s) => s.tier)).toEqual([
      "primary",
      "primary",
      "primary",
    ]);
    expect((await slotsOf(server, W.ald17)).map((s) => s.tier)).toEqual([
      "secondary",
      "secondary",
      "secondary",
    ]);
  });

  it("refuses a sessions choice with no tier, in the schema's words", async () => {
    await expect(
      setup().setWorkTier({
        slotId: S.syn212Mon,
        tier: null as never,
        sessions: "all",
      }),
    ).rejects.toThrow("Choose a tier to move the sessions to.");
  });

  it("refuses a second slot for one item on one date, placed or moved", async () => {
    const server = setup();
    const place = server.placeWork({
      workItemId: W.ald17,
      dateKey: MON,
      blockId: WORK,
      tier: "primary",
      sortOrder: 20,
    });
    await expect(place).rejects.toBeInstanceOf(PlannerRefusal);
    await expect(place).rejects.toThrow("That item is already placed.");
    await expect(
      server.moveWork({ slotId: S.ald17Mon, dateKey: TUE }),
    ).rejects.toThrow("That item is already placed.");
    // The planner's own place holds the same key.
    await expect(
      server.placeSlot({
        blockId: WORK,
        onDate: WED,
        sortOrder: 20,
        workItemId: W.syn212,
      }),
    ).rejects.toThrow("That item is already placed.");
  });

  it("refuses what placeSlotInput refuses, in its words", async () => {
    await expect(
      setup().placeWork({
        workItemId: W.kes63,
        dateKey: "12 Oct",
        blockId: WORK,
        tier: "primary",
        sortOrder: 0,
      }),
    ).rejects.toBeInstanceOf(PlannerRefusal);
  });
});

describe("C4: Undo leaves the records equal to before the write", () => {
  const writes: [string, (server: Server) => Promise<{ undo: string }>][] = [
    [
      "a place",
      (s) =>
        s.placeWork({
          workItemId: W.kes63,
          dateKey: WED,
          blockId: WORK,
          tier: "primary",
          sortOrder: 20,
        }),
    ],
    [
      "a move",
      (s) => s.moveWork({ slotId: S.syn212Thu, dateKey: TUE, tier: "stretch" }),
    ],
    ["an unplace", (s) => s.unplaceWork({ slotId: S.ald17Tue })],
    [
      "a tier change for all sessions",
      (s) =>
        s.setWorkTier({ slotId: S.syn212Wed, tier: "urgent", sessions: "all" }),
    ],
    [
      "a work item edit",
      (s) =>
        s.editWorkItem({
          id: W.kes58,
          title: "[Intake form, v2]",
          lengthMinMin: 60,
          clientId: C.alder,
        }),
    ],
    ["Mark the task done", (s) => s.markTaskDone({ workItemId: W.syn212 })],
    ["Back to the pool", (s) => s.backToPool({ workItemId: W.ald17 })],
    [
      "Remove from Synapse",
      (s) => s.removeFromSynapse({ workItemId: W.syn212 }),
    ],
  ];

  it.each(writes)("after %s", async (_, run) => {
    const server = setup();
    const before = await snapshot(server);
    const { undo } = await run(server);
    expect(await snapshot(server)).not.toEqual(before);
    await server.undo(undo);
    expect(await snapshot(server)).toEqual(before);
  });

  it("puts back only its own write, not a later one", async () => {
    const server = setup();
    const first = await server.unplaceWork({ slotId: S.ald17Tue });
    const afterFirst = await snapshot(server);
    const second = await server.markTaskDone({ workItemId: W.kes58 });
    await server.undo(second.undo);
    expect(await snapshot(server)).toEqual(afterFirst);
    await server.undo(first.undo);
    expect((await slotsOf(server, W.ald17)).map((s) => s.id)).toContain(
      S.ald17Tue,
    );
  });

  it("a refused write changes nothing", async () => {
    const server = setup();
    const before = await snapshot(server);
    await expect(
      server.editWorkItem({ id: W.syn218, lengthMinMin: 1300 }),
    ).rejects.toThrow("The longest is at least the shortest.");
    expect(await snapshot(server)).toEqual(before);
  });
});

describe("C5: client order, Mark the task done and Remove from Synapse", () => {
  it("readPool groups by the order setClientOrder writes", async () => {
    const server = setup();
    const order = (pool: Awaited<ReturnType<Server["readPool"]>>) =>
      groupPool(pool).groups.map((g) => g.client?.id ?? null);
    expect(order(await server.readPool())).toEqual([
      C.kestrel,
      C.alder,
      C.personal,
      null,
    ]);
    await server.setClientOrder({ ids: [C.personal, C.kestrel, C.alder] });
    expect(order(await server.readPool())).toEqual([
      C.personal,
      C.kestrel,
      C.alder,
      null,
    ]);
  });

  it("refuses an order that leaves a client out or names one twice", async () => {
    const server = setup();
    await expect(
      server.setClientOrder({ ids: [C.personal, C.kestrel] }),
    ).rejects.toThrow("Each client once.");
    await expect(
      server.setClientOrder({ ids: [C.personal, C.personal, C.alder] }),
    ).rejects.toThrow("Each client once.");
  });

  it("Mark the task done sets the item's doneAt and every open session's", async () => {
    const server = setup();
    await server.markTaskDone({ workItemId: W.syn212 });
    const day = await server.readToday(THU);
    const item = day.workItems.find((i) => i.id === W.syn212)!;
    expect(item.doneAt).toBe(new Date(SET_UP_NOW).toISOString());
    expect(item.doneSource).toBe("synapse");
    const sessions = (
      await Promise.all([MON, WED, THU].map((d) => server.readToday(d)))
    ).flatMap((d) => d.slots.filter((s) => s.workItemId === W.syn212));
    expect(sessions).toHaveLength(3);
    expect(sessions.every((s) => s.doneAt === item.doneAt)).toBe(true);
    expect((await server.readPool()).workItems.map((i) => i.id)).not.toContain(
      W.syn212,
    );
  });

  it("Remove from Synapse archives the item", async () => {
    const server = setup();
    await server.removeFromSynapse({ workItemId: W.ald17 });
    const day = await server.readToday(MON);
    expect(
      day.workItems.find((i) => i.id === W.ald17)?.archivedAt,
    ).not.toBeNull();
    expect((await server.readPool()).workItems.map((i) => i.id)).not.toContain(
      W.ald17,
    );
    await expect(
      server.placeWork({
        workItemId: W.ald17,
        dateKey: THU,
        blockId: WORK,
        tier: "primary",
        sortOrder: 0,
      }),
    ).rejects.toThrow("No work item with that id.");
  });
});
