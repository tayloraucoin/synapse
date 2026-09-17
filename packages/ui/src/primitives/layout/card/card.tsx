/**
 * Card — the setup card's base (UX v1.2 §4, R43; RUN-7).
 *
 * The shadcn card, re-slotted and restyled to the house: `bg-surface`, a
 * hairline, 16px padding, `rounded-md` from the preset — and nothing that
 * lifts it off the page. A drop beneath a card is a colour the palette does
 * not have (v1.1 §10.3), and a card that floats reads as a modal on a screen
 * that is a list of answers.
 *
 * WHO USES IT: the first run's setup cards (`HabitSetupCard`,
 * `WorkoutSetupCard`, `FocusSetupCard`, `WorkDayTypeCard`) and `DayPlanCard`,
 * all feature-folder compositions. Nothing else in the app gains a card by
 * this primitive existing; the List stays rows with hairlines between them.
 *
 * "CARDS COLLAPSE" is the feature folder's: a collapsed card is this `Card`
 * with one line and an *Edit* text button, and the fold is theirs to keep.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-surface text-ink border-hairline flex flex-col gap-(--space-4) rounded-md border p-(--space-4)",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex items-center gap-(--space-3)", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("min-w-0 flex-1 text-(length:--fs-row-title) leading-(--lh-row-title) font-medium", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-text-secondary text-(length:--fs-secondary) leading-(--lh-secondary)", className)}
      {...props}
    />
  );
}

/** The header's trailing slot — an *Edit* text button, a chevron, nothing else. */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("ms-auto flex shrink-0 items-center", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex flex-col gap-(--space-4)", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-(--space-3)", className)}
      {...props}
    />
  );
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
