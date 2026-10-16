"use client";

import * as React from "react";
import { parseAsString, useQueryState } from "nuqs";
import { Button, CopyFromIcon, Text } from "@syn/ui";
import { firstFreeTime } from "@syn/utils";
import { CopyPicker, DayStrip, type CopyPickerRow } from "@/components/planner";
import {
  openingCopyStep,
  type SetUpScenarioStart,
} from "@/lib/data/set-up-start";
import {
  copyHelper,
  copySources,
  copyWords,
  dayTitle,
  isAllDay,
  lastBuiltBefore,
  pickerLine,
  savedBlockDone,
  savedBlockLine,
  weekdayName,
} from "@/lib/data/set-up-view";
import type { DaysPlace } from "@/lib/data/use-days";
import type { usePlannerWrites } from "@/lib/data/use-planner-writes";
import type { SetUpDay } from "@/lib/data/use-set-up-day";
import { useWeek } from "@/lib/data/use-week";
import type { DayRef } from "@/lib/data/week-records";
import { useUndoToast } from "@/lib/hooks/use-undo-toast";
import { DAYS_COPY_PARAM } from "@/lib/routes";
import { DAYS_COPY as COPY } from "./copy";
import { DayAsk } from "./day-parts";

/**
 * Copy from (USE-45; interactions/copy-from): one day takes another built
 * day's blocks through `copyDay`, which decides what copies. An empty day
 * copies at once; a day with blocks asks Replace once, naming what goes;
 * either way the Toaster offers Undo, which puts the day back exactly
 * (D-USE-32). Copy from… and Other day… open the picker of built days, the
 * day being set left out; From a saved block (D-USE-87) opens the same
 * picker with other days' blocks, and the picked one lands with its items
 * at the first free time. Offline none of it takes a tap (D-USE-82).
 */

type Writes = ReturnType<typeof usePlannerWrites>;
type Picker = "days" | "blocks" | null;

function refOf(day: Pick<SetUpDay, "weekday" | "date">): DayRef {
  return day.date === null ? { weekday: day.weekday } : { date: day.date };
}

/**
 * The strip as the picker draws it: one bar per block, by its length,
 * filling the row (the shares are summed again without open time).
 */
function blockParts(day: SetUpDay) {
  const parts = day.strip.filter(
    (part) => part.part !== "orient" && part.part !== "open",
  );
  const total = parts.reduce((sum, part) => sum + part.share, 0);
  return total === 0
    ? parts
    : parts.map((part) => ({ ...part, share: part.share / total }));
}

