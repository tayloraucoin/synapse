/**
 * TimeField — the house's time field (v2 handoff §5.4; USE-142): the time
 * as typeable text, "7:05", and the clock at its end opening the 24-hour
 * picker (`TimePicker`, USE-141; set-my-days states/time-picker.md).
 *
 * THE HOUSE PICKER, NEVER THE BROWSER'S (Taylor, 2026-10-19). It bends Epic
 * 1 §0.3's "native picker on both platforms": the browser's own ignored the
 * tokens and was never drawn. Below the split break the clock opens a
 * sheet, at it a popover under the whole field; Hour 0 to 23, Minute by 5.
 *
 * Typing reads on blur or Enter ("630" is 6:30; any minute is kept, so a
 * typed 7:03 stays 7:03) and Escape puts the value back. A pick reads in the
 * field as the lists move; Done commits it. `onChange` fires on a commit,
 * never on each keystroke.
 *
 * The value is "HH:mm" — a wall-clock string, not an instant. A time slot in a
 * template has no date, so it cannot be a `Date`; turning it into one is the
 * caller's job, on the day it belongs to. `min` and `max` are the caller's
 * check: the field shows any time typed.
 *
 * `disclosed` — UX v1.1 §4 (the frame, once), W1: "Pre-filled fields show
 * **value + Change** and open their control only on demand." The field
 * renders its value as a labelled line with a ghost *Change* beside it;
 * tapping opens the field in place, its clock beside it. UX v1.2 §4 (RUN-7):
 * *Done* beside the open field returns it to the value state, and blur does
 * the same; focus returns to *Change*. `leading` puts the person's emoji
 * (through `EmojiSlot`) before the line.
 */
"use client";

import * as React from "react";
import type { IconValue } from "@syn/types";
import { parseTypedClock } from "@syn/utils";
import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { HelperText } from "../../../primitives/display/helper-text";
import { Label } from "../../../primitives/display/label";
import { Text } from "../../../primitives/typography/text";
import { EmojiSlot, isIconValue } from "../../display/emoji-slot";
import { TimePicker } from "../time-picker";

export interface TimeFieldProps {
  /** "HH:mm", or null for empty. */
  value: string | null;
  /** A committed time: typed and read, or Done in the picker. */
  onChange: (value: string) => void;
  label: React.ReactNode;
  /**
   * The field's spoken name, for the clock and the picker ("Starts"). Needed
   * when `label` is a node; a string label is its own name.
   */
  name?: string;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  /** "HH:mm" bounds; the caller's check (the field shows any time typed). */
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  /** Value + *Change*; the field opens on demand (W1). */
  disclosed?: boolean;
  /** The *Change* button's text; the label is read after it. */
  changeLabel?: string;
  /** *Done* — closes the open field (v1.2 §4). */
  doneLabel?: string;
  /** "9:00" — the value as the field shows it; defaults to a plain reading of `HH:mm`. */
  formatValue?: (value: string) => string;
  /** An `IconValue` renders through `EmojiSlot`; any node renders as given. */
  leading?: React.ReactNode | IconValue;
  /** The picker open on load (a `?state=` frame). */
  pickerOpen?: boolean;
  className?: string;
}

/** "7:05" from "07:05": 24-hour, no leading zero. */
function readClock(value: string): string {
  const [hour = "0", minute = "00"] = value.split(":");
  return `${Number(hour)}:${minute}`;
}

