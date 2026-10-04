"use client";

import * as React from "react";

import type { WorkflowColumnView, WorkflowTaskView } from "@syn/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  TaskRow,
  TextDisclosureButton,
} from "@syn/ui";
import { MoreVertical } from "lucide-react";

import { trpc } from "@/lib/trpc/client";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";
import { MENU_TRIGGER } from "./task-menu";

/**
 * *Closed earlier* (UX §3.8) — the view's tasks closed before today, folded
 * at the foot, newest first. Each can be opened or moved back to any column.
 *
 * NO TALLY IN ITS LABEL. `ArchivedSection` prints how many rows it holds;
 * this surface counts nothing (W15), so the section is the same disclosure
 * parts with §7's one word. It renders only when the first page has a task —
 * one cheap read on mount — so an empty section is never offered.
 */
export function ClosedEarlier({
  viewId,
  columns,
  groupNameOf,
  now,
  online,
  onOpen,
  onMoveTo,
}: {
  viewId: string;
  columns: readonly WorkflowColumnView[];
  groupNameOf: (groupId: string | null) => string | null;
  now: Date;
  online: boolean;
  onOpen: (task: WorkflowTaskView) => void;
  onMoveTo: (task: WorkflowTaskView, columnId: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const query = trpc.workflow.task.listClosed.useQuery({ viewId });
  const tasks = query.data?.tasks ?? [];
  if (tasks.length === 0) return null;

  const columnName = (columnId: string) => columns.find((column) => column.id === columnId)?.name ?? "";

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="pt-(--space-4)">
      <CollapsibleTrigger asChild>
        <TextDisclosureButton expanded={open} collapsedLabel={COPY.closedEarlier} expandedLabel={COPY.closedEarlier} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul aria-label={COPY.closedEarlier} className="m-0 flex list-none flex-col p-0">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              variant="closed"
              now={now}
              groupName={groupNameOf(task.groupId)}
              columnName={columnName(task.columnId)}
              onOpen={() => onOpen(task)}
              menu={
                <DropdownMenu>
                  <DropdownMenuTrigger aria-label={COPY.taskOptions(task.title)} className={MENU_TRIGGER}>
                    <MoreVertical className="size-4" aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onSelect={() => onOpen(task)}>{COPY.open}</DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger disabled={!online}>{COPY.moveTo}</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {columns.map((column) => (
                          <DropdownMenuItem key={column.id} onSelect={() => onMoveTo(task, column.id)}>
                            {column.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
