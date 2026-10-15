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
  ScheduleAxis,
  ScheduleBullets,
  Text,
  type ScheduleBullet,
} from "@syn/ui";
import { bulletCellsPerLine, bulletGrid, clockMinutes } from "@syn/utils";
import { BLOCK_HUE, HUE_CHIP, HUE_DOT } from "../block-hue";
import { DAY_COLUMN_COPY as COPY, hourLabel, spanLabel } from "./copy";
import { useContentWidth } from "./use-content-width";

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
 * Named apart from `@syn/ui`'s legacy `ScheduleOverlays`; it composes
 * `ScheduleAxis` and does not fork it.
 */

export interface DayColumnItem {
  id: string;
  label: string;
  tone: "dot" | "transition";
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
  tiers: readonly { tier: WorkTier; items: readonly DayColumnItem[] }[];
}

export interface DayColumnProps {
  /** Minutes from midnight, on whole hours. */
  hours: { startMin: number; endMin: number };
  orient: { atMin: number; lengthMin: number } | null;
  blocks: readonly DayColumnBlock[];
  onBlock: (blockId: string) => void;
  onBullet: (blockId: string, itemId: string) => void;
  timeZone: string;
  /** Laid over the axis (the rail + lands here with its ticket). */
  children?: React.ReactNode;
  className?: string;
}

/* ---- the column's geometry (success.md) ---- */
export const DAY_COLUMN_PX_PER_HOUR = 96;
const GUTTER_PX = 40;
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
  onBlock,
  onBullet,
  timeZone,
  children,
  className,
}: DayColumnProps) {
  const [ref, width] = useContentWidth<HTMLDivElement>();
  const cellsPerLine = cellsPerLineFor(width);

  return (
    <div ref={ref} className={cn("px-(--space-4)", className)}>
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
              onBullet={(itemId) => onBullet(block.id, itemId)}
            />
          );
        })}
        {children}
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
function CoverButton({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className="absolute inset-0 rounded-(--radius-control) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    />
  );
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

function BlockCard({
  block,
  topPx,
  heightPx,
  cellsPerLine,
  onOpen,
  onBullet,
}: PlacedProps & { cellsPerLine: number; onBullet: (itemId: string) => void }) {
  const hue = BLOCK_HUE[block.kind];
  const room = linesRoomPx(heightPx);
  const bullet = (item: DayColumnItem): ScheduleBullet => ({
    ...item,
    onOpen: () => onBullet(item.id),
    ariaLabel: COPY.bullet(item.label, block.name),
  });

  return (
    <div
      data-day-block={block.kind}
      data-block-id={block.id}
      style={placed(topPx, heightPx)}
      className={cn(
        "absolute flex overflow-hidden rounded-(--radius-control)",
        HUE_CHIP[hue],
      )}
    >
      <CoverButton
        label={COPY.block(block.name, block.startsAt, block.endsAt)}
        onOpen={onOpen}
      />
      <span
        aria-hidden="true"
        className={cn("w-0.75 shrink-0", HUE_DOT[hue])}
      />
      <div className="pointer-events-none relative flex min-w-0 flex-1 flex-col gap-(--space-1) pt-(--space-2) ps-(--space-3) pe-(--space-2) pb-(--space-1) [&_button]:pointer-events-auto">
        <BlockHead block={block} />
        {block.form === "work" ? (
          <WorkTiers
            tiers={block.tiers}
            roomPx={room}
            dotClassName={HUE_DOT[hue]}
            bullet={bullet}
          />
        ) : (
          <ItemGrid
            items={block.items}
            roomPx={room}
            cellsPerLine={cellsPerLine}
            dotClassName={HUE_DOT[hue]}
            bullet={bullet}
          />
        )}
      </div>
    </div>
  );
}

function ItemGrid({
  items,
  roomPx,
  cellsPerLine,
  dotClassName,
  bullet,
}: {
  items: DayColumnBlock["items"];
  roomPx: number;
  cellsPerLine: number;
  dotClassName: string;
  bullet: (item: DayColumnItem) => ScheduleBullet;
}) {
  const grid = bulletGrid(items, { heightPx: roomPx, cellsPerLine, ...LINE });
  return (
    <ScheduleBullets
      bullets={grid.shown.map(bullet)}
      moreCount={grid.more}
      dotClassName={dotClassName}
    />
  );
}

function WorkTiers({
  tiers,
  roomPx,
  dotClassName,
  bullet,
}: {
  tiers: DayColumnBlock["tiers"];
  roomPx: number;
  dotClassName: string;
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
            dotClassName={dotClassName}
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
      style={placed(topPx, heightPx)}
      className="absolute flex rounded-(--radius-control) border border-dashed border-border"
    >
      <CoverButton
        label={COPY.block(block.name, block.startsAt, block.endsAt)}
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
