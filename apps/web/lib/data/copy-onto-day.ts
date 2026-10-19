import type { PlannerServer, PlannerWrite } from "@/lib/fixtures/planner";
import type { SetUpDay } from "./use-set-up-day";
import type { DayRef } from "./week-records";

/**
 * Copy from onto a day (USE-140; unset-day-copy.md). A day with no times
 * yet takes the source's Up at and Lights out first, then its blocks
 * through `copyDay`; the one Undo takes both back, so the day is unset
 * again. When the blocks fail to land, the times go back with them.
 */

type Writes = Pick<PlannerServer, "writeBounds" | "copyDay"> & {
  undo: (token: PlannerWrite["undo"]) => Promise<unknown>;
};

type Day = Pick<SetUpDay, "weekday" | "date" | "bounds">;

function dayRefOf(day: Day): DayRef {
  return day.date === null ? { weekday: day.weekday } : { date: day.date };
}

function boundsRefOf(day: Day): { weekday: number } | { onDate: string } {
  return day.date === null ? { weekday: day.weekday } : { onDate: day.date };
}

export async function copyOntoDay(
  writes: Writes,
  { from, to }: { from: Day; to: Day },
): Promise<{ undo: () => Promise<void> }> {
  const bounds =
    to.bounds === null && from.bounds !== null
      ? await writes.writeBounds({ ...boundsRefOf(to), ...from.bounds })
      : null;
  let copied: PlannerWrite;
  try {
    copied = await writes.copyDay({ from: dayRefOf(from), to: dayRefOf(to) });
  } catch (error) {
    if (bounds !== null) await writes.undo(bounds.undo);
    throw error;
  }
  return {
    undo: async () => {
      await writes.undo(copied.undo);
      if (bounds !== null) await writes.undo(bounds.undo);
    },
  };
}
