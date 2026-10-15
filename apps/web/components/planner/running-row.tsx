"use client";

import {
  Button,
  Checkbox,
  cn,
  HoldIcon,
  ProgressRing,
  ResumeIcon,
  Text,
} from "@syn/ui";
import type { OverBand } from "@syn/utils";
import { HELD_FIGURE_CLASS } from "./running-card";

const BAND_TONE: Record<OverBand, string> = {
  ink: "text-foreground",
  warning: "text-warning-text",
  danger: "text-destructive-text",
};

/**
 * RunningRow — an item running beside the card in a non-work block (USE-24;
 * D-USE-27, D-USE-72): a 20 px ring (elapsed over plan), the title with its
 * count under it, a round Pause, then the box, which is its Done. The count
 * is the caller's, read at the screen's one tick; the row has no clock.
 *
 * Under the plan the count is muted; past it, Done's percent band with
 * "over" in the words. Paused, the count holds and pulses as the card's
 * figure does, and Resume takes Pause's place.
 *
 * Settled (Done a moment ago), the row reads muted with "Done · <n> min",
 * the box filled muted, and nothing on it acts; the ring's and Pause's slots
 * stay empty so the row does not jump. Props only.
 */
export interface RunningRowProps {
  title: string;
  /** "Running · 12:04 of 30 min", "Done · 34 min of 30". */
  meta: string;
  /** Past the plan, the band the meta takes; null reads muted. */
  band: OverBand | null;
  /** Elapsed over plan, 0 to 1; null when settled (the slot kept). */
  ring: number | null;
  /** Paused: the meta holds and pulses. */
  held?: boolean;
  settled?: boolean;
  /** The row's button: "<item>, running, <count>, lift to the card". */
  lift: { name: string; onPress: () => void } | null;
  /** Pause or Resume; null when settled (the slot kept). */
  hold: { name: string; paused: boolean; onPress: () => void } | null;
  box: { name: string; onPress: () => void };
  className?: string;
}

export function RunningRow({
  title,
  meta,
  band,
  ring,
  held = false,
  settled = false,
  lift,
  hold,
  box,
  className,
}: RunningRowProps) {
  const words = (
    <>
      <Text
        as="span"
        variant="body"
        tone={settled ? "muted" : "ink"}
        truncate
        className="block"
      >
        {title}
      </Text>
      <Text
        as="span"
        variant="caption"
        tone="muted"
        data-running-band={band ?? undefined}
        className={cn(
          "block tabular-nums",
          band && !(settled && band === "ink") ? BAND_TONE[band] : undefined,
          held && HELD_FIGURE_CLASS,
        )}
      >
        {meta}
      </Text>
    </>
  );
  return (
    <div
      data-running-row={settled ? "settled" : held ? "paused" : "running"}
      className={cn(
        "border-hairline flex min-h-(--target) items-center gap-(--space-3) border-b py-(--space-2)",
        className,
      )}
    >
      <span className="flex size-5 shrink-0 items-center justify-center">
        {ring === null ? null : <ProgressRing value={ring} />}
      </span>
      {lift ? (
        <button
          type="button"
          aria-label={lift.name}
          onClick={lift.onPress}
          className="min-w-0 flex-1 cursor-pointer text-start"
        >
          {words}
        </button>
      ) : (
        <div className="min-w-0 flex-1">{words}</div>
      )}
      <span className="flex size-9 shrink-0 items-center justify-center">
        {hold ? (
          <Button
            variant="secondary"
            size="icon"
            aria-label={hold.name}
            onClick={hold.onPress}
            className="size-9 rounded-full"
          >
            {hold.paused ? (
              <ResumeIcon aria-hidden="true" className="size-4" />
            ) : (
              <HoldIcon aria-hidden="true" className="size-4" />
            )}
          </Button>
        ) : null}
      </span>
      <span className="flex size-(--target) shrink-0 items-center justify-center">
        <Checkbox
          checked={settled}
          disabled={settled}
          aria-label={box.name}
          className="data-[state=checked]:border-text-muted data-[state=checked]:bg-text-muted disabled:opacity-100"
          onCheckedChange={(value) => {
            if (value === true && !settled) box.onPress();
          }}
        />
      </span>
    </div>
  );
}
