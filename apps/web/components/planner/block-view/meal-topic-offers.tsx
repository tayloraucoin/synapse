"use client";

import * as React from "react";
import { cn, IconTile, Text } from "@syn/ui";
import type { MealTopicRecord } from "@syn/validators";
import { BLOCK_VIEW_COPY as COPY } from "./copy";

/**
 * MealTopicOffers — a meal's topics in editing (USE-49; meal-editing.md,
 * D-USE-28, D-USE-30): "Watching while eating" with Edit topics, the line
 * "Offered at Breakfast. Tap to leave one out." and the saved topics as
 * toggle buttons led by their icons. Pressed is offered (filled ink); a tap
 * leaves one out (outlined) or offers it again. State in words and shape,
 * never colour alone: `aria-pressed` and the fill. Props only.
 */
export interface MealTopicOffersProps {
  /** The block's name: "Breakfast". */
  meal: string;
  topics: readonly MealTopicRecord[];
  leftOut: ReadonlySet<string>;
  onToggle: (topicId: string) => void;
  /** Opens the Meal topics sheet (USE-22). */
  onEditTopics: () => void;
}

export function MealTopicOffers({
  meal,
  topics,
  leftOut,
  onToggle,
  onEditTopics,
}: MealTopicOffersProps) {
  const headingId = React.useId();
  const lineId = React.useId();
  return (
    <section
      aria-labelledby={headingId}
      data-meal-topics
      className="flex flex-col gap-(--space-2) pt-(--space-3)"
    >
      <div className="flex items-center justify-between gap-(--space-3)">
        <Text as="h2" id={headingId} variant="row-title" weight={600}>
          {COPY.editing.watching}
        </Text>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={onEditTopics}
          className="text-accent-text -me-(--space-2) inline-flex min-h-(--target) cursor-pointer items-center rounded-(--radius-control) px-(--space-2) text-(length:--fs-caption) leading-(--lh-caption) font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {COPY.editing.editTopics}
        </button>
      </div>
      <Text as="p" id={lineId} variant="caption" tone="muted">
        {COPY.editing.offeredAt(meal)}
      </Text>
      <div
        role="group"
        aria-labelledby={headingId}
        aria-describedby={lineId}
        className="flex flex-wrap gap-(--space-2) pt-(--space-1)"
      >
        {topics.map((topic) => {
          const offered = !leftOut.has(topic.id);
          return (
            <button
              key={topic.id}
              type="button"
              aria-pressed={offered}
              data-offered={offered || undefined}
              onClick={() => onToggle(topic.id)}
              className={cn(
                "inline-flex min-h-(--target) cursor-pointer items-center gap-(--space-2) rounded-full border px-(--space-4)",
                "text-(length:--fs-secondary) leading-(--lh-secondary)",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                "motion-safe:transition-colors motion-safe:duration-(--dur-state)",
                offered
                  ? "bg-ink text-paper border-ink font-medium"
                  : "border-hairline text-text-muted hover:bg-surface bg-transparent",
              )}
            >
              {topic.icon === null ? null : (
                <IconTile icon={topic.icon} variant="bare" />
              )}
              {topic.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
