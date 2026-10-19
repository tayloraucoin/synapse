"use client";

import * as React from "react";
import { clockFromMinutes, clockMinutes } from "@syn/utils";
import {
  REPEAT_SCOPE_COPY,
  RepeatScope,
  type RepeatScopeAnswer,
} from "@/components/planner/repeat-scope";
import { dayTitle } from "@/lib/data/set-up-view";
import type { DaysPlace } from "@/lib/data/use-days";
import type { usePlannerWrites } from "@/lib/data/use-planner-writes";
import type { SetUpDay } from "@/lib/data/use-set-up-day";
import { useUndoToast } from "@/lib/hooks/use-undo-toast";

/**
 * A repeating block moved on a dated day (USE-47): the drag asks This one,
 * This and following, or All before anything is written, and Cancel puts
 * the block back. This one is the date's change, as before the question;
 * This and following and All say what changed, with Undo.
 */

interface Asking {
  blockId: string;
  name: string;
  startsAt: string;
  endsAt: string;
}

/** "08:30" → "8:30". */
function clock(value: string): string {
  const [hour = "0", minute = "00"] = value.split(":");
  return `${Number(hour)}:${minute}`;
}

export function useRepeatMove({
  place,
  day,
  writes,
  ready,
  staged,
  onMoved,
}: {
  place: DaysPlace & { day: number };
  day: SetUpDay;
  writes: ReturnType<typeof usePlannerWrites>;
  ready: boolean;
  /** The question open on load (`?state=repeat-scope`): this block to this time. */
  staged?: { block: string; startsAt: string };
  /** The block just moved, for its ink edge. */
  onMoved: (blockId: string) => void;
}) {
  const [asking, setAsking] = React.useState<Asking | null>(null);
  const undoToast = useUndoToast();
  const date = place.date;

  const ask = React.useCallback(
    (blockId: string, startsAt: string, endsAt: string) => {
      const name = day.blocks.find((b) => b.block.id === blockId)?.block.name;
      if (name === undefined) return;
      setAsking({ blockId, name, startsAt, endsAt });
    },
    [day.blocks],
  );

  const answer = (scope: RepeatScopeAnswer) => {
    if (asking === null || date === null) return;
    const { blockId, name, startsAt, endsAt } = asking;
    setAsking(null);
    onMoved(blockId);
    const words = dayTitle({ weekday: place.day, date });
    void writes
      .editRepeating({
        id: blockId,
        date,
        patch: { startsAt, endsAt },
        scope,
      })
      .then((write) => {
        if (scope === "this") return;
        undoToast({
          text:
            scope === "following"
              ? REPEAT_SCOPE_COPY.followingDone(name, words)
              : REPEAT_SCOPE_COPY.allDone(name),
          onUndo: () => void writes.undo(write.undo),
        });
      })
      .catch(() => {});
  };

  // The question open on load, once the column is read.
  const ran = React.useRef(false);
  React.useEffect(() => {
    if (ran.current || staged === undefined || !ready) return;
    const b = day.blocks.find((x) => x.block.id === staged.block);
    if (!b) return;
    ran.current = true;
    const length = clockMinutes(b.endsAt) - clockMinutes(b.startsAt);
    const endsAt = clockFromMinutes(clockMinutes(staged.startsAt) + length);
    ask(staged.block, staged.startsAt, endsAt);
  }, [staged, ready, day.blocks, ask]);

  const element =
    date === null ? null : (
      <RepeatScope
        open={asking !== null}
        onOpenChange={(open) => {
          if (!open) setAsking(null);
        }}
        title={
          asking === null
            ? ""
            : REPEAT_SCOPE_COPY.moveTitle(asking.name, clock(asking.startsAt))
        }
        name={asking?.name ?? ""}
        date={dayTitle({ weekday: place.day, date })}
        onAnswer={answer}
      />
    );

  return { ask, element };
}
