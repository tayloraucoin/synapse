/**
 * FiringToggle — the row's leading control: fire, or mark back (Workflow UX
 * v0.1 §3.3, §9; W5, W6).
 *
 * A TOGGLE BUTTON, NOT A CHECKBOX. Nothing is completed by it, so it is a
 * `button` with `aria-pressed`, labelled by the caller (*Fire {title}* /
 * *Mark {title} back*). It sits where the List keeps its checkbox, on a 44px
 * target.
 *
 * INTENTS OUT. Pressing calls `onPressedChange` with the opposite of `pressed`
 * and changes nothing itself — the board owns the optimistic state and sends
 * a *set*, never a toggle (TD-36).
 *
 * Off: a 10px ring, 1.5px `border-edge`. On: the `FiringMark`, breathing. It is
 * one element, so the ring filling to the mark runs `--dur-state` (120ms).
 * Focus-visible is the product's ring on the control (the global
 * `:focus-visible` rule).
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { FiringMark } from "../../display/firing-mark";

export interface FiringToggleProps {
  pressed: boolean;
  onPressedChange: (next: boolean) => void;
  /** *Fire {title}* when off, *Mark {title} back* when on — the caller's words. */
  label: string;
  disabled?: boolean;
  className?: string;
}

export function FiringToggle({
  pressed,
  onPressedChange,
  label,
  disabled = false,
  className,
}: FiringToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      disabled={disabled}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "group/toggle inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius)",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      <FiringMark
        breathing={pressed}
        className={cn(
          "border-[1.5px] transition-colors duration-(--dur-state) ease-(--ease-settle)",
          pressed
            ? "border-transparent"
            : "border-edge group-hover/toggle:border-text-secondary bg-transparent",
        )}
      />
    </button>
  );
}
