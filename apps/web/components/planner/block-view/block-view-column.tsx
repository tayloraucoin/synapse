"use client";

import * as React from "react";
import {
  cn,
  ReorderIcon,
  SortableHandle,
  SortableList,
  Text,
  type SortableHandleProps,
} from "@syn/ui";
import { clockMinutes } from "@syn/utils";
import { HUE_DOT, type BlockHue } from "../block-hue";
import { BLOCK_VIEW_COPY as COPY } from "./copy";
import {
  clockLabel,
  freeHeightPx,
  rowHeightPx,
  type NowMark,
} from "./geometry";

/**
 * BlockViewColumn — the stretched column (USE-48; block-view/states/
 * success.md): start times on the rail, each row at least `--row-min` and
 * taller by length, its name at the top; the add row after the last item;
 * unused time as a dashed "Free until 8:00", or the block's end dashed with
 * "Runs 12 min past 8:00." over the rows past it (overflow.md); the end as a
 * solid line at its time; the next block peeking at the foot.
 *
 * One column for both modes. What changes by mode comes in as slots:
 * `leading` (the day's checkbox; editing has none), `trailing` (the length,
 * then the grip; editing's set-time clock takes the grip's place),
 * `wrapRow` (the day's swipe and long-press menu around a row's body) and
 * `reorder` (grips on every row while set). Editing (USE-49) adds
 * `rowHeight` (the kinds drawn flat at 56 px) and `timeless`: a checklist
 * with no span has no rail, no end, no free time and no overflow. Props only.
 */
export interface BlockViewRowModel {
  id: string;
  title: string;
  /** The planned start, "HH:MM", from `reflowItems`. */
  startsAt: string;
  lengthMin: number | null;
  done: boolean;
}

export interface BlockViewRowSlots {
  /** The row's length words, "2 min", or null with no length. */
  length: string | null;
  /** The grip while reordering, else null. */
  grip: React.ReactNode;
  /** The row is held mid-drag. */
  lifted: boolean;
}

export interface BlockViewColumnProps<R extends BlockViewRowModel> {
  rows: readonly R[];
  /** The list's name: "Wellness". */
  label: string;
  block: { startsAt: string; endsAt: string };
  /** Grips on every row (Edit, or editing); null hides them. */
  reorder?: {
    onReorder: (ids: string[]) => void;
    /** A row drawn mid-drag and held (`?state=edit-dragging` only). */
    frozenId?: string | null;
  } | null;
  /** Before the name: the day's checkbox. */
  leading?: (row: R) => React.ReactNode;
  /** The name: a button to the Item sheet. Default: plain text. */
  title?: (row: R) => React.ReactNode;
  /** After the name. Default: the length, then the grip. */
  trailing?: (row: R, slots: BlockViewRowSlots) => React.ReactNode;
  /** Around the row's body (not the rail): the swipe and the menu. */
  wrapRow?: (row: R, body: React.ReactNode) => React.ReactNode;
  /** The now-line, only while the block is current (D-USE-30). */
  now?: NowMark | null;
  /** Over the rows when there are none: "Nothing in Wellness yet." */
  empty?: React.ReactNode;
  /** The add row and the rail time it sits at ("HH:MM"). */
  add?: { at: string | null; node: React.ReactNode } | null;
  /** Where unused time starts ("HH:MM"), or null when none is free. */
  freeFrom?: string | null;
  /** Minutes past the block's end. */
  overMin?: number;
  /** The next block, peeking at the foot. */
  peek?: { name: string; span: string; hue: BlockHue } | null;
  /** A row's least height in px. Default: by length (`rowHeightPx`). */
  rowHeight?: (row: R) => number;
  /** A checklist with no times (D-USE-28): no rail, end, free time or peek. */
  timeless?: boolean;
  /** Under the add row: the kinds' lines, the topics, Set a time. */
  afterAdd?: React.ReactNode;
  /**
   * After those, the suggestion list (USE-156): it takes the place of the
   * "Free until" region, which the span total now says.
   */
  suggestions?: React.ReactNode;
}

/** The rail: 44 px. */
const RAIL = "w-11 shrink-0";
/**
 * The now time sits under the row's own rail time, never over it: the line
 * is at least this far down the row (as drawn, 7:14 under 7:10).
 */
