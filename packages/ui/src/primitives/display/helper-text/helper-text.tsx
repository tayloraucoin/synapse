/**
 * HelperText — the helper / error line under a control.
 *
 * NEVER RED. Synapse's error state is a sentence, not a colour: the field
 * takes a 1px ink border and the line beneath is ink at caption size. The
 * destructive token exists for one button and does not reach a form (official
 * spec §9.3). A red field would also be the one place colour carried a
 * distinction on its own, which §9.3 forbids outright.
 *
 * TOKEN BINDINGS
 *   default → --text-secondary
 *   error   → --ink, plus role="alert" so the message is announced
 *
 * Pair with `aria-describedby` on the associated field. `Input` and `Textarea`
 * wire that for you.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";

export interface HelperTextClasses {
  root?: string;
}

export interface HelperTextProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Announces the line and switches it to ink — never to red. */
  error?: boolean;
  classes?: HelperTextClasses;
}

const HelperText = React.forwardRef<HTMLParagraphElement, HelperTextProps>(
  function HelperText({ className, classes, error, children, ...props }, ref) {
    return (
      <p
        ref={ref}
        role={error ? "alert" : undefined}
        className={cn(
          "m-0 font-sans text-(length:--fs-caption) leading-(--lh-caption)",
          error ? "text-ink" : "text-text-secondary",
          classes?.root,
          className,
        )}
        {...props}
      >
        {children}
      </p>
    );
  },
);

export { HelperText };
