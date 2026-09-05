/**
 * Switch — the boolean setting toggle (Epic 1 ST-07 notifications, ST-08).
 *
 * A native `role="switch"` button, not Radix: the behaviour is one boolean and
 * one click target, and a dependency for that is a dependency to keep current
 * for nothing.
 *
 * TOKEN BINDINGS
 *   Track off → --input (neutral-300 / neutral-600)
 *   Track on  → --primary (ink, never the accent — §9.3: the accent marks time)
 *   Thumb     → --paper
 *   Focus ring → :focus-visible in globals.css
 *
 * API: controlled only — `checked` + `onCheckedChange(boolean)`. Give it a
 * label through `id`/`htmlFor` or `aria-label`; a switch with neither is a
 * defect.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(
    { checked, onCheckedChange, className, disabled, ...props },
    ref,
  ) {
    return (
      <button
        type="button"
        role="switch"
        data-slot="switch"
        aria-checked={checked}
        disabled={disabled}
        ref={ref}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-(--radius-full)",
          "transition-colors duration-(--dur-state) ease-(--ease-settle)",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-input",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none block size-5 rounded-(--radius-full) bg-paper",
            "transition-transform duration-(--dur-state) ease-(--ease-settle)",
            checked ? "translate-x-[22px]" : "translate-x-[2px]",
          )}
        />
      </button>
    );
  },
);
