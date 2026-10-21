"use client";

/**
 * DeleteDialog — the confirm before an off row goes for good (USE-152;
 * delete-confirm.md, D-USE-125). Props only.
 *
 * "Delete “<title>”?", the consequence, then "Keep it" (outline) and
 * "Delete" (ink, `Button` default); nothing on it is red. `ConfirmDialog`
 * puts first focus on the cancel, "Keep it", and returns it on close. It is
 * offered only from an off row; the server refuses an active one.
 */
import { ConfirmDialog } from "@syn/ui";
import { MORNING_READING_COPY as COPY } from "./copy";

export interface DeleteDialogProps {
  /** The row's title, or null for an untitled passage. */
  title: string | null;
  open: boolean;
  onKeep: () => void;
  onDelete: () => void;
}

export function DeleteDialog({
  title,
  open,
  onKeep,
  onDelete,
}: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onKeep();
      }}
      title={COPY.deleteTitle(title)}
      description={COPY.deleteBody}
      cancelLabel={COPY.keepIt}
      confirmLabel={COPY.delete}
      onConfirm={onDelete}
      // As drawn at 402: the words to the start, the two actions in a row.
      classes={{
        header: "place-items-start text-start",
        footer: "flex-row justify-end",
      }}
    />
  );
}
