"use client";

import type * as React from "react";
import { cn, useDragSource, useDropTarget } from "@syn/ui";

/**
 * A work row and a tier as DragToPlace's source and targets at the desk
 * (USE-71): a row lifts with the mouse and lands before another row, or at
 * a tier's end, the place shown by a line in the accent mark. The source
 * fades where it was. Outside a DragToPlace both render their children as
 * they are, so the phone's tree carries no drag.
 *
 * Drag is the desk's shortcut: the keyboard path is the work menu's Move to
 * tier (USE-70), so neither takes a role or a tab stop.
 */
export function RowDrag({
  dragId,
  dropId,
  label,
  disabled = false,
  children,
}: {
  dragId: string;
  dropId: string;
  /** What the pointer carries: the row's title. */
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const source = useDragSource(dragId, label, { disabled });
  const target = useDropTarget(dropId, { disabled });
  const over = target.isOver && target.carriedId !== dragId;
  return (
    <div
      ref={target.ref}
      {...source.props}
      className={cn("relative", source.isDragging && "opacity-50")}
    >
      {over ? <DropLine edge="top" /> : null}
      {children}
    </div>
  );
}

export function TierDrop({
  dropId,
  disabled = false,
  children,
}: {
  dropId: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const target = useDropTarget(dropId, { disabled });
  return (
    <div ref={target.ref} className="relative">
      {children}
      {target.isOver ? <DropLine edge="bottom" /> : null}
    </div>
  );
}

function DropLine({ edge }: { edge: "top" | "bottom" }) {
  return (
    <span
      aria-hidden="true"
      data-drop-line={edge}
      className={cn(
        "pointer-events-none absolute inset-x-0 z-10 h-0.5 rounded-full bg-accent-mark",
        edge === "top" ? "-top-px" : "-bottom-px",
      )}
    />
  );
}
