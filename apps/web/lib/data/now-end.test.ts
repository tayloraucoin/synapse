import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { NOW_COPY as COPY } from "@/app/(shell)/today/_components/now/copy";
import { BlockDoneFooter } from "@/components/planner/block-done-footer";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { NOW_IDS } from "@/lib/fixtures/scenarios/now-day";
import { NOW_END_IDS } from "@/lib/fixtures/scenarios/now-end";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { deriveNowEnd, type NowEndSpan } from "./now-end";
import { deriveNow } from "./use-now";

/**
 * Now at a block's end and the day's (USE-20) on the fixture server, read
 * back through `deriveNow` as the screen reads it, with a focus where
 * Start <Block> or End break would have put one.
 */
function setup(name: string, at?: string) {
  const scenario = resolveScenario(name);
  const nowMs = Date.parse(at ?? scenario.now);
  const now = () => new Date(nowMs);
  const server = createFixtureServer(scenario, now);
  const dateKey = scenario.now.slice(0, 10);
  async function read(
    focus: { blockId: string | null; at: string } | null = null,
  ) {
    return deriveNow(
      deriveToday(await server.readToday(dateKey)),
      now(),
      null,
      focus === null
        ? null
        : { blockId: focus.blockId, at: new Date(focus.at) },
    );
  }
  return { server, dateKey, now, read, scenario };
}

/** Times and lengths are the only numbers (product rules). */
function withoutCounts(words: string) {
  return words.replace(/\b\d{1,2}:\d{2}\b/g, "");
}

describe("C6: the all-done footer, Start <next>, End break and the empty day", () => {
  it("Wellness all done at 7:34: rows kept, no card, the footer names Training at 8:00", async () => {
    const view = await setup("all-done-start-next").read();
    expect(view.block?.name).toBe("Wellness");
    expect(view.items.every((item) => item.done)).toBe(true);
    expect(view.current).toBeNull();
    expect(view.footer).toEqual({
      kind: "done",
      blockName: "Wellness",
      next: {
        id: NOW_IDS.blocks.training,
        name: "Training",
        startsAt: "08:00",
        endsAt: "08:57",
      },
      doneBefore: "08:00",
    });
    const words = [
      COPY.blockComplete("Wellness"),
      COPY.nextBlock("Training", "08:00"),
      COPY.doneBefore("08:00", "Training", "08:57"),
      COPY.todoUntil("08:00"),
    ];
    expect(words).toEqual([
      "Wellness complete",
      "Next: Training, 8:00",
      "Done before 8:00. Starting early is fine: Training keeps its end, 8:57.",
      "Or a to-do until 8:00",
    ]);
    for (const line of words) expect(withoutCounts(line)).not.toMatch(/\d/);
  });

  it("Start Training at 7:34: Training in focus, its first item current, its span 8:00 to 8:57", async () => {
    const { read, scenario } = setup("all-done-start-next");
    const view = await read({
      blockId: NOW_IDS.blocks.training,
      at: scenario.now,
    });
    expect(view.block).toMatchObject({
      id: NOW_IDS.blocks.training,
      name: "Training",
      startsAt: "08:00",
      endsAt: "08:57",
    });
    expect(view.current?.id).toBe(NOW_END_IDS.items.warmUp);
    expect(view.footer).toBeNull();
  });

  it("an empty Break at 15:02: End break, no rows, no card, Wind-down next", async () => {
    const view = await setup("empty-break").read();
    expect(view.block).toMatchObject({
      name: "Break",
      kind: "break",
      startsAt: "15:00",
      endsAt: "15:10",
    });
    expect(view.items).toEqual([]);
    expect(view.current).toBeNull();
    expect(view.footer).toEqual({
      kind: "end-break",
      next: {
        id: NOW_END_IDS.blocks.windDown,
        name: "Wind-down [placeholder]",
        startsAt: "17:30",
        endsAt: "18:30",
      },
    });
  });

  it("End break puts the next block in focus, at its own span", async () => {
    const { read, scenario } = setup("empty-break");
    const view = await read({
      blockId: NOW_END_IDS.blocks.windDown,
      at: scenario.now,
    });
    expect(view.block).toMatchObject({
      name: "Wind-down [placeholder]",
      startsAt: "17:30",
      endsAt: "18:30",
    });
    expect(view.empty).toBe(false);
  });

  it("End break with no block after it: the view is empty", async () => {
    const { read, scenario } = setup("empty-break");
    const view = await read({ blockId: null, at: scenario.now });
    expect(view.block).toBeNull();
    expect(view.empty).toBe(true);
    expect(view.footer).toBeNull();
  });

  it("at 18:40 after the last block: no block, empty", async () => {
    const view = await setup("empty-no-blocks").read();
    expect(view.block).toBeNull();
    expect(view.empty).toBe(true);
    expect(COPY.blocksDone).toBe("The day's blocks are done.");
  });
});

