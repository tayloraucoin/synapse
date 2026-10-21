"use client";

import * as React from "react";
import { AddIcon, cn, ShorterIcon } from "@syn/ui";
import { BLOCK_VIEW_COPY } from "./copy";

/**
 * LengthStepper — a row's length edited in place (USE-157; suggested-
 * length.md, D-USE-138): −, the value, +, outlined, 36 px high. − and +
 * step by 5 min, or 1 min below 5 (`step`); the value can be typed. Every
 * change goes up at once through `onChange` (the total and the rail
 * follow), and Return or focus leaving the control saves once through
 * `onCommit`; Escape puts the first value back through `onCancel`. The
 * value is a spinbutton named "<name> length", read as "<n> minutes";
 * Up and Down step it. Each button's target is 44 px. Props only.
 */
export interface LengthStepperProps {
  /** The item's name: "Meditate". */
  name: string;
  value: number;
  /** The next value one step from `value`. */
  step: (value: number, direction: -1 | 1) => number;
  onChange: (value: number) => void;
  onCommit: () => void;
  onCancel: () => void;
}

const COPY = BLOCK_VIEW_COPY.editing.length;

/** A 44 px target on a 36 px control: the hit area reaches past its edge. */
const BUTTON = cn(
  "relative flex h-full w-9 shrink-0 items-center justify-center outline-none",
  "after:absolute after:-inset-1 after:content-['']",
  "hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring",
);

export function LengthStepper({
  name,
  value,
  step,
  onChange,
  onCommit,
  onCancel,
}: LengthStepperProps) {
  const [typed, setTyped] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const done = React.useRef(false);

  React.useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  function to(next: number) {
    setTyped(null);
    onChange(Math.max(1, Math.round(next)));
  }

  function commit() {
    if (done.current) return;
    done.current = true;
    onCommit();
  }

  return (
    <div
      data-length-stepper
      data-no-swipe
      className="border-edge bg-background flex h-9 shrink-0 items-center rounded-(--radius-control) border"
      // Escape from the field or either button puts the first value back.
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        done.current = true;
        onCancel();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          commit();
        }
      }}
    >
      <button
        type="button"
        aria-label={COPY.shorter(name)}
        disabled={value <= 1}
        onClick={() => to(step(value, -1))}
        className={cn(BUTTON, "rounded-s-(--radius-control) disabled:opacity-40")}
      >
        <ShorterIcon aria-hidden="true" className="size-4" />
      </button>
      <span className="border-edge flex h-full items-center gap-(--space-1) border-x px-(--space-2)">
        <input
          ref={inputRef}
          role="spinbutton"
          aria-label={COPY.name(name)}
          aria-valuemin={1}
          aria-valuenow={value}
          aria-valuetext={COPY.valueText(value)}
          inputMode="numeric"
          enterKeyHint="done"
          value={typed ?? String(value)}
          onChange={(event) => {
            const text = event.target.value.replace(/\D/g, "").slice(0, 3);
            setTyped(text);
            const next = Number(text);
            if (text !== "" && next >= 1) onChange(next);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault();
              to(step(value, event.key === "ArrowUp" ? 1 : -1));
            }
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
          className="w-8 bg-transparent text-end text-(length:--fs-body) font-semibold tabular-nums outline-none"
        />
        <span aria-hidden="true" className="text-(length:--fs-body) font-semibold">
          {COPY.unit}
        </span>
      </span>
      <button
        type="button"
        aria-label={COPY.longer(name)}
        onClick={() => to(step(value, 1))}
        className={cn(BUTTON, "rounded-e-(--radius-control)")}
      >
        <AddIcon aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
