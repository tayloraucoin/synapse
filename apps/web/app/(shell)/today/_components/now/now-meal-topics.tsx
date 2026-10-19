"use client";

import * as React from "react";
import { MealTopicChips } from "@/components/planner";
import { MEAL_TOPICS_COPY } from "@/components/planner/meal-topics-copy";
import { useMealPick, useMealTopics } from "@/lib/data/use-meal-topics";
import { useOpenSheet } from "../../../_components/sheet-host";

/**
 * A meal's topics on Now (USE-22; now/states/meal-pick-topic,
 * meal-topic-picked): every saved topic as a chip under the meal's card, the
 * pick kept for this meal on this device (D-USE-72), Edit topics opening the
 * Meal topics sheet over Now. Now offers every saved topic until the block
 * view can leave one out (its own ticket).
 */
export function NowMealTopics({
  dateKey,
  blockId,
  seed = null,
}: {
  dateKey: string;
  blockId: string;
  /** A scenario's pick, for a capture. */
  seed?: string | null;
}) {
  const { query } = useMealTopics();
  const [pickedId, pick] = useMealPick(dateKey, blockId, seed);
  const openSheet = useOpenSheet();
  const [announcement, setAnnouncement] = React.useState("");

  return (
    <>
      <MealTopicChips
        topics={query.data ?? []}
        pickedId={pickedId}
        onPick={(topic) => {
          pick(topic.id);
          setAnnouncement(MEAL_TOPICS_COPY.announcePicked(topic.name));
        }}
        onEditTopics={(opener) => openSheet("meal-topics", opener)}
        className="pt-(--space-4)"
      />
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
