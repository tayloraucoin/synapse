"use client";

import * as React from "react";
import { Breadcrumb, cn, DoneIcon, Spinner, Text } from "@syn/ui";
import type { SaveStatus } from "@/lib/data/use-planner-writes";
import { DAYS_COPY as COPY } from "./copy";

/**
 * Set my days' header (layout.md 1): the crumb over the title, SaveStatus at
 * the trailing edge. The title takes focus on open, announced as the level-1
 * heading (words-and-access.md).
 */
export interface DaysHeaderProps {
  crumb: { label: string; href: string; ariaLabel: string };
  title: string;
  save: React.ReactNode;
  /** Changes when the view does, so focus moves to the new title. */
  focusKey: string;
}

export function DaysHeader({ crumb, title, save, focusKey }: DaysHeaderProps) {
  const ref = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [focusKey]);
  return (
    <header className="flex flex-col gap-(--space-1) px-(--space-4) pt-(--space-4)">
      <div className="flex min-h-6 items-center justify-between gap-(--space-2)">
        <Breadcrumb
          label={crumb.label}
          href={crumb.href}
          ariaLabel={crumb.ariaLabel}
        />
        {save}
      </div>
      <h1 ref={ref} tabIndex={-1} className="outline-none">
        <Text as="span" variant="heading">
          {title}
        </Text>
      </h1>
    </header>
  );
}

/**
 * The header's SaveStatus (saved.md): "Saving" with a spinner while an edit
 * is sent, "Saved" with a check for 2 s then nothing, and "Not saved · Try
 * again" in ink when it fails, the edit kept on screen. Never red; no Save
 * button. `hold` keeps Saved for a capture.
 */
export function DaysSaveStatus({
  status,
  onRetry,
  hold = false,
}: {
  status: SaveStatus;
  onRetry: () => void;
  hold?: boolean;
}) {
  const [savedShown, setSavedShown] = React.useState(false);
  React.useEffect(() => {
    if (status !== "saved") return;
    setSavedShown(true);
    if (hold) return;
    const timer = window.setTimeout(() => setSavedShown(false), 2000);
    return () => window.clearTimeout(timer);
  }, [status, hold]);

  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-(--space-1)"
    >
      {status === "saving" ? (
        <>
          <Spinner
            aria-hidden="true"
            className="size-3.5 text-muted-foreground"
          />
          <Text as="span" variant="secondary" tone="muted">
            {COPY.saving}
          </Text>
        </>
      ) : status === "saved" && savedShown ? (
        <>
          <DoneIcon
            aria-hidden="true"
            className="size-3.5 text-muted-foreground"
          />
          <Text as="span" variant="secondary" tone="muted">
            {COPY.saved}
          </Text>
        </>
      ) : status === "failed" ? (
        <>
          <Text as="span" variant="secondary" tone="ink">
            {COPY.notSaved}
          </Text>
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              "-my-(--space-2) min-h-(--target) cursor-pointer rounded-(--radius-control) px-(--space-1)",
              "text-(length:--fs-secondary) font-medium text-foreground underline underline-offset-2",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
          >
            {COPY.tryAgain}
          </button>
        </>
      ) : null}
    </span>
  );
}
