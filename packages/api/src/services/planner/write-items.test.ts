import { describe, expect, it } from "vitest";
import {
  blockItemInput,
  dayBoundsInput,
  dayEventInput,
  editBlockItemInput,
} from "@syn/validators";
import { block, bounds, event, item, slot } from "./planner-rows.fixture";
import {
  planRemoveDayEvent,
  planWriteBounds,
  planWriteDayEvent,
} from "./write-bounds";
import {
  planEditBlockItem,
  planRemoveBlockItem,
  planReorderItems,
  planWriteBlockItem,
} from "./write-items";
import { expectRefusal, journalOver, NOW_ISO } from "./write-plan.fixture";

/**
 * USE-92 C1 (the item, bounds and event writes) and C3 (remove and reorder
 * for a date or for the usual block), over rows in memory.
 */

const MON = "2026-10-19";
const TUE = "2026-10-20";
const ONE_DATE = "2026-10-22";

describe("the item, bounds and event writes (C-USE-92-1)", () => {
  it("writeBlockItem writes a usual item, or a date's own on a date the block runs", () => {
    const morning = block();
    const journal = journalOver({ blocks: [morning] });
    const usual = planWriteBlockItem(
      journal,
      blockItemInput.parse({
        blockId: morning.id,
        title: "Stretch",
        sortOrder: 0,
      }),
      { weekday: 0 },
    );
    expect(journal.rows.blockItems[0]).toEqual({
      id: usual.id,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
      blockId: morning.id,
      title: "Stretch",
      icon: null,
      isTransition: false,
      atTime: null,
      lengthMin: null,
      meal: false,
      onDate: null,
      sortOrder: 0,
    });
    expect(usual.reach).toEqual({ weekday: 0, changedOn: new Set() });

    const dated = planWriteBlockItem(
      journal,
      blockItemInput.parse({
        blockId: morning.id,
        title: "Call",
        sortOrder: 1,
        onDate: TUE,
      }),
      { weekday: 1 },
    );
    expect(dated.reach).toBeUndefined();
  });

  it("writeBlockItem refuses a block not the caller's, and a date it does not run", () => {
    const oneDay = block({ rrule: null, onDate: ONE_DATE });
    const journal = journalOver({ blocks: [oneDay] });
    expectRefusal(
      () =>
        planWriteBlockItem(
          journal,
          blockItemInput.parse({
            blockId: block().id,
            title: "X",
            sortOrder: 0,
          }),
        ),
      "unknown",
      "No block with that id.",
    );
    expectRefusal(
      () =>
        planWriteBlockItem(
          journal,
          blockItemInput.parse({
            blockId: oneDay.id,
            title: "X",
            sortOrder: 0,
            onDate: MON,
          }),
        ),
      "not-on-date",
      "That block is not on that date.",
    );
  });

  it("editBlockItem patches only what is sent, and checks the row as it will stand", () => {
    const morning = block();
    const walk = item({
      blockId: morning.id,
      isTransition: true,
      atTime: "07:30",
      lengthMin: 10,
    });
    const journal = journalOver({ blocks: [morning], blockItems: [walk] });
    planEditBlockItem(
      journal,
      editBlockItemInput.parse({ id: walk.id, title: "Walk" }),
    );
    expect(journal.rows.blockItems).toEqual([
      { ...walk, title: "Walk", updatedAt: NOW_ISO },
    ]);
    expectRefusal(
      () =>
        planEditBlockItem(
          journal,
          editBlockItemInput.parse({ id: walk.id, lengthMin: null }),
        ),
      "invalid",
      "A transition needs a start and a length.",
    );
    expectRefusal(
      () =>
        planEditBlockItem(
          journal,
          editBlockItemInput.parse({ id: walk.id, blockId: block().id }),
        ),
      "unknown",
      "No block with that id.",
    );
  });

  it("writeBounds writes a weekday's usual, then updates it, and a date's own", () => {
    const journal = journalOver();
    const first = planWriteBounds(
      journal,
      dayBoundsInput.parse({ weekday: 6, upAt: "08:00", lightsOut: "23:00" }),
    );
    const again = planWriteBounds(
      journal,
      dayBoundsInput.parse({ weekday: 6, upAt: "08:30", lightsOut: "23:00" }),
    );
    expect(again.id).toBe(first.id);
    expect(journal.rows.dayBounds).toEqual([
      expect.objectContaining({ weekday: 6, onDate: null, upAt: "08:30" }),
    ]);
    expect(again.reach).toEqual({ weekday: 6, changedOn: new Set() });

    const own = planWriteBounds(
      journal,
      dayBoundsInput.parse({ onDate: TUE, upAt: "06:00", lightsOut: "22:00" }),
    );
    expect(own.reach).toBeUndefined();
    expect(journal.rows.dayBounds).toHaveLength(2);
  });

  it("writeBounds keeps a weekday's dates with their own bounds out of its reach", () => {
    const tueOwn = bounds({ onDate: TUE });
    const journal = journalOver({ dayBounds: [tueOwn] });
    const out = planWriteBounds(
      journal,
      dayBoundsInput.parse({ weekday: 1, upAt: "07:00", lightsOut: "22:00" }),
    );
    expect(out.reach?.changedOn).toEqual(new Set([TUE]));
  });

  it("writeDayEvent adds an event, edits one by id, and refuses an unknown id or client", () => {
    const coffee = event({ onDate: TUE });
    const journal = journalOver({ dayEvents: [coffee] });
    const made = planWriteDayEvent(
      journal,
      dayEventInput.parse({
        title: "Dentist",
        onDate: MON,
        startsAt: "14:00",
        endsAt: "15:00",
      }),
      undefined,
    );
    expect(journal.rows.dayEvents.find((e) => e.id === made.id)).toEqual(
      expect.objectContaining({
        title: "Dentist",
        tag: "personal",
        rrule: null,
      }),
    );

    const edited = planWriteDayEvent(
      journal,
      dayEventInput.parse({
        title: "Coffee with Sam",
        rrule: "DTSTART;VALUE=DATE:20261020\nRRULE:FREQ=WEEKLY;BYDAY=TU",
        startsAt: "11:00",
        endsAt: "11:30",
      }),
      coffee.id,
      { weekday: 1 },
    );
    expect(edited.id).toBe(coffee.id);
    expect(edited.reach).toEqual({ weekday: 1 });
    expect(journal.rows.dayEvents.find((e) => e.id === coffee.id)).toEqual(
      expect.objectContaining({ createdAt: coffee.createdAt, onDate: null }),
    );

    const input = dayEventInput.parse({
      title: "X",
      onDate: MON,
      startsAt: "09:00",
      endsAt: "10:00",
    });
    expectRefusal(
      () => planWriteDayEvent(journal, input, event().id),
      "unknown",
      "No event with that id.",
    );
    expectRefusal(
      () =>
        planWriteDayEvent(
          journal,
          { ...input, clientId: "00000000-0000-4000-8000-999999999999" },
          undefined,
        ),
      "unknown",
      "No client with that id.",
    );
  });

  it("removeDayEvent removes the event by id and refuses an unknown one (USE-108)", () => {
    const coffee = event({ onDate: TUE });
    const dentist = event({ onDate: MON, title: "Dentist" });
    const journal = journalOver({ dayEvents: [coffee, dentist] });
    expect(planRemoveDayEvent(journal, { id: coffee.id })).toEqual({});
    expect(journal.rows.dayEvents.map((e) => e.id)).toEqual([dentist.id]);
    expectRefusal(
      () => planRemoveDayEvent(journal, { id: coffee.id }),
      "unknown",
      "No event with that id.",
    );
  });
});

