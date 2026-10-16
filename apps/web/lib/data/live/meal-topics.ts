import { mealTopicWriteInput } from "@syn/validators";
import { MealTopicRefusal } from "@/lib/data/refusals";
import type { LiveDomain } from "./domains";
import { callLive } from "./errors";

/**
 * Meal topics, live (USE-97): `planner.mealTopics.*`. The input is parsed
 * here first, so a bad topic is refused "invalid" with the schema's words, as
 * the fixture refuses it, before any call.
 */
export const mealTopicsDomain: LiveDomain = {
  name: "meal-topics",
  methods: (client) => ({
    listMealTopics: () =>
      callLive("mealTopic", () => client.planner.mealTopics.list.query()),

    async writeMealTopic(raw) {
      const parsed = mealTopicWriteInput.safeParse(raw);
      if (!parsed.success) {
        throw new MealTopicRefusal(
          "invalid",
          parsed.error.issues[0]?.message ?? "Invalid meal topic.",
        );
      }
      return callLive("mealTopic", () =>
        client.planner.mealTopics.write.mutate(parsed.data),
      );
    },

    removeMealTopic: (id) =>
      callLive("mealTopic", () => client.planner.mealTopics.remove.mutate({ id })),
  }),
};
