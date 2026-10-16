"use client";

import * as React from "react";
import { Checkbox, cn, HueSquare, SegmentedControl, Text } from "@syn/ui";
import { clockMinutes, weekdayIndex, type WorkTier } from "@syn/utils";
import {
  clockWords,
  dayRoomOf,
  lengthWords,
  shortDate,
} from "@/lib/data/spread";
import type { useSpread } from "@/lib/data/use-spread";
import { TIER_HUE } from "../view";
import { SPREAD_PHONE_COPY as COPY, SPREAD_COPY } from "./copy";

/**
 * DaysAndTierStep (USE-78; interactions/spread/states/days-and-tier.md):
 * Spread's page inside its full sheet (D-USE-57). Days: each weekday on a
 * hairline with its free time in the chosen block, a length and never a
 * count; today once its block has begun is not offered and says so ("today,
 * already past 9:30"). Tier, every session: one tier for them all, its square
 * with its word. The picks apply as made (the hook holds them), so Done and
 * back both keep them; the sheet draws the back row, the title and Done.
 *
 * [ASSUMPTION] With Pick per day, each picked day lists its Work blocks to
 * choose one, as the desk's Pick blocks; not drawn.
 */

type Spread = ReturnType<typeof useSpread>;

const WEEKDAY = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIERS: readonly WorkTier[] = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
];
const TIER_WORD: Record<WorkTier, string> = {
  urgent: "Urgent",
  primary: "Primary",
  secondary: "Secondary",
  stretch: "Stretch",
};

/** "2 h 10" read aloud: "2 hours 10". */
const spoken = (words: string) =>
  words.replace(/^1 h\b/, "1 hour").replace(/(\d+) h\b/, "$1 hours");

export function DaysAndTierStep({ spread }: { spread: Spread }) {
  const baseId = React.useId();
  const days = new Map(spread.days.map((day) => [day.dateKey, day]));
  // Only the first offered row names the block, as drawn.
  const firstOffered = spread.chips.find((chip) => chip.offered)?.dateKey;
  const blockWord =
    spread.which === "pick"
      ? null
      : spread.which === "morning"
        ? "morning"
        : "afternoon";

  return (
    <div className="flex flex-col">
      <Text
        as="h3"
        id={`${baseId}-days`}
        className="text-(length:--fs-label) font-semibold text-foreground"
      >
        {COPY.days}
      </Text>
      <ul aria-labelledby={`${baseId}-days`} className="flex flex-col">
        {spread.chips.map((chip) => {
          const day = days.get(chip.dateKey);
          const room = day ? dayRoomOf(day, spread.pick) : null;
          const weekday = WEEKDAY[weekdayIndex(chip.dateKey)]!;
          const date = Number(chip.dateKey.slice(8));
          const line =
            room === null
              ? ""
              : room.kind === "free"
                ? room.min === 0
                  ? COPY.noRoom
                  : COPY.free(
                      lengthWords(room.min),
                      chip.dateKey === firstOffered ? blockWord : null,
                    )
                : room.reason === "begun" && room.since !== null
                  ? COPY.today(room.since)
                  : SPREAD_COPY.reason(room.reason, spread.which);
          const boxId = `${baseId}-${chip.dateKey}`;
          return (
            <li key={chip.dateKey} className="border-b border-hairline">
              <label
                htmlFor={boxId}
                className={cn(
                  "flex min-h-13 items-center gap-(--space-3)",
                  chip.offered ? "cursor-pointer" : "cursor-default",
                )}
              >
                <Checkbox
                  id={boxId}
                  checked={chip.picked}
                  disabled={!chip.offered}
                  aria-label={COPY.dayName(weekday, date, spoken(line))}
                  onCheckedChange={() => spread.toggleDay(chip.dateKey)}
                  className="size-5"
                />
                <span
                  className={cn(
                    "text-(length:--fs-body)",
                    chip.offered ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {shortDate(chip.dateKey)}
                </span>
                <span
                  aria-hidden="true"
                  className="ms-auto text-(length:--fs-caption) tabular-nums text-muted-foreground"
                >
                  {line}
                </span>
              </label>
              {spread.which === "pick" && chip.picked ? (
                <PickBlock spread={spread} chip={chip} weekday={weekday} />
              ) : null}
            </li>
          );
        })}
      </ul>

      <SegmentedControl<WorkTier>
        label={COPY.tier}
        stacked={false}
        value={spread.tier}
        onChange={spread.setTier}
        options={TIERS.map((tier) => ({
          value: tier,
          label: (
            <span className="flex items-center gap-1.5">
              <HueSquare hue={TIER_HUE[tier]} />
              {TIER_WORD[tier]}
            </span>
          ),
        }))}
        className="pt-(--space-5)"
        classes={{
          label: "text-(length:--fs-label) font-semibold text-foreground",
          group: "bg-fill-muted gap-0 border-0 p-(--space-1)",
          item: cn(
            "bg-transparent text-muted-foreground h-10 min-w-0 rounded-(--radius-control) px-(--space-1) font-normal",
            "has-checked:bg-background has-checked:text-foreground has-checked:font-semibold",
          ),
        }}
      />
    </div>
  );
}

function PickBlock({
  spread,
  chip,
  weekday,
}: {
  spread: Spread;
  chip: Spread["chips"][number];
  weekday: string;
}) {
  const open = chip.blocks.filter((b) => !b.begun);
  const chosen = spread.blockPicks[chip.dateKey] ?? open[0]?.id;
  return (
    <div
      role="radiogroup"
      aria-label={COPY.pickFor(weekday)}
      className="flex flex-wrap gap-(--space-2) ps-8 pb-(--space-3)"
    >
      {chip.blocks.map((block) => {
        const on = block.id === chosen;
        return (
          <button
            key={block.id}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={block.begun}
            onClick={() => spread.setBlockPick(chip.dateKey, block.id)}
            className={cn(
              "h-11 rounded-(--radius-control) border px-(--space-3) text-(length:--fs-label) tabular-nums outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring",
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-hairline bg-background text-foreground",
              block.begun &&
                "border-dashed bg-transparent text-muted-foreground",
            )}
          >
            {clockWords(clockMinutes(block.start))} to{" "}
            {clockWords(clockMinutes(block.end))}
          </button>
        );
      })}
    </div>
  );
}
