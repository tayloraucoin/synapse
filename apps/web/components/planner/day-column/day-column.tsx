"use client";

import * as React from "react";
import type { StoredBlockKind, WorkTier } from "@syn/types";
import {
  BULLET_CELL_PX,
  BULLET_GAP_X_PX,
  BULLET_GAP_Y_PX,
  BULLET_LINE_PX,
  cn,
  LockedIcon,
  MealIcon,
  NowLine,
  ScheduleAxis,
  ScheduleBullets,
  Text,
  type ScheduleBullet,
} from "@syn/ui";
import {
  bulletCellsPerLine,
  bulletGrid,
  clockMinutes,
  type ScheduleMark,
} from "@syn/utils";
import { BLOCK_HUE, HUE_CHIP, HUE_DOT, type BlockHue } from "../block-hue";
import { DAY_COLUMN_COPY as COPY, hourLabel, spanLabel } from "./copy";
import { HUE_CHECK } from "./mark-hue";
import { MeetingBand } from "./meeting-band";
import { useContentWidth } from "./use-content-width";
import { useSwipeAway } from "./use-swipe-away";

/**
 * DayColumn — the day drawn in time (USE-31; D-USE-7, D-USE-23): the axis
 * at 96 px an hour, Orient's locked line at Up at, and each block exactly as
 * tall as its span. A block never grows to fit what is in it: its items are
 * laid by `bulletGrid` into fixed cells, as many lines as its height holds,
 * and "+n more" counts only what does not fit. Two cells a line at the
 * phone; more as the column widens (the cells keep 145 px).
 *
 * Forms: a block of items (a dot each, a transition a dash in italic); a
 * meal, a dashed band with the fork and knife and no fill; Work, its tiers'
 * sub-heads with one item a line. The kind is the block's name in words,
 * its colour only beside it.
 *
 * Taps: a block (or a meal) is one button, "<name>, <start> to <end>",
 * covering the block; its bullets are buttons on top of it, shortcuts to
 * the Item sheet, since a 20 px line is under the target. Props only:
 * Review the day today, Schedule and Block view later.
 *
 * SCHEDULE (USE-27) passes what this moment adds, each optional: a block's
 * `state` ("done" fades it to 45 %, "now" gives it the one hairline
 * verdigris edge, D-P02), each item's `mark` (a check, running, firing),
 * a meeting inside a block as a band at its time with the items `segments`
 * before and after it (one header; nothing splits), events on their own,
 * and `now` (the rail tag and its faint line). With no `onBullet` the
 * bullets are words the block's button describes, not controls.
 *
 * Named apart from `@syn/ui`'s legacy `ScheduleOverlays`; it composes
 * `ScheduleAxis` and does not fork it.
 */

export interface DayColumnItem {
  id: string;
  label: string;
  tone: "dot" | "transition";
  /** Schedule's mark; unset, a planned dot. */
  mark?: ScheduleMark;
}

export interface DayColumnTier {
  tier: WorkTier;
  items: readonly DayColumnItem[];
}

/** A day event, as a band inside a block or a card on its own. */
export interface DayColumnEvent {
  id: string;
  title: string;
  /** "HH:MM" */
  startsAt: string;
  endsAt: string;
  hue: BlockHue;
  /** "10:30 to 11:00 · Meeting" */
  meta: string;
  /** On its own and holding now: the one verdigris edge. */
  underWay?: boolean;
}

/** The block's items between its bands: `bands.length + 1` of them. */
export interface DayColumnSegment {
  items: readonly DayColumnItem[];
  tiers: readonly DayColumnTier[];
}

export interface DayColumnBlock {
  id: string;
  kind: StoredBlockKind;
  name: string;
  /** "HH:MM" */
  startsAt: string;
  endsAt: string;
  form: "items" | "meal" | "work";
  items: readonly DayColumnItem[];
  tiers: readonly DayColumnTier[];
  /** Schedule: past (faded) or under way (the edge); unset, neither. */
  state?: "done" | "now" | null;
  /** Events inside the block, by start: one band each at its time. */
  bands?: readonly DayColumnEvent[];
  /** With `bands`: the items before, between and after them. */
  segments?: readonly DayColumnSegment[];
}