export function useCopyFrom({
  place,
  day,
  writes,
  start,
  ready,
}: {
  place: DaysPlace & { day: number };
  day: SetUpDay;
  writes: Writes;
  /** The scenario's start, when this day is the one it opens on. */
  start: SetUpScenarioStart | undefined;
  ready: boolean;
}) {
  const { week } = useWeek(place.week);
  const days = React.useMemo(() => week?.days ?? [], [week]);
  const sources = copySources(days, place.day);
  const offeredDay = lastBuiltBefore(days, place.day);
  const [picker, setPicker] = React.useState<Picker>(null);
  const [asking, setAsking] = React.useState<SetUpDay | null>(null);
  const undoToast = useUndoToast();
  const menuRef = React.useRef<HTMLButtonElement>(null);
  const plusRef = React.useRef<HTMLButtonElement>(null);
  const hold = start?.holdToast === true;
  const offline = !writes.online;

  const copy = React.useCallback(
    (from: SetUpDay) => {
      // The words are the day's as it stood, before the copy lands.
      const { done } = copyWords({ to: day, from });
      void writes
        .copyDay({ from: refOf(from), to: refOf(day) })
        .then((write) =>
          undoToast({
            text: done,
            undoOf: COPY.undoCopy,
            onUndo: () => void writes.undo(write.undo),
            ...(hold ? { durationMs: Infinity } : {}),
          }),
        )
        .catch(() => {});
    },
    [day, writes, undoToast, hold],
  );

  /** Empty copies at once; a day with blocks asks first (C-USE-copy-from-1, -2). */
  const pick = React.useCallback(
    (from: SetUpDay) => {
      setPicker(null);
      if (day.blocks.length > 0) setAsking(from);
      else copy(from);
    },
    [day.blocks.length, copy],
  );

  // Other days' blocks, each once, none already on this day (D-USE-87).
  const here = new Set(day.blocks.map((b) => b.block.id));
  const seen = new Set<string>();
  const saved = days.flatMap((other) =>
    other.weekday === place.day
      ? []
      : other.blocks
          .filter((b) => !isAllDay(b) && !here.has(b.block.id))
          .filter((b) => {
            if (seen.has(b.block.id)) return false;
            seen.add(b.block.id);
            return true;
          })
          .map((b) => ({ other, b })),
  );

  const placeSaved = (key: string) => {
    setPicker(null);
    const found = saved.find(
      ({ other, b }) => `${other.weekday}|${b.block.id}` === key,
    );
    if (!found || day.bounds === null) return;
    const startsAt = firstFreeTime({
      upAt: day.bounds.upAt,
      blocks: day.blocks.filter((b) => !isAllDay(b)),
    });
    void writes
      .copyBlock({
        blockId: found.b.block.id,
        from: refOf(found.other),
        to: refOf(day),
        startsAt,
      })
      .then((write) =>
        undoToast({
          text: savedBlockDone(found.b.block.name, startsAt),
          undoOf: found.b.block.name,
          onUndo: () => void writes.undo(write.undo),
          ...(hold ? { durationMs: Infinity } : {}),
        }),
      )
      .catch(() => {});
  };

  // A frame's step open on load (`?state=`), or the picker Review the
  // day's Copy another day asks for (`&copy=picker`, USE-110), once the
  // week has read. The param goes once used, so Back does not reopen it.
  const [copyParam, setCopyParam] = useQueryState(
    DAYS_COPY_PARAM,
    parseAsString,
  );
  const step = openingCopyStep(start, copyParam);
  const staged = React.useRef(false);
  React.useEffect(() => {
    if (staged.current || !ready || days.length === 0 || !step) return;
    staged.current = true;
    const from = days[start?.copyFrom ?? 0];
    if (step === "picker") setPicker("days");
    else if (step === "saved") setPicker("blocks");
    else if (step === "replace" && from) setAsking(from);
    else if (step === "copied" && from) copy(from);
    if (copyParam !== null) void setCopyParam(null);
  }, [ready, days, start, step, copy, copyParam, setCopyParam]);

  const dayRows: CopyPickerRow[] = sources.map((other) => ({
    key: String(other.weekday),
    name: weekdayName(other.weekday),
    strip: (
      <DayStrip
        parts={blockParts(other)}
        dashed={other.blocks.every(isAllDay)}
      />
    ),
    line: pickerLine(other),
  }));
  const blockRows: CopyPickerRow[] = saved.map(({ other, b }) => ({
    key: `${other.weekday}|${b.block.id}`,
    name: b.block.name,
    strip: <DayStrip parts={[{ part: b.block.kind, share: 1 }]} />,
    line: savedBlockLine(b, other.weekday),
  }));

  const asked = asking === null ? null : copyWords({ to: day, from: asking });
  const element = (
    <>
      <CopyPicker
        open={picker !== null}
        title={picker === "blocks" ? COPY.fromSaved : COPY.copyTitle}
        helper={
          picker === "blocks"
            ? COPY.savedHelper(dayTitle(day).replace("Every ", ""))
            : copyHelper(day)
        }
        rows={picker === "blocks" ? blockRows : dayRows}
        onPick={(key) => {
          if (picker === "blocks") placeSaved(key);
          else {
            const from = days[Number(key)];
            if (from) pick(from);
          }
        }}
        onClose={() => setPicker(null)}
        returnFocusRef={picker === "blocks" ? plusRef : menuRef}
      />
      <DayAsk
        open={asking !== null}
        words={asked ?? { title: "", body: "" }}
        action={COPY.replace}
        onOpenChange={(open) => {
          if (!open) setAsking(null);
        }}
        onConfirm={() => {
          const from = asking;
          setAsking(null);
          if (from) copy(from);
        }}
      />
    </>
  );

  return {
    /** The day "Copy from <day>" names, or null when none is built. */
    offered: offeredDay === null ? null : (days[offeredDay] ?? null),
    canCopy: sources.length > 0 && !offline,
    hasSaved: saved.length > 0,
    openPicker: () => setPicker("days"),
    openSaved: () => setPicker("blocks"),
    copyOffered: () => {
      const from = offeredDay === null ? undefined : days[offeredDay];
      if (from) pick(from);
    },
    menuRef,
    plusRef,
    element,
  };
}

/**
 * Under Orient on an empty day, left-aligned, never centred (D-USE-30): just
 * after the bounds are set, the offer alone (copy-offer.md); else the dashed
 * card (empty-day.md).
 */
export function EmptyDayOffer({
  dayName,
  offered,
  justSet,
  disabled,
  onCopy,
  onOther,
}: {
  dayName: string;
  /** "Monday": the day Copy from names. */
  offered: string;
  justSet: boolean;
  disabled: boolean;
  onCopy: () => void;
  onOther: () => void;
}) {
  const copyButton = (
    <Button variant="secondary" disabled={disabled} onClick={onCopy}>
      <CopyFromIcon aria-hidden="true" className="size-4" />
      {COPY.copyFromDay(offered)}
    </Button>
  );
  if (justSet) {
    return (
      <div className="flex flex-col items-start gap-(--space-3)">
        {copyButton}
        <Text as="p" variant="secondary" tone="muted">
          {COPY.orTapATime}
        </Text>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-(--space-3) rounded-(--radius-control) border border-dashed border-border bg-background p-(--space-4)">
      <div className="flex flex-col gap-(--space-1)">
        <Text as="h2" variant="body" weight={600}>
          {COPY.emptyHeading(dayName)}
        </Text>
        <Text as="p" variant="secondary" tone="muted">
          {COPY.emptyBody}
        </Text>
      </div>
      <div className="flex flex-wrap items-center gap-(--space-2)">
        {copyButton}
        <Button
          variant="ghost"
          disabled={disabled}
          onClick={onOther}
          className="px-(--space-2)"
        >
          {COPY.otherDay}
        </Button>
      </div>
      <Text as="p" variant="secondary" tone="muted">
        {COPY.orTapOrPlus}
      </Text>
    </div>
  );
}
