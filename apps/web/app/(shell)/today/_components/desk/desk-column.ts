import { clockMinutes } from "@syn/utils";
import { BLOCK_HUE } from "@/components/planner/block-hue";
import type { DayBarSegment } from "@/components/planner/day-bar";
import type { DeskDayColumnProps } from "@/components/work";
import type {
  ScheduleEvent,
  ScheduleNow,
  ScheduleView,
} from "@/lib/data/use-schedule";
import { clockOf, clockWords, DESK_COPY as COPY } from "./copy";

/**
 * The desk's day column from Schedule's view of the date (USE-58): the
 * hours 8:00 to 18:00 as drawn ("whole day, then 8:00 to 18:00"), the bar
 * from Up at to Lights out with the date's Fits line under it ("Work ends
 * 17:00", USE-72's `fitsLine`) [ASSUMPTION: one rule for the Week's Fits and
 * this line], and the now line only on today. Pure, so a test reads what the
 * column draws.
 */

export const DESK_HOURS = { startMin: 8 * 60, endMin: 18 * 60 };

export interface DeskColumnInput {
  schedule: ScheduleView;
  /** The date's Up at and Lights out, "HH:MM"; null when not set. */
  bounds: { upAt: string; lightsOut: string } | null;
  /** "Work ends 17:00", "Nothing slotted yet", "No work blocks". */
  fits: string;
  /** Today's minute; null on any other date. */
  now: ScheduleNow | null;
}

const toEvent = (event: ScheduleEvent) => ({
  id: event.id,
  title: event.title,
  startsAt: event.startsAt,
  endsAt: event.endsAt,
});

export function deskColumn(
  input: DeskColumnInput,
): Omit<DeskDayColumnProps, "timeZone" | "className"> {
  const { schedule, bounds, fits, now } = input;
  const upAt = bounds?.upAt ?? "07:00";
  const lightsOut = bounds?.lightsOut ?? "22:30";
  const isToday = now !== null;

  const blocks = schedule.blocks.map((block) => ({
    id: block.id,
    label:
      block.kind === "work"
        ? COPY.workBlock(block.name, block.startsAt, block.endsAt)
        : block.name,
    startsAt: block.startsAt,
    endsAt: block.endsAt,
    hue: BLOCK_HUE[block.kind],
    past: isToday && block.state === "done",
    bands: block.bands.map(toEvent),
  }));

  const events = [
    ...schedule.blocks.flatMap((block) => block.bands),
    ...schedule.events,
  ];
  const segments: DayBarSegment[] = [
    ...schedule.blocks.map((block) => ({
      id: block.id,
      label: block.name,
      initial: block.name.slice(0, 1),
      kindColor: BLOCK_HUE[block.kind],
      startMin: clockMinutes(block.startsAt),
      endMin: clockMinutes(block.endsAt),
      faded: isToday && block.state === "done",
    })),
    // Events after blocks, so the plum sits over the block it falls in.
    ...events.map((event) => ({
      id: event.id,
      label: event.title,
      initial: event.title.replace(/^\[/, "").slice(0, 1),
      kindColor: "plum" as const,
      startMin: clockMinutes(event.startsAt),
      endMin: clockMinutes(event.endsAt),
      faded: false,
    })),
  ];

  return {
    words: {
      title: COPY.theDay,
      range: COPY.range(DESK_HOURS.startMin, DESK_HOURS.endMin),
      ticks: {
        start: clockWords(upAt),
        middle: fits,
        end: COPY.lightsOut(lightsOut),
      },
      event: (event) => COPY.event(event.startsAt, event.title),
      hour: clockOf,
    },
    bar: {
      from: clockMinutes(upAt),
      to: clockMinutes(lightsOut),
      segments,
    },
    hours: DESK_HOURS,
    blocks,
    events: schedule.events.map(toEvent),
    now: now === null ? null : { atMin: now.atMin, label: now.label },
  };
}
