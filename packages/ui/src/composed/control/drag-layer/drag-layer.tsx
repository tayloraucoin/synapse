/**
 * DragLayer — lift, snap, re-stack preview, drop (UX v1.1 §3.11, §6.5,
 * §10.1, §10.2, §10.4).
 *
 * ONE LAYER, TWO SURFACES. The Schedule (DYN-16) and the block editor
 * (DYN-9) both let a person "long-press a block to lift it and drag it";
 * the editor reorders slots, the Schedule moves items in time, and both
 * resize by the bottom edge and open a gap or move a band by a handle. This
 * component owns the GESTURE and the PREVIEW and nothing else.
 *
 * IT OWNS NO DATA AND WRITES NOTHING. It takes the geometry it is laid over
 * (`items`, `blocks`, `pxPerHour`) and emits intents — `move`, `resize`,
 * `move-block`, `reorder` — with snapped minutes. Whether the drop is
 * refused (a pin under it) or needs a dialog (a pin being moved) is the
 * CALLER's answer, handed back as `state`; the layer then draws the return
 * or holds the block. That is what lets one layer serve two screens that
 * know nothing of each other's rows.
 *
 * A PIN NEVER LIFTS (§6.5, R22). Blocks marked `data-pinned` (by
 * `ScheduleBlock`) are ignored on press; the caller's tap handler opens the
 * dialog. The layer emits nothing for them.
 *
 * EVERY DRAG HAS A KEYBOARD EQUIVALENT (§10.4). With a block focused:
 * Alt+↑/↓ moves it by one snap (in the editor, reorders it), Shift+↑/↓
 * resizes it, `m` then a time moves it there, Escape cancels. A polite live
 * region says *Lifted {title}*, *{title} moved to {time}*, *{title} is now
 * {n} min*, and the refusal line. `moveMode` is the long-press fallback: one
 * tap lifts, the next drops.
 *
 * MOTION (§6.5): the lifted ghost is 0.9 opacity with a 1.5px accent border
 * and a 1.02 scale over `--dur-state`; the re-stack preview and the drop
 * settle in the same time. Reduced motion: no scale, positions jump — the
 * transitions are gated on `usePrefersReducedMotion`, not dropped.
 */
"use client";

import { DRAG_LONG_PRESS_MS, DRAG_SNAP_MIN } from "@syn/constants";
import type { DragState } from "@syn/types";
import * as React from "react";

import { usePrefersReducedMotion } from "../../../hooks/use-prefers-reduced-motion";
import { cn } from "../../../lib/cn";
import { Input } from "../../../primitives/control/input";
import { Text } from "../../../primitives/typography/text";
import { SCHEDULE_GUTTER_PX } from "../../display/schedule-axis";
import { StatusLine } from "../../feedback/status-line";
import { DRAG_LAYER_COPY } from "./copy";

export type DragIntent =
  | { kind: "move"; id: string; toMin: number }
  | { kind: "resize"; id: string; durationMin: number }
  | { kind: "move-block"; blockId: string; deltaMin: number }
  | { kind: "reorder"; id: string; toIndex: number };

export interface DragLayerItem {
  id: string;
  title: string;
  /** Minutes from midnight of the day (or from the template's anchor). */
  startMin: number;
  durationMin: number;
  pinned: boolean;
  resizable: boolean;
  blockId: string | null;
}

export interface DragLayerBlock {
  id: string;
  name: string;
  startMin: number;
  endMin: number;
  draggable: boolean;
}

export interface DragLayerProps {
  pxPerHour: number;
  /** The minute at the top of the axis; geometry is measured from it. */
  axisStartMin: number;
  /** The axis's hour-label column; the ghost and the preview start after it. */
  gutterPx?: number;
  snapMin?: number;
  longPressMs?: number;
  items: ReadonlyArray<DragLayerItem>;
  blocks?: ReadonlyArray<DragLayerBlock>;
  /** The caller's answer to the last intent. */
  state: DragState;
  /** *Fixed things don't move by drag.* — shown and announced under `refused`. */
  refusedMessage?: string;
  onIntent: (intent: DragIntent) => void;
  onLift?: (id: string) => void;
  onCancel?: () => void;
  /** The long-press fallback (§10.4): a tap lifts, the next tap drops. */
  moveMode?: boolean;
  /** The block editor: Alt+arrows reorder rather than move in time. */
  editor?: boolean;
  /** The day is a record or the drag is off; the layer draws nothing and listens to nothing. */
  disabled?: boolean;
  formatTime: (minutes: number) => string;
  children: React.ReactNode;
  className?: string;
}

type Drag = {
  kind: "item" | "resize" | "block";
  id: string;
  startY: number;
  deltaMin: number;
  lifted: boolean;
  /** Move mode: the first up after the lift keeps it lifted; the next drops. */
  taps: number;
};