export interface DayColumnProps {
  /** Minutes from midnight, on whole hours. */
  hours: { startMin: number; endMin: number };
  orient: { atMin: number; lengthMin: number } | null;
  blocks: readonly DayColumnBlock[];
  /** Events inside no block, on their own at their times (Schedule). */
  events?: readonly DayColumnEvent[];
  /** The now line at the minute (Schedule): its tag on the rail. */
  now?: { atMin: number; label: string } | null;
  onBlock: (blockId: string) => void;
  /** A bullet's shortcut to the Item sheet; unset, bullets are words. */
  onBullet?: (blockId: string, itemId: string) => void;
  timeZone: string;
  /** Laid over the axis (the rail + lands here with its ticket). */
  children?: React.ReactNode;
  className?: string;
  /** A block or meal swiped sideways takes it off the date (USE-37). */
  onSwipeAway?: (blockId: string) => Promise<unknown> | void;
  /** A Work block with nothing slotted draws this in place of its tiers (USE-37). */
  emptyWork?: (block: DayColumnBlock) => React.ReactNode;
}

/* ---- the column's geometry (success.md) ---- */
export const DAY_COLUMN_PX_PER_HOUR = 96;
export const DAY_COLUMN_GUTTER_PX = 40;
const GUTTER_PX = DAY_COLUMN_GUTTER_PX;
/** The breath between two blocks, taken from the earlier one's foot. */
const BLOCK_GAP_PX = 4;
const PAD_TOP_PX = 8;
const PAD_BOTTOM_PX = 4;
/** The head's line (body) and the space under it. */
const HEAD_PX = 22;
const HEAD_GAP_PX = 4;
/** The 3 px edge, 12 px in, 8 px at the end. */
const EDGE_PX = 3;
const PAD_START_PX = 12;
const PAD_END_PX = 8;
/** The breath under a band before the items after it. */
const AFTER_BAND_PX = 8;

const pxOf = (minutes: number) => (minutes / 60) * DAY_COLUMN_PX_PER_HOUR;

/** The room a block's height leaves for lines of items. */
export function linesRoomPx(heightPx: number): number {
  return (
    heightPx - BLOCK_GAP_PX - PAD_TOP_PX - HEAD_PX - HEAD_GAP_PX - PAD_BOTTOM_PX
  );
}

/** Fixed cells a line for a column `widthPx` wide (axis and gutter included). */
export function cellsPerLineFor(widthPx: number | null): number {
  if (widthPx === null) return 2;
  const inner = widthPx - GUTTER_PX - EDGE_PX - PAD_START_PX - PAD_END_PX;
  return bulletCellsPerLine(inner, BULLET_CELL_PX, BULLET_GAP_X_PX);
}

const LINE = { lineHeightPx: BULLET_LINE_PX, rowGapPx: BULLET_GAP_Y_PX };

type WorkRow =
  | { kind: "head"; tier: WorkTier }
  | { kind: "item"; tier: WorkTier; item: DayColumnItem };

/** Work's tiers as lines within its height; "+n more" counts hidden items only. */
export function fitWorkRows(
  tiers: DayColumnBlock["tiers"],
  heightPx: number,
): { rows: WorkRow[]; more: number } {
  const rows: WorkRow[] = tiers.flatMap(({ tier, items }) => [
    { kind: "head" as const, tier },
    ...items.map((item) => ({ kind: "item" as const, tier, item })),
  ]);
  const total = rows.filter((row) => row.kind === "item").length;
  const grid = bulletGrid(rows, { heightPx, cellsPerLine: 1, ...LINE });
  const shown = [...grid.shown];
  // A sub-head with nothing under it is not drawn.
  while (shown.at(-1)?.kind === "head") shown.pop();
  const drawn = shown.filter((row) => row.kind === "item").length;
  return { rows: shown, more: total - drawn };
}

