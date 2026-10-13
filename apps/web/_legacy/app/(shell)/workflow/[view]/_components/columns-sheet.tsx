"use client";

import { MoreVertical } from "lucide-react";
import * as React from "react";

import type { WorkflowColumnRole, WorkflowColumnView, WorkflowTaskView } from "@syn/types";
import {
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  HelperText,
  InlineAddRow,
  Input,
  LargeTargetRow,
  ResponsiveSheet,
  SortableHandle,
  SortableList,
  StatusLine,
  Text,
} from "@syn/ui";
import { WORKFLOW_COLUMNS_MAX, WORKFLOW_NAME_MAX } from "@syn/constants";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";
import { MENU_TRIGGER } from "./task-menu";

const ROLE_WORDS: Record<WorkflowColumnRole, string> = {
  active: COPY.tasksFireHere,
  done: COPY.closedTasksLandHere,
};

/** The view's columns after `role` is set on (or taken off) `columnId` — the server's rule, one column per role. */
function withRole(
  columns: readonly WorkflowColumnView[],
  columnId: string,
  role: WorkflowColumnRole | null,
): WorkflowColumnView[] {
  return columns.map((column) => {
    if (column.id === columnId) return { ...column, role };
    return role !== null && column.role === role ? { ...column, role: null } : column;
  });
}

/**
 * WF-04 — arrange one view's columns (Workflow UX v0.1 §4).
 *
 * THE SHEET EDITS THE BOARD BEHIND IT (FLO-8 ruling): every change is a write
 * and a patch of the board's cache entry; there is no *Save*, and *Done* only
 * closes. A `SortableList` of rows — the handle (and `Alt`+`↑`/`↓`), the name
 * as a field (an emptied field restores the last name on blur), the role as a
 * caption beneath it, and a menu: *Tasks fire here* · *Closed tasks land
 * here* (checkable; choosing one takes it from any other column) · *Remove*.
 * *Add a column* at the foot, absent at five.
 *
 * FIRING NEVER STOPS SILENTLY. A role change that takes *Tasks fire here* off
 * a column holding a firing task — unchecking it, giving it to another
 * column, or giving that column the other role — asks first. Removing the
 * active column while it holds firing tasks says so inside the move dialog:
 * one dialog, not two.
 *
 * THE LAST COLUMN STAYS: its *Remove* is disabled.
 */
