import { describe, expect, it } from "vitest";
import {
  listMealTopics,
  listSavedColours,
  removeMealTopic,
  removeSavedColour,
  writeMealTopic,
  writeSavedColour,
  type MealTopicStore,
  type SavedColourStore,
} from "@syn/api";
import {
  mealTopicRecord,
  type MealTopicRecord,
  type SavedColourRecord,
} from "@syn/validators";

/**
 * USE-97's C2: the planner's saved-colour and meal-topic rules over rows in
 * memory, the unique `(user_id, hex)` kept as the table keeps it. The
 * services take a store, so this proves the rules the routers run inside
 * `ctx.rls.execute()`.
 */

const STAMP = "2026-10-16T09:00:00.000Z";

function memoryColours(): SavedColourStore & { rows: SavedColourRecord[] } {
  const rows: SavedColourRecord[] = [];
  return {
    rows,
    list: () =>
      Promise.resolve([...rows].sort((a, b) => b.sortOrder - a.sortOrder)),
    byHex: (hex) => Promise.resolve(rows.find((r) => r.hex === hex) ?? null),
    insert(values) {
      if (rows.some((r) => r.hex === values.hex)) return Promise.resolve(null);
      const row = {
        id: crypto.randomUUID(),
        createdAt: STAMP,
        updatedAt: STAMP,
        ...values,
      };
      rows.push(row);
      return Promise.resolve(row);
    },
    update(id, values) {
      const row = rows.find((r) => r.id === id);
      if (row) Object.assign(row, values);
      return Promise.resolve(row ?? null);
    },
    remove(id) {
      const index = rows.findIndex((r) => r.id === id);
      if (index !== -1) rows.splice(index, 1);
      return Promise.resolve(index !== -1);
    },
  };
}

function memoryTopics(): MealTopicStore & { rows: MealTopicRecord[] } {
  const rows: MealTopicRecord[] = [];
  return {
    rows,
    list: () =>
      Promise.resolve([...rows].sort((a, b) => a.sortOrder - b.sortOrder)),
    insert(values) {
      const row = {
        id: crypto.randomUUID(),
        createdAt: STAMP,
        updatedAt: STAMP,
        ...values,
      };
      rows.push(row);
      return Promise.resolve(row);
    },
    update(id, values) {
      const row = rows.find((r) => r.id === id);
      if (row) Object.assign(row, values);
      return Promise.resolve(row ?? null);
    },
    remove(id) {
      const index = rows.findIndex((r) => r.id === id);
      if (index !== -1) rows.splice(index, 1);
      return Promise.resolve(index !== -1);
    },
  };
}

describe("C2: saved colours", () => {
  it("a hex written twice returns the one row", async () => {
    const store = memoryColours();
    const first = await writeSavedColour(store, { hex: "#a1b2c3", sortOrder: 0 });
    const again = await writeSavedColour(store, { hex: "#a1b2c3", sortOrder: 1 });
    expect(again).toEqual(first);
    expect(await listSavedColours(store)).toHaveLength(1);
  });

  it("lists newest first, and a change to another row's hex is refused", async () => {
    const store = memoryColours();
    const older = await writeSavedColour(store, { hex: "#111111", sortOrder: 0 });
    const newer = await writeSavedColour(store, { hex: "#222222", sortOrder: 1 });
    expect((await listSavedColours(store)).map((r) => r.id)).toEqual([
      newer.id,
      older.id,
    ]);
    await expect(
      writeSavedColour(store, { id: older.id, hex: "#222222", sortOrder: 0 }),
    ).rejects.toMatchObject({ cause: { reason: "duplicate" } });
  });

  it("remove deletes it; removing it again is refused unknown", async () => {
    const store = memoryColours();
    const row = await writeSavedColour(store, { hex: "#a1b2c3", sortOrder: 0 });
    await removeSavedColour(store, row.id);
    expect(store.rows).toHaveLength(0);
    await expect(removeSavedColour(store, row.id)).rejects.toMatchObject({
      cause: { reason: "unknown" },
    });
  });

});

describe("C2: meal topics", () => {
  const topic = {
    name: "Cooking",
    linkKind: "search" as const,
    linkValue: "quick dinners",
    sortOrder: 0,
  };

  it("writes, lists in order, changes and removes", async () => {
    const store = memoryTopics();
    const live = await writeMealTopic(store, { ...topic, sortOrder: 1 });
    const first = await writeMealTopic(store, { ...topic, name: "Walk", sortOrder: 0 });
    // The fixture's record: an absent icon is stored as null.
    expect(mealTopicRecord.parse(live)).toEqual(live);
    expect(live.icon).toBeNull();

    expect((await listMealTopics(store)).map((r) => r.name)).toEqual([
      "Walk",
      "Cooking",
    ]);

    const changed = await writeMealTopic(store, {
      ...topic,
      id: live.id,
      name: "Cook",
      sortOrder: 1,
    });
    expect(changed).toMatchObject({ id: live.id, name: "Cook" });

    await removeMealTopic(store, first.id);
    expect(store.rows.map((r) => r.id)).toEqual([live.id]);
  });

  it("an id not held is refused unknown, on write and on remove", async () => {
    const store = memoryTopics();
    const id = crypto.randomUUID();
    await expect(writeMealTopic(store, { ...topic, id })).rejects.toMatchObject({
      cause: { reason: "unknown" },
    });
    await expect(removeMealTopic(store, id)).rejects.toMatchObject({
      cause: { reason: "unknown" },
    });
  });
});
