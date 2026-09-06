"use client";

import * as React from "react";

import {
  EmptyState,
  GhostBlock,
  NowLine,
  ScheduleAxis,
  ScheduleBlock,
  ScreenFrame,
  ShiftBand,
  SkeletonBlock,
  StatusLine,
  WindowSpan,
} from "@syn/ui";
import { formatClock } from "@syn/utils";

import { DAY_LIST_COPY } from "@/components/day-list";
import { ItemSheet } from "@/components/item-sheet";
import { useNow } from "@/lib/hooks/use-now";
import { useOnline } from "@/lib/hooks/use-online";
import { SCROLL_TO_NOW_EVENT } from "@/lib/hooks/use-scroll-memory";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { SCHEDULE_COPY as COPY } from "./copy";
import { buildLayout, type PxPerHour } from "./layout";
import { ShiftSheet } from "./shift-sheet";

type DayView = RouterOutputs["day"]["get"];

/**
 * SC-01 — the day against an axis.
 *
 * IT MUTATES NOTHING. No drag, no long-press, no zoom, no *Day Complete*
 * (Epic 2 §12 calls 4 and 5). Everything that changes the day happens in the
 * sheets this opens, which are the same sheets the List opens — so there is
 * one place a change can be made and one set of rules about it.
 *
 * IT SHARES THE LIST'S QUERY. Two canvases over one `day.get`, so the two tabs
 * cannot disagree about what is on the day, and switching between them costs
 * no request.
 *
 * THE OPACITY COMES FROM THE DERIVED STATE, NEVER FROM THE CANVAS. A block
 * above the now line is faded because its state says `passed`, which is the
 * same reason its row in the List is faded. A rule here that dimmed everything
 * above a line would disagree with the List the moment a window was still
 * open.
 *
 * NOTHING ANIMATES (official spec §9.6). The now line moves because the minute
 * ticked and the component re-rendered.
 */
