"use client";

import { NowScreen } from "@/app/(shell)/today/_components/now/now-screen";
import { PinnedScenarioProvider } from "@/lib/data/source";

/**
 * A meal's topics on Now and the Meal topics sheet over it (USE-22), by
 * their /today scenario names, for the capture host. The sheet is the shell's
 * sheet host's, opened by the scenario's `view.open`.
 */
export type MealTopicPartState =
  "meal-pick-topic" | "meal-topic-picked" | "meal-topics-sheet";

export function MealTopicPart({ state }: { state: MealTopicPartState }) {
  return (
    <PinnedScenarioProvider value={state}>
      <NowScreen />
    </PinnedScenarioProvider>
  );
}
