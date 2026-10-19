"use client";

import * as React from "react";

import { Button, ResponsiveSheet, Text, TimeField } from "@syn/ui";
import { formatClock, wallClockToInstant } from "@syn/utils";

import { SheetHost } from "@/components/page-frame";
import { ITEM_COPY as COPY } from "@/components/item-sheet";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

type DayView = RouterOutputs["day"]["get"];

/**
 * DH-02 — when the day really started.
 *
 * THE BODY NAMES WHERE THE VALUE CAME FROM, in three variants: unset, set by
 * the wake-up habit, or set by hand. A person seeing 07:04 needs to know
 * whether the app inferred it or they typed it, because only one of those is
 * worth correcting.
 *
 * *CLEAR* APPEARS ONLY FOR A HAND-SET TIME, and returns the day to its planned
 * anchor rather than to nothing. Clearing an anchor-set time would be undoing
 * a checkbox from the wrong screen — that is what un-ticking the habit is for.
 *
 * THE TIME IS A WALL CLOCK IN THE DAY'S OWN ZONE, converted with USE-1's
 * arithmetic. Building an instant from the device's zone would record a
 * different moment for anyone who has travelled since.
 */
export function WakeTimeSheet({
  open,
  day,
  anchorHabitTitle,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  day: DayView;
  /** Named in the *set by* line, when the anchor is what set it. */
  anchorHabitTitle: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const save = trpc.day.setWakeTime.useMutation();
  const utils = trpc.useUtils();

  const initial =
    day.wokeAt === null
      ? (day.anchorTime ?? "07:00")
      : formatWallClock(day.wokeAt, day.timezone);

  const [value, setValue] = React.useState(initial);

  React.useEffect(() => {
    if (open) setValue(initial);
  }, [open, initial]);

  const body =
    day.wokeAtSource === "manual"
      ? COPY.wakeByHand
      : day.wokeAtSource === "anchor" && day.wokeAt !== null
        ? COPY.wakeByAnchor(
            formatClock(day.wokeAt, day.timezone),
            anchorHabitTitle ?? "",
          )
        : COPY.wakeUnset;

  async function commit(wokeAt: Date | null): Promise<void> {
    await save.mutateAsync({ date: day.dateKey, wokeAt });
    await utils.day.get.invalidate({ date: day.dateKey });
    onSaved?.();
    onOpenChange(false);
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.wakeTime}
        footer={
          <div className="flex items-center justify-between gap-(--space-2)">
            {day.wokeAtSource === "manual" ? (
              <Button
                variant="ghost"
                busy={save.isPending}
                onClick={() => void commit(null)}
              >
                {COPY.clear}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-(--space-2)">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                {COPY.cancel}
              </Button>
              <Button
                busy={save.isPending}
                onClick={() =>
                  void commit(
                    wallClockToInstant(day.dateKey, value, day.timezone),
                  )
                }
              >
                {COPY.save}
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          <Text as="p" tone="secondary">
            {body}
          </Text>
          <TimeField label={COPY.wokeAt} value={value} onChange={setValue} />
        </div>
      </ResponsiveSheet>
    </SheetHost>
  );
}

/** "07:04" in the day's zone — what a `TimeField` takes. */
function formatWallClock(at: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(at);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "07";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}
