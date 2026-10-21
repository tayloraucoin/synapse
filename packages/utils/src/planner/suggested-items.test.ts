import { describe, expect, it } from "vitest";
import { NEW_BLOCK_KINDS, SUGGESTED_SEED } from "@syn/constants";
import { suggestedItems, usedBefore, type UsedBeforeItem } from "./suggested-items";

type Icon = { kind: "emoji"; value: string };

const blocks = [
  { id: "mon-wellness", kind: "wellness" },
  { id: "thu-wellness", kind: "wellness" },
  { id: "mon-training", kind: "training" },
];

let next = 0;
function item(
  blockId: string,
  title: string,
  extra: Partial<UsedBeforeItem<Icon>> = {},
): UsedBeforeItem<Icon> {
  next += 1;
  return {
    id: `item-${next}`,
    blockId,
    title,
    icon: null,
    lengthMin: 5,
    isTransition: false,
    meal: false,
    onDate: null,
    updatedAt: "2026-10-01T00:00:00Z",
    ...extra,
  };
}

const sauna: Icon = { kind: "emoji", value: "S" };

const blockItems = [
  item("mon-wellness", "Sauna", { lengthMin: 10, icon: sauna }),
  item("mon-wellness", "Meditate", { lengthMin: 10 }),
  item("mon-wellness", "Stretch", { lengthMin: 5 }),
  item("mon-wellness", "To work", { isTransition: true }),
  item("mon-wellness", "Breakfast", { meal: true }),
  item("thu-wellness", "sauna ", {
    lengthMin: 20,
    updatedAt: "2026-10-10T00:00:00Z",
  }),
  item("thu-wellness", "Stretch", { lengthMin: 8 }),
  item("mon-training", "Run", { lengthMin: 30 }),
];

const records = { blocks, blockItems };

describe("usedBefore and suggestedItems (C1)", () => {
  const used = usedBefore(records, "wellness", { inBlock: ["Meditate"] });

  it("lists the kind's items one per title, with the latest length, minus the block's own", () => {
    expect(used.map((row) => [row.title, row.lengthMin])).toEqual([
      ["sauna ", 20],
      ["Stretch", 5],
    ]);
  });

  it("leaves out transitions, meals and other kinds", () => {
    const titles = used.map((row) => row.title);
    expect(titles).not.toContain("To work");
    expect(titles).not.toContain("Breakfast");
    expect(titles).not.toContain("Run");
  });

  it("puts used before first, then the seed without a title already used or in the block", () => {
    const list = suggestedItems({
      usedBefore: used,
      seed: SUGGESTED_SEED.wellness,
      inBlock: ["Meditate"],
      defaultLengthMin: 5,
    });
    expect(list.usedBefore.map((row) => row.title)).toEqual(["sauna ", "Stretch"]);
    const seedTitles = list.seed.map((row) => row.title);
    expect(seedTitles).not.toContain("Stretch");
    expect(seedTitles).not.toContain("Meditate");
    expect(seedTitles[0]).toBe("Breath work");
    expect(new Set(seedTitles).size).toBe(seedTitles.length);
    // Walk is in morning and prep; it shows once.
    expect(seedTitles.filter((title) => title === "Walk")).toHaveLength(1);
    // A seed row's length is its rangeMin.
    expect(list.seed[0]!.lengthMin).toBe(5);
  });

  it("drops an item dated to another day when a date is given", () => {
    const dated = {
      blocks,
      blockItems: [
        item("mon-wellness", "Sauna", { onDate: "2026-10-05" }),
        item("mon-wellness", "Read", { onDate: null }),
      ],
    };
    expect(
      usedBefore(dated, "wellness", { date: "2026-10-06" }).map((r) => r.title),
    ).toEqual(["Read"]);
    expect(usedBefore(dated, "wellness").map((r) => r.title)).toEqual([
      "Sauna",
      "Read",
    ]);
  });
});

describe("SUGGESTED_SEED (C2)", () => {
  const titles = (kind: (typeof NEW_BLOCK_KINDS)[number]) =>
    SUGGESTED_SEED[kind].map((row) => row.title);

  it("keys every one of the seven kinds", () => {
    expect(Object.keys(SUGGESTED_SEED).sort()).toEqual([...NEW_BLOCK_KINDS].sort());
  });

  it("Wellness is morning, recommended first, then prep", () => {
    const wellness = SUGGESTED_SEED.wellness;
    const firstOther = wellness.findIndex((row) => !row.recommended);
    expect(wellness.slice(0, firstOther).every((row) => row.recommended)).toBe(true);
    expect(firstOther).toBe(12);
    expect(titles("wellness").slice(0, 3)).toEqual([
      "Breath work",
      "Cold shower",
      "Meditate",
    ]);
    expect(titles("wellness")).toContain("Yoga");
    expect(titles("wellness").slice(-3)).toEqual([
      "Walk the dog",
      "Kids' school run",
      "Pack lunch",
    ]);
  });

  it("Training is Run, Swim, Yoga, Mobility, Climb, Ride", () => {
    expect(titles("training")).toEqual(["Run", "Swim", "Yoga", "Mobility", "Climb", "Ride"]);
  });

  it("Life is activity; Break is break", () => {
    expect(titles("life")[0]).toBe("Walk");
    expect(titles("life")).toContain("Fix something");
    expect(titles("break")).toEqual(
      expect.arrayContaining(["Walk", "Nap", "Lunch", "Eyes off screens"]),
    );
  });

  it("Evening is wind-down, placed rows plain, then Cook, Dinner, Chores", () => {
    expect(titles("evening")).toContain("Journal");
    expect(titles("evening")).toContain("Phone away");
    expect(titles("evening").slice(-3)).toEqual(["Cook", "Dinner", "Chores"]);
  });

  it("Work and To-dos have none", () => {
    expect(SUGGESTED_SEED.work).toEqual([]);
    expect(SUGGESTED_SEED.todos).toEqual([]);
  });

  it("keeps the starter rows' titles, glyphs and ranges", () => {
    const run = SUGGESTED_SEED.training[0]!;
    expect(run).toMatchObject({ title: "Run", rangeMin: 20, rangeMax: 45 });
    expect(run.icon.kind).toBe("emoji");
  });
});
