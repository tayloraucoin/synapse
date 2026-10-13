"use client";

import * as React from "react";

import { useOptimisticValue } from "@syn/hooks";
import type { SaveStatus, WorkflowTaskView } from "@syn/types";
import { workflowTaskUpdateInput } from "@syn/validators";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";

/** The same rule `task.update` takes (FLO-1): trimmed, required, capped. */
const titleSchema = workflowTaskUpdateInput.shape.title.unwrap();

/**
 * The task sheet's fields (UX WF-02) — each saves on its own, no *Save*.
 *
 * Text saves after a short pause and on blur (`useOptimisticValue`'s debounce,
 * the product's existing 400ms); a failed save reverts the field to the last
 * saved value and says the save-failure sentence beneath it. THE COST, STATED:
 * words typed into a failing connection are gone on revert (FLO-7's ruling).
 *
 * An emptied title is not saved: the field keeps what was typed and shows *A
 * task needs a title.*; the row keeps its old title.
 */
export function useTaskSheet(
  task: WorkflowTaskView | undefined,
  updateTask: (taskId: string, change: { title?: string; note?: string | null }) => Promise<unknown>,
) {
  const taskId = task?.id ?? null;
  const [titleError, setTitleError] = React.useState<string | null>(null);
  const [titleFailed, setTitleFailed] = React.useState(false);
  const [noteFailed, setNoteFailed] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const commit = React.useCallback(
    async (change: { title?: string; note?: string | null }) => {
      if (taskId === null) return;
      await updateTask(taskId, change);
      setSaved(true);
    },
    [taskId, updateTask],
  );

  const title = useOptimisticValue<string>({
    value: task?.title ?? "",
    onCommit: (next) => commit({ title: next.trim() }),
    onError: () => setTitleFailed(true),
  });

  const note = useOptimisticValue<string>({
    value: task?.note ?? "",
    onCommit: (next) => commit({ note: next.trim() === "" ? null : next }),
    onError: () => setNoteFailed(true),
  });

  // A different task in the same sheet starts clean.
  React.useEffect(() => {
    setTitleError(null);
    setTitleFailed(false);
    setNoteFailed(false);
    setSaved(false);
  }, [taskId]);

  const setTitle = React.useCallback(
    (next: string) => {
      setTitleFailed(false);
      const parsed = titleSchema.safeParse(next);
      if (!parsed.success) {
        // Too long cannot be typed (`maxLength`); this is the empty title.
        setTitleError(COPY.titleRequired);
        title.hold(next);
        return;
      }
      setTitleError(null);
      title.set(next);
    },
    [title],
  );

  const setNote = React.useCallback(
    (next: string) => {
      setNoteFailed(false);
      note.set(next);
    },
    [note],
  );

  const status: SaveStatus =
    title.committing || note.committing ? "saving" : titleFailed || noteFailed ? "failed" : saved ? "saved" : "idle";

  return {
    title: title.local,
    setTitle,
    /** Blur: a valid title commits now rather than after the pause. */
    flushTitle: () => {
      if (titleError === null && title.local !== (task?.title ?? "")) title.set(title.local);
    },
    titleError,
    titleFailed,
    note: note.local,
    setNote,
    flushNote: () => {
      if (note.local !== (task?.note ?? "")) note.set(note.local);
    },
    noteFailed,
    status,
  };
}
