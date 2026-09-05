/**
 * ShortcutsDialog — the `?` key's answer (v2 handoff §5.10).
 *
 * Wide only. There are no keyboard shortcuts to list on a phone, and a dialog
 * that opened there would be a dead end; the caller gates on `useIsWide`.
 *
 * Rows are `ListRow`s with `Kbd` in the trailing slot, so the shortcut list
 * has the same anatomy as every other list in the product.
 */
"use client";

import * as React from "react";

import { Kbd } from "../../../primitives/display/kbd";
import { DialogPanel } from "../../../primitives/feedback/dialog";
import { ListRow } from "../../display/list-row";

export interface Shortcut {
  keys: readonly string[];
  label: string;
}

export interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: readonly Shortcut[];
  className?: string;
}

export function ShortcutsDialog({
  open,
  onOpenChange,
  shortcuts,
  className,
}: ShortcutsDialogProps) {
  return (
    <DialogPanel
      open={open}
      onOpenChange={onOpenChange}
      title="Keyboard shortcuts"
      className={className}
    >
      <ul className="divide-hairline flex flex-col divide-y">
        {shortcuts.map((shortcut) => (
          <ListRow
            key={shortcut.label}
            title={shortcut.label}
            trailing={
              <span className="flex items-center gap-(--space-1)">
                {shortcut.keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </span>
            }
          />
        ))}
      </ul>
    </DialogPanel>
  );
}
