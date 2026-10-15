"use client";

import type { IconValue } from "@syn/types";
import { Button, Card, cn, CountdownFace, Text } from "@syn/ui";
import {
  clockAt,
  formatCountdown,
  runningBand,
  type SlotClock,
} from "@syn/utils";
import type { BlockHue } from "./block-hue";
import { LiftedCardHeader } from "./lifted-card";

/**
 * The paused figure (D-USE-29, D-USE-72): muted, pulsing 100% to 40% over
 * `--dur-pulse` where motion is allowed, held at 60% where it is reduced.
 * The only motion on Now. Exported so a test reads the rule the card wears.
 */
export const HELD_FIGURE_CLASS =
  "text-text-muted motion-safe:animate-held motion-reduce:opacity-60";

/**
 * RunningCard — Start turned the lifted card into this, in place (USE-23;
 * day/running). The figure is `clockAt` over the slot's derived clock at the
 * screen's one tick (`useWorkClock`), never a counter: it counts down from
 * the plan with "of <n> min" beside it, then "m:ss over" and "n min over",
 * coloured by Done's percent bands with the word always there. The border,
 * the dot and the buttons never change with the band; no sound, no buzz.
 * Paused, the figure holds and pulses and Resume takes Pause's place.
 * Props only.
 */
export interface RunningCardProps {
  title: string;
  icon: IconValue | null;
  hue: BlockHue;
  /** "Started 7:14", or paused "Paused · started 7:14". */
  meta: string;
  /** The group's name: "Meditate, running". */
  label: string;
  /** The planned length, whole minutes. */
  planMin: number;
  /** "of 10 min". */
  ofPlan: string;
  slotClock: SlotClock;
  /** The tick's instant. */
  now: Date;
  /** The day's close: nothing counts past it. */
  dayEnd: Date;
  pause: { label: string; onPress: () => void };
  resume: { label: string; onPress: () => void };
  done: { label: string; name: string; onPress: () => void };
  className?: string;
}

export function RunningCard({
  title,
  icon,
  hue,
  meta,
  label,
  planMin,
  ofPlan,
  slotClock,
  now,
  dayEnd,
  pause,
  resume,
  done,
  className,
}: RunningCardProps) {
  const { workMs, running } = clockAt(slotClock, now, dayEnd);
  const clock = formatCountdown(planMin * 60_000, workMs);
  const band = runningBand(planMin, workMs);
  const held = !running;
  const hold = held ? resume : pause;

  return (
    <Card
      role="group"
      aria-label={label}
      data-lifted-card=""
      data-running-card={held ? "paused" : "running"}
      className={cn("shadow-none", className)}
    >
      <LiftedCardHeader title={title} icon={icon} hue={hue} meta={meta} />
      <div className="flex items-baseline gap-(--space-2)">
        <CountdownFace
          figure={clock.figure}
          over={clock.over ? { word: "over", level: band } : null}
          className={held ? HELD_FIGURE_CLASS : undefined}
        />
        <Text as="span" variant="body" tone="muted" className="tabular-nums">
          {ofPlan}
        </Text>
      </div>
      <div className="grid grid-cols-2 gap-(--space-2) wide:flex wide:justify-end">
        <Button
          variant="secondary"
          size="lg"
          onClick={hold.onPress}
          className="wide:w-40"
        >
          {hold.label}
        </Button>
        <Button
          size="lg"
          aria-label={done.name}
          onClick={done.onPress}
          className="wide:w-40"
        >
          {done.label}
        </Button>
      </div>
    </Card>
  );
}