export function ColumnsSheet({
  open,
  onClose,
  returnFocusRef,
  online,
  columns,
  tasks,
  error,
  onRename,
  onReorder,
  onAdd,
  onSetRole,
  onRemove,
}: {
  open: boolean;
  onClose: () => void;
  /** *View options* — the item that opened the sheet is gone with its menu. */
  returnFocusRef: React.RefObject<HTMLElement | null>;
  online: boolean;
  columns: readonly WorkflowColumnView[];
  /** The board's tasks, as shown — whether a column holds tasks, or firing ones, needs no request. */
  tasks: readonly WorkflowTaskView[];
  error: string | null;
  onRename: (id: string, name: string) => void;
  onReorder: (ids: string[]) => void;
  onAdd: (name: string) => void;
  onSetRole: (id: string, role: WorkflowColumnRole | null) => void;
  onRemove: (id: string, moveTasksTo?: string) => Promise<"removed" | "has_tasks" | "failed">;
}) {
  const [confirmRole, setConfirmRole] = React.useState<{
    columnId: string;
    role: WorkflowColumnRole | null;
    stops: string;
  } | null>(null);
  const [removing, setRemoving] = React.useState<WorkflowColumnView | null>(null);
  const [destination, setDestination] = React.useState<string | null>(null);

  const firingIn = (columnId: string) =>
    tasks.some((task) => task.columnId === columnId && task.firingStartedAt !== null);

  /** A role checked or unchecked: ask first when it ends firing anywhere. */
  const changeRole = (column: WorkflowColumnView, role: WorkflowColumnRole, checked: boolean) => {
    const next = checked ? role : null;
    const after = withRole(columns, column.id, next);
    const stopping = columns.find(
      (before) =>
        before.role === "active" &&
        after.find((other) => other.id === before.id)?.role !== "active" &&
        firingIn(before.id),
    );
    if (stopping !== undefined) setConfirmRole({ columnId: column.id, role: next, stops: stopping.name });
    else onSetRole(column.id, next);
  };

  const askWhere = (column: WorkflowColumnView) => {
    setDestination(null);
    setRemoving(column);
  };

  const remove = (column: WorkflowColumnView) => {
    if (tasks.some((task) => task.columnId === column.id)) {
      askWhere(column);
      return;
    }
    // The board shows only today's closed tasks; the server knows about older ones.
    void onRemove(column.id).then((result) => {
      if (result === "has_tasks") askWhere(column);
    });
  };

  const items = columns.map((column) => ({ id: column.id, title: column.name, column }));
  const removingFiring = removing !== null && removing.role === "active" && firingIn(removing.id);

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={COPY.columns}
      returnFocusRef={returnFocusRef}
      footer={
        <div className="flex items-center justify-end">
          <Button onClick={onClose}>{COPY.done}</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-(--space-3)">
        {online ? null : <StatusLine variant="offline" placement="inline" />}
        {error === null ? null : <HelperText error>{error}</HelperText>}

        <SortableList
          label={COPY.columns}
          items={items}
          disabled={!online}
          onReorder={onReorder}
          renderItem={(item, { handleProps }) => (
            <div className="flex min-w-0 flex-1 items-start gap-(--space-1) py-(--space-1)">
              <SortableHandle {...handleProps} />
              <div className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
                <ColumnNameField column={item.column} disabled={!online} onRename={onRename} />
                {item.column.role === null ? null : (
                  <Text as="span" variant="caption" tone="secondary">
                    {ROLE_WORDS[item.column.role]}
                  </Text>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={COPY.columnOptions(item.column.name)}
                  disabled={!online}
                  className={MENU_TRIGGER}
                >
                  <MoreVertical className="size-4" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuCheckboxItem
                    checked={item.column.role === "active"}
                    onCheckedChange={(checked) => changeRole(item.column, "active", checked)}
                  >
                    {COPY.tasksFireHere}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={item.column.role === "done"}
                    onCheckedChange={(checked) => changeRole(item.column, "done", checked)}
                  >
                    {COPY.closedTasksLandHere}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuItem disabled={columns.length <= 1} onSelect={() => remove(item.column)}>
                    {COPY.remove}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        />

        {columns.length >= WORKFLOW_COLUMNS_MAX ? null : (
          <InlineAddRow
            label={COPY.addColumn}
            placeholder={COPY.column}
            maxLength={WORKFLOW_NAME_MAX}
            disabled={!online}
            onSubmit={onAdd}
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmRole !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmRole(null);
        }}
        title={confirmRole === null ? "" : COPY.stopFiring(confirmRole.stops)}
        confirmLabel={COPY.continue}
        cancelLabel={COPY.cancel}
        onConfirm={() => {
          if (confirmRole !== null) onSetRole(confirmRole.columnId, confirmRole.role);
          setConfirmRole(null);
        }}
      />

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(next) => {
          if (!next) setRemoving(null);
        }}
        title={COPY.moveItsTasksFirst}
        confirmLabel={COPY.moveAndRemove}
        cancelLabel={COPY.cancel}
        confirmDisabled={destination === null}
        onConfirm={() => {
          if (removing !== null && destination !== null) void onRemove(removing.id, destination);
          setRemoving(null);
        }}
      >
        {removing === null ? null : (
          <div className="flex flex-col gap-(--space-3)">
            <LargeTargetRow
              label={COPY.whereShouldTasksGo(removing.name)}
              layout="stacked"
              value={destination}
              onChange={setDestination}
              options={columns
                .filter((column) => column.id !== removing.id)
                .map((column) => ({ value: column.id, label: column.name }))}
            />
            {removingFiring ? (
              <Text as="p" variant="body">
                {COPY.stopFiring(removing.name)}
              </Text>
            ) : null}
          </div>
        )}
      </ConfirmDialog>
    </ResponsiveSheet>
  );
}

/** A column's name, saved as it changes (blur or `Enter`); emptied, it restores the last name. */
function ColumnNameField({
  column,
  disabled,
  onRename,
}: {
  column: WorkflowColumnView;
  disabled: boolean;
  onRename: (id: string, name: string) => void;
}) {
  const [value, setValue] = React.useState(column.name);
  const focused = React.useRef(false);

  // The server's name wins whenever the person is not typing in this field.
  React.useEffect(() => {
    if (!focused.current) setValue(column.name);
  }, [column.name]);

  return (
    <Input
      aria-label={COPY.name}
      value={value}
      maxLength={WORKFLOW_NAME_MAX}
      disabled={disabled}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      onBlur={() => {
        focused.current = false;
        const trimmed = value.trim();
        if (trimmed === "") setValue(column.name);
        else if (trimmed !== column.name) onRename(column.id, trimmed);
      }}
    />
  );
}
