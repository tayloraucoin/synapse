"use client";

import * as React from "react";
import { Button, CloseIcon, ResponsiveSheet, Text } from "@syn/ui";
import type { LastNightEntry } from "@syn/utils";
import { ORIENT_COPY as COPY } from "./copy";
import { dateLabelOf } from "./date-label";

/**
 * "Last night" (USE-13; D-USE-14, D-USE-39; orient/states/last-night-open.md):
 * the evening's three lines read back over Orient, each under its own
 * caption, the first re-tensed (`lastNightEntries`). A bottom sheet below
 * the desk, the right panel at `--sheet-w` at it.
 *
 * READ ONLY. No field, no button but ×, and nothing is written by opening
 * or reading it. An evening line left empty is not here at all.
 *
 * × on the left, a drag down or the scrim close it, and focus goes back to
 * "Read last night's reflections" (`returnFocusRef`). On open, focus is the
 * title, so the sheet is announced before anything in it.
 */

export interface LastNightSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The evening's date key: "Sunday, 11 October". */
  onDate: string;
  entries: readonly LastNightEntry[];
  returnFocusRef: React.RefObject<HTMLElement | null>;
}

export function LastNightSheet({
  open,
  onOpenChange,
  onDate,
  entries,
  returnFocusRef,
}: LastNightSheetProps) {
  const titleRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const header = (
    <div className="flex min-w-0 flex-1 items-center gap-(--space-3)">
      <Button
        variant="ghost"
        size="icon"
        aria-label={COPY.close}
        onClick={() => onOpenChange(false)}
        className="-ms-(--space-3) text-muted-foreground"
      >
        <CloseIcon aria-hidden="true" />
      </Button>
      <div className="flex min-w-0 flex-col">
        <Text as="p" variant="caption" tone="muted">
          {dateLabelOf(onDate)}
        </Text>
        <Text
          ref={titleRef}
          as="h2"
          variant="heading"
          tabIndex={-1}
          className="outline-none"
        >
          {COPY.lastNightTitle}
        </Text>
      </div>
    </div>
  );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={COPY.lastNightTitle}
      header={header}
      // The × is in the header, so the wide sheet gets no second close.
      headerAction={null}
      initialFocus="first-field"
      returnFocusRef={returnFocusRef}
      size="tall"
      classes={{
        header: "items-center pt-(--space-2)",
        body: "pt-(--space-2) pb-[calc(var(--space-8)+env(safe-area-inset-bottom))]",
      }}
    >
      <dl className="flex flex-col">
        {entries.map((entry) => (
          <div
            key={entry.key}
            className="border-hairline flex flex-col gap-(--space-2) border-t py-(--space-4)"
          >
            <Text as="dt" variant="caption" tone="muted">
              {entry.caption}
            </Text>
            <Text as="dd" variant="body" className="m-0 leading-(--lh-heading)">
              {entry.text}
            </Text>
          </div>
        ))}
      </dl>
    </ResponsiveSheet>
  );
}
