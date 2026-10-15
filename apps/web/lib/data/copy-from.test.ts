import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { SET_UP_IDS } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  copyHelper,
  copySources,
  copyWords,
  lastBuiltBefore,
  pickerLine,
  savedBlockDone,
} from "./set-up-view";
import { deriveWeek } from "./use-week";

/**
 * Copy from (USE-45; interactions/copy-from): the days offered, the
 * picker's rows, Replace's words, the copy through `copyDay` and its Undo,
 * which puts the day back exactly, and From a saved block's one block.
 */

const B = SET_UP_IDS.blocks;
const THURSDAY = { weekday: 3 };
const MONDAY = { weekday: 0 };

function serverOf(state: string) {
  const scenario = resolveScenario(state);
  return createFixtureServer(scenario, () => new Date(scenario.now));
}

async function usualOf(server: ReturnType<typeof serverOf>) {
  return deriveWeek(await server.readWeek("usual")).days;
}

/** A day as its blocks and items stand, for "exactly as it was". */
function shapeOf(day: Awaited<ReturnType<typeof usualOf>>[number]) {
  return day.blocks.map((b) => ({
    name: b.block.name,
    kind: b.block.kind,
    startsAt: b.startsAt,
    endsAt: b.endsAt,
    items: b.items.map((item) => item.title),
  }));
}

describe("what is offered (C-USE-copy-from-4; empty-day.md, D-USE-85)", () => {
  it("names the last built weekday before the day, and lists only built days but it", async () => {
    const days = await usualOf(serverOf("empty-day"));
    expect(lastBuiltBefore(days, 3)).toBe(2);
    expect(copySources(days, 3).map((d) => d.weekday)).toEqual([0, 1, 2, 6]);
    expect(copyHelper(days[3]!)).toBe(
      "Every Thursday takes the blocks of the day picked. Built days only.",
    );
  });

  it("names each day's blocks, and Sunday's checklist in words", async () => {
    const days = await usualOf(serverOf("copy-picker"));
    expect(pickerLine(days[0]!)).toBe(
      "Wellness, Training, Breakfast, Work, Lunch, Work, Evening",
    );
    expect(pickerLine(days[6]!)).toBe("One checklist, no times");
    // The day being set is left out though it is built.
    expect(copySources(days, 3).map((d) => d.weekday)).toEqual([0, 1, 2, 6]);
  });

  it("offers nothing when no other day is built", async () => {
    const days = await usualOf(serverOf("empty-first-day"));
    expect(lastBuiltBefore(days, 0)).toBeNull();
    expect(copySources(days, 0)).toEqual([]);
  });
});

describe("Replace (C-USE-copy-from-1; replace-confirm.md)", () => {
  it("names what goes and, in the usual week, that this week's day follows", async () => {
    const days = await usualOf(serverOf("replace-confirm"));
    expect(copyWords({ to: days[3]!, from: days[0]! })).toEqual({
      title: "Replace Thursday with Monday?",
      body: "Thursday's Wellness and Work go, and Monday's blocks take their place. This week's Thursday follows.",
      done: "Thursday copied from Monday",
    });
  });

  it("dates the ask in This week, with no follows line", async () => {
    const server = serverOf("day-own-change");
    const days = deriveWeek(await server.readWeek("2026-W42")).days;
    const words = copyWords({ to: days[3]!, from: days[0]! });
    expect(words.title).toBe("Replace Thursday, 15 October with Monday?");
    expect(words.body).not.toContain("follows");
  });
});

describe("the copy and its Undo (C-USE-copy-from-2, -3; copied-undo.md)", () => {
  it("an empty day takes Monday's blocks, Work as time only, and Undo empties it again", async () => {
    const server = serverOf("empty-day");
    const before = shapeOf((await usualOf(server))[3]!);
    expect(before).toEqual([]);

    const write = await server.copyDay({ from: MONDAY, to: THURSDAY });
    const after = await usualOf(server);
    expect(shapeOf(after[3]!)).toEqual(
      shapeOf(after[0]!).map((b) =>
        b.kind === "work" ? { ...b, items: [] } : b,
      ),
    );
    // Up at and Lights out stay the day's own.
    expect(after[3]!.bounds).toEqual({ upAt: "07:00", lightsOut: "22:30" });

    await server.undo(write.undo);
    expect(shapeOf((await usualOf(server))[3]!)).toEqual(before);
  });

  it("Replace on a built day, then Undo: its own Wellness and Work return with their items", async () => {
    const server = serverOf("replace-confirm");
    const before = await usualOf(server);
    const thursday = shapeOf(before[3]!);
    expect(thursday.map((b) => b.name)).toEqual(["Wellness", "Work"]);
    const monday = shapeOf(before[0]!);

    const write = await server.copyDay({ from: MONDAY, to: THURSDAY });
    const copied = await usualOf(server);
    expect(shapeOf(copied[3]!).map((b) => b.name)).toEqual(
      monday.map((b) => b.name),
    );
    // Monday itself is untouched by the copy.
    expect(shapeOf(copied[0]!)).toEqual(monday);

    await server.undo(write.undo);
    const back = await usualOf(server);
    expect(shapeOf(back[3]!)).toEqual(thursday);
    expect(shapeOf(back[0]!)).toEqual(monday);
  });
});

describe("From a saved block (C6; plus-menu.md, D-USE-87)", () => {
  it("lands one block with its items at the first free time, and Undo takes it away", async () => {
    const server = serverOf("saved-block-picker");
    const before = shapeOf((await usualOf(server))[3]!);
    const write = await server.copyBlock({
      blockId: B.training,
      from: MONDAY,
      to: THURSDAY,
      startsAt: "12:00",
    });
    const training = shapeOf((await usualOf(server))[3]!).find(
      (b) => b.name === "Training",
    );
    expect(training).toEqual({
      name: "Training",
      kind: "training",
      startsAt: "12:00",
      endsAt: "12:57",
      items: ["Drive to the YMCA", "Workout: gym", "Drive home"],
    });
    expect(savedBlockDone("Training", "12:00")).toBe(
      "Training added at 12:00.",
    );

    await server.undo(write.undo);
    expect(shapeOf((await usualOf(server))[3]!)).toEqual(before);
  });
});
