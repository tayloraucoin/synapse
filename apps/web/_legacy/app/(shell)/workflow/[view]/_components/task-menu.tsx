"use client";

import { MoreVertical } from "lucide-react";
import * as React from "react";

import type { WorkflowColumnView, WorkflowViewTab } from "@syn/types";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@syn/ui";
import { cn } from "@syn/ui/cn";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";

/** The trigger, typed as `EllipsesMenu` types it — one look for every row menu. */
export const MENU_TRIGGER = cn(
  "inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius) text-text-secondary outline-none",
  "transition-colors duration-(--dur-state) ease-(--ease-settle)",
  "hover:bg-surface hover:text-ink",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-40",
);

/**
 * The row menu (UX WF-01): *Open* · *Move to* (this view's columns, the
 * current one checked) · *Move to view* (views, then that view's columns) ·
 * *Start* (only in a view with no active column) · *Archive*.
 *
 * Built from the dropdown primitives rather than `EllipsesMenu`, which has no
 * submenu and no checked item; the trigger and its labelling are the same.
 * Every item is reachable by keyboard; nothing here drags (W12).
 */
export function TaskMenu({
  title,
  columnId,
  columns,
  otherViews,
  columnsByView,
  canStart,
  disabled,
  onOpen,
  onMoveTo,
  onMoveToView,
  onStart,
  onArchive,
}: {
  title: string;
  columnId: string;
  columns: readonly WorkflowColumnView[];
  otherViews: readonly WorkflowViewTab[];
  columnsByView: Readonly<Record<string, WorkflowColumnView[]>>;
  canStart: boolean;
  disabled: boolean;
  onOpen: () => void;
  onMoveTo: (columnId: string) => void;
  onMoveToView: (viewId: string, columnId: string) => void;
  onStart: () => void;
  onArchive: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={COPY.taskOptions(title)} className={MENU_TRIGGER}>
        <MoreVertical className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onSelect={onOpen}>{COPY.open}</DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={disabled}>{COPY.moveTo}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.id === columnId}
                onSelect={() => {
                  if (column.id !== columnId) onMoveTo(column.id);
                }}
              >
                {column.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {otherViews.length === 0 ? null : (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={disabled}>{COPY.moveToView}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {otherViews.map((view) => (
                <DropdownMenuSub key={view.id}>
                  <DropdownMenuSubTrigger>{view.name}</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {(columnsByView[view.id] ?? []).map((column) => (
                      <DropdownMenuItem key={column.id} onSelect={() => onMoveToView(view.id, column.id)}>
                        {column.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {canStart ? (
          <DropdownMenuItem disabled={disabled} onSelect={onStart}>
            {COPY.start}
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem disabled={disabled} onSelect={onArchive}>
          {COPY.archive}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