describe("remove and reorder (C-USE-92-3)", () => {
  const setUp = () => {
    const morning = block();
    const stretch = item({
      blockId: morning.id,
      title: "Stretch",
      sortOrder: 0,
    });
    const water = item({ blockId: morning.id, title: "Water", sortOrder: 1 });
    const call = item({
      blockId: morning.id,
      title: "Call",
      sortOrder: 2,
      onDate: TUE,
    });
    const monSlot = slot({
      blockId: morning.id,
      onDate: MON,
      blockItemId: stretch.id,
    });
    const journal = journalOver({
      blocks: [morning],
      blockItems: [stretch, water, call],
      slots: [monSlot],
    });
    return { journal, morning, stretch, water, call, monSlot };
  };

  it("with a date, a set item's slot is skipped there and the item stays", () => {
    const { journal, stretch, monSlot } = setUp();
    const onMon = planRemoveBlockItem(journal, { id: stretch.id, date: MON });
    expect(onMon.id).toBe(monSlot.id);
    expect(journal.rows.slots.find((s) => s.id === monSlot.id)).toEqual({
      ...monSlot,
      skipped: true,
      updatedAt: NOW_ISO,
    });
    // A date with no slot yet gets one, made on this first touch.
    const onTue = planRemoveBlockItem(journal, { id: stretch.id, date: TUE });
    expect(journal.rows.slots.find((s) => s.id === onTue.id)).toEqual(
      expect.objectContaining({
        blockItemId: stretch.id,
        onDate: TUE,
        skipped: true,
        sortOrder: 0,
      }),
    );
    expect(journal.rows.blockItems.some((i) => i.id === stretch.id)).toBe(true);
  });

  it("without a date, the item goes with its slots; a date's own item goes either way", () => {
    const { journal, stretch, call, monSlot } = setUp();
    planRemoveBlockItem(journal, { id: stretch.id }, { weekday: 0 });
    expect(journal.rows.blockItems.some((i) => i.id === stretch.id)).toBe(
      false,
    );
    expect(journal.rows.slots.some((s) => s.id === monSlot.id)).toBe(false);
    planRemoveBlockItem(journal, { id: call.id, date: TUE });
    expect(journal.rows.blockItems.some((i) => i.id === call.id)).toBe(false);
    expectRefusal(
      () => planRemoveBlockItem(journal, { id: stretch.id }),
      "unknown",
      "No item with that id.",
    );
  });

  it("removing for a date the block does not run is refused", () => {
    const oneDay = block({ rrule: null, onDate: ONE_DATE });
    const tea = item({ blockId: oneDay.id });
    const journal = journalOver({ blocks: [oneDay], blockItems: [tea] });
    expectRefusal(
      () => planRemoveBlockItem(journal, { id: tea.id, date: MON }),
      "not-on-date",
      "That block is not on that date.",
    );
  });

  it("without a date, reorder renumbers the usual items' sort_order", () => {
    const { journal, morning, stretch, water } = setUp();
    const out = planReorderItems(
      journal,
      { blockId: morning.id, ids: [water.id, stretch.id] },
      { weekday: 0 },
    );
    const order = (id: string) =>
      journal.rows.blockItems.find((i) => i.id === id)!.sortOrder;
    expect([order(water.id), order(stretch.id)]).toEqual([0, 1]);
    expect(journal.rows.slots.every((s) => s.onDate === MON)).toBe(true);
    expect(out.reach).toEqual({ weekday: 0, changedOn: new Set() });
  });

  it("with a date, reorder writes the date's slots and own items, never the usual order", () => {
    const { journal, morning, stretch, water, call, monSlot } = setUp();
    planReorderItems(journal, {
      blockId: morning.id,
      ids: [call.id, water.id, stretch.id],
      date: TUE,
    });
    const item = (id: string) =>
      journal.rows.blockItems.find((i) => i.id === id)!;
    expect(item(stretch.id).sortOrder).toBe(0);
    expect(item(water.id).sortOrder).toBe(1);
    expect(item(call.id).sortOrder).toBe(0);
    const tueSlot = (id: string) =>
      journal.rows.slots.find((s) => s.blockItemId === id && s.onDate === TUE)!;
    expect(tueSlot(water.id).sortOrder).toBe(1);
    expect(tueSlot(stretch.id).sortOrder).toBe(2);
    expect(journal.rows.slots.find((s) => s.id === monSlot.id)).toEqual(
      monSlot,
    );
  });

  it("reorder refuses an item of another block, and a date's own item without its date", () => {
    const { journal, morning, call } = setUp();
    const other = block();
    const elsewhere = item({ blockId: other.id });
    journal.rows.blocks.push(other);
    journal.rows.blockItems.push(elsewhere);
    expectRefusal(
      () =>
        planReorderItems(journal, { blockId: morning.id, ids: [elsewhere.id] }),
      "unknown",
      "That item is not in the block.",
    );
    expectRefusal(
      () => planReorderItems(journal, { blockId: morning.id, ids: [call.id] }),
      "invalid",
      "A date's own item moves on its date.",
    );
  });
});
