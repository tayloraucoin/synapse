"use client";

import * as React from "react";
import { Button, cn, StepAwayIcon, Text } from "@syn/ui";

/**
 * StepAwayBar — the quiet bar while Step away holds work time (USE-60;
 * stepped-away.md, D-USE-46, D-USE-52): surface grey, the pause glyph,
 * "Stepped away at 10:42", "Work time held · firing keeps counting" and
 * Resume all in ink. On the phone the held line sits under the time, Resume
 * all on the right; at the desk one row, the held line beside Resume all.
 *
 * Props only: the time is the paused events' shared `at` from the derived
 * clock, read by the caller. `focusOnMount` moves focus to Resume all when
 * the bar comes from a press (step-away.md, Access).
 */
export interface StepAwayBarProps {
  /** "Stepped away at 10:42". */
  title: string;
  /** "Work time held · firing keeps counting". */
  held: string;
  resumeAll: string;
  onResumeAll?: () => void;
  focusOnMount?: boolean;
  className?: string;
}

export function StepAwayBar({
  title,
  held,
  resumeAll,
  onResumeAll,
  focusOnMount = false,
  className,
}: StepAwayBarProps) {
  const button = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (focusOnMount) button.current?.focus();
  }, [focusOnMount]);
  return (
    <section
      aria-label={title}
      data-step-away-bar
      className={cn(
        "bg-surface flex items-center gap-(--space-3) rounded-(--radius-sheet) px-(--space-4) py-(--space-3)",
        className,
      )}
    >
      <StepAwayIcon aria-hidden="true" className="text-ink size-4 shrink-0" />
      <div className="split:flex-row split:items-center split:justify-between split:gap-(--space-4) flex min-w-0 flex-1 flex-col">
        <Text as="p" variant="body" weight={500} className="tabular-nums">
          {title}
        </Text>
        <Text as="p" variant="caption" tone="muted">
          {held}
        </Text>
      </div>
      <Button ref={button} onClick={onResumeAll} className="shrink-0">
        {resumeAll}
      </Button>
    </section>
  );
}
