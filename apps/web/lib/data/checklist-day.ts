"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { weekdayForDayKey } from "@syn/utils";
import type { PlannerServer, PlannerWrite } from "@/lib/fixtures/planner";
import { deriveToday } from "./derive-today";
import { useDataSource } from "./source";
import type { TodayRecords } from "./today-records";
import { isAllDay } from "./use-now";
import { usePlannerWrites } from "./use-planner-writes";
import { todayQueryKey } from "./use-today";

/**
 * A loose day's checklist (USE-40; review-the-day/states/sunday-*.md,
 * D-USE-28, D-USE-34): Make a checklist writes one block of kind checklist
 * for the date only (`onDate`, never a repeat rule), named after its
 * weekday and spanning the whole date, so it is the All day strip. Return
 * adds a row as one of its items; Set a time gives the block a span, and it
 * moves onto the rail with its items kept. The usual week is never written.
 */

export type ChecklistServer = Pick<
  PlannerServer,
  "createBlock" | "writeBlockItem" | "editBlock"
>;

/** A checklist with no span holds the whole date (D-USE-28). */
export const ALL_DAY = { startsAt: "00:00", endsAt: "24:00" } as const;

/** The date's checklist with no span, if one is written. */
export function allDayChecklistOf(records: TodayRecords): string | null {
  const today = deriveToday(records);
  const entry = today.occurrences.blocks.find((occurrence) =>
    isAllDay(occurrence.block, occurrence.startsAt, occurrence.endsAt),
  );
  return entry?.block.id ?? null;
}

/**
 * Make a checklist: the date's own checklist block, or the one already
 * there, so a second tap never makes a second.
 */
export async function writeChecklist(
  server: ChecklistServer,
  records: TodayRecords,
): Promise<string> {
  const existing = allDayChecklistOf(records);
  if (existing !== null) return existing;
  const written = await server.createBlock({
    // [ASSUMPTION] Wellness carries a checklist, as Schedule's Sunday fixture.
    kind: "wellness",
    name: weekdayForDayKey(records.date),
    ...ALL_DAY,
    rrule: null,
    onDate: records.date,
    fill: "set_items",
    checklist: true,
  });
  return written.id!;
}

/** Return in the typed row: the row kept as the checklist's last item. */
export function addChecklistItem(
  server: Pick<ChecklistServer, "writeBlockItem">,
  records: TodayRecords,
  blockId: string,
  title: string,
): Promise<PlannerWrite> {
  const orders = records.blockItems
    .filter((item) => item.blockId === blockId)
    .map((item) => item.sortOrder);
  return server.writeBlockItem({
    blockId,
    title,
    sortOrder: orders.reduce((top, order) => Math.max(top, order), -1) + 1,
  });
}

/** Set a time: the dated block takes the span; its items stay. */
export function setBlockSpan(
  server: ChecklistServer,
  blockId: string,
  startsAt: string,
  endsAt: string,
): Promise<PlannerWrite> {
  return server.editBlock({ id: blockId, startsAt, endsAt });
}

/**
 * The three writes on today's records, each reading the day again after.
 * A row is optimistic: it shows the moment Return is pressed, through the
 * planner's one write, its order from the day already read (no read before
 * the write); a failure takes it back out and the editor says so.
 */
export function useChecklistDay(dateKey: string) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const planner = usePlannerWrites();
  const key = todayQueryKey(source.scenario.name, dateKey);
  const settle = () => queryClient.invalidateQueries({ queryKey: key });
  const read = () => source.server.readToday(dateKey);
  /** The day as already read, else read now. */
  const records = async () =>
    queryClient.getQueryData<TodayRecords>(key) ?? (await read());

  const make = useMutation({
    mutationFn: async () => writeChecklist(source.server, await read()),
    onSettled: settle,
  });
  const add = useMutation({
    mutationFn: async (input: { blockId: string; title: string }) =>
      addChecklistItem(
        { writeBlockItem: planner.writeBlockItem },
        await records(),
        input.blockId,
        input.title,
      ),
  });
  const span = useMutation({
    mutationFn: (input: {
      blockId: string;
      startsAt: string;
      endsAt: string;
    }) =>
      setBlockSpan(source.server, input.blockId, input.startsAt, input.endsAt),
    onSettled: settle,
  });
  return { make, add, span };
}
