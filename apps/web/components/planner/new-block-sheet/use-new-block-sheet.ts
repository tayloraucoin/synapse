"use client";

import { firstFreeTime, weekDates } from "@syn/utils";
import {
  newBlockWrite,
  type DayBlock,
  type NewBlockDay,
  type NewBlockForm,
  type NewBlockKind,
  type NewBlockMode,
} from "./form";
import { useDataSource } from "@/lib/data/source";
import { useSetUpDay, type SetUpDay } from "@/lib/data/use-set-up-day";
import { usePlannerWrites } from "@/lib/data/use-planner-writes";
import { thisWeekDates, type WeekRef } from "@/lib/data/week-records";

/**
 * The New block sheet's data (USE-46): the day it opens on, read through
 * `useSetUpDay`, as the form weighs it, and the one add, through
 * `usePlannerWrites`' `createBlock` or `createTransition` with the form's
 * `newBlockWrite`. A transition inside a block then takes its place in the
 * block's order through `reorderItems`.
 *
 * OFFLINE (D-USE-82): Set my days does not open the sheet; a connection
 * lost while it is open refuses the add, and the sheet shows its error line
 * with everything kept until back.
 */

/** Where the sheet opens: the opener's day and time (Set my days, the + menu). */
export interface NewBlockSheetStart {
  week: WeekRef;
  /** Monday 0 … Sunday 6. */
  day: number;
  mode: NewBlockMode;
  /** A tapped time; absent, the first free time (the +). */
  at?: string;
  end?: string;
  kind?: NewBlockKind;
}

/** [ASSUMPTION] A day with no Up at reads 7:00 for the +'s first free time. */
const NO_UP_AT = "07:00";

export function toNewBlockDay(
  day: SetUpDay,
  ruleDate: string,
): NewBlockDay {
  return {
    scope: { weekday: day.weekday, date: day.date, ruleDate },
    upAt: day.bounds?.upAt ?? null,
    blocks: day.blocks.map(
      (b): DayBlock => ({
        id: b.block.id,
        name: b.block.name,
        kind: b.block.kind,
        startsAt: b.startsAt,
        endsAt: b.endsAt,
        checklist: b.block.checklist,
        items: b.items.map((item) => ({
          id: item.id,
          title: item.title,
          atTime: item.atTime,
          lengthMin: item.lengthMin,
        })),
      }),
    ),
  };
}

/** The opener's start time, or the first free one. */
export function startTime(start: NewBlockSheetStart, day: NewBlockDay): string {
  if (start.at) return start.at;
  return firstFreeTime({
    upAt: day.upAt ?? NO_UP_AT,
    blocks: day.blocks.filter((block) => !block.checklist),
  });
}

/** A failed add: refused in the schema's words, or not sent. */
export class NewBlockNotAdded extends Error {
  constructor(message = "Not added.") {
    super(message);
    this.name = "NewBlockNotAdded";
  }
}

export function useNewBlockSheet(start: NewBlockSheetStart | null) {
  const source = useDataSource();
  const writes = usePlannerWrites();
  const { timeZone } = source.scenario.records;
  const query = useSetUpDay({
    week: start?.week ?? "usual",
    day: start?.day ?? 0,
  });

  const setUp = query.day ?? null;
  const ruleDate =
    start === null
      ? null
      : start.week === "usual"
        ? thisWeekDates(source.now(), timeZone)[start.day]
        : weekDates(start.week)[start.day];
  const day =
    setUp === null || ruleDate === undefined || ruleDate === null
      ? null
      : toNewBlockDay(setUp, ruleDate);

  /** Sends the add; resolves to the new row's id. */
  async function add(form: NewBlockForm): Promise<string> {
    if (day === null) throw new NewBlockNotAdded();
    if (!writes.online) throw new NewBlockNotAdded();
    const write = newBlockWrite(form, day);
    const scope =
      day.scope.date === null ? { weekday: day.scope.weekday } : undefined;
    if (write.method === "createBlock") {
      const made = await writes.createBlock(write.input, scope);
      return made.id ?? "";
    }
    const made = await writes.createTransition(write.input, scope);
    const id = made.id ?? "";
    if (write.order && id) {
      await writes.reorderItems(
        {
          blockId: write.order.blockId,
          ids: write.order.ids.map((each) => each ?? id),
        },
        scope,
      );
    }
    return id;
  }

  return {
    day,
    loading: query.isPending,
    online: writes.online,
    add,
  };
}
