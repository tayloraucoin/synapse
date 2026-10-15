import { weekdayIndex } from "@syn/utils";
import type { StripDayView, StripLine } from "@/components/work";
import {
  NOTHING_SLOTTED,
  type WeekDayView,
  type WeekView,
} from "@/lib/data/week-view";
import { DESK_COPY as COPY } from "./copy";

/**
 * The week strip's cards from the Week's view (USE-58): each date's lines
 * come from its own records, never its weekday's name. The first work item
 * (Urgent to Stretch, then tier order) and the first event; with only one
 * kind, its first two. With no line: "Nothing slotted yet" for a Work block
 * holding nothing, else the date's all-day list by name ("Sunday reset"),
 * else "No work" [ASSUMPTION: the drawn cards, read as a rule; Saturday's
 * Errands block reads "No work", as drawn]. A work line's title is its name before any colon ("[Case
 * studies]") [ASSUMPTION]; "2/3" is a session's place, never a count.
 */

const TIERS = ["urgent", "primary", "secondary", "stretch"] as const;

/** "[Case studies: write the Alder intro]" reads "[Case studies]" on a card. */
export function shortTitle(title: string): string {
  const at = title.indexOf(":");
  if (at <= 0) return title;
  const head = title.slice(0, at).trim();
  return title.startsWith("[") && !head.endsWith("]") ? `${head}]` : head;
}

function workLines(day: WeekDayView): StripLine[] {
  return TIERS.flatMap((tier) =>
    day.cells[tier].map((chip): StripLine => ({
      kind: "work",
      id: chip.id,
      tier,
      title: shortTitle(chip.title),
      session: chip.session
        ? COPY.place(chip.session.n, chip.session.of)
        : null,
    })),
  );
}

function eventLines(day: WeekDayView): StripLine[] {
  return day.events.map((event) => ({
    kind: "event",
    id: event.id,
    time: event.time,
    title: event.title,
  }));
}

export function stripLines(day: WeekDayView): StripLine[] {
  const work = workLines(day);
  const events = eventLines(day);
  const first = [work[0], events[0]].filter(
    (line): line is StripLine => line !== undefined,
  );
  if (first.length === 2) return first;
  return [...work, ...events].slice(0, 2);
}

export function stripEmpty(day: WeekDayView): string {
  if (day.hasWork) return NOTHING_SLOTTED;
  if (day.checklistName !== null) return day.checklistName;
  return COPY.noWork;
}

export function stripDays(view: WeekView): StripDayView[] {
  return view.days.map((day) => {
    const lines = stripLines(day);
    return {
      dateKey: day.dateKey,
      head: day.head,
      name: COPY.dayName(weekdayIndex(day.dateKey), day.dateKey),
      isToday: day.isToday,
      past: day.past,
      lines,
      empty: lines.length === 0 ? stripEmpty(day) : null,
    };
  });
}
