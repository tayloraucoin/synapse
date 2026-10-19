"use client";

import * as React from "react";
import {
  Button,
  CloseIcon,
  DisclosureIcon,
  ResponsiveSheet,
  Text,
} from "@syn/ui";

export interface CopyPickerRow {
  key: string;
  /** "Monday", or a block's name. */
  name: string;
  /** Its strip, hidden from assistive tech; `line` names what it draws. */
  strip: React.ReactNode;
  /** The blocks named, never a count: "Wellness, Training, Breakfast, Work". */
  line: string;
}

export interface CopyPickerProps {
  open: boolean;
  /** "Copy from", or "From a saved block". */
  title: string;
  /** "Every Thursday takes the blocks of the day picked. Built days only." */
  helper: string;
  rows: readonly CopyPickerRow[];
  onPick: (key: string) => void;
  onClose: () => void;
  /** The ··· or the + that opened it: its menu is gone by the time it closes. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const CLOSE = "Close";

/**
 * CopyPicker (USE-45; interactions/copy-from/states/copy-picker.md): a sheet
 * that traps focus, × on the left named "Close", the title and a muted
 * helper, then one row per choice divided by hairlines: its name, its strip
 * and its line, a chevron on the right. Each row is one button named
 * "<name>: <line>". From 1024 the sheet is the right panel. From a saved
 * block (D-USE-87) uses the same form with blocks in place of days.
 */
export function CopyPicker({
  open,
  title,
  helper,
  rows,
  onPick,
  onClose,
  returnFocusRef,
}: CopyPickerProps) {
  const header = (
    <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
      <Button
        variant="ghost"
        size="icon"
        aria-label={CLOSE}
        onClick={onClose}
        className="-ms-(--space-3)"
      >
        <CloseIcon aria-hidden="true" />
      </Button>
      <Text as="h2" variant="row-title" weight={600}>
        {title}
      </Text>
    </div>
  );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={title}
      header={header}
      // The × is in the header: no second close.
      headerAction={null}
      returnFocusRef={returnFocusRef}
      size="tall"
      classes={{
        header: "items-center pt-(--space-2)",
        body: "pt-(--space-1)",
      }}
    >
      <Text as="p" variant="secondary" tone="muted">
        {helper}
      </Text>
      <ul className="mt-(--space-3) flex flex-col">
        {rows.map((row) => (
          <li key={row.key} className="border-b border-border last:border-b-0">
            <button
              type="button"
              aria-label={`${row.name}: ${row.line}`}
              onClick={() => onPick(row.key)}
              className="flex min-h-(--target) w-full cursor-pointer items-center gap-(--space-3) py-(--space-4) text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
            >
              <span
                aria-hidden="true"
                className="flex min-w-0 flex-1 flex-col gap-(--space-2)"
              >
                <Text as="span" variant="row-title" weight={600}>
                  {row.name}
                </Text>
                {row.strip}
                <Text as="span" variant="secondary" tone="muted">
                  {row.line}
                </Text>
              </span>
              <DisclosureIcon
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
            </button>
          </li>
        ))}
      </ul>
    </ResponsiveSheet>
  );
}
