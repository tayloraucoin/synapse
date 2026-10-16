import { clockMinutes } from "@syn/utils";
import type { DayEventRecord } from "@syn/validators";
import {
  ADD_EVENT_COPY,
  layBlock,
  toEventDay,
} from "@/components/planner/add-event";
import { clockLabel, spanLabel } from "@/components/planner/day-column/copy";
import type {
  DayColumnEvent,
  DayColumnItem,
  DayColumnOffer,
  DayColumnSegment,
} from "@/components/planner/day-column/day-column";
import type { GoogleBands, GoogleDayEvent } from "@/lib/data/google-bands";
import type { SetUpColumnBlock } from "@/lib/data/set-up-view";
import type { SetUpDay } from "@/lib/data/use-set-up-day";
import { DAYS_COPY } from "./copy";

/**
 * A dated day's events in its column (USE-53; event-inside-work.md,
 * event-own-block.md). The time decides: an event starting inside a block
 * is a plum band in it, pinned at its time, and the block's items lie
 * around it, an item that would cross it moved to its end whole and named
 * there with its new start ("[Review the Paper handoff] · 11:30"); when
 * they no longer fit, Stretch, then Secondary, drop out of the grid. An
 * event in no block stands as its own small block at its true height.
 * Every one opens to edit on a tap (D-USE-42).
 *
 * Google's (USE-109; google-events.md): a yes is a band as a day event is,
 * busy time the work re-flows past, "Google" at its end and no tap (its
 * times are read-only); a maybe is a dashed offer at the head of the
 * segment its time falls in, taking no time. A day event that is an added
 * maybe is drawn as its Google band, not twice.
 */

/** What the column draws for the day's Google events; none by default. */
export interface GoogleOnDay {
  bands: GoogleBands;
  addToDay: (event: GoogleDayEvent) => void;
}

const NO_GOOGLE: GoogleOnDay = {
  bands: { bands: [], dashed: [], covered: [] },
  addToDay: () => {},
};

type Timed = Pick<DayEventRecord, "startsAt" | "endsAt">;

/** One band in a block, a Synapse event's or Google's, by start. */
interface Band extends Timed {
  draw: DayColumnEvent;
}

const TAG = { work: "Work", personal: "Personal" } as const;

function startsIn(
  event: Pick<Timed, "startsAt">,
  block: SetUpColumnBlock,
): boolean {
  const at = clockMinutes(event.startsAt);
  return clockMinutes(block.startsAt) <= at && at < clockMinutes(block.endsAt);
}

function bandOf(
  event: DayEventRecord,
  open: (event: DayEventRecord) => void,
): DayColumnEvent {
  return {
    id: event.id,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    // D-USE-31: events are plum, told by the calendar icon and their words.
    hue: "plum",
    meta: spanLabel(event.startsAt, event.endsAt),
    event: {
      tag: TAG[event.tag],
      name: ADD_EVENT_COPY.eventName(event.title, event.startsAt, event.endsAt),
      onOpen: () => open(event),
    },
  };
}

function googleBandOf(event: GoogleDayEvent): DayColumnEvent {
  const span = spanLabel(event.startsAt, event.endsAt);
  return {
    id: event.id,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    hue: "plum",
    meta: span,
    event: {
      tag: DAYS_COPY.google,
      name: DAYS_COPY.googleName(event.title, span),
    },
  };
}

function offerOf(
  event: GoogleDayEvent,
  addToDay: GoogleOnDay["addToDay"],
): DayColumnOffer {
  return {
    id: event.id,
    startsAt: event.startsAt,
    title: event.title,
    meta: DAYS_COPY.maybeMeta(clockLabel(event.startsAt)),
    actionLabel: DAYS_COPY.addToDay,
    onAdd: () => addToDay(event),
  };
}

/** The day's bands, Synapse's (less an added maybe's) and Google's, by start. */
function bandsOf(
  day: SetUpDay,
  open: (event: DayEventRecord) => void,
  google: GoogleOnDay,
): Band[] {
  const covered = new Set(google.bands.covered);
  return [
    ...day.events
      .filter((event) => !covered.has(event.id))
      .map((event) => ({ ...event, draw: bandOf(event, open) })),
    ...google.bands.bands.map((event) => ({
      ...event,
      draw: googleBandOf(event),
    })),
  ].sort(
    (a, b) =>
      a.startsAt.localeCompare(b.startsAt) ||
      a.draw.id.localeCompare(b.draw.id),
  );
}

