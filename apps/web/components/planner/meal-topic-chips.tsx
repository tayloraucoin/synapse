"use client";

import * as React from "react";
import { cn, IconTile, LinkCallout, Text } from "@syn/ui";
import { mealTopicUrl } from "@syn/utils";
import type { MealTopicRecord } from "@syn/validators";
import { MEAL_TOPICS_COPY as COPY } from "./meal-topics-copy";

/**
 * MealTopicChips (USE-22; now/states/meal-pick-topic, meal-topic-picked):
 * under a meal's card, "Watching while eating" with Edit topics, the saved
 * topics as chips led by their icons, and, once one is picked, a
 * LinkCallout that opens it on YouTube. Nothing opens before a pick
 * (D-USE-28): the choice is made here, not by the feed.
 *
 * The chips are one radio group: a pick fills its chip in ink, and tapping
 * the picked chip again keeps it (a pick is changed, not cleared). A meal
 * with no topics shows the heading and Edit topics alone [ASSUMPTION].
 */
export interface MealTopicChipsProps {
  topics: readonly MealTopicRecord[];
  pickedId: string | null;
  onPick: (topic: MealTopicRecord) => void;
  /** Opens the Meal topics sheet; the button is where focus returns. */
  onEditTopics: (opener: HTMLElement) => void;
  className?: string;
}

export function MealTopicChips({
  topics,
  pickedId,
  onPick,
  onEditTopics,
  className,
}: MealTopicChipsProps) {
  const groupName = React.useId();
  const headingId = React.useId();
  const lineId = React.useId();
  const picked = topics.find((topic) => topic.id === pickedId) ?? null;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-(--space-3)", className)}
    >
      <div className="flex items-center justify-between gap-(--space-3)">
        <Text as="h3" id={headingId} variant="row-title" weight={600}>
          {COPY.heading}
        </Text>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={(event) => onEditTopics(event.currentTarget)}
          className="text-accent-text -me-(--space-2) inline-flex min-h-(--target) cursor-pointer items-center rounded-(--radius-control) px-(--space-2) text-(length:--fs-caption) leading-(--lh-caption) font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {COPY.editTopics}
        </button>
      </div>

      {topics.length === 0 ? null : (
        <>
          <Text
            as="p"
            id={lineId}
            variant="secondary"
            tone="secondary"
            className="-mt-(--space-2)"
          >
            {picked === null ? COPY.pickFirst : COPY.picked}
          </Text>

          <div
            role="radiogroup"
            aria-labelledby={headingId}
            aria-describedby={lineId}
            className="flex flex-wrap gap-(--space-2)"
          >
            {topics.map((topic) => {
              const selected = topic.id === pickedId;
              return (
                <label
                  key={topic.id}
                  data-picked={selected || undefined}
                  className={cn(
                    "inline-flex min-h-(--target) cursor-pointer items-center gap-(--space-2) rounded-full border px-(--space-4)",
                    "text-(length:--fs-secondary) leading-(--lh-secondary)",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                    "motion-safe:transition-colors motion-safe:duration-(--dur-state)",
                    selected
                      ? "bg-ink text-paper border-ink"
                      : "border-hairline text-ink hover:bg-surface bg-transparent",
                  )}
                >
                  <input
                    type="radio"
                    name={groupName}
                    value={topic.id}
                    checked={selected}
                    // A radio stays checked when tapped again: a pick is changed, not cleared.
                    onChange={() => onPick(topic)}
                    className="sr-only"
                  />
                  {topic.icon === null ? null : (
                    <IconTile icon={topic.icon} variant="bare" />
                  )}
                  {topic.name}
                </label>
              );
            })}
          </div>

          {picked === null ? null : (
            <LinkCallout
              title={COPY.open}
              url={mealTopicUrl(picked)}
              host={COPY.openLine(picked.name, picked.linkKind)}
              kind="play"
            />
          )}
        </>
      )}
    </section>
  );
}