const NOW_CLEAR_PX = 44;

/**
 * The now-line (D-USE-30, current.md): verdigris, its time on the rail, a
 * dot at the rail's edge and a line across the row under way. Hidden from
 * assistive tech: it moves each minute; the rows say what is under way.
 */
function NowMarkLine({ topPx, label }: { topPx: number; label: string }) {
  return (
    <div
      aria-hidden="true"
      data-now-line
      style={{ top: `${topPx}px` }}
      className="pointer-events-none absolute inset-x-0 z-10"
    >
      <span className="text-accent-text absolute start-0 -translate-y-1/2 text-(length:--fs-caption) leading-(--lh-caption) font-medium tabular-nums">
        {label}
      </span>
      <span className="bg-now absolute start-11 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <span className="bg-now absolute start-11 end-0 h-px -translate-y-1/2" />
    </div>
  );
}

function Rail({ time }: { time: string | null }) {
  return (
    <span
      className={cn(
        RAIL,
        "text-text-muted flex h-(--row-min) items-center text-(length:--fs-caption) leading-(--lh-caption) tabular-nums",
      )}
    >
      {time === null ? null : clockLabel(time)}
    </span>
  );
}

function Grip({ handleProps }: { handleProps: SortableHandleProps }) {
  return (
    // `data-grip`: the swipe and the long-press leave the grip to the drag.
    <span data-grip className="flex shrink-0">
      <SortableHandle
        {...handleProps}
        className={cn(
          handleProps.className,
          "text-text-muted rounded-(--radius-control)",
        )}
      >
        <ReorderIcon aria-hidden="true" className="size-4" />
      </SortableHandle>
    </span>
  );
}

function defaultTrailing(slots: BlockViewRowSlots): React.ReactNode {
  return (
    <>
      {slots.length === null ? null : (
        <span className="text-text-muted shrink-0 text-(length:--fs-caption) leading-(--lh-caption) tabular-nums">
          {slots.length}
        </span>
      )}
      {slots.grip}
    </>
  );
}

/** The block's end on the rail, solid; dashed when the rows run past it. */
function EndLine({ end, over }: { end: string; over: boolean }) {
  return (
    <div className="flex items-center" data-block-end>
      <span
        className={cn(
          RAIL,
          "text-text-muted text-(length:--fs-caption) leading-(--lh-caption) tabular-nums",
        )}
      >
        {clockLabel(end)}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "flex-1 border-t-2",
          over ? "border-ink border-dashed" : "border-text-muted",
        )}
      />
    </div>
  );
}