export function DayColumn({
  hours,
  orient,
  blocks,
  events = [],
  now = null,
  onBlock,
  onBullet,
  timeZone,
  children,
  className,
  onSwipeAway,
  emptyWork,
}: DayColumnProps) {
  const [ref, width] = useContentWidth<HTMLDivElement>();
  const cellsPerLine = cellsPerLineFor(width);
  const { className: swipeClassName, ...swipe } = useSwipeAway(onSwipeAway);

  return (
    <div
      ref={ref}
      className={cn("px-(--space-4)", swipeClassName, className)}
      {...swipe}
    >
      <ScheduleAxis
        startMin={hours.startMin}
        endMin={hours.endMin}
        pxPerHour={DAY_COLUMN_PX_PER_HOUR}
        timeZone={timeZone}
        ariaLabel={COPY.axis}
        gutterPx={GUTTER_PX}
        formatHour={hourLabel}
        hourLinesOnly
        hourLabelAlign="start"
        className="overflow-visible pt-(--space-2)"
      >
        {orient !== null ? (
          <OrientLine
            topPx={pxOf(orient.atMin - hours.startMin)}
            lengthMin={orient.lengthMin}
          />
        ) : null}
        {blocks.map((block) => {
          const top = pxOf(clockMinutes(block.startsAt) - hours.startMin);
          const height = pxOf(
            clockMinutes(block.endsAt) - clockMinutes(block.startsAt),
          );
          return block.form === "meal" ? (
            <MealBand
              key={block.id}
              block={block}
              topPx={top}
              heightPx={height}
              onOpen={() => onBlock(block.id)}
            />
          ) : (
            <BlockCard
              key={block.id}
              block={block}
              topPx={top}
              heightPx={height}
              cellsPerLine={cellsPerLine}
              onOpen={() => onBlock(block.id)}
              onBullet={
                onBullet ? (itemId) => onBullet(block.id, itemId) : undefined
              }
              empty={
                block.form === "work" && block.tiers.length === 0
                  ? emptyWork?.(block)
                  : undefined
              }
            />
          );
        })}
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            topPx={pxOf(clockMinutes(event.startsAt) - hours.startMin)}
            heightPx={pxOf(
              clockMinutes(event.endsAt) - clockMinutes(event.startsAt),
            )}
          />
        ))}
        {children}
        {now !== null ? (
          <NowLine
            tag="rail"
            atMin={now.atMin}
            topPx={pxOf(now.atMin - hours.startMin)}
            label={now.label}
            lineStartPx={GUTTER_PX}
          />
        ) : null}
      </ScheduleAxis>
    </div>
  );
}

/** Orient's locked line: a 2 px ink bar, the lock, "Orient · 5 min". */
function OrientLine({
  topPx,
  lengthMin,
}: {
  topPx: number;
  lengthMin: number;
}) {
  return (
    <div
      data-orient-line
      style={{ top: `${topPx}px`, insetInlineStart: `${GUTTER_PX}px` }}
      className="absolute end-0 flex -translate-y-1/2 items-center gap-(--space-2)"
    >
      <span aria-hidden="true" className="h-0.5 w-45 shrink-0 bg-foreground" />
      <span className="flex items-center gap-(--space-1) text-muted-foreground">
        <LockedIcon aria-hidden="true" className="size-2.5" />
        <Text as="span" variant="caption" tone="muted">
          {COPY.orient(lengthMin)}
        </Text>
      </span>
    </div>
  );
}

interface PlacedProps {
  block: DayColumnBlock;
  topPx: number;
  heightPx: number;
  onOpen: () => void;
}

/** The box a block or meal sits in: its span, less the breath before the next. */
function placed(topPx: number, heightPx: number): React.CSSProperties {
  return {
    top: `${topPx}px`,
    height: `${Math.max(0, heightPx - BLOCK_GAP_PX)}px`,
    insetInlineStart: `${GUTTER_PX}px`,
    insetInlineEnd: 0,
  };
}

/** The button under everything, carrying the tap and the block's name. */
function CoverButton({
  label,
  describedBy,
  onOpen,
}: {
  label: string;
  describedBy?: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      aria-describedby={describedBy}
      className="absolute inset-0 rounded-(--radius-control) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    />
  );
}

/** Schedule's state on the box: done fades, now takes the one edge (D-P02). */
function stateClass(state: DayColumnBlock["state"]) {
  if (state === "done") return "opacity-45";
  if (state === "now") return "border-y border-e border-now";
  return null;
}

function BlockHead({ block }: { block: DayColumnBlock }) {
  return (
    <div className="flex h-5.5 min-w-0 items-baseline gap-(--space-2)">
      <Text as="span" variant="body" weight={600} truncate>
        {block.name}
      </Text>
      <Text
        as="span"
        variant="secondary"
        tone="muted"
        weight={500}
        className="shrink-0 tabular-nums"
      >
        {spanLabel(block.startsAt, block.endsAt)}
      </Text>
    </div>
  );
}

/** A segment's place inside its block: from its top, with this much room. */
interface SegmentPlace {
  segment: DayColumnSegment;
  /** Px from the block's top; null for the first, which follows the head. */
  topPx: number | null;
  roomPx: number;
}