describe("C7: the footer only while every item is done; the add row while there is time", () => {
  it("an unchecked row removes the footer and lifts that item", async () => {
    const { server, read } = setup("all-done-add-more");
    const before = await read();
    const coldBath = before.items.find(
      (item) => item.id === NOW_IDS.items.coldBath,
    );
    await server.writeSlots({
      id: coldBath!.slotId!,
      doneAt: null,
      tookMin: null,
    });
    const view = await read();
    expect(view.footer).toBeNull();
    expect(view.addRow).toBeNull();
    expect(view.current?.id).toBe(NOW_IDS.items.coldBath);
  });

  it("an added item un-completes the block and lifts", async () => {
    const { server, dateKey, read } = setup("all-done-add-more");
    const added = await server.writeBlockItem({
      blockId: NOW_IDS.blocks.wellness,
      title: "Stretch",
      onDate: dateKey,
      sortOrder: 5,
    });
    const view = await read();
    expect(view.footer).toBeNull();
    expect(view.current?.id).toBe(added.id);
  });

  it("with time left the add row reads Add to Wellness, Free until 8:00", async () => {
    const view = await setup("all-done-add-more").read();
    expect(view.addRow).toEqual({
      blockId: NOW_IDS.blocks.wellness,
      blockName: "Wellness",
      freeUntil: "08:00",
    });
    expect(COPY.addToBlock("Wellness")).toBe("Add to Wellness");
    expect(COPY.freeUntil("08:00")).toBe("Free until 8:00");
  });

  it("past the block's end there is no add row and no ahead line", async () => {
    const { server, dateKey } = setup("all-done-add-more");
    const today = deriveToday(await server.readToday(dateKey));
    const occurrence = today.occurrences.blocks.find(
      (entry) => entry.block.id === NOW_IDS.blocks.wellness,
    )!;
    const span: NowEndSpan = {
      occurrence,
      items: [{ id: "a", done: true }],
      start: occurrence.start,
      end: occurrence.end,
      allDay: false,
    };
    const end = deriveNowEnd(
      [span],
      span,
      true,
      new Date(occurrence.end.getTime() + 60_000),
    );
    expect(end.footer).toMatchObject({ kind: "done", doneBefore: null });
    expect(end.addRow).toBeNull();
  });

  it("Or a to-do until 8:00 calls the screen's tray opener", () => {
    const openTray = vi.fn();
    const tree = BlockDoneFooter({
      title: "Wellness complete",
      nextLabel: "Next: Training, 8:00",
      aheadLine: "Done before 8:00.",
      action: { label: "Start Training", onPress: () => {} },
      todoLink: { label: "Or a to-do until 8:00", onPress: openTray },
    });
    const link = findByText(tree, "Or a to-do until 8:00");
    expect(link).not.toBeNull();
    (link!.props as { onClick: () => void }).onClick();
    expect(openTray).toHaveBeenCalledOnce();
  });
});

/** The element whose own children are `text`, in a tree drawn by a call. */
function findByText(
  node: React.ReactNode,
  text: string,
): React.ReactElement | null {
  if (!React.isValidElement(node)) {
    if (Array.isArray(node)) {
      for (const child of node) {
        const found = findByText(child, text);
        if (found) return found;
      }
    }
    return null;
  }
  const props = node.props as { children?: React.ReactNode };
  if (props.children === text) return node;
  return findByText(
    React.Children.toArray(props.children) as React.ReactNode,
    text,
  );
}
