"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";

import {
  BlockBand,
  ConfirmDialog,
  DragLayer,
  EmptyState,
  GapBand,
  GhostBlock,
  NowLine,
  ScheduleAxis,
  ScheduleBlock,
  ScreenFrame,
  ShiftBand,
  SkeletonBlock,
  StatusLine,
  Text,
  WindowSpan,
  type DragIntent,
  type DragLayerBlock,
  type DragLayerItem,
} from "@syn/ui";
import type { DayItemView, DragState } from "@syn/types";
import { formatClock, formatClockFromMinutes } from "@syn/utils";

import { useRovingFocus } from "@/lib/hooks/use-roving-focus";

import { AdjustSheet } from "@/components/adjust-sheet";
import { DAY_LIST_COPY } from "@/components/day-list";
import { ItemSheet } from "@/components/item-sheet";
import { useNow } from "@/lib/hooks/use-now";
import { useOnline } from "@/lib/hooks/use-online";
import { SCROLL_TO_NOW_EVENT } from "@/lib/hooks/use-scroll-memory";
import { SCHEDULE_MOVE_MODE_PARAM, SCHEDULE_MOVE_MODE_VALUE, todayRoute } from "@/lib/routes";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { SCHEDULE_COPY as COPY } from "./copy";
import { buildLayout, minutesInZone, type PxPerHour } from "./layout";
import { ShiftRecordSheet } from "./shift-sheet";

type DayView = RouterOutputs["day"]["get"];

