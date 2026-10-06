/**
 * SortableList — a vertical list reordered by handle, pointer and keyboard
 * (UX v1.2 §4, §10.2, §10.4; TD-16; RUN-7).
 *
 * The journal's prompts, a routine's steps, a plan's rows: anywhere the
 * person puts things in an order. dnd-kit does the geometry — and dnd-kit is
 * `@syn/ui`'s alone (`RESTRICTED_EXTERNAL`); a screen sees `items`,
 * `renderItem` and `onReorder(ids)` and nothing of the engine.
 *
 * SHARES NO CODE WITH `DragLayer`. The Schedule's layer moves things in time
 * on a grid; this moves rows in a list. They share a lift GRAMMAR — 0.9
 * opacity, a 1.5px `border-accent-mark` — by the two classes being typed
 * here again, not by an import: two composites that shared a helper would
 * one day share a bug.
 *
 * THE HANDLE IS THE ONLY LIFT. A 44px `GripVertical` labelled *Reorder
 * {title}* carries the pointer and keyboard sensors; the rest of the row is
 * the caller's and keeps its own controls. Touch lifts after 300ms so a
 * scroll that starts on a handle scrolls; the pointer needs 6px so a tap on
 * the handle is a tap.
 *
 * KEYBOARD, TWO WAYS. dnd-kit's own: Space lifts, arrows move, Space drops,
 * Escape cancels. And the direct path (§10.4): Alt+↑ / Alt+↓ on the handle
 * moves the row one step at once and announces it. A polite live region
 * says *Lifted {title}* and *{title} moved to position n*.
 *
 * MOTION: 120ms settle; under reduced motion the rows jump.
 */
"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { usePrefersReducedMotion } from "../../../hooks/use-prefers-reduced-motion";
import { SORTABLE_LIST_COPY } from "./copy";

export interface SortableItem {
  id: string;
  /** Read by the handle's label and the live region. */
  title: string;
}

export interface SortableHandleProps {
  ref: (node: HTMLElement | null) => void;
  "aria-label": string;
  "aria-describedby"?: string;
  "aria-pressed"?: boolean;
  "aria-roledescription"?: string;
  "aria-disabled"?: boolean;
  tabIndex: number;
  role: string;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onPointerDown?: (event: React.PointerEvent) => void;
  className: string;
  children: React.ReactNode;
}

export interface SortableRenderState {
  /** Spread onto a `button` — or use `SortableHandle`, which already does. */
  handleProps: SortableHandleProps;
  isLifted: boolean;
  index: number;
}

export interface SortableListProps<T extends SortableItem> {
  items: readonly T[];
  renderItem: (item: T, state: SortableRenderState) => React.ReactNode;
  /** The new order, every id, after a drop or an Alt+arrow. */
  onReorder: (ids: string[]) => void;
  /** The list's accessible name. */
  label?: string;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
}

/** The handle as a component, for the common case. */
export function SortableHandle(props: SortableHandleProps) {
  const { ref, children, ...rest } = props;
  return (
    <button type="button" ref={ref} {...rest}>
      {children}
    </button>
  );
}

const HANDLE_CLASS = cn(
  "inline-flex size-(--target) shrink-0 cursor-grab touch-none items-center justify-center rounded-(--radius)",
  "text-text-secondary hover:text-ink active:cursor-grabbing",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
);