export function TimeField({
  value,
  onChange,
  label,
  name,
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
  pickerOpen = false,
  className,
}: TimeFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [picking, setPicking] = React.useState(false);
  // What the field shows while it is being changed: typed words, or a pick.
  const [typed, setTyped] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const changeRef = React.useRef<HTMLButtonElement>(null);
  const openRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  const helperId = `${id}-helper`;
  const labelId = `${id}-label`;
  const spoken = name ?? (typeof label === "string" ? label : "Time");
  const helper = error ?? helperText;

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = React.useCallback(() => {
    setOpen(false);
    // Focus returns to *Change* on the next paint, once it exists again.
    window.setTimeout(() => changeRef.current?.focus(), 0);
  }, []);

  const commitTyped = () => {
    if (typed === null) return;
    const next = parseTypedClock(typed);
    setTyped(null);
    if (next !== null && next !== value) onChange(next);
  };

  const leadingNode =
    leading === undefined ? null : isIconValue(leading) ? (
      <EmojiSlot icon={leading} />
    ) : (
      leading
    );

  if (disclosed && !open) {
    return (
      <div className={cn("flex flex-col gap-(--space-1)", className)}>
        <Text as="span" id={labelId} variant="secondary" weight={500}>
          {label}
        </Text>
        <div className="flex min-h-(--target) items-center gap-(--space-3)">
          {leadingNode}
          <Text
            as="span"
            variant="body"
            className="min-w-0 flex-1 tabular-nums"
            aria-labelledby={labelId}
          >
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

  const shown =
    typed ?? (value === null || value === "" ? "" : formatValue(value));

  const field = (
    <div className={cn("flex w-full flex-col", !disclosed && className)}>
      {label ? (
        <Label htmlFor={id} className="mb-(--space-2)">
          {label}
        </Label>
      ) : null}
      <TimePicker
        label={spoken}
        value={value}
        disabled={disabled}
        defaultOpen={pickerOpen}
        onOpenChange={setPicking}
        onPreview={(next) =>
          setTyped(next === null || next === value ? null : formatValue(next))
        }
        onCommit={(next) => {
          setTyped(null);
          if (next !== value) onChange(next);
        }}
        renderField={(trigger) => (
          <div
            data-disabled={disabled || undefined}
            className={cn(
              "flex h-(--target) w-full min-w-0 items-center rounded-(--radius) border bg-paper ps-(--space-3) pe-(--space-1)",
              "transition-colors duration-(--dur-state) ease-(--ease-settle)",
              "focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground",
              "data-disabled:opacity-45",
              error ? "border-ink" : "border-input hover:border-text-secondary",
            )}
          >
            <input
              ref={inputRef}
              id={id}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              size={5}
              value={shown}
              data-min={min}
              data-max={max}
              required={required}
              disabled={disabled}
              aria-invalid={error ? true : undefined}
              aria-describedby={helper ? helperId : undefined}
              onChange={(event) => setTyped(event.target.value)}
              onBlur={commitTyped}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitTyped();
                  if (disclosed) close();
                }
                if (event.key === "Escape") {
                  setTyped(null);
                  if (disclosed) {
                    event.preventDefault();
                    close();
                  }
                }
              }}
              className="min-w-0 flex-1 bg-transparent font-sans text-(length:--fs-body) leading-(--lh-body) text-ink tabular-nums outline-none disabled:cursor-not-allowed"
            />
            {trigger}
          </div>
        )}
      />
      {helper ? (
        <HelperText
          id={helperId}
          error={Boolean(error)}
          classes={{ root: "mt-(--space-2)" }}
        >
          {helper}
        </HelperText>
      ) : null}
    </div>
  );

  if (!disclosed) return field;

  return (
    <div
      ref={openRef}
      className={cn("flex items-end gap-(--space-3)", className)}
      onBlur={(event) => {
        // Blur to the value state — unless focus moved within the field, or
        // into the picker it opened.
        if (picking) return;
        const next = event.relatedTarget as Node | null;
        if (next !== null && openRef.current?.contains(next)) return;
        close();
      }}
    >
      {leadingNode === null ? null : (
        <span className="pb-(--space-2)">{leadingNode}</span>
      )}
      <div className="min-w-0 flex-1">{field}</div>
      <Button variant="ghost" onClick={close} className="min-h-(--target)">
        {doneLabel}
      </Button>
    </div>
  );
}
