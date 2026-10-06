/**
 * TagInput — a field that grows chips (UX v1.2 §4.6, §10.2; RUN-7).
 *
 * A passage's tags: type, press Enter or a comma, and the word becomes a chip
 * with an × beside it; Backspace on an empty field takes the last chip back.
 * The chips and the field share one bordered row, so the control reads as
 * one thing and the tap target for the field is the whole row.
 *
 * THE × IS 44PX. A chip is short and the glyph is small; the target is not.
 * Each × is a real button labelled *Remove {tag}*, so the list can be edited
 * from a screen reader chip by chip.
 *
 * `max` IS A CAP WITH A COUNT, NOT A WALL. Near the cap the muted count
 * appears (*4 of 5*); at it the field says so in one line and refuses the
 * next add. Duplicates and blanks are dropped quietly — a tag typed twice is
 * one tag.
 */
"use client";

import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { HelperText } from "../../../primitives/display/helper-text";
import { Text } from "../../../primitives/typography/text";
import { TAG_INPUT_COPY } from "./copy";

export interface TagInputProps {
  value: readonly string[];
  onChange: (next: string[]) => void;
  label: React.ReactNode;
  placeholder?: string;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  /** The most tags the field takes; the count shows from two under it. */
  max?: number;
  /** Each tag's longest form; longer input is cut at the boundary. */
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

const normalise = (raw: string, maxLength: number | undefined): string => {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  return maxLength === undefined ? trimmed : trimmed.slice(0, maxLength);
};

export function TagInput({
  value,
  onChange,
  label,
  placeholder,
  helperText,
  error,
  max,
  maxLength,
  disabled = false,
  className,
}: TagInputProps) {
  const inputId = React.useId();
  const helperId = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [draft, setDraft] = React.useState("");

  const atMax = max !== undefined && value.length >= max;
  const nearMax = max !== undefined && value.length >= max - 1;
  const invalid = error !== undefined && error !== null;
  const message = error ?? (atMax && max !== undefined ? TAG_INPUT_COPY.atMax(max) : helperText);

  const add = (raw: string) => {
    const tag = normalise(raw, maxLength);
    setDraft("");
    if (tag === "" || atMax) return;
    if (value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, at) => at !== index));
    inputRef.current?.focus();
  };

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <div className="flex items-baseline justify-between gap-(--space-3)">
        <Text as="label" htmlFor={inputId} variant="secondary" weight={500}>
          {label}
        </Text>
        {nearMax && max !== undefined ? (
          <Text as="span" variant="caption" tone="secondary" className="tabular-nums">
            {TAG_INPUT_COPY.count(value.length, max)}
          </Text>
        ) : null}
      </div>

      {/* The row is the field: a click anywhere in it focuses the input. */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "bg-paper flex min-h-(--target) flex-wrap items-center gap-(--space-1) rounded-(--radius) border px-(--space-2) py-(--space-1)",
          "transition-colors duration-(--dur-state) ease-(--ease-settle)",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          invalid ? "border-ink" : "border-input hover:border-text-secondary",
          disabled && "cursor-not-allowed",
        )}
      >
        {value.map((tag, index) => (
          <span
            key={tag}
            className="bg-surface text-ink inline-flex items-center rounded-(--radius) ps-(--space-2) text-(length:--fs-secondary)"
          >
            <span>{tag}</span>
            <button
              type="button"
              aria-label={TAG_INPUT_COPY.remove(tag)}
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                removeAt(index);
              }}
              className={cn(
                "text-text-secondary hover:text-ink inline-flex size-(--target) items-center justify-center rounded-(--radius)",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              )}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={draft}
          placeholder={atMax ? undefined : placeholder}
          disabled={disabled}
          autoCapitalize="none"
          autoCorrect="off"
          aria-invalid={invalid || undefined}
          aria-describedby={message === undefined ? undefined : helperId}
          onChange={(event) => {
            const next = event.target.value;
            if (next.includes(",")) {
              const [head, ...rest] = next.split(",");
              add(head ?? "");
              setDraft(rest.join(",").trimStart());
              return;
            }
            setDraft(next);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add(draft);
            } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
              event.preventDefault();
              removeAt(value.length - 1);
            }
          }}
          onBlur={() => {
            if (draft.trim() !== "") add(draft);
          }}
          className={cn(
            "text-ink placeholder:text-text-muted min-w-[6ch] flex-1 bg-transparent px-(--space-1) font-sans text-(length:--fs-body) outline-none",
            "h-9",
          )}
        />
      </div>

      {message === undefined ? null : (
        <HelperText id={helperId} error={invalid}>
          {message}
        </HelperText>
      )}
    </div>
  );
}