function SortableRow<T extends SortableItem>({
  item,
  index,
  count,
  renderItem,
  onStep,
  reducedMotion,
  disabled,
  className,
}: {
  item: T;
  index: number;
  count: number;
  renderItem: SortableListProps<T>["renderItem"];
  onStep: (id: string, direction: -1 | 1) => void;
  reducedMotion: boolean;
  disabled: boolean;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: reducedMotion ? undefined : transition,
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    // The direct path (§10.4): Alt+arrow moves one step, no lift.
    if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      event.stopPropagation();
      onStep(item.id, event.key === "ArrowUp" ? -1 : 1);
      return;
    }
    listeners?.onKeyDown?.(event);
  };

  const handleProps: SortableHandleProps = {
    ref: setActivatorNodeRef,
    ...attributes,
    "aria-label": SORTABLE_LIST_COPY.handle(item.title),
    "aria-disabled": disabled || count < 2 ? true : undefined,
    tabIndex: disabled ? -1 : 0,
    role: "button",
    onKeyDown,
    onPointerDown: listeners?.onPointerDown as SortableHandleProps["onPointerDown"],
    className: cn(HANDLE_CLASS, (disabled || count < 2) && "cursor-default opacity-40"),
    children: <GripVertical className="size-5" aria-hidden="true" />,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-lifted={isDragging || undefined}
      className={cn(
        "flex items-center gap-(--space-2) rounded-(--radius) border border-transparent",
        !reducedMotion && "motion-safe:transition-[opacity,transform] motion-safe:duration-[120ms]",
        // The lift grammar, typed here — not imported from the Schedule's layer.
        isDragging && "relative z-10 border-[1.5px] border-accent-mark opacity-90",
        className,
      )}
    >
      {renderItem(item, { handleProps, isLifted: isDragging, index })}
    </li>
  );
}

export function SortableList<T extends SortableItem>({
  items,
  renderItem,
  onReorder,
  label,
  disabled = false,
  className,
  itemClassName,
}: SortableListProps<T>) {
  const reducedMotion = usePrefersReducedMotion();
  const [announcement, setAnnouncement] = React.useState("");
  const ids = React.useMemo(() => items.map((item) => item.id), [items]);
  const titleOf = React.useCallback(
    (id: string | number) => items.find((item) => item.id === String(id))?.title ?? "",
    [items],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const announce = (text: string) => {
    // Re-set so the same sentence twice is read twice.
    setAnnouncement("");
    window.setTimeout(() => setAnnouncement(text), 0);
  };

  const onDragStart = (event: DragStartEvent) => {
    announce(SORTABLE_LIST_COPY.lifted(titleOf(event.active.id)));
  };

  const onDragOver = (event: DragOverEvent) => {
    if (!event.over) return;
    const position = ids.indexOf(String(event.over.id)) + 1;
    if (position > 0) announce(SORTABLE_LIST_COPY.movedTo(titleOf(event.active.id), position));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const title = titleOf(active.id);
    if (!over || active.id === over.id) {
      announce(SORTABLE_LIST_COPY.dropped(title));
      return;
    }
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onReorder(arrayMove(ids, from, to));
    announce(SORTABLE_LIST_COPY.movedTo(title, to + 1));
  };

  const onDragCancel = (event: DragCancelEvent) => {
    announce(SORTABLE_LIST_COPY.cancelled(titleOf(event.active.id)));
  };

  const step = (id: string, direction: -1 | 1) => {
    const from = ids.indexOf(id);
    const to = from + direction;
    if (from === -1 || to < 0 || to >= ids.length) return;
    onReorder(arrayMove(ids, from, to));
    announce(SORTABLE_LIST_COPY.movedTo(titleOf(id), to + 1));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      // The live region below is the one that speaks; dnd-kit's own stays quiet.
      accessibility={{ announcements: QUIET, screenReaderInstructions: { draggable: "" } }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ol
          aria-label={label}
          className={cn("m-0 flex list-none flex-col gap-(--space-1) p-0", className)}
        >
          {items.map((item, index) => (
            <SortableRow
              key={item.id}
              item={item}
              index={index}
              count={items.length}
              renderItem={renderItem}
              onStep={step}
              reducedMotion={reducedMotion}
              disabled={disabled}
              className={itemClassName}
            />
          ))}
        </ol>
      </SortableContext>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </DndContext>
  );
}

const QUIET = {
  onDragStart: () => "",
  onDragOver: () => "",
  onDragEnd: () => "",
  onDragCancel: () => "",
};