/** Movement past this before the lift is a scroll, not a drag. */
const SCROLL_TOLERANCE_PX = 8;

function snapTo(minutes: number, snap: number): number {
  return Math.round(minutes / snap) * snap;
}

function parseClock(text: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 47 || minute > 59) return null;
  return hour * 60 + minute;
}

export function DragLayer({
  pxPerHour,
  axisStartMin,
  gutterPx = SCHEDULE_GUTTER_PX,
  snapMin = DRAG_SNAP_MIN,
  longPressMs = DRAG_LONG_PRESS_MS,
  items,
  blocks = [],
  state,
  refusedMessage,
  onIntent,
  onLift,
  onCancel,
  moveMode = false,
  editor = false,
  disabled = false,
  formatTime,
  children,
  className,
}: DragLayerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pressTimer = React.useRef<number | null>(null);
  const [drag, setDrag] = React.useState<Drag | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const [timeEntry, setTimeEntry] = React.useState<{ id: string; value: string } | null>(null);

  const itemById = React.useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const blockById = React.useMemo(() => new Map(blocks.map((block) => [block.id, block])), [blocks]);
  const pxPerMin = pxPerHour / 60;
  const topOf = (minutes: number): number => (minutes - axisStartMin) * pxPerMin;

  const announce = React.useCallback((text: string) => {
    // Clear then set, so the same sentence twice is read twice.
    setAnnouncement("");
    window.requestAnimationFrame(() => setAnnouncement(text));
  }, []);

  React.useEffect(() => {
    if (state === "refused" && refusedMessage) announce(refusedMessage);
  }, [state, refusedMessage, announce]);

  const clearPress = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const cancel = React.useCallback(() => {
    clearPress();
    setDrag(null);
    setTimeEntry(null);
    onCancel?.();
  }, [onCancel]);

  /* ---------------------------------------------------------- pointer -- */

  const lift = (next: Drag, title: string) => {
    setDrag({ ...next, lifted: true });
    announce(DRAG_LAYER_COPY.lifted(title));
    if (next.kind === "item") onLift?.(next.id);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    const target = event.target as HTMLElement;

    const resizeHandle = target.closest<HTMLElement>("[data-resize-handle]");
    const blockHandle = target.closest<HTMLElement>("[data-block-handle]");
    const block = target.closest<HTMLElement>("[data-schedule-block]");

    let next: Drag | null = null;
    let title = "";

    if (resizeHandle?.dataset.itemId) {
      const item = itemById.get(resizeHandle.dataset.itemId);
      if (!item || !item.resizable) return;
      next = { kind: "resize", id: item.id, startY: event.clientY, deltaMin: 0, lifted: false, taps: 0 };
      title = item.title;
    } else if (blockHandle?.dataset.blockId) {
      const band = blockById.get(blockHandle.dataset.blockId);
      if (!band || !band.draggable) return;
      next = { kind: "block", id: band.id, startY: event.clientY, deltaMin: 0, lifted: false, taps: 0 };
      title = band.name;
    } else if (block?.dataset.itemId && block.dataset.draggable === "true") {
      // A pin never lifts (§6.5); the caller's tap handler asks instead.
      if (block.dataset.pinned === "true") return;
      const item = itemById.get(block.dataset.itemId);
      if (!item || item.pinned) return;
      next = { kind: "item", id: item.id, startY: event.clientY, deltaMin: 0, lifted: false, taps: 0 };
      title = item.title;
    }
    if (next === null) return;

    // Move mode: a tap lifts; the next tap (below, on up) drops.
    if (moveMode && drag?.lifted && drag.id === next.id) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag(next);

    // A mouse lifts on drag start; a finger holds `longPressMs` (§6.5).
    const immediate = event.pointerType === "mouse" || moveMode || next.kind !== "item";
    if (immediate) {
      lift(next, title);
      return;
    }
    const pending = next;
    pressTimer.current = window.setTimeout(() => {
      pressTimer.current = null;
      lift(pending, title);
    }, longPressMs);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag === null) return;
    const deltaPx = event.clientY - drag.startY;
    if (!drag.lifted) {
      // Moved before the press matured: a scroll, not a lift.
      if (Math.abs(deltaPx) > SCROLL_TOLERANCE_PX && !moveMode) cancel();
      return;
    }
    const deltaMin = snapTo(deltaPx / pxPerMin, snapMin);
    if (deltaMin !== drag.deltaMin) setDrag({ ...drag, deltaMin });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag === null) return;
    clearPress();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!drag.lifted) {
      setDrag(null);
      return;
    }

    // Move mode (§10.4): the up that ends the lifting tap keeps the block
    // lifted; the next tap — or a move — drops it.
    if (moveMode && drag.taps === 0 && drag.deltaMin === 0 && event.type !== "pointercancel") {
      setDrag({ ...drag, taps: 1 });
      return;
    }
    if (moveMode && drag.taps === 1) {
      // The second tap's place is the destination.
      const deltaMin = snapTo((event.clientY - drag.startY) / pxPerMin, snapMin);
      drop({ ...drag, deltaMin });
      return;
    }

    drop(drag);
  };

  const drop = (current: Drag) => {
    setDrag(null);
    if (current.kind === "item") {
      const item = itemById.get(current.id);
      if (!item) return;
      // A pointer drop snaps the TIME to five (§6.5: 8:07 lands at 8:05); the
      // keyboard steps by five from wherever the item is.
      const toMin = Math.max(axisStartMin, snapTo(item.startMin + current.deltaMin, snapMin));
      if (editor) {
        const order = siblingsOf(item);
        const index = Math.max(0, Math.min(order.length - 1, indexAt(order, item, toMin)));
        onIntent({ kind: "reorder", id: item.id, toIndex: index });
        announce(DRAG_LAYER_COPY.reordered(item.title, index + 1));
      } else {
        onIntent({ kind: "move", id: item.id, toMin });
        announce(DRAG_LAYER_COPY.movedTo(item.title, formatTime(toMin)));
      }
      return;
    }
    if (current.kind === "resize") {
      const item = itemById.get(current.id);
      if (!item) return;
      const durationMin = Math.max(snapMin, item.durationMin + current.deltaMin);
      onIntent({ kind: "resize", id: item.id, durationMin });
      announce(DRAG_LAYER_COPY.resized(item.title, durationMin));
      return;
    }
    const band = blockById.get(current.id);
    if (!band || current.deltaMin === 0) return;
    onIntent({ kind: "move-block", blockId: band.id, deltaMin: current.deltaMin });
    announce(DRAG_LAYER_COPY.blockMoved(band.name, formatTime(band.startMin + current.deltaMin)));
  };

  /* --------------------------------------------------------- keyboard -- */

  const siblingsOf = React.useCallback(
    (item: DragLayerItem): DragLayerItem[] =>
      items
        .filter((other) => other.blockId === item.blockId && !other.pinned)
        .sort((a, b) => a.startMin - b.startMin),
    [items],
  );

  const indexAt = (order: DragLayerItem[], item: DragLayerItem, toMin: number): number => {
    const others = order.filter((other) => other.id !== item.id);
    let index = 0;
    for (const other of others) {
      if (other.startMin < toMin) index += 1;
    }
    return index;
  };

  const focusedItem = (): DragLayerItem | null => {
    const active = document.activeElement as HTMLElement | null;
    const block = active?.closest<HTMLElement>("[data-item-id]");
    const id = block?.dataset.itemId;
    return id === undefined ? null : (itemById.get(id) ?? null);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Escape") {
      if (drag !== null || timeEntry !== null) {
        event.preventDefault();
        cancel();
      }
      return;
    }
    if (timeEntry !== null) return;

    const item = focusedItem();
    if (item === null) return;
    const up = event.key === "ArrowUp";
    const down = event.key === "ArrowDown";

    if (event.altKey && (up || down) && !item.pinned) {
      event.preventDefault();
      const step = up ? -snapMin : snapMin;
      if (editor) {
        const order = siblingsOf(item);
        const from = order.findIndex((other) => other.id === item.id);
        const toIndex = Math.max(0, Math.min(order.length - 1, from + (up ? -1 : 1)));
        if (toIndex === from) return;
        onIntent({ kind: "reorder", id: item.id, toIndex });
        announce(DRAG_LAYER_COPY.reordered(item.title, toIndex + 1));
      } else {
        const toMin = Math.max(axisStartMin, item.startMin + step);
        onIntent({ kind: "move", id: item.id, toMin });
        announce(DRAG_LAYER_COPY.movedTo(item.title, formatTime(toMin)));
      }
      return;
    }

    if (event.shiftKey && (up || down) && item.resizable) {
      event.preventDefault();
      const durationMin = Math.max(snapMin, item.durationMin + (up ? -snapMin : snapMin));
      onIntent({ kind: "resize", id: item.id, durationMin });
      announce(DRAG_LAYER_COPY.resized(item.title, durationMin));
      return;
    }

    if (event.key === "m" && !event.metaKey && !event.ctrlKey && !item.pinned && !editor) {
      event.preventDefault();
      setTimeEntry({ id: item.id, value: "" });
    }
  };

  const submitTimeEntry = () => {
    if (timeEntry === null) return;
    const item = itemById.get(timeEntry.id);
    const minutes = parseClock(timeEntry.value);
    setTimeEntry(null);
    if (!item || minutes === null) return;
    const toMin = snapTo(minutes, snapMin);
    onIntent({ kind: "move", id: item.id, toMin });
    announce(DRAG_LAYER_COPY.movedTo(item.title, formatTime(toMin)));
  };

  /* ---------------------------------------------------------- preview -- */

  const preview = React.useMemo(() => {
    if (drag === null || !drag.lifted) return null;

    if (drag.kind === "item") {
      const item = itemById.get(drag.id);
      if (!item) return null;
      const toMin = Math.max(axisStartMin, snapTo(item.startMin + drag.deltaMin, snapMin));
      // The displaced re-stack beneath the moved item: none overlap.
      const displaced: Array<{ id: string; title: string; startMin: number; durationMin: number }> = [];
      let cursor = toMin + item.durationMin;
      for (const other of siblingsOf(item)) {
        if (other.id === item.id) continue;
        if (other.startMin + other.durationMin <= toMin) continue;
        if (other.startMin >= cursor) break;
        const startMin = Math.max(other.startMin, cursor);
        if (startMin !== other.startMin) displaced.push({ ...other, startMin });
        cursor = startMin + other.durationMin;
      }
      return {
        ghost: { title: item.title, startMin: toMin, durationMin: item.durationMin, label: formatTime(toMin) },
        displaced,
      };
    }

    if (drag.kind === "resize") {
      const item = itemById.get(drag.id);
      if (!item) return null;
      const durationMin = Math.max(snapMin, item.durationMin + drag.deltaMin);
      return {
        ghost: { title: item.title, startMin: item.startMin, durationMin, label: `${durationMin} min` },
        displaced: [],
      };
    }

    const band = blockById.get(drag.id);
    if (!band) return null;
    return {
      ghost: {
        title: band.name,
        startMin: band.startMin + drag.deltaMin,
        durationMin: band.endMin - band.startMin,
        label: formatTime(band.startMin + drag.deltaMin),
      },
      displaced: [],
    };
  }, [drag, itemById, blockById, siblingsOf, axisStartMin, snapMin, formatTime]);

  const motion = reducedMotion
    ? ""
    : "transition-[top,height,transform] duration-(--dur-state) ease-(--ease-settle)";

  return (
    <div
      ref={rootRef}
      data-drag-layer
      data-drag-state={state}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn("relative", className)}
    >
      {children}

      {/* The lifted ghost and the re-stack preview, over the axis. */}
      {preview === null ? null : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
          {preview.displaced.map((entry) => (
            <div
              key={entry.id}
              style={{
                top: `${topOf(entry.startMin)}px`,
                height: `${entry.durationMin * pxPerMin}px`,
                insetInlineStart: `${gutterPx}px`,
              }}
              className={cn(
                "border-hairline absolute end-0 rounded-(--radius) border border-dashed bg-transparent",
                motion,
              )}
            />
          ))}
          <div
            style={{
              top: `${topOf(preview.ghost.startMin)}px`,
              height: `${preview.ghost.durationMin * pxPerMin}px`,
              insetInlineStart: `${gutterPx}px`,
            }}
            className={cn(
              "border-accent-mark bg-surface absolute end-0 rounded-(--radius) border-[1.5px] px-(--space-2) py-(--space-1) opacity-90",
              !reducedMotion && "scale-[1.02]",
              motion,
            )}
          >
            <Text as="span" variant="caption" weight={500} truncate>
              {preview.ghost.title}
            </Text>
            <Text as="span" variant="caption" tone="secondary" className="ms-(--space-2) tabular-nums">
              {preview.ghost.label}
            </Text>
          </div>
        </div>
      )}

      {/* `m` then a time (§10.4): a small labelled entry; Enter moves, Escape leaves. */}
      {timeEntry === null ? null : (
        <div className="bg-paper border-hairline absolute end-(--space-2) top-(--space-2) z-30 rounded-(--radius) border p-(--space-2) shadow-sm">
          <Input
            autoFocus
            label={DRAG_LAYER_COPY.timeEntryLabel(itemById.get(timeEntry.id)?.title ?? "")}
            placeholder={DRAG_LAYER_COPY.timeEntryPlaceholder}
            value={timeEntry.value}
            inputMode="numeric"
            onChange={(event) => setTimeEntry({ ...timeEntry, value: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitTimeEntry();
              }
            }}
            classes={{ root: "w-40" }}
          />
        </div>
      )}

      {state === "refused" && refusedMessage ? (
        <StatusLine variant="syncing" text={refusedMessage} placement="inline" className="mt-(--space-2)" />
      ) : null}

      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
