/**
 * Button — the one action primitive.
 *
 * CONTEXTS: every surface. One `default` per screen (official spec §9.7);
 * everything else is `secondary` or `ghost`.
 *
 * TOKEN BINDINGS
 *   default     → --primary / --primary-foreground (ink on paper, inverted in dark)
 *   secondary   → --hairline border, --ink text
 *   ghost       → --ink text, neutral-100 hover
 *   destructive → --destructive fill (Delete account only)
 *   focus ring  → :focus-visible in globals.css, 2px --ring at 2px offset
 *
 * GOTCHAS
 * - `size="icon"` requires an `aria-label`. Icons never appear without a text
 *   label except the checkbox and the timer glyph (§9.9).
 * - `busy` shows a spinner and disables the button, and the label does NOT
 *   change. The copy rule is that a button's label matches the toast it
 *   produces ("Finish review" → "Review finished"); swapping it to "Saving…"
 *   mid-press breaks that pairing and moves the text under the reader's eye.
 */
import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "../../../lib/cn";
import { Spinner } from "../../feedback/spinner";
import { buttonVariants } from "./button.variants";

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Renders a spinner before the label and disables the button. */
    busy?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "md",
  asChild = false,
  busy = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-busy={busy || undefined}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {busy && !asChild ? <Spinner /> : null}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
