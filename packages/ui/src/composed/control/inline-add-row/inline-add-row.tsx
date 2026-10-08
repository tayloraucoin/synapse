/**
 * InlineAddRow — the ghost row that becomes a field (Workflow UX v0.1 WF-01,
 * §9). For a task (*Add a task*), a group (*Add a group*), a column (*Add a
 * column*); the words are the caller's, from its `copy.ts`.
 *
 * - Resting: a ghost row — a plus and the label, secondary.
 * - Editing: a single field, placeholder from the caller, and NO BUTTON. `Enter`
 *   submits the trimmed value when it is not empty (an empty one creates
 *   nothing); `Esc`, or a blur with nothing typed, puts the ghost row back.
 *   With `keepOpen` the field empties and stays focused for the next one —
 *   the task add row's behaviour. A blur with words in the field keeps them.
 * - `maxLength`: the field stops accepting at the limit and says nothing.
 *
 * `visibility="lane-focus"` hides the resting row on wide until its lane is
 * hovered or holds focus — the lane is the `group/lane` that `BoardLane`
 * draws. On compact, and while editing, it is always visible.
 *
 * Open state may be controlled (`open` / `onOpenChange`) so the board's `n`
 * key can open it.
 */
"use client";

import { Plus } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Input } from "../../../primitives/control/input";
import { Text } from "../../../primitives/typography/text";

export interface InlineAddRowProps {
  /** The ghost row's words and the field's accessible name — *Add a task*. */
  label: string;
  /** *Task*, *Group, usually a client*. */
  placeholder: string;
  maxLength: number;
  onSubmit: (value: string) => void;
  /** Stay open and empty after a submit. */
  keepOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  visibility?: "always" | "lane-focus";
  disabled?: boolean;
  className?: string;
}

export function InlineAddRow({
  label,
  placeholder,
  maxLength,
  onSubmit,
  keepOpen = false,
  open: openProp,
  onOpenChange,
  visibility = "always",
  disabled = false,
  className,
}: InlineAddRowProps) {
  const [openState, setOpenState] = React.useState(false);
  const open = (openProp ?? openState) && !disabled;
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const ghostRef = React.useRef<HTMLButtonElement>(null);
  const returnFocus = React.useRef(false);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (returnFocus.current) {
      returnFocus.current = false;
      ghostRef.current?.focus();
    }
  }, [open]);

  function close(focusGhost: boolean) {
    returnFocus.current = focusGhost;
    setValue("");
    setOpen(false);
  }

  if (open) {
    return (
      <div className={cn("flex min-h-(--target) items-center px-(--space-2)", className)}>
        <Input
          ref={inputRef}
          aria-label={label}
          placeholder={placeholder}
          maxLength={maxLength}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              const trimmed = value.trim();
              if (trimmed === "") return;
              onSubmit(trimmed);
              if (keepOpen) {
                setValue("");
                inputRef.current?.focus();
              } else {
                close(true);
              }
            } else if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              close(true);
            }
          }}
          onBlur={() => {
            if (value.trim() === "") close(false);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex",
        visibility === "lane-focus" &&
          "wide:opacity-0 wide:focus-within:opacity-100 wide:group-hover/lane:opacity-100 wide:group-focus-within/lane:opacity-100",
        "transition-opacity duration-(--dur-state) ease-(--ease-settle)",
        className,
      )}
    >
      <button
        ref={ghostRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-h-(--target) w-full items-center gap-(--space-2) rounded-(--radius) ps-(--space-3) pe-(--space-2) text-left",
          "text-text-secondary transition-colors duration-(--dur-state) ease-(--ease-settle)",
          "hover:bg-fill-muted hover:text-ink",
          "disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:bg-transparent",
        )}
      >
        <Plus aria-hidden="true" className="size-4 shrink-0" />
        <Text as="span" variant="secondary" className="text-inherit">
          {label}
        </Text>
      </button>
    </div>
  );
}