/** The column's blocks with their bands and the items laid around them. */
export function withEventBands(
  blocks: readonly SetUpColumnBlock[],
  day: SetUpDay,
  open: (event: DayEventRecord) => void,
  google: GoogleOnDay = NO_GOOGLE,
): SetUpColumnBlock[] {
  const eventDay = toEventDay(day);
  if (eventDay === null) return [...blocks];
  const all = bandsOf(day, open, google);
  return blocks.map((block) => {
    const events = all.filter((event) => startsIn(event, block));
    const offers = google.bands.dashed
      .filter((event) => startsIn(event, block))
      .map((event) => offerOf(event, google.addToDay));
    const weighed = eventDay.blocks.find((b) => b.id === block.id);
    if (events.length === 0 || weighed === undefined) {
      return offers.length === 0 ? block : { ...block, offers };
    }
    const lay = layBlock(weighed, events);
    // Each item goes to the segment its start falls in: before the first
    // band, between two, or after the last.
    const segmentOf = (id: string): number | null => {
      const at = lay.placed.get(id);
      if (at === undefined) return null;
      const start = clockMinutes(at);
      return events.filter((event) => clockMinutes(event.startsAt) <= start)
        .length;
    };
    const timed = (item: DayColumnItem, index: number): DayColumnItem => {
      const at = lay.placed.get(item.id);
      return index === 0 || at === undefined
        ? item
        : { ...item, label: `${item.label} · ${clockLabel(at)}` };
    };
    const segments: DayColumnSegment[] = Array.from(
      { length: events.length + 1 },
      (_, index) => ({
        items: block.items
          .filter((item) => segmentOf(item.id) === index)
          .map((item) => timed(item, index)),
        tiers: block.tiers.flatMap((tier) => {
          const items = tier.items
            .filter((item) => segmentOf(item.id) === index)
            .map((item) => timed(item, index));
          return items.length > 0 ? [{ tier: tier.tier, items }] : [];
        }),
      }),
    );
    return {
      ...block,
      bands: events.map((event) => event.draw),
      segments,
      ...(offers.length > 0 ? { offers } : {}),
    };
  });
}

/** The day's events in no block, each its own small block. */
export function ownEventCards(
  blocks: readonly SetUpColumnBlock[],
  day: SetUpDay,
  open: (event: DayEventRecord) => void,
  google: GoogleOnDay = NO_GOOGLE,
): DayColumnEvent[] {
  const outside = (event: Pick<Timed, "startsAt">) =>
    !blocks.some((block) => startsIn(event, block));
  const covered = new Set(google.bands.covered);
  return [
    ...day.events
      .filter((event) => outside(event) && !covered.has(event.id))
      .map((event) => ({
        ...bandOf(event, open),
        meta: ADD_EVENT_COPY.ownMeta(
          event.startsAt,
          event.endsAt,
          event.tag,
          event.rrule === null ? day.weekday : null,
        ),
      })),
    // [ASSUMPTION] A Google one too, "Google" in place of the tag.
    ...google.bands.bands.filter(outside).map((event) => ({
      ...googleBandOf(event),
      meta: `${spanLabel(event.startsAt, event.endsAt)} · ${DAYS_COPY.google}`,
    })),
  ];
}

/** Maybes in no block, one line each at their times. */
export function ownOffers(
  blocks: readonly SetUpColumnBlock[],
  google: GoogleOnDay,
): DayColumnOffer[] {
  return google.bands.dashed
    .filter((event) => !blocks.some((block) => startsIn(event, block)))
    .map((event) => offerOf(event, google.addToDay));
}

/** A block an event or a maybe sits in draws its own tiers, not This week's parts. */
export function hasBands(block: {
  bands?: readonly unknown[];
  offers?: readonly unknown[];
}): boolean {
  return (block.bands?.length ?? 0) + (block.offers?.length ?? 0) > 0;
}
