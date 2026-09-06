import type { DayItemView } from "@syn/types";

/**
 * The Schedule's arithmetic — pure, so it can be run without a browser.
 *
 * EVERYTHING IS MINUTES FROM MIDNIGHT IN THE DAY'S OWN ZONE, converted to
 * pixels at one place. Mixing the two is how a block ends up an hour out on a
 * DST day; keeping the conversion to a single `topPx` helper means the axis,
 * the blocks, the ghosts, the bands and the now line all agree by construction.
 *
 * A GHOST IS DRAWN FROM `original_scheduled_start` AND NOTHING ELSE. The
 * canvas never infers where something was "supposed" to be from a template, a
 * duration, or a neighbouring block — the column exists precisely so the
 * picture cannot be reconstructed wrongly, and the trigger that protects it
 * from being rewritten is what makes it trustworthy.
 *
 * NOTHING HERE READS A CLOCK. `nowMin` is a parameter.
 */

/** The composite's two densities — 96 is the 150%-text-scale path. */
export type PxPerHour = 64 | 96;

export type BlockLayout = {
  item: DayItemView;
  topPx: number;
  heightPx: number;
  /** Set only for members of a multitask group sharing a start. */
  multitask?: { index: number; count: number };
};

export type SpanLayout = { key: string; topPx: number; heightPx: number };

export type GhostLayout = {
  item: DayItemView;
  topPx: number;
  heightPx: number;
};

export type BandLayout = {
  id: string;
  topPx: number;
  deltaMin: number;
  reasonLabel: string;
};

export type ScheduleLayout = {
  startMin: number;
  endMin: number;
  blocks: BlockLayout[];
  spans: SpanLayout[];
  ghosts: GhostLayout[];
  bands: BandLayout[];
  /** Null in record and plan modes, and on a day with no clock to show. */
  nowTopPx: number | null;
};

/** An hour of padding at each end — official spec §5.3. */
const PAD_MIN = 60;

/** A block never renders shorter than this, or it cannot be tapped at all. */
const MIN_BLOCK_PX = 2;

export function minutesInZone(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(at);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  );
  return hour * 60 + minute;
}

export type LayoutInput = {
  timezone: string;
  items: readonly DayItemView[];
  cutByShift: readonly DayItemView[];
  shifts: ReadonlyArray<{
    id: string;
    at: Date;
    deltaMin: number;
    reasonLabel: string | null;
  }>;
  /** Null in record and plan modes. */
  now: Date | null;
  closedAt: Date | null;
  /** Extra hours the person asked for, per end. */
  extendEarlierH: number;
  extendLaterH: number;
};