/** The block's items around its bands; one segment when it has none. */
function segmentPlaces(
  block: DayColumnBlock,
  heightPx: number,
): SegmentPlace[] {
  const bands = block.bands ?? [];
  const segments = block.segments ?? [
    { items: block.items, tiers: block.tiers },
  ];
  const start = clockMinutes(block.startsAt);
  const foot = heightPx - BLOCK_GAP_PX - PAD_BOTTOM_PX;
  return segments.map((segment, index) => {
    const nextBand = bands[index];
    // Above a band, the last line may tuck half under its edge, as drawn.
    const until = nextBand
      ? pxOf(clockMinutes(nextBand.startsAt) - start) + BULLET_LINE_PX / 2
      : foot;
    if (index === 0) {
      return {
        segment,
        topPx: null,
        roomPx: until - PAD_TOP_PX - HEAD_PX - HEAD_GAP_PX,
      };
    }
    const after = bands[index - 1]!;
    const topPx = pxOf(clockMinutes(after.endsAt) - start) + AFTER_BAND_PX;
    return { segment, topPx, roomPx: until - topPx };
  });
}

function BlockCard({
  block,
  topPx,
  heightPx,
  cellsPerLine,
  onOpen,
  onBullet,
  empty,
}: PlacedProps & {
  cellsPerLine: number;
  onBullet: ((itemId: string) => void) | undefined;
  /** Drawn under the head in place of the items (an empty Work block). */
  empty?: React.ReactNode;
}) {
  const hue = BLOCK_HUE[block.kind];
  const listId = React.useId();
  const bullet = (item: DayColumnItem): ScheduleBullet => ({
    id: item.id,
    label: item.label,
    tone: item.tone,
    ...markOf(item),
    ...(onBullet
      ? {
          onOpen: () => onBullet(item.id),
          ariaLabel: COPY.bullet(item.label, block.name),
        }
      : {}),
  });
  const places = segmentPlaces(block, heightPx);
  const start = clockMinutes(block.startsAt);
  const items = (place: SegmentPlace) =>
    block.form === "work" ? (
      <WorkTiers
        tiers={place.segment.tiers}
        roomPx={place.roomPx}
        hue={hue}
        bullet={bullet}
      />
    ) : (
      <ItemGrid
        items={place.segment.items}
        roomPx={place.roomPx}
        cellsPerLine={cellsPerLine}
        hue={hue}
        bullet={bullet}
      />
    );
  // Bullets are words on Schedule: the block's button reads them out.
  const describedBy = onBullet
    ? undefined
    : places.map((_, index) => `${listId}-${index}`).join(" ");

  return (
    <div
      data-day-block={block.kind}
      data-block-id={block.id}
      data-state={block.state ?? undefined}
      style={placed(topPx, heightPx)}
      className={cn(
        "absolute flex overflow-hidden rounded-(--radius-control)",
        HUE_CHIP[hue],
        stateClass(block.state),
      )}
    >
      <CoverButton
        label={COPY.block(
          block.name,
          block.startsAt,
          block.endsAt,
          block.state ?? null,
        )}
        describedBy={describedBy}
        onOpen={onOpen}
      />
      <span
        aria-hidden="true"
        className={cn("w-0.75 shrink-0", HUE_DOT[hue])}
      />
      <div className="pointer-events-none relative flex min-w-0 flex-1 flex-col gap-(--space-1) pt-(--space-2) ps-(--space-3) pe-(--space-2) pb-(--space-1) [&_button]:pointer-events-auto">
        <BlockHead block={block} />
        <div id={`${listId}-0`}>{empty ?? items(places[0]!)}</div>
      </div>
      {(block.bands ?? []).map((band) => (
        <MeetingBand
          key={band.id}
          event={band}
          topPx={pxOf(clockMinutes(band.startsAt) - start)}
          heightPx={pxOf(
            clockMinutes(band.endsAt) - clockMinutes(band.startsAt),
          )}
        />
      ))}
      {places.slice(1).map((place, index) => (
        <div
          key={index}
          id={`${listId}-${index + 1}`}
          style={{
            top: `${place.topPx}px`,
            insetInlineStart: `${EDGE_PX + PAD_START_PX}px`,
            insetInlineEnd: `${PAD_END_PX}px`,
          }}
          className="pointer-events-none absolute [&_button]:pointer-events-auto"
        >
          {items(place)}
        </div>
      ))}
    </div>
  );
}

/** A mark's drawing and words: a check is a check, running and firing say so. */
function markOf(item: DayColumnItem): Partial<ScheduleBullet> {
  switch (item.mark) {
    case "done":
      return { mark: "check", markLabel: COPY.mark.done };
    case "running":
      return { mark: "running", suffix: COPY.mark.running };
    case "firing":
      return { mark: "firing", suffix: COPY.mark.firing };
    default:
      return { mark: "dot" };
  }
}

