/**
 * Input — the text field, with its label, helper, and error folded in.
 *
 * The label and the message belong to the control, which is why there is no
 * separate `field` primitive: a field assembled at three call sites is a field
 * whose `aria-describedby` is wrong at one of them.
 *
 * TOKEN BINDINGS
 *   text        → --ink            border → --input
 *   surface     → --paper          placeholder → --text-muted
 *   error       → 1px --ink border and an ink helper line. Never red (§9.3).
 *   focus ring  → :focus-visible in globals.css, 2px --ring at 2px offset
 *
 * MODES set the type, keyboard, and autofill hints together, so a caller
 * cannot get an email field with a text keyboard. `password` adds a Show/Hide
 * text button at a 44px target with `aria-pressed` — a word, not an eye icon
 * (§9.9: no icon stands alone).
 *
 * A11y: the helper is `aria-describedby`-linked; an error sets `aria-invalid`
 * and gives the helper `role="alert"`.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { HelperText } from "../../display/helper-text";
import { Label } from "../../display/label";
import { inputVariants } from "./input.variants";

export type InputMode =
  | "text"
  | "email"
  | "password"
  | "number"
  | "time"
  | "date"
  /** UX v1.3 §4.4 B8 (DAY-10): the `LinkSheet`'s *Link* — `type="url"`, no autocorrect. */
  | "url";

export interface InputClasses {
  root?: string;
  label?: string;
  input?: string;
  suffix?: string;
  helper?: string;
}

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  mode?: InputMode;
  classes?: InputClasses;
}

function getModeDefaults(
  mode: InputMode,
): Pick<
  React.ComponentProps<"input">,
  | "type"
  | "inputMode"
  | "pattern"
  | "autoComplete"
  | "autoCapitalize"
  | "autoCorrect"
  | "spellCheck"
> {
  switch (mode) {
    case "email":
      return {
        type: "email",
        inputMode: "email",
        autoComplete: "email",
        autoCapitalize: "none",
        autoCorrect: "off",
        spellCheck: false,
      };
    case "url":
      return {
        type: "url",
        inputMode: "url",
        autoComplete: "url",
        autoCapitalize: "none",
        autoCorrect: "off",
        spellCheck: false,
      };
    case "password":
      return { type: "password", autoComplete: "current-password" };
    case "number":
      return { type: "text", inputMode: "numeric", pattern: "[0-9]*" };
    case "time":
      return { type: "time" };
    case "date":
      return { type: "date" };
    default:
      return { type: "text" };
  }
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    label,
    helperText,
    error,
    mode = "text",
    classes,
    id,
    disabled,
    readOnly,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const helper = error ?? helperText;
  const hasError = Boolean(error);

  const [showPassword, setShowPassword] = React.useState(false);
  const isPasswordMode = mode === "password";

  const modeDefaults = getModeDefaults(mode);
  const resolvedType =
    isPasswordMode && showPassword ? "text" : modeDefaults.type;

  const describedBy =
    [ariaDescribedBy, helper ? helperId : undefined].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("flex w-full flex-col", classes?.root)}>
      {label ? (
        <Label
          htmlFor={inputId}
          className={cn("mb-(--space-2)", classes?.label)}
        >
          {label}
        </Label>
      ) : null}

      <div className="relative w-full">
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={describedBy}
          {...modeDefaults}
          {...props}
          type={resolvedType}
          className={cn(
            inputVariants({ error: hasError, hasSuffix: isPasswordMode }),
            classes?.input,
            className,
          )}
        />
        {isPasswordMode ? (
          <button
            type="button"
            className={cn(
              "absolute top-1/2 right-1 flex size-(--target) -translate-y-1/2",
              "items-center justify-center rounded-(--radius)",
              "font-sans text-(length:--fs-secondary) font-medium text-text-secondary",
              "transition-colors duration-(--dur-state) ease-(--ease-settle)",
              "hover:text-ink",
              "disabled:pointer-events-none disabled:opacity-40",
              classes?.suffix,
            )}
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            disabled={disabled}
            tabIndex={readOnly ? -1 : 0}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        ) : null}
      </div>

      {helper ? (
        <HelperText
          id={helperId}
          error={hasError}
          classes={{ root: cn("mt-(--space-2)", classes?.helper) }}
        >
          {helper}
        </HelperText>
      ) : null}
    </div>
  );
});

export { Input, inputVariants };
