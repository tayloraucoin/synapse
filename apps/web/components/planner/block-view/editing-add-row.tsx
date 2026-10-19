"use client";

import * as React from "react";
import type { IconValue } from "@syn/types";
import { AddIcon, cn, ItemIcon, Text } from "@syn/ui";
import { BLOCK_VIEW_COPY as COPY } from "./copy";

/**
 * EditingAddRow — the add row in editing (USE-49; empty.md round 3,
 * D-USE-81, D-USE-84): at rest "+ Add to Wellness"; open, a field with the
 * dashed icon square leading, the name typed, the new item's length
 * trailing ("5 min"; none on a checklist with no times). Return adds it and
 * keeps the line open for the next; Escape, or a blur with nothing typed,
 * puts the resting row back. The square opens the icon picker (USE-11)
 * through `onPickIcon`; the picked icon shows in it until the item is added.
 * Props only.
 */
export interface EditingAddRowProps {
  /** "Add to Wellness": the resting words, the field's name and placeholder. */
  label: string;
  /** "5 min", or null with no length. */
  length: string | null;
  onSubmit: (title: string) => void;
  /** The next item's icon, picked through the square. */
  icon: IconValue | null;
  onPickIcon: () => void;
  /** Open and focused on mount: a new, empty block (empty.md). */
  autoOpen?: boolean;
  /** Under the open field: the empty block's hint. */
  hint?: string | null;
  /** Escape, or a blur with nothing typed: the field closed (USE-50's New to-do). */
  onClose?: () => void;
}

export function EditingAddRow({
  label,
  length,
  onSubmit,
  icon,
  onPickIcon,
  autoOpen = false,
  hint = null,
  onClose,
}: EditingAddRowProps) {
  const [open, setOpen] = React.useState(autoOpen);
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hintId = React.useId();

  React.useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-text-muted flex min-h-(--row-min) w-full items-center gap-(--space-3) rounded-(--radius-control) text-start text-(length:--fs-body) outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <AddIcon aria-hidden="true" className="size-4 shrink-0" />
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-(--space-2) py-(--space-1)">
      <div
        data-add-field
        className="border-input focus-within:border-accent-text bg-background flex min-h-(--row-min) items-center gap-(--space-3) rounded-(--radius-control) border px-(--space-3)"
      >
        <button
          type="button"
          aria-label={COPY.editing.pickIcon}
          onClick={onPickIcon}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-(--radius-control) outline-none focus-visible:ring-2 focus-visible:ring-ring",
            icon === null && "border-edge border border-dashed",
          )}
        >
          {icon === null ? null : <ItemIcon icon={icon} size={24} />}
        </button>
        <input
          ref={inputRef}
          aria-label={label}
          aria-describedby={hint ? hintId : undefined}
          placeholder={label}
          value={value}
          maxLength={120}
          enterKeyHint="enter"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              const title = value.trim();
              if (title === "") return;
              onSubmit(title);
              setValue("");
            }
            if (event.key === "Escape") {
              setValue("");
              setOpen(false);
              onClose?.();
            }
          }}
          onBlur={(event) => {
            const within = event.currentTarget
              .closest("[data-add-field]")
              ?.contains(event.relatedTarget as Node | null);
            if (!within && value.trim() === "" && !autoOpen) setOpen(false);
            if (!within && value.trim() === "") onClose?.();
          }}
          className="placeholder:text-text-muted min-w-0 flex-1 bg-transparent text-(length:--fs-body) outline-none"
        />
        {length === null ? null : (
          <span className="text-text-muted shrink-0 text-(length:--fs-caption) leading-(--lh-caption) tabular-nums">
            {length}
          </span>
        )}
      </div>
      {hint ? (
        <Text as="p" id={hintId} variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </div>
  );
}
