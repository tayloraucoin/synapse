import { describe, expect, it, vi } from "vitest";
import { addDays } from "@syn/utils";
import {
  footLine,
  isFull,
  landingOf,
  openAddForm,
  planAdd,
  scopeLine,
  showsTier,
  type AddForm,
} from "@/components/planner/add-sheet/form";
import {
  railTimeAt,
  snapToStep,
  stepTime,
  typedTime,
} from "@/components/planner/rail-add/drag";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { NOW_IDS, onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { sendAdd, writeRailAdd } from "./rail-add";
import { roomDayWithRowsOf } from "./room-day";
import type { TodayRecords } from "./today-records";
import { undoItemWrite } from "./use-item-sheet";

/**
 * Add from the rail (USE-54), C5: the drag reads 15-minute steps inside the
 * day; an add with room writes a dated item or a tiered slot on the date
 * only, and Undo takes it off; with none, the room hook is called and
 * nothing is written here.
 */

const DAY = { startMin: 7 * 60, endMin: 22 * 60 };
const PX = 96;
const NEXT_MONDAY = addDays(BASE_DATE, 7);

describe("the drag (C5; D-USE-15, D-USE-19)", () => {
  it("reads a finger's travel in 15-minute steps", () => {
    // From 9:00, 24 px is 15 min; 30 px rounds to the same step.
    expect(
      railTimeAt({ fromMin: 540, dyPx: 24, pxPerHour: PX, window: DAY }),
    ).toBe(555);
    expect(
      railTimeAt({ fromMin: 540, dyPx: 30, pxPerHour: PX, window: DAY }),
    ).toBe(555);
    expect(
      railTimeAt({ fromMin: 540, dyPx: 120, pxPerHour: PX, window: DAY }),
    ).toBe(615);
    expect(
      railTimeAt({ fromMin: 540, dyPx: -40, pxPerHour: PX, window: DAY }),
    ).toBe(510);
  });

  it("stops at the day's edges", () => {
    expect(
      railTimeAt({ fromMin: 540, dyPx: -2000, pxPerHour: PX, window: DAY }),
    ).toBe(420);
    // The last step a 15-minute item can start on is 21:45.
    expect(
      railTimeAt({ fromMin: 540, dyPx: 5000, pxPerHour: PX, window: DAY }),
    ).toBe(1305);
  });

  it("rounds a tapped time and steps Starts inside the day", () => {
    expect(snapToStep(612, DAY)).toBe(615);
    expect(snapToStep(400, DAY)).toBe(420);
    expect(stepTime(615, 15, DAY)).toBe(630);
    expect(stepTime(420, -15, DAY)).toBe(420);
  });
});

function setup(name: string) {
  const server = createFixtureServer(
    resolveScenario(name),
    () => new Date(Date.parse(onNowDay("06:58"))),
  );
  const today = () => server.readToday(BASE_DATE);
  return {
    server,
    today,
    day: async () => roomDayWithRowsOf(deriveToday(await today())),
    /** Next Monday's blocks, items and slots: the usual week as it lays out. */
    usual: async () => {
      const { blocks, blockItems, blockChanges, slots } =
        await server.readToday(NEXT_MONDAY);
      const on = (date: string | null) => date === null || date === NEXT_MONDAY;
      return {
        blocks,
        blockItems: blockItems.filter((item) => on(item.onDate)),
        blockChanges,
        slots: slots.filter((slot) => slot.onDate === NEXT_MONDAY),
      };
    },
  };
}

const named = (form: AddForm, title: string): AddForm => ({ ...form, title });

describe("the sheet's rules (C2, C3; D-USE-16, D-USE-22)", () => {
  it("released at 10:15 in a full Work: the scope, Secondary, and the foot line", async () => {
    const s = setup("rail-add-sheet");
    const day = await s.day();
    const form = openAddForm({ at: "10:15" });
    const landing = landingOf(day, form);
    expect(landing?.name).toBe("Work");
    expect(scopeLine(BASE_DATE, landing, form)).toBe(
      "Monday · lands in Work, 9:30 to 12:00",
    );
    expect(form).toMatchObject({
      kind: "item",
      startsAt: "10:15",
      lengthMin: 15,
      pinned: false,
      tier: "secondary",
    });
    expect(showsTier(landing)).toBe(true);
    expect(isFull(day, landing!, form)).toBe(true);
    expect(footLine(landing, form, true)).toBe(
      "Work is full at 10:15. Adding asks where the 15 min comes from.",
    );
  });

  it("Tier only in Work", async () => {
    const day = await setup("rail-add-sheet").day();
    expect(showsTier(landingOf(day, openAddForm({ at: "08:15" })))).toBe(false);
  });

  it("Add to Primary on an empty Work block: the tier preset, no Starts", async () => {
    const day = await setup("rail-add-preset-tier").day();
    const start = { blockId: NOW_IDS.blocks.work, tier: "primary" as const };
    const form = openAddForm(start);
    expect(form.startsAt).toBeNull();
    expect(form.tier).toBe("primary");
    expect(landingOf(day, form, start.blockId)?.name).toBe("Work");
  });
});

/** Writes with room, proves today only, undoes, proves the day back. */
async function provesAdd(
  s: ReturnType<typeof setup>,
  form: AddForm,
  check: (after: TodayRecords, id: string) => void,
) {
  const before = await s.today();
  const usual = await s.usual();
  const day = await s.day();
  const landing = landingOf(day, form)!;
  const plan = planAdd(day, landing, form);
  expect(plan.kind).toBe("write");
  if (plan.kind !== "write") return;
  const written = await writeRailAdd(s.server, before, plan.landing, plan.form);
  check(await s.today(), written.id);
  expect(await s.usual()).toEqual(usual);
  await undoItemWrite(s.server, written.undo);
  expect(await s.today()).toEqual(before);
}

describe("an add with room (C4, C5; D-USE-11)", () => {
  it("in Work: a work item and its slot on the date, with the tier and length", async () => {
    const s = setup("rail-added-undo");
    await provesAdd(
      s,
      named(openAddForm({ at: "10:15" }), "[New work item]"),
      (after, id) => {
        expect(after.workItems.find((w) => w.id === id)?.title).toBe(
          "[New work item]",
        );
        const slot = after.slots.find((row) => row.workItemId === id);
        expect(slot).toMatchObject({
          blockId: NOW_IDS.blocks.work,
          onDate: BASE_DATE,
          tier: "secondary",
          lengthMin: 15,
        });
      },
    );
  });

  it("outside Work: a dated item, pinned at Starts when At a set time is on", async () => {
    const s = setup("rail-added-undo");
    const form = {
      ...named(openAddForm({ at: "12:15" }), "Stretch"),
      pinned: true,
    };
    const day = await s.day();
    const landing = landingOf(day, form)!;
    expect(landing.name).toBe("Lunch");
    expect(showsTier(landing)).toBe(false);
    await provesAdd(s, form, (after, id) => {
      expect(after.blockItems.find((item) => item.id === id)).toMatchObject({
        blockId: landing.blockId,
        onDate: BASE_DATE,
        atTime: "12:15",
        lengthMin: 15,
      });
    });
  });
});

describe("an add with no room (C5; USE-41)", () => {
  it("calls the room hook with the addition and writes nothing itself", async () => {
    const s = setup("rail-add-sheet");
    const before = await s.today();
    const day = await s.day();
    const form = named(openAddForm({ at: "10:15" }), "[New work item]");
    const plan = planAdd(day, landingOf(day, form)!, form);
    expect(plan).toEqual({
      kind: "room",
      addition: {
        blockId: NOW_IDS.blocks.work,
        title: "[New work item]",
        lengthMin: 15,
        at: "10:15",
      },
    });
    const write = vi.fn();
    const place = vi.fn(async () => {});
    await sendAdd(plan, { write, place });
    expect(place).toHaveBeenCalledWith(
      plan.kind === "room" ? plan.addition : null,
    );
    expect(write).not.toHaveBeenCalled();
    expect(await s.today()).toEqual(before);
  });
});

describe("Starts typed (D-USE-19)", () => {
  it("keeps a typed time as typed, inside the day", () => {
    expect(typedTime("10:20", DAY)).toBe(620);
    expect(typedTime("1020", DAY)).toBe(620);
    expect(typedTime("9", DAY)).toBe(540);
    expect(typedTime("5:00", DAY)).toBe(420);
    expect(typedTime("lunch", DAY)).toBeNull();
  });
});
