import { describe, expect, it } from "vitest";
import { NOW_COPY as COPY } from "@/app/(shell)/today/_components/now/copy";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { NOW_IDS } from "@/lib/fixtures/scenarios/now-day";
import { NOW_END_IDS } from "@/lib/fixtures/scenarios/now-end";
import { createFixtureServer } from "@/lib/fixtures/server";
import { closesWithCard, undoLater, writeLater } from "./block-close";
import { deriveToday } from "./derive-today";
import type { BlockCloseState } from "./use-block-close";
import { deriveNow } from "./use-now";

/**
 * Block complete with items left (USE-25) on the fixture server, read back
 * through `deriveNow` as the screen reads it: the close card's facts,
 * Later and its Undo, and where × and Start leave Now.
 */
function setup(name: string) {
  const scenario = resolveScenario(name);
  const now = () => new Date(scenario.now);
  const server = createFixtureServer(scenario, now);
  const dateKey = scenario.now.slice(0, 10);
  async function read(
    close: BlockCloseState | null,
    focus: string | null | undefined = undefined,
  ) {
    return deriveNow(
      deriveToday(await server.readToday(dateKey)),
      now(),
      null,
      focus === undefined ? null : { blockId: focus, at: now() },
      close,
    );
  }
  return { server, dateKey, read };
}

const W = NOW_IDS.blocks.wellness;
const T = NOW_IDS.blocks.training;
const card = (blockId: string): BlockCloseState => ({
  closed: [blockId],
  card: { blockId, open: false, items: null, seeded: false },
});
const titles = (items: readonly { title: string; done: boolean }[]) =>
  items.map((item) => `${item.title}${item.done ? " ✓" : ""}`);

describe("the close card's facts (C1)", () => {
  it("Wellness at 7:40: Training then Breakfast, Later to Training, the items named", async () => {
    const { closing } = await setup("not-done-closed").read(card(W));
    expect(closing?.block.name).toBe("Wellness");
    expect(
      closing?.next.map((block) => [block.name, block.startsAt, block.kind]),
    ).toEqual([
      ["Training", "08:00", "training"],
      ["Breakfast", "09:00", expect.any(String)],
    ]);
    expect(closing?.later).toEqual({
      blockId: T,
      sortOrder: 2,
      blockName: "Training",
    });
    expect(closing?.left.map((item) => item.title)).toEqual([
      "Meditate",
      "Cold bath",
    ]);
    // Names, never a count.
    const words = COPY.close.notDone(closing!.left.map((item) => item.title));
    expect(words).toBe("Not done: Meditate, Cold bath");
    expect(words).not.toMatch(/\d/);
  });
});

describe("C5: Later, Undo, Leave, Start and ×", () => {
  it("Later writes one slot at the end of Training; Wellness no longer holds Meditate", async () => {
    const { server, dateKey, read } = setup("not-done-closed");
    const before = (await server.readToday(dateKey)).slots.length;
    const closing = (await read(card(W))).closing!;
    const meditate = closing.left.find((item) => item.title === "Meditate")!;
    const undo = await writeLater(
      server,
      dateKey,
      W,
      meditate.row,
      closing.later!,
    );

    const slots = (await server.readToday(dateKey)).slots;
    expect(slots).toHaveLength(before + 1);
    const written = slots.find((slot) => slot.id === undo.slotId);
    expect(written).toMatchObject({
      blockId: T,
      sortOrder: 2,
      blockItemId: NOW_IDS.items.meditate,
      doneAt: null,
    });

    const after = await read(card(W));
    expect(after.closing?.left).toEqual([
      expect.objectContaining({ title: "Cold bath", state: "left" }),
      expect.objectContaining({
        title: "Meditate",
        state: "moved",
        movedTo: "Training",
      }),
    ]);
    // Wellness's own rows no longer hold it; Training's end does.
    const wellness = await read({ closed: [], card: null });
    expect(titles(wellness.items)).not.toContain("Meditate");
    const training = await read({ closed: [W], card: null }, T);
    expect(training.block?.name).toBe("Training");
    expect(titles(training.items).at(-1)).toBe("Meditate");

    // Undo: the slot goes and Meditate is Wellness's again, not done.
    await undoLater(server, undo);
    expect((await server.readToday(dateKey)).slots).toHaveLength(before);
    const back = await read({ closed: [], card: null });
    expect(back.block?.name).toBe("Wellness");
    expect(titles(back.items)).toContain("Meditate");
    const trainingAgain = await read({ closed: [W], card: null }, T);
    expect(titles(trainingAgain.items)).not.toContain("Meditate");
  });

  it("Undo of a moved slot returns it to its block and place", async () => {
    const { server, dateKey, read } = setup("not-done-closed");
    // Cold bath's slot placed first (a length changed), then Later.
    const placed = await server.writeSlots({
      blockId: W,
      onDate: dateKey,
      sortOrder: 4,
      blockItemId: NOW_IDS.items.coldBath,
    });
    const closing = (await read(card(W))).closing!;
    const coldBath = closing.left.find((item) => item.title === "Cold bath")!;
    const undo = await writeLater(
      server,
      dateKey,
      W,
      coldBath.row,
      closing.later!,
    );
    expect(undo).toEqual({
      kind: "return",
      slotId: placed.id,
      blockId: W,
      sortOrder: 4,
    });
    await undoLater(server, undo);
    const slot = (await server.readToday(dateKey)).slots.find(
      (row) => row.id === placed.id,
    );
    expect(slot).toMatchObject({ blockId: W, sortOrder: 4, doneAt: null });
  });

  it("Leave, Start Training and × write nothing: Training in focus, Meditate still not done in Wellness", async () => {
    const { server, dateKey, read } = setup("not-done-closed");
    const before = structuredClone((await server.readToday(dateKey)).slots);
    // Without the close, Wellness holds the screen over a focus (USE-20).
    expect((await read({ closed: [], card: null }, T)).block?.name).toBe(
      "Wellness",
    );
    // Start Training and × both close the card and put Training in focus.
    const after = await read({ closed: [W], card: null }, T);
    expect(after.block?.name).toBe("Training");
    expect(after.closing).toBeNull();
    expect((await server.readToday(dateKey)).slots).toEqual(before);
    const wellness = (await read({ closed: [], card: null })).items;
    expect(wellness.find((item) => item.title === "Meditate")?.done).toBe(
      false,
    );
  });
});

describe("C6: all done keeps the footer; after the last block, empty", () => {
  it("an all-done block gets no card", async () => {
    const view = await setup("all-done").read(null);
    expect(view.footer?.kind).toBe("done");
    expect(closesWithCard(view.items)).toBe(false);
    expect(closesWithCard([{ done: true }, { done: false }])).toBe(true);
  });

  it("the last block: nothing after it, no Later; once closed, Now is empty", async () => {
    const { read } = setup("last-block");
    const W2 = NOW_END_IDS.blocks.windDown;
    const { closing } = await read(card(W2));
    expect(closing?.block.name).toBe("Wind-down [placeholder]");
    expect(closing?.next).toEqual([]);
    expect(closing?.later).toBeNull();
    expect(closing?.left).toEqual([]);

    const empty = await read({ closed: [W2], card: null }, null);
    expect(empty.block).toBeNull();
    expect(empty.empty).toBe(true);
  });
});
