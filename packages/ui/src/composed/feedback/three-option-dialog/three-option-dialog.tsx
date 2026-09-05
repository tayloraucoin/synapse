/**
 * ThreeOptionDialog — TP-04's "apply this change where?" (v2 handoff §5.3).
 *
 * Over the prop-based `DialogPanel` rather than `ConfirmDialog`, because there
 * is no confirm/cancel pair here: three outcomes, none of them a cancel, and a
 * two-button dialog cannot express that without hiding one behind the Esc key.
 *
 * The buttons stack vertically at full width, in the order given. Vertical is
 * deliberate — three side-by-side buttons make a person compare lengths
 * instead of reading, and on compact they would wrap into an accidental order.
 */
"use client";

import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { DialogPanel } from "../../../primitives/feedback/dialog";

export interface ThreeOptionDialogOption {
  label: string;
  onSelect: () => void;
  emphasis: "default" | "secondary" | "ghost";
}

export interface ThreeOptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body?: React.ReactNode;
  options: readonly [
    ThreeOptionDialogOption,
    ThreeOptionDialogOption,
    ThreeOptionDialogOption,
  ];
  busy?: boolean;
}

export function ThreeOptionDialog({
  open,
  onOpenChange,
  title,
  body,
  options,
  busy = false,
}: ThreeOptionDialogProps) {
  return (
    <DialogPanel
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={body}
    >
      <div className="flex flex-col gap-(--space-2) pt-(--space-4)">
        {options.map((option) => (
          <Button
            key={option.label}
            variant={option.emphasis}
            disabled={busy}
            onClick={option.onSelect}
            className="w-full"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </DialogPanel>
  );
}
