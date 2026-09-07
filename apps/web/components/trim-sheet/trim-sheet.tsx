"use client";

import * as React from "react";

import {
  Button,
  HelperText,
  ItemRow,
  NumberUnitInput,
  QuickChipRow,
  ResponsiveSheet,
  StatusLine,
  Text,
} from "@syn/ui";
import { CAPACITY_MAX, CAPACITY_MIN } from "@syn/constants";
import { computeTrim, formatWindow, type TrimItem } from "@syn/utils";

import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { TRIM_COPY as COPY } from "./copy";

type DayView = RouterOutputs["day"]["get"];
type DayItem = DayView["notAssigned"][number];

const CHIPS = [15, 30, 45, 60] as const;

/**
 * TR-01 — the day, made smaller.
 *
 * THE PREVIEW IS LOCAL AND INSTANT. `computeTrim` is pure and the day is
 * already in the cache, so typing a number re-sorts the list without a round
 * trip — which matters because this is a field a person nudges up and down
 * while deciding, not one they fill in once. The server runs the same function
 * over the real rows when Apply is pressed; `day.previewTrim` exists for the
 * future mobile client and is not called here.
 *
 * *KEEP INSTEAD* IS CLIENT STATE UNTIL APPLY. It is a person arguing with the
 * order, and the argument should be free: pull something back, watch the next
 * thing take its place, change your mind again. Nothing is written until the
 * footer.
 *
 * NO TOAST ON APPLY (§5.8). The List's *{n} not assigned today* expander IS the
 * confirmation — it is where the items went, it is permanent, and a toast
 * saying the same thing would be a second notification of a fact already
 * visible.
 */
export function TrimSheet({
  open,
  day,
  onOpenChange,
  onTrimmed,
}: {
  open: boolean;
  day: DayView;
  onOpenChange: (open: boolean) => void;
  onTrimmed?: () => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const apply = trpc.day.applyTrim.useMutation();

  const [capacity, setCapacity] = React.useState<number | null>(null);
  const [keep, setKeep] = React.useState<ReadonlySet<string>>(new Set());
  const [error, setError] = React.useState<string | null>(null);

  const allItems = React.useMemo(() => {
    const out: DayItem[] = [];
    for (const part of day.parts) out.push(...part.items);
    out.push(...day.notAssigned);
    return out;
  }, [day]);

  const trimItems: TrimItem[] = React.useMemo(
    () =>
      allItems.map((item) => ({
        id: item.id,
        priority: item.priority,
        durationMin: item.durationMin,
        scheduledStart: item.scheduledStart,
        scheduling: item.scheduling,
        assignmentState:
          item.state === "not-assigned" ? "not_assigned" : "assigned",
        spent: item.state === "done" || item.state === "active",
      })),
    [allItems],
  );

  const planned = React.useMemo(
    () => computeTrim(trimItems, CAPACITY_MAX, new Set()).plannedMin,
    [trimItems],
  );

  // The field opens at the plan's own size, so the first keystroke is a
  // reduction rather than a number typed from nothing.
  React.useEffect(() => {
    if (!open) {
      setKeep(new Set());
      setError(null);
      setCapacity(null);
      return;
    }
    setCapacity((current) => current ?? planned);
  }, [open, planned]);

  const value = capacity ?? planned;
  const atOrAbovePlan = value >= planned;

  const result = React.useMemo(
    () => computeTrim(trimItems, value, keep),
    [trimItems, value, keep],
  );

  const byId = React.useMemo(
    () => new Map(allItems.map((item) => [item.id, item])),
    [allItems],
  );

  const trimmedRows = result.trimmedIds
    .map((id) => byId.get(id))
    .filter((item): item is DayItem => item !== undefined);

  const plannedLine = plannedWindow(allItems, day.timezone);

  async function submit(): Promise<void> {
    setError(null);
    try {
      await apply.mutateAsync({
        date: day.dateKey,
        capacityMin: value,
        keep: [...keep],
      });
      await utils.day.get.invalidate({ date: day.dateKey });
      onOpenChange(false);
      onTrimmed?.();
    } catch {
      setError(COPY.applyError);
    }
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.title}
        size="tall"
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {COPY.cancel}
            </Button>
            <Button
              busy={apply.isPending}
              disabled={!online || atOrAbovePlan}
              onClick={() => void submit()}
            >
              {COPY.apply}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          {!online ? <StatusLine variant="offline" placement="inline" /> : null}

          <NumberUnitInput
            label={COPY.timeAvailable}
            unit={COPY.minutesUnit}
            value={value}
            min={CAPACITY_MIN}
            max={CAPACITY_MAX}
            onChange={(next) => setCapacity(next)}
          />

          <Text as="p" tone="secondary">
            {plannedLine === null
              ? COPY.plannedNoTimes(planned)
              : COPY.planned(planned, plannedLine)}
          </Text>

          <QuickChipRow
            label={COPY.chipsLabel}
            chips={CHIPS.map((minutes) => ({
              label: COPY.chip(minutes),
              delta: -minutes,
            }))}
            onApply={(delta) =>
              setCapacity(
                Math.max(CAPACITY_MIN, Math.min(CAPACITY_MAX, value + delta)),
              )
            }
          />

          {/*
            One live region for the whole result, so a screen reader hears the
            sentence change rather than hearing rows appear one at a time.
          */}
          <div aria-live="polite" className="flex flex-col gap-(--space-3)">
            {atOrAbovePlan ? (
              <Text as="p" tone="secondary">
                {COPY.wholePlan}
              </Text>
            ) : (
              <>
                <Text as="p" tone="secondary">
                  {result.overMin === 0
                    ? COPY.fitsIn(value)
                    : keep.size > 0
                      ? COPY.keptOver(result.overMin)
                      : COPY.nothingElseFlexible(result.overMin)}
                </Text>

                {result.comeBackIds.length === 0 ? null : (
                  <Text as="p" tone="secondary">
                    {COPY.comeBack(result.comeBackIds.length)}
                  </Text>
                )}

                {trimmedRows.length === 0 ? null : (
                  <>
                    <Text as="p" tone="secondary">
                      {COPY.notAssignedToday}
                    </Text>
                    <ul className="flex flex-col">
                      {trimmedRows.map((item) => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          variant="faded-with-action"
                          timeZone={day.timezone}
                          action={{
                            label: COPY.keepInstead,
                            onClick: () =>
                              setKeep((current) =>
                                new Set(current).add(item.id),
                              ),
                          }}
                        />
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>

          {error === null ? null : <HelperText error>{error}</HelperText>}
        </div>
      </ResponsiveSheet>
    </SheetHost>
  );
}

/** "7:00–9:20" over every scheduled item, in the day's own zone. */
function plannedWindow(items: readonly DayItem[], timeZone: string): string | null {
  const starts = items
    .map((item) => item.scheduledStart)
    .filter((start): start is Date => start !== null);
  const ends = items
    .map((item) => item.scheduledEnd ?? item.scheduledStart)
    .filter((end): end is Date => end !== null);

  if (starts.length === 0 || ends.length === 0) return null;

  const first = new Date(Math.min(...starts.map((date) => date.getTime())));
  const last = new Date(Math.max(...ends.map((date) => date.getTime())));

  return formatWindow(first, last, timeZone);
}
