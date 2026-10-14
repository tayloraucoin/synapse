"use client";

import * as React from "react";
import { Button, MinutesStepper, ResponsiveSheet, Text } from "@syn/ui";
import type { NowItemView } from "@/lib/data/use-now";
import { NOW_COPY } from "./copy";

const COPY = NOW_COPY.sheet;

/** The stepper's bounds (time-taken-sheet.md [ASSUMPTION]: 1 min steps, floor 1). */
const MIN = 1;
const MAX = 600;

/**
 * The time-taken sheet (D-USE-13): the item and its plan, "Time taken", the
 * MinutesStepper starting at what is recorded, and Save. × or the scrim
 * closes with nothing written, so the plan stands.
 */
export function TimeTakenSheet({
  item,
  open,
  onOpenChange,
  onSave,
  returnFocusRef,
}: {
  item: NowItemView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: NowItemView, min: number) => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const recorded = item?.tookMin ?? item?.lengthMin ?? MIN;
  const [value, setValue] = React.useState(recorded);
  // Each opening starts at what is recorded.
  React.useEffect(() => {
    if (open) setValue(recorded);
  }, [open, recorded]);

  return (
    <ResponsiveSheet
      open={open && item !== null}
      onOpenChange={onOpenChange}
      title={COPY.title}
      header={
        <div className="flex min-w-0 flex-1 flex-col items-start gap-(--space-2)">
          {/* × on the left, as every sheet in USE. */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={COPY.close}
            onClick={() => onOpenChange(false)}
            className="-ms-(--space-3)"
          >
            <span aria-hidden="true" className="text-(length:--fs-title)">
              ×
            </span>
          </Button>
          <div>
            <Text as="p" variant="secondary" tone="muted">
              {item ? COPY.planned(item.title, item.lengthMin) : null}
            </Text>
            <Text as="h2" variant="heading">
              {COPY.title}
            </Text>
          </div>
        </div>
      }
      initialFocus="first-field"
      returnFocusRef={returnFocusRef}
      footer={
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            if (item) onSave(item, value);
          }}
        >
          {COPY.save}
        </Button>
      }
    >
      <div className="flex justify-center">
        <MinutesStepper
          value={value}
          onChange={setValue}
          min={MIN}
          max={MAX}
          label={<span className="sr-only">{COPY.field}</span>}
        />
      </div>
    </ResponsiveSheet>
  );
}
