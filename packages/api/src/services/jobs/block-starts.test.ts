import { describe, expect, it } from "vitest";
import {
  dueBlockStarts,
  sendBlockStarts,
  type BlockSlot,
  type NotifyBlock,
} from "./block-starts";
import { memoryPush } from "./push-fakes.fixture";
import { pushWindow } from "./push-window";

/** USE-105 C3 (and C2's once, for blocks): a notifying block's start. */

const ZONE = "America/Toronto";
// 2026-10-19 09:02 in Toronto (EDT).
const NOW = new Date("2026-10-19T13:02:00Z");

const deepWork: NotifyBlock = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Deep work",
  notify: true,
  startsAt: "09:00",
  endsAt: "11:00",
  rrule: "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=DAILY",
  onDate: null,
  archivedAt: null,
};

const slot: BlockSlot = {
  id: "33333333-3333-4333-8333-333333333333",
  blockId: deepWork.id,
  onDate: "2026-10-19",
  sortOrder: 0,
  doneAt: null,
};

async function run(input: {
  blocks?: NotifyBlock[];
  slots?: BlockSlot[];
  withEvents?: string[];
  changes?: Parameters<typeof dueBlockStarts>[0]["changes"];
  now?: Date;
  push?: ReturnType<typeof memoryPush>;
}) {
  const push = input.push ?? memoryPush();
  const due = dueBlockStarts({
    blocks: input.blocks ?? [deepWork],
    changes: input.changes ?? [],
    slots: input.slots ?? [],
    slotsWithEvents: new Set(input.withEvents ?? []),
    timeZone: ZONE,
    window: pushWindow(input.now ?? NOW),
  });
  return { count: await sendBlockStarts(due, ZONE, push), push };
}

describe("block_start", () => {
  it("sends one push at a notifying block's start, once", async () => {
    const push = memoryPush();
    expect((await run({ push })).count).toBe(1);
    expect(push.sent[0]?.payload.title).toBe("Deep work · 9:00 AM");
    expect(
      (await run({ push, now: new Date(NOW.getTime() + 4 * 60_000) })).count,
    ).toBe(0);
  });

  it("sends nothing for a block without notify", async () => {
    expect(
      (await run({ blocks: [{ ...deepWork, notify: false }] })).count,
    ).toBe(0);
  });

  it("sends nothing for a block skipped that date", async () => {
    const changes = [
      {
        blockId: deepWork.id,
        onDate: "2026-10-19",
        skipped: true,
        startsAt: null,
        endsAt: null,
      },
    ];
    expect((await run({ changes })).count).toBe(0);
  });

  it("groups same-minute starts into one push", async () => {
    const walk = {
      ...deepWork,
      id: "44444444-4444-4444-8444-444444444444",
      name: "Walk",
    };
    const { count, push } = await run({ blocks: [deepWork, walk] });
    expect(count).toBe(1);
    expect(push.sent[0]?.rowIds).toHaveLength(2);
    expect(push.sent[0]?.payload.title).toBe("Deep work · Walk · 9:00 AM");
  });
});

describe("a block started or complete sends nothing (C-USE-105-3)", () => {
  it("skips a block with a started slot", async () => {
    expect((await run({ slots: [slot], withEvents: [slot.id] })).count).toBe(0);
  });

  it("skips a block with its slots done", async () => {
    const done = { ...slot, doneAt: new Date("2026-10-19T12:50:00Z") };
    expect((await run({ slots: [done] })).count).toBe(0);
  });

  it("sends for a block whose slots are untouched", async () => {
    expect((await run({ slots: [slot] })).count).toBe(1);
  });
});
