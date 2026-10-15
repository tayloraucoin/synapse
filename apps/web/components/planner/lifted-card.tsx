"use client";

import type { IconValue } from "@syn/types";
import { Button, Card, cn, ItemIcon, Text } from "@syn/ui";
import { HUE_CHIP, type BlockHue } from "./block-hue";

/**
 * LiftedCard — Now's current item (USE-16; D-USE-7, D-USE-26): a 40 px icon
 * tile on the kind's chip fill, the verdigris dot and the name, the length
 * and planned start, then Start and Done side by side. The card itself is
 * the mark of "this moment"; the dot never stands alone. Props only.
 *
 * From 768 the buttons keep a fixed 160 and sit right-aligned (D-USE-39).
 *
 * A meal (USE-17; now/states/transition.md) passes `hue="neutral"` for the
 * `--color-fill-muted` tile and no `start`: Done alone, full width.
 */
export interface LiftedCardProps {
  title: string;
  icon: IconValue | null;
  /** "neutral": a meal's tile, no kind colour. */
  hue: BlockHue | "neutral";
  /** "10 min · 7:10". */
  meta: string;
  /** The group's name: "Meditate, now". */
  label: string;
  /** Null: no Start (a meal), and Done takes the full width. */
  start: { label: string; onPress: () => void } | null;
  /** Done's visible word and its name ("Done, Meditate"). */
  done: { label: string; name: string; onPress: () => void };
  className?: string;
}

/**
 * The card's head, shared with `RunningCard` (USE-23) so Start never moves
 * the frame: the tile, the dot and the name, the meta line under them.
 */
export function LiftedCardHeader({
  title,
  icon,
  hue,
  meta,
}: Pick<LiftedCardProps, "title" | "icon" | "hue" | "meta">) {
  return (
    <div className="flex items-center gap-(--space-3)">
      <span
        aria-hidden="true"
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-(--radius-control)",
          hue === "neutral" ? "bg-fill-muted" : HUE_CHIP[hue],
        )}
      >
        <ItemIcon icon={icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-(--space-2)">
          <span
            aria-hidden="true"
            className="bg-accent-mark size-2 shrink-0 rounded-full"
          />
          <Text as="p" variant="row-title" weight={600} truncate>
            {title}
          </Text>
        </div>
        <Text as="p" variant="caption" weight={500} className="tabular-nums">
          {meta}
        </Text>
      </div>
    </div>
  );
}

export function LiftedCard({
  title,
  icon,
  hue,
  meta,
  label,
  start,
  done,
  className,
}: LiftedCardProps) {
  return (
    <Card
      role="group"
      aria-label={label}
      data-lifted-card=""
      className={cn("shadow-none", className)}
    >
      <LiftedCardHeader title={title} icon={icon} hue={hue} meta={meta} />
      <div
        className={cn(
          "grid gap-(--space-2)",
          start ? "grid-cols-2 wide:flex wide:justify-end" : "grid-cols-1",
        )}
      >
        {start ? (
          <Button
            variant="secondary"
            size="lg"
            onClick={start.onPress}
            className="wide:w-40"
          >
            {start.label}
          </Button>
        ) : null}
        <Button
          size="lg"
          aria-label={done.name}
          onClick={done.onPress}
          className={start ? "wide:w-40" : undefined}
        >
          {done.label}
        </Button>
      </div>
    </Card>
  );
}
