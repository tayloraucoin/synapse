"use client";

import type * as React from "react";
import { useWorkClock } from "@syn/hooks";
import type { SlotClock } from "@syn/utils";
import {
  BLOCK_HUE,
  LiftedCard,
  RunningCard,
  type BlockHue,
} from "@/components/planner";
import {
  isRunningCard,
  startedAt,
  useRunningWrites,
  wallClock,
  type RunningView,
} from "@/lib/data/running";
import { useDataSource } from "@/lib/data/source";
import type { NowBlockView, NowItemView } from "@/lib/data/use-now";
import { NOW_COPY as COPY } from "./copy";
import { RUNNING_COPY } from "./running-copy";

/**
 * Now's current item (USE-16, USE-23): the lifted card, or once Start is
 * pressed the running card in its place. Done on a running card is a timed
 * Done (the work time, no Change); on the lifted card it is the plain Done.
 */
export function NowCurrentCard({
  item,
  block,
  dateKey,
  running,
  onPlainDone,
  onTimedDone,
  below = null,
  onOpenJournal,
}: {
  item: NowItemView;
  block: NowBlockView;
  dateKey: string;
  running: RunningView | null;
  onPlainDone: (item: NowItemView) => void;
  onTimedDone: (item: NowItemView) => void;
  /** Under the card: a Done that did not save (USE-21) [ASSUMPTION]. */
  below?: React.ReactNode;
  /**
   * The Journal row lifted (USE-110): Start opens Close the day, where the
   * row ticks itself, rather than a timer [ASSUMPTION].
   */
  onOpenJournal?: () => void;
}) {
  const writes = useRunningWrites(dateKey, block.id);
  const hue = BLOCK_HUE[block.kind];
  // A meal (USE-17): a neutral tile, Done alone and full width, no Start.
  const meal = block.form === "meal";
  const slotClock = running?.clocks.get(item.id);

  if (running && slotClock && isRunningCard(slotClock) && item.lengthMin) {
    return (
      <TickingCard
        item={item}
        hue={hue}
        planMin={item.lengthMin}
        slotClock={slotClock}
        running={running}
        onPause={() => void writes.pause(item)}
        onResume={() => void writes.resume(item)}
        onDone={() => {
          void writes.done(item, slotClock, running.dayEnd);
          onTimedDone(item);
        }}
      />
    );
  }

  // A to-do's meta ends with where it came from (D-USE-74).
  const meta = [
    COPY.meta(item.lengthMin, running?.liftedAt ?? item.plannedAt),
    item.madeOn === null ? null : COPY.todoSince(item.madeOn, dateKey),
  ]
    .filter((part) => part !== null && part !== "")
    .join(" · ");

  const card = (
    <LiftedCard
      title={item.title}
      icon={item.icon}
      hue={meal ? "neutral" : hue}
      meta={meta}
      early={block.notYetStarted}
      label={COPY.liftedName(item.title)}
      // An item with no length has nothing to count down from.
      start={
        meal
          ? null
          : {
              label: COPY.start,
              onPress: () => {
                if (onOpenJournal) onOpenJournal();
                else if (item.lengthMin) void writes.start(item);
              },
            }
      }
      done={{
        label: COPY.done,
        name: COPY.doneName(item.title),
        onPress: () => onPlainDone(item),
      }}
    />
  );
  if (below === null) return card;
  return (
    <div className="flex flex-col gap-(--space-2)">
      {card}
      <div className="ps-(--space-4)">{below}</div>
    </div>
  );
}

/** The one place on Now that reads the tick, so nothing else re-renders. */
function TickingCard({
  item,
  hue,
  planMin,
  slotClock,
  running,
  onPause,
  onResume,
  onDone,
}: {
  item: NowItemView;
  hue: BlockHue;
  planMin: number;
  slotClock: SlotClock;
  running: RunningView;
  onPause: () => void;
  onResume: () => void;
  onDone: () => void;
}) {
  const source = useDataSource();
  const now = useWorkClock(source.now);
  const started = startedAt(slotClock);
  const at = started ? wallClock(started, running.timeZone) : null;
  const meta =
    at === null
      ? ""
      : slotClock.state === "paused"
        ? RUNNING_COPY.paused(at)
        : RUNNING_COPY.started(at);
  return (
    <RunningCard
      title={item.title}
      icon={item.icon}
      hue={hue}
      meta={meta}
      label={RUNNING_COPY.runningName(item.title)}
      planMin={planMin}
      ofPlan={RUNNING_COPY.ofPlan(planMin)}
      slotClock={slotClock}
      now={now}
      dayEnd={running.dayEnd}
      pause={{ label: RUNNING_COPY.pause, onPress: onPause }}
      resume={{ label: RUNNING_COPY.resume, onPress: onResume }}
      done={{
        label: COPY.done,
        name: COPY.doneName(item.title),
        onPress: onDone,
      }}
    />
  );
}
