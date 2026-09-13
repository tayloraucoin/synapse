import type { BlockKind, DayBlockView, DayItemView, DayMode } from "@syn/types";

/**
 * The Schedule's arithmetic — pure, so it can be run without a browser.
 *
 * EVERYTHING IS MINUTES FROM MIDNIGHT IN THE DAY'S OWN ZONE, converted to
 * pixels at one place. Mixing the two is how a block ends up an hour out on a
 * DST day; keeping the conversion to a single `topPx` helper means the axis,
 * the bands, the blocks, the ghosts, the shift bands and the now line all
 * agree by construction.
 *
 * THE DAY IS ITS BLOCKS (UX v1.1 §6.5, DYN-16). Each block is a `BlockBand`
 * behind its items; the empty span between two bands is slack, labelled in
 * the gutter; the work block is a container — the focus as the title, its
 * fixtures inside as pinned blocks — and splits around training because the
 * day has two work blocks then, not because the canvas cuts one.
 *
 * A GHOST IS DRAWN FROM `original_scheduled_start` AND NOTHING ELSE, and
 * ONLY ONCE THAT TIME HAS PASSED (§6.5: "the ghost shows on the axis only
 * after the original time has passed"). The canvas never infers where
 * something was "supposed" to be from a template, a duration, or a
 * neighbouring block — the column exists precisely so the picture cannot be
 * reconstructed wrongly. A plan (a future day) has no ghosts: nothing on it
 * has been lived.
 *
 * NOTHING HERE READS A CLOCK. `now` is a parameter.
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

/** The work block: the focus as a container, its fixtures relative to it. */
export type ContainerLayout = {
  item: DayItemView;
  topPx: number;
  heightPx: number;
  children: BlockLayout[];
};

export type SpanLayout = { key: string; topPx: number; heightPx: number };

export type GhostLayout = {
  item: DayItemView;
  topPx: number;
  heightPx: number;
};

export type ShiftBandLayout = {
  id: string;
  topPx: number;
  deltaMin: number;
  reasonLabel: string;
};

export type BandLayout = {
  id: string;
  kind: BlockKind;
  name: string | null;
  topPx: number;
  heightPx: number;
  startMin: number;
  endMin: number;
  pooled: boolean;
  /** A band with times, on a day that can change. */
  draggable: boolean;
};

export type SlackLayout = {
  key: string;
  topPx: number;
  heightPx: number;
  minutes: number;
};

export type ScheduleLayout = {
  startMin: number;
  endMin: number;
  bands: BandLayout[];
  slack: SlackLayout[];
  containers: ContainerLayout[];
  blocks: BlockLayout[];
  spans: SpanLayout[];
  ghosts: GhostLayout[];
  shiftBands: ShiftBandLayout[];
  /** Null in record and plan modes, and on a day with no clock to show. */
  nowTopPx: number | null;
};

/** An hour of padding at each end — official spec §5.3. */
const PAD_MIN = 60;

/** A block never renders shorter than this, or it cannot be tapped at all. */
const MIN_BLOCK_PX = 2;

