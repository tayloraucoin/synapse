/**
 * TimeField — a native time input with our reading of it (v2 handoff §5.4).
 *
 * Over `Input mode="time"`, which already sets `type="time"`. The wrapper adds
 * `min`/`max` bounds and a read-back line in the *day's* zone, so a person
 * editing a time while travelling sees the value the day will use.
 *
 * THE NATIVE PICKER, ON BOTH PLATFORMS (Epic 1 §0.3). The wheel on iOS and the
 * clock dial on Android are what people already know, and a custom picker
 * would be a worse version of both plus a keyboard story to write.
 *
 * The value is "HH:mm" — a wall-clock string, not an instant. A time slot in a
 * template has no date, so it cannot be a `Date`; turning it into one is the
 * caller's job, on the day it belongs to.
 *
 * `disclosed` — UX v1.1 §4 (the frame, once), W1: "Pre-filled fields show
 * **value + Change** and open their control only on demand." The field
 * renders its value as a labelled line with a ghost *Change* beside it;
 * tapping opens the picker in place and moves focus into it. A field that
 * is usually left alone should read as an answer, not as a question.
 *
 * UX v1.2 §4 (RUN-7): "the open control has a **Done** that returns it to
 * the value state, and blur does the same." *Done* is a 44px text button
 * beside the open picker; leaving the picker by any route closes it, and
 * focus returns to *Change* so a keyboard user lands where they left.
 * `leading` puts the person's emoji (through `EmojiSlot`) before the line.
 */
"use client";

import type { IconValue } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Input } from "../../../primitives/control/input";
import { Text } from "../../../primitives/typography/text";
import { EmojiSlot, isIconValue } from "../../display/emoji-slot";

export interface TimeFieldProps {
  /** "HH:mm", or null for empty. */
  value: string | null;
  onChange: (value: string) => void;
  label: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  /** "HH:mm" bounds passed through to the native picker. */
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  /** Value + *Change*; the picker opens on demand (W1). */
  disclosed?: boolean;
  /** The *Change* button's text; the label is read after it. */
  changeLabel?: string;
  /** *Done* — closes the open picker (v1.2 §4). */
  doneLabel?: string;
  /** "9:00" — the value as the line shows it; defaults to a plain reading of `HH:mm`. */
  formatValue?: (value: string) => string;
  /** An `IconValue` renders through `EmojiSlot`; any node renders as given. */
  leading?: React.ReactNode | IconValue;
  className?: string;
}

function readClock(value: string): string {
  const [hour = "0", minute = "00"] = value.split(":");
  return `${Number(hour)}:${minute}`;
}

export function TimeField({
  value,
  onChange,
  label,
  helperText,
  error,
  min,
  max,
  required = false,
  disabled = false,
  disclosed = false,
  changeLabel = "Change",
  doneLabel = "Done",
  formatValue = readClock,
  leading,
  className,
}: TimeFieldProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const changeRef = React.useRef<HTMLButtonElement>(null);
  const openRef = React.useRef<HTMLDivElement>(null);
  const labelId = React.useId();

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = React.useCallback(() => {
    setOpen(false);
    // Focus returns to *Change* on the next paint, once it exists again.
    window.setTimeout(() => changeRef.current?.focus(), 0);
  }, []);

  const leadingNode =
    leading === undefined ? null : isIconValue(leading) ? <EmojiSlot icon={leading} /> : leading;

  if (disclosed && !open) {
    return (
      <div className={cn("flex flex-col gap-(--space-1)", className)}>
        <Text as="span" id={labelId} variant="secondary" weight={500}>
          {label}
        </Text>
        <div className="flex min-h-(--target) items-center gap-(--space-3)">
          {leadingNode}
          <Text as="span" variant="body" className="min-w-0 flex-1 tabular-nums" aria-labelledby={labelId}>
            {value === null || value === "" ? "—" : formatValue(value)}
          </Text>
          <Button
            ref={changeRef}
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-describedby={labelId}
            onClick={() => setOpen(true)}
          >
            {changeLabel}
          </Button>
        </div>
        {helperText ? (
          <Text as="span" variant="caption" tone="secondary">
            {helperText}
          </Text>
        ) : null}
      </div>
    );
  }

  const picker = (
    <Input
      ref={inputRef}
      mode="time"
      label={label}
      helperText={helperText}
      error={error}
      value={value ?? ""}
      min={min}
      max={max}
      required={required}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={
        disclosed
          ? (event) => {
              if (event.key === "Enter" || event.key === "Escape") {
                event.preventDefault();
                close();
              }
            }
          : undefined
      }
      className={cn("tabular-nums", !disclosed && className)}
    />
  );

  if (!disclosed) return picker;

  return (
    <div
      ref={openRef}
      className={cn("flex items-end gap-(--space-3)", className)}
      onBlur={(event) => {
        // Blur to the value state — unless focus moved within the field.
        const next = event.relatedTarget as Node | null;
        if (next !== null && openRef.current?.contains(next)) return;
        close();
      }}
    >
      {leadingNode === null ? null : <span className="pb-(--space-2)">{leadingNode}</span>}
      <div className="min-w-0 flex-1">{picker}</div>
      <Button variant="ghost" onClick={close} className="min-h-(--target)">
        {doneLabel}
      </Button>
    </div>
  );
}