function ItemGrid({
  items,
  roomPx,
  cellsPerLine,
  hue,
  bullet,
}: {
  items: DayColumnSegment["items"];
  roomPx: number;
  cellsPerLine: number;
  hue: BlockHue;
  bullet: (item: DayColumnItem) => ScheduleBullet;
}) {
  const grid = bulletGrid(items, { heightPx: roomPx, cellsPerLine, ...LINE });
  return (
    <ScheduleBullets
      bullets={grid.shown.map(bullet)}
      moreCount={grid.more}
      dotClassName={HUE_DOT[hue]}
      checkClassName={HUE_CHECK[hue]}
    />
  );
}

function WorkTiers({
  tiers,
  roomPx,
  hue,
  bullet,
}: {
  tiers: DayColumnSegment["tiers"];
  roomPx: number;
  hue: BlockHue;
  bullet: (item: DayColumnItem) => ScheduleBullet;
}) {
  const { rows, more } = fitWorkRows(tiers, roomPx);
  if (rows.length === 0 && more === 0) return null;
  // Each tier's head, then its items one a line, all on the 20 px rhythm.
  const groups: { tier: WorkTier; items: DayColumnItem[] }[] = [];
  for (const row of rows) {
    if (row.kind === "head") groups.push({ tier: row.tier, items: [] });
    else groups.at(-1)?.items.push(row.item);
  }
  return (
    <div className="flex flex-col gap-(--space-1)">
      {groups.map((group, index) => (
        <div key={group.tier} className="flex flex-col gap-(--space-1)">
          <Text
            as="span"
            variant="caption"
            tone="muted"
            weight={500}
            className="flex h-5 items-end"
          >
            {COPY.tier[group.tier]}
          </Text>
          <ScheduleBullets
            layout="lines"
            bullets={group.items.map(bullet)}
            moreCount={index === groups.length - 1 ? more : 0}
            dotClassName={HUE_DOT[hue]}
            checkClassName={HUE_CHECK[hue]}
          />
        </div>
      ))}
    </div>
  );
}

/** A meal: a dashed band, the fork and knife, the name and its span. */
function MealBand({ block, topPx, heightPx, onOpen }: PlacedProps) {
  return (
    <div
      data-day-meal
      data-block-id={block.id}
      data-state={block.state ?? undefined}
      style={placed(topPx, heightPx)}
      className={cn(
        "absolute flex rounded-(--radius-control) border",
        // Under way, the one verdigris edge takes the dashes' place [ASSUMPTION].
        block.state === "now"
          ? "border-solid border-now"
          : "border-dashed border-border",
        block.state === "done" ? "opacity-45" : null,
      )}
    >
      <CoverButton
        label={COPY.block(
          block.name,
          block.startsAt,
          block.endsAt,
          block.state ?? null,
        )}
        onOpen={onOpen}
      />
      <div className="pointer-events-none relative flex h-(--target) max-h-full min-w-0 items-center gap-(--space-2) ps-(--space-3) pe-(--space-2)">
        <MealIcon
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground"
        />
        <Text as="span" variant="secondary" weight={500} truncate>
          {block.name}
        </Text>
        <Text
          as="span"
          variant="secondary"
          tone="muted"
          className="shrink-0 tabular-nums"
        >
          {spanLabel(block.startsAt, block.endsAt)}
        </Text>
      </div>
    </div>
  );
}

/**
 * An event inside no block (D-USE-38): a fill in its colour with a 4 px
 * rule, the lock (it keeps its time), its name and "<span> · <tag>". Not a
 * target here [ASSUMPTION: an event's sheet is its own ticket's].
 */
function EventCard({
  event,
  topPx,
  heightPx,
}: {
  event: DayColumnEvent;
  topPx: number;
  heightPx: number;
}) {
  return (
    <div
      data-day-event
      data-event-id={event.id}
      data-state={event.underWay ? "now" : undefined}
      style={placed(topPx, heightPx)}
      className={cn(
        "absolute flex overflow-hidden rounded-(--radius)",
        HUE_CHIP[event.hue],
        event.underWay ? "border-y border-e border-now" : null,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("w-1 shrink-0", HUE_DOT[event.hue])}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-(--space-2) ps-(--space-3) pe-(--space-2)">
        <div className="flex min-w-0 items-center gap-(--space-2)">
          <LockedIcon aria-hidden="true" className="size-3 shrink-0" />
          <Text as="span" variant="body" weight={600} truncate>
            {event.title}
          </Text>
        </div>
        <Text as="span" variant="secondary" truncate className="tabular-nums">
          {event.meta}
        </Text>
      </div>
    </div>
  );
}
