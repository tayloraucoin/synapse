/**
 * Textarea — multi-line text, with its label, helper, and error folded in.
 *
 * Same contract as `Input`, same reasons. `autoGrow` is for the surfaces where
 * a person is writing a sentence they have not planned — a reflection note, a
 * free-entry reason — and the box should not make them scroll inside a box.
 *
 * TOKEN BINDINGS: as `Input`. Error is a 1px ink border and an ink helper
 * line; never red (official spec §9.3).
 *
 * Prose, not data: the content is a sentence, so tabular figures are off here
 * (`tabular-off`) even though the app turns them on globally.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { HelperText } from "../../display/helper-text";
import { Label } from "../../display/label";
import { inputSkin } from "../input/input.variants";

export interface TextareaClasses {
  root?: string;
  label?: string;
  textarea?: string;
  helper?: string;
}

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  /** Grows with its content instead of scrolling inside itself. */
  autoGrow?: boolean;
  /** Default false — a drag handle is a decision the surface rarely wants. */
  resizable?: boolean;
  classes?: TextareaClasses;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      className,
      label,
      helperText,
      error,
      autoGrow = false,
      resizable = false,
      classes,
      id,
      rows = 3,
      onChange,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const helperId = `${textareaId}-helper`;
    const helper = error ?? helperText;
    const hasError = Boolean(error);

    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

    const resize = React.useCallback(() => {
      const node = innerRef.current;
      if (!autoGrow || !node) return;
      node.style.height = "auto";
      node.style.height = `${node.scrollHeight}px`;
    }, [autoGrow]);

    React.useEffect(resize, [resize, props.value, props.defaultValue]);

    const describedBy =
      [ariaDescribedBy, helper ? helperId : undefined]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className={cn("flex w-full flex-col", classes?.root)}>
        {label ? (
          <Label
            htmlFor={textareaId}
            className={cn("mb-(--space-2)", classes?.label)}
          >
            {label}
          </Label>
        ) : null}

        <textarea
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          id={textareaId}
          rows={rows}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            resize();
            onChange?.(event);
          }}
          {...props}
          className={cn(
            "tabular-off py-(--space-2)",
            ...inputSkin,
            "outline-none",
            "disabled:cursor-not-allowed disabled:text-text-disabled",
            hasError && "border-ink hover:border-ink",
            resizable ? "resize-y" : "resize-none",
            autoGrow && "overflow-hidden",
            classes?.textarea,
            className,
          )}
        />

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
  },
);

export { Textarea };
