/**
 * TypedConfirmDialog — ST-10a, Delete account, and nowhere else
 * (v2 handoff §5.3).
 *
 * A `ConfirmDialog variant="destructive"` with an `Input` in its children
 * slot. Confirm enables only when the typed value matches `word`, compared
 * case-insensitively after trimming — the point of the gesture is deliberate
 * intent, not exact keystrokes.
 *
 * This is the single surface where the destructive token is permitted
 * (official spec §9.3). Do not reach for this component to make another
 * deletion feel serious; a plain `ConfirmDialog` is the right shape for
 * everything else the product removes.
 *
 * The field resets when the dialog closes, so re-opening it never arrives
 * pre-armed.
 */
"use client";

import * as React from "react";

import { Input } from "../../../primitives/control/input";
import { ConfirmDialog } from "../../../primitives/feedback/alert-dialog";

export interface TypedConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  /** The word a person must type, e.g. "delete". */
  word: string;
  inputLabel: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  busy?: boolean;
}

export function TypedConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  word,
  inputLabel,
  confirmLabel,
  cancelLabel,
  onConfirm,
  busy = false,
}: TypedConfirmDialogProps) {
  const [typed, setTyped] = React.useState("");

  React.useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  const matches = typed.trim().toLowerCase() === word.trim().toLowerCase();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant="destructive"
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      confirmDisabled={!matches}
      busy={busy}
      onConfirm={onConfirm}
    >
      <Input
        label={inputLabel}
        value={typed}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => setTyped(event.target.value)}
      />
    </ConfirmDialog>
  );
}
