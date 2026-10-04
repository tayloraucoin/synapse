"use client";

import * as React from "react";

import type { WorkflowColumnView, WorkflowGroupView, WorkflowTaskView } from "@syn/types";
import {
  Button,
  FiringToggle,
  HelperText,
  Input,
  ResponsiveSheet,
  SaveStatusText,
  SelectField,
  StatusLine,
  Text,
  Textarea,
  WORKFLOW_ROW_COPY,
} from "@syn/ui";
import { WORKFLOW_NOTE_MAX, WORKFLOW_TITLE_MAX } from "@syn/constants";
import { formatMinutesShort } from "@syn/utils";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";
import { useTaskSheet } from "./use-task-sheet";

const NO_GROUP_VALUE = "__none";

/**
 * WF-02 — read and change one task (Workflow UX v0.1 §4).
 *
 * *Title* (focused, caret at the end) · *Where it stands* · *Group* ·
 * *Column* · *Firing* (the active column only — the same toggle, in step with
 * the row) · footer *Archive* · *Done*. Every field saves as it changes; there
 * is no *Save* (UX §2 guardrail 5). A new group or column is a move to the end
 * of that cell, with no toast: the sheet is the context.
 *
 * Offline the fields are read-only and the offline line sits at the top.
 */
export function TaskSheet({
  open,
  task,
  groups,
  columns,
  now,
  online,
  onClose,
  updateTask,
  onFiringChange,
  onMoveToGroup,
  onMoveToColumn,
  onArchive,
}: {
  open: boolean;
  task: WorkflowTaskView | undefined;
  groups: readonly WorkflowGroupView[];
  columns: readonly WorkflowColumnView[];
  now: Date;
  online: boolean;
  onClose: () => void;
  updateTask: (taskId: string, change: { title?: string; note?: string | null }) => Promise<unknown>;
  onFiringChange: (firing: boolean) => void;
  onMoveToGroup: (groupId: string | null) => void;
  onMoveToColumn: (columnId: string) => void;
  onArchive: () => void;
}) {
  const fields = useTaskSheet(task, updateTask);
  const titleRef = React.useRef<HTMLInputElement>(null);

  // Focused on open with the caret at the end (WF-02).
  React.useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(() => {
      const input = titleRef.current;
      if (input === null) return;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }, 50);
    return () => window.clearTimeout(handle);
  }, [open, task?.id]);

  const column = columns.find((other) => other.id === task?.columnId);
  const active = column?.role === "active";
  const firing = task?.firingStartedAt !== null && task?.firingStartedAt !== undefined;

  const elapsed = (() => {
    if (task === undefined || !active) return null;
    const from = firing ? task.firingStartedAt : task.lastReturnedAt;
    if (from === null) return null;
    const short = formatMinutesShort(Math.max(0, Math.floor((now.getTime() - from.getTime()) / 60_000)));
    const word = firing ? WORKFLOW_ROW_COPY.firing : WORKFLOW_ROW_COPY.back;
    return short === "" ? word : `${word} · ${short}`;
  })();

  return (
    <ResponsiveSheet
      open={open && task !== undefined}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={task?.title ?? COPY.sheetTitle}
      subtitle={<SaveStatusText status={fields.status} />}
      initialFocus="first-field"
      footer={
        <div className="flex items-center justify-between gap-(--space-3)">
          <Button variant="ghost" disabled={!online} onClick={onArchive}>
            {COPY.archive}
          </Button>
          <Button onClick={onClose}>{COPY.done}</Button>
        </div>
      }
    >
      {task === undefined ? null : (
        <div className="flex flex-col gap-(--space-5)">
          {online ? null : <StatusLine variant="offline" placement="inline" />}

          <div className="flex flex-col gap-(--space-2)">
            <Input
              ref={titleRef}
              label={COPY.sheetTitle}
              value={fields.title}
              maxLength={WORKFLOW_TITLE_MAX}
              readOnly={!online}
              onChange={(event) => fields.setTitle(event.target.value)}
              onBlur={fields.flushTitle}
              error={fields.titleError ?? undefined}
            />
            {fields.titleFailed ? <HelperText error>{COPY.saveError}</HelperText> : null}
          </div>

          <div className="flex flex-col gap-(--space-2)">
            <Textarea
              label={COPY.whereItStands}
              helperText={COPY.whereItStandsHelper}
              value={fields.note}
              maxLength={WORKFLOW_NOTE_MAX}
              readOnly={!online}
              rows={4}
              onChange={(event) => fields.setNote(event.target.value)}
              onBlur={fields.flushNote}
            />
            {fields.noteFailed ? <HelperText error>{COPY.saveError}</HelperText> : null}
          </div>

          <SelectField
            label={COPY.group}
            disabled={!online}
            value={task.groupId ?? NO_GROUP_VALUE}
            onValueChange={(value) => onMoveToGroup(value === NO_GROUP_VALUE ? null : value)}
            options={[
              ...groups.map((group) => ({ value: group.id, label: group.name })),
              { value: NO_GROUP_VALUE, label: COPY.noGroup },
            ]}
          />

          <SelectField
            label={COPY.column}
            disabled={!online}
            value={task.columnId}
            onValueChange={onMoveToColumn}
            options={columns.map((other) => ({ value: other.id, label: other.name }))}
          />

          {active ? (
            <div className="flex items-center gap-(--space-3)">
              <FiringToggle
                pressed={firing}
                label={firing ? WORKFLOW_ROW_COPY.markBack(task.title) : WORKFLOW_ROW_COPY.fire(task.title)}
                onPressedChange={onFiringChange}
                disabled={!online}
              />
              <div className="flex flex-col">
                <Text as="span" variant="body" weight={500}>
                  {COPY.firing}
                </Text>
                {elapsed === null ? null : (
                  <Text as="span" variant="secondary" className={firing ? "text-accent-text" : "text-text-secondary"}>
                    {elapsed}
                  </Text>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </ResponsiveSheet>
  );
}
