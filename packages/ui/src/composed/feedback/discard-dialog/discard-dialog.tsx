/**
 * DiscardDialog — the one unsaved-changes question (v2 handoff §5.3).
 *
 * A `ConfirmDialog` preset, not a new dialog: every sheet and canvas in the
 * product asks this the same way, so it is written once. It pairs with
 * `useLeaveGuard` — while a form is dirty, in-app navigation is intercepted
 * and the pending href is resolved here.
 *
 * Cancel takes initial focus (the `ConfirmDialog` rule), which here means
 * *Keep editing* — the safe outcome is the one a stray Enter chooses.
 */
"use client";

import * as React from "react";

import { ConfirmDialog } from "../../../primitives/feedback/alert-dialog";
import { DISCARD_DIALOG_COPY } from "./copy";

export interface DiscardDialogProps {
  open: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

export function DiscardDialog({
  open,
  onKeepEditing,
  onDiscard,
}: DiscardDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onKeepEditing();
      }}
      title={DISCARD_DIALOG_COPY.title}
      confirmLabel={DISCARD_DIALOG_COPY.discard}
      cancelLabel={DISCARD_DIALOG_COPY.keepEditing}
      onConfirm={onDiscard}
      onCancel={onKeepEditing}
    />
  );
}