/** Slack shorter than this is a hairline with no label — there is no room for one. */
const MIN_SLACK_LABEL_MIN = 5;

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
  mode: DayMode;
  blocks: readonly DayBlockView[];
  unblocked: readonly DayItemView[];
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

  /*
   * The work block's container item and its fixtures leave the flat list:
   * they are drawn as one container. Everything else — the other blocks'
   * items, the work block's non-fixture rows, the block-less — is a block of
   * its own.
   */
  const containerItems: Array<{ block: DayBlockView; item: DayItemView; fixtures: DayItemView[] }> = [];
  const flat: DayItemView[] = [...input.unblocked];
  for (const block of input.blocks) {
    if (block.kind === "work") {
      const container = block.items.find((item) => item.type === "deep_work" && item.origin !== "fixture") ?? null;
      const fixtures = block.items.filter((item) => item.origin === "fixture");
      if (container !== null) {
        containerItems.push({ block, item: container, fixtures });
        flat.push(...block.items.filter((item) => item !== container && item.origin !== "fixture"));
        continue;
      }
    }
    flat.push(...block.items);
  }

  const scheduled = flat.filter((item) => item.scheduledStart !== null);
  const everything = [...scheduled, ...containerItems.flatMap((entry) => [entry.item, ...entry.fixtures])];

  /*
   * The range must cover everything that will be drawn, not only the blocks:
   * a band, a ghost at 07:00 for an item started at 14:00, a shift band —
   * all sit on the axis and would otherwise fall outside it.
   */
  const marks: number[] = [];

  for (const item of everything) {
    if (item.scheduledStart === null) continue;
    const start = toMin(item.scheduledStart);
    marks.push(start);
    marks.push(start + (item.durationMin ?? 0));
    if (item.scheduledEnd !== null) marks.push(toMin(item.scheduledEnd));
    if (item.originalScheduledStart !== null) {
      marks.push(toMin(item.originalScheduledStart));
    }
  }
  for (const block of input.blocks) {
    if (block.startAt !== null) marks.push(toMin(block.startAt));
    if (block.endAt !== null) marks.push(toMin(block.endAt));
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

  /* ------------------------------------------------------------ bands -- */

  const canChange = input.mode !== "record";
  const bands: BandLayout[] = [];
  for (const block of input.blocks) {
    if (block.startAt === null || block.endAt === null) continue;
    if (block.state === "not_today") continue;
    const s = toMin(block.startAt);
    const e = Math.max(s, toMin(block.endAt));
    bands.push({
      id: block.id,
      kind: block.kind,
      name: block.name,
      topPx: topOf(s),
      heightPx: Math.max(MIN_BLOCK_PX, px(e - s)),
      startMin: s,
      endMin: e,
      pooled: block.state === "pooled",
      draggable: canChange,
    });
  }
  bands.sort((a, b) => a.startMin - b.startMin);

  // Slack: the open span between one band's end and the next band's start.
  const slack: SlackLayout[] = [];
  for (let index = 0; index + 1 < bands.length; index += 1) {
    const before = bands[index];
    const after = bands[index + 1];
    if (!before || !after) continue;
    const minutes = after.startMin - before.endMin;
    if (minutes < MIN_SLACK_LABEL_MIN) continue;
    slack.push({
      key: `${before.id}-${after.id}`,
      topPx: topOf(before.endMin),
      heightPx: px(minutes),
      minutes,
    });
  }

  /* ------------------------------------------------------- containers -- */

  const containers: ContainerLayout[] = [];
  for (const entry of containerItems) {
    // The container spans its block; the item's own span when the block has none.
    const startAt = entry.block.startAt ?? entry.item.scheduledStart;
    const endAt = entry.block.endAt ?? entry.item.scheduledEnd;
    if (startAt === null) continue;
    const s = toMin(startAt);
    const e = endAt === null ? s + (entry.item.durationMin ?? 30) : Math.max(s, toMin(endAt));
    const top = topOf(s);
    containers.push({
      item: entry.item,
      topPx: top,
      heightPx: Math.max(MIN_BLOCK_PX, px(e - s)),
      children: entry.fixtures
        .filter((fixture) => fixture.scheduledStart !== null)
        .map((fixture) => {
          const fs = toMin(fixture.scheduledStart as Date);
          return {
            item: fixture,
            // Relative to the container.
            topPx: topOf(fs) - top,
            heightPx: Math.max(MIN_BLOCK_PX, px(fixture.durationMin ?? 30)),
          };
        }),
    });
  }

  /* ----------------------------------------------------------- blocks -- */

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

      const heightMin = item.durationMin ?? 30;
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

  /* ----------------------------------------------------------- ghosts -- */

  /*
   * A ghost for anything that moved, once its original time has passed, and
   * for anything cut.
   *
   * "Moved" is `scheduled_start !== original_scheduled_start` — the same
   * comparison the row's *moved* word comes from, so the two can never
   * disagree about whether there is a ghost to draw. A plan has none; a
   * record's are all past.
   */
  const ghosts: GhostLayout[] = [];
  const nowMin =
    input.mode === "record" ? Number.POSITIVE_INFINITY : input.now === null ? null : toMin(input.now);

  if (input.mode !== "plan" && nowMin !== null) {
    for (const item of everything) {
      if (item.originalScheduledStart === null || item.scheduledStart === null) {
        continue;
      }
      const original = toMin(item.originalScheduledStart);
      if (original === toMin(item.scheduledStart)) continue;
      if (original > nowMin) continue;

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
  }

  const shiftBands: ShiftBandLayout[] = input.shifts.map((shift) => ({
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

  return { startMin, endMin, bands, slack, containers, blocks, spans, ghosts, shiftBands, nowTopPx };
}
