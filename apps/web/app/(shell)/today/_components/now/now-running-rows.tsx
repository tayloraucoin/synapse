"use client";

import { useWorkClock } from "@syn/hooks";
import { RunningRow } from "@/components/planner";
import {
  runningRowFigure,
  settledLine,
  useRunningWrites,
  type RunningRowView,
  type RunningView,
} from "@/lib/data/running";
import { useDataSource } from "@/lib/data/source";
import type { NowItemView } from "@/lib/data/use-now";
import { RUNNING_COPY as COPY } from "./running-copy";

/**
 * The rows under "Running" (USE-24): every row reads the screen's one tick
 * here, once (`useWorkClock`, shared with the card), so no row keeps a
 * clock of its own. Each figure is `clockAt` over its own slot clock, so a
 * lift or a Pause elsewhere never moves it.
 */
export function NowRunningRows({
  rows,
  running,
  dateKey,
  blockId,
  onLift,
  onDone,
}: {
  rows: RunningRowView[];
  running: RunningView;
  dateKey: string;
  blockId: string;
  onLift: (item: NowItemView) => void;
  /** Done on a row: the screen holds it settled a moment. */
  onDone: (item: NowItemView) => void;
}) {
  const source = useDataSource();
  const now = useWorkClock(source.now);
  const writes = useRunningWrites(dateKey, blockId);

  return rows.map(({ item, slotClock, settled }) => {
    const planMin = item.lengthMin ?? 0;
    const doneName = COPY.rowDoneName(item.title);
    if (settled) {
      const took = item.tookMin ?? 0;
      const line = settledLine(took, planMin);
      return (
        <RunningRow
          key={item.id}
          title={item.title}
          meta={COPY.rowDone(took, line.ofPlan)}
          band={line.band}
          ring={null}
          settled
          lift={null}
          hold={null}
          box={{ name: doneName, onPress: () => {} }}
        />
      );
    }
    const figure = runningRowFigure(slotClock, planMin, now, running.dayEnd);
    return (
      <RunningRow
        key={item.id}
        title={item.title}
        meta={
          figure.held ? COPY.rowPaused(figure.count) : COPY.row(figure.count)
        }
        band={figure.band}
        ring={figure.ring}
        held={figure.held}
        lift={{
          name: COPY.rowName(item.title, figure.count),
          onPress: () => onLift(item),
        }}
        hold={{
          name: figure.held
            ? COPY.resumeName(item.title)
            : COPY.pauseName(item.title),
          paused: figure.held,
          onPress: () =>
            void (figure.held ? writes.resume(item) : writes.pause(item)),
        }}
        box={{
          name: doneName,
          onPress: () => {
            void writes.done(item, slotClock, running.dayEnd);
            onDone(item);
          },
        }}
      />
    );
  });
}
