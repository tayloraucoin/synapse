/**
 * SearchField — the filter input inside a picker (v2 handoff §6.1, reuse CC).
 *
 * CC's component with `darkBackground` removed (Synapse has one register — §10
 * D8/D10) and the skin swapped to Synapse tokens. The clear control keeps CC's
 * shape: a real button at a 44px target that returns focus to the input, so
 * clearing a search does not drop a person out of the field they are typing in.
 *
 * `type="search"` rather than `type="text"`: it gives the platform keyboard a
 * Search key and, on iOS, the clear affordance people already expect.
 *
 * THE VALUE NEVER TOUCHES THE BORDER (T13.2; DAY-1). The glyph's slot ends
 * at `--space-3` + 16px; the input's start padding is `--space-7` (48px),
 * which is at least `--space-3` beyond it. WebKit draws `type="search"` with
 * its own `searchfield` appearance, which discards author padding on iOS —
 * the value then sets against the border in the walkthrough's screenshots —
 * so the input is `appearance-none` and the padding is the one drawn here.
 */
"use client";

import { Search, X } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";

export interface SearchFieldClasses {
  root?: string;
  input?: string;
  icon?: string;
  clear?: string;
  label?: string;
}

export interface SearchFieldProps
  extends Omit<React.ComponentProps<"input">, "type" | "size"> {
  /** Required — a search box with no name is a box. */
  "aria-label": string;
  /** Rendered visually hidden, for the label association. */
  label?: string;
  onClear?: () => void;
  classes?: SearchFieldClasses;
}

export function SearchField({
  className,
  classes,
  id: idProp,
  label,
  onChange,
  onClear,
  value,
  defaultValue,
  disabled,
  ...props
}: SearchFieldProps) {
  const generatedId = React.useId();
  const inputId = idProp ?? generatedId;
  const inputRef = React.useRef<HTMLInputElement>(null);

  const resolved = String(value ?? defaultValue ?? "");
  const hasValue = resolved.length > 0;

  const handleClear = () => {
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative w-full", classes?.root, className)}>
      {label === undefined ? null : (
        <label htmlFor={inputId} className={cn("sr-only", classes?.label)}>
          {label}
        </label>
      )}

      <Search
        aria-hidden="true"
        strokeWidth={1.5}
        className={cn(
          "text-text-secondary pointer-events-none absolute top-1/2 start-(--space-3) size-4 -translate-y-1/2",
          classes?.icon,
        )}
      />

      <input
        ref={inputRef}
        id={inputId}
        type="search"
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={onChange}
        className={cn(
          "border-hairline bg-paper text-ink h-(--target) w-full appearance-none rounded-(--radius) border",
          // The glyph's slot (`--space-3` + 16px), then at least `--space-3` of air.
          "ps-(--space-7) text-(length:--fs-body)",
          hasValue && !disabled ? "pe-(--target)" : "pe-(--space-3)",
          "placeholder:text-text-secondary",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:opacity-40",
          "[&::-webkit-search-cancel-button]:appearance-none",
          classes?.input,
        )}
        {...props}
      />

      {hasValue && !disabled ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={handleClear}
          className={cn(
            "text-text-secondary hover:text-ink absolute top-1/2 end-0 -translate-y-1/2",
            "inline-flex size-(--target) items-center justify-center",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            classes?.clear,
          )}
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