export function BlockViewColumn<R extends BlockViewRowModel>({
  rows,
  label,
  block,
  reorder = null,
  leading,
  title,
  trailing,
  wrapRow,
  now = null,
  empty = null,
  add = null,
  freeFrom = null,
  overMin = 0,
  peek = null,
  rowHeight,
  timeless = false,
  afterAdd = null,
  suggestions = null,
}: BlockViewColumnProps<R>) {
  const endMin = clockMinutes(block.endsAt);
  const over = !timeless && overMin > 0;
  const firstPast = over
    ? rows.find((row) => clockMinutes(row.startsAt) >= endMin)
    : undefined;

  function renderRow(
    row: R,
    handleProps: SortableHandleProps | null,
    isLifted: boolean,
  ) {
    const lifted = isLifted || row.id === reorder?.frozenId;
    const slots: BlockViewRowSlots = {
      length: row.lengthMin === null ? null : COPY.length(row.lengthMin),
      grip:
        reorder !== null && handleProps !== null ? (
          <Grip handleProps={handleProps} />
        ) : null,
      lifted,
    };
    const body = (
      <div
        className={cn(
          "flex h-(--row-min) items-center gap-(--space-3)",
          lifted && "px-(--space-3)",
          row.done && "[&_[data-row-fade]]:text-text-muted",
        )}
      >
        {leading?.(row)}
        <span data-row-fade className="min-w-0 flex-1 truncate">
          {title ? title(row) : row.title}
        </span>
        {(trailing ?? ((_, s: BlockViewRowSlots) => defaultTrailing(s)))(
          row,
          slots,
        )}
      </div>
    );
    const heightPx = rowHeight ? rowHeight(row) : rowHeightPx(row.lengthMin);
    const mark = now !== null && now.rowId === row.id ? now : null;
    return (
      <>
        {row === firstPast ? (
          <div className="flex flex-col gap-(--space-1) pt-(--space-2)">
            <EndLine end={block.endsAt} over />
            <Text
              as="p"
              variant="caption"
              className="ps-11 font-medium text-foreground"
            >
              {COPY.runsPast(overMin, clockLabel(block.endsAt))}
            </Text>
          </div>
        ) : null}
        <div
          data-block-row={row.id}
          data-done={row.done || undefined}
          className="relative flex"
          style={{ minHeight: `${heightPx}px` }}
        >
          {timeless ? null : <Rail time={row.startsAt} />}
          <div
            className={cn(
              "bg-background min-w-0 flex-1 border-b border-hairline",
              lifted &&
                "border-ink bg-surface rounded-(--radius-control) border",
            )}
          >
            {wrapRow ? wrapRow(row, body) : body}
          </div>
          {lifted ? (
            <span
              aria-hidden="true"
              className={cn(
                "bg-ink absolute end-0 -top-1 h-0.5",
                timeless ? "start-0" : "start-11",
              )}
            />
          ) : null}
          {mark ? (
            <NowMarkLine
              topPx={Math.max(
                NOW_CLEAR_PX,
                Math.round(mark.fraction * heightPx),
              )}
              label={mark.label}
            />
          ) : null}
        </div>
      </>
    );
  }

  return (
    <div data-block-view-column className="flex flex-col">
      {rows.length === 0 && empty !== null ? (
        <div className={cn("py-(--space-4)", !timeless && "ps-11")}>
          {empty}
        </div>
      ) : null}

      {reorder !== null ? (
        <SortableList
          items={rows}
          label={label}
          onReorder={reorder.onReorder}
          // The list's own lift is replaced by the row's: surface, ink edge.
          itemClassName="block border-0 data-lifted:opacity-100"
          renderItem={(row, { handleProps, isLifted }) =>
            renderRow(row, handleProps, isLifted)
          }
        />
      ) : (
        <ul aria-label={label} className="flex flex-col">
          {rows.map((row) => (
            <li key={row.id}>{renderRow(row, null, false)}</li>
          ))}
        </ul>
      )}

      {add ? (
        <div className="flex">
          {timeless ? null : <Rail time={add.at} />}
          <div className="min-w-0 flex-1">{add.node}</div>
        </div>
      ) : null}

      {afterAdd ? (
        <div className={cn("pb-(--space-3)", !timeless && "ps-11")}>
          {afterAdd}
        </div>
      ) : null}

      {suggestions ? (
        <div className={cn("pb-(--space-3)", !timeless && "ps-11")}>
          {suggestions}
        </div>
      ) : null}

      {!timeless && !over && freeFrom !== null && !suggestions ? (
        <div className="flex pb-(--space-2)">
          <span className={RAIL} />
          <div
            data-free-until
            className="border-edge text-text-muted flex flex-1 items-center justify-center rounded-(--radius-control) border border-dashed text-(length:--fs-caption) leading-(--lh-caption)"
            style={{
              minHeight: `${freeHeightPx(endMin - clockMinutes(freeFrom))}px`,
            }}
          >
            {COPY.freeUntil(clockLabel(block.endsAt))}
          </div>
        </div>
      ) : null}

      {over || timeless ? null : <EndLine end={block.endsAt} over={false} />}

      {peek && !timeless ? (
        <div className="flex items-center gap-(--space-2) ps-11 pt-(--space-4)">
          {peek.span === "" ? null : (
            <span
              aria-hidden="true"
              className={cn("h-4 w-1 shrink-0", HUE_DOT[peek.hue])}
            />
          )}
          <Text as="p" variant="caption" tone="muted">
            {/* An empty span: "Nothing after this today" alone (USE-49). */}
            {peek.span === "" ? peek.name : COPY.peek(peek.name, peek.span)}
          </Text>
        </div>
      ) : null}
    </div>
  );
}
