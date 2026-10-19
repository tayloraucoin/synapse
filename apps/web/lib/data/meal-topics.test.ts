import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { MealTopicRecord } from "@syn/validators";
import { MealTopicChips } from "@/components/planner/meal-topic-chips";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { MEAL_TOPIC_IDS } from "@/lib/fixtures/scenarios/base-day";
import { NOW_IDS } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import {
  mealTopicActions,
  readMealPick,
  writeMealPick,
} from "./use-meal-topics";

function server() {
  return createFixtureServer(
    resolveScenario("meal-pick-topic"),
    () => new Date("2026-10-12T09:02:00-04:00"),
  );
}

/** A device's storage, in memory. */
function storage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  };
}

/** The chips as a meal draws them, with nothing picked or one. */
function chips(topics: MealTopicRecord[], pickedId: string | null = null) {
  return renderToStaticMarkup(
    createElement(MealTopicChips, {
      topics,
      pickedId,
      onPick: () => {},
      onEditTopics: () => {},
    }),
  );
}

/** The chip labels' names, in order. */
function chipNames(markup: string): string[] {
  return [...markup.matchAll(/<label[^>]*>.*?<\/label>/g)].map((m) =>
    m[0].replace(/<[^>]+>/g, "").trim(),
  );
}

const DAY = "2026-10-12";
const LUNCH = "lunch-block";

describe("C5: a meal's topics and the Meal topics sheet", () => {
  it("offers the four topics in order, no link before a pick and one after", async () => {
    const topics = await server().listMealTopics();
    const before = chips(topics);
    expect(chipNames(before)).toEqual([
      "Agent workflows",
      "Strength training",
      "Roman history",
      "Cooking basics",
    ]);
    expect(before).toContain("Pick one before opening YouTube.");
    expect(before).not.toContain("youtube.com");
    expect(before).not.toContain("Open in YouTube");

    const after = chips(topics, MEAL_TOPIC_IDS.agentWorkflows);
    expect(after).toContain("Picked for this meal. Tap another to change.");
    expect(after).toContain("Open in YouTube");
    expect(after).toContain("Agent workflows · saved playlist");
    expect(after).toContain(
      'href="https://www.youtube.com/playlist?list=PLplaceholder0agents"',
    );
    expect(after).toContain('target="_blank"');
  });

  it("a pick on Breakfast is gone on Lunch, and on Breakfast tomorrow", () => {
    const device = storage();
    writeMealPick(device, {
      dateKey: DAY,
      blockId: NOW_IDS.blocks.breakfast,
      topicId: MEAL_TOPIC_IDS.romanHistory,
    });
    expect(readMealPick(device, DAY, NOW_IDS.blocks.breakfast)).toBe(
      MEAL_TOPIC_IDS.romanHistory,
    );
    expect(readMealPick(device, DAY, LUNCH)).toBeNull();
    expect(
      readMealPick(device, "2026-10-13", NOW_IDS.blocks.breakfast),
    ).toBeNull();

    // A pick on Lunch replaces Breakfast's: one meal's pick at a time.
    writeMealPick(device, {
      dateKey: DAY,
      blockId: LUNCH,
      topicId: MEAL_TOPIC_IDS.cookingBasics,
    });
    expect(readMealPick(device, DAY, NOW_IDS.blocks.breakfast)).toBeNull();
  });

  it("a topic's icon changed in the sheet shows on its chip", async () => {
    const fixture = server();
    const actions = mealTopicActions(fixture);
    await actions.update(MEAL_TOPIC_IDS.cookingBasics, {
      icon: { kind: "emoji", value: "🍳" },
    });
    const topics = await fixture.listMealTopics();
    const cooking = topics.find((t) => t.id === MEAL_TOPIC_IDS.cookingBasics);
    expect(cooking?.icon).toEqual({ kind: "emoji", value: "🍳" });
    // Its place, name and link stay.
    expect(cooking?.sortOrder).toBe(3);
    expect(cooking?.linkValue).toBe("simple weeknight cooking");
    expect(chips(topics)).toMatch(/<label[^>]*>.*🍳.*Cooking basics<\/label>/);
  });

  it("a drag reorders the chips", async () => {
    const fixture = server();
    await mealTopicActions(fixture).reorder([
      MEAL_TOPIC_IDS.romanHistory,
      MEAL_TOPIC_IDS.agentWorkflows,
      MEAL_TOPIC_IDS.strengthTraining,
      MEAL_TOPIC_IDS.cookingBasics,
    ]);
    expect(chipNames(chips(await fixture.listMealTopics()))).toEqual([
      "Roman history",
      "Agent workflows",
      "Strength training",
      "Cooking basics",
    ]);
  });

  it("a delete removes the topic and Undo restores it in place", async () => {
    const fixture = server();
    const actions = mealTopicActions(fixture);
    const removed = await actions.remove(MEAL_TOPIC_IDS.strengthTraining);
    expect(removed?.name).toBe("Strength training");
    expect(chipNames(chips(await fixture.listMealTopics()))).toEqual([
      "Agent workflows",
      "Roman history",
      "Cooking basics",
    ]);

    await actions.restore(removed!);
    const back = await fixture.listMealTopics();
    expect(chipNames(chips(back))).toEqual([
      "Agent workflows",
      "Strength training",
      "Roman history",
      "Cooking basics",
    ]);
    expect(back[1]).toMatchObject({
      icon: { kind: "lucide", value: "dumbbell", color: "rose" },
      linkKind: "channel",
      linkValue: "@placeholder",
    });
  });

  it("a new topic goes last, and one with no link is refused", async () => {
    const fixture = server();
    const actions = mealTopicActions(fixture);
    await actions.add({
      name: "Jazz piano",
      icon: null,
      linkKind: "search",
      linkValue: "jazz piano lessons",
    });
    const topics = await fixture.listMealTopics();
    expect(topics.at(-1)?.name).toBe("Jazz piano");
    await expect(
      actions.add({
        name: "Nothing",
        icon: null,
        linkKind: "search",
        linkValue: "",
      }),
    ).rejects.toThrow();
  });
});
