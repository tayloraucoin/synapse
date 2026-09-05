/**
 * Stepper17 — every 1–7 rating and priority (v2 handoff §5.4).
 *
 * Built new. CC's `ScaleField` is a slider and official spec §9.7 forbids
 * sliders: a slider makes a person aim, and aiming at a seven-point scale on a
 * phone produces a number they did not mean.
 *
 * NATIVE RADIOS, NOT A ROVING TABINDEX. Seven visually-hidden radios inside
 * seven labels give the browser's own radiogroup: arrow keys move and select,
 * Tab enters and leaves the group as one stop, and the state is announced
 * without an aria-* attribute in sight. The only thing added on top is the
 * number-key shortcut (cross-cutting §3.3), which is eight lines instead of
 * the eighty a hand-rolled radiogroup costs.
 *
 * WRAPS 4+3 UNDER 360px: seven 44px cells plus gaps need 332px, which a
 * 320px viewport does not have. `flex-wrap` plus a fixed cell size does this
 * without a media query.
 *
 * `resting` is the value the person's setup already implies; `onReset`
 * appears once the choice differs from it, so returning to the default is one
 * tap and not a memory test.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { HelperText } from "../../../primitives/display/helper-text";
import { Text } from "../../../primitives/typography/text";
import { stepper17CellVariants } from "./stepper-17.variants";

export type Stepper17Value = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const VALUES: readonly Stepper17Value[] = [1, 2, 3, 4, 5, 6, 7];

export interface Stepper17Classes {
  root?: string;
  label?: string;
  group?: string;
  cell?: string;
  captions?: string;
  helper?: string;
}

export interface Stepper17Props {
  value: Stepper17Value | null;
  onChange: (value: Stepper17Value) => void;
  label: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  /** The life default, shown as a dashed ring while `value` is null. */
  resting?: Stepper17Value | null;
  /** Renders the small reset ghost when `value` differs from `resting`. */
  onReset?: () => void;
  /** "less" · "more" end captions. */
  captions?: boolean;
  required?: boolean;
  disabled?: boolean;
  classes?: Stepper17Classes;
  className?: string;
}

export function Stepper17({
  value,
  onChange,
  label,
  helperText,
  error,
  resting = null,
  onReset,
  captions = true,
  required = false,
  disabled = false,
  classes,
  className,
}: Stepper17Props) {
  const groupName = React.useId();
  const labelId = React.useId();
  const helperId = React.useId();

  const message = error ?? helperText;
  const invalid = error !== undefined && error !== null;

  /** Number keys 1–7 select directly (cross-cutting §3.3). */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const digit = Number.parseInt(event.key, 10);
    if (Number.isNaN(digit) || digit < 1 || digit > 7) return;
    event.preventDefault();
    onChange(digit as Stepper17Value);
  };

  const showReset =
    onReset !== undefined && resting !== null && value !== null && value !== resting;

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className, classes?.root)}>
      <div className="flex items-baseline gap-(--space-3)">
        <Text
          as="span"
          id={labelId}
          variant="secondary"
          weight={500}
          className={classes?.label}
        >
          {label}
        </Text>
        {showReset ? (
          <button
            type="button"
            onClick={onReset}
            className="text-text-secondary hover:text-ink text-(length:--fs-caption) underline-offset-4 hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={message === undefined ? undefined : helperId}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        onKeyDown={onKeyDown}
        className={cn(
          "flex flex-wrap gap-(--space-1)",
          invalid && "rounded-(--radius) outline outline-ink",
          classes?.group,
        )}
      >
        {VALUES.map((option) => {
          const selected = value === option;
          const isResting = value === null && resting === option;

          return (
            <label
              key={option}
              className={cn(
                stepper17CellVariants({
                  state: selected
                    ? "selected"
                    : isResting
                      ? "resting"
                      : "unselected",
                  disabled,
                }),
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                classes?.cell,
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={option}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              <span aria-hidden="true">{option}</span>
            </label>
          );
        })}
      </div>

      {captions ? (
        <div
          aria-hidden="true"
          className={cn(
            "text-text-secondary flex justify-between text-(length:--fs-caption)",
            "max-w-[332px]",
            classes?.captions,
          )}
        >
          <span>less</span>
          <span>more</span>
        </div>
      ) : null}

      {message === undefined ? null : (
        <HelperText
          id={helperId}
          error={invalid}
          className={classes?.helper}
        >
          {message}
        </HelperText>
      )}
    </div>
  );
}