export function ScheduleCanvas({
  dateKey,
  initial,
}: {
  dateKey: string;
  initial: DayView;
}) {
  const now = useNow();
  const online = useOnline();

  const query = trpc.day.get.useQuery({ date: dateKey }, { initialData: initial });
  const day = query.data ?? initial;

  const [openItemId, setOpenItemId] = React.useState<string | null>(null);
  const [openShiftId, setOpenShiftId] = React.useState<string | null>(null);
  const [extendEarlierH, setExtendEarlierH] = React.useState(0);
  const [extendLaterH, setExtendLaterH] = React.useState(0);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const nowRef = React.useRef<HTMLDivElement>(null);

  /**
   * 96 px/hour above 150% text scale — the composite's second density.
   *
   * It is measured rather than guessed: the root font size is what a browser's
   * text-scale setting actually changes, and a media query cannot see it.
   */
  const [pxPerHour, setPxPerHour] = React.useState<PxPerHour>(64);
  React.useEffect(() => {
    const root = Number.parseFloat(
      window.getComputedStyle(document.documentElement).fontSize,
    );
    setPxPerHour(Number.isFinite(root) && root >= 24 ? 96 : 64);
  }, []);

  const items = React.useMemo(
    () => day.parts.flatMap((part) => part.items),
    [day.parts],
  );

  const layout = React.useMemo(
    () =>
      buildLayout(
        {
          timezone: day.timezone,
          items,
          cutByShift: day.cutByShift,
          shifts: day.shifts,
          // Record and plan modes have no now line at all.
          now: day.mode === "live" ? now : null,
          closedAt: day.closedAt,
          extendEarlierH,
          extendLaterH,
        },
        pxPerHour,
      ),
    [day, items, now, pxPerHour, extendEarlierH, extendLaterH],
  );

  /**
   * Put the now line in the upper third, on open and on a tab re-tap.
   *
   * The upper third rather than the centre: what a person wants to see is what
   * is coming, and centring the line spends half the screen on what has
   * already happened.
   */
  const scrollToNow = React.useCallback(() => {
    const container = scrollRef.current;
    const marker = nowRef.current;
    if (container === null) return;

    const target =
      marker === null
        ? 0
        : Math.max(0, marker.offsetTop - container.clientHeight / 3);
    container.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    window.addEventListener(SCROLL_TO_NOW_EVENT, scrollToNow);
    return () => window.removeEventListener(SCROLL_TO_NOW_EVENT, scrollToNow);
  }, [scrollToNow]);

  // Once, on open.
  const scrolled = React.useRef(false);
  React.useEffect(() => {
    if (scrolled.current) return;
    scrolled.current = true;
    scrollToNow();
  }, [scrollToNow]);

  const planMode = day.mode === "plan";
  const isEmpty = items.length === 0 && day.cutByShift.length === 0;

  if (query.isLoading) {
    return (
      <ScreenFrame width="canvas">
        <div className="flex flex-col gap-(--space-2)">
          <SkeletonBlock heightPx={48} />
          <SkeletonBlock heightPx={48} />
          <SkeletonBlock heightPx={48} />
        </div>
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame width="canvas">
      {!online ? <StatusLine variant="offline" placement="inline" /> : null}

      {isEmpty ? (
        // The same doors the List offers — one empty day, one answer to it.
        <EmptyState
          density="page"
          text={DAY_LIST_COPY.nothingPlanned}
          actions={[]}
        />
      ) : (
        <div ref={scrollRef} className="max-h-[70dvh] overflow-y-auto">
          <ScheduleAxis
            startMin={layout.startMin}
            endMin={layout.endMin}
            pxPerHour={pxPerHour}
            timeZone={day.timezone}
            onExtend={(direction) => {
              if (direction === "earlier") setExtendEarlierH((h) => h + 1);
              else setExtendLaterH((h) => h + 1);
            }}
          >
            {layout.spans.map((span) => (
              <WindowSpan
                key={`span-${span.key}`}
                topPx={span.topPx}
                heightPx={span.heightPx}
              />
            ))}

            {/* A ghost is where something WAS planned; it opens the live one. */}
            {layout.ghosts.map((ghost) => (
              <GhostBlock
                key={`ghost-${ghost.item.id}`}
                item={ghost.item}
                topPx={ghost.topPx}
                heightPx={ghost.heightPx}
                onOpen={(item) => setOpenItemId(item.id)}
              />
            ))}

            {layout.blocks.map((block) => (
              <ScheduleBlock
                key={block.item.id}
                item={block.item}
                topPx={block.topPx}
                heightPx={block.heightPx}
                multitask={block.multitask}
                timeZone={day.timezone}
                // Plan mode: a future day is a plan, and its blocks are not
                // buttons. Nothing to open, so nothing pretends to be tappable.
                onOpen={
                  planMode ? () => undefined : (item) => setOpenItemId(item.id)
                }
              />
            ))}

            {layout.bands.map((band) => (
              <ShiftBand
                key={band.id}
                topPx={band.topPx}
                deltaMin={band.deltaMin}
                reasonLabel={band.reasonLabel}
                onOpen={() => setOpenShiftId(band.id)}
              />
            ))}

            {layout.nowTopPx === null ? null : (
              <div
                ref={nowRef}
                style={{ position: "absolute", top: `${layout.nowTopPx}px` }}
                className="inset-x-0"
              >
                <NowLine
                  atMin={0}
                  topPx={0}
                  label={
                    day.closedAt === null
                      ? formatClock(now, day.timezone)
                      : COPY.closed
                  }
                  closed={day.closedAt !== null}
                />
              </div>
            )}
          </ScheduleAxis>
        </div>
      )}

      <ItemSheet
        open={openItemId !== null}
        itemId={openItemId}
        dayKey={dateKey}
        onOpenChange={(next) => {
          if (!next) setOpenItemId(null);
        }}
      />

      <ShiftSheet
        open={openShiftId !== null}
        day={day}
        shiftId={openShiftId}
        onOpenChange={(next) => {
          if (!next) setOpenShiftId(null);
        }}
      />
    </ScreenFrame>
  );
}
