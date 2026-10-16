"use client";

import * as React from "react";
import { ResponsiveSheet } from "@syn/ui";
import { MOVE_TO_COPY as COPY } from "./copy";
import { MoveToStep } from "./move-to-step";

/**
 * MoveToSheet (USE-69; move-to/states/work-move-to.md, D-USE-57): Move to
 * as its own sheet, for the work menu's Move to another day (opened there by
 * USE-70). × or the scrim closes with nothing moved; a tap moves, closes
 * and offers Undo. At the desk `ResponsiveSheet`'s right panel (D-USE-39).
 */
export interface MoveToSheetProps {
  /** The work item; null is closed. */
  itemRef: string | null;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  /** A capture's start: Pick a day open on this date. */
  seededPick?: string | null;
}

export function MoveToSheet({
  itemRef,
  onClose,
  returnFocusRef,
  seededPick = null,
}: MoveToSheetProps) {
  return (
    <ResponsiveSheet
      open={itemRef !== null}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={COPY.title}
      // × is the step's own.
      header={null}
      headerAction={null}
      returnFocusRef={returnFocusRef}
      classes={{ header: "hidden", body: "pt-(--space-2)" }}
    >
      {itemRef === null ? null : (
        <MoveToStep
          itemRef={itemRef}
          from="menu"
          onBack={onClose}
          onDone={onClose}
          seededPick={seededPick}
        />
      )}
    </ResponsiveSheet>
  );
}