export function buildLayout(
  input: LayoutInput,
  pxPerHour: PxPerHour,
): ScheduleLayout {
  const zone = input.timezone;
  const toMin = (at: Date) => minutesInZone(at, zone);
  const px = (minutes: number) => (minutes / 60) * pxPerHour;

  const scheduled = input.items.filter(
    (item) => item.scheduledStart !== null,
  );

  /*
   * The range must cover everything that will be drawn, not only the blocks:
   * a ghost at 07:00 for an item started at 14:00, and a shift band, both sit
   * on the axis and would otherwise fall outside it. The ticket's own edge
   * case — "an item whose duration exceeds the axis end" — is the same
   * problem, so every drawn minute goes into the bounds.
   */
  const marks: number[] = [];

  for (const item of scheduled) {
    if (item.scheduledStart === null) continue;
    const start = toMin(item.scheduledStart);
    marks.push(start);
    marks.push(start + (item.durationMin ?? 0));
    if (item.scheduledEnd !== null) marks.push(toMin(item.scheduledEnd));
    if (item.originalScheduledStart !== null) {
      marks.push(toMin(item.originalScheduledStart));
    }
  }
  for (const item of input.cutByShift) {
    const at = item.originalScheduledStart ?? item.scheduledStart;
    if (at !== null) marks.push(toMin(at));
  }
  for (const shift of input.shifts) marks.push(toMin(shift.at));

  const first = marks.length === 0 ? 8 * 60 : Math.min(...marks);
  const last = marks.length === 0 ? 18 * 60 : Math.max(...marks);

  const startMin = Math.max(
    0,
    first - PAD_MIN - input.extendEarlierH * 60,
  );
  const endMin = Math.min(
    24 * 60,
    last + PAD_MIN + input.extendLaterH * 60,
  );

  const topOf = (minutes: number) => px(minutes - startMin);

  /*
   * Multitask members share a start; the read model orders them adjacently and
   * gives each a position. Grouping by START MINUTE rather than by id is what
   * makes the ticket's "should not exist" case render side by side anyway:
   * two items at one minute get half the width each whether or not anybody
   * remembered to group them.
   */
  const byStart = new Map<number, DayItemView[]>();
  for (const item of scheduled) {
    if (item.scheduledStart === null) continue;
    const key = toMin(item.scheduledStart);
    const bucket = byStart.get(key);
    if (bucket) bucket.push(item);
    else byStart.set(key, [item]);
  }

  const blocks: BlockLayout[] = [];
  const spans: SpanLayout[] = [];

  for (const [startAt, group] of byStart) {
    group.forEach((item, index) => {
      /*
       * A WINDOW'S BLOCK SITS AT THE WINDOW'S TOP UNTIL IT HAS ACTUALLY
       * STARTED. Before then there is no fact about when it happened, and
       * drawing it at an arbitrary point inside the span would be the canvas
       * inventing one. Its span is always the whole window; the block is the
       * duration.
       */
      const isWindow = item.timeMode === "window" && item.scheduledEnd !== null;

      if (isWindow && item.scheduledEnd !== null && item.scheduledStart !== null) {
        const spanTop = topOf(startAt);
        const spanEnd = topOf(toMin(item.scheduledEnd));
        spans.push({
          key: item.id,
          topPx: spanTop,
          heightPx: Math.max(MIN_BLOCK_PX, spanEnd - spanTop),
        });
      }

      const heightMin = item.durationMin ?? (isWindow ? 30 : 30);
      blocks.push({
        item,
        topPx: topOf(startAt),
        heightPx: Math.max(MIN_BLOCK_PX, px(heightMin)),
        multitask:
          group.length > 1
            ? { index, count: group.length }
            : undefined,
      });
    });
  }

  /*
   * A ghost for anything that moved, and for anything cut.
   *
   * "Moved" is `scheduled_start !== original_scheduled_start` — the same
   * comparison the row's *moved* word comes from, so the two can never
   * disagree about whether there is a ghost to draw.
   */
  const ghosts: GhostLayout[] = [];

  for (const item of scheduled) {
    if (item.originalScheduledStart === null || item.scheduledStart === null) {
      continue;
    }
    const original = toMin(item.originalScheduledStart);
    if (original === toMin(item.scheduledStart)) continue;

    ghosts.push({
      item,
      topPx: topOf(original),
      heightPx: Math.max(MIN_BLOCK_PX, px(item.durationMin ?? 30)),
    });
  }

  // A cut item has no live block at all — only the outline of where it was.
  for (const item of input.cutByShift) {
    const at = item.originalScheduledStart ?? item.scheduledStart;
    if (at === null) continue;
    ghosts.push({
      item,
      topPx: topOf(toMin(at)),
      heightPx: Math.max(MIN_BLOCK_PX, px(item.durationMin ?? 30)),
    });
  }

  const bands: BandLayout[] = input.shifts.map((shift) => ({
    id: shift.id,
    topPx: topOf(toMin(shift.at)),
    deltaMin: shift.deltaMin,
    reasonLabel: shift.reasonLabel ?? "",
  }));

  /*
   * The now line stops at the close. A closed day has no "now" on it any more
   * — the line marks where the day ended, which is why it carries the word
   * *closed* rather than a time that keeps moving.
   */
  const nowAt = input.closedAt ?? input.now;
  const nowTopPx = nowAt === null ? null : topOf(toMin(nowAt));

  return { startMin, endMin, blocks, spans, ghosts, bands, nowTopPx };
}