/**
 * SC-01, editable — UX v1.1 §6.5 (DYN-16).
 *
 * THE DAY IS ITS BLOCKS. A `BlockBand` behind each block's items, the
 * block's name in the gutter; the work band tallest, split around training;
 * slack between bands labelled in the gutter. The work block is a container
 * — the focus as its title, the fixtures inside it as pins.
 *
 * THE LAYER OWNS THE GESTURE; THIS OWNS THE ANSWER. `DragLayer` lifts,
 * snaps, previews and drops, and emits an intent; the canvas turns it into
 * DYN-6's one write — `item.move`, `item.editToday`, `day.moveBlock` — and
 * hands back the state the layer draws. A pin never lifts: its drag is the
 * layer's `onPinnedDrop`, and the answer is a `ConfirmDialog` (R22); the
 * service refuses without `confirmed` regardless, so the dialog is the
 * second guard. The morning band goes to Adjust, because moving the morning
 * is a decision with a reason (§6.6).
 *
 * THE RECORD IS ANNOTATED, NEVER REWRITTEN. A drag moves `scheduled_start`
 * and nothing else; the ghost appears once the original time has passed
 * (`layout.ts`); the service writes `original_scheduled_start` never.
 *
 * IT SHARES THE LIST'S QUERY. Two canvases over one `day.get`, so the two
 * tabs cannot disagree about what is on the day.
 *
 * THE OPACITY COMES FROM THE DERIVED STATE, NEVER FROM THE CANVAS. A block
 * above the now line is faded because its state says `passed`, which is the
 * same reason its row in the List is faded.
 *
 * RECORD MODE HAS NO LAYER (§6.5): a closed day is a record. PLAN MODE has
 * the layer and no ghosts and no now line. MOVE MODE (`?mode=move`, §10.4)
 * is the long-press fallback: a tap lifts, a tap drops.
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
  const searchParams = useSearchParams();
  const moveMode = searchParams.get(SCHEDULE_MOVE_MODE_PARAM) === SCHEDULE_MOVE_MODE_VALUE;

  const utils = trpc.useUtils();
  const query = trpc.day.get.useQuery({ date: dateKey }, { initialData: initial });
  const day = query.data ?? initial;

  const [openItemId, setOpenItemId] = React.useState<string | null>(null);
  const [openShiftId, setOpenShiftId] = React.useState<string | null>(null);
  const [extendEarlierH, setExtendEarlierH] = React.useState(0);
  const [extendLaterH, setExtendLaterH] = React.useState(0);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  /*
   * SYS-4 — the same arrow navigation the List has, over blocks instead of
   * rows. The scroll container is the focus container, and DOM order is time
   * order here too because the canvas renders in schedule order.
   */
  useRovingFocus(scrollRef, { selector: "[data-item-row]" });

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

  const layout = React.useMemo(
    () =>
      buildLayout(
        {
          timezone: day.timezone,
          mode: day.mode,
          blocks: day.blocks,
          unblocked: day.unblocked,
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
    [day, now, pxPerHour, extendEarlierH, extendLaterH],
  );

  const drag = useScheduleDrag(dateKey, day, layout.startMin);

  /**
   * Put the now line in the upper third, on open and on a tab re-tap.
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
  const recordMode = day.mode === "record";
  const unconfirmed = day.mode === "live" && day.confirmedAt === null;
  const hasItems = layout.blocks.length > 0 || layout.containers.length > 0;
  const isEmpty = !hasItems && layout.bands.length === 0 && day.cutByShift.length === 0;

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

  const openItem = (item: DayItemView) => {
    // A drop's release is not a tap (the layer captured the pointer).
    if (drag.swallowClick()) return;
    setOpenItemId(item.id);
  };

  const axis = (
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
      {/* The bands first: they sit behind everything (§6.5). */}
      {layout.bands.map((band) => (
        <BlockBand
          key={`band-${band.id}`}
          blockId={band.id}
          kind={band.kind}
          name={band.name}
          topPx={band.topPx}
          heightPx={band.heightPx}
          pooled={band.pooled}
          draggable={!recordMode && band.draggable && online}
        />
      ))}

      {/* Slack: the open span between two bands, labelled in the gutter (§10.1). */}
      {layout.slack.map((gap) => (
        <GapBand
          key={`slack-${gap.key}`}
          label="slack"
          minutes={gap.minutes}
          topPx={gap.topPx}
          heightPx={gap.heightPx}
        />
      ))}

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
          onOpen={openItem}
        />
      ))}

      {/* The work block: the focus as a container, its fixtures inside as pins. */}
      {layout.containers.map((container) => (
        <ScheduleBlock
          key={container.item.id}
          item={container.item}
          container
          topPx={container.topPx}
          heightPx={container.heightPx}
          timeZone={day.timezone}
          onOpen={planMode ? () => undefined : openItem}
          className="z-10"
        >
          {container.children.map((child) => (
            <ScheduleBlock
              key={child.item.id}
              item={child.item}
              topPx={child.topPx}
              heightPx={child.heightPx}
              timeZone={day.timezone}
              pinned
              onOpen={planMode ? () => undefined : openItem}
            />
          ))}
        </ScheduleBlock>
      ))}

      {layout.blocks.map((block) => (
        <ScheduleBlock
          key={block.item.id}
          item={block.item}
          topPx={block.topPx}
          heightPx={block.heightPx}
          multitask={block.multitask}
          timeZone={day.timezone}
          draggable={!recordMode && drag.movable(block.item)}
          resizable={!recordMode && drag.resizable(block.item)}
          // Plan mode: a future day is a plan, and its blocks are not
          // buttons. Nothing to open, so nothing pretends to be tappable.
          onOpen={planMode ? () => undefined : openItem}
          className="z-10"
        />
      ))}

      {layout.shiftBands.map((band) => (
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
  );

  return (
    <ScreenFrame width="canvas">
      {!online ? <StatusLine variant="offline" placement="inline" /> : null}

      {/* §10.1: an unconfirmed today — fixtures and bands only, and the one line. */}
      {unconfirmed ? (
        <Text as="p" variant="secondary" tone="secondary" className="py-(--space-3) text-center">
          <Link href={todayRoute()} className="underline">
            {COPY.setTheDayFirst}
          </Link>
        </Text>
      ) : null}

      {moveMode && !recordMode ? (
        <Text as="p" variant="caption" tone="secondary" className="py-(--space-2)">
          {COPY.moveModeCaption}
        </Text>
      ) : null}

      {drag.error === null ? null : (
        <StatusLine variant="syncing" placement="inline" text={drag.error} />
      )}

      {isEmpty ? (
        // The same doors the List offers — one empty day, one answer to it.
        <EmptyState
          density="page"
          text={DAY_LIST_COPY.nothingPlanned}
          actions={[]}
        />
      ) : (
        <div ref={scrollRef} className="max-h-[70dvh] overflow-y-auto">
          {recordMode ? (
            axis
          ) : (
            <DragLayer
              pxPerHour={pxPerHour}
              axisStartMin={layout.startMin}
              items={drag.layerItems}
              blocks={drag.layerBlocks}
              state={drag.state}
              refusedMessage={COPY.fixedThingsDontMove}
              onIntent={drag.onIntent}
              onLift={drag.onLift}
              onCancel={drag.onCancel}
              onPinnedDrop={drag.onPinnedDrop}
              moveMode={moveMode}
              disabled={!online}
              formatTime={formatClockFromMinutes}
            >
              {axis}
            </DragLayer>
          )}
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

      <ShiftRecordSheet
        open={openShiftId !== null}
        day={day}
        shiftId={openShiftId}
        onOpenChange={(next) => {
          if (!next) setOpenShiftId(null);
        }}
        onUndone={() => {
          setOpenShiftId(null);
          void utils.day.get.invalidate({ date: dateKey });
        }}
      />

      {/* R22: a pin or a fixture moves only through this. */}
      <ConfirmDialog
        open={drag.pinAsk !== null}
        onOpenChange={(next) => {
          if (!next) drag.answerPin(false);
        }}
        title={
          drag.pinAsk === null
            ? ""
            : COPY.movePinTitle(drag.pinAsk.title, formatClockFromMinutes(drag.pinAsk.toMin))
        }
        confirmLabel={COPY.move}
        cancelLabel={COPY.cancel}
        busy={drag.busy}
        onConfirm={() => drag.answerPin(true)}
        onCancel={() => drag.answerPin(false)}
      />

      {/* §6.5: the morning band's drag is offered as Adjust (§6.6). */}
      <AdjustSheet
        open={drag.adjustDelta !== null}
        onOpenChange={(next) => {
          if (!next) drag.closeAdjust();
        }}
        date={dateKey}
        entry="band-drag"
        bandDragDeltaMin={drag.adjustDelta ?? undefined}
        onApplied={() => void utils.day.get.invalidate({ date: dateKey })}
      />
    </ScreenFrame>
  );
}

/* ---------------------------------------------------------------- drag -- */

type PinAsk = { id: string; title: string; toMin: number };

/**
 * The layer's intents as DYN-6's writes, and the state handed back.
 *
 * `fixed` FROM THE SERVICE IS THE LAYER'S `refused`: the block returns and
 * the one line shows. Anything else is the sheet's error line. A pin's drag
 * is answered by the dialog, and only *Move* sends `confirmed: true`.
 */
function useScheduleDrag(dateKey: string, day: DayView, axisStartMin: number) {
  const utils = trpc.useUtils();
  const move = trpc.item.move.useMutation();
  const editToday = trpc.item.editToday.useMutation();
  const moveBlock = trpc.day.moveBlock.useMutation();

  const [state, setState] = React.useState<DragState>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [pinAsk, setPinAsk] = React.useState<PinAsk | null>(null);
  const [adjustDelta, setAdjustDelta] = React.useState<number | null>(null);
  const dropped = React.useRef(false);

  const zone = day.timezone;
  const items = React.useMemo(
    () => [...day.blocks.flatMap((block) => block.items), ...day.unblocked],
    [day.blocks, day.unblocked],
  );
  const byId = React.useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  /** A row that has not happened, and is not waiting for the morning. */
  const movable = React.useCallback(
    (item: DayItemView): boolean =>
      item.doneAt === null &&
      item.state !== "done" &&
      item.state !== "confirm-later" &&
      item.state !== "not-confirmed" &&
      item.type !== "deep_work" &&
      item.scheduledStart !== null,
    [],
  );
  const resizable = React.useCallback(
    (item: DayItemView): boolean => movable(item) && !item.pinned && item.origin !== "fixture",
    [movable],
  );

  const layerItems = React.useMemo<DragLayerItem[]>(
    () =>
      items
        .filter((item) => item.scheduledStart !== null && item.type !== "deep_work")
        .map((item) => ({
          id: item.id,
          title: item.title,
          startMin: minutesInZone(item.scheduledStart as Date, zone),
          durationMin: item.durationMin ?? 30,
          pinned: item.pinned || item.origin === "fixture" || !movable(item),
          resizable: resizable(item),
          blockId: item.dayBlockId,
        })),
    [items, zone, movable, resizable],
  );

  const layerBlocks = React.useMemo<DragLayerBlock[]>(
    () =>
      day.blocks
        .filter((block) => block.startAt !== null && block.endAt !== null && block.state !== "not_today")
        .map((block) => ({
          id: block.id,
          name: block.name ?? block.kind,
          startMin: minutesInZone(block.startAt as Date, zone),
          endMin: minutesInZone(block.endAt as Date, zone),
          draggable: true,
        })),
    [day.blocks, zone],
  );

  const refresh = React.useCallback(async () => {
    await utils.day.get.invalidate({ date: dateKey });
  }, [utils, dateKey]);

  /** The service's `fixed` refusal is the layer's state; the rest is a line. */
  const fail = React.useCallback((caught: unknown) => {
    const message = caught instanceof Error ? caught.message : String(caught);
    if (message === COPY.fixedThingsDontMove) {
      setState("refused");
      return;
    }
    setState("idle");
    setError(COPY.couldntMove);
  }, []);

  const settle = React.useCallback(async () => {
    setState("dropping");
    await refresh();
    setState("idle");
  }, [refresh]);

  const onIntent = React.useCallback(
    (intent: DragIntent) => {
      dropped.current = true;
      window.setTimeout(() => {
        dropped.current = false;
      }, 0);
      setError(null);

      if (intent.kind === "move") {
        void move
          .mutateAsync({ itemId: intent.id, toMin: Math.max(axisStartMin, intent.toMin) })
          .then(settle, fail);
        return;
      }
      if (intent.kind === "resize") {
        void editToday
          .mutateAsync({ itemId: intent.id, durationMin: intent.durationMin })
          .then(settle, fail);
        return;
      }
      if (intent.kind === "move-block") {
        const block = day.blocks.find((row) => row.id === intent.blockId);
        if (!block) return;
        // The morning is a decision with a reason (§6.5, §6.6).
        if (block.kind === "morning") {
          setState("idle");
          setAdjustDelta(intent.deltaMin);
          return;
        }
        void moveBlock
          .mutateAsync({ blockId: intent.blockId, deltaMin: intent.deltaMin })
          .then(settle, fail);
        return;
      }
      // `reorder` and `gap` are the editor's; the Schedule never sees them.
    },
    [move, editToday, moveBlock, day.blocks, axisStartMin, settle, fail],
  );

  const onPinnedDrop = React.useCallback(
    (id: string, toMin: number) => {
      const item = byId.get(id);
      if (!item) return;
      setState("confirming");
      setPinAsk({ id, title: item.title, toMin });
    },
    [byId],
  );

  const answerPin = React.useCallback(
    (yes: boolean) => {
      const ask = pinAsk;
      setPinAsk(null);
      if (!yes || ask === null) {
        setState("idle");
        return;
      }
      void move
        .mutateAsync({ itemId: ask.id, toMin: ask.toMin, confirmed: true })
        .then(settle, fail);
    },
    [pinAsk, move, settle, fail],
  );

  return {
    state,
    error,
    busy: move.isPending || editToday.isPending || moveBlock.isPending,
    layerItems,
    layerBlocks,
    movable,
    resizable,
    onIntent,
    onLift: () => {
      setError(null);
      setState("lifted");
    },
    onCancel: () => setState("idle"),
    onPinnedDrop,
    pinAsk,
    answerPin,
    adjustDelta,
    closeAdjust: () => setAdjustDelta(null),
    swallowClick: () => dropped.current,
  };
}
